<script>
	import { activeTab, reloadSignal, goBackSignal, goForwardSignal } from '$lib/stores/index.js';
	import { getOriginalUrl } from '$lib/lethe/decode';
	import { newTabEventName, newTabQueueName } from '$lib/lethe/reflux';
	let { id, src = null, onnavigate, onnewtab } = $props();
	let frame;

	function reportUrl() {
		try {
			const loc = frame.contentWindow.location;
			const stripped = loc.pathname + loc.search + loc.hash;
			const url = getOriginalUrl(stripped);
			const title = frame.contentWindow.document.title || url;
			onnavigate?.({ url, title });
		} catch (e) {}
	}

	function frameBase(targetWindow) {
		try {
			const frameLocation = targetWindow.location;
			const strippedPath = frameLocation.pathname + frameLocation.search + frameLocation.hash;
			const decodedUrl = getOriginalUrl(strippedPath);
			if (decodedUrl) {
				return decodedUrl;
			}
			return frameLocation.href;
		} catch (error) {
			return undefined;
		}
	}

	function toRealUrl(targetWindow, rawUrl) {
		if (!rawUrl) {
			return '';
		}
		try {
			const absoluteUrl = new URL(rawUrl, targetWindow.location.href);
			const strippedPath = absoluteUrl.pathname + absoluteUrl.search + absoluteUrl.hash;
			const decodedUrl = getOriginalUrl(strippedPath);
			let looksLikeHttp = false;
			if (decodedUrl) {
				const lowerDecodedUrl = decodedUrl.toLowerCase();
				if (lowerDecodedUrl.indexOf('http://') === 0) {
					looksLikeHttp = true;
				}
				if (lowerDecodedUrl.indexOf('https://') === 0) {
					looksLikeHttp = true;
				}
			}
			if (looksLikeHttp) {
				return decodedUrl;
			}
		} catch (error) {}
		try {
			const baseUrl = frameBase(targetWindow);
			const resolvedUrl = new URL(rawUrl, baseUrl);
			return resolvedUrl.href;
		} catch (error) {
			return String(rawUrl);
		}
	}
	function installHostInterception(targetWindow) {
		try {
			if (!targetWindow) {
				return;
			}
			if (targetWindow.__galaxyHostHooked) {
				return;
			}
			targetWindow.__galaxyHostHooked = true;

			function openTabForUrl(rawUrl) {
				const realUrl = toRealUrl(targetWindow, rawUrl);
				if (realUrl) {
					if (onnewtab) {
						onnewtab(realUrl);
					}
				}
			}

			function dud() {}

			function dudWindow() {
				const fakeWindow = {
					closed: false,
					focus: dud,
					blur: dud,
					close() {
						this.closed = true;
					},
					postMessage: dud,
					moveTo: dud,
					resizeTo: dud,
					document: { write: dud, writeln: dud, close: dud, open: dud },
					location: { href: '', replace: dud, assign: dud }
				};
				return fakeWindow;
			}

			try {
				targetWindow.open = function (url) {
					openTabForUrl(url);
					return dudWindow();
				};
			} catch (error) {}

			try {
				let anchorPrototype = null;
				if (targetWindow.HTMLAnchorElement) {
					anchorPrototype = targetWindow.HTMLAnchorElement.prototype;
				}
				if (anchorPrototype && !anchorPrototype.__galaxyClickHooked) {
					anchorPrototype.__galaxyClickHooked = true;
					const originalAnchorClick = anchorPrototype.click;
					anchorPrototype.click = function () {
						try {
							if (this && this.target === '_blank' && this.href) {
								openTabForUrl(this.href);
								return;
							}
						} catch (error) {}
						return originalAnchorClick.apply(this, arguments);
					};
				}
			} catch (error) {}

			const frameDocument = targetWindow.document;
			function hrefFinder(node) {
				if (!node) {
					return null;
				}
				if (!node.closest) {
					return null;
				}
				return node.closest('a[href]');
			}

			frameDocument.addEventListener(
				'click',
				function (clickEvent) {
					if (clickEvent.defaultPrevented) {
						return;
					}
					if (clickEvent.button !== 0) {
						return;
					}
					const link = hrefFinder(clickEvent.target);
					if (!link) {
						return;
					}
					let opensNewTab = false;
					if (link.target === '_blank') {
						opensNewTab = true;
					}
					if (clickEvent.ctrlKey) {
						opensNewTab = true;
					}
					if (clickEvent.metaKey) {
						opensNewTab = true;
					}
					if (!opensNewTab) {
						return;
					}
					clickEvent.preventDefault();
					clickEvent.stopPropagation();
					openTabForUrl(link.href);
				},
				true
			);

			frameDocument.addEventListener(
				'auxclick',
				function (auxClickEvent) {
					if (auxClickEvent.button !== 1) {
						return;
					}
					const link = hrefFinder(auxClickEvent.target);
					if (!link) {
						return;
					}
					auxClickEvent.preventDefault();
					auxClickEvent.stopPropagation();
					openTabForUrl(link.href);
				},
				true
			);

			frameDocument.addEventListener(
				'mousedown',
				function (mouseDownEvent) {
					if (mouseDownEvent.button !== 1) {
						return;
					}
					const link = hrefFinder(mouseDownEvent.target);
					if (!link) {
						return;
					}
					mouseDownEvent.preventDefault();
				},
				true
			);

			frameDocument.addEventListener(
				'submit',
				function (submitEvent) {
					const form = submitEvent.target;
					if (!form) {
						return;
					}
					if (form.target !== '_blank') {
						return;
					}
					submitEvent.preventDefault();
					submitEvent.stopPropagation();
					let formAction = form.action;
					if (!formAction) {
						formAction = targetWindow.location.href;
					}
					openTabForUrl(formAction);
				},
				true
			);
		} catch (error) {}
	}

	function handleLoad() {
		reportUrl();
		try {
			const win = frame.contentWindow;
			installHostInterception(win);
			win.addEventListener('popstate', reportUrl);
			win.addEventListener('hashchange', reportUrl);
			const titleEl = win.document.querySelector('title');
			if (titleEl) {
				const titleObserver = new MutationObserver(reportUrl);
				titleObserver.observe(titleEl, { childList: true });
			}
			const pendingUrls = win[newTabQueueName];
			if (Array.isArray(pendingUrls)) {
				while (pendingUrls.length > 0) {
					const pendingUrl = pendingUrls.shift();
					if (onnewtab) {
						onnewtab(pendingUrl);
					}
				}
			}
	
			if (!win.__galaxyNewTabBound) {
				win.__galaxyNewTabBound = true;
				win.addEventListener(newTabEventName, function (messageEvent) {
					let newTabUrl = undefined;
					if (messageEvent && messageEvent.detail) {
						newTabUrl = messageEvent.detail.url;
					}
					if (onnewtab) {
						onnewtab(newTabUrl);
					}
				});
			}
		} catch (e) {}
	}

	$effect(() => {
		if ($goBackSignal === id) {
			try {
				frame.contentWindow.history.back();
			} catch (e) {}
			$goBackSignal = null;
		}
		if ($goForwardSignal === id) {
			try {
				frame.contentWindow.history.forward();
			} catch (e) {}
			$goForwardSignal = null;
		}
		if ($reloadSignal === id) {
			try {
				frame.contentWindow.location.reload();
			} catch (e) {}
			$reloadSignal = null;
		}
	});
</script>

<iframe
	bind:this={frame}
	{src}
	onload={handleLoad}
	frameborder="0"
	style="display: {id === $activeTab ? 'block' : 'none'};"
></iframe>

<style>
	iframe {
		width: 100%;
		height: 100%;
		border: none;
	}
</style>
