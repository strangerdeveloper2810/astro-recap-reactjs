# Type Coercion

## 1. Type Coercion Basics

Type coercion là quá trình tự động convert một type sang type khác.

### Implicit vs Explicit Coercion

```javascript
// Implicit Coercion (tự động)
const result = "5" + 3; // "53" (number -> string)
const result2 = "5" - 3; // 2 (string -> number)
const result3 = "5" * "2"; // 10 (both -> number)

// Explicit Coercion (manual)
const num = Number("5"); // 5
const str = String(5); // "5"
const bool = Boolean(1); // true
```

### Coercion Rules

```javascript
// To String
String(123); // "123"
String(true); // "true"
String(null); // "null"
String(undefined); // "undefined"
String({}); // "[object Object]"
String([]); // ""

// To Number
Number("123"); // 123
Number(""); // 0
Number("  "); // 0
Number("abc"); // NaN
Number(true); // 1
Number(false); // 0
Number(null); // 0
Number(undefined); // NaN

// To Boolean
Boolean(1); // true
Boolean(0); // false
Boolean(""); // false
Boolean(" "); // true
Boolean([]); // true
Boolean({}); // true
Boolean(null); // false
Boolean(undefined); // false
Boolean(NaN); // false
```

## 2. String Coercion

### When String Coercion Happens

```javascript
// + operator với string
"5" + 3; // "53"
3 + "5"; // "35"
"" + 5; // "5"

// Template literals
const num = 5;
`Number: ${num}`; // "Number: 5"

// Array join
[1, 2, 3].join(); // "1,2,3"

// Object toString
({}).toString(); // "[object Object]"
[1, 2, 3].toString(); // "1,2,3"
```

### toString() Method

```javascript
// Numbers
(123).toString(); // "123"
(123).toString(2); // "1111011" (binary)
(123).toString(16); // "7b" (hexadecimal)

// Objects
const obj = { name: "John" };
obj.toString(); // "[object Object]"

// Custom toString
const person = {
  name: "John",
  age: 30,
  toString() {
    return `${this.name} (${this.age})`;
  }
};
String(person); // "John (30)"
```

## 3. Number Coercion

### When Number Coercion Happens

```javascript
// - * / % operators
"5" - 3; // 2
"5" * "2"; // 10
"10" / "2"; // 5
"10" % "3"; // 1

// Unary + operator
+"5"; // 5
+true; // 1
+false; // 0
+""; // 0
+"abc"; // NaN

// Comparison operators (>, <, >=, <=)
"5" > 3; // true
"10" < "2"; // true (string comparison!)
"10" < 2; // false (number comparison)

// parseInt và parseFloat
parseInt("123"); // 123
parseInt("123abc"); // 123
parseInt("abc123"); // NaN
parseFloat("12.34"); // 12.34
```

### Number() vs parseInt()

```javascript
// Number() - strict conversion
Number("123"); // 123
Number("123.45"); // 123.45
Number("123abc"); // NaN
Number(""); // 0
Number("  "); // 0

// parseInt() - parse until invalid
parseInt("123"); // 123
parseInt("123.45"); // 123
parseInt("123abc"); // 123
parseInt(""); // NaN
parseInt("  "); // NaN (whitespace only)

// parseFloat()
parseFloat("123.45"); // 123.45
parseFloat("123.45abc"); // 123.45
```

## 4. Boolean Coercion

### Falsy Values

```javascript
// Falsy values (coerce to false)
Boolean(false); // false
Boolean(0); // false
Boolean(-0); // false
Boolean(0n); // false (BigInt)
Boolean(""); // false
Boolean(null); // false
Boolean(undefined); // false
Boolean(NaN); // false

// Truthy values (everything else)
Boolean(true); // true
Boolean(1); // true
Boolean(-1); // true
Boolean("0"); // true
Boolean("false"); // true
Boolean([]); // true
Boolean({}); // true
Boolean(function() {}); // true
```

### When Boolean Coercion Happens

