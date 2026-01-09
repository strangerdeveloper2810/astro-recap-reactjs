# 11 - JavaScript Core & ES6+

> **10 câu hỏi chuyên sâu về JavaScript fundamentals và ES6+**

---

## Q11.1: Event Loop và Asynchronous JavaScript

### Câu hỏi
Giải thích Event Loop trong JavaScript. Output của đoạn code sau là gì?

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

queueMicrotask(() => console.log('4'));

console.log('5');
```

### Trả lời

#### Event Loop Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT LOOP                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐                                           │
│   │  Call Stack │  ◄── Synchronous code executes here       │
│   └──────┬──────┘                                           │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────────────────────────────────┐               │
│   │           Microtask Queue               │               │
│   │  (Promise callbacks, queueMicrotask)    │               │
│   │  Priority: HIGH - runs after each task  │               │
│   └─────────────────────────────────────────┘               │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────────────────────────────────┐               │
│   │           Macrotask Queue               │               │
│   │  (setTimeout, setInterval, I/O, UI)     │               │
│   │  Priority: LOW - one per event loop     │               │
│   └─────────────────────────────────────────┘               │
│                                                              │
│   EXECUTION ORDER:                                          │
│   1. Execute all synchronous code (call stack)              │
│   2. Execute ALL microtasks until queue is empty            │
│   3. Execute ONE macrotask                                  │
│   4. Repeat from step 2                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Output Analysis

```javascript
console.log('1');  // Sync - Call Stack

setTimeout(() => console.log('2'), 0);  // Macrotask Queue

Promise.resolve().then(() => console.log('3'));  // Microtask Queue

queueMicrotask(() => console.log('4'));  // Microtask Queue

console.log('5');  // Sync - Call Stack

// Output: 1, 5, 3, 4, 2
```

**Giải thích:**
1. `'1'` - Synchronous, executes immediately
2. `setTimeout` - Đưa vào Macrotask Queue
3. `Promise.then` - Đưa vào Microtask Queue
4. `queueMicrotask` - Đưa vào Microtask Queue
5. `'5'` - Synchronous, executes immediately
6. Call stack empty → Execute ALL microtasks: `'3'`, `'4'`
7. Execute ONE macrotask: `'2'`

#### Complex Example

```javascript
console.log('script start');

setTimeout(() => {
  console.log('setTimeout 1');
  Promise.resolve().then(() => console.log('promise inside setTimeout'));
}, 0);

Promise.resolve()
  .then(() => {
    console.log('promise 1');
    return Promise.resolve();
  })
  .then(() => console.log('promise 2'));

setTimeout(() => console.log('setTimeout 2'), 0);

console.log('script end');

// Output:
// script start
// script end
// promise 1
// promise 2
// setTimeout 1
// promise inside setTimeout
// setTimeout 2
```

#### async/await và Event Loop

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');  // Microtask!
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => console.log('setTimeout'), 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => console.log('promise2'));

console.log('script end');

// Output:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

---

## Q11.2: Closures và Lexical Scope

### Câu hỏi
Giải thích Closures. Sửa lỗi trong đoạn code sau:

```javascript
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 5, 5, 5, 5, 5 (không phải 0, 1, 2, 3, 4)
```

### Trả lời

#### Closure Definition

```
┌─────────────────────────────────────────────────────────────┐
│                      CLOSURE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   A closure is a function that remembers its lexical        │
│   scope even when executed outside that scope.              │
│                                                              │
│   ┌─────────────────────────────────────────┐               │
│   │         Outer Function Scope            │               │
│   │   ┌─────────────────────────────────┐   │               │
│   │   │    Inner Function (Closure)     │   │               │
│   │   │    - Has access to outer vars   │   │               │
│   │   │    - Keeps reference alive      │   │               │
│   │   └─────────────────────────────────┘   │               │
│   └─────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Solutions

```javascript
// Solution 1: Use let (block scope)
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2, 3, 4

// Solution 2: IIFE (Immediately Invoked Function Expression)
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}

// Solution 3: setTimeout với tham số thứ 3
for (var i = 0; i < 5; i++) {
  setTimeout((j) => console.log(j), 100, i);
}

// Solution 4: bind
for (var i = 0; i < 5; i++) {
  setTimeout(console.log.bind(console, i), 100);
}
```

#### Practical Closure Examples

