# React - Complete Guide (Basic to Advanced)

## Table of Contents
- [Level 1: Basic](#level-1-basic)
- [Level 2: Intermediate](#level-2-intermediate)
- [Level 3: Advanced](#level-3-advanced)
- [Real-world Applications](#real-world-applications)
- [Interview Questions](#interview-questions)

---

# Level 1: Basic

## 1.1 JSX Fundamentals

### JSX là gì?

```jsx
// JSX = JavaScript XML
// Syntax extension cho phép viết HTML-like code trong JavaScript

// JSX
const element = <h1>Hello, World!</h1>;

// Babel compile thành:
const element = React.createElement('h1', null, 'Hello, World!');
```

### JSX Rules

```jsx
// 1. Return single root element
// ❌ Wrong
return (
  <h1>Title</h1>
  <p>Content</p>
);

// ✅ Correct - wrap trong parent
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// ✅ Better - dùng Fragment để tránh extra DOM node
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);

// 2. Close all tags
<img src="image.jpg" />  // Self-closing
<br />

// 3. camelCase cho attributes
<div className="container">   // Không phải class
<label htmlFor="input">       // Không phải for
<button onClick={handler}>    // Không phải onclick

// 4. JavaScript expressions trong {}
const name = "John";
const element = <h1>Hello, {name}</h1>;

// 5. Inline styles là object
<div style={{ color: 'red', fontSize: '16px' }}>
```

### Conditional Rendering

```jsx
// 1. If/else (outside JSX)
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>Welcome back!</h1>;
  }
  return <h1>Please sign in</h1>;
}

// 2. Ternary operator
function Greeting({ isLoggedIn }) {
  return (
    <h1>{isLoggedIn ? 'Welcome back!' : 'Please sign in'}</h1>
  );
}

// 3. Logical AND (&&)
function Notification({ count }) {
  return (
    <div>
      {count > 0 && <span>You have {count} notifications</span>}
    </div>
  );
}

// ⚠️ Pitfall với &&
// ❌ Wrong - 0 sẽ được render
{count && <span>{count} items</span>}

// ✅ Correct
{count > 0 && <span>{count} items</span>}
{Boolean(count) && <span>{count} items</span>}

// 4. Nullish coalescing
function Welcome({ name }) {
  return <h1>Hello, {name ?? 'Guest'}</h1>;
}
```

### Lists và Keys

```jsx
// Basic list rendering
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Key rules:
// ✅ Use unique, stable IDs
{items.map(item => <Item key={item.id} {...item} />)}

// ❌ Avoid index as key (for dynamic lists)
{items.map((item, index) => <Item key={index} {...item} />)}
// Index OK for: static lists that never reorder/filter

// ❌ Never use random values
{items.map(item => <Item key={Math.random()} {...item} />)}

// Why keys matter:
// - Help React identify which items changed
// - Preserve component state correctly
// - Optimize re-renders
```

## 1.2 Components

### Function Components

```jsx
// Basic component
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// Arrow function
const Welcome = (props) => {
  return <h1>Hello, {props.name}</h1>;
};

// Destructuring props
const Welcome = ({ name, age }) => {
  return (
    <div>
      <h1>Hello, {name}</h1>
      <p>Age: {age}</p>
    </div>
  );
};

// Default props
const Button = ({ text = "Click me", disabled = false }) => {
  return <button disabled={disabled}>{text}</button>;
};

// Usage
<Welcome name="John" age={25} />
<Button />
<Button text="Submit" disabled={true} />
```

### Props

```jsx
// Props là read-only
// ❌ Never mutate props
function Component({ data }) {
  data.value = 'new'; // DON'T DO THIS!
}

// Children prop
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

<Card title="Profile">
  <p>Name: John</p>
  <p>Email: john@example.com</p>
</Card>

// Spread props
const buttonProps = { type: 'submit', disabled: false };
<button {...buttonProps}>Submit</button>

// Rest props
function Button({ variant, ...rest }) {
  return <button className={`btn-${variant}`} {...rest} />;
}
```

### Component Composition

```jsx
// Composition over Inheritance
// React khuyến khích composition thay vì inheritance

// 1. Containment - dùng children
function FancyBorder({ color, children }) {
  return (
    <div className={`fancy-border-${color}`}>
      {children}
    </div>
  );
}

function WelcomeDialog() {
  return (
    <FancyBorder color="blue">
      <h1>Welcome</h1>
      <p>Thank you for visiting!</p>
    </FancyBorder>
  );
}

// 2. Specialization
function Dialog({ title, message, children }) {
  return (
    <FancyBorder color="blue">
      <h1>{title}</h1>
      <p>{message}</p>
      {children}
    </FancyBorder>
  );
}

function WelcomeDialog() {
  return (
    <Dialog
      title="Welcome"
      message="Thank you for visiting!"
    />
  );
}

// 3. Named slots
function Layout({ header, sidebar, content, footer }) {
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{content}</main>
      <footer>{footer}</footer>
    </div>
  );
}

<Layout
  header={<Header />}
  sidebar={<Sidebar />}
  content={<MainContent />}
  footer={<Footer />}
/>
```

## 1.3 State với useState

### Basic useState

```jsx
import { useState } from 'react';

function Counter() {
  // Syntax: const [state, setState] = useState(initialValue);
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

### State Update Patterns

```jsx
// 1. Direct update
setCount(5);

// 2. Functional update (khi cần previous state)
setCount(prev => prev + 1);

// ⚠️ Important: setState is asynchronous
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  // count chỉ tăng 1, không phải 3!
}

// ✅ Correct với functional update
function handleClick() {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  // count tăng 3
}

// 3. Object state
const [user, setUser] = useState({ name: '', email: '' });

// ❌ Wrong - mutating directly
user.name = 'John';
setUser(user);

// ✅ Correct - new object
setUser({ ...user, name: 'John' });
setUser(prev => ({ ...prev, name: 'John' }));

// 4. Array state
const [items, setItems] = useState([]);

// Add
setItems([...items, newItem]);
setItems(prev => [...prev, newItem]);

// Remove
setItems(items.filter(item => item.id !== id));

// Update
setItems(items.map(item =>
  item.id === id ? { ...item, done: true } : item
));

// 5. Lazy initialization (for expensive computations)
const [data, setData] = useState(() => {
  const saved = localStorage.getItem('data');
  return saved ? JSON.parse(saved) : [];
});
```

### Multiple State Variables

```jsx
// Approach 1: Multiple useState
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  // ...
}

// Approach 2: Single object state
function Form() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
}

// Khi nào dùng cái nào?
// - Multiple useState: state thay đổi độc lập
// - Single object: state liên quan, thay đổi cùng lúc
```

## 1.4 Event Handling

### Basic Events

```jsx
// 1. Click event
function Button() {
  const handleClick = () => {
    console.log('Button clicked');
  };

  return <button onClick={handleClick}>Click me</button>;
}

// 2. Inline handler (OK cho simple logic)
<button onClick={() => console.log('clicked')}>Click</button>

// 3. Passing arguments
function ItemList({ items }) {
  const handleDelete = (id) => {
    console.log('Delete item:', id);
  };

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// 4. Event object
function Input() {
  const handleChange = (event) => {
    console.log(event.target.value);
    console.log(event.target.name);
  };

  return <input onChange={handleChange} name="username" />;
}

// 5. Prevent default
function Form() {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Common Events

```jsx
// Mouse events
onClick, onDoubleClick, onMouseEnter, onMouseLeave, onMouseMove

// Form events
onChange, onSubmit, onFocus, onBlur

// Keyboard events
onKeyDown, onKeyUp, onKeyPress

// Touch events (mobile)
onTouchStart, onTouchMove, onTouchEnd

// Example: Input with validation
function EmailInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(''); // Clear error on change
  };

  const handleBlur = () => {
    if (!email.includes('@')) {
      setError('Invalid email');
    }
  };

  return (
    <div>
      <input
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
```

---

# Level 2: Intermediate

## 2.1 useEffect Hook

### Effect Lifecycle

```
Component Mount → Effect runs → Component updates →
Cleanup runs → Effect runs again → ... →
Component unmount → Final cleanup
```

### Basic useEffect

```jsx
import { useEffect } from 'react';

// 1. Run on every render
useEffect(() => {
  console.log('Runs on every render');
});

// 2. Run only on mount (componentDidMount)
useEffect(() => {
  console.log('Runs once on mount');
}, []);

// 3. Run when dependencies change (componentDidUpdate)
useEffect(() => {
  console.log('userId changed:', userId);
}, [userId]);

// 4. Cleanup (componentWillUnmount)
useEffect(() => {
  const subscription = api.subscribe(data => {
    setData(data);
  });

  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, []);
```

### Data Fetching

```jsx
// Basic fetching
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <UserCard user={user} />;
}

// With cleanup (AbortController)
useEffect(() => {
  const controller = new AbortController();

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        signal: controller.signal
      });
      const data = await response.json();
      setUser(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    }
  };

  fetchUser();

  return () => {
    controller.abort(); // Cancel request on cleanup
  };
}, [userId]);
```

### useEffect Dependencies

```jsx
// ❌ Missing dependency
useEffect(() => {
  fetchData(userId); // userId không trong deps
}, []);

// ✅ Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Object/array in deps causes infinite loop
const options = { page: 1 }; // New object every render
useEffect(() => {
  fetchData(options);
}, [options]); // Always "new" → infinite loop

// ✅ Primitive values or stable references
const page = 1;
useEffect(() => {
  fetchData({ page });
}, [page]);

// ✅ Or useMemo for objects
const options = useMemo(() => ({ page }), [page]);
useEffect(() => {
  fetchData(options);
}, [options]);

// Dependency array rules:
// - [] → run once on mount
// - [a, b] → run when a OR b changes
// - undefined → run every render
// - Include all values from component scope used in effect
```

## 2.2 useRef Hook

### DOM References

```jsx
function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}

// Forward ref to child component
const FancyInput = forwardRef((props, ref) => {
  return <input ref={ref} className="fancy" {...props} />;
});

function Parent() {
  const inputRef = useRef(null);
  return <FancyInput ref={inputRef} />;
}
```

### Mutable Values

```jsx
// useRef không trigger re-render khi thay đổi
// Perfect cho values cần persist nhưng không affect UI

// 1. Track previous value
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      Now: {count}, Before: {prevCount}
    </div>
  );
}

// 2. Timer reference
function Timer() {
  const intervalRef = useRef(null);
  const [count, setCount] = useState(0);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <p>{count}</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}

// 3. Track if component is mounted
function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}
```

## 2.3 useContext Hook

### Creating Context

```jsx
import { createContext, useContext, useState } from 'react';

// 1. Create context
const ThemeContext = createContext(null);

// 2. Create provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Create custom hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 4. Use in app
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className={theme}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </header>
  );
}
```

### Multiple Contexts

```jsx
// Auth context
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const user = await authService.login(credentials);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Combine providers
function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

## 2.4 useReducer Hook

### Basic useReducer

```jsx
import { useReducer } from 'react';

// 1. Define initial state
const initialState = {
  count: 0,
  step: 1
};

// 2. Define reducer
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + state.step };
    case 'DECREMENT':
      return { ...state, count: state.count - state.step };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return initialState;
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

// 3. Use in component
function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <input
        type="number"
        value={state.step}
        onChange={e => dispatch({
          type: 'SET_STEP',
          payload: Number(e.target.value)
        })}
      />
    </div>
  );
}
```

### useState vs useReducer

```
┌─────────────────────────────────────────────────────────────┐
│                  useState vs useReducer                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  useState:                                                   │
│  - Simple state (primitives, simple objects)                │
│  - Few state transitions                                    │
│  - Independent state pieces                                 │
│  - State logic is simple                                    │
│                                                              │
│  useReducer:                                                 │
│  - Complex state objects                                    │
│  - Many state transitions                                   │
│  - Related state pieces (update together)                   │
│  - Complex state logic                                      │
│  - Need predictable state updates                           │
│  - Easier to test (pure function)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 2.5 useMemo và useCallback

### useMemo - Memoize Values

```jsx
import { useMemo } from 'react';

// Expensive computation
function ProductList({ products, filterText }) {
  // ✅ Only recalculate when products or filterText change
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...');
    return products.filter(p =>
      p.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [products, filterText]);

  return (
    <ul>
      {filteredProducts.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}

// Stable reference for deps/props
function Parent() {
  const config = useMemo(() => ({
    theme: 'dark',
    language: 'en'
  }), []); // Stable reference

  return <Child config={config} />;
}
```

### useCallback - Memoize Functions

```jsx
import { useCallback } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  // ❌ New function every render
  const handleClick = () => {
    console.log('clicked');
  };

  // ✅ Stable function reference
  const handleClickMemo = useCallback(() => {
    console.log('clicked');
  }, []);

  // With dependencies
  const handleDelete = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []); // setItems is stable

  return <Child onClick={handleClickMemo} />;
}

// Khi nào dùng useCallback?
// 1. Pass callback to memoized child component
const MemoChild = React.memo(Child);
<MemoChild onClick={handleClick} /> // Need useCallback

// 2. Callback in dependency array
useEffect(() => {
  handleFetch();
}, [handleFetch]); // Need useCallback
```

### Performance Tips

```jsx
// ❌ Premature optimization
const value = useMemo(() => a + b, [a, b]); // Simple math, không cần

// ✅ Appropriate use cases:
// 1. Expensive computations
const sorted = useMemo(() =>
  [...items].sort((a, b) => a.date - b.date),
  [items]
);

// 2. Referential equality for deps
const options = useMemo(() => ({ page, limit }), [page, limit]);
useEffect(() => { fetchData(options); }, [options]);

// 3. Prevent child re-renders
const MemoChild = React.memo(({ data, onClick }) => {
  return <div onClick={onClick}>{data.name}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => ({ name: 'John' }), []);
  const handleClick = useCallback(() => {}, []);

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <MemoChild data={data} onClick={handleClick} />
    </>
  );
}
```

## 2.6 Custom Hooks

### Pattern: Extract Logic

```jsx
// Before: Logic trong component
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  // ... render logic
}

// After: Extract to custom hook
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}

function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);
  // Clean render logic
}
```

### Common Custom Hooks

```jsx
// 1. useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// 2. useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);
}

// 3. useOnClickOutside
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Usage
function Dropdown() {
  const ref = useRef();
  const [isOpen, setIsOpen] = useState(false);

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}

// 4. useWindowSize
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// 5. useFetch - Generic data fetching
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Network error');
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
```

## 2.7 Forms

### Controlled Components

```jsx
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Submit:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### React Hook Form

```jsx
import { useForm } from 'react-hook-form';

function SignupForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    await submitToAPI(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: 'Invalid email'
          }
        })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        type="password"
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Min 8 characters'
          }
        })}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password.message}</span>}

      <input
        type="password"
        {...register('confirmPassword', {
          required: 'Please confirm password',
          validate: value => value === password || 'Passwords do not match'
        })}
        placeholder="Confirm Password"
      />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <button disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

