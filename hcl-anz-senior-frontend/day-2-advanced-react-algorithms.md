# Day 2: Advanced React Patterns & Algorithms

> **Mục tiêu**: Master advanced React patterns, custom hooks, performance + giải thuật cơ bản
> **Thời gian**: 4-5 tiếng
> **Output**: Code được patterns phức tạp + giải được algorithm problems trong 20-30 phút

---

## Schedule Day 2

| Time | Topic | Duration |
|------|-------|----------|
| Session 1 | Advanced React Patterns | 1.5h |
| Session 2 | Performance Optimization | 1h |
| Session 3 | Algorithm Patterns (5 patterns) | 1.5h |
| Session 4 | Coding Practice + English | 1h |

---

## Session 1: Advanced React Patterns (1.5h)

### 1.1 Custom Hooks

#### Concept (Vietnamese)
Custom hooks cho phép extract và reuse logic có stateful giữa các components. Bắt đầu bằng "use" prefix.

#### Common Custom Hooks

```jsx
// 1. useLocalStorage - Persist state to localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

```jsx
// 2. useOnClickOutside - Detect clicks outside element
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
const ref = useRef();
useOnClickOutside(ref, () => setIsOpen(false));
```

```jsx
// 3. useAsync - Handle async operations
function useAsync(asyncFunction, immediate = true) {
  const [state, setState] = useState({
    loading: immediate,
    error: null,
    data: null,
  });

  const execute = useCallback(async (...args) => {
    setState({ loading: true, error: null, data: null });
    try {
      const data = await asyncFunction(...args);
      setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      setState({ loading: false, error, data: null });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}

// Usage
const { loading, error, data, execute: refetch } = useAsync(
  () => fetch('/api/users').then(r => r.json())
);
```

```jsx
// 4. useMediaQuery - Responsive design
function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery('(max-width: 768px)');
```

```jsx
// 5. usePrevious - Track previous value
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
const prevCount = usePrevious(count);
// On first render: prevCount = undefined
// After count changes: prevCount = previous count value
```

#### Interview Answer (English)
```
"Custom hooks are a powerful way to extract and share stateful logic between
components. They follow the same rules as built-in hooks - must start with
'use' and can only be called at the top level.

In my projects, I commonly create custom hooks for:
- Data fetching with loading/error states (useAsync, useFetch)
- Form handling (useForm with validation)
- Browser APIs (useLocalStorage, useMediaQuery)
- Event handling (useOnClickOutside, useKeyPress)

The key benefit is that each component using the hook gets its own isolated
state - they share logic, not state itself. This is different from Context
where state is shared."
```

---

### 1.2 Render Props Pattern

#### Concept (Vietnamese)
Render props là technique để share code giữa components bằng cách dùng prop có value là function.

```jsx
// Render prop component
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
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>
          Mouse position: {x}, {y}
        </div>
      )}
    />
  );
}

// Alternative: children as function
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // ... same logic
  return children(position);
}

<MouseTracker>
  {({ x, y }) => <div>Position: {x}, {y}</div>}
</MouseTracker>
```

#### Interview Answer (English)
```
"Render props is a pattern where a component receives a function as a prop
that returns React elements. This allows sharing behavior while letting
the consumer control the rendering.

However, with the introduction of hooks, most render prop use cases can be
replaced with custom hooks, which are generally cleaner. I'd use render props
when I need to share behavior that requires access to the component's lifecycle
or when working with class components.

For example, React Query's QueryErrorResetBoundary uses render props to give
you access to reset functionality while letting you control the error UI."
```

---

### 1.3 Higher-Order Components (HOC)

#### Concept (Vietnamese)
HOC là function nhận component và return component mới với added functionality.

```jsx
// HOC for adding loading state
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

// Usage
const UserListWithLoading = withLoading(UserList);
<UserListWithLoading isLoading={loading} users={users} />

