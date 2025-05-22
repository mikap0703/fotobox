import { getImageBase64ByUUID } from '$lib/imageFS';

export const load = async ({ params }) => {
	const { imgID } = params;

	try {
		const { base64 } = getImageBase64ByUUID(imgID);
		return {
			uuid: imgID,
			base64,
		};
	} catch (error) {
		console.error((error as Error).message);
		throw new Error('Failed to load the image.');
	}
};