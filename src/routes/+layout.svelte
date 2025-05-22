<script lang="ts">
	import '@fontsource-variable/sora';
	import '../app.css';
	import { Toaster } from 'svelte-french-toast';
	let { children } = $props();
</script>

<div class="bg-gray-50 min-h-screen min-w-screen">
	<Toaster />

	{@render children()}
</div>
