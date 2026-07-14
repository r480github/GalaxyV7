<script>
	// @ts-nocheck
	import Window from '$lib/utils/window/window.svelte';
	import Notifications from '$lib/utils/notifications.svelte';
	import {
		windowList,
		minimizedSig,
		activeSignal,
		focusWindowTop,
		notif
	} from '$lib/stores/index.js';
	import '$lib/style/os.css';
	import { onMount } from 'svelte';
	import mainBG from '$lib/img/bg/default.jpg';
	import browser from '$lib/img/icons/earthWhite.png';
	import g from '$lib/img/icons/controller.png';
	import a from '$lib/img/icons/apps.png';
	import s from '$lib/img/icons/settings.png';
	import y from '$lib/img/icons/swap.png';
	import sp from '$lib/img/icons/spotify.png';
	import { get } from 'svelte/store';
	import { applyStartupSettings } from '$lib/utils/cloak.js';
	import gsap from 'gsap';
	import { loadSetting, saveSetting, onSettingChange } from '$lib/utils/localspace.js';

	let activeButton = $state(null);
	let menuOpen = $state(false);
	let openMenuX = $state(0);
	let menuX = $state(0);
	let menuY = $state(0);
	let menuSender = $state(null);
	let previewOpen = $state(false);
	let previewApp = $state(null);
	let hoverTimeout = null;
	let timeString = $state(null);
	let bgURL = $state(null);
	let hydrated = $state(false);
	let navSizeMulti = $state(1);
	let temp = 0;
	let currentY = $state(null);
	function startNavResize(e) {
		currentY = e.clientY;
		addEventListener('mousemove', dragStart);
		addEventListener('mouseup', dragStop);
		temp = navSizeMulti;
	}
	function dragStart(e) {
		let update = e.clientY;
		navSizeMulti = Math.max(Math.min(temp + (currentY - e.clientY) * 0.2, 39), -29);
	}
	function dragStop(e) {
		removeEventListener('mousemove', dragStart);
		removeEventListener('mouseup', dragStop);
	}
	const apps = [
		{
			id: 1,
			url: '/slate',
			name: 'Browser',
			icon: browser,
			height: '50%',
			width: '50%',
			top: 100,
			left: 60
		},
		{
			id: 5,
			url: '/api?url=https://spotify.com&type=prism&notif=Make%20Sure%20To%20Sign%20In%20With%20Google',
			name: 'Spotify',
			icon: sp,
			height: '50%',
			width: '50%',
			top: 50,
			left: 210
		},
		{
			id: 2,
			url: '/books',
			name: 'Books',
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
			url: '/settings',
			name: 'Settings',
			icon: s,
			height: '80%',
			width: '80%',
			top: 0,
			left: 0,
			center: true
		}
	];

	function conertToPixies(size, viewportLength) {
		const sizeAsText = String(size);
		const isPercentage = sizeAsText.endsWith('%');

		if (isPercentage) {
			const percent = parseFloat(sizeAsText);
			const fraction = percent / 100;
			return fraction * viewportLength;
		} else {
			return parseFloat(sizeAsText);
		}
	}

	function getCenteredPosition(width, height) {
		const windowWidthInPixels = conertToPixies(width, window.innerWidth);
		const windowHeightInPixels = conertToPixies(height, window.innerHeight);

		const leftoverWidth = window.innerWidth - windowWidthInPixels;
		const leftoverHeight = window.innerHeight - windowHeightInPixels;

		const centeredLeft = leftoverWidth / 2;
		const centeredTop = leftoverHeight / 2;

		return {
			left: centeredLeft,
			top: centeredTop
		};
	}

	function getAppConfig(appId) {
		for (const app of apps) {
			if (app.id === appId) {
				return app;
			}
		}
		return null;
	}

	$effect(() => {
		activeButton = $activeSignal;
		if (!hydrated) return;
		saveSetting('navbarsize', navSizeMulti);
	});
	onMount(() => {
		applyStartupSettings();
		gsap.fromTo(
			'.navButton',
			{
				opacity: 0,
				y: 50
			},
			{
				opacity: 1,
				y: 0,
				stagger: 0.09,
				delay: 0.1
			}
		);
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
		if (localStorage.getItem('firstVisit') == 'false') {
		} else {
			localStorage.setItem('firstVisit', 'false');
			$notif = 'Right click app to open new window!';
		}
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

		const appConfig = getAppConfig(appId);
		if (appConfig && appConfig.center) {
			const centeredPosition = getCenteredPosition(width, height);
			top = centeredPosition.top;
			left = centeredPosition.left;
		}

		const queryString = url.split('?')[1];
		if (queryString) {
			const params = new URLSearchParams(queryString);
			const notifMsg = params.get('notif');
			if (notifMsg) {
				$notif = notifMsg;
			}
		}
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
		activeSignal.set(uniqueSender);

		const appConfig = getAppConfig(appId);
		if (appConfig && appConfig.center) {
			const centeredPosition = getCenteredPosition(width, height);
			top = centeredPosition.top;
			left = centeredPosition.left;
		}

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
		openMenuX = e.clientX;
		menuSender = { appId, url, name, height, width, top, left };
		hoverEnd();
		menuOpen = true;
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
	function updateTime() {
		const now = new Date();
		timeString = now.toLocaleTimeString();
	}
	onMount(async () => {
		bgURL = await loadSetting('bg', mainBG);
		navSizeMulti = await loadSetting('navbarsize', 1);
		hydrated = true;
		updateTime();
		const interval = setInterval(updateTime, 1000);
		const unsubscribeBG = onSettingChange('bg', (value) => {
			bgURL = value ?? mainBG;
		});
		return () => {
			clearInterval(interval);
			unsubscribeBG();
		};
	});

	function switchMode() {
		if (localStorage.getItem('mode') == 'website') {
			localStorage.setItem('mode', 'os');
			location.replace('/');
		} else {
			localStorage.setItem('mode', 'website');
			location.replace('/');
		}
	}
</script>

<div class="topNav">
	<div class="topLeft"><p>GalaxyV7</p></div>
	<div class="topMiddle"></div>
	<div class="topRight">
		<div class="topButton" onclick={switchMode}>
			<img src={y} alt="" />
		</div>
		<p>{timeString}</p>
	</div>
</div>
<Notifications />
<svelte:window
	onclick={() => {
		closeMenu();
	}}
/>

<div class="background" style="background-image: url({bgURL});"></div>

{#if menuOpen}
	<div class="contextMenu" style="left: {openMenuX}px;" onclick={(e) => e.stopPropagation()}>
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
<div
	class="nav"
	style="	height: {40 + navSizeMulti}px;
"
>
	<div class="navResize" onmousedown={startNavResize}></div>
	<div class="navStuff">
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
