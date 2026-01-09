# State Management Patterns

## Level 1: Basic - State Fundamentals

### 1.1. Types of State

```
┌─────────────────────────────────────────────────────────────┐
│                    Types of State                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Local State (Component State)                           │
│     - useState, useReducer                                  │
│     - Form inputs, toggles, modals                          │
│                                                              │
│  2. Global State (App State)                                │
│     - Context API, Redux, Zustand, Jotai                    │
│     - User auth, theme, app settings                        │
│                                                              │
│  3. Server State                                            │
│     - TanStack Query, SWR, RTK Query                        │
│     - Cached API data                                       │
│                                                              │
│  4. URL State                                               │
│     - React Router, search params                           │
│     - Filters, pagination, current page                     │
│                                                              │
│  5. Form State                                              │
│     - React Hook Form, Formik                               │
│     - Form values, validation, touched                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. useState - Local State

```jsx
// Simple state
const [count, setCount] = useState(0);

// Object state
const [user, setUser] = useState({ name: "", email: "" });

// Update object immutably
setUser(prev => ({ ...prev, name: "John" }));

// Lazy initialization - for expensive computation
const [data, setData] = useState(() => {
  return expensiveComputation();
});

// Array state
const [items, setItems] = useState([]);

// Add item
setItems(prev => [...prev, newItem]);

// Remove item
setItems(prev => prev.filter(item => item.id !== id));

// Update item
setItems(prev => prev.map(item =>
  item.id === id ? { ...item, ...updates } : item
));
```

### 1.3. useReducer - Complex Local State

```jsx
// Khi state có nhiều related values hoặc complex update logic
const initialState = {
  count: 0,
  step: 1,
  history: []
};

function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return {
        ...state,
        count: state.count + state.step,
        history: [...state.history, state.count]
      };
    case "DECREMENT":
      return {
        ...state,
        count: state.count - state.step,
        history: [...state.history, state.count]
      };
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "RESET":
      return initialState;
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
    </div>
  );
}
```

### 1.4. useState vs useReducer

```
┌─────────────────────────────────────────────────────────────┐
│                useState vs useReducer                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  useState:                    useReducer:                   │
│  - Simple primitive values    - Complex state objects       │
│  - Independent state pieces   - Related state pieces        │
│  - Few state transitions      - Many state transitions      │
│  - Quick prototyping          - Predictable state updates   │
│  - Single value               - State machine behavior      │
│                                                              │
│  Examples:                    Examples:                     │
│  - Toggle boolean             - Form with many fields       │
│  - Counter                    - Shopping cart               │
│  - Input value                - Multi-step wizard           │
│  - Loading flag               - Undo/redo functionality     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Level 2: Intermediate - Context API & State Libraries

### 2.1. Context API - Basic

```jsx
// 1. Create context
const ThemeContext = createContext(null);

// 2. Create Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  }, []);

  // Memoize value để tránh unnecessary re-renders
  const value = useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

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
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// 4. Usage
function App() {
  return (
    <ThemeProvider>
      <ThemedComponent />
    </ThemeProvider>
  );
}

function ThemedComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### 2.2. Context with Reducer Pattern

```jsx
// Separate State và Dispatch contexts để tối ưu performance
const StateContext = createContext(null);
const DispatchContext = createContext(null);

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Separate hooks for state và dispatch
function useAppState() {
  const context = useContext(StateContext);
  if (!context) throw new Error("Must be used within AppProvider");
  return context;
}

function useAppDispatch() {
  const context = useContext(DispatchContext);
  if (!context) throw new Error("Must be used within AppProvider");
  return context;
}

// Components chỉ dùng dispatch không re-render khi state thay đổi
function ActionButton() {
  const dispatch = useAppDispatch(); // Stable reference
  return <button onClick={() => dispatch({ type: "ACTION" })}>Action</button>;
}
```

### 2.3. Zustand - Simple Global State

```jsx
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Create store
const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        count: 0,
        users: [],

        // Sync actions
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),

        // Async actions
        fetchUsers: async () => {
          const response = await fetch("/api/users");
          const users = await response.json();
          set({ users });
        },

        // Access current state
        getDoubleCount: () => get().count * 2
      }),
      {
        name: "app-store" // localStorage key
      }
    )
  )
);

