<script lang="ts">
	interface Props {
		src: string;
		alt?: string;
		aspectRatio?: string;
		maxHeight?: string;
		clickable?: boolean;
		onClick?: () => void;
		showOverlay?: boolean;
		overlayText?: string;
	}

	let {
		src,
		alt = "Photo",
		aspectRatio = "3/2",
		maxHeight = "80vh",
		clickable = false,
		onClick,
		showOverlay = false,
		overlayText = "📱 Zum Herunterladen tippen"
	}: Props = $props();
</script>

<div class="relative w-full mb-8">
	<div
		class="relative transform group"
		class:cursor-pointer={clickable}
		onclick={clickable ? onClick : undefined}
		onkeydown={clickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
		role={clickable ? "button" : undefined}
		tabindex={clickable ? 0 : undefined}
	>
		<!-- Glow effect -->
		<div class="absolute inset-0 rounded-2xl blur-lg bg-gradient-to-br from-blue-400 to-purple-400 opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>

		<!-- Main image -->
		<img
			{src}
			{alt}
			class="relative w-full h-auto mx-auto object-cover rounded-2xl border-8 border-white shadow-2xl transition-transform duration-300 z-10"
			class:group-hover:scale-[1.02]={clickable}
			style="aspect-ratio: {aspectRatio}; max-height: {maxHeight};"
		/>

		<!-- Decorative corner elements -->
		<div class="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg opacity-75"></div>
		<div class="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg opacity-75"></div>

		<!-- Click overlay -->
		{#if clickable && showOverlay}
			<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-2xl">
				<div class="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
					<p class="text-blue-800 font-semibold text-lg">{overlayText}</p>
				</div>
			</div>
		{/if}
	</div>
</div>