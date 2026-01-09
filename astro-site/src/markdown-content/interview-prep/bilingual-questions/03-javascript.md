# JavaScript Interview Questions / Cau Hoi Phong Van JavaScript

---

## 1. What is the difference between var, let, and const? / Var, let va const khac nhau nhu the nao?

**EN:** `var` is function-scoped and hoisted. `let` and `const` are block-scoped and subject to TDZ (Temporal Dead Zone). `const` cannot be reassigned after declaration.

```javascript
var x = 1;    // function-scoped, hoisted
let y = 2;    // block-scoped, TDZ
const z = 3;  // block-scoped, TDZ, cannot reassign

if (true) {
  var a = 1;  // accessible outside block
  let b = 2;  // only inside block
}
console.log(a); // 1
console.log(b); // ReferenceError
```

**VI:** `var` co pham vi ham va duoc hoisting. `let` va `const` co pham vi block va chiu anh huong TDZ. `const` khong the gan lai sau khi khai bao.

---

## 2. What is hoisting in JavaScript? / Hoisting trong JavaScript la gi?

**EN:** Hoisting is JavaScript's behavior of moving declarations to the top of their scope during compilation. Variables declared with `var` are hoisted and initialized with `undefined`. `let` and `const` are hoisted but not initialized (TDZ).

```javascript
console.log(a); // undefined (hoisted)
console.log(b); // ReferenceError (TDZ)
var a = 1;
let b = 2;

// Functions are fully hoisted
sayHello(); // "Hello"
function sayHello() { console.log("Hello"); }
```

**VI:** Hoisting la hanh vi cua JavaScript di chuyen cac khai bao len dau pham vi trong qua trinh bien dich. `var` duoc hoisting va khoi tao voi `undefined`. `let` va `const` duoc hoisting nhung khong duoc khoi tao (TDZ).

---

## 3. What is the Temporal Dead Zone (TDZ)? / Temporal Dead Zone (TDZ) la gi?

**EN:** TDZ is the period between entering a scope and the variable declaration being processed. Accessing `let` or `const` variables in TDZ throws a ReferenceError.

```javascript
{
  // TDZ starts
  console.log(x); // ReferenceError
  let x = 10;     // TDZ ends
}
```

**VI:** TDZ la khoang thoi gian tu khi vao pham vi den khi bien duoc khai bao. Truy cap bien `let` hoac `const` trong TDZ se gay ra ReferenceError.

---

## 4. What are the different types of scope in JavaScript? / Cac loai pham vi trong JavaScript la gi?

**EN:** JavaScript has 3 types of scope:
- **Global scope**: Variables declared outside any function/block
- **Function scope**: Variables declared inside a function (var)
- **Block scope**: Variables declared inside {} with let/const

```javascript
var global = "I'm global";

function example() {
  var funcScoped = "function scope";
  if (true) {
    let blockScoped = "block scope";
    const alsoBlock = "also block";
  }
  // blockScoped not accessible here
}
```

**VI:** JavaScript co 3 loai pham vi: Global scope (bien toan cuc), Function scope (bien trong ham voi var), Block scope (bien trong {} voi let/const).

---

## 5. What is a closure? / Closure la gi?

**EN:** A closure is a function that has access to variables from its outer (enclosing) scope, even after the outer function has returned.

```javascript
function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
```

**VI:** Closure la mot ham co the truy cap cac bien tu pham vi ben ngoai (bao quanh), ngay ca khi ham ben ngoai da tra ve.

---

## 6. What are practical uses of closures? / Cac ung dung thuc te cua closure la gi?

**EN:** Closures are used for:
- Data privacy/encapsulation
- Function factories
- Maintaining state
- Module pattern

```javascript
// Data privacy
function createCounter() {
  let count = 0; // private variable
  return {
    increment: () => ++count,
    getCount: () => count
  };
}

// Function factory
function multiply(x) {
  return (y) => x * y;
}
const double = multiply(2);
console.log(double(5)); // 10
```

**VI:** Closure duoc su dung cho: bao mat du lieu, tao ham dong (factory), duy tri trang thai, va module pattern.

---

## 7. How does the 'this' keyword work in JavaScript? / Tu khoa 'this' hoat dong nhu the nao trong JavaScript?

**EN:** `this` refers to the object that is executing the current function. Its value depends on how the function is called:
- Global: `window` (browser) or `global` (Node)
- Object method: the object
- Constructor: the new instance
- Arrow function: inherits from enclosing scope

```javascript
const obj = {
  name: "John",
  greet() { console.log(this.name); },      // "John"
  arrow: () => console.log(this.name)       // undefined (window)
};

obj.greet();  // "John"
obj.arrow();  // undefined
```

**VI:** `this` tham chieu den doi tuong dang thuc thi ham hien tai. Gia tri cua no phu thuoc vao cach ham duoc goi.

---

## 8. What is the difference between call(), apply(), and bind()? / Su khac nhau giua call(), apply() va bind() la gi?

**EN:** All three methods set the `this` context:
- `call()`: invokes immediately with arguments passed individually
- `apply()`: invokes immediately with arguments as an array
- `bind()`: returns a new function with bound `this`

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: "Alice" };

greet.call(person, "Hello", "!");   // "Hello, Alice!"
greet.apply(person, ["Hi", "?"]); // "Hi, Alice?"

const boundGreet = greet.bind(person, "Hey");
boundGreet("...");                  // "Hey, Alice..."
```

**VI:** Ca ba phuong thuc deu thiet lap ngur canh `this`: `call()` goi ngay voi tham so rieng le, `apply()` goi ngay voi tham so la mang, `bind()` tra ve ham moi voi `this` da gan.

---

## 9. How do arrow functions handle 'this'? / Arrow functions xu ly 'this' nhu the nao?

**EN:** Arrow functions don't have their own `this`. They inherit `this` from the enclosing lexical scope (where they are defined).

```javascript
const obj = {
  name: "Bob",
  regular() {
    setTimeout(function() {
      console.log(this.name); // undefined (this = window)
    }, 100);
  },
  arrow() {
    setTimeout(() => {
      console.log(this.name); // "Bob" (inherits from arrow())
    }, 100);
  }
};
```

**VI:** Arrow functions khong co `this` rieng. Chung ke thua `this` tu pham vi ben ngoai (noi chung duoc dinh nghia).

---

## 10. What is the prototype in JavaScript? / Prototype trong JavaScript la gi?

**EN:** Every JavaScript object has a prototype - an object from which it inherits properties and methods. Prototypes enable inheritance in JavaScript.

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

const john = new Person("John");
console.log(john.greet()); // "Hello, I'm John"
console.log(john.__proto__ === Person.prototype); // true
```

**VI:** Moi doi tuong JavaScript deu co prototype - mot doi tuong ma no ke thua cac thuoc tinh va phuong thuc. Prototype cho phep ke thua trong JavaScript.

---

## 11. What is the prototype chain? / Prototype chain la gi?

**EN:** The prototype chain is a series of linked prototypes. When accessing a property, JavaScript looks up the chain until it finds the property or reaches `null`.

```javascript
const arr = [1, 2, 3];
// arr -> Array.prototype -> Object.prototype -> null

console.log(arr.hasOwnProperty("length")); // true
// hasOwnProperty is found on Object.prototype

arr.toString(); // Array.prototype
arr.valueOf();  // Object.prototype
```

**VI:** Prototype chain la chuoi cac prototype lien ket. Khi truy cap thuoc tinh, JavaScript tim kiem theo chuoi cho den khi tim thay hoac dat den `null`.

---

## 12. How does inheritance work in JavaScript? / Ke thua hoat dong nhu the nao trong JavaScript?

**EN:** JavaScript uses prototypal inheritance. Objects inherit directly from other objects. ES6 classes provide syntactic sugar for this.

```javascript
// ES6 Class syntax
class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log(`${this.name} makes a sound`); }
}

class Dog extends Animal {
  speak() { console.log(`${this.name} barks`); }
}

const dog = new Dog("Rex");
dog.speak(); // "Rex barks"

// Prototype-based
function Cat(name) { this.name = name; }
Cat.prototype = Object.create(Animal.prototype);
```

**VI:** JavaScript su dung ke thua nguyen mau (prototypal). Cac doi tuong ke thua truc tiep tu cac doi tuong khac. ES6 class cung cap cu phap de doc hon.

---

## 13. What is the event loop? / Event loop la gi?

**EN:** The event loop is a mechanism that allows JavaScript to perform non-blocking operations. It continuously checks if the call stack is empty, then moves callbacks from the task queue to the call stack.

```javascript
console.log("1");           // Call stack

setTimeout(() => {
  console.log("2");         // Macrotask queue
}, 0);

Promise.resolve().then(() => {
  console.log("3");         // Microtask queue
});

console.log("4");           // Call stack

// Output: 1, 4, 3, 2
```

**VI:** Event loop la co che cho phep JavaScript thuc hien cac thao tac khong dong bo. No lien tuc kiem tra call stack va di chuyen callback tu hang doi vao call stack.

---

## 14. What is the call stack? / Call stack la gi?

**EN:** The call stack is a data structure that tracks function execution. Functions are pushed when called and popped when returned. JavaScript is single-threaded with one call stack.

```javascript
function first() {
  second();
  console.log("first");
}

function second() {
  third();
  console.log("second");
}

function third() {
  console.log("third");
}

first();
// Stack: first -> second -> third
// Output: third, second, first
```

**VI:** Call stack la cau truc du lieu theo doi viec thuc thi ham. Ham duoc day vao khi goi va lay ra khi tra ve. JavaScript la don luong voi mot call stack.

---

## 15. What is the difference between microtasks and macrotasks? / Su khac nhau giua microtask va macrotask la gi?