// HOC for authentication
function withAuth(WrappedComponent) {
  return function WithAuthComponent(props) {
    const { user } = useAuth();

    if (!user) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} user={user} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
```

#### Interview Answer (English)
```
"Higher-Order Components are functions that take a component and return a
new enhanced component. They're useful for cross-cutting concerns like
authentication, logging, or data fetching.

The pattern follows the principle of composition over inheritance. Common
examples include React Router's withRouter (legacy) and Redux's connect.

However, HOCs have some drawbacks:
- Wrapper hell with multiple HOCs
- Props collision
- Harder to trace where props come from

In modern React, I prefer custom hooks for most cases because they're more
explicit and don't add wrapper components. But HOCs are still useful for
certain patterns like authentication wrappers or error boundaries."
```

---

### 1.4 Compound Components

#### Concept (Vietnamese)
Compound components là pattern cho phép components work together để share state implicitly.

```jsx
const SelectContext = createContext();

function Select({ children, value, onChange }) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
}

Select.Option = function SelectOption({ value: optionValue, children }) {
  const { value, onChange } = useContext(SelectContext);
  const isSelected = value === optionValue;

  return (
    <div
      className={`option ${isSelected ? 'selected' : ''}`}
      onClick={() => onChange(optionValue)}
    >
      {children}
    </div>
  );
};

Select.Label = function SelectLabel({ children }) {
  return <label className="select-label">{children}</label>;
};

// Usage - Clean, declarative API
function App() {
  const [color, setColor] = useState('red');

  return (
    <Select value={color} onChange={setColor}>
      <Select.Label>Choose a color:</Select.Label>
      <Select.Option value="red">Red</Select.Option>
      <Select.Option value="green">Green</Select.Option>
      <Select.Option value="blue">Blue</Select.Option>
    </Select>
  );
}
```

#### Interview Answer (English)
```
"Compound components provide a flexible API for components that work together.
The parent component manages the state, and child components access it through
Context, allowing them to communicate implicitly.

This pattern is great for building reusable component libraries. Examples
include Radix UI, Headless UI, and Chakra UI.

Benefits:
1. Clean, declarative API for consumers
2. Flexible - users can arrange children as needed
3. Implicit state sharing without prop drilling

I've used this pattern for building tabs, accordions, and dropdown menus
where the container and items need to work together."
```

---

### 1.5 Controlled vs Uncontrolled Components

```jsx
// Controlled - React controls the value
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// Uncontrolled - DOM controls the value
function UncontrolledInput() {
  const inputRef = useRef();

  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };

  return (
    <>
      <input ref={inputRef} defaultValue="initial" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

#### Interview Answer (English)
```
"In controlled components, React state is the single source of truth - the
component controls the input's value through state and onChange handlers.
This gives you full control over the form data and enables features like
validation, conditional disabling, and enforcing input formats.

Uncontrolled components let the DOM handle the form data. You access values
through refs when needed, like on form submission. They're simpler for
basic forms and integrating with non-React code.

I prefer controlled components for most cases because they make the data
flow explicit and easier to debug. However, uncontrolled components with
refs are useful for file inputs or when integrating with third-party
libraries that manage their own state."
```

---

## Session 2: Performance Optimization (1h)

### 2.1 React.memo

```jsx
// Memoize component - only re-renders if props change
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  console.log('Rendering ExpensiveComponent');
  return <div>{/* expensive render */}</div>;
});

// With custom comparison
const MemoizedComponent = React.memo(
  function MyComponent({ user, onClick }) {
    return <div onClick={onClick}>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    // Return false to re-render
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 2.2 Code Splitting & Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

// Lazy load component
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Named export lazy loading
const MyComponent = lazy(() =>
  import('./MyModule').then(module => ({ default: module.MyComponent }))
);
```

### 2.3 Virtualization

```jsx
// Using react-window for large lists
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 2.4 Avoiding Common Performance Pitfalls

```jsx
// BAD: Creating new object on every render
function Parent() {
  return <Child style={{ color: 'red' }} />; // New object each render
}

// GOOD: Stable reference
const style = { color: 'red' };
function Parent() {
  return <Child style={style} />;
}

// Or with useMemo
function Parent() {
  const style = useMemo(() => ({ color: 'red' }), []);
  return <Child style={style} />;
}

// BAD: Inline function in render
function Parent() {
  return <Child onClick={() => doSomething()} />; // New function each render
}

// GOOD: useCallback
function Parent() {
  const handleClick = useCallback(() => doSomething(), []);
  return <Child onClick={handleClick} />;
}
```

#### Interview Answer (English)
```
"React performance optimization focuses on minimizing unnecessary re-renders
and reducing JavaScript bundle size.

Key strategies I use:

1. React.memo for expensive pure components
2. useMemo and useCallback to maintain stable references
3. Code splitting with React.lazy for route-based splitting
4. Virtualization for long lists using react-window or react-virtualized
5. Avoiding inline objects and functions in render

However, I always measure before optimizing. React DevTools Profiler helps
identify actual bottlenecks. Premature optimization can make code harder
to maintain without meaningful performance gains.

In my trading platform project, we used Web Workers to process 30K+ OHLC
records off the main thread, and virtualization for the order book which
updates in real-time."
```

---

## Session 3: Algorithm Patterns (1.5h)

### Pattern 1: Two Pointers

#### Concept (Vietnamese)
Dùng 2 pointers di chuyển trong array để tìm cặp/triplet thỏa điều kiện. Thường dùng với sorted array.

#### Example: Two Sum II (Sorted Array)
```javascript
/**
 * Find two numbers that add up to target
 * Array is already sorted
 * Time: O(n), Space: O(1)
 */
function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      return [left + 1, right + 1]; // 1-indexed
    } else if (sum < target) {
      left++; // Need larger sum
    } else {
      right--; // Need smaller sum
    }
  }

  return [-1, -1]; // Not found
}

