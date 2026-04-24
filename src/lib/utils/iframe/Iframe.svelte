<script>
	let { url = '', type, id } = $props();
</script>

<input id="url" type="text" class="search-input search" placeholder="Search" value={url} />
<input id="prxType" value={type} />
<iframe id="iframe"></iframe>

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
}
input {
		display: none;
	}
</style>
