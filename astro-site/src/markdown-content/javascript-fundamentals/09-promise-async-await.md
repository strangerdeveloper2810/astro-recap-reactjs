# Promise và Async/Await

## Level 1: Basic - Promise Fundamentals

### 1.1. Promise States

```
┌─────────────────────────────────────────────────────────────┐
│                    Promise States                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PENDING ──────┬────────> FULFILLED (resolved with value)   │
│                │                                             │
│                └────────> REJECTED (rejected with reason)    │
│                                                              │
│  Once settled (fulfilled/rejected), CANNOT change state     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// Creating a Promise
const promise = new Promise((resolve, reject) => {
  // Async operation
  setTimeout(() => {
    const success = true;

    if (success) {
      resolve("Operation successful"); // -> fulfilled
    } else {
      reject(new Error("Operation failed")); // -> rejected
    }
  }, 1000);
});

// Promise states:
// - pending: initial state, operation ongoing
// - fulfilled: operation completed successfully (resolve called)
// - rejected: operation failed (reject called)
```

### 1.2. Consuming Promises with then/catch

```javascript
// .then() - handle fulfilled state
// .catch() - handle rejected state
// .finally() - always runs (cleanup)

promise
  .then((result) => {
    console.log("Success:", result);
    return result.toUpperCase(); // Return value becomes next promise's value
  })
  .then((uppercase) => {
    console.log("Uppercase:", uppercase);
  })
  .catch((error) => {
    console.error("Error:", error);
  })
  .finally(() => {
    console.log("Always executed"); // Cleanup: close connections, etc.
  });

// Chaining promises - fetch example
fetch("/api/users")
  .then((response) => response.json())
  .then((users) => {
    return fetch(`/api/users/${users[0].id}`);
  })
  .then((response) => response.json())
  .then((user) => console.log(user))
  .catch((error) => console.error(error));
```

### 1.3. Creating Resolved/Rejected Promises

```javascript
// Promise.resolve() - create immediately resolved promise
const resolved = Promise.resolve("value");
resolved.then(console.log); // "value"

// Promise.reject() - create immediately rejected promise
const rejected = Promise.reject(new Error("error"));
rejected.catch(console.error); // Error: error

// Wrapping sync value in Promise
function maybeAsync(value) {
  if (typeof value === "object" && typeof value.then === "function") {
    return value; // Already a promise
  }
  return Promise.resolve(value); // Wrap in promise
}
```

### 1.4. Basic Async/Await

```javascript
// async function ALWAYS returns a Promise
async function fetchUser() {
  return { id: 1, name: "John" };
  // Equivalent to: return Promise.resolve({ id: 1, name: 'John' });
}

fetchUser().then((user) => console.log(user)); // { id: 1, name: "John" }

// await pauses execution until promise settles
async function getUserData() {
  const user = await fetchUser(); // Pauses here until resolved
  console.log(user); // { id: 1, name: 'John' }
  return user;
}

// await can only be used inside async functions
// (or at top level in ES modules)
```

### 1.5. Error Handling with try/catch

```javascript
async function fetchWithError() {
  try {
    const response = await fetch("/api/data");
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error:", error);
    throw error; // Re-throw if needed
  }
}

// Without async/await
function fetchWithErrorPromise() {
  return fetch("/api/data")
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}
```

---

## Level 2: Intermediate - Promise Combinators & Patterns

### 2.1. Promise.all()

```javascript
// Wait for ALL promises to fulfill
// Rejects immediately if ANY promise rejects (fail-fast)

const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3]).then((values) => {
  console.log(values); // [1, 2, 3]
});

// Fail-fast behavior
Promise.all([p1, Promise.reject("error"), p3]).catch((error) => {
  console.error(error); // 'error' - immediately rejects
});

// Practical: fetch multiple resources
async function fetchAllData() {
  const [users, posts, comments] = await Promise.all([
    fetch("/api/users").then((r) => r.json()),
    fetch("/api/posts").then((r) => r.json()),
    fetch("/api/comments").then((r) => r.json())
  ]);
  return { users, posts, comments };
}
```

### 2.2. Promise.allSettled()

```javascript
// Wait for ALL promises to settle (no fail-fast)
// Returns array of { status, value/reason } objects

Promise.allSettled([p1, Promise.reject("error"), p3]).then((results) => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});

// Practical: batch operations with partial failure
async function batchProcess(items) {
  const results = await Promise.allSettled(items.map((item) => processItem(item)));

  const succeeded = results.filter((r) => r.status === "fulfilled").map((r) => r.value);

  const failed = results.filter((r) => r.status === "rejected").map((r) => r.reason);

  return { succeeded, failed };
}
```

