<script>
	import { deleteTab, activeTab } from '$lib/stores/index.js';
	import faviconFetch from 'favicon-fetch';
	import defaultIcon from '$lib/img/icons/folder.png';

	let { id, displayUrl = '', title = 'New Tab' } = $props();

	let hovered = $state(false);

	let faviconUrl = $derived(
		displayUrl
			? faviconFetch({ size: 'medium', hostname: new URL(displayUrl).hostname })
			: defaultIcon
	);

	function closeTab(event) {
		event.stopPropagation();
		$deleteTab = id;
	}
	function setActive() {
		$activeTab = id;
	}

	let bgColor = $derived(
		id == $activeTab
			? 'var(--color-chrome)'
			: hovered
				? 'var(--overlay-hover-strong)'
				: 'transparent'
	);
</script>

<div
	class="tab"
	{id}
	onclick={setActive}
	onmouseover={() => (hovered = true)}
	onmouseout={() => (hovered = false)}
	style="background-color: {bgColor};"
>
	<div class="stuff">
		<div class="icon">
			<img src={faviconUrl} class="tab-icon" alt="" />
		</div>
		<p>{title}</p>
		<div class="close" onclick={closeTab}><p>&times;</p></div>
	</div>
	{#if id == $activeTab}
		<div class="bottom-right"></div>
	{/if}
	{#if id == $activeTab}
		<div class="bottom-left"></div>
	{/if}
</div>

<style>
	.tab {
		position: relative;
		height: 28px;
		width: 178px;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
		border-right: 1px solid var(--color-chrome);
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
		background-color: var(--color-chrome);
		clip-path: path('M 20 20 L 20 180 L 180 180 Q 25 175 20 20 Z');
		z-index: 50;
	}
	.bottom-right {
		margin-left: calc(100% + 10px);

		transform: scale(0.06);
	}
	.bottom-left {
		margin-left: calc(-100% - 10px);
		transform: scale(0.06) scaleX(-1);
	}
	.tab p {
		color: var(--color-text-muted);
		font-size: 13px;
		font-family: var(--font-family-body);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tab-icon {
		height: 15px;
		margin-top: 3px;
		margin-right: 5px;
	}
	.close {
		cursor: default;
		margin-left: auto;
		height: 10px;
		width: 10px;
		border-radius: 50%;
		display: flex;
		align-items: center;
	}
	.close p {
		margin: 0px;
		line-height: 10px;
		margin-bottom: 2px;
	}
	.close:hover p {
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
