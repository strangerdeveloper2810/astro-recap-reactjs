# Day 1: React Fundamentals & Hooks Deep Dive

> **Mục tiêu**: Nắm vững React core concepts, hooks, và practice coding challenges
> **Thời gian**: 4-5 tiếng
> **Output**: Có thể giải thích và code bất kỳ React concept nào bằng tiếng Anh

---

## Schedule Day 1

| Time | Topic | Duration |
|------|-------|----------|
| Session 1 | React Core Concepts Review | 1.5h |
| Session 2 | Hooks Deep Dive | 1.5h |
| Session 3 | Coding Challenges (5 bài) | 1.5h |
| Session 4 | English Practice | 30m |

---

## Session 1: React Core Concepts (1.5h)

### 1.1 Virtual DOM & Reconciliation

#### Concept (Vietnamese)
Virtual DOM là bản copy nhẹ của Real DOM trong memory. Khi state thay đổi:
1. React tạo Virtual DOM mới
2. So sánh (diff) với Virtual DOM cũ
3. Tính toán changes tối thiểu
4. Cập nhật Real DOM chỉ những phần thay đổi

#### Interview Answer (English)
```
"The Virtual DOM is a lightweight JavaScript representation of the actual DOM.
When state changes, React creates a new Virtual DOM tree and compares it with
the previous one using a diffing algorithm. This process is called reconciliation.
React then calculates the minimal set of changes needed and updates only those
specific parts of the real DOM, which is much more efficient than manipulating
the DOM directly."
```

#### Follow-up Question: "What is the diffing algorithm?"
```
"React's diffing algorithm works with O(n) complexity by making two assumptions:
1. Elements of different types produce different trees
2. Keys help identify which items have changed in lists

When comparing two trees, React first compares the root elements. If they're
different types, React tears down the old tree and builds a new one. If they're
the same type, React updates the attributes and recurses on the children."
```

---

### 1.2 JSX & Rendering

#### Concept (Vietnamese)
JSX là syntax extension cho JavaScript, cho phép viết HTML-like code trong JS. JSX được compile thành `React.createElement()` calls.

```jsx
// JSX
<div className="container">
  <h1>Hello</h1>
</div>

// Compiles to
React.createElement('div', { className: 'container' },
  React.createElement('h1', null, 'Hello')
)
```

#### Interview Answer (English)
```
"JSX is a syntax extension that allows us to write HTML-like code in JavaScript.
It's not valid JavaScript - Babel transpiles it into React.createElement() calls.
JSX makes component structure more readable and allows us to embed JavaScript
expressions using curly braces. It's important to note that JSX expressions must
have a single parent element, which is why we often use React.Fragment or the
shorthand <> </> syntax."
```

---

### 1.3 Components: Functional vs Class

#### Interview Answer (English)
```
"In modern React, functional components are the standard. They're simpler,
easier to test, and with hooks, they can do everything class components can do.

The main differences are:
1. Syntax: Functional components are just functions that return JSX
2. State: Functional uses useState, class uses this.state
3. Lifecycle: Functional uses useEffect, class uses lifecycle methods
4. 'this' keyword: Not needed in functional components

I exclusively use functional components in my projects because they're more
concise and hooks provide better code reuse through custom hooks."
```

---

### 1.4 Props vs State

#### Concept (Vietnamese)
| Props | State |
|-------|-------|
| Passed from parent | Managed within component |
| Read-only (immutable) | Can be updated |
| Used for component configuration | Used for dynamic data |

#### Interview Answer (English)
```
"Props and state are both plain JavaScript objects that hold information
influencing render output, but they're different in how they're managed.

Props are passed from parent to child components and are read-only - a
component cannot modify its own props. They're used for component configuration
and communication between components.

State is managed within the component itself and can be updated using setState
or the useState hook. When state changes, the component re-renders. State should
be used for data that changes over time and affects the component's output.

A common pattern is 'lifting state up' - moving state to a common ancestor
when multiple components need to share it."
```

---

### 1.5 Component Lifecycle (Functional Components)

#### Mapping to useEffect

