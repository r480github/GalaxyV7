<script>
	// @ts-nocheck

	import '$lib/utils/window/window.css';
	import minimize from '$lib/img/icons/minimize-sign.png';
	import maximize from '$lib/img/icons/stop.png';
	import close from '$lib/img/icons/close.png';
	import layers from '$lib/img/icons/layers.png';
	import gsap from 'gsap';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { scale } from 'svelte/transition';
	import { linear } from 'svelte/easing';
	import {
		topZ,
		windowList,
		minimizedSig,
		activeSignal,
		focusWindowTop
	} from '$lib/stores/index.js';

	// window zindex
	let z = $state(1);
	let minimizedStat = $state(false);
	let rightSplit = $state(false);

	let {
		url,
		name,
		height: initialHeight,
		width: initialWidth,
		top,
		left,
		id = Date.now(),
		sender
	} = $props();
	setTop();

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
	const topBarrier = 25;
	//
	//----- window drag logic -----
	//

	function setTop() {
		topZ.update((n) => n + 1);
		z = get(topZ);
		console.log('Universal Z-index is: ' + z);
	}
	function dragStart(e) {
		activeSignal.set(sender);
		draggingState = true;
		offSetx = e.clientX - x;
		offSety = e.clientY - y;
		topZ.update((n) => n + 1);
		z = get(topZ);
		console.log('Universal Z-index is: ' + z);
		window.addEventListener('mousemove', dragging);
		window.addEventListener('mouseup', dragStop);
		if (
			width === '100%' &&
			height === ((window.innerHeight - 40.001) / window.innerHeight) * 100 + '%'
		) {
			maximizedStat = false;
			transition = false;
			height = tempHeight;
			width = tempWidth;
			x = e.clientX - offSetx;
		}
	}
	function dragging(e) {
		y = e.clientY - offSety;
		x = e.clientX - offSetx;

		if (y < topBarrier) {
			y = topBarrier;
		}

		if (rightSplit == null) {
			transition = false;
			height = tempHeight;
			width = tempWidth;
			rightSplit = false;
		} else {
			if (e.clientX > window.innerWidth - 200) {
				rightSplit = true;
			} else if (e.clientX < 200) {
				rightSplit = 'left';
			} else {
				rightSplit = false;
			}
		}
	}
	function checkBoundaries() {
		if (y < topBarrier) {
			y = topBarrier;
		}
		if (x < 0) {
			x = 0;
		}
		if (y > window.innerHeight - document.getElementById(id).offsetHeight - 40) {
			y = window.innerHeight - document.getElementById(id).offsetHeight - 40;
		}
	}
	function dragStop() {
		if (rightSplit === true) {
			transition = true;
			tempHeight = height;
			tempWidth = width;
			width = '50%';
			x = window.innerWidth - window.innerWidth / 2;
			y = 0;
			height = ((window.innerHeight - 40) / window.innerHeight) * 100 + '%';
			rightSplit = null;
		} else if (rightSplit === 'left') {
			transition = true;
			tempHeight = height;
			tempWidth = width;
			width = '50%';
			x = 0;
			y = 0;
			height = ((window.innerHeight - 40) / window.innerHeight) * 100 + '%';
			rightSplit = null;
		} else {
			checkBoundaries();
		}
		draggingState = false;
		window.removeEventListener('mousemove', dragging);
		window.removeEventListener('mouseup', dragStop);
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
		activeSignal.set(sender);
		if (maximizedStat === true) {
			y = tempY;
			x = tempX;
			height = tempHeight;
			width = tempWidth;
			transition = true;
			maximizedStat = false;

			setTimeout(() => {
				transition = false;
			}, 300);
		} else {
			setTop();
			tempX = x;
			tempY = y;
			tempHeight = height;
			tempWidth = width;
			height = ((window.innerHeight - 40.001) / window.innerHeight) * 100 + '%';
			width = '100%';
			x = 0;
			y = 0;
			maximizedStat = true;
			transition = true;
		}
	}
	onMount(() => {
		gsap.fromTo(
			`#${id}`,
			{
				scale: 0.8,
				opacity: 0.5
			},
			{
				scale: 1,
				opacity: 1,
				duration: 0.3,
				ease: 'power2.out'
			}
		);
	});

	function setMinimizedFlag(value) {
		windowList.update((list) => {
			const updatedList = [];
			for (const win of list) {
				if (win.id === id) {
					const updatedWin = { ...win, minimized: value };
					updatedList.push(updatedWin);
				} else {
					updatedList.push(win);
				}
			}
			return updatedList;
		});
	}

	function restoreFromMinimized() {
		minimizedStat = false;
		setMinimizedFlag(false);
		gsap.fromTo(
			`#${id}`,
			{ scale: 0.8, opacity: 0 },
			{
				scale: 1,
				opacity: 1,
				duration: 0.3,
				onStart: function () {
					document.getElementById(id).style.display = 'flex';
					setTop();
					activeSignal.set(sender);
				}
			}
		);
	}

	function closeWindow() {
		transition = false;
		activeSignal.set(null);
		gsap.to(`#${id}`, {
			scale: 0.8,
			opacity: 0,
			duration: 0.2,
			ease: 'ease',
			onComplete: function () {
				const list = get(windowList);
				const remaining = [];
				for (const win of list) {
					if (win.id !== id) {
						remaining.push(win);
					}
				}
				windowList.set(remaining);
			}
		});
	}

	function minimizeWindow() {
		minimizedStat = !minimizedStat;
		setMinimizedFlag(minimizedStat);
		if (minimizedStat) {
			activeSignal.set(null);
			gsap.to(`#${id}`, {
				scale: 0.8,
				opacity: 0,
				duration: 0.2,
				onComplete: function () {
					document.getElementById(id).style.display = 'none';
				}
			});
		} else {
			activeSignal.set(sender);
			gsap.fromTo(
				`#${id}`,
				{ scale: 0.8, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					duration: 0.3,
					onStart: function () {
						document.getElementById(id).style.display = 'flex';
						setTop();
					}
				}
			);
		}
		minimizedSig.set(null);
	}

	//
	//----- window resize logic -----
	//

	let startX, startY, resizeType, startWidth, startHeight, startTop, startLeft;
	function resizeStart(e, type) {
		activeSignal.set(sender);
		setTop();
		draggingState = true;
		const rect = document.getElementById(id).getBoundingClientRect();
		startX = e.clientX;
		startY = e.clientY;
		resizeType = type;
		startWidth = rect.width;
		startHeight = rect.height;
		startTop = y;
		startLeft = x;
		window.addEventListener('mousemove', resizing);
		window.addEventListener('mouseup', resizeStop);
	}
	function resizing(e) {
		transition = false;
		const mouseXmove = e.clientX - startX;
		const mouseYmove = e.clientY - startY;
		const maxWidth = window.innerWidth - x;
		const maxHeight = window.innerHeight - y;
		const maxHeightBottom = window.innerHeight - y - 40;
		if (resizeType === 'right') {
			width = Math.min(maxWidth, Math.max(400, startWidth + mouseXmove)) + 'px';
		}

		if (resizeType === 'bottom') {
			height = Math.min(maxHeightBottom, Math.max(200, startHeight + mouseYmove)) + 'px';
		}

		if (resizeType === 'left') {
			const newWidth = Math.max(400, startWidth - mouseXmove);
			const newX = startLeft + (startWidth - newWidth);
			x = Math.max(0, newX);
			width = startLeft + startWidth - x + 'px';
		}

		if (resizeType === 'top') {
			const newHeight = Math.max(200, startHeight - mouseYmove);
			const newY = startTop + (startHeight - newHeight);
			y = Math.max(0, newY);
			height = startTop + startHeight - y + 'px';
		}

		if (resizeType === 'bottomRight') {
			width = Math.min(maxWidth, Math.max(400, startWidth + mouseXmove)) + 'px';
			height = Math.min(maxHeightBottom, Math.max(200, startHeight + mouseYmove)) + 'px';
		}

		if (resizeType === 'bottomLeft') {
			const newWidth = Math.max(400, startWidth - mouseXmove);
			const newX = startLeft + (startWidth - newWidth);
			x = Math.max(0, newX);
			width = startLeft + startWidth - x + 'px';
			height = Math.min(maxHeightBottom, Math.max(200, startHeight + mouseYmove)) + 'px';
		}

		if (resizeType === 'topRight') {
			width = Math.min(maxWidth, Math.max(200, startWidth + mouseXmove)) + 'px';
			const newHeight = Math.max(150, startHeight - mouseYmove);
			const newY = startTop + (startHeight - newHeight);
			y = Math.max(0, newY);
			height = startTop + startHeight - y + 'px';
		}

		if (resizeType === 'topLeft') {
			const newWidth = Math.max(200, startWidth - mouseXmove);
			const newHeight = Math.max(150, startHeight - mouseYmove);
			const newX = startLeft + (startWidth - newWidth);
			const newY = startTop + (startHeight - newHeight);
			x = Math.max(0, newX);
			y = Math.max(0, newY);
			width = startLeft + startWidth - x + 'px';
			height = startTop + startHeight - y + 'px';
		}
	}
	function resizeStop() {
		checkBoundaries();
		draggingState = false;
		window.removeEventListener('mousemove', resizing);
		window.removeEventListener('mouseup', resizeStop);
	}
	$effect(() => {
		if ($focusWindowTop !== sender) return;
		if (minimizedStat) {
			restoreFromMinimized();
		} else {
			setTop();
			activeSignal.set(sender);
		}
		focusWindowTop.set(null);
	});
	$effect(() => {
		transition = false;
		if ($minimizedSig !== sender) return;
		if (z !== $topZ && minimizedStat == false) {
			setTop();
			activeSignal.set(sender);
		} else {
			minimizedStat = !minimizedStat;
			setMinimizedFlag(minimizedStat);
			if (minimizedStat) {
				activeSignal.set(null);
				gsap.to(`#${id}`, {
					scale: 0.8,
					opacity: 0,
					duration: 0.2,
					onComplete: function () {
						document.getElementById(id).style.display = 'none';
					}
				});
			} else {
				transition = false;
				activeSignal.set(sender);
				gsap.fromTo(
					`#${id}`,
					{ scale: 0.8, opacity: 0 },
					{
						scale: 1,
						opacity: 1,
						duration: 0.3,
						onStart: function () {
							document.getElementById(id).style.display = 'flex';
							setTop();
						}
					}
				);
			}
		}
		minimizedSig.set(null);
	});
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
    transition-duration: {transition == true ? '0.3s' : '0s'};
  "
