<script>
	import { CameraPhotoOutline } from 'flowbite-svelte-icons';
	import { superForm } from 'sveltekit-superforms';
	import { onMount, onDestroy } from 'svelte';

	let { data } = $props();

	// config
	const countdown = 3; // Initial countdown value

	const { form, submit, enhance } = superForm(data.form, {
		dataType: 'json',
		onSubmit: async () => {
			// Prevent immediate form submission
			// Start countdown from specified value
			currentCountdown = countdown;

			while (currentCountdown > 0) {
				await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for 1 second
				currentCountdown--; // Update displayed countdown;
			}

			takeScreenshot();

			currentCountdown = 0; // Reset countdown
			console.log('Submitting...');
			console.log($form)
			// cancel()
			submit(); // Submit the form
		}
	});

	// countdown
	let currentCountdown = $state(0); // For showing countdown dynamically

	// stream
	const streamURL = "https://tekeye.uk/html/images/Joren_Falls_Izu_Jap.mp4";
	const stream = false;

	// webcam
	let webcamVideoElement;
	let webcamStream;

	// First, get the list of all available video devices
	async function getVideoDevices() {
		const devices = await navigator.mediaDevices.enumerateDevices();
		return devices.filter(device => device.kind === 'videoinput');
	}

	// Then, select a specific camera by its label or deviceId
	async function getSpecificCamera(preferredLabel) {
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
		const webcamStream = await navigator.mediaDevices.getUserMedia({
			video: {
				// deviceId: { exact: selectedDevice.deviceId },
				width: { ideal: 1920 * 2 },      // 4K horizontal resolution
				height: { ideal: 1000 * 2},     // 4K vertical resolution
			}
		});

		return webcamStream;
	}

	onMount(async () => {
		if (webcam && navigator.mediaDevices?.getUserMedia) {
			try {
				webcamStream = await getSpecificCamera('MacBook Pro Camera');

				if (webcamVideoElement) {
					webcamVideoElement.srcObject = webcamStream;
				}
			} catch (err) {
				console.error('Error accessing webcam:', err);
			}
		}
	});

	// Stop webcam when component unmounts
	function stopWebcam() {
		if (webcamStream) {
			webcamStream.getTracks().forEach(track => track.stop());
		}
	}

	// Clean up on component unmount
	onDestroy(() => {
		stopWebcam();
	});

	let image = $state(null);
	const webcam = true;

	let canvasElement;

	function takeScreenshot() {
		console.log('Taking screenshot...');
		if (!webcamVideoElement || !canvasElement) return;

		const width = webcamVideoElement.videoWidth;
		const height = webcamVideoElement.videoHeight;

		canvasElement.width = width;
		canvasElement.height = height;

		const context = canvasElement.getContext('2d');
		context.drawImage(webcamVideoElement, 0, 0, width, height);

		// This gives you a base64 image URL (you can upload it, send to server, etc.)
		const imageDataURL = canvasElement.toDataURL('image/png');
		console.log('Screenshot taken:', imageDataURL);
		$form.image = imageDataURL; // Store the image data URL
	}
</script>

<canvas bind:this={canvasElement} class="hidden"></canvas>

<div class="h-screen w-screen bg-blue-600 flex flex-col">
	<div class="relative w-full basis-3/4 flex items-center justify-center">
		{#if stream}
			<!-- Video Container -->
			<video class="absolute h-5/6 my-auto rounded-2xl object-cover" autoplay muted>
				<source src={streamURL} type="video/mp4" />
				<track kind="captions" />
				Your browser does not support the video tag.
			</video>
		{/if}

		{#if webcam}
			<!-- Webcam Container with enforced 15:10 (3:2) aspect ratio -->
			<div class="relative h-5/6 max-w-5/6 max-w-[90%] aspect-[3/2] my-8 mx-auto overflow-hidden rounded-2xl flex items-center justify-center bg-black">
				<video
					bind:this={webcamVideoElement}
					class="absolute top-0 left-0 w-full h-full object-cover"
					autoplay
					muted
					playsinline
				></video>
			</div>
		{/if}

		<!-- Countdown -->
		<div class="absolute text-white text-center font-bold text-9xl drop-shadow-2xl">
			{#if currentCountdown > 0}
				<p>{currentCountdown}</p>
			{/if}
		</div>
	</div>

	<div class="w-full basis-1/4 flex flex-col items-center">
		<form method="POST" use:enhance enctype="multipart/form-data" class="mx-auto">
			<button
				type="submit"
				class="bg-gray-50 rounded-2xl text-5xl p-8 font-bold shadow-lg hover:scale-105 duration-200 flex items-center"
			>
				<CameraPhotoOutline class="w-16 mr-6" />
				Foto aufnehmen
			</button>
		</form>
	</div>
</div>