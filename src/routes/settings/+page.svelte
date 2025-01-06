<script>
import { LockOutline } from 'flowbite-svelte-icons';
</script>

<div class="w-5/6 mx-auto py-16 text-black overflow-auto">
	<h1 class="text-3xl font-bold mb-8">Einstellungen</h1>

	<form action="" class="space-y-6">
		<div>
			<label for="maxCopies" class="block text-lg font-medium mb-2">Maximale Kopien</label>
			<input
				type="number"
				id="maxCopies"
				name="maxCopies"
				min="1"
				max="10"
				value="1"
				class="block w-full p-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
			/>
		</div>
		<div>
			<label for="confetti" class="block text-lg font-medium mb-2">Konfetti</label>
			<input
				type="checkbox"
				id="confetti"
				name="confetti"
				class="h-6 w-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
			/>
		</div>
		<div class="w-full flex flex-row-reverse mt-2">
			<button class="bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition">Speichern</button>
		</div>
	</form>

	<div class="w-full mt-64">
		<a class="bg-gray-500 w-72 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-gray-600 transition flex items-center justify-between mx-auto" href="/admin">
			<LockOutline class="w-8 h-8" /> Zum geschützten Bereich</a>
	</div>
</div>