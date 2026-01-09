# Event Loop

## Level 1: Basic - JavaScript Runtime Model

### 1.1. Single-threaded JavaScript

```
JavaScript là single-threaded nhưng có thể xử lý async operations
thông qua Event Loop.

Key Components:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Call Stack    - Nơi code được execute (LIFO)               │
│  Web APIs      - Browser/Node APIs (setTimeout, fetch, DOM) │
│  Task Queue    - Macrotasks (setTimeout, setInterval)       │
│  Microtask Queue - Microtasks (Promise.then, queueMicrotask)│
│  Event Loop    - Điều phối execution                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Call Stack

```javascript
// Call Stack: LIFO (Last In, First Out)
function first() {
  console.log("First");
  second();
}

function second() {
  console.log("Second");
  third();
}

function third() {
  console.log("Third");
}

first();

// Call Stack visualization:
// [third]  <- top (executes first)
// [second]
// [first]
// [global]

// Output: First, Second, Third
```

### 1.3. Basic Event Loop Flow

```javascript
console.log("1");  // Sync - runs immediately

setTimeout(() => {
  console.log("2"); // Macrotask - runs last
}, 0);

Promise.resolve().then(() => {
  console.log("3"); // Microtask - runs before macrotask
});

console.log("4");  // Sync - runs immediately

// Output: 1, 4, 3, 2

// Why?
// 1. Sync code executes first: "1", "4"
// 2. Microtasks before macrotasks: "3"
// 3. Macrotasks: "2"
```

### 1.4. Event Loop Rules

```
┌─────────────────────────────────────────────────────────────┐
│                   Event Loop Algorithm                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Execute all synchronous code (Call Stack)               │
│                                                              │
│  2. Call Stack empty? → Process ALL microtasks              │
│     - Promise.then/catch/finally                            │
│     - queueMicrotask()                                      │
│     - MutationObserver                                      │
│                                                              │
│  3. Microtask Queue empty? → Process ONE macrotask          │
│     - setTimeout/setInterval                                │
│     - I/O operations                                        │
│     - setImmediate (Node.js)                                │
│                                                              │
│  4. Go back to step 2                                       │
│                                                              │
│  KEY: Microtasks ALWAYS before next macrotask               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Level 2: Intermediate - Microtasks vs Macrotasks

### 2.1. Microtasks

```javascript
// Microtasks (high priority):
// - Promise.then() / catch() / finally()
// - queueMicrotask()
// - MutationObserver (browser)
// - process.nextTick() (Node.js - highest priority)

console.log("Start");

Promise.resolve().then(() => console.log("Promise 1"));
Promise.resolve().then(() => console.log("Promise 2"));

queueMicrotask(() => console.log("Microtask"));

console.log("End");

// Output: Start, End, Promise 1, Promise 2, Microtask
// ALL microtasks complete before any macrotask
```

### 2.2. Macrotasks

```javascript
// Macrotasks (lower priority):
// - setTimeout / setInterval
// - I/O operations (fetch, file read)
// - UI rendering
// - setImmediate (Node.js)

console.log("Start");

setTimeout(() => console.log("Timeout 1"), 0);
setTimeout(() => console.log("Timeout 2"), 0);

console.log("End");

// Output: Start, End, Timeout 1, Timeout 2
// Macrotasks execute one at a time
```

### 2.3. Priority: Microtasks > Macrotasks

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => console.log("3"));
}, 0);

Promise.resolve().then(() => {
  console.log("4");
  setTimeout(() => console.log("5"), 0);
});

console.log("6");

// Output: 1, 6, 4, 2, 3, 5

// Step by step:
// 1. "1" - sync
// 2. setTimeout("2") → Macrotask Queue
// 3. Promise("4") → Microtask Queue
// 4. "6" - sync
// 5. Stack empty → process microtasks
// 6. "4" - microtask, adds setTimeout("5") to Macrotask Queue
// 7. Microtask Queue empty → process one macrotask
// 8. "2" - macrotask, adds Promise("3") to Microtask Queue
// 9. Process microtasks before next macrotask
// 10. "3" - microtask
// 11. "5" - macrotask
```

### 2.4. Nested Promises

```javascript
Promise.resolve()
  .then(() => {
    console.log("Promise 1");
    return Promise.resolve();
  })
  .then(() => {
    console.log("Promise 2");
  });

Promise.resolve()
  .then(() => {
    console.log("Promise 3");
  });

