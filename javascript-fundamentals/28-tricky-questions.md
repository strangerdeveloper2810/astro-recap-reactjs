# JavaScript Tricky Interview Questions

Tổng hợp các câu hỏi "trick" phổ biến trong phỏng vấn JavaScript. Mỗi câu hỏi kèm giải thích chi tiết.

---

## 1. Type Coercion Tricks

### 1.1. String + Number mixing

```javascript
// Question 1
const test = 1 + "10" - 9;
console.log({ test });

// Answer: { test: 101 }
// Explanation:
// 1 + "10" → "110" (+ với string = concatenation)
// "110" - 9 → 101 (- chỉ làm việc với numbers, "110" → 110)
```

```javascript
// Question 2
console.log(1 + "2" + "2");   // ?
console.log(1 + +"2" + "2");  // ?
console.log(1 + -"1" + "2");  // ?
console.log(+"1" + "1" + "2"); // ?
console.log("A" - "B" + "2"); // ?
console.log("A" - "B" + 2);   // ?

// Answers:
// "122"   → 1 + "2" = "12", "12" + "2" = "122"
// "32"    → +"2" = 2, 1 + 2 = 3, 3 + "2" = "32"
// "02"    → -"1" = -1, 1 + (-1) = 0, 0 + "2" = "02"
// "112"   → +"1" = 1, 1 + "1" = "11", "11" + "2" = "112"
// "NaN2"  → "A" - "B" = NaN, NaN + "2" = "NaN2"
// NaN     → "A" - "B" = NaN, NaN + 2 = NaN
```

```javascript
// Question 3
console.log([] + []);      // ?
console.log([] + {});      // ?
console.log({} + []);      // ?
console.log({} + {});      // ?

// Answers:
// ""           → [].toString() + [].toString() = "" + ""
// "[object Object]" → "" + "[object Object]"
// "[object Object]" → (depends on context, usually "[object Object]")
// "[object Object][object Object]" or NaN (browser dependent)

// In console: {} + [] might be 0 (empty block + array = +[] = 0)
```

```javascript
// Question 4
console.log(true + true + true);  // ?
console.log(true - true);         // ?
console.log(true == 1);           // ?
console.log(true === 1);          // ?

// Answers:
// 3     → 1 + 1 + 1
// 0     → 1 - 1
// true  → coercion: true → 1
// false → different types
```

### 1.2. Equality Tricks

```javascript
// Question 5
console.log([] == false);   // ?
console.log([] == ![]);     // ?
console.log([] == 0);       // ?
console.log("" == false);   // ?
console.log(" " == false);  // ?

// Answers:
// true  → [] → "" → 0, false → 0
// true  → ![] = false, [] == false (như trên)
// true  → [] → "" → 0
// true  → "" → 0, false → 0
// true  → " " → 0 (trimmed), false → 0
```

```javascript
// Question 6
console.log(null == undefined);  // ?
console.log(null === undefined); // ?
console.log(null == 0);          // ?
console.log(null > 0);           // ?
console.log(null >= 0);          // ?
console.log(null < 1);           // ?

// Answers:
// true   → special rule: null == undefined
// false  → different types
// false  → null only == null or undefined
// false  → null → 0, but comparison returns false
// true   → null → 0, 0 >= 0
// true   → null → 0, 0 < 1

// Note: == và comparison operators (>, <, >=, <=) coerce khác nhau!
```

```javascript
// Question 7
console.log(NaN == NaN);     // ?
console.log(NaN === NaN);    // ?
console.log(Object.is(NaN, NaN)); // ?

// Answers:
// false → NaN không bằng bất cứ gì, kể cả chính nó
// false → same
// true  → Object.is handles NaN correctly
```

### 1.3. typeof Tricks

