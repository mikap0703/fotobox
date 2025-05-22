import fs from 'fs';
import path from 'path';

const isUUIDv4 = (str: string) =>
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

/**
 * Retrieves the base64-encoded image and its MIME type from a directory based on UUID.
 *
 * @param uuid - UUID v4 string representing the image filename (without extension)
 * @param tempDir - Path to the directory where images are stored (e.g., './temp')
 * @returns An object containing { base64, mimeType, filePath }
 * @throws If the directory or file does not exist, or the UUID is invalid
 */
export function getImageBase64ByUUID(uuid: string, tempDir: string = './temp') {
	if (!isUUIDv4(uuid)) {
		throw new Error(`Invalid UUID v4: ${uuid}`);
	}

	if (!fs.existsSync(tempDir) || !fs.statSync(tempDir).isDirectory()) {
		throw new Error(`Temporary directory does not exist: ${tempDir}`);
	}

	const files = fs.readdirSync(tempDir);
	const matchingFile = files.find((file) => path.parse(file).name === uuid);

	if (!matchingFile) {
		throw new Error(`Image with ID ${uuid} not found in ${tempDir}.`);
	}

	const filePath = path.join(tempDir, matchingFile);
	const fileContents = fs.readFileSync(filePath);
	const ext = path.extname(matchingFile).toLowerCase().substring(1);
	const mimeType = `image/${ext}`;

	const base64 = `data:${mimeType};base64,${Buffer.from(fileContents).toString('base64')}`;

	return { base64, mimeType, filePath };
}
