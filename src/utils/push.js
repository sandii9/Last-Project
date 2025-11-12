const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
};

export async function ensureSWRegistered() {
  if (!('serviceWorker' in navigator)) throw new Error('Browser tidak mendukung Service Worker');
  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  return reg;
}
export async function getExistingSubscription() {
  const reg = await ensureSWRegistered();
  return reg.pushManager.getSubscription();
}
export async function askNotificationPermission() {
  if (!('Notification' in window)) throw new Error('Browser tidak mendukung Notifikasi');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Izin notifikasi ditolak');
  return true;
}
async function getVapidKey() {
  const k = (import.meta && import.meta.env && import.meta.env.VITE_VAPID_PUBLIC_KEY) || window.__VAPID_PUBLIC_KEY__;
  if (!k) throw new Error('VAPID public key belum di-set. Tambahkan VITE_VAPID_PUBLIC_KEY di .env');
  return k;
}
export async function subscribePush(params) {
  const { apiBase, authToken } = params || {};

  await askNotificationPermission();
  const reg = await ensureSWRegistered();

  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  const vapidPublicKey = await getVapidKey();
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // === ⬇️ Hanya kirim field yang diizinkan API (tanpa expirationTime) ===
  const raw = subscription.toJSON();
  const payload = {
    endpoint: raw.endpoint,
    keys: {
      p256dh: raw.keys?.p256dh,
      auth: raw.keys?.auth,
    },
  };

  if (apiBase) {
    const res = await fetch(`${apiBase}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(payload), // << gunakan payload yang sudah difilter
    });

    if (!res.ok) {
      let details = res.status + ' ' + (res.statusText || '');
      try {
        const j = await res.json();
        if (j?.message) details += ' — ' + j.message;
      } catch {}
      // rollback subscription lokal bila gagal daftar di server
      try { await subscription.unsubscribe(); } catch {}
      throw new Error('Gagal mendaftarkan endpoint notifikasi (' + details.trim() + ')');
    }
  }

  return subscription;
}
export async function unsubscribePush() {
  const reg = await ensureSWRegistered();
  const sub = await reg.pushManager.getSubscription();
  if (sub) { try { await fetch(`/notifications/unsubscribe`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({endpoint: sub.endpoint}) }); } catch {} await sub.unsubscribe(); }
  return true;
}