import { loadScript } from './loader';
import { getWispUrl } from './car';

let controller;

function makeTransport(car, custom) {
	const wisp = getWispUrl(custom);
	if (car === 'epoxy') {
		const Epoxy = window.EpoxyTransport.default ?? window.EpoxyTransport;
		return new Epoxy({ wisp });
	}

	const Libcurl =
		window.LibcurlTransport.LibcurlClient ??
		window.LibcurlTransport.default ??
		window.LibcurlTransport;
	return new Libcurl({ wisp });
}

async function registerSW(path = '/sw.js') {
	const reg = await navigator.serviceWorker.register(path, {
		type: 'classic',
		updateViaCache: 'none'
	});
	await navigator.serviceWorker.ready;
	if (reg.active) return reg.active;
	const sw = reg.installing ?? reg.waiting;
	if (sw) {
		await new Promise((resolve) => {
			if (sw.state === 'activated') return resolve();
			sw.addEventListener('statechange', function onChange() {
				if (sw.state === 'activated') {
					sw.removeEventListener('statechange', onChange);
					resolve();
				}
			});
		});
		return reg.active ?? sw;
	}
	throw new Error('No service worker found');
}

export async function createPrismController(car = 'libcurl', customWisp) {
	if (controller) return controller;
	await loadScript('/api/api.js');
	await loadScript('/api/api.api.js');
	await loadScript(car === 'epoxy' ? '/api/epoxy.js' : '/api/libcurl.js');
	const transport = makeTransport(car, customWisp);
	await transport.init();
	const sw = await registerSW('/sw.js');
	const { Controller, config } = window.$scramjetController;
	config.scramjetPath = '/api/api.js';
	config.injectPath = '/api/api.inject.js';
	config.wasmPath = '/api/api.wasm';

	controller = new Controller({ serviceworker: sw, transport });
	await controller.wait();
	return controller;
}
export async function setPrismTransport(car, customWisp) {
	if (!controller) return;
	await loadScript(car === 'epoxy' ? '/api/epoxy.js' : '/api/libcurl.js');
	const transport = makeTransport(car, customWisp);
	await transport.init();
	controller.setTransport(transport);
}

export function getPrismController() {
	return controller;
}