// Usage với selectors - Component chỉ re-render khi selected state thay đổi
function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}

// Shallow equality for object selections
import { shallow } from "zustand/shallow";

function UserInfo() {
  const { name, email } = useStore(
    (state) => ({ name: state.user.name, email: state.user.email }),
    shallow
  );
  return <div>{name} - {email}</div>;
}
```

### 2.4. Jotai - Atomic State

```jsx
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

// Primitive atom
const countAtom = atom(0);

// Derived atom (read-only)
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// Writable derived atom
const countPlusTenAtom = atom(
  (get) => get(countAtom) + 10,
  (get, set, newValue) => set(countAtom, newValue - 10)
);

// Usage
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom);
  const setCountOnly = useSetAtom(countAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}

// Atom with localStorage
import { atomWithStorage } from "jotai/utils";

const themeAtom = atomWithStorage("theme", "light");
```

### 2.5. State Management Comparison

```
┌───────────────────────────────────────────────────────────────┐
│                 State Management Comparison                   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Context API:                                                 │
│  ✅ Built-in, no dependencies                                │
│  ✅ Good for low-frequency updates                           │
│  ❌ Re-renders all consumers                                 │
│  ❌ No devtools                                              │
│  → Use for: theme, auth, locale                              │
│                                                               │
│  Redux:                                                       │
│  ✅ Predictable, middleware support                          │
│  ✅ Excellent devtools                                       │
│  ✅ Large ecosystem                                          │
│  ❌ Boilerplate (less with RTK)                             │
│  → Use for: large apps, complex state                        │
│                                                               │
│  Zustand:                                                     │
│  ✅ Simple API, minimal boilerplate                          │
│  ✅ No providers needed                                      │
│  ✅ Good devtools                                            │
│  ✅ Selectors for performance                                │
│  → Use for: medium apps, simpler alternative to Redux        │
│                                                               │
│  Jotai:                                                       │
│  ✅ Atomic model, fine-grained updates                       │
│  ✅ No providers needed                                      │
│  ✅ Good for derived state                                   │
│  ❌ Different mental model                                   │
│  → Use for: apps with many independent state pieces          │
│                                                               │
│  TanStack Query:                                              │
│  ✅ Purpose-built for server state                           │
│  ✅ Caching, background updates                              │
│  ✅ Loading/error states                                     │
│  ❌ Not for client state                                     │
│  → Use for: API data fetching                                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Level 3: Advanced - Performance & Architecture Patterns

### 3.1. Context Performance Issues & Solutions

```jsx
// ❌ Problem: All consumers re-render on any state change
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState([]);

  const value = { user, theme, notifications, setUser, setTheme };
  // Any change causes all consumers to re-render

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ✅ Solution 1: Split contexts
const UserContext = createContext();
const ThemeContext = createContext();
const NotificationContext = createContext();

// ✅ Solution 2: Use selectors (with libraries)
import { createContext, useContextSelector } from "use-context-selector";

const AppContext = createContext();

function UserName() {
  const userName = useContextSelector(AppContext, (state) => state.user?.name);
  return <span>{userName}</span>; // Only re-renders when user.name changes
}

// ✅ Solution 3: Memoize consumers
const UserProfile = memo(function UserProfile({ user }) {
  return <div>{user.name}</div>;
});

// ✅ Solution 4: Separate state and dispatch
const StateContext = createContext();
const DispatchContext = createContext();

function useDispatch() {
  return useContext(DispatchContext); // Never re-renders on state change
}
```

### 3.2. Zustand Slice Pattern - Large Scale

