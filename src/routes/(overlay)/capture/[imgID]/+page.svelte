<script lang="ts">
	import QRCode from 'qrcode';
	import { CameraPhotoOutline, PrinterOutline } from 'flowbite-svelte-icons';
	import { superForm } from 'sveltekit-superforms';
	import toast from 'svelte-french-toast';
	import Confetti from 'svelte-confetti';

	export let data;

	let { uuid, base64 } = data; // $props();

	// config
	const allowPrinting = true; // Flag to control printing
	const maxCopies = 1; // Maximum allowed copies
	const confetti = true;

	let qrCodeDataUrl = '';
	let selectedCopies: number = 1; // Default selected number of copies

	const { enhance } = superForm(data.form, {
		delayMs: 500,
		timeoutMs: 8000,
		onSubmit: async ({ formData }) => {
			formData.append('numCopies', selectedCopies.toString());
		},
		onResult: async ({ result }) => {
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

{#if confetti}
	<div class="fixed z-10 top-0 left-0 h-screen w-full pointer-events-none overflow-hidden flex justify-center">
		<Confetti x={[-5, 5]} y={[0, 0.1]} delay={[0, 2000]} duration={2000} amount={500} fallDistance="70vh" />
	</div>
{/if}

<div class="h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col lg:flex-row overflow-hidden">
	<!-- Image Section -->
	<div class="flex-1 lg:w-2/3 flex items-center justify-center p-4 lg:p-8 relative">
		<!-- Decorative elements -->
		<div class="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-40 animate-pulse"></div>
		<div class="absolute bottom-20 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-40 animate-pulse delay-1000"></div>

		<div class="relative w-full max-w-4xl">
			<!-- Photo container with improved shadow and animation -->
			<div class="relative transform group">
				<div class="absolute inset-0 rounded-2xl blur-lg bg-gradient-to-br from-blue-400 to-purple-400 opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
				<img
					src={base64}
					alt="capture"
					class="relative w-auto h-auto max-h-[80vh] mx-auto object-cover rounded-2xl border-8 border-white shadow-2xl z-20"
				/>
				<!-- Photo frame decorative elements -->
				<div class="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg opacity-75"></div>
				<div class="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg opacity-75"></div>
			</div>
		</div>
	</div>

	<!-- QR Code and Actions Section -->
	<div class="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 lg:rounded-l-3xl shadow-2xl text-gray-50 lg:w-1/3 flex flex-col justify-between p-6 lg:p-10 relative overflow-hidden">
		<!-- Background decorative elements -->
		<div class="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-10 -translate-y-1/2 translate-x-1/3"></div>
		<div class="absolute bottom-0 left-0 w-80 h-80 bg-blue-400 rounded-full opacity-10 translate-y-1/3 -translate-x-1/3"></div>

		<!-- QR Code Section -->
		<div class="flex-1 flex flex-col items-center justify-center text-center mb-8 relative z-10">
			{#if qrCodeDataUrl}
				<h1 class="font-bold text-3xl lg:text-4xl mb-6 text-white tracking-tight">Ihr QR Code</h1>
				<div class="bg-white p-5 rounded-2xl shadow-2xl mb-8 transform transition-all duration-300 hover:shadow-xl hover:scale-105">
					<img src={qrCodeDataUrl} alt="QR Code for UUID" class="w-full max-w-xs h-auto mx-auto" />
				</div>
				<div class="text-left mt-2 font-medium bg-blue-800/50 backdrop-blur-md p-7 rounded-2xl shadow-xl border border-blue-600/30">
					<h2 class="text-2xl font-bold border-b border-blue-400/50 pb-3 mb-5">Anleitung:</h2>
					<ul class="space-y-4">
						<li class="flex items-center">
							<span class="flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 mr-4 font-bold text-sm shadow-md">1</span>
							<span class="text-lg">Mit dem WLAN der Fotobox verbinden</span>
						</li>
						<li class="flex items-center">
							<span class="flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 mr-4 font-bold text-sm shadow-md">2</span>
							<span class="text-lg">QR Code scannen</span>
						</li>
						<li class="flex items-center">
							<span class="flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 mr-4 font-bold text-sm shadow-md">3</span>
							<span class="text-lg">Bild herunterladen</span>
						</li>
					</ul>
				</div>
			{:else}
				<div class="w-full h-64 flex items-center justify-center">
					<div class="animate-pulse flex flex-col items-center">
						<div class="h-40 w-40 bg-blue-400/50 rounded-lg mb-6"></div>
						<p class="text-xl font-medium">QR Code wird generiert...</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Print Options -->
		{#if allowPrinting}
			<div class="w-full mb-8 relative z-10">
				{#if maxCopies > 1}
					<h2 class="font-bold text-2xl mb-5 text-white">Anzahl der Kopien:</h2>
					<div class="grid grid-cols-{maxCopies} gap-4 w-full">
						{#each Array.from({ length: maxCopies }, (_, i) => i + 1) as num}
							<button
								on:click={() => {selectedCopies = num}}
								class="font-bold py-4 px-5 rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center h-18 text-xl"
								class:bg-white={selectedCopies !== num}
								class:text-blue-700={selectedCopies !== num}
								class:bg-gradient-to-r={selectedCopies === num}
								class:from-green-400={selectedCopies === num}
								class:to-green-500={selectedCopies === num}
								class:text-white={selectedCopies === num}
								class:ring-4={selectedCopies === num}
								class:ring-green-300={selectedCopies === num}
								class:hover:shadow-lg={true}
								class:hover:scale-105={true}
							>
								{num}
							</button>
						{/each}
					</div>
				{/if}

				<!-- Print Button -->
				<div class="flex justify-center mt-8">

				</div>
			</div>
		{/if}

		<!-- Actions Footer -->
		<div class="w-full grid grid-cols-2 gap-4 items-center relative z-10">
			<form method="POST" action="?/print" use:enhance class="w-full">
				<button
					class="w-full bg-gradient-to-r from-blue-100 to-white text-blue-700 font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl active:bg-blue-100 transition-all duration-300 flex items-center justify-center text-lg hover:scale-105 border-2 border-white/50 group"
					class:hidden={!allowPrinting}
					type="submit"
				>
					<span class="bg-blue-600 text-white p-2 rounded-lg mr-3 group-hover:bg-blue-700 transition-colors duration-300">
						<PrinterOutline class="w-6 h-6" />
					</span>
					<span>Drucken</span>
				</button>
			</form>
			<a
				class="w-full bg-gradient-to-r from-white to-blue-100 text-blue-700 font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl active:bg-blue-100 transition-all duration-300 flex items-center justify-center text-lg hover:scale-105 border-2 border-white/50 group"
				href="/capture"
			>
				<span class="bg-blue-600 text-white p-2 rounded-lg mr-3 group-hover:bg-blue-700 transition-colors duration-300">
					<CameraPhotoOutline class="w-6 h-6" />
				</span>
				<span>Nächstes Bild</span>
			</a>
		</div>
	</div>
</div>