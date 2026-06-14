<script>
	import favicon from '$lib/assets/favicon.png';
	import '$lib/style/variables.css';
	//	import '$lib/style/themes.css';
	import '$lib/style/assets.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Home - Classroom</title>
</svelte:head>

{@render children()}

<!--<html data-theme="">
</html>-->
