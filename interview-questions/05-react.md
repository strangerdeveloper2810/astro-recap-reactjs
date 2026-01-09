# React Interview Questions / Cau Hoi Phong Van React

---

## 1. What is Virtual DOM and how does it work? / Virtual DOM la gi va hoat dong nhu the nao?

**EN:** Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new Virtual DOM tree, compares it with the previous one (diffing), and updates only the changed parts in the real DOM (reconciliation). This minimizes expensive DOM operations.

```javascript
// React handles this internally
// When state changes:
// 1. New Virtual DOM created
// 2. Diff with old Virtual DOM
// 3. Calculate minimal changes
// 4. Batch update real DOM
```

**VI:** Virtual DOM la ban sao nhe cua DOM that duoc luu trong bo nho. Khi state thay doi, React tao Virtual DOM moi, so sanh voi cai cu (diffing), va chi cap nhat nhung phan thay doi vao DOM that (reconciliation). Dieu nay giup giam thieu cac thao tac DOM ton kem.

---

## 2. What is Reconciliation in React? / Reconciliation trong React la gi?

**EN:** Reconciliation is React's algorithm for comparing two Virtual DOM trees and determining the minimum number of operations to update the real DOM. It uses a heuristic O(n) algorithm based on two assumptions: elements of different types produce different trees, and keys help identify stable elements across renders.

```javascript
// React's reconciliation priorities:
// 1. Different element types -> rebuild entire subtree
// 2. Same element type -> update attributes only
// 3. Keys help track list items efficiently
```

**VI:** Reconciliation la thuat toan cua React de so sanh hai cay Virtual DOM va xac dinh so luong thao tac toi thieu de cap nhat DOM that. No su dung thuat toan O(n) dua tren hai gia dinh: cac element khac loai tao ra cac cay khac nhau, va keys giup xac dinh cac element on dinh qua cac lan render.

---

## 3. What is React Fiber? / React Fiber la gi?

**EN:** React Fiber is the reimplementation of React's core algorithm (introduced in React 16). It enables incremental rendering - splitting rendering work into chunks and spreading it over multiple frames. This allows React to pause, abort, or reuse work, and assign priority to different types of updates.

```javascript
// Fiber enables:
// - Pause work and come back later
// - Assign priority to different types of work
// - Reuse previously completed work
// - Abort work if no longer needed

// Priority levels (conceptual):
// Immediate -> User interactions
// High -> Animations
// Normal -> Data fetching
// Low -> Analytics
```

**VI:** React Fiber la viec tai cau truc lai thuat toan cot loi cua React (gioi thieu trong React 16). No cho phep incremental rendering - chia nho cong viec render thanh cac phan va trai ra nhieu frame. Dieu nay giup React co the tam dung, huy bo, hoac tai su dung cong viec, va gan do uu tien cho cac loai cap nhat khac nhau.

---

## 4. What is JSX? / JSX la gi?

**EN:** JSX (JavaScript XML) is a syntax extension that allows writing HTML-like code in JavaScript. It gets compiled to `React.createElement()` calls by Babel. JSX is not required but makes React code more readable and expressive.

```javascript
// JSX
const element = <h1 className="title">Hello, {name}!</h1>;

// Compiles to:
const element = React.createElement(
  'h1',
  { className: 'title' },
  'Hello, ',
  name,
  '!'
);
```

**VI:** JSX (JavaScript XML) la mo rong cu phap cho phep viet code giong HTML trong JavaScript. No duoc bien dich thanh cac loi goi `React.createElement()` boi Babel. JSX khong bat buoc nhung giup code React de doc va bieu dat hon.

---

## 5. What's the difference between Functional and Class Components? / Su khac biet giua Functional va Class Components la gi?

**EN:** Functional components are plain JavaScript functions that return JSX. Class components extend `React.Component` and use `render()` method. Since React 16.8, functional components can use hooks for state and lifecycle, making them the preferred choice.

```javascript
// Functional Component
function Welcome({ name }) {
  const [count, setCount] = useState(0);
  return <h1>Hello, {name}! Count: {count}</h1>;
}

// Class Component
class Welcome extends React.Component {
  state = { count: 0 };
  render() {
    return <h1>Hello, {this.props.name}! Count: {this.state.count}</h1>;
  }
}
```

**VI:** Functional components la cac ham JavaScript thuan tra ve JSX. Class components ke thua `React.Component` va su dung phuong thuc `render()`. Tu React 16.8, functional components co the dung hooks cho state va lifecycle, tro thanh lua chon uu tien.

---

## 6. What's the difference between Props and State? / Su khac biet giua Props va State la gi?

**EN:** Props are read-only data passed from parent to child components - they cannot be modified by the receiving component. State is mutable data managed within a component - changes trigger re-renders. Props flow down, state is local.

```javascript
function Parent() {
  const [count, setCount] = useState(0); // State - mutable, local
  return <Child count={count} />; // Props - passed down
}

function Child({ count }) {
  // count is a prop - read-only
  // Cannot do: count = 5; // Wrong!
  return <span>{count}</span>;
}
```

**VI:** Props la du lieu chi doc duoc truyen tu component cha xuong component con - khong the thay doi boi component nhan. State la du lieu co the thay doi, duoc quan ly trong component - thay doi se trigger re-render. Props di xuong, state la cuc bo.

---

## 7. How does useState work? / useState hoat dong nhu the nao?

**EN:** `useState` is a hook that adds state to functional components. It returns an array with the current state value and a setter function. The setter can accept a new value or a function (for updates based on previous state). State updates are asynchronous and batched.

```javascript
const [count, setCount] = useState(0);

// Direct update
setCount(5);

// Functional update (recommended for updates based on prev state)
setCount(prev => prev + 1);

// With objects - must spread
const [user, setUser] = useState({ name: '', age: 0 });
setUser(prev => ({ ...prev, name: 'John' }));
```

**VI:** `useState` la hook them state vao functional components. No tra ve mang gom gia tri state hien tai va ham setter. Setter co the nhan gia tri moi hoac mot ham (de cap nhat dua tren state truoc). Cap nhat state la bat dong bo va duoc gop lai.

---

## 8. How does useEffect work with dependencies? / useEffect hoat dong nhu the nao voi dependencies?

