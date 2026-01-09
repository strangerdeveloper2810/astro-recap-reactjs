# Destructuring, Rest Parameter, Spread Syntax

## 1. Destructuring

### Array Destructuring

```javascript
// Basic
const arr = [1, 2, 3];
const [a, b, c] = arr;
console.log(a, b, c); // 1 2 3

// Skip elements
const [first, , third] = arr;
console.log(first, third); // 1 3

// Default values
const [x = 10, y = 20] = [1];
console.log(x, y); // 1 20

// Rest trong destructuring
const [head, ...tail] = [1, 2, 3, 4];
console.log(head); // 1
console.log(tail); // [2, 3, 4]

// Swap variables
let a = 1,
  b = 2;
[a, b] = [b, a];
console.log(a, b); // 2 1

// Nested destructuring
const nested = [1, [2, 3], 4];
const [first, [second, third], fourth] = nested;
```

### Object Destructuring

```javascript
// Basic
const user = { name: "John", age: 30, city: "NYC" };
const { name, age } = user;
console.log(name, age); // John 30

// Rename variables
const { name: userName, age: userAge } = user;
console.log(userName, userAge); // John 30

// Default values
const { name, age, country = "USA" } = user;
console.log(country); // USA

// Nested destructuring
const user = {
  name: "John",
  address: {
    city: "NYC",
    zip: "10001",
  },
};
const {
  address: { city, zip },
} = user;
console.log(city, zip); // NYC 10001

// Rest trong object destructuring
const { name, ...rest } = user;
console.log(rest); // { age: 30, city: 'NYC' }

// Destructuring trong function parameters
function greet({ name, age }) {
  return `Hello, ${name}! You are ${age} years old.`;
}
greet(user); // "Hello, John! You are 30 years old."
```

## 2. Rest Parameter

Rest parameter cho phép function nhận số lượng arguments không xác định.

```javascript
// Rest parameter (phải là parameter cuối cùng)
function sum(...numbers) {
  return numbers.reduce((acc, num) => acc + num, 0);
}
sum(1, 2, 3, 4); // 10

// Rest với các parameters khác
function greet(greeting, ...names) {
  return names.map((name) => `${greeting}, ${name}!`).join(" ");
}
greet("Hello", "John", "Jane", "Bob");
// "Hello, John! Hello, Jane! Hello, Bob!"

// Rest trong arrow functions
const multiply = (...nums) => nums.reduce((acc, n) => acc * n, 1);
multiply(2, 3, 4); // 24

// Rest vs arguments object
// arguments là array-like, không phải real array
function oldWay() {
  const args = Array.from(arguments);
  // hoặc [...arguments]
}

// Rest là real array
function newWay(...args) {
  // args là real array, có thể dùng .map(), .filter(), etc.
}
```

## 3. Spread Syntax

### Array Spread

```javascript
// Copy array
const arr1 = [1, 2, 3];
const arr2 = [...arr1]; // Shallow copy
arr2.push(4);
console.log(arr1); // [1, 2, 3]
console.log(arr2); // [1, 2, 3, 4]

// Concatenate arrays
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4]

// Add elements
const newArr = [0, ...arr1, 5]; // [0, 1, 2, 3, 4, 5]

// Convert array-like to array
const nodeList = document.querySelectorAll("div");
const array = [...nodeList]; // Real array

// Spread trong function calls
const numbers = [1, 2, 3];
Math.max(...numbers); // 3
// Tương đương: Math.max(1, 2, 3)
```

### Object Spread

```javascript
// Copy object (shallow)
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1 }; // { a: 1, b: 2 }

// Merge objects
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3, d: 4 }

// Override properties
const defaults = { theme: "light", lang: "en" };
const user = { theme: "dark" };
const config = { ...defaults, ...user }; // { theme: 'dark', lang: 'en' }

// Add properties
const user = { name: "John" };
const userWithAge = { ...user, age: 30 }; // { name: 'John', age: 30 }

// Nested spread (shallow copy)
const nested = { a: { b: 1 } };
const copied = { ...nested };
copied.a.b = 2;
console.log(nested.a.b); // 2 (vì shallow copy)
```

## 4. Practical Examples

### React/Component Pattern

```javascript
// Props destructuring
function UserCard({ name, age, email, ...otherProps }) {
  return (
    <div {...otherProps}>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Email: {email}</p>
    </div>
  );
}

// State update với spread
const [state, setState] = useState({ count: 0, name: "John" });
setState({ ...state, count: state.count + 1 });
```

### API Response Handling

```javascript
// Destructure API response
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const { data: user, error, status } = await response.json();

  if (error) {
    throw new Error(error);
  }

  const { name, email, ...metadata } = user;
  return { name, email, metadata };
}
```

### Configuration Merging

```javascript
// Merge configs với defaults
const defaultConfig = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
};

function createApiClient(userConfig) {
  const config = {
    ...defaultConfig,
    ...userConfig,
    headers: {
      ...defaultConfig.headers,
      ...userConfig.headers,
    },
  };
  return config;
}
```

## 5. Common Pitfalls

```javascript
// ❌ Shallow copy với nested objects
const original = { a: { b: 1 } };
const copy = { ...original };
copy.a.b = 2; // original.a.b cũng bị thay đổi!

// ✅ Deep copy (cần cẩn thận với circular references)
const deepCopy = JSON.parse(JSON.stringify(original));
// hoặc dùng structuredClone() (modern browsers)

// ❌ Rest parameter không phải là last parameter
function wrong(...rest, last) {} // SyntaxError

// ✅ Rest phải là cuối cùng
function correct(first, ...rest) {}

// ❌ Destructuring undefined/null
const { prop } = undefined; // TypeError

// ✅ Default value
const { prop = 'default' } = obj || {};
```

## 6. Interview Questions

1. **Sự khác biệt giữa Rest và Spread?**

   - Rest: thu thập elements vào array/object
   - Spread: expand array/object thành individual elements

2. **Shallow copy vs Deep copy với spread?**

   - Spread chỉ copy 1 level, nested objects vẫn reference

3. **Khi nào dùng destructuring?**

   - Function parameters
   - API responses
   - Component props
   - Configuration objects

4. **Performance của spread?**
   - Tạo new array/object, có overhead
   - Với large arrays, có thể dùng slice() hoặc structuredClone()
