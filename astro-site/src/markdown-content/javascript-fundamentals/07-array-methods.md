# Array Methods - Nâng cao

## 1. Iteration Methods

### forEach

```javascript
// forEach - execute function cho mỗi element
const numbers = [1, 2, 3, 4, 5];

numbers.forEach((num, index, array) => {
  console.log(num, index);
});

// Side effects
const items = [];
numbers.forEach(num => {
  items.push(num * 2);
});

// Không return value (undefined)
const result = numbers.forEach(num => num * 2);
console.log(result); // undefined

// Không thể break/continue
// Use for...of nếu cần break
```

### map

```javascript
// map - transform mỗi element, return new array
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(num => num * 2);
// [2, 4, 6, 8, 10]

// Transform objects
const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" }
];

const names = users.map(user => user.name);
// ["John", "Jane"]

// With index
const indexed = numbers.map((num, index) => `${index}: ${num}`);
// ["0: 1", "1: 2", "2: 3", "3: 4", "4: 5"]

// Chaining
const result = numbers
  .map(n => n * 2)
  .map(n => n + 1)
  .filter(n => n > 5);
// [7, 9]
```

### filter

```javascript
// filter - return new array với elements thỏa điều kiện
const numbers = [1, 2, 3, 4, 5, 6];

const evens = numbers.filter(n => n % 2 === 0);
// [2, 4, 6]

// Filter objects
const users = [
  { id: 1, name: "John", active: true },
  { id: 2, name: "Jane", active: false },
  { id: 3, name: "Bob", active: true }
];

const activeUsers = users.filter(user => user.active);
// [{ id: 1, name: "John", active: true }, { id: 3, name: "Bob", active: true }]

// Remove falsy values
const mixed = [0, 1, false, 2, "", 3, null, undefined];
const truthy = mixed.filter(Boolean);
// [1, 2, 3]
```

### reduce

```javascript
// reduce - accumulate value từ array
const numbers = [1, 2, 3, 4, 5];

// Sum
const sum = numbers.reduce((acc, num) => acc + num, 0);
// 15

// Product
const product = numbers.reduce((acc, num) => acc * num, 1);
// 120

// Group by
const users = [
  { name: "John", age: 25 },
  { name: "Jane", age: 30 },
  { name: "Bob", age: 25 }
];

const grouped = users.reduce((acc, user) => {
  const age = user.age;
  if (!acc[age]) {
    acc[age] = [];
  }
  acc[age].push(user);
  return acc;
}, {});
// { 25: [{ name: "John", age: 25 }, { name: "Bob", age: 25 }], 30: [{ name: "Jane", age: 30 }] }

// Flatten array
const nested = [[1, 2], [3, 4], [5, 6]];
const flat = nested.reduce((acc, arr) => acc.concat(arr), []);
// [1, 2, 3, 4, 5, 6]

// Count occurrences
const fruits = ["apple", "banana", "apple", "orange", "banana", "apple"];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
// { apple: 3, banana: 2, orange: 1 }
```

### reduceRight

```javascript
// reduceRight - reduce từ phải sang trái
const numbers = [1, 2, 3, 4];

const result = numbers.reduceRight((acc, num) => acc - num, 0);
// 0 - 4 - 3 - 2 - 1 = -10

// Reverse string
const str = "hello";
const reversed = str.split("").reduceRight((acc, char) => acc + char, "");
// "olleh"
```

## 2. Search Methods

### find & findIndex

```javascript
// find - return first element thỏa điều kiện
const users = [
  { id: 1, name: "John", active: true },
  { id: 2, name: "Jane", active: false },
  { id: 3, name: "Bob", active: true }
];

const user = users.find(u => u.active);
// { id: 1, name: "John", active: true }

const inactive = users.find(u => !u.active);
// { id: 2, name: "Jane", active: false }

// findIndex - return index
const index = users.findIndex(u => u.id === 2);
// 1

// Không tìm thấy: find return undefined, findIndex return -1
```

### some & every

