export function getWispUrl(custom) {
	let protocol;
	if (custom) {
		return custom;
	} else {
		protocol = location.protocol === 'https:' ? 'wss' : 'ws';
		return `${protocol}://${location.host}/wisp/`;
	}
}

export function createConnection() {
	return new window.BareMux.BareMuxConnection('/charon/worker.js');
}

export async function setCar(connection, car, custom) {
	const wispUrl = getWispUrl(custom);

	switch (car) {
		case 'epoxy':
			await connection.setTransport('/reflux/index.mjs', [
				{ base: '/epoxy/index.mjs', wisp: wispUrl }
			]);
			break;
		case 'libcurl':
			await connection.setTransport('/libcurl/index.mjs', [
				{ base: '/libcurl/index.mjs', wisp: wispUrl }
			]);
			break;
	}
}
