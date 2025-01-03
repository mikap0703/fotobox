<script lang="ts">
	import QRCode from 'qrcode';
	import { goto } from '$app/navigation';

	export let data: { uuid: string; base64: string };

	let qrCodeDataUrl: string = '';

	// Generate the QR code as a Data URL
	QRCode.toDataURL(`https://fotobox.mpe-home.ipv64.net/capture/${data.uuid}`)
		.then((url: string) => {
			qrCodeDataUrl = url;
		})
		.catch((err: Error) => {
			console.error('Error generating QR Code:', err);
		});

	// Navigate to print route
	function navigateToPrint(): void {
		goto('/print');
	}
</script>

<div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 space-y-6">
	<!-- Landscape Image Section -->
	<div class="flex flex-col items-center space-y-4">
		<img
			src={data.base64}
			alt="capture"
			class="w-full max-w-4xl object-cover border rounded-lg shadow-md"
		/>

		<!-- QR Code Section -->
		<div class="bg-white p-4 rounded-lg shadow-md flex items-center justify-center">
			{#if qrCodeDataUrl}
				<img src={qrCodeDataUrl} alt="QR Code for UUID" class="w-32 h-32" />
			{:else}
				<p>Generating QR Code...</p>
			{/if}
		</div>
	</div>

	<!-- Button Section -->
	<div class="flex space-x-4">
		<button
			class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow"
			on:click={navigateToPrint}
		>
			Drucken
		</button>
	</div>
</div>