// Example: numbers = [2, 7, 11, 15], target = 9
// Output: [1, 2] (indices of 2 and 7)
```

#### Example: Valid Palindrome
```javascript
/**
 * Check if string is palindrome (ignore non-alphanumeric)
 * Time: O(n), Space: O(1)
 */
function isPalindrome(s) {
  const isAlphanumeric = (c) => /[a-z0-9]/i.test(c);

  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    // Skip non-alphanumeric
    while (left < right && !isAlphanumeric(s[left])) left++;
    while (left < right && !isAlphanumeric(s[right])) right--;

    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }

    left++;
    right--;
  }

  return true;
}

// Example: "A man, a plan, a canal: Panama" => true
```

#### Example: 3Sum
```javascript
/**
 * Find all unique triplets that sum to zero
 * Time: O(n²), Space: O(1) excluding output
 */
function threeSum(nums) {
  const result = [];
  nums.sort((a, b) => a - b); // Sort first

  for (let i = 0; i < nums.length - 2; i++) {
    // Skip duplicates for first element
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);

        // Skip duplicates
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;

        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

// Example: [-1, 0, 1, 2, -1, -4]
// Output: [[-1, -1, 2], [-1, 0, 1]]
```

---

### Pattern 2: Sliding Window

#### Concept (Vietnamese)
Dùng window (subarray) di chuyển qua array để tìm optimal subarray. Window có thể fixed size hoặc variable.

#### Example: Maximum Sum Subarray (Fixed Window)
```javascript
/**
 * Find max sum of subarray with size k
 * Time: O(n), Space: O(1)
 */
function maxSumSubarray(arr, k) {
  if (arr.length < k) return null;

  // Calculate first window sum
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }

  let maxSum = windowSum;

  // Slide the window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i]; // Remove left, add right
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// Example: arr = [2, 1, 5, 1, 3, 2], k = 3
// Output: 9 (subarray [5, 1, 3])
```

#### Example: Longest Substring Without Repeating Characters
```javascript
/**
 * Find length of longest substring without repeating characters
 * Time: O(n), Space: O(min(n, alphabet size))
 */
function lengthOfLongestSubstring(s) {
  const charIndex = new Map(); // Track last index of each character
  let maxLength = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // If char exists in current window, shrink from left
    if (charIndex.has(char) && charIndex.get(char) >= left) {
      left = charIndex.get(char) + 1;
    }

    charIndex.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}

// Example: "abcabcbb" => 3 ("abc")
// Example: "bbbbb" => 1 ("b")
```

#### Example: Minimum Window Substring
```javascript
/**
 * Find minimum window in s that contains all characters of t
 * Time: O(n + m), Space: O(m)
 */
function minWindow(s, t) {
  if (t.length > s.length) return '';

  // Count required characters
  const required = new Map();
  for (const char of t) {
    required.set(char, (required.get(char) || 0) + 1);
  }

  let left = 0;
  let minLen = Infinity;
  let minStart = 0;
  let formed = 0; // Number of unique chars with required frequency
  const windowCounts = new Map();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    windowCounts.set(char, (windowCounts.get(char) || 0) + 1);

    // Check if current char satisfies requirement
    if (required.has(char) &&
        windowCounts.get(char) === required.get(char)) {
      formed++;
    }

    // Try to shrink window
    while (formed === required.size) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }

      const leftChar = s[left];
      windowCounts.set(leftChar, windowCounts.get(leftChar) - 1);

      if (required.has(leftChar) &&
          windowCounts.get(leftChar) < required.get(leftChar)) {
        formed--;
      }

      left++;
    }
  }

  return minLen === Infinity ? '' : s.substring(minStart, minStart + minLen);
}

