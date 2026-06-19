<script>
	import '$lib/style/settings.css';
	import Pref from '$lib/utils/settings/pref.svelte';
	import Themes from '$lib/utils/settings/themes.svelte';
	const stuffs = [
		{ name: 'Preferences', id: 'pref' },
		{ name: 'Themes', id: 'themes' },
		{ name: 'Proxy', id: 'proxy' },
		{ name: 'OS', id: 'os' },
		{ name: 'Data', id: 'data' },
		{ name: 'About', id: 'about' }
	];
</script>

{#snippet navItems(name, id)}
	<button
		class="navBtn"
		onclick={() => {
			document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
		}}><p>{name}</p></button
	>
{/snippet}
<div class="nav">
	{#each stuffs as stuff}
		{@render navItems(stuff.name, stuff.id)}
	{/each}
</div>
<div class="block" id="pref"><Pref /></div>
<div class="block" id="themes">
	<Themes />
</div>
<div class="block" id="proxy">
	<h1>Proxy</h1>
</div>
<div class="block" id="os">
	<h1>OS</h1>
</div>
<div class="block" id="data">
	<h1>Data</h1>
</div>
<div class="block" id="about">
	<h1>About</h1>
</div>