// Output: Promise 1, Promise 3, Promise 2

// Why?
// - Promise 1 executes, returns new Promise
// - Promise 3 executes (was queued before Promise 2)
// - Promise 2 executes (queued after Promise 1 resolved)
```

### 2.5. async/await and Event Loop

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(() => console.log("setTimeout"), 0);

async1();

new Promise((resolve) => {
  console.log("promise1");
  resolve();
}).then(() => {
  console.log("promise2");
});

console.log("script end");

// Output:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout

// Key: await pauses function execution
// Code after await becomes microtask
```

---

## Level 3: Advanced - Performance & Edge Cases

### 3.1. Blocking the Event Loop

```javascript
// ❌ Blocking - UI freezes, no events processed
function blockingOperation() {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // Block for 5 seconds - NOTHING else can run
  }
}

// ❌ Heavy computation blocks
function heavyComputation(data) {
  return data.map(item => expensiveTransform(item)); // Blocks
}

// ✅ Break into chunks with setTimeout
async function processInChunks(data, chunkSize = 1000) {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  const results = [];
  for (const chunk of chunks) {
    results.push(...chunk.map(expensiveTransform));
    // Yield to event loop
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  return results;
}

// ✅ Use Web Workers for CPU-intensive work
const worker = new Worker("heavy-computation.js");
worker.postMessage({ data: largeArray });
worker.onmessage = (e) => {
  console.log("Result:", e.data);
};
```

### 3.2. Infinite Microtask Loop

```javascript
// ❌ DANGER: Infinite microtask loop blocks forever
function infiniteMicrotasks() {
  Promise.resolve().then(() => {
    infiniteMicrotasks(); // Never lets macrotasks run!
  });
}

// ✅ Use macrotask to yield
function safeLoop() {
  Promise.resolve().then(() => {
    // Do some work
    setTimeout(safeLoop, 0); // Yield to other tasks
  });
}

// Why dangerous?
// Event Loop processes ALL microtasks before next macrotask
// Infinite microtasks = no macrotasks ever run
// UI freezes, timeouts never fire
```

### 3.3. Browser Rendering

```javascript
// Browser rendering happens AFTER microtasks, BEFORE macrotasks

console.log("1");

requestAnimationFrame(() => {
  console.log("RAF"); // Before next paint
});

Promise.resolve().then(() => {
  console.log("Promise"); // Microtask
});

setTimeout(() => {
  console.log("Timeout"); // Macrotask
}, 0);

console.log("2");

// Typical output: 1, 2, Promise, RAF, Timeout

// Rendering queue order:
// 1. Sync code
// 2. Microtasks
// 3. requestAnimationFrame (before paint)
// 4. Paint/Render
// 5. Macrotasks
```

### 3.4. Node.js Event Loop

```javascript
// Node.js has additional phases and APIs

console.log("1");

setImmediate(() => console.log("setImmediate"));

setTimeout(() => console.log("setTimeout"), 0);

Promise.resolve().then(() => console.log("Promise"));

process.nextTick(() => console.log("nextTick"));

console.log("2");

// Output: 1, 2, nextTick, Promise, setTimeout/setImmediate

// Node.js priority:
// 1. process.nextTick (highest - before microtasks!)
// 2. Microtasks (Promise)
// 3. Macrotasks (timers, I/O)
// 4. setImmediate (after I/O)
```

### 3.5. Measuring Event Loop Lag

```javascript
// Monitor event loop health
function measureEventLoopLag() {
  const start = performance.now();

  setTimeout(() => {
    const lag = performance.now() - start;
    console.log(`Event loop lag: ${lag.toFixed(2)}ms`);

    // Healthy: < 16ms (60fps)
    // Warning: 16-50ms
    // Problem: > 50ms
  }, 0);
}

// Continuous monitoring
setInterval(measureEventLoopLag, 1000);

// Real-world: If lag > 100ms, users notice
```

---

## Real-world Applications

### Debounce Implementation

```javascript
// Debounce uses setTimeout (macrotask)
function debounce(fn, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId); // Cancel previous

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Usage: Only fires after user stops typing for 300ms
const search = debounce((query) => {
  fetchResults(query);
}, 300);

input.addEventListener("input", (e) => search(e.target.value));
```

### Batching DOM Updates

```javascript
// Bad: Multiple reflows
function badUpdate(items) {
  items.forEach(item => {
    const div = document.createElement("div");
    div.textContent = item;
    document.body.appendChild(div); // Triggers reflow each time
  });
}

// Good: Single reflow with fragment
function goodUpdate(items) {
  const fragment = document.createDocumentFragment();

  items.forEach(item => {
    const div = document.createElement("div");
    div.textContent = item;
    fragment.appendChild(div);
  });

  document.body.appendChild(fragment); // Single reflow
}

// Even better: Use requestAnimationFrame
function bestUpdate(items) {
  requestAnimationFrame(() => {
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item;
      fragment.appendChild(div);
    });
    document.body.appendChild(fragment);
  });
}
```

### Non-blocking Computation

```javascript
// Process large array without blocking UI
function processLargeArray(array, processFn) {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;
    const chunkSize = 1000;

    function processChunk() {
      const end = Math.min(index + chunkSize, array.length);

      while (index < end) {
        results.push(processFn(array[index]));
        index++;
      }

      if (index < array.length) {
        // Yield to event loop, then continue
        setTimeout(processChunk, 0);
      } else {
        resolve(results);
      }
    }

    processChunk();
  });
}

// Usage
await processLargeArray(millionItems, expensiveTransform);
// UI remains responsive during processing
```

---

## Interview Questions

### Level 1: Basic

**1. Event Loop là gì?**
```
Event Loop là cơ chế cho phép JavaScript:
- Xử lý async operations
- Không block main thread
- Coordinate execution của sync code, microtasks, macrotasks

Components: Call Stack, Task Queue, Microtask Queue, Event Loop
```

**2. Tại sao JavaScript single-threaded nhưng có thể async?**
```
- JavaScript runtime có 1 thread cho execution
- Web APIs (browser) hoặc libuv (Node.js) handle async operations
- Event Loop coordinate khi async operations hoàn thành
- Callbacks được queue và execute khi Call Stack empty
```

**3. setTimeout(fn, 0) có chạy ngay không?**
```
KHÔNG. setTimeout(fn, 0) đặt callback vào Macrotask Queue.
Callback chỉ chạy khi:
1. Call Stack empty
2. All microtasks processed

Minimum delay là ~4ms trong browsers.
```

### Level 2: Intermediate

**4. Microtasks vs Macrotasks?**
```
Microtasks (high priority):
- Promise.then/catch/finally
- queueMicrotask()
- MutationObserver

Macrotasks (lower priority):
- setTimeout/setInterval
- I/O operations
- UI rendering

KEY: ALL microtasks run before next macrotask
```

**5. Output của code này?**
```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");

// Output: 1, 4, 3, 2

// 1, 4: Sync code
// 3: Microtask (Promise)
// 2: Macrotask (setTimeout)
```

**6. async/await và Event Loop?**
```javascript
async function example() {
  console.log("A");
  await Promise.resolve();
  console.log("B"); // Becomes microtask
}

example();
console.log("C");

// Output: A, C, B

// await pauses function
// Code after await = microtask
```

### Level 3: Advanced

**7. Làm sao tránh block Event Loop?**
```
1. Break heavy computation into chunks
2. Use setTimeout/setImmediate to yield
3. Web Workers for CPU-intensive work
4. Debounce/throttle frequent operations
5. requestIdleCallback for non-critical work

Rule: No operation should block > 50ms
```

**8. Infinite microtask loop problem?**
```javascript
// DANGER: Blocks forever
function bad() {
  Promise.resolve().then(() => bad());
}

// All microtasks must complete before macrotasks
// Infinite microtasks = no macrotasks ever run
// UI freezes, timeouts never fire

// Solution: Use setTimeout to yield
function good() {
  Promise.resolve().then(() => {
    setTimeout(good, 0);
  });
}
```

**9. Node.js process.nextTick vs Promise?**
```
process.nextTick has HIGHER priority than Promise.

Order in Node.js:
1. Sync code
2. process.nextTick queue
3. Microtask queue (Promise)
4. Macrotask queue

process.nextTick runs before any I/O or timers
Use carefully - can starve I/O
```

**10. requestAnimationFrame vs setTimeout?**
```
requestAnimationFrame:
- Syncs with browser refresh rate (usually 60fps)
- Pauses in background tabs
- Ideal for animations

setTimeout:
- Not synced with refresh
- Can cause janky animations
- Runs in background tabs

Use RAF for visual updates
Use setTimeout for general delays
```