**EN:**
- **Microtasks**: Promise callbacks, queueMicrotask, MutationObserver. Processed after current script, before rendering.
- **Macrotasks**: setTimeout, setInterval, setImmediate, I/O. Processed one per event loop iteration.

```javascript
console.log("script start");

setTimeout(() => console.log("setTimeout"), 0);  // macrotask

Promise.resolve()
  .then(() => console.log("promise1"))           // microtask
  .then(() => console.log("promise2"));          // microtask

console.log("script end");

// Output: script start, script end, promise1, promise2, setTimeout
```

**VI:** Microtask (Promise, queueMicrotask) xu ly sau script hien tai, truoc rendering. Macrotask (setTimeout, setInterval) xu ly mot task moi vong lap.

---

## 16. How do Promises work? / Promises hoat dong nhu the nao?

**EN:** A Promise represents a future value. It has 3 states: pending, fulfilled, or rejected. Use `.then()` for success, `.catch()` for errors, `.finally()` for cleanup.

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) resolve("Data loaded");
    else reject(new Error("Failed"));
  }, 1000);
});

promise
  .then(data => console.log(data))
  .catch(err => console.error(err))
  .finally(() => console.log("Done"));
```

**VI:** Promise dai dien cho gia tri tuong lai. No co 3 trang thai: pending, fulfilled, rejected. Dung `.then()` cho thanh cong, `.catch()` cho loi, `.finally()` cho don dep.

---

## 17. What is async/await? / Async/await la gi?

**EN:** `async/await` is syntactic sugar for Promises. `async` functions always return a Promise. `await` pauses execution until the Promise resolves.

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Equivalent to:
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .catch(error => console.error("Error:", error));
}
```

**VI:** `async/await` la cu phap de lam viec voi Promise. Ham `async` luon tra ve Promise. `await` tam dung thuc thi cho den khi Promise hoan thanh.

---

## 18. How do you handle errors in async code? / Lam the nao de xu ly loi trong code bat dong bo?

**EN:** Use `try/catch` with async/await, or `.catch()` with Promises. Always handle rejections to avoid unhandled promise rejection warnings.

```javascript
// async/await
async function getData() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    console.error("Caught:", error.message);
    throw error; // re-throw if needed
  }
}

// Promise
fetchData()
  .then(data => process(data))
  .catch(err => handleError(err));

// Promise.all with error handling
Promise.all([p1, p2, p3])
  .then(results => console.log(results))
  .catch(err => console.log("One failed:", err));
```

**VI:** Dung `try/catch` voi async/await, hoac `.catch()` voi Promise. Luon xu ly rejection de tranh canh bao unhandled promise rejection.

---

## 19. What is the difference between map(), filter(), and reduce()? / Su khac nhau giua map(), filter() va reduce() la gi?

**EN:**
- `map()`: transforms each element, returns new array of same length
- `filter()`: returns new array with elements that pass the test
- `reduce()`: reduces array to single value

```javascript
const nums = [1, 2, 3, 4, 5];

// map - transform each element
const doubled = nums.map(n => n * 2);        // [2, 4, 6, 8, 10]

// filter - keep elements that pass test
const evens = nums.filter(n => n % 2 === 0); // [2, 4]

// reduce - accumulate to single value
const sum = nums.reduce((acc, n) => acc + n, 0); // 15
```

**VI:** `map()` bien doi tung phan tu, tra ve mang moi cung do dai. `filter()` tra ve mang moi voi cac phan tu thoa dieu kien. `reduce()` giam mang thanh mot gia tri.

---

## 20. What are find() and findIndex()? / find() va findIndex() la gi?

**EN:** `find()` returns the first element that satisfies the condition. `findIndex()` returns the index of that element. Both return `undefined`/`-1` if not found.

```javascript
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

const bob = users.find(u => u.name === "Bob");
console.log(bob); // { id: 2, name: "Bob" }

const bobIndex = users.findIndex(u => u.name === "Bob");
console.log(bobIndex); // 1

const notFound = users.find(u => u.name === "David");
console.log(notFound); // undefined
```

**VI:** `find()` tra ve phan tu dau tien thoa dieu kien. `findIndex()` tra ve chi so cua phan tu do. Ca hai tra ve `undefined`/`-1` neu khong tim thay.

---

## 21. What do some() and every() do? / some() va every() lam gi?

**EN:** `some()` returns `true` if at least one element passes the test. `every()` returns `true` only if all elements pass the test.

```javascript
const nums = [1, 2, 3, 4, 5];

// some - at least one matches
nums.some(n => n > 3);  // true (4 and 5 match)
nums.some(n => n > 10); // false

// every - all must match
nums.every(n => n > 0); // true (all positive)
nums.every(n => n > 3); // false (1, 2, 3 don't match)

// Practical use
const users = [{ active: true }, { active: false }];
const allActive = users.every(u => u.active);   // false
const someActive = users.some(u => u.active);   // true
```

**VI:** `some()` tra ve `true` neu it nhat mot phan tu thoa dieu kien. `every()` tra ve `true` chi khi tat ca phan tu thoa dieu kien.

---

## 22. What are Object.keys(), Object.values(), and Object.entries()? / Object.keys(), Object.values() va Object.entries() la gi?

**EN:** These methods return arrays from object properties:
- `Object.keys()`: array of property names
- `Object.values()`: array of property values
- `Object.entries()`: array of [key, value] pairs

```javascript
const person = { name: "Alice", age: 25, city: "NYC" };

Object.keys(person);    // ["name", "age", "city"]
Object.values(person);  // ["Alice", 25, "NYC"]
Object.entries(person); // [["name", "Alice"], ["age", 25], ["city", "NYC"]]

// Useful for iteration
Object.entries(person).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Convert back to object
const entries = [["a", 1], ["b", 2]];
Object.fromEntries(entries); // { a: 1, b: 2 }
```

**VI:** Cac phuong thuc nay tra ve mang tu thuoc tinh doi tuong: `keys()` tra ve ten, `values()` tra ve gia tri, `entries()` tra ve cap [key, value].

---

## 23. How does the spread operator work? / Toan tu spread hoat dong nhu the nao?

**EN:** The spread operator (`...`) expands iterables into individual elements. Used for copying, merging, and function arguments.

```javascript
// Arrays
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];     // [1, 2, 3, 4, 5]
const copy = [...arr1];           // shallow copy

// Objects
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };   // { a: 1, b: 2, c: 3 }
const merged = { ...obj1, ...{ b: 10 } }; // { a: 1, b: 10 }

// Function arguments
const nums = [1, 2, 3];
Math.max(...nums); // 3
```

**VI:** Toan tu spread (`...`) mo rong cac iterable thanh cac phan tu rieng le. Dung de sao chep, gop va truyen tham so ham.

---

## 24. What is destructuring? / Destructuring la gi?

**EN:** Destructuring extracts values from arrays or properties from objects into distinct variables.

```javascript
// Array destructuring
const [a, b, ...rest] = [1, 2, 3, 4, 5];
// a = 1, b = 2, rest = [3, 4, 5]

const [first, , third] = [1, 2, 3]; // skip elements
// first = 1, third = 3

// Object destructuring
const { name, age, city = "Unknown" } = { name: "Bob", age: 30 };
// name = "Bob", age = 30, city = "Unknown" (default)

// Renaming
const { name: userName } = { name: "Alice" };
// userName = "Alice"

// Nested
const { address: { street } } = { address: { street: "Main St" } };
```

**VI:** Destructuring trich xuat gia tri tu mang hoac thuoc tinh tu doi tuong thanh cac bien rieng biet.

---

## 25. What are arrow functions and how do they differ from regular functions? / Arrow functions la gi va khac voi ham thuong nhu the nao?

**EN:** Arrow functions are a concise syntax for functions. Key differences:
- Shorter syntax
- No own `this`, `arguments`, `super`
- Cannot be used as constructors
- No `prototype` property

```javascript
// Syntax
const add = (a, b) => a + b;
const square = x => x * x;
const greet = () => "Hello";

// No own 'this'
const obj = {
  items: [1, 2, 3],
  process() {
    this.items.forEach(item => {
      console.log(this); // obj (inherits from process)
    });
  }
};

// Cannot use as constructor
const Person = (name) => { this.name = name; };
new Person("John"); // TypeError
```

**VI:** Arrow functions la cu phap ngan gon cho ham. Khac biet: khong co `this`, `arguments` rieng, khong the dung lam constructor.

---

## 26. What are template literals? / Template literals la gi?

**EN:** Template literals use backticks (`) for string interpolation, multi-line strings, and tagged templates.

```javascript
const name = "Alice";
const age = 25;

// Interpolation
const greeting = `Hello, ${name}! You are ${age} years old.`;

// Multi-line
const html = `
  <div>
    <h1>${name}</h1>
    <p>Age: ${age}</p>
  </div>
`;

// Expressions
const result = `Sum: ${1 + 2}`;  // "Sum: 3"

// Tagged templates
function highlight(strings, ...values) {
  return strings.reduce((acc, str, i) =>
    `${acc}${str}<mark>${values[i] || ''}</mark>`, '');
}
const text = highlight`Hello ${name}, you are ${age}`;
```

**VI:** Template literals dung dau backtick (`) cho noi suy chuoi, chuoi nhieu dong va tagged templates.

---

## 27. What are optional chaining and nullish coalescing? / Optional chaining va nullish coalescing la gi?

**EN:**
- Optional chaining (`?.`): safely access nested properties, returns `undefined` if null/undefined
- Nullish coalescing (`??`): provides default for `null`/`undefined` only (not `0` or `''`)