### 2.3. Promise.race()

```javascript
// First promise to SETTLE wins (fulfilled OR rejected)

Promise.race([
  new Promise((resolve) => setTimeout(() => resolve("fast"), 100)),
  new Promise((resolve) => setTimeout(() => resolve("slow"), 500))
]).then((result) => {
  console.log(result); // 'fast'
});

// Use case: Timeout pattern
function fetchWithTimeout(url, timeout) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
  ]);
}

// Usage
try {
  const response = await fetchWithTimeout("/api/data", 5000);
} catch (error) {
  console.error("Request timed out or failed");
}
```

### 2.4. Promise.any()

```javascript
// First promise to FULFILL wins (ignores rejections)
// Only rejects if ALL promises reject

Promise.any([Promise.reject("error1"), Promise.resolve("success"), Promise.reject("error2")]).then((result) => {
  console.log(result); // 'success'
});

// All rejected - AggregateError
Promise.any([Promise.reject("error1"), Promise.reject("error2")]).catch((error) => {
  console.log(error); // AggregateError: All promises were rejected
  console.log(error.errors); // ['error1', 'error2']
});

// Use case: fastest server
async function fetchFromFastestServer(urls) {
  const fetchPromises = urls.map((url) => fetch(url));
  return Promise.any(fetchPromises);
}
```

### 2.5. Sequential vs Parallel Execution

```javascript
// ❌ Sequential - slow (total time = sum of all)
async function sequential() {
  const user = await fetchUser(); // 1s
  const posts = await fetchPosts(user.id); // 1s (waits for user)
  const comments = await fetchComments(posts[0].id); // 1s (waits for posts)
  return { user, posts, comments }; // Total: 3s
}

// ✅ Parallel (when independent) - fast
async function parallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(), // 1s
    fetchPosts(), // 1s  (runs simultaneously)
    fetchComments() // 1s  (runs simultaneously)
  ]);
  return { user, posts, comments }; // Total: 1s
}

// Mixed: parallel where possible
async function mixed() {
  const [user, allPosts] = await Promise.all([fetchUser(), fetchAllPosts()]);

  // These depend on above, must wait
  const userPosts = await fetchUserPosts(user.id);

  return { user, allPosts, userPosts };
}
```

### 2.6. await in Loops

```javascript
// ❌ WRONG: forEach doesn't wait for async
async function wrongLoop() {
  [1, 2, 3].forEach(async (item) => {
    await processItem(item); // forEach doesn't await!
  });
  console.log("Done"); // Runs BEFORE processing finishes!
}

// ✅ Sequential processing with for...of
async function sequentialLoop() {
  for (const item of [1, 2, 3]) {
    await processItem(item); // Processes one at a time
  }
  console.log("Done"); // Runs after all complete
}

// ✅ Parallel processing with map + Promise.all
async function parallelLoop() {
  const results = await Promise.all([1, 2, 3].map((item) => processItem(item)));
  console.log("Done", results);
}
```

---

## Level 3: Advanced - Patterns & Utilities

### 3.1. Timeout Wrapper

```javascript
function withTimeout(promise, timeoutMs, errorMessage = "Operation timed out") {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Usage
async function fetchData() {
  try {
    const data = await withTimeout(fetch("/api/slow-endpoint"), 5000, "API request timed out");
    return data.json();
  } catch (error) {
    if (error.message === "API request timed out") {
      // Handle timeout specifically
      return getFromCache();
    }
    throw error;
  }
}
```

### 3.2. Retry with Exponential Backoff

```javascript
async function retry(fn, options = {}) {
  const { retries = 3, delay = 1000, backoff = 2, shouldRetry = () => true } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === retries || !shouldRetry(error)) {
        throw error;
      }

      const waitTime = delay * Math.pow(backoff, attempt);
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// Usage
const data = await retry(() => fetch("/api/unstable-endpoint"), {
  retries: 3,
  delay: 1000,
  backoff: 2, // 1s, 2s, 4s
  shouldRetry: (error) => error.status >= 500 // Only retry server errors
});
```

### 3.3. Concurrency Limit

