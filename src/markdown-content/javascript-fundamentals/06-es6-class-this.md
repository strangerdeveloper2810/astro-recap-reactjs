# ES6 Class và `this` Keyword

## Level 1: Basic - Class Fundamentals

### 1.1. Class Syntax

```javascript
// Class declaration
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hello, I'm ${this.name}`;
  }

  getAge() {
    return this.age;
  }
}

const person = new Person("John", 30);
person.greet(); // "Hello, I'm John"

// Class expression
const Animal = class {
  constructor(name) {
    this.name = name;
  }
};

// Classes are NOT hoisted (unlike function declarations)
// const p = new Car(); // ReferenceError
// class Car {}
```

### 1.2. `this` Basic Binding

```
┌─────────────────────────────────────────────────────────────┐
│                    `this` Binding Rules                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Global:     this = window (browser) / global (Node)     │
│                                                              │
│  2. Object method: this = object calling the method         │
│                                                              │
│  3. Regular function:                                        │
│     - Strict mode: this = undefined                         │
│     - Non-strict: this = window/global                      │
│                                                              │
│  4. Arrow function: this = lexical (from enclosing scope)   │
│                                                              │
│  5. new keyword: this = new object being created            │
│                                                              │
│  6. call/apply/bind: this = explicitly specified object     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 1. Global context
console.log(this); // window (browser) or global (Node.js)

// 2. Object method
const obj = {
  name: "John",
  greet: function () {
    return `Hello, ${this.name}`;
  }
};
obj.greet(); // "Hello, John" - this = obj

// 3. Regular function
function regularFn() {
  console.log(this);
}
regularFn(); // undefined (strict) or window (non-strict)

// 4. Arrow function - inherits this from where it's DEFINED
const obj2 = {
  name: "Jane",
  greet: () => {
    return `Hello, ${this.name}`; // this = global (not obj2!)
  }
};
obj2.greet(); // "Hello, undefined"

// 5. new keyword
function Person(name) {
  this.name = name; // this = new object
}
const p = new Person("John"); // this = p
```

### 1.3. `this` in Class Methods

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;
    return this.count;
  }
}

const counter = new Counter();
counter.increment(); // 1 - this = counter

// ❌ PROBLEM: Losing context when extracting method
const increment = counter.increment;
increment(); // TypeError: Cannot read property 'count' of undefined

// Why? When calling increment(), there's no object before the dot
// So `this` becomes undefined (strict mode)
```

### 1.4. Instance vs Static Methods

```javascript
class MathUtils {
  // Instance method - called on instance
  square(n) {
    return n * n;
  }

  // Static method - called on class itself
  static add(a, b) {
    return a + b;
  }

  static PI = 3.14159;
}

// Instance method
const math = new MathUtils();
math.square(4); // 16

// Static method
MathUtils.add(2, 3); // 5
MathUtils.PI; // 3.14159

// Static cannot access instance
// math.add(2, 3); // TypeError
// MathUtils.square(4); // TypeError
```

---

## Level 2: Intermediate - Inheritance & Context Control

### 2.1. Class Inheritance

```javascript
// Base class
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }

  move() {
    return `${this.name} moves`;
  }
}

// Derived class
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // MUST call super() before using this
    this.breed = breed;
  }

  // Override method
  speak() {
    return `${this.name} barks`;
  }

  // Call parent method with super
  introduce() {
    return `${super.speak()} - I'm a ${this.breed}`;
  }

  // New method
  fetch() {
    return `${this.name} fetches the ball`;
  }
}

const dog = new Dog("Rex", "Golden Retriever");
dog.speak(); // "Rex barks"
dog.move(); // "Rex moves" (inherited)
dog.introduce(); // "Rex makes a sound - I'm a Golden Retriever"
```

### 2.2. call(), apply(), bind()

```javascript
const person = {
  name: "John",
  greet: function (greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
  }
};

const anotherPerson = { name: "Jane" };