```javascript
const user = {
  name: "John",
  address: { city: "NYC" }
};

// Optional chaining
user?.address?.city;     // "NYC"
user?.contact?.email;    // undefined (no error)
user?.greet?.();         // undefined (safe method call)
user?.items?.[0];        // undefined (safe array access)

// Nullish coalescing
const count = 0;
count || 10;   // 10 (0 is falsy)
count ?? 10;   // 0  (0 is not null/undefined)

const name = null;
name ?? "Anonymous";  // "Anonymous"

// Combined
const city = user?.address?.city ?? "Unknown";
```

**VI:** Optional chaining (`?.`) truy cap an toan thuoc tinh long nhau. Nullish coalescing (`??`) cung cap gia tri mac dinh chi cho `null`/`undefined`.

---

## 28. What is event delegation? / Event delegation la gi?

**EN:** Event delegation attaches one event listener to a parent element to handle events from its children. Uses event bubbling.

```javascript
// Instead of adding listener to each button
// Add one listener to parent
document.getElementById('button-container').addEventListener('click', (e) => {
  if (e.target.matches('button')) {
    console.log('Button clicked:', e.target.textContent);
  }
});

// HTML:
// <div id="button-container">
//   <button>One</button>
//   <button>Two</button>
//   <button>Three</button>
// </div>

// Benefits:
// - Memory efficient (one listener vs many)
// - Works with dynamically added elements
// - Less code to manage
```

**VI:** Event delegation gan mot listener vao phan tu cha de xu ly su kien tu cac phan tu con. Su dung event bubbling.

---

## 29. What is event bubbling and capturing? / Event bubbling va capturing la gi?

**EN:**
- **Capturing** (trickling): event travels from root to target (top-down)
- **Bubbling**: event travels from target to root (bottom-up)

Default is bubbling. Use `{ capture: true }` for capturing phase.

```javascript
// <div id="outer">
//   <div id="inner">Click me</div>
// </div>

const outer = document.getElementById('outer');
const inner = document.getElementById('inner');

// Bubbling (default)
outer.addEventListener('click', () => console.log('Outer - Bubble'));
inner.addEventListener('click', () => console.log('Inner - Bubble'));
// Click inner: "Inner - Bubble", "Outer - Bubble"

// Capturing
outer.addEventListener('click', () => console.log('Outer - Capture'), true);
// Click inner: "Outer - Capture", "Inner - Bubble", "Outer - Bubble"

// Stop propagation
inner.addEventListener('click', (e) => {
  e.stopPropagation();  // stops bubbling/capturing
});
```

**VI:** Capturing: su kien di tu goc den target (tren xuong). Bubbling: su kien di tu target len goc (duoi len). Mac dinh la bubbling.

---

## 30. What are common DOM manipulation methods? / Cac phuong thuc thao tac DOM pho bien la gi?

**EN:** Key DOM manipulation methods:

```javascript
// Selecting elements
document.getElementById('id');
document.querySelector('.class');
document.querySelectorAll('div');

// Creating elements
const div = document.createElement('div');
div.textContent = 'Hello';
div.innerHTML = '<span>World</span>';
div.setAttribute('class', 'container');
div.classList.add('active');

// Adding/Removing elements
parent.appendChild(child);
parent.insertBefore(newNode, referenceNode);
parent.removeChild(child);
element.remove();

// Modern insertion
element.append(node, 'text');    // multiple, end
element.prepend(node);           // start
element.before(node);            // before element
element.after(node);             // after element

// Clone
const clone = element.cloneNode(true); // deep clone

// Attributes
element.getAttribute('href');
element.setAttribute('href', '/new');
element.removeAttribute('href');
```

**VI:** Cac phuong thuc DOM chinh: chon phan tu (querySelector), tao phan tu (createElement), them/xoa (appendChild, remove), va thao tac thuoc tinh (getAttribute, setAttribute).

---

## 31. What is the difference between deep copy and shallow copy? / Su khac nhau giua deep copy va shallow copy la gi?

**EN:** Shallow copy copies only the first level; nested objects still reference the original. Deep copy creates completely independent copies of all nested objects.

```javascript
const original = { a: 1, nested: { b: 2 } };

// Shallow copy - nested objects are shared
const shallow = { ...original };
shallow.nested.b = 99;
console.log(original.nested.b); // 99 (affected!)

// Deep copy methods
const deep1 = JSON.parse(JSON.stringify(original)); // has limitations
const deep2 = structuredClone(original);            // modern, recommended

deep2.nested.b = 100;
console.log(original.nested.b); // 99 (not affected)
```

**VI:** Shallow copy chi sao chep cap dau tien; doi tuong long nhau van tham chieu ban goc. Deep copy tao ban sao doc lap hoan toan cua tat ca doi tuong long nhau.

---

## 32. What is structuredClone() and when should you use it? / structuredClone() la gi va khi nao nen dung?

**EN:** `structuredClone()` is a built-in method for deep cloning objects. It handles circular references, Map, Set, Date, ArrayBuffer, and more.

```javascript
const obj = {
  date: new Date(),
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  nested: { deep: { value: 42 } }
};

// Creates true deep copy
const clone = structuredClone(obj);

// Handles circular references
const circular = { name: 'circular' };
circular.self = circular;
const clonedCircular = structuredClone(circular); // works!

// Cannot clone: functions, DOM nodes, Error objects, symbols
const withFunc = { fn: () => {} };
structuredClone(withFunc); // DataCloneError
```

**VI:** `structuredClone()` la phuong thuc co san de deep clone. Xu ly duoc tham chieu vong, Map, Set, Date. Khong clone duoc: function, DOM node, Symbol.

---

## 33. What are the limitations of JSON.parse/JSON.stringify for cloning? / Cac han che cua JSON.parse/JSON.stringify khi clone la gi?

**EN:** `JSON.parse(JSON.stringify())` has several limitations for deep cloning:

```javascript
const obj = {
  date: new Date(),
  fn: function() {},
  undef: undefined,
  nan: NaN,
  infinity: Infinity,
  regex: /test/,
  map: new Map(),
  set: new Set([1, 2])
};

const cloned = JSON.parse(JSON.stringify(obj));

console.log(cloned.date);     // string, not Date object
console.log(cloned.fn);       // undefined (lost)
console.log(cloned.undef);    // undefined (key removed)
console.log(cloned.nan);      // null
console.log(cloned.infinity); // null
console.log(cloned.regex);    // {} (empty object)
console.log(cloned.map);      // {}
console.log(cloned.set);      // {}

// Circular reference throws error
const circular = { a: 1 };
circular.self = circular;
JSON.stringify(circular); // TypeError: circular structure
```

**VI:** JSON.parse/stringify khong ho tro: Date (thanh string), function, undefined, NaN, Infinity, RegExp, Map, Set, va tham chieu vong.

---

## 34. What is WeakMap and when should you use it? / WeakMap la gi va khi nao nen dung?

**EN:** WeakMap holds weak references to keys (objects only). Keys can be garbage collected when no other references exist. Not iterable.

```javascript
const weakMap = new WeakMap();

let obj = { name: 'John' };
weakMap.set(obj, 'metadata');

console.log(weakMap.get(obj)); // 'metadata'

obj = null; // Original object can be garbage collected
// WeakMap entry is automatically removed

// Use cases:
// 1. Private data for objects
const privateData = new WeakMap();
class User {
  constructor(name) {
    privateData.set(this, { secret: 'hidden' });
    this.name = name;
  }
  getSecret() {
    return privateData.get(this).secret;
  }
}

// 2. Caching computed values
const cache = new WeakMap();
function expensiveOperation(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = /* heavy computation */;
  cache.set(obj, result);
  return result;
}
```

**VI:** WeakMap giu tham chieu yeu den key (chi la object). Key co the bi garbage collected khi khong con tham chieu. Dung cho: du lieu rieng tu, cache.

---

## 35. What is WeakSet and how does it differ from Set? / WeakSet la gi va khac Set nhu the nao?

**EN:** WeakSet stores weak references to objects only. Objects can be garbage collected. Not iterable, no size property.

```javascript
const weakSet = new WeakSet();
const set = new Set();

let obj1 = { id: 1 };
let obj2 = { id: 2 };

weakSet.add(obj1);
set.add(obj2);

console.log(weakSet.has(obj1)); // true
console.log(set.has(obj2));     // true
console.log(set.size);          // 1
// console.log(weakSet.size);   // undefined - no size property

// Use case: Track if objects have been processed
const visited = new WeakSet();

function processOnce(obj) {
  if (visited.has(obj)) {
    console.log('Already processed');
    return;
  }
  visited.add(obj);
  // Process object...
}

// Use case: Detect circular references
function hasCircularRef(obj, seen = new WeakSet()) {
  if (typeof obj !== 'object' || obj === null) return false;
  if (seen.has(obj)) return true;
  seen.add(obj);
  return Object.values(obj).some(v => hasCircularRef(v, seen));
}
```

**VI:** WeakSet luu tham chieu yeu den object. Object co the bi garbage collected. Khong co size, khong iterable. Dung de theo doi object da xu ly.

---

## 36. How does garbage collection work with WeakMap/WeakSet? / Garbage collection hoat dong nhu the nao voi WeakMap/WeakSet?

**EN:** WeakMap/WeakSet hold weak references - they don't prevent garbage collection. When no strong references exist to a key, it's collected along with its entry.

