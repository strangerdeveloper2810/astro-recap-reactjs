---

# 1. React Core & Hooks Nâng Cao

## Q1.1: Giải thích chi tiết React Fiber Architecture?

**Độ khó:** Senior/Lead

### Câu trả lời:

React Fiber là bản viết lại hoàn toàn của React's core algorithm (reconciliation), được giới thiệu từ React 16. Đây là nền tảng cho tất cả các tính năng concurrent của React.

### Kiến trúc Stack Reconciler (Cũ):

```
┌─────────────────────────────────────────────────────────────┐
│                    STACK RECONCILER                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Component Tree Update                                      │
│         │                                                    │
│         ▼                                                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              SYNCHRONOUS RENDER                      │   │
│   │  ┌─────┐ ──▶ ┌─────┐ ──▶ ┌─────┐ ──▶ ┌─────┐       │   │
│   │  │ A   │     │ B   │     │ C   │     │ D   │       │   │
│   │  └─────┘     └─────┘     └─────┘     └─────┘       │   │
│   │                                                      │   │
│   │  ⚠️  CANNOT BE INTERRUPTED                          │   │
│   │  ⚠️  BLOCKS MAIN THREAD                             │   │
│   │  ⚠️  NO PRIORITY SCHEDULING                         │   │
│   └─────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│   Commit to DOM                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Kiến trúc Fiber (Mới):

```
┌─────────────────────────────────────────────────────────────┐
│                     FIBER ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  FIBER NODE                          │   │
│   │                                                      │   │
│   │   type: Component/Element                            │   │
│   │   key: unique identifier                             │   │
│   │   stateNode: DOM node/Component instance             │   │
│   │   child ──────────▶ First child Fiber                │   │
│   │   sibling ────────▶ Next sibling Fiber               │   │
│   │   return ─────────▶ Parent Fiber                     │   │
│   │   alternate ──────▶ Work-in-progress                 │   │
│   │   effectTag: PLACEMENT | UPDATE | DELETION           │   │
│   │   pendingProps / memoizedProps                       │   │
│   │   memoizedState / updateQueue                        │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              FIBER TREE STRUCTURE                    │   │
│   │                                                      │   │
│   │                    ┌─────┐                           │   │
│   │                    │ App │ (return: null)            │   │
│   │                    └──┬──┘                           │   │
│   │                       │ child                        │   │
│   │                    ┌──▼──┐                           │   │
│   │                    │Header│                          │   │
│   │                    └──┬──┘                           │   │
│   │         sibling ──────┤                              │   │
│   │       ┌───────────────┼───────────────┐              │   │
│   │    ┌──▼──┐         ┌──▼──┐         ┌──▼──┐          │   │
│   │    │Main │         │Side │         │Footer│          │   │
│   │    └─────┘         └─────┘         └─────┘          │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fiber Work Loop:

```javascript
// Simplified Fiber work loop
function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    // Perform work on current fiber
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // Check if we should yield to browser
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    // All work done, commit changes
    commitRoot();
  }

  // Schedule next chunk of work
  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber) {
  // 1. Begin work on this fiber
  beginWork(fiber);

  // 2. If there's a child, work on it next
  if (fiber.child) {
    return fiber.child;
  }

  // 3. Otherwise, complete this fiber and try sibling
  let nextFiber = fiber;
  while (nextFiber) {
    completeWork(nextFiber);

    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.return;
  }

  return null;
}
```

### Priority Lanes System (React 18+):

```javascript
// Priority levels in React 18
const SyncLane = 0b0000000000000000000000000000001;      // Highest
const InputContinuousLane = 0b0000000000000000000000000000100;
const DefaultLane = 0b0000000000000000000000000000010000;
const TransitionLane = 0b0000000000000000000000001000000;
const IdleLane = 0b0100000000000000000000000000000;      // Lowest

// Example: User interaction gets high priority
function handleClick() {
  // This update uses SyncLane (immediate)
  setCount(c => c + 1);
}

// Example: Transition gets low priority
function handleTabChange(tab) {
  startTransition(() => {
    // This update uses TransitionLane (can be interrupted)
    setTab(tab);
  });
}
```

### Double Buffering:

```
┌─────────────────────────────────────────────────────────────┐
│                    DOUBLE BUFFERING                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   CURRENT TREE              WORK-IN-PROGRESS TREE           │
│   (Displayed)               (Being built)                    │
│                                                              │
│   ┌─────────┐    alternate   ┌─────────┐                    │
│   │  Fiber  │ ◀────────────▶ │  Fiber  │                    │
│   │ (curr)  │                │  (wip)  │                    │
│   └────┬────┘                └────┬────┘                    │
│        │                          │                          │
│   ┌────▼────┐                ┌────▼────┐                    │
│   │  Child  │ ◀────────────▶ │  Child  │                    │
│   └─────────┘                └─────────┘                    │
│                                                              │
│   After commit: WIP becomes Current                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Benefits:

| Feature | Stack Reconciler | Fiber |
|---------|-----------------|-------|
| Interruptible | ❌ No | ✅ Yes |
| Priority Scheduling | ❌ No | ✅ Yes |
| Time Slicing | ❌ No | ✅ Yes |
| Concurrent Mode | ❌ No | ✅ Yes |
| Error Boundaries | ❌ Limited | ✅ Full |
| Suspense | ❌ No | ✅ Yes |

---

## Q1.2: Giải thích Reconciliation Algorithm chi tiết với ví dụ?

**Độ khó:** Senior

### Câu trả lời:

Reconciliation là quá trình React so sánh 2 trees (current và work-in-progress) để xác định minimal set of changes cần apply vào DOM.

### Reconciliation Process Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                RECONCILIATION PROCESS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   STATE CHANGE                                               │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │           CREATE NEW VIRTUAL DOM TREE                │   │
│   └───────────────────────┬─────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              DIFFING ALGORITHM                       │   │
│   │                                                      │   │
│   │  ┌─────────────────┐    ┌─────────────────┐         │   │
│   │  │   OLD TREE      │    │   NEW TREE      │         │   │
│   │  │                 │    │                 │         │   │
│   │  │    ┌───┐        │    │    ┌───┐        │         │   │
│   │  │    │ A │        │    │    │ A │        │         │   │
│   │  │    └─┬─┘        │ vs │    └─┬─┘        │         │   │
│   │  │  ┌───┼───┐      │    │  ┌───┼───┐      │         │   │
│   │  │ ┌┴┐ ┌┴┐ ┌┴┐     │    │ ┌┴┐ ┌┴┐ ┌┴┐     │         │   │
│   │  │ │B│ │C│ │D│     │    │ │B│ │E│ │D│     │         │   │
│   │  │ └─┘ └─┘ └─┘     │    │ └─┘ └─┘ └─┘     │         │   │
│   │  └─────────────────┘    └─────────────────┘         │   │
│   │                                                      │   │
│   │  Result: C replaced with E                           │   │
│   └───────────────────────┬─────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│   ┌─────────────────────────────────────────────────────┐   │
│   │           GENERATE EFFECT LIST                       │   │
│   │                                                      │   │
│   │  Effects: [                                          │   │
│   │    { type: 'UPDATE', fiber: C→E },                   │   │
│   │  ]                                                   │   │
│   └───────────────────────┬─────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              COMMIT PHASE                            │   │
│   │                                                      │   │
│   │  Apply effects to real DOM                           │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Diffing Rules:

#### Rule 1: Different Element Types

```javascript
// OLD
<div>
  <Counter />
</div>

// NEW
<span>
  <Counter />
</span>

// React will:
// 1. Destroy entire <div> tree including Counter
// 2. Counter.componentWillUnmount() called
// 3. Build new <span> tree
// 4. Counter.componentDidMount() called
// 5. All state in Counter is LOST
```

#### Rule 2: Same DOM Element Type

```javascript
// OLD
<div className="before" title="stuff" />

// NEW
<div className="after" title="stuff" />

// React will:
// 1. Keep the same DOM node
// 2. Only update changed attributes (className)
// 3. Recurse on children
```

#### Rule 3: Same Component Type

```javascript
// OLD
<MyComponent name="John" age={25} />

// NEW
<MyComponent name="Jane" age={25} />

// React will:
// 1. Keep same component instance
// 2. Update props
// 3. Call render() with new props
// 4. State is PRESERVED
```

#### Rule 4: Keys in Lists (CRITICAL)

```javascript
// Scenario: Insert item at beginning

// ❌ WITHOUT KEYS - O(n) updates
// OLD                          NEW
['Duke', 'Villanova']    →    ['Connecticut', 'Duke', 'Villanova']

// React's perspective (by index):
// Index 0: 'Duke' → 'Connecticut'     (UPDATE)
// Index 1: 'Villanova' → 'Duke'       (UPDATE)
// Index 2: undefined → 'Villanova'    (INSERT)
// Total: 3 operations

// ✅ WITH KEYS - O(1) insert
// OLD                                NEW
[{key:'d', val:'Duke'},           [{key:'c', val:'Connecticut'},
 {key:'v', val:'Villanova'}]   →   {key:'d', val:'Duke'},
                                    {key:'v', val:'Villanova'}]

// React's perspective (by key):
// Key 'c': not found → Connecticut    (INSERT)
// Key 'd': Duke → Duke                (NO CHANGE)
// Key 'v': Villanova → Villanova      (NO CHANGE)
// Total: 1 operation
```

### Key Reconciliation Implementation:

```javascript
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  let resultingFirstChild = null;
  let previousNewFiber = null;
  let oldFiber = currentFirstChild;
  let newIdx = 0;
  let lastPlacedIndex = 0;

  // First pass: Walk the old and new children in parallel
  // Match by index first
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      // There's a gap, oldFiber is ahead
      oldFiber = null;
    }

    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);

    if (newFiber === null) {
      // Keys don't match, break out of first pass
      break;
    }

    if (oldFiber && newFiber.alternate === null) {
      // New fiber was created without reusing old
      deleteChild(returnFiber, oldFiber);
    }

    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = oldFiber.sibling;
  }

  // Second pass: Handle remaining cases
  if (newIdx === newChildren.length) {
    // All new children processed, delete remaining old
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  if (oldFiber === null) {
    // All old children processed, add remaining new
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx]);
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      // ... link fibers
    }
    return resultingFirstChild;
  }

  // Build map of old children by key
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

  // Third pass: Match by key from the map
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx]
    );

    if (newFiber !== null) {
      if (newFiber.alternate !== null) {
        existingChildren.delete(newFiber.key ?? newIdx);
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      // ... link fibers
    }
  }

  // Delete any remaining old children
  existingChildren.forEach(child => deleteChild(returnFiber, child));

  return resultingFirstChild;
}
```

---

## Q1.3: Hooks Internal - Làm sao React track state giữa các renders?

**Độ khó:** Senior/Lead

### Câu trả lời:

React sử dụng linked list để track hooks theo thứ tự gọi trong mỗi component.

### Hooks Data Structure:

```
┌─────────────────────────────────────────────────────────────┐
│                    HOOKS LINKED LIST                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   FIBER NODE                                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  memoizedState ──────────────────────────────────┐  │   │
│   └──────────────────────────────────────────────────│──┘   │
│                                                      │       │
│                                                      ▼       │
│   HOOK 1 (useState)         HOOK 2 (useEffect)              │
│   ┌────────────────┐   next ┌────────────────┐              │
│   │ memoizedState: │ ─────▶ │ memoizedState: │              │
│   │   0            │        │   Effect {...} │              │
│   │ queue: {...}   │        │ queue: null    │              │
│   │ baseState: 0   │        │ deps: [...]    │              │
│   └────────────────┘        └───────┬────────┘              │
│                                     │ next                   │
│                                     ▼                        │
│   HOOK 3 (useMemo)          HOOK 4 (useCallback)            │
│   ┌────────────────┐   next ┌────────────────┐              │
│   │ memoizedState: │ ─────▶ │ memoizedState: │              │
│   │   [value,deps] │        │   [fn, deps]   │              │
│   └────────────────┘        └────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Why Hooks Must Be Called in Same Order:

