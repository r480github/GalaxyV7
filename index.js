import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { createServer } from 'node:http';
import { hostname } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { refluxPath } from '@nightnetwork/reflux';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { server as wisp, logging } from '@mercuryworkshop/wisp-js/server';
import { handler as svelteHandler } from './build/handler.js';
wisp.options.dns_servers = ['94.140.14.14', '94.140.15.15'];
wisp.options.dns_method = 'resolve';
wisp.options.dns_result_order = 'ipv4first';
wisp.options.hostname_blacklist = [];
// /google\.com/, /reddit\.com/
// scramjet on npm is outdated
// import { scramjetPath } from "@mercuryworkshop/scramjet";
// import { uvPath } from "@titaniumnetwork-dev/ultraviolet";

const __dirname = dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
	serverFactory: (handler) => {
		const server = createServer();
		server.on('request', (req, res) => {
			handler(req, res);
		});
		server.on('upgrade', (req, socket, head) => {
			if (req.url.endsWith('/wisp/')) {
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
	root: refluxPath,
	prefix: '/reflux/',
	decorateReply: false
});
await fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: '/charon/',
	decorateReply: false
});
await fastify.register(fastifyStatic, {
	root: join(__dirname, 'poly'),
	prefix: '/poly/',
	decorateReply: false
});
await fastify.register(fastifyStatic, {
	root: join(__dirname, 'prism'),
	prefix: '/prism/',
	decorateReply: false
});
fastify.all('/*', (req, reply) => {
	svelteHandler(req.raw, reply.raw, () => reply.callNotFound());
});

let port = parseInt(process.env.PORT || '');

if (isNaN(port)) port = 5417;

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

function shutdown(signal) {
	console.log(`${signal} received: closing HTTP server`);
	fastify.close().then(
		() => process.exit(0),
		() => process.exit(1)
	);
}

await fastify.listen({ port, host: '0.0.0.0' });

