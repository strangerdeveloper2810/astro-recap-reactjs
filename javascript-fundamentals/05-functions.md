# Các loại Functions

## 1. Arrow Functions

### Syntax

```javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => {
  return a + b;
};

// Implicit return
const add = (a, b) => a + b;

// Single parameter (no parentheses needed)
const square = x => x * x;

// No parameters
const greet = () => 'Hello';

// Multiple statements
const process = (x) => {
  const doubled = x * 2;
  return doubled + 10;
};
```

### Key Differences

```javascript
// 1. No `this` binding (lexical this)
const obj = {
  name: 'John',
  // Traditional - dynamic this
  greet: function() {
    return `Hello, ${this.name}`;
  },
  // Arrow - lexical this (from obj)
  greetArrow: () => {
    return `Hello, ${this.name}`; // this = global/window
  },
  // Arrow trong method - this = obj
  greetNested: function() {
    const inner = () => {
      return `Hello, ${this.name}`; // this = obj
    };
    return inner();
  }
};

// 2. No `arguments` object
function traditional() {
  console.log(arguments); // Arguments object
}

const arrow = () => {
  console.log(arguments); // ReferenceError
  // Use rest parameters instead
};

const arrowWithRest = (...args) => {
  console.log(args); // Array
};

// 3. Cannot be used as constructor
function Person(name) {
  this.name = name;
}
const person = new Person('John'); // OK

const PersonArrow = (name) => {
  this.name = name;
};
const person2 = new PersonArrow('John'); // TypeError

// 4. No prototype
function Func() {}
console.log(Func.prototype); // {}

const Arrow = () => {};
console.log(Arrow.prototype); // undefined
```

## 2. Higher-Order Functions (HOF)

HOF là functions nhận functions làm arguments hoặc return functions.

### Functions as Arguments

```javascript
// Array methods (built-in HOFs)
const numbers = [1, 2, 3, 4, 5];

// map() - transform each element
const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8, 10]

// filter() - select elements
const evens = numbers.filter(n => n % 2 === 0); // [2, 4]

// reduce() - accumulate value
const sum = numbers.reduce((acc, n) => acc + n, 0); // 15

// forEach() - side effects
numbers.forEach(n => console.log(n));

// find() - find first match
const found = numbers.find(n => n > 3); // 4

// some() - any match
const hasEven = numbers.some(n => n % 2 === 0); // true

// every() - all match
const allPositive = numbers.every(n => n > 0); // true
```

### Custom HOF Examples

```javascript
// Function that takes function as argument
function repeat(n, fn) {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
}

repeat(3, (i) => console.log(`Iteration ${i}`));
// Iteration 0
// Iteration 1
// Iteration 2

// Function that returns function
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
double(5); // 10
triple(5); // 15

// More complex HOF
function createValidator(rules) {
  return function(value) {
    return rules.every(rule => rule(value));
  };
}

const isPositive = (n) => n > 0;
const isInteger = (n) => Number.isInteger(n);
const validate = createValidator([isPositive, isInteger]);
validate(5); // true
validate(-5); // false
```

### React HOF Pattern

```javascript
// HOC (Higher-Order Component)
function withLoading(Component) {
  return function WrappedComponent(props) {
    if (props.loading) {
      return <div>Loading...</div>;
    }
    return <Component {...props} />;
  };
}

// Usage
const UserList = ({ users }) => (
  <ul>
    {users.map(user => <li key={user.id}>{user.name}</li>)}
  </ul>
);

const UserListWithLoading = withLoading(UserList);

// Custom hooks (HOF pattern)
function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [url]);
  
  return { data, loading };
}
```

## 3. Currying

Currying là transform function nhận nhiều arguments thành sequence of functions, mỗi function nhận một argument.

### Basic Currying

```javascript
// Non-curried
function add(a, b, c) {
  return a + b + c;
}
add(1, 2, 3); // 6

// Curried
function addCurried(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}
addCurried(1)(2)(3); // 6

// Arrow function currying
const addCurriedArrow = a => b => c => a + b + c;
addCurriedArrow(1)(2)(3); // 6

// Partial application
const addOne = addCurriedArrow(1);
const addOneAndTwo = addOne(2);
addOneAndTwo(3); // 6
```

### Advanced Currying

```javascript
// Generic curry function
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...nextArgs) {
        return curried.apply(this, args.concat(nextArgs));
      };
    }
  };
}

// Usage
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
curriedAdd(1)(2, 3); // 6
curriedAdd(1, 2, 3); // 6

// Practical example: API calls
const fetch = curry((method, url, data) => {
  return fetch(url, { method, body: JSON.stringify(data) });
});

const get = fetch('GET');
const post = fetch('POST');

const getUsers = get('/api/users');
const createUser = post('/api/users');
```

