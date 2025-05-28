<script lang="ts">
	interface Props {
		count: number;
		show?: boolean;
	}

	let { count, show = true }: Props = $props();
</script>

{#if show && count > 0}
	<div class="absolute inset-0 flex items-center justify-center text-white text-center font-bold text-9xl drop-shadow-2xl z-40 pointer-events-none">
		<div class="animate-pulse">
			<p>{count}</p>
		</div>
	</div>
{/if}