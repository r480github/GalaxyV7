import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { createServer } from 'node:http';
import { hostname } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createBareServer } from '@tomphttp/bare-server-node';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { server as wisp, logging } from '@mercuryworkshop/wisp-js/server';
import { handler as svelteHandler } from './build/handler.js';

// scramjet on npm is outdated
// import { scramjetPath } from "@mercuryworkshop/scramjet";
// import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
const bare = createBareServer('/bare/');

const __dirname = dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
	serverFactory: (handler) => {
		const server = createServer();

		server.on('request', (req, res) => {
			if (bare.shouldRoute(req)) {
				bare.routeRequest(req, res);
			} else handler(req, res);
		});
		server.on('upgrade', (req, socket, head) => {
			if (bare.shouldRoute(req)) {
				bare.routeUpgrade(req, socket, head);
			} else if (req.url.endsWith('/wisp/')) {
				wisp.routeRequest(req, socket, head);
			} else socket.end();
		});

		return server;
	}
});

await fastify.register(fastifyStatic, {
	root: join(__dirname, 'glass'),
	prefix: '/glass/',
	decorateReply: false
});
await fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: '/epoxy/',
	decorateReply: false
});
await fastify.register(fastifyStatic, {
	root: libcurlPath,
	prefix: '/libcurl/',
	decorateReply: false
});
await fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: '/baremux/',
	decorateReply: false
});
await fastify.register(fastifyStatic, {
	root: join(__dirname, 'poly'),
	prefix: '/poly/',
	decorateReply: false
});
fastify.all('/*', (req, reply) => {
	svelteHandler(req.raw, reply.raw, () => reply.callNotFound());
});

let port = parseInt(process.env.PORT || '');

if (isNaN(port)) port = 8080;

fastify.server.on('listening', () => {
	const address = fastify.server.address();

	console.log('Listening on:');
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${
			address.family === 'IPv6' ? `[${address.address}]` : address.address
		}:${address.port}`
	);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
	console.log('SIGTERM signal received: closing HTTP server');
	fastify.close();
	bare.close();
	process.exit(0);
}

await fastify.listen({ port, host: '0.0.0.0' });
