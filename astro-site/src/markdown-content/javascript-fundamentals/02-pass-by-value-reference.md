# Pass by Value vs Pass by Reference

## 1. Khái niệm cơ bản

JavaScript có **2 loại data types**:
- **Primitive types**: Pass by value
- **Reference types**: Pass by reference (thực chất là pass by value của reference)

### Primitive Types (Pass by Value)
- `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`

### Reference Types (Pass by Reference)
- `object`, `array`, `function`, `Date`, `RegExp`, etc.

## 2. Primitive Types - Pass by Value

```javascript
// Primitive: mỗi biến có giá trị riêng
let a = 10;
let b = a; // Copy giá trị
b = 20;
console.log(a); // 10 (không đổi)
console.log(b); // 20

// Function với primitive
function changeValue(x) {
  x = 100; // Chỉ thay đổi local variable
}
let num = 50;
changeValue(num);
console.log(num); // 50 (không đổi)

// String
let str1 = 'hello';
let str2 = str1;
str2 = 'world';
console.log(str1); // 'hello'
console.log(str2); // 'world'
```

## 3. Reference Types - Pass by Reference

```javascript
// Object: các biến cùng trỏ đến một object
let obj1 = { name: 'John' };
let obj2 = obj1; // Copy reference, không phải object
obj2.name = 'Jane';
console.log(obj1.name); // 'Jane' (đã thay đổi!)
console.log(obj2.name); // 'Jane'

// Array
let arr1 = [1, 2, 3];
let arr2 = arr1;
arr2.push(4);
console.log(arr1); // [1, 2, 3, 4] (đã thay đổi!)
console.log(arr2); // [1, 2, 3, 4]

// Function với reference
function changeObject(obj) {
  obj.value = 999; // Thay đổi object gốc
}
let myObj = { value: 100 };
changeObject(myObj);
console.log(myObj.value); // 999 (đã thay đổi!)

// Reassign reference (không ảnh hưởng object gốc)
function reassignObject(obj) {
  obj = { new: 'value' }; // Chỉ thay đổi local reference
}
let original = { old: 'value' };
reassignObject(original);
console.log(original); // { old: 'value' } (không đổi)
```

## 4. So sánh chi tiết

```javascript
// Primitive comparison
let a = 5;
let b = 5;
console.log(a === b); // true (so sánh giá trị)

// Reference comparison
let obj1 = { x: 1 };
let obj2 = { x: 1 };
console.log(obj1 === obj2); // false (so sánh reference, không phải giá trị)

// Same reference
let obj3 = obj1;
console.log(obj1 === obj3); // true (cùng reference)
```

## 5. Copying Objects và Arrays

### Shallow Copy

```javascript
// Object.assign()
const original = { a: 1, b: { c: 2 } };
const copy1 = Object.assign({}, original);
copy1.a = 10;
console.log(original.a); // 1 (OK)
copy1.b.c = 20;
console.log(original.b.c); // 20 (vẫn bị ảnh hưởng - shallow!)

// Spread operator
const copy2 = { ...original };
copy2.a = 10;
console.log(original.a); // 1 (OK)
copy2.b.c = 20;
console.log(original.b.c); // 20 (vẫn bị ảnh hưởng - shallow!)

// Array.slice()
const arr = [1, 2, [3, 4]];
const arrCopy = arr.slice();
arrCopy[0] = 10;
console.log(arr[0]); // 1 (OK)
arrCopy[2][0] = 30;
console.log(arr[2][0]); // 30 (vẫn bị ảnh hưởng - shallow!)

// Array spread
const arrCopy2 = [...arr];
```

### Deep Copy

```javascript
// JSON.parse(JSON.stringify()) - có limitations
const original = {
  a: 1,
  b: { c: 2 },
  date: new Date(),
  func: () => console.log('test')
};
const deepCopy1 = JSON.parse(JSON.stringify(original));
// ❌ Mất: functions, undefined, symbols, Date objects

// structuredClone() - modern browsers
const deepCopy2 = structuredClone(original);
// ✅ Giữ được hầu hết, nhưng vẫn không clone functions

// Custom deep clone function
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}
```

