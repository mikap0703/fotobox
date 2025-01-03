<script lang="ts">
	import QRCode from 'qrcode';
	import { goto } from '$app/navigation';

	let maxCopies = 5;


	export let data;

	let { uuid, base64 } =  data//$props();

	let qrCodeDataUrl = '';
	let selectedCopies: number = 1; // Default selected number of copies

	// Generate the QR code as a Data URL
	QRCode.toDataURL(`https://fotobox.mpe-home.ipv64.net/capture/${uuid}`)
		.then((url: string) => {
			qrCodeDataUrl = url;
		})
		.catch((err: Error) => {
			console.error('Error generating QR Code:', err);
		});

	// Navigate to print route
	function navigateToPrint(): void {
		goto(`/print?copies=${selectedCopies}`);
	}
</script>

<div class="h-screen w-screen bg-gray-50 flex flex-col lg:flex-row">
	<!-- Image Section -->
	<div class="h-full lg:basis-2/3 flex flex-col items-center justify-center p-6">
		<img
			src={base64}
			alt="capture"
			class="w-5/6 h-auto object-cover border rounded-lg shadow-md"
		/>
	</div>

	<!-- QR Code and Actions Section -->
	<div class="bg-gradient-to-b from-blue-500 to-blue-600 text-gray-50 lg:basis-1/3 h-full flex flex-col p-6 space-y-6">
		<!-- QR Code Section -->
		<div class="flex-1 flex flex-col items-center justify-center text-center">
			{#if qrCodeDataUrl}
				<h1 class="font-bold text-3xl mb-4">QR Code</h1>
				<img src={qrCodeDataUrl} alt="QR Code for UUID" class="w-64 h-64 mx-auto rounded-lg shadow-lg" />
				<div class="text-left mt-6">
					<h2 class="text-lg font-semibold mb-2">Anleitung</h2>
					<ul class="space-y-1 text-base">
						<li>1. Mit dem WLAN der Fotobox verbinden</li>
						<li>2. QR Code scannen</li>
						<li>3. Bild herunterladen</li>
					</ul>
				</div>
			{:else}
				<p class="text-lg">QR Code wird generiert...</p>
			{/if}
		</div>

		<!-- Checkbox-like Buttons Section -->
		<h1 class="font-bold text-2xl">Anzahl der Kopien</h1>
		<div class="flex flex-wrap justify-center gap-3">
			{#each Array.from({ length: maxCopies }, (_, i) => i + 1) as num}
				<button
					on:click={() => {selectedCopies = num}}
					class="font-bold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center w-20 h-16 text-xl"
					class:bg-gray-50={selectedCopies !== num}
					class:text-blue-600={selectedCopies !== num}
					class:bg-green-600={selectedCopies === num}
					class:text-gray-50={selectedCopies === num}
				>
					{num}
				</button>
			{/each}
		</div>



		<!-- Print Button -->
		<div class="flex justify-center">
			<button
				class="bg-gray-50 text-blue-600 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition"
				on:click={navigateToPrint}
			>
				Drucken
			</button>
		</div>
	</div>
</div>