```javascript
async function concurrentLimit(tasks, limit) {
  const results = [];
  const executing = new Set();

  for (const [index, task] of tasks.entries()) {
    const promise = task().then((result) => {
      executing.delete(promise);
      return result;
    });

    results[index] = promise;
    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// Usage: max 3 concurrent requests
const urls = Array.from({ length: 100 }, (_, i) => `/api/item/${i}`);
const tasks = urls.map((url) => () => fetch(url).then((r) => r.json()));

const results = await concurrentLimit(tasks, 3);
```

### 3.4. Async Generators

```javascript
// Async generator function
async function* asyncGenerator() {
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    yield i;
  }
}

// Consume with for-await-of
async function consume() {
  for await (const value of asyncGenerator()) {
    console.log(value); // 0, 1, 2 (with 100ms delay between each)
  }
}

// Pagination example
async function* fetchPages(baseUrl, pageSize = 20) {
  let page = 1;

  while (true) {
    const response = await fetch(`${baseUrl}?page=${page}&limit=${pageSize}`);
    const data = await response.json();

    if (data.items.length === 0) break;

    yield data.items;

    if (!data.hasMore) break;
    page++;
  }
}

// Usage
async function getAllItems() {
  const allItems = [];

  for await (const items of fetchPages("/api/items")) {
    allItems.push(...items);
    console.log(`Loaded ${allItems.length} items...`);
  }

  return allItems;
}
```

### 3.5. AbortController for Cancellation

```javascript
// Cancel fetch requests
async function fetchWithCancel(url) {
  const controller = new AbortController();

  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Request was cancelled");
      return null;
    }
    throw error;
  }
}

// Cancel on component unmount (React)
function useApiData(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") throw e;
      });

    return () => controller.abort(); // Cleanup
  }, [url]);

  return data;
}
```

### 3.6. Promise Queue

```javascript
class PromiseQueue {
  #queue = [];
  #pending = 0;
  #concurrency;

  constructor(concurrency = 1) {
    this.#concurrency = concurrency;
  }

  add(fn) {
    return new Promise((resolve, reject) => {
      this.#queue.push({ fn, resolve, reject });
      this.#process();
    });
  }

  async #process() {
    if (this.#pending >= this.#concurrency || this.#queue.length === 0) {
      return;
    }

    this.#pending++;
    const { fn, resolve, reject } = this.#queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.#pending--;
      this.#process();
    }
  }
}

// Usage
const queue = new PromiseQueue(2); // Max 2 concurrent

const results = await Promise.all([
  queue.add(() => fetch("/api/1")),
  queue.add(() => fetch("/api/2")),
  queue.add(() => fetch("/api/3")), // Waits for slot
  queue.add(() => fetch("/api/4")) // Waits for slot
]);
```

---

## Real-world Applications

### Data Fetching Hook (React)

```javascript
function useAsync(asyncFn, immediate = true) {
  const [state, setState] = useState({
    data: null,
    loading: immediate,
    error: null
  });

  const execute = useCallback(
    async (...args) => {
      setState({ data: null, loading: true, error: null });

      try {
        const data = await asyncFn(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        setState({ data: null, loading: false, error });
        throw error;
      }
    },
    [asyncFn]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error, execute: refetch } = useAsync(() => fetchUser(userId), true);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} onRetry={refetch} />;

  return <Profile user={user} />;
}
```

### API Client with Retry and Cache

```javascript
class ApiClient {
  #cache = new Map();
  #pendingRequests = new Map();

  async get(url, options = {}) {
    const { cache = false, ttl = 60000, retries = 3 } = options;

    // Check cache
    if (cache) {
      const cached = this.#cache.get(url);
      if (cached && Date.now() < cached.expiry) {
        return cached.data;
      }
    }

    // Deduplicate concurrent requests
    if (this.#pendingRequests.has(url)) {
      return this.#pendingRequests.get(url);
    }

    const request = this.#fetchWithRetry(url, retries);
    this.#pendingRequests.set(url, request);

    try {
      const data = await request;

      if (cache) {
        this.#cache.set(url, { data, expiry: Date.now() + ttl });
      }

      return data;
    } finally {
      this.#pendingRequests.delete(url);
    }
  }

  async #fetchWithRetry(url, retries) {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      } catch (error) {
        if (i === retries) throw error;
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  }
}

// Usage
const api = new ApiClient();
const user = await api.get("/api/user/1", { cache: true, ttl: 30000 });
```

### Batch Processing with Progress

