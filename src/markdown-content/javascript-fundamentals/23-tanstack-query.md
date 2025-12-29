# TanStack Query (React Query) - Complete Guide (Basic to Advanced)

## Table of Contents
- [Level 1: Basic](#level-1-basic)
- [Level 2: Intermediate](#level-2-intermediate)
- [Level 3: Advanced](#level-3-advanced)
- [Real-world Applications](#real-world-applications)
- [Interview Questions](#interview-questions)

---

# Level 1: Basic

## 1.1 Overview

### What is TanStack Query?

```
TanStack Query (formerly React Query):
- Server state management library
- Automatic caching and synchronization
- Background updates and refetching
- Loading, error, and stale states
- Pagination and infinite scroll
- Devtools for debugging
- Framework agnostic (React, Vue, Solid, etc.)
```

### Server State vs Client State

```
┌─────────────────────────────────────────────────────────────┐
│           Server State vs Client State                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CLIENT STATE:                 SERVER STATE:                 │
│  ─────────────                 ──────────────                │
│  - UI state (modals, tabs)     - Data from API               │
│  - Form input values           - Persisted remotely          │
│  - Local preferences           - Async, needs fetching       │
│  - Owned by client             - Shared ownership            │
│  - Always up-to-date           - Can become stale            │
│  - Synchronous                 - Asynchronous                │
│                                                              │
│  TOOLS:                        TOOLS:                        │
│  - useState, useReducer        - TanStack Query              │
│  - Context API                 - SWR                         │
│  - Redux, Zustand, Jotai       - RTK Query                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 1.2 Setup

### Installation & Configuration

```javascript
// npm install @tanstack/react-query

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create client with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 30,        // 30 minutes (was cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1
    }
  }
});

// Provider setup
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## 1.3 Basic Queries

### useQuery Hook

```javascript
import { useQuery } from "@tanstack/react-query";

// Fetch function
async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}

// Component
function UserProfile({ userId }) {
  const {
    data,           // Query result
    isLoading,      // First load, no data
    isFetching,     // Any fetch in progress
    isError,        // Error occurred
    error,          // Error object
    isSuccess,      // Data available
    isStale,        // Data is stale
    refetch         // Manual refetch function
  } = useQuery({
    queryKey: ["user", userId],    // Unique key for caching
    queryFn: () => fetchUser(userId),
    enabled: !!userId              // Only fetch when userId exists
  });

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={() => refetch()}>Refresh</button>
      {isFetching && <span>Updating...</span>}
    </div>
  );
}
```

### Query Keys

```javascript
// Query keys are unique identifiers for caching

// Simple key
useQuery({ queryKey: ["todos"], queryFn: fetchTodos });

// Key with ID
useQuery({ queryKey: ["todo", todoId], queryFn: () => fetchTodo(todoId) });

// Key with filters/options
useQuery({
  queryKey: ["todos", { status: "completed", page: 1 }],
  queryFn: () => fetchTodos({ status: "completed", page: 1 })
});

// Keys hierarchy for invalidation
// ["todos"]                    → All todos queries
// ["todos", "list"]            → Specific list
// ["todos", "detail", 1]       → Specific detail

// Important: Object key order matters!
// ["todos", { page, status }] !== ["todos", { status, page }]
```

## 1.4 Basic Mutations

### useMutation Hook

```javascript
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createTodo(todoData) {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todoData)
  });
  if (!response.ok) throw new Error("Failed to create todo");
  return response.json();
}

function CreateTodoForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: (data) => {
      // Invalidate and refetch todos
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo created!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (formData) => {
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create Todo"}
      </button>
      {mutation.isError && <p>Error: {mutation.error.message}</p>}
    </form>
  );
}
```

---

# Level 2: Intermediate

## 2.1 Query Options

### Common Options

```javascript
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,

  // ===== CACHING =====
  staleTime: 1000 * 60 * 5,    // Data fresh for 5 minutes
  gcTime: 1000 * 60 * 30,      // Cache kept for 30 minutes

  // ===== REFETCHING =====
  refetchOnWindowFocus: true,   // Refetch when window focused
  refetchOnReconnect: true,     // Refetch on network reconnect
  refetchOnMount: true,         // Refetch when component mounts
  refetchInterval: 30000,       // Poll every 30 seconds
  refetchIntervalInBackground: false,

  // ===== RETRY =====
  retry: 3,                     // Retry failed requests 3 times
  retryDelay: 1000,             // Wait 1 second between retries

  // ===== CONDITIONAL =====
  enabled: !!userId,            // Only run when condition is true

  // ===== TRANSFORM =====
  select: (data) => data.users, // Transform/select data

  // ===== CALLBACKS =====
  onSuccess: (data) => console.log("Success:", data),
  onError: (error) => console.error("Error:", error),
  onSettled: (data, error) => console.log("Settled")
});
```

### staleTime vs gcTime

```
┌─────────────────────────────────────────────────────────────┐
│               staleTime vs gcTime (cacheTime)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  staleTime (default: 0):                                    │
│  - How long data is considered "fresh"                      │
│  - Fresh data: no background refetch                        │
│  - Stale data: background refetch on window focus, etc.     │
│                                                              │
│  gcTime (default: 5 minutes):                               │
│  - How long inactive cache is kept                          │
│  - After last subscriber unmounts                           │
│  - After gcTime, cache is garbage collected                 │
│                                                              │
│  Timeline:                                                   │
│  ──────────────────────────────────────────────────────────  │
│  Query    |<----- staleTime ----->|<-- refetch on focus -->| │
│  Cache    |<-------------- gcTime (inactive) ------------->| │
│  GC       |                                       X (removed)│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 2.2 Dependent Queries

```javascript
function UserPosts({ userId }) {
  // First query: fetch user
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId)
  });

  // Second query: depends on first
  const postsQuery = useQuery({
    queryKey: ["posts", userQuery.data?.id],
    queryFn: () => fetchUserPosts(userQuery.data.id),
    enabled: !!userQuery.data?.id  // Only run when user data exists
  });

  if (userQuery.isLoading) return <Spinner />;
  if (userQuery.isError) return <Error message={userQuery.error.message} />;

  return (
    <div>
      <h1>{userQuery.data.name}</h1>
      {postsQuery.isLoading ? (
        <Spinner />
      ) : postsQuery.isError ? (
        <Error message={postsQuery.error.message} />
      ) : (
        <PostList posts={postsQuery.data} />
      )}
    </div>
  );
}
```

## 2.3 Parallel Queries

```javascript
import { useQueries } from "@tanstack/react-query";

