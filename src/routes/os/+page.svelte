<script>
	// @ts-nocheck
	import Window from '$lib/utils/window/window.svelte';
	import { windowList, minimizedSig } from '$lib/stores/index.js';
	import '$lib/style/os.css';
	import { onMount } from 'svelte';
	import mainBG from '$lib/img/bg/bg4.jpg';
	import browser from '$lib/img/icons/earth.png';
  import {get} from 'svelte/store'
	let activeButton = $state();
	let bgURL = $state('');
	onMount(() => {
		if (!localStorage.getItem('background')) {
			localStorage.setItem('background', mainBG);
		}
		bgURL = localStorage.getItem('background');
	});
	function openWindow(url, name, height, width, top, left, id) {
		let list = get(windowList);
		if (list.find((w) => w.sender === id)) {
      minimizedSig.set(id)
		} else {
      
			activeButton = id;
			windowList.update((list) => [
				...list,
				{ url, name, height, width, top, left, id: `win-${Date.now()}`, sender: id }
			]);
			console.log($windowList);
		}
	}
</script>

<div class="background" style="background-image: url({bgURL});"></div>

<div class="nav">
	<button
		class:active={activeButton === 1}
		class="navButton"
		onclick={() => openWindow('https://example.com', 'Example Window', '50%', '50%', 100, 60, 1)}
	>
		<img class="navIcon" src={browser} />
	</button>
	<button
		class:active={activeButton === 2}
		class="navButton"
		onclick={() => openWindow('https://example.com', 'Example Window', '50%', '50%', 200, 680, 2)}
	>
		<img class="navIcon" src={browser} />
	</button>
</div>

{#each $windowList as window (window.id)}
	<Window
		url={window.url}
		name={window.name}
		height={window.height}
		width={window.width}
		top={window.top}
		left={window.left}
		id={window.id}
    sender={window.sender}
	/>
{/each}