---

# Level 3: Advanced

## 3.1 Performance Optimization

### React.memo

```jsx
// Prevent unnecessary re-renders
const ExpensiveList = React.memo(function ExpensiveList({ items, onItemClick }) {
  console.log('ExpensiveList rendered');
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});

// Custom comparison function
const UserCard = React.memo(
  function UserCard({ user, onClick }) {
    return <div onClick={onClick}>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);

// When to use React.memo:
// ✅ Component renders often with same props
// ✅ Component has expensive render logic
// ✅ Parent re-renders frequently
// ❌ Props change frequently anyway
// ❌ Component is lightweight
```

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

// Route-based splitting
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Component-based splitting
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Load Chart</button>
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}

// Named exports
const { Modal } = lazy(() =>
  import('./components/Modal').then(module => ({
    default: module.Modal
  }))
);
```

### Virtualization

```jsx
// react-window for large lists
import { FixedSizeList, VariableSizeList } from 'react-window';

// Fixed size items
function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style} className="row">
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
}

// Variable size items
function ChatMessages({ messages }) {
  const listRef = useRef();

  const getItemSize = (index) => {
    // Calculate height based on content
    return messages[index].content.length > 100 ? 80 : 50;
  };

  const Row = ({ index, style }) => (
    <div style={style}>
      <Message data={messages[index]} />
    </div>
  );

  return (
    <VariableSizeList
      ref={listRef}
      height={600}
      itemCount={messages.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}
```

### Performance Monitoring

```jsx
// React DevTools Profiler
// Browser DevTools → React tab → Profiler

// Programmatic profiling
import { Profiler } from 'react';

function onRenderCallback(
  id,              // Profiler tree id
  phase,           // "mount" | "update"
  actualDuration,  // Time spent rendering
  baseDuration,    // Estimated time without memoization
  startTime,
  commitTime
) {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration
  });
}

