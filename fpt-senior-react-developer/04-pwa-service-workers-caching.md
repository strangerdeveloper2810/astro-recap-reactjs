# Progressive Web Apps, Service Workers & Caching

> **Vị trí**: Senior/Lead React Developer - FPT Software
> **Ngôn ngữ phỏng vấn**: Tiếng Việt
> **Mục tiêu**: Hiểu rõ PWA, Service Workers, và các chiến lược caching

---

## Mục lục

1. [Progressive Web Apps (PWA)](#1-progressive-web-apps-pwa)
2. [Service Workers](#2-service-workers)
3. [Caching Strategies](#3-caching-strategies)
4. [Web App Manifest](#4-web-app-manifest)
5. [Workbox - PWA Toolkit](#5-workbox---pwa-toolkit)
6. [Triển khai PWA với React/Next.js](#6-triển-khai-pwa-với-reactnextjs)
7. [Câu hỏi phỏng vấn thường gặp](#7-câu-hỏi-phỏng-vấn-thường-gặp)

---

## 1. Progressive Web Apps (PWA)

### 1.1 PWA là gì?

**Progressive Web App** là ứng dụng web với các tính năng giống native app:
- Cài đặt được trên home screen
- Hoạt động offline
- Push notifications
- Truy cập hardware (camera, GPS)
- Cập nhật tự động

### 1.2 Core Features của PWA

```
┌──────────────────────────────────────────────────────────────┐
│                    PWA Core Features                          │
├──────────────────┬───────────────────────────────────────────┤
│ Progressive      │ Hoạt động với mọi browser                 │
├──────────────────┼───────────────────────────────────────────┤
│ Responsive       │ Tương thích mobile, tablet, desktop       │
├──────────────────┼───────────────────────────────────────────┤
│ Offline          │ Service Worker caching                    │
├──────────────────┼───────────────────────────────────────────┤
│ App-like         │ Full-screen, navigation gestures          │
├──────────────────┼───────────────────────────────────────────┤
│ Fresh            │ Tự động update khi có version mới         │
├──────────────────┼───────────────────────────────────────────┤
│ Safe             │ HTTPS bắt buộc                            │
├──────────────────┼───────────────────────────────────────────┤
│ Discoverable     │ Search engines index được                 │
├──────────────────┼───────────────────────────────────────────┤
│ Re-engageable    │ Push notifications                        │
├──────────────────┼───────────────────────────────────────────┤
│ Installable      │ Add to Home Screen                        │
├──────────────────┼───────────────────────────────────────────┤
│ Linkable         │ Chia sẻ qua URL                           │
└──────────────────┴───────────────────────────────────────────┘
```

### 1.3 PWA vs Native App vs Regular Web

| Feature | PWA | Native App | Web App |
|---------|-----|------------|---------|
| **Installation** | Add to Home Screen | App Store | Không cần |
| **Offline** | ✅ Service Worker | ✅ Native | ❌ |
| **Push Notifications** | ✅ | ✅ | ❌ |
| **Updates** | Tự động | App Store | Tự động |
| **Hardware Access** | ⚠️ Limited | ✅ Full | ⚠️ Limited |
| **SEO** | ✅ | ❌ | ✅ |
| **Development Cost** | Thấp | Cao | Thấp |

### 1.4 Khi nào nên dùng PWA?

**Nên dùng:**
- Content-based apps (news, e-commerce, social)
- Cần cross-platform với budget thấp
- SEO quan trọng
- Cần offline support cơ bản

**Không nên dùng:**
- Cần deep hardware integration (games, AR/VR)
- App Store presence quan trọng
- Complex native features (background processing)

---

## 2. Service Workers

### 2.1 Service Worker là gì?

**Service Worker** là script chạy background, độc lập với web page:
- Proxy giữa browser và network
- Caching và offline support
- Push notifications
- Background sync

### 2.2 Service Worker Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE WORKER LIFECYCLE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐            │
│   │ Register │ ──► │ Install  │ ──► │ Waiting  │            │
│   └──────────┘     └──────────┘     └──────────┘            │
│                          │               │                   │
│                          ▼               ▼                   │
│                    (if no old SW)   (old SW still active)   │
│                          │               │                   │
│                          ▼               │                   │
│                    ┌──────────┐          │                   │
│                    │ Activate │ ◄────────┘ (when old closes) │
│                    └──────────┘                              │
│                          │                                   │
│                          ▼                                   │
│                    ┌──────────┐     ┌──────────┐            │
│                    │  Active  │ ──► │Terminated│            │
│                    │ (idle)   │     │(browser) │            │
│                    └──────────┘     └──────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Đăng ký Service Worker

```javascript
// src/registerServiceWorker.js
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Kiểm tra updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('New SW installing...');

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content available
                  console.log('New content available!');
                  // Hiện prompt "Refresh to update"
                } else {
                  // Content cached for offline
                  console.log('Content cached for offline use.');
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
```

### 2.4 Service Worker cơ bản

```javascript
// public/service-worker.js
const CACHE_NAME = 'fpt-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
];

// INSTALL - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting để activate ngay
        return self.skipWaiting();
      })
  );
});

// ACTIVATE - Cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Claim all clients ngay lập tức
      return self.clients.claim();
    })
  );
});

// FETCH - Intercept requests
self.addEventListener('fetch', (event) => {
  // Chỉ handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Cache hit - trả về cached version
      if (cachedResponse) {
        return cachedResponse;
      }

      // Cache miss - fetch từ network
      return fetch(event.request).then((response) => {
        // Không cache nếu response không valid
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone response vì nó chỉ dùng được 1 lần
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
```

### 2.5 Push Notifications

```javascript
// service-worker.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const options = {
    body: data.body || 'Bạn có thông báo mới',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'Xem ngay' },
      { action: 'close', title: 'Đóng' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'FPT App', options)
  );
});

// Xử lý click notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Nếu đã có window mở, focus vào đó
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Nếu không, mở window mới
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
```

**Subscribe Push Notifications (Client):**

```javascript
// src/utils/pushNotifications.js
const PUBLIC_VAPID_KEY = 'your-vapid-public-key';

export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  // Kiểm tra permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission denied');
  }

  // Subscribe
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });

  // Gửi subscription lên server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  return subscription;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### 2.6 Background Sync

```javascript
// service-worker.js
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // Lấy orders từ IndexedDB
  const db = await openDB('fpt-app', 1);
  const pendingOrders = await db.getAll('pending-orders');

  for (const order of pendingOrders) {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      // Xóa order đã sync
      await db.delete('pending-orders', order.id);
    } catch (error) {
      console.error('Sync failed for order:', order.id);
    }
  }
}
```

**Request Background Sync (Client):**

```javascript
// src/utils/backgroundSync.js
export async function requestSync(tag) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
  } else {
    // Fallback: sync ngay lập tức
    await syncOrders();
  }
}

// Usage
async function submitOrder(order) {
  // Lưu vào IndexedDB
  const db = await openDB('fpt-app', 1);
  await db.add('pending-orders', order);

  // Request background sync
  await requestSync('sync-orders');
}
```

---

## 3. Caching Strategies

### 3.1 Overview các Strategies

```
┌─────────────────────────────────────────────────────────────┐
│                   CACHING STRATEGIES                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Cache First (Cache Falling Back to Network)             │
│     ┌───────┐    ┌───────┐    ┌─────────┐                  │
│     │Request│ ─► │ Cache │ ─► │ Network │ (if miss)        │
│     └───────┘    └───────┘    └─────────┘                  │
│                                                              │
│  2. Network First (Network Falling Back to Cache)           │
│     ┌───────┐    ┌─────────┐    ┌───────┐                  │
│     │Request│ ─► │ Network │ ─► │ Cache │ (if fail)        │
│     └───────┘    └─────────┘    └───────┘                  │
│                                                              │
│  3. Stale While Revalidate                                  │
│     ┌───────┐    ┌───────┐                                  │
│     │Request│ ─► │ Cache │ ─► Return immediately            │
│     └───────┘    └───────┘                                  │
│                      │                                       │
│                      └─► Fetch & Update cache in background │
│                                                              │
│  4. Cache Only                                               │
│     ┌───────┐    ┌───────┐                                  │
│     │Request│ ─► │ Cache │ (only)                           │
│     └───────┘    └───────┘                                  │
│                                                              │
│  5. Network Only                                             │
│     ┌───────┐    ┌─────────┐                                │
│     │Request│ ─► │ Network │ (only)                         │
│     └───────┘    └─────────┘                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Cache First

**Phù hợp cho:** Static assets (CSS, JS, images, fonts)

```javascript
// Cache First Strategy
self.addEventListener('fetch', (event) => {
  if (isStaticAsset(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
  }
});

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff2?)$/i.test(url);
}
```

### 3.3 Network First

**Phù hợp cho:** API requests, dynamic content

```javascript
// Network First Strategy
self.addEventListener('fetch', (event) => {
  if (isApiRequest(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request);
        })
    );
  }
});

function isApiRequest(url) {
  return url.includes('/api/');
}
```

### 3.4 Stale While Revalidate

**Phù hợp cho:** Data cần nhanh nhưng không cần real-time (user profile, product list)

```javascript
// Stale While Revalidate Strategy
self.addEventListener('fetch', (event) => {
  if (shouldStaleWhileRevalidate(event.request.url)) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // Fetch mới trong background
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });

          // Trả về cache ngay lập tức, hoặc đợi network
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
```

### 3.5 Khi nào dùng strategy nào?

| Strategy | Use Case | Ví dụ |
|----------|----------|-------|
| **Cache First** | Static, rarely changes | JS, CSS, fonts, images |
| **Network First** | Dynamic, needs freshness | API data, user-specific |
| **Stale While Revalidate** | Balance speed & freshness | Product list, avatar |
| **Cache Only** | Offline-first, versioned | App shell, precached |
| **Network Only** | Real-time critical | Auth, payment, analytics |

### 3.6 Cache Versioning

```javascript
const CACHE_VERSION = 'v2';
const CACHES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`,
};

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !Object.values(CACHES).includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
});
```

---

## 4. Web App Manifest

### 4.1 Web App Manifest là gì?

**manifest.json** là file JSON mô tả metadata của PWA:
- App name, icons
- Theme colors
- Display mode (fullscreen, standalone)
- Start URL
- Shortcuts

### 4.2 Cấu hình đầy đủ

```json
{
  "name": "FPT E-Commerce",
  "short_name": "FPT Shop",
  "description": "Mua sắm trực tuyến với FPT",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#1a73e8",
  "lang": "vi",
  "dir": "ltr",

  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],

  "shortcuts": [
    {
      "name": "Giỏ hàng",
      "short_name": "Cart",
      "description": "Xem giỏ hàng của bạn",
      "url": "/cart",
      "icons": [{ "src": "/icons/cart-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Đơn hàng",
      "short_name": "Orders",
      "description": "Xem đơn hàng",
      "url": "/orders",
      "icons": [{ "src": "/icons/orders-96x96.png", "sizes": "96x96" }]
    }
  ],

  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Trang chủ"
    },
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Trang chủ mobile"
    }
  ],

  "categories": ["shopping", "lifestyle"],
  "iarc_rating_id": "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7"
}
```

### 4.3 Link Manifest trong HTML

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- PWA Meta Tags -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#1a73e8">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="FPT Shop">

  <!-- iOS Icons -->
  <link rel="apple-touch-icon" href="/icons/icon-152x152.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png">

  <!-- Splash Screens (iOS) -->
  <link rel="apple-touch-startup-image" href="/splash/iphone5.png"
        media="(device-width: 320px) and (device-height: 568px)">
  <link rel="apple-touch-startup-image" href="/splash/iphone6.png"
        media="(device-width: 375px) and (device-height: 667px)">

  <title>FPT E-Commerce</title>
</head>
<body>
  <!-- App content -->
</body>
</html>
```

