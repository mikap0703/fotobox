<script lang="ts">
	import { HomeOutline } from 'flowbite-svelte-icons';

	let { children } = $props();

	function reset() {
		document.body.style.overflow = 'hidden';
		document.documentElement.style.overflow = 'hidden';

		document.body.style.overscrollBehavior = 'none';
		document.documentElement.style.overscrollBehavior = 'none';
	}
</script>

<a class="bg-blue-600 rounded-lg h-12 w-12 absolute bottom-6 left-6 opacity-60 drop-shadow-xl" href="/" onclick={reset}>
	<HomeOutline class="text-white" />
</a>

{@render children()}