// Multiple independent queries
function Dashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ["users"], queryFn: fetchUsers },
      { queryKey: ["posts"], queryFn: fetchPosts },
      { queryKey: ["comments"], queryFn: fetchComments }
    ]
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  if (isLoading) return <Spinner />;
  if (isError) return <Error />;

  const [users, posts, comments] = results.map((r) => r.data);

  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
      <CommentList comments={comments} />
    </div>
  );
}

// Dynamic parallel queries
function UserProfiles({ userIds }) {
  const userQueries = useQueries({
    queries: userIds.map((id) => ({
      queryKey: ["user", id],
      queryFn: () => fetchUser(id)
    }))
  });

  return (
    <div>
      {userQueries.map((query, index) => (
        <UserCard
          key={userIds[index]}
          user={query.data}
          isLoading={query.isLoading}
        />
      ))}
    </div>
  );
}
```

## 2.4 Optimistic Updates

```javascript
function TodoList() {
  const queryClient = useQueryClient();

  const toggleTodo = useMutation({
    mutationFn: async (todo) => {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !todo.completed })
      });
      return response.json();
    },

    // Before mutation: optimistic update
    onMutate: async (toggledTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(["todos"]);

      // Optimistically update
      queryClient.setQueryData(["todos"], (old) =>
        old.map((todo) =>
          todo.id === toggledTodo.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      );

      // Return context for rollback
      return { previousTodos };
    },

    // On error: rollback
    onError: (err, toggledTodo, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
      toast.error("Failed to update todo");
    },

    // Always: refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });

  return (
    <ul>
      {todos.map((todo) => (
        <li
          key={todo.id}
          onClick={() => toggleTodo.mutate(todo)}
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            opacity: toggleTodo.isPending ? 0.5 : 1
          }}
        >
          {todo.title}
        </li>
      ))}
    </ul>
  );
}
```

## 2.5 Cache Management

### Query Invalidation

```javascript
const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ["todos"] });