```javascript
// ❌ WRONG - Conditional hook
function BadComponent({ isLoggedIn }) {
  const [name, setName] = useState('');

  if (isLoggedIn) {
    useEffect(() => { /* ... */ }); // ⚠️ Conditional!
  }

  const [age, setAge] = useState(0);
}

// First render (isLoggedIn = true):
// Hook List: [useState(''), useEffect, useState(0)]
//             index 0       index 1    index 2

// Second render (isLoggedIn = false):
// Hook List: [useState(''), useState(0)]
//             index 0       index 1  ← MISMATCH!
//
// React expects useEffect at index 1
// But gets useState instead → STATE CORRUPTION

// ✅ CORRECT - Move condition inside
function GoodComponent({ isLoggedIn }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      // Logic here
    }
  }, [isLoggedIn]);

  const [age, setAge] = useState(0);
}
```

### Hooks Dispatcher Implementation:

```javascript
// Simplified hooks dispatcher
let currentFiber = null;
let currentHook = null;
let workInProgressHook = null;

function useState(initialState) {
  return useReducer(basicStateReducer, initialState);
}

function useReducer(reducer, initialArg, init) {
  // Get or create hook
  const hook = mountWorkInProgressHook();

  // Initialize state on mount
  if (currentHook === null) {
    hook.memoizedState = init !== undefined
      ? init(initialArg)
      : initialArg;
    hook.baseState = hook.memoizedState;
  }

  // Create update queue
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: reducer,
    lastRenderedState: hook.memoizedState,
  };
  hook.queue = queue;

  // Create dispatch function
  const dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentFiber,
    queue
  ));

  return [hook.memoizedState, dispatch];
}

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // First hook in the list
    currentFiber.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the list
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}

function dispatchAction(fiber, queue, action) {
  // Create update object
  const update = {
    action,
    next: null,
  };

  // Add to circular queue
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;

  // Schedule re-render
  scheduleUpdateOnFiber(fiber);
}
```

### useEffect Lifecycle:

```
┌─────────────────────────────────────────────────────────────┐
│                   useEffect LIFECYCLE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   RENDER PHASE                                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  1. Component renders                                │   │
│   │  2. useEffect callback stored (not executed)         │   │
│   │  3. Dependencies compared with previous              │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│   COMMIT PHASE (Layout Effects - useLayoutEffect)           │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  1. DOM mutations applied                            │   │
│   │  2. useLayoutEffect cleanup runs (sync)              │   │
│   │  3. useLayoutEffect callback runs (sync)             │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│   BROWSER PAINT                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Screen updates visible to user                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│   PASSIVE EFFECTS (useEffect - async)                        │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  1. useEffect cleanup runs                           │   │
│   │  2. useEffect callback runs                          │   │
│   │  (Runs after paint, non-blocking)                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Timeline:
─────────────────────────────────────────────────────────────▶
  Render    Layout     Paint      Passive
  Phase     Effects              Effects
    │          │         │          │
    ▼          ▼         ▼          ▼
  [JSX]  [useLayout] [Screen] [useEffect]
                      updates
```

---

## Q1.4: Closures và Stale Closures trong React Hooks?

**Độ khó:** Senior

### Câu trả lời:

Closures trong JavaScript capture variables từ outer scope. Trong React hooks, điều này có thể dẫn đến "stale closures" - khi callback tham chiếu đến giá trị cũ.

### Stale Closure Problem:

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // ⚠️ STALE CLOSURE
      // count is captured at the time useEffect ran
      console.log('Count:', count); // Always logs 0!
      setCount(count + 1); // Always sets to 1!
    }, 1000);

    return () => clearInterval(id);
  }, []); // Empty deps = effect runs once on mount

  return <div>{count}</div>;
}
```

### Visual Explanation:

```
┌─────────────────────────────────────────────────────────────┐
│                   STALE CLOSURE PROBLEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   INITIAL RENDER (count = 0)                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  useEffect(() => {                                   │   │
│   │    setInterval(() => {                               │   │
│   │      setCount(count + 1);  ◀── count = 0 captured   │   │
│   │    }, 1000);                                         │   │
│   │  }, []);                                             │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   RENDER 2 (count = 1)                                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Effect NOT re-run (deps = [])                       │   │
│   │  Old closure still has count = 0                     │   │
│   │  setCount(0 + 1) = 1                                 │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   RENDER 3 (count = still 1!)                                │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Old closure still has count = 0                     │   │
│   │  setCount(0 + 1) = 1 (no change!)                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   Result: count stays at 1 forever                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Solutions:

#### Solution 1: Functional Update

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // ✅ Functional update - always gets latest state
      setCount(prevCount => prevCount + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []); // Empty deps is fine now

  return <div>{count}</div>;
}
```

#### Solution 2: Include in Dependencies

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // ✅ count is always fresh
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [count]); // Re-run when count changes
  // ⚠️ Note: This creates new interval every second

  return <div>{count}</div>;
}
```

