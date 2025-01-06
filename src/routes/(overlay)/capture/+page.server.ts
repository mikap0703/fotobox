import type { Actions } from '../../../../.svelte-kit/types/src/routes';
import { redirect } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const execAsync = promisify(exec);

const captureSchema = z.object({});

export const load = async () => {
	const form = await superValidate(zod(captureSchema));

	return { form };
}

export const actions = {
	default: async () => {
		const uuid = uuidv4();
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
		// Check if the temp directory exists, create it if not
		const tempPath = './temp';
		if (!fs.existsSync(tempPath)) {
			fs.mkdirSync(tempPath);
		}
		// move the photo to the public folder
		await execAsync(`mv ${uuid}.jpg temp/${uuid}.jpg`);
		throw redirect(303, '/capture/' + uuid);
	}
} satisfies Actions;
