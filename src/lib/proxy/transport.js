export function getWispUrl() {
	const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
	return `${protocol}://${location.host}/wisp/`;
}

export function getBareUrl() {
	return `${location.origin}/bare/`;
}

export function createConnection() {
	return new window.BareMux.BareMuxConnection('/baremux/worker.js');
}

export async function setTransport(connection, transport) {
	const wispUrl = getWispUrl();
	const bareUrl = getBareUrl();

	switch (transport) {
		case 'epoxy':
			await connection.setTransport('/epoxy/index.mjs', [{ wisp: wispUrl }]);
			break;
		case 'libcurl':
			await connection.setTransport('/libcurl/index.mjs', [{ websocket: wispUrl }]);
			break;
		case 'default':
			await connection.setTransport('/bareasmodule/index.mjs', [bareUrl]);
			break;
	}
}