```javascript
// 1. Data Privacy / Encapsulation
function createCounter() {
  let count = 0;  // Private variable

  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.count);       // undefined (private!)

// 2. Function Factory
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// 3. Memoization
function memoize(fn) {
  const cache = {};  // Closure keeps cache alive

  return function(...args) {
    const key = JSON.stringify(args);

    if (key in cache) {
      console.log('From cache');
      return cache[key];
    }

    console.log('Computing');
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

const expensiveOperation = memoize((n) => {
  // Simulate expensive computation
  return n * n;
});

expensiveOperation(5); // Computing, returns 25
expensiveOperation(5); // From cache, returns 25

// 4. Module Pattern
const bankAccount = (function() {
  let balance = 0;  // Private

  return {
    deposit(amount) {
      if (amount > 0) {
        balance += amount;
        return balance;
      }
    },
    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        return balance;
      }
      return 'Insufficient funds';
    },
    getBalance() {
      return balance;
    }
  };
})();

bankAccount.deposit(100);     // 100
bankAccount.withdraw(30);     // 70
bankAccount.balance = 1000;   // Doesn't affect real balance
bankAccount.getBalance();     // 70 (still protected)

// 5. Event Handlers with State
function setupButton(buttonId) {
  let clickCount = 0;

  document.getElementById(buttonId).addEventListener('click', () => {
    clickCount++;
    console.log(`Clicked ${clickCount} times`);
  });
}

// 6. Currying with Closures
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }

    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));    // 6
console.log(curriedAdd(1, 2)(3));    // 6
console.log(curriedAdd(1)(2, 3));    // 6
```

---

## Q11.3: Prototypes và Inheritance

### Câu hỏi
Giải thích Prototype Chain trong JavaScript. Sự khác biệt giữa `__proto__`, `prototype`, và `Object.getPrototypeOf()`?

### Trả lời

#### Prototype Chain Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                   PROTOTYPE CHAIN                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   const dog = new Animal('Dog');                            │
│                                                              │
│   ┌─────────────┐                                           │
│   │    dog      │                                           │
│   │  instance   │                                           │
│   └──────┬──────┘                                           │
│          │ __proto__                                         │
│          ▼                                                   │
│   ┌─────────────────────┐                                   │
│   │ Animal.prototype    │                                   │
│   │ - speak()           │                                   │
│   │ - eat()             │                                   │
│   └──────┬──────────────┘                                   │
│          │ __proto__                                         │
│          ▼                                                   │
│   ┌─────────────────────┐                                   │
│   │ Object.prototype    │                                   │
│   │ - toString()        │                                   │
│   │ - hasOwnProperty()  │                                   │
│   └──────┬──────────────┘                                   │
│          │ __proto__                                         │
│          ▼                                                   │
│        null                                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Terminology Differences

```javascript
// Constructor Function
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound`);
};

const dog = new Animal('Dog');

// __proto__ vs prototype vs Object.getPrototypeOf()

// 1. prototype - Property của FUNCTION
console.log(Animal.prototype);  // { speak: [Function], constructor: Animal }

// 2. __proto__ - Property của INSTANCE (deprecated, use Object.getPrototypeOf)
console.log(dog.__proto__);  // { speak: [Function], constructor: Animal }
console.log(dog.__proto__ === Animal.prototype);  // true

// 3. Object.getPrototypeOf() - Standard way to get prototype
console.log(Object.getPrototypeOf(dog));  // { speak: [Function], constructor: Animal }
console.log(Object.getPrototypeOf(dog) === Animal.prototype);  // true

// 4. instanceof checks prototype chain
console.log(dog instanceof Animal);  // true
console.log(dog instanceof Object);  // true
```

#### ES6 Classes (Syntactic Sugar)

```javascript
// ES6 Class Syntax
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }

  // Static method
  static kingdom() {
    return 'Animalia';
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // Call parent constructor
    this.breed = breed;
  }

  speak() {
    console.log(`${this.name} barks`);
  }

  // Access parent method
  speakLikeAnimal() {
    super.speak();
  }
}

const dog = new Dog('Buddy', 'Golden Retriever');
dog.speak();           // Buddy barks
dog.speakLikeAnimal(); // Buddy makes a sound

// Under the hood, it's still prototypes:
console.log(dog.__proto__ === Dog.prototype);                    // true
console.log(Dog.prototype.__proto__ === Animal.prototype);       // true
console.log(Animal.prototype.__proto__ === Object.prototype);    // true
```

#### Prototypal Inheritance Patterns

```javascript
// 1. Object.create() - Direct prototype setting
const animalProto = {
  speak() {
    console.log(`${this.name} makes a sound`);
  }
};

const dog = Object.create(animalProto);
dog.name = 'Buddy';
dog.speak();  // Buddy makes a sound

