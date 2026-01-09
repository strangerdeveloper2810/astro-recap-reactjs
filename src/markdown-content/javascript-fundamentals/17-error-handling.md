# Error Handling

## 1. Error Types

### Built-in Error Types

```javascript
// Error - base class
throw new Error("Something went wrong");

// TypeError - wrong type
const obj = null;
obj.property; // TypeError: Cannot read property 'property' of null

// ReferenceError - variable doesn't exist
console.log(undefinedVar); // ReferenceError: undefinedVar is not defined

// SyntaxError - syntax error
// eval("const x = ;"); // SyntaxError

// RangeError - value out of range
const arr = new Array(-1); // RangeError: Invalid array length

// URIError - URI handling error
decodeURIComponent("%"); // URIError: URI malformed

// Custom Error
class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "CustomError";
    this.code = code;
  }
}

throw new CustomError("Custom error", "ERR001");
```

### Creating Custom Errors

```javascript
// Custom error class
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "NetworkError";
    this.statusCode = statusCode;
  }
}

// Usage
function validateUser(user) {
  if (!user.email) {
    throw new ValidationError("Email is required", "email");
  }
  if (!user.email.includes("@")) {
    throw new ValidationError("Invalid email format", "email");
  }
}

try {
  validateUser({ name: "John" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed for ${error.field}: ${error.message}`);
  }
}
```

## 2. Try/Catch/Finally

### Basic Syntax

```javascript
try {
  // Code that might throw error
  riskyOperation();
} catch (error) {
  // Handle error
  console.error("Error:", error.message);
} finally {
  // Always executed
  cleanup();
}

// Multiple catch blocks (không support trong JS, dùng if/else)
try {
  riskyOperation();
} catch (error) {
  if (error instanceof TypeError) {
    // Handle TypeError
  } else if (error instanceof ReferenceError) {
    // Handle ReferenceError
  } else {
    // Handle other errors
  }
}
```

### Error Propagation

```javascript
// Errors propagate up call stack
function level1() {
  level2();
}

function level2() {
  level3();
}

function level3() {
  throw new Error("Error from level3");
}

try {
  level1();
} catch (error) {
  console.error("Caught:", error.message); // "Error from level3"
}

// Re-throwing
function processData(data) {
  try {
    return transform(data);
  } catch (error) {
    console.error("Transform failed:", error);
    throw error; // Re-throw để caller handle
  }
}
```

### Finally Block

```javascript
// Finally luôn được execute
function example() {
  try {
    console.log("Try");
    throw new Error("Error");
    return "success"; // Không execute
  } catch (error) {
    console.log("Catch");
    throw error; // Re-throw
  } finally {
    console.log("Finally"); // Luôn execute, kể cả khi re-throw
  }
}

// Finally với return
function example2() {
  try {
    return "try";
  } finally {
    return "finally"; // Override return từ try
  }
}
console.log(example2()); // "finally"
```

## 3. Error Handling Patterns

### Error-First Callbacks

```javascript
// Node.js style: error-first callbacks
function asyncOperation(callback) {
  setTimeout(() => {
    const error = Math.random() > 0.5 ? null : new Error("Failed");
    const data = error ? null : { result: "success" };
    callback(error, data);
  }, 100);
}

asyncOperation((error, data) => {
  if (error) {
    console.error("Error:", error.message);
    return;
  }
  console.log("Data:", data);
});
```

### Promise Error Handling

```javascript
// Promise rejection
function fetchData() {
  return new Promise((resolve, reject) => {
    if (Math.random() > 0.5) {
      resolve({ data: "success" });
    } else {
      reject(new Error("Fetch failed"));
    }
  });
}

// catch() method
fetchData()
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error.message));

// Multiple catch handlers
fetchData()
  .then(data => processData(data))
  .catch(networkError => {
    console.error("Network error:", networkError);
    return fallbackData();
  })
  .then(data => saveData(data))
  .catch(saveError => {
    console.error("Save error:", saveError);
  });
```

### Async/Await Error Handling

```javascript
// Try/catch với async/await
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error; // Re-throw nếu cần
  }
}

