<script>
// @ts-nocheck

// Styles and icon imports
import "$lib/utils/window/window.css";
import minimize from "$lib/img/icons/minimize-sign.png";
import maximize from "$lib/img/icons/stop.png";
import close from "$lib/img/icons/close.png";
import layers from "$lib/img/icons/layers.png";
import gsap from "gsap";
import { onMount } from "svelte";
import { get } from "svelte/store";
import { scale } from "svelte/transition";
import { linear } from "svelte/easing";
// global vars
import { topZ, isDraggingAny, windowList } from "$lib/stores/index.js";

// window zindex
let z = $state(1);

// props
let {
	url,
	name,
	height: initialHeight,
	width: initialWidth,
	top,
	left,
	id = Date.now(),
} = $props();
setTop();
// position states

// svelte-ignore state_referenced_locally
let x = $state(left);
// svelte-ignore state_referenced_locally
let y = $state(top);
// svelte-ignore state_referenced_locally
let height = $state(initialHeight);
// svelte-ignore state_referenced_locally
let width = $state(initialWidth);
let offSetx = 0;
let offSety = 0;
let draggingState = $state(false);
let transition = $state(false);
//
//----- window drag logic -----
//

function setTop() {
	topZ.update((n) => n + 1);
	z = get(topZ);
	console.log("Universal Z-index is: " + z);
}
function dragStart(e) {
	draggingState = true;
	isDraggingAny.set(true);
	offSetx = e.clientX - x;
	offSety = e.clientY - y;
	topZ.update((n) => n + 1);
	z = get(topZ);
	console.log("Universal Z-index is: " + z);
	window.addEventListener("mousemove", dragging);
	window.addEventListener("mouseup", dragStop);
}
function dragging(e) {
	y = e.clientY - offSety;
	x = e.clientX - offSetx;
	if (width === "100%" && height === "100%") {
		maximizedStat = false;
		transition = false;
		height = tempHeight;
		width = tempWidth;
		y = e.clientY - offSety;
		x = e.clientX - offSetx;
		console.log("Dragging in maximized state");
	}
}
function dragStop() {
	draggingState = false;
	isDraggingAny.set(false);
	window.removeEventListener("mousemove", dragging);
	window.removeEventListener("mouseup", dragStop);
}
//
//----- window nav control logic -----
//
let tempX = 0;
let tempY = 0;
let tempHeight = 0;
let tempWidth = 0;
let maximizedStat = $state(false);
function maximizeWindow() {
	if (height === "100%") {
		height = "50%";
		width = "50%";
		y = tempY;
		x = tempX;
		height = tempHeight;
		width = tempWidth;
		transition = false;
		maximizedStat = false;
	} else {
		topZ.update((n) => n + 1);
		z = get(topZ);
		tempX = x;
		tempY = y;
		tempHeight = height;
		tempWidth = width;
		height = "100%";
		width = "100%";
		x = 0;
		y = 0;
		console.log(tempX, tempY);
		maximizedStat = true;

		transition = true;
	}
}
onMount(() => {
	gsap.fromTo(
		`#${id}`,
		{
			scale: 0.8,
			opacity: 0.5,
		},
		{
			scale: 1,
			opacity: 1,
			duration: 0.3,
			ease: "power2.out",
		},
	);
});

function closeWindow() {
	transition = false;
	gsap.to(`#${id}`, {
		scale: 0.8,
		opacity: 0,
		duration: 0.2,
		ease: "ease",
		onComplete: function () {
			let list = get(windowList);
			let index = list.findIndex((w) => w.id === id);
			if (index !== -1) {
				list.splice(index, 1);
				windowList.set(list);
			}
		},
	});
}

function minimizeWindow() {
	//Will work on this after task bar has been implemented
}

//
//----- window resize logic -----
//

