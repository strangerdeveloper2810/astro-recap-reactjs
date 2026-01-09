# Redux & Redux Toolkit - Complete Guide (Basic to Advanced)

## Table of Contents
- [Level 1: Basic](#level-1-basic)
- [Level 2: Intermediate](#level-2-intermediate)
- [Level 3: Advanced](#level-3-advanced)
- [Real-world Applications](#real-world-applications)
- [Interview Questions](#interview-questions)

---

# Level 1: Basic

## 1.1 Redux Core Concepts

### Three Principles

```
┌─────────────────────────────────────────────────────────────┐
│                    Redux Three Principles                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SINGLE SOURCE OF TRUTH                                  │
│     - Entire app state in ONE store                         │
│     - Predictable, easy to debug                            │
│     - State serializable for persistence                    │
│                                                              │
│  2. STATE IS READ-ONLY                                      │
│     - Only way to change is dispatch action                 │
│     - No direct mutations                                   │
│     - Actions describe "what happened"                      │
│                                                              │
│  3. CHANGES WITH PURE FUNCTIONS                             │
│     - Reducers = pure functions                             │
│     - (prevState, action) => newState                       │
│     - No side effects, same input = same output             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Redux Flow (Without Middleware)

```
┌─────────────────────────────────────────────────────────────┐
│                    Redux Basic Flow                          │
│                                                              │
│  ┌─────────────┐                                            │
│  │    VIEW     │                                            │
│  │   (React)   │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│         │ 1. User interaction triggers dispatch              │
│         │    dispatch(action)                                │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │   ACTION    │  { type: 'INCREMENT', payload: 1 }         │
│  │   (Object)  │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│         │ 2. Action sent to reducer                         │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │   REDUCER   │  (state, action) => newState               │
│  │   (Pure fn) │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│         │ 3. Reducer returns new state                      │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │    STORE    │  Holds the entire state tree               │
│  │   (State)   │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│         │ 4. Store notifies subscribers                     │
│         │    View re-renders with new state                 │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │    VIEW     │  Updated UI                                │
│  └─────────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Basic Implementation

```javascript
// ========== ACTION TYPES ==========
const INCREMENT = "counter/increment";
const DECREMENT = "counter/decrement";
const SET_COUNT = "counter/setCount";
const RESET = "counter/reset";

// ========== ACTION CREATORS ==========
// Functions that return action objects
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });
const setCount = (value) => ({ type: SET_COUNT, payload: value });
const reset = () => ({ type: RESET });

// ========== REDUCER ==========
// Pure function: (state, action) => newState
const initialState = { count: 0 };

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 };
    case DECREMENT:
      return { ...state, count: state.count - 1 };
    case SET_COUNT:
      return { ...state, count: action.payload };
    case RESET:
      return initialState;
    default:
      return state; // IMPORTANT: Return current state for unknown actions
  }
}

// ========== STORE ==========
import { createStore } from "redux";
const store = createStore(counterReducer);

// ========== USAGE ==========
// Subscribe to changes
const unsubscribe = store.subscribe(() => {
  console.log("Current state:", store.getState());
});

// Dispatch actions
store.dispatch(increment());     // { count: 1 }
store.dispatch(increment());     // { count: 2 }
store.dispatch(setCount(10));    // { count: 10 }
store.dispatch(decrement());     // { count: 9 }
store.dispatch(reset());         // { count: 0 }

// Unsubscribe when done
unsubscribe();
```

### Combining Reducers

```javascript
import { combineReducers, createStore } from "redux";

// Counter reducer
const counterReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    default:
      return state;
  }
};

// User reducer
const userReducer = (state = { user: null, loading: false }, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// Combine reducers
const rootReducer = combineReducers({
  counter: counterReducer,
  user: userReducer
});

const store = createStore(rootReducer);

// State structure:
// {
//   counter: { count: 0 },
//   user: { user: null, loading: false }
// }
```

## 1.2 React-Redux Integration

### Provider Setup

```jsx
import { createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";

const store = createStore(rootReducer);

function App() {
  return (
    <Provider store={store}>
      <Counter />
      <UserProfile />
    </Provider>
  );
}
```

### useSelector Hook

```jsx
import { useSelector } from "react-redux";

function Counter() {
  // Select specific state
  const count = useSelector((state) => state.counter.count);

  // Select multiple values
  const { count, step } = useSelector((state) => ({
    count: state.counter.count,
    step: state.counter.step
  }));

  // With equality function for object selections
  import { shallowEqual } from "react-redux";
  const userData = useSelector(
    (state) => ({
      name: state.user.name,
      email: state.user.email
    }),
    shallowEqual
  );

  return <div>Count: {count}</div>;
}
```

### useDispatch Hook

```jsx
import { useDispatch } from "react-redux";
import { increment, decrement, setCount } from "./actions";

function Counter() {
  const dispatch = useDispatch();
  const count = useSelector((state) => state.counter.count);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(setCount(0))}>Reset</button>
    </div>
  );
}
```

---

# Level 2: Intermediate

## 2.1 Redux with Middleware

### What is Middleware?

```
┌────────────────────────────────────────────────────────────────────┐
│                    Redux Flow WITH Middleware                       │
│                                                                     │
│  ┌─────────────┐                                                   │
│  │    VIEW     │                                                   │
│  └──────┬──────┘                                                   │
│         │ dispatch(action)                                         │
│         ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     MIDDLEWARE CHAIN                         │   │
│  │                                                              │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐              │   │
│  │  │  Logger  │───►│  Thunk   │───►│   Saga   │───► ...      │   │
│  │  │          │    │          │    │          │              │   │
│  │  │ - Logs   │    │ - Async  │    │ - Complex│              │   │
│  │  │   action │    │ - API    │    │   flows  │              │   │
│  │  └──────────┘    └──────────┘    └──────────┘              │   │
│  │                                                              │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│                       ┌─────────────┐                              │
│                       │   REDUCER   │                              │
│                       └──────┬──────┘                              │
│                              │                                      │
│                              ▼                                      │
│                       ┌─────────────┐                              │
│                       │    STORE    │                              │
│                       └─────────────┘                              │
│                                                                     │
│  Middleware can:                                                   │
│  ✓ Log actions and state                                          │
│  ✓ Handle async operations                                        │
│  ✓ Transform or filter actions                                    │
│  ✓ Dispatch new actions                                           │
│  ✓ Access current state                                           │
│  ✓ Stop action from reaching reducer                              │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Middleware Structure

```javascript
// Middleware signature: store => next => action => result
// Curried function with 3 levels

const loggerMiddleware = (store) => (next) => (action) => {
  console.group(action.type);
  console.log("Dispatching:", action);
  console.log("Previous state:", store.getState());

  // Pass action to next middleware (or reducer if last)
  const result = next(action);

  console.log("Next state:", store.getState());
  console.groupEnd();

  return result;
};

// Simple crash reporter
const crashReporter = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    console.error("Caught an exception!", err);
    reportError(err, {
      action,
      state: store.getState()
    });
    throw err;
  }
};

// Apply middleware
import { createStore, applyMiddleware } from "redux";

const store = createStore(
  rootReducer,
  applyMiddleware(loggerMiddleware, crashReporter)
);
```

### Redux Thunk

```javascript
// Thunk = function that returns a function
// Allows dispatching functions instead of plain objects

import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

const store = createStore(rootReducer, applyMiddleware(thunk));

// ========== SYNC ACTION ==========
const setUsers = (users) => ({
  type: "SET_USERS",
  payload: users
});

// ========== ASYNC ACTION (THUNK) ==========
const fetchUsers = () => {
  // Return function instead of object
  return async (dispatch, getState) => {
    // Can access current state
    const { users } = getState();
    if (users.items.length > 0) return; // Already fetched

    // Dispatch loading state
    dispatch({ type: "FETCH_USERS_START" });

    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      // Dispatch success
      dispatch({ type: "FETCH_USERS_SUCCESS", payload: data });
    } catch (error) {
      // Dispatch error
      dispatch({ type: "FETCH_USERS_ERROR", payload: error.message });
    }
  };
};

// Usage in component
function UserList() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ...
}
```

### Thunk Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        Thunk Middleware Flow                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  dispatch(fetchUsers())                                            │
│         │                                                          │
│         ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │              THUNK MIDDLEWARE                            │       │
│  │                                                          │       │
│  │   Is action a function?                                 │       │
│  │         │                                                │       │
│  │    ┌────┴────┐                                          │       │
│  │    │         │                                          │       │
│  │   YES        NO                                         │       │
│  │    │         │                                          │       │
│  │    ▼         ▼                                          │       │
│  │  Execute   Pass to                                      │       │
│  │  function   next                                        │       │
│  │    │       middleware                                   │       │
│  │    │                                                    │       │
│  │    ▼                                                    │       │
│  │  action(dispatch, getState)                             │       │
│  │    │                                                    │       │
│  │    │  Can dispatch multiple actions:                    │       │
│  │    │  - dispatch({ type: 'LOADING' })                   │       │
│  │    │  - await fetch(...)                                │       │
│  │    │  - dispatch({ type: 'SUCCESS', payload })          │       │
│  │    │                                                    │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## 2.2 Redux Toolkit Basics

### Why Redux Toolkit?

```
Traditional Redux Problems:
❌ Too much boilerplate code
❌ Need to configure store manually
❌ Need to add middleware manually
❌ Immutable updates are error-prone
❌ Need to define action types, creators separately

Redux Toolkit Solutions:
✅ createSlice - reducers + actions in one
✅ configureStore - store setup done
✅ Built-in Thunk middleware
✅ Immer for "mutable" immutable updates
✅ DevTools configured automatically
```

### createSlice

```javascript
import { createSlice } from "@reduxjs/toolkit";

// All in one: initial state, reducers, actions
const counterSlice = createSlice({
  name: "counter",
  initialState: {
    count: 0,
    step: 1
  },
  reducers: {
    // Immer allows "mutable" syntax (actually immutable)
    increment: (state) => {
      state.count += state.step;
    },
    decrement: (state) => {
      state.count -= state.step;
    },
    // Action with payload
    setCount: (state, action) => {
      state.count = action.payload;
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    // Prepare callback for complex payload
    incrementByAmount: {
      reducer: (state, action) => {
        state.count += action.payload.amount;
      },
      prepare: (amount, meta) => ({
        payload: { amount, timestamp: Date.now() },
        meta
      })
    }
  }
});

// Auto-generated action creators
export const { increment, decrement, setCount, setStep, incrementByAmount } =
  counterSlice.actions;

// Reducer to use in store
export default counterSlice.reducer;

// Usage
dispatch(increment());        // { type: 'counter/increment' }
dispatch(setCount(10));       // { type: 'counter/setCount', payload: 10 }
dispatch(incrementByAmount(5)); // { type: 'counter/incrementByAmount', payload: { amount: 5, timestamp: ... } }
```

### configureStore

```javascript
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer
  },
  // Middleware is auto-configured (includes thunk)
  // DevTools is auto-configured
});

