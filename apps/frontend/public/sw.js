// War9a Service Worker - PWA offline support + push notifications

const CACHE_NAME = "war9a-v1";
const STATIC_ASSETS = ["/", "/discover", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Network-first for API requests
  if (url.pathname.startsWith("/api") || url.hostname.includes("api.")) {
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached ?? fetch(event.request),
    ),
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "War9a", body: event.data.text() };
  }

  const options = {
    body: payload.body ?? "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag ?? "war9a-notification",
    data: { url: payload.url ?? "/" },
    actions: payload.actions ?? [],
    requireInteraction: payload.requireInteraction ?? false,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "War9a", options),
  );
});

// Notification click handler - opens relevant URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      (clients) => {
        const existingClient = clients.find((c) => c.url === url);
        if (existingClient) return existingClient.focus();
        return self.clients.openWindow(url);
      },
    ),
  );
});
