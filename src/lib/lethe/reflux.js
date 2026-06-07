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

      function wantsNewTab(mouseEvent) {
        if (mouseEvent.ctrlKey) {
          return true;
        }
        if (mouseEvent.metaKey) {
          return true;
        }
        return false;
      }

      function hrefFinder(node) {
        if (!node) {
          return null;
        }
        if (!node.closest) {
          return null;
        }
        return node.closest('a[href]');
      }
      document.addEventListener('click', function (clickEvent) {
        if (clickEvent.defaultPrevented) {
          return;
        }
        if (clickEvent.button !== 0) {
          return;
        }
        let link = hrefFinder(clickEvent.target);
        if (!link) {
          return;
        }
        let opensNewTab = false;
        if (link.target === '_blank') {
          opensNewTab = true;
        }
        if (wantsNewTab(clickEvent)) {
          opensNewTab = true;
        }
        if (!opensNewTab) {
          return;
        }
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        emitNewTab(link.href);
      }, true);

      document.addEventListener('auxclick', function (auxClickEvent) {
        if (auxClickEvent.button !== 1) {
          return;
        }
        let link = hrefFinder(auxClickEvent.target);
        if (!link) {
          return;
        }
        auxClickEvent.preventDefault();
        auxClickEvent.stopPropagation();
        emitNewTab(link.href);
      }, true);

      document.addEventListener('mousedown', function (mouseDownEvent) {
        if (mouseDownEvent.button !== 1) {
          return;
        }
        let link = hrefFinder(mouseDownEvent.target);
        if (!link) {
          return;
        }
        mouseDownEvent.preventDefault();
      }, true);
      document.addEventListener('submit', function (submitEvent) {
        let form = submitEvent.target;
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
          formAction = location.href;
        }
        emitNewTab(formAction);
      }, true);
    })();
    /* @/browser */
    return body;
  `
	});

	await api.enablePlugin('windowOpen');
}
