import { secureImageFS } from '$lib/secure-image-fs.js';

export const load = async ({ params }) => {
	const { imgID } = params;

	try {
		const { base64 } = await secureImageFS.getImageByUUID(imgID);
		return {
			uuid: imgID,
			base64,
		};
	} catch (error) {
		console.error('Failed to load image:', error);
		throw new Error('Failed to load the image.');
	}
};