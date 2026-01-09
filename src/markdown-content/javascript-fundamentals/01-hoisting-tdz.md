# Hoisting và Temporal Dead Zone (TDZ)

## 1. Hoisting Basics

Hoisting là cơ chế JavaScript di chuyển declarations (khai báo) lên đầu scope trước khi code được execute.

### Variable Hoisting

```javascript
// var hoisting
console.log(x); // undefined (không phải ReferenceError)
var x = 5;

// Tương đương với:
var x; // Declaration được hoist
console.log(x); // undefined
x = 5; // Assignment ở vị trí gốc

// let và const hoisting
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;

console.log(z); // ReferenceError: Cannot access 'z' before initialization
const z = 10;
```

### Function Hoisting

```javascript
// Function declaration - fully hoisted
sayHello(); // "Hello!" - hoạt động!

function sayHello() {
  console.log("Hello!");
}

// Function expression - không hoisted
sayHi(); // TypeError: sayHi is not a function

var sayHi = function() {
  console.log("Hi!");
};

// Arrow function - không hoisted
sayHey(); // ReferenceError: Cannot access 'sayHey' before initialization

const sayHey = () => {
  console.log("Hey!");
};
```

### Hoisting Order

```javascript
// Priority: function declarations > variable declarations
console.log(typeof myFunc); // "function"
console.log(typeof myVar); // "undefined"

function myFunc() {
  return "function";
}

var myVar = "variable";

// Function declarations override variable declarations
var myFunc;
function myFunc() {
  return "function";
}
console.log(typeof myFunc); // "function" (không phải "undefined")
```

## 2. Temporal Dead Zone (TDZ)

TDZ là vùng từ đầu scope đến khi variable được khởi tạo, nơi variable không thể được access.

### TDZ với let và const

```javascript
// TDZ starts here
console.log(a); // ReferenceError: Cannot access 'a' before initialization
console.log(b); // ReferenceError: Cannot access 'b' before initialization

let a = 1; // TDZ ends here
const b = 2; // TDZ ends here

// TDZ với block scope
{
  // TDZ starts
  console.log(x); // ReferenceError
  let x = 10; // TDZ ends
  console.log(x); // 10
}

// TDZ với function parameters
function example(x = y, y = 2) {
  // x = y sẽ throw ReferenceError vì y chưa được khởi tạo
}
```

### TDZ Examples

```javascript
// Example 1: TDZ trong loop
for (let i = 0; i < 3; i++) {
  // Mỗi iteration có scope riêng, i trong TDZ cho đến khi loop body execute
  setTimeout(() => {
    console.log(i); // 0, 1, 2 (không phải 3, 3, 3)
  }, 100);
}

// So sánh với var
for (var j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log(j); // 3, 3, 3
  }, 100);
}

// Example 2: TDZ với class
class MyClass {
  // TDZ cho class body
  method() {
    return this.field; // OK, vì this.field được access sau khi class được khởi tạo
  }
  
  field = this.method(); // TDZ: this chưa được khởi tạo hoàn toàn
}

// Example 3: TDZ với default parameters
function example(a = b, b = 2) {
  return a + b;
}
example(); // ReferenceError: Cannot access 'b' before initialization
```

## 3. Advanced Hoisting

### Function vs Variable Hoisting

```javascript
// Case 1: Function declaration
console.log(foo); // [Function: foo]
function foo() {
  return "I'm a function";
}

// Case 2: Variable với function
console.log(bar); // undefined
var bar = function() {
  return "I'm a variable";
};

// Case 3: Same name
console.log(baz); // [Function: baz] - function wins
var baz = "I'm a variable";
function baz() {
  return "I'm a function";
}

// Case 4: Function sau variable assignment
console.log(qux); // undefined
var qux = "I'm a variable";
function qux() {
  return "I'm a function";
}
// Function declaration được hoist trước, nhưng assignment override nó
```

### Block Scope Hoisting

```javascript
// var - function scope
function example() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 (accessible)
}

// let/const - block scope
function example2() {
  if (true) {
    let y = 1;
    const z = 2;
  }
  console.log(y); // ReferenceError
  console.log(z); // ReferenceError
}

// Hoisting trong block
{
  console.log(blockVar); // undefined (hoisted nhưng trong block)
  var blockVar = "var";
  
  console.log(blockLet); // ReferenceError (TDZ)
  let blockLet = "let";
}
```