```javascript
async function batchProcess(items, processFn, options = {}) {
  const { batchSize = 10, onProgress, onBatchComplete } = options;

  const results = [];
  const total = items.length;
  let processed = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(batch.map((item) => processFn(item)));

    results.push(...batchResults);
    processed += batch.length;

    onProgress?.({ processed, total, percent: (processed / total) * 100 });

    onBatchComplete?.({
      batchNumber: Math.floor(i / batchSize) + 1,
      results: batchResults
    });
  }

  return {
    succeeded: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
    results
  };
}

// Usage
const { succeeded, failed } = await batchProcess(
  items,
  (item) => uploadItem(item),
  {
    batchSize: 10,
    onProgress: ({ percent }) => console.log(`${percent.toFixed(1)}% complete`)
  }
);
```

---

## Interview Questions

### Level 1: Basic

**1. Promise là gì? Có mấy trạng thái?**

```
Promise là object đại diện cho kết quả của async operation.

3 states:
- pending: đang chờ (initial)
- fulfilled: thành công (resolve được gọi)
- rejected: thất bại (reject được gọi)

Một khi settled (fulfilled/rejected), không thể thay đổi state.
```

**2. async/await là gì?**

```
- async: keyword đánh dấu function trả về Promise
- await: keyword pause execution đến khi Promise settle

async function example() {
  const data = await fetch('/api');  // Pauses here
  return data.json();                // Continues when resolved
}

// Equivalent Promise code:
function example() {
  return fetch('/api').then(data => data.json());
}
```

**3. Sự khác biệt giữa .then() và async/await?**

```
.then():
- Chain-based syntax
- Error handling với .catch()
- Có thể phức tạp khi nested

async/await:
- Synchronous-looking code
- Error handling với try/catch
- Dễ đọc, dễ debug
- Chỉ là syntax sugar over Promises
```

### Level 2: Intermediate

**4. Promise.all() vs Promise.allSettled()?**

```javascript
Promise.all([p1, p2, p3]);
// - Fail-fast: reject ngay nếu BẤT KỲ promise reject
// - Use when: tất cả phải thành công

Promise.allSettled([p1, p2, p3]);
// - Chờ TẤT CẢ settle, không fail-fast
// - Trả về array of { status, value/reason }
// - Use when: muốn biết kết quả của từng promise
```

**5. Tại sao không nên dùng forEach với async/await?**

```javascript
// ❌ WRONG - forEach doesn't wait
[1, 2, 3].forEach(async (item) => {
  await processItem(item);
});
console.log("Done"); // Runs immediately, not after processing!

// ✅ Use for...of for sequential
for (const item of [1, 2, 3]) {
  await processItem(item);
}

// ✅ Use Promise.all for parallel
await Promise.all([1, 2, 3].map((item) => processItem(item)));
```

**6. Promise.race() vs Promise.any()?**

```
race(): First to SETTLE (resolve OR reject) wins
any():  First to FULFILL (resolve only) wins

// race() - used for timeout patterns
Promise.race([fetch(url), timeout(5000)]);

// any() - used when any success is acceptable
Promise.any([fetchFromServer1(), fetchFromServer2()]);
```

### Level 3: Advanced

**7. Làm sao implement timeout cho Promise?**

```javascript
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), ms);
  });

  return Promise.race([promise, timeout]);
}

// Usage
await withTimeout(fetch("/api"), 5000);
```

**8. Làm sao limit concurrent requests?**

```javascript
async function concurrentLimit(tasks, limit) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const promise = task().then((r) => {
      executing.delete(promise);
      return r;
    });

    results.push(promise);
    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}
```

**9. Giải thích async generator và for-await-of:**

```javascript
async function* paginate(url) {
  let page = 1;
  while (true) {
    const data = await fetch(`${url}?page=${page}`).then((r) => r.json());
    if (!data.length) break;
    yield data;
    page++;
  }
}

// Consume
for await (const pageData of paginate("/api/items")) {
  processPage(pageData);
}
```

**10. Output của code này là gì?**

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

async function test() {
  console.log("4");
  await Promise.resolve();
  console.log("5");
}

test();

console.log("6");

// Output: 1, 4, 6, 3, 5, 2

// Explanation:
// 1: sync
// 4: sync (inside async function, before await)
// 6: sync
// 3: microtask (Promise.then)
// 5: microtask (continuation after await)
// 2: macrotask (setTimeout)
```
