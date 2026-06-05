import { RefluxAPI } from '@nightnetwork/reflux/api';
const api = new RefluxAPI();

export async function plugin() {
	await api.addPlugin({
		name: 'window.open.injection',
		sites: ['*'],
		function: `
    /* @browser */
    (function () {
      const TAB_MSG = '__galaxy_new_tab';
      // Scramjet virtualizes window.top and wraps window.postMessage, so a
      // BroadcastChannel (which it does NOT proxy) is the only reliable way to
      // reach the app from inside a proxied page. Both share the real origin.
      let bc = null;
      try { bc = new BroadcastChannel('galaxy_tabs'); } catch (e) {}
      const realOpen = window.open;
      window.open = function (url, name, features) {
        try {
          if (url && bc) {
            let absoluteUrl;
            try { absoluteUrl = new URL(url, location.href).href; }
            catch (e) { absoluteUrl = String(url); }
            bc.postMessage({ type: TAB_MSG, url: absoluteUrl });
          }
        } catch (e) { console.error('[galaxy] window.open hook failed', e); }
        // Stub WindowProxy so site code inspecting the return value
        // (.focus(), .close(), .location.href, ...) doesn't throw.
        let href = '';
        try { href = url ? new URL(url, location.href).href : ''; } catch (e) { href = String(url || ''); }
        const stub = {
          closed: false,
          opener: null,
          name: name || '',
          focus() {}, blur() {}, close() { stub.closed = true; },
          postMessage() {},
          location: { href: href, assign() {}, replace() {}, reload() {}, toString() { return href; } }
        };
        return stub;
      };
      // --- HTML new-tab vectors (no window.open call) ---
      // <a target="_blank">, <form target="_blank">, ctrl/cmd+click, middle-click.
      function sendTab(rawUrl, base) {
        let abs;
        try { abs = new URL(rawUrl, base || location.href).href; }
        catch (e) { abs = String(rawUrl || ''); }
        if (abs && bc) bc.postMessage({ type: TAB_MSG, url: abs });
      }
      function resolvedTarget(el) {
        let t = el.getAttribute && el.getAttribute('target');
        if (!t) {
          const base = document.querySelector('base[target]');
          if (base) t = base.getAttribute('target');
        }
        return t || '';
      }
      function skipHref(el) {
        const raw = (el.getAttribute && el.getAttribute('href')) || '';
        return !el.href || /^(javascript:|mailto:|tel:|#)/i.test(raw);
      }
      document.addEventListener('click', function (e) {
        const a = e.target && e.target.closest && e.target.closest('a[href]');
        if (!a || skipHref(a)) return;
        // new tab if target=_blank, or the user ctrl/cmd-clicked
        if (resolvedTarget(a) === '_blank' || e.ctrlKey || e.metaKey) {
          sendTab(a.href);
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
      document.addEventListener('auxclick', function (e) {
        if (e.button !== 1) return; // middle-click only
        const a = e.target && e.target.closest && e.target.closest('a[href]');
        if (!a || skipHref(a)) return;
        sendTab(a.href);
        e.preventDefault();
        e.stopPropagation();
      }, true);
      document.addEventListener('submit', function (e) {
        const f = e.target;
        if (!f || f.tagName !== 'FORM' || resolvedTarget(f) !== '_blank') return;
        let action = f.action || location.href;
        if ((f.method || 'get').toLowerCase() === 'get') {
          // carry the form fields as query params (POST bodies can't be conveyed via URL)
          try {
            const u = new URL(action, location.href);
            const params = new URLSearchParams(new FormData(f)).toString();
            if (params) u.search = params;
            action = u.href;
          } catch (e) {}
        }
        sendTab(action);
        e.preventDefault();
        e.stopPropagation();
      }, true);

      console.log('[galaxy] window.open + new-tab vectors installed (BroadcastChannel)');
    })();
    /* @/browser */
    return body;
  `
	});
	await api.enablePlugin('window.open.injection');
}