```jsx
// Slice pattern cho large applications
const createUserSlice = (set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const user = await authService.login(credentials);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  }))
});

const createCartSlice = (set, get) => ({
  items: [],
  total: 0,

  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.id === item.id);

    if (existingItem) {
      const items = state.items.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      return { items, total: calculateTotal(items) };
    }

    const items = [...state.items, { ...item, quantity: 1 }];
    return { items, total: calculateTotal(items) };
  }),

  removeItem: (itemId) => set((state) => {
    const items = state.items.filter(i => i.id !== itemId);
    return { items, total: calculateTotal(items) };
  }),

  clearCart: () => set({ items: [], total: 0 }),

  // Access user from other slice
  checkout: async () => {
    const { user } = get();
    if (!user) throw new Error("Must be logged in");

    const { items, total } = get();
    await orderService.createOrder({ userId: user.id, items, total });
    get().clearCart();
  }
});

// Combine slices
const useStore = create(
  devtools(
    persist(
      (...a) => ({
        ...createUserSlice(...a),
        ...createCartSlice(...a)
      }),
      { name: "app-store" }
    )
  )
);
```

### 3.3. Jotai Advanced Patterns

```jsx
import { atom, useAtom } from "jotai";
import { atomFamily, atomWithStorage, selectAtom } from "jotai/utils";

// Async atom
const userAtom = atom(async () => {
  const response = await fetch("/api/user");
  return response.json();
});

// Atom family - parameterized atoms
const todoAtomFamily = atomFamily((id) =>
  atom(async () => {
    const response = await fetch(`/api/todos/${id}`);
    return response.json();
  })
);

function TodoItem({ id }) {
  const [todo] = useAtom(todoAtomFamily(id));
  return <div>{todo.title}</div>;
}

// Derived atom với dependencies
const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  const filter = get(filterAtom);

  switch (filter) {
    case "completed":
      return todos.filter(t => t.completed);
    case "active":
      return todos.filter(t => !t.completed);
    default:
      return todos;
  }
});

// Select specific property (fine-grained updates)
const userNameAtom = selectAtom(userAtom, (user) => user.name);

// Write-only atom (actions)
const fetchTodosAtom = atom(
  null,
  async (get, set) => {
    set(loadingAtom, true);
    try {
      const response = await fetch("/api/todos");
      const todos = await response.json();
      set(todosAtom, todos);
    } finally {
      set(loadingAtom, false);
    }
  }
);
```

### 3.4. State Normalization

```jsx
// ❌ Nested/denormalized - hard to update, data duplication
const state = {
  posts: [
    {
      id: 1,
      title: "Post 1",
      author: { id: 1, name: "John" },
      comments: [
        { id: 1, text: "Comment", author: { id: 2, name: "Jane" } }
      ]
    }
  ]
};

// ✅ Normalized - flat structure, easy updates
const state = {
  entities: {
    users: {
      byId: {
        1: { id: 1, name: "John" },
        2: { id: 2, name: "Jane" }
      },
      allIds: [1, 2]
    },
    posts: {
      byId: {
        1: { id: 1, title: "Post 1", authorId: 1, commentIds: [1] }
      },
      allIds: [1]
    },
    comments: {
      byId: {
        1: { id: 1, text: "Comment", authorId: 2, postId: 1 }
      },
      allIds: [1]
    }
  }
};

// Selectors để denormalize khi render
const selectPostWithRelations = (postId) => (state) => {
  const post = state.entities.posts.byId[postId];
  if (!post) return null;

  return {
    ...post,
    author: state.entities.users.byId[post.authorId],
    comments: post.commentIds.map(id => ({
      ...state.entities.comments.byId[id],
      author: state.entities.users.byId[
        state.entities.comments.byId[id].authorId
      ]
    }))
  };
};
```

### 3.5. Optimistic Updates Pattern

```jsx
// Zustand example
const useStore = create((set, get) => ({
  todos: [],

  addTodo: async (text) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTodo = { id: tempId, text, completed: false };

    // Optimistic update
    set((state) => ({
      todos: [...state.todos, optimisticTodo]
    }));

    try {
      // Actual API call
      const savedTodo = await api.createTodo(text);

      // Replace temp with real data
      set((state) => ({
        todos: state.todos.map(t =>
          t.id === tempId ? savedTodo : t
        )
      }));
    } catch (error) {
      // Rollback on error
      set((state) => ({
        todos: state.todos.filter(t => t.id !== tempId)
      }));
      throw error;
    }
  },

  toggleTodo: async (id) => {
    const prevTodos = get().todos;

    // Optimistic update
    set((state) => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));

    try {
      await api.toggleTodo(id);
    } catch (error) {
      // Rollback
      set({ todos: prevTodos });
      throw error;
    }
  }
}));
```

