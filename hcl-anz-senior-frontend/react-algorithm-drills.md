# React + Algorithm Drills: Rebuild Your Thinking

> **Mục đích**: Luyện lại tư duy step-by-step, không chỉ code
> **Cách dùng**: Đọc problem → Tự suy nghĩ TRƯỚC → Mới xem hints → Cuối cùng mới xem solution
> **Quan trọng**: ĐỪNG SKIP phần thinking! Đây là phần quan trọng nhất.

---

## 🧠 Thinking Framework (Dùng cho MỌI bài)

Trước khi code bất kỳ bài nào, hãy đi qua 5 bước này:

```
1. INPUT/OUTPUT: Input là gì? Output cần gì?
2. EXAMPLES: Viết ra 2-3 ví dụ cụ thể
3. EDGE CASES: Empty? Single item? Very large?
4. APPROACH: Brute force trước → Optimize sau
5. CODE: Implement từng phần nhỏ
```

---

# LEVEL 1: WARM-UP (15 phút mỗi bài)

## Drill 1.1: Counter with Reset

### Problem
```
Build a counter component with:
- Display current count
- Increment button (+1)
- Decrement button (-1)
- Reset button (back to 0)
- Count cannot go below 0
```

### 🧠 Thinking Process (Tự suy nghĩ trước!)

<details>
<summary>Step 1: Xác định STATE cần gì?</summary>

Hỏi bản thân:
- Dữ liệu nào THAY ĐỔI? → count
- Dữ liệu nào CỐ ĐỊNH? → không có

→ Cần 1 state: `count`
</details>

<details>
<summary>Step 2: Xác định HANDLERS cần gì?</summary>

Mỗi button cần 1 handler:
- increment: count + 1
- decrement: count - 1 (nhưng không < 0)
- reset: count = 0
</details>

<details>
<summary>Step 3: Edge case nào cần handle?</summary>

- Count = 0 và nhấn decrement → giữ nguyên 0
- Có thể disable decrement khi count = 0
</details>

### 💡 Hints (Mở từng cái một nếu stuck)

<details>
<summary>Hint 1: State setup</summary>

```jsx
const [count, setCount] = useState(0);
```
</details>

<details>
<summary>Hint 2: Handler cho decrement với check</summary>

```jsx
const decrement = () => {
  setCount(prev => prev > 0 ? prev - 1 : 0);
  // hoặc
  setCount(prev => Math.max(0, prev - 1));
};
```
</details>

