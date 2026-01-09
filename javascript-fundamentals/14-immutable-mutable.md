# Immutable vs Mutable

## 1. Khái niệm

### Mutable (Có thể thay đổi)

```javascript
// Mutable: có thể modify sau khi tạo
const arr = [1, 2, 3];
arr.push(4); // Modify original
console.log(arr); // [1, 2, 3, 4]

const obj = { name: "John" };
obj.age = 30; // Modify original
console.log(obj); // { name: "John", age: 30 }
```

### Immutable (Không thể thay đổi)

```javascript
// Immutable: không thể modify sau khi tạo
const str = "hello";
str.toUpperCase(); // Return new string, không modify original
console.log(str); // "hello" (không đổi)

const num = 5;
num + 1; // Return new value, không modify original
console.log(num); // 5 (không đổi)

// Primitive types là immutable
let x = 1;
let y = x; // Copy value
y = 2;
console.log(x); // 1 (không đổi)
```

## 2. JavaScript Types

### Immutable Types

```javascript
// Primitives: immutable
const str = "hello";
const num = 42;
const bool = true;
const nullVal = null;
const undefinedVal = undefined;
const sym = Symbol("test");
const bigInt = 123n;

// String methods return new strings
const upper = str.toUpperCase(); // "HELLO"
const lower = str.toLowerCase(); // "hello"
const replaced = str.replace("h", "H"); // "Hello"
// str vẫn là "hello"
```

### Mutable Types

```javascript
// Objects, Arrays, Functions, Dates, etc.
const arr = [1, 2, 3];
arr.push(4); // Mutate
arr.pop(); // Mutate
arr[0] = 10; // Mutate

const obj = { a: 1 };
obj.b = 2; // Mutate
delete obj.a; // Mutate

const date = new Date();
date.setFullYear(2025); // Mutate
```

## 3. Immutable Patterns

### Array Immutability

```javascript
// ❌ Mutable operations
const arr = [1, 2, 3];
arr.push(4); // Mutate
arr.pop(); // Mutate
arr.shift(); // Mutate
arr.unshift(0); // Mutate
arr.sort(); // Mutate
arr.reverse(); // Mutate
arr.splice(1, 1); // Mutate

// ✅ Immutable alternatives
const arr = [1, 2, 3];

// Add element
const withPush = [...arr, 4]; // [1, 2, 3, 4]
const withUnshift = [0, ...arr]; // [0, 1, 2, 3]

// Remove element
const withoutLast = arr.slice(0, -1); // [1, 2]
const withoutFirst = arr.slice(1); // [2, 3]
const filtered = arr.filter((_, i) => i !== 1); // Remove index 1

// Update element
const updated = arr.map((item, i) => i === 1 ? 99 : item); // [1, 99, 3]

// Sort (immutable)
const sorted = [...arr].sort((a, b) => b - a); // [3, 2, 1]
// arr vẫn là [1, 2, 3]

// Reverse (immutable)
const reversed = [...arr].reverse(); // [3, 2, 1]
```

### Object Immutability

```javascript
// ❌ Mutable operations
const obj = { name: "John", age: 30 };
obj.city = "NYC"; // Mutate
obj.age = 31; // Mutate
delete obj.name; // Mutate

// ✅ Immutable alternatives
const obj = { name: "John", age: 30 };

// Add property
const withCity = { ...obj, city: "NYC" };
// { name: "John", age: 30, city: "NYC" }

// Update property
const older = { ...obj, age: 31 };
// { name: "John", age: 31 }

// Remove property
const { name, ...withoutName } = obj;
// { age: 30 }

// Multiple updates
const updated = {
  ...obj,
  age: 31,
  city: "NYC"
};
```

### Nested Structures

```javascript
// ❌ Shallow copy - nested objects vẫn reference
const user = {
  name: "John",
  address: {
    city: "NYC",
    zip: "10001"
  }
};

const copy = { ...user };
copy.address.city = "LA";
console.log(user.address.city); // "LA" (đã bị thay đổi!)

// ✅ Deep copy
// Method 1: JSON (có limitations)
const deepCopy1 = JSON.parse(JSON.stringify(user));
deepCopy1.address.city = "LA";
console.log(user.address.city); // "NYC" (OK)

// Method 2: structuredClone (modern browsers)
const deepCopy2 = structuredClone(user);
deepCopy2.address.city = "LA";
console.log(user.address.city); // "NYC" (OK)

// Method 3: Custom deep clone
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === "object") {
    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

// ✅ Immutable update nested
const updated = {
  ...user,
  address: {
    ...user.address,
    city: "LA"
  }
};
```

## 4. React State Updates

### Immutable State Pattern

```javascript
// ❌ Wrong - mutate state
function Component() {
  const [state, setState] = useState({ count: 0, items: [] });
  
  const increment = () => {
    state.count++; // Mutate!
    setState(state); // Không trigger re-render
  };
  
  const addItem = (item) => {
    state.items.push(item); // Mutate!
    setState(state); // Không trigger re-render
  };
}

// ✅ Correct - immutable updates
function Component() {
  const [state, setState] = useState({ count: 0, items: [] });
  
  const increment = () => {
    setState(prev => ({
      ...prev,
      count: prev.count + 1
    }));
  };
  
  const addItem = (item) => {
    setState(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
  };
  
  const updateItem = (index, newItem) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? newItem : item
      )
    }));
  };
  
  const removeItem = (index) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
}
```

### Redux Pattern

