<script lang="ts">
	interface Props {
		type?: 'primary' | 'secondary' | 'success' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		icon?: any;
		fullWidth?: boolean;
		href?: string;
		onclick?: () => void;
		children: any;
	}

	let {
		type = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		icon,
		fullWidth = false,
		href,
		onclick,
		children
	}: Props = $props();

	const baseClasses = "font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105 border-2 group";

	const typeClasses = {
		primary: "bg-gradient-to-r from-white to-blue-100 text-blue-700 border-white/50 hover:from-blue-50 hover:to-blue-150",
		secondary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 hover:from-blue-700 hover:to-blue-800",
		success: "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 hover:from-green-600 hover:to-green-700",
		danger: "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 hover:from-red-600 hover:to-red-700"
	};

	const sizeClasses = {
		sm: "py-2 px-4 text-sm",
		md: "py-4 px-6 text-lg",
		lg: "py-5 px-8 text-xl"
	};

	const classes = `${baseClasses} ${typeClasses[type]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`;
</script>

{#if href}
	<a {href} class={classes}>
		{#if icon}
      <span class="bg-blue-600 text-white p-2 rounded-lg mr-3 group-hover:bg-blue-700 transition-colors duration-300">
        <svelte:component this={icon} class="w-6 h-6" />
      </span>
		{/if}
		{@render children()}
	</a>
{:else}
	<button class={classes} {onclick} {disabled} type="submit">
		{#if loading}
			<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-current mr-3"></div>
		{:else if icon}
      <span class="bg-blue-600 text-white p-2 rounded-lg mr-3 group-hover:bg-blue-700 transition-colors duration-300">
        <svelte:component this={icon} class="w-6 h-6" />
      </span>
		{/if}
		{@render children()}
	</button>
{/if}