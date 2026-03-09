// Zeniva Travel Service Worker v3.1 — PWA + Push Notifications
const CACHE_NAME = "zeniva-v4";
const STATIC_ASSETS = ["/offline", "/branding/lina-avatar.png", "/branding/lina-hero.png", "/icons/icon-192x192.png"];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS).catch(() => {})));
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// ─── Fetch Strategy ───────────────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Cache First: static assets
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/branding/") ||
    url.pathname.startsWith("/yachts/") ||
    url.pathname.startsWith("/residence-photos/")
  ) {
    e.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((r) => {
        if (r.ok) caches.open(CACHE_NAME).then((c) => c.put(request, r.clone()));
        return r;
      }))
    );
    return;
  }

  // Network First: HTML, API
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(() => caches.match("/offline").then((r) => r || new Response("Offline", { status: 503 })))
    );
    return;
  }
});

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: "Zeniva Travel", body: event.data.text() }; }

  const options = {
    body: data.body || "You have a new message",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    image: data.image || undefined,
    tag: data.tag || "zeniva-notification",
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: data.url || "/", timestamp: Date.now() },
    actions: data.actions || [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || "✈️ Zeniva Travel", options),
      // Increment badge count on app icon
      (async () => {
        try {
          const stored = await caches.open("zeniva-badge-v1");
          const resp = await stored.match("badge-count");
          const current = resp ? parseInt(await resp.text(), 10) : 0;
          const next = current + 1;
          await stored.put("badge-count", new Response(String(next)));
          if ("setAppBadge" in self.navigator) {
            await self.navigator.setAppBadge(next);
          }
        } catch (e) {}
      })(),
    ])
  );
});

// ─── Clear badge when app focused ────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data === "CLEAR_BADGE") {
    (async () => {
      try {
        const stored = await caches.open("zeniva-badge-v1");
        await stored.put("badge-count", new Response("0"));
        if ("clearAppBadge" in self.navigator) await self.navigator.clearAppBadge();
      } catch (e) {}
    })();
  }
});

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Open new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ─── Push Subscription Change ─────────────────────────────────────────────────
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
    }).then((sub) => fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub }),
    }))
  );
});
