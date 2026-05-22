<script>
	import { deleteTab, activeTab } from '$lib/stores/index.js';
	import faviconFetch from 'favicon-fetch';

	let { id, displayUrl = '', title = 'New Tab' } = $props();

	const defaultIcon = 'https://galxy.it.com/assets/img/icons/browser.png';
	let faviconUrl = $derived(
		displayUrl ? faviconFetch({ hostname: new URL(displayUrl).hostname }) : defaultIcon
	);
	console.log(faviconUrl);
	function closeTab(event) {
		event.stopPropagation(); 
		$deleteTab = id;
	}
	function setActive() {
		$activeTab = id;
	}
</script>

<div
	class="tab"
	{id}
	onclick={setActive}
	style="background-color: {id == $activeTab ? 'rgb(40, 40, 40)' : 'black'};"
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
		border-right: 1px solid rgb(40, 40, 40);
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
		background-color: rgb(40, 40, 40);
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
		color: rgb(193, 193, 193);
		font-size: 13px;
		font-family: fabrica;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tab-icon {
		height: 20px;
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
		color: red;
	}
	@keyframes expand {
		from {
			width: 130px;
		}
		to {
			width: 178px;
		}
	}
</style>
