<script>
	import back from '$lib/img/icons/left-arrow.png';
	import reload from '$lib/img/icons/reload.png';
	import forward from '$lib/img/icons/right-arrow.png';
	import setting from '$lib/img/icons/more.png';
	import Tab from '$lib/utils/tabs/tab.svelte';
	let tabs = $state([]);
	let tabCounter = 0;
	function addTab() {
		const newTab = {
			id: Date.now()
		};
		let updatedTabs = [];
		for (let i = 0; i < tabs.length; i++) {
			let existingTab = tabs[i];
			updatedTabs.push(existingTab);
		}
		updatedTabs.push(newTab);
		tabs = updatedTabs;
		tabCounter++;
	}

</script>

<div class="tab-bar">
	{#each tabs as tab (tab.id)}
		<Tab id={tab.id} />
	{/each}
	<button onclick={addTab}> Add Tab </button>
</div>
<div class="nav-bar">
	<div class="nav-left">
		<div class="button">
			<img src={back} alt="back" class="nav-icon" />
		</div>
		<div class="button">
			<img src={forward} alt="back" class="nav-icon" />
		</div>
		<div class="button">
			<img src={reload} alt="back" class="nav-icon" />
		</div>
	</div>
	<div class="nav-middle"><input /></div>
	<div class="nav-right">
		<div class="button">
			<img src={setting} alt="back" class="nav-icon" />
		</div>
	</div>
</div>

<style>
	:global(body) {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100vw;
		margin: 0px;
	}
	.tab-bar {
		height: 40px;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 3px;
		padding-left: 3px;
		padding-right: 3px;
	}
	.nav-bar {
		height: 30px;
		display: flex;
		flex-direction: row;
		background-color: black;
	}
	.nav-left {
		gap: 3px;
	}
	.nav-middle {
		flex: 3;
	}
	.nav-right {
	}
	.nav-left,
	.nav-middle,
	.nav-right {
		display: flex;
		align-items: center;
		padding-left: 3px;
		padding-right: 3px;
	}
	input {
		width: 100%;
		border-radius: 10px;
		height: 20px;
		border: none;
	}
	.nav-icon {
		height: 20px;
		width: auto;
		margin-top: 2px;
	}
	.button {
		cursor: pointer;
		height: 20px;
		width: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 2px;
		transition-duration: 0.2s;
	}
	.button:hover {
		background-color: #a7a7a733;
	}
</style>