// 2. Factory Functions with Object.create()
function createAnimal(name) {
  const animal = Object.create(animalProto);
  animal.name = name;
  return animal;
}

// 3. Composition over Inheritance
const canEat = {
  eat() { console.log('Eating'); }
};

const canWalk = {
  walk() { console.log('Walking'); }
};

const canSwim = {
  swim() { console.log('Swimming'); }
};

// Compose behaviors
const duck = Object.assign({}, canEat, canWalk, canSwim);
duck.eat();   // Eating
duck.walk();  // Walking
duck.swim();  // Swimming

// 4. Mixin Pattern
function mixin(target, ...sources) {
  Object.assign(target.prototype, ...sources);
}

class Robot {
  constructor(name) {
    this.name = name;
  }
}

const canFly = {
  fly() {
    console.log(`${this.name} is flying`);
  }
};

const canShoot = {
  shoot() {
    console.log(`${this.name} is shooting`);
  }
};

mixin(Robot, canFly, canShoot);

const robot = new Robot('R2D2');
robot.fly();    // R2D2 is flying
robot.shoot();  // R2D2 is shooting
```

---

## Q11.4: this Binding

### Câu hỏi
Giải thích các rules của `this` binding. Output của đoạn code sau?

```javascript
const obj = {
  name: 'Object',
  regularFunc: function() {
    console.log(this.name);
  },
  arrowFunc: () => {
    console.log(this.name);
  },
  nested: {
    name: 'Nested',
    method: function() {
      console.log(this.name);
    }
  }
};

obj.regularFunc();
obj.arrowFunc();
obj.nested.method();

const detached = obj.regularFunc;
detached();
```

### Trả lời

#### this Binding Rules

```
┌─────────────────────────────────────────────────────────────┐
│                  this BINDING RULES                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   PRIORITY (highest to lowest):                             │
│                                                              │
│   1. new Binding                                            │
│      const obj = new Foo();  // this = new object           │
│                                                              │
│   2. Explicit Binding (call, apply, bind)                   │
│      func.call(obj);         // this = obj                  │
│      func.apply(obj);        // this = obj                  │
│      func.bind(obj)();       // this = obj                  │
│                                                              │
│   3. Implicit Binding (method call)                         │
│      obj.method();           // this = obj                  │
│                                                              │
│   4. Default Binding                                        │
│      func();                 // this = window (or undefined │
│                              //          in strict mode)    │
│                                                              │
│   SPECIAL: Arrow functions                                  │
│   - Don't have their own this                               │
│   - Inherit this from enclosing scope (lexical)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Code Analysis

```javascript
const obj = {
  name: 'Object',
  regularFunc: function() {
    console.log(this.name);
  },
  arrowFunc: () => {
    console.log(this.name);  // Arrow inherits from global/module scope
  },
  nested: {
    name: 'Nested',
    method: function() {
      console.log(this.name);
    }
  }
};

obj.regularFunc();      // 'Object' (implicit binding: obj.method())
obj.arrowFunc();        // undefined (arrow function, this = global)
obj.nested.method();    // 'Nested' (implicit binding: nested.method())

const detached = obj.regularFunc;
detached();             // undefined (default binding, lost implicit binding)
```

#### Fixing this Issues

```javascript
// Problem: Callback loses this context
class Timer {
  constructor() {
    this.seconds = 0;
  }

  start() {
    // ❌ Problem: this is undefined in callback
    setInterval(function() {
      this.seconds++;  // TypeError!
      console.log(this.seconds);
    }, 1000);
  }
}

// Solution 1: Arrow function
class Timer {
  constructor() {
    this.seconds = 0;
  }

  start() {
    setInterval(() => {
      this.seconds++;  // ✅ Arrow inherits this from start()
      console.log(this.seconds);
    }, 1000);
  }
}

// Solution 2: bind()
class Timer {
  constructor() {
    this.seconds = 0;
  }

  start() {
    setInterval(function() {
      this.seconds++;
      console.log(this.seconds);
    }.bind(this), 1000);  // ✅ Explicitly bind this
  }
}

// Solution 3: Store reference
class Timer {
  constructor() {
    this.seconds = 0;
  }

  start() {
    const self = this;  // ✅ Store reference

    setInterval(function() {
      self.seconds++;
      console.log(self.seconds);
    }, 1000);
  }
}

// Solution 4: Class field arrow function
class Timer {
  seconds = 0;

  // Arrow function as class field - auto-binds to instance
  tick = () => {
    this.seconds++;
    console.log(this.seconds);
  }

  start() {
    setInterval(this.tick, 1000);  // ✅ Already bound
  }
}
```

#### call, apply, bind

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'John' };