**EN:** `useEffect` runs side effects after render. The dependency array controls when it runs: empty array = once on mount, no array = every render, with deps = when deps change. React compares deps using `Object.is`.

```javascript
// Runs once on mount
useEffect(() => {
  fetchData();
}, []);

// Runs when count or id changes
useEffect(() => {
  fetchUser(id);
}, [count, id]);

// Runs every render (usually wrong)
useEffect(() => {
  console.log('Every render');
});
```

**VI:** `useEffect` chay side effects sau khi render. Mang dependency kiem soat khi nao no chay: mang rong = mot lan khi mount, khong co mang = moi lan render, co deps = khi deps thay doi. React so sanh deps bang `Object.is`.

---

## 9. How to handle cleanup in useEffect? / Cach xu ly cleanup trong useEffect?

**EN:** Return a cleanup function from useEffect. It runs before the component unmounts and before the effect runs again (on deps change). Essential for subscriptions, timers, and event listeners to prevent memory leaks.

```javascript
useEffect(() => {
  const subscription = api.subscribe(data => {
    setData(data);
  });

  const timer = setInterval(() => tick(), 1000);

  // Cleanup function
  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, []);
```

**VI:** Tra ve ham cleanup tu useEffect. No chay truoc khi component unmount va truoc khi effect chay lai (khi deps thay doi). Can thiet cho subscriptions, timers, va event listeners de tranh memory leaks.

---

## 10. What is useRef and when to use it? / useRef la gi va khi nao su dung?

**EN:** `useRef` returns a mutable ref object whose `.current` property persists across renders without causing re-renders when changed. Use for: DOM access, storing mutable values, and keeping values between renders without triggering updates.

```javascript
function TextInput() {
  const inputRef = useRef(null);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++; // Doesn't cause re-render
  });

  const focusInput = () => {
    inputRef.current.focus(); // DOM access
  };

  return <input ref={inputRef} />;
}
```

**VI:** `useRef` tra ve object ref co the thay doi ma thuoc tinh `.current` ton tai qua cac lan render ma khong gay re-render khi thay doi. Dung de: truy cap DOM, luu gia tri co the thay doi, va giu gia tri giua cac lan render ma khong trigger cap nhat.

---

## 11. What is useMemo and when to use it? / useMemo la gi va khi nao su dung?

**EN:** `useMemo` memoizes computed values, recalculating only when dependencies change. Use for expensive calculations, referential equality for objects/arrays passed to children, or avoiding unnecessary re-renders in optimized components.

```javascript
function ExpensiveComponent({ items, filter }) {
  // Only recalculates when items or filter changes
  const filteredItems = useMemo(() => {
    return items.filter(item => item.includes(filter));
  }, [items, filter]);

  // Object reference stays stable
  const config = useMemo(() => ({
    theme: 'dark',
    size: 'large'
  }), []);

  return <List items={filteredItems} config={config} />;
}
```

**VI:** `useMemo` ghi nho cac gia tri tinh toan, chi tinh lai khi dependencies thay doi. Dung cho cac phep tinh ton kem, dam bao referential equality cho objects/arrays truyen cho children, hoac tranh re-render khong can thiet trong cac component da toi uu.

---

## 12. What is useCallback and when to use it? / useCallback la gi va khi nao su dung?

**EN:** `useCallback` memoizes functions, returning the same function reference unless dependencies change. Use when passing callbacks to optimized children (React.memo), in useEffect dependencies, or when function identity matters.

```javascript
function Parent({ id }) {
  // Without useCallback: new function every render
  // With useCallback: same reference unless id changes
  const handleClick = useCallback(() => {
    console.log('Clicked:', id);
  }, [id]);

  // MemoizedChild won't re-render unnecessarily
  return <MemoizedChild onClick={handleClick} />;
}

const MemoizedChild = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
```

**VI:** `useCallback` ghi nho cac ham, tra ve cung tham chieu ham tru khi dependencies thay doi. Dung khi truyen callbacks cho children da toi uu (React.memo), trong dependencies cua useEffect, hoac khi function identity quan trong.

---

## 13. How does useContext work? / useContext hoat dong nhu the nao?

**EN:** `useContext` accesses context values without prop drilling. Create context with `createContext`, provide values with `Provider`, consume with `useContext`. All consumers re-render when context value changes.

```javascript
const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Button() {
  const theme = useContext(ThemeContext); // 'dark'
  return <button className={theme}>Click</button>;
}
```

**VI:** `useContext` truy cap gia tri context ma khong can prop drilling. Tao context voi `createContext`, cung cap gia tri voi `Provider`, su dung voi `useContext`. Tat ca consumers se re-render khi gia tri context thay doi.

---

## 14. What is useReducer and when to use it over useState? / useReducer la gi va khi nao su dung thay cho useState?

**EN:** `useReducer` manages complex state logic with a reducer function. Prefer over useState when: state logic is complex, next state depends on previous, multiple sub-values, or when you want to optimize performance for deep updates.

```javascript
const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

**VI:** `useReducer` quan ly logic state phuc tap voi ham reducer. Uu tien hon useState khi: logic state phuc tap, state ke tiep phu thuoc state truoc, co nhieu gia tri con, hoac khi muon toi uu hieu suat cho cac cap nhat sau.

---

## 15. How to create Custom Hooks? / Cach tao Custom Hooks?

**EN:** Custom hooks are functions starting with "use" that encapsulate reusable stateful logic. They can use other hooks and return any values. Extract common patterns like data fetching, form handling, or subscriptions.

```javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Usage
function App() {
  const [name, setName] = useLocalStorage('name', 'Guest');
  return <input value={name} onChange={e => setName(e.target.value)} />;
}
```

**VI:** Custom hooks la cac ham bat dau bang "use" de dong goi logic stateful co the tai su dung. Chung co the dung cac hooks khac va tra ve bat ky gia tri nao. Trich xuat cac pattern chung nhu data fetching, xu ly form, hoac subscriptions.

---

## 16. What are the Component Lifecycle phases? / Cac giai doan Lifecycle cua Component la gi?

**EN:** React components have three main lifecycle phases: Mounting (component created and inserted into DOM), Updating (re-renders due to prop/state changes), Unmounting (component removed from DOM). Class components have specific methods for each phase.

```javascript
class Example extends React.Component {
  // Mounting
  constructor(props) { }
  static getDerivedStateFromProps(props, state) { }
  render() { }
  componentDidMount() { }

