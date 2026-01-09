# Map và Set

## 1. Map

Map là collection của key-value pairs, keys có thể là bất kỳ type nào.

### Basic Operations

```javascript
// Create Map
const map = new Map();

// Set values
map.set("name", "John");
map.set(1, "one");
map.set(true, "boolean");
map.set({ id: 1 }, "object key");

// Get values
map.get("name"); // "John"
map.get(1); // "one"
map.get("nonexistent"); // undefined

// Check existence
map.has("name"); // true
map.has("age"); // false

// Delete
map.delete("name");
map.has("name"); // false

// Size
map.size; // 3

// Clear
map.clear();
map.size; // 0
```

### Map vs Object

```javascript
// Object limitations
const obj = {};
obj[1] = "one";
obj["1"] = "one string";
console.log(obj); // { "1": "one string" } - keys bị convert to string

// Map advantages
const map = new Map();
map.set(1, "one");
map.set("1", "one string");
map.get(1); // "one"
map.get("1"); // "one string"

// Object keys
const objKey = { id: 1 };
obj[objKey] = "value";
// objKey.toString() được dùng làm key

// Map keys
const mapKey = { id: 1 };
map.set(mapKey, "value");
map.get(mapKey); // "value" - object reference được dùng

// Size
Object.keys(obj).length; // Manual calculation
map.size; // Built-in property

// Iteration order
// Object: không guarantee order (trước ES2015)
// Map: insertion order guaranteed
```

### Initialization

```javascript
// From array of arrays
const map = new Map([
  ["name", "John"],
  ["age", 30],
  ["city", "NYC"]
]);

// From object
const obj = { name: "John", age: 30 };
const map = new Map(Object.entries(obj));

// Empty Map
const emptyMap = new Map();
```

### Iteration

```javascript
const map = new Map([
  ["name", "John"],
  ["age", 30],
  ["city", "NYC"]
]);

// for...of
for (const [key, value] of map) {
  console.log(key, value);
}

// forEach
map.forEach((value, key) => {
  console.log(key, value);
});

// Keys
for (const key of map.keys()) {
  console.log(key);
}

// Values
for (const value of map.values()) {
  console.log(value);
}

// Entries (default)
for (const [key, value] of map.entries()) {
  console.log(key, value);
}

// Convert to array
Array.from(map); // [["name", "John"], ["age", 30], ["city", "NYC"]]
[...map]; // Same
```

### Practical Examples

```javascript
// Cache với expiration
class Cache {
  constructor(ttl = 3600000) {
    this.map = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.map.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.map.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.map.delete(key);
      return null;
    }
    
    return item.value;
  }
}

// Counting occurrences
function countOccurrences(arr) {
  const map = new Map();
  arr.forEach(item => {
    map.set(item, (map.get(item) || 0) + 1);
  });
  return map;
}

countOccurrences(["a", "b", "a", "c", "b", "a"]);
// Map { "a" => 3, "b" => 2, "c" => 1 }

// Grouping
function groupBy(array, keyFn) {
  const map = new Map();
  array.forEach(item => {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  });
  return map;
}

const users = [
  { id: 1, role: "admin" },
  { id: 2, role: "user" },
  { id: 3, role: "admin" }
];

groupBy(users, u => u.role);
// Map { "admin" => [{ id: 1, role: "admin" }, { id: 3, role: "admin" }], "user" => [{ id: 2, role: "user" }] }
```

## 2. Set

Set là collection của unique values.

### Basic Operations

```javascript
// Create Set
const set = new Set();

// Add values
set.add(1);
set.add(2);
set.add(3);
set.add(2); // Duplicate, không được thêm

// Check existence
set.has(1); // true
set.has(4); // false

// Delete
set.delete(2);
set.has(2); // false

// Size
set.size; // 2

// Clear
set.clear();
set.size; // 0
```

### Initialization

```javascript
// From array
const set = new Set([1, 2, 3, 3, 4, 4]);
// Set { 1, 2, 3, 4 } - duplicates removed

// From string
const charSet = new Set("hello");
// Set { "h", "e", "l", "o" }

// Empty Set
const emptySet = new Set();
```

### Iteration

```javascript
const set = new Set([1, 2, 3, 4, 5]);

// for...of
for (const value of set) {
  console.log(value);
}

// forEach
set.forEach(value => {
  console.log(value);
});

// Convert to array
Array.from(set); // [1, 2, 3, 4, 5]
[...set]; // Same

// Values (same as default iteration)
for (const value of set.values()) {
  console.log(value);
}

// Keys (same as values for Set)
for (const key of set.keys()) {
  console.log(key);
}

// Entries (returns [value, value])
for (const [key, value] of set.entries()) {
  console.log(key, value); // 1 1, 2 2, etc.
}
```

### Set Operations

```javascript
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([3, 4, 5, 6]);

// Union
const union = new Set([...set1, ...set2]);
// Set { 1, 2, 3, 4, 5, 6 }

// Intersection
const intersection = new Set(
  [...set1].filter(x => set2.has(x))
);
// Set { 3, 4 }

// Difference
const difference = new Set(
  [...set1].filter(x => !set2.has(x))
);
// Set { 1, 2 }

// Subset check
function isSubset(subset, superset) {
  for (const elem of subset) {
    if (!superset.has(elem)) {
      return false;
    }
  }
  return true;
}

isSubset(new Set([1, 2]), set1); // true
isSubset(new Set([1, 5]), set1); // false
```

