<script>
	// @ts-nocheck
	import Window from '$lib/utils/window/window.svelte';
	import { windowList, minimizedSig, activeSignal } from '$lib/stores/index.js';
	import '$lib/style/os.css';
	import { onMount } from 'svelte';
	import mainBG from '$lib/img/bg/bg4.jpg';
	import browser from '$lib/img/icons/earth.png';
	import { get } from 'svelte/store';

	let activeButton = $state(null);
	let bgURL = $state('');
	let menuOpen = $state(false);
	let menuX = $state(0);
	let menuY = $state(0);
	let menuSender = $state(null);
	let previewOpen = $state(false);
	let previewApp = $state(null);
	let hoverTimeout = null;

	const apps = [
		{
			id: 1,
			url: 'https://example.com',
			name: 'Example Window',
			icon: browser,
			height: '50%',
			width: '50%',
			top: 100,
			left: 60
		},
		{
			id: 2,
			url: 'https://example.com',
			name: 'Example Window 2',
			icon: browser,
			height: '70%',
			width: '60%',
			top: 200,
			left: 680
		}
	];

	$effect(() => {
		activeButton = $activeSignal;
	});
	onMount(() => {
		if (!localStorage.getItem('background')) {
			localStorage.setItem('background', mainBG);
		}
		bgURL = localStorage.getItem('background');
	});

	function getAppWindows(appId) {
		return get(windowList).filter((w) => w.sender === appId || w.parentApp === appId);
	}

	function isAppActive(appId) {
		if (activeButton === appId) return true;
		let list = get(windowList);
		return list.some((w) => w.parentApp === appId && w.sender === activeButton);
	}

	function openWindow(url, name, height, width, top, left, appId) {
		let appWindows = getAppWindows(appId);
		if (appWindows.length > 1) {
			previewApp = appId;
			previewOpen = true;
			return;
		}
		if (appWindows.length === 1) {
			minimizedSig.set(appWindows[0].sender);
			return;
		}
		activeSignal.set(appId);
		windowList.update((list) => [
			...list,
			{
				url,
				name,
				height,
				width,
				top,
				left,
				id: `win-${Date.now()}`,
				sender: appId,
				parentApp: appId
			}
		]);
	}

	function openNewWindow(url, name, appId) {
		let uniqueSender = `${appId}-${Date.now()}`;
		activeSignal.set(uniqueSender);
		windowList.update((list) => [
			...list,
			{
				url,
				name,
				height: '50%',
				width: '50%',
				top: 120,
				left: 120,
				id: `win-${Date.now()}`,
				sender: uniqueSender,
				parentApp: appId
			}
		]);
		closeMenu();
	}

	function focusWindow(sender) {
		minimizedSig.set(sender);
		previewOpen = false;
	}

	function openMenu(e, appId, url, name) {
		e.preventDefault();
		e.stopPropagation();
		menuX = e.clientX;
		menuY = e.clientY;
		menuSender = { appId, url, name };
		menuOpen = true;
	}

	function closeMenu() {
		menuOpen = false;
		menuSender = null;
	}

	function hoverStart(appId) {
		hoverTimeout = setTimeout(() => {
			let appWindows = getAppWindows(appId);
			if (appWindows.length > 0) {
				previewApp = appId;
				previewOpen = true;
			}
		}, 500);
	}

	function hoverEnd() {
		clearTimeout(hoverTimeout);
	}
</script>

<svelte:window
	onclick={() => {
		previewOpen = false;
		closeMenu();
	}}
/>

<div class="background" style="background-image: url({bgURL});"></div>

{#if menuOpen}
	<div
		class="contextMenu"
		style="left: {menuX}px; top: {menuY}px;"
		onclick={(e) => e.stopPropagation()}
	>
		<button
			class="menuOption"
			onclick={() => openNewWindow(menuSender.url, menuSender.name, menuSender.appId)}
		>
			Open New Window
		</button>
	</div>
{/if}
{#if previewOpen}
	<div class="previewPanel" onclick={(e) => e.stopPropagation()}>
		{#each $windowList.filter((w) => w.sender === previewApp || w.parentApp === previewApp) as win}
			<button class="previewCard" onclick={() => focusWindow(win.sender)}>
				<p>{win.name}</p>
			</button>
		{/each}
	</div>
{/if}

<div class="nav">
	{#each apps as app}
		<button
			class="navButton"
			class:active={isAppActive(app.id)}
			onclick={() =>
				openWindow(app.url, app.name, app.height, app.width, app.top, app.left, app.id)}
			oncontextmenu={(e) => openMenu(e, app.id, app.url, app.name)}
			onmouseenter={() => hoverStart(app.id)}
			onmouseleave={hoverEnd}
		>
			<img class="navIcon" src={app.icon} alt={app.name} />
		</button>
	{/each}
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