```jsx
// componentDidMount
useEffect(() => {
  console.log('Component mounted');
}, []); // Empty dependency array

// componentDidUpdate (specific dep)
useEffect(() => {
  console.log('count changed');
}, [count]); // Runs when count changes

// componentWillUnmount
useEffect(() => {
  return () => {
    console.log('Component will unmount');
  };
}, []);

// componentDidUpdate (any update)
useEffect(() => {
  console.log('Component updated');
}); // No dependency array
```

#### Interview Answer (English)
```
"In functional components, we handle lifecycle with the useEffect hook.

For mounting - equivalent to componentDidMount - we use useEffect with an
empty dependency array. The effect runs once after the first render.

For updates - equivalent to componentDidUpdate - we include dependencies
in the array. The effect runs whenever those dependencies change.

For cleanup - equivalent to componentWillUnmount - we return a function
from useEffect. This cleanup function runs before the component unmounts
and before every re-run of the effect.

This unified API is actually more powerful because we can have multiple
effects for different concerns, making code more organized."
```

---

## Session 2: Hooks Deep Dive (1.5h)

### 2.1 useState

#### Basic Usage
```jsx
const [count, setCount] = useState(0);

// Update with new value
setCount(5);

// Update based on previous state (IMPORTANT!)
setCount(prev => prev + 1);

// Lazy initialization (for expensive computations)
const [data, setData] = useState(() => computeExpensiveValue());
```

#### Interview Question: "When should you use functional updates?"

```
"You should use functional updates - passing a function to setState - when
the new state depends on the previous state. This is especially important
in closures or when multiple updates might be batched together.

For example, if you call setCount(count + 1) three times in a row, you might
only see one increment because all three calls see the same 'count' value.
But with setCount(prev => prev + 1), each update correctly uses the latest state.

This is also crucial in useEffect callbacks or event handlers where the state
value might be stale due to closure."
```

#### Common Mistake
```jsx
// Wrong - stale closure
const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1); // Still uses same 'count'
  // Result: only +1
};

// Correct - functional update
const handleClick = () => {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  // Result: +2
};
```

---

### 2.2 useEffect

#### Complete Pattern
```jsx
useEffect(() => {
  // 1. Setup code (runs after render)
  const subscription = api.subscribe(id);

  // 2. Cleanup function (runs before next effect & unmount)
  return () => {
    subscription.unsubscribe();
  };
}, [id]); // 3. Dependencies
```

#### Interview Question: "Explain the useEffect dependency array"

```
"The dependency array controls when the effect runs:

- No array: Effect runs after every render
- Empty array []: Effect runs only once after mount
- With dependencies [a, b]: Effect runs when a or b changes

React uses Object.is comparison to detect changes. For objects and arrays,
this means reference equality, so you need to be careful about creating
new references on every render.

A common mistake is missing dependencies, which can lead to stale closures.
The ESLint plugin 'exhaustive-deps' helps catch these issues. If an effect
depends on a value, that value should be in the dependency array."
```

#### Common Patterns
```jsx
// Data fetching
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const result = await api.get(`/users/${userId}`);
    if (!cancelled) {
      setUser(result);
    }
  }

  fetchData();

  return () => {
    cancelled = true; // Prevent setting state after unmount
  };
}, [userId]);

// Event listener
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// Document title
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```

---

### 2.3 useCallback & useMemo

#### Concept (Vietnamese)
- `useMemo`: Cache **giá trị** tính toán expensive
- `useCallback`: Cache **function reference** để tránh re-create

#### When to Use

```jsx
// useMemo - expensive calculation
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// useCallback - stable function reference
const handleClick = useCallback(() => {
  console.log('Clicked:', id);
}, [id]);

// Why useCallback matters - passing to memoized child
const MemoizedChild = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});

// Without useCallback, Child re-renders every time Parent renders
// because onClick is a new function reference each time
```

#### Interview Question: "When should you use useMemo and useCallback?"

```
"useMemo and useCallback are optimization hooks that should be used
strategically, not everywhere.

Use useMemo when:
1. You have an expensive calculation that doesn't need to run every render
2. You're passing an object or array to a dependency array of another hook
3. You're passing a value to a memoized child component

Use useCallback when:
1. Passing callbacks to optimized child components that rely on reference equality
2. The callback is a dependency of another hook like useEffect

However, premature optimization is a common mistake. These hooks have their
own overhead - they need to store previous values and compare dependencies.
Only use them when you've identified an actual performance issue, or when
passing callbacks to memoized components."
```

