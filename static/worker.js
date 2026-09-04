importScripts("/glass/glass.bundle.js");
importScripts("/glass/glass.config.js");
importScripts("/glass/glass.sw.js");
importScripts("/poly/polygon.all.js");
importScripts("/hive/prism.sw.js");
const glass = new SeleniteServiceWorker();
const { CinnabarServiceWorker } = $cinnabarLoadWorker();
const cinnabar = new CinnabarServiceWorker();

async function handleRequest(event) {
  await cinnabar.loadConfig();
  if (glass.route(event)) {
    return await glass.fetch(event);
  }
  if (cinnabar.route(event)) {
    return await cinnabar.fetch(event);
  }

  return await fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  if (typeof $cinnabarController !== "undefined" && $cinnabarController.shouldRoute(event)) {
    event.respondWith($cinnabarController.route(event));
    return;
  }
  event.respondWith(handleRequest(event));
});
