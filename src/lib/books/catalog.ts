import type { Game } from './types';
import { GAMES_BASE } from './config';

const BASE = GAMES_BASE.replace(/\/+$/, '');

/** Root of the asset repo, as served out of `static/`. */
const BOOKS_ROOT = '/books';
/** Playable html lives at `gmes/<slug>/index.html`; thumbs are already root-relative. */
const GAMES_DIR = 'gmes';

export function asset(path: string): string {
	if (!path) return path;
	if (/^https?:\/\//i.test(path)) return path;
	return BASE + (path.startsWith('/') ? path : `/${path}`);
}

/** Resolve a path the catalog gives us relative to the asset repo root. */
function fromRoot(path: string): string {
	if (/^https?:\/\//i.test(path)) return path;
	return asset(`${BOOKS_ROOT}/${path.replace(/^\/+/, '')}`);
}

export const CATALOG_URL = fromRoot('gmes.json');

interface RawGame {
	file_name?: string;
	title?: string;
	thumb?: string | null;
	thumb_error?: string;
}

/** `10-bullets/index.html` -> `10-bullets` */
function slugOf(fileName: string): string {
	return fileName.replace(/index\.html?$/i, '').replace(/^\/+|\/+$/g, '');
}

export function normalize(raw: RawGame[]): Game[] {
	const seen = new Set<string>();
	const games: Game[] = [];

	for (const z of raw ?? []) {
		if (!z?.file_name || !z?.title) continue;

		// The slug doubles as a stable id, so favorites and history survive a catalog refresh.
		const id = slugOf(z.file_name);
		if (!id || seen.has(id)) continue;
		seen.add(id);

		games.push({
			id,
			name: z.title,
			thumb: z.thumb ? fromRoot(z.thumb) : '',
			url: fromRoot(`${GAMES_DIR}/${z.file_name}`),
			tags: []
		});
	}

	return games;
}

export async function loadCatalog(fetchFn: typeof fetch = fetch): Promise<Game[]> {
	const res = await fetchFn(CATALOG_URL);
	if (!res.ok) throw new Error(`Failed to load catalog (${res.status})`);
	return normalize(await res.json());
}

export function collectTags(games: Game[]): string[] {
	return [...new Set(games.flatMap((g) => g.tags))].sort((a, b) => a.localeCompare(b));
}