---

### 2.4 useRef

#### Use Cases
```jsx
// 1. DOM reference
const inputRef = useRef(null);
const focusInput = () => inputRef.current.focus();
return <input ref={inputRef} />;

// 2. Mutable value that doesn't trigger re-render
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current += 1;
});

// 3. Store previous value
const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// 4. Store interval/timeout IDs
const intervalRef = useRef(null);
useEffect(() => {
  intervalRef.current = setInterval(() => {}, 1000);
  return () => clearInterval(intervalRef.current);
}, []);
```

#### Interview Answer (English)
```
"useRef returns a mutable object with a .current property that persists
across renders without causing re-renders when changed.

The most common use is accessing DOM elements directly - passing the ref
to an element gives us access to the underlying DOM node.

But it's also useful for storing any mutable value that shouldn't trigger
re-renders - like timer IDs, previous values, or instance variables that
would have been stored on 'this' in class components.

The key difference from state is that changing ref.current doesn't cause
a re-render, making it perfect for values that need to persist but don't
affect the UI directly."
```

---

### 2.5 useContext

#### Pattern
```jsx
// 1. Create context
const ThemeContext = createContext('light');

// 2. Provider component
function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Main />
    </ThemeContext.Provider>
  );
}

// 3. Consume with useContext
function Button() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button
      style={{ background: theme === 'dark' ? '#333' : '#fff' }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      Toggle Theme
    </button>
  );
}
```

#### Interview Question: "When would you use Context vs other state management?"

```
"Context is great for data that needs to be accessible by many components
at different nesting levels - like theme, user authentication, or locale.

However, Context has limitations:
1. Every consumer re-renders when the context value changes
2. It's not optimized for high-frequency updates
3. Can lead to prop-drilling-like issues at the provider level

For complex state management, I'd use:
- Zustand or Jotai for simple global state (minimal boilerplate)
- Redux Toolkit for large applications needing middleware, devtools
- React Query/TanStack Query for server state

In my current project at Cognisian, I use Zustand with 8 domain-specific
stores, which gives us the simplicity of Context with better performance
and separation of concerns."
```

---

### 2.6 useReducer

#### When to Use
```jsx
// Complex state logic with multiple sub-values
const initialState = {
  loading: false,
  error: null,
  data: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function DataFetcher() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await api.get('/data');
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  };

  return (
    <div>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error: {state.error}</p>}
      {state.data && <pre>{JSON.stringify(state.data, null, 2)}</pre>}
      <button onClick={fetchData}>Fetch</button>
    </div>
  );
}
```

#### Interview Answer (English)
```
"useReducer is an alternative to useState for complex state logic. It's
preferable when:

1. State has multiple sub-values that are updated together
2. Next state depends on previous state in complex ways
3. You want to centralize state update logic

The pattern is similar to Redux - you dispatch actions and a reducer
function determines how state changes. This makes state transitions
predictable and easier to test.

I typically use useReducer for form state with validation, data fetching
states (loading, error, data), or any state machine-like logic."
```

---

## Session 3: Coding Challenges (1.5h)

### Challenge 1: Counter with History (15 min)

#### Requirements
Build a counter that:
- Can increment/decrement
- Tracks history of all values
- Can undo to previous value

#### Solution
```jsx
function CounterWithHistory() {
  const [history, setHistory] = useState([0]);
  const [index, setIndex] = useState(0);

  const count = history[index];

  const updateCount = (newCount) => {
    // Remove any "future" history if we're not at the end
    const newHistory = history.slice(0, index + 1);
    setHistory([...newHistory, newCount]);
    setIndex(newHistory.length);
  };

  const increment = () => updateCount(count + 1);
  const decrement = () => updateCount(count - 1);

  const undo = () => {
    if (index > 0) setIndex(index - 1);
  };

  const redo = () => {
    if (index < history.length - 1) setIndex(index + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
      <button onClick={undo} disabled={index === 0}>Undo</button>
      <button onClick={redo} disabled={index === history.length - 1}>Redo</button>
      <p>History: {history.join(' → ')}</p>
    </div>
  );
}
```