```javascript
// if statements
if ("") {
  // Not executed
}

if ([]) {
  // Executed (array is truthy)
}

// Logical operators
"hello" && "world"; // "world" (truthy)
"" && "world"; // "" (falsy)
"hello" || "world"; // "hello" (first truthy)
"" || "world"; // "world" (first falsy, return second)

// Ternary operator
const result = "" ? "truthy" : "falsy"; // "falsy"

// Double negation
!!"hello"; // true
!!""; // false
```

## 5. Equality Coercion

### == vs ===

```javascript
// == (loose equality) - allows coercion
"5" == 5; // true (string -> number)
5 == "5"; // true
true == 1; // true (boolean -> number)
false == 0; // true
"" == 0; // true (string -> number)
"" == false; // true
null == undefined; // true
null == 0; // false (special case)
undefined == 0; // false

// === (strict equality) - no coercion
"5" === 5; // false
5 === 5; // true
true === 1; // false
false === 0; // false
"" === 0; // false
null === undefined; // false

// Object comparison
{} == {}; // false (different references)
{} === {}; // false
const obj = {};
obj == obj; // true (same reference)
```

### Special Cases

```javascript
// null và undefined
null == undefined; // true
null === undefined; // false

// NaN
NaN == NaN; // false
NaN === NaN; // false
isNaN(NaN); // true
Number.isNaN(NaN); // true

// +0 và -0
+0 === -0; // true
Object.is(+0, -0); // false

// Array coercion
[] == 0; // true ([] -> "" -> 0)
[1] == 1; // true ([1] -> "1" -> 1)
[1, 2] == "1,2"; // true
```

## 6. Common Pitfalls

```javascript
// ❌ String concatenation với number
const result = "Total: " + 5 + 3; // "Total: 53" (không phải 8)

// ✅ Use parentheses
const result = "Total: " + (5 + 3); // "Total: 8"

// ❌ Comparison với ==
if (user.id == null) { // Có thể match 0 hoặc ""
  // Better: user.id === null || user.id === undefined
}

// ✅ Use ===
if (user.id === null || user.id === undefined) {
  // Or: if (user.id == null) // null == undefined
}

// ❌ Array/object truthiness
if ([]) {
  // Executed (array is truthy)
}

if (array.length) { // Better
  // Only if array has items
}

// ❌ Type coercion với +
const num = +"5"; // 5
const str = +"abc"; // NaN

// ✅ Validate trước
const num = Number("5");
if (!isNaN(num)) {
  // Use num
}
```

## 7. Best Practices

### Use Strict Equality

```javascript
// ✅ Always use ===
if (value === 5) { }
if (value !== null) { }

// ❌ Avoid ==
if (value == 5) { } // Có thể có unexpected behavior
```

### Explicit Conversion

```javascript
// ✅ Explicit conversion
const num = Number(input);
const str = String(value);
const bool = Boolean(value);

// ❌ Rely on implicit coercion
const num = +input; // Less clear
const str = "" + value; // Less clear
```

### Type Checking

```javascript
// ✅ Check types explicitly
if (typeof value === "number") {
  // Handle number
}

if (Array.isArray(value)) {
  // Handle array
}

// ❌ Rely on truthiness
if (value) {
  // value có thể là nhiều types
}
```

## 8. Interview Questions

1. **Type coercion là gì?**
   - Tự động convert type khi cần
   - Implicit (tự động) vs Explicit (manual)

2. **== vs ===?**
   - ==: loose equality, allows coercion
   - ===: strict equality, no coercion

3. **Falsy values?**
   - false, 0, -0, 0n, "", null, undefined, NaN

4. **String + number?**
   - + operator với string sẽ convert number thành string
   - "5" + 3 = "53"

5. **Number coercion với - * /?**
   - Các operators này convert operands thành numbers
   - "5" - 3 = 2

6. **null == undefined?**
   - true (special case)
   - null === undefined là false

7. **Best practices?**
   - Dùng === thay vì ==
   - Explicit conversion thay vì implicit
   - Check types explicitly