#### Solution 3: useRef for Mutable Value

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  // Keep ref in sync
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    const id = setInterval(() => {
      // ✅ Always access latest via ref
      console.log('Count:', countRef.current);
      setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <div>{count}</div>;
}
```

#### Solution 4: useCallback with Dependencies

```javascript
function SearchComponent({ query }) {
  const [results, setResults] = useState([]);

  // ❌ Stale closure - query captured once
  const searchBad = useCallback(() => {
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(setResults);
  }, []); // Missing query dependency

  // ✅ Fresh closure - updates when query changes
  const searchGood = useCallback(() => {
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(setResults);
  }, [query]); // Proper dependency

  return <button onClick={searchGood}>Search</button>;
}
```

### Common Stale Closure Patterns:

```javascript
// ❌ PATTERN 1: Event handlers with stale state
function Form() {
  const [data, setData] = useState({ name: '' });

  // This handler captures 'data' at creation time
  const handleSubmit = () => {
    console.log(data); // Might be stale!
    submitForm(data);
  };

  // ✅ FIX: Use ref or functional update
  const dataRef = useRef(data);
  dataRef.current = data;

  const handleSubmitFixed = useCallback(() => {
    submitForm(dataRef.current);
  }, []);
}

// ❌ PATTERN 2: Async operations
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(data => {
      // userId might have changed while fetching!
      setUser(data);
    });
  }, [userId]);

  // ✅ FIX: Check if still relevant
  useEffect(() => {
    let cancelled = false;

    fetchUser(userId).then(data => {
      if (!cancelled) {
        setUser(data);
      }
    });

    return () => { cancelled = true; };
  }, [userId]);
}

// ❌ PATTERN 3: Debounced functions
function Search() {
  const [query, setQuery] = useState('');

  // Debounced function captures old query
  const debouncedSearch = useMemo(
    () => debounce((q) => search(q), 300),
    [] // Missing query!
  );

  // ✅ FIX: Pass query as parameter
  const debouncedSearch = useMemo(
    () => debounce((q) => search(q), 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);
}
```

---

## Q1.5: React 18 Concurrent Features - Suspense, Transitions, useDeferredValue?

**Độ khó:** Senior/Lead

### Câu trả lời:

React 18 giới thiệu Concurrent Rendering - khả năng render nhiều versions của UI đồng thời.

### Concurrent Rendering Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│              CONCURRENT RENDERING FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   USER INTERACTION                                           │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │               SCHEDULER                              │   │
│   │                                                      │   │
│   │   Priority Queue:                                    │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │ HIGH: User Input, Click, Type              │   │   │
│   │   ├─────────────────────────────────────────────┤   │   │
│   │   │ MEDIUM: Hover, Focus                        │   │   │
│   │   ├─────────────────────────────────────────────┤   │   │
│   │   │ LOW: Transitions, Data Fetching            │   │   │
│   │   ├─────────────────────────────────────────────┤   │   │
│   │   │ IDLE: Background Work                       │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│          ┌────────────────┴────────────────┐                │
│          ▼                                 ▼                 │
│   ┌──────────────┐                  ┌──────────────┐        │
│   │ URGENT LANE  │                  │TRANSITION    │        │
│   │              │                  │LANE          │        │
│   │ Sync render  │                  │              │        │
│   │ Cannot be    │                  │ Can be       │        │
│   │ interrupted  │                  │ interrupted  │        │
│   └──────────────┘                  │ Can be       │        │
│          │                          │ abandoned    │        │
│          ▼                          └──────────────┘        │
│   ┌──────────────┐                         │                │
│   │ IMMEDIATE    │                         ▼                │
│   │ COMMIT       │                  ┌──────────────┐        │
│   └──────────────┘                  │ RENDER IN    │        │
│                                     │ BACKGROUND   │        │
│                                     └──────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1. Suspense for Data Fetching

```javascript
// Traditional approach - manual loading state
function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;
  return <Profile user={user} />;
}

// Suspense approach - declarative loading
function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileDetails />
      <Suspense fallback={<PostsSkeleton />}>
        <ProfilePosts />
      </Suspense>
    </Suspense>
  );
}

// Component that suspends
function ProfileDetails() {
  // use() hook suspends until data is ready
  const user = use(fetchUser());
  return <div>{user.name}</div>;
}
```

### Suspense Boundary Nesting:

```
┌─────────────────────────────────────────────────────────────┐
│                  SUSPENSE BOUNDARIES                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   <Suspense fallback={<AppSkeleton/>}>                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │   <Header/>  ← Suspends here, shows AppSkeleton     │   │
│   │                                                      │   │
│   │   <Suspense fallback={<SidebarSkeleton/>}>          │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │   <Sidebar/>  ← Suspends here,              │   │   │
│   │   │                  shows SidebarSkeleton      │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │                                                      │   │
│   │   <Suspense fallback={<ContentSkeleton/>}>          │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │   <Content/>  ← Suspends independently      │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   Each boundary shows its own fallback independently         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. useTransition

```javascript
function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('about');

  function selectTab(nextTab) {
    startTransition(() => {
      // This update is marked as a transition
      // React will keep showing old UI while new UI renders
      setTab(nextTab);
    });
  }

  return (
    <>
      <TabButtons onSelect={selectTab} />

      {/* Show pending indicator */}
      {isPending && <Spinner />}

      {/* This can be expensive to render */}
      <TabPanel tab={tab} />
    </>
  );
}
```

