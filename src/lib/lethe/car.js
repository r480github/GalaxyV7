export function getWispUrl(custom) {
	let protocol;
	if (custom) {
		return custom;
	} else {
		protocol = location.protocol === 'https:' ? 'wss' : 'ws';
		if (protocol === 'wss') {
			return `${protocol}://${location.host}/live/`;
		} else {
			return `${protocol}://${location.host}/live/`;
		}
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
				{ base: '/libbybutslightlyworse/index.mjs', wisp: wispUrl }
			]);
			break;
		case 'libcurl':
			await connection.setTransport('/reflux/index.mjs', [
				{ base: '/libby/index.mjs', wisp: wispUrl }
			]);
			break;
		case 'libcurlRaw':
			await connection.setTransport('/libby/index.mjs', [
				{ base: '/libby/index.mjs', wisp: wispUrl }
			]);
			break;
	}
}