```javascript
// Memory leak with Map
const map = new Map();
function leaky() {
  const bigData = new Array(1000000).fill('x');
  map.set(bigData, 'value');
  // bigData stays in memory forever because Map holds strong reference
}

// No leak with WeakMap
const weakMap = new WeakMap();
function noLeak() {
  const bigData = new Array(1000000).fill('x');
  weakMap.set(bigData, 'value');
  // After function ends, bigData can be garbage collected
}

// Practical example: DOM element metadata
const elementData = new WeakMap();

function addMetadata(element) {
  elementData.set(element, { clicks: 0, created: Date.now() });
}

// When DOM element is removed from page and dereferenced,
// its metadata is automatically cleaned up

const button = document.createElement('button');
addMetadata(button);
// If button is removed and no references exist,
// WeakMap entry is garbage collected
```

**VI:** WeakMap/WeakSet giu tham chieu yeu - khong ngan garbage collection. Khi khong con tham chieu manh den key, no se bi thu gom cung voi entry.

---

## 37. What are generators in JavaScript? / Generators trong JavaScript la gi?

**EN:** Generators are functions that can pause and resume execution using `yield`. They return an iterator object.

```javascript
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

// Infinite sequence
function* infiniteSequence() {
  let i = 0;
  while (true) {
    yield i++;
  }
}

const infinite = infiniteSequence();
console.log(infinite.next().value); // 0
console.log(infinite.next().value); // 1

// Passing values to generator
function* twoWay() {
  const x = yield 'First';
  const y = yield x + 10;
  return x + y;
}

const tw = twoWay();
console.log(tw.next());     // { value: 'First', done: false }
console.log(tw.next(5));    // { value: 15, done: false } (x = 5)
console.log(tw.next(20));   // { value: 25, done: true } (y = 20)
```

**VI:** Generators la ham co the tam dung va tiep tuc voi `yield`. Chung tra ve iterator object. Co the truyen gia tri qua lai giua generator va code goi.

---

## 38. What are iterators and the Symbol.iterator? / Iterators va Symbol.iterator la gi?

**EN:** An iterator is an object with a `next()` method. `Symbol.iterator` makes objects iterable (usable in for...of loops).

```javascript
// Custom iterator
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
        return { done: true };
      }
    };
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// Using generator for cleaner syntax
const rangeGen = {
  from: 1,
  to: 5,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) {
      yield i;
    }
  }
};

console.log([...rangeGen]); // [1, 2, 3, 4, 5]

// Built-in iterables: Array, String, Map, Set
const str = 'Hello';
for (const char of str) {
  console.log(char); // H, e, l, l, o
}
```

**VI:** Iterator la object co phuong thuc `next()`. `Symbol.iterator` lam object iterable (dung duoc trong for...of). Array, String, Map, Set deu la iterable.

---

## 39. What are practical use cases for generators? / Cac truong hop su dung thuc te cua generators la gi?

**EN:** Generators are useful for: lazy evaluation, infinite sequences, async flow control, and custom iterators.

```javascript
// 1. Lazy evaluation - compute only when needed
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

// 2. Paginated data fetching
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    if (data.length === 0) break;
    yield data;
    page++;
  }
}

// 3. State machine
function* trafficLight() {
  while (true) {
    yield 'green';
    yield 'yellow';
    yield 'red';
  }
}

// 4. ID generator
function* idGenerator(prefix = 'id') {
  let id = 0;
  while (true) {
    yield `${prefix}_${id++}`;
  }
}

const genId = idGenerator('user');
console.log(genId.next().value); // user_0
console.log(genId.next().value); // user_1
```

**VI:** Generators dung cho: tinh toan luc can (lazy), chuoi vo han, dieu khien async, va custom iterator.

---

## 40. What is the Proxy object in JavaScript? / Proxy object trong JavaScript la gi?

**EN:** Proxy wraps an object and intercepts operations like get, set, delete. Used for validation, logging, and reactive programming.

```javascript
const target = { name: 'John', age: 30 };

const handler = {
  get(target, prop) {
    console.log(`Getting ${prop}`);
    return prop in target ? target[prop] : 'Not found';
  },
  set(target, prop, value) {
    console.log(`Setting ${prop} to ${value}`);
    if (prop === 'age' && typeof value !== 'number') {
      throw new TypeError('Age must be a number');
    }
    target[prop] = value;
    return true;
  },
  deleteProperty(target, prop) {
    console.log(`Deleting ${prop}`);
    delete target[prop];
    return true;
  }
};

const proxy = new Proxy(target, handler);

proxy.name;          // Getting name -> "John"
proxy.unknown;       // Getting unknown -> "Not found"
proxy.age = 31;      // Setting age to 31
proxy.age = 'old';   // TypeError: Age must be a number
delete proxy.name;   // Deleting name
```

**VI:** Proxy boc doi tuong va chan cac thao tac nhu get, set, delete. Dung cho validation, logging, va reactive programming.

---

## 41. What is the Reflect API and how is it used with Proxy? / Reflect API la gi va dung voi Proxy nhu the nao?

**EN:** Reflect provides methods for interceptable operations, mirroring Proxy traps. It gives cleaner default behavior in proxy handlers.

```javascript
// Without Reflect
const handler1 = {
  get(target, prop) {
    return target[prop]; // works but inconsistent
  }
};

// With Reflect - cleaner and more consistent
const handler2 = {
  get(target, prop, receiver) {
    console.log(`Accessing: ${prop}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting: ${prop} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  },
  has(target, prop) {
    console.log(`Checking: ${prop}`);
    return Reflect.has(target, prop);
  }
};

const obj = { x: 1, y: 2 };
const proxy = new Proxy(obj, handler2);

proxy.x;         // Accessing: x -> 1
proxy.z = 3;     // Setting: z = 3
'x' in proxy;    // Checking: x -> true

// Reflect methods
Reflect.get(obj, 'x');           // 1
Reflect.set(obj, 'a', 10);       // true
Reflect.has(obj, 'x');           // true
Reflect.deleteProperty(obj, 'a'); // true
Reflect.ownKeys(obj);            // ['x', 'y', 'z']
```

**VI:** Reflect cung cap cac phuong thuc tuong ung voi Proxy traps. Giup viet proxy handler sach hon va nhat quan hon.

---

## 42. What are practical use cases for Proxy? / Cac truong hop su dung thuc te cua Proxy la gi?

**EN:** Proxy is used for: data validation, reactive systems, API wrappers, and access control.

```javascript
// 1. Data validation
function createValidated(target, validators) {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (validators[prop] && !validators[prop](value)) {
        throw new Error(`Invalid value for ${prop}`);
      }
      obj[prop] = value;
      return true;
    }
  });
}

const user = createValidated({}, {
  age: v => typeof v === 'number' && v > 0,
  email: v => v.includes('@')
});

// 2. Reactive/Observable pattern
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value) {
      const oldValue = target[prop];
      target[prop] = value;
      onChange(prop, value, oldValue);
      return true;
    }
  });
}

const state = reactive({ count: 0 }, (prop, newVal) => {
  console.log(`${prop} changed to ${newVal}`);
});

// 3. Default values
const withDefaults = new Proxy({}, {
  get(target, prop) {
    return prop in target ? target[prop] : 0;
  }
});

// 4. Private properties
const privateProps = new Proxy(obj, {
  get(target, prop) {
    if (prop.startsWith('_')) throw new Error('Access denied');
    return target[prop];
  }
});
```

**VI:** Proxy dung cho: validation du lieu, reactive systems (Vue.js), API wrapper, va kiem soat truy cap (private props).

---

## 43. What is the IIFE pattern and why is it used? / IIFE pattern la gi va tai sao dung?

**EN:** IIFE (Immediately Invoked Function Expression) creates a private scope. Used to avoid polluting global scope.

```javascript
// Basic IIFE
(function() {
  const private = 'hidden';
  console.log('IIFE executed');
})();

// console.log(private); // ReferenceError

// IIFE with return value
const counter = (function() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
})();

counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2

// Arrow function IIFE
(() => {
  console.log('Arrow IIFE');
})();

// IIFE with parameters
((window, document) => {
  // Use window and document safely
  // Even if global names change
})(window, document);

// Modern alternative: block scope with let/const
{
  const private = 'hidden';
  // Only accessible in this block
}
```

**VI:** IIFE tao pham vi rieng tu ngay lap tuc. Dung de tranh lam o global scope. Ngay nay co the dung block scope voi let/const.

---

## 44. What is the difference between CommonJS and ES Modules? / Su khac nhau giua CommonJS va ES Modules la gi?

**EN:** CommonJS (Node.js) uses `require/exports`, synchronous loading. ES Modules use `import/export`, static analysis, async loading.

```javascript
// ===== CommonJS (Node.js) =====
// math.js
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
module.exports = { add, subtract };
// or: exports.add = add;

// app.js
const { add, subtract } = require('./math');
const math = require('./math'); // entire module

// Dynamic require
const moduleName = condition ? './a' : './b';
const mod = require(moduleName);

// ===== ES Modules =====
// math.mjs (or .js with "type": "module" in package.json)
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export default { add, subtract };

// app.mjs
import { add, subtract } from './math.mjs';
import math from './math.mjs';        // default export
import * as mathAll from './math.mjs'; // all exports

// Key differences:
// - CommonJS: runtime loading, can be conditional
// - ES Modules: static analysis, tree-shaking possible
// - ES Modules: async by default, top-level await supported
```

**VI:** CommonJS dung `require/exports`, dong bo. ES Modules dung `import/export`, phan tich tinh, ho tro tree-shaking va async.

---

## 45. What is dynamic import() and when should you use it? / Dynamic import() la gi va khi nao nen dung?

**EN:** Dynamic `import()` loads modules at runtime, returns a Promise. Used for code splitting and lazy loading.

```javascript
// Static import - loaded at startup
import { heavyFunction } from './heavy-module.js';

// Dynamic import - loaded on demand
async function loadModule() {
  const module = await import('./heavy-module.js');
  module.heavyFunction();
}

