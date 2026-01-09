# Logical Operators & Template String

## 1. Logical Operators

### AND (&&)

```javascript
// Basic usage
true && true;   // true
true && false;  // false
false && true;  // false
false && false; // false

// Short-circuit evaluation
// Nếu left side là falsy, return left side (không evaluate right)
false && console.log('not executed'); // false, không log
true && console.log('executed'); // 'executed', return undefined

// Return value: return last truthy value hoặc first falsy value
const result1 = 'hello' && 'world'; // 'world'
const result2 = null && 'world'; // null
const result3 = 0 && 'world'; // 0
const result4 = '' && 'world'; // ''
```

### OR (||)

```javascript
// Basic usage
true || true;   // true
true || false;  // true
false || true;  // true
false || false; // false

// Short-circuit evaluation
// Nếu left side là truthy, return left side (không evaluate right)
true || console.log('not executed'); // true, không log
false || console.log('executed'); // 'executed', return undefined

// Return value: return first truthy value hoặc last falsy value
const result1 = 'hello' || 'world'; // 'hello'
const result2 = null || 'world'; // 'world'
const result3 = 0 || '' || 'default'; // 'default'
```

### NOT (!)

```javascript
!true;  // false
!false; // true
!0;     // true
!'';    // true
!null;  // true
!undefined; // true

// Double negation
!!'hello'; // true (convert to boolean)
!!0;       // false
```

### Nullish Coalescing (??) - ES2020

```javascript
// Chỉ return right side nếu left side là null hoặc undefined
const result1 = null ?? 'default'; // 'default'
const result2 = undefined ?? 'default'; // 'default'
const result3 = 0 ?? 'default'; // 0 (không phải 'default'!)
const result4 = '' ?? 'default'; // '' (không phải 'default'!)
const result5 = false ?? 'default'; // false

// Khác với ||
const value1 = 0 || 'default'; // 'default'
const value2 = 0 ?? 'default'; // 0
```

### Logical Assignment Operators - ES2021

```javascript
// &&= (Logical AND assignment)
let a = 1;
a &&= 2; // a = 2 (vì a là truthy)
// Tương đương: a = a && 2

let b = 0;
b &&= 2; // b = 0 (vì b là falsy)

// ||= (Logical OR assignment)
let c = null;
c ||= 'default'; // c = 'default'
// Tương đương: c = c || 'default'

let d = 'value';
d ||= 'default'; // d = 'value'

// ??= (Nullish coalescing assignment)
let e = null;
e ??= 'default'; // e = 'default'
// Tương đương: e = e ?? 'default'

let f = 0;
f ??= 'default'; // f = 0 (không đổi)
```

## 2. Practical Patterns

### Conditional Rendering (React)

```javascript
// && pattern
function UserProfile({ user }) {
  return (
    <div>
      {user && <h1>{user.name}</h1>}
      {user?.email && <p>{user.email}</p>}
    </div>
  );
}

// Ternary
function Greeting({ isLoggedIn }) {
  return isLoggedIn ? <Welcome /> : <Login />;
}
```

### Default Values

```javascript
// || pattern (cẩn thận với falsy values)
function greet(name) {
  const displayName = name || 'Guest';
  return `Hello, ${displayName}!`;
}
greet('John'); // "Hello, John!"
greet(''); // "Hello, Guest!" (có thể không mong muốn)
greet(0); // "Hello, Guest!" (có thể không mong muốn)

// ?? pattern (chỉ null/undefined)
function greet(name) {
  const displayName = name ?? 'Guest';
  return `Hello, ${displayName}!`;
}
greet(''); // "Hello, !" (giữ empty string)
greet(0); // "Hello, 0!" (giữ 0)

// Function parameters
function createUser(name, age) {
  return {
    name: name ?? 'Anonymous',
    age: age ?? 18
  };
}
```

### Optional Chaining với Logical Operators

```javascript
// Safe property access
const user = { profile: { name: 'John' } };
const name = user?.profile?.name || 'Guest';

// Method call
const result = api?.getData?.() || [];

// Array access
const firstItem = arr?.[0] ?? null;
```

### Guard Clauses

```javascript
// Early return pattern
function processUser(user) {
  if (!user) return null;
  if (!user.email) return null;
  if (!user.isActive) return null;
  
  // Process user...
  return user;
}

// Với &&
function processUser(user) {
  return user && user.email && user.isActive && doProcess(user);
}
```

## 3. Template Strings (Template Literals)

### Basic Syntax

```javascript
// Single quotes, double quotes
const str1 = 'Hello';
const str2 = "World";

// Template literals (backticks)
const str3 = `Hello World`;
const name = 'John';
const greeting = `Hello, ${name}!`; // "Hello, John!"

// Multi-line strings
const multiLine = `This is
a multi-line
string`;

// Expression interpolation
const a = 5;
const b = 10;
const sum = `The sum is ${a + b}`; // "The sum is 15"

// Function calls
function getGreeting() {
  return 'Hello';
}
const msg = `${getGreeting()}, World!`; // "Hello, World!"
```