### ✅ Solution

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => Math.max(0, prev - 1));
  const reset = () => setCount(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={decrement} disabled={count === 0}>-</button>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### 📚 Key Learnings
- Dùng functional update `prev => prev + 1` thay vì `count + 1`
- `Math.max(0, value)` để đảm bảo không âm
- Disable button khi action không hợp lệ

---

## Drill 1.2: Toggle Show/Hide

### Problem
```
Build a component that:
- Has a button "Show Details" / "Hide Details"
- Clicking toggles visibility of a details section
- Button text changes based on state
```

### 🧠 Thinking Process

<details>
<summary>Step 1: STATE cần gì?</summary>

- Cần biết details đang show hay hide
- → Boolean state: `isVisible` hoặc `showDetails`
</details>

<details>
<summary>Step 2: UI phụ thuộc state như thế nào?</summary>

- Button text: isVisible ? "Hide" : "Show"
- Details: chỉ render khi isVisible = true
</details>

### 💡 Hints

<details>
<summary>Hint: Conditional rendering</summary>

```jsx
{isVisible && <div>Details content</div>}
// hoặc
{isVisible ? <Details /> : null}
```
</details>

### ✅ Solution

```jsx
function ToggleDetails() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = () => setIsVisible(prev => !prev);

  return (
    <div>
      <button onClick={toggle}>
        {isVisible ? 'Hide Details' : 'Show Details'}
      </button>

      {isVisible && (
        <div className="details">
          <p>This is the details section.</p>
        </div>
      )}
    </div>
  );
}
```

### 📚 Key Learnings
- Boolean toggle: `prev => !prev`
- Conditional rendering với `&&` hoặc ternary
- Button text thay đổi theo state

---

## Drill 1.3: Simple List Filter

### Problem
```
Given an array of fruits, display them as a list.
Add an input to filter fruits by name (case-insensitive).
```

### 🧠 Thinking Process

<details>
<summary>Step 1: DATA và STATE</summary>

- DATA (không đổi): `const fruits = ['Apple', 'Banana', 'Cherry', ...]`
- STATE (thay đổi): search term từ input
</details>

<details>
<summary>Step 2: COMPUTED value</summary>

- filteredFruits = fruits.filter(f => f.includes(searchTerm))
- Đây là DERIVED từ state, không cần state riêng
</details>

<details>
<summary>Step 3: Case-insensitive như thế nào?</summary>

- Chuyển cả 2 về lowercase trước khi so sánh
- `f.toLowerCase().includes(searchTerm.toLowerCase())`
</details>

### 💡 Hints

<details>
<summary>Hint: Filter + map pattern</summary>

```jsx
const filtered = fruits.filter(f =>
  f.toLowerCase().includes(search.toLowerCase())
);

return (
  <ul>
    {filtered.map(fruit => <li key={fruit}>{fruit}</li>)}
  </ul>
);
```
</details>

### ✅ Solution

```jsx
const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];

function FruitFilter() {
  const [search, setSearch] = useState('');

  const filteredFruits = FRUITS.filter(fruit =>
    fruit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search fruits..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {filteredFruits.map(fruit => (
          <li key={fruit}>{fruit}</li>
        ))}
      </ul>

      {filteredFruits.length === 0 && (
        <p>No fruits found.</p>
      )}
    </div>
  );
}
```

### 📚 Key Learnings
- Filter là derived value, không cần state riêng
- Case-insensitive: toLowerCase() cả 2 bên
- Always handle empty results

---

# LEVEL 2: CORE PATTERNS (20-25 phút mỗi bài)

## Drill 2.1: Debounced Search Input

### Problem
```
Build a search input that:
- Only triggers search after user stops typing for 500ms
- Shows loading state during search
- Displays results
```

### 🧠 Thinking Process

<details>
<summary>Step 1: Tại sao cần debounce?</summary>

- User gõ "hello" = 5 keystrokes = 5 API calls (BAD!)
- Debounce: đợi user ngừng gõ → 1 API call (GOOD!)
</details>

<details>
<summary>Step 2: Debounce hoạt động như nào?</summary>

```
User types 'h' → Set timer 500ms
User types 'e' (200ms later) → Cancel old timer, set new timer 500ms
User types 'l' (150ms later) → Cancel old timer, set new timer 500ms
User stops → 500ms passes → Execute search
```
</details>

<details>
<summary>Step 3: Implementation strategy</summary>

1. State: query (immediate), debouncedQuery (delayed)
2. useEffect với setTimeout để delay
3. Cleanup: clearTimeout khi query thay đổi
</details>

### 💡 Hints

<details>
<summary>Hint 1: useDebounce hook structure</summary>

```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer); // Cleanup!
  }, [value, delay]);

  return debouncedValue;
}
```
</details>

<details>
<summary>Hint 2: Using the hook</summary>

```jsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 500);

// Fetch when debouncedQuery changes
useEffect(() => {
  if (debouncedQuery) {
    fetchResults(debouncedQuery);
  }
}, [debouncedQuery]);
```
</details>

### ✅ Solution

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
function DebouncedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (!cancelled) {
        setResults([
          `Result 1 for "${debouncedQuery}"`,
          `Result 2 for "${debouncedQuery}"`,
        ]);
        setIsLoading(false);
      }
    }, 300);

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {isLoading && <p>Loading...</p>}

      <ul>
        {results.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}