### 4.4 Display Modes

| Mode | Mô tả | Use Case |
|------|-------|----------|
| `fullscreen` | Toàn màn hình, ẩn status bar | Games, video |
| `standalone` | Như native app, có status bar | Hầu hết apps |
| `minimal-ui` | Có navigation controls | Web-like apps |
| `browser` | Mở trong browser tab | Testing |

---

## 5. Workbox - PWA Toolkit

### 5.1 Workbox là gì?

**Workbox** là bộ thư viện từ Google giúp xây dựng PWA dễ dàng hơn:
- Caching strategies built-in
- Precaching
- Background sync
- Push notifications
- Routing

### 5.2 Cài đặt Workbox

```bash
npm install workbox-webpack-plugin workbox-window
```

### 5.3 Workbox với Webpack

```javascript
// webpack.config.js
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = {
  plugins: [
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,

      // Precache
      include: [/\.html$/, /\.js$/, /\.css$/, /\.woff2?$/],

      // Runtime caching
      runtimeCaching: [
        {
          // Static assets - Cache First
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
        {
          // API - Network First
          urlPattern: /\/api\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60, // 5 minutes
            },
          },
        },
        {
          // CDN - Stale While Revalidate
          urlPattern: /^https:\/\/cdn\.example\.com/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'cdn',
          },
        },
      ],
    }),
  ],
};
```

