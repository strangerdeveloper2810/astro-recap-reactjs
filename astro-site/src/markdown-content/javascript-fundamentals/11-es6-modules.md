# ES6 Modules

## 1. Module System Overview

ES6 Modules là standard module system của JavaScript, thay thế CommonJS và AMD.

### Key Features
- **Static analysis**: Modules được analyze tại compile time
- **Strict mode**: Tự động strict mode
- **Top-level scope**: Mỗi module có scope riêng
- **Tree shaking**: Unused exports có thể bị loại bỏ

## 2. Export

### Named Exports

```javascript
// math.js
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// Hoặc export sau khi declare
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;

export { multiply, divide };

// Rename exports
export { multiply as multiplyNumbers, divide as divideNumbers };

// Export từ module khác (re-export)
export { add, subtract } from './math.js';
export * from './utils.js'; // Export tất cả
```

### Default Export

```javascript
// user.js
class User {
  constructor(name) {
    this.name = name;
  }
}

export default User;

// Hoặc
export default class User {
  constructor(name) {
    this.name = name;
  }
}

// Default export có thể là bất kỳ value nào
export default function createUser(name) {
  return { name };
}

export default { api: 'v1', version: '1.0.0' };
```

### Mixed Exports

```javascript
// api.js
export const API_URL = 'https://api.example.com';

export function fetchData() {
  // ...
}

export default class ApiClient {
  // ...
}

// Có thể có 1 default export và nhiều named exports
```

## 3. Import

### Named Imports

```javascript
// Import specific exports
import { add, subtract, PI } from './math.js';

// Import với alias
import { add as sum, subtract as diff } from './math.js';

// Import tất cả named exports
import * as math from './math.js';
math.add(1, 2);
math.PI;

// Import từ re-export
import { add, subtract } from './operations.js';
```

### Default Import

```javascript
// Import default export
import User from './user.js';

// Import với alias
import UserClass from './user.js';

// Import default + named
import User, { createUser, validateUser } from './user.js';
```

### Dynamic Import

```javascript
// Dynamic import (returns Promise)
const module = await import('./math.js');
module.add(1, 2);

// Conditional import
if (condition) {
  const utils = await import('./utils.js');
  utils.doSomething();
}

// Lazy loading
async function loadComponent() {
  const { Component } = await import('./Component.js');
  return Component;
}

// React lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent.js'));
```

## 4. Module Patterns

### Barrel Exports (Index Files)

```javascript
// utils/index.js
export { formatDate } from './date.js';
export { formatCurrency } from './currency.js';
export { validateEmail } from './validation.js';

// Usage
import { formatDate, formatCurrency, validateEmail } from './utils';
```

### Circular Dependencies

```javascript
// a.js
import { b } from './b.js';
export const a = 'a';

// b.js
import { a } from './a.js'; // Circular!
export const b = 'b';

// ❌ Problem: Hoisting issues, undefined values

// ✅ Solution: Use functions (hoisted)
// a.js
export function getA() {
  return 'a';
}

// b.js
import { getA } from './a.js';
export function getB() {
  return getA() + 'b';
}
```

### Conditional Exports

```javascript
// config.js
const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://api.production.com';

// Feature flags
export const features = {
  newFeature: process.env.FEATURE_NEW === 'true'
};
```

## 5. Module vs Script

### Module Mode

```html
<!-- type="module" -->
<script type="module" src="./app.js"></script>

<!-- Inline module -->
<script type="module">
  import { add } from './math.js';
  console.log(add(1, 2));
</script>
```

### Differences

```javascript
// Script mode
// - No import/export
// - Global scope
// - Can use top-level await (modern)

// Module mode
// - Import/export available
// - Module scope
// - Strict mode by default
// - Deferred execution
// - CORS required for file://
```

## 6. Practical Examples

### React Components

```javascript
// Button.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func
};

// index.js (barrel)
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';

// Usage
import { Button, Input, Card } from './components';
```

### API Modules

```javascript
// api/users.js
const API_BASE = 'https://api.example.com';

export async function getUsers() {
  const response = await fetch(`${API_BASE}/users`);
  return response.json();
}

export async function getUser(id) {
  const response = await fetch(`${API_BASE}/users/${id}`);
  return response.json();
}

export async function createUser(userData) {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return response.json();
}

// Usage
import { getUsers, getUser, createUser } from './api/users.js';
```

### Utility Modules

```javascript
// utils/helpers.js
export function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// utils/index.js
export * from './helpers.js';
export * from './format.js';
export * from './validate.js';
```

## 7. Build Tools & Bundlers

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

### Tree Shaking

```javascript
// math.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export function multiply(a, b) { return a * b; }

// app.js
import { add } from './math.js';
// subtract và multiply sẽ bị tree-shaken (loại bỏ nếu không dùng)

// ❌ Side effects prevent tree shaking
export const utils = {
  add: (a, b) => a + b
};
// Object property access khó tree-shake

// ✅ Named exports dễ tree-shake
export function add(a, b) { return a + b; }
```

## 8. Common Patterns

### Singleton Pattern

```javascript
// db.js
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    Database.instance = this;
    this.connection = null;
  }
  
  connect() {
    // Connection logic
  }
}

export default new Database(); // Single instance
```

### Factory Pattern

```javascript
// factory.js
export function createUser(type) {
  switch (type) {
    case 'admin':
      return new AdminUser();
    case 'regular':
      return new RegularUser();
    default:
      throw new Error('Unknown user type');
  }
}
```

### Plugin System

```javascript
// plugin.js
export class Plugin {
  constructor(name) {
    this.name = name;
  }
  
  execute() {
    throw new Error('Must implement execute()');
  }
}

// plugins/index.js
export { default as AuthPlugin } from './auth.js';
export { default as LoggingPlugin } from './logging.js';
```

## 9. Common Pitfalls

```javascript
// ❌ Import/export trong conditional
if (condition) {
  import { something } from './module.js'; // SyntaxError
}

// ✅ Use dynamic import
if (condition) {
  const { something } = await import('./module.js');
}

// ❌ Default export confusion
// math.js
export default function add() {}
export function subtract() {}

// app.js
import add, { subtract } from './math.js'; // ✅ Correct
import { default as add, subtract } from './math.js'; // ✅ Also correct
import { add, subtract } from './math.js'; // ❌ add is undefined

// ❌ Circular dependencies
// a.js imports b.js, b.js imports a.js
// Solution: Refactor shared code to third module

// ❌ Side effects in module
// utils.js
export const config = loadConfig(); // Executes immediately
// Better: lazy initialization
export function getConfig() {
  return config || loadConfig();
}
```

## 10. Interview Questions

1. **Sự khác biệt giữa CommonJS và ES6 modules?**
   - CommonJS: dynamic, runtime, require()
   - ES6: static, compile-time, import/export

2. **Default export vs Named export?**
   - Default: 1 per module, import không cần {}
   - Named: nhiều exports, import cần {}

3. **Tree shaking là gì?**
   - Loại bỏ unused code tại build time, chỉ hoạt động với ES6 modules

4. **Khi nào dùng dynamic import?**
   - Code splitting, lazy loading, conditional imports

5. **Circular dependencies?**
   - Module A import B, B import A. Giải quyết: refactor shared code, dùng functions thay vì values

6. **Module scope vs Global scope?**
   - Module: mỗi file có scope riêng, strict mode
   - Global: tất cả trong cùng scope, có thể conflict