// For TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### createAsyncThunk

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk action
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      return response.json(); // This becomes action.payload
    } catch (error) {
      return rejectWithValue(error.message); // This becomes action.payload
    }
  }
);

// Async thunk with arguments
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice with extraReducers for async
const usersSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    clearUsers: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Pending
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      // Rejected
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // From rejectWithValue
      });
  }
});
```

---

# Level 3: Advanced

## 3.1 Redux Saga

### Why Saga?

```
Thunk:
- Simple async operations
- Returns functions
- Easy to understand
- Limited control flow

Saga:
- Complex async flows
- Uses generators
- Cancellation support
- Race conditions
- Retry logic
- Orchestration of multiple actions
```

### Saga Basics

```javascript
import { call, put, takeEvery, takeLatest, all } from "redux-saga/effects";

// API function
const api = {
  fetchUser: (id) => fetch(`/api/users/${id}`).then((r) => r.json())
};

// Worker saga - handles the actual logic
function* fetchUserSaga(action) {
  try {
    // Dispatch loading
    yield put({ type: "user/fetchStart" });

    // Call API (blocking)
    const user = yield call(api.fetchUser, action.payload);

    // Dispatch success
    yield put({ type: "user/fetchSuccess", payload: user });
  } catch (error) {
    // Dispatch error
    yield put({ type: "user/fetchError", payload: error.message });
  }
}

