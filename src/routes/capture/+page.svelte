<script>
import { CameraPhotoOutline } from 'flowbite-svelte-icons';
</script>

<div class="h-screen w-screen bg-blue-600 flex items-center">
	<div class="mx-auto">
		<form method="POST">
			<button type="submit" class="bg-gray-50 py-32 px-64 rounded-2xl text-7xl font-bold shadow-lg hover:scale-105 duration-200 flex items-center">
				<CameraPhotoOutline class="w-32 h-32 mr-6" />
				Foto aufnehmen
			</button>
		</form>
	</div>
</div>