### Practical Examples

```javascript
// Remove duplicates
const array = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(array)];
// [1, 2, 3, 4]

// Unique values từ object array
const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 1, name: "John" }
];

const uniqueIds = [...new Set(users.map(u => u.id))];
// [1, 2]

// Tracking visited nodes
function traverseGraph(node, visited = new Set()) {
  if (visited.has(node)) {
    return; // Already visited
  }
  
  visited.add(node);
  // Process node
  node.neighbors.forEach(neighbor => {
    traverseGraph(neighbor, visited);
  });
}

// Tag system
class TagManager {
  constructor() {
    this.tags = new Set();
  }
  
  addTag(tag) {
    this.tags.add(tag.toLowerCase());
  }
  
  removeTag(tag) {
    this.tags.delete(tag.toLowerCase());
  }
  
  hasTag(tag) {
    return this.tags.has(tag.toLowerCase());
  }
  
  getAllTags() {
    return [...this.tags];
  }
}
```

## 3. WeakMap và WeakSet

### WeakMap

```javascript
// WeakMap - keys phải là objects, không thể iterate
const weakMap = new WeakMap();

const obj = { id: 1 };
weakMap.set(obj, "value");
weakMap.get(obj); // "value"

// Keys bị garbage collected nếu không còn reference
let obj2 = { id: 2 };
weakMap.set(obj2, "value2");
obj2 = null; // obj2 có thể bị GC, entry trong WeakMap cũng bị remove

// Không thể iterate
// weakMap.keys() // Error
// weakMap.size // undefined

// Use cases: private data, metadata
const privateData = new WeakMap();

class User {
  constructor(name) {
    privateData.set(this, { name });
  }
  
  getName() {
    return privateData.get(this).name;
  }
}
```

### WeakSet

```javascript
// WeakSet - chỉ chứa objects, không thể iterate
const weakSet = new WeakSet();

const obj1 = { id: 1 };
const obj2 = { id: 2 };

weakSet.add(obj1);
weakSet.add(obj2);

weakSet.has(obj1); // true

// Không thể iterate
// weakSet.values() // Error
// weakSet.size // undefined

// Use cases: tracking objects
const processed = new WeakSet();

function processObject(obj) {
  if (processed.has(obj)) {
    return; // Already processed
  }
  
  processed.add(obj);
  // Process object
}
```

## 4. Performance Comparison

```javascript
// Map vs Object
// Map: better performance với frequent additions/deletions
const map = new Map();
const obj = {};

// Adding
console.time("Map add");
for (let i = 0; i < 1000000; i++) {
  map.set(i, i);
}
console.timeEnd("Map add");

console.time("Object add");
for (let i = 0; i < 1000000; i++) {
  obj[i] = i;
}
console.timeEnd("Object add");

// Set vs Array
// Set: O(1) lookup, Array: O(n) lookup
const set = new Set([1, 2, 3, 4, 5]);
const array = [1, 2, 3, 4, 5];

set.has(3); // O(1)
array.includes(3); // O(n)

// Set: faster for uniqueness checks
const largeArray = Array.from({ length: 1000000 }, (_, i) => i % 1000);

console.time("Set unique");
const uniqueSet = new Set(largeArray);
console.timeEnd("Set unique");

console.time("Array unique");
const uniqueArray = largeArray.filter((v, i, a) => a.indexOf(v) === i);
console.timeEnd("Array unique");
```

## 5. Common Patterns

### LRU Cache với Map

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  
  get(key) {
    if (!this.map.has(key)) {
      return -1;
    }
    
    // Move to end (most recently used)
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    
    return value;
  }
  
  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
    
    this.map.set(key, value);
  }
}
```

### Event Emitter với Map

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(handler);
  }
  
  off(event, handler) {
    if (this.events.has(event)) {
      this.events.get(event).delete(handler);
    }
  }
  
  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(handler => {
        handler(data);
      });
    }
  }
}
```

## 6. Interview Questions

1. **Map vs Object?**
   - Map: keys có thể là bất kỳ type, size property, iteration order guaranteed
   - Object: keys phải là string/symbol, manual size calculation

2. **Set vs Array?**
   - Set: unique values, O(1) lookup
   - Array: duplicates allowed, O(n) lookup

3. **WeakMap vs Map?**
   - WeakMap: keys phải là objects, không thể iterate, keys có thể bị GC
   - Map: keys có thể là bất kỳ type, có thể iterate

4. **Khi nào dùng Set?**
   - Remove duplicates
   - Fast membership testing
   - Set operations (union, intersection)

5. **Khi nào dùng Map?**
   - Keys không phải string
   - Cần size property
   - Frequent additions/deletions
   - Metadata storage

6. **WeakMap use cases?**
   - Private data trong classes
   - Metadata không muốn prevent GC
   - Caching với object keys

7. **Performance: Set vs Array includes?**
   - Set.has(): O(1)
   - Array.includes(): O(n)
   - Set tốt hơn cho large datasets

