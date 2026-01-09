# Prototype và Inheritance

## Level 1: Basic - Prototype Fundamentals

### 1.1. What is Prototype?

```
┌─────────────────────────────────────────────────────────────┐
│                    Prototype Chain                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Every object has internal [[Prototype]] link               │
│                                                              │
│  const obj = {}                                              │
│       │                                                      │
│       └──→ Object.prototype ──→ null                        │
│                                                              │
│  const arr = []                                              │
│       │                                                      │
│       └──→ Array.prototype ──→ Object.prototype ──→ null    │
│                                                              │
│  function fn() {}                                            │
│       │                                                      │
│       └──→ Function.prototype ──→ Object.prototype ──→ null │
│                                                              │
│  Property lookup: own → prototype → prototype → ... → null  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// Every object has a prototype
const obj = {};
console.log(Object.getPrototypeOf(obj)); // Object.prototype
console.log(obj.__proto__); // Object.prototype (deprecated but works)

// Arrays inherit from Array.prototype
const arr = [1, 2, 3];
console.log(Object.getPrototypeOf(arr)); // Array.prototype
console.log(Object.getPrototypeOf(Object.getPrototypeOf(arr))); // Object.prototype

// Chain ends at null
console.log(Object.getPrototypeOf(Object.prototype)); // null

// Property lookup follows the chain
arr.toString(); // Found on Array.prototype
arr.hasOwnProperty("length"); // Found on Object.prototype
```

### 1.2. `__proto__` vs `prototype`

```javascript
// IMPORTANT: These are DIFFERENT concepts!

function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hello, I'm ${this.name}`;
};

const john = new Person("John");

// __proto__: property on INSTANCES, points to constructor's prototype
console.log(john.__proto__ === Person.prototype); // true

// prototype: property on FUNCTIONS, used when creating instances with 'new'
console.log(Person.prototype); // { greet: [Function], constructor: Person }

// john looks up methods via __proto__
john.greet(); // "Hello, I'm John" (found on Person.prototype)
```

```
┌─────────────────────────────────────────────────────────────┐
│            __proto__ vs prototype                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  __proto__ (on instances):                                   │
│  - Links instance to its prototype                          │
│  - Used for property lookup                                  │
│  - Access: Object.getPrototypeOf() (preferred)              │
│                                                              │
│  prototype (on functions):                                   │
│  - Object used as prototype for instances                   │
│  - Only exists on functions                                  │
│  - Sets up __proto__ when using 'new'                       │
│                                                              │
│  new Person() does:                                          │
│  1. const obj = {}                                           │
│  2. obj.__proto__ = Person.prototype                        │
│  3. Person.call(obj, args)                                  │
│  4. return obj                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3. Methods on Prototype (Shared)

```javascript
function Calculator() {
  this.value = 0;
}

// Methods on prototype are SHARED across all instances
Calculator.prototype.add = function (num) {
  this.value += num;
  return this; // Return this for chaining
};

Calculator.prototype.subtract = function (num) {
  this.value -= num;
  return this;
};

Calculator.prototype.getResult = function () {
  return this.value;
};

const calc1 = new Calculator();
const calc2 = new Calculator();

calc1.add(5).subtract(2);
calc2.add(10);

console.log(calc1.getResult()); // 3
console.log(calc2.getResult()); // 10

// Methods are the SAME function object (memory efficient)
console.log(calc1.add === calc2.add); // true
```

### 1.4. Property Lookup

```javascript
const parent = {
  parentProp: "parent",
  sharedMethod() {
    return "from parent";
  }
};

const child = Object.create(parent);
child.childProp = "child";

// Own property
console.log(child.childProp); // "child"
console.log(child.hasOwnProperty("childProp")); // true

// Inherited property
console.log(child.parentProp); // "parent" (from prototype)
console.log(child.hasOwnProperty("parentProp")); // false

// Method lookup
console.log(child.sharedMethod()); // "from parent"

// Property shadowing
child.parentProp = "overridden"; // Creates OWN property
console.log(child.parentProp); // "overridden"
console.log(parent.parentProp); // "parent" (unchanged)
```

---

## Level 2: Intermediate - Inheritance Patterns

### 2.1. Constructor Inheritance (Pre-ES6)

