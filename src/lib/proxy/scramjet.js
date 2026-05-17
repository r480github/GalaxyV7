export function createScramjetController() {
	const { ScramjetController } = window.$scramjetLoadController();
	return new ScramjetController({
		files: {
			wasm: '/poly/polygon.wasm.wasm',
			all: '/poly/polygon.all.js',
			sync: '/poly/polygon.sync.js'
		}
	});
}