```javascript
// Question 8
console.log(typeof null);           // ?
console.log(typeof undefined);      // ?
console.log(typeof NaN);            // ?
console.log(typeof []);             // ?
console.log(typeof {});             // ?
console.log(typeof function(){});   // ?
console.log(typeof typeof 1);       // ?

// Answers:
// "object"    → historical bug in JavaScript
// "undefined"
// "number"    → NaN is a number (Not a Number is a number 😅)
// "object"    → arrays are objects
// "object"
// "function"
// "string"    → typeof 1 = "number", typeof "number" = "string"
```

---

## 2. Hoisting Tricks

### 2.1. var Hoisting

```javascript
// Question 9
console.log(x);
var x = 5;
console.log(x);

// Answer:
// undefined (hoisted, but not initialized)
// 5
```

```javascript
// Question 10
var x = 1;
function foo() {
  console.log(x);
  var x = 2;
  console.log(x);
}
foo();

// Answer:
// undefined (local x is hoisted, shadows global x)
// 2
```

```javascript
// Question 11
console.log(foo);
console.log(bar);

function foo() { return 1; }
var bar = function() { return 2; };

// Answer:
// [Function: foo] (function declaration hoisted entirely)
// undefined (var bar hoisted, but assignment not)
```

### 2.2. let/const TDZ

```javascript
// Question 12
let x = 1;
{
  console.log(x);
  let x = 2;
}

// Answer: ReferenceError: Cannot access 'x' before initialization
// Inner x is in TDZ (Temporal Dead Zone)
```

```javascript
// Question 13
console.log(typeof undeclaredVar);
console.log(typeof declaredLater);
let declaredLater = 1;

// Answer:
// "undefined" (typeof undeclared variable is safe)
// ReferenceError (let is in TDZ, not safe even with typeof)
```

---

## 3. Closure Tricks

### 3.1. Loop with var

```javascript
// Question 14
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// Answer: 3, 3, 3
// All callbacks share the same i, which is 3 after loop
```

```javascript
// Question 15
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// Answer: 0, 1, 2
// let creates new binding per iteration
```

```javascript
// Question 16
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}

// Answer: 0, 1, 2
// IIFE captures each i value
```

### 3.2. Closure Scope

```javascript
// Question 17
function outer() {
  var x = 10;
  function inner() {
    console.log(x);
  }
  x = 20;
  return inner;
}

outer()();

// Answer: 20
// Closure captures variable reference, not value at creation time
```

```javascript
// Question 18
var funcs = [];
for (var i = 0; i < 3; i++) {
  funcs[i] = function() { return i; };
}
console.log(funcs[0]());
console.log(funcs[1]());
console.log(funcs[2]());

// Answer: 3, 3, 3
// All functions share same i
```

---

## 4. `this` Binding Tricks

### 4.1. Method Context

```javascript
// Question 19
const obj = {
  name: 'John',
  greet: function() {
    console.log(this.name);
  }
};

obj.greet();
const greet = obj.greet;
greet();

// Answer:
// "John" (called on obj)
// undefined (called without context, this = undefined in strict mode)
```

```javascript
// Question 20
const obj = {
  name: 'John',
  greet: function() {
    console.log(this.name);
  },
  greetArrow: () => {
    console.log(this.name);
  }
};

obj.greet();
obj.greetArrow();

// Answer:
// "John"
// undefined (arrow function, this = global/window)
```

### 4.2. Nested Functions

```javascript
// Question 21
const obj = {
  name: 'John',
  greet: function() {
    console.log('1:', this.name);

    function inner() {
      console.log('2:', this.name);
    }
    inner();

    const arrowInner = () => {
      console.log('3:', this.name);
    };
    arrowInner();
  }
};

obj.greet();

// Answer:
// 1: John     (greet called on obj)
// 2: undefined (inner called without context)
// 3: John     (arrow inherits this from greet)
```