---

## Real-world Applications

### E-commerce State Architecture

```jsx
// Store structure
const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Auth slice
        auth: {
          user: null,
          token: null,
          isAuthenticated: false
        },

        // Cart slice
        cart: {
          items: [],
          shipping: null,
          discount: null
        },

        // UI slice
        ui: {
          sidebarOpen: false,
          cartDrawerOpen: false,
          modalStack: []
        },

        // Actions
        setUser: (user) => set((state) => ({
          auth: { ...state.auth, user, isAuthenticated: !!user }
        })),

        addToCart: (product, quantity = 1) => set((state) => {
          const existingIndex = state.cart.items.findIndex(
            item => item.productId === product.id
          );

          if (existingIndex >= 0) {
            const items = [...state.cart.items];
            items[existingIndex].quantity += quantity;
            return { cart: { ...state.cart, items } };
          }

          return {
            cart: {
              ...state.cart,
              items: [...state.cart.items, {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity
              }]
            }
          };
        }),

        // Computed values
        get cartTotal() {
          return get().cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
        }
      }),
      {
        name: "ecommerce-store",
        partialize: (state) => ({
          auth: { token: state.auth.token },
          cart: state.cart
        })
      }
    )
  )
);
```

### Form State with Validation

```jsx
// Complex form with useReducer
const initialFormState = {
  values: {
    email: "",
    password: "",
    confirmPassword: ""
  },
  errors: {},
  touched: {},
  isSubmitting: false,
  isValid: false
};

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      const values = { ...state.values, [action.field]: action.value };
      const errors = validateForm(values);
      return {
        ...state,
        values,
        errors,
        isValid: Object.keys(errors).length === 0
      };

    case "SET_TOUCHED":
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true }
      };

    case "SUBMIT_START":
      return { ...state, isSubmitting: true };

    case "SUBMIT_SUCCESS":
      return initialFormState;

    case "SUBMIT_ERROR":
      return {
        ...state,
        isSubmitting: false,
        errors: { ...state.errors, submit: action.error }
      };

    default:
      return state;
  }
}

function validateForm(values) {
  const errors = {};

  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Invalid email format";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

function useForm() {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const setField = useCallback((field, value) => {
    dispatch({ type: "SET_FIELD", field, value });
  }, []);

  const setTouched = useCallback((field) => {
    dispatch({ type: "SET_TOUCHED", field });
  }, []);

  const handleSubmit = useCallback(async (onSubmit) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      await onSubmit(state.values);
      dispatch({ type: "SUBMIT_SUCCESS" });
    } catch (error) {
      dispatch({ type: "SUBMIT_ERROR", error: error.message });
    }
  }, [state.values]);

  return { ...state, setField, setTouched, handleSubmit };
}
```

### Real-time Collaboration State

```jsx
// Collaborative editing với Zustand + WebSocket
const useCollabStore = create((set, get) => ({
  document: null,
  cursors: {}, // Other users' cursors
  users: [],
  socket: null,

  connect: (documentId, userId) => {
    const socket = new WebSocket(`ws://api/collab/${documentId}`);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "DOCUMENT_STATE":
          set({ document: message.document, users: message.users });
          break;

        case "CURSOR_MOVE":
          set((state) => ({
            cursors: {
              ...state.cursors,
              [message.userId]: message.position
            }
          }));
          break;

        case "DOCUMENT_CHANGE":
          set((state) => ({
            document: applyOperation(state.document, message.operation)
          }));
          break;

        case "USER_JOIN":
          set((state) => ({
            users: [...state.users, message.user]
          }));
          break;

        case "USER_LEAVE":
          set((state) => ({
            users: state.users.filter(u => u.id !== message.userId),
            cursors: Object.fromEntries(
              Object.entries(state.cursors).filter(([id]) => id !== message.userId)
            )
          }));
          break;
      }
    };

    set({ socket });
  },

  updateCursor: (position) => {
    get().socket?.send(JSON.stringify({
      type: "CURSOR_MOVE",
      position
    }));
  },

  applyChange: (operation) => {
    // Local-first: apply immediately
    set((state) => ({
      document: applyOperation(state.document, operation)
    }));

    // Sync to server
    get().socket?.send(JSON.stringify({
      type: "DOCUMENT_CHANGE",
      operation
    }));
  }
}));
```

---

## Interview Questions

### Level 1: Basic

**1. Khi nào dùng useState vs useReducer?**
```
useState:
- Simple values (string, number, boolean)
- Independent state pieces
- Few update scenarios

