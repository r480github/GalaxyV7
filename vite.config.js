import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import sirv from 'sirv';
import { createBareServer } from '@tomphttp/bare-server-node';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { bareModulePath } from '@mercuryworkshop/bare-as-module3';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { server as wisp, logging } from '@mercuryworkshop/wisp-js/server';

const lethePlugin = () => ({
	name: 'lethe',
	configureServer(server) {
		const bare = createBareServer('/bare/');
		server.middlewares.use((req, res, next) => {
			if (bare.shouldRoute(req)) bare.routeRequest(req, res);
			else next();
		});
		server.middlewares.use('/epoxy', sirv(epoxyPath, { dev: true }));
		server.middlewares.use('/libcurl', sirv(libcurlPath, { dev: true }));
		server.middlewares.use('/bareasmodule', sirv(bareModulePath, { dev: true }));
		server.middlewares.use('/baremux', sirv(baremuxPath, { dev: true }));
		server.httpServer?.on('upgrade', (req, socket, head) => {
			if (bare.shouldRoute(req)) bare.routeUpgrade(req, socket, head);
			else if (req.url.endsWith('/wisp/')) wisp.routeRequest(req, socket, head);
		});
	}
});

export default defineConfig({
	plugins: [sveltekit(), lethePlugin()]
});
