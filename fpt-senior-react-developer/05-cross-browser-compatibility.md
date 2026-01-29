# Cross-Browser Compatibility

> **Vị trí**: Senior/Lead React Developer - FPT Software
> **Ngôn ngữ phỏng vấn**: Tiếng Việt
> **Mục tiêu**: Hiểu rõ các vấn đề cross-browser và cách giải quyết

---

## Mục lục

1. [Tổng quan Cross-Browser Compatibility](#1-tổng-quan-cross-browser-compatibility)
2. [CSS Compatibility](#2-css-compatibility)
3. [JavaScript Compatibility](#3-javascript-compatibility)
4. [Testing Cross-Browser](#4-testing-cross-browser)
5. [Polyfills và Transpilation](#5-polyfills-và-transpilation)
6. [Best Practices](#6-best-practices)
7. [Câu hỏi phỏng vấn thường gặp](#7-câu-hỏi-phỏng-vấn-thường-gặp)

---

## 1. Tổng quan Cross-Browser Compatibility

### 1.1 Cross-Browser Compatibility là gì?

**Cross-browser compatibility** đảm bảo website hoạt động nhất quán trên các browsers khác nhau (Chrome, Firefox, Safari, Edge).

### 1.2 Tại sao có vấn đề compatibility?

```
┌─────────────────────────────────────────────────────────────┐
│              WHY BROWSERS BEHAVE DIFFERENTLY                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Different Rendering Engines                              │
│     ├── Chrome, Edge: Blink                                  │
│     ├── Firefox: Gecko                                       │
│     └── Safari: WebKit                                       │
│                                                              │
│  2. Different JavaScript Engines                             │
│     ├── Chrome, Edge: V8                                     │
│     ├── Firefox: SpiderMonkey                                │
│     └── Safari: JavaScriptCore                               │
│                                                              │
│  3. Feature Implementation Timeline                          │
│     └── Browsers implement new features at different times   │
│                                                              │
│  4. Legacy Browser Versions                                  │
│     └── Users may use outdated browsers                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Browser Market Share (2024-2025)

| Browser | Desktop | Mobile | Rendering Engine |
|---------|---------|--------|------------------|
| Chrome | ~65% | ~65% | Blink |
| Safari | ~10% | ~25% | WebKit |
| Edge | ~5% | ~1% | Blink |
| Firefox | ~3% | ~0.5% | Gecko |
| Samsung Internet | <1% | ~5% | Blink |

### 1.4 Xác định Target Browsers

**Cách 1: Browserslist**

```json
// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not IE 11"
  ]
}
```

```
// .browserslistrc
> 1%
last 2 versions
not dead
not IE 11

# Hoặc specific
chrome >= 90
firefox >= 88
safari >= 14
edge >= 90
```

**Cách 2: Analytics-based**
- Dựa trên Google Analytics của project
- Focus browsers có >1% traffic

---

## 2. CSS Compatibility

### 2.1 Vendor Prefixes

**Vấn đề:** Một số CSS properties cần vendor prefixes.

```css
/* Cần vendor prefixes */
.box {
  -webkit-backdrop-filter: blur(10px); /* Safari */
  backdrop-filter: blur(10px);

  -webkit-user-select: none; /* Safari */
  -moz-user-select: none;    /* Firefox */
  user-select: none;
}

/* Flexbox (old syntax) */
.flex-container {
  display: -webkit-box;      /* OLD Safari */
  display: -webkit-flex;     /* Chrome 21-28 */
  display: flex;

  -webkit-box-orient: horizontal;
  -webkit-flex-direction: row;
  flex-direction: row;
}
```

**Giải pháp: Autoprefixer**

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
  ],
};

// Hoặc trong Vite
import autoprefixer from 'autoprefixer';

export default {
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
};
```

### 2.2 CSS Features với Support hạn chế

**Container Queries (Safari 16+, Chrome 105+)**

```css
/* Không phải tất cả browsers đều support */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}

/* Fallback */
@supports not (container-type: inline-size) {
  @media (min-width: 400px) {
    .card {
      flex-direction: row;
    }
  }
}
```

**CSS Grid (IE không support đầy đủ)**

```css
.grid-container {
  /* Fallback cho browsers cũ */
  display: flex;
  flex-wrap: wrap;

  /* Modern browsers */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* Feature query */
@supports (display: grid) {
  .grid-container {
    display: grid;
  }
}
```

**Aspect Ratio (Safari 15+)**

```css
.video-container {
  /* Fallback: padding hack */
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Modern: aspect-ratio */
@supports (aspect-ratio: 16 / 9) {
  .video-container {
    padding-bottom: 0;
    height: auto;
    aspect-ratio: 16 / 9;
  }

  .video-container iframe {
    position: static;
  }
}
```

### 2.3 CSS Reset / Normalize

**Normalize.css** - Giữ default styles hữu ích, fix inconsistencies:

```css
/* normalize.css excerpt */
html {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
}

main {
  display: block; /* IE */
}

h1 {
  font-size: 2em;
  margin: 0.67em 0;
}

a {
  background-color: transparent; /* IE */
}

img {
  border-style: none; /* IE */
}

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}
```

**CSS Reset** - Reset tất cả về baseline:

```css
/* Modern CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  line-height: 1.5;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
```

### 2.4 Safari-Specific Issues

**1. Smooth scrolling:**
```css
html {
  scroll-behavior: smooth;
}

/* Safari iOS - cần -webkit-overflow-scrolling */
.scroll-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

**2. Position: fixed trong scroll containers:**
```css
/* Safari bug: fixed không work trong transform parent */
.modal {
  position: fixed;
  /* Workaround: đặt modal ngoài transformed elements */
}
```

**3. Flexbox bugs:**
```css
/* Safari: min-height không work với flex children */
.flex-parent {
  display: flex;
  min-height: 100vh;
}

.flex-child {
  flex: 1;
  /* Workaround */
  min-height: 0;
  height: 100%;
}
```

**4. Input zoom on iOS:**
```css
/* iOS zoom input khi font-size < 16px */
input, select, textarea {
  font-size: 16px; /* Prevent zoom */
}

/* Hoặc disable viewport zoom */
/* <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"> */
```

---

## 3. JavaScript Compatibility

### 3.1 ES6+ Features

**Cần transpile cho browsers cũ:**

```javascript
// ES6+ syntax cần Babel
const arrowFn = () => {};
const { a, b } = obj;
const newArr = [...arr];
class MyClass {}
async function fetchData() {}
const value = obj?.nested?.prop;
const result = value ?? 'default';
```

### 3.2 Babel Configuration

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'not dead'],
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
```

### 3.3 Browser APIs với Support hạn chế

**Intersection Observer (IE không support):**

```javascript
// Kiểm tra support
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(callback, options);
  observer.observe(element);
} else {
  // Fallback: scroll event listener
  window.addEventListener('scroll', handleScroll);
}

// Hoặc dùng polyfill
// npm install intersection-observer
import 'intersection-observer';
```

**ResizeObserver (Safari 13.1+):**

```javascript
if ('ResizeObserver' in window) {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      console.log('Size changed:', entry.contentRect);
    }
  });
  observer.observe(element);
} else {
  // Fallback
  window.addEventListener('resize', handleResize);
}
```

**Web APIs cần check:**

```javascript
// Local Storage
if (typeof Storage !== 'undefined') {
  localStorage.setItem('key', 'value');
}

// Fetch API
if ('fetch' in window) {
  fetch('/api/data');
} else {
  // Use XMLHttpRequest or polyfill
}

// Clipboard API
if (navigator.clipboard) {
  await navigator.clipboard.writeText(text);
} else {
  // Fallback: document.execCommand
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// Share API
if (navigator.share) {
  await navigator.share({ title, text, url });
} else {
  // Fallback: copy link
}
```

### 3.4 Event Handling Differences

```javascript
// Passive event listeners (performance)
element.addEventListener('scroll', handler, { passive: true });

// Check support
let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: () => { supportsPassive = true; }
  });
  window.addEventListener('test', null, opts);
} catch (e) {}

element.addEventListener(
  'scroll',
  handler,
  supportsPassive ? { passive: true } : false
);
```

```javascript
// Pointer events vs Touch events
if ('PointerEvent' in window) {
  element.addEventListener('pointerdown', handleStart);
  element.addEventListener('pointermove', handleMove);
  element.addEventListener('pointerup', handleEnd);
} else {
  // Touch events fallback
  element.addEventListener('touchstart', handleStart);
  element.addEventListener('touchmove', handleMove);
  element.addEventListener('touchend', handleEnd);
}
```

### 3.5 Date và Intl

```javascript
// Intl.DateTimeFormat (check locale support)
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'full',
  timeStyle: 'short',
});

// Check specific locale support
const localeSupported = Intl.DateTimeFormat.supportedLocalesOf(['vi-VN']).length > 0;

// Intl.NumberFormat
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

// Intl.RelativeTimeFormat (Safari 14+)
if ('RelativeTimeFormat' in Intl) {
  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
  console.log(rtf.format(-1, 'day')); // "hôm qua"
}
```

---

## 4. Testing Cross-Browser

### 4.1 Testing Tools

| Tool | Type | Description |
|------|------|-------------|
| **BrowserStack** | Cloud | Real devices, automated testing |
| **Sauce Labs** | Cloud | Cross-browser, CI integration |
| **LambdaTest** | Cloud | Screenshot comparison |
| **Playwright** | Local | Multi-browser automation |
| **Cypress** | Local | E2E testing |

### 4.2 Playwright Multi-Browser Testing

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },

    // Branded browsers
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
```

```typescript
// tests/cross-browser.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cross-browser tests', () => {
  test('should render correctly', async ({ page, browserName }) => {
    await page.goto('/');

    // Screenshot comparison
    await expect(page).toHaveScreenshot(`home-${browserName}.png`);
  });

  test('should handle form submission', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should work with JavaScript features', async ({ page }) => {
    await page.goto('/features');

    // Test IntersectionObserver
    await page.evaluate(() => {
      return 'IntersectionObserver' in window;
    }).then((hasIO) => {
      console.log('IntersectionObserver:', hasIO);
    });
  });
});
```

### 4.3 Cypress Cross-Browser

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Chạy trên browsers khác nhau
    // npx cypress run --browser chrome
    // npx cypress run --browser firefox
    // npx cypress run --browser edge
  },
});

// Trong CI
// jobs:
//   test:
//     strategy:
//       matrix:
//         browser: [chrome, firefox, edge]
//     steps:
//       - run: npx cypress run --browser ${{ matrix.browser }}
```

### 4.4 Visual Regression Testing

```typescript
// playwright.config.ts
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
});

// Test visual regression
test('visual regression', async ({ page }) => {
  await page.goto('/');

  // Full page screenshot
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
  });

  // Element screenshot
  await expect(page.locator('.hero')).toHaveScreenshot('hero.png');
});
```

### 4.5 Feature Detection Testing

```javascript
// src/utils/featureDetection.js
export const features = {
  intersectionObserver: 'IntersectionObserver' in window,
  resizeObserver: 'ResizeObserver' in window,
  webAnimations: 'animate' in Element.prototype,
  cssGrid: CSS.supports('display', 'grid'),
  cssContainerQueries: CSS.supports('container-type', 'inline-size'),
  webShare: 'share' in navigator,
  webPush: 'PushManager' in window,
  serviceWorker: 'serviceWorker' in navigator,
  webGL: (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  })(),
};

export function logFeatureSupport() {
  console.table(features);
}
```

---

## 5. Polyfills và Transpilation

### 5.1 Polyfills là gì?

**Polyfill** là code thêm functionality bị thiếu cho browsers cũ.

### 5.2 Core-js

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage', // Chỉ include polyfills cần thiết
        corejs: 3,
      },
    ],
  ],
};
```

**useBuiltIns options:**
- `'usage'`: Tự động thêm polyfills dựa trên code
- `'entry'`: Import tất cả polyfills ở entry point
- `false`: Không thêm polyfills

```javascript
// Với useBuiltIns: 'entry'
// Entry file
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### 5.3 Polyfill.io (Dynamic)

