const CACHE_NAME = "klar-v4";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/src/styles.css",
  "/src/app.js",
  "/src/grading.js",
  "/src/questions.js",
  "/src/routing.js",
  "/src/data/glossary.js",
  "/src/data/grammar.js",
  "/src/data/foundations.js",
  "/src/data/semester.js",
  "/src/audio/st1-names.mp3",
  "/src/audio/st1-phones.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Audio players seek using byte ranges. Serve ranges from the complete cached
  // MP3 so playback and seeking keep working without a network connection.
  if (new URL(event.request.url).pathname.endsWith(".mp3") && event.request.headers.has("range")) {
    event.respondWith(audioRangeResponse(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok && response.status !== 206) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});

async function audioRangeResponse(request) {
  const cached = await caches.match(request.url);
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
