import { browser } from '$app/environment';

const KEY = 'endis_gameFavorites';

function read(): number[] {
	if (!browser) return [];
	try {
		const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

class FavoritesStore {
	ids = $state<number[]>(read());

	has(id: number): boolean {
		return this.ids.includes(id);
	}

	toggle(id: number): void {
		const i = this.ids.indexOf(id);
		if (i > -1) this.ids.splice(i, 1);
		else this.ids.push(id);
		this.#save();
	}

	#save(): void {
		if (!browser) return;
		try {
			localStorage.setItem(KEY, JSON.stringify(this.ids));
		} catch {
			return;
		}
	}
}

export const favorites = new FavoritesStore();
