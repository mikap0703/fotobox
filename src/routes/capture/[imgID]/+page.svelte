<script lang="ts">
	import QRCode from 'qrcode';
	import { CameraPhotoOutline, PrinterOutline } from 'flowbite-svelte-icons';
	import { superForm } from 'sveltekit-superforms';
	import toast from 'svelte-french-toast';

	export let data;

	let { uuid, base64 } =  data//$props();

	let qrCodeDataUrl = '';
	let selectedCopies: number = 1; // Default selected number of copies
	let maxCopies = 5;

	const { enhance } = superForm(data.form, {
		delayMs: 500,
		timeoutMs: 8000,
		onSubmit: async ({formData}) => {
			formData.append('numCopies', selectedCopies.toString());
		},
		onResult: async ({result}) => {
			if (result.data.success) {
				if (selectedCopies > 1) {
					toast.success("Die Bilder werden gedruckt...", {
						duration: 5000,
					})
				} else {
					toast.success("Das Bild wird gedruckt...", {
						duration: 5000,
					})
				}
			}
			else {
				toast.error("Beim Drucken ist ein Fehler aufgetreten...", {
					duration: 5000,
				})
			}
		}
	})

	// Generate the QR code as a Data URL
	QRCode.toDataURL(`https://fotobox.mpe-home.ipv64.net/capture/${uuid}`)
		.then((url: string) => {
			qrCodeDataUrl = url;
		})
		.catch((err: Error) => {
			console.error('Error generating QR Code:', err);
		});
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
	<div class="bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-2xl shadow-md text-gray-50 lg:basis-1/3 h-full flex flex-col p-6 space-y-16">
		<!-- QR Code Section -->
		<div class="w-5/6 mx-auto flex-1 flex flex-col items-center justify-center text-center">
			{#if qrCodeDataUrl}
				<h1 class="font-bold text-3xl mb-4">QR Code</h1>
				<img src={qrCodeDataUrl} alt="QR Code for UUID" class="w-1/2 h-auto mx-auto rounded-lg shadow-lg" />
				<div class="text-left mt-6 font-bold">
					<h2 class="text-lg underline mb-2">Anleitung:</h2>
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

		<div class="bg-white w-64 h-2 mx-auto rounded-lg"></div>

		<!-- Checkbox-like Buttons Section -->
		<div class="w-5/6 mx-auto">
			<!-- Print stuff -->
			<div>
				<h1 class="font-bold text-2xl mb-3">Anzahl der Kopien:</h1>
				<div class="grid grid-cols-5 justify-items-stretch gap-3 w-full">
					{#each Array.from({ length: maxCopies }, (_, i) => i + 1) as num}
						<button
							on:click={() => {selectedCopies = num}}
							class="font-bold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center w-full h-16 text-xl"
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
				<div class="flex justify-center mt-6">
					<form method="POST" action="?/print" use:enhance>
						<button
							class="bg-gray-50 text-blue-600 font-bold py-3 px-4 rounded-lg shadow-md hover:bg-gray-100 transition flex items-center"
							type="submit"
						>
							<PrinterOutline class="w-8 h-8 mr-2" /> Drucken
						</button>
					</form>
				</div>
			</div>

			<!-- Back Button -->
			<div class="flex float-right mt-20">
				<a
					class="bg-gray-50 text-blue-600 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition flex items-center"
					href="/capture"
				>
					<CameraPhotoOutline class="w-8 h-8 mr-2" />
					Nächstes Bild
				</a>
			</div>
		</div>
	</div>
</div>