let startX, startY, resizeType, startWidth, startHeight, startTop, startLeft;
function resizeStart(e, type) {
	draggingState = true;
	isDraggingAny.set(true);
	const rect = document.getElementById(id).getBoundingClientRect();
	startX = e.clientX;
	startY = e.clientY;
	resizeType = type;
	startWidth = rect.width;
	startHeight = rect.height;
	startTop = y;
	startLeft = x;
	window.addEventListener("mousemove", resizing);
	window.addEventListener("mouseup", resizeStop);
}
function resizing(e) {
	const mouseXmove = e.clientX - startX;
	const mouseYmove = e.clientY - startY;

	if (resizeType === "right") {
		width = Math.max(400, startWidth + mouseXmove) + "px";
	}
	if (resizeType === "bottom") {
		height = Math.max(200, startHeight + mouseYmove) + "px";
	}
	if (resizeType === "left") {
		const newWidth = Math.max(400, startWidth - mouseXmove);
		width = newWidth + "px";
		x = startLeft + (startWidth - newWidth);
	}

	if (resizeType === "top") {
		const newHeight = Math.max(200, startHeight - mouseYmove);
		height = newHeight + "px";
		y = startTop + (startHeight - newHeight);
	}
	if (resizeType === "bottomRight") {
		width = Math.max(400, startWidth + mouseXmove) + "px";
		height = Math.max(200, startHeight + mouseYmove) + "px";
	}

	if (resizeType === "bottomLeft") {
		const newWidth = Math.max(400, startWidth - mouseXmove);
		width = newWidth + "px";
		height = Math.max(200, startHeight + mouseYmove) + "px";
		x = startLeft + (startWidth - newWidth);
	}

	if (resizeType === "topRight") {
		width = Math.max(200, startWidth + mouseXmove) + "px";
		const newHeight = Math.max(150, startHeight - mouseYmove);
		height = newHeight + "px";
		y = startTop + (startHeight - newHeight);
	}

	if (resizeType === "topLeft") {
		const newWidth = Math.max(200, startWidth - mouseXmove);
		const newHeight = Math.max(150, startHeight - mouseYmove);
		width = newWidth + "px";
		height = newHeight + "px";
		x = startLeft + (startWidth - newWidth);
		y = startTop + (startHeight - newHeight);
	}
}
function resizeStop() {
	draggingState = false;
	isDraggingAny.set(false);
	window.removeEventListener("mousemove", resizing);
	window.removeEventListener("mouseup", resizeStop);
}
</script>

<div
  role="toolbar"
	class="window"
	class:active={z == $topZ}
	{id}
	style="
    height:{height};
    width: {width};
    top:{y}px;
    left:{x}px;
    z-index: {z};
    pointer-events: {$isDraggingAny && !draggingState ? 'none' : 'auto'};
    transition-duration: {transition == true ? '0.3s' : '0s'};
  "
>
  <div onmousedown={(e) => resizeStart(e, 'top')} class="r-top side resizer" class:active={maximizedStat === true}></div>
  <div onmousedown={(e) => resizeStart(e, 'right')} class="r-right side resizer"  class:active={maximizedStat === true}></div>
  <div onmousedown={(e) => resizeStart(e, 'bottom')} class="r-bottom side resizer" class:active={maximizedStat === true}></div>
  <div onmousedown={(e) => resizeStart(e, 'left')} class="r-left side resizer" class:active={maximizedStat === true}></div>
  <div onmousedown={(e) => resizeStart(e, 'topRight')} class="r-top-right corner resizer" class:active={maximizedStat === true}></div>
  <div onmousedown={(e) => resizeStart(e, 'topLeft')} class="r-top-left corner resizer" class:active={maximizedStat === true}></div>
  <div onmousedown={(e) => resizeStart(e, 'bottomRight')} class="r-bottom-right corner resizer" class:active={maximizedStat === true}></div>
  <div onmousedown={(e) => resizeStart(e, 'bottomLeft')} class="r-bottom-left corner resizer "class:active={maximizedStat === true}></div>

	<div
		class="windowCover"
		class:active={z == $topZ}
		{id}
		onclick={setTop}
		style="
    width: 100%;
    z-index: {z};
  "
	></div>
	<div class="bar" style="width: 100%;" ondblclick={maximizeWindow}>
		<div class="left">
			<p class="window-title">{name}</p>
		</div>
		<div class="middle" onmousedown={dragStart}></div>
		<div class="right">
			<button class="navControl" onclick={minimizeWindow} type="button">
				<img class="minimize" src={minimize} alt="Minimize" />
			</button>
			<button class="navControl" onclick={maximizeWindow} type="button">
				<img class="maximize" src={maximize} alt="Maximize" />
			</button>
			<button class="navControl closeDiv" onclick={closeWindow} type="button">
				<img class="close" src={close} alt="Close" />
				<!--I'll just live with this ig-->
			</button>
		</div>
	</div>
	<iframe src={url} title={name} style={draggingState ? 'pointer-events: none;' : 'auto'}></iframe>
</div>
