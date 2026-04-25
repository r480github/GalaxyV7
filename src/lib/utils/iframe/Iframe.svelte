<script>
	import { encodeUrl } from '$lib/utils/iframe/encode.js';

	let { url = '', type = 'default', id } = $props();
	let iframeEl;

	$effect(() => {
		if (!url || !iframeEl) return;
		encodeUrl(url, type).then((src) => {
			iframeEl.src = src;
		});
	});
</script>

<iframe bind:this={iframeEl} title="proxy frame" {id}></iframe>

<svelte:head>
	<script src="/baremux/index.js" defer></script>
	<script src="/uv/uv.bundle.js" defer></script>
	<script src="/uv/uv.config.js" defer></script>
	<script src="/scram/scramjet.all.js" defer></script>
	<script src="/stuff.js" defer></script>
</svelte:head>

<style>
	iframe {
		height: 100%;
		width: 100%;
		margin: 0;
		border: 0;
	}
</style>