// Conditional loading
async function loadFeature(featureName) {
  const module = await import(`./features/${featureName}.js`);
  return module.default;
}

// Lazy load on user interaction
button.addEventListener('click', async () => {
  const { Chart } = await import('./chart-library.js');
  new Chart(data);
});

// React.lazy for component splitting
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// With error handling
try {
  const module = await import('./optional-feature.js');
  module.init();
} catch (error) {
  console.log('Feature not available');
}

// Import with default and named exports
const { default: main, helper } = await import('./module.js');
```

**VI:** Dynamic `import()` tai module luc runtime, tra ve Promise. Dung cho code splitting, lazy loading de giam bundle size ban dau.

---

## 46. What are common causes of memory leaks in JavaScript? / Cac nguyen nhan pho bien gay memory leak trong JavaScript la gi?

**EN:** Common memory leak causes: forgotten timers, closures holding references, detached DOM nodes, and event listeners.

```javascript
// 1. Forgotten timers
function leak1() {
  const data = new Array(1000000).fill('x');
  setInterval(() => {
    console.log(data.length); // data never released
  }, 1000);
}

// Fix: clear timer when done
const timerId = setInterval(fn, 1000);
clearInterval(timerId);

// 2. Closures holding references
function leak2() {
  const hugeData = new Array(1000000).fill('x');
  return function() {
    console.log(hugeData[0]); // hugeData stays in memory
  };
}

// 3. Detached DOM nodes
function leak3() {
  const button = document.getElementById('myButton');
  const onClick = () => console.log('clicked');
  button.addEventListener('click', onClick);
  button.remove(); // DOM removed but listener keeps reference
}

// Fix: remove listener before removing element
button.removeEventListener('click', onClick);
button.remove();

// 4. Global variables
function leak4() {
  globalData = { huge: new Array(1000000) }; // implicit global
}

// 5. Console.log in production
console.log(hugeObject); // keeps reference in console
```

**VI:** Nguyen nhan memory leak: timer khong clear, closure giu reference, DOM da xoa nhung con listener, bien global vo tinh.

---

## 47. How do you detect memory leaks in JavaScript? / Lam the nao de phat hien memory leak trong JavaScript?

**EN:** Use Chrome DevTools Memory tab: Heap snapshots, Allocation timeline, and Performance monitor.

```javascript
// 1. Chrome DevTools Memory tab
// - Take Heap Snapshot before and after action
// - Compare snapshots to find retained objects
// - Look for "Detached" DOM elements

// 2. Performance.memory API (Chrome only)
console.log(performance.memory.usedJSHeapSize);

// 3. Manual tracking
function trackMemory(label) {
  if (performance.memory) {
    console.log(`${label}: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
  }
}

// 4. WeakRef for debugging (ES2021)
let ref = new WeakRef(largeObject);
// Later check if object was collected
if (ref.deref() === undefined) {
  console.log('Object was garbage collected');
}

// 5. FinalizationRegistry for cleanup tracking
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object ${heldValue} was garbage collected`);
});

let obj = { name: 'test' };
registry.register(obj, 'test-object');
obj = null; // Eventually logs: "Object test-object was garbage collected"

// 6. Memory leak pattern detection
// Watch for: growing heap in repeated actions
// Test: perform action 10 times, compare memory before/after
```

**VI:** Dung Chrome DevTools Memory tab: Heap Snapshot, Allocation timeline. So sanh snapshot truoc/sau de tim object giu lai. Dung WeakRef/FinalizationRegistry de theo doi.

---

## 48. How do you prevent memory leaks in JavaScript? / Lam the nao de ngan memory leak trong JavaScript?

**EN:** Best practices: clean up resources, use WeakMap/WeakSet, remove event listeners, and avoid global variables.

```javascript
// 1. Clean up timers and intervals
class Component {
  constructor() {
    this.timerId = setInterval(() => this.update(), 1000);
  }

  destroy() {
    clearInterval(this.timerId);
  }
}

// 2. Remove event listeners
class Button {
  constructor(element) {
    this.element = element;
    this.handleClick = this.handleClick.bind(this);
    this.element.addEventListener('click', this.handleClick);
  }

  handleClick() { /* ... */ }

  destroy() {
    this.element.removeEventListener('click', this.handleClick);
    this.element = null;
  }
}

// 3. Use WeakMap for object metadata
const cache = new WeakMap(); // Auto cleanup when keys are GC'd

// 4. Nullify references when done
function processData() {
  let bigData = fetchHugeData();
  // ... process ...
  bigData = null; // Help GC
}

// 5. AbortController for fetch
const controller = new AbortController();
fetch(url, { signal: controller.signal });
// When component unmounts:
controller.abort();

// 6. Avoid closures holding large data
function createHandler(data) {
  const id = data.id; // Only keep what's needed
  return () => console.log(id);
  // Don't: return () => console.log(data);
}
```

**VI:** Ngan memory leak: don dep timer/interval, remove event listener, dung WeakMap, null hoa reference, dung AbortController, tranh closure giu du lieu lon.

---

## 49. What are Web Workers and when should you use them? / Web Workers la gi va khi nao nen dung?

**EN:** Web Workers run JavaScript in background threads. Used for CPU-intensive tasks without blocking the main thread (UI).

```javascript
// main.js
const worker = new Worker('worker.js');

// Send data to worker
worker.postMessage({ numbers: [1, 2, 3, 4, 5] });

// Receive results
worker.onmessage = (event) => {
  console.log('Result:', event.data);
};

// Handle errors
worker.onerror = (error) => {
  console.error('Worker error:', error);
};

// Terminate worker
worker.terminate();

// ===== worker.js =====
self.onmessage = (event) => {
  const { numbers } = event.data;

  // Heavy computation
  const result = numbers.reduce((sum, n) => sum + n, 0);

  // Send result back
  self.postMessage(result);
};

// Use cases:
// - Image/video processing
// - Large data parsing (CSV, JSON)
// - Complex calculations
// - Sorting large arrays
// - Compression/encryption

// Limitations:
// - No DOM access
// - No window object
// - Data is copied (use Transferable for large data)
// - Separate file required (or use Blob)

// Inline worker with Blob
const code = `self.onmessage = e => self.postMessage(e.data * 2)`;
const blob = new Blob([code], { type: 'application/javascript' });
const inlineWorker = new Worker(URL.createObjectURL(blob));
```

**VI:** Web Workers chay JS tren background thread. Dung cho task nang (xu ly anh, parse data lon) ma khong block UI. Khong truy cap duoc DOM.

---

## 50. What are Service Workers and how do they differ from Web Workers? / Service Workers la gi va khac Web Workers nhu the nao?

**EN:** Service Workers are proxies between browser and network. Used for offline support, caching, push notifications. Persist after page closes.

```javascript
// Register service worker (main.js)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.log('SW failed', err));
}

// ===== sw.js =====
const CACHE_NAME = 'v1';
const ASSETS = ['/index.html', '/styles.css', '/app.js'];

// Install - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// Fetch - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Key differences from Web Workers:
// | Feature          | Web Worker      | Service Worker       |
// |------------------|-----------------|----------------------|
// | Purpose          | Heavy computation| Network proxy/cache  |
// | Lifetime         | Page lifetime   | Persistent           |
// | Scope            | Single page     | All pages in scope   |
// | HTTPS required   | No              | Yes (except localhost)|
// | DOM access       | No              | No                   |
```

**VI:** Service Workers la proxy giua browser va network. Dung cho offline, cache, push notification. Ton tai sau khi dong trang. Web Worker chi cho tinh toan nang, khong persist.

---

## 51. What is WeakRef and when should you use it? / WeakRef la gi va khi nao nen dung?

**EN:** WeakRef holds a weak reference to an object, allowing it to be garbage collected. Used for caches where you don't want to prevent GC.

```javascript
// Create WeakRef
let obj = { data: 'important' };
const weakRef = new WeakRef(obj);

// Access the object (may return undefined if GC'd)
const deref = weakRef.deref();
if (deref) {
  console.log(deref.data); // 'important'
}

// Practical: Memory-sensitive cache
class WeakCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value) {
    this.cache.set(key, new WeakRef(value));
  }

  get(key) {
    const ref = this.cache.get(key);
    if (ref) {
      const value = ref.deref();
      if (value) return value;
      this.cache.delete(key); // Clean up dead reference
    }
    return undefined;
  }
}

// Use case: Caching DOM elements or large objects
const cache = new WeakCache();
let heavyObject = { data: new Array(1000000).fill('x') };
cache.set('heavy', heavyObject);

heavyObject = null; // Object can be GC'd
// cache.get('heavy') may return undefined after GC
```

**VI:** WeakRef giu tham chieu yeu den object, cho phep no bi garbage collected. Dung cho cache khi khong muon ngan GC. `deref()` tra ve object hoac undefined.

---

## 52. What is FinalizationRegistry? / FinalizationRegistry la gi?

**EN:** FinalizationRegistry lets you request a callback when an object is garbage collected. Used for cleanup of external resources.

```javascript
// Create registry with cleanup callback
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Cleaning up: ${heldValue}`);
  // Perform cleanup: close file, release resource, etc.
});

// Register object for cleanup
let obj = { name: 'resource' };
registry.register(obj, 'resource-id', obj); // (target, heldValue, unregisterToken)

obj = null; // Object can be GC'd, callback will eventually fire

// Unregister if cleanup not needed
registry.unregister(obj); // Use unregisterToken

// Practical: Track file handles
class FileHandle {
  static registry = new FinalizationRegistry((fd) => {
    console.log(`Auto-closing file descriptor: ${fd}`);
    // OS.close(fd);
  });

  constructor(path) {
    this.fd = this.openFile(path);
    FileHandle.registry.register(this, this.fd, this);
  }

  close() {
    FileHandle.registry.unregister(this);
    // OS.close(this.fd);
  }

  openFile(path) { return Math.random(); } // Simulated
}

// Warning: GC timing is unpredictable
// Don't rely on this for critical cleanup - use explicit close()
```

