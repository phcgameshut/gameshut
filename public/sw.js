self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || 'GamesHut';
      const options = {
        body: data.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: data.url || '/',
        requireInteraction: false
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
      console.error('Error parsing push data', err);
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = new URL(event.notification.data || '/', self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    let matchingClient = null;

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      if (windowClient.url === urlToOpen) {
        matchingClient = windowClient;
        break;
      }
    }

    if (matchingClient) {
      return matchingClient.focus();
    } else {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});