<Profiler id="Navigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>

// Why did you render (library)
// npm install @welldone-software/why-did-you-render
import whyDidYouRender from '@welldone-software/why-did-you-render';

whyDidYouRender(React, {
  trackAllPureComponents: true
});
```

## 3.2 Error Boundaries

### Class-based Error Boundary

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to service
    logErrorToService(error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### react-error-boundary Library

```jsx
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => logToService(error, info)}
      onReset={() => {
        // Reset app state
        queryClient.clear();
      }}
    >
      <Dashboard />
    </ErrorBoundary>
  );
}

// useErrorBoundary hook
function DataLoader() {
  const { showBoundary } = useErrorBoundary();

  const loadData = async () => {
    try {
      await fetchData();
    } catch (error) {
      showBoundary(error); // Trigger error boundary
    }
  };
}
```

## 3.3 Render Props và HOC Patterns

### Render Props

```jsx
// Pattern: Pass render function as prop
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return render(position);
}

// Usage
<MouseTracker
  render={({ x, y }) => (
    <div>Mouse position: {x}, {y}</div>
  )}
/>

// Children as function variant
function DataProvider({ children, url }) {
  const { data, loading, error } = useFetch(url);
  return children({ data, loading, error });
}

<DataProvider url="/api/users">
  {({ data, loading }) =>
    loading ? <Spinner /> : <UserList users={data} />
  }
