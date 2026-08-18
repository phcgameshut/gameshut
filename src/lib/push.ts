export async function subscribeToPushNotifications(userId: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  // Register Service Worker
  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  // Ask for permission if not already granted
  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Push notification permission denied.");
    }
  } else if (Notification.permission === "denied") {
    throw new Error("Push notification permission was previously denied. Please enable it in browser settings.");
  }

  // Generate VAPID key buffer
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error("VAPID public key not found");
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Subscribe to push manager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // Send subscription to our server
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      subscription,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save push subscription on the server");
  }

  return subscription;
}
