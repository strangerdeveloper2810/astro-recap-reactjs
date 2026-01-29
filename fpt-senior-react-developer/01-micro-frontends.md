# Micro Frontends - Kiến trúc Frontend phân tán

> **Vị trí**: Senior/Lead React Developer - FPT Software
> **Ngôn ngữ phỏng vấn**: Tiếng Việt
> **Mục tiêu**: Hiểu rõ và trả lời được các câu hỏi về Micro Frontends

---

## Mục lục

1. [Tổng quan về Micro Frontends](#1-tổng-quan-về-micro-frontends)
2. [Module Federation (Webpack 5)](#2-module-federation-webpack-5)
3. [Single-SPA Framework](#3-single-spa-framework)
4. [So sánh các phương pháp](#4-so-sánh-các-phương-pháp)
5. [Câu hỏi phỏng vấn thường gặp](#5-câu-hỏi-phỏng-vấn-thường-gặp)

---

## 1. Tổng quan về Micro Frontends

### 1.1 Micro Frontends là gì?

**Định nghĩa**: Micro Frontends là kiến trúc chia nhỏ ứng dụng frontend thành các phần độc lập, mỗi phần được phát triển, deploy và maintain bởi các team khác nhau.

**Ví dụ thực tế:**
```
┌─────────────────────────────────────────────────────────────┐
│                    E-commerce Website                        │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Header    │   Product   │   Cart      │   Checkout       │
│   (Team A)  │   (Team B)  │   (Team C)  │   (Team D)       │
│   React     │   Vue       │   React     │   Angular        │
│   v18       │   v3        │   v17       │   v15            │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

### 1.2 Khi nào nên dùng Micro Frontends?

**Nên dùng khi:**
- Team lớn (> 10 developers) cần làm việc song song
- Ứng dụng lớn, phức tạp, nhiều domain khác nhau
- Cần deploy độc lập các phần của ứng dụng
- Muốn sử dụng nhiều framework/công nghệ khác nhau
- Cần migrate dần từ legacy sang công nghệ mới

**KHÔNG nên dùng khi:**
- Team nhỏ (< 5 người)
- Ứng dụng đơn giản
- Startup giai đoạn đầu (cần tốc độ phát triển)
- Không có DevOps infrastructure đủ mạnh

### 1.3 Các phương pháp triển khai Micro Frontends

| Phương pháp | Mô tả | Ưu điểm | Nhược điểm |
|-------------|-------|---------|------------|
| **Build-time** | Các MFE là npm packages | Đơn giản, type-safe | Phải deploy lại shell khi update |
| **Run-time (Iframe)** | Mỗi MFE trong iframe | Isolation tốt nhất | Performance kém, UX khó |
| **Run-time (JavaScript)** | Load JS runtime | Flexible, share state được | Phức tạp, conflict CSS/JS |
| **Module Federation** | Webpack 5 native | Best of both worlds | Cần Webpack 5+ |
| **Single-SPA** | Framework agnostic | Hỗ trợ nhiều framework | Learning curve cao |

---

## 2. Module Federation (Webpack 5)

### 2.1 Module Federation là gì?

**Module Federation** là tính năng của Webpack 5 cho phép một ứng dụng JavaScript load code từ ứng dụng khác tại runtime.

**Khái niệm chính:**
- **Host (Shell)**: Ứng dụng chính, container chứa các micro frontends
- **Remote**: Micro frontend được load vào host
- **Shared**: Dependencies dùng chung giữa host và remotes

### 2.2 Cấu hình Module Federation

**Remote App (Product Team):**

```javascript
// webpack.config.js của Remote (Product MFE)
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      // Tên unique của remote
      name: 'productApp',

      // File entry point
      filename: 'remoteEntry.js',

      // Các module được expose ra ngoài
      exposes: {
        './ProductList': './src/components/ProductList',
        './ProductDetail': './src/components/ProductDetail',
      },

      // Dependencies dùng chung
      shared: {
        react: {
          singleton: true,      // Chỉ load 1 instance
          requiredVersion: '^18.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0',
        },
      },
    }),
  ],
};
```

**Host App (Shell):**

```javascript
// webpack.config.js của Host (Shell)
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',

      // Khai báo các remotes
      remotes: {
        // Format: name@url/filename
        productApp: 'productApp@http://localhost:3001/remoteEntry.js',
        cartApp: 'cartApp@http://localhost:3002/remoteEntry.js',
      },

      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

### 2.3 Sử dụng Remote Component trong Host

```tsx
// Shell App - src/App.tsx
import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Dynamic import từ remote
const ProductList = lazy(() => import('productApp/ProductList'));
const Cart = lazy(() => import('cartApp/Cart'));

// Fallback component khi loading
const Loading = () => <div className="loading-spinner">Đang tải...</div>;

// Fallback khi remote fail
const RemoteError = ({ error, resetErrorBoundary }) => (
  <div className="remote-error">
    <p>Không thể tải module: {error.message}</p>
    <button onClick={resetErrorBoundary}>Thử lại</button>
  </div>
);

function App() {
  return (
    <div className="app">
      <header>
        <h1>FPT E-Commerce</h1>
      </header>

      <main>
        {/* Wrap remote components với Error Boundary và Suspense */}
        <ErrorBoundary FallbackComponent={RemoteError}>
          <Suspense fallback={<Loading />}>
            <ProductList />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary FallbackComponent={RemoteError}>
          <Suspense fallback={<Loading />}>
            <Cart />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
```

### 2.4 TypeScript với Module Federation

```typescript
// src/types/remotes.d.ts
declare module 'productApp/ProductList' {
  import { ComponentType } from 'react';

  interface ProductListProps {
    categoryId?: string;
    onProductClick?: (productId: string) => void;
  }

  const ProductList: ComponentType<ProductListProps>;
  export default ProductList;
}

declare module 'cartApp/Cart' {
  import { ComponentType } from 'react';

  interface CartProps {
    userId: string;
    onCheckout?: () => void;
  }

  const Cart: ComponentType<CartProps>;
  export default Cart;
}
```

### 2.5 Shared State giữa các Micro Frontends

**Cách 1: Event Bus (Custom Events)**

```typescript
// shared/eventBus.ts
type EventCallback = (data: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }

  publish(event: string, data: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Usage trong Product MFE
eventBus.publish('PRODUCT_ADDED_TO_CART', { productId: '123', quantity: 1 });

// Usage trong Cart MFE
eventBus.subscribe('PRODUCT_ADDED_TO_CART', (data) => {
  addToCart(data.productId, data.quantity);
});
```

**Cách 2: Shared Store (Zustand)**

```typescript
// shared/store.ts - Expose qua Module Federation
import { create } from 'zustand';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface SharedStore {
  cartItems: CartItem[];
  user: { id: string; name: string } | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  setUser: (user: { id: string; name: string } | null) => void;
}

export const useSharedStore = create<SharedStore>((set) => ({
  cartItems: [],
  user: null,

  addToCart: (item) => set((state) => ({
    cartItems: [...state.cartItems, item],
  })),

  removeFromCart: (productId) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.productId !== productId),
  })),

  setUser: (user) => set({ user }),
}));
```

---

## 3. Single-SPA Framework

### 3.1 Single-SPA là gì?

**Single-SPA** là framework cho phép kết hợp nhiều JavaScript microfrontends trong một ứng dụng. Hỗ trợ React, Vue, Angular, Svelte, và vanilla JS.

### 3.2 Kiến trúc Single-SPA

```
┌─────────────────────────────────────────────────────────────┐
│                      Root Config                             │
│            (Đăng ký và điều phối các MFEs)                  │
├─────────────────────────────────────────────────────────────┤
│                     Import Maps                              │
│         (Map tên module → URL của các MFEs)                 │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   @org/     │   @org/     │   @org/     │   @org/          │
│   navbar    │   products  │   cart      │   checkout       │
│   (React)   │   (React)   │   (Vue)     │   (Angular)      │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

### 3.3 Cấu hình Root Config

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <script type="systemjs-importmap">
    {
      "imports": {
        "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.9.0/lib/system/single-spa.min.js",
        "react": "https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js",
        "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js",
        "@fpt/root-config": "http://localhost:9000/fpt-root-config.js",
        "@fpt/navbar": "http://localhost:8001/fpt-navbar.js",
        "@fpt/products": "http://localhost:8002/fpt-products.js",
        "@fpt/cart": "http://localhost:8003/fpt-cart.js"
      }
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/systemjs/dist/system.js"></script>
</head>
<body>
  <script>
    System.import('@fpt/root-config');
  </script>
</body>
</html>
```

```javascript
// root-config.js
import { registerApplication, start } from 'single-spa';

// Đăng ký Navbar - luôn hiển thị
registerApplication({
  name: '@fpt/navbar',
  app: () => System.import('@fpt/navbar'),
  activeWhen: ['/'],  // Luôn active
});

// Đăng ký Products - chỉ hiển thị ở /products
registerApplication({
  name: '@fpt/products',
  app: () => System.import('@fpt/products'),
  activeWhen: ['/products'],
});

// Đăng ký Cart - chỉ hiển thị ở /cart
registerApplication({
  name: '@fpt/cart',
  app: () => System.import('@fpt/cart'),
  activeWhen: ['/cart'],
  customProps: {
    // Props truyền vào MFE
    authToken: () => localStorage.getItem('token'),
  },
});

// Bắt đầu single-spa
start({
  urlRerouteOnly: true,
});
```

### 3.4 Tạo React Micro Frontend với Single-SPA

```tsx
// src/fpt-products.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';

// Lifecycle functions cho single-spa
const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,

  // Element để mount vào
  domElementGetter: () => document.getElementById('products-container'),

  // Error boundary
  errorBoundary(err, info, props) {
    return <div>Lỗi khi load Products: {err.message}</div>;
  },
});

// Export lifecycle functions
export const { bootstrap, mount, unmount } = lifecycles;
```

```javascript
// webpack.config.js cho single-spa MFE
const { merge } = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-react-ts');

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: 'fpt',
    projectName: 'products',
    webpackConfigEnv,
    argv,
  });

  return merge(defaultConfig, {
    externals: ['react', 'react-dom'],
    output: {
      libraryTarget: 'system',
    },
  });
};
```

### 3.5 Communication giữa các MFEs trong Single-SPA

```typescript
// Utility Micro Frontend cho shared logic
// @fpt/utility/src/auth.ts

import { BehaviorSubject } from 'rxjs';

interface User {
  id: string;
  name: string;
  role: string;
}

// Observable cho user state
const userSubject = new BehaviorSubject<User | null>(null);

export const authService = {
  user$: userSubject.asObservable(),

  getUser: () => userSubject.getValue(),

  setUser: (user: User | null) => {
    userSubject.next(user);
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const user = await response.json();
    userSubject.next(user);
    return user;
  },

  logout: () => {
    userSubject.next(null);
    localStorage.removeItem('token');
  },
};

// Usage trong Products MFE
import { authService } from '@fpt/utility';

function ProductList() {
  const [user, setUser] = useState(authService.getUser());

  useEffect(() => {
    const subscription = authService.user$.subscribe(setUser);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {user ? (
        <p>Xin chào, {user.name}</p>
      ) : (
        <p>Vui lòng đăng nhập</p>
      )}
    </div>
  );
}
```

---

## 4. So sánh các phương pháp

### 4.1 Module Federation vs Single-SPA

| Tiêu chí | Module Federation | Single-SPA |
|----------|-------------------|------------|
| **Bundler** | Webpack 5 only | Bất kỳ (Webpack, Rollup, Vite) |
| **Framework** | Chủ yếu React | Multi-framework |
| **Learning curve** | Thấp hơn | Cao hơn |
| **Shared deps** | Built-in, tối ưu | Cần cấu hình thêm |
| **Build tool** | Integrated | Separate tooling |
| **Dev experience** | Tốt hơn | Phức tạp hơn |
| **Production ready** | Cao | Cao |
| **Community** | Đang phát triển | Mature |

### 4.2 Khi nào chọn gì?

**Chọn Module Federation khi:**
- Đã dùng Webpack 5
- Chủ yếu React ecosystem
- Team quen với Webpack
- Cần tối ưu bundle size

**Chọn Single-SPA khi:**
- Nhiều framework khác nhau (React + Vue + Angular)
- Cần migrate từ legacy app
- Team có kinh nghiệm với micro frontends
- Cần routing phức tạp giữa các MFEs

---

## 5. Câu hỏi phỏng vấn thường gặp

### Câu hỏi 1: "Micro Frontends là gì? Khi nào nên sử dụng?"

**Trả lời:**
> "Micro Frontends là kiến trúc chia ứng dụng frontend thành các phần nhỏ, độc lập. Mỗi phần được phát triển, test và deploy riêng biệt bởi các team khác nhau.
>
> Tôi sẽ sử dụng Micro Frontends khi:
> - Team lớn, cần làm việc song song mà không conflict
> - Ứng dụng lớn với nhiều domain nghiệp vụ khác nhau
> - Cần deploy độc lập các phần của ứng dụng
> - Đang migrate dần từ legacy sang công nghệ mới
>
> Tuy nhiên, với team nhỏ hoặc ứng dụng đơn giản, tôi sẽ không khuyến khích vì overhead về infrastructure và complexity khá cao."

---

### Câu hỏi 2: "Module Federation hoạt động như thế nào?"

**Trả lời:**
> "Module Federation là tính năng của Webpack 5 cho phép chia sẻ code giữa các ứng dụng tại runtime.
>
> Cách hoạt động:
> 1. **Remote app** expose các module thông qua file `remoteEntry.js`
> 2. **Host app** khai báo các remotes và load dynamic
> 3. **Shared dependencies** được quản lý để tránh duplicate, ví dụ React chỉ load 1 lần
>
> Ưu điểm chính là không cần rebuild host khi remote thay đổi, và shared dependencies được tối ưu tự động. Tôi thường wrap remote components trong Error Boundary và Suspense để handle lỗi network gracefully."

---

### Câu hỏi 3: "Làm sao để chia sẻ state giữa các Micro Frontends?"

**Trả lời:**
> "Có nhiều cách để share state giữa các MFEs, tôi thường dùng theo độ phức tạp:
>
> **Cách 1 - Custom Events** (đơn giản nhất):
> Dùng browser's CustomEvent để publish/subscribe. Phù hợp cho communication đơn giản như thông báo 'product added to cart'.
>
> **Cách 2 - Shared Store** (phức tạp hơn):
> Expose một store (như Zustand) qua Module Federation. Các MFEs import và dùng chung store này. Ưu điểm là type-safe và reactive.
>
> **Cách 3 - URL State**:
> Dùng URL params cho shared state. Phù hợp cho state cần bookmark/share như filters, search query.
>
> Nguyên tắc của tôi là minimize shared state, mỗi MFE nên độc lập nhất có thể. Chỉ share những gì thực sự cần thiết như user info, cart count."

---

### Câu hỏi 4: "Single-SPA khác gì Module Federation?"

**Trả lời:**
> "Hai công nghệ này giải quyết vấn đề tương tự nhưng khác cách tiếp cận:
>
> **Module Federation:**
> - Là tính năng của Webpack 5, tích hợp sẵn
> - Tốt cho React-centric projects
> - Share dependencies tối ưu hơn
> - Learning curve thấp hơn
>
> **Single-SPA:**
> - Là framework standalone, không phụ thuộc bundler
> - Hỗ trợ nhiều framework (React, Vue, Angular cùng lúc)
> - Có sẵn routing và lifecycle management
> - Phù hợp khi migrate từ legacy
>
> Nếu project chỉ dùng React và đã có Webpack 5, tôi sẽ chọn Module Federation. Nếu cần mix nhiều framework hoặc migrate từ legacy, Single-SPA là lựa chọn tốt hơn."

---

### Câu hỏi 5: "Thách thức khi triển khai Micro Frontends và cách giải quyết?"

**Trả lời:**
> "Có một số thách thức chính:
>
> **1. CSS Isolation:**
> - Vấn đề: CSS conflict giữa các MFEs
> - Giải pháp: Dùng CSS Modules, CSS-in-JS (Styled Components), hoặc prefix convention
>
> **2. Shared Dependencies:**
> - Vấn đề: Bundle size lớn do duplicate libraries
> - Giải pháp: Cấu hình shared trong Module Federation với singleton: true
>
> **3. Versioning:**
> - Vấn đề: Remote update breaking host
> - Giải pháp: Semantic versioning, backward compatibility, và fallback UI
>
> **4. Developer Experience:**
> - Vấn đề: Khó debug khi code ở nhiều repos
> - Giải pháp: Monorepo (Nx/Turborepo), source maps, unified logging
>
> **5. Performance:**
> - Vấn đề: Nhiều network requests
> - Giải pháp: Preload remotes, caching, CDN cho remoteEntry.js"

---

### Câu hỏi 6: "Bạn đã triển khai Micro Frontends trong dự án thực tế chưa?"

**Trả lời (ví dụ):**
> "Dạ, tôi đã có kinh nghiệm với Micro Frontends trong dự án e-commerce tại [công ty].
>
> **Bối cảnh:**
> - Team 15 developers, chia thành 4 squads
> - Cần deploy features độc lập cho từng team
>
> **Giải pháp:**
> - Sử dụng Module Federation với Webpack 5
> - Shell app quản lý routing và authentication
> - 4 remotes: Product, Cart, Checkout, User Profile
>
> **Kết quả:**
> - Giảm thời gian deploy từ 2 giờ xuống 15 phút
> - Các team làm việc độc lập, không conflict
> - Tuy nhiên, setup ban đầu mất khoảng 2 sprint
>
> **Bài học:**
> - Cần define contract rõ ràng giữa các MFEs
> - Shared component library rất quan trọng
> - Monitoring và logging phải centralized"

---

## Tài liệu tham khảo

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Single-SPA Documentation](https://single-spa.js.org/)
- [Micro Frontends - Martin Fowler](https://martinfowler.com/articles/micro-frontends.html)
- [Module Federation Examples](https://github.com/module-federation/module-federation-examples)