**VI:** FinalizationRegistry goi callback khi object bi garbage collected. Dung de don dep tai nguyen ben ngoai. Luu y: thoi diem GC khong du doan duoc, nen dung explicit cleanup.

---

## 53. How do WeakRef and FinalizationRegistry work together? / WeakRef va FinalizationRegistry hoat dong cung nhau nhu the nao?

**EN:** WeakRef provides weak access to objects, while FinalizationRegistry handles cleanup. Together they enable memory-efficient caches with proper resource cleanup.

```javascript
class ResourceCache {
  #cache = new Map();
  #registry = new FinalizationRegistry((key) => {
    console.log(`Resource ${key} was garbage collected`);
    this.#cache.delete(key);
  });

  set(key, resource) {
    const ref = new WeakRef(resource);
    this.#cache.set(key, ref);
    this.#registry.register(resource, key, ref);
  }

  get(key) {
    const ref = this.#cache.get(key);
    if (!ref) return undefined;

    const resource = ref.deref();
    if (!resource) {
      this.#cache.delete(key);
      return undefined;
    }
    return resource;
  }

  delete(key) {
    const ref = this.#cache.get(key);
    if (ref) {
      this.#registry.unregister(ref);
      this.#cache.delete(key);
    }
  }
}

// Usage
const cache = new ResourceCache();
let bigData = { size: '10MB', data: new Array(1000000) };
cache.set('userData', bigData);

console.log(cache.get('userData')); // { size: '10MB', ... }

bigData = null;
// Eventually: "Resource userData was garbage collected"
// cache.get('userData') returns undefined
```

**VI:** WeakRef cung cap truy cap yeu den object, FinalizationRegistry xu ly cleanup. Ket hop de tao cache hieu qua bo nho voi don dep tai nguyen dung cach.

---

## 54. What is the Proxy object and what are its traps? / Proxy object la gi va cac traps cua no la gi?

**EN:** Proxy wraps objects to intercept operations. Traps are handler methods for different operations (get, set, has, delete, etc.).

```javascript
const handler = {
  // Property access
  get(target, prop, receiver) {
    console.log(`GET ${prop}`);
    return Reflect.get(target, prop, receiver);
  },

  // Property assignment
  set(target, prop, value, receiver) {
    console.log(`SET ${prop} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  },

  // 'in' operator
  has(target, prop) {
    console.log(`HAS ${prop}`);
    return Reflect.has(target, prop);
  },

  // delete operator
  deleteProperty(target, prop) {
    console.log(`DELETE ${prop}`);
    return Reflect.deleteProperty(target, prop);
  },

  // Object.keys, for...in
  ownKeys(target) {
    console.log('OWNKEYS');
    return Reflect.ownKeys(target);
  },

  // Function call (if target is function)
  apply(target, thisArg, args) {
    console.log(`APPLY with args: ${args}`);
    return Reflect.apply(target, thisArg, args);
  },

  // new operator
  construct(target, args) {
    console.log(`CONSTRUCT with args: ${args}`);
    return Reflect.construct(target, args);
  }
};

const obj = { x: 1 };
const proxy = new Proxy(obj, handler);

proxy.x;           // GET x
proxy.y = 2;       // SET y = 2
'x' in proxy;      // HAS x
delete proxy.y;    // DELETE y
Object.keys(proxy); // OWNKEYS
```

**VI:** Proxy boc object de chan cac thao tac. Traps la cac phuong thuc handler cho cac thao tac khac nhau: get, set, has, deleteProperty, ownKeys, apply, construct, v.v.

---

## 55. How do you create a revocable Proxy? / Lam the nao de tao Proxy co the thu hoi?

**EN:** `Proxy.revocable()` creates a proxy that can be disabled. After revocation, any operation throws TypeError.

```javascript
const target = { secret: 'data', public: 'info' };

// Create revocable proxy
const { proxy, revoke } = Proxy.revocable(target, {
  get(target, prop) {
    if (prop === 'secret') {
      throw new Error('Access denied');
    }
    return target[prop];
  }
});

// Use normally
console.log(proxy.public); // 'info'

// Revoke access
revoke();

// All operations throw TypeError
try {
  console.log(proxy.public);
} catch (e) {
  console.log(e); // TypeError: Cannot perform 'get' on a proxy that has been revoked
}

// Use case: Temporary access
function grantTemporaryAccess(data, duration) {
  const { proxy, revoke } = Proxy.revocable(data, {});

  setTimeout(() => {
    revoke();
    console.log('Access revoked');
  }, duration);

  return proxy;
}

const tempAccess = grantTemporaryAccess({ key: 'value' }, 5000);
console.log(tempAccess.key); // 'value'
// After 5 seconds: access revoked, all operations throw
```

**VI:** `Proxy.revocable()` tao proxy co the thu hoi. Sau khi revoke, moi thao tac deu throw TypeError. Dung cho truy cap tam thoi hoac bao mat.

---

## 56. What is the Reflect API? / Reflect API la gi?

**EN:** Reflect is a built-in object with methods for interceptable operations. It provides cleaner alternatives to Object methods and works seamlessly with Proxy.

```javascript
const obj = { x: 1, y: 2 };

// Reflect.get - safer property access
Reflect.get(obj, 'x');                    // 1
Reflect.get(obj, 'z');                    // undefined (no error)

// Reflect.set - returns boolean
Reflect.set(obj, 'z', 3);                 // true
console.log(obj.z);                       // 3

// Reflect.has - 'in' operator as function
Reflect.has(obj, 'x');                    // true

// Reflect.deleteProperty - delete as function
Reflect.deleteProperty(obj, 'z');         // true

// Reflect.ownKeys - all keys including symbols
const sym = Symbol('id');
obj[sym] = 'symbol';
Reflect.ownKeys(obj);                     // ['x', 'y', Symbol(id)]

// Reflect.defineProperty - returns boolean instead of throwing
const success = Reflect.defineProperty(obj, 'prop', {
  value: 42,
  writable: false
});
console.log(success);                     // true

// Reflect.construct - call constructor
class Person {
  constructor(name) { this.name = name; }
}
const person = Reflect.construct(Person, ['John']);

// Reflect.apply - call function with args
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}
Reflect.apply(greet, { name: 'Alice' }, ['Hello']); // 'Hello, Alice'
```

**VI:** Reflect la object co san voi cac phuong thuc cho thao tac co the chan. Tra ve boolean thay vi throw error, lam viec tot voi Proxy.

---

## 57. What are generators and how do they work? / Generators la gi va chung hoat dong nhu the nao?

**EN:** Generators are functions that can pause and resume. They use `function*` syntax and `yield` to produce values on demand.

```javascript
// Basic generator
function* countUp() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = countUp();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Generator with parameters and return
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
  return 'Done';
}

console.log([...range(1, 5)]); // [1, 2, 3, 4, 5]

// Infinite generator
function* infiniteId() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const idGen = infiniteId();
console.log(idGen.next().value); // 1
console.log(idGen.next().value); // 2

// Two-way communication
function* conversation() {
  const name = yield 'What is your name?';
  const age = yield `Hello ${name}! How old are you?`;
  return `${name} is ${age} years old`;
}