```

### 📚 Key Learnings
- Debounce = delay execution until user stops
- Cleanup function prevents stale updates
- Separate "immediate" state (query) from "debounced" state

---

## Drill 2.2: Todo List with Filter

### Problem
```
Build a todo list with:
- Add new todo
- Toggle complete/incomplete
- Delete todo
- Filter: All / Active / Completed
- Show count of remaining items
```

### 🧠 Thinking Process

<details>
<summary>Step 1: Data structure cho Todo</summary>

```ts
interface Todo {
  id: string;        // unique identifier
  text: string;      // todo content
  completed: boolean; // status
}
```
</details>

<details>
<summary>Step 2: STATE cần gì?</summary>

- `todos: Todo[]` - list todos
- `filter: 'all' | 'active' | 'completed'` - current filter
- `input: string` - new todo input (có thể dùng uncontrolled)
</details>

<details>
<summary>Step 3: DERIVED values</summary>

- `filteredTodos` = filter từ todos dựa vào filter state
- `remainingCount` = todos chưa completed
</details>

<details>
<summary>Step 4: ACTIONS cần implement</summary>

1. addTodo: thêm todo mới
2. toggleTodo: đổi completed status
3. deleteTodo: xóa todo
4. setFilter: đổi filter
</details>

### 💡 Hints

<details>
<summary>Hint 1: Add todo với unique ID</summary>

```jsx
const addTodo = (text) => {
  const newTodo = {
    id: Date.now().toString(), // hoặc crypto.randomUUID()
    text,
    completed: false,
  };
  setTodos(prev => [...prev, newTodo]);
};
```
</details>

<details>
<summary>Hint 2: Toggle với map</summary>

```jsx
const toggleTodo = (id) => {
  setTodos(prev => prev.map(todo =>
    todo.id === id
      ? { ...todo, completed: !todo.completed }
      : todo
  ));
};
```
</details>

<details>
<summary>Hint 3: Filter logic</summary>

```jsx
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
```
</details>

### ✅ Solution

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [input, setInput] = useState('');

  // Actions
  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setTodos(prev => [...prev, {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
    }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Derived values
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
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

### 📚 Key Learnings
- CRUD pattern: Create, Read, Update, Delete
- Derived state với useMemo
- Form submission với onSubmit + preventDefault

---

## Drill 2.3: Data Fetching with States

### Problem
```
Build a component that:
- Fetches user data from API on mount
- Shows loading spinner while fetching
- Shows error message if fetch fails (with retry button)
- Shows user data on success
```

### 🧠 Thinking Process

<details>
<summary>Step 1: Các STATE cần track</summary>

Data fetching có 3 states:
- `loading`: đang fetch
- `error`: fetch failed
- `data`: fetch success

Có thể dùng 3 states riêng HOẶC 1 state với discriminated union
</details>

<details>
<summary>Step 2: Fetch lifecycle</summary>

```
Mount → Set loading=true → Fetch →
  Success: Set data, loading=false
  Error: Set error, loading=false
```
</details>

<details>
<summary>Step 3: Race condition handling</summary>

Nếu component unmount trước khi fetch xong:
- Không được setState trên unmounted component
- Dùng cleanup function với cancelled flag
</details>

### 💡 Hints

<details>
<summary>Hint 1: Fetch pattern với cleanup</summary>

```jsx
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    try {
      setLoading(true);
      const data = await fetch(url).then(r => r.json());
      if (!cancelled) {
        setData(data);
      }
    } catch (err) {
      if (!cancelled) {
        setError(err);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  fetchData();

  return () => { cancelled = true; };
}, [url]);
```
</details>

<details>
<summary>Hint 2: Retry mechanism</summary>

```jsx
const [retryCount, setRetryCount] = useState(0);

// Add retryCount to dependency array to re-fetch
useEffect(() => {
  // ... fetch logic
}, [url, retryCount]);

