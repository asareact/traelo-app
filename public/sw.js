/**
 * Traelo service worker — minimal, hand-written.
 *
 * Job: make the site installable (PWA / Android TWA) and receive Web Push.
 * Deliberately NO offline precaching yet — the fetch handler is a pass-through,
 * so it never serves stale content (safe during development). Offline caching
 * can be layered on later without changing how it's registered.
 */

self.addEventListener("install", () => {
  // Activate this version immediately instead of waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through: its presence keeps the app installable; it does not cache.
self.addEventListener("fetch", () => {
  // no-op — let the browser handle the request normally.
});

// Web Push — render the notification the server sends (Fase 3). Payload shape:
// { title, body, url }.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Traelo", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Traelo";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      // Monochrome silhouette (white on transparent) — Android uses only the alpha
      // for the status-bar icon; a full-color icon would render as a white square.
      badge: "/icons/badge-mono.png",
      // Vibration nudges Android toward a heads-up banner (vs a silent tray entry)
      // and signals the notification arrived. Final "pop on screen" behavior still
      // depends on the channel importance (Chrome's, or the TWA's once packaged).
      vibrate: [120, 60, 120],
      // Same tag (per order) → a newer update REPLACES the previous one instead of
      // stacking; renotify makes the replacement still alert.
      tag: data.tag || undefined,
      renotify: data.tag ? true : false,
      // A tap-target button in addition to tapping the body.
      actions: [{ action: "abrir", title: "Ver pedido" }],
      data: { url: data.url || "/" },
    }),
  );
});

// Tap on a notification: focus an open tab (navigating it) or open a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
