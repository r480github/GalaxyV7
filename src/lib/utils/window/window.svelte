<script>
	import '$lib/utils/window/window.css';
	import minimize from '$lib/img/icons/minimize-sign.png';
	import maximize from '$lib/img/icons/stop.png';
	import close from '$lib/img/icons/close.png';
	import layers from '$lib/img/icons/layers.png';
  import { topZ, isDraggingAny } from '$lib/stores/zindex.js';
  import {get} from 'svelte/store';
  let z = $state(1)
  let {
		url = 'https://example.com',
		name = 'Example',
		height = '50%',
		width = '50%',
		top = 50,
		left = 25
	} = $props();

	let x = $state(left);
	let y = $state(top);
	let offSetx = 0;
	let offSety = 0;
	let draggingState = $state(false);
	function dragStart(e) {
		draggingState = true;
    isDraggingAny.set(true)
		offSetx = e.clientX - x;
		offSety = e.clientY - y;
    topZ.update(n => n + 1);
    z = get(topZ);
    console.log("Universal Z-index is: "+ z);
		window.addEventListener('mousemove', dragging);
		window.addEventListener('mouseup', dragStop);
	}
	function dragging(e) {
		y = e.clientY - offSety;
		x = e.clientX - offSetx;
	}
	function dragStop() {
		draggingState = false;
    isDraggingAny.set(false)
		window.removeEventListener('mousemove', dragging);
		window.removeEventListener('mouseup', dragStop);
	}
</script>

<div
  class="window"
  style="
    height:{height};
    width: {width};
    top:{y}px;
    left:{x}px;
    z-index: {z};
    pointer-events: {$isDraggingAny && !draggingState ? 'none' : 'auto'};
  "
>
  <div class="bar" style="width: 100%;">
    <div class="left">
      <p class="window-title">{name}</p>
    </div>
    <div class="middle" onmousedown={dragStart}></div>
    <div class="right">
      <div class="navControl"><img src={minimize} alt="Minimize" /></div>
      <div class="navControl"><img src={maximize} alt="Maximize" /></div>
      <div class="navControl close"><img src={close} alt="Close" /></div>
    </div>
  </div>
  <iframe src={url} title={name} style={draggingState ? 'pointer-events: none;' : 'auto'}></iframe>
</div>