const talk = conversation();
console.log(talk.next().value);        // 'What is your name?'
console.log(talk.next('Alice').value); // 'Hello Alice! How old are you?'
console.log(talk.next(25).value);      // 'Alice is 25 years old'
```

**VI:** Generators la ham co the tam dung va tiep tuc. Dung `function*` va `yield` de tao gia tri theo yeu cau. Ho tro giao tiep hai chieu qua next().

---

## 58. What is Symbol.iterator and how do you make objects iterable? / Symbol.iterator la gi va lam the nao de object iterable?

**EN:** `Symbol.iterator` is a well-known symbol that defines the default iterator for an object, making it usable in for...of loops and spread operator.

```javascript
// Custom iterable object
const playlist = {
  songs: ['Song A', 'Song B', 'Song C'],
  [Symbol.iterator]() {
    let index = 0;
    const songs = this.songs;

    return {
      next() {
        if (index < songs.length) {
          return { value: songs[index++], done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const song of playlist) {
  console.log(song); // Song A, Song B, Song C
}

console.log([...playlist]); // ['Song A', 'Song B', 'Song C']

// Using generator (cleaner)
const range = {
  from: 1,
  to: 5,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) {
      yield i;
    }
  }
};

console.log([...range]); // [1, 2, 3, 4, 5]

// Make class iterable
class Queue {
  #items = [];

  enqueue(item) { this.#items.push(item); }
  dequeue() { return this.#items.shift(); }

  *[Symbol.iterator]() {
    for (const item of this.#items) {
      yield item;
    }
  }
}

const queue = new Queue();
queue.enqueue('first');
queue.enqueue('second');
console.log([...queue]); // ['first', 'second']
```

**VI:** `Symbol.iterator` dinh nghia iterator mac dinh cho object, cho phep dung trong for...of va spread. Co the dung generator de viet gon hon.

---

## 59. What are async generators? / Async generators la gi?

**EN:** Async generators combine generators with async/await. They yield promises and are consumed with `for await...of`.

```javascript
// Async generator
async function* asyncRange(start, end) {
  for (let i = start; i <= end; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    yield i;
  }
}

// Consume with for await...of
(async () => {
  for await (const num of asyncRange(1, 5)) {
    console.log(num); // 1, 2, 3, 4, 5 (with 100ms delay each)
  }
})();

// Practical: Paginated API fetching
async function* fetchPages(url) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();

    if (data.items.length === 0) {
      hasMore = false;
    } else {
      yield data.items;
      page++;
    }
  }
}

// Usage
(async () => {
  for await (const items of fetchPages('/api/users')) {
    console.log(`Got ${items.length} users`);
    // Process items...
  }
})();

// Real-time data streaming
async function* streamData(eventSource) {
  const queue = [];
  let resolve;

  eventSource.onmessage = (e) => {
    queue.push(e.data);
    if (resolve) resolve();
  };

  while (true) {
    if (queue.length === 0) {
      await new Promise(r => resolve = r);
    }
    yield queue.shift();
  }
}
```

**VI:** Async generators ket hop generators voi async/await. Yield promise va dung `for await...of` de consume. Huu ich cho fetch phan trang va streaming data.

---

## 60. What are SharedArrayBuffer and Atomics? / SharedArrayBuffer va Atomics la gi?

**EN:** SharedArrayBuffer allows shared memory between workers. Atomics provides atomic operations to prevent race conditions.

```javascript
// Create shared memory (4 bytes = 1 Int32)
const sharedBuffer = new SharedArrayBuffer(4);
const sharedArray = new Int32Array(sharedBuffer);

// Main thread
sharedArray[0] = 0;

// Worker code
// const sharedArray = new Int32Array(sharedBuffer); // received via postMessage

// Without Atomics - race condition possible
sharedArray[0]++; // NOT atomic!

// With Atomics - thread-safe operations
Atomics.add(sharedArray, 0, 1);        // Atomic increment
Atomics.sub(sharedArray, 0, 1);        // Atomic decrement
Atomics.load(sharedArray, 0);          // Atomic read
Atomics.store(sharedArray, 0, 42);     // Atomic write
Atomics.exchange(sharedArray, 0, 10);  // Atomic swap, returns old value

// Compare and swap
Atomics.compareExchange(sharedArray, 0, 10, 20); // If value is 10, set to 20

// Wait and notify (thread synchronization)
// Worker 1: Wait until value changes
Atomics.wait(sharedArray, 0, 0); // Block until sharedArray[0] !== 0

// Worker 2: Notify waiting threads
Atomics.store(sharedArray, 0, 1);
Atomics.notify(sharedArray, 0, 1); // Wake up 1 waiting thread

// Example: Shared counter
// main.js
const buffer = new SharedArrayBuffer(4);
const counter = new Int32Array(buffer);
worker1.postMessage(buffer);
worker2.postMessage(buffer);

// worker.js
onmessage = (e) => {
  const counter = new Int32Array(e.data);
  for (let i = 0; i < 1000; i++) {
    Atomics.add(counter, 0, 1); // Thread-safe increment
  }
};
```

**VI:** SharedArrayBuffer cho phep chia se bo nho giua workers. Atomics cung cap thao tac nguyen tu de ngan race conditions. Dung Atomics.wait/notify de dong bo threads.

---

## 61. How do Web Workers communicate with the main thread? / Web Workers giao tiep voi main thread nhu the nao?

**EN:** Workers communicate via `postMessage` and `onmessage`. Data is copied (structured clone) unless using Transferable objects.

```javascript
// === main.js ===
const worker = new Worker('worker.js');

// Send message to worker
worker.postMessage({ type: 'CALCULATE', data: [1, 2, 3, 4, 5] });

// Receive message from worker
worker.onmessage = (event) => {
  console.log('Result:', event.data);
};

// Error handling
worker.onerror = (error) => {
  console.error('Worker error:', error.message);
};

// === worker.js ===
self.onmessage = (event) => {
  const { type, data } = event.data;

  if (type === 'CALCULATE') {
    const sum = data.reduce((a, b) => a + b, 0);
    self.postMessage({ result: sum });
  }
};

// Transferable objects (zero-copy)
// main.js
const buffer = new ArrayBuffer(1024 * 1024); // 1MB
worker.postMessage(buffer, [buffer]); // Transfer ownership
console.log(buffer.byteLength); // 0 - buffer is now empty

// worker.js
self.onmessage = (e) => {
  const buffer = e.data;
  console.log(buffer.byteLength); // 1048576 - worker owns it now
};

// MessageChannel for direct communication between workers
const channel = new MessageChannel();
worker1.postMessage({ port: channel.port1 }, [channel.port1]);
worker2.postMessage({ port: channel.port2 }, [channel.port2]);
// Workers can now communicate directly
```

**VI:** Workers giao tiep qua postMessage va onmessage. Du lieu duoc copy (structured clone) tru khi dung Transferable objects (zero-copy). MessageChannel cho phep workers giao tiep truc tiep.

---

## 62. What is AbortController and how do you use it? / AbortController la gi va cach su dung?

**EN:** AbortController allows you to abort async operations like fetch requests. It provides a signal that can be passed to abortable APIs.

```javascript
// Basic fetch abort
const controller = new AbortController();
const { signal } = controller;

fetch('/api/data', { signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Fetch was aborted');
    }
  });

// Abort after timeout
setTimeout(() => controller.abort(), 5000);

// Or abort immediately
controller.abort();

// Abort with reason (ES2022)
controller.abort(new Error('User cancelled'));

// Timeout helper
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// AbortSignal.timeout() - modern approach
fetch('/api/data', { signal: AbortSignal.timeout(5000) });

// Multiple requests with same signal
const controller2 = new AbortController();
Promise.all([
  fetch('/api/users', { signal: controller2.signal }),
  fetch('/api/posts', { signal: controller2.signal }),
]).catch(e => console.log('Both aborted'));

controller2.abort(); // Aborts both requests

// Using with event listeners
const controller3 = new AbortController();
element.addEventListener('click', handler, { signal: controller3.signal });
controller3.abort(); // Removes the listener
```

**VI:** AbortController cho phep huy cac thao tac async nhu fetch. Truyen signal vao API, goi abort() de huy. Ho tro timeout va huy nhieu request cung luc.

---

## 63. What are advanced Fetch API features? / Cac tinh nang nang cao cua Fetch API la gi?

**EN:** Fetch supports streaming, progress tracking, request/response cloning, and various request modes.

```javascript
// Streaming response
async function streamResponse(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(decoder.decode(value));
  }
}

// Upload progress
async function uploadWithProgress(url, file, onProgress) {
  const xhr = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    };
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = reject;
    xhr.open('POST', url);
    xhr.send(file);
  });
}

// Request modes
fetch('/api/data', {
  mode: 'cors',          // cors, no-cors, same-origin
  credentials: 'include', // include, same-origin, omit
  cache: 'no-cache',     // default, no-store, reload, no-cache, force-cache
  redirect: 'follow',    // follow, error, manual
});

// Clone request/response (can only be consumed once)
const response = await fetch('/api/data');
const clone = response.clone();
const data1 = await response.json();
const data2 = await clone.json(); // Can read again

// Request with body
const request = new Request('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' }),
});
fetch(request);

// Download with progress
async function downloadWithProgress(url, onProgress) {
  const response = await fetch(url);
  const contentLength = response.headers.get('content-length');
  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress((loaded / total) * 100);
  }

  return new Blob(chunks);
}
```

**VI:** Fetch ho tro streaming response, theo doi tien trinh download, clone request/response, va nhieu request modes (cors, credentials, cache, redirect).

---

## 64. How do you implement request retry with exponential backoff? / Lam the nao de retry request voi exponential backoff?

**EN:** Exponential backoff increases wait time between retries. Combine with jitter to prevent thundering herd.

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  const { baseDelay = 1000, maxDelay = 30000, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (response.ok) return response;

      // Retry on server errors (5xx)
      if (response.status >= 500 && attempt < maxRetries) {
        throw new Error(`Server error: ${response.status}`);
      }

      return response; // Return non-5xx errors to caller
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
fetchWithRetry('/api/data', { baseDelay: 500, maxDelay: 10000 })
  .then(res => res.json())
  .then(data => console.log(data));

// With abort capability
async function fetchWithRetryAndAbort(url, signal, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

      const response = await fetch(url, { signal });
      if (response.ok) return response;

      if (response.status >= 500 && attempt < maxRetries) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      if (attempt === maxRetries) throw error;

      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

**VI:** Exponential backoff tang thoi gian cho giua cac lan retry. Ket hop jitter de tranh thundering herd. Nen ho tro abort va chi retry loi server (5xx).

---

## 65. What is Intl.NumberFormat? / Intl.NumberFormat la gi?

**EN:** Intl.NumberFormat formats numbers according to locale conventions - currency, percentages, units, and compact notation.

```javascript
// Basic number formatting
const num = 1234567.89;

new Intl.NumberFormat('en-US').format(num);    // "1,234,567.89"
new Intl.NumberFormat('de-DE').format(num);    // "1.234.567,89"
new Intl.NumberFormat('vi-VN').format(num);    // "1.234.567,89"

// Currency formatting
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(1234.5); // "$1,234.50"

new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
}).format(1234567); // "1.234.567 ₫"

new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
}).format(1234); // "￥1,234"

// Percentage
new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
}).format(0.256); // "25.6%"

// Units
new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'kilometer-per-hour',
}).format(100); // "100 km/h"

// Compact notation
new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
}).format(1234567); // "1.2M"

new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'long',
}).format(1234567); // "1.2 million"

