<script>
	import { CameraPhotoOutline } from 'flowbite-svelte-icons';
	import { superForm } from 'sveltekit-superforms';

	let { data } = $props();

	let countdown = 3; // Initial countdown value
	let currentCountdown = $state(0); // For showing countdown dynamically

	const streamURL = "https://tekeye.uk/html/images/Joren_Falls_Izu_Jap.mp4";
	const stream = true;

	const { submit, enhance } = superForm(data.form, {
		onSubmit: async () => {
			// Prevent immediate form submission
			// Start countdown from 4
			currentCountdown = countdown;
			while (currentCountdown > 0) {
				await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for 1 second
				currentCountdown--; // Update displayed countdown;
			}

			currentCountdown = 0; // Reset countdown
			console.log('Submitting...');
			submit(); // Submit the form
		}
	});
</script>

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

		<!-- Countdown -->
		<div class="absolute text-white text-center font-bold text-9xl drop-shadow-2xl">
			{#if currentCountdown > 0}
				<p>{currentCountdown}</p>
			{/if}
		</div>
	</div>

	<div class="w-full basis-1/4 flex items-center">
		<form method="POST" use:enhance class="mx-auto">
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