  // Updating
  shouldComponentUpdate(nextProps, nextState) { }
  getSnapshotBeforeUpdate(prevProps, prevState) { }
  componentDidUpdate(prevProps, prevState, snapshot) { }

  // Unmounting
  componentWillUnmount() { }
}
```

**VI:** React components co ba giai doan lifecycle chinh: Mounting (component duoc tao va chen vao DOM), Updating (re-render do thay doi prop/state), Unmounting (component bi xoa khoi DOM). Class components co cac phuong thuc cu the cho tung giai doan.

---

## 17. How to replicate lifecycle methods with useEffect? / Cach mo phong lifecycle methods voi useEffect?

**EN:** useEffect can replicate all class lifecycle methods: empty deps for componentDidMount, cleanup return for componentWillUnmount, deps array for componentDidUpdate equivalent.

```javascript
function Component({ id }) {
  // componentDidMount
  useEffect(() => {
    console.log('Mounted');
  }, []);

  // componentWillUnmount
  useEffect(() => {
    return () => console.log('Will unmount');
  }, []);

  // componentDidUpdate (for specific prop)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    console.log('id updated:', id);
  }, [id]);
}
```

**VI:** useEffect co the mo phong tat ca cac lifecycle methods cua class: deps rong cho componentDidMount, tra ve cleanup cho componentWillUnmount, mang deps cho tuong duong componentDidUpdate.

---

## 18. What is the order of useEffect execution? / Thu tu thuc thi useEffect la gi?

**EN:** Effects run after render, in declaration order. Cleanup runs before the next effect and on unmount. Parent effects run after children's effects. useLayoutEffect runs synchronously after DOM mutations but before paint.

```javascript
function Parent() {
  useEffect(() => {
    console.log('1. Parent effect'); // Runs 4th
    return () => console.log('Parent cleanup');
  }, []);
  return <Child />;
}

function Child() {
  useEffect(() => {
    console.log('2. Child effect'); // Runs 3rd
  }, []);

  useLayoutEffect(() => {
    console.log('3. Child layoutEffect'); // Runs 2nd (sync)
  }, []);

  console.log('4. Child render'); // Runs 1st
  return <div>Child</div>;
}
// Order: Child render -> Child layoutEffect -> Child effect -> Parent effect
```

**VI:** Effects chay sau render, theo thu tu khai bao. Cleanup chay truoc effect tiep theo va khi unmount. Effects cua Parent chay sau effects cua children. useLayoutEffect chay dong bo sau DOM mutations nhung truoc paint.

---

## 19. What are Controlled vs Uncontrolled Components? / Controlled va Uncontrolled Components la gi?

**EN:** Controlled components have form values controlled by React state - single source of truth. Uncontrolled components store values in DOM, accessed via refs. Controlled gives more control, uncontrolled is simpler for basic cases.

```javascript
// Controlled - React controls value
function Controlled() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

// Uncontrolled - DOM controls value
function Uncontrolled() {
  const inputRef = useRef();
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  return <input ref={inputRef} defaultValue="initial" />;
}
```

**VI:** Controlled components co gia tri form duoc kiem soat boi React state - nguon su that duy nhat. Uncontrolled components luu gia tri trong DOM, truy cap qua refs. Controlled cho kiem soat tot hon, uncontrolled don gian hon cho truong hop co ban.

---

## 20. How to handle forms in React? / Cach xu ly forms trong React?

**EN:** Use controlled components with state for each field or a single state object. Handle submission with onSubmit, prevent default, validate, then submit. For complex forms, consider libraries like React Hook Form or Formik.

```javascript
function Form() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors({ email: 'Required' });
      return;
    }
    submitForm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={formData.email} onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

**VI:** Dung controlled components voi state cho moi truong hoac mot object state duy nhat. Xu ly submission voi onSubmit, ngan chan default, validate, roi submit. Cho forms phuc tap, can nhac cac thu vien nhu React Hook Form hoac Formik.

---

## 21. What is the difference between onChange and onBlur? / Su khac biet giua onChange va onBlur la gi?

**EN:** `onChange` fires on every input change (each keystroke). `onBlur` fires when input loses focus. Use onChange for real-time updates/validation, onBlur for validation on field completion to reduce validation frequency.

```javascript
function Input() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  // Real-time update
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  // Validate on blur (when user leaves field)
  const handleBlur = () => {
    if (value.length < 3) {
      setError('Minimum 3 characters');
    } else {
      setError('');
    }
  };

  return (
    <>
      <input value={value} onChange={handleChange} onBlur={handleBlur} />
      {error && <span>{error}</span>}
    </>
  );
}
```

**VI:** `onChange` kich hoat moi khi input thay doi (moi phim nhan). `onBlur` kich hoat khi input mat focus. Dung onChange cho cap nhat/validation thoi gian thuc, onBlur cho validation khi hoan thanh truong de giam tan suat validation.

---

## 22. Why are Keys important in lists? / Tai sao Keys quan trong trong lists?

**EN:** Keys help React identify which items changed, added, or removed in lists. Without proper keys, React may re-render all items or cause bugs with component state. Use stable, unique identifiers - never array index if list can reorder.

```javascript
// Bad - index as key (causes issues on reorder/delete)
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// Good - stable unique id
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// Why it matters - with index key:
// Delete item at index 1: React thinks items shifted
// State of item at index 2 may incorrectly stay at index 1
```

**VI:** Keys giup React xac dinh items nao da thay doi, them, hoac xoa trong lists. Khong co keys dung, React co the re-render tat ca items hoac gay loi voi component state. Dung ID on dinh, duy nhat - khong bao gio dung array index neu list co the sap xep lai.

---

## 23. What is React.memo and how does it work? / React.memo la gi va hoat dong nhu the nao?

**EN:** `React.memo` is a HOC that memoizes functional components, preventing re-renders if props haven't changed (shallow comparison). Use for components that render often with same props. Can provide custom comparison function.