### Transition Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANSITION FLOW                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   TIME ─────────────────────────────────────────────────▶   │
│                                                              │
│   User clicks "Posts" tab                                    │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ CURRENT STATE: About Tab (visible)                   │   │
│   │                                                      │   │
│   │ startTransition(() => setTab('posts'))               │   │
│   │        │                                             │   │
│   │        ▼                                             │   │
│   │ isPending = true                                     │   │
│   │                                                      │   │
│   │ ┌─────────────────────────────────────┐             │   │
│   │ │ ABOUT TAB (still visible)           │             │   │
│   │ │ + Spinner overlay                   │             │   │
│   │ └─────────────────────────────────────┘             │   │
│   │                                                      │   │
│   │ Meanwhile in background:                             │   │
│   │ ┌─────────────────────────────────────┐             │   │
│   │ │ POSTS TAB (rendering)               │             │   │
│   │ │ Can be interrupted by user input    │             │   │
│   │ └─────────────────────────────────────┘             │   │
│   │                                                      │   │
│   │ When ready:                                          │   │
│   │ isPending = false                                    │   │
│   │                                                      │   │
│   │ ┌─────────────────────────────────────┐             │   │
│   │ │ POSTS TAB (now visible)             │             │   │
│   │ └─────────────────────────────────────┘             │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. useDeferredValue

```javascript
function SearchResults({ query }) {
  // deferredQuery lags behind query during fast updates
  const deferredQuery = useDeferredValue(query);

  // Check if we're showing stale content
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      {/* This expensive component uses deferred value */}
      {/* It won't re-render on every keystroke */}
      <ExpensiveSearchResults query={deferredQuery} />
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <>
      {/* Input stays responsive */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Results can lag behind */}
      <SearchResults query={query} />
    </>
  );
}
```

### useDeferredValue vs useTransition:

```
┌─────────────────────────────────────────────────────────────┐
│          useDeferredValue vs useTransition                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   useDeferredValue                useTransition              │
│   ─────────────────               ─────────────              │
│   • Defers a VALUE                • Defers an UPDATE         │
│   • Used when you don't           • Used when you control    │
│     control the state update        the state update         │
│   • Returns deferred value        • Returns [isPending,      │
│                                     startTransition]         │
│                                                              │
│   Example:                        Example:                   │
│   ─────────                       ─────────                  │
│   // Value from parent            // You control update      │
│   const deferred =                const [pending, start] =   │
│     useDeferredValue(value);        useTransition();         │
│                                                              │
│   // Can't change how value       // Wrap your update        │
│   // is updated                   start(() => {              │
│                                     setState(newValue);      │
│                                   });                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Q1.6: useReducer vs useState - Khi nào dùng cái nào?

**Độ khó:** Mid-Senior

### Câu trả lời:

### Comparison:

```
┌─────────────────────────────────────────────────────────────┐
│              useState vs useReducer                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   useState                        useReducer                 │
│   ────────                        ──────────                 │
│   Simple state                    Complex state logic        │
│   Independent updates             Related state updates      │
│   Primitive values                Objects/Arrays             │
│   Few state variables             Many state variables       │
│   Simple transitions              Complex transitions        │
│                                                              │
│   const [count, setCount]         const [state, dispatch]    │
│     = useState(0);                  = useReducer(reducer,    │
│                                       initialState);         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### useState - Simple State:

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div>
      <input
        value={step}
        onChange={(e) => setStep(Number(e.target.value))}
      />
      <button onClick={() => setCount(c => c + step)}>
        +{step}
      </button>
      <span>{count}</span>
    </div>
  );
}
```

### useReducer - Complex State:

```javascript
// State shape
const initialState = {
  items: [],
  loading: false,
  error: null,
  filter: 'all',
  selectedId: null,
};

// Action types
const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  SET_FILTER: 'SET_FILTER',
  SELECT_ITEM: 'SELECT_ITEM',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
};

// Reducer function
function todoReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload,
        error: null,
      };

    case ACTIONS.FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: action.payload,
      };

    case ACTIONS.SELECT_ITEM:
      return {
        ...state,
        selectedId: action.payload,
      };

    case ACTIONS.ADD_ITEM:
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        selectedId: state.selectedId === action.payload
          ? null
          : state.selectedId,
      };

    case ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };

    default:
      return state;
  }
}

// Component
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const fetchTodos = async () => {
    dispatch({ type: ACTIONS.FETCH_START });
    try {
      const data = await api.getTodos();
      dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: data });
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
    }
  };

  const addTodo = (todo) => {
    dispatch({ type: ACTIONS.ADD_ITEM, payload: todo });
  };

  const removeTodo = (id) => {
    dispatch({ type: ACTIONS.REMOVE_ITEM, payload: id });
  };

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      <TodoList />
      <TodoFilter />
      <AddTodoForm onAdd={addTodo} />
    </TodoContext.Provider>
  );
}
```

### When to Use Each:

```javascript
// ✅ useState: Independent, simple values
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [age, setAge] = useState(0);

// ✅ useReducer: Related values that update together
const [formState, dispatch] = useReducer(formReducer, {
  values: { name: '', email: '', age: 0 },
  errors: {},
  touched: {},
  isSubmitting: false,
});

// ✅ useState: Toggle boolean
const [isOpen, setIsOpen] = useState(false);

// ✅ useReducer: Complex modal state
const [modalState, dispatch] = useReducer(modalReducer, {
  isOpen: false,
  content: null,
  size: 'medium',
  onClose: null,
  preventClose: false,
});

// ✅ useState: Simple list add/remove
const [items, setItems] = useState([]);
const addItem = (item) => setItems([...items, item]);