const retry = () => setRetryCount(c => c + 1);
```
</details>

### ✅ Solution

```jsx
function UserProfile({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [userId, retryCount]);

  const retry = () => setRetryCount(c => c + 1);

  if (loading) {
    return <div className="spinner">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <h2>{data.name}</h2>
      <p>Email: {data.email}</p>
      <p>Phone: {data.phone}</p>
    </div>
  );
}
```

### 📚 Key Learnings
- Always handle loading, error, success states
- Cleanup function prevents setState after unmount
- Retry pattern với state trong dependency array

---

# LEVEL 3: INTERVIEW-LEVEL (30-40 phút mỗi bài)

## Drill 3.1: Infinite Scroll List

### Problem
```
Build a list that:
- Loads 10 items initially
- Loads 10 more when user scrolls to bottom
- Shows loading indicator at bottom while fetching
- Stops loading when no more items
```

### 🧠 Thinking Process

<details>
<summary>Step 1: Detect scroll to bottom</summary>

2 cách:
1. Scroll event + calculate position
2. Intersection Observer (better!)

Intersection Observer:
- Đặt 1 "sentinel" element ở cuối list
- Khi sentinel visible → load more
</details>

<details>
<summary>Step 2: STATE management</summary>

```ts
items: Item[]           // all loaded items
page: number            // current page (for API)
loading: boolean        // fetching?
hasMore: boolean        // còn data không?
```
</details>

<details>
<summary>Step 3: Append vs Replace</summary>

- Initial load: setItems(data)
- Load more: setItems(prev => [...prev, ...newData])
</details>

### 💡 Hints

<details>
<summary>Hint 1: Intersection Observer hook</summary>

```jsx
function useIntersectionObserver(ref, callback) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, callback]);
}
```
</details>

<details>
<summary>Hint 2: Load more logic</summary>

```jsx
const loadMore = useCallback(() => {
  if (loading || !hasMore) return;

  setLoading(true);
  fetchPage(page + 1)
    .then(newItems => {
      setItems(prev => [...prev, ...newItems]);
      setPage(p => p + 1);
      setHasMore(newItems.length === PAGE_SIZE);
    })
    .finally(() => setLoading(false));
}, [loading, hasMore, page]);
```
</details>

### ✅ Solution

```jsx
const PAGE_SIZE = 10;

