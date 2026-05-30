<script>
	import '$lib/style/main.css';
	import { browser } from '$app/environment';
	import gsap from 'gsap';
	import { onMount } from 'svelte';
	import { tick } from 'svelte';

	let percentage = $state(0);
	let loaded = $state(false);
	let selected = $state(null);
	let mode = $state(null);

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
				if (selected === 'os') location.href = '/os';
				else if (selected === 'website') location.href = '/books';
			}
		});
	}

	async function afterLoad() {
		const savedMode = localStorage.getItem('mode');
		if (savedMode === 'os') {
			location.href = '/os';
		} else if (savedMode === 'website') {
			location.href = '/books';
		} else {
			loaded = true;
			await tick();
			gsap.fromTo(
				'.question',
				{ y: 50, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 0.4,
					onComplete: () => {
						gsap.fromTo(
							'.option',
							{ y: 50, opacity: 0 },
							{ y: 0, ease: 'power1.out', opacity: 1, duration: 0.3, stagger: 0.08 }
						);
					}
				}
			);
		}
	}

	onMount(() => {
		const obj = { value: 0 };
		gsap.to(obj, {
			value: 100,
			duration: 2,
			ease: 'power4.inOut',
			onUpdate() {
				percentage = Math.round(obj.value);
			},
			onComplete() {
				gsap.to('.heroDiv', {
					duration: 0.5,
					ease: 'power4.in',
					y: -100,
					stagger: 0.07,
					opacity: 0,
					onComplete: afterLoad
				});
			}
		});

		gsap.fromTo(
			'.loadBar',
			{ scaleX: 0 },
			{ scaleX: 1, duration: 2, opacity: 1, ease: 'power4.inOut' }
		);
	});
</script>

{#if !loaded}
	<div class="hero">
		<div class="loader">
			<div class="info">
				<p class="loading heroDiv">Loading</p>
				<p class="percentage heroDiv">{percentage}%</p>
			</div>
			<div class="loadBg heroDiv">
				<div class="loadBar"></div>
			</div>
		</div>
	</div>
{:else if mode == null}
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
				<h2>Ga<span class="filler">ha67</span>mes Only</h2>
			</button>
		</div>

		{#if selected}
			<button class="continue stagger" onclick={() => next()}><p>Continue</p></button>
		{/if}
	</div>
{/if}

<style>
	:global(body) {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		margin: 0;
		background-color: var(--color-bg);
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		overflow: hidden;
	}

	.loader {
		margin-top: 5px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		width: 300px;
	}

	.loadBg {
		width: 100%;
		height: 2px;
		border-radius: 999px;
		background-color: var(--color-surface-3);
		overflow: hidden;
	}
	.info {
		display: flex;
		text-align: center;
		flex-direction: row;
		align-items: space-between;
		width: 100%;
	}
	.loadBar {
		height: 100%;
		opacity: 0;
		border-radius: 999px;
		background-color: var(--color-text);
		transform-origin: left center;
	}

	.percentage,
	.loading {
		font-size: 10px;
		width: 36px;
		text-align: right;
		margin: 0;
		opacity: 0.8;
	}
	.loading {
		margin-right: auto;
		opacity: 0.6;
	}
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
	}

	.question {
		font-family: gravity;
		font-weight: 200;
		margin: 0;
	}

	.options {
		display: flex;
		gap: 16px;
	}

	.option {
		cursor: pointer;
	}

	.option.active {
		outline: 1px solid var(--color-border);
	}

	.continue {
		cursor: pointer;
	}
</style>
