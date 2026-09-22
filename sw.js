// Change the release in index.html and every browser import together. A cached
// pre-release engine must never be paired with new chapter/category controls.
const CACHE_NAME = "klar-v5";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/src/styles.css?v=5",
  "/src/app.js?v=5",
  "/src/updates.js?v=5",
  "/src/grading.js?v=5",
  "/src/questions.js?v=5",
  "/src/routing.js?v=5",
  "/src/data/glossary.js?v=5",
  "/src/data/grammar.js?v=5",
  "/src/data/foundations.js?v=5",
  "/src/data/semester.js?v=5",
  "/src/audio/st1-names.mp3",
  "/src/audio/st1-phones.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Bypass the HTTP cache as well as the previous worker's Cache Storage.
    await cache.addAll(APP_SHELL.map((path) => new Request(new URL(path, self.location.origin), { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("klar-") && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Audio players seek using byte ranges. Serve ranges from the complete cached
  // MP3 so playback and seeking keep working without a network connection.
  if (url.pathname.endsWith(".mp3") && event.request.headers.has("range")) {
    event.respondWith(audioRangeResponse(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    // Serve HTML and modules from the same completed release. Fetching HTML
    // independently can expose new controls with the previous release's data.
    event.respondWith(releaseResponse("/index.html"));
    return;
  }

  if (APP_SHELL.includes(url.pathname + url.search)) {
    event.respondWith(releaseResponse(event.request));
  }
});

async function releaseResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || fetch(request, { cache: "reload" });
}

async function audioRangeResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request.url);
  if (!cached) return fetch(request);
  const bytes = await cached.arrayBuffer();
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range"));
  let start = range?.[1] ? Number(range[1]) : 0;
  let end = range?.[2] ? Number(range[2]) : bytes.byteLength - 1;
  if (range && !range[1] && range[2]) {
    start = Math.max(0, bytes.byteLength - Number(range[2]));
    end = bytes.byteLength - 1;
  }
  if (!range || (!range[1] && !range[2]) || start > end || start >= bytes.byteLength) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.byteLength}` } });
  }
  end = Math.min(end, bytes.byteLength - 1);
  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": "audio/mpeg", "Accept-Ranges": "bytes",
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${bytes.byteLength}`
    }
  });
}
