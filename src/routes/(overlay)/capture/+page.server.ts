import { type Actions, redirect } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import sharp from 'sharp';
import { secureImageFS } from '$lib/secure-image-fs.js';
import { loadConfig } from '$lib/config.js';

const config = loadConfig();
const execAsync = promisify(exec);

const captureSchema = z.object({
	image: z.string().nullable(),
});

export const load = async () => {
	const form = await superValidate(zod(captureSchema));

	let overlay = null;
	if (config.storage.enableOverlay && config.storage.overlayPath) {
		try {
			const overlayBuffer = await sharp(config.storage.overlayPath).toBuffer();
			overlay = `data:image/png;base64,${overlayBuffer.toString('base64')}`;
		} catch (error) {
			console.warn('Failed to load overlay:', error);
		}
	}

	return {
		form,
		overlay,
		cameraConfig: {
			countdown: config.camera.countdown,
			useWebcam: config.camera.useWebcam,
			useStream: config.camera.useStream,
			streamURL: config.camera.streamURL
		}
	};
}

export const actions = {
	default: async ({request}) => {
		const form = await superValidate(request, zod(captureSchema));
		if (!form.valid) {
			return { form };
		}

		const uuid = uuidv4();

		try {
			if (form.data.image) {
				// Handle base64 image from webcam
				const base64Image = form.data.image.split(',')[1];
				const imageBuffer = Buffer.from(base64Image, 'base64');

				// Process image with Sharp
				const image = sharp(imageBuffer);
				const metadata = await image.metadata();

				if (!metadata.width || !metadata.height) {
					throw new Error('Invalid image metadata');
				}

				const { width, height } = metadata;
				const targetAspect = 3 / 2;

				let newWidth = width;
				let newHeight = Math.round(width / targetAspect);

				if (newHeight > height) {
					newHeight = height;
					newWidth = Math.round(height * targetAspect);
				}

				const left = Math.floor((width - newWidth) / 2);
				const top = Math.floor((height - newHeight) / 2);

				let processedBuffer;

				if (config.storage.enableOverlay && config.storage.overlayPath) {
					try {
						const overlay = await sharp(config.storage.overlayPath)
							.resize(newWidth, newHeight, { fit: 'inside' })
							.toBuffer();

						processedBuffer = await image
							.extract({ left, top, width: newWidth, height: newHeight })
							.composite([{ input: overlay, gravity: 'southeast' }])
							.jpeg({ quality: 90 })
							.toBuffer();
					} catch (overlayError) {
						console.warn('Overlay processing failed, saving without overlay:', overlayError);
						processedBuffer = await image
							.extract({ left, top, width: newWidth, height: newHeight })
							.jpeg({ quality: 90 })
							.toBuffer();
					}
				} else {
					processedBuffer = await image
						.extract({ left, top, width: newWidth, height: newHeight })
						.jpeg({ quality: 90 })
						.toBuffer();
				}

				// Save using secure filesystem
				await secureImageFS.saveImage(uuid, processedBuffer, '.jpg');

			} else {
				// Handle external camera capture
				try {
					await execAsync(`gphoto2 --capture-image-and-download --filename ${uuid}.jpg`);
					await execAsync(`mv ${uuid}.jpg ${config.storage.tempDirectory}/${uuid}.jpg`);
				} catch (error) {
					console.error('Failed to capture with external camera:', error);
					throw redirect(303, '/capture?error=camera_failed');
				}
			}
		} catch (error) {
			console.error('Failed to process image:', error);

			// Clean up any partially saved files
			try {
				await secureImageFS.deleteImage(uuid);
			} catch (cleanupError) {
				console.warn('Failed to clean up after error:', cleanupError);
			}

			throw redirect(303, '/capture?error=processing_failed');
		}

		return redirect(303, '/capture/' + uuid);
	}
} satisfies Actions;