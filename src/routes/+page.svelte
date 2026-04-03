<script>
	import '$lib/style/main.css';
	import { browser } from '$app/environment';
	import gsap from 'gsap';
	let selected = $state(null);
	let mode = $state(browser ? localStorage.getItem('mode') : null);

	function choose(m) {
		selected = m;
		localStorage.setItem('mode', m);
	}
	function next() {
		gsap.to('.stagger', {
      y: -50,
      opacity: 0,
      duration: 0.3,
      stagger: 0.04,
			onComplete: () => {
				mode = selected;
			}
		});
	}
</script>
{#if mode == null}
<div class="container">
	<h1 class="stagger">How would you like to use Galaxy?</h1>

	<div class="options">
		<button class="option stagger" class:active={selected === 'os'} onclick={() => choose('os')}>
			<h2>OS Mode</h2>
		</button>

		<button class="option stagger" class:active={selected === 'website'} onclick={() => choose('website')}>
			<h2>Website Mode</h2>
		</button>
	</div>

	{#if selected}
		<button class="continue stagger" onclick={() => next()}> Continue </button>
	{/if}
</div>
{:else if mode === 'os'}
  <p>OS Mode Selected</p>
{:else if mode === 'website'}
  <p>Website Mode Selected</p>
{/if}

<style>
	:global(body) {
		margin: 0;
		background: #0a0a0a;
		color: #e0e0e0;
	}
</style>
