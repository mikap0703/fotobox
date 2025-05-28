import { type Actions, redirect } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import sharp from 'sharp';

const overlayPath = 'files/overlay-marius.png';
const doOverlay = false;

const execAsync = promisify(exec);

const captureSchema = z.object({
	image: z.string().nullable(),
});

export const load = async () => {
	const form = await superValidate(zod(captureSchema));

	let overlay = null;
	if (doOverlay) {
		const overlayBuffer = await sharp(overlayPath).toBuffer();
		overlay = `data:image/png;base64,${overlayBuffer.toString('base64')}`;
	}

	return { form, overlay };
}

export const actions = {
	default: async ({request}) => {
		// Validate the form data
		const form = await superValidate(request, zod(captureSchema));
		if (!form.valid) {
			// Handle form validation errors
			return { form };
		}

		// Check if the temp directory exists, create it if not
		const tempPath = './temp';
		if (!fs.existsSync(tempPath)) {
			fs.mkdirSync(tempPath);
		}

		const uuid = uuidv4();

		if (form.data.image) {
			// save base64 image to file
			// Extract Base64 content only (remove the metadata prefix)
			const base64Image = form.data.image.split(',')[1];

			// Convert to a Buffer
			const imageBuffer = Buffer.from(base64Image, 'base64');

			// Load the image and crop it to 3:2 aspect ratio
			const image = sharp(imageBuffer);
			const metadata = await image.metadata();

			console.log(metadata);

			let { width, height } = metadata;
			const targetAspect = 3 / 2;

			let newWidth = width;
			let newHeight = Math.round(width / targetAspect);

			// If height is too small for 3:2, adjust width instead
			if (newHeight > height) {
				newHeight = height;
				newWidth = Math.round(height * targetAspect);
			}

			// Center crop coordinates
			const left = Math.floor((width - newWidth) / 2);
			const top = Math.floor((height - newHeight) / 2);

			if (doOverlay) {
				const overlay = await sharp(overlayPath)
					.resize(newWidth, newHeight, { fit: 'inside' }) // Ensure it fits within
					.toBuffer();

				await image
					.extract({ left, top, width: newWidth, height: newHeight })
					.composite([{ input: overlay, gravity: 'southeast' }])
					.toFile(`temp/${uuid}.jpg`);
			} else {
				await image
					.extract({ left, top, width: newWidth, height: newHeight })
					.toFile(`temp/${uuid}.jpg`);
			}
		} else {
			try {
				// Command to take a picture with gphoto2 and save it to /temp
				await execAsync(`gphoto2 --capture-image-and-download --filename ${uuid}.jpg`);

				// Optionally, handle the photo (e.g., verify it exists, process it, etc.)

				// Redirect to a success page or back to the app
			} catch (error) {
				console.error('Failed to take a picture:', error);
				// Redirect to an error page or inform the user
				// await new Promise(resolve => setTimeout(resolve, 1000))
				throw redirect(303, '/capture/a');
			}
			// move the photo to the public folder
			await execAsync(`mv ${uuid}.jpg temp/${uuid}.jpg`);
		}

		throw redirect(303, '/capture/' + uuid);
	}
} satisfies Actions;
