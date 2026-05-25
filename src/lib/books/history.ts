import { browser } from '$app/environment';
import type { VisitEntry } from './types';

const KEY = 'endis_visitHistory';
const MAX = 50;

export function trackVisit(type: string, id: number, name: string, icon: string): void {
	if (!browser) return;
	try {
		const history: VisitEntry[] = JSON.parse(localStorage.getItem(KEY) || '[]');
		const existing = history.find((h) => h.type === type && h.id === id);
		if (existing) {
			existing.visits = (existing.visits || 0) + 1;
			existing.lastVisit = Date.now();
		} else {
			history.push({ type, id, name, icon, visits: 1, lastVisit: Date.now() });
		}
		history.sort((a, b) => b.visits - a.visits);
		localStorage.setItem(KEY, JSON.stringify(history.slice(0, MAX)));
	} catch {
		return;
	}
}