```javascript
// Question 22
function Person(name) {
  this.name = name;
  this.sayName = function() {
    console.log(this.name);
  };
  this.sayNameArrow = () => {
    console.log(this.name);
  };
}

const person = new Person('John');
const sayName = person.sayName;
const sayNameArrow = person.sayNameArrow;

person.sayName();     // ?
sayName();            // ?
person.sayNameArrow(); // ?
sayNameArrow();       // ?

// Answer:
// "John"     (called on person)
// undefined  (lost context)
// "John"     (arrow bound to person)
// "John"     (arrow still bound to person!)
```

### 4.3. call/apply/bind

```javascript
// Question 23
const obj1 = { value: 1 };
const obj2 = { value: 2 };

function getValue() {
  return this.value;
}

const boundGetValue = getValue.bind(obj1);
console.log(boundGetValue.call(obj2));

// Answer: 1
// bind() creates permanently bound function
// call() cannot override bind()
```

---

## 5. Event Loop Tricks

### 5.1. Microtasks vs Macrotasks

```javascript
// Question 24
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// Answer: 1, 4, 3, 2
// Sync → Microtasks → Macrotasks
```

```javascript
// Question 25
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => console.log('5'), 0);
});

console.log('6');

// Answer: 1, 6, 4, 2, 3, 5
// Step by step:
// 1, 6: sync
// 4: microtask (adds setTimeout '5')
// 2: macrotask (adds Promise '3')
// 3: microtask (before next macrotask)
// 5: macrotask
```

### 5.2. async/await

```javascript
// Question 26
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => console.log('setTimeout'), 0);

async1();

new Promise(resolve => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// Answer:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout

// Key: code after await becomes microtask
```

```javascript
// Question 27
console.log('start');

setTimeout(() => console.log('timeout1'), 0);
setTimeout(() => console.log('timeout2'), 0);

Promise.resolve()
  .then(() => {
    console.log('promise1');
    return Promise.resolve();
  })
  .then(() => console.log('promise2'));

Promise.resolve().then(() => console.log('promise3'));

console.log('end');

// Answer: start, end, promise1, promise3, promise2, timeout1, timeout2
// Note: promise2 comes after promise3 because returning Promise.resolve()
// adds extra microtask tick
```

---

## 6. Object/Array Tricks

### 6.1. Reference vs Value

```javascript
// Question 28
let a = [1, 2, 3];
let b = a;
b.push(4);
console.log(a);
console.log(a === b);

// Answer:
// [1, 2, 3, 4] (same reference)
// true
```

```javascript
// Question 29
let a = [1, 2, 3];
let b = [...a];
b.push(4);
console.log(a);
console.log(a === b);

// Answer:
// [1, 2, 3] (different reference)
// false
```

```javascript
// Question 30
const obj = { a: 1 };
Object.freeze(obj);
obj.a = 2;
obj.b = 3;
console.log(obj);

// Answer: { a: 1 }
// freeze prevents modifications (silent fail in non-strict mode)
```

### 6.2. Array Sorting

```javascript
// Question 31
console.log([10, 2, 30, 4].sort());

// Answer: [10, 2, 30, 4] → [10, 2, 30, 4].sort() = [10, 2, 30, 4]?
// NO! Answer: [10, 2, 30, 4]
// Actually: [10, 2, 30, 4]

// Wait, let me recalculate:
// Default sort converts to strings: "10", "2", "30", "4"
// Sorted: "10" < "2" < "30" < "4" (string comparison)
// Answer: [10, 2, 30, 4] → [10, 2, 30, 4]

// Hmm, that's wrong too. Let me be precise:
// "10" vs "2": "1" < "2", so "10" comes first
// Answer: [10, 2, 30, 4]

// Let me verify: [10, 2, 30, 4].sort()
// String comparison: "10", "2", "30", "4"
// "10" < "2" (because "1" < "2")
// "2" < "30" (because "2" < "3")
// "30" < "4" (because "3" < "4")
// Answer: [10, 2, 30, 4]

// Answer: [10, 2, 30, 4]
// Default sort is lexicographic (string comparison)
// "10" < "2" because "1" < "2"
```

