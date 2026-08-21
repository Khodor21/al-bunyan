importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCoXkLXy5hvWilXjNoV4UI60vszN32i_NY",
  authDomain: "al-bunyan.firebaseapp.com",
  projectId: "al-bunyan",
  storageBucket: "al-bunyan.firebasestorage.app",
  messagingSenderId: "485487858257",
  appId: "1:485487858257:web:fe30398a03ac0f40e45e70",
});

const messaging = firebase.messaging();

// Handle background messages.
// We read from payload.data (not payload.notification) to prevent double
// notifications — when payload.notification is present the browser shows
// the notification automatically AND this handler fires, causing duplicates.
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message received:",
    payload,
  );

  const data = payload.data || {};

  const notificationTitle = data.title || "New Notification";
  const notificationOptions = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/icon-192.png",
    tag: data.tag || "default",
    data: { url: data.url || "/" },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Try to focus an existing window at the target URL.
        for (const client of windowClients) {
          const clientUrl = new URL(client.url);
          const target = new URL(targetUrl, self.location.origin);

          if (clientUrl.pathname === target.pathname && "focus" in client) {
            return client.focus();
          }
        }

        // No matching window — open a new one.
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
