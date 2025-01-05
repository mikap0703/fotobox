import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const printSchema = z.object({
	numCopies: z.number()
})

const printer = "PDFwriter";

export const load = async ({ params }) => {
	const form = await superValidate(zod(printSchema))
	const { imgID } = params;
	const tempDir = './temp'; // Adjust the path if needed

	try {
		// Read all files from the temporary directory
		const files = fs.readdirSync(tempDir);

		// Find the file with the matching UUID (ignoring the file extension)
		const matchingFile = files.find((file) => path.parse(file).name === imgID);

		if (!matchingFile) {
			throw new Error(`Image with ID ${imgID} not found in /temp.`);
		}

		const uuid = imgID;
		const filePath = path.join(tempDir, matchingFile);
		const fileContents = fs.readFileSync(filePath);

		// Dynamically determine MIME type based on file extension
		const ext = path.extname(matchingFile).toLowerCase().substring(1); // Remove the dot
		const mimeType = `image/${ext}`;

		// Convert the file contents to Base64 format
		const base64 = `data:${mimeType};base64,${Buffer.from(fileContents).toString('base64')}`;

		// Return the required data
		return {
			uuid,
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