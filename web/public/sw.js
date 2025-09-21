const CACHE = "school35-v1";
const ASSETS = [
    "/",
    "/manifest.webmanifest",
    "/favicon.ico",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    // Кэшируем только статику, не HTML-страницы и не API
    const dest = req.destination;
    const cacheable = ["script", "style", "image", "font"].includes(dest);
    if (!cacheable) return; // навигацию отдаем сети

    event.respondWith(
        caches.match(req).then((cached) =>
            cached || fetch(req).then((res) => {
                const resClone = res.clone();
                caches.open(CACHE).then((cache) => cache.put(req, resClone));
                return res;
            })
        )
    );
});


