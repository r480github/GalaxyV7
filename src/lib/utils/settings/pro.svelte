<script>
	import '$lib/style/settings.css';
	import { loadSetting } from '$lib/utils/localspace.js';
	import { saveSettingShared } from '$lib/utils/settingsSync.js';
	import { onMount } from 'svelte';

	let lethe = $state('sj2');
	let searchEngine = $state('google');
	let car = $state('libcurl');
	let customWisp = $state('');

	onMount(async () => {
		const [savedLethe, savedSearch, savedCar, savedWisp] = await Promise.all([
			loadSetting('lethe', 'sj2'),
			loadSetting('searchEngine', 'google'),
			loadSetting('car', 'libcurl'),
			loadSetting('customWisp', '')
		]);
		lethe = savedLethe;
		searchEngine = savedSearch;
		car = savedCar;
		customWisp = savedWisp;
	});

	function selectProxy(value) {
		lethe = value;
		saveSettingShared('lethe', value);
	}
	function selectSearch(value) {
		searchEngine = value;
		saveSettingShared('searchEngine', value);
	}
	function selectTransport(value) {
		car = value;
		saveSettingShared('car', value);
	}
	function updateWisp(value) {
		customWisp = value;
		saveSettingShared('customWisp', value);
	}

	const proxies = [
		{ value: 'sj2', label: 'SJ2' },
		{ value: 'sj', label: 'SJ' },
		{ value: 'uv', label: 'UV' }
	];
	const searchEngines = [
		{ value: 'google', label: 'Google' },
		{ value: 'ddg', label: 'DuckDuckGo' },
		{ value: 'brave', label: 'Brave' }
	];
	const transports = [
		{ value: 'libcurl', label: 'Lib', labeltwo: 'curl' },
		{ value: 'epoxy', label: 'Ep', labeltwo: 'oxy' }
	];
</script>

<div class="group">
	<div class="subGroup">
		<p class="subHeading">Pr<span class="filler">ha67</span>oxy</p>
		<div class="content">
			{#each proxies as proxy}
				<button
					class="toggleBtn"
					class:active={lethe === proxy.value}
					onclick={() => selectProxy(proxy.value)}>{proxy.label}</button
				>
			{/each}
		</div>
	</div>
	<div class="subGroup">
		<p class="subHeading">Sea<span class="filler">ha67</span>rch</p>
		<div class="content">
			{#each searchEngines as engine}
				<button
					class="toggleBtn"
					class:active={searchEngine === engine.value}
					onclick={() => selectSearch(engine.value)}>{engine.label}</button
				>
			{/each}
		</div>
	</div>
</div>
<div class="group">
	<div class="subGroup">
		<p class="subHeading">Tran<span class="filler">ha67</span>sport</p>
		<div class="content">
			{#each transports as transport}
				<button
					class="toggleBtn"
					class:active={car === transport.value}
					onclick={() => selectTransport(transport.value)}>{transport.label}<span class="filler">ha67</span>{transport.labeltwo}</button
				>
			{/each}
		</div>
	</div>
	<div class="subGroup">
		<p class="subHeading">Wi<span class="filler">ha67</span>sp</p>
		<input
			class="textInput"
			type="text"
			placeholder="keep blank for default"
			bind:value={customWisp}
			oninput={(e) => updateWisp(e.currentTarget.value)}
		/>
	</div>
</div>
