import type { Game } from './types';
import { GAMES_BASE } from './config';

const BASE = GAMES_BASE.replace(/\/+$/, '');

const BOOKS_ROOT = '/books';
const GAMES_DIR = 'gmes';

export function asset(path: string): string {
	if (!path) return path;
	if (/^https?:\/\//i.test(path)) return path;
	return BASE + (path.startsWith('/') ? path : `/${path}`);
}

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
	tags?: string[] | null;
}

const TAG_LABELS: Record<string, string> = { rpg: 'RPG' };

export function formatTag(tag: string): string {
	if (TAG_LABELS[tag]) return TAG_LABELS[tag];
	return tag
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(' ');
}

function slugOf(fileName: string): string {
	return fileName.replace(/index\.html?$/i, '').replace(/^\/+|\/+$/g, '');
}

export function normalize(raw: RawGame[]): Game[] {
	const seen = new Set<string>();
	const games: Game[] = [];

	for (const z of raw ?? []) {
		if (!z?.file_name || !z?.title) continue;

		const id = slugOf(z.file_name);
		if (!id || seen.has(id)) continue;
		seen.add(id);

		games.push({
			id,
			name: z.title,
			thumb: z.thumb ? fromRoot(z.thumb) : '',
			url: fromRoot(`${GAMES_DIR}/${z.file_name}`),
			tags: (z.tags ?? []).filter((t): t is string => typeof t === 'string' && t !== '')
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
	const counts = new Map<string, number>();
	for (const game of games) {
		for (const tag of game.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}

	return [...counts.keys()].sort(
		(a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b)
	);
}