```html
<!-- Load polyfills dựa trên User-Agent -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=default,fetch,IntersectionObserver"></script>
```

### 5.4 Specific Polyfills

```javascript
// intersection-observer
import 'intersection-observer';

// resize-observer
import 'resize-observer-polyfill';

// fetch
import 'whatwg-fetch';

// AbortController
import 'abortcontroller-polyfill';

// smooth scroll
import smoothscroll from 'smoothscroll-polyfill';
smoothscroll.polyfill();

// focus-visible
import 'focus-visible';
```

### 5.5 Conditional Polyfill Loading

```javascript
// Chỉ load polyfill khi cần
async function loadPolyfills() {
  const polyfills = [];

  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }

  if (!('ResizeObserver' in window)) {
    polyfills.push(import('resize-observer-polyfill'));
  }

  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }

  await Promise.all(polyfills);
}

// Load trước khi app start
loadPolyfills().then(() => {
  // Start app
  ReactDOM.render(<App />, document.getElementById('root'));
});
```

### 5.6 Modern/Legacy Build

```javascript
// vite.config.ts - Build cho cả modern và legacy
import legacy from '@vitejs/plugin-legacy';

export default {
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
};
```

**HTML output:**
```html
<!-- Modern browsers -->
<script type="module" src="/assets/main.js"></script>

<!-- Legacy browsers -->
<script nomodule src="/assets/main-legacy.js"></script>
```

