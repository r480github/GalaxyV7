<script>
	import { deleteTab, activeTab } from '$lib/stores/index.js';
	import faviconFetch from 'favicon-fetch';
	import defaultIcon from '$lib/img/icons/earthWhite.png';

	let { id, displayUrl = '', title = 'New Tab' } = $props();

	let hovered = $state(false);

	let faviconUrl = $derived(
		displayUrl ? faviconFetch({ hostname: new URL(displayUrl).hostname }) : defaultIcon
	);
	let tabHover = 'var(--overlay-browser-tab)';
	let opacity = $state(0.7);
	// svelte-ignore state_referenced_locally
	$effect(() => {
		if (faviconUrl == defaultIcon) {
			opacity = 0.7;
		} else {
			opacity = 1;
		}
	});
	function closeTab(event) {
		event.stopPropagation();
		$deleteTab = id;
	}
	function handleAuxClick(event) {
		if (event.button === 1) {
			event.preventDefault();
			$deleteTab = id;
		}
	}
	function setActive() {
		$activeTab = id;
	}

	let bgColor = $derived.by(() => {
		if (id == $activeTab) {
			return 'var(--color-chrome)';
		}
		if (hovered) {
			return tabHover;
		}
		return 'transparent';
	});
	let borderRadius = $derived.by(() => {
		if (id == $activeTab || hovered) {
			return '7px';
		}
	});
</script>

<div
	class="tab"
	{id}
	onclick={setActive}
	onauxclick={handleAuxClick}
	onmouseover={() => (hovered = true)}
	onmouseout={() => (hovered = false)}
	style="background-color: {bgColor}; 
	border-top-left-radius: {borderRadius}; "
>
	<div class="stuff">
		<div class="icon">
			<img src={faviconUrl} class="tab-icon" alt="" style="opacity:{opacity}" />
		</div>
		<p class="title">{title}</p>
		<div class="close" onclick={closeTab}><p class="closeText">&times;</p></div>
	</div>
	{#if id == $activeTab}
		<div class="bottom-right" style="background-color: {bgColor};"></div>
		<div class="bottom-left" style="background-color: {bgColor};"></div>
	{/if}
	{#if hovered}
		<div
			class="bottom-right"
			style="background-color: {tabHover};
		z-index: -10"
		></div>
		<div
			class="bottom-left"
			style="background-color: {tabHover};
		z-index: -10"
		></div>
	{/if}
</div>

<style>
	.tab {
		position: relative;
		height: 30px;
		width: 178px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		animation: expand 0.2s;
		-webkit-user-select: none; /* Safari */
		-ms-user-select: none; /* IE 10 and IE 11 */
		user-select: none; /* Standard syntax */
		margin-top: auto;
		padding: 0px 10px;
		box-sizing: border-box;
		min-width: 0;
		border-top-right-radius: 7px;
		border-right: 1px solid rgba(255, 255, 255, 0);
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
		margin-top: 15px;
		width: 200px;
		height: 200px;
		background-color: var(--color-chrome);
		clip-path: path('M 20 20 L 20 180 L 180 180 Q 25 175 20 20 Z');
		z-index: 50;
	}
	.bottom-right {
		margin-left: calc(100% + 10px);
		transform: scale(0.1);
	}
	.bottom-left {
		margin-left: calc(-100% - 10px);
		transform: scale(0.1) scaleX(-1);
	}
	.title {
		color: var(--color-text-muted);
		font-size: 12px;
		font-family: var(--font-family-body);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 900;
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
			width: 178px;
		}
	}
</style>
