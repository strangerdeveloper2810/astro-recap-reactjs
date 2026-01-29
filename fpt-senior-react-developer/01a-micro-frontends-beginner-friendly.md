# Micro Frontends - Giải thích dễ hiểu cho Senior

> **Dành cho**: Người chưa làm nhiều với Micro Frontends
> **Mục tiêu**: Hiểu concept và có thể trả lời phỏng vấn tự tin

---

## Phần 1: Hiểu Micro Frontends theo cách đơn giản nhất

### 1.1 Ví dụ thực tế: Website bán hàng

Hãy tưởng tượng bạn đang build một website e-commerce như Shopee/Tiki:

```
┌─────────────────────────────────────────────────────────────┐
│                         SHOPEE                               │
├─────────────────────────────────────────────────────────────┤
│  [Header: Logo, Search, Cart, User]                         │
├───────────────┬─────────────────────┬───────────────────────┤
│   Sidebar     │    Product List     │    Recommendations    │
│   (Filters)   │    (Team Product)   │    (Team AI/ML)       │
│   (Team A)    │                     │                       │
├───────────────┴─────────────────────┴───────────────────────┤
│                    Shopping Cart                             │
│                    (Team Checkout)                           │
└─────────────────────────────────────────────────────────────┘
```

**Cách làm truyền thống (Monolith):**
- 1 repo chứa TẤT CẢ code
- 1 team phải phối hợp TẤT CẢ
- Deploy 1 lần cho TOÀN BỘ app
- Vấn đề: Team A sửa filter → phải đợi Team B sửa bug → mới deploy được

**Cách làm Micro Frontends:**
- Mỗi phần là 1 app riêng
- Mỗi team có repo riêng, deploy riêng
- Team Filter deploy lúc 9h, Team Product deploy lúc 2h → không conflict

### 1.2 Micro Frontends giống như... Lego

```
Hãy nghĩ website như một căn nhà Lego:

MONOLITH = Mua 1 bộ Lego hoàn chỉnh
- Phải build theo đúng hướng dẫn
- Thay đổi 1 phần = có thể ảnh hưởng cả nhà

MICRO FRONTENDS = Mua nhiều bộ Lego nhỏ
- Bộ "Phòng khách" (Team A)
- Bộ "Phòng ngủ" (Team B)
- Bộ "Nhà bếp" (Team C)
- Ghép lại thành nhà hoàn chỉnh
- Muốn thay phòng khách? Chỉ thay phần đó!
```

### 1.3 Khi nào THỰC SỰ cần Micro Frontends?

**CẦN khi:**
```
✅ Team lớn (10+ developers)
   - Nhiều người làm 1 repo = conflict liên tục
   - Merge code mỗi ngày = nightmare

✅ App phức tạp, nhiều domain
   - E-commerce: Product, Cart, Payment, User, Admin
   - Banking: Account, Transfer, Loan, Investment

✅ Cần deploy độc lập
   - Team Cart cần hotfix lúc 3h sáng
   - Không muốn ảnh hưởng Team Product đang nghỉ

✅ Migrate dần từ legacy
   - App Angular cũ, muốn chuyển sang React dần dần
   - Viết features mới bằng React, giữ cái cũ
```

**KHÔNG CẦN khi:**
```
❌ Team nhỏ (< 5 người)
   - Overhead > benefit
   - Communication dễ dàng

❌ Startup giai đoạn đầu
   - Cần ship nhanh
   - Requirements thay đổi liên tục

❌ App đơn giản
   - Landing page
   - Dashboard nhỏ
```

---

## Phần 2: Module Federation - Giải thích từ A-Z

### 2.1 Module Federation là gì?

**Tưởng tượng đơn giản:**

```
Bạn có 2 ứng dụng React chạy ở 2 URL khác nhau:

App 1 (Shell): http://localhost:3000
- Là "container" chính
- Chứa Header, Footer, Navigation

App 2 (Products): http://localhost:3001
- Chỉ chứa ProductList, ProductDetail
- Chạy độc lập

VẤN ĐỀ: Làm sao để Shell "nhúng" Products vào?

GIẢI PHÁP: Module Federation!
- Shell load ProductList từ http://localhost:3001
- Như đang import component từ npm package
- Nhưng code được load RUNTIME, không phải build time
```

### 2.2 Các khái niệm cần nhớ