### Tagged Templates

```javascript
// Tag function
function tag(strings, ...values) {
  console.log(strings); // Array of string parts
  console.log(values);  // Array of interpolated values
  return 'Custom result';
}

const name = 'John';
const age = 30;
const result = tag`Hello ${name}, you are ${age} years old.`;
// strings: ['Hello ', ', you are ', ' years old.']
// values: ['John', 30]

// Practical example: HTML escaping
function htmlEscape(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] != null 
      ? String(values[i]).replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
      : '';
    return result + str + value;
  }, '');
}

const userInput = '<script>alert("xss")</script>';
const safe = htmlEscape`<div>${userInput}</div>`;
// "<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>"

// Styled components pattern
function styled(strings, ...values) {
  return (props) => {
    const styles = strings.reduce((result, str, i) => {
      return result + str + (values[i] ? values[i](props) : '');
    }, '');
    return `<div style="${styles}">${props.children}</div>`;
  };
}
```

### Advanced Usage

```javascript
// Nested template literals
const items = ['apple', 'banana', 'orange'];
const list = `
  <ul>
    ${items.map(item => `<li>${item}</li>`).join('')}
  </ul>
`;

// Conditional in template
const isAdmin = true;
const message = `
  Welcome, ${isAdmin ? 'Admin' : 'User'}!
  ${isAdmin ? '<button>Delete</button>' : ''}
`;

// Complex expressions
const user = { name: 'John', age: 30 };
const info = `
  Name: ${user?.name ?? 'Unknown'}
  Age: ${user?.age ?? 'N/A'}
  Status: ${user?.isActive ? 'Active' : 'Inactive'}
`;

// SQL-like queries (example)
function query(strings, ...values) {
  const sql = strings.reduce((result, str, i) => {
    return result + str + (values[i] != null ? `$${i + 1}` : '');
  }, '');
  return { sql, params: values };
}

const userId = 123;
const { sql, params } = query`SELECT * FROM users WHERE id = ${userId}`;
// sql: "SELECT * FROM users WHERE id = $1"
// params: [123]
```

## 4. Common Patterns

### String Formatting

```javascript
// Currency
const price = 99.99;
const formatted = `Price: $${price.toFixed(2)}`; // "Price: $99.99"

// Dates
const date = new Date();
const dateStr = `Today is ${date.toLocaleDateString()}`;

// URLs
const baseUrl = 'https://api.example.com';
const endpoint = 'users';
const url = `${baseUrl}/${endpoint}`;
```

### Dynamic Class Names (React)

```javascript
function Button({ primary, disabled, className }) {
  const classes = `
    btn
    ${primary ? 'btn-primary' : 'btn-secondary'}
    ${disabled ? 'btn-disabled' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');
  
  return <button className={classes}>Click</button>;
}
```

### API Response Formatting

```javascript
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  
  return `
    User Profile:
    - Name: ${user.name}
    - Email: ${user.email}
    - Joined: ${new Date(user.createdAt).toLocaleDateString()}
  `;
}
```

## 5. Common Pitfalls

```javascript
// ❌ Logical operator precedence
const result = true || false && false;
// Expected: false, Actual: true
// Vì && có precedence cao hơn ||

// ✅ Use parentheses
const result = (true || false) && false; // false

// ❌ || với falsy values
const count = 0;
const display = count || 'No items'; // "No items" (không mong muốn)

// ✅ Use ??
const display = count ?? 'No items'; // 0

// ❌ Template literal với objects
const obj = { name: 'John' };
const str = `${obj}`; // "[object Object]"

// ✅ Stringify
const str = `${JSON.stringify(obj)}`;

// ❌ Nested template literals readability
const complex = `Outer ${`Inner ${value}`}`; // Khó đọc

// ✅ Break into variables
const inner = `Inner ${value}`;
const complex = `Outer ${inner}`;
```

## 6. Interview Questions

1. **Sự khác biệt giữa `||` và `??`?**
   - `||`: return right nếu left là falsy (0, '', false, null, undefined)
   - `??`: chỉ return right nếu left là null hoặc undefined

2. **Khi nào dùng `&&` vs ternary?**
   - `&&`: simple conditional rendering, guard clauses
   - Ternary: khi cần else case rõ ràng

3. **Template literal performance?**
   - Tương đương string concatenation, nhưng dễ đọc hơn
   - Tagged templates có overhead nhỏ

4. **Có thể dùng template literal cho SQL queries không?**
   - Có, nhưng cần sanitize để tránh SQL injection
   - Nên dùng parameterized queries

5. **Logical operator return values?**
   - `&&`: return last truthy hoặc first falsy
   - `||`: return first truthy hoặc last falsy
   - `??`: return left nếu không null/undefined, ngược lại return right