---

## 6. Best Practices

### 6.1 Progressive Enhancement

```javascript
// Base functionality works everywhere
// Enhanced features for modern browsers

// Base: Works without JS
<form action="/search" method="GET">
  <input type="text" name="q" />
  <button type="submit">Search</button>
</form>

// Enhanced: AJAX search with JS
const form = document.querySelector('form');
if ('fetch' in window) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = await fetch(`/api/search?q=${input.value}`);
    // Render results
  });
}
```

### 6.2 Feature Detection

```javascript
// Don't detect browser, detect features
// Bad
if (navigator.userAgent.includes('Safari')) {
  // Safari-specific code
}

// Good
if (CSS.supports('backdrop-filter', 'blur(10px)')) {
  // Use backdrop-filter
} else {
  // Use fallback
}
```

### 6.3 Graceful Degradation

```css
/* Provide fallbacks */
.card {
  /* Fallback for older browsers */
  background: rgba(255, 255, 255, 0.9);

  /* Modern browsers */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}

@supports not (backdrop-filter: blur(10px)) {
  .card {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

### 6.4 Testing Checklist

```markdown
## Cross-Browser Testing Checklist

### Visual
- [ ] Layout displays correctly
- [ ] Fonts render properly
- [ ] Images load and scale
- [ ] Animations work smoothly
- [ ] Icons/SVGs display correctly

