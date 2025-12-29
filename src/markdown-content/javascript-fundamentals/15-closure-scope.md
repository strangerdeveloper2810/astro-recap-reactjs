# Closure và Scope

## Level 1: Basic - Scope Fundamentals

### 1.1. Scope Types

```javascript
// 1. Global Scope - accessible everywhere
const globalVar = "I'm global";

function example() {
  // 2. Function Scope - accessible within function
  const functionVar = "I'm in function";

  if (true) {
    // 3. Block Scope (let/const only)
    const blockVar = "I'm in block";
    let blockLet = "Block let";

    // var NOT block-scoped!
    var functionScoped = "I'm function scoped";
  }

  console.log(functionScoped); // Works! (var is function-scoped)
  // console.log(blockVar);    // ReferenceError (block-scoped)
}

// 4. Module Scope (ES6 modules)
// Each module has its own scope
export const moduleVar = "Module scope";
```

### 1.2. Scope Chain

```
Scope Chain: Inner scope can access outer scope, not vice versa.

┌──────────────────────────────────────────┐
│  Global Scope                            │
│  const global = "global"                 │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Function Scope (outer)            │  │
│  │  const outerVar = "outer"          │  │
│  │                                    │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │  Function Scope (inner)      │  │  │
│  │  │  const innerVar = "inner"    │  │  │
│  │  │                              │  │  │
│  │  │  // Can access:              │  │  │
│  │  │  // innerVar ✓               │  │  │
│  │  │  // outerVar ✓               │  │  │
│  │  │  // global ✓                 │  │  │
│  │  └──────────────────────────────┘  │  │
│  │                                    │  │
│  │  // Cannot access: innerVar ✗     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  // Cannot access: outerVar ✗            │
└──────────────────────────────────────────┘
```

```javascript
const global = "global";

function outer() {
  const outerVar = "outer";

  function inner() {
    const innerVar = "inner";

    // Inner can access all:
    console.log(innerVar); // "inner"
    console.log(outerVar); // "outer"
    console.log(global);   // "global"
  }

  inner();
  // console.log(innerVar); // ReferenceError
}
```

### 1.3. Lexical Scope

```javascript
// Lexical scope: scope determined by where code is WRITTEN, not where it's called

const x = "global";

function outer() {
  const x = "outer";

  function inner() {
    console.log(x); // "outer" - from where inner is WRITTEN
  }

  inner();
}

outer(); // "outer"

// Scope is determined at write-time, not run-time
function createFunction() {
  const name = "John";

  return function () {
    console.log(name); // Always "John" - lexically scoped
  };
}

const fn = createFunction();
fn(); // "John" - still accesses name from createFunction's scope
```

### 1.4. var vs let/const Scope

```javascript
// var: function-scoped
function varExample() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 - accessible outside block!
}

// let/const: block-scoped
function letExample() {
  if (true) {
    let y = 1;
    const z = 2;
  }
  // console.log(y); // ReferenceError
  // console.log(z); // ReferenceError
}

// Loop example - var problem
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 (all reference same i)

// Loop example - let solution
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
// Output: 0, 1, 2 (each iteration has own j)
```

---

## Level 2: Intermediate - Closures

### 2.1. What is Closure?

```javascript
// Closure = function + its lexical environment
// A function that "remembers" variables from outer scope

function outer() {
  const outerVar = "I'm outer";

  function inner() {
    console.log(outerVar); // Accesses outer variable
  }

  return inner;
}

const closureFn = outer();
closureFn(); // "I'm outer" - still has access to outerVar!

// outer() has returned, but inner still "closes over" outerVar
```

### 2.2. Practical Closure Examples

```javascript
// Example 1: Counter - private state
function createCounter() {
  let count = 0; // Private variable

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2
// counter.count;    // undefined - can't access directly!

// Each instance has its own count
const counter2 = createCounter();
counter2.getCount(); // 0 (independent)

// Example 2: Function Factory
function createMultiplier(multiplier) {
  return function (number) {
    return number * multiplier; // "remembers" multiplier
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

double(5); // 10
triple(5); // 15

// Example 3: Private Variables (Bank Account)
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Private

  return {
    deposit: (amount) => {
      balance += amount;
      return balance;
    },
    withdraw: (amount) => {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      return balance;
    },
    getBalance: () => balance
  };
}

const account = createBankAccount(100);
account.deposit(50);  // 150
account.withdraw(30); // 120
// account.balance;   // undefined - truly private!
```

### 2.3. Closure in Loops

```javascript
// ❌ Classic Problem: var in loop
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 3, 3, 3 - all closures share same i
  }, 100);
}

// ✅ Solution 1: Use let (each iteration gets new i)
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 0, 1, 2
  }, 100);
}

// ✅ Solution 2: IIFE (create new scope per iteration)
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => {
      console.log(j); // 0, 1, 2
    }, 100);
  })(i);
}

// ✅ Solution 3: bind
for (var i = 0; i < 3; i++) {
  setTimeout(
    function (j) {
      console.log(j);
    }.bind(null, i),
    100
  );
}
```

### 2.4. Module Pattern

```javascript
// Module pattern using closure
const MyModule = (function () {
  // Private variables & functions
  let privateVar = 0;
  const privateConst = "secret";

  function privateFunction() {
    return privateVar;
  }

  // Public API (returned object)
  return {
    increment: () => {
      privateVar++;
      return privateVar;
    },
    getPrivate: () => privateFunction(),
    getConst: () => privateConst
  };
})();

MyModule.increment(); // 1
MyModule.getPrivate(); // 1
// MyModule.privateVar; // undefined - truly private
```

---

## Level 3: Advanced - Execution Context & Patterns

### 3.1. Execution Context

```javascript
// Each function call creates Execution Context containing:
// 1. Variable Environment (var declarations)
// 2. Lexical Environment (let/const, functions)
// 3. this binding
// 4. Outer Environment Reference (scope chain)

function example(a, b) {
  var x = 1; // Variable Environment
  let y = 2; // Lexical Environment
  const z = 3; // Lexical Environment

  function inner() {
    // Outer Environment Reference → example's context
    console.log(x, y, z);
  }

  inner();
}

// Execution Stack (Call Stack): LIFO
// [inner]  <- top
// [example]
// [global]
```

### 3.2. Memoization with Closure

```javascript
// Memoization: cache expensive function results
function memoize(fn) {
  const cache = {}; // Private cache via closure

  return function (...args) {
    const key = JSON.stringify(args);

    if (cache[key]) {
      console.log("Cache hit");
      return cache[key];
    }

    console.log("Cache miss - computing");
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

// Usage
const expensiveFn = (n) => {
  console.log("Computing...");
  return n * 2;
};

const memoized = memoize(expensiveFn);
memoized(5); // "Computing..." - cache miss
memoized(5); // "Cache hit" - no recomputation
memoized(10); // "Computing..." - new value
```

### 3.3. Debounce & Throttle

```javascript
// Debounce: delay until pause in calls
function debounce(fn, delay) {
  let timeoutId; // Closure variable

  return function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Throttle: limit call frequency
function throttle(fn, limit) {
  let inThrottle; // Closure variable

  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Usage
const search = debounce((query) => fetchResults(query), 300);
input.addEventListener("input", (e) => search(e.target.value));

const scroll = throttle(() => updatePosition(), 100);
window.addEventListener("scroll", scroll);
```

### 3.4. Partial Application

```javascript
// Partial application: fix some arguments
function partial(fn, ...fixedArgs) {
  return function (...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

const sayHello = partial(greet, "Hello");
const sayHelloToJohn = partial(greet, "Hello", "John");

sayHello("John", "!"); // "Hello, John!"
sayHelloToJohn("?");   // "Hello, John?"
```

### 3.5. Common Pitfalls

```javascript
// ❌ Closure with mutable variables
function createFunctions() {
  const functions = [];

  for (var i = 0; i < 3; i++) {
    functions.push(() => console.log(i)); // All log 3
  }

  return functions;
}

// ✅ Fix with let
function createFunctions() {
  const functions = [];

  for (let i = 0; i < 3; i++) {
    functions.push(() => console.log(i)); // 0, 1, 2
  }

  return functions;
}

// ❌ Memory leaks with closures
function attachHandler() {
  const largeData = new Array(1000000).fill("data");

  document.getElementById("button").addEventListener("click", () => {
    // Closure holds reference to largeData
    console.log(largeData.length);
  });

  // largeData can't be garbage collected!
}

// ✅ Release when done
function attachHandler() {
  const largeData = new Array(1000000).fill("data");
  const length = largeData.length; // Copy what you need

  document.getElementById("button").addEventListener("click", () => {
    console.log(length); // Only holds small value
  });
}
```

---

## Real-world Applications

### Event Handler Factory

```javascript
// Create handlers with pre-configured data
function createClickHandler(userId, analytics) {
  return function (event) {
    analytics.track("click", {
      userId,
      element: event.target.id,
      timestamp: Date.now()
    });
  };
}

// Usage
const handler = createClickHandler("user-123", analyticsService);
button.addEventListener("click", handler);
```

### API Client with Private State

```javascript
function createApiClient(baseUrl, apiKey) {
  // Private via closure
  let requestCount = 0;
  const rateLimitPerMinute = 100;

  async function makeRequest(endpoint, options = {}) {
    if (requestCount >= rateLimitPerMinute) {
      throw new Error("Rate limit exceeded");
    }

    requestCount++;

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${apiKey}`
      }
    });

    return response.json();
  }

  // Reset counter every minute
  setInterval(() => {
    requestCount = 0;
  }, 60000);

  return {
    get: (endpoint) => makeRequest(endpoint),
    post: (endpoint, data) =>
      makeRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(data)
      }),
    getRequestCount: () => requestCount
  };
}

const api = createApiClient("https://api.example.com", "secret-key");
await api.get("/users");
```

---

## Interview Questions

### Level 1: Basic

**1. Scope là gì?**
```
Scope = vùng trong code nơi variable có thể được access.

Types:
- Global scope: accessible everywhere
- Function scope: within function
- Block scope: within {} (let/const only)
- Module scope: within module
```

**2. Scope chain là gì?**
```
Chain của scopes từ inner → outer.
JavaScript tìm variable từ current scope,
nếu không thấy thì tìm lên outer scope,
tiếp tục đến global scope.

Inner có thể access outer.
Outer KHÔNG thể access inner.
```

**3. var vs let/const scope?**
```
var: function-scoped
let/const: block-scoped

for (var i = 0; i < 3; i++) {} // i accessible outside
for (let j = 0; j < 3; j++) {} // j NOT accessible outside
```

### Level 2: Intermediate

**4. Closure là gì?**
```javascript
// Closure = function + its lexical environment
// Function "remembers" variables from where it was CREATED

function outer() {
  const x = 10;
  return function inner() {
    console.log(x); // Closure: inner "closes over" x
  };
}

const fn = outer();
fn(); // 10 - still has access to x
```

**5. Tại sao closure trong loop với var có vấn đề?**
```
var là function-scoped, không tạo scope mới mỗi iteration.
Tất cả closures share CÙNG MỘT variable.
Khi loop xong, tất cả reference đến giá trị cuối.

Solutions:
- Use let (block-scoped, new binding per iteration)
- IIFE (create new scope)
- bind()
```

**6. Lexical vs Dynamic scope?**
```
Lexical (JavaScript uses this):
- Scope determined at WRITE time
- Based on where code is written

Dynamic (not JavaScript):
- Scope determined at RUN time
- Based on where code is called

JavaScript ALWAYS uses lexical scope.
```

### Level 3: Advanced

**7. Memory leaks với closures?**
```
Closures giữ reference đến outer variables.
Nếu closure tồn tại, variables không thể GC.

Common issues:
- Event handlers giữ large objects
- Timers giữ DOM references

Solutions:
- Remove event listeners when done
- Copy only needed values, not whole objects
- Use WeakMap for cache
```

**8. Module pattern với closure?**
```javascript
const Module = (function() {
  // Private
  let privateVar = 0;

  // Public API
  return {
    increment: () => ++privateVar,
    getValue: () => privateVar
  };
})();

// privateVar truly private
// Only accessible via returned methods
```

**9. Execution context components?**
```
Each function call creates Execution Context:

1. Variable Environment: var declarations
2. Lexical Environment: let/const, functions
3. this binding: depends on how function called
4. Outer Reference: link to parent scope (scope chain)
```

**10. Currying vs Partial Application?**
```javascript
// Partial: fix some args, return function for rest
const add = (a, b, c) => a + b + c;
const partial = partial(add, 1);    // fix a=1
partial(2, 3); // 6

// Currying: transform to series of single-arg functions
const curriedAdd = a => b => c => a + b + c;
curriedAdd(1)(2)(3); // 6

Partial: any number of args at once
Currying: one arg at a time
```