// Example: s = "ADOBECODEBANC", t = "ABC"
// Output: "BANC"
```

---

### Pattern 3: Hash Map / Frequency Counter

#### Example: Two Sum (Classic)
```javascript
/**
 * Find indices of two numbers that add up to target
 * Time: O(n), Space: O(n)
 */
function twoSum(nums, target) {
  const map = new Map(); // value -> index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return [];
}

// Example: nums = [2, 7, 11, 15], target = 9
// Output: [0, 1]
```

#### Example: Group Anagrams
```javascript
/**
 * Group strings that are anagrams of each other
 * Time: O(n * k log k) where k is max string length
 * Space: O(n * k)
 */
function groupAnagrams(strs) {
  const map = new Map();

  for (const str of strs) {
    // Sort string to create key
    const key = str.split('').sort().join('');

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(str);
  }

  return Array.from(map.values());
}

// Example: ["eat", "tea", "tan", "ate", "nat", "bat"]
// Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]

// Optimization: Use character frequency as key
function groupAnagramsOptimized(strs) {
  const map = new Map();

  for (const str of strs) {
    const count = new Array(26).fill(0);
    for (const char of str) {
      count[char.charCodeAt(0) - 97]++;
    }
    const key = count.join('#');

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(str);
  }

  return Array.from(map.values());
}
```

#### Example: Top K Frequent Elements
```javascript
/**
 * Find k most frequent elements
 * Time: O(n), Space: O(n) using bucket sort
 */
function topKFrequent(nums, k) {
  // Count frequency
  const freq = new Map();
  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }

  // Bucket sort - index is frequency, value is array of numbers
  const buckets = new Array(nums.length + 1).fill(null).map(() => []);
  for (const [num, count] of freq) {
    buckets[count].push(num);
  }

  // Collect top k from highest frequency
  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    result.push(...buckets[i]);
  }

  return result.slice(0, k);
}

// Example: nums = [1,1,1,2,2,3], k = 2
// Output: [1, 2]
```

---

### Pattern 4: Binary Search

#### Template
```javascript
/**
 * Binary Search Template
 */
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1; // Not found
}
```

#### Example: Search in Rotated Sorted Array
```javascript
/**
 * Search in rotated sorted array
 * Time: O(log n), Space: O(1)
 */
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;

    // Check which half is sorted
    if (nums[left] <= nums[mid]) {
      // Left half is sorted
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // Right half is sorted
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}

// Example: nums = [4,5,6,7,0,1,2], target = 0
// Output: 4
```

#### Example: Find First and Last Position
```javascript
/**
 * Find first and last position of target in sorted array
 * Time: O(log n), Space: O(1)
 */
