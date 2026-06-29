<script>
	import { onMount } from 'svelte';
	import searchIcon from '$lib/img/icons/search.png';
	import getContrast from '$lib/utils/contrast.js';
	import faviconFetch from 'favicon-fetch';
	let { ready = false, onsearch } = $props();
	let fg = $state('');
	let homeQuery = $state('');
	let now = $state(new Date());
	let inputEl;
	onMount(() => {
		inputEl?.focus();
		const timer = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(timer);
	});
	let bg = $state();
	onMount(async () => {
		bg = await b1g;
		fg = String(await getContrast(bg));
		console.log('local color is set to: ' + fg);
	});
	let greeting = $derived.by(() => {
		const hour = now.getHours();
		if (hour < 12) {
			return 'Good morning';
		}
		if (hour < 18) {
			return 'Good afternoon';
		}
		return 'Good evening';
	});

	let clock = $derived.by(() => {
		let hour = now.getHours();
		const minute = now.getMinutes();
		let suffix = 'AM';
		if (hour >= 12) {
			suffix = 'PM';
		}
		hour = hour % 12;
		if (hour === 0) {
			hour = 12;
		}
		let paddedMinute = String(minute);
		if (paddedMinute.length < 2) {
			paddedMinute = '0' + paddedMinute;
		}
		return hour + ':' + paddedMinute + ' ' + suffix;
	});

	function submitSearch(event) {
		event.preventDefault();
		if (!ready) {
			return;
		}
		const trimmed = homeQuery.trim();
		if (!trimmed) {
			return;
		}
		onsearch?.(trimmed);
		homeQuery = '';
	}
	const quickLinks = [
		{ label: 'YouTube', url: 'https://youtube.com' },
		{ label: 'Discord', url: 'https://discord.com' },
		{ label: 'Reddit', url: 'https://reddit.com' },
		{ label: 'GitHub', url: 'https://github.com' },
		{ label: 'Spotify', url: 'https://open.spotify.com' },
		{ label: 'Twitch', url: 'https://twitch.tv' }
	];
</script>

<div
	class="home"
	style="
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
	"
>
	<div class="hero">
		<div class="brand-row">
			<h1 class="brand" style="color:{fg}">Galaxy</h1>
			<span class="version">v7</span>
		</div>
		<p class="greeting" style="color:{fg}">{greeting} &middot; {clock}</p>
		<form class="home-search" onsubmit={submitSearch}>
			<img src={searchIcon} class="home-search-icon" alt="" />
			<input
				type="text"
				placeholder=""
				bind:value={homeQuery}
				bind:this={inputEl}
				disabled={!ready}
			/>
		</form>
		{#snippet App(label, url)}
			<div class="shortcutDiv" onclick={onsearch(url)}>
				<button class="shortcuts">
					<img src={faviconFetch({ hostname: new URL(url).hostname })} alt="" />
					<p>{label}</p>
				</button>
			</div>
		{/snippet}

		<div class="apps">
			{#each quickLinks as item}
				{@render App(item.label, item.url)}
			{/each}
		</div>
	</div>
</div>

<style>
	/*...claude helped with some css*/
	.home {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: safe center;
		padding: 40px 20px 14vh;
		box-sizing: border-box;
		overflow: hidden auto;
		background-color: var(--color-bg);
		isolation: isolate;
	}
	.home::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background:
			radial-gradient(120% 90% at 50% 30%, transparent 35%, rgba(0, 0, 0, 0.45) 100%),
			linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent 28%, rgba(0, 0, 0, 0.55));
	}

	.hero {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 600px;
		animation: rise 0.7s cubic-bezier(0.16, 0.8, 0.24, 1) both;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.brand-row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
	.brand {
		margin: 0;
		font-family: var(--font-family-heading);
		font-size: clamp(34px, 11vw, 76px);
		font-weight: 800;
		letter-spacing: -0.01em;
		line-height: 1;
		text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
	}
	.version {
		margin-top: 14px;
		font-family: var(--font-family-body);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-white);
		background-color: var(--color-scrim-medium);
		border: 1px solid var(--color-border-strong);
		padding: 3px 9px;
		border-radius: 999px;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}
	.greeting {
		margin: 14px 0 36px;
		font-family: var(--font-family-body);
		font-size: 17px;
		font-weight: 500;
		letter-spacing: 0.01em;
		text-shadow: 0 1px 14px rgba(0, 0, 0, 0.55);
	}

	.home-search {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
	}
	.home-search-icon {
		position: absolute;
		left: 22px;
		height: 17px;
		opacity: 0.8;
		filter: brightness(0) invert(1);
		pointer-events: none;
	}
	.home-search input {
		width: 100%;
		height: 58px;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background-color: var(--color-scrim-medium);
		padding: 0 24px 0 54px;
		color: var(--color-white);
		font-size: 17px;
		font-family: var(--font-family-body);
		outline: none;
		box-sizing: border-box;
		transition:
			border-color 0.25s,
			box-shadow 0.25s,
			transform 0.25s;
	}
	.home-search input::placeholder {
		color: var(--color-text-subtle);
	}
	.home-search input:focus {
		border-color: var(--color-border-hover);
		transform: translateY(-1px);
	}
	.home-search input:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.apps {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 16px;
		margin-top: 40px;
		width: 100%;
	}
	.shortcutDiv {
		display: flex;
	}
	.shortcuts {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 16px 8px;
		border: 1px solid var(--color-border);
		border-radius: 18px;
		background-color: var(--color-scrim);
		backdrop-filter: blur(18px) saturate(130%);
		-webkit-backdrop-filter: blur(18px) saturate(130%);
		cursor: pointer;
		transition:
			transform 0.22s cubic-bezier(0.16, 0.8, 0.24, 1),
			background-color 0.22s,
			border-color 0.22s,
			box-shadow 0.22s;
	}
	.shortcuts:hover {
		transform: translateY(-4px);
		background-color: var(--overlay-hover);
		border-color: var(--color-border-strong);
		box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
	}
	.shortcuts:active {
		transform: translateY(-1px) scale(0.98);
	}
	.shortcuts img {
		width: 40px;
		height: 40px;
		border-radius: 11px;
		object-fit: cover;
		background-color: var(--color-surface-2);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
	.shortcuts p {
		margin: 0;
		font-family: var(--font-family-body);
		font-size: 12px;
		font-weight: 500;
		color: var(--color-white);
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}
	input,
	.shortcuts {
		-webkit-user-select: none; /* Safari */
		-ms-user-select: none; /* IE 10 and IE 11 */
		user-select: none; /* Standard syntax */
	}
	@media (max-width: 560px) {
		.apps {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
