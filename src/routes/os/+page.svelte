<script>
// @ts-nocheck
	import Window from '$lib/utils/window/window.svelte';
	import {windowList} from '$lib/stores/index.js';

	function openWindow(url, name, height, width, top, left) {
		windowList.update(list => [...list, { url, name, height, width, top, left, id: Date.now() }]);
	}
</script> 

<button onclick={() => openWindow('https://example.com', 'Example Window', '50%', '50%', 50, 25)}>
	Open Window
</button>

{#each $windowList as window (window.id)}
	<Window
		url={window.url}
		name={window.name}
		height={window.height}
		width={window.width}
		top={window.top}
		left={window.left}
		id={window.id}
	/>
{/each}