---

### Challenge 2: Debounced Search Input (15 min)

#### Requirements
Build a search input that:
- Only calls API after user stops typing for 500ms
- Shows loading state
- Displays results

#### Solution
```jsx
// Custom hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Component
function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    let cancelled = false;

    async function search() {
      setLoading(true);
      try {
        const data = await fetch(`/api/search?q=${debouncedQuery}`)
          .then(r => r.json());
        if (!cancelled) {
          setResults(data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    search();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {loading && <p>Loading...</p>}
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Challenge 3: Toggle Component with Compound Pattern (15 min)

#### Requirements
Build a Toggle component using compound component pattern

#### Solution
```jsx
const ToggleContext = createContext();

function Toggle({ children }) {
  const [on, setOn] = useState(false);
  const toggle = () => setOn(prev => !prev);

  return (
    <ToggleContext.Provider value={{ on, toggle }}>
      {children}
    </ToggleContext.Provider>
  );
}

Toggle.On = function ToggleOn({ children }) {
  const { on } = useContext(ToggleContext);
  return on ? children : null;
};

Toggle.Off = function ToggleOff({ children }) {
  const { on } = useContext(ToggleContext);
  return on ? null : children;
};

Toggle.Button = function ToggleButton() {
  const { on, toggle } = useContext(ToggleContext);
  return (
    <button onClick={toggle}>
      {on ? 'ON' : 'OFF'}
    </button>
  );
};

// Usage
function App() {
  return (
    <Toggle>
      <Toggle.On>The toggle is on!</Toggle.On>
      <Toggle.Off>The toggle is off!</Toggle.Off>
      <Toggle.Button />
    </Toggle>
  );
}
```

---

### Challenge 4: Fetch with Error Boundary (20 min)

#### Requirements
Build a data fetcher with proper error handling and loading states

#### Solution
```jsx
// Error Boundary (class component - only way to catch render errors)
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Custom hook for data fetching
function useFetch(url) {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'loading':
          return { ...state, loading: true, error: null };
        case 'success':
          return { loading: false, data: action.payload, error: null };
        case 'error':
          return { loading: false, data: null, error: action.payload };
        default:
          return state;
      }
    },
    { loading: true, data: null, error: null }
  );

  useEffect(() => {
    let cancelled = false;

    dispatch({ type: 'loading' });

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) dispatch({ type: 'success', payload: data });
      })
      .catch(error => {
        if (!cancelled) dispatch({ type: 'error', payload: error });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}

// Usage
function UserProfile({ userId }) {
  const { loading, data, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) throw error; // Let ErrorBoundary handle it

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <UserProfile userId={1} />
    </ErrorBoundary>
  );
}
```

---

### Challenge 5: Todo List with Filter (20 min)

#### Requirements
Build a todo list with:
- Add/remove todos
- Mark complete
- Filter (all/active/completed)

#### Solution
```jsx
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [input, setInput] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: input.trim(), completed: false }
    ]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const remainingCount = todos.filter(t => !t.completed).length;

  return (
    <div>
      <form onSubmit={addTodo}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>×</button>
          </li>
        ))}
      </ul>

      <footer>
        <span>{remainingCount} items left</span>
        <div>
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ fontWeight: filter === f ? 'bold' : 'normal' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
```

---

## Session 4: English Practice (30 min)

### Self-Practice Exercise

**Record yourself (voice memo) answering these questions:**

1. "Can you explain how the Virtual DOM works?"
2. "What's the difference between useState and useReducer?"
3. "When would you use useMemo vs useCallback?"
4. "Explain the useEffect cleanup function"
5. "How do you handle data fetching in React?"

### Evaluation Criteria

- [ ] Clear pronunciation
- [ ] Logical structure (intro → explanation → example)
- [ ] No long pauses
- [ ] Technical accuracy
- [ ] Appropriate use of terminology

---

## Day 1 Checklist

```
□ Understand Virtual DOM & Reconciliation
□ Can explain JSX transpilation
□ Know hooks: useState, useEffect, useCallback, useMemo, useRef, useContext
□ Completed 5 coding challenges
□ Recorded English practice
□ Can explain any concept for 2-3 minutes in English
```

---

## Quick Review Cards

### useState
```
Purpose: Manage local component state
Syntax: const [state, setState] = useState(initialValue)
Key point: Use functional update when new state depends on previous
```

### useEffect
```
Purpose: Side effects (data fetching, subscriptions, DOM manipulation)
Syntax: useEffect(() => { /* effect */ return () => { /* cleanup */ } }, [deps])
Key point: Cleanup runs before next effect and on unmount
```

### useCallback
```
Purpose: Memoize function reference
Syntax: const fn = useCallback(() => {}, [deps])
Key point: Use when passing callbacks to memoized children
```

### useMemo
```
Purpose: Memoize computed value
Syntax: const value = useMemo(() => compute(), [deps])
Key point: Use for expensive calculations
```

### useRef
```
Purpose: Mutable value that persists across renders, DOM access
Syntax: const ref = useRef(initialValue)
Key point: Changing ref.current doesn't cause re-render
```

---

# BONUS: JavaScript Fundamentals (Hay hỏi!)

> Phần này bổ sung các câu hỏi JS cơ bản thường gặp trong phỏng vấn Senior Frontend

---

## JS.1 var vs let vs const

### 🇻🇳 Hiểu đơn giản

| | var | let | const |
|--|-----|-----|-------|
| **Scope** | Function | Block | Block |
| **Hoisting** | Có (undefined) | Có (TDZ) | Có (TDZ) |
| **Re-declare** | ✅ Được | ❌ Không | ❌ Không |
| **Re-assign** | ✅ Được | ✅ Được | ❌ Không |

```js
// var - function scope
function test() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 - vẫn access được!
}