function searchRange(nums, target) {
  const findBound = (isFirst) => {
    let left = 0;
    let right = nums.length - 1;
    let result = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (nums[mid] === target) {
        result = mid;
        // Keep searching in the appropriate direction
        if (isFirst) {
          right = mid - 1; // Search left for first occurrence
        } else {
          left = mid + 1; // Search right for last occurrence
        }
      } else if (nums[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  };

  return [findBound(true), findBound(false)];
}

// Example: nums = [5,7,7,8,8,10], target = 8
// Output: [3, 4]
```

---

### Pattern 5: BFS/DFS (Tree & Graph)

#### DFS Template (Tree)
```javascript
// Recursive DFS
function dfs(node) {
  if (!node) return;

  // Preorder: process node first
  console.log(node.val);

  dfs(node.left);
  // Inorder: process between children (for BST - sorted order)
  dfs(node.right);
  // Postorder: process after children
}

// Iterative DFS with stack
function dfsIterative(root) {
  if (!root) return [];

  const result = [];
  const stack = [root];

  while (stack.length) {
    const node = stack.pop();
    result.push(node.val);

    // Push right first so left is processed first
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }

  return result;
}
```

#### BFS Template (Tree - Level Order)
```javascript
function bfs(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length) {
    const levelSize = queue.length;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
  }

  return result;
}

// Example output: [[3], [9, 20], [15, 7]]
```

#### Example: Maximum Depth of Binary Tree
```javascript
// DFS Recursive
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// BFS
function maxDepthBFS(root) {
  if (!root) return 0;

  let depth = 0;
  const queue = [root];

  while (queue.length) {
    depth++;
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  return depth;
}
```

#### Example: Validate Binary Search Tree
```javascript
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;

  if (root.val <= min || root.val >= max) {
    return false;
  }

  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}
```

---

## Session 4: Practice + English (1h)

### Coding Practice (40 min)

**Solve these problems on paper or LeetCode:**

1. **Easy**: Valid Parentheses
2. **Medium**: Container With Most Water
3. **Medium**: Merge Intervals

### English Practice (20 min)

**Record yourself explaining:**

1. "Walk me through how you would solve Two Sum"
2. "Explain the sliding window pattern"
3. "When would you use BFS vs DFS?"

---

## Day 2 Checklist

```
□ Understand Custom Hooks pattern
□ Can implement: useDebounce, useLocalStorage, useOnClickOutside
□ Know when to use React.memo, useMemo, useCallback
□ Understand code splitting with React.lazy
□ Master algorithm patterns:
  □ Two Pointers (3Sum, Valid Palindrome)
  □ Sliding Window (Longest Substring)
  □ Hash Map (Two Sum, Group Anagrams)
  □ Binary Search (Rotated Array)
  □ BFS/DFS (Tree traversal)
□ Can explain patterns in English
```

---

## Algorithm Cheat Sheet

| Pattern | When to Use | Time Complexity |
|---------|-------------|-----------------|
| Two Pointers | Sorted array, find pairs | O(n) |
| Sliding Window | Subarray/substring problems | O(n) |
| Hash Map | Counting, lookup | O(n) |
| Binary Search | Sorted array, search | O(log n) |
| BFS | Level-order, shortest path | O(V + E) |
| DFS | All paths, tree traversal | O(V + E) |

---

# BONUS: TypeScript Essentials (Hay hỏi!)

> Các câu hỏi TypeScript thường gặp cho Senior Frontend

---

## TS.1 Type vs Interface

### 🇻🇳 Hiểu đơn giản

| | `type` | `interface` |
|--|--------|-------------|
| **Extend** | `&` (intersection) | `extends` |
| **Merge** | ❌ Không | ✅ Declaration merging |
| **Union** | ✅ Có thể | ❌ Không |
| **Primitives** | ✅ Có thể | ❌ Không |

```ts
// Interface - dùng cho object shapes
interface User {
  id: number;
  name: string;
}

// Extend interface
interface Admin extends User {
  role: 'admin';
}

// Declaration merging - thêm field vào interface đã có
interface User {
  email: string;  // Tự động merge vào User ở trên
}

// Type - flexible hơn
type ID = string | number;  // Union - interface không làm được

type Point = {
  x: number;
  y: number;
};

// Extend type với intersection
type Point3D = Point & { z: number };
```

**Quy tắc của tôi:**
- `interface` cho object shapes, API contracts
- `type` cho unions, complex types, utilities

### 🇬🇧 Trả lời phỏng vấn

> **Q: What's the difference between type and interface?**

```
"Both can define object shapes, but they have different capabilities:

Interface supports declaration merging - if you declare the same
interface twice, TypeScript merges them. This is useful for extending
third-party types. Interface also has clearer extends syntax.

Type is more flexible - it can represent unions, intersections,
primitives, and tuples. Type aliases can't be merged.

My convention: use interface for object shapes and API contracts
because of clearer syntax. Use type for unions, complex types,
and utility types."
```

---

## TS.2 Generics

### 🇻🇳 Hiểu đơn giản

**Generics** = "Type parameters" - tạo code linh hoạt mà vẫn type-safe

```ts
// Không có generics - phải viết nhiều functions
function getFirstNumber(arr: number[]): number { return arr[0]; }
function getFirstString(arr: string[]): string { return arr[0]; }

// Với generics - 1 function cho tất cả types
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

getFirst<number>([1, 2, 3]);     // number
getFirst(['a', 'b', 'c']);       // string (TypeScript tự infer)
```

**Ví dụ thực tế:**

```ts
// Generic với constraint
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// Generic cho API response
interface ApiResponse<T> {
  data: T;
  error: string | null;
  loading: boolean;
}

type UserResponse = ApiResponse<User>;
type PostsResponse = ApiResponse<Post[]>;

// Generic React component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: Explain generics in TypeScript**

```
"Generics allow writing reusable code that works with multiple types
while maintaining type safety.

Instead of writing separate functions for each type or using 'any',
generics use type parameters. The actual type is determined when
the function is called.

For example, a generic function getFirst<T>(arr: T[]): T works with
any array type. TypeScript infers the type from usage or you can
specify it explicitly.

Constraints limit what types are allowed. 'T extends HasId' means T
must have an id property.

In React, generics are useful for reusable components like List<T>
or hooks like useState<T>. They provide type inference for props
while keeping the component flexible."
```

---

## TS.3 Utility Types

### 🇻🇳 Các utility types hay dùng

```ts
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Partial<T> - tất cả fields optional
type UpdateUserDTO = Partial<User>;
// { id?: number; name?: string; email?: string; role?: 'admin' | 'user'; }

// Required<T> - tất cả fields required
type RequiredUser = Required<Partial<User>>;

// Pick<T, K> - chọn một số fields
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }

// Omit<T, K> - bỏ một số fields
type UserWithoutRole = Omit<User, 'role'>;
// { id: number; name: string; email: string; }

// Record<K, T> - tạo object type với keys K và values T
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;
// { [key: string]: 'admin' | 'user' | 'guest'; }

// Readonly<T> - tất cả fields readonly
type ImmutableUser = Readonly<User>;

// ReturnType<T> - lấy return type của function
function createUser() { return { id: 1, name: 'John' }; }
type CreatedUser = ReturnType<typeof createUser>;
// { id: number; name: string; }

// Parameters<T> - lấy parameter types của function
type CreateUserParams = Parameters<typeof createUser>;
// []
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: What utility types do you use most often?**

```
"The utility types I use most frequently:

Partial<T>: For update operations where any field can be updated.
Like UpdateUserDTO = Partial<User>.

Pick<T, K> and Omit<T, K>: To create subsets of types. Omit is
great for removing internal fields from API responses.

Record<K, V>: For dictionaries and lookup objects. Like
Record<string, User> for a user cache by ID.

ReturnType<T>: To extract the return type of functions, useful
when you don't control the function definition.

Required<T>: The opposite of Partial, ensures all fields are present.

These utilities help avoid duplicating type definitions and keep
types in sync as the codebase evolves."
```

---

## TS.4 Type Guards

### 🇻🇳 Hiểu đơn giản

**Type Guard** = Cách để TypeScript hiểu type cụ thể trong runtime

```ts
// 1. typeof - cho primitive types
function padLeft(value: string | number) {
  if (typeof value === 'number') {
    return value.toFixed(2);  // TS biết value là number
  }
  return value.padStart(4);   // TS biết value là string
}

// 2. instanceof - cho class instances
class Dog { bark() {} }
class Cat { meow() {} }

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();  // TS biết là Dog
  } else {
    animal.meow();  // TS biết là Cat
  }
}

