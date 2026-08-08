<script>
	let { text } = $props();

	const keywords =
		/(proxies|proxy|games?|browser|unblock\w*|scramjet|roblox|youtube|discord|spotify|wisp|vpn|proxied)|ultraviolet	/gi;

	const parts = $derived.by(() => {
		const out = [];
		let last = 0;
		for (const match of text.matchAll(keywords)) {
			out.push({ plain: text.slice(last, match.index) });
			const word = match[0];
			const half = Math.ceil(word.length / 2);
			out.push({ head: word.slice(0, half), tail: word.slice(half) });
			last = match.index + word.length;
		}
		out.push({ plain: text.slice(last) });
		return out;
	});
</script>

{#each parts as part, i (i)}{#if part.plain !== undefined}{part.plain}{:else}{part.head}<span
			class="filler"
			aria-hidden="true">676767</span
		>{part.tail}{/if}{/each}