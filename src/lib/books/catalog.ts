import type { Game } from './types';
import { GAMES_BASE } from './config';
import { decodeName } from './obfuscate';

const BASE = GAMES_BASE.replace(/\/+$/, '');

export function asset(path: string): string {
	if (!path) return path;
	if (/^https?:\/\//i.test(path)) return path;
	return BASE + (path.startsWith('/') ? path : `/${path}`);
}

export const CATALOG_URL = asset('/books/books.json');

interface RawGame {
	id?: number;
	name?: string;
	cover?: string;
	thumb?: string;
	url?: string;
	special?: string[];
	author?: string;
	authorLink?: string;
}

export function normalize(raw: RawGame[]): Game[] {
	let list = raw.map((z) => (z?.name ? { ...z, name: decodeName(z.name) } : z));
	if (list.length > 0 && list[0]?.name?.includes('SUGGEST')) {
		list = list.slice(1);
	}

	return list
		.filter((z): z is RawGame & { name: string; url: string } => Boolean(z?.name && z?.url))
		.map((z, idx) => ({
			id: idx,
			name: z.name,
			cover: asset(z.cover ?? ''),
			thumb: asset(z.thumb || z.cover || ''),
			url: asset(z.url),
			tags: z.special ?? [],
			author: z.author,
			authorLink: z.authorLink
		}));
}

export async function loadCatalog(fetchFn: typeof fetch = fetch): Promise<Game[]> {
	const res = await fetchFn(CATALOG_URL);
	if (!res.ok) throw new Error(`Failed to load catalog (${res.status})`);
	return normalize(await res.json());
}

export function collectTags(games: Game[]): string[] {
	return [...new Set(games.flatMap((g) => g.tags))].sort((a, b) => a.localeCompare(b));
}