// Watcher saga - listens for actions
function* watchFetchUser() {
  // takeEvery: Run saga for EVERY action
  yield takeEvery("user/fetchRequest", fetchUserSaga);

  // takeLatest: Cancel previous, run ONLY latest
  yield takeLatest("user/fetchRequest", fetchUserSaga);
}

// Root saga
function* rootSaga() {
  yield all([
    watchFetchUser(),
    watchFetchPosts(),
    watchAuth()
  ]);
}

// Setup
import createSagaMiddleware from "redux-saga";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware)
});

sagaMiddleware.run(rootSaga);
```

### Saga Effects

```javascript
import {
  call,      // Call function (blocking)
  put,       // Dispatch action
  take,      // Wait for action
  takeEvery, // Run for every action
  takeLatest,// Cancel previous, run latest
  fork,      // Non-blocking call
  spawn,     // Detached non-blocking call
  all,       // Run multiple effects in parallel
  race,      // Run multiple, complete on first
  select,    // Get state
  delay,     // Wait for time
  cancel,    // Cancel a forked task
  cancelled  // Check if cancelled
} from "redux-saga/effects";

// Complex example: Authentication flow
function* authFlowSaga() {
  while (true) {
    // Wait for login action
    const { payload: credentials } = yield take("auth/loginRequest");

    // Fork login task (non-blocking)
    const task = yield fork(loginSaga, credentials);

    // Wait for logout OR login error
    const action = yield take(["auth/logout", "auth/loginError"]);

    if (action.type === "auth/logout") {
      // Cancel login if still running
      yield cancel(task);
      // Clear storage
      yield call(clearAuthStorage);
    }
  }
}