</DataProvider>
```

### Higher-Order Components (HOC)

```jsx
// HOC: Function that takes component and returns enhanced component
function withAuth(WrappedComponent) {
  return function WithAuthComponent(props) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;

    return <WrappedComponent {...props} user={user} />;
  };
}

const ProtectedDashboard = withAuth(Dashboard);

// HOC with config
function withTheme(WrappedComponent, defaultTheme = 'light') {
  return function WithThemeComponent(props) {
    const theme = useTheme() || defaultTheme;
    return <WrappedComponent {...props} theme={theme} />;
  };
}

// Composing HOCs
const enhance = compose(
  withAuth,
  withTheme,
  withErrorBoundary
);

const EnhancedComponent = enhance(MyComponent);

// ⚠️ HOC Caveats:
// - Static methods không được copy tự động
// - Refs không được forward tự động
// - Wrapper hell với nhiều HOCs
// → Modern: Prefer hooks over HOCs
```

### Compound Components

```jsx
// Pattern for related components that share implicit state
const TabsContext = createContext();

function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
};

Tabs.Tab = function Tab({ id, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={activeTab === id ? 'active' : ''}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function TabPanel({ id, children }) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === id ? <div className="panel">{children}</div> : null;
};

// Usage - Clean, declarative API
<Tabs defaultTab="profile">
  <Tabs.List>
    <Tabs.Tab id="profile">Profile</Tabs.Tab>
    <Tabs.Tab id="settings">Settings</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="profile">
    <ProfileContent />
  </Tabs.Panel>
  <Tabs.Panel id="settings">
    <SettingsContent />
  </Tabs.Panel>
</Tabs>
```

## 3.4 React Router

### Basic Routing

```jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  Outlet
} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          Home
        </NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/users">Users</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />}>
          <Route index element={<UserList />} />
          <Route path=":userId" element={<UserDetail />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Navigation và Params

```jsx
// useNavigate - Programmatic navigation
function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await login();
    navigate('/dashboard');
    // navigate('/dashboard', { replace: true }); // No back button
    // navigate(-1); // Go back
  };
}

// useParams - URL params
function UserDetail() {
  const { userId } = useParams();
  const { user } = useUser(userId);

  return <div>User: {user?.name}</div>;
}

// useSearchParams - Query string
function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category');
  const page = searchParams.get('page') || '1';

  const handleFilter = (cat) => {
    setSearchParams({ category: cat, page: '1' });
  };

  return (
    <div>
      <Filters onChange={handleFilter} />
      <Products category={category} page={page} />
    </div>
  );
}

// useLocation - Current location
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
}
```

### Protected Routes

```jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Usage
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// Role-based protection
function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRoles={['admin']}>
        <AdminPanel />
      </RoleRoute>
    </ProtectedRoute>
  }
/>
```

## 3.5 State Architecture

### State Categories

```
┌─────────────────────────────────────────────────────────────┐
│                    Types of State                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Local/UI State                                          │
│     - useState, useReducer                                  │
│     - Form inputs, modals, accordions                       │
│     - Stays in component                                    │
│                                                              │
│  2. Shared/Global State                                     │
│     - Context, Redux, Zustand                               │
│     - User auth, theme, app settings                        │
│     - Shared across components                              │
│                                                              │
│  3. Server State                                            │
│     - TanStack Query, SWR                                   │
│     - Cached API data                                       │
│     - Has loading/error/stale states                        │
│                                                              │
│  4. URL State                                               │
│     - React Router                                          │
│     - Filters, pagination, current page                     │
│     - Shareable, bookmarkable                               │
│                                                              │
│  5. Form State                                              │
│     - React Hook Form, Formik                               │
│     - Values, validation, touched, dirty                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### State Location Decision Tree

```
Need state? → Is it used by single component?
                    │
              ┌─────┴─────┐
              ▼           ▼
             Yes          No
              │           │
              ▼           ▼
           useState    Multiple components
                       need it?
                           │
                     ┌─────┴─────┐
                     ▼           ▼
                    Yes          No
                     │           │
                     ▼           ▼
              Nearby siblings?   n/a
                     │
               ┌─────┴─────┐
               ▼           ▼
              Yes          No
               │           │
               ▼           ▼
         Lift to parent  Global state
                         (Context/Redux)
```

## 3.6 Testing

### Unit Testing with React Testing Library

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Basic render and query
test('renders greeting', () => {
  render(<Greeting name="John" />);
  expect(screen.getByText('Hello, John')).toBeInTheDocument();
});

// User interactions
test('counter increments', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  const button = screen.getByRole('button', { name: /increment/i });
  await user.click(button);

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

// Form testing
test('form submission', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
});

// Async testing
test('loads user data', async () => {
  render(<UserProfile userId="1" />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});

// Query priority (from most to least accessible):
// 1. getByRole - accessible queries
// 2. getByLabelText - form fields
// 3. getByPlaceholderText
// 4. getByText - non-interactive elements
// 5. getByTestId - last resort
```

### Integration Testing

```jsx
// Testing with providers
function renderWithProviders(ui, options = {}) {
  const {
    initialState = {},
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

test('protected route redirects when not logged in', () => {
  renderWithProviders(<App />, { route: '/dashboard' });
  expect(screen.getByText(/login/i)).toBeInTheDocument();
});
```

---

# Real-world Applications

## Trading Platform Example

```jsx
// Real-time price updates với WebSocket
function usePriceStream(symbol) {
  const [price, setPrice] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket(`wss://api.trading.com/stream/${symbol}`);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(data.price);
    };

    wsRef.current.onerror = () => {
      // Reconnect logic
      setTimeout(() => {
        wsRef.current = new WebSocket(`wss://api.trading.com/stream/${symbol}`);
      }, 3000);
    };

    return () => wsRef.current?.close();
  }, [symbol]);

  return price;
}

