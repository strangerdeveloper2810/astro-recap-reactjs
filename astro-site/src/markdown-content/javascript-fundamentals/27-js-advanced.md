# JavaScript Advanced Topics

## Level 1: Basic - Generators & Symbols

### 1.1. Generators - Basic Concept

```javascript
// Generator function (function*)
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numberGenerator();

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Iterate với for...of
for (const num of numberGenerator()) {
  console.log(num); // 1, 2, 3
}

// Spread operator
const numbers = [...numberGenerator()]; // [1, 2, 3]
```

### 1.2. Generator Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Generator Flow                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  function* gen() {          │  const g = gen();             │
│    yield 1;                 │                               │
│    yield 2;                 │  g.next() → { value: 1 }      │
│    return 3;                │  g.next() → { value: 2 }      │
│  }                          │  g.next() → { value: 3, done } │
│                              │  g.next() → { undefined, done }│
│                              │                               │
│  Key Points:                                                 │
│  • yield pauses execution                                   │
│  • next() resumes execution                                 │
│  • Generator remembers state between calls                  │
│  • Lazy evaluation - values generated on demand             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3. Passing Values to Generator

```javascript
// Generator can receive values
function* calculator() {
  const a = yield "Enter first number:";
  const b = yield "Enter second number:";
  return a + b;
}

const calc = calculator();
console.log(calc.next());      // { value: "Enter first number:", done: false }
console.log(calc.next(5));     // { value: "Enter second number:", done: false }
console.log(calc.next(3));     // { value: 8, done: true }

// Flow:
// 1. First next() starts generator, runs until first yield
// 2. Second next(5) resumes, 5 becomes value of first yield
// 3. Third next(3) resumes, 3 becomes value of second yield
```

### 1.4. Symbol - Basic Concept

```javascript
// Create symbol
const sym1 = Symbol();
const sym2 = Symbol("description");
const sym3 = Symbol("description");

console.log(sym2 === sym3); // false (always unique)
console.log(sym2.description); // "description"

// Symbol as object key
const id = Symbol("id");
const user = {
  name: "John",
  [id]: 123
};

console.log(user[id]); // 123
console.log(Object.keys(user)); // ["name"] - symbols not included
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(id)]

// Use case: Hidden properties
const _private = Symbol("private");
class User {
  constructor(name, password) {
    this.name = name;
    this[_private] = { password };
  }
}
```

### 1.5. Global Symbol Registry

```javascript
// Symbol.for() - global registry
const sym1 = Symbol.for("app.id");
const sym2 = Symbol.for("app.id");

console.log(sym1 === sym2); // true (same symbol from registry)

// Get key from symbol
console.log(Symbol.keyFor(sym1)); // "app.id"
console.log(Symbol.keyFor(Symbol("local"))); // undefined (not in registry)

// Use case: Shared symbols across modules
// In module A:
const MY_KEY = Symbol.for("myapp.key");

// In module B:
const MY_KEY = Symbol.for("myapp.key"); // Same symbol!
```

---

## Level 2: Intermediate - Practical Applications

### 2.1. Generator Use Cases

```javascript
// 1. ID Generator
function* idGenerator(prefix = "id") {
  let id = 0;
  while (true) {
    yield `${prefix}_${id++}`;
  }
}

const generateId = idGenerator("user");
console.log(generateId.next().value); // "user_0"
console.log(generateId.next().value); // "user_1"

// 2. Pagination
function* paginate(items, pageSize) {
  for (let i = 0; i < items.length; i += pageSize) {
    yield items.slice(i, i + pageSize);
  }
}

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
for (const page of paginate(items, 3)) {
  console.log(page); // [1,2,3], [4,5,6], [7,8,9], [10]
}

// 3. Range function
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

console.log([...range(0, 10, 2)]); // [0, 2, 4, 6, 8]

// 4. Fibonacci sequence
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const fib = fibonacci();
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2
console.log(fib.next().value); // 3
```

### 2.2. Delegation with yield*

```javascript
// yield* delegates to another generator
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield* gen1(); // Delegate to gen1
  yield 3;
  yield 4;
}

console.log([...gen2()]); // [1, 2, 3, 4]

// Tree traversal
function* traverse(node) {
  yield node.value;
  for (const child of node.children || []) {
    yield* traverse(child); // Recursive delegation
  }
}

const tree = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4 }, { value: 5 }] },
    { value: 3, children: [{ value: 6 }] }
  ]
};

console.log([...traverse(tree)]); // [1, 2, 4, 5, 3, 6]
```

### 2.3. Well-Known Symbols

```javascript
// Symbol.iterator - make object iterable
const range = {
  start: 1,
  end: 5,
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
console.log([...range]); // [1, 2, 3, 4, 5]

// Symbol.toStringTag - customize Object.prototype.toString
class MyClass {
  get [Symbol.toStringTag]() {
    return "MyClass";
  }
}

console.log(Object.prototype.toString.call(new MyClass()));
// "[object MyClass]"

// Symbol.toPrimitive - customize type conversion
const money = {
  amount: 100,
  currency: "USD",
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount;
    if (hint === "string") return `${this.amount} ${this.currency}`;
    return this.amount; // default
  }
};

console.log(+money);        // 100
console.log(`${money}`);    // "100 USD"
console.log(money + 50);    // 150
```

### 2.4. Regular Expressions - Basics

```javascript
// Create regex
const regex1 = /pattern/flags;
const regex2 = new RegExp("pattern", "flags");

// Flags
/pattern/g   // global - find all matches
/pattern/i   // case insensitive
/pattern/m   // multiline
/pattern/s   // dotAll - . matches newline
/pattern/u   // unicode

// Methods
regex.test(string);      // returns boolean
regex.exec(string);      // returns match array or null
string.match(regex);     // returns matches
string.matchAll(regex);  // returns iterator (requires /g)
string.replace(regex, replacement);
string.split(regex);
string.search(regex);    // returns index or -1

// Character classes
.       // Any character (except newline)
\d      // Digit [0-9]
\D      // Not digit
\w      // Word character [a-zA-Z0-9_]
\W      // Not word character
\s      // Whitespace
\S      // Not whitespace
[abc]   // Character set
[^abc]  // Negated set
[a-z]   // Range
```

### 2.5. Common Regex Patterns

```javascript
// Email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
emailRegex.test("test@example.com"); // true

// URL
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

// Phone (Vietnamese)
const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

// Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

// Date (YYYY-MM-DD)
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Extract numbers
const numbers = "Price: $123.45".match(/\d+\.?\d*/g); // ["123.45"]

// Replace with callback
const result = "hello world".replace(/\b\w/g, (char) => char.toUpperCase());
// "Hello World"

// Named groups
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = datePattern.exec("2024-01-15");
console.log(match.groups.year);  // "2024"
console.log(match.groups.month); // "01"
console.log(match.groups.day);   // "15"
```

---

## Level 3: Advanced - Proxy, Reflect & Patterns

### 3.1. Proxy - Basic Concept

```javascript
// Proxy wraps object and intercepts operations
const target = {
  name: "John",
  age: 30
};

const handler = {
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    return target[property];
  },
  set(target, property, value, receiver) {
    console.log(`Setting ${property} to ${value}`);
    target[property] = value;
    return true; // Indicate success
  }
};

const proxy = new Proxy(target, handler);

proxy.name; // Logs: "Getting name", returns "John"
proxy.age = 31; // Logs: "Setting age to 31"
```

### 3.2. Proxy Handler Traps

```javascript
const handler = {
  // Property access
  get(target, prop, receiver) {},
  set(target, prop, value, receiver) {},
  has(target, prop) {},           // 'in' operator
  deleteProperty(target, prop) {},
  ownKeys(target) {},             // Object.keys, for...in

  // Function calls
  apply(target, thisArg, args) {},       // function call
  construct(target, args, newTarget) {}, // new operator

  // Object operations
  getPrototypeOf(target) {},
  setPrototypeOf(target, proto) {},
  isExtensible(target) {},
  preventExtensions(target) {},
  getOwnPropertyDescriptor(target, prop) {},
  defineProperty(target, prop, descriptor) {}
};
```

### 3.3. Practical Proxy Examples

```javascript
// 1. Validation
const validator = {
  set(target, property, value) {
    if (property === "age") {
      if (!Number.isInteger(value)) {
        throw new TypeError("Age must be an integer");
      }
      if (value < 0 || value > 150) {
        throw new RangeError("Age must be between 0 and 150");
      }
    }
    target[property] = value;
    return true;
  }
};

const user = new Proxy({}, validator);
user.age = 25; // OK
user.age = -5; // RangeError

// 2. Default values
const withDefaults = (target, defaults) => {
  return new Proxy(target, {
    get(target, property) {
      return property in target ? target[property] : defaults[property];
    }
  });
};

const settings = withDefaults({}, { theme: "light", language: "en" });
console.log(settings.theme); // "light"
console.log(settings.name);  // undefined

// 3. Negative array indices
const negativeArray = (arr) => {
  return new Proxy(arr, {
    get(target, property) {
      const index = Number(property);
      if (Number.isInteger(index) && index < 0) {
        return target[target.length + index];
      }
      return target[property];
    }
  });
};

const arr = negativeArray([1, 2, 3, 4, 5]);
console.log(arr[-1]); // 5
console.log(arr[-2]); // 4

// 4. Observable/Reactive object
const observable = (target, callback) => {
  return new Proxy(target, {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;
      callback(property, value, oldValue);
      return true;
    }
  });
};

const state = observable({ count: 0 }, (prop, newVal, oldVal) => {
  console.log(`${prop} changed from ${oldVal} to ${newVal}`);
});

state.count = 1; // "count changed from 0 to 1"
```

### 3.4. Reflect API

```javascript
// Reflect provides methods for proxy traps
const handler = {
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    return Reflect.get(target, property, receiver); // Default behavior
  },
  set(target, property, value, receiver) {
    console.log(`Setting ${property}`);
    return Reflect.set(target, property, value, receiver);
  }
};

// Reflect methods mirror Proxy traps
Reflect.get(obj, "property");
Reflect.set(obj, "property", value);
Reflect.has(obj, "property");           // 'in' operator
Reflect.deleteProperty(obj, "property");
Reflect.ownKeys(obj);
Reflect.apply(fn, thisArg, args);
Reflect.construct(Class, args);

// Why use Reflect?
// 1. Returns boolean instead of throwing
const success = Reflect.defineProperty(obj, "prop", { value: 1 });
// vs Object.defineProperty throws on failure

// 2. Proper this handling with receiver
const parent = { get value() { return this._value; } };
const child = { _value: 42, __proto__: parent };
console.log(Reflect.get(parent, "value", child)); // 42
```

### 3.5. Async Generators

```javascript
// Async generator
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

// Consume with for await...of
(async () => {
  for await (const value of asyncGenerator()) {
    console.log(value); // 1, 2, 3
  }
})();

// Streaming data from API
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();

    if (data.items.length === 0) break;

    yield data.items;
    page++;
  }
}

// Usage
async function getAllItems(url) {
  const allItems = [];
  for await (const page of fetchPages(url)) {
    allItems.push(...page);
  }
  return allItems;
}

// Real-time data stream
async function* eventStream(url) {
  const eventSource = new EventSource(url);

  try {
    while (true) {
      const event = await new Promise((resolve, reject) => {
        eventSource.onmessage = (e) => resolve(JSON.parse(e.data));
        eventSource.onerror = reject;
      });
      yield event;
    }
  } finally {
    eventSource.close();
  }
}
```

### 3.6. Advanced Regex

```javascript
// Lookahead/Lookbehind
// Positive lookahead (?=)
"100USD".match(/\d+(?=USD)/);  // ["100"] - number followed by USD

// Negative lookahead (?!)
"100EUR".match(/\d+(?!USD)/);  // ["100"] - number NOT followed by USD

// Positive lookbehind (?<=)
"$100".match(/(?<=\$)\d+/);    // ["100"] - number preceded by $

// Negative lookbehind (?<!)
"100".match(/(?<!\$)\d+/);     // number NOT preceded by $

// Greedy vs Lazy
const html = "<div>content</div>";
html.match(/<.+>/);    // ["<div>content</div>"] - greedy
html.match(/<.+?>/);   // ["<div>"] - lazy (?)

// Advanced validation
const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^(0|\+84)[0-9]{9,10}$/.test(value),
  url: (value) => /^https?:\/\/.+/.test(value),
  alphanumeric: (value) => /^[a-zA-Z0-9]+$/.test(value),
  strongPassword: (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
};

// Sanitize input
function sanitize(input) {
  return input
    .replace(/<[^>]*>/g, "")      // Remove HTML tags
    .replace(/[^\w\s]/gi, "")     // Remove special chars
    .trim();
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
formatNumber(1234567); // "1,234,567"
```

---

## Real-world Applications

### State Management with Proxy (Vue 3 style)

```javascript
// Reactive state management
function reactive(target) {
  const handlers = new Set();

  const proxy = new Proxy(target, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);

      // Recursively make nested objects reactive
      if (typeof value === "object" && value !== null) {
        return reactive(value);
      }
      return value;
    },
    set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);

      if (oldValue !== value) {
        // Notify all handlers
        handlers.forEach((handler) => handler(property, value, oldValue));
      }
      return result;
    }
  });

  proxy.subscribe = (handler) => {
    handlers.add(handler);
    return () => handlers.delete(handler);
  };

  return proxy;
}

// Usage
const state = reactive({
  user: { name: "John", age: 30 },
  items: []
});

const unsubscribe = state.subscribe((prop, newVal, oldVal) => {
  console.log(`State changed: ${prop} = ${newVal}`);
});

state.user.name = "Jane"; // Triggers notification
state.items.push({ id: 1 }); // Works with nested objects
```

### Generator-based State Machine

```javascript
// State machine using generators
function* trafficLight() {
  while (true) {
    yield "red";
    yield "green";
    yield "yellow";
  }
}

// With transitions and side effects
function* orderStateMachine() {
  console.log("Order created");
  yield "pending";

  console.log("Payment received");
  yield "paid";

  console.log("Order shipped");
  yield "shipped";

  console.log("Order delivered");
  return "delivered";
}

// Usage
const order = orderStateMachine();
console.log(order.next().value); // "pending"
console.log(order.next().value); // "paid"
console.log(order.next().value); // "shipped"
console.log(order.next().value); // "delivered"
```

### API with Generator for Pagination

```javascript
// Paginated API consumer
async function* fetchAllUsers(baseUrl) {
  let cursor = null;

  while (true) {
    const url = cursor
      ? `${baseUrl}?cursor=${cursor}`
      : baseUrl;

    const response = await fetch(url);
    const { data, nextCursor } = await response.json();

    for (const user of data) {
      yield user;
    }

    if (!nextCursor) break;
    cursor = nextCursor;
  }
}

// Usage - process users one by one
async function processUsers() {
  for await (const user of fetchAllUsers("/api/users")) {
    await processUser(user);
    // Memory efficient - only one user at a time
  }
}

// Or collect with limit
async function getFirstNUsers(n) {
  const users = [];
  let count = 0;

  for await (const user of fetchAllUsers("/api/users")) {
    users.push(user);
    if (++count >= n) break;
  }

  return users;
}
```

### Form Validation with Proxy

```javascript
// Form with automatic validation
function createValidatedForm(schema) {
  const errors = {};
  const values = {};

  return new Proxy(values, {
    set(target, field, value) {
      target[field] = value;

      // Validate field
      const validator = schema[field];
      if (validator) {
        const error = validator(value);
        if (error) {
          errors[field] = error;
        } else {
          delete errors[field];
        }
      }

      return true;
    },
    get(target, property) {
      if (property === "errors") return { ...errors };
      if (property === "isValid") return Object.keys(errors).length === 0;
      if (property === "values") return { ...target };
      return target[property];
    }
  });
}

// Usage
const form = createValidatedForm({
  email: (v) => (!v.includes("@") ? "Invalid email" : null),
  password: (v) => (v.length < 8 ? "Min 8 characters" : null),
  age: (v) => (v < 18 ? "Must be 18+" : null)
});

form.email = "invalid";
console.log(form.errors); // { email: "Invalid email" }
console.log(form.isValid); // false

form.email = "test@example.com";
form.password = "password123";
form.age = 25;
console.log(form.isValid); // true
```

---

## Interview Questions

### Level 1: Basic

**1. Generator là gì?**
```
Generator = function có thể pause và resume
- Dùng function* và yield
- Returns iterator object
- Lazy evaluation (generate on demand)

function* gen() {
  yield 1;
  yield 2;
}

const g = gen();
g.next(); // { value: 1, done: false }
g.next(); // { value: 2, done: false }
g.next(); // { value: undefined, done: true }
```

**2. Symbol là gì? Tại sao dùng?**
```
Symbol = unique primitive value

Use cases:
1. Hidden/private-like properties
2. Prevent property collision
3. Define protocols (Symbol.iterator)
4. Constants/Enums

const sym1 = Symbol("id");
const sym2 = Symbol("id");
sym1 === sym2 // false (always unique)
```

**3. Greedy vs Lazy quantifiers?**
```
Greedy (*): match nhiều nhất có thể
Lazy (*?): match ít nhất có thể

"<div>a</div><div>b</div>".match(/<div>.*<\/div>/);
// ["<div>a</div><div>b</div>"] - greedy

"<div>a</div><div>b</div>".match(/<div>.*?<\/div>/);
// ["<div>a</div>"] - lazy
```

### Level 2: Intermediate

**4. Well-known symbols?**
```javascript
Symbol.iterator    // Make object iterable
Symbol.toStringTag // Customize toString
Symbol.toPrimitive // Type conversion
Symbol.hasInstance // instanceof behavior
Symbol.species     // Constructor for derived objects

// Example: Make object iterable
const obj = {
  [Symbol.iterator]() {
    return {
      next() { return { value, done }; }
    };
  }
};
```

**5. yield* là gì?**
```javascript
// Delegate to another generator

function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield* gen1(); // Insert gen1's values here
  yield 3;
}

[...gen2()] // [1, 2, 3]

// Use case: Tree traversal, flattening
```

**6. Lookahead vs Lookbehind?**
```
Lookahead: check what follows
(?=)  positive - must follow
(?!)  negative - must not follow

Lookbehind: check what precedes
(?<=) positive - must precede
(?<!) negative - must not precede

// Don't consume characters, just assert

"$100".match(/(?<=\$)\d+/);  // ["100"]
"100".match(/\d+(?=USD)/);   // match if followed by USD
```

### Level 3: Advanced

**7. Proxy dùng để làm gì?**
```
Proxy = intercept object operations

Use cases:
1. Validation (set trap)
2. Default values (get trap)
3. Logging/debugging
4. Reactive systems (Vue 3)
5. Access control

const proxy = new Proxy(target, {
  get(target, prop) { },
  set(target, prop, value) { }
});
```

**8. Proxy vs Object.defineProperty?**
```
Object.defineProperty:
- Per-property, static
- Cannot detect new properties
- Vue 2 approach

Proxy:
- Intercept all operations
- Dynamic, any property
- More powerful (has, delete, etc.)
- Vue 3 approach

Proxy is preferred for reactivity
```

**9. Async generators use case?**
```javascript
// Streaming data, pagination

async function* fetchAll(url) {
  let page = 1;
  while (true) {
    const data = await fetch(`${url}?page=${page}`);
    const { items, hasMore } = await data.json();

    yield* items; // Yield each item

    if (!hasMore) break;
    page++;
  }
}

// Memory efficient - process one at a time
for await (const item of fetchAll(url)) {
  process(item);
}
```

**10. Reflect API purpose?**
```javascript
// 1. Default behavior in Proxy
get(target, prop, receiver) {
  return Reflect.get(target, prop, receiver);
}

// 2. Returns boolean instead of throwing
const ok = Reflect.set(obj, "prop", value);
// vs Object.defineProperty throws

// 3. Proper receiver handling
Reflect.get(parent, "value", child);

// Each Reflect method matches a Proxy trap
```