```javascript
// some - return true nếu ít nhất 1 element thỏa điều kiện
const numbers = [1, 2, 3, 4, 5];

const hasEven = numbers.some(n => n % 2 === 0);
// true

const hasNegative = numbers.some(n => n < 0);
// false

// every - return true nếu tất cả elements thỏa điều kiện
const allPositive = numbers.every(n => n > 0);
// true

const allEven = numbers.every(n => n % 2 === 0);
// false

// Empty array
[].some(() => true); // false
[].every(() => true); // true (vacuously true)
```

### includes & indexOf

```javascript
// includes - check existence (ES2016)
const numbers = [1, 2, 3, 4, 5];

numbers.includes(3); // true
numbers.includes(6); // false
numbers.includes(3, 3); // false (start from index 3)

// indexOf - return index hoặc -1
numbers.indexOf(3); // 2
numbers.indexOf(6); // -1
numbers.indexOf(3, 3); // -1

// lastIndexOf - tìm từ cuối
const arr = [1, 2, 3, 2, 1];
arr.lastIndexOf(2); // 3
```

## 3. Transformation Methods

### flat & flatMap

```javascript
// flat - flatten nested arrays
const nested = [1, 2, [3, 4], [5, [6, 7]]];

nested.flat(); // [1, 2, 3, 4, 5, [6, 7]]
nested.flat(2); // [1, 2, 3, 4, 5, 6, 7]
nested.flat(Infinity); // Flatten all levels

// flatMap - map rồi flatten 1 level
const numbers = [1, 2, 3];
const doubled = numbers.flatMap(n => [n, n * 2]);
// [1, 2, 2, 4, 3, 6]

// Equivalent to
numbers.map(n => [n, n * 2]).flat();
```

### sort

```javascript
// sort - mutate original array
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];

numbers.sort(); // [1, 1, 2, 3, 4, 5, 6, 9]
// Default: convert to string và sort

// Custom comparator
numbers.sort((a, b) => a - b); // Ascending
numbers.sort((a, b) => b - a); // Descending

// Sort objects
const users = [
  { name: "John", age: 25 },
  { name: "Jane", age: 30 },
  { name: "Bob", age: 20 }
];

users.sort((a, b) => a.age - b.age);
// Sort by age ascending

users.sort((a, b) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});
// Sort by name

// Immutable sort
const sorted = [...users].sort((a, b) => a.age - b.age);
```

## 4. Utility Methods

### slice & splice

```javascript
// slice - extract portion (không mutate)
const numbers = [1, 2, 3, 4, 5];

numbers.slice(1, 3); // [2, 3] (không include end)
numbers.slice(2); // [3, 4, 5] (từ index 2 đến cuối)
numbers.slice(-2); // [4, 5] (2 elements cuối)
numbers.slice(); // [1, 2, 3, 4, 5] (copy array)

// splice - modify array (mutate)
const arr = [1, 2, 3, 4, 5];
arr.splice(1, 2); // Remove 2 elements từ index 1
// arr = [1, 4, 5]

const arr2 = [1, 2, 3];
arr2.splice(1, 0, "a", "b"); // Insert tại index 1
// arr2 = [1, "a", "b", 2, 3]

const arr3 = [1, 2, 3, 4, 5];
arr3.splice(1, 2, "x", "y"); // Replace
// arr3 = [1, "x", "y", 4, 5]
```

### concat & join

```javascript
// concat - combine arrays (không mutate)
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

const combined = arr1.concat(arr2);
// [1, 2, 3, 4, 5, 6]

// Multiple arrays
const arr3 = [7, 8, 9];
const all = arr1.concat(arr2, arr3);
// [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Spread alternative
const all2 = [...arr1, ...arr2, ...arr3];

// join - convert to string
const words = ["Hello", "World"];
words.join(" "); // "Hello World"
words.join("-"); // "Hello-World"
words.join(); // "Hello,World" (default: comma)
```

### reverse & fill

```javascript
// reverse - reverse array (mutate)
const numbers = [1, 2, 3, 4, 5];
numbers.reverse();
// numbers = [5, 4, 3, 2, 1]

// Immutable reverse
const reversed = [...numbers].reverse();

// fill - fill với value
const arr = new Array(5);
arr.fill(0);
// [0, 0, 0, 0, 0]

arr.fill(1, 1, 3); // Fill với 1 từ index 1 đến 3
// [0, 1, 1, 0, 0]
```

