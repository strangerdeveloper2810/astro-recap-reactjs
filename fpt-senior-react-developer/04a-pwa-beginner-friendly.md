# PWA & Service Workers - Giải thích dễ hiểu cho Senior

> **Dành cho**: Người chưa làm nhiều với PWA/Service Workers
> **Mục tiêu**: Hiểu concept và có thể trả lời phỏng vấn tự tin

---

## Phần 1: PWA là gì? Giải thích như đang nói chuyện

### 1.1 Vấn đề PWA giải quyết

**Tình huống thực tế:**

```
Bạn đang dùng app Grab để đặt xe:

NATIVE APP (App Store):
✅ Cài trên điện thoại
✅ Hoạt động khi mất mạng (xem lịch sử)
✅ Nhận notification
✅ Icon đẹp trên home screen
❌ Phải tải từ App Store (50-100MB)
❌ Phải có team iOS + Android riêng
❌ Apple lấy 30% revenue

WEB APP (Browser):
✅ Không cần cài đặt
✅ 1 codebase cho mọi platform
✅ Update tức thì
❌ Không hoạt động offline
❌ Không có notification
❌ Mở browser → gõ URL → phiền

PWA = LẤY ƯU ĐIỂM CỦA CẢ 2:
✅ Cài được trên home screen (như native)
✅ Hoạt động offline (như native)
✅ Nhận notification (như native)
✅ 1 codebase (như web)
✅ Không qua App Store (như web)
✅ Update tức thì (như web)
```

### 1.2 PWA trong đời thực

**Các PWA nổi tiếng:**
- **Twitter Lite**: PWA thay thế native app ở các nước có mạng chậm
- **Starbucks**: Order đồ uống, hoạt động offline
- **Pinterest**: Tăng engagement 60% so với mobile web cũ
- **Tinder**: PWA nhẹ hơn 90% so với native app

**Ở Việt Nam:**
- Một số bank đang chuyển sang PWA
- E-commerce dùng PWA cho trải nghiệm nhanh hơn

### 1.3 3 thành phần chính của PWA

```
┌─────────────────────────────────────────────────────────────┐
│                    PWA = 3 THÀNH PHẦN                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SERVICE WORKER (Script chạy background)                 │
│     └── Xử lý offline, caching, push notification           │
│                                                              │
│  2. WEB APP MANIFEST (File JSON)                            │
│     └── Tên app, icon, màu sắc, cách hiển thị               │
│                                                              │
│  3. HTTPS                                                   │
│     └── Bắt buộc vì lý do bảo mật                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phần 2: Service Worker - Hiểu như "người gác cổng"

### 2.1 Service Worker là gì?

**Hãy tưởng tượng:**

```
Không có Service Worker:
┌──────────┐         ┌──────────┐
│  Browser │ ──────► │  Server  │
│  (User)  │ ◄────── │ (Data)   │
└──────────┘         └──────────┘

Mất mạng? → Lỗi! Không thể truy cập.

Có Service Worker:
┌──────────┐    ┌─────────────────┐    ┌──────────┐
│  Browser │ ─► │ Service Worker  │ ─► │  Server  │
│  (User)  │ ◄─ │ (Người gác cổng)│ ◄─ │ (Data)   │
└──────────┘    └─────────────────┘    └──────────┘

Service Worker:
- Đứng giữa Browser và Server
- Intercept mọi request
- Quyết định: Lấy từ cache hay từ server?
- Mất mạng? Trả về cached version!
```

### 2.2 Lifecycle - Vòng đời của Service Worker

```
Giống như thuê nhân viên mới:

1. REGISTER (Ứng tuyển)
   Browser: "Tôi muốn thuê service-worker.js"
   SW: "OK, tôi sẽ apply"

2. INSTALL (Nhận việc, học nghề)
   SW: "Tôi đang download và cache các files cần thiết"
   SW: "index.html, app.js, style.css... done!"