// ✅ useReducer: Complex list with filters, sorting, pagination
const [listState, dispatch] = useReducer(listReducer, {
  items: [],
  sortBy: 'date',
  sortOrder: 'desc',
  filter: {},
  page: 1,
  pageSize: 20,
  total: 0,
});
```

---

## Q1.7: Custom Hooks - Best Practices và Advanced Patterns?

**Độ khó:** Senior

### Câu trả lời:

### Custom Hook Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                  CUSTOM HOOK PATTERNS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    useCustomHook                     │   │
│   │                                                      │   │
│   │   INPUT          LOGIC           OUTPUT              │   │
│   │   ─────          ─────           ──────              │   │
│   │   • Props        • State         • State values      │   │
│   │   • Config       • Effects       • Actions           │   │
│   │   • Deps         • Callbacks     • Computed values   │   │
│   │                  • Refs          • Status            │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   RULES:                                                     │
│   • Start with 'use' prefix                                  │
│   • Can call other hooks                                     │
│   • Share logic, not state (each call has own state)         │
│   • Should be pure (same input → same behavior)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Pattern 1: Data Fetching Hook

```javascript
// Generic fetch hook with full features
function useFetch(url, options = {}) {
  const {
    immediate = true,
    initialData = null,
    onSuccess,
    onError,
    transform = (data) => data,
  } = options;

  const [state, setState] = useState({
    data: initialData,
    loading: immediate,
    error: null,
  });

  const abortControllerRef = useRef(null);

  const execute = useCallback(async (overrideUrl) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(overrideUrl || url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const transformedData = transform(json);

      setState({ data: transformedData, loading: false, error: null });
      onSuccess?.(transformedData);

      return transformedData;
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }

      setState(prev => ({ ...prev, loading: false, error }));
      onError?.(error);
      throw error;
    }
  }, [url, transform, onSuccess, onError]);

  // Auto-fetch on mount
  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [immediate, execute]);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.error && state.data === initialData,
    isSuccess: !state.loading && !state.error && state.data !== initialData,
    isError: !state.loading && state.error !== null,
  };
}

// Usage
function UserProfile({ userId }) {
  const {
    data: user,
    loading,
    error,
    execute: refetch
  } = useFetch(`/api/users/${userId}`, {
    transform: (data) => ({
      ...data,
      fullName: `${data.firstName} ${data.lastName}`,
    }),
    onError: (error) => toast.error(error.message),
  });

  if (loading) return <Spinner />;
  if (error) return <Error onRetry={refetch} />;

  return <div>{user.fullName}</div>;
}
```

### Pattern 2: Form Hook

```javascript
function useForm(initialValues, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((fieldValues = values) => {
    const newErrors = {};

    Object.keys(validationRules).forEach(field => {
      const value = fieldValues[field];
      const rules = validationRules[field];

      if (rules.required && !value) {
        newErrors[field] = rules.required.message || 'Required';
      } else if (rules.minLength && value.length < rules.minLength.value) {
        newErrors[field] = rules.minLength.message;
      } else if (rules.pattern && !rules.pattern.value.test(value)) {
        newErrors[field] = rules.pattern.message;
      } else if (rules.validate) {
        const error = rules.validate(value, fieldValues);
        if (error) newErrors[field] = error;
      }
    });

    return newErrors;
  }, [values, validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({ ...prev, [name]: newValue }));

    // Validate on change if already touched
    if (touched[name]) {
      const fieldErrors = validate({ ...values, [name]: newValue });
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name] || null
      }));
    }
  }, [touched, values, validate]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const fieldErrors = validate();
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name] || null
    }));
  }, [validate]);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e.preventDefault();

    // Touch all fields
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // Validate all
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    setValues,
    register: (name) => ({
      name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] && errors[name],
    }),
  };
}

// Usage
function LoginForm() {
  const form = useForm(
    { email: '', password: '' },
    {
      email: {
        required: { message: 'Email is required' },
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Invalid email format',
        },
      },
      password: {
        required: { message: 'Password is required' },
        minLength: {
          value: 8,
          message: 'Password must be at least 8 characters',
        },
      },
    }
  );

  const onSubmit = async (values) => {
    await api.login(values);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('email')} />
      <Input {...form.register('password')} type="password" />
      <button disabled={form.isSubmitting || !form.isValid}>
        {form.isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Pattern 3: Local Storage Hook with SSR Support

```javascript
function useLocalStorage(key, initialValue) {
  // Use lazy initialization to avoid SSR issues
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          setStoredValue(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  const remove = useCallback(() => {
    setStoredValue(initialValue);
    window.localStorage.removeItem(key);
  }, [key, initialValue]);

  return [storedValue, setStoredValue, remove];
}
```

### Pattern 4: Intersection Observer Hook

```javascript
function useIntersectionObserver(options = {}) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const [ref, setRef] = useState(null);
  const [entry, setEntry] = useState(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    if (!ref || frozen) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold, root, rootMargin, frozen]);

  return {
    ref: setRef,
    isIntersecting: entry?.isIntersecting ?? false,
    entry,
  };
}

// Usage: Infinite scroll
function InfiniteList({ items, loadMore, hasMore }) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isIntersecting && hasMore) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loadMore]);

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
      <li ref={ref} style={{ height: 1 }} />
    </ul>
  );
}

// Usage: Lazy image
function LazyImage({ src, alt }) {
  const { ref, isIntersecting } = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin: '50px',
  });

  return (
    <img
      ref={ref}
      src={isIntersecting ? src : undefined}
      alt={alt}
      loading="lazy"
    />
  );
}
```

---

## Q1.8: Error Boundaries và Error Handling trong React?

**Độ khó:** Mid-Senior

### Câu trả lời:

Error Boundaries là class components catch JavaScript errors trong child component tree.

### Error Boundary Implementation:

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  // Update state so next render shows fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log error information
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log to error reporting service
    logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          retry: this.handleRetry,
        });
      }

      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button onClick={this.handleRetry}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Boundary Hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│                ERROR BOUNDARY STRATEGY                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   <AppErrorBoundary>  ← Catch-all for entire app            │
