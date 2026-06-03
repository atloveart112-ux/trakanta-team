/* eslint-disable */
// Service worker for Web Push.
// Receives push events from the server and shows a system notification.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "ตระการตา", body: event.data.text() };
  }

  const title = payload.title || "ตระการตา · ตารางคอนเทนต์";
  const options = {
    body: payload.body || "",
    icon: "/apple-icon",
    badge: "/icon",
    data: { url: payload.url || "/" },
    requireInteraction: false,
    tag: payload.tag || "trakanta-daily",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if it has our origin
      for (const c of clients) {
        if (c.url.includes(self.location.origin) && "focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
