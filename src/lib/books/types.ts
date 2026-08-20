export interface Game {
	/** Folder slug from the asset repo, e.g. `10-bullets`. Stable across catalog updates. */
	id: string;
	name: string;
	thumb: string;
	url: string;
	tags: string[];
}

export interface VisitEntry {
	type: string;
	id: string;
	name: string;
	icon: string;
	visits: number;
	lastVisit: number;
}