function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef(null);

  // Mock API
  const fetchItems = async (pageNum) => {
    await new Promise(r => setTimeout(r, 500));

    const start = pageNum * PAGE_SIZE;
    const newItems = Array.from({ length: PAGE_SIZE }, (_, i) => ({
      id: start + i,
      title: `Item ${start + i + 1}`,
    }));

    // Simulate end of data at page 5
    if (pageNum >= 5) return [];
    return newItems;
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const newItems = await fetchItems(page);

    setItems(prev => [...prev, ...newItems]);
    setPage(p => p + 1);
    setHasMore(newItems.length === PAGE_SIZE);
    setLoading(false);
  }, [loading, hasMore, page]);

  // Initial load
  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, loading, hasMore]);

  return (
    <div className="list-container" style={{ height: '400px', overflow: 'auto' }}>
      <ul>
        {items.map(item => (
          <li key={item.id} style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            {item.title}
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} style={{ height: '20px' }}>
        {loading && <p>Loading more...</p>}
        {!hasMore && <p>No more items</p>}
      </div>
    </div>
  );
}
```

### 📚 Key Learnings
- Intersection Observer > Scroll events
- Append new items, don't replace
- Track hasMore to stop fetching
- useCallback for stable function reference

---

## Drill 3.2: Undo/Redo Functionality

### Problem
```
Build a text editor with:
- Text input area
- Undo button (go to previous state)
- Redo button (go to next state if undone)
- Show "Nothing to undo/redo" when disabled
```

### 🧠 Thinking Process

<details>
<summary>Step 1: History data structure</summary>

```
history = ['', 'H', 'He', 'Hel', 'Hell', 'Hello']
index = 5 (current position)

Undo: index-- (now showing 'Hell')
Redo: index++ (back to 'Hello')
Type: add new entry, remove future history
```
</details>

<details>
<summary>Step 2: Current value = history[index]</summary>

Không cần state riêng cho current value!
Current value derived từ history + index
</details>

<details>
<summary>Step 3: When user types</summary>

1. Slice history to remove "future" (anything after current index)
2. Add new value
3. Update index to end
</details>

### 💡 Hints

<details>
<summary>Hint 1: Data structure</summary>

```jsx
const [history, setHistory] = useState(['']);
const [index, setIndex] = useState(0);

const currentValue = history[index];
const canUndo = index > 0;
const canRedo = index < history.length - 1;
```
</details>

<details>
<summary>Hint 2: Handle text change</summary>

```jsx
const handleChange = (newValue) => {
  // Remove future history, add new value
  setHistory(prev => [...prev.slice(0, index + 1), newValue]);
  setIndex(prev => prev + 1);
};
```
</details>

### ✅ Solution

```jsx
function UndoRedoEditor() {
  const [history, setHistory] = useState(['']);
  const [index, setIndex] = useState(0);

  const currentValue = history[index];
  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const handleChange = (e) => {
    const newValue = e.target.value;
    // Remove any "future" history and add new value
    setHistory(prev => [...prev.slice(0, index + 1), newValue]);
    setIndex(prev => prev + 1);
  };

  const undo = () => {
    if (canUndo) {
      setIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (canRedo) {
      setIndex(prev => prev + 1);
    }
  };

  return (
    <div>
      <textarea
        value={currentValue}
        onChange={handleChange}
        rows={5}
        cols={40}
      />

      <div>
        <button onClick={undo} disabled={!canUndo}>
          Undo
        </button>
        <button onClick={redo} disabled={!canRedo}>
          Redo
        </button>
      </div>

      <p>History length: {history.length}, Current index: {index}</p>

      {/* Debug: show history */}
      <details>
        <summary>History</summary>
        <pre>{JSON.stringify(history, null, 2)}</pre>
      </details>
    </div>
  );
}
```

### 📚 Key Learnings
- History = array of all states
- Index points to current state
- Typing removes "future" history
- Undo/Redo just moves index

---

## Drill 3.3: Form with Multi-step Validation

### Problem
```
Build a registration form with:
- Step 1: Email + Password
- Step 2: Name + Phone
- Step 3: Review & Submit

Validation:
- Email: valid email format
- Password: min 8 chars, 1 uppercase, 1 number
- Name: required
- Phone: optional, but valid if provided
```

### 🧠 Thinking Process

<details>
<summary>Step 1: Form state structure</summary>

```ts
interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

const [formData, setFormData] = useState<FormData>(initialData);
const [currentStep, setCurrentStep] = useState(0);
const [errors, setErrors] = useState<Partial<FormData>>({});
```
</details>

<details>
<summary>Step 2: Validation per step</summary>

Mỗi step có validation riêng:
- Step 0: validate email + password
- Step 1: validate name + phone
- Step 2: no validation (just review)
</details>

<details>
<summary>Step 3: When to validate?</summary>

- On blur: validate single field
- On next: validate all fields in step
- On submit: validate all
</details>

### 💡 Hints

<details>
<summary>Hint 1: Validation functions</summary>

```jsx
const validators = {
  email: (value) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
    return '';
  },
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Min 8 characters';
    if (!/[A-Z]/.test(value)) return 'Need 1 uppercase';
    if (!/[0-9]/.test(value)) return 'Need 1 number';
    return '';
  },
  // ... more
};
```
</details>

<details>
<summary>Hint 2: Validate step</summary>

```jsx
const stepFields = {
  0: ['email', 'password'],
  1: ['name', 'phone'],
};

