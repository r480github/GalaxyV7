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
		<p class="desc">
			Change the bro<span class="filler">ha67</span>wser's back<span class="filler">ha67</span>end
			engi<span class="filler">ha67</span>ne; The default is Scra<span class="filler">ha67</span
			>mjet V2 and supports most sites
		</p>

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
		<p class="desc">Change the brow<span class="filler">ha67</span>ser's search engine</p>
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
		<p class="desc">
			The thing that retrieves website data. Lib<span class="filler">ha67</span>curl has better site
			support while Ep<span class="filler">ha67</span>oxy is faster with less site support.
		</p>
		<div class="content">
			{#each transports as transport}
				<button
					class="toggleBtn"
					class:active={car === transport.value}
					onclick={() => selectTransport(transport.value)}
					>{transport.label}<span class="filler">ha67</span>{transport.labeltwo}</button
				>
			{/each}
		</div>
	</div>
	<div class="subGroup">
		<p class="subHeading">Wi<span class="filler">ha67</span>sp</p>
		<p class="desc">
			Backe<span class="filler">ha67</span>nd ser<span class="filler">ha67</span>ver used to rel<span
				class="filler">ha67</span
			>ay connections
		</p>
		<input
			class="textInput"
			type="text"
			placeholder="keep blank for default"
			bind:value={customWisp}
			oninput={(e) => updateWisp(e.currentTarget.value)}
		/>
	</div>
</div>