// call() - pass arguments individually
person.greet.call(anotherPerson, "Hello", "!");
// "Hello, Jane!"

// apply() - pass arguments as array
person.greet.apply(anotherPerson, ["Hi", "?"]);
// "Hi, Jane?"

// bind() - returns NEW function with bound context
const boundGreet = person.greet.bind(anotherPerson);
boundGreet("Hey", "..."); // "Hey, Jane..."

// bind() with partial application
const greetHello = person.greet.bind(anotherPerson, "Hello");
greetHello("!"); // "Hello, Jane!"
greetHello("?"); // "Hello, Jane?"
```

```
┌─────────────────────────────────────────────────────────────┐
│           call() vs apply() vs bind()                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  call(context, arg1, arg2)    → Executes IMMEDIATELY        │
│  apply(context, [arg1, arg2]) → Executes IMMEDIATELY        │
│  bind(context, arg1, arg2)    → Returns NEW function        │
│                                                              │
│  Mnemonic:                                                   │
│  - call = Comma separated args                              │
│  - apply = Array of args                                    │
│  - bind = Bound function returned                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3. Solving `this` Loss with bind()

```javascript
class Button {
  constructor(text) {
    this.text = text;
    this.clickCount = 0;

    // Option 1: Bind in constructor
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.clickCount++;
    console.log(`${this.text} clicked ${this.clickCount} times`);
  }

  render() {
    const button = document.createElement("button");
    button.textContent = this.text;
    button.addEventListener("click", this.handleClick); // Now works!
    return button;
  }
}
```

### 2.4. Arrow Functions Auto-bind

```javascript
class Button {
  constructor(text) {
    this.text = text;
    this.clickCount = 0;
  }

  // Arrow function = auto-bound to instance
  handleClick = () => {
    this.clickCount++;
    console.log(`${this.text} clicked ${this.clickCount} times`);
  };

  render() {
    const button = document.createElement("button");
    button.textContent = this.text;
    button.addEventListener("click", this.handleClick); // Works!
    return button;
  }
}

// Arrow function vs Regular method
class Example {
  value = 10;

  regularMethod() {
    console.log(this.value); // depends on HOW it's called
  }

  arrowMethod = () => {
    console.log(this.value); // ALWAYS 10 (lexically bound)
  };
}

const ex = new Example();
const regular = ex.regularMethod;
const arrow = ex.arrowMethod;

regular(); // undefined - lost context
arrow(); // 10 - arrow keeps context
```

### 2.5. Getters and Setters

```javascript
class User {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  // Getter - access like property
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Setter - set like property
  set fullName(value) {
    const parts = value.split(" ");
    this.firstName = parts[0];
    this.lastName = parts[1] || "";
  }

  // Validation in setter
  set age(value) {
    if (value < 0 || value > 150) {
      throw new Error("Invalid age");
    }
    this._age = value;
  }

  get age() {
    return this._age;
  }
}

const user = new User("John", "Doe");
console.log(user.fullName); // "John Doe" (getter)
user.fullName = "Jane Smith"; // setter
console.log(user.firstName); // "Jane"
```

---

## Level 3: Advanced - Patterns & Private Fields

### 3.1. Private Fields (ES2022)

```javascript
class BankAccount {
  #balance = 0; // Private field
  #transactions = []; // Private field
  static #bankName = "MyBank"; // Private static

  constructor(initialBalance = 0) {
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Invalid amount");
    this.#balance += amount;
    this.#addTransaction("deposit", amount);
    return this.#balance;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
    this.#addTransaction("withdraw", amount);
    return this.#balance;
  }

  // Private method
  #addTransaction(type, amount) {
    this.#transactions.push({
      type,
      amount,
      date: new Date()
    });
  }

  getBalance() {
    return this.#balance;
  }

  getTransactions() {
    return [...this.#transactions]; // Return copy
  }

  static getBankName() {
    return BankAccount.#bankName;
  }
}

const account = new BankAccount(100);
account.deposit(50); // 150
// account.#balance; // SyntaxError: Private field
// account.#addTransaction(); // SyntaxError: Private method
```

