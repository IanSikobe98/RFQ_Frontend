/* global clients */

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetUrl = '/';

  // User clicked Dismiss
  if (event.action === 'dismiss') {
    return;
  }
  if (event.action === 'approve') {
    targetUrl = '/approveDeal';
  }

  if (event.action === 'view') {
    targetUrl = '/viewDealCodes';
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {

      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});