// Optimized order book rendering
const OrderBook = React.memo(function OrderBook({ orders }) {
  const sortedOrders = useMemo(() =>
    [...orders].sort((a, b) => b.price - a.price),
    [orders]
  );

  return (
    <FixedSizeList
      height={400}
      itemCount={sortedOrders.length}
      itemSize={32}
      width="100%"
    >
      {({ index, style }) => (
        <OrderRow style={style} order={sortedOrders[index]} />
      )}
    </FixedSizeList>
  );
});
```

## E-commerce Cart

```jsx
// Cart context with useReducer
const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(i => i.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: action.payload.quantity }
            : i
        )
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const total = useMemo(() =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items]
  );

  const addItem = useCallback((item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const value = useMemo(() => ({
    items: state.items,
    total,
    addItem,
    removeItem,
    itemCount: state.items.length
  }), [state.items, total, addItem, removeItem]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
```

## Admin Dashboard with Data Tables

```jsx
// Reusable data table with sorting, filtering, pagination
function useDataTable(data, options = {}) {
  const { pageSize = 10 } = options;

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(item[key]).toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  return {
    data: paginatedData,
    sortConfig,
    handleSort,
    filters,
    handleFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems: sortedData.length
  };
}
```

## Form Builder Pattern

```jsx
// Dynamic form from config
function DynamicForm({ config, onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <input
            type={field.type}
            {...register(field.name, field.validation)}
            placeholder={field.placeholder}
          />
        );
      case 'select':
        return (
          <select {...register(field.name, field.validation)}>
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            {...register(field.name, field.validation)}
            placeholder={field.placeholder}
          />
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {config.fields.map(field => (
        <div key={field.name} className="form-field">
          <label>{field.label}</label>
          {renderField(field)}
          {errors[field.name] && (
            <span className="error">{errors[field.name].message}</span>
          )}
        </div>
      ))}
      <button type="submit">{config.submitText || 'Submit'}</button>
    </form>
  );
}

// Usage
const formConfig = {
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      validation: { required: 'Email required', pattern: { value: /\S+@\S+/, message: 'Invalid email' } }
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ]
    }
  ],
  submitText: 'Create User'
};
```

---

# Interview Questions

## Basic Level

1. **JSX là gì?**
   - JavaScript XML - syntax extension
   - Cho phép viết HTML-like trong JS
   - Babel compile thành React.createElement()

2. **Props vs State?**
   - Props: passed from parent, read-only
   - State: managed internally, can change

3. **Controlled vs Uncontrolled components?**
   - Controlled: React quản lý state (value + onChange)
   - Uncontrolled: DOM quản lý (ref)

4. **Key prop trong lists?**
   - Help React identify elements
   - Should be unique, stable
   - Không dùng index cho dynamic lists

## Intermediate Level

5. **useEffect dependencies?**
   - `[]`: run once on mount
   - `[a, b]`: run khi a hoặc b change
   - No array: run every render
   - Cleanup function cho unsubscribe

6. **useCallback vs useMemo?**
   - useCallback: memoize function reference
   - useMemo: memoize computed value
   - Both dùng để optimize re-renders

7. **Context performance issues?**
   - All consumers re-render khi value change
   - Solutions: split contexts, memoize value, use selectors

8. **Virtual DOM là gì?**
   - In-memory representation của real DOM
   - React so sánh old vs new VDOM
   - Tính toán minimal DOM updates (diffing)

## Advanced Level

9. **React Fiber là gì?**
   - Reconciliation engine (React 16+)
   - Incremental rendering
   - Có thể pause, abort, resume work
   - Priority-based scheduling

10. **Reconciliation algorithm?**
    - Compare elements by type first
    - Same type: update props
    - Different type: remount entire subtree
    - Keys cho list optimization

11. **useLayoutEffect vs useEffect?**
    - useLayoutEffect: synchronous, runs before browser paint
    - useEffect: asynchronous, runs after paint
    - useLayoutEffect cho DOM measurements, scroll position

12. **Error Boundaries limitations?**
    - Only catch errors during rendering
    - Không catch: event handlers, async code, server-side, errors in boundary itself
    - Phải dùng class component (hooks chưa support)

13. **When to use useReducer?**
    - Complex state logic
    - Multiple sub-values
    - Next state depends on previous
    - Easier to test (pure function)

14. **React 18 new features?**
    - Concurrent rendering
    - Automatic batching
    - Transitions (startTransition)
    - Suspense for data fetching
    - useId, useDeferredValue, useSyncExternalStore

15. **Server Components vs Client Components?**
    - Server: render on server, no interactivity, smaller bundle
    - Client: run in browser, can use hooks, interactivity
    - 'use client' directive

## Practical Questions

16. **How to optimize a slow React app?**
    - Profile with React DevTools
    - React.memo for expensive components
    - useMemo/useCallback for expensive computations
    - Code splitting with lazy/Suspense
    - Virtualization for large lists
    - Avoid inline functions in JSX

17. **How to handle global state?**
    - Small app: Context API
    - Medium app: Zustand, Jotai
    - Large app: Redux Toolkit
    - Server state: TanStack Query

18. **How to test React components?**
    - Unit: React Testing Library + Jest
    - Integration: Test with providers
    - E2E: Cypress, Playwright
    - Query by role first (accessibility)