### 3.2. Abstract Class Pattern

```javascript
// JavaScript không có abstract classes, nhưng có thể simulate
class AbstractShape {
  constructor() {
    if (new.target === AbstractShape) {
      throw new Error("Cannot instantiate abstract class");
    }
  }

  // Abstract methods
  area() {
    throw new Error("Method area() must be implemented");
  }

  perimeter() {
    throw new Error("Method perimeter() must be implemented");
  }

  // Concrete method
  describe() {
    return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`;
  }
}

class Circle extends AbstractShape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }

  perimeter() {
    return 2 * Math.PI * this.radius;
  }
}

// new AbstractShape(); // Error: Cannot instantiate abstract class
const circle = new Circle(5);
circle.area(); // 78.54...
circle.describe(); // "Area: 78.54..., Perimeter: 31.42..."
```

### 3.3. Mixins Pattern

```javascript
// Mixins: add behavior without inheritance
const CanFly = {
  fly() {
    return `${this.name} is flying at ${this.altitude}m`;
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
    return `${this.name} dives to ${depth}m`;
  }
};

// Mixin factory function
function mixin(target, ...sources) {
  Object.assign(target.prototype, ...sources);
  return target;
}

class Duck {
  constructor(name) {
    this.name = name;
    this.altitude = 0;
  }
}

// Apply mixins
mixin(Duck, CanFly, CanSwim);

const duck = new Duck("Donald");
duck.takeOff(); // "Donald takes off"
duck.fly(); // "Donald is flying at 100m"
duck.swim(); // "Donald is swimming"
```

### 3.4. Arrow Functions Cannot Override

```javascript
// ❌ PROBLEM: Arrow functions are instance properties, not prototype methods
class Parent {
  // This creates property on EACH instance
  method = () => {
    return "parent";
  };
}

class Child extends Parent {
  // This creates NEW property, doesn't override
  method = () => {
    return "child";
  };
}

const child = new Child();
child.method(); // "child" - but NOT true override

// super.method() won't work for arrow functions
class Child2 extends Parent {
  method = () => {
    // super.method(); // TypeError: super.method is not a function
    return "child2";
  };
}

// ✅ SOLUTION: Use regular methods for inheritance
class Parent2 {
  method() {
    return "parent";
  }
}

class Child3 extends Parent2 {
  method() {
    return super.method() + " + child";
  }
}