│   │                                                          │
│   ├── <Header />  ← No boundary (crash = app crash)         │
│   │                                                          │
│   ├── <RouteErrorBoundary>  ← Per-route recovery            │
│   │   │                                                      │
│   │   ├── <PageContent />                                   │
│   │   │   │                                                  │
│   │   │   ├── <WidgetErrorBoundary>  ← Isolated widget      │
│   │   │   │   └── <WeatherWidget />                         │
│   │   │   │                                                  │
│   │   │   └── <WidgetErrorBoundary>                         │
│   │   │       └── <NewsWidget />                            │
│   │   │                                                      │
│   │   └── <Sidebar />                                       │
│   │                                                          │
│   └── <Footer />                                            │
│                                                              │
│   Granularity:                                               │
│   ─────────────                                              │
│   App Level    → Full page error                             │
│   Route Level  → Navigate to error page                      │
│   Widget Level → Show widget fallback, app continues         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Hook for Error Boundaries:

```javascript
// Custom hook to trigger error boundary
function useErrorBoundary() {
  const [, setError] = useState();

  const throwError = useCallback((error) => {
    setError(() => {
      throw error;
    });
  }, []);

  return throwError;
}

// Usage
function AsyncComponent() {
  const throwError = useErrorBoundary();

  useEffect(() => {
    fetchData().catch(throwError);
  }, [throwError]);

  return <div>...</div>;
}
```

### Error Handling Patterns:

```javascript
// Pattern 1: Try-Catch in Event Handlers
function Button() {
  const handleClick = async () => {
    try {
      await doSomethingRisky();
    } catch (error) {
      // Error boundaries DON'T catch this
      // Handle manually
      toast.error(error.message);
    }
  };

  return <button onClick={handleClick}>Click</button>;
}

// Pattern 2: Error state in hooks
function useSafeAsync() {
  const [state, setState] = useState({
    status: 'idle',
    data: null,
    error: null,
  });

  const run = useCallback(async (promise) => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const data = await promise;
      setState({ status: 'resolved', data, error: null });
      return data;
    } catch (error) {
      setState({ status: 'rejected', data: null, error });
      throw error;
    }
  }, []);

  return { ...state, run };
}

// Pattern 3: React Query error handling
function useUser(id) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      if (error.status === 401) {
        // Redirect to login
        navigate('/login');
      }
    },
  });
}
```

### What Error Boundaries DON'T Catch:

```javascript
// ❌ Event handlers (use try-catch)
<button onClick={() => { throw new Error(); }}>Click</button>

// ❌ Async code (use try-catch or .catch())
useEffect(() => {
  fetchData().catch(console.error);
}, []);

// ❌ Server-side rendering
// Handle on server

// ❌ Errors in the error boundary itself
class BadErrorBoundary extends React.Component {
  render() {
    if (this.state.hasError) {
      throw new Error(); // ❌ This won't be caught!
    }
    return this.props.children;
  }
}
```

---

## Q1.9: React Context - Performance Issues và Solutions?

**Độ khó:** Senior

### Câu trả lời:

### Context Re-render Problem:

```
┌─────────────────────────────────────────────────────────────┐
│                CONTEXT RE-RENDER PROBLEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   <ThemeContext.Provider value={{ theme, toggleTheme }}>    │
│   │                                                          │
│   ├── <Header />          ← Uses theme        → RE-RENDERS  │
│   ├── <Sidebar />         ← Uses nothing      → RE-RENDERS! │
│   ├── <MainContent />     ← Uses nothing      → RE-RENDERS! │
│   │   └── <Article />     ← Uses nothing      → RE-RENDERS! │
│   └── <Footer />          ← Uses toggleTheme  → RE-RENDERS  │
│                                                              │
│   Problem: ALL consumers re-render when ANY value changes    │
│                                                              │
│   Why? New object { theme, toggleTheme } created each render │
│         Even if theme is same, object reference is different │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Solution 1: Memoize Context Value

```javascript
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }, []);

  // ✅ Memoize the value object
  const value = useMemo(() => ({
    theme,
    toggleTheme,
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Solution 2: Split Contexts

```javascript
// ❌ Single context with multiple values
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);

  // Changing ANY value causes ALL consumers to re-render
  return (
    <AppContext.Provider value={{ user, theme, notifications, setUser, setTheme, setNotifications }}>
      {children}
    </AppContext.Provider>
  );
}

// ✅ Split into multiple contexts
const UserContext = createContext();
const ThemeContext = createContext();
const NotificationContext = createContext();

function AppProviders({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

// Now components only re-render when their specific context changes
function Header() {
  const { user } = useContext(UserContext);     // Only re-renders on user change
  const { theme } = useContext(ThemeContext);   // Only re-renders on theme change
  return <header>...</header>;
}
```

### Solution 3: Separate State and Actions

```javascript
const StateContext = createContext();
const DispatchContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // Actions never change (stable reference)
  const dispatch = useMemo(() => ({
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
    setTheme: (t) => setTheme(t),
  }), []);

  return (
    <StateContext.Provider value={theme}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Components that only need actions don't re-render on state changes
function ThemeToggleButton() {
  const { toggleTheme } = useContext(DispatchContext);
  // ✅ Does NOT re-render when theme changes
  return <button onClick={toggleTheme}>Toggle</button>;
}

// Components that need state re-render appropriately
function ThemedBox() {
  const theme = useContext(StateContext);
  // Re-renders when theme changes (expected)
  return <div className={theme}>...</div>;
}
```

### Solution 4: Use Selectors (like Redux)

```javascript
// Library: use-context-selector
import { createContext, useContextSelector } from 'use-context-selector';

const AppContext = createContext(null);

function useAppState(selector) {
  return useContextSelector(AppContext, selector);
}

// Only re-renders when selected value changes
function UserName() {
  const name = useAppState(state => state.user.name);
  return <span>{name}</span>;
}

function ThemeDisplay() {
  const theme = useAppState(state => state.theme);
  return <span>{theme}</span>;
}
```

### Context Performance Diagram:

```
┌─────────────────────────────────────────────────────────────┐
│              CONTEXT OPTIMIZATION STRATEGIES                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   PROBLEM              SOLUTION                              │
│   ───────              ────────                              │
│                                                              │
│   New object every     → useMemo on value                   │
│   render                                                     │
│                                                              │
│   Multiple values in   → Split into multiple contexts        │
│   one context                                                │
│                                                              │
│   Actions cause        → Separate state/dispatch contexts    │
│   re-renders                                                 │
│                                                              │
│   Need fine-grained    → use-context-selector library        │
│   subscriptions                                              │
│                                                              │
│   Deep component tree  → React.memo on consumers             │
│   re-renders                                                 │
│                                                              │
│   Complex state logic  → Consider Zustand/Jotai instead      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Q1.10: forwardRef và useImperativeHandle - When and How?

**Độ khó:** Mid-Senior

### Câu trả lời:

### forwardRef - Passing Refs Through Components:

```javascript
// ❌ Without forwardRef - ref doesn't work
function CustomInput({ label }) {
  return (
    <div>
      <label>{label}</label>
      <input />  {/* Can't access this from parent */}
    </div>
  );
}

function Form() {
  const inputRef = useRef();

  // inputRef.current is the CustomInput component instance
  // NOT the <input> element inside
  return <CustomInput ref={inputRef} label="Name" />;
}

// ✅ With forwardRef - ref is forwarded
const CustomInput = forwardRef(function CustomInput({ label }, ref) {
  return (
    <div>
      <label>{label}</label>
      <input ref={ref} />  {/* Now parent can access this */}
    </div>
  );
});

function Form() {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus(); // ✅ Works!
  }, []);

  return <CustomInput ref={inputRef} label="Name" />;
}
```

### useImperativeHandle - Custom Ref API:

```javascript
const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef();
  const [value, setValue] = useState('');

  // Customize what parent sees through ref
  useImperativeHandle(ref, () => ({
    // Custom methods
    focus: () => {
      inputRef.current.focus();
    },
    clear: () => {
      setValue('');
      inputRef.current.focus();
    },
    getValue: () => value,
    setValue: (newValue) => setValue(newValue),

    // Expose native input for advanced usage
    get input() {
      return inputRef.current;
    },
  }), [value]); // Dependencies for the handle

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      {...props}
    />
  );
});

// Usage
function Form() {
  const fancyInputRef = useRef();

  const handleSubmit = () => {
    console.log('Value:', fancyInputRef.current.getValue());
    fancyInputRef.current.clear();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FancyInput ref={fancyInputRef} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Complex Example - Modal with Imperative API:

```javascript
const Modal = forwardRef(function Modal({ children, onClose }, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);
  const resolveRef = useRef();

  useImperativeHandle(ref, () => ({
    // Open modal and return promise that resolves when closed
    open: (customContent) => {
      return new Promise((resolve) => {
        setContent(customContent || children);
        setIsOpen(true);
        resolveRef.current = resolve;
      });
    },

    close: (result) => {
      setIsOpen(false);
      resolveRef.current?.(result);
    },

    confirm: () => {
      return new Promise((resolve) => {
        setContent(
          <div>
            <p>Are you sure?</p>
            <button onClick={() => {
              setIsOpen(false);
              resolve(true);
            }}>Yes</button>
            <button onClick={() => {
              setIsOpen(false);
              resolve(false);
            }}>No</button>
          </div>
        );
        setIsOpen(true);
      });
    },
  }), [children]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {content}
        <button onClick={() => {
          setIsOpen(false);
          resolveRef.current?.(undefined);
          onClose?.();
        }}>
          Close
        </button>
      </div>
    </div>
  );
});

// Usage
function App() {
  const modalRef = useRef();

  const handleDelete = async () => {
    const confirmed = await modalRef.current.confirm();
    if (confirmed) {
      await deleteItem();
    }
  };

  const showDetails = async () => {
    await modalRef.current.open(<ItemDetails />);
    console.log('Modal closed');
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={showDetails}>Show Details</button>
      <Modal ref={modalRef} />
    </>
  );
}
```

### When to Use:

```
┌─────────────────────────────────────────────────────────────┐
│              forwardRef & useImperativeHandle                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   USE forwardRef when:                                       │
│   • Wrapping native elements (input, button, etc.)           │
│   • Creating reusable component libraries                    │
│   • Parent needs direct DOM access                           │
│                                                              │
│   USE useImperativeHandle when:                              │
│   • Need custom API instead of raw DOM                       │
│   • Want to hide implementation details                      │
│   • Exposing specific methods (focus, clear, reset)          │
│   • Creating imperative component APIs (modal.open())        │
│                                                              │
│   AVOID when:                                                │
│   • Can use props instead                                    │
│   • Can lift state up                                        │
│   • Data flow should be declarative                          │
│                                                              │
│   Remember: React prefers declarative over imperative        │
│             Use these sparingly for specific use cases       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
