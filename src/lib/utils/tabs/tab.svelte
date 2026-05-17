<script>
	import { activeTab, tabID, tabName, tabIcon } from '$lib/stores/index.js';
	let { id } = $props();
</script>

<div class="tab" {id}>
	<div class="icon">
		<img src={$tabIcon} class="tab-icon" />
	</div>
	<p>{$tabName || 'New Tab'}</p>
</div>

<style>
	.tab {
		height: 32px;
		width: 182px;
		background-color: black;
		border-radius: 10px;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.tab p {
		color: white;
	}
	.tab-icon {
		height: 25px;
	}
</style>
