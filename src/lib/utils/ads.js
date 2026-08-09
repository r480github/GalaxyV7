// ADSTERRA
let sites = [
	'https://anniversaryvacuumambassador.com/x4dn9h4s?key=c699d9e35690591ad7ebbe3169927277',
	'https://anniversaryvacuumambassador.com/qmuwvuisc?key=5ef550220dc06c192c728535a977a4ee',
	'https://anniversaryvacuumambassador.com/vymh1yx6g?key=be3af0d5c1aae1d4c21dd02bf589b5e4',
	'https://www.effectivecpmnetwork.com/dnjar020?key=9ca419f0d3556c4514d16bce61a1601b',
	'https://www.effectivecpmnetwork.com/ct51z7sww7?key=114a461e6bf49215b9dbff9b6d35ba4e',
	'https://www.effectivecpmnetwork.com/x6jqru9y?key=36f77b48f0bb7067c5e26817d846f6ea',
	'https://www.effectivecpmnetwork.com/z2cnbsn0?key=2947362c6a3e8692fd3fcf327f4a1161',
	'https://anniversaryvacuumambassador.com/dt7mdhmv?key=720d64ad938d14c4a520016af13426b9',
	'https://anniversaryvacuumambassador.com/tfnzmw04d7?key=218fa9193efb5c35b078bebbb7b5acd6',
	'https://www.effectivecpmnetwork.com/v5j7rdfxcy?key=6049e877ad11fdf217761b03e100e797'
];

export function launchAds() {
	if (location.hostname.includes('localhost')) {
		return;
	} else {
		let i = Math.floor(Math.random() * sites.length);
		let newTab = window.open(sites[i]);

		if (newTab) {
			newTab.opener = null;
		}

		document.removeEventListener('mousedown', launchAds);
	}
}
