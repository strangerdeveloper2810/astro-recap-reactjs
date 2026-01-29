# State Management - Redux Toolkit, Zustand, Jotai, Recoil

> **Vị trí**: Senior/Lead React Developer - FPT Software
> **Ngôn ngữ phỏng vấn**: Tiếng Việt
> **Mục tiêu**: So sánh và sử dụng thành thạo các thư viện state management

---

## Mục lục

1. [Tổng quan State Management](#1-tổng-quan-state-management)
2. [Redux Toolkit](#2-redux-toolkit)
3. [Zustand](#3-zustand)
4. [Jotai](#4-jotai)
5. [Recoil](#5-recoil)
6. [So sánh và lựa chọn](#6-so-sánh-và-lựa-chọn)
7. [Câu hỏi phỏng vấn thường gặp](#7-câu-hỏi-phỏng-vấn-thường-gặp)

---

## 1. Tổng quan State Management

### 1.1 Các loại State trong React

```
┌─────────────────────────────────────────────────────────────┐
│                    TYPES OF STATE                            │
├──────────────┬──────────────────────────────────────────────┤
│ Local State  │ useState, useReducer - trong 1 component     │
├──────────────┼──────────────────────────────────────────────┤
│ Server State │ Data từ API - React Query, SWR              │
├──────────────┼──────────────────────────────────────────────┤
│ URL State    │ Search params, path - useSearchParams        │
├──────────────┼──────────────────────────────────────────────┤
│ Global State │ Shared across components - Redux, Zustand    │
└──────────────┴──────────────────────────────────────────────┘
```

### 1.2 Khi nào cần Global State?

**Cần Global State:**
- User authentication (user info, token)
- Theme/Language preferences
- Shopping cart
- Notifications
- Multi-step form data

**KHÔNG cần Global State:**
- Form input values (local state)
- Modal open/close (local state)
- API data (React Query/SWR)
- URL-based filters (URL state)

### 1.3 Phân loại State Management Libraries

| Loại | Libraries | Đặc điểm |
|------|-----------|----------|
| **Flux-based** | Redux, Redux Toolkit | Actions, Reducers, Store |
| **Atomic** | Jotai, Recoil | Atoms, derived state |
| **Proxy-based** | Zustand, Valtio | Simple API, mutable-style |

---

## 2. Redux Toolkit

### 2.1 Redux Toolkit là gì?

Redux Toolkit (RTK) là cách recommended để sử dụng Redux, giải quyết các vấn đề:
- Boilerplate code quá nhiều
- Cần nhiều packages (redux-thunk, immer, reselect)
- Setup phức tạp

### 2.2 Setup Redux Toolkit

```bash
npm install @reduxjs/toolkit react-redux
```

**Cấu trúc thư mục:**
```
src/
├── app/
│   └── store.ts           # Cấu hình store
├── features/
│   ├── auth/
│   │   ├── authSlice.ts   # Slice cho auth
│   │   └── authApi.ts     # RTK Query (nếu cần)
│   ├── cart/
│   │   └── cartSlice.ts
│   └── products/
│       └── productsSlice.ts
└── main.tsx
```

### 2.3 Tạo Store

```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import { productsApi } from '../features/products/productsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    // RTK Query reducer
    [productsApi.reducerPath]: productsApi.reducer,
  },
  // RTK Query middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware),
});

// Infer types từ store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2.4 Tạo Slice

```typescript
// src/features/cart/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,

  reducers: {
    // Immer cho phép viết "mutating" code
    addItem: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

// Export actions
export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) => state.cart.totalAmount;
export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
```

### 2.5 Async Thunks

```typescript
// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Async thunk cho login
export const login = createAsyncThunk(
  'auth/login',
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      return rejectWithValue('Lỗi kết nối server');
    }
  }
);

// Async thunk cho logout
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
```

### 2.6 RTK Query - Data Fetching

```typescript
// src/features/products/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['Product'],

  endpoints: (builder) => ({
    // GET /api/products
    getProducts: builder.query<Product[], void>({
      query: () => 'products',
      providesTags: ['Product'],
    }),

    // GET /api/products/:id
    getProduct: builder.query<Product, string>({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // POST /api/products
    addProduct: builder.mutation<Product, Omit<Product, 'id'>>({
      query: (product) => ({
        url: 'products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),

    // PUT /api/products/:id
    updateProduct: builder.mutation<Product, Product>({
      query: ({ id, ...patch }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),

    // DELETE /api/products/:id
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
```

### 2.7 Sử dụng trong Components

```tsx
// src/components/ProductList.tsx
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useGetProductsQuery } from '../features/products/productsApi';
import { addItem, selectCartItems } from '../features/cart/cartSlice';

function ProductList() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);

  // RTK Query tự động fetch và cache
  const { data: products, isLoading, error, refetch } = useGetProductsQuery();

  const handleAddToCart = (product: Product) => {
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    }));
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;

  return (
    <div>
      {products?.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price.toLocaleString()}đ</p>
          <button onClick={() => handleAddToCart(product)}>
            Thêm vào giỏ
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 2.8 Typed Hooks

```typescript
// src/app/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Typed versions của useDispatch và useSelector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 3. Zustand

### 3.1 Zustand là gì?

Zustand là thư viện state management nhẹ, đơn giản, không boilerplate. Đặc điểm:
- API đơn giản, ít code
- Không cần Provider
- TypeScript support tốt
- Devtools support

### 3.2 Setup Zustand

```bash
npm install zustand
```

### 3.3 Tạo Store cơ bản

```typescript
// src/stores/cartStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  // State
  items: CartItem[];
  totalAmount: number;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

// Helper function để tính total
const calculateTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        items: [],
        totalAmount: 0,

        // Actions
        addItem: (item) =>
          set((state) => {
            const existingItem = state.items.find((i) => i.id === item.id);

            if (existingItem) {
              const newItems = state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              );
              return { items: newItems, totalAmount: calculateTotal(newItems) };
            }

            const newItems = [...state.items, { ...item, quantity: 1 }];
            return { items: newItems, totalAmount: calculateTotal(newItems) };
          }),

        removeItem: (id) =>
          set((state) => {
            const newItems = state.items.filter((item) => item.id !== id);
            return { items: newItems, totalAmount: calculateTotal(newItems) };
          }),

        updateQuantity: (id, quantity) =>
          set((state) => {
            const newItems = state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            );
            return { items: newItems, totalAmount: calculateTotal(newItems) };
          }),

        clearCart: () => set({ items: [], totalAmount: 0 }),
      }),
      {
        name: 'cart-storage', // localStorage key
      }
    )
  )
);
```

### 3.4 Async Actions với Zustand

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools((set) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);

        set({
          user: data.user,
          token: data.token,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
        });
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    },

    clearError: () => set({ error: null }),
  }))
);
```

### 3.5 Slices Pattern (cho store lớn)

```typescript
// src/stores/slices/cartSlice.ts
import { StateCreator } from 'zustand';

export interface CartSlice {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
}

export const createCartSlice: StateCreator<
  CartSlice & AuthSlice, // Combined store type
  [],
  [],
  CartSlice
> = (set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
});

// src/stores/slices/authSlice.ts
export interface AuthSlice {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const createAuthSlice: StateCreator<
  CartSlice & AuthSlice,
  [],
  [],
  AuthSlice
> = (set) => ({
  user: null,

  login: async (email, password) => {
    // ... login logic
  },

  logout: () => set({ user: null }),
});

// src/stores/useStore.ts
import { create } from 'zustand';
import { createCartSlice, CartSlice } from './slices/cartSlice';
import { createAuthSlice, AuthSlice } from './slices/authSlice';

type StoreState = CartSlice & AuthSlice;

export const useStore = create<StoreState>()((...args) => ({
  ...createCartSlice(...args),
  ...createAuthSlice(...args),
}));
```

### 3.6 Selectors để tối ưu Re-renders

```typescript
// Không tốt - re-render khi bất kỳ state nào thay đổi
const { items, user, totalAmount } = useCartStore();

// Tốt - chỉ re-render khi items thay đổi
const items = useCartStore((state) => state.items);

// Tốt - computed value
const itemCount = useCartStore((state) =>
  state.items.reduce((count, item) => count + item.quantity, 0)
);

// Tốt - shallow compare cho object/array
import { shallow } from 'zustand/shallow';

const { items, totalAmount } = useCartStore(
  (state) => ({ items: state.items, totalAmount: state.totalAmount }),
  shallow
);
```

### 3.7 Sử dụng trong Components

```tsx
// src/components/Cart.tsx
import { useCartStore } from '../stores/cartStore';

function Cart() {
  // Chỉ lấy những gì cần
  const items = useCartStore((state) => state.items);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <div>
      <h2>Giỏ hàng</h2>
      {items.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>{item.quantity} x {item.price.toLocaleString()}đ</span>
          <button onClick={() => removeItem(item.id)}>Xóa</button>
        </div>
      ))}
      <div>
        <strong>Tổng: {totalAmount.toLocaleString()}đ</strong>
      </div>
      <button onClick={clearCart}>Xóa giỏ hàng</button>
    </div>
  );
}
```

---

## 4. Jotai

### 4.1 Jotai là gì?

Jotai là thư viện atomic state management, lấy cảm hứng từ Recoil nhưng đơn giản hơn:
- Primitive atoms (đơn vị state nhỏ nhất)
- Derived atoms (computed từ atoms khác)
- Không cần Provider (trừ khi cần isolate)
- Bundle size nhỏ

### 4.2 Setup Jotai

```bash
npm install jotai
```

### 4.3 Primitive Atoms

```typescript
// src/atoms/cartAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Primitive atom - state cơ bản
export const cartItemsAtom = atom<CartItem[]>([]);

// Atom với localStorage persistence
export const cartItemsAtomWithStorage = atomWithStorage<CartItem[]>(
  'cart-items', // localStorage key
  [] // default value
);

// Derived atom - computed value (read-only)
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
});

export const cartItemCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((count, item) => count + item.quantity, 0);
});
```

### 4.4 Write Atoms (Actions)

```typescript
// src/atoms/cartAtoms.ts
import { atom } from 'jotai';

// ... primitive atoms above

// Write-only atom - action
export const addItemAtom = atom(
  null, // read không cần
  (get, set, item: Omit<CartItem, 'quantity'>) => {
    const items = get(cartItemsAtom);
    const existingItem = items.find((i) => i.id === item.id);

    if (existingItem) {
      set(
        cartItemsAtom,
        items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      set(cartItemsAtom, [...items, { ...item, quantity: 1 }]);
    }
  }
);

export const removeItemAtom = atom(null, (get, set, id: string) => {
  const items = get(cartItemsAtom);
  set(
    cartItemsAtom,
    items.filter((item) => item.id !== id)
  );
});

export const updateQuantityAtom = atom(
  null,
  (get, set, { id, quantity }: { id: string; quantity: number }) => {
    const items = get(cartItemsAtom);
    set(
      cartItemsAtom,
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }
);

export const clearCartAtom = atom(null, (get, set) => {
  set(cartItemsAtom, []);
});
```

### 4.5 Async Atoms

```typescript
// src/atoms/userAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

interface User {
  id: string;
  email: string;
  name: string;
}

// Token atom với persistence
export const tokenAtom = atomWithStorage<string | null>('auth-token', null);

// User atom - async fetch based on token
export const userAtom = atom(async (get) => {
  const token = get(tokenAtom);
  if (!token) return null;

  const response = await fetch('/api/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  return response.json() as Promise<User>;
});

// Login action
export const loginAtom = atom(
  null,
  async (get, set, credentials: { email: string; password: string }) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Đăng nhập thất bại');
    }

    const data = await response.json();
    set(tokenAtom, data.token);
    return data.user;
  }
);

// Logout action
export const logoutAtom = atom(null, (get, set) => {
  set(tokenAtom, null);
});
```

### 4.6 Sử dụng trong Components

```tsx
// src/components/Cart.tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  cartItemsAtom,
  cartTotalAtom,
  removeItemAtom,
  clearCartAtom,
} from '../atoms/cartAtoms';

function Cart() {
  // useAtomValue - chỉ đọc
  const items = useAtomValue(cartItemsAtom);
  const total = useAtomValue(cartTotalAtom);

  // useSetAtom - chỉ ghi (không subscribe)
  const removeItem = useSetAtom(removeItemAtom);
  const clearCart = useSetAtom(clearCartAtom);

  return (
    <div>
      <h2>Giỏ hàng</h2>
      {items.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>{item.quantity} x {item.price.toLocaleString()}đ</span>
          <button onClick={() => removeItem(item.id)}>Xóa</button>
        </div>
      ))}
      <div>
        <strong>Tổng: {total.toLocaleString()}đ</strong>
      </div>
      <button onClick={clearCart}>Xóa giỏ hàng</button>
    </div>
  );
}
```

```tsx
// src/components/LoginForm.tsx
import { useAtom, useSetAtom } from 'jotai';
import { loginAtom, userAtom } from '../atoms/userAtoms';
import { Suspense } from 'react';

function UserInfo() {
  // Async atom - cần Suspense
  const user = useAtomValue(userAtom);

  if (!user) return <p>Chưa đăng nhập</p>;
  return <p>Xin chào, {user.name}</p>;
}

function LoginForm() {
  const login = useSetAtom(loginAtom);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (error) {
      alert('Đăng nhập thất bại');
    }
  };

  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <UserInfo />
      </Suspense>
      <form onSubmit={handleSubmit}>
        {/* form fields */}
      </form>
    </div>
  );
}
```

---

## 5. Recoil

### 5.1 Recoil là gì?

Recoil là thư viện atomic state management từ Facebook, tích hợp tốt với React:
- Atoms và Selectors
- Concurrent Mode ready
- DevTools support
- Snapshots cho time-travel debugging

### 5.2 Setup Recoil

```bash
npm install recoil
```

```tsx
// main.tsx - Bắt buộc RecoilRoot
import { RecoilRoot } from 'recoil';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RecoilRoot>
    <App />
  </RecoilRoot>
);
```

### 5.3 Atoms

```typescript
// src/atoms/cartAtoms.ts
import { atom, selector } from 'recoil';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Atom - state cơ bản
export const cartItemsState = atom<CartItem[]>({
  key: 'cartItems', // Unique key
  default: [],
});

// Selector - derived state
export const cartTotalState = selector({
  key: 'cartTotal',
  get: ({ get }) => {
    const items = get(cartItemsState);
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
});

export const cartItemCountState = selector({
  key: 'cartItemCount',
  get: ({ get }) => {
    const items = get(cartItemsState);
    return items.reduce((count, item) => count + item.quantity, 0);
  },
});

// Selector với filter parameter
export const cartItemState = selectorFamily({
  key: 'cartItem',
  get: (itemId: string) => ({ get }) => {
    const items = get(cartItemsState);
    return items.find((item) => item.id === itemId);
  },
});
```

### 5.4 Async Selectors

```typescript
// src/atoms/userAtoms.ts
import { atom, selector, selectorFamily } from 'recoil';

export const tokenState = atom<string | null>({
  key: 'token',
  default: localStorage.getItem('token'),
});

// Async selector - auto suspense
export const currentUserState = selector({
  key: 'currentUser',
  get: async ({ get }) => {
    const token = get(tokenState);
    if (!token) return null;

    const response = await fetch('/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;
    return response.json();
  },
});

// Async selector với parameter
export const userByIdState = selectorFamily({
  key: 'userById',
  get: (userId: string) => async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
});
```

### 5.5 Sử dụng trong Components

```tsx
// src/components/Cart.tsx
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { cartItemsState, cartTotalState } from '../atoms/cartAtoms';

function Cart() {
  // useRecoilValue - chỉ đọc
  const total = useRecoilValue(cartTotalState);

  // useRecoilState - đọc và ghi
  const [items, setItems] = useRecoilState(cartItemsState);

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <div>
      <h2>Giỏ hàng</h2>
      {items.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <button onClick={() => removeItem(item.id)}>Xóa</button>
        </div>
      ))}
      <strong>Tổng: {total.toLocaleString()}đ</strong>
      <button onClick={clearCart}>Xóa giỏ hàng</button>
    </div>
  );
}
```

```tsx
// Async selector với Suspense
function UserProfile() {
  const user = useRecoilValue(currentUserState);

  if (!user) return <p>Chưa đăng nhập</p>;
  return <p>Xin chào, {user.name}</p>;
}

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UserProfile />
    </Suspense>
  );
}
```

---

## 6. So sánh và lựa chọn

### 6.1 Feature Comparison

| Feature | Redux Toolkit | Zustand | Jotai | Recoil |
|---------|---------------|---------|-------|--------|
| **Bundle size** | ~11kb | ~1kb | ~2kb | ~14kb |
| **Boilerplate** | Trung bình | Thấp | Thấp | Trung bình |
| **Learning curve** | Cao | Thấp | Thấp | Trung bình |
| **DevTools** | ✅ Tốt | ✅ | ✅ | ✅ |
| **Middleware** | ✅ Nhiều | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited |
| **TypeScript** | ✅ | ✅ | ✅ | ✅ |
| **Server State** | ✅ RTK Query | ❌ | ❌ | ⚠️ Basic |
| **Suspense** | ⚠️ Manual | ⚠️ Manual | ✅ Native | ✅ Native |
| **Provider** | ✅ Required | ❌ Optional | ❌ Optional | ✅ Required |

### 6.2 Khi nào chọn thư viện nào?

**Redux Toolkit:**
- Ứng dụng lớn, phức tạp
- Team đã quen Redux
- Cần RTK Query cho API
- Cần middleware phức tạp
- Enterprise apps

**Zustand:**
- Ứng dụng trung bình
- Muốn simple API
- Không muốn boilerplate
- Migrate từ React Context
- Startup, side projects

**Jotai:**
- Cần fine-grained updates
- Thích atomic model
- Sử dụng Suspense
- Bundle size quan trọng
- Component-level state

**Recoil:**
- Facebook stack
- Cần snapshots/time-travel
- Concurrent Mode
- Complex derived state
- Large-scale apps

### 6.3 Decision Flow

```
Cần gì? ──────────────────────────────────────────────┐
│                                                       │
├── Server state (API caching)?                         │
│   ├── Yes → React Query + Zustand/Jotai cho UI state │
│   └── No ↓                                            │
│                                                       │
├── Ứng dụng lớn, team lớn?                            │
│   ├── Yes → Redux Toolkit                             │
│   └── No ↓                                            │
│                                                       │
├── Cần atomic, fine-grained updates?                  │
│   ├── Yes → Jotai hoặc Recoil                        │
│   └── No ↓                                            │
│                                                       │
└── Simple global state?                                │
    └── Yes → Zustand                                   │
```

---

## 7. Câu hỏi phỏng vấn thường gặp

### Câu hỏi 1: "Khi nào cần dùng state management library thay vì Context API?"

**Trả lời:**
> "Context API phù hợp cho state ít thay đổi như theme, user info. Tuy nhiên, khi state thay đổi thường xuyên hoặc có nhiều consumers, Context gây re-render không cần thiết cho tất cả consumers.
>
> Tôi dùng state management library khi:
> - State thay đổi thường xuyên (như cart items)
> - Nhiều components cần subscribe chọn lọc
> - Cần middleware, devtools, persistence
> - Logic phức tạp cần tách riêng khỏi components
>
> Với ứng dụng nhỏ, Context + useReducer là đủ. Với ứng dụng trung bình trở lên, tôi thường dùng Zustand vì đơn giản và hiệu quả."

---

### Câu hỏi 2: "Redux Toolkit khác gì Redux cũ?"

**Trả lời:**
> "Redux Toolkit giải quyết các pain points của Redux cũ:
>
> **1. Ít boilerplate:**
> - Không cần viết action types, action creators riêng
> - `createSlice` tự generate actions từ reducers
>
> **2. Immer tích hợp sẵn:**
> - Viết code 'mutating' nhưng thực tế immutable
> - Không cần spread operator phức tạp
>
> **3. Cấu hình đơn giản:**
> - `configureStore` setup sẵn middleware, devtools
> - Không cần cài thêm redux-thunk, redux-devtools
>
> **4. RTK Query:**
> - Data fetching và caching tích hợp
> - Tương tự React Query nhưng trong Redux
>
> Hiện tại tôi chỉ dùng Redux Toolkit, không dùng Redux cũ vì overhead không cần thiết."

---

### Câu hỏi 3: "Zustand có gì hay so với Redux?"

**Trả lời:**
> "Zustand có một số ưu điểm:
>
> **1. Simple API:**
> - Không cần actions, reducers, dispatch
> - Store là một hook, gọi trực tiếp
>
> **2. Không cần Provider:**
> - Không wrap app trong Provider
> - Dễ dùng trong tests
>
> **3. Bundle size nhỏ:**
> - ~1kb so với ~11kb của Redux Toolkit
>
> **4. Ít boilerplate:**
> - Một file cho cả state và actions
>
> **Khi nào chọn Redux Toolkit thay vì Zustand:**
> - Cần RTK Query cho server state
> - Team đã quen Redux patterns
> - Cần middleware phức tạp (saga, observable)
> - Enterprise app cần strict patterns"

---

### Câu hỏi 4: "Atomic state (Jotai/Recoil) khác gì với centralized store (Redux/Zustand)?"

**Trả lời:**
> "Hai approach khác nhau về cách tổ chức state:
>
> **Centralized (Redux, Zustand):**
> - Một store chứa tất cả state
> - Actions modify store
> - Top-down approach
>
> **Atomic (Jotai, Recoil):**
> - State chia thành atoms nhỏ
> - Atoms có thể derive từ atoms khác
> - Bottom-up approach
>
> **Ưu điểm của Atomic:**
> - Fine-grained updates, ít re-render
> - Tự động code splitting cho state
> - Derived state declarative và reactive
>
> **Ưu điểm của Centralized:**
> - Dễ debug, time-travel
> - State predictable hơn
> - Middleware ecosystem
>
> Tôi chọn atomic khi có nhiều derived state phức tạp, chọn centralized khi cần visibility và predictability."

---

### Câu hỏi 5: "Làm sao để tối ưu performance với state management?"

**Trả lời:**
> "Có một số kỹ thuật tối ưu:
>
> **1. Selective subscriptions:**
> - Redux: Dùng `useSelector` với specific selectors
> - Zustand: Chỉ select state cần thiết
> - Jotai: Dùng `useAtomValue` thay vì `useAtom` khi chỉ đọc
>
> **2. Memoized selectors:**
> - Redux: `createSelector` từ reselect
> - Zustand: `shallow` equality check
>
> **3. Normalize state:**
> - Flatten nested data
> - Dùng ID references thay vì nested objects
>
> **4. Colocate state:**
> - Chỉ đưa lên global những gì thực sự cần shared
> - Local state cho component-specific data
>
> **5. Split stores:**
> - Chia store theo domain
> - Zustand: Multiple stores
> - Jotai: Atoms tự nhiên isolated"

---

### Câu hỏi 6: "Trong dự án thực tế, bạn quản lý state như thế nào?"

**Trả lời (ví dụ):**
> "Trong dự án e-commerce gần đây, tôi phân loại state như sau:
>
> **Server State (React Query):**
> - Products, orders, user profile
> - Tự động cache, refetch, background updates
>
> **UI State (Zustand):**
> - Cart items (cần persist)
> - Modal open/close
> - Sidebar collapse
>
> **Form State (React Hook Form):**
> - Checkout form
> - Search filters
>
> **URL State (React Router):**
> - Product filters
> - Pagination
> - Search query
>
> Kết quả: Giảm 60% code so với dùng Redux cho tất cả, performance cải thiện nhờ fine-grained updates."

---

## Tài liệu tham khảo

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Jotai Documentation](https://jotai.org/)
- [Recoil Documentation](https://recoiljs.org/)
- [React State Management Comparison](https://react.dev/learn/managing-state)
