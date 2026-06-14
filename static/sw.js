importScripts("/glass/glass.bundle.js");
importScripts("/glass/glass.config.js");
importScripts("/glass/glass.sw.js");
importScripts("/poly/polygon.all.js");
importScripts("/prism/prism.sw.js");
const uv = new UVServiceWorker();
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
  await scramjet.loadConfig();
  if (uv.route(event)) {
    return await uv.fetch(event);
  }
  if (scramjet.route(event)) {
    return await scramjet.fetch(event);
  }

  return await fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  if (typeof $scramjetController !== "undefined" && $scramjetController.shouldRoute(event)) {
    event.respondWith($scramjetController.route(event));
    return;
  }
  event.respondWith(handleRequest(event));
});