```javascript
// Parent constructor
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

Animal.prototype.move = function () {
  return `${this.name} moves`;
};

// Child constructor
function Dog(name, breed) {
  // Step 1: Call parent constructor
  Animal.call(this, name);
  this.breed = breed;
}

// Step 2: Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);

// Step 3: Fix constructor reference (important!)
Dog.prototype.constructor = Dog;

// Step 4: Add child methods
Dog.prototype.bark = function () {
  return `${this.name} barks`;
};

// Step 5: Override parent method (optional)
Dog.prototype.speak = function () {
  return `${this.name} barks loudly`;
};

const dog = new Dog("Rex", "Golden Retriever");
dog.speak(); // "Rex barks loudly" (overridden)
dog.move(); // "Rex moves" (inherited)
dog.bark(); // "Rex barks"

// instanceof works correctly
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
console.log(dog instanceof Object); // true
```

### 2.2. Object.create()

```javascript
// Create object with specific prototype
const animal = {
  speak() {
    return `${this.name} makes a sound`;
  }
};

const dog = Object.create(animal);
dog.name = "Rex";
dog.bark = function () {
  return "Woof!";
};

dog.speak(); // "Rex makes a sound" (inherited)
dog.bark(); // "Woof!" (own method)

// Multi-level inheritance
const puppy = Object.create(dog);
puppy.name = "Max";
puppy.speak(); // "Max makes a sound"
puppy.bark(); // "Woof!"

// Create object with NO prototype (pure dictionary)
const dict = Object.create(null);
dict.key = "value";
// dict.hasOwnProperty; // undefined - no inherited methods!

// Object.create with property descriptors
const child = Object.create(animal, {
  name: {
    value: "Buddy",
    writable: true,
    enumerable: true,
    configurable: true
  }
});
```

### 2.3. ES6 Class = Prototype Syntax Sugar

```javascript
// ES6 Class syntax
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call parent constructor
    this.breed = breed;
  }

  speak() {
    // Override
    return `${this.name} barks`;
  }

  bark() {
    return `${this.name} says woof!`;
  }
}

// Under the hood, this is equivalent to:
function AnimalFn(name) {
  this.name = name;
}
AnimalFn.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

function DogFn(name, breed) {
  AnimalFn.call(this, name);
  this.breed = breed;
}
DogFn.prototype = Object.create(AnimalFn.prototype);
DogFn.prototype.constructor = DogFn;
DogFn.prototype.speak = function () {
  return `${this.name} barks`;
};
DogFn.prototype.bark = function () {
  return `${this.name} says woof!`;
};

// Both produce same prototype chain
const dog1 = new Dog("Rex", "Golden");
const dog2 = new DogFn("Max", "Labrador");

console.log(Object.getPrototypeOf(dog1) === Dog.prototype); // true
console.log(Object.getPrototypeOf(dog2) === DogFn.prototype); // true
```

### 2.4. hasOwnProperty() and Property Iteration

```javascript
const parent = { inherited: "value" };
const child = Object.create(parent);
child.own = "own value";

// hasOwnProperty - check if property is directly on object
console.log(child.hasOwnProperty("own")); // true
console.log(child.hasOwnProperty("inherited")); // false

// 'in' operator - checks own AND prototype chain
console.log("own" in child); // true
console.log("inherited" in child); // true

// for...in iterates own AND inherited enumerable properties
for (let key in child) {
  console.log(key); // "own", "inherited"
}

// Filter to own properties only
for (let key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key); // "own" only
  }
}

// Object.keys() - own enumerable properties only
console.log(Object.keys(child)); // ["own"]

// Object.getOwnPropertyNames() - own properties (including non-enumerable)
console.log(Object.getOwnPropertyNames(child)); // ["own"]
```

### 2.5. Calling Parent Methods

```javascript
// Constructor inheritance
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

function Dog(name) {
  Animal.call(this, name); // Call parent constructor
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.speak = function () {
  // Call parent method
  const parentResult = Animal.prototype.speak.call(this);
  return `${parentResult} (specifically, a bark)`;
};

const dog = new Dog("Rex");
dog.speak(); // "Rex makes a sound (specifically, a bark)"

// ES6 Class - using super
class Cat extends Animal {
  speak() {
    return `${super.speak()} (meow!)`;
  }
}

const cat = new Cat("Whiskers");
cat.speak(); // "Whiskers makes a sound (meow!)"
```

---

## Level 3: Advanced - Patterns & Performance

### 3.1. Mixins Pattern

