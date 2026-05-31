export function getWispUrl(custom) {
	let protocol;
	if (custom) {
		return custom;
	} else {
		protocol = location.protocol === 'https:' ? 'wss' : 'ws';
		return `${protocol}://${location.host}/wisp/`;
	}
}

export function getBareUrl() {
	return `${location.origin}/bare/`;
}

export function createConnection() {
	return new window.BareMux.BareMuxConnection('/charon/worker.js');
}

export async function setCar(connection, car, custom) {
	const wispUrl = getWispUrl(custom);
	const bareUrl = getBareUrl();

	switch (car) {
		case 'epoxy':
			await connection.setTransport('/reflux/index.mjs', [
				{ base: '/epoxy/index.mjs', wisp: wispUrl }
			]);
			break;
		case 'libcurl':
			await connection.setTransport('/reflux/index.mjs', [
				{ base: '/libcurl/index.mjs', websocket: wispUrl }
			]);
			break;
	}
}