### Functional
- [ ] Forms submit correctly
- [ ] Links navigate properly
- [ ] JavaScript features work
- [ ] Touch/mouse interactions
- [ ] Keyboard navigation

### Performance
- [ ] Page loads in reasonable time
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Lazy loading works

### Browsers to Test
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Safari iOS
- [ ] Chrome Android
```

### 6.5 Debugging Browser-Specific Issues

```javascript
// Detect browser for debugging
const getBrowser = () => {
  const ua = navigator.userAgent;

  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
  if (ua.includes('Edge')) return 'edge';
  if (ua.includes('Chrome')) return 'chrome';

  return 'unknown';
};

// Conditional debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Browser:', getBrowser());
  console.log('Features:', {
    grid: CSS.supports('display', 'grid'),
    io: 'IntersectionObserver' in window,
  });
}
```

---

## 7. Câu hỏi phỏng vấn thường gặp

### Câu hỏi 1: "Cross-browser compatibility là gì? Tại sao quan trọng?"

**Trả lời:**
> "Cross-browser compatibility đảm bảo website hoạt động nhất quán trên các browsers khác nhau như Chrome, Firefox, Safari, Edge.
>
> **Quan trọng vì:**
> - Users dùng nhiều browsers khác nhau
> - Mỗi browser có rendering engine khác: Blink (Chrome), Gecko (Firefox), WebKit (Safari)
> - Features mới được implement ở thời điểm khác nhau
> - Enterprise clients thường dùng browsers cũ hơn
>
> **Ảnh hưởng:**
> - UX không nhất quán → users frustration
> - Bugs chỉ xuất hiện trên browsers cụ thể
> - Accessibility issues
> - SEO bị ảnh hưởng nếu content không render đúng"

---

### Câu hỏi 2: "Làm sao để handle CSS compatibility?"

**Trả lời:**
> "Có nhiều kỹ thuật:
>
> **1. Vendor Prefixes:**
> - Dùng Autoprefixer để tự động thêm prefixes
> - Cấu hình browserslist cho target browsers
>
> **2. Feature Queries (@supports):**
> ```css
> @supports (display: grid) {
>   .container { display: grid; }
> }
> ```
>
> **3. CSS Reset/Normalize:**
> - Normalize.css để consistent cross-browser defaults
>
> **4. Fallbacks:**
> - Luôn có fallback cho CSS mới
> - Ví dụ: flexbox fallback cho grid
>
> **5. Testing:**
> - Test trên real browsers, không chỉ Chrome DevTools
> - Visual regression testing với Playwright"

---

### Câu hỏi 3: "Polyfill là gì? Khi nào cần dùng?"

**Trả lời:**
> "Polyfill là code JavaScript thêm functionality mà browser không native support.
>
> **Ví dụ:**
> - `fetch` polyfill cho IE11
> - `IntersectionObserver` polyfill cho browsers cũ
>
> **Khi nào dùng:**
> - Target browsers không support feature cần thiết
> - Feature quan trọng cho core functionality
>
> **Cách sử dụng:**
> 1. **Core-js với Babel**: Tự động thêm polyfills dựa trên code và browserslist
> 2. **Polyfill.io**: Dynamic loading dựa trên User-Agent
> 3. **Conditional loading**: Chỉ load khi browser không support
>
> **Lưu ý:**
> - Polyfills tăng bundle size
> - Dùng `useBuiltIns: 'usage'` để chỉ include cần thiết
> - Modern/Legacy build để optimize cho modern browsers"

---

### Câu hỏi 4: "Feature detection vs Browser detection?"

**Trả lời:**
> "**Feature detection** kiểm tra browser có support feature không.
> **Browser detection** kiểm tra đang dùng browser gì.
>
> **Nên dùng Feature Detection:**
> ```javascript
> // Good
> if ('IntersectionObserver' in window) {
>   // Use IntersectionObserver
> }
>
> // Bad
> if (navigator.userAgent.includes('Chrome')) {
>   // Assume Chrome has feature
> }
> ```
>
> **Tại sao Feature Detection tốt hơn:**
> - Browser versions thay đổi liên tục
> - User-Agent có thể bị spoof
> - Một feature có thể được thêm/bớt giữa các versions
> - Code rõ ràng hơn về intent
>
> **CSS Feature Detection:**
> ```css
> @supports (display: grid) {
>   /* Use grid */
> }
> ```"

---

### Câu hỏi 5: "Làm sao test cross-browser hiệu quả?"

**Trả lời:**
> "Tôi dùng combination of tools và strategies:
>
> **1. Local Testing:**
> - Playwright với multiple browsers (chromium, firefox, webkit)
> - Chạy tests trong CI với matrix strategy
>
> **2. Cloud Testing:**
> - BrowserStack cho real devices
> - Especially cho Safari iOS (không test được local trên Windows/Linux)
>
> **3. Visual Regression:**
> - Screenshot comparison với Playwright
> - Detect visual differences automatically
>
> **4. Manual Testing:**
> - Critical user flows trên real devices
> - Accessibility testing
>
> **5. CI/CD Integration:**
> ```yaml
> jobs:
>   test:
>     strategy:
>       matrix:
>         browser: [chromium, firefox, webkit]
>     steps:
>       - run: npx playwright test --project=${{ matrix.browser }}
> ```"

---

### Câu hỏi 6: "Safari có những issues gì đặc biệt?"

**Trả lời:**
> "Safari có một số quirks:
>
> **1. CSS Issues:**
> - `position: fixed` không work trong transformed parent
> - Flexbox với `min-height` cần workaround
> - `-webkit-` prefixes cho một số properties
>
> **2. iOS Specific:**
> - Input zoom khi font-size < 16px
> - `-webkit-overflow-scrolling: touch` cho smooth scroll
> - 100vh không chính xác do address bar
>
> **3. API Support:**
> - Push Notifications không work trên iOS (đến iOS 16.4)
> - PWA install có limitations
> - Some Web APIs delay hơn Chrome
>
> **4. Workarounds:**
> - CSS: `@supports` với fallbacks
> - JS: Feature detection + polyfills
> - Testing trên real Safari devices
>
> **5. Recommendation:**
> - Luôn test trên Safari sớm trong development
> - Dùng BrowserStack nếu không có Mac"

---

## Tài liệu tham khảo

- [Can I Use](https://caniuse.com/) - Browser support tables
- [MDN Browser Compatibility](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Compatibility_tables)
- [Browserslist](https://browsersl.ist/)
- [Autoprefixer](https://autoprefixer.github.io/)
- [Polyfill.io](https://polyfill.io/)
- [Playwright Cross-Browser Testing](https://playwright.dev/docs/browsers)
