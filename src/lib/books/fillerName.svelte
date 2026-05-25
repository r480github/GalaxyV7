<script lang="ts">
	let { text }: { text: string } = $props();

	type Segment = { chunk: string; filler: string | null };

	const segments = $derived.by<Segment[]>(() => {
		const out: Segment[] = [];
		for (let i = 0; i < text.length; i += 2) {
			const last = i + 2 >= text.length;
			out.push({
				chunk: text.slice(i, i + 2),
				filler: last ? null : Math.random().toString(36).slice(2, 6)
			});
		}
		return out;
	});
</script>

{#each segments as s, i (i)}{s.chunk}{#if s.filler}<span class="filler" aria-hidden="true">{s.filler}</span>{/if}{/each}

<style>
	.filler {
		position: absolute;
		opacity: 0;
		pointer-events: none;
		user-select: none;
	}
</style>
