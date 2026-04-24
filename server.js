import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { createServer } from 'node:http';
import { hostname } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { createBareServer } from '@tomphttp/bare-server-node';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { bareModulePath } from '@mercuryworkshop/bare-as-module3';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let svelteHandler = null;
try {
	({ handler: svelteHandler } = await import('./build/handler.js'));
} catch {}

const PROXY_PREFIXES = ['/uv/', '/epoxy/', '/libcurl/', '/bareasmodule/', '/baremux/', '/scram/'];

const bare = createBareServer('/bare/');
const app = Fastify({ logger: true });

await app.register(fastifyStatic, {
	root: uvPath,
	prefix: '/uv/',
	decorateReply: true
});

await app.register(fastifyStatic, {
	root: epoxyPath,
	prefix: '/epoxy/',
	decorateReply: false
});

await app.register(fastifyStatic, {
	root: libcurlPath,
	prefix: '/libcurl/',
	decorateReply: false
});

await app.register(fastifyStatic, {
	root: bareModulePath,
	prefix: '/bareasmodule/',
	decorateReply: false
});

await app.register(fastifyStatic, {
	root: baremuxPath,
	prefix: '/baremux/',
	decorateReply: false
});

await app.register(fastifyStatic, {
	root: path.join(__dirname, 'scramjet'),
	prefix: '/scram/',
	decorateReply: false
});

const server = createServer();

server.on('request', (req, res) => {
	try {
		if (bare.shouldRoute(req)) {
			bare.routeRequest(req, res);
		} else if (PROXY_PREFIXES.some((p) => req.url.startsWith(p))) {
			app.routing(req, res);
		} else if (svelteHandler) {
			svelteHandler(req, res);
		} else {
			res.statusCode = 404;
			res.end('Not found (dev mode — visit the Vite port instead)');
		}
	} catch (err) {
		console.error(err);
		res.statusCode = 500;
		res.end('Internal Server Error');
	}
});

server.on('upgrade', (req, socket, head) => {
	if (bare.shouldRoute(req)) {
		bare.routeUpgrade(req, socket, head);
	} else if (req.url.startsWith('/wisp/')) {
		wisp.routeRequest(req, socket, head);
	} else {
		socket.end();
	}
});

let port = parseInt(process.env.PORT || '');
if (isNaN(port)) port = 7070;

await app.ready();

server.listen({ port }, () => {
	const address = server.address();

	console.log('Listening on:');
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${address.family === 'IPv6' ? `[${address.address}]` : address.address}:${address.port}`
	);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
	console.log('SIGTERM signal received: closing HTTP server');
	server.close();
	bare.close();
	process.exit(0);
}
