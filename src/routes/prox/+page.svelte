<script>
	import Frame from '$lib/utils/iframe/Iframe.svelte';

	let query = $state('');
	let frameUrl = $state('');

	function handleSubmit(e) {
		e.preventDefault();
		const trimmed = query.trim();
		if (!trimmed) return;
		frameUrl = trimmed;
	}
</script>

<div class="nav">
	<div class="left"></div>
	<div class="middle">
		<form onsubmit={handleSubmit}>
			<input id="searchbar" placeholder="Search" bind:value={query} autocomplete="off" />
		</form>
	</div>
	<div class="right"></div>
</div>
<Frame url={frameUrl} type="default" id="1" />

<style>
	:global(body) {
		height: 100vh;
		margin: 0;
		overflow: hidden;
	}
</style>