// Significant digits
new Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 3,
}).format(12345); // "12,300"
```

**VI:** Intl.NumberFormat dinh dang so theo locale - tien te, phan tram, don vi, va compact notation. Ho tro nhieu locale va tuy chon dinh dang.

---

## 66. What is Intl.DateTimeFormat? / Intl.DateTimeFormat la gi?

**EN:** Intl.DateTimeFormat formats dates and times according to locale conventions with various style options.

```javascript
const date = new Date('2024-03-15T14:30:00');

// Basic formatting
new Intl.DateTimeFormat('en-US').format(date);    // "3/15/2024"
new Intl.DateTimeFormat('de-DE').format(date);    // "15.3.2024"
new Intl.DateTimeFormat('vi-VN').format(date);    // "15/3/2024"

// Date styles
new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date);
// "Friday, March 15, 2024"

new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
// "March 15, 2024"

new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
// "Mar 15, 2024"

// Time styles
new Intl.DateTimeFormat('en-US', {
  timeStyle: 'long',
  timeZone: 'America/New_York'
}).format(date); // "9:30:00 AM EST"

// Custom components
new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
}).format(date); // "Friday, March 15, 2024 at 02:30 PM GMT+7"

// Range formatting
const start = new Date('2024-03-15');
const end = new Date('2024-03-20');
new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
  .formatRange(start, end); // "Mar 15 – 20, 2024"

// Parts for custom rendering
const parts = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).formatToParts(date);
// [{ type: 'month', value: 'March' }, { type: 'literal', value: ' ' }, ...]
```

**VI:** Intl.DateTimeFormat dinh dang ngay gio theo locale. Ho tro dateStyle, timeStyle, timeZone, va cac component tuy chinh. formatRange cho khoang thoi gian.

---

## 67. What is Intl.RelativeTimeFormat? / Intl.RelativeTimeFormat la gi?

**EN:** Intl.RelativeTimeFormat formats relative time (e.g., "3 days ago", "in 2 hours") with locale-aware output.

```javascript
// Basic usage
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

rtf.format(-1, 'day');    // "yesterday"
rtf.format(1, 'day');     // "tomorrow"
rtf.format(-2, 'day');    // "2 days ago"
rtf.format(3, 'week');    // "in 3 weeks"
rtf.format(-1, 'month');  // "last month"

// Numeric style
const rtfNumeric = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
rtfNumeric.format(-1, 'day');  // "1 day ago" (not "yesterday")

// Different locales
new Intl.RelativeTimeFormat('vi').format(-2, 'day');  // "2 ngày trước"
new Intl.RelativeTimeFormat('ja').format(1, 'hour'); // "1 時間後"

// Style options
new Intl.RelativeTimeFormat('en', { style: 'long' }).format(-1, 'month');
// "1 month ago"

new Intl.RelativeTimeFormat('en', { style: 'short' }).format(-1, 'month');
// "1 mo. ago"

new Intl.RelativeTimeFormat('en', { style: 'narrow' }).format(-1, 'month');
// "1 mo. ago"

// Practical helper function
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = date - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  return rtf.format(diffDay, 'day');
}

getRelativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"
```

**VI:** Intl.RelativeTimeFormat dinh dang thoi gian tuong doi ("2 ngay truoc", "trong 3 tuan"). Ho tro numeric: 'auto' de dung "hom qua" thay vi "1 ngay truoc".

---

## 68. What are other useful Intl APIs? / Cac Intl API huu ich khac la gi?

**EN:** Intl includes ListFormat, PluralRules, Collator, Segmenter, and DisplayNames for comprehensive internationalization.

```javascript
// Intl.ListFormat - format lists
const list = ['Apple', 'Banana', 'Orange'];

new Intl.ListFormat('en', { type: 'conjunction' }).format(list);
// "Apple, Banana, and Orange"

new Intl.ListFormat('en', { type: 'disjunction' }).format(list);
// "Apple, Banana, or Orange"

new Intl.ListFormat('vi', { type: 'conjunction' }).format(list);
// "Apple, Banana và Orange"

// Intl.PluralRules - handle pluralization
const pr = new Intl.PluralRules('en');
pr.select(0);  // "other"
pr.select(1);  // "one"
pr.select(2);  // "other"

function pluralize(count, singular, plural) {
  const rule = new Intl.PluralRules('en').select(count);
  return rule === 'one' ? singular : plural;
}
pluralize(1, 'item', 'items'); // "item"
pluralize(5, 'item', 'items'); // "items"

// Intl.Collator - locale-aware string comparison
const collator = new Intl.Collator('de');
['ä', 'z', 'a'].sort(collator.compare); // ['a', 'ä', 'z']

// Case-insensitive sort
const ciCollator = new Intl.Collator('en', { sensitivity: 'base' });
['B', 'a', 'C'].sort(ciCollator.compare); // ['a', 'B', 'C']

// Intl.Segmenter - text segmentation
const segmenter = new Intl.Segmenter('en', { granularity: 'word' });
const segments = [...segmenter.segment('Hello world!')];
// [{ segment: 'Hello', ... }, { segment: ' ', ... }, { segment: 'world', ... }]

// Intl.DisplayNames - display names for languages, regions, currencies
const dn = new Intl.DisplayNames('en', { type: 'language' });
dn.of('vi');  // "Vietnamese"
dn.of('ja');  // "Japanese"

const dnRegion = new Intl.DisplayNames('en', { type: 'region' });
dnRegion.of('VN');  // "Vietnam"
dnRegion.of('US');  // "United States"
```

**VI:** Intl con co ListFormat (dinh dang danh sach), PluralRules (so nhieu), Collator (so sanh chuoi), Segmenter (tach van ban), DisplayNames (ten ngon ngu/quoc gia).

---

## 69. What is the Temporal API? / Temporal API la gi?

**EN:** Temporal is a modern date/time API (Stage 3 proposal) that replaces Date with immutable, timezone-aware objects.

```javascript
// Note: Temporal is still a proposal, syntax may change
// Polyfill: @js-temporal/polyfill

// PlainDate - date without time/timezone
const date = Temporal.PlainDate.from('2024-03-15');
date.year;   // 2024
date.month;  // 3
date.day;    // 15

date.add({ days: 7 });  // Returns new PlainDate (immutable)
date.subtract({ months: 1 });

// PlainTime - time without date/timezone
const time = Temporal.PlainTime.from('14:30:00');
time.hour;   // 14
time.minute; // 30

// PlainDateTime - date and time without timezone
const dt = Temporal.PlainDateTime.from('2024-03-15T14:30:00');
dt.toPlainDate();  // PlainDate
dt.toPlainTime();  // PlainTime

// ZonedDateTime - full date/time with timezone
const zdt = Temporal.ZonedDateTime.from('2024-03-15T14:30:00[Asia/Ho_Chi_Minh]');
zdt.timeZone;           // Asia/Ho_Chi_Minh
zdt.toInstant();        // Exact point in time
zdt.withTimeZone('America/New_York');  // Convert timezone

// Instant - exact point in time (like Unix timestamp)
const instant = Temporal.Now.instant();
instant.epochMilliseconds;  // Like Date.now()

// Duration - time duration
const duration = Temporal.Duration.from({ hours: 2, minutes: 30 });
duration.total('minutes');  // 150

// Comparison
Temporal.PlainDate.compare(date1, date2);  // -1, 0, or 1

// Current time
Temporal.Now.plainDateTimeISO();  // Current local date/time
Temporal.Now.zonedDateTimeISO('Asia/Tokyo');  // Current Tokyo time

// Why Temporal over Date:
// - Immutable (Date is mutable)
// - Clear timezone handling
// - No parsing ambiguity
// - Proper duration arithmetic
```

**VI:** Temporal la API date/time hien dai (Stage 3) thay the Date. Immutable, xu ly timezone ro rang, khong mo ho khi parse, arithmetic duration chinh xac.

---

## 70. What is structuredClone and how does it differ from other cloning methods? / structuredClone la gi va khac cac phuong phap clone khac nhu the nao?

**EN:** `structuredClone()` is a built-in deep clone function that handles complex types, circular references, and transferable objects.

```javascript
// Basic usage
const original = {
  name: 'John',
  dates: [new Date()],
  nested: { deep: { value: 42 } },
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  regex: /pattern/gi,
  buffer: new ArrayBuffer(8)
};

const clone = structuredClone(original);
clone.nested.deep.value = 100;
console.log(original.nested.deep.value); // 42 (unchanged)

// Handles circular references
const circular = { name: 'circular' };
circular.self = circular;
const clonedCircular = structuredClone(circular);
console.log(clonedCircular.self === clonedCircular); // true

// With transfer (zero-copy for ArrayBuffer)
const buffer = new ArrayBuffer(1024);
const cloned = structuredClone({ buffer }, { transfer: [buffer] });
console.log(buffer.byteLength);        // 0 (transferred)
console.log(cloned.buffer.byteLength); // 1024

// Comparison with other methods
const obj = { date: new Date(), fn: () => {}, undef: undefined };

// JSON.parse/stringify - loses types
JSON.parse(JSON.stringify(obj));
// { date: "2024-..." (string!), undef: undefined (key removed) }

// Spread/Object.assign - shallow only
const shallow = { ...obj };
shallow.nested.x = 1; // Affects original!

// structuredClone - proper deep clone
structuredClone(obj);
// { date: Date object, undef: undefined } (fn is lost)

// What structuredClone CANNOT clone:
// - Functions
// - DOM nodes
// - Property descriptors (getters/setters)
// - Prototype chain
// - Symbol properties
try {
  structuredClone({ fn: () => {} });
} catch (e) {
  console.log(e); // DataCloneError
}
```

**VI:** structuredClone() la ham deep clone co san, xu ly duoc Map, Set, Date, circular references. Khong clone duoc functions, DOM nodes, prototype chain. Tot hon JSON.parse/stringify.
