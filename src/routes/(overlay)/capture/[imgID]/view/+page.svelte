<script lang="ts">
	import Confetti from 'svelte-confetti';

	let { data } = $props();
	let { uuid, base64 } = data;

	// config
	const confetti = true;

	// Function to trigger download
	function downloadImage() {
		const link = document.createElement('a');
		link.href = base64;
		link.download = `fotobox-${uuid}.jpg`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	// Auto-trigger download on mobile devices
	function handleImageClick() {
		if (window.innerWidth <= 768) {
			downloadImage();
		}
	}

	// Detect user agent for instructions
	function getUserAgent() {
		const userAgent = navigator.userAgent.toLowerCase();
		if (userAgent.includes('android')) {
			return 'android';
		} else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
			return 'ios';
		}
		return 'general';
	}

	const instructions = {
		"ios": [
			"Tippen Sie lange auf das Bild",
			"Wählen Sie 'In Fotos sichern'",
			"Nun finden Sie das Bild in Ihrer Galerie"
		],
		"android": [
			"Tippen Sie lange auf das Bild",
			"Wählen Sie 'Bild herunterladen'",
			"Das Bild wird in Ihren Downloads gespeichert"
		],
		"general": [
			"Tippen Sie lange auf das Bild",
			"Wählen Sie 'Bild speichern'",
			"Das Bild wird gespeichert"
		]
	}

	// Get current platform
	const currentPlatform = getUserAgent();
	const currentInstructions = instructions[currentPlatform];
</script>

{#if confetti}
	<div class="fixed z-10 top-0 left-0 h-full w-full pointer-events-none flex justify-center">
		<Confetti x={[-5, 5]} y={[0, 0.1]} delay={[0, 2000]} duration={2000} amount={500} fallDistance="70vh" />
	</div>
{/if}

<div class="bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center p-4 py-8 relative min-h-full">
	<!-- Decorative background elements -->
	<div class="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-40 animate-pulse"></div>
	<div class="absolute bottom-20 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-40 animate-pulse delay-1000"></div>
	<div class="absolute top-1/2 left-4 w-12 h-12 bg-blue-300 rounded-full opacity-30 animate-pulse delay-500"></div>
	<div class="absolute top-1/4 right-20 w-14 h-14 bg-blue-200 rounded-full opacity-35 animate-pulse delay-700"></div>

	<!-- Main content container -->
	<div class="w-full max-w-4xl mx-auto text-center relative z-20">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-4 tracking-tight">
				Ihr Foto
			</h1>
			<!--
			<p class="text-lg md:text-xl text-blue-700 font-medium">
				Tippen Sie auf das Bild, um es herunterzuladen
			</p>
			-->
		</div>

		<!-- Image container -->
		<div class="relative w-full mb-8">
			<div class="relative transform group cursor-pointer" onclick={handleImageClick} onkeydown={(e) => e.key === 'Enter' && handleImageClick()} role="button" tabindex="0">
				<!-- Glow effect -->
				<div class="absolute inset-0 rounded-2xl blur-lg bg-gradient-to-br from-blue-400 to-purple-400 opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>

				<!-- Main image -->
				<img
					src={base64}
					alt="Ihr Fotobox Bild"
					class="relative w-full h-auto max-h-[60vh] mx-auto object-cover rounded-2xl border-8 border-white shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] z-10"
				/>

				<!-- Decorative corner elements -->
				<div class="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg opacity-75"></div>
				<div class="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg opacity-75"></div>

				<!-- Download hint overlay -->
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-2xl">
					<div class="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
						<p class="text-blue-800 font-semibold text-lg">📱 Zum Herunterladen tippen</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Instructions -->
		<div class="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-blue-200/50 max-w-2xl mx-auto">
			<h2 class="text-2xl md:text-3xl font-bold text-blue-800 mb-6">So speichern Sie Ihr Bild:</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
				{#each currentInstructions as instruction, index}
					<div class="flex flex-col items-center text-center">
						<div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg mb-3">
							{index + 1}
						</div>
						<p class="text-blue-700 font-medium">{instruction}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Alternative download button for desktop -->
		<div class="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-blue-200/50 max-w-2xl mx-auto md:block hidden mt-8">
			<h2 class="text-2xl md:text-3xl font-bold text-blue-800 mb-6">Alternativ:</h2>
			<div class="grid grid-cols-1 gap-6 text-left">
					<div class="flex flex-col items-center text-center">
						<div class="flex flex-col items-center text-center">
							<div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg mb-3">
								<button
									onclick={downloadImage}
									class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg hover:scale-105 border-2 border-blue-500"
								>
									📥 Bild herunterladen
								</button>
							</div>
							<p class="text-blue-700 font-medium">Hier können Sie ihr Bild herunterladen</p>
						</div>
					</div>
			</div>
		</div>
	</div>
</div>