```javascript
// Mixins: compose behavior from multiple sources
const CanFly = {
  fly() {
    return `${this.name} is flying at ${this.altitude || 0}m`;
  },
  takeOff() {
    this.altitude = 100;
    return `${this.name} takes off`;
  }
};

const CanSwim = {
  swim() {
    return `${this.name} is swimming`;
  },
  dive(depth) {
    this.depth = depth;
    return `${this.name} dives to ${depth}m`;
  }
};

// Apply mixins to prototype
function Duck(name) {
  this.name = name;
  this.altitude = 0;
}

Object.assign(Duck.prototype, CanFly, CanSwim);

const duck = new Duck("Donald");
duck.takeOff(); // "Donald takes off"
duck.fly(); // "Donald is flying at 100m"
duck.swim(); // "Donald is swimming"

// Mixin with class
class Bird {
  constructor(name) {
    this.name = name;
  }
}

// Apply mixin
Object.assign(Bird.prototype, CanFly);

// Factory function for mixins
function mixin(targetClass, ...sources) {
  Object.assign(targetClass.prototype, ...sources);
  return targetClass;
}

mixin(Bird, CanFly, CanSwim);
```

### 3.2. Prototype Pollution (Security)

```javascript
// ❌ DANGER: Prototype pollution attack
const maliciousInput = '{"__proto__": {"isAdmin": true}}';

// Unsafe parsing
const obj = JSON.parse(maliciousInput);
// obj.__proto__.isAdmin = true could pollute Object.prototype!

const user = {};
console.log(user.isAdmin); // Could be true if polluted!

// ✅ Prevention strategies:

// 1. Use Object.create(null) for dictionaries
const safeDict = Object.create(null);
// No prototype = no pollution target

// 2. Validate and sanitize input
function safeParse(json) {
  const obj = JSON.parse(json);

  function sanitize(obj) {
    if (obj && typeof obj === "object") {
      // Remove dangerous keys
      delete obj.__proto__;
      delete obj.constructor;
      delete obj.prototype;

      // Recursively sanitize
      for (const key of Object.keys(obj)) {
        sanitize(obj[key]);
      }
    }
    return obj;
  }

  return sanitize(obj);
}

// 3. Use Object.freeze on prototypes
Object.freeze(Object.prototype);
// Prevents modification (but may break some libraries)

// 4. Use Map instead of plain objects
const safeMap = new Map();
safeMap.set("key", "value");
// Maps don't have prototype pollution issues
```

### 3.3. Object.setPrototypeOf() Warning

```javascript
// Changing prototype at runtime is SLOW!
const animal = {
  speak() {
    return "sound";
  }
};

const dog = { name: "Rex" };

// ❌ Slow - forces deoptimization
Object.setPrototypeOf(dog, animal);
dog.speak(); // "sound"

// ✅ Fast - set prototype at creation time
const dog2 = Object.create(animal);
dog2.name = "Max";
dog2.speak(); // "sound"

// ✅ Or use class/constructor pattern
function Dog(name) {
  this.name = name;
}
Dog.prototype = Object.create(animal);
const dog3 = new Dog("Buddy");
```

### 3.4. Efficient Methods (Prototype vs Instance)

```javascript
// ❌ INEFFICIENT: Methods in constructor (new function per instance)
function PersonBad(name) {
  this.name = name;
  this.greet = function () {
    // Created for EACH instance
    return `Hello, ${this.name}`;
  };
}

const p1 = new PersonBad("John");
const p2 = new PersonBad("Jane");
console.log(p1.greet === p2.greet); // false (different functions!)

// ✅ EFFICIENT: Methods on prototype (shared)
function PersonGood(name) {
  this.name = name;
}

PersonGood.prototype.greet = function () {
  // Created ONCE, shared by all
  return `Hello, ${this.name}`;
};

const p3 = new PersonGood("John");
const p4 = new PersonGood("Jane");
console.log(p3.greet === p4.greet); // true (same function!)

// Memory usage:
// 1000 PersonBad instances = 1000 greet functions
// 1000 PersonGood instances = 1 greet function
```

### 3.5. instanceof and Prototype Checking

```javascript
function Animal(name) {
  this.name = name;
}

function Dog(name) {
  Animal.call(this, name);
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const dog = new Dog("Rex");

// instanceof checks prototype chain
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
console.log(dog instanceof Object); // true

// How instanceof works:
function myInstanceOf(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj);

  while (proto !== null) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

// isPrototypeOf - reverse direction
console.log(Animal.prototype.isPrototypeOf(dog)); // true
console.log(Dog.prototype.isPrototypeOf(dog)); // true
```

### 3.6. Inherit from Built-ins

```javascript
// ES6 makes inheriting from built-ins possible
class CustomArray extends Array {
  first() {
    return this[0];
  }

  last() {
    return this[this.length - 1];
  }

  sum() {
    return this.reduce((a, b) => a + b, 0);
  }
}

const arr = new CustomArray(1, 2, 3, 4, 5);
console.log(arr.first()); // 1
console.log(arr.last()); // 5
console.log(arr.sum()); // 15

// All Array methods work and return CustomArray
const doubled = arr.map((x) => x * 2);
console.log(doubled instanceof CustomArray); // true
console.log(doubled.sum()); // 30

// Custom Error
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

throw new ValidationError("email", "Invalid email format");
```

---

## Real-world Applications

### Plugin System

```javascript
class PluginSystem {
  #plugins = [];
  #hooks = new Map();

  register(plugin) {
    this.#plugins.push(plugin);

    if (typeof plugin.install === "function") {
      plugin.install(this);
    }

    return this;
  }

  addHook(name, callback) {
    if (!this.#hooks.has(name)) {
      this.#hooks.set(name, []);
    }
    this.#hooks.get(name).push(callback);
  }

  async runHook(name, context) {
    const hooks = this.#hooks.get(name) || [];

    for (const hook of hooks) {
      await hook(context);
    }

    return context;
  }
}

// Define plugin using prototype
function LoggerPlugin() {
  this.name = "logger";
}

LoggerPlugin.prototype.install = function (system) {
  system.addHook("beforeRequest", async (ctx) => {
    console.log(`Request: ${ctx.method} ${ctx.url}`);
  });

  system.addHook("afterResponse", async (ctx) => {
    console.log(`Response: ${ctx.status}`);
  });
};

// Usage
const app = new PluginSystem();
app.register(new LoggerPlugin());

await app.runHook("beforeRequest", { method: "GET", url: "/api/users" });
```

### Observable Pattern with Prototype

```javascript
function Observable() {
  this.observers = [];
}

Observable.prototype.subscribe = function (observer) {
  this.observers.push(observer);

  // Return unsubscribe function
  return () => {
    this.observers = this.observers.filter((obs) => obs !== observer);
  };
};

Observable.prototype.notify = function (data) {
  this.observers.forEach((observer) => observer(data));
};

// Extend for specific use case
function Store(initialState) {
  Observable.call(this);
  this.state = initialState;
}

Store.prototype = Object.create(Observable.prototype);
Store.prototype.constructor = Store;

Store.prototype.setState = function (newState) {
  this.state = { ...this.state, ...newState };
  this.notify(this.state);
};

Store.prototype.getState = function () {
  return this.state;
};

// Usage
const store = new Store({ count: 0 });

const unsubscribe = store.subscribe((state) => {
  console.log("State changed:", state);
});

store.setState({ count: 1 }); // Logs: "State changed: { count: 1 }"
store.setState({ count: 2 }); // Logs: "State changed: { count: 2 }"

unsubscribe();
store.setState({ count: 3 }); // No log
```

### Event Emitter Pattern

```javascript
function EventEmitter() {
  this.events = Object.create(null);
}

EventEmitter.prototype.on = function (event, listener) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(listener);
  return this;
};

EventEmitter.prototype.off = function (event, listener) {
  if (!this.events[event]) return this;

  this.events[event] = this.events[event].filter((l) => l !== listener);
  return this;
};

EventEmitter.prototype.emit = function (event, ...args) {
  if (!this.events[event]) return false;

  this.events[event].forEach((listener) => listener.apply(this, args));
  return true;
};

EventEmitter.prototype.once = function (event, listener) {
  const wrapper = (...args) => {
    listener.apply(this, args);
    this.off(event, wrapper);
  };
  return this.on(event, wrapper);
};

// Extend for WebSocket-like pattern
function Connection(url) {
  EventEmitter.call(this);
  this.url = url;
  this.status = "disconnected";
}

Connection.prototype = Object.create(EventEmitter.prototype);
Connection.prototype.constructor = Connection;

Connection.prototype.connect = function () {
  this.status = "connecting";
  this.emit("connecting");

  // Simulate connection
  setTimeout(() => {
    this.status = "connected";
    this.emit("connected");
  }, 100);
};

// Usage
const conn = new Connection("ws://localhost");
conn.on("connected", () => console.log("Connected!"));
conn.connect();
```