3. WAITING (Chờ đợi)
   SW: "Có SW cũ đang chạy, tôi phải đợi họ nghỉ"
   (Khi user đóng tất cả tab của web)

4. ACTIVATE (Chính thức làm việc)
   SW: "SW cũ đã nghỉ, tôi tiếp quản!"
   SW: "Dọn dẹp cache cũ..."

5. IDLE → TERMINATED
   SW: "Không có việc, tôi sẽ ngủ"
   Browser: "Cần tiết kiệm RAM, terminate SW"
   (SW sẽ được đánh thức khi có request mới)
```

### 2.3 Code ví dụ đơn giản nhất

**Bước 1: Đăng ký Service Worker**

```javascript
// Trong file main.js của app
if ('serviceWorker' in navigator) {
  // Kiểm tra browser có hỗ trợ không

  window.addEventListener('load', () => {
    // Đợi page load xong rồi mới register

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Service Worker registered!');
      })
      .catch((err) => {
        console.log('Registration failed:', err);
      });
  });
}
```

**Bước 2: Viết Service Worker**

```javascript
// sw.js - File này chạy RIÊNG BIỆT với app

const CACHE_NAME = 'my-app-v1';

// Danh sách files cần cache khi install
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/images/logo.png',
];

// ========== INSTALL ==========
// Chạy 1 lần khi SW được install lần đầu
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');

  event.waitUntil(
    // Mở cache và add files vào
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Caching files');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// ========== ACTIVATE ==========
// Chạy khi SW được kích hoạt (sau install)
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');

  event.waitUntil(
    // Xóa cache cũ (version cũ)
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// ========== FETCH ==========
// Chạy mỗi khi app request bất kỳ resource nào
self.addEventListener('fetch', (event) => {
  console.log('SW: Fetching', event.request.url);

  event.respondWith(
    // Thử tìm trong cache trước
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Có trong cache → trả về luôn (nhanh!)
        return cachedResponse;
      }

      // Không có → fetch từ network
      return fetch(event.request);
    })
  );
});
```

---

## Phần 3: Caching Strategies - Chiến lược cache

### 3.1 5 chiến lược cơ bản

**1. CACHE FIRST (Cache trước, Network sau)**

```
Use case: Static files (JS, CSS, images)
Lý do: Files này ít thay đổi, ưu tiên tốc độ

Luồng:
┌─────────┐    ┌───────┐    ┌─────────┐
│ Request │ ─► │ Cache │    │ Network │
└─────────┘    └───────┘    └─────────┘
                  │ có?
                  ├── Yes → Trả về
                  └── No ─────────────► Fetch → Trả về & Cache

Code:
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
  );
});
```

**2. NETWORK FIRST (Network trước, Cache sau)**

```
Use case: API calls, dynamic data
Lý do: Cần data mới nhất, cache làm fallback khi offline

Luồng:
┌─────────┐    ┌─────────┐    ┌───────┐
│ Request │ ─► │ Network │    │ Cache │
└─────────┘    └─────────┘    └───────┘
                  │ OK?
                  ├── Yes → Trả về & Cache
                  └── No ─────────────► Trả về cached

Code:
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache response mới
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Offline → trả về cache
        return caches.match(event.request);
      })
  );
});
```

**3. STALE WHILE REVALIDATE (Trả cache, update background)**

```
Use case: Content cần nhanh nhưng không cần real-time
Ví dụ: User avatar, product list, news feed

Luồng:
┌─────────┐    ┌───────┐
│ Request │ ─► │ Cache │ ──► Trả về ngay (nhanh!)
└─────────┘    └───────┘
                  │
                  └──► Fetch từ Network
                       └──► Update cache cho lần sau

User thấy:
- Lần 1: Data cũ (nhưng nhanh)
- Lần 2: Data mới (đã update background)

Code:
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        // Fetch mới trong background
        const fetchPromise = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });

        // Trả về cache ngay, hoặc đợi fetch nếu không có cache
        return cached || fetchPromise;
      });
    })
  );
});
```

**4. CACHE ONLY**

```
Use case: Offline-only app, precached assets
Chỉ lấy từ cache, không bao giờ fetch network

