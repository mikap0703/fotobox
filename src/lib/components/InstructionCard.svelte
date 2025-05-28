<script lang="ts">
	interface Instruction {
		step: number;
		text: string;
	}

	interface Props {
		title: string;
		instructions: Instruction[];
		maxWidth?: string;
	}

	let {
		title,
		instructions,
		maxWidth = "2xl"
	}: Props = $props();
</script>

<div class="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-blue-200/50 max-w-{maxWidth} mx-auto">
	<h2 class="text-2xl md:text-3xl font-bold text-blue-800 mb-6">{title}</h2>
	<div class="grid grid-cols-1 md:grid-cols-{instructions.length > 2 ? '3' : instructions.length} gap-6 text-left">
		{#each instructions as instruction}
			<div class="flex flex-col items-center text-center">
				<div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg mb-3">
					{instruction.step}
				</div>
				<p class="text-blue-700 font-medium">{instruction.text}</p>
			</div>
		{/each}
	</div>
</div>