### Class Hoisting

```javascript
// Class declarations - không hoisted
const instance = new MyClass(); // ReferenceError

class MyClass {
  constructor() {
    this.name = "MyClass";
  }
}

// Class expressions - không hoisted
const instance2 = new MyClass2(); // ReferenceError

const MyClass2 = class {
  constructor() {
    this.name = "MyClass2";
  }
};
```

## 4. Practical Examples

### Common Pitfalls

```javascript
// ❌ Unexpected behavior với var
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 3, 3, 3
  }, 100);
}

// ✅ Use let
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 0, 1, 2
  }, 100);
}

// ❌ Function expression không hoisted
doSomething(); // TypeError

var doSomething = function() {
  console.log("Doing something");
};

// ✅ Function declaration hoisted
doSomethingElse(); // Works!

function doSomethingElse() {
  console.log("Doing something else");
}

// ❌ TDZ với const/let
function example() {
  console.log(value); // ReferenceError
  const value = 10;
}

// ✅ Declare trước khi dùng
function example() {
  const value = 10;
  console.log(value); // 10
}
```

### Module Pattern với Hoisting

```javascript
// IIFE pattern
(function() {
  // Private scope
  var privateVar = "private";
  
  function privateFunction() {
    return privateVar;
  }
  
  // Public API
  window.MyModule = {
    getPrivate: privateFunction
  };
})();

// Function declarations hoisted trong IIFE
(function() {
  publicFunction(); // Works!
  
  function publicFunction() {
    return "Public";
  }
})();
```

## 5. Best Practices

### Avoid Hoisting Issues

```javascript
// ✅ Declare variables ở đầu scope
function goodPractice() {
  let x;
  let y;
  const z = 10;
  
  // Use variables
  x = 5;
  y = x + z;
  return y;
}

// ✅ Use const/let thay vì var
// ❌ var x = 1;
// ✅ const x = 1; hoặc let x = 1;

// ✅ Function declarations cho named functions
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Function expressions cho anonymous/callback functions
const handleClick = function() {
  console.log("Clicked");
};

// ✅ Arrow functions cho callbacks
items.map(item => item.price);
```

### TDZ Best Practices

```javascript
// ✅ Initialize variables trước khi dùng
function processData() {
  const data = fetchData(); // Initialize first
  const processed = transformData(data); // Then use
  return processed;
}

// ✅ Default parameters order
function createUser(name, age = 18, city = "Unknown") {
  // Parameters được evaluate từ trái sang phải
  return { name, age, city };
}

// ❌ TDZ với default parameters
function badExample(a = b, b = 2) {
  return a + b; // ReferenceError
}

// ✅ Correct order
function goodExample(a = 2, b = a) {
  return a + b; // Works: a = 2, b = 2
}
```

## 6. Interview Questions

1. **Hoisting là gì?**
   - Cơ chế JavaScript di chuyển declarations lên đầu scope
   - var và function declarations được hoist
   - let/const được hoist nhưng trong TDZ

2. **Sự khác biệt giữa var, let, const hoisting?**
   - var: hoisted, initialized với undefined
   - let/const: hoisted nhưng trong TDZ cho đến khi khởi tạo

3. **TDZ là gì?**
   - Temporal Dead Zone: vùng từ đầu scope đến khi variable được khởi tạo
   - Access variable trong TDZ sẽ throw ReferenceError

4. **Function declaration vs function expression hoisting?**
   - Declaration: fully hoisted, có thể gọi trước khi declare
   - Expression: không hoisted, chỉ variable declaration được hoist

5. **Tại sao let trong loop hoạt động khác var?**
   - let tạo scope riêng cho mỗi iteration
   - var chia sẻ cùng scope, closure capture giá trị cuối cùng

6. **Class hoisting?**
   - Class declarations không được hoisted
   - Phải declare trước khi sử dụng

7. **Hoisting order?**
   - Function declarations > Variable declarations
   - Function declarations override variable declarations cùng tên