// let/const - block scope
function test() {
  if (true) {
    let y = 1;
  }
  console.log(y); // ReferenceError!
}

// const với object - reference không đổi, value có thể đổi
const user = { name: 'John' };
user.name = 'Jane';  // ✅ OK
user = { name: 'Bob' }; // ❌ Error - không thể gán lại
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: What's the difference between var, let, and const?**

```
"The main differences are scope and reassignment:

var is function-scoped and can be redeclared. It's hoisted to the
top with an initial value of undefined.

let and const are block-scoped. They're also hoisted but remain
in a 'temporal dead zone' until declared - accessing them before
declaration throws a ReferenceError.

const cannot be reassigned after initialization. However, for objects
and arrays, you can still modify their contents - const only prevents
reassigning the reference itself.

In modern JavaScript, I use const by default, let when I need to
reassign, and avoid var entirely."
```

---

## JS.2 Hoisting

### 🇻🇳 Hiểu đơn giản

**Hoisting** = JavaScript "đưa" declarations lên đầu scope

```js
// Code bạn viết
console.log(x); // undefined (không phải Error!)
var x = 5;

// JS hiểu như thế này
var x;           // Declaration được "hoist"
console.log(x);  // undefined
x = 5;           // Assignment ở nguyên chỗ
```

```js
// Với let/const - Temporal Dead Zone (TDZ)
console.log(y); // ReferenceError!
let y = 5;      // Không access được trước dòng này
```

```js
// Function declarations được hoist hoàn toàn
sayHello(); // ✅ "Hello"
function sayHello() { console.log("Hello"); }

// Function expressions KHÔNG được hoist
sayHi(); // ❌ TypeError
var sayHi = function() { console.log("Hi"); }
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: Explain hoisting in JavaScript**

```
"Hoisting is JavaScript's behavior of moving declarations to the
top of their scope during compilation.

Variable declarations with var are hoisted with undefined as the
initial value. Function declarations are hoisted completely - you
can call them before they appear in code.

However, let and const are in a 'temporal dead zone' from the start
of the block until the declaration. Accessing them before declaration
throws a ReferenceError.

Function expressions are NOT fully hoisted - the variable is hoisted
but not the function assignment.

