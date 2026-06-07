import { RefluxAPI } from '@nightnetwork/reflux/api';
const api = new RefluxAPI();

export const newTabEventName = '__galaxyNewTab';
export const newTabQueueName = '__galaxyPendingNewTabs';

export async function plugin() {
	await api.addPlugin({
		name: 'windowOpen',
		sites: ['*'],
		function: `
    /* @browser */
    (function () {
      if (window.__galaxyWindowOpenHooked) {
        return;
      }
      window.__galaxyWindowOpenHooked = true;

      let eventName = ${JSON.stringify(newTabEventName)};
      let queueName = ${JSON.stringify(newTabQueueName)};

      function deliveryTarget() {
        try {
          let topWindow = window.top;
          if (topWindow) {
            return topWindow;
          }
          return window;
        } catch (error) {
          return window;
        }
      }
      function emitNewTab(rawUrl) {
        if (!rawUrl) {
          return;
        }
        let realUrl;
        try {
          let resolvedUrl = new URL(rawUrl, location.href);
          realUrl = resolvedUrl.href;
        } catch (error) {
          realUrl = String(rawUrl);
        }

        let targetWindow = deliveryTarget();
        try {
          if (!targetWindow[queueName]) {
            targetWindow[queueName] = [];
          }
          targetWindow[queueName].push(realUrl);
        } catch (error) {
        }

        try {
          let newTabEvent = new CustomEvent(eventName, { detail: { url: realUrl } });
          targetWindow.dispatchEvent(newTabEvent);
        } catch (error) {
          try {
            let fallbackEvent = new CustomEvent(eventName, { detail: { url: realUrl } });
            window.dispatchEvent(fallbackEvent);
          } catch (anotherError) {
          }
        }
      }

      function dud() {
      }

      function dudWindow() {
        let fakeWindow = {
          closed: false,
          focus: dud,
          blur: dud,
          close: function () {
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

      function windowHooker(targetWindow) {
        try {
          if (!targetWindow) {
            return;
          }
          if (targetWindow.__galaxyOpenHooked) {
            return;
          }
          targetWindow.__galaxyOpenHooked = true;
          targetWindow.open = function (url, name, features) {
            emitNewTab(url);
            return dudWindow();
          };
        } catch (error) {
        }
      }
      windowHooker(window);
  
    })();
    /* @/browser */
    return body;
  `
	});

	await api.enablePlugin('windowOpen');
}