### Practical Currying Examples

```javascript
// Event handler currying
const handleClick = (id) => (event) => {
  event.preventDefault();
  console.log(`Clicked item ${id}`);
};

// Usage
<button onClick={handleClick(123)}>Click</button>

// Validation currying
const validate = (rule) => (value) => rule(value);

const isEmail = validate((email) => email.includes('@'));
const isLong = validate((str) => str.length > 5);

// Compose validators
const isValidEmail = (email) => isEmail(email) && isLong(email);

// Math operations
const multiply = a => b => a * b;
const double = multiply(2);
const triple = multiply(3);

double(5); // 10
triple(5); // 15
```

## 4. Callbacks

Callback là function được pass như argument và được gọi sau khi operation hoàn thành.

### Basic Callbacks

```javascript
// Synchronous callback
function processArray(arr, callback) {
  const result = [];
  for (let item of arr) {
    result.push(callback(item));
  }
  return result;
}

const numbers = [1, 2, 3];
const doubled = processArray(numbers, n => n * 2); // [2, 4, 6]

// Asynchronous callback
function fetchData(url, callback) {
  setTimeout(() => {
    const data = { id: 1, name: 'John' };
    callback(null, data); // Node.js convention: error first
  }, 1000);
}

fetchData('/api/user', (error, data) => {
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
});
```

### Callback Patterns

```javascript
// Error-first callbacks (Node.js style)
function readFile(path, callback) {
  // Simulate async operation
  setTimeout(() => {
    if (path === 'invalid') {
      callback(new Error('File not found'), null);
    } else {
      callback(null, 'file content');
    }
  }, 100);
}

readFile('data.txt', (err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Data:', data);
});

// Promise-based (modern)
function readFilePromise(path) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (path === 'invalid') {
        reject(new Error('File not found'));
      } else {
        resolve('file content');
      }
    }, 100);
  });
}

// Callback hell vs Promises
// ❌ Callback hell
getData((err1, data1) => {
  if (err1) return handleError(err1);
  processData(data1, (err2, data2) => {
    if (err2) return handleError(err2);
    saveData(data2, (err3, result) => {
      if (err3) return handleError(err3);
      console.log(result);
    });
  });
});

// ✅ Promises
getData()
  .then(processData)
  .then(saveData)
  .then(console.log)
  .catch(handleError);
```

### Event Callbacks

```javascript
// DOM events
const button = document.querySelector('button');
button.addEventListener('click', (event) => {
  console.log('Button clicked', event);
});

// Custom event emitter
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

const emitter = new EventEmitter();
emitter.on('userLogin', (user) => {
  console.log('User logged in:', user);
});
emitter.emit('userLogin', { id: 1, name: 'John' });
```

## 5. Function Composition

```javascript
// Compose functions
const compose = (...fns) => (value) =>
  fns.reduceRight((acc, fn) => fn(acc), value);

const pipe = (...fns) => (value) =>
  fns.reduce((acc, fn) => fn(acc), value);

// Usage
const addOne = x => x + 1;
const multiplyByTwo = x => x * 2;
const square = x => x * x;

// compose: right to left
const composed = compose(square, multiplyByTwo, addOne);
composed(3); // ((3 + 1) * 2) ^ 2 = 64

// pipe: left to right
const piped = pipe(addOne, multiplyByTwo, square);
piped(3); // ((3 + 1) * 2) ^ 2 = 64
```

## 6. Common Patterns

### Debounce & Throttle

```javascript
// Debounce: delay execution until after wait time
function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Usage: search input
const searchInput = document.querySelector('#search');
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// Throttle: execute at most once per wait time
function throttle(fn, wait) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// Usage: scroll events
const throttledScroll = throttle(() => {
  console.log('Scrolled');
}, 100);

window.addEventListener('scroll', throttledScroll);
```

## 7. Interview Questions

1. **Khi nào dùng arrow function vs regular function?**
   - Arrow: callbacks, methods cần lexical this, short functions
   - Regular: methods cần dynamic this, constructors, hoisting cần thiết

2. **Callback hell là gì? Làm sao tránh?**
   - Nested callbacks khó đọc. Dùng Promises, async/await, hoặc libraries như async.js

3. **Currying vs Partial Application?**
   - Currying: transform thành unary functions
   - Partial: fix một số arguments, return function với ít arguments hơn

4. **HOF trong JavaScript?**
   - Functions nhận hoặc return functions. Ví dụ: map, filter, reduce, HOC trong React

5. **Sự khác biệt giữa debounce và throttle?**
   - Debounce: delay execution, reset timer mỗi lần call
   - Throttle: limit execution frequency, execute định kỳ