// 3. 'in' operator - check property exists
interface Fish { swim(): void; }
interface Bird { fly(): void; }

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim();  // TS biết là Fish
  } else {
    animal.fly();   // TS biết là Bird
  }
}

// 4. Custom type guard function
interface Admin { role: 'admin'; permissions: string[]; }
interface User { role: 'user'; }

// is keyword - custom type predicate
function isAdmin(user: Admin | User): user is Admin {
  return user.role === 'admin';
}

function getPermissions(user: Admin | User) {
  if (isAdmin(user)) {
    return user.permissions;  // TS biết user là Admin
  }
  return [];
}
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: What are type guards and when do you use them?**

```
"Type guards narrow down the type of a variable at runtime.

Built-in guards:
- typeof: for primitives (string, number, boolean)
- instanceof: for class instances
- 'in' operator: checks if property exists

Custom type guards use the 'is' keyword: function isAdmin(user): user is Admin.
This tells TypeScript that if the function returns true, the variable
is definitely that type.

I use custom type guards for:
- API responses where the shape varies based on status
- Discriminated unions where I need to check a specific variant
- Filtering arrays while maintaining type info

Type guards are essential for working safely with union types
without resorting to type assertions."
```

---

## TS.5 Discriminated Unions

### 🇻🇳 Hiểu đơn giản