>
	<div
		onmousedown={(e) => resizeStart(e, 'top')}
		class="r-top side resizer"
		class:active={maximizedStat === true}
	></div>
	<div
		onmousedown={(e) => resizeStart(e, 'right')}
		class="r-right side resizer"
		class:active={maximizedStat === true}
	></div>
	<div
		onmousedown={(e) => resizeStart(e, 'bottom')}
		class="r-bottom side resizer"
		class:active={maximizedStat === true}
	></div>
	<div
		onmousedown={(e) => resizeStart(e, 'left')}
		class="r-left side resizer"
		class:active={maximizedStat === true}
	></div>
	<div
		onmousedown={(e) => resizeStart(e, 'topRight')}
		class="r-top-right corner resizer"
		class:active={maximizedStat === true}
	></div>
	<div
		onmousedown={(e) => resizeStart(e, 'topLeft')}
		class="r-top-left corner resizer"
		class:active={maximizedStat === true}
	></div>
	<div
		onmousedown={(e) => resizeStart(e, 'bottomRight')}
		class="r-bottom-right corner resizer"
		class:active={maximizedStat === true}
	></div>
	<div
		onmousedown={(e) => resizeStart(e, 'bottomLeft')}
		class="r-bottom-left corner resizer"
		class:active={maximizedStat === true}
	></div>

	<div
		class="windowCover"
		class:active={z == $topZ}
		{id}
		onclick={() => {
			setTop();
			activeSignal.set(sender);
		}}
		style="
    width: 100%;
    z-index: {z};
  "
	></div>
	<div class="bar" style="width: 100%;">
		<div class="left">
			<p class="window-title">{name}</p>
		</div>
		<div class="middle" onmousedown={dragStart} ondblclick={maximizeWindow}></div>
		<div class="right">
			<button class="navControl" onclick={minimizeWindow} type="button">
				<img class="minimize" src={minimize} alt="Minimize" />
			</button>
			<button class="navControl" onclick={maximizeWindow} type="button">
				<img class="maximize" src={maximizedStat ? layers : maximize} alt="Maximize" />
			</button>
			<button class="navControl closeDiv" onclick={closeWindow} type="button">
				<img class="close" src={close} alt="Close" />
				<!--I'll just live with this ig-->
			</button>
		</div>
	</div>
	<iframe src={url} title={name} style={draggingState ? 'pointer-events: none;' : 'auto'}></iframe>
</div>
{#if rightSplit === true}
	<div class="snapPreview right"></div>
{:else if rightSplit === 'left'}
	<div class="snapPreview left"></div>
{/if}