const validateStep = (step) => {
  const fields = stepFields[step] || [];
  const newErrors = {};

  fields.forEach(field => {
    const error = validators[field]?.(formData[field]);
    if (error) newErrors[field] = error;
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```
</details>

### ✅ Solution

```jsx
const initialData = { email: '', password: '', name: '', phone: '' };

const validators = {
  email: (v) => {
    if (!v) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Invalid email';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Min 8 characters';
    if (!/[A-Z]/.test(v)) return 'Need 1 uppercase letter';
    if (!/[0-9]/.test(v)) return 'Need 1 number';
    return '';
  },
  name: (v) => (!v ? 'Name is required' : ''),
  phone: (v) => {
    if (!v) return ''; // optional
    if (!/^\d{10}$/.test(v)) return 'Phone must be 10 digits';
    return '';
  },
};

const stepFields = [['email', 'password'], ['name', 'phone'], []];

function MultiStepForm() {
  const [formData, setFormData] = useState(initialData);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = () => {
    const fields = stepFields[step];
    const newErrors = {};

    fields.forEach(field => {
      const error = validators[field](formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    console.log('Submitted:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return <div>Thank you for registering!</div>;
  }

  return (
    <div>
      {/* Progress indicator */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['Account', 'Personal', 'Review'].map((label, i) => (
          <span key={i} style={{
            fontWeight: step === i ? 'bold' : 'normal',
            color: step > i ? 'green' : 'inherit',
          }}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div>
          <h3>Account Information</h3>
          <div>
            <input
              placeholder="Email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
            {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
            />
            {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3>Personal Information</h3>
          <div>
            <input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
          </div>
          <div>
            <input
              placeholder="Phone (optional)"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            {errors.phone && <p style={{ color: 'red' }}>{errors.phone}</p>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Review</h3>
          <p>Email: {formData.email}</p>
          <p>Name: {formData.name}</p>
          <p>Phone: {formData.phone || '(not provided)'}</p>
        </div>
      )}

      {/* Navigation */}
      <div style={{ marginTop: '20px' }}>
        {step > 0 && <button onClick={handleBack}>Back</button>}
        {step < 2 && <button onClick={handleNext}>Next</button>}
        {step === 2 && <button onClick={handleSubmit}>Submit</button>}
      </div>
    </div>
  );
}
```

### 📚 Key Learnings
- Validation per step, not all at once
- Clear error when user starts typing
- Progress indicator shows current position
- Review step before final submit

---

# ALGORITHM PATTERNS QUICK REFERENCE

## Array Methods Cheat Sheet

```javascript
// Filter: keep items matching condition
const evens = [1,2,3,4].filter(n => n % 2 === 0); // [2, 4]

// Map: transform each item
const doubled = [1,2,3].map(n => n * 2); // [2, 4, 6]

// Find: get first match
const first = [1,2,3].find(n => n > 1); // 2

// Some: any match?
const hasEven = [1,2,3].some(n => n % 2 === 0); // true

// Every: all match?
const allPositive = [1,2,3].every(n => n > 0); // true

// Reduce: accumulate to single value
const sum = [1,2,3].reduce((acc, n) => acc + n, 0); // 6

// Sort: order items (mutates!)
const sorted = [3,1,2].sort((a, b) => a - b); // [1, 2, 3]
```

## Common Patterns

```javascript
// Remove duplicates
const unique = [...new Set([1,1,2,2,3])]; // [1, 2, 3]

// Group by property
const grouped = items.reduce((acc, item) => {
  const key = item.category;
  acc[key] = acc[key] || [];
  acc[key].push(item);
  return acc;
}, {});

// Count occurrences
const counts = items.reduce((acc, item) => {
  acc[item] = (acc[item] || 0) + 1;
  return acc;
}, {});
```

---

## Practice Schedule

```
Day 1: Level 1 (3 bài) - 45 phút
Day 2: Level 2 (3 bài) - 1.5 tiếng
Day 3: Level 3 (3 bài) - 2 tiếng
Day 4: Redo bài khó nhất ở mỗi level
```

**Quan trọng**: Mỗi bài, dành ít nhất 5 phút NGHĨ trước khi code!

---

**Good luck! 💪**
