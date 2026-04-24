import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/bare': { target: 'http://localhost:7070', ws: true },
			'/wisp': { target: 'ws://localhost:7070', ws: true },
			'/uv': 'http://localhost:7070',
			'/epoxy': 'http://localhost:7070',
			'/libcurl': 'http://localhost:7070',
			'/bareasmodule': 'http://localhost:7070',
			'/baremux': 'http://localhost:7070',
			'/scram': 'http://localhost:7070'
		}
	}
});
