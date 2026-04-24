<script>
	import Frame from '$lib/utils/iframe/Iframe.svelte';
</script>

<div class="nav">
	<div class="left"></div>
	<div class="middle">
		<input id="search" placeholder="Search" />
	</div>
	<div class="right"></div>
</div>
<Frame url="example.net" type="default" id="1" />

<style>
	:global(body) {
		height: 100vh;
		margin: 0;
		overflow: hidden;
	}
</style>