```javascript
// Redux reducer - phải return new state
function todosReducer(state = [], action) {
  switch (action.type) {
    case "ADD_TODO":
      // ✅ Return new array
      return [...state, action.payload];
      
    case "TOGGLE_TODO":
      // ✅ Return new array với updated item
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
      
    case "DELETE_TODO":
      // ✅ Return filtered array
      return state.filter(todo => todo.id !== action.payload);
      
    default:
      return state;
  }
}

// ❌ Wrong - mutate state
function wrongReducer(state = [], action) {
  switch (action.type) {
    case "ADD_TODO":
      state.push(action.payload); // Mutate!
      return state;
  }
}
```

## 5. Immutable Libraries

### Immer

```javascript
import produce from "immer";

// Immer cho phép viết "mutable" code nhưng tạo immutable updates
const nextState = produce(currentState, draft => {
  draft.count++;
  draft.items.push({ id: 1, name: "Item" });
  draft.user.address.city = "LA";
});

// currentState không bị thay đổi
// nextState là new immutable state

// React example
const [state, setState] = useState({ count: 0, items: [] });

const update = () => {
  setState(produce(draft => {
    draft.count++;
    draft.items.push({ id: Date.now() });
  }));
};
```

### Immutable.js

```javascript
import { Map, List } from "immutable";

// Immutable data structures
const state = Map({
  count: 0,
  items: List([1, 2, 3])
});

// Updates return new structures
const newState = state.set("count", 1);
const newState2 = state.update("items", items => items.push(4));

// Original không đổi
console.log(state.get("count")); // 0
console.log(newState.get("count")); // 1
```

## 6. Benefits của Immutability

### Predictability

```javascript
// Immutable: dễ predict behavior
function processData(data) {
  const processed = data.map(x => x * 2);
  // data không đổi, processed là new array
  return processed;
}

const original = [1, 2, 3];
const result = processData(original);
console.log(original); // [1, 2, 3] - không đổi
console.log(result); // [2, 4, 6]
```

### Debugging

```javascript
// Immutable: dễ debug vì có thể track changes
const state1 = { count: 0 };
const state2 = { ...state1, count: 1 };
const state3 = { ...state2, count: 2 };

// Có thể log và compare states
console.log(state1, state2, state3);
```

### Performance với React

```javascript
// Immutable: dễ so sánh references
function shouldUpdate(prevProps, nextProps) {
  // Shallow comparison
  return prevProps.items !== nextProps.items;
  // Nếu items là immutable, !== means changed
}

// React.memo với immutable props
const MemoizedComponent = React.memo(Component, (prev, next) => {
  return prev.items === next.items; // Reference equality
});
```

## 7. Common Patterns

### Immutable Helpers

```javascript
// Update nested property
function updateNested(obj, path, value) {
  const [key, ...rest] = path;
  if (rest.length === 0) {
    return { ...obj, [key]: value };
  }
  return {
    ...obj,
    [key]: updateNested(obj[key] || {}, rest, value)
  };
}

const user = { profile: { name: "John", age: 30 } };
const updated = updateNested(user, ["profile", "age"], 31);
// { profile: { name: "John", age: 31 } }

// Remove nested property
function removeNested(obj, path) {
  const [key, ...rest] = path;
  if (rest.length === 0) {
    const { [key]: removed, ...rest } = obj;
    return rest;
  }
  return {
    ...obj,
    [key]: removeNested(obj[key], rest)
  };
}
```

### Batch Updates

```javascript
// Batch multiple updates
function batchUpdate(state, updates) {
  return Object.keys(updates).reduce((newState, key) => {
    return {
      ...newState,
      [key]: typeof updates[key] === "function"
        ? updates[key](state[key])
        : updates[key]
    };
  }, state);
}

const state = { count: 0, name: "John", items: [] };
const updated = batchUpdate(state, {
  count: state.count + 1,
  name: "Jane",
  items: items => [...items, { id: 1 }]
});
```

## 8. Performance Considerations

### When to Use Immutability

```javascript
// ✅ Use immutability khi:
// - React state updates
// - Redux/Vuex state
// - Functional programming
// - Concurrent updates
// - Debugging/tracking changes

// ⚠️ Consider performance khi:
// - Large nested structures (use Immer hoặc libraries)
// - Frequent updates (có thể cần optimization)
// - Memory constraints (immutable tạo nhiều objects)
```

### Optimization Strategies

```javascript
// 1. Shallow equality checks
function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}

// 2. Structural sharing (Immer, Immutable.js)
// Chỉ copy phần thay đổi, share phần không đổi

// 3. Memoization
const memoized = useMemo(() => {
  return expensiveComputation(data);
}, [data]); // Chỉ recompute khi data reference thay đổi
```

## 9. Interview Questions

1. **Mutable vs Immutable?**
   - Mutable: có thể modify sau khi tạo
   - Immutable: không thể modify, mọi thay đổi tạo new value

2. **Tại sao cần immutability trong React?**
   - React so sánh references để detect changes
   - Predictable state updates
   - Easier debugging
   - Prevent accidental mutations

3. **Shallow copy vs Deep copy?**
   - Shallow: chỉ copy 1 level, nested vẫn reference
   - Deep: copy tất cả levels, hoàn toàn independent

4. **Làm sao update nested object immutably?**
   - Spread operator cho mỗi level
   - Libraries như Immer
   - Custom helper functions

5. **Performance của immutability?**
   - Tạo nhiều objects (memory overhead)
   - Nhưng dễ optimize với structural sharing
   - Trade-off: memory vs predictability

6. **Khi nào cần deep copy?**
   - Khi nested structures cần independent
   - Khi không chắc về mutation
   - Khi cần complete isolation

7. **Immer vs manual immutability?**
   - Immer: dễ viết, tự động optimize
   - Manual: control tốt hơn, ít dependencies