function* loginSaga(credentials) {
  try {
    const user = yield call(api.login, credentials);
    yield put({ type: "auth/loginSuccess", payload: user });

    // Save to storage
    yield call(saveAuthToken, user.token);
  } catch (error) {
    yield put({ type: "auth/loginError", payload: error.message });
  } finally {
    if (yield cancelled()) {
      // Cleanup if cancelled
      console.log("Login cancelled");
    }
  }
}
```

### Saga Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        Saga Middleware Flow                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  dispatch({ type: 'FETCH_USER_REQUEST', payload: 123 })            │
│         │                                                          │
│         ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │              SAGA MIDDLEWARE                             │       │
│  │                                                          │       │
│  │   Watcher Saga (takeLatest)                             │       │
│  │         │                                                │       │
│  │         │ Matches action type                           │       │
│  │         ▼                                                │       │
│  │   Worker Saga                                           │       │
│  │         │                                                │       │
│  │    ┌────┴────────────────────────────────────┐          │       │
│  │    │                                          │          │       │
│  │    │  1. yield put({ type: 'LOADING' })      │───┐      │       │
│  │    │                                          │   │      │       │
│  │    │  2. yield call(api.fetchUser, 123)      │   │      │       │
│  │    │         │                                │   │      │       │
│  │    │         ▼ (waits for API)               │   │      │       │
│  │    │                                          │   │      │       │
│  │    │  3. yield put({ type: 'SUCCESS',        │   │      │       │
│  │    │              payload: user })           │───┤      │       │
│  │    │                                          │   │      │       │
│  │    └──────────────────────────────────────────┘   │      │       │
│  │                                                    │      │       │
│  └────────────────────────────────────────────────────┼──────┘       │
│                                                       │              │
│                     Actions go to Reducer ◄───────────┘              │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## 3.2 RTK Query

### API Definition

```javascript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["User", "Post", "Comment"],
  endpoints: (builder) => ({
    // ========== QUERIES (GET) ==========
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"]
    }),

    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }]
    }),

    getUsersByRole: builder.query({
      query: (role) => `/users?role=${role}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User", id })),
              { type: "User", id: "LIST" }
            ]
          : [{ type: "User", id: "LIST" }]
    }),

    // ========== MUTATIONS (POST/PUT/DELETE) ==========
    addUser: builder.mutation({
      query: (user) => ({
        url: "/users",
        method: "POST",
        body: user
      }),
      invalidatesTags: ["User"]
    }),

    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: patch
      }),
      // Optimistic update
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData("getUserById", id, (draft) => {
            Object.assign(draft, patch);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Rollback on error
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }]
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }]
    })
  })
});

// Auto-generated hooks
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUsersByRoleQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} = api;
```

### Store Setup with RTK Query

```javascript
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    user: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
});
```

### Using RTK Query in Components

```jsx
function UserList() {
  // Query with options
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useGetUsersQuery(undefined, {
    pollingInterval: 30000, // Poll every 30s
    refetchOnMountOrArgChange: true,
    skip: false // Set true to skip query
  });

  // Mutation
  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handleAdd = async () => {
    try {
      await addUser({ name: "New User", email: "new@example.com" }).unwrap();
      // Success
    } catch (error) {
      // Handle error
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return (
    <div>
      <button onClick={handleAdd} disabled={isAdding}>
        Add User
      </button>
      <button onClick={refetch} disabled={isFetching}>
        Refresh
      </button>
      {users?.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onDelete={() => deleteUser(user.id)}
        />
      ))}
    </div>
  );
}
```

## 3.3 Advanced Selectors

### createSelector for Memoization

```javascript
import { createSelector } from "@reduxjs/toolkit";

// Base selectors
const selectUsers = (state) => state.users.items;
const selectFilter = (state) => state.users.filter;
const selectSortBy = (state) => state.users.sortBy;

// Memoized selector - only recomputes when inputs change
export const selectFilteredUsers = createSelector(
  [selectUsers, selectFilter],
  (users, filter) => {
    console.log("Computing filtered users..."); // Only logs when recomputing
    if (!filter) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(filter.toLowerCase())
    );
  }
);

// Chained selectors
export const selectSortedFilteredUsers = createSelector(
  [selectFilteredUsers, selectSortBy],
  (filteredUsers, sortBy) => {
    return [...filteredUsers].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });
  }
);

// Selector with external argument
export const makeSelectUserById = () =>
  createSelector(
    [selectUsers, (_, userId) => userId],
    (users, userId) => users.find((u) => u.id === userId)
  );

// Usage with useMemo to avoid recreation
function UserProfile({ userId }) {
  const selectUserById = useMemo(makeSelectUserById, []);
  const user = useSelector((state) => selectUserById(state, userId));
  return <div>{user?.name}</div>;
}
```

### Entity Adapter

```javascript
import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

// Create adapter with custom ID field
const usersAdapter = createEntityAdapter({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

// Initial state with adapter
const initialState = usersAdapter.getInitialState({
  loading: false,
  error: null
});
// { ids: [], entities: {}, loading: false, error: null }

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // Adapter methods
    addUser: usersAdapter.addOne,
    addUsers: usersAdapter.addMany,
    updateUser: usersAdapter.updateOne,
    removeUser: usersAdapter.removeOne,
    setAllUsers: usersAdapter.setAll,

    // Custom reducer with adapter
    userUpdated(state, action) {
      usersAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload.changes
      });
    }
  }
});

// Adapter provides selectors
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
  selectTotal: selectUserCount
} = usersAdapter.getSelectors((state) => state.users);

// Usage
const users = useSelector(selectAllUsers);
const user = useSelector((state) => selectUserById(state, userId));
```

---

# Real-world Applications

## E-commerce Cart Example

```javascript
// cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const syncCart = createAsyncThunk(
  "cart/sync",
  async (_, { getState, rejectWithValue }) => {
    const { items } = getState().cart;
    try {
      await api.syncCart(items);
      return items;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    lastSynced: null
  },
  reducers: {
    addItem: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(syncCart.fulfilled, (state) => {
      state.lastSynced = Date.now();
    });
  }
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);
```

## Authentication Flow

```javascript
// authSlice.js
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Protected route hook
function useAuth() {
  const { user, token } = useSelector((state) => state.auth);
  return { isAuthenticated: !!token, user };
}
```

## Normalized State with Relationships

```javascript
// Normalized state structure
const state = {
  users: {
    byId: {
      1: { id: 1, name: "John", postIds: [1, 2] },
      2: { id: 2, name: "Jane", postIds: [3] }
    },
    allIds: [1, 2]
  },
  posts: {
    byId: {
      1: { id: 1, title: "Post 1", authorId: 1, commentIds: [1, 2] },
      2: { id: 2, title: "Post 2", authorId: 1, commentIds: [3] },
      3: { id: 3, title: "Post 3", authorId: 2, commentIds: [] }
    },
    allIds: [1, 2, 3]
  },
  comments: {
    byId: {
      1: { id: 1, text: "Comment 1", postId: 1, authorId: 2 },
      2: { id: 2, text: "Comment 2", postId: 1, authorId: 1 },
      3: { id: 3, text: "Comment 3", postId: 2, authorId: 2 }
    },
    allIds: [1, 2, 3]
  }
};

// Denormalized selector
const selectPostWithDetails = createSelector(
  [
    (state) => state.posts.byId,
    (state) => state.users.byId,
    (state) => state.comments.byId,
    (_, postId) => postId
  ],
  (posts, users, comments, postId) => {
    const post = posts[postId];
    if (!post) return null;

    return {
      ...post,
      author: users[post.authorId],
      comments: post.commentIds.map((id) => ({
        ...comments[id],
        author: users[comments[id].authorId]
      }))
    };
  }
);
```

---

# Interview Questions

## Basic Level

1. **Redux ba nguyên tắc là gì?**
   - Single source of truth
   - State is read-only
   - Changes with pure functions (reducers)

2. **Redux flow không middleware?**
   - View → dispatch(action) → Reducer → Store → View
   - Synchronous only

3. **Action là gì?**
   - Plain object với `type` property
   - Mô tả "what happened"
   - Optional `payload` cho data

4. **Reducer là gì?**
   - Pure function: (state, action) => newState
   - Không side effects
   - Phải return new state (immutable)

## Intermediate Level

5. **Middleware là gì? Flow có middleware?**
   - Functions intercept actions before reducer
   - View → Middleware chain → Reducer → Store → View
   - Can log, transform, async, dispatch new actions

6. **Thunk là gì?**
   - Middleware cho phép dispatch functions
   - Function nhận (dispatch, getState)
   - Dùng cho async operations

7. **Thunk vs Saga?**
   - Thunk: Simple, returns functions, easy async
   - Saga: Generators, complex flows, cancellation, racing

8. **createSlice có gì?**
   - name, initialState, reducers, extraReducers
   - Auto-generate action creators
   - Immer cho mutable syntax

## Advanced Level

9. **RTK Query là gì?**
   - Data fetching solution built on RTK
   - Auto-caching, refetching, polling
   - Queries (GET) và Mutations (POST/PUT/DELETE)
   - Tag-based invalidation

10. **Entity Adapter?**
    - Normalized state management
    - { ids: [], entities: {} }
    - Built-in CRUD operations
    - Auto-generated selectors

11. **Selector memoization?**
    - createSelector từ Reselect
    - Cache results, only recompute when inputs change
    - Avoid unnecessary re-renders

12. **Optimistic updates?**
    - Update UI immediately before API response
    - Rollback on error
    - onQueryStarted in RTK Query

13. **State normalization?**
    - Flat structure: byId + allIds
    - No nested/duplicated data
    - Easier updates, consistency

14. **Khi nào dùng Redux?**
    - Large app, complex state
    - Many components share state
    - Need middleware, devtools
    - Complex async flows
    - Time-travel debugging needed

## Comparison Questions

15. **Redux vs Context?**
    - Context: Built-in, simple, all consumers re-render
    - Redux: Selective subscriptions, middleware, devtools

16. **Redux Toolkit vs vanilla Redux?**
    - RTK: Less boilerplate, Immer, createAsyncThunk
    - Vanilla: Manual setup, more code, error-prone

17. **RTK Query vs TanStack Query?**
    - RTK Query: Integrated with Redux, tags
    - TanStack Query: Framework agnostic, more features
    - Both: Caching, refetching, mutations

