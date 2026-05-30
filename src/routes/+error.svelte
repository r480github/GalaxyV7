<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	const status = $page.status;

	const messages = {
		404: { title: 'Lost in space', sub: "That page doesn't exist — or maybe it never did." },
		403: { title: 'Off limits', sub: "You're not supposed to be here." },
		500: { title: 'Something exploded', sub: 'A server-side gremlin caused this. Not your fault.' }
	};

	const info = messages[status] ?? { title: 'Unknown error', sub: 'Something went wrong.' };

	onMount(() => {
		gsap.fromTo('.err-wrap', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
	});
</script>

<div class="wrap">
	<div class="err-wrap">
		<p class="code">{status}</p>
		<h1>{info.title}</h1>
		<p class="sub">{info.sub}</p>
		<a href="/" class="home-btn">take me home</a>
	</div>
</div>

<style>
	.wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--color-bg);
	}

	.err-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-align: center;
	}

	.code {
		font-family: var(--font-family-display);
		font-size: 0.8rem;
		letter-spacing: 0.2em;
		color: var(--color-text-subtle);
		margin: 0;
	}

	h1 {
		font-family: var(--font-family-heading);
		font-size: 2rem;
		font-weight: 600;
		color: var(--color-white);
		margin: 0;
	}

	.sub {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin: 0;
		max-width: 300px;
	}

	.home-btn {
		margin-top: 1rem;
		font-family: var(--font-family-display);
		font-size: 0.85rem;
		color: var(--color-text-subtle);
		text-decoration: none;
	}

	.home-btn:hover {
		color: var(--color-text);
	}
</style>