// Multiple async operations
async function processUsers() {
  try {
    const users = await fetchUsers();
    const processed = await Promise.all(
      users.map(user => processUser(user))
    );
    return processed;
  } catch (error) {
    if (error instanceof NetworkError) {
      // Handle network error
    } else if (error instanceof ValidationError) {
      // Handle validation error
    } else {
      // Handle other errors
    }
    throw error;
  }
}
```

## 4. Error Handling Best Practices

### Specific Error Types

```javascript
// ✅ Throw specific errors
function divide(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Arguments must be numbers");
  }
  if (b === 0) {
    throw new RangeError("Cannot divide by zero");
  }
  return a / b;
}

// ✅ Catch specific errors
try {
  divide(10, 0);
} catch (error) {
  if (error instanceof TypeError) {
    console.error("Type error:", error.message);
  } else if (error instanceof RangeError) {
    console.error("Range error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

### Error Logging

```javascript
// Centralized error logging
class ErrorLogger {
  static log(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      context
    };
    
    // Log to service (Sentry, LogRocket, etc.)
    console.error("Error logged:", errorInfo);
    
    // Or send to server
    // fetch("/api/errors", { method: "POST", body: JSON.stringify(errorInfo) });
  }
}

try {
  riskyOperation();
} catch (error) {
  ErrorLogger.log(error, { userId: 123, action: "processPayment" });
  throw error;
}
```

### Error Boundaries (React)

```javascript
// React Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error
    console.error("Error caught by boundary:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong: {this.state.error.message}</div>;
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## 5. Common Patterns

### Retry Logic

```javascript
// Retry với exponential backoff
async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}

// Usage
const fetchWithRetry = () => retry(() => fetch("/api/data"));
```

### Timeout Pattern

```javascript
// Timeout wrapper
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    )
  ]);
}

// Usage
try {
  const data = await withTimeout(fetchData(), 5000);
} catch (error) {
  if (error.message === "Timeout") {
    console.error("Request timed out");
  } else {
    console.error("Other error:", error);
  }
}
```

### Error Recovery

```javascript
// Fallback values
async function fetchUserWithFallback(id) {
  try {
    return await fetchUser(id);
  } catch (error) {
    console.warn("Failed to fetch user, using fallback");
    return { id, name: "Unknown User" };
  }
}

// Multiple sources
async function fetchData() {
  const sources = [
    () => fetchFromPrimary(),
    () => fetchFromSecondary(),
    () => fetchFromCache()
  ];
  
  for (const source of sources) {
    try {
      return await source();
    } catch (error) {
      console.warn("Source failed, trying next");
      continue;
    }
  }
  
  throw new Error("All sources failed");
}
```

## 6. Common Pitfalls

```javascript
// ❌ Swallowing errors
try {
  riskyOperation();
} catch (error) {
  // Silent failure - bad!
}

// ✅ Log và handle
try {
  riskyOperation();
} catch (error) {
  console.error("Operation failed:", error);
  // Handle appropriately
}

// ❌ Catching và không re-throw khi cần
function processData(data) {
  try {
    return transform(data);
  } catch (error) {
    console.error(error);
    // Missing: throw error để caller biết
  }
}

// ✅ Re-throw khi cần
function processData(data) {
  try {
    return transform(data);
  } catch (error) {
    console.error("Transform failed:", error);
    throw error; // Let caller handle
  }
}

// ❌ Generic error messages
throw new Error("Error"); // Not helpful

// ✅ Specific error messages
throw new ValidationError("Email is required", "email");
```

## 7. Interview Questions

1. **Error types trong JavaScript?**
   - Error, TypeError, ReferenceError, SyntaxError, RangeError, URIError
   - Có thể tạo custom errors bằng cách extend Error

2. **Try/catch/finally hoạt động như thế nào?**
   - try: code có thể throw error
   - catch: handle error
   - finally: luôn execute, kể cả khi return hoặc throw

3. **Error propagation?**
   - Errors propagate up call stack
   - Có thể re-throw để caller handle
   - Async errors propagate qua Promise chain

4. **Promise error handling?**
   - .catch() method
   - Rejections propagate đến catch handler gần nhất
   - Unhandled rejections có thể cause issues

5. **Async/await error handling?**
   - Dùng try/catch
   - Errors từ await được catch trong try block
   - Có thể re-throw để propagate

6. **Error boundaries trong React?**
   - Class components catch errors trong children
   - getDerivedStateFromError và componentDidCatch
   - Prevent entire app crash

7. **Best practices?**
   - Throw specific error types
   - Log errors với context
   - Don't swallow errors
   - Provide meaningful error messages
   - Handle errors at appropriate level

