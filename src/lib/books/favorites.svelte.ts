import { browser } from '$app/environment';

const KEY = 'endis_gameFavorites';

function read(): string[] {
	if (!browser) return [];
	try {
		const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
		if (!Array.isArray(parsed)) return [];
		// Older builds stored catalog indexes; those no longer point at anything.
		return parsed.filter((v): v is string => typeof v === 'string');
	} catch {
		return [];
	}
}

class FavoritesStore {
	ids = $state<string[]>(read());

	has(id: string): boolean {
		return this.ids.includes(id);
	}

	toggle(id: string): void {
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