```
┌─────────────────────────────────────────────────────────────┐
│                    MODULE FEDERATION                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HOST (Shell App)                                           │
│  ├── Ứng dụng "chủ nhà"                                     │
│  ├── Load các Remote apps vào                               │
│  └── Ví dụ: Main e-commerce app                             │
│                                                              │
│  REMOTE (Feature App)                                       │
│  ├── Ứng dụng "khách"                                       │
│  ├── Expose components cho Host sử dụng                     │
│  └── Ví dụ: Products app, Cart app                          │
│                                                              │
│  SHARED (Chung)                                             │
│  ├── Dependencies dùng chung                                │
│  ├── React, ReactDOM - chỉ load 1 lần                       │
│  └── Tránh duplicate code                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Ví dụ code đơn giản nhất

**Bước 1: Tạo Remote App (Products)**

```javascript
// products-app/webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      // TÊN của remote này
      name: 'productsApp',

      // File để Host tải
      filename: 'remoteEntry.js',

      // Components "cho phép" bên ngoài sử dụng
      exposes: {
        './ProductList': './src/ProductList',
      },

      // Dependencies dùng chung với Host
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

```jsx
// products-app/src/ProductList.jsx
// Component bình thường, không có gì đặc biệt!
function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div>
      <h2>Sản phẩm</h2>
      {products.map(p => (
        <div key={p.id}>{p.name} - {p.price}đ</div>
      ))}
    </div>
  );
}

export default ProductList;
```

**Bước 2: Tạo Host App (Shell)**

```javascript
// shell-app/webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',

      // Khai báo các Remote có thể load
      remotes: {
        // productsApp = tên, @ URL của remoteEntry.js
        productsApp: 'productsApp@http://localhost:3001/remoteEntry.js',
      },

      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

```jsx
// shell-app/src/App.jsx
import React, { Suspense, lazy } from 'react';

// Import REMOTE component như bình thường!
// Webpack sẽ tự động load từ http://localhost:3001
const ProductList = lazy(() => import('productsApp/ProductList'));

function App() {
  return (
    <div>
      <header>
        <h1>FPT Shop</h1>
      </header>

      <main>
        {/* Suspense để handle loading */}
        <Suspense fallback={<div>Đang tải sản phẩm...</div>}>
          <ProductList />
        </Suspense>
      </main>
    </div>
  );
}
```

**Kết quả:**
```
1. User truy cập http://localhost:3000 (Shell)
2. Shell render Header, Footer
3. Khi cần ProductList, Shell tải remoteEntry.js từ :3001
4. ProductList render bên trong Shell
5. User thấy như 1 app duy nhất!
```

### 2.4 Shared State giữa các Micro Frontends

**Vấn đề thực tế:**
```
User thêm sản phẩm vào giỏ hàng trong ProductList
→ Cart icon ở Header cần update số lượng
→ ProductList và Header là 2 apps khác nhau!
→ Làm sao share state?
```

**Giải pháp 1: Custom Events (Đơn giản nhất)**

```javascript
// Trong ProductList (remote)
function addToCart(product) {
  // Thêm vào local storage hoặc state
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));

  // Thông báo cho các apps khác
  window.dispatchEvent(new CustomEvent('cart-updated', {
    detail: { count: cart.length }
  }));
}

// Trong Header (shell)
function Header() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleCartUpdate = (event) => {
      setCartCount(event.detail.count);
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  return (
    <header>
      <span>🛒 {cartCount}</span>
    </header>
  );
}
```

**Giải pháp 2: Shared Store (Zustand)**

```javascript
// shared-store/src/cartStore.js - Deploy riêng hoặc share qua MF
import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
}));

// Expose qua Module Federation
// Cả ProductList và Header đều import từ shared-store
```

### 2.5 Handling Errors

```jsx
// Khi Remote app không load được (network error, deploy lỗi)
import { ErrorBoundary } from 'react-error-boundary';

