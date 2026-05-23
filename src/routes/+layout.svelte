<script>
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/style/variables.css';
	import '$lib/style/assets.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