```javascript
// Question 32
const arr = [1, 2, 3];
arr[10] = 10;
console.log(arr.length);
console.log(arr);

// Answer:
// 11
// [1, 2, 3, <7 empty items>, 10]
// Sparse array with empty slots
```

### 6.3. Object Keys

```javascript
// Question 33
const obj = {
  1: 'a',
  2: 'b',
  '1': 'c'
};
console.log(obj);

// Answer: { '1': 'c', '2': 'b' }
// Object keys are strings, 1 and '1' are same key
```

```javascript
// Question 34
const a = {};
const b = { key: 'b' };
const c = { key: 'c' };

a[b] = 123;
a[c] = 456;

console.log(a[b]);

// Answer: 456
// Objects as keys are converted to string "[object Object]"
// Both b and c become same key
```

---

## 7. Function Tricks

### 7.1. Default Parameters

```javascript
// Question 35
function foo(a = b, b = 1) {
  console.log(a, b);
}
foo();

// Answer: ReferenceError
// Default params are evaluated left-to-right
// 'b' is not defined when evaluating 'a = b'
```

```javascript
// Question 36
let x = 1;
function foo(x = x) {
  console.log(x);
}
foo();

// Answer: ReferenceError
// Parameter x shadows outer x, but references itself before initialization
```

### 7.2. Arguments

```javascript
// Question 37
function foo(a, b, c) {
  console.log(arguments.length);
}
foo(1);

// Answer: 1
// arguments.length = number of arguments passed, not parameters defined
```

```javascript
// Question 38
const foo = (...args) => {
  console.log(arguments);
};
foo(1, 2, 3);

// Answer: ReferenceError (in module) or global arguments object
// Arrow functions don't have their own 'arguments'
```

---

## 8. Miscellaneous Tricks

### 8.1. Comma Operator

```javascript
// Question 39
console.log((1, 2, 3));

// Answer: 3
// Comma operator evaluates all expressions, returns last one
```

```javascript
// Question 40
let x = (1, 2, 3);
console.log(x);

// Answer: 3
```

### 8.2. Labelled Statements

```javascript
// Question 41
foo: {
  console.log('a');
  break foo;
  console.log('b');
}
console.log('c');

// Answer: a, c
// break foo exits the labelled block
```

### 8.3. Weird JavaScript

```javascript
// Question 42
console.log((!+[]+[]+![]).length);

// Answer: 9
// !+[] → !0 → true
// true + [] → "true"
// "true" + ![] → "true" + false → "truefalse"
// "truefalse".length → 9
```

```javascript
// Question 43
console.log([] == ![]);  // ?
console.log([] == []);   // ?
console.log({} == {});   // ?

// Answer:
// true  → ![] = false, [] → 0, false → 0, 0 == 0
// false → different references
// false → different references
```

```javascript
// Question 44
console.log(0.1 + 0.2 == 0.3);
console.log(0.1 + 0.2);

// Answer:
// false
// 0.30000000000000004

// Floating point precision issue
```

```javascript
// Question 45
console.log(Math.max());
console.log(Math.min());

// Answer:
// -Infinity (identity element for max)
// Infinity (identity element for min)
```

---

## Quick Reference: Common Coercion Rules

```
String + anything = String concatenation
Number - String = Number (string coerced to number)

[] → "" → 0
{} → "[object Object]" → NaN
null → 0 (in numeric context)
undefined → NaN (in numeric context)
true → 1
false → 0

=== : No coercion
==  : Coercion allowed

typeof null === "object" (historical bug)
typeof NaN === "number"
NaN !== NaN
```

---

## Tips for Answering Trick Questions

1. **Don't panic** - Take time to trace through step by step
2. **Know coercion rules** - String concatenation vs numeric operations
3. **Understand operator precedence** - Unary `+` and `-` have high precedence
4. **Remember `this` rules** - How function is called matters
5. **Event loop order** - Sync → Microtasks → ONE Macrotask → Repeat
6. **Reference vs Value** - Objects/Arrays are references

Good luck! 🍀
