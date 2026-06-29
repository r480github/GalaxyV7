<script>
	import '$lib/style/settings.css';
	import Pref from '$lib/utils/settings/pref.svelte';
	import Themes from '$lib/utils/settings/themes.svelte';
	import Pro from '$lib/utils/settings/pro.svelte';
	import Os from '$lib/utils/settings/os.svelte';
	const stuffs = [
		{ name: 'Preferences', id: 'pref' },
		{ name: 'Themes', id: 'themes' },
		{ name: 'Pro', nametwo: 'xy', id: 'pro' },
		{ name: 'OS', id: 'os' },
		{ name: 'Data', id: 'data' },
		{ name: 'About', id: 'about' }
	];
</script>

{#snippet navItems(name, part = '', id)}
	<button
		class="navBtn"
		onclick={() => {
			document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
		}}><p>{name}<span class="filler">ha67</span>{part}</p></button
	>
{/snippet}
<div class="nav">
	{#each stuffs as stuff}
		{@render navItems(stuff.name, stuff.nametwo, stuff.id)}
	{/each}
</div>
<div class="block" id="pref"><Pref /></div>
<div class="block" id="themes">
	<Themes />
</div>
<div class="block" id="pro">
	<h1>Pro<span class="filler">ha67</span>xy</h1>
	<Pro />
</div>
<div class="block" id="os">
	<Os />
</div>
<div class="block" id="data">
	<h1>Data</h1>
</div>
<div class="block" id="about">
	<h1>About</h1>
</div>
