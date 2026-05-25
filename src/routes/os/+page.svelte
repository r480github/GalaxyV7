<script>
	// @ts-nocheck
	import Window from '$lib/utils/window/window.svelte';
	import { windowList, minimizedSig, activeSignal, focusWindowTop } from '$lib/stores/index.js';
	import '$lib/style/os.css';
	import { onMount } from 'svelte';
	import mainBG from '$lib/img/bg/bg4.jpg';
	import browser from '$lib/img/icons/earthWhite.png';
	import g from '$lib/img/icons/controller.png';
	import a from '$lib/img/icons/apps.png';
	import s from '$lib/img/icons/settings.png';
	import { get } from 'svelte/store';
	import gsap from 'gsap';

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
			url: '/browser',
			name: 'Browser',
			icon: browser,
			height: '50%',
			width: '50%',
			top: 100,
			left: 60
		},
		{
			id: 2,
			url: '/books',
			name: 'Games',
			icon: g,
			height: '50%',
			width: '50%',
			top: 120,
			left: 110
		},
		{
			id: 3,
			url: '/apps',
			name: 'Apps',
			icon: a,
			height: '50%',
			width: '50%',
			top: 90,
			left: 160
		},
		{
			id: 4,
			url: '',
			name: 'Settings',
			icon: s,
			height: '50%',
			width: '50%',
			top: 50,
			left: 210
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
		const list = get(windowList);
		const matching = [];
		for (const win of list) {
			if (win.sender === appId || win.parentApp === appId) {
				matching.push(win);
			}
		}
		return matching;
	}

	function isAppActive(appId) {
		if (activeButton === appId) return true;
		const list = get(windowList);
		for (const win of list) {
			if (win.parentApp === appId && win.sender === activeButton) {
				return true;
			}
		}
		return false;
	}

	function getPreviewWindows() {
		const matching = [];
		for (const win of $windowList) {
			if (win.sender === previewApp || win.parentApp === previewApp) {
				matching.push(win);
			}
		}
		return matching;
	}

	function hasMinimizedWindow(appId) {
		for (const win of $windowList) {
			const belongsToApp = win.sender === appId || win.parentApp === appId;
			if (belongsToApp && win.minimized) {
				return true;
			}
		}
		return false;
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
			previewOpen = false;
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

	function openNewWindow(url, name, height, width, top, left, appId) {
		let uniqueSender = `${appId}-${Date.now()}`;
		let newName = String(name) + ' (' + getAppWindows(appId).length + ')';
		name = newName;
		console.log(newName);
		activeSignal.set(uniqueSender);
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
				sender: uniqueSender,
				parentApp: appId
			}
		]);
		closeMenu();
	}

	function focusWindow(sender) {
		focusWindowTop.set(sender);
		previewOpen = false;
	}

	function openMenu(e, appId, url, name, height, width, top, left) {
		e.preventDefault();
		e.stopPropagation();
		menuX = e.clientX;
		menuY = e.clientY;
		menuSender = { appId, url, name, height, width, top, left };
		menuOpen = true;
		hoverEnd();
	}

	function closeMenu() {
		menuOpen = false;
		menuSender = null;
	}

	function hoverStart(e, appId) {
		previewOpen = false;
		previewApp = null;
		e.preventDefault();
		e.stopPropagation();
		menuX = e.clientX;
		hoverTimeout = setTimeout(() => {
			let appWindows = getAppWindows(appId);
			if (appWindows.length > 0) {
				previewApp = appId;
				previewOpen = true;
			}
		}, 400);
	}
	let closeTimeout = null;

	function hoverEnd() {
		clearTimeout(hoverTimeout);
		closeTimeout = setTimeout(() => {
			previewOpen = false;
			previewApp = null;
		}, 200);
	}
</script>

<svelte:window
	onclick={() => {
		closeMenu();
	}}
/>

<div class="background" style="background-image: url({bgURL});"></div>

{#if menuOpen}
	<div class="contextMenu" style="left: {menuX}px;" onclick={(e) => e.stopPropagation()}>
		<button
			class="menuOption"
			onclick={() =>
				openNewWindow(
					menuSender.url,
					menuSender.name,
					menuSender.height,
					menuSender.width,
					menuSender.top,
					menuSender.left,
					menuSender.appId
				)}
		>
			Open New Window
		</button>
	</div>
{/if}
{#if previewOpen}
	<div
		style="left:{menuX}px"
		id="previewPanel"
		class="previewPanel"
		onclick={(e) => e.stopPropagation()}
		{@attach (node) => {
			gsap.fromTo(
				node,
				{ y: 20, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 0.3,
					ease: 'power2.out'
				}
			);
		}}
		onmouseenter={() => clearTimeout(closeTimeout)}
		onmouseleave={() => {
			previewOpen = false;
			previewApp = null;
		}}
	>
		{#each getPreviewWindows() as win}
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
			class:hasMinimized={hasMinimizedWindow(app.id)}
			onclick={() =>
				openWindow(app.url, app.name, app.height, app.width, app.top, app.left, app.id)}
			oncontextmenu={(e) =>
				openMenu(e, app.id, app.url, app.name, app.height, app.width, app.top, app.left)}
			onmouseenter={(e) => hoverStart(e, app.id)}
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