### 5.4 Workbox Recipes (Strategies)

```javascript
// service-worker.js với Workbox
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache từ webpack manifest
precacheAndRoute(self.__WB_MANIFEST);

// Images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// API - Network First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  })
);

// Google Fonts - Stale While Revalidate
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30 }),
    ],
  })
);
```

### 5.5 Workbox Window (Client-side)

```javascript
// src/registerSW.js
import { Workbox } from 'workbox-window';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');

    // Khi có update
    wb.addEventListener('waiting', () => {
      // Hiển thị prompt cho user
      const shouldUpdate = confirm(
        'Có phiên bản mới. Bạn có muốn cập nhật không?'
      );

      if (shouldUpdate) {
        wb.messageSkipWaiting();
      }
    });

    // Khi SW được activate
    wb.addEventListener('controlling', () => {
      window.location.reload();
    });

    wb.register();
  }
}
```

---

## 6. Triển khai PWA với React/Next.js

### 6.1 Create React App PWA

```bash
# CRA có sẵn service worker template
npx create-react-app my-pwa --template cra-template-pwa-typescript
```

```javascript
// src/index.tsx
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Đăng ký service worker
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Thông báo user có update
    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener('statechange', (event) => {
        if (event.target.state === 'activated') {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});
```

### 6.2 Next.js PWA

```bash
npm install next-pwa
```

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### 6.3 Vite PWA Plugin

```bash
npm install vite-plugin-pwa
```

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'FPT E-Commerce',
        short_name: 'FPT Shop',
        description: 'Mua sắm trực tuyến',
        theme_color: '#1a73e8',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

## 7. Câu hỏi phỏng vấn thường gặp

### Câu hỏi 1: "PWA là gì? Ưu nhược điểm so với Native App?"

**Trả lời:**
> "PWA là web app với các tính năng như native app: cài đặt được, offline, push notifications.
>
> **Ưu điểm:**
> - Cross-platform với một codebase
> - Không cần qua App Store
> - Cập nhật tức thì
> - SEO friendly
> - Chi phí phát triển thấp hơn
>
> **Nhược điểm:**
> - Hardware access hạn chế (so với native)
> - iOS support không đầy đủ
> - Không có trên App Store (marketing)
> - Battery/performance không tối ưu bằng native
>
> Tôi recommend PWA cho content apps, e-commerce. Với apps cần deep hardware integration như games, camera, tôi sẽ chọn native."

---

### Câu hỏi 2: "Service Worker hoạt động như thế nào?"

**Trả lời:**
> "Service Worker là JavaScript chạy background, độc lập với main thread.
>
> **Lifecycle:**
> 1. **Register**: Đăng ký SW với browser
> 2. **Install**: Download và cache static assets
> 3. **Activate**: SW mới take control, cleanup old caches
> 4. **Idle**: Chờ events (fetch, push, sync)
>
> **Chức năng chính:**
> - Intercept network requests (fetch event)
> - Caching responses
> - Push notifications
> - Background sync
>
> **Lưu ý quan trọng:**
> - Chỉ hoạt động với HTTPS
> - Không access DOM trực tiếp
> - Có thể bị terminate bất kỳ lúc nào để tiết kiệm memory"