## 6. Practical Examples

### React State Updates

```javascript
// ❌ Wrong - mutate state directly
const [state, setState] = useState({ count: 0 });
state.count++; // Không trigger re-render
setState(state);

// ✅ Correct - create new object
setState({ ...state, count: state.count + 1 });
// hoặc
setState(prev => ({ ...prev, count: prev.count + 1 }));

// ❌ Wrong với nested objects
const [user, setUser] = useState({ profile: { name: 'John' } });
user.profile.name = 'Jane'; // Mutation!
setUser(user);

// ✅ Correct
setUser({
  ...user,
  profile: {
    ...user.profile,
    name: 'Jane'
  }
});
```

### Function Parameters

```javascript
// Primitive - safe
function increment(num) {
  num++;
  return num;
}
let count = 5;
increment(count); // 6
console.log(count); // 5 (không đổi)

// Reference - careful!
function addItem(arr, item) {
  arr.push(item); // Mutate original!
  return arr;
}
const myArray = [1, 2, 3];
addItem(myArray, 4);
console.log(myArray); // [1, 2, 3, 4] (đã thay đổi!)

// ✅ Immutable approach
function addItemImmutable(arr, item) {
  return [...arr, item]; // Return new array
}
const newArray = addItemImmutable(myArray, 5);
console.log(myArray); // [1, 2, 3, 4] (không đổi)
console.log(newArray); // [1, 2, 3, 4, 5]
```

### Configuration Objects

```javascript
// Default config pattern
function createAPI(config = {}) {
  const defaultConfig = {
    baseURL: 'https://api.example.com',
    timeout: 5000,
    headers: {}
  };
  
  // Merge configs (shallow)
  const finalConfig = { ...defaultConfig, ...config };
  
  // Nested merge nếu cần
  finalConfig.headers = {
    ...defaultConfig.headers,
    ...config.headers
  };
  
  return finalConfig;
}
```

## 7. Common Pitfalls

```javascript
// ❌ Mutating function parameters
function processData(data) {
  data.processed = true; // Mutate original!
  return data;
}

// ✅ Return new object
function processData(data) {
  return { ...data, processed: true };
}

// ❌ Array methods that mutate
const arr = [1, 2, 3];
arr.push(4); // Mutate
arr.pop(); // Mutate
arr.sort(); // Mutate
arr.reverse(); // Mutate

// ✅ Immutable alternatives
const newArr = [...arr, 4]; // Add
const withoutLast = arr.slice(0, -1); // Remove last
const sorted = [...arr].sort(); // Sort
const reversed = [...arr].reverse(); // Reverse

// ❌ Object mutation trong loops
const users = [{ name: 'John' }, { name: 'Jane' }];
users.forEach(user => {
  user.active = true; // Mutate original!
});

// ✅ Create new objects
const updatedUsers = users.map(user => ({
  ...user,
  active: true
}));
```

## 8. Interview Questions

1. **JavaScript có pass by reference không?**
   - Không chính xác. JavaScript pass by value, nhưng với objects thì pass value của reference.

2. **Làm sao copy object mà không mutate original?**
   - Shallow: spread, Object.assign()
   - Deep: structuredClone(), JSON.parse(JSON.stringify()), custom function

3. **Tại sao `{} === {}` trả về false?**
   - So sánh reference, không phải giá trị. Mỗi object literal tạo object mới.

4. **Khi nào cần deep copy?**
   - Khi object có nested structures và cần modify mà không ảnh hưởng original.

5. **Performance của shallow vs deep copy?**
   - Shallow: nhanh, ít memory
   - Deep: chậm hơn, nhiều memory hơn, nhưng an toàn với nested structures