// Invalidate exact match only
queryClient.invalidateQueries({ queryKey: ["todos"], exact: true });

// Invalidate all queries starting with key
queryClient.invalidateQueries({ queryKey: ["todos"] });
// Matches: ["todos"], ["todos", 1], ["todos", { status: "done" }]

// Invalidate with predicate
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === "todos" && query.state.isStale
});

// Invalidate all queries
queryClient.invalidateQueries();
```

### Manual Cache Updates

```javascript
const queryClient = useQueryClient();

// Get query data
const todos = queryClient.getQueryData(["todos"]);

// Set query data
queryClient.setQueryData(["todos"], (oldData) => [...oldData, newTodo]);

// Set specific item
queryClient.setQueryData(["todo", todoId], updatedTodo);

// Remove query
queryClient.removeQueries({ queryKey: ["todos"] });

// Prefetch query
await queryClient.prefetchQuery({
  queryKey: ["todo", todoId],
  queryFn: () => fetchTodo(todoId)
});

// Cancel queries
await queryClient.cancelQueries({ queryKey: ["todos"] });

// Reset queries to initial state
queryClient.resetQueries({ queryKey: ["todos"] });
```

---

# Level 3: Advanced

## 3.1 Pagination

### Basic Pagination

```javascript
function PaginatedPosts() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["posts", page],
    queryFn: () => fetchPosts(page),
    placeholderData: keepPreviousData  // Keep old data while fetching new
  });

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <PostList posts={data.posts} />

          <div className="pagination">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>

            <span>Page {page}</span>

            <button
              onClick={() => setPage((old) => old + 1)}
              disabled={isPlaceholderData || !data.hasMore}
            >
              Next
            </button>
          </div>

          {isFetching && <span>Loading...</span>}
        </>
      )}
    </div>
  );
}
```

### Infinite Queries

```javascript
import { useInfiniteQuery } from "@tanstack/react-query";

function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),

    getNextPageParam: (lastPage, allPages) => {
      // Return next page number or undefined if no more
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },

    getPreviousPageParam: (firstPage) => {
      return firstPage.prevPage ?? undefined;
    }
  });

  // Flatten all pages
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <Spinner />;
  if (isError) return <Error />;

  return (
    <div>
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <div ref={loadMoreRef}>
        {isFetchingNextPage ? (
          <Spinner />
        ) : hasNextPage ? (
          <button onClick={() => fetchNextPage()}>Load More</button>
        ) : (
          <p>No more posts</p>
        )}
      </div>
    </div>
  );
}
```

## 3.2 Prefetching

```javascript
// Prefetch on hover
function TodoLink({ todoId }) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["todo", todoId],
      queryFn: () => fetchTodo(todoId),
      staleTime: 1000 * 60 * 5  // 5 minutes
    });
  };

  return (
    <Link to={`/todos/${todoId}`} onMouseEnter={prefetch}>
      View Todo
    </Link>
  );
}

// Prefetch in router loader (React Router)
export async function loader({ params }) {
  await queryClient.prefetchQuery({
    queryKey: ["todo", params.todoId],
    queryFn: () => fetchTodo(params.todoId)
  });
  return null;
}

// Prefetch next page
function PaginatedList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Prefetch next page when current page is fetched
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["posts", page + 1],
      queryFn: () => fetchPosts(page + 1)
    });
  }, [page, queryClient]);
}
```

## 3.3 Suspense Mode

```javascript
import { useSuspenseQuery } from "@tanstack/react-query";

// Component using suspense
function TodoList() {
  const { data } = useSuspenseQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos
  });

  // No loading check needed - Suspense handles it
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}

// Parent with Suspense boundary
function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary fallback={<Error />}>
        <TodoList />
      </ErrorBoundary>
    </Suspense>
  );
}
```

## 3.4 Query Key Factories

```javascript
// Organized query keys
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id) => [...todoKeys.details(), id] as const
};

// Usage
useQuery({
  queryKey: todoKeys.list({ status: "completed" }),
  queryFn: () => fetchTodos({ status: "completed" })
});