**Discriminated Union** = Union type với 1 property chung để phân biệt

```ts
// Mỗi type có 'status' khác nhau - đây là discriminant
interface Loading {
  status: 'loading';
}

interface Success {
  status: 'success';
  data: User[];
}

interface Error {
  status: 'error';
  error: string;
}

type ApiState = Loading | Success | Error;

// TypeScript tự động narrow type dựa vào discriminant
function renderState(state: ApiState) {
  switch (state.status) {
    case 'loading':
      return <Spinner />;

    case 'success':
      // TS biết state.data tồn tại
      return <UserList users={state.data} />;

    case 'error':
      // TS biết state.error tồn tại
      return <ErrorMessage message={state.error} />;
  }
}

// Ví dụ khác: Actions trong reducer
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET'; payload: number };

function reducer(state: number, action: Action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    case 'SET':
      return action.payload;  // TS biết payload tồn tại
  }
}
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: What are discriminated unions?**

```
"Discriminated unions are a pattern where each member of a union
has a common property - the discriminant - with a unique literal value.

TypeScript uses this discriminant to narrow the type automatically.
When you check the discriminant in a switch or if statement,
TypeScript knows exactly which variant you're working with.

Common use cases:
- API response states: loading, success, error
- Redux-style actions with type field
- State machines

The pattern makes code more type-safe because TypeScript ensures
you handle all cases. If you add a new variant to the union,
TypeScript will error where you need to handle it.

I use this extensively for state management and API responses."
```

---

## TS.6 React với TypeScript

### 🇻🇳 Patterns hay dùng

```tsx
// 1. Component Props
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';  // Optional
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ variant, size = 'md', children, onClick }: ButtonProps) {
  return <button className={`btn-${variant} btn-${size}`} onClick={onClick}>{children}</button>;
}

// 2. Props với children
interface ContainerProps {
  children: React.ReactNode;  // Anything React can render
}

// Hoặc cụ thể hơn
interface CardProps {
  children: React.ReactElement;  // Chỉ 1 React element
}

// 3. Event handlers
interface InputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// 4. forwardRef
interface InputProps {
  label: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
    </div>
  )
);

// 5. Generic component
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
}

function Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {
  return (
    <select
      value={getValue(value)}
      onChange={(e) => {
        const selected = options.find(opt => getValue(opt) === e.target.value);
        if (selected) onChange(selected);
      }}
    >
      {options.map(opt => (
        <option key={getValue(opt)} value={getValue(opt)}>
          {getLabel(opt)}
        </option>
      ))}
    </select>
  );
}
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: How do you type React components?**

```
"For component props, I define an interface with all props and their types.
Optional props use the ? modifier. Children is typed as React.ReactNode
for flexibility.

For event handlers, React provides specific types like ChangeEvent,
MouseEvent, FormEvent - each generic over the element type.

For forwardRef, the generic order is forwardRef<RefType, PropsType>.
The ref type is the DOM element being referenced.

For generic components like Select<T>, the type parameter lets the
component work with any data type while maintaining type safety for
the value, onChange, and accessor functions.

I avoid using 'any' and prefer 'unknown' when the type is truly
unknown, then narrow it with type guards."
```

---

## Day 2 TypeScript Checklist

```
□ Phân biệt type vs interface
□ Hiểu và sử dụng Generics
□ Biết các Utility Types: Partial, Pick, Omit, Record
□ Viết được Custom Type Guards
□ Hiểu Discriminated Unions
□ Type React components đúng cách
```

---

**End of Day 2 - Great progress! Day 3-4 will focus on System Design.**
