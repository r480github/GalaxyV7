import type { Action } from 'svelte/action';

export const intersect: Action<HTMLElement, () => void> = (node, onIntersect) => {
	let callback = onIntersect;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) callback?.();
			}
		},
		{ rootMargin: '200px' }
	);
	observer.observe(node);

	return {
		update(next) {
			callback = next;
		},
		destroy() {
			observer.disconnect();
		}
	};
};
