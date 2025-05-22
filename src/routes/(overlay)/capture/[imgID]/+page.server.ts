import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { promisify } from 'util';
import { exec } from 'child_process';
import { getImageBase64ByUUID } from '$lib/imageFS';

const execAsync = promisify(exec);

const printSchema = z.object({
	numCopies: z.number()
})

const printer = "PDFwriter";

export const load = async ({ params }) => {
	const form = await superValidate(zod(printSchema));
	const { imgID } = params;

	try {
		const { base64 } = getImageBase64ByUUID(imgID);
		return {
			uuid: imgID,
			base64,
			form
		};
	} catch (error) {
		console.error((error as Error).message);
		throw new Error('Failed to load the image.');
	}
};

export const actions = {
	"print": async ({ request, params }) => {
		const form = await superValidate(request, zod(printSchema));

		if (!form.valid) return { success: false, form };

		const { imgID } = params;
		const { numCopies } = form.data;
		try {
			await execAsync(`lp -d ${printer} -n ${numCopies} ./temp/${imgID}.jpg`);
			return { success: true, form };
		} catch (error) {
			console.error('Failed to print the image:', error);
			return { success: false, form };
		}
	}
}