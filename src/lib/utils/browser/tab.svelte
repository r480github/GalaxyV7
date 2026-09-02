<script>
	import {
		deleteTab,
		activeTab,
		slotsDragged,
		draggedOverLeft,
		draggedOverRight,
		isTabDragging
	} from '$lib/stores/index.js';
	import faviconFetch from 'favicon-fetch';
	import defaultIcon from '$lib/img/icons/earthWhite.png';
	import gsap from 'gsap';
	import { compile } from 'svelte/compiler';
	let { id, displayUrl = '', title = 'New Tab', onDrop } = $props();
	let tabEl;
	let hovered = $state(false);
	let compiledTitle = $state([]);
	let faviconUrl = $derived(
		displayUrl ? faviconFetch({ hostname: new URL(displayUrl).hostname }) : defaultIcon
	);
	let opacity = $state(0.7);
	// svelte-ignore state_referenced_locally
	$effect(() => {
		if (faviconUrl == defaultIcon) {
			opacity = 0.7;
		} else {
			opacity = 1;
		}
		if (title) {
			sliceText(title);
		}
	});
	function closeTab(event) {
		event.stopPropagation();
		gsap.to(tabEl, {
			width: 10,
			duration: 0.14,
			onComplete: () => {
				$deleteTab = id;
			}
		});
	}
	function handleAuxClick(event) {
		closeTab(event);
	}
	let pillColor = $derived.by(() => {
		if (id == $activeTab) {
			return 'transparent';
		}

		if (hovered) {
			return 'var(--overlay-hover)';
		}
		return 'transparent';
	});
	let bgColor = $derived.by(() => {
		if (id == $activeTab) {
			return 'var(--color-surface-2)';
		}
		return 'transparent';
	});
	// svelte-ignore non_reactive_update
	let accumX = $state(0);
	let tabLength = $state(null);
	function callDrag(e) {
		$activeTab = id;
		// @ts-ignore
		accumX = e.movementX;
		addEventListener('mousemove', startDrag);
		addEventListener('mouseup', stopDrag);
		tabLength = tabEl.getBoundingClientRect().width;
	}
	function startDrag(e) {
		$isTabDragging = true;
		accumX -= -e.movementX;
		// @ts-ignore
		$slotsDragged = Math.round(accumX / tabLength);
	}
	function stopDrag(e) {
		removeEventListener('mousemove', startDrag);
		removeEventListener('mouseup', stopDrag);
		accumX = 0;
		$isTabDragging = false;
		onDrop?.(id);
	}
	function sliceText(text) {
		let x = text.length / 2;
		compiledTitle = [text.slice(0, x), text.slice(x)];
	}
</script>

<div
	class="tab noSelect"
	class:active={id == $activeTab}
	{id}
	bind:this={tabEl}
	onmousedown={callDrag}
	onauxclick={(event) => {
		if (event.button === 1) {
			handleAuxClick(event);
		}
	}}
	onmouseover={() => (hovered = true)}
	onmouseout={() => (hovered = false)}
	style={`background-color: ${bgColor}; `}
	style:transform={$isTabDragging ? `translateX(${accumX}px)` : null}
	style:z-index={$isTabDragging ? 10 : null}
	style:border-right={id == $draggedOverLeft ? `1px solid white` : null}
	style:border-left={id == $draggedOverRight ? `1px solid white` : null}
	// I tried but ts won't work
	// so ig I'll just stick with border
	// style:margin-right={id == $draggedOverLeft ? `190px` : null}
	// style:margin-left={id == $draggedOverRight ? `190px` : null}
>
	<div class="pill noSelect" style="background-color: {pillColor};">
		<div class="stuff noSelect">
			<div class="icon noSelect">
				<img src={faviconUrl} class="tab-icon noSelect" alt="" style="opacity:{opacity}" />
			</div>
			<p class="title">{compiledTitle[0]}<span class="filler">haha6767</span>{compiledTitle[1]}</p>
			<div class="close" onclick={closeTab}><p class="closeText">&times;</p></div>
		</div>
	</div>
	{#if id == $activeTab}
		<div class="bottom-right" style="background-color: {bgColor};"></div>
		<div class="bottom-left" style="background-color: {bgColor};"></div>
	{/if}
</div>

<style>
	.tab {
		position: relative;
		height: 35px;
		width: 210px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		animation: expand 0.2s;
		margin-top: auto;
		padding: 0px 3px;
		box-sizing: border-box;
		min-width: 0;
		border-right: 1px solid rgba(255, 255, 255, 0);
		transition:
			margin-left 0.3s ease,
			margin-right 0.3s ease;
	}
	.pill {
		width: 100%;
		height: 24px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding: 0px 7px;
	}
	.stuff {
		display: flex;
		align-items: center;
		margin-right: auto;
		width: 100%;
	}
	.bottom-right,
	.bottom-left {
		position: absolute;
		margin-top: 19px;
		width: 200px;
		height: 200px;
		clip-path: path('M 20 20 L 20 180 L 140 180 C 85 180 55 170 40 145 C 25 120 20 80 20 20 Z');
	}
	.bottom-right {
		margin-left: calc(100% + 16px);
		transform: scale(0.1);
	}
	.bottom-left {
		margin-left: calc(-100% - 16px);
		transform: scale(0.1) scaleX(-1);
	}
	.title {
		color: var(--color-text-subtle);
		font-size: 12px;
		font-family: var(--font-family-body);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 900;
	}
	.tab.active .title {
		color: var(--color-text);
	}
	.tab.active {
		border-top-right-radius: 8px;
		border-top-left-radius: 8px;
		border: none !important;
	}
	.tab-icon {
		height: 15px;
		margin-top: 3px;
		margin-right: 5px;
	}
	.close {
		margin-left: auto;
		border-radius: 50%;
		height: 20px;
		width: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4px;
		transition-duration: 0.2s;
	}
	.closeText {
		margin: 0px;
		margin-bottom: 2px;
		font-family: var(--font-family-ui);
		font-size: 25px;
		cursor: pointer;
		color: var(--color-text);
		line-height: 20px;
	}
	.close p:hover {
		color: var(--color-danger);
	}
	@keyframes expand {
		from {
			width: 50px;
		}
		to {
			width: 210px;
		}
	}
</style>
