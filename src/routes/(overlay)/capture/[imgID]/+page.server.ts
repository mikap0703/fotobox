import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { secureImageFS } from '$lib/secure-image-fs.js';
import { printerService } from '$lib/printer-service.js';
import { loadConfig } from '$lib/config.js';

const config = loadConfig();

const printSchema = z.object({
	numCopies: z.number().min(1).max(config.printing.maxCopies)
});

export const load = async ({ params }) => {
	const form = await superValidate(zod(printSchema));
	const { imgID } = params;

	try {
		const { base64 } = await secureImageFS.getImageByUUID(imgID);

		// Get printer status for UI
		const printerStatus = await printerService.getPrinterStatus();

		return {
			uuid: imgID,
			base64,
			form,
			printerStatus,
			printingEnabled: config.printing.enabled,
			maxCopies: config.printing.maxCopies
		};
	} catch (error) {
		console.error('Failed to load image:', error);
		throw new Error('Failed to load the image.');
	}
};

export const actions = {
	"print": async ({ request, params }) => {
		const form = await superValidate(request, zod(printSchema));

		if (!form.valid) {
			return {
				success: false,
				form,
				message: 'Invalid form data'
			};
		}

		const { imgID } = params;
		const { numCopies } = form.data;

		try {
			// Get the image file path
			const { filePath } = await secureImageFS.getImageByUUID(imgID);

			// Print using the printer service
			const printResult = await printerService.printImage(filePath, numCopies);

			return {
				success: printResult.success,
				form,
				message: printResult.message,
				jobId: printResult.jobId,
				error: printResult.error
			};
		} catch (error) {
			console.error('Failed to print image:', error);
			return {
				success: false,
				form,
				message: 'Fehler beim Drucken des Bildes'
			};
		}
	}
};