Code:
event.respondWith(caches.match(event.request));
```

**5. NETWORK ONLY**

```
Use case: Analytics, authentication, real-time critical
Không cache, luôn fetch từ network

Code:
event.respondWith(fetch(event.request));
```

### 3.2 Chọn strategy nào?

```
┌──────────────────────────────────────────────────────────────┐
│                   CHỌN CACHING STRATEGY                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Asset/Request type          │ Strategy                      │
│  ────────────────────────────┼──────────────────────────────│
│  CSS, JS, Images, Fonts      │ CACHE FIRST                   │
│  HTML pages                   │ NETWORK FIRST hoặc STALE     │
│  API: /api/products           │ STALE WHILE REVALIDATE       │
│  API: /api/user/profile       │ NETWORK FIRST                │
│  API: /api/payment            │ NETWORK ONLY                 │
│  API: /api/analytics          │ NETWORK ONLY                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Phần 4: Web App Manifest - "Thẻ căn cước" của PWA

### 4.1 Manifest là gì?

```json
// manifest.json - Mô tả app của bạn
{
  // Tên đầy đủ (hiện trong app list)
  "name": "FPT E-Commerce",

  // Tên ngắn (hiện dưới icon)
  "short_name": "FPT Shop",

  // Mô tả
  "description": "Mua sắm trực tuyến với FPT",

  // URL khi mở app
  "start_url": "/",

  // Cách hiển thị
  "display": "standalone",  // Như native app, không có address bar

  // Màu nền khi loading
  "background_color": "#ffffff",

  // Màu thanh status bar
  "theme_color": "#1a73e8",

  // Icons cho home screen
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 4.2 Link manifest trong HTML

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Link tới manifest -->
  <link rel="manifest" href="/manifest.json">

  <!-- Màu theme cho mobile browser -->
  <meta name="theme-color" content="#1a73e8">

  <!-- Cho iOS (Apple không dùng manifest) -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="apple-touch-icon" href="/icons/icon-180.png">
</head>
<body>
  ...
</body>
</html>
```

---

## Phần 5: Workbox - Đừng viết SW từ đầu!

### 5.1 Tại sao dùng Workbox?

```
Viết Service Worker từ đầu:
❌ Dễ có bugs
❌ Phải handle nhiều edge cases
❌ Code dài, khó maintain

Dùng Workbox (từ Google):
✅ Production-ready
✅ Caching strategies có sẵn
✅ Tích hợp với Webpack, Vite
✅ Ít code, ít bugs
```

### 5.2 Workbox trong Vite (React)

```bash
npm install vite-plugin-pwa -D
```

```javascript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'FPT E-Commerce',
        short_name: 'FPT Shop',
        theme_color: '#1a73e8',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        // Tự động precache các assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],

        // Runtime caching rules
        runtimeCaching: [
          {
            // Images: Cache First
            urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 ngày
              },
            },
          },
          {
            // API: Network First
            urlPattern: /^https:\/\/api\.fpt\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60, // 5 phút
              },
            },
          },
        ],
      },
    }),
  ],
};
```

**Kết quả:** Workbox tự động:
- Generate service-worker.js
- Precache tất cả assets
- Apply caching strategies

---

## Phần 6: Câu hỏi phỏng vấn - Trả lời dễ hiểu

### Câu 1: "PWA là gì?"

**Trả lời ngắn gọn:**
> "PWA - Progressive Web App - là ứng dụng web với các tính năng giống native app như: cài đặt được trên home screen, hoạt động offline, nhận push notifications.
>
> PWA được build bằng công nghệ web (HTML, CSS, JS) nhưng cung cấp trải nghiệm tương tự native app mà không cần qua App Store."

**Ưu điểm (nếu được hỏi thêm):**
> "Ưu điểm chính là: 1 codebase cho mọi platform, update tức thì không qua App Store, tốn ít dung lượng, và SEO tốt vì vẫn là web."

### Câu 2: "Service Worker là gì?"

**Trả lời:**
> "Service Worker là một script JavaScript chạy background, độc lập với trang web.
>
> Nó đứng giữa browser và network, có thể intercept mọi request. Nhờ vậy, nó có thể:
> - Cache responses để trả về khi offline
> - Nhận push notifications
> - Sync data trong background
>
> Service Worker chỉ hoạt động với HTTPS vì lý do bảo mật."

### Câu 3: "Các caching strategies là gì? Khi nào dùng?"

**Trả lời:**
> "Có 5 strategies chính:
>
> 1. **Cache First**: Check cache trước, không có thì fetch network. Dùng cho static assets như JS, CSS, images.
>
> 2. **Network First**: Fetch network trước, fail thì dùng cache. Dùng cho API data cần fresh.
>
> 3. **Stale While Revalidate**: Trả cache ngay cho nhanh, fetch update trong background. Dùng cho content cần nhanh nhưng không real-time như product list.
>
> 4. **Cache Only**: Chỉ từ cache. Dùng cho precached assets.
>
> 5. **Network Only**: Không cache. Dùng cho payment, analytics.
>
> Trong dự án, tôi thường dùng Cache First cho assets, Network First cho auth API, và Stale While Revalidate cho catalog API."

### Câu 4: "Workbox là gì? Tại sao dùng?"

**Trả lời:**
> "Workbox là bộ libraries từ Google giúp xây dựng PWA dễ hơn.
>
> Thay vì viết Service Worker từ đầu với nhiều edge cases, Workbox cung cấp:
> - Caching strategies có sẵn và production-ready
> - Tích hợp với build tools như Webpack, Vite
> - Precaching tự động với content hash
>
> Trong dự án thực tế, tôi luôn dùng Workbox vì giảm bugs và code ít hơn nhiều."

### Câu 5: "Làm sao xử lý khi PWA có version mới?"

**Trả lời:**
> "Có 2 cách chính:
>
> 1. **Silent update**: Service Worker mới tự động activate khi user đóng tất cả tabs. Dùng cho minor updates.
>
> 2. **Prompt update**: Thông báo user có version mới, hỏi có muốn refresh không. Dùng cho major updates để user không bị confuse khi content thay đổi đột ngột.
>
> Tôi thường implement toast notification 'Có bản cập nhật mới' với button 'Cập nhật ngay'."

### Câu 6: "PWA có hạn chế gì?"

**Trả lời thẳng thắn:**
> "PWA có một số hạn chế:
>
> 1. **iOS support không đầy đủ**: Safari không hỗ trợ Push Notifications cho web (đến iOS 16.4 mới có), nhiều APIs bị hạn chế.
>
> 2. **Hardware access hạn chế**: Không access được Bluetooth, NFC, một số sensors như native app.
>
> 3. **Không có trên App Store**: Một số users chỉ biết tìm app trên Store.
>
> Tuy nhiên, cho content-based apps như e-commerce, news, social media, PWA vẫn là lựa chọn tốt vì ưu điểm về development cost và cross-platform."

---

## Tóm tắt: Những gì CẦN NHỚ

```
1. PWA = Web app + Native-like features
   - Cài được trên home screen
   - Hoạt động offline
   - Push notifications

2. SERVICE WORKER = Script chạy background
   - Intercept requests
   - Quyết định cache hay network
   - Lifecycle: Install → Wait → Activate → Idle

3. CACHING STRATEGIES
   - Cache First: Static assets
   - Network First: API data
   - Stale While Revalidate: Balance speed & freshness

4. MANIFEST.JSON = Metadata của app
   - Tên, icon, màu sắc
   - Cách hiển thị (standalone)

5. WORKBOX = Đừng viết SW từ đầu
   - Strategies có sẵn
   - Tích hợp build tools
   - Production-ready

6. HẠN CHẾ
   - iOS support không đầy đủ
   - Hardware access limited
```