new Child3().method(); // "parent + child"
```

### 3.5. `this` in Nested Functions

```javascript
class DataFetcher {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cache = {};
  }

  // ❌ Problem: nested function loses this
  fetchBad(endpoint) {
    return fetch(this.baseUrl + endpoint).then(function (response) {
      // this is undefined here!
      this.cache[endpoint] = response; // TypeError
    });
  }

  // ✅ Solution 1: Arrow function
  fetchGood1(endpoint) {
    return fetch(this.baseUrl + endpoint).then((response) => {
      this.cache[endpoint] = response; // Works!
    });
  }

  // ✅ Solution 2: Save this reference
  fetchGood2(endpoint) {
    const self = this;
    return fetch(this.baseUrl + endpoint).then(function (response) {
      self.cache[endpoint] = response; // Works!
    });
  }

  // ✅ Solution 3: bind()
  fetchGood3(endpoint) {
    return fetch(this.baseUrl + endpoint).then(
      function (response) {
        this.cache[endpoint] = response; // Works!
      }.bind(this)
    );
  }
}
```

---

## Real-world Applications

### React Class Component (Legacy but Interview-relevant)

```javascript
class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      input: ""
    };
    // Must bind if using regular methods
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Regular method - needs binding
  handleSubmit(e) {
    e.preventDefault();
    this.setState((prev) => ({
      todos: [...prev.todos, { id: Date.now(), text: prev.input }],
      input: ""
    }));
  }

  // Arrow function - auto-bound
  handleChange = (e) => {
    this.setState({ input: e.target.value });
  };

  // Arrow function - auto-bound
  handleDelete = (id) => {
    this.setState((prev) => ({
      todos: prev.todos.filter((t) => t.id !== id)
    }));
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input value={this.state.input} onChange={this.handleChange} />
          <button type="submit">Add</button>
        </form>
        <ul>
          {this.state.todos.map((todo) => (
            <li key={todo.id}>
              {todo.text}
              <button onClick={() => this.handleDelete(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
```

### Service Class Pattern

```javascript
class ApiService {
  #baseUrl;
  #token;
  #cache = new Map();

  constructor(baseUrl) {
    this.#baseUrl = baseUrl;
  }

  setToken(token) {
    this.#token = token;
  }

  // Private method
  #getHeaders() {
    return {
      "Content-Type": "application/json",
      ...(this.#token && { Authorization: `Bearer ${this.#token}` })
    };
  }

  async get(endpoint, { cache = false } = {}) {
    const url = this.#baseUrl + endpoint;

    if (cache && this.#cache.has(url)) {
      return this.#cache.get(url);
    }

    const response = await fetch(url, {
      headers: this.#getHeaders()
    });

    const data = await response.json();

    if (cache) {
      this.#cache.set(url, data);
    }

    return data;
  }

  async post(endpoint, body) {
    const response = await fetch(this.#baseUrl + endpoint, {
      method: "POST",
      headers: this.#getHeaders(),
      body: JSON.stringify(body)
    });

    return response.json();
  }

  clearCache() {
    this.#cache.clear();
  }
}

// Usage
const api = new ApiService("https://api.example.com");
api.setToken("secret-token");
const users = await api.get("/users", { cache: true });
```

### Event Emitter Pattern

```javascript
class EventEmitter {
  #events = new Map();

  on(event, callback) {
    if (!this.#events.has(event)) {
      this.#events.set(event, []);
    }
    this.#events.get(event).push(callback);
    return this; // Chainable
  }

  off(event, callback) {
    if (!this.#events.has(event)) return this;

    const callbacks = this.#events.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
    return this;
  }

  emit(event, ...args) {
    if (!this.#events.has(event)) return false;

    this.#events.get(event).forEach((callback) => {
      callback.apply(this, args);
    });
    return true;
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}

// Usage
const emitter = new EventEmitter();

emitter
  .on("data", (data) => console.log("Received:", data))
  .on("error", (err) => console.error("Error:", err));

emitter.emit("data", { message: "Hello" });
```

---

## Interview Questions

### Level 1: Basic

**1. `this` trong global context là gì?**

```
Browser: this = window object
Node.js: this = global object (hoặc module.exports trong modules)

function example() {
  console.log(this);
}

// Strict mode: undefined
// Non-strict mode: window/global
```

**2. Sự khác biệt giữa class và function constructor?**

```javascript
// Function constructor
function PersonFn(name) {
  this.name = name;
}
PersonFn.prototype.greet = function () {
  return `Hello, ${this.name}`;
};

// Class
class PersonClass {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hello, ${this.name}`;
  }
}

// Differences:
// 1. Class: strict mode by default
// 2. Class: không hoisted
// 3. Class: phải dùng 'new'
// 4. Class: methods không enumerable
// 5. Class: syntax rõ ràng hơn
```

**3. Tại sao method bị mất context khi assign cho variable?**

```javascript
const obj = {
  name: "John",
  greet() {
    return this.name;
  }
};

obj.greet(); // "John" - called on obj

const fn = obj.greet;
fn(); // undefined - no object before dot!

// `this` determined by HOW function is called, not WHERE it's defined
```

### Level 2: Intermediate

**4. Arrow function vs regular function về `this`?**

```javascript
// Regular function: dynamic this (from call site)
const obj = {
  name: "John",
  greet: function () {
    console.log(this.name); // depends on caller
  }
};

// Arrow function: lexical this (from where defined)
const obj2 = {
  name: "John",
  greet: () => {
    console.log(this.name); // always from enclosing scope
  }
};

obj.greet(); // "John"
obj2.greet(); // undefined (this = global)

// In class methods:
class Example {
  name = "John";

  regular() {
    return this.name;
  } // can lose context

  arrow = () => this.name; // always bound to instance
}
```

**5. Khi nào dùng call/apply/bind?**

```
call(context, arg1, arg2):
- Gọi function ngay với context và args riêng lẻ
- Use case: borrowing methods

apply(context, [args]):
- Như call nhưng args là array
- Use case: spread args to function

bind(context, arg1):
- Trả về NEW function với context đã bind
- Use case: event handlers, partial application

// Example: method borrowing
const max = Math.max.apply(null, [1, 2, 3]); // 3

// Example: event handler
button.addEventListener('click', this.handleClick.bind(this));
```

**6. static method vs instance method?**

```javascript
class Example {
  instanceProp = "instance";
  static staticProp = "static";

  instanceMethod() {
    return this.instanceProp; // can access instance
  }

  static staticMethod() {
    // return this.instanceProp; // ERROR - can't access instance
    return this.staticProp; // OK - this = class itself
  }
}

// Usage:
const ex = new Example();
ex.instanceMethod(); // "instance"
Example.staticMethod(); // "static"

// Use cases for static:
// - Factory methods: User.create()
// - Utility functions: Math.max()
// - Constants: Config.API_URL
```

### Level 3: Advanced

**7. Private fields vs closure pattern?**

```javascript
// Closure pattern (trước ES2022)
function createCounter() {
  let count = 0; // "private" via closure

  return {
    increment() {
      return ++count;
    },
    getCount() {
      return count;
    }
  };
}

// Private fields (ES2022)
class Counter {
  #count = 0; // truly private

  increment() {
    return ++this.#count;
  }

  getCount() {
    return this.#count;
  }
}

// Differences:
// - Private fields: true encapsulation, SyntaxError if accessed
// - Closure: can't add methods later, each instance has own methods
// - Private fields: methods on prototype (memory efficient)
// - Private fields: instanceof và inheritance work properly
```

**8. Tại sao arrow function methods không nên dùng cho inheritance?**

```javascript
class Parent {
  method = () => "parent";
}

class Child extends Parent {
  method = () => super.method() + " + child"; // ERROR!
}

// Lý do:
// 1. Arrow function là instance property, không phải prototype method
// 2. Mỗi instance có riêng function (memory inefficient)
// 3. super.method() không hoạt động vì method ở instance, không prototype
// 4. Không thể override properly

// Solution: dùng regular methods
class Parent2 {
  method() {
    return "parent";
  }
}

class Child2 extends Parent2 {
  method() {
    return super.method() + " + child"; // OK!
  }
}
```

**9. Giải thích output của code này:**

```javascript
const obj = {
  name: "John",
  greet: function () {
    console.log("1:", this.name);

    const inner = function () {
      console.log("2:", this.name);
    };

    const arrowInner = () => {
      console.log("3:", this.name);
    };

    inner();
    arrowInner();
  }
};

obj.greet();

// Output:
// 1: John        - greet called on obj
// 2: undefined   - inner() called without context
// 3: John        - arrow inherits this from greet
```

**10. Implement class với singleton pattern:**

```javascript
class Database {
  static #instance = null;
  #connection = null;

  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    Database.#instance = this;
  }

  connect(url) {
    if (!this.#connection) {
      this.#connection = { url, connected: true };
      console.log(`Connected to ${url}`);
    }
    return this.#connection;
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }
}

const db1 = new Database();
const db2 = new Database();
const db3 = Database.getInstance();

console.log(db1 === db2); // true
console.log(db2 === db3); // true
```
