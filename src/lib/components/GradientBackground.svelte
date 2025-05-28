<script lang="ts">
	interface Props {
		variant?: 'blue' | 'light' | 'dark';
		children: any;
		fullHeight?: boolean;
	}

	let {
		variant = 'blue',
		children,
		fullHeight = true
	}: Props = $props();

	const variants = {
		blue: "bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800",
		light: "bg-gradient-to-br from-blue-100 to-blue-200",
		dark: "bg-gradient-to-br from-gray-900 to-gray-800"
	};

	const heightClass = fullHeight ? "min-h-screen" : "";
</script>

<div class="{variants[variant]} {heightClass} relative overflow-hidden">
	<!-- Decorative background elements -->
	<div class="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-40 animate-pulse"></div>
	<div class="absolute bottom-20 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-40 animate-pulse delay-1000"></div>
	<div class="absolute top-1/2 left-4 w-12 h-12 bg-blue-300 rounded-full opacity-30 animate-pulse delay-500"></div>
	<div class="absolute top-1/4 right-20 w-14 h-14 bg-blue-200 rounded-full opacity-35 animate-pulse delay-700"></div>

	<!-- Content -->
	<div class="relative z-10">
		{@render children()}
	</div>
</div>