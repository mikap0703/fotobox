<script lang="ts">
	import { CameraPhotoOutline } from 'flowbite-svelte-icons';
	import { superForm } from 'sveltekit-superforms';
	import { onDestroy, onMount } from 'svelte';

	let { data } = $props();

	// config
	const countdown = 3; // Initial countdown value
	const streamURL = "https://tekeye.uk/html/images/Joren_Falls_Izu_Jap.mp4";
	const stream = false;
	const webcam = true;
	const webcamName = "OBS Virtual Camera"

	// form stuff
	const { form, submit, enhance } = superForm(data.form, {
		dataType: 'json',
		onSubmit: async () => {
			// Prevent immediate form submission
			// Start countdown from specified value
			currentCountdown = countdown;

			while (currentCountdown > 0) {
				await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
				currentCountdown--; // Update displayed countdown;
			}

			takeScreenshot();
			currentCountdown = 0; // Reset countdown

			submit(); // Submit the form
		}
	});

	// countdown
	let currentCountdown = $state(0); // For showing countdown dynamically

	// webcam
	// eslint-disable-next-line svelte/valid-compile
	let webcamVideoElement: null | HTMLVideoElement = null;
	let webcamStream: null | MediaStream = null;

	// First, get the list of all available video devices
	async function getVideoDevices() {
		if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
			throw new Error('Media devices API not supported');
		}
		await navigator.mediaDevices.getUserMedia({ video: true })
		const devices = await navigator.mediaDevices.enumerateDevices();
		return devices.filter(device => device.kind === 'videoinput');
	}

	// Then, select a specific camera by its label or deviceId
	async function getSpecificCamera(preferredLabel: string) {
		const videoDevices = await getVideoDevices();

		console.log("Available video devices:");
		videoDevices.forEach(device => {
			console.log(`- ${device.label || 'Unnamed device'} (${device.deviceId})`);
		});

		// Find the device with matching label, or use the first one
		const selectedDevice = videoDevices.find(device =>
			device.label && device.label.includes(preferredLabel)
		) || videoDevices[0];

		// Use the selected device
		return await navigator.mediaDevices.getUserMedia({
			video: {
				deviceId: { exact: selectedDevice.deviceId },
				width: { ideal: 1920 * 2 },      // 4K horizontal resolution
				height: { ideal: 1000 * 2 },     // 4K vertical resolution
			}
		});
	}

	onMount(async () => {
		if (webcam) {
			try {
				webcamStream = await getSpecificCamera(webcamName);

				if (webcamVideoElement) {
					webcamVideoElement.srcObject = webcamStream;
				}
			} catch (err) {
				console.error('Error accessing webcam:', err);
			}
		}
	});

	// Clean up on component unmount
	onDestroy(() => {
		// Stop webcam when component unmounts
		if (webcamStream) {
			webcamStream.getTracks().forEach(track => track.stop());
		}
	});

	let canvasElement: null | HTMLCanvasElement = null;

	function takeScreenshot() {
		console.log('Taking screenshot...');
		if (!webcamVideoElement || !canvasElement) return;

		const width = webcamVideoElement.videoWidth;
		const height = webcamVideoElement.videoHeight;

		canvasElement.width = width;
		canvasElement.height = height;

		const context = canvasElement.getContext('2d');

		if (!context) {
			console.error('Failed to get canvas context');
			return;
		}

		context.drawImage(webcamVideoElement, 0, 0, width, height);

		// This gives you a base64 image URL (you can upload it, send to server, etc.)
		const imageDataURL = canvasElement.toDataURL('image/png');
		console.log('Screenshot taken:', imageDataURL);
		$form.image = imageDataURL; // Store the image data URL
	}
</script>

<canvas bind:this={canvasElement} class="hidden"></canvas>

<div class="h-screen w-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 flex flex-col">
	<div class="relative w-full basis-3/4 flex items-center justify-center p-4 lg:p-8">
		<!-- Decorative background elements -->
		<div class="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-40 animate-pulse"></div>
		<div class="absolute bottom-20 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-40 animate-pulse delay-1000"></div>

		<!-- Media Display (Stream or Webcam) -->
		<div class="relative w-full max-w-5xl aspect-[3/2] my-8 transform group">
			<div class="absolute inset-0 rounded-2xl blur-lg bg-gradient-to-br from-blue-400 to-purple-400 opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
			<div class="relative w-full h-full rounded-2xl overflow-hidden border-8 border-white shadow-2xl z-20 bg-black">
				{#if stream}
					<video
						class="w-full h-full object-cover"
						autoplay
						muted
					>
						<source src={streamURL} type="video/mp4" />
					</video>
				{:else if webcam}
					<video
						bind:this={webcamVideoElement}
						class="w-full h-full object-cover"
						autoplay
						muted
						playsinline
					></video>
				{/if}
				<!-- Overlay positioned on top of the video with higher z-index -->
				<img src={data.overlay} alt="" class="absolute inset-0 w-full h-full object-cover z-30">
			</div>
			<!-- Decorative corners -->
			<div class="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg opacity-75"></div>
			<div class="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg opacity-75"></div>
		</div>

		<!-- Countdown -->
		{#if currentCountdown > 0}
			<div class="absolute text-white text-center font-bold text-9xl drop-shadow-2xl z-40">
				<p>{currentCountdown}</p>
			</div>
		{/if}
	</div>


	<div class="w-full basis-1/4 flex flex-col items-center justify-center">
		<form method="POST" use:enhance enctype="multipart/form-data" class="mx-auto w-full max-w-md px-4">
			<button
				type="submit"
				class="w-full bg-gradient-to-r from-white to-blue-100 text-blue-700 font-semibold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl active:bg-blue-100 transition-all duration-300 flex items-center justify-center text-lg sm:text-xl hover:scale-105 border-2 border-white/50 group"
			>
			<span class="bg-blue-600 text-white p-2 rounded-lg mr-3 group-hover:bg-blue-700 transition-colors duration-300">
				<CameraPhotoOutline class="w-6 h-6" />
			</span>
				<span>Foto aufnehmen</span>
			</button>
		</form>
	</div>
</div>