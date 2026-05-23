<script>
	import '$lib/style/main.css';
	import { browser } from '$app/environment';
	import gsap from 'gsap';
	import { onMount } from 'svelte';
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
			duration: 0.2,
			stagger: 0.04,
			onComplete: () => {
				mode = selected;
			}
		});
	}
	onMount(() => {
		gsap.fromTo(
			'.question',
			{
				y: 50,
				opacity: 0
			},
			{
				y: 0,
				opacity: 1,
				duration: 0.4,
				onComplete: () => {   
					gsap.fromTo(
						'.option',
						{
							y: 50,
							opacity: 0
						},
						{
							y: 0,
							opacity: 1,
							duration: 0.3,
							stagger: 0.08
						}
					);
				}
			}
		);
	});
</script>

{#if mode == null}
	<div class="container">
		<h1 class="stagger question">How would you like to use Galaxy?</h1>

		<div class="options">
			<button
				class="option stagger"
				class:active={selected === 'os'}
				onclick={() => choose('os')}
        style="opacity:0;"
			>
				<h2>OS Mode</h2>
			</button>

			<button
				class="option stagger"
				class:active={selected === 'website'}
				onclick={() => choose('website')}
        style="opacity:0;"
			>
				<h2>Website Mode</h2>
			</button>
		</div>

		{#if selected}
			<button class="continue stagger" onclick={() => next()}> <p>Continue</p> </button>
		{/if}
	</div>
{:else if mode === 'os'}
	{(location.href = '/os')}
{:else if mode === 'website'}
	{(location.href = '/website')}
{/if}

<style>
	:global(body) {
		margin: 0;
		background: var(--color-bg);
		color: var(--color-text);
	}
</style>