// Easy invalidation
queryClient.invalidateQueries({ queryKey: todoKeys.lists() }); // All lists
queryClient.invalidateQueries({ queryKey: todoKeys.all });     // Everything
```

---

# Real-world Applications

## Custom Hooks Pattern

```javascript
// hooks/useTodos.js
export function useTodos(filters) {
  return useQuery({
    queryKey: ["todos", filters],
    queryFn: () => fetchTodos(filters),
    staleTime: 1000 * 60 * 5
  });
}

export function useTodo(todoId) {
  return useQuery({
    queryKey: ["todo", todoId],
    queryFn: () => fetchTodo(todoId),
    enabled: !!todoId
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => updateTodo(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["todo", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
}

// Usage in component
function TodoPage({ todoId }) {
  const { data: todo, isLoading } = useTodo(todoId);
  const updateTodo = useUpdateTodo();

  const handleUpdate = (data) => {
    updateTodo.mutate({ id: todoId, ...data });
  };

  if (isLoading) return <Spinner />;
  return <TodoForm todo={todo} onSubmit={handleUpdate} />;
}
```

## Search with Debounce

```javascript
import { useDebounce } from "@/hooks/useDebounce";

function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["users", "search", debouncedSearch],
    queryFn: () => searchUsers(debouncedSearch),
    enabled: debouncedSearch.length > 2,
    staleTime: 1000 * 60  // 1 minute
  });

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />
      {isFetching && <Spinner />}
      {data?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## Authentication with Retry

```javascript
// API client with auth
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Try to refresh token
    const newToken = await refreshToken();
    if (newToken) {
      localStorage.setItem("token", newToken);
      // Retry with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`
        }
      });
    }
    throw new Error("Unauthorized");
  }

  return response;
}

// Query client with auth error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error.message === "Unauthorized") return false;
        return failureCount < 3;
      }
    }
  }
});
```

---

# Interview Questions

## Basic Level

1. **TanStack Query giải quyết vấn đề gì?**
   - Server state management
   - Automatic caching and synchronization
   - Loading/error states handling
   - Request deduplication
   - Background refetching

2. **Query keys là gì?**
   - Unique identifiers for caching
   - Deterministic, serializable
   - Used for caching and invalidation
   - Hierarchy for partial invalidation

3. **staleTime vs gcTime?**
   - staleTime: time data is "fresh" (default 0)
   - gcTime: time inactive cache is kept (default 5 min)
   - Fresh data won't trigger refetch

4. **enabled option?**
   - Controls when query runs
   - For dependent queries
   - Conditional fetching
   - Prevents unnecessary requests

## Intermediate Level

5. **Optimistic updates?**
   - Update cache immediately before server response
   - Better UX, instant feedback
   - Rollback on error via onMutate context
   - onSettled for final refetch

6. **Cache invalidation strategies?**
   - invalidateQueries marks as stale
   - refetch if query is active
   - setQueryData for manual updates
   - Key hierarchy for bulk invalidation

7. **placeholderData vs initialData?**
   - placeholderData: temporary, doesn't persist
   - initialData: counts as "real" data, persists
   - placeholderData better for pagination

8. **Infinite queries?**
   - useInfiniteQuery hook
   - getNextPageParam determines next page
   - data.pages contains all pages
   - fetchNextPage to load more

## Advanced Level

9. **Query deduplication?**
   - Same queryKey = same request
   - Multiple components share cache
   - Only one network request
   - All subscribers updated together

10. **Suspense mode benefits?**
    - Cleaner component code
    - No loading checks
    - Error boundaries for errors
    - Better loading UX

11. **Prefetching strategies?**
    - On hover for links
    - In router loaders
    - Prefetch next page in pagination
    - During idle time

12. **Testing TanStack Query?**
    - Wrap with QueryClientProvider
    - Use fresh QueryClient per test
    - Mock fetch/API calls
    - waitFor for async assertions

## Comparison

13. **TanStack Query vs SWR?**
    - TanStack: More features, better devtools
    - SWR: Simpler, lighter, Vercel ecosystem
    - Both: Caching, revalidation, mutations

14. **TanStack Query vs RTK Query?**
    - TanStack: Framework agnostic, standalone
    - RTK Query: Integrated with Redux
    - Both: Caching, auto-generated hooks