```javascript
// Basic usage
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  console.log('Rendering list');
  return items.map(item => <div key={item.id}>{item.name}</div>);
});

// With custom comparison
const UserCard = React.memo(
  function UserCard({ user, onClick }) {
    return <div onClick={onClick}>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

**VI:** `React.memo` la HOC ghi nho functional components, ngan re-render neu props khong thay doi (so sanh nong). Dung cho components render thuong xuyen voi cung props. Co the cung cap ham so sanh tuy chinh.

---

## 24. What are common React performance optimization techniques? / Cac ky thuat toi uu hieu suat React pho bien la gi?

**EN:** Key techniques: React.memo for component memoization, useMemo/useCallback for values/functions, virtualization for long lists, code splitting with lazy(), avoiding inline objects/functions in JSX, proper key usage, and avoiding unnecessary state.

```javascript
// 1. Memoize components
const List = React.memo(({ items }) => { /*...*/ });

// 2. Memoize callbacks and values
const handleClick = useCallback(() => {}, []);
const computed = useMemo(() => expensiveCalc(data), [data]);

// 3. Virtualize long lists (react-window)
<FixedSizeList height={400} itemCount={10000} itemSize={35}>
  {Row}
</FixedSizeList>

// 4. Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 5. Avoid inline objects (creates new reference each render)
// Bad: <Child style={{ color: 'red' }} />
// Good: const style = useMemo(() => ({ color: 'red' }), []);
```

**VI:** Cac ky thuat chinh: React.memo cho component memoization, useMemo/useCallback cho values/functions, virtualization cho lists dai, code splitting voi lazy(), tranh inline objects/functions trong JSX, su dung key dung cach, va tranh state khong can thiet.

---

## 25. What are Error Boundaries? / Error Boundaries la gi?

**EN:** Error Boundaries are class components that catch JavaScript errors in child component tree, log errors, and display fallback UI. They catch errors during rendering, lifecycle methods, and constructors. They don't catch errors in event handlers, async code, or SSR.

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

**VI:** Error Boundaries la class components bat loi JavaScript trong cay component con, ghi log loi, va hien thi UI du phong. Chung bat loi trong qua trinh rendering, lifecycle methods, va constructors. Chung khong bat loi trong event handlers, async code, hoac SSR.

---

## 26. What is React Suspense? / React Suspense la gi?

**EN:** Suspense lets components "wait" for something (lazy components, data) before rendering, showing a fallback UI during loading. Works with `lazy()` for code splitting and data fetching libraries that support it (React Query, SWR with experimental features).

```javascript
import { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

// Nested Suspense for granular loading states
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
</Suspense>
```

**VI:** Suspense cho phep components "cho doi" mot thu gi do (lazy components, data) truoc khi render, hien thi UI du phong trong khi loading. Hoat dong voi `lazy()` cho code splitting va cac thu vien data fetching ho tro no (React Query, SWR voi tinh nang thu nghiem).

---

## 27. How does Lazy Loading work in React? / Lazy Loading hoat dong nhu the nao trong React?

**EN:** `React.lazy()` enables dynamic imports, loading components only when needed. Combined with Suspense for loading states. Use for route-based splitting, heavy components, or features not immediately needed. Reduces initial bundle size.

```javascript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load routes
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Preload on hover
const preloadDashboard = () => import('./pages/Dashboard');
<Link to="/dashboard" onMouseEnter={preloadDashboard}>Dashboard</Link>
```

**VI:** `React.lazy()` cho phep dynamic imports, chi tai components khi can. Ket hop voi Suspense cho trang thai loading. Dung cho route-based splitting, heavy components, hoac tinh nang khong can ngay lap tuc. Giam kich thuoc bundle ban dau.

---

## 28. What are common State Management patterns? / Cac pattern quan ly State pho bien la gi?

**EN:** Common patterns: Local state (useState), Lifting state up, Context API for global state, useReducer for complex logic, external libraries (Redux, Zustand, Jotai) for large apps. Choose based on complexity and sharing needs.

```javascript
// 1. Local state - simple, component-specific
const [count, setCount] = useState(0);

// 2. Context - global, infrequent updates
const ThemeContext = createContext();
<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>

// 3. useReducer - complex state logic
const [state, dispatch] = useReducer(reducer, initialState);

// 4. Zustand - external, minimal boilerplate
const useStore = create((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}));

// 5. Redux Toolkit - large apps, devtools, middleware
const slice = createSlice({ name: 'counter', initialState, reducers });
```

**VI:** Cac pattern pho bien: Local state (useState), Nang state len, Context API cho global state, useReducer cho logic phuc tap, thu vien ben ngoai (Redux, Zustand, Jotai) cho app lon. Chon dua tren do phuc tap va nhu cau chia se.

---

## 29. What is Lifting State Up? / Nang State len la gi?

**EN:** Lifting state up means moving state to the closest common ancestor when multiple components need to share or sync data. The parent owns the state and passes it down as props, along with handler functions for updates.

```javascript
// Before: Each input has own state - can't sync
// After: Parent owns state - children controlled

function Parent() {
  const [value, setValue] = useState('');

  return (
    <>
      <Input1 value={value} onChange={setValue} />
      <Input2 value={value} onChange={setValue} />
      <Display value={value} />
    </>
  );
}

