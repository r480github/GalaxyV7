const { ScramjetController } = $scramjetLoadController();
const scramjet = new ScramjetController({
  files: {
    wasm: "/scram/scramjet.wasm.wasm",
    all: "/scram/scramjet.all.js",
    sync: "/scram/scramjet.sync.js",
  },
});

window.__proxyReady = (async () => {
  try {
    if (navigator.serviceWorker) {
      scramjet.init();
      await navigator.serviceWorker.register("./sw.js");
    } else {
      console.warn("Service workers not supported");
    }
  } catch (e) {
    console.error("Failed to initialize Scramjet:", e);
  }

  const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
  const wispUrl =
    (location.protocol === "https:" ? "wss" : "ws") +
    "://" +
    location.host +
    "/wisp/";
  await connection.setTransport("/libcurl/index.mjs", [{ wisp: wispUrl }]);

  window.__scramjet = scramjet;
})();