---

## Interview Questions

### Level 1: Basic

**1. Prototype là gì?**

```
Prototype là object mà một object khác inherit properties từ đó.

- Mọi object đều có internal [[Prototype]] link
- Khi access property: tìm trong object → prototype → prototype → ... → null
- Đây là cơ chế inheritance trong JavaScript

const obj = {};
Object.getPrototypeOf(obj); // Object.prototype
```

**2. `__proto__` và `prototype` khác nhau thế nào?**

```javascript
function Person(name) {
  this.name = name;
}

const john = new Person("John");

// __proto__: trên INSTANCE, link đến prototype của constructor
john.__proto__ === Person.prototype; // true

// prototype: trên FUNCTION, object dùng làm prototype cho instances
Person.prototype; // { constructor: Person }

// Khi dùng 'new':
// 1. Tạo object rỗng
// 2. Set object.__proto__ = Constructor.prototype
// 3. Gọi constructor với this = object
// 4. Return object
```

**3. Tại sao nên đặt methods trên prototype?**

```javascript
// ❌ BAD: mỗi instance có riêng function
function PersonBad(name) {
  this.greet = function () {};
}

// ✅ GOOD: share 1 function giữa tất cả instances
function PersonGood(name) {}
PersonGood.prototype.greet = function () {};

// 1000 instances:
// Bad: 1000 functions (memory waste)
// Good: 1 function (efficient)
```

### Level 2: Intermediate

**4. Làm sao set up inheritance giữa 2 constructors?**

```javascript
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {};

function Dog(name) {
  Animal.call(this, name); // 1. Call parent constructor
}

Dog.prototype = Object.create(Animal.prototype); // 2. Set up chain
Dog.prototype.constructor = Dog; // 3. Fix constructor

// Tương đương ES6:
class Dog extends Animal {
  constructor(name) {
    super(name);
  }
}
```

**5. Object.create() khác gì với `new`?**

```javascript
// Object.create(proto):
// - Tạo object với prototype = proto
// - KHÔNG gọi constructor
const dog1 = Object.create(Animal.prototype);

// new Constructor():
// - Tạo object với prototype = Constructor.prototype
// - GỌI constructor
const dog2 = new Animal("Rex");

// Object.create(null) tạo object không có prototype
const dict = Object.create(null);
dict.hasOwnProperty; // undefined
```

**6. hasOwnProperty() vs `in` operator?**

```javascript
const parent = { inherited: 1 };
const child = Object.create(parent);
child.own = 2;

// hasOwnProperty: chỉ check own properties
child.hasOwnProperty("own"); // true
child.hasOwnProperty("inherited"); // false

// in: check own + prototype chain
"own" in child; // true
"inherited" in child; // true
```

### Level 3: Advanced

**7. Prototype pollution là gì? Cách phòng tránh?**

```javascript
// Attack: modify Object.prototype affects ALL objects
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');

// Prevention:
// 1. Object.create(null) for dictionaries
const dict = Object.create(null);

// 2. Sanitize input
delete obj.__proto__;
delete obj.constructor;

// 3. Use Map instead of plain objects
const map = new Map();

// 4. Object.freeze(Object.prototype)
```

**8. Tại sao Object.setPrototypeOf() chậm?**

```javascript
// Changing prototype at runtime:
// - Forces V8 to deoptimize object
// - Breaks hidden classes optimization
// - Should be avoided in performance-critical code

// ❌ Slow
Object.setPrototypeOf(obj, newProto);

// ✅ Fast - set at creation
const obj = Object.create(newProto);
```

**9. Implement instanceof:**

```javascript
function myInstanceOf(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj);

  while (proto !== null) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

// Works by walking up the prototype chain
myInstanceOf([], Array); // true
myInstanceOf([], Object); // true
myInstanceOf({}, Array); // false
```

**10. Mixins pattern và khi nào dùng:**

```javascript
// Mixins: compose behavior từ nhiều sources
const Flyable = {
  fly() {
    return `${this.name} flies`;
  }
};

const Swimmable = {
  swim() {
    return `${this.name} swims`;
  }
};

class Duck {
  constructor(name) {
    this.name = name;
  }
}

Object.assign(Duck.prototype, Flyable, Swimmable);

// Use when:
// - Need multiple inheritance (JS chỉ single inheritance)
// - Share behavior across unrelated classes
// - Compose features flexibly
```