---

### Câu hỏi 3: "Có những caching strategies nào? Khi nào dùng?"

**Trả lời:**
> "Có 5 strategies chính:
>
> **1. Cache First:**
> - Check cache trước, miss thì fetch network
> - Dùng cho: Static assets (JS, CSS, fonts, images)
>
> **2. Network First:**
> - Fetch network trước, fail thì dùng cache
> - Dùng cho: API data, dynamic content
>
> **3. Stale While Revalidate:**
> - Trả cache ngay, update cache background
> - Dùng cho: Content cần nhanh nhưng không real-time (avatar, product list)
>
> **4. Cache Only:**
> - Chỉ từ cache
> - Dùng cho: Precached assets, offline pages
>
> **5. Network Only:**
> - Chỉ từ network
> - Dùng cho: Analytics, auth, real-time critical
>
> Trong thực tế, tôi combine: Cache First cho assets, Network First cho API, Stale While Revalidate cho CDN resources."

---

### Câu hỏi 4: "Làm sao handle update cho PWA?"

**Trả lời:**
> "Có 2 approach chính:
>
> **1. Silent update (skipWaiting):**
> - SW mới activate ngay khi install xong
> - Tốt cho: Minor updates, bug fixes
> - Rủi ro: User có thể thấy content thay đổi đột ngột
>
> **2. Prompt update:**
> - Thông báo user có version mới
> - User click 'Cập nhật' → reload page
> - Tốt cho: Major updates, breaking changes
>
> **Implementation:**
> ```javascript
> // Detect waiting SW
> registration.addEventListener('updatefound', () => {
>   const newSW = registration.installing;
>   newSW.addEventListener('statechange', () => {
>     if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
>       // Hiển thị toast/banner cho user
>       showUpdateBanner();
>     }
>   });
> });
> ```
>
> Tôi thường dùng prompt update để user không bị confused khi content thay đổi."

---

### Câu hỏi 5: "Workbox là gì? Tại sao dùng?"

**Trả lời:**
> "Workbox là bộ libraries từ Google giúp xây dựng PWA dễ hơn.
>
> **Tại sao dùng:**
> - Caching strategies built-in, production-ready
> - Precaching với content hash tự động
> - Runtime caching với expiration policies
> - Background sync, push notifications helpers
> - Webpack/Vite plugins tích hợp
>
> **Ví dụ so sánh:**
> ```javascript
> // Không dùng Workbox: 50+ dòng code
> self.addEventListener('fetch', (event) => {
>   // ... manually implement cache first
> });
>
> // Dùng Workbox: 5 dòng
> registerRoute(
>   ({ request }) => request.destination === 'image',
>   new CacheFirst({ cacheName: 'images' })
> );
> ```
>
> Workbox giúp tôi viết ít code hơn mà reliable hơn. Tôi dùng cho mọi PWA project."

---

### Câu hỏi 6: "Bạn đã triển khai PWA chưa? Chia sẻ kinh nghiệm?"

**Trả lời (ví dụ):**
> "Tôi đã triển khai PWA cho ứng dụng e-commerce tại [công ty].
>
> **Yêu cầu:**
> - Offline support cho product catalog
> - Push notifications cho order updates
> - Install on home screen
>
> **Giải pháp:**
> - Dùng Next.js với next-pwa
> - Cache First cho images, Stale While Revalidate cho product data
> - Network First cho cart, checkout (critical)
> - Background sync cho offline orders
>
> **Kết quả:**
> - Lighthouse PWA score: 100
> - Offline-capable product browsing
> - 30% users đã install PWA
> - Push notification open rate: 15%
>
> **Thách thức:**
> - iOS không support push notifications (workaround: in-app notifications)
> - Cache invalidation khi product data thay đổi (solution: version header + cache busting)"

---

## Tài liệu tham khảo

- [MDN - Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google Developers - PWA](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Web.dev - Caching Strategies](https://web.dev/offline-cookbook/)
