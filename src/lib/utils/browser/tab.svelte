<script>
	import { deleteTab, activeTab } from '$lib/stores/index.js';
	import faviconFetch from 'favicon-fetch';
	import defaultIcon from '$lib/img/icons/earthWhite.png';
	import gsap from 'gsap';
	let { id, displayUrl = '', title = 'New Tab' } = $props();

	let tabEl;
	let hovered = $state(false);

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
	function setActive() {
		$activeTab = id;
	}
	let pillColor = $derived.by(() => {
		if (id == $activeTab) {
			return 'var(--color-surface-2)';
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
</script>

<div
	class="tab"
	class:active={id == $activeTab}
	{id}
	bind:this={tabEl}
	onclick={setActive}
	onauxclick={handleAuxClick}
	onmouseover={() => (hovered = true)}
	onmouseout={() => (hovered = false)}
	style="background-color: {bgColor}; "
>
	<div class="pill" style="background-color: {pillColor};">
		<div class="stuff">
			<div class="icon">
				<img src={faviconUrl} class="tab-icon" alt="" style="opacity:{opacity}" />
			</div>
			<p class="title">{title}</p>
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
		height: 30px;
		width: 190px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		animation: expand 0.2s;
		-webkit-user-select: none; /* Safari */
		-ms-user-select: none; /* IE 10 and IE 11 */
		user-select: none; /* Standard syntax */
		margin-top: auto;
		padding: 0px 3px;
		box-sizing: border-box;
		min-width: 0;
		border-right: 1px solid rgba(255, 255, 255, 0);
		border-top-right-radius: 8px;
		border-top-left-radius: 8px;
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
		margin-top: 15px;
		width: 200px;
		height: 200px;
		clip-path: path('M 20 20 L 20 180 L 180 180 Q 21 179 20 20 Z');
	}
	.bottom-right {
		margin-left: calc(100% + 14px);
		transform: scale(0.1);
	}
	.bottom-left {
		margin-left: calc(-100% - 14px);
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
	.close:hover {
		background-color: var(--overlay-hover);
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