useReducer:
- Complex objects với nhiều properties
- Related state cần update cùng lúc
- Many action types
- Need to pass dispatch down (stable reference)
```

**2. Tại sao cần immutable updates?**
```jsx
// ❌ Mutating - React không detect được change
state.user.name = "John";
setState(state);

// ✅ Immutable - tạo object mới
setState(prev => ({
  ...prev,
  user: { ...prev.user, name: "John" }
}));

// Lý do:
// - React so sánh reference để detect changes
// - Predictable state changes
// - Time-travel debugging
// - Concurrent features require immutability
```

### Level 2: Intermediate

**3. Context API performance issues và solutions?**
```
Problem:
- All consumers re-render when any value changes
- No built-in selector mechanism

Solutions:
1. Split contexts by domain (UserContext, ThemeContext)
2. Separate state and dispatch contexts
3. Use useMemo for value object
4. Use memo() for consumers
5. Use libraries với selectors (use-context-selector)
```

**4. Redux vs Zustand vs Jotai?**
```
Redux:
- Predictable với strict rules
- Excellent devtools
- Best for large teams/apps
- More boilerplate

Zustand:
- Simple API, minimal setup
- No providers needed
- Good middle ground
- Easier learning curve

Jotai:
- Atomic model (bottom-up)
- Fine-grained reactivity
- Good for derived state
- Different mental model
```

**5. Server state vs Client state?**
```
Server State:
- Cached data from API
- Can be stale
- Shared across users
- Background sync
→ Use: TanStack Query, SWR, RTK Query

Client State:
- UI state (modals, toggles)
- Form state
- User preferences
- Always up-to-date
→ Use: useState, Zustand, Redux
```

### Level 3: Advanced

**6. State normalization là gì? Khi nào cần?**
```
Normalization = flat structure, no nesting

Khi cần:
- Same entity appears in multiple places
- Deep nesting makes updates complex
- Need efficient lookups by ID

Pattern:
{
  entities: {
    [entityType]: {
      byId: { [id]: entity },
      allIds: [ids]
    }
  }
}
```

**7. Optimistic updates pattern?**
```jsx
// 1. Update UI immediately (optimistic)
// 2. Call API
// 3. Success: replace temp with real data
// 4. Error: rollback to previous state

Benefits:
- Instant feedback
- Better UX

Challenges:
- Handle conflicts
- Proper error recovery
- Race conditions
```

**8. State colocation principle?**
```
"Colocate state as close to where it's used as possible"

Rules:
1. Start with local state
2. Lift up only when needed to share
3. Use global state sparingly
4. Server state stays in cache layer

Benefits:
- Better performance (fewer re-renders)
- Easier to reason about
- Better code organization
```

**9. Zustand vs Redux middleware?**
```
Redux:
- Middleware pipeline
- thunk, saga, observable
- Action → Middleware → Reducer

Zustand:
- Direct async in actions
- No middleware abstraction needed
- Simpler for most cases
- Can use middleware for persist, devtools
```

**10. Derived state anti-pattern?**
```jsx
// ❌ Anti-pattern: storing derived state
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(items.reduce((sum, i) => sum + i.price, 0));
}, [items]);

// ✅ Derive when needed
const [items, setItems] = useState([]);
const total = useMemo(
  () => items.reduce((sum, i) => sum + i.price, 0),
  [items]
);

// Rule: Don't store what you can compute
```