function RemoteError({ error }) {
  return (
    <div className="error-container">
      <p>Không thể tải module. Vui lòng thử lại sau.</p>
      <button onClick={() => window.location.reload()}>
        Tải lại
      </button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={RemoteError}>
      <Suspense fallback={<Loading />}>
        <ProductList />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## Phần 3: Single-SPA - Khi cần mix nhiều framework

### 3.1 Single-SPA vs Module Federation

```
MODULE FEDERATION:
- Chủ yếu cho React ecosystem
- Webpack 5 required
- Share code giữa các React apps

SINGLE-SPA:
- Framework agnostic
- React + Vue + Angular cùng lúc
- Phù hợp khi migrate từ legacy
```

**Ví dụ thực tế:**
```
Công ty có hệ thống cũ:
- Admin Dashboard (Angular) - 50,000 lines code
- User Portal (jQuery) - 20,000 lines code

Muốn:
- Viết features mới bằng React
- Không muốn rewrite toàn bộ
- Gradual migration

→ Single-SPA là solution!
```

### 3.2 Cách hoạt động

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER                                 │
├─────────────────────────────────────────────────────────────┤
│                   SINGLE-SPA ROOT                            │
│     (Quản lý routing, mount/unmount các apps)               │
├───────────────┬───────────────┬───────────────┬─────────────┤
│   /dashboard  │   /products   │    /orders    │   /settings │
│   (Angular)   │   (React)     │    (Vue)      │   (React)   │
│               │               │               │             │
│  Team Legacy  │  Team FE 1    │   Team FE 2   │  Team FE 1  │
└───────────────┴───────────────┴───────────────┴─────────────┘

Khi user navigate:
- /dashboard → Mount Angular app, unmount others
- /products → Mount React app, unmount Angular
```

---

## Phần 4: Câu hỏi phỏng vấn - Trả lời dễ hiểu

### Câu 1: "Micro Frontends là gì?"

**Trả lời ngắn gọn:**
> "Micro Frontends là cách chia một ứng dụng frontend lớn thành nhiều ứng dụng nhỏ, độc lập. Mỗi phần được phát triển, test và deploy bởi một team riêng, sau đó được ghép lại thành một ứng dụng hoàn chỉnh cho người dùng."

**Thêm ví dụ nếu được hỏi tiếp:**
> "Ví dụ như Shopee, có thể chia thành: app tìm kiếm sản phẩm, app giỏ hàng, app thanh toán. Mỗi team chịu trách nhiệm một phần. Khi team Cart cần sửa bug, họ có thể deploy ngay mà không ảnh hưởng đến team Product."

### Câu 2: "Khi nào nên dùng Micro Frontends?"

**Trả lời:**
> "Tôi sẽ cân nhắc Micro Frontends khi:
>
> 1. **Team lớn** - Từ 10 developers trở lên, làm việc trên cùng codebase sẽ conflict nhiều
>
> 2. **Cần deploy độc lập** - Mỗi team có timeline riêng, không muốn đợi nhau
>
> 3. **Migrate từ legacy** - Có hệ thống Angular cũ, muốn chuyển dần sang React
>
> Nhưng với team nhỏ hoặc app đơn giản, tôi sẽ không dùng vì overhead lớn hơn lợi ích."

### Câu 3: "Module Federation hoạt động như thế nào?"

**Trả lời đơn giản:**
> "Module Federation cho phép một ứng dụng load code từ ứng dụng khác tại runtime.
>
> Ví dụ: Tôi có Shell app và Products app. Thay vì import ProductList như npm package (build time), Shell app tải ProductList từ Products app khi user cần (runtime).
>
> Cấu hình gồm 3 phần:
> - **Remote** expose components ra ngoài
> - **Host** khai báo những remotes nào sẽ dùng
> - **Shared** là dependencies dùng chung như React, tránh load 2 lần"

### Câu 4: "Làm sao share state giữa các Micro Frontends?"

**Trả lời:**
> "Có 3 cách phổ biến:
>
> 1. **Custom Events** - Đơn giản nhất. App A dispatch event, App B listen. Dùng cho communication đơn giản như 'product added to cart'.
>
> 2. **Shared Store** - Dùng Zustand hoặc Redux expose qua Module Federation. Các apps import cùng store. Dùng khi cần real-time sync.
>
> 3. **URL State** - Dùng URL params. Khi App A thay đổi filter, URL update, App B đọc từ URL.
>
> Nguyên tắc của tôi: Minimize shared state. Mỗi MFE nên độc lập nhất có thể."

### Câu 5: "Thách thức khi triển khai Micro Frontends?"

**Trả lời có kinh nghiệm:**
> "Từ những gì tôi tìm hiểu và nghiên cứu, có vài thách thức chính:
>
> 1. **CSS Conflict** - 2 apps có class `.button` khác nhau → fix bằng CSS Modules hoặc prefix
>
> 2. **Bundle Size** - Mỗi app tải React riêng → fix bằng shared config trong Module Federation
>
> 3. **Dev Experience** - Debug khó hơn khi code ở nhiều repos → cần tốt logging, source maps
>
> 4. **Versioning** - Remote update, Host bị break → cần semantic versioning, backward compatibility
>
> 5. **Performance** - Nhiều network requests → cần preload, CDN caching"

---

## Tóm tắt: Những gì CẦN NHỚ cho phỏng vấn

```
1. ĐỊNH NGHĨA
   - Chia app lớn thành nhiều app nhỏ, độc lập
   - Mỗi team develop, deploy riêng

2. KHI NÀO DÙNG
   - Team lớn (10+)
   - Cần deploy độc lập
   - Migrate từ legacy

3. 2 CÔNG NGHỆ CHÍNH
   - Module Federation: Webpack 5, React ecosystem
   - Single-SPA: Multi-framework (React + Vue + Angular)

4. SHARE STATE
   - Custom Events (đơn giản)
   - Shared Store (phức tạp)
   - URL State (bookmark-able)

5. CHALLENGES
   - CSS conflict
   - Bundle size
   - Dev experience
   - Versioning
```
