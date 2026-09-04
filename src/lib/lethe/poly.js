import { codec } from './codec.js';

export function createCinnabarController() {
	const { CinnabarController } = window.$cinnabarLoadController();
	return new CinnabarController({
		files: {
			wasm: '/poly/polygon.wasm.wasm',
			all: '/poly/polygon.all.js',
			sync: '/poly/polygon.sync.js'
		},
		codec: {
			encode: codec.encode,
			decode: codec.decode
		}
	});
}