// call - arguments passed individually
greet.call(person, 'Hello', '!');  // Hello, John!

// apply - arguments passed as array
greet.apply(person, ['Hi', '?']);  // Hi, John?

// bind - returns new function with this bound
const boundGreet = greet.bind(person, 'Hey');
boundGreet('!');  // Hey, John!

// Practical use: borrowing methods
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
const arr = Array.prototype.slice.call(arrayLike);
console.log(arr);  // ['a', 'b']

// Modern alternative
const arr2 = Array.from(arrayLike);
const arr3 = [...arrayLike];  // Only works with iterables
```

---

## Q11.5: Promises và Async/Await

### Câu hỏi
Implement Promise.all, Promise.race, và Promise.allSettled từ đầu.

### Trả lời

```javascript
// Promise.all - Resolves when ALL resolve, rejects if ANY rejects
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    if (promises.length === 0) {
      return resolve([]);
    }

    const results = new Array(promises.length);
    let completed = 0;

    promises.forEach((promise, index) => {
      // Handle non-promise values
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completed++;

          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);  // First rejection rejects the whole thing
    });
  });
}

// Promise.race - Resolves/rejects with first settled promise
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    promises.forEach(promise => {
      Promise.resolve(promise)
        .then(resolve)
        .catch(reject);
    });
  });
}

// Promise.allSettled - Waits for ALL to settle (resolve or reject)
function promiseAllSettled(promises) {
  return new Promise((resolve) => {
    if (!Array.isArray(promises)) {
      return resolve([]);
    }

    if (promises.length === 0) {
      return resolve([]);
    }

    const results = new Array(promises.length);
    let completed = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = { status: 'fulfilled', value };
        })
        .catch(reason => {
          results[index] = { status: 'rejected', reason };
        })
        .finally(() => {
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        });
    });
  });
}

// Promise.any - Resolves with first fulfilled, rejects if ALL reject
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    if (promises.length === 0) {
      return reject(new AggregateError([], 'All promises were rejected'));
    }

    const errors = new Array(promises.length);
    let rejectedCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(resolve)  // First fulfillment wins
        .catch(error => {
          errors[index] = error;
          rejectedCount++;

          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        });
    });
  });
}

// Testing
const p1 = Promise.resolve(1);
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 100));
const p3 = Promise.reject('error');

promiseAll([p1, p2]).then(console.log);  // [1, 2]
promiseRace([p1, p2]).then(console.log); // 1
promiseAllSettled([p1, p2, p3]).then(console.log);
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'fulfilled', value: 2 },
//   { status: 'rejected', reason: 'error' }
// ]
```

#### Advanced Async Patterns

```javascript
// 1. Sequential vs Parallel execution
async function sequential() {
  const result1 = await fetchData1();  // Wait for this
  const result2 = await fetchData2();  // Then this
  return [result1, result2];
}

async function parallel() {
  const [result1, result2] = await Promise.all([
    fetchData1(),  // Start both
    fetchData2()   // at the same time
  ]);
  return [result1, result2];
}

// 2. Error handling patterns
async function withErrorHandling() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    return defaultValue;
  }
}

