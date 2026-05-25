export interface Game {
	id: number;
	name: string;
	cover: string;
	thumb: string;
	url: string;
	tags: string[];
	author?: string;
	authorLink?: string;
}

export interface VisitEntry {
	type: string;
	id: number;
	name: string;
	icon: string;
	visits: number;
	lastVisit: number;
}