Understanding hoisting helps avoid bugs, though with modern code
using let/const and declaring variables at the top, it's rarely
an issue in practice."
```

---

## JS.3 this keyword

### 🇻🇳 Hiểu đơn giản

**this** phụ thuộc vào CÁCH function được GỌI, không phải nơi nó được định nghĩa

```js
const obj = {
  name: 'John',

  // Regular function: this = object gọi nó
  sayName: function() {
    console.log(this.name); // 'John'
  },

  // Arrow function: this = context nơi nó được định nghĩa
  sayNameArrow: () => {
    console.log(this.name); // undefined (this = global/window)
  }
};

obj.sayName();      // 'John'
obj.sayNameArrow(); // undefined

// Vấn đề phổ biến: mất this trong callback
const obj2 = {
  name: 'Jane',
  greet: function() {
    setTimeout(function() {
      console.log(this.name); // undefined - this = global
    }, 100);
  },

  // Fix với arrow function
  greetFixed: function() {
    setTimeout(() => {
      console.log(this.name); // 'Jane' - arrow giữ this
    }, 100);
  }
};
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: Explain the 'this' keyword in JavaScript**

```
"The value of 'this' depends on how a function is called:

1. Method call: this = the object calling the method
   obj.method() → this is obj

2. Regular function: this = global (or undefined in strict mode)

3. Arrow functions: this = lexically inherited from outer scope
   They don't have their own 'this'

4. Constructor (new): this = the newly created object

5. Explicit binding: call(), apply(), bind() can set this manually

A common gotcha is losing 'this' in callbacks. Arrow functions solve
this because they capture 'this' from their enclosing scope.

In React, this is why we use arrow functions for event handlers -
they maintain the component instance as 'this'."
```

---

## JS.4 Closure

### 🇻🇳 Hiểu đơn giản

**Closure** = Function "nhớ" biến từ scope ngoài, kể cả khi scope đó đã kết thúc

```js
function createCounter() {
  let count = 0;  // Biến private

  return function() {
    count++;      // Vẫn access được count!
    return count;
  };
}

const counter = createCounter();
counter(); // 1
counter(); // 2
counter(); // 3
// count không thể access trực tiếp từ ngoài!
```

**Ứng dụng thực tế:**

```js
// 1. Data privacy
function createWallet(initialBalance) {
  let balance = initialBalance; // private

  return {
    getBalance: () => balance,
    deposit: (amount) => { balance += amount; },
    withdraw: (amount) => {
      if (amount <= balance) balance -= amount;
    }
  };
}

// 2. Function factory
function multiply(a) {
  return function(b) {
    return a * b;  // 'a' được "nhớ"
  };
}
const double = multiply(2);
const triple = multiply(3);
double(5); // 10
triple(5); // 15

// 3. Event handlers với data
function setupButtons(buttons) {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function() {
      console.log('Button', i); // Mỗi handler "nhớ" giá trị i của nó
    };
  }
}
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: What is a closure and when would you use it?**

```
"A closure is a function that remembers variables from its outer
scope even after that outer function has finished executing.

Every function in JavaScript creates a closure. When the inner
function references a variable from the outer scope, that variable
is 'closed over' and persists in memory.

Use cases:
1. Data privacy - variables hidden from external access
2. Function factories - create specialized functions
3. Callbacks - maintain context in async operations
4. Memoization - cache computed values

In React, hooks like useState use closures internally. When you
call useState, the returned setter function closes over the
component's state, maintaining access to update it."
```

---

## JS.5 Promises & Async/Await

### 🇻🇳 Hiểu đơn giản

```js
// Promise = "Lời hứa" sẽ có kết quả trong tương lai

// Cách 1: Promise chains
fetch('/api/user')
  .then(res => res.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(res => res.json())
  .then(posts => console.log(posts))
  .catch(err => console.error(err));

// Cách 2: async/await - dễ đọc hơn
async function getUserPosts() {
  try {
    const res = await fetch('/api/user');
    const user = await res.json();

    const postsRes = await fetch(`/api/posts/${user.id}`);
    const posts = await postsRes.json();

    return posts;
  } catch (err) {
    console.error(err);
  }
}

// Parallel execution
const [users, posts] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json())
]);
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: Explain Promises and async/await**