// 3. Retry pattern
async function retry(fn, maxAttempts = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed, retrying...`);

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
}

// 4. Timeout wrapper
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });

  return Promise.race([promise, timeout]);
}

// 5. Debounced async function
function debounceAsync(fn, delay) {
  let timeoutId;
  let pendingPromise = null;

  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}

// 6. Async Queue
class AsyncQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

// Usage
const queue = new AsyncQueue(2);  // Max 2 concurrent

urls.forEach(url => {
  queue.add(() => fetch(url));
});
```

---

## Q11.6: Destructuring, Spread, và Rest

### Câu hỏi
Giải thích các use cases của Destructuring, Spread, và Rest operators.

### Trả lời

```javascript
// ===== DESTRUCTURING =====

// Object Destructuring
const user = {
  name: 'John',
  age: 30,
  address: {
    city: 'NYC',
    country: 'USA'
  }
};

// Basic
const { name, age } = user;

// With rename
const { name: userName, age: userAge } = user;

// With default values
const { name, role = 'user' } = user;

// Nested destructuring
const { address: { city, country } } = user;

// Rest in destructuring
const { name, ...rest } = user;  // rest = { age, address }

// Array Destructuring
const colors = ['red', 'green', 'blue'];

const [first, second] = colors;  // first = 'red', second = 'green'
const [, , third] = colors;      // third = 'blue' (skip first two)
const [primary, ...others] = colors;  // primary = 'red', others = ['green', 'blue']

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a];  // a = 2, b = 1

// Function parameter destructuring
function createUser({ name, age, role = 'user' }) {
  return { name, age, role };
}

createUser({ name: 'John', age: 30 });

// ===== SPREAD OPERATOR =====

// Array spread
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4, 5, 6]

// Clone array (shallow)
const clone = [...arr1];

// Convert iterable to array
const str = 'hello';
const chars = [...str];  // ['h', 'e', 'l', 'l', 'o']

// Object spread
const defaults = { theme: 'light', lang: 'en' };
const userPrefs = { lang: 'vi' };
const settings = { ...defaults, ...userPrefs };  // { theme: 'light', lang: 'vi' }

// Clone object (shallow)
const userClone = { ...user };

// Add/override properties
const updatedUser = { ...user, age: 31, role: 'admin' };

// Function call with spread
const numbers = [1, 5, 3, 9, 2];
Math.max(...numbers);  // 9

// ===== REST OPERATOR =====

// Function parameters
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4);  // 10

// Combined with regular params
function logData(first, second, ...rest) {
  console.log(first);   // First argument
  console.log(second);  // Second argument
  console.log(rest);    // Array of remaining arguments
}

logData(1, 2, 3, 4, 5);  // 1, 2, [3, 4, 5]

// In destructuring (shown above)
const { name, ...otherProps } = user;
const [head, ...tail] = [1, 2, 3, 4];
```

#### Practical Examples

```javascript
// 1. Immutable updates (React patterns)
const state = {
  user: { name: 'John', age: 30 },
  posts: [{ id: 1, title: 'Hello' }]
};

// Update nested object
const newState = {
  ...state,
  user: { ...state.user, age: 31 }
};

// Add to array
const withNewPost = {
  ...state,
  posts: [...state.posts, { id: 2, title: 'World' }]
};

// Remove from array
const withoutFirst = {
  ...state,
  posts: state.posts.filter(p => p.id !== 1)
};

// 2. Function with options object
function fetchData({
  url,
  method = 'GET',
  headers = {},
  body = null,
  timeout = 5000
} = {}) {
  // Use destructured params with defaults
}

fetchData({ url: '/api/users', method: 'POST' });

// 3. Merge configs
const defaultConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retry: 3,
  headers: {
    'Content-Type': 'application/json'
  }
};

function createClient(customConfig) {
  return {
    ...defaultConfig,
    ...customConfig,
    headers: {
      ...defaultConfig.headers,
      ...customConfig.headers
    }
  };
}

// 4. Pick/Omit properties
const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {});

const omit = (obj, keys) => {
  const { ...rest } = obj;
  keys.forEach(key => delete rest[key]);
  return rest;
};

const user = { name: 'John', age: 30, password: 'secret' };
pick(user, ['name', 'age']);  // { name: 'John', age: 30 }
omit(user, ['password']);     // { name: 'John', age: 30 }
```

---

## Q11.7: Map, Set, WeakMap, WeakSet

### Câu hỏi
So sánh Map vs Object, Set vs Array. Khi nào dùng Weak versions?

### Trả lời

```
┌─────────────────────────────────────────────────────────────┐
│                  MAP vs OBJECT                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   MAP                           OBJECT                       │
│   ───                           ──────                       │
│   Any key type                  String/Symbol keys only      │
│   Maintains insertion order     No guaranteed order          │
│   Has size property             Need Object.keys().length    │
│   Better for frequent add/del   Better for static structure  │
│   Iterable by default           Need Object.entries()        │
│   No prototype chain issues     Can have prototype collisions│
│                                                              │
│   USE MAP when:                 USE OBJECT when:             │
│   - Keys are dynamic            - Static known keys          │
│   - Need non-string keys        - JSON serialization needed  │
│   - Frequent add/remove         - Simple key-value pairs     │
│   - Need iteration order        - Need prototype methods     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// Map Examples
const map = new Map();

// Any key type
map.set('string', 'value1');
map.set(123, 'value2');
map.set({ id: 1 }, 'value3');
map.set(function() {}, 'value4');

map.get('string');  // 'value1'
map.has(123);       // true
map.delete(123);
map.size;           // 3
map.clear();

// Initialize with entries
const userRoles = new Map([
  ['john', 'admin'],
  ['jane', 'editor'],
  ['bob', 'viewer']
]);

// Iteration
for (const [key, value] of userRoles) {
  console.log(`${key}: ${value}`);
}

userRoles.forEach((value, key) => console.log(`${key}: ${value}`));

// Convert to/from Object
const obj = Object.fromEntries(userRoles);
const mapFromObj = new Map(Object.entries(obj));

// Set Examples
const set = new Set([1, 2, 3, 3, 3]);  // {1, 2, 3} - duplicates removed

set.add(4);
set.has(2);     // true
set.delete(2);
set.size;       // 3

// Use cases
// 1. Remove duplicates
const unique = [...new Set([1, 2, 2, 3, 3, 3])];  // [1, 2, 3]

// 2. Array operations
const setA = new Set([1, 2, 3]);
const setB = new Set([2, 3, 4]);

// Union
const union = new Set([...setA, ...setB]);  // {1, 2, 3, 4}

// Intersection
const intersection = new Set([...setA].filter(x => setB.has(x)));  // {2, 3}

// Difference
const difference = new Set([...setA].filter(x => !setB.has(x)));  // {1}
```

#### WeakMap and WeakSet

```javascript
// WeakMap - Keys must be objects, keys are weakly referenced
// (can be garbage collected if no other references exist)

// Use case 1: Private data
const privateData = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    privateData.set(this, { password });
  }

  checkPassword(password) {
    return privateData.get(this).password === password;
  }
}

const user = new User('John', 'secret');
user.name;              // 'John'
user.password;          // undefined (private!)
user.checkPassword('secret');  // true

// Use case 2: Cache with automatic cleanup
const cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }

  const result = expensiveOperation(obj);
  cache.set(obj, result);
  return result;
}

let obj = { data: 'test' };
process(obj);  // Computed and cached

obj = null;  // obj is now garbage collected, cache entry automatically removed

// Use case 3: DOM element metadata
const elementData = new WeakMap();

function setElementData(element, data) {
  elementData.set(element, data);
}

function getElementData(element) {
  return elementData.get(element);
}

// When element is removed from DOM and no references exist,
// the WeakMap entry is automatically cleaned up

// WeakSet - Similar but for sets
const visitedNodes = new WeakSet();

function traverse(node) {
  if (visitedNodes.has(node)) {
    return; // Already visited, prevent infinite loop
  }

  visitedNodes.add(node);
  // Process node...
  node.children.forEach(traverse);
}

// Limitations of Weak collections:
// - Not iterable (no forEach, no size)
// - Only objects as keys/values
// - Cannot clear()
```

---

## Q11.8: Generators và Iterators

### Câu hỏi
Giải thích Generators. Implement một custom iterator.

### Trả lời

```javascript
// Iterator Protocol
// An object is iterable if it has [Symbol.iterator] method
// that returns an iterator (object with next() method)

// Custom Iterator
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

for (const num of range) {
  console.log(num);  // 1, 2, 3, 4, 5
}

// Generator Function - Easier way to create iterators
function* rangeGenerator(from, to) {
  for (let i = from; i <= to; i++) {
    yield i;
  }
}

for (const num of rangeGenerator(1, 5)) {
  console.log(num);  // 1, 2, 3, 4, 5
}

// Generator Features
function* myGenerator() {
  console.log('Start');
  yield 1;
  console.log('After first yield');
  yield 2;
  console.log('After second yield');
  return 'Done';
}

const gen = myGenerator();
console.log(gen.next());  // Start, { value: 1, done: false }
console.log(gen.next());  // After first yield, { value: 2, done: false }
console.log(gen.next());  // After second yield, { value: 'Done', done: true }

// Passing values to generators
function* accumulator() {
  let total = 0;
  while (true) {
    const value = yield total;
    total += value;
  }
}

const acc = accumulator();
console.log(acc.next());      // { value: 0, done: false }
console.log(acc.next(5));     // { value: 5, done: false }
console.log(acc.next(10));    // { value: 15, done: false }

// Delegating Generators (yield*)
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield 'a';
  yield* gen1();  // Delegate to gen1
  yield 'b';
}

[...gen2()];  // ['a', 1, 2, 'b']

// Practical Examples

// 1. Infinite sequence
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const fib = fibonacci();
fib.next().value;  // 1
fib.next().value;  // 1
fib.next().value;  // 2
fib.next().value;  // 3
fib.next().value;  // 5

// 2. Paginated data fetching
async function* fetchPages(url) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();

    yield data.items;

    hasMore = data.hasMore;
    page++;
  }
}

// Usage
for await (const items of fetchPages('/api/products')) {
  console.log(items);
}

// 3. Tree traversal
function* traverseTree(node) {
  yield node.value;

  for (const child of node.children || []) {
    yield* traverseTree(child);
  }
}

const tree = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4 }, { value: 5 }] },
    { value: 3, children: [{ value: 6 }] }
  ]
};

[...traverseTree(tree)];  // [1, 2, 4, 5, 3, 6]

// 4. State machine
function* trafficLight() {
  while (true) {
    yield 'green';
    yield 'yellow';
    yield 'red';
  }
}

const light = trafficLight();
light.next().value;  // 'green'
light.next().value;  // 'yellow'
light.next().value;  // 'red'
light.next().value;  // 'green' (loops)
```

---

## Q11.9: Proxy và Reflect

### Câu hỏi
Giải thích Proxy và các use cases thực tế.

### Trả lời

```javascript
// Proxy - Intercept and customize operations on objects

// Basic syntax
const target = { name: 'John', age: 30 };

const handler = {
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    return target[property];
  },

  set(target, property, value, receiver) {
    console.log(`Setting ${property} to ${value}`);
    target[property] = value;
    return true;  // Must return true for success
  }
};

const proxy = new Proxy(target, handler);

proxy.name;       // Getting name, returns 'John'
proxy.age = 31;   // Setting age to 31

// Practical Use Cases

// 1. Validation
function createValidatedObject(validations) {
  return new Proxy({}, {
    set(target, property, value) {
      const validator = validations[property];

      if (validator && !validator(value)) {
        throw new Error(`Invalid value for ${property}`);
      }

      target[property] = value;
      return true;
    }
  });
}

const user = createValidatedObject({
  age: (v) => typeof v === 'number' && v >= 0 && v <= 150,
  email: (v) => typeof v === 'string' && v.includes('@')
});

user.age = 25;           // OK
user.email = 'test@example.com';  // OK
user.age = -5;           // Error!
user.email = 'invalid';  // Error!

// 2. Observable / Reactive (Vue 3 style)
function reactive(target, onChange) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;

      if (oldValue !== value) {
        onChange(prop, value, oldValue);
      }

      return true;
    }
  });
}

const state = reactive({ count: 0 }, (prop, newVal, oldVal) => {
  console.log(`${prop} changed from ${oldVal} to ${newVal}`);
});

state.count++;  // count changed from 0 to 1

// 3. Auto-vivification (auto-create nested objects)
function createNestedProxy() {
  const handler = {
    get(target, property) {
      if (!(property in target)) {
        target[property] = new Proxy({}, handler);
      }
      return target[property];
    }
  };

  return new Proxy({}, handler);
}

const obj = createNestedProxy();
obj.a.b.c.d = 'deep value';  // Auto-creates all intermediate objects
console.log(obj.a.b.c.d);    // 'deep value'

// 4. Private properties
function createPrivate(target, privateKeys) {
  return new Proxy(target, {
    get(obj, prop) {
      if (privateKeys.includes(prop)) {
        throw new Error(`Cannot access private property: ${prop}`);
      }
      return obj[prop];
    },

    set(obj, prop, value) {
      if (privateKeys.includes(prop)) {
        throw new Error(`Cannot modify private property: ${prop}`);
      }
      obj[prop] = value;
      return true;
    },

    ownKeys(obj) {
      return Object.keys(obj).filter(key => !privateKeys.includes(key));
    }
  });
}

const user = createPrivate(
  { name: 'John', _password: 'secret' },
  ['_password']
);

user.name;       // 'John'
user._password;  // Error!

// 5. Default values
function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(obj, prop) {
      return prop in obj ? obj[prop] : defaults[prop];
    }
  });
}

const config = withDefaults({}, {
  theme: 'light',
  language: 'en',
  fontSize: 14
});

config.theme;    // 'light' (default)
config.custom;   // undefined (no default)

// 6. Logging/Debugging
function createLoggingProxy(target, name = 'Object') {
  return new Proxy(target, {
    get(obj, prop) {
      console.log(`[${name}] GET ${String(prop)}`);
      return obj[prop];
    },

    set(obj, prop, value) {
      console.log(`[${name}] SET ${String(prop)} = ${value}`);
      obj[prop] = value;
      return true;
    },

    apply(target, thisArg, args) {
      console.log(`[${name}] CALL with args:`, args);
      return target.apply(thisArg, args);
    }
  });
}

// Reflect - Companion to Proxy
// Provides default behavior for proxy traps

const target = { name: 'John' };

const proxy = new Proxy(target, {
  get(target, property, receiver) {
    console.log('Intercepted!');
    return Reflect.get(target, property, receiver);  // Default behavior
  }
});
```

---

## Q11.10: Module Systems (ESM vs CommonJS)

### Câu hỏi
So sánh ES Modules và CommonJS. Tree-shaking hoạt động như thế nào?

### Trả lời

```
┌─────────────────────────────────────────────────────────────┐
│               ESM vs CommonJS                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ES MODULES (ESM)              COMMONJS (CJS)               │
│   ────────────────              ────────────────             │
│   import/export syntax          require/module.exports       │
│   Static analysis possible      Dynamic, runtime resolution  │
│   Async loading                 Synchronous loading          │
│   Browser native support        Node.js original format      │
│   Tree-shakeable                No tree-shaking              │
│   Top-level await               No top-level await           │
│   Strict mode by default        Need 'use strict'            │
│                                                              │
│   import x from 'mod'           const x = require('mod')     │
│   export default x              module.exports = x           │
│   export { x, y }               module.exports = { x, y }    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// ===== ES MODULES =====

// Named exports
export const PI = 3.14159;
export function sum(a, b) { return a + b; }
export class Calculator { }

// Default export
export default class MyClass { }

// Importing
import MyClass from './module.js';                  // Default
import { PI, sum } from './module.js';              // Named
import * as utils from './module.js';               // Namespace
import MyClass, { PI } from './module.js';          // Mixed
import { sum as add } from './module.js';           // Rename

// Dynamic import (code splitting)
const module = await import('./module.js');

// Re-exporting
export { sum } from './math.js';
export { default as Calculator } from './calc.js';
export * from './utils.js';

// ===== COMMONJS =====

// Exporting
module.exports = {
  PI: 3.14159,
  sum(a, b) { return a + b; }
};

// Or individual exports
exports.PI = 3.14159;
exports.sum = function(a, b) { return a + b; };

// Importing
const utils = require('./module');
const { PI, sum } = require('./module');

// Conditional require (dynamic)
if (condition) {
  const extra = require('./extra');
}
```

#### Tree-Shaking

```javascript
// Tree-shaking removes unused exports from bundle

// utils.js
export function used() {
  console.log('This is used');
}

export function unused() {
  console.log('This is never imported');
}

// main.js
import { used } from './utils.js';

used();

// After tree-shaking, unused() is removed from bundle

// Tree-shaking requirements:
// 1. ES Modules syntax (static analysis)
// 2. Pure functions (no side effects)
// 3. Proper bundler configuration

// ❌ Not tree-shakeable
import * as utils from './utils.js';  // Imports everything
utils.used();

// ✅ Tree-shakeable
import { used } from './utils.js';  // Only imports what's needed

// Side effects prevent tree-shaking
// package.json
{
  "sideEffects": false,  // Mark entire package as side-effect free
  // or
  "sideEffects": [
    "*.css",
    "./src/polyfills.js"
  ]
}

// ❌ Side effect - can't be removed
export const config = {
  init() {
    window.myGlobal = true;  // Side effect!
  }
};

// ✅ Pure - can be tree-shaken
export function createConfig() {
  return {
    theme: 'light'
  };
}
```

#### Module Best Practices

```javascript
// 1. Prefer named exports for tree-shaking
// ❌
export default {
  method1() {},
  method2() {}
};

// ✅
export function method1() {}
export function method2() {}

// 2. Barrel files (index.js) - be careful
// components/index.js
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';

// ❌ Imports all components
import { Button } from './components';

// ✅ Direct import for better tree-shaking
import { Button } from './components/Button';

// 3. Dynamic imports for code splitting
// ❌ Static import of large library
import { Chart } from 'chart.js';

// ✅ Dynamic import when needed
const loadChart = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};

// 4. Circular dependencies
// a.js
import { b } from './b.js';
export const a = 'a' + b;

// b.js
import { a } from './a.js';  // ❌ Circular!
export const b = 'b' + a;

// Solution: Restructure or use lazy evaluation
```

---

## Tổng kết JavaScript Core

| Topic | Key Points |
|-------|------------|
| Event Loop | Microtasks > Macrotasks, async execution order |
| Closures | Lexical scope, data privacy, function factories |
| Prototypes | Prototype chain, inheritance, `__proto__` vs `prototype` |
| this Binding | new > explicit > implicit > default, arrow functions |
| Promises | Promise.all, race, allSettled, error handling |
| Destructuring | Object/Array patterns, defaults, rest |
| Collections | Map vs Object, Set vs Array, Weak versions |
| Generators | yield, iterators, async generators |
| Proxy | Intercept operations, validation, reactivity |
| Modules | ESM vs CJS, tree-shaking, dynamic imports |

**Key Takeaways:**
1. Understand the execution model (event loop, call stack)
2. Master closures - foundation for many patterns
3. Know when to use different data structures
4. Prefer ES Modules for modern code
5. Use Proxy for meta-programming needs