function Input1({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

function Input2({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

**VI:** Nang state len co nghia la di chuyen state len component to tien chung gan nhat khi nhieu components can chia se hoac dong bo du lieu. Component cha so huu state va truyen xuong nhu props, cung voi cac ham handler de cap nhat.

---

## 30. What are solutions to Prop Drilling? / Cac giai phap cho Prop Drilling la gi?

**EN:** Prop drilling is passing props through many levels. Solutions: Context API for shared state, component composition (children props), custom hooks, state management libraries, or compound components pattern.

```javascript
// Problem: Prop drilling through multiple levels
<App user={user}>
  <Layout user={user}>
    <Header user={user}>
      <UserMenu user={user} />

// Solution 1: Context
const UserContext = createContext();
function App() {
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}
function UserMenu() {
  const user = useContext(UserContext); // Direct access
}

// Solution 2: Component Composition
function App() {
  return (
    <Layout>
      <Header userMenu={<UserMenu user={user} />} />
    </Layout>
  );
}

// Solution 3: Custom Hook with Context
function useUser() {
  return useContext(UserContext);
}
```

**VI:** Prop drilling la truyen props qua nhieu cap. Cac giai phap: Context API cho shared state, component composition (children props), custom hooks, thu vien quan ly state, hoac compound components pattern.

---

## 31. What are React Server Components (RSC)? / React Server Components (RSC) la gi?

**EN:** RSC are components that render only on the server, never shipped to client. They can directly access databases, file systems, and have zero bundle size impact. Client Components use `'use client'` directive. RSC is the default in Next.js App Router.

```javascript
// Server Component (default) - runs on server only
async function UserList() {
  const users = await db.query('SELECT * FROM users'); // Direct DB access
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}

// Client Component - 'use client' directive
'use client';
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0); // Needs client-side state
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Composing: Server can import Client, not vice versa
async function Page() {
  const data = await fetchData();
  return (
    <div>
      <UserList />           {/* Server Component */}
      <Counter />            {/* Client Component */}
      <ClientComp data={data} /> {/* Pass serializable props */}
    </div>
  );
}
```

**VI:** RSC la cac components chi render tren server, khong gui xuong client. Chung co the truy cap truc tiep database, file system, va khong anh huong bundle size. Client Components dung directive `'use client'`. RSC la mac dinh trong Next.js App Router.

---

## 32. What is the use() hook in React 19? / Hook use() trong React 19 la gi?

**EN:** `use()` is a new hook that can read promises and context during render. Unlike other hooks, it can be called conditionally. It integrates with Suspense for data fetching and replaces useContext for context reading.

```javascript
import { use, Suspense } from 'react';

// Reading a Promise - integrates with Suspense
function UserProfile({ userPromise }) {
  const user = use(userPromise); // Suspends until resolved
  return <h1>{user.name}</h1>;
}

// Can be called conditionally (unlike other hooks)
function Message({ messagePromise, shouldShow }) {
  if (!shouldShow) return null;
  const message = use(messagePromise); // OK - conditional call
  return <p>{message}</p>;
}

// Reading Context - replaces useContext
function Button() {
  const theme = use(ThemeContext); // Same as useContext(ThemeContext)
  return <button className={theme}>Click</button>;
}

// Usage with Suspense
function App() {
  const userPromise = fetchUser(1);
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

**VI:** `use()` la hook moi co the doc promises va context trong khi render. Khac voi cac hooks khac, no co the goi co dieu kien. No tich hop voi Suspense cho data fetching va thay the useContext cho viec doc context.

---

## 33. What are Server Actions in React? / Server Actions trong React la gi?

**EN:** Server Actions are async functions that run on the server, triggered from client. Marked with `'use server'` directive. Used for form submissions, mutations, and data updates. They work without API routes and integrate with form actions.

```javascript
// Server Action - in separate file or inline
'use server';

async function createUser(formData) {
  const name = formData.get('name');
  const email = formData.get('email');

  await db.insert({ name, email });
  revalidatePath('/users'); // Refresh data
}

// Using in form - action prop
function SignupForm() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Sign Up</button>
    </form>
  );
}

// Using with useActionState (React 19)
'use client';
import { useActionState } from 'react';

function Form() {
  const [state, formAction, isPending] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

**VI:** Server Actions la cac ham async chay tren server, duoc trigger tu client. Danh dau voi directive `'use server'`. Dung cho form submissions, mutations, va cap nhat data. Chung hoat dong khong can API routes va tich hop voi form actions.

---

## 34. What is Concurrent Rendering in React 18? / Concurrent Rendering trong React 18 la gi?

**EN:** Concurrent Rendering allows React to prepare multiple UI versions simultaneously, pause/resume work, and prioritize urgent updates. It's interruptible - React can abandon work if something more urgent comes. Enabled via createRoot.

```javascript
import { createRoot } from 'react-dom/client';

// Enable concurrent features
const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Concurrent features include:
// 1. startTransition - mark non-urgent updates
// 2. useDeferredValue - defer expensive computations
// 3. Suspense improvements - streaming, selective hydration

// How it works conceptually:
// Without concurrent: Render A -> Render B -> Render C (blocking)
// With concurrent: Start A -> Interrupt -> Urgent B -> Resume A

function SearchResults() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // Urgent: update input immediately
    setQuery(e.target.value);

    // Non-urgent: can be interrupted
    startTransition(() => {
      setFilteredResults(expensiveFilter(e.target.value));
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <Results />}
    </>
  );
}
```

**VI:** Concurrent Rendering cho phep React chuan bi nhieu phien ban UI dong thoi, tam dung/tiep tuc cong viec, va uu tien cac cap nhat khan cap. No co the bi gian doan - React co the bo cong viec neu co viec khan cap hon. Kich hoat qua createRoot.

---

## 35. What is useTransition and how does it work? / useTransition hoat dong nhu the nao?

**EN:** `useTransition` marks state updates as non-urgent transitions. Returns `[isPending, startTransition]`. React keeps UI responsive by showing old content while preparing new. Perfect for expensive re-renders like filtering, tab switching.

```javascript
function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('home');

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab); // Low priority - can be interrupted
    });
  }

  return (
    <>
      <TabButton onClick={() => selectTab('home')}>Home</TabButton>
      <TabButton onClick={() => selectTab('posts')}>Posts</TabButton>
      <TabButton onClick={() => selectTab('contact')}>Contact</TabButton>

      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        {tab === 'home' && <Home />}
        {tab === 'posts' && <SlowPosts />} {/* Expensive */}
        {tab === 'contact' && <Contact />}
      </div>
    </>
  );
}

// Without transition: UI freezes during SlowPosts render
// With transition: Keep showing current tab, switch when ready
```

**VI:** `useTransition` danh dau cap nhat state la transitions khong khan cap. Tra ve `[isPending, startTransition]`. React giu UI phan hoi bang cach hien thi noi dung cu trong khi chuan bi noi dung moi. Hoan hao cho re-renders ton kem nhu filtering, chuyen tab.

---

## 36. What is useDeferredValue and when to use it? / useDeferredValue la gi va khi nao su dung?

**EN:** `useDeferredValue` returns a deferred copy of a value that lags behind during urgent updates. Use when you receive a value you can't control (props). React shows stale UI while computing new one in background.

```javascript
function SearchResults({ query }) {
  // query changes immediately, deferredQuery lags
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  // Expensive filtering uses deferred value
  const results = useMemo(
    () => filterHugeList(deferredQuery),
    [deferredQuery]
  );

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <ResultList items={results} />
    </div>
  );
}

// Difference from useTransition:
// useTransition: You control the setState call
// useDeferredValue: Value comes from outside (props)

function Parent() {
  const [query, setQuery] = useState('');
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SearchResults query={query} /> {/* Can't control this prop */}
    </>
  );
}
```

**VI:** `useDeferredValue` tra ve ban sao tri hoan cua gia tri, bi tre trong cac cap nhat khan cap. Dung khi nhan gia tri khong kiem soat duoc (props). React hien thi UI cu trong khi tinh toan cai moi trong nen.

---

## 37. What is Automatic Batching in React 18? / Automatic Batching trong React 18 la gi?

**EN:** React 18 automatically batches multiple state updates into a single re-render, even in promises, setTimeout, and event handlers. Previously only worked in React event handlers. Use `flushSync` to opt out.

```javascript
// React 17: Only batches in event handlers
// React 18: Batches everywhere automatically

function handleClick() {
  // Both batched - single re-render
  setCount(c => c + 1);
  setFlag(f => !f);
}

// React 18: Also batched in async code
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Single re-render in React 18
  // Two re-renders in React 17
}, 1000);

fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Single re-render in React 18
});

// Opt out with flushSync
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1);
  });
  // DOM updated here

  flushSync(() => {
    setFlag(f => !f);
  });
  // DOM updated here
}
```

**VI:** React 18 tu dong gop nhieu cap nhat state thanh mot lan re-render, ke ca trong promises, setTimeout, va event handlers. Truoc do chi hoat dong trong React event handlers. Dung `flushSync` de tu choi.

---

## 38. What is flushSync and when to use it? / flushSync la gi va khi nao su dung?

**EN:** `flushSync` forces React to flush pending updates synchronously, opting out of automatic batching. Use sparingly - for DOM measurements after state change, or integrating with non-React code. It hurts performance.

```javascript
import { flushSync } from 'react-dom';

function ScrollToBottom() {
  const listRef = useRef(null);
  const [items, setItems] = useState([]);

  function addItem() {
    flushSync(() => {
      setItems([...items, newItem]);
    });
    // DOM is updated NOW, can scroll
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }

  return <ul ref={listRef}>{items.map(/*...*/)}</ul>;
}

// Without flushSync: scroll happens before DOM update
// With flushSync: DOM updates immediately, then scroll

// Use cases:
// 1. DOM measurements after state change
// 2. Third-party library integration
// 3. Forcing immediate update for accessibility

// Warning: Avoid when possible - breaks batching optimization
function badExample() {
  flushSync(() => setA(1));
  flushSync(() => setB(2));
  // Two re-renders instead of one
}
```

**VI:** `flushSync` buoc React xu ly cac cap nhat dang cho dong bo, tu choi automatic batching. Dung it thoi - cho DOM measurements sau state change, hoac tich hop voi code khong phai React. No lam giam hieu suat.

---

## 39. What is useId hook? / Hook useId la gi?

**EN:** `useId` generates unique IDs stable across server and client renders. Solves hydration mismatch issues. Use for accessibility attributes (htmlFor, aria-*). Never use for list keys or CSS selectors.

```javascript
function FormField({ label, type }) {
  const id = useId();
  const descriptionId = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        aria-describedby={descriptionId}
      />
      <span id={descriptionId}>Helper text</span>
    </div>
  );
}

// Multiple fields get unique IDs
<FormField label="Email" />    // id=":r0:", aria=":r1:"
<FormField label="Password" /> // id=":r2:", aria=":r3:"

// With prefix for multiple elements
function CheckboxGroup({ options }) {
  const id = useId();
  return options.map((option, i) => (
    <label key={option.value} htmlFor={`${id}-${i}`}>
      <input id={`${id}-${i}`} type="checkbox" />
      {option.label}
    </label>
  ));
}

// DON'T use for:
// - List keys (use stable data IDs)
// - CSS selectors (IDs contain colons)
```

**VI:** `useId` tao ID duy nhat on dinh qua server va client renders. Giai quyet van de hydration mismatch. Dung cho thuoc tinh accessibility (htmlFor, aria-*). Khong bao gio dung cho list keys hoac CSS selectors.

---

## 40. What is useSyncExternalStore? / useSyncExternalStore la gi?

**EN:** `useSyncExternalStore` subscribes to external stores (Redux, Zustand, browser APIs) safely with concurrent rendering. It handles tearing issues and ensures consistent reads. Required for libraries integrating with React 18.

```javascript
import { useSyncExternalStore } from 'react';

// Subscribe to browser online status
function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,        // Subscribe function
    getSnapshot,      // Get current value (client)
    getServerSnapshot // Get value for SSR
  );
}

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // Assume online for SSR
}

// Usage
function StatusBar() {
  const isOnline = useOnlineStatus();
  return <span>{isOnline ? 'Online' : 'Offline'}</span>;
}

// For external state libraries
const state = useSyncExternalStore(
  store.subscribe,
  store.getState,
  store.getServerState
);
```

**VI:** `useSyncExternalStore` subscribe vao external stores (Redux, Zustand, browser APIs) an toan voi concurrent rendering. No xu ly van de tearing va dam bao doc nhat quan. Bat buoc cho cac thu vien tich hop voi React 18.

---

## 41. What is useInsertionEffect? / useInsertionEffect la gi?

**EN:** `useInsertionEffect` fires synchronously before DOM mutations. Designed for CSS-in-JS libraries to inject styles before layout effects read them. Runs before useLayoutEffect. Don't use in application code.

```javascript
// For CSS-in-JS library authors only
import { useInsertionEffect } from 'react';

function useCSS(rule) {
  useInsertionEffect(() => {
    // Inject styles before any layout effects
    const style = document.createElement('style');
    style.textContent = rule;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [rule]);
}

// Execution order:
// 1. useInsertionEffect - inject styles
// 2. DOM mutations - React updates DOM
// 3. useLayoutEffect - read layout, refs available
// 4. Browser paint
// 5. useEffect - side effects

// Example: styled-components/emotion use this internally
function StyledButton({ children }) {
  useInsertionEffect(() => {
    // Inject .btn { color: blue } before layout
  });

  return <button className="btn">{children}</button>;
}

// WARNING: Refs and state updates not available
// Only for style injection - use useLayoutEffect otherwise
```

**VI:** `useInsertionEffect` chay dong bo truoc DOM mutations. Thiet ke cho thu vien CSS-in-JS de inject styles truoc khi layout effects doc chung. Chay truoc useLayoutEffect. Khong dung trong application code.

---

## 42. What is React Compiler (React Forget)? / React Compiler (React Forget) la gi?

**EN:** React Compiler is an experimental compiler that auto-memoizes components and hooks. It eliminates need for manual useMemo, useCallback, React.memo. Analyzes code at build time to add memoization where beneficial.

```javascript
// Before React Compiler - manual memoization
function TodoList({ todos, filter }) {
  const filteredTodos = useMemo(
    () => todos.filter(t => t.status === filter),
    [todos, filter]
  );

  const handleClick = useCallback(
    (id) => deleteTodo(id),
    []
  );

  return filteredTodos.map(todo => (
    <TodoItem
      key={todo.id}
      todo={todo}
      onClick={handleClick}
    />
  ));
}

const TodoItem = React.memo(({ todo, onClick }) => (
  <li onClick={() => onClick(todo.id)}>{todo.text}</li>
));

// After React Compiler - automatic memoization
function TodoList({ todos, filter }) {
  // Compiler auto-memoizes filteredTodos
  const filteredTodos = todos.filter(t => t.status === filter);

  // Compiler auto-memoizes handleClick
  const handleClick = (id) => deleteTodo(id);

  return filteredTodos.map(todo => (
    <TodoItem key={todo.id} todo={todo} onClick={handleClick} />
  ));
}

// TodoItem auto-memoized by compiler
function TodoItem({ todo, onClick }) {
  return <li onClick={() => onClick(todo.id)}>{todo.text}</li>;
}
```

**VI:** React Compiler la trinh bien dich thu nghiem tu dong memo hoa components va hooks. No loai bo nhu cau useMemo, useCallback, React.memo thu cong. Phan tich code luc build de them memoization khi co loi.

---

## 43. How does React Compiler work? / React Compiler hoat dong nhu the nao?

**EN:** React Compiler statically analyzes component dependencies at build time. It identifies which values change between renders and wraps computations/callbacks with memoization. Must follow Rules of React for it to work correctly.

```javascript
// Compiler analyzes dependencies
function Profile({ user }) {
  // Compiler sees: depends on user.name
  const greeting = `Hello, ${user.name}`;

  // Compiler sees: depends on user.id, pure computation
  const posts = fetchPosts(user.id);

  // Compiler sees: no dependencies, stable callback
  const handleLogout = () => {
    logout();
  };

  return <div>{greeting}</div>;
}

// Compiler output (conceptual):
function Profile({ user }) {
  const greeting = useMemo(() => `Hello, ${user.name}`, [user.name]);
  const posts = useMemo(() => fetchPosts(user.id), [user.id]);
  const handleLogout = useCallback(() => logout(), []);
  return <div>{greeting}</div>;
}

// Rules of React for Compiler:
// 1. Components must be pure (same inputs = same output)
// 2. Don't mutate props, state, or refs during render
// 3. Don't call hooks conditionally
// 4. Side effects only in useEffect

// eslint-plugin-react-compiler helps catch violations
```

**VI:** React Compiler phan tich tinh dependencies cua component luc build time. No xac dinh gia tri nao thay doi giua cac lan render va bao computations/callbacks voi memoization. Phai tuan theo Rules of React de hoat dong dung.

---

## 44. What is Streaming SSR? / Streaming SSR la gi?

**EN:** Streaming SSR sends HTML in chunks as components render, instead of waiting for entire page. Users see content faster. Works with Suspense - stream content as it becomes ready, send fallbacks immediately.

```javascript
// Server sends HTML progressively
// 1. Send shell with Suspense fallbacks
// 2. Stream each Suspense boundary when ready
// 3. Client hydrates progressively

// Server component with streaming
async function Page() {
  return (
    <html>
      <body>
        <Header />  {/* Streams immediately */}

        <Suspense fallback={<Skeleton />}>
          <SlowContent />  {/* Streams when ready */}
        </Suspense>

        <Suspense fallback={<CommentsSkeleton />}>
          <Comments />  {/* Streams independently */}
        </Suspense>

        <Footer />  {/* Streams immediately */}
      </body>
    </html>
  );
}

// Next.js App Router example
// app/page.js - automatic streaming
export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  );
}

// Timeline:
// 0ms: Header, Footer, Skeletons sent
// 100ms: SlowContent ready, streamed + hydrated
// 200ms: Comments ready, streamed + hydrated
```

**VI:** Streaming SSR gui HTML theo tung phan khi components render, thay vi cho toan bo trang. Nguoi dung thay noi dung nhanh hon. Hoat dong voi Suspense - stream noi dung khi san sang, gui fallbacks ngay lap tuc.

---

## 45. What is Selective Hydration? / Selective Hydration la gi?

**EN:** Selective Hydration lets React prioritize hydrating components based on user interaction. If user clicks a not-yet-hydrated component, React prioritizes it. Works with Suspense boundaries. Part of React 18 concurrent features.

```javascript
// Multiple Suspense boundaries hydrate independently
function App() {
  return (
    <>
      <Suspense fallback={<NavSkeleton />}>
        <Nav />  {/* Hydrates first if clicked */}
      </Suspense>

      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />  {/* Can hydrate independently */}
      </Suspense>

      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />  {/* Prioritized if user scrolls here */}
      </Suspense>
    </>
  );
}

// Hydration priority:
// 1. User clicks unhydrated Nav -> Nav hydrates first
// 2. Even if Sidebar was loading, Nav takes priority
// 3. After Nav hydrated, click event replays

// Benefits:
// - Page becomes interactive faster
// - User interactions not blocked
// - Heavy components don't block light ones

// Without selective hydration:
// Must wait for ALL JS to load and hydrate everything
// User clicks are ignored until fully hydrated
```

**VI:** Selective Hydration cho React uu tien hydrate components dua tren tuong tac nguoi dung. Neu nguoi dung click component chua hydrate, React uu tien no. Hoat dong voi Suspense boundaries. La mot phan cua React 18 concurrent features.

---

## 46. What are Actions in React 19? / Actions trong React 19 la gi?

**EN:** Actions are async functions that handle form submissions and data mutations. They integrate with `useActionState`, `useFormStatus`, and `useOptimistic`. Can be Server Actions or client-side. Provide built-in pending states and error handling.

```javascript
// Client-side action with useActionState
'use client';
import { useActionState } from 'react';

async function submitForm(prevState, formData) {
  const name = formData.get('name');

  try {
    await saveUser(name);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

function Form() {
  const [state, formAction, isPending] = useActionState(submitForm, null);

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state?.error && <p className="error">{state.error}</p>}
      {state?.success && <p className="success">Saved!</p>}
    </form>
  );
}

// Server Action
'use server';
async function createPost(formData) {
  await db.posts.create({ title: formData.get('title') });
  revalidatePath('/posts');
}
```

**VI:** Actions la cac ham async xu ly form submissions va data mutations. Chung tich hop voi `useActionState`, `useFormStatus`, va `useOptimistic`. Co the la Server Actions hoac client-side. Cung cap pending states va error handling san co.

---

## 47. What is useFormStatus? / useFormStatus la gi?

**EN:** `useFormStatus` provides the pending status of parent form's action. Must be used inside a component rendered within `<form>`. Returns `{ pending, data, method, action }`. Perfect for submit buttons and form UI feedback.

```javascript
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending, data, method } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

function FormFields() {
  const { pending } = useFormStatus();

  return (
    <>
      <input name="email" disabled={pending} />
      <input name="password" type="password" disabled={pending} />
    </>
  );
}

// Must be inside form, not the form component itself
function LoginForm({ action }) {
  // useFormStatus() here won't work!

  return (
    <form action={action}>
      <FormFields />    {/* useFormStatus works here */}
      <SubmitButton />  {/* useFormStatus works here */}
    </form>
  );
}

// Complete example
async function loginAction(formData) {
  await authenticate(formData);
}

function LoginPage() {
  return (
    <form action={loginAction}>
      <FormFields />
      <SubmitButton />
    </form>
  );
}
```

**VI:** `useFormStatus` cung cap trang thai pending cua action form cha. Phai dung ben trong component render trong `<form>`. Tra ve `{ pending, data, method, action }`. Hoan hao cho submit buttons va form UI feedback.

---

## 48. What is useOptimistic? / useOptimistic la gi?

**EN:** `useOptimistic` shows optimistic UI during async operations. Displays expected result immediately, reverts if action fails. Takes current state and update function. Perfect for likes, comments, and instant feedback UIs.

```javascript
import { useOptimistic } from 'react';

function LikeButton({ postId, initialLikes, isLiked }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    { count: initialLikes, liked: isLiked },
    (state, newLiked) => ({
      count: newLiked ? state.count + 1 : state.count - 1,
      liked: newLiked
    })
  );

  async function handleLike() {
    const newLiked = !optimisticLikes.liked;
    addOptimisticLike(newLiked);  // Update UI immediately

    try {
      await toggleLike(postId);  // Server request
    } catch (error) {
      // Auto-reverts on error
      console.error('Like failed');
    }
  }

  return (
    <button onClick={handleLike}>
      {optimisticLikes.liked ? 'Unlike' : 'Like'} ({optimisticLikes.count})
    </button>
  );
}

// Todo list with optimistic add
function TodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  async function addTodo(formData) {
    const newTodo = { id: Date.now(), text: formData.get('text') };
    addOptimisticTodo(newTodo);
    await saveTodo(newTodo);
  }

  return (
    <form action={addTodo}>
      <input name="text" />
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

**VI:** `useOptimistic` hien thi UI lac quan trong cac thao tac async. Hien thi ket qua mong doi ngay lap tuc, hoan lai neu action that bai. Nhan state hien tai va ham update. Hoan hao cho likes, comments, va instant feedback UIs.

---

## 49. What are the new features in React 19? / Cac tinh nang moi trong React 19 la gi?

**EN:** React 19 introduces: Actions for form handling, `use()` hook for promises/context, Server Components stable, Document Metadata in components, improved error reporting, ref as prop, and Context as provider directly.

```javascript
// 1. Actions - form handling built-in
<form action={async (formData) => {
  await submitForm(formData);
}}>

// 2. use() - read promises and context
const data = use(fetchPromise);
const theme = use(ThemeContext);

// 3. Document Metadata in components
function BlogPost({ post }) {
  return (
    <>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <article>{post.content}</article>
    </>
  );
}

// 4. ref as regular prop (no forwardRef needed)
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 5. Context as provider directly
const ThemeContext = createContext('light');
// Before: <ThemeContext.Provider value="dark">
// After:
<ThemeContext value="dark">
  <App />
</ThemeContext>

// 6. Improved error handling
// Better error messages, hydration error diffs

// 7. useActionState, useFormStatus, useOptimistic
// Built-in hooks for form state management
```

**VI:** React 19 gioi thieu: Actions cho form handling, hook `use()` cho promises/context, Server Components on dinh, Document Metadata trong components, bao loi cai tien, ref nhu prop, va Context lam provider truc tiep.

---

## 50. How to migrate from React 18 to React 19? / Cach migrate tu React 18 sang React 19?

**EN:** Migration involves updating packages, removing deprecated APIs (forwardRef optional), updating error handling, and adopting new patterns. Most apps work without changes. Use codemods for automated migration.

```javascript
// 1. Update packages
npm install react@19 react-dom@19

// 2. forwardRef now optional
// Before (React 18)
const Input = forwardRef((props, ref) => (
  <input ref={ref} {...props} />
));

// After (React 19) - ref is a regular prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 3. Context Provider syntax
// Before
<ThemeContext.Provider value={theme}>

// After (both work, new syntax simpler)
<ThemeContext value={theme}>

// 4. Replace deprecated APIs
// Remove: ReactDOM.render (use createRoot)
// Remove: ReactDOM.hydrate (use hydrateRoot)
// Update: useContext -> can use use()

// 5. Update error boundaries
// New: getDerivedStateFromError returns more info

// 6. Adopt new form patterns
// Before: manual useState for form state
// After: useActionState, useFormStatus

// 7. Run codemod for automated fixes
npx codemod@latest react/19/migration-recipe

// 8. Test thoroughly
// - Check hydration warnings
// - Verify form submissions
// - Test Suspense boundaries
```

**VI:** Migration bao gom cap nhat packages, xoa deprecated APIs (forwardRef tuy chon), cap nhat error handling, va ap dung patterns moi. Hau het apps hoat dong khong can thay doi. Dung codemods cho migration tu dong.