```
"A Promise represents a value that may not be available yet but
will be resolved in the future. It has three states: pending,
fulfilled, or rejected.

Promises allow chaining with .then() for success and .catch() for
errors. This avoids 'callback hell' - deeply nested callbacks.

async/await is syntactic sugar over Promises. It makes asynchronous
code look synchronous, improving readability. An async function
always returns a Promise. await pauses execution until the Promise
resolves.

For parallel operations, I use Promise.all() to run multiple
promises concurrently and wait for all to complete. Promise.race()
returns when the first promise settles.

Error handling: with Promises use .catch(), with async/await use
try/catch blocks."
```

---

## JS.6 Event Loop

### 🇻🇳 Hiểu đơn giản

JavaScript = **single-threaded**, chỉ làm 1 việc 1 lúc

**Event Loop** giúp xử lý async mà không block

```
┌─────────────────────────────────────────┐
│           Call Stack                     │
│  (Đang chạy cái gì)                      │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│         Microtask Queue                  │
│  Promises, queueMicrotask               │
│  (Ưu tiên cao)                          │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│         Macrotask Queue                  │
│  setTimeout, setInterval, events         │
│  (Ưu tiên thấp)                          │
└─────────────────────────────────────────┘
```

```js
console.log('1');                          // Sync
setTimeout(() => console.log('2'), 0);     // Macrotask
Promise.resolve().then(() => console.log('3')); // Microtask
console.log('4');                          // Sync

// Output: 1, 4, 3, 2

// Giải thích:
// 1. '1' - chạy ngay
// 2. setTimeout - đưa vào macrotask queue
// 3. Promise.then - đưa vào microtask queue
// 4. '4' - chạy ngay
// 5. Call stack trống → chạy microtasks → '3'
// 6. Microtasks trống → chạy macrotasks → '2'
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: Explain the JavaScript Event Loop**

```
"JavaScript is single-threaded, meaning it can only do one thing
at a time. The event loop enables async operations without blocking.

Here's how it works:
1. Synchronous code executes in the call stack
2. Async callbacks go to task queues
3. When the call stack is empty, the event loop moves tasks to it

There are two types of task queues:
- Microtasks (Promises, queueMicrotask) - higher priority
- Macrotasks (setTimeout, events) - lower priority

After each task, ALL microtasks run before the next macrotask.
This is why Promises resolve before setTimeout, even with delay 0.

Understanding this helps debug timing issues and optimize
performance by not blocking the main thread with heavy computation."
```

---

## JS.7 == vs ===

### 🇻🇳 Hiểu đơn giản

| | `==` (Loose) | `===` (Strict) |
|--|--------------|----------------|
| **So sánh** | Value (sau khi convert type) | Value + Type |
| **An toàn** | ❌ Có thể gây bug | ✅ Predictable |

```js
// == có type coercion (chuyển đổi type)
1 == '1'       // true  (string → number)
true == 1      // true  (boolean → number)
null == undefined // true
[] == false    // true  ([] → '' → 0 → false)
[] == ![]      // true  (WTF!)

// === so sánh cả type
1 === '1'      // false
true === 1     // false
null === undefined // false
```

**Quy tắc:** Luôn dùng `===` trừ khi có lý do cụ thể

### 🇬🇧 Trả lời phỏng vấn

> **Q: What's the difference between == and ===?**

```
"Double equals (==) performs type coercion before comparison.
Triple equals (===) compares both value AND type without coercion.

For example, 1 == '1' is true because the string is converted to
a number. But 1 === '1' is false because they're different types.

I always use strict equality (===) because it's more predictable
and prevents subtle bugs. The loose equality rules are complex and
can lead to unexpected results like [] == false being true.

The only case where == might be useful is checking for null or
undefined together: value == null catches both. But I prefer
being explicit with value === null || value === undefined."
```

---

## Day 1 JS Checklist

```
□ Hiểu var vs let vs const (scope, hoisting)
□ Giải thích được hoisting và TDZ
□ Hiểu 'this' trong các context khác nhau
□ Giải thích closure và ứng dụng
□ Hiểu Promise vs async/await
□ Giải thích Event Loop
□ Biết khi nào dùng == vs ===
```

---

**End of Day 1 - Rest well and prepare for Day 2: Advanced React + Algorithms!**
