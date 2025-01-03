import fs from 'node:fs';
import path from 'node:path';

export const load = ({ params }) => {
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
		};
	} catch (error) {
		console.error((error as Error).message);
		throw new Error('Failed to load the image.');
	}
};
