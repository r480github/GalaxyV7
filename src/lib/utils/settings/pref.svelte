<script>
	import '$lib/style/settings.css';
	import { loadSetting, saveSetting } from '$lib/utils/localspace.js';
	import { openAboutBlank, openBlob, saveTabPreset, setAntiClose } from '$lib/utils/cloak.js';
	import { onMount } from 'svelte';
	let localAutoAB = $state(false);
	let localAutoBlob = $state(false);
	let localAntiClose = $state(false);
	let hydrated = $state(false);
	onMount(async () => {
		const [autoAB, autoBlob, antiClose] = await Promise.all([
			loadSetting('autoAB', false),
			loadSetting('autoBlob', false),
			loadSetting('antiClose', false)
		]);
		localAutoAB = autoAB;
		localAutoBlob = autoBlob;
		localAntiClose = antiClose;
		hydrated = true;
	});
	$effect(() => {
		if (!hydrated) return;
		saveSetting('autoAB', localAutoAB);
		saveSetting('autoBlob', localAutoBlob);
		saveSetting('antiClose', localAntiClose);
		setAntiClose(localAntiClose);
	});
	function toggleAB() {
		localAutoAB = !localAutoAB;
		if (localAutoAB) localAutoBlob = false;
	}

	function toggleBlob() {
		localAutoBlob = !localAutoBlob;
		if (localAutoBlob) localAutoAB = false;
	}

	function toggleAntiClose() {
		localAntiClose = !localAntiClose;
	}

	const tabPresets = [
		{
			label: 'Canva',
			name: 'Home - Canva',
			icon: 'https://static.canva.com/domain-assets/canva/static/images/favicon-1.ico'
		},
		{
			label: 'Classroom',
			name: 'Home - Classroom',
			icon: 'https://ssl.gstatic.com/classroom/favicon.png'
		},
		{ label: 'Classlink', name: 'My Apps', icon: 'https://myapps.classlink.com/favicon.ico' },
		{
			label: 'Clever',
			name: 'Clever | Log in with Clever',
			icon: 'https://assets.clever.com/oauth/5dd5251fd7cf103e27c52d1b51f20683994400de/favicon.ico?1'
		},
		{
			label: 'Drive',
			name: 'Home - Google Drive',
			icon: 'https://ssl.gstatic.com/docs/doclist/images/drive_favicon_2026_32dp.png'
		},
		{
			label: 'Google',
			name: 'Google',
			icon: 'https://www.gstatic.com/images/branding/searchlogo/ico/favicon.ico'
		},
		{
			label: 'Gmail',
			name: 'Inbox',
			icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico'
		}
	];
</script>

<h1>Preferences</h1>
<div class="group">
	<div class="subGroup">
		<p class="subHeading">About Blank</p>
		<div class="content">
			<button class="actionBtn" onclick={openAboutBlank}>Launch</button>
			<button class="toggleBtn" class:active={localAutoAB} onclick={toggleAB}>Auto AB</button>
		</div>
	</div>
	<div class="subGroup">
		<p class="subHeading">Blob</p>
		<div class="content">
			<button class="actionBtn" onclick={openBlob}>Launch</button>
			<button class="toggleBtn" class:active={localAutoBlob} onclick={toggleBlob}>Auto Blob</button>
		</div>
	</div>
</div>
<div class="divider"></div>
<div class="subGroup">
	<p class="subHeading">Anti-Close</p>
	<div class="content">
		<button class="toggleBtn" class:active={localAntiClose} onclick={toggleAntiClose}>Toggle</button
		>
	</div>
</div>
<div class="divider"></div>
<div class="subGroup">
	<p class="subHeading">Tab Presets</p>
	<div class="content">
		{#each tabPresets as preset}
			<button class="actionBtn" onclick={() => saveTabPreset(preset.name, preset.icon)}>
				{preset.label}
			</button>
		{/each}
	</div>
	<p class="subHeading">Custom Tab</p>
	<input class="textInput" type="text" placeholder="Enter Tab URL" />
</div>