## 5. Advanced Patterns

### Method Chaining

```javascript
// Chain multiple methods
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = numbers
  .filter(n => n % 2 === 0) // [2, 4, 6, 8, 10]
  .map(n => n * 2) // [4, 8, 12, 16, 20]
  .reduce((acc, n) => acc + n, 0); // 60

// Complex transformation
const users = [
  { name: "John", age: 25, score: 85 },
  { name: "Jane", age: 30, score: 92 },
  { name: "Bob", age: 20, score: 78 }
];

const topScorers = users
  .filter(user => user.score >= 80)
  .sort((a, b) => b.score - a.score)
  .map(user => ({
    name: user.name,
    score: user.score
  }));
```

### Performance Considerations

```javascript
// ❌ Inefficient: multiple iterations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const filtered = doubled.filter(n => n > 5);
const sum = filtered.reduce((acc, n) => acc + n, 0);

// ✅ Efficient: single iteration
const result = numbers.reduce((acc, n) => {
  const doubled = n * 2;
  if (doubled > 5) {
    acc.sum += doubled;
    acc.items.push(doubled);
  }
  return acc;
}, { sum: 0, items: [] });

// ❌ Creating intermediate arrays
const result = arr1
  .map(x => x * 2)
  .filter(x => x > 10)
  .map(x => x + 1);

// ✅ Single pass (nếu có thể)
const result = [];
for (const x of arr1) {
  const doubled = x * 2;
  if (doubled > 10) {
    result.push(doubled + 1);
  }
}
```

## 6. Common Patterns

### Grouping & Partitioning

```javascript
// Group by property
function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
}

const users = [
  { name: "John", role: "admin" },
  { name: "Jane", role: "user" },
  { name: "Bob", role: "admin" }
];

groupBy(users, "role");
// { admin: [{ name: "John", role: "admin" }, { name: "Bob", role: "admin" }], user: [{ name: "Jane", role: "user" }] }

// Partition
function partition(array, predicate) {
  return array.reduce(
    (acc, item) => {
      acc[predicate(item) ? 0 : 1].push(item);
      return acc;
    },
    [[], []]
  );
}

const [evens, odds] = partition([1, 2, 3, 4, 5], n => n % 2 === 0);
// evens = [2, 4], odds = [1, 3, 5]
```

### Unique Values

```javascript
// Remove duplicates
const numbers = [1, 2, 2, 3, 3, 3, 4];

// Method 1: Set
const unique1 = [...new Set(numbers)];
// [1, 2, 3, 4]

// Method 2: filter
const unique2 = numbers.filter((value, index, self) => 
  self.indexOf(value) === index
);

// Method 3: reduce
const unique3 = numbers.reduce((acc, value) => {
  if (!acc.includes(value)) {
    acc.push(value);
  }
  return acc;
}, []);

// Unique by property
const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 1, name: "John" }
];

const uniqueUsers = users.filter((user, index, self) =>
  index === self.findIndex(u => u.id === user.id)
);
```

## 7. Interview Questions

1. **Sự khác biệt giữa map và forEach?**
   - map: return new array, không mutate
   - forEach: không return, chỉ side effects

2. **Khi nào dùng reduce?**
   - Khi cần accumulate value từ array
   - Grouping, flattening, counting

3. **find vs filter?**
   - find: return first element (hoặc undefined)
   - filter: return array với tất cả matches

4. **some vs every?**
   - some: ít nhất 1 element thỏa điều kiện
   - every: tất cả elements thỏa điều kiện

5. **slice vs splice?**
   - slice: không mutate, return new array
   - splice: mutate, modify original array

6. **Performance: chaining vs single loop?**
   - Chaining: dễ đọc nhưng tạo intermediate arrays
   - Single loop: hiệu quả hơn với large arrays

7. **Làm sao remove duplicates?**
   - Set, filter với indexOf, hoặc reduce

