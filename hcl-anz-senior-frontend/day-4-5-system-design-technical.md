# Day 4-5: Frontend System Design + Technical Deep Dive

> **Mục tiêu**: Hiểu và tự tin trả lời các câu hỏi về Design System, Testing, Component Design
> **Format**: 🇻🇳 Giải thích tiếng Việt → 🇬🇧 Câu trả lời phỏng vấn tiếng Anh

---

## Lịch học

### Day 4 (5-6 tiếng)
| Session | Chủ đề | Thời gian |
|---------|--------|-----------|
| 0 | Design System - Tái sử dụng Component | 30 phút |
| 0.5 | Integration Testing | 45 phút |
| 1 | Thiết kế Modal | 45 phút |
| 2 | Thiết kế Autocomplete | 45 phút |
| 3 | Thiết kế DataTable | 45 phút |
| 4 | Next.js 14 | 1.5 tiếng |

### Day 5 (4-5 tiếng)
| Session | Chủ đề | Thời gian |
|---------|--------|-----------|
| 5 | Multi-step Form | 1 tiếng |
| 6 | Real-time Dashboard | 1 tiếng |
| 7 | Accessibility (WCAG AA) | 1 tiếng |
| 8 | Nx + gRPC + Q&A nhanh | 1 tiếng |

---

# PHẦN 1: DESIGN SYSTEM & COMPONENT TÁI SỬ DỤNG

---

## 🎯 Câu hỏi hay gặp

> "Làm sao để thiết kế component có thể tái sử dụng ở nhiều dự án khác nhau?"

---

## 1.1 Component Layers - Tầng lớp Component

### 🇻🇳 Hiểu đơn giản

Giống như xây nhà, ta cần xây từ móng lên:

```
TẦNG 3: Feature Components (Phòng hoàn chỉnh)
    └── LoginForm, ProductCard, TransactionTable
    └── Chỉ dùng trong 1 dự án cụ thể

TẦNG 2: Composed Components (Đồ nội thất)
    └── SearchInput, DatePicker, DataTable, Modal
    └── Dùng lại được ở nhiều feature

TẦNG 1: Primitive Components (Gạch, xi măng)
    └── Button, Input, Select, Checkbox
    └── Dùng lại được ở NHIỀU DỰ ÁN

TẦNG 0: Design Tokens (Bản vẽ thiết kế)
    └── Màu sắc, font chữ, khoảng cách
    └── Nền tảng cho TẤT CẢ
```

**Ví dụ thực tế:**
- **Design Tokens**: `primary-color: #3b82f6` (màu xanh chủ đạo)
- **Primitive**: `<Button>` dùng màu `primary-color`
- **Composed**: `<SearchInput>` = `<Input>` + `<Button>` + `<Dropdown>`
- **Feature**: `<LoginForm>` = `<Input email>` + `<Input password>` + `<Button submit>`

### 🇬🇧 Trả lời phỏng vấn

> **Q: How do you design reusable components across projects?**

```
"I organize components in layers:

Layer 0 - Design Tokens: Colors, spacing, typography as constants.
This ensures consistency and makes theming easy.

Layer 1 - Primitives: Basic building blocks like Button, Input.
These have no business logic, just styling and accessibility.

Layer 2 - Composed: Combinations like SearchInput or DataTable.
Reusable across features.

Layer 3 - Feature: Domain-specific like LoginForm.
Contains business logic for one feature.

This approach means primitives can be shared across projects,
while feature components stay project-specific."
```

---

## 1.2 Design Tokens

### 🇻🇳 Hiểu đơn giản

**Design Tokens** = Biến CSS có ý nghĩa, không phải màu cụ thể

**❌ Sai:**
```css
.button { background: #3b82f6; }  /* Hardcode màu */
.header { background: #3b82f6; }  /* Copy paste */
/* Muốn đổi màu? Sửa 100 chỗ! */
```

**✅ Đúng:**
```css
:root {
  --color-primary: #3b82f6;
  --color-error: #ef4444;
  --spacing-md: 16px;
}

.button { background: var(--color-primary); }
.header { background: var(--color-primary); }
/* Muốn đổi màu? Sửa 1 chỗ! */
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: What are Design Tokens?**

```
"Design tokens are the single source of truth for design values.
Instead of hardcoding colors like #3b82f6 everywhere, I define
tokens like 'color-primary' or 'spacing-md'.

Benefits:
- Change once, apply everywhere
- Easy theming (dark mode = just swap token values)
- Consistent across components
- Design and dev speak same language"
```

---

## 1.3 UI Libraries: MUI vs Antd vs Shadcn

### 🇻🇳 So sánh dễ hiểu

| | MUI | Ant Design | Shadcn/ui |
|---|-----|------------|-----------|
| **Kiểu** | Thư viện npm | Thư viện npm | Copy code vào dự án |
| **Styling** | Material Design | Ant Design | Tự customize 100% |
| **Kích thước** | Nặng (~300KB) | Rất nặng (~400KB) | Chỉ cái bạn dùng |
| **Customize** | Khó | Rất khó | Dễ (code của bạn) |
| **Khi nào dùng** | Cần nhanh, OK với Material look | Dự án enterprise TQ | Cần full control |

**Shadcn/ui là gì?**
- KHÔNG phải npm package
- Bạn copy component code vào project
- Code là CỦA BẠN, muốn sửa gì thì sửa
- Dùng Radix UI (headless) + Tailwind CSS

### 🇬🇧 Trả lời phỏng vấn

> **Q: MUI vs Antd vs Shadcn - which would you choose?**

```
"It depends on the project:

MUI: For tight deadlines and Material Design is acceptable.
Good docs, large community. But heavy and hard to customize.

Ant Design: For enterprise apps, especially with Chinese teams.
Comprehensive but very opinionated styling.

Shadcn/ui: My preference for new projects. It's not a dependency -
you copy components into your codebase. Built on Radix UI for
accessibility, styled with Tailwind. Full control, smaller bundle.

Trade-off: MUI/Antd are faster to start but harder to customize.
Shadcn takes more setup but gives complete flexibility."
```

---

## 1.4 Compound Components Pattern

### 🇻🇳 Hiểu đơn giản

**Vấn đề:** Component có quá nhiều props

```tsx
// ❌ XẤU: Prop soup - 15 props!
<Modal
  open={true}
  title="Xác nhận"
  showCloseButton={true}
  bodyContent="Bạn có chắc không?"
  primaryButtonText="Đồng ý"
  secondaryButtonText="Hủy"
  onPrimaryClick={handleOK}
  onSecondaryClick={handleCancel}
  // ... còn nhiều nữa
/>
```

**Giải pháp:** Chia thành các phần nhỏ (giống HTML `<select>` + `<option>`)

```tsx
// ✅ TỐT: Compound Components - linh hoạt, dễ đọc
<Modal open={true} onClose={handleClose}>
  <Modal.Header>
    <Modal.Title>Xác nhận</Modal.Title>
    <Modal.CloseButton />
  </Modal.Header>
  <Modal.Body>
    Bạn có chắc không?
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleCancel}>Hủy</Button>
    <Button onClick={handleOK}>Đồng ý</Button>
  </Modal.Footer>
</Modal>
```

**Tại sao tốt hơn?**
- Linh hoạt: Muốn thêm/bớt phần nào cũng được
- Dễ đọc: Nhìn là hiểu cấu trúc
- Không cần nhớ 15 props

### 🇬🇧 Trả lời phỏng vấn

> **Q: Explain Compound Components pattern**

```
"Compound components are a pattern where a parent component shares
implicit state with its children, like HTML's select and option.

Instead of passing 15 props to one Modal component, I split it into
Modal.Header, Modal.Body, Modal.Footer. The parent Modal provides
context, children consume it.

Benefits:
- Flexible composition - add/remove parts easily
- Readable JSX - structure is visible
- No prop drilling
- Familiar API like native HTML

I use this for Modal, Tabs, Accordion, Menu - any component with
multiple related parts."
```

---

## 1.5 Wrapper Components

### 🇻🇳 Hiểu đơn giản

**Vấn đề:** Import MUI Button khắp nơi, muốn đổi sang Shadcn = sửa 100 files

```tsx
// ❌ XẤU: Import thư viện trực tiếp khắp nơi
// File A, B, C... 100 files
import { Button } from '@mui/material';

// Muốn đổi từ MUI → Shadcn? Sửa TẤT CẢ!
```

**Giải pháp:** Tạo wrapper, tất cả import từ wrapper

```tsx
// ✅ TỐT: Tạo wrapper
// components/ui/Button.tsx
import { Button as MUIButton } from '@mui/material';

export function Button({ variant, ...props }) {
  return <MUIButton variant={variant === 'primary' ? 'contained' : 'outlined'} {...props} />;
}

// Tất cả files import từ wrapper
import { Button } from '@/components/ui/Button';

// Muốn đổi sang Shadcn? Chỉ sửa 1 file wrapper!
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: How do you manage third-party UI library dependencies?**

```
"I always wrap third-party components. Instead of importing MUI Button
directly everywhere, I create a Button wrapper in my components folder.

This provides:
- Single point of change: Switch libraries by modifying one file
- Consistent API: My API stays the same even if library changes
- Type safety: I define exactly which props are allowed

In a recent project, we migrated from MUI to Shadcn. Because we had
wrappers, it took days instead of weeks."
```

---

## 1.6 Storybook

### 🇻🇳 Hiểu đơn giản

**Storybook** = Playground để phát triển và document components

**Tại sao cần?**
1. **Develop isolated**: Làm Button mà không cần chạy cả app
2. **Document tự động**: TypeScript props → docs
3. **Test visual**: Xem tất cả variants (primary, secondary, disabled...)
4. **Share với team**: Designer review trực tiếp

```tsx
// Button.stories.tsx
export const Primary = {
  args: { variant: 'primary', children: 'Click me' }
};

export const Disabled = {
  args: { variant: 'primary', disabled: true, children: 'Click me' }
};
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: Do you use Storybook? Why?**

```
"Yes, Storybook is essential for component development.

Benefits:
1. Isolated development - build components without running full app
2. Living documentation - auto-generated from TypeScript props
3. Visual testing - see all states (loading, error, empty)
4. Team collaboration - designers review components directly

We deploy Storybook as a static site. New team members use it to
understand available components."
```

---

# PHẦN 2: INTEGRATION TESTING

---

## 🎯 Câu hỏi hay gặp

> "Giải thích cách bạn viết integration test cho components?"
> "Unit test khác gì integration test?"

---

## 2.1 Testing Pyramid

### 🇻🇳 Hiểu đơn giản

```
                 /\
                /  \        E2E Tests
               /    \       Ít, chậm, test toàn bộ flow
              /------\      VD: Login → Dashboard → Logout
             /        \
            / Integra- \    Integration Tests
           /   tion     \   Test component + API + context
          /--------------\  VD: Form submit → API call → show result
         /                \
        /    Unit Tests    \ Nhiều, nhanh, test 1 thứ
       /____________________\ VD: formatDate(), useDebounce()
```

| Loại | Test cái gì | Tốc độ | Công cụ |
|------|-------------|--------|---------|
| **Unit** | 1 function riêng lẻ | Rất nhanh (ms) | Jest/Vitest |
| **Integration** | Component + dependencies | Nhanh (100ms-1s) | RTL + MSW |
| **E2E** | Toàn bộ user flow | Chậm (giây) | Playwright |

### 🇬🇧 Trả lời phỏng vấn

> **Q: What's the difference between unit and integration tests?**

```
"Unit tests verify a single unit in isolation - one function or hook.
Everything else is mocked. They're fast and catch logic bugs.

Integration tests verify multiple units working together. For example,
testing a form that renders, validates, calls API, and shows results.
I mock only external boundaries like APIs, not internal components.

I prefer the Testing Trophy approach: mostly integration tests for
components because they give more confidence that things work together.
Unit tests for complex logic. Few E2E tests for critical user journeys."
```

---

## 2.2 Testing Library Philosophy

### 🇻🇳 Hiểu đơn giản

**Nguyên tắc:** "Test như user thật sự dùng"

**❌ Sai:** Test implementation (state, method names)
```tsx
// Đừng làm thế này!
expect(component.state.isLoading).toBe(true);
expect(wrapper.find('.btn-class')).toHaveLength(1);
```

**✅ Đúng:** Test behavior (user thấy gì, làm gì)
```tsx
// Test như user thật
expect(screen.getByText('Loading...')).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
```

**Query ưu tiên (từ tốt nhất → cuối cùng):**

| Ưu tiên | Query | Khi nào dùng |
|---------|-------|--------------|
| 1️⃣ | `getByRole` | Button, link, textbox... |
| 2️⃣ | `getByLabelText` | Form inputs có label |
| 3️⃣ | `getByText` | Text hiển thị |
| 4️⃣ | `getByTestId` | Chỉ khi không còn cách nào |

### 🇬🇧 Trả lời phỏng vấn

> **Q: When do you use getByRole vs getByTestId?**

```
"I follow Testing Library's query priority:

1. getByRole - First choice. Tests accessibility automatically.
   Example: getByRole('button', { name: 'Submit' })

2. getByLabelText - For form inputs with labels

3. getByText - For displayed text

4. getByTestId - Last resort only when no semantic query works

Using getByRole ensures components are accessible. If I can't find
an element by role, it often means accessibility is broken.

data-testid is invisible to users, so tests using it don't verify
actual usability."
```

---

## 2.3 Test Component có API Call

### 🇻🇳 Hiểu đơn giản

**Vấn đề:** Component gọi API, làm sao test?

**Giải pháp:** Dùng **MSW (Mock Service Worker)** - giả lập API ở tầng network

```tsx
// 1. Setup MSW - định nghĩa API giả
const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: '1', name: 'John' }]));
  })
);

// 2. Test loading → success
it('hiển thị danh sách user sau khi load', async () => {
  render(<UserList />);

  // Ban đầu thấy loading
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Đợi data hiện ra
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});

// 3. Test error case
it('hiển thị lỗi khi API fail', async () => {
  // Override handler cho test này
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('Error');
  });
});
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: How do you test components with API calls?**

```
"I use MSW - Mock Service Worker - to intercept requests at the
network level. This is better than mocking fetch directly because:

1. More realistic - actual fetch calls are made
2. Same mocks work in tests AND browser for development
3. No need to modify component code

I define handlers for success cases, then override them in specific
tests for error scenarios.

This approach tests actual data fetching behavior, not just that
a mock function was called."
```

---

## 2.4 Test Form với Validation

### 🇻🇳 Ví dụ đầy đủ

```tsx
// LoginForm.test.tsx
describe('LoginForm', () => {
  it('hiển thị lỗi khi submit form rỗng', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={jest.fn()} />);

    // Submit form rỗng
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    // Kiểm tra error message
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('validate password ít nhất 8 ký tự', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={jest.fn()} />);

    await user.type(screen.getByLabelText('Email'), 'test@email.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText('Password must be at least 8 characters'))
      .toBeInTheDocument();
  });

  it('gọi onSuccess khi login thành công', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();

    server.use(
      rest.post('/api/login', (req, res, ctx) => {
        return res(ctx.json({ id: '1', name: 'John' }));
      })
    );

    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText('Email'), 'test@email.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

---

## 2.5 Test Custom Hooks

### 🇻🇳 Ví dụ với useDebounce

```tsx
// useDebounce.test.ts
describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('trả về giá trị ban đầu ngay lập tức', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('debounce giá trị sau delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hello' } }
    );

    // Đổi giá trị
    rerender({ value: 'world' });

    // Chưa đủ thời gian → vẫn là giá trị cũ
    expect(result.current).toBe('hello');

    // Chờ đủ 500ms
    act(() => jest.advanceTimersByTime(500));

    // Bây giờ mới đổi
    expect(result.current).toBe('world');
  });
});
```

---

# PHẦN 3: THIẾT KẾ COMPONENT

---

## 3.1 Design Modal System

### 🎯 Yêu cầu cần hỏi interviewer

```
Functional:
□ Mở/đóng modal
□ Các size: sm, md, lg, fullscreen?
□ Click backdrop để đóng?
□ Nhấn Escape để đóng?

Non-functional:
□ Accessible (WCAG AA)
□ Focus trap (Tab không ra ngoài modal)
□ Animation
```

### 🇻🇳 Các điểm quan trọng

**1. Accessibility:**
- `role="dialog"` và `aria-modal="true"`
- `aria-labelledby` trỏ đến title
- Focus trap: Tab chỉ di chuyển trong modal
- Escape key để đóng
- Restore focus khi đóng

**2. Portal rendering:**
- Dùng `createPortal` để render ở `document.body`
- Tránh z-index issues

**3. Body scroll lock:**
- Khi modal mở: `overflow: hidden`

### 🇬🇧 Trả lời phỏng vấn

> **Q: How would you design a Modal component?**

```
"For a Modal system, I'd use compound components for flexibility.

Key accessibility requirements:
- role='dialog' and aria-modal='true'
- Focus trap using Tab key interception
- Close on Escape key
- Restore focus to trigger element when closing

I'd render using createPortal to avoid z-index issues.
Lock body scroll when modal is open.

The compound pattern with Modal.Header, Modal.Body, Modal.Footer
gives flexibility while maintaining consistency."
```

---

## 3.2 Design Autocomplete

### 🎯 Yêu cầu cần hỏi interviewer

```
Functional:
□ Fetch suggestions khi user gõ
□ Debounce input (300ms?)
□ Keyboard navigation (up/down/enter/escape)
□ Loading state, No results state

Non-functional:
□ Cancel pending requests khi có input mới
□ Accessible (combobox pattern)
```

### 🇻🇳 Các điểm quan trọng

**1. Debounce:** Đợi user ngừng gõ 300ms rồi mới gọi API

**2. Race condition:**
- Gõ "ab" → request 1
- Gõ "abc" → request 2
- Request 1 trả về sau request 2 → sai!
- **Giải pháp:** Cancel request cũ

**3. Keyboard:**
- Arrow Down/Up: Di chuyển
- Enter: Chọn
- Escape: Đóng

**4. Accessibility:**
- Input: `role="combobox"`
- List: `role="listbox"`
- Items: `role="option"`

### 🇬🇧 Trả lời phỏng vấn

> **Q: How would you design an Autocomplete component?**

```
"Key challenges are debouncing, race conditions, and accessibility.

Debouncing: Wait 300ms after user stops typing before calling API.

Race conditions: Cancel pending requests when new input arrives
to prevent stale data from appearing.

Keyboard Navigation: Arrow keys to navigate, Enter to select,
Escape to close.

Accessibility: Use the combobox ARIA pattern - input has role='combobox',
results list has role='listbox', each result has role='option'."
```

---

## 3.3 Design DataTable

### 🎯 Yêu cầu cần hỏi interviewer

```
Functional:
□ Sorting
□ Pagination (hoặc infinite scroll?)
□ Row selection
□ Custom cell rendering

Non-functional:
□ Handle 1000+ rows
□ Accessible table markup
□ Responsive
```

### 🇻🇳 Server-side vs Client-side

| | Server-side | Client-side |
|--|-------------|-------------|
| **Data** | Fetch theo page | Load toàn bộ |
| **Khi nào** | > 1000 rows | < 1000 rows |
| **Sort/Filter** | API xử lý | Frontend xử lý |

### 🇬🇧 Trả lời phỏng vấn

> **Q: How would you design a DataTable component?**

```
"I'd separate the table component from data management.

Table Component: Handles rendering, accessibility, user interactions.
Receives data, column definitions, and callbacks.

Data Management: Can be server-side or client-side:
- Server-side: Parent manages state, fetches on changes. For large data.
- Client-side: A hook handles sorting/filtering in memory. For small data.

Accessibility: Proper table semantics with scope attributes,
aria-sort on sortable columns."
```

---

# PHẦN 4: NEXT.JS 14

---

## 4.1 App Router vs Pages Router

### 🇻🇳 So sánh đơn giản

| | App Router (Mới) | Pages Router (Cũ) |
|--|------------------|-------------------|
| **Folder** | `app/` | `pages/` |
| **Mặc định** | Server Component | Client Component |
| **Layout** | Nested, giữ state | Mỗi page riêng |
| **Loading** | `loading.tsx` tự động | Tự làm |

---

## 4.2 Server vs Client Components

### 🇻🇳 Hiểu đơn giản

**Server Component (mặc định):**
```tsx
// KHÔNG có 'use client'
async function ProductList() {
  const products = await db.products.findMany(); // Query DB trực tiếp!
  return <ul>{products.map(p => <li>{p.name}</li>)}</ul>;
}
```
- ✅ Có thể: async/await, query DB
- ❌ Không thể: useState, onClick

**Client Component:**
```tsx
'use client';  // BẮT BUỘC có dòng này

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```
- ✅ Có thể: hooks, events
- ❌ Không thể: async component

### 🇬🇧 Trả lời phỏng vấn

> **Q: When do you use Server vs Client Components?**

```
"Server Components for:
- Data fetching
- Accessing backend resources
- Keeping sensitive data on server

Client Components for:
- Interactivity - onClick, onChange
- Hooks - useState, useEffect
- Browser APIs - localStorage

My approach: Start with Server Components, add 'use client' only
when I need interactivity."
```

---

## 4.3 Data Fetching

### 🇻🇳 Các pattern chính

```tsx
// 1. Cached (mặc định) - dữ liệu tĩnh
const data = await fetch('/api/posts');

// 2. Revalidate - cập nhật định kỳ
const data = await fetch('/api/posts', {
  next: { revalidate: 3600 }  // Mỗi 1 tiếng
});

// 3. Dynamic - luôn fresh
const data = await fetch('/api/posts', {
  cache: 'no-store'
});

// 4. Parallel - fetch nhiều thứ cùng lúc
const [users, orders] = await Promise.all([
  getUsers(),
  getOrders()
]);
```

---

## 4.4 Server Actions

### 🇻🇳 Hiểu đơn giản

```tsx
// actions.ts
'use server';

export async function createPost(formData: FormData) {
  await db.posts.create({ data: { title: formData.get('title') } });
  revalidatePath('/posts');
}

// page.tsx
export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Hay ở chỗ:** Không cần API route riêng, form hoạt động cả khi JS disabled

---

# PHẦN 5: ACCESSIBILITY (WCAG AA)

---

## 5.1 Các yêu cầu chính

### 🇻🇳 Tóm tắt

**1. Color Contrast:**
- Text thường: 4.5:1
- Text lớn (18px+): 3:1

**2. Keyboard:**
- Tất cả interactive có thể focus
- Tab order hợp lý
- Focus indicator rõ ràng

**3. Forms:**
- Label liên kết với input
- Error message rõ ràng

**4. ARIA quan trọng:**
```tsx
// Modal
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Title</h2>
</div>

// Alert
<div role="alert">Saved!</div>
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: How do you ensure WCAG AA compliance?**

```
"Key requirements I focus on:

Color Contrast: 4.5:1 for normal text. Use dev tools to verify.

Keyboard Navigation: All interactive elements focusable with
visible focus indicators.

Forms: Labels linked to inputs, error messages with aria-describedby.

Testing: axe-core in CI, manual keyboard testing, VoiceOver."
```

---

# PHẦN 6: NX & gRPC

---

## 6.1 Nx Monorepo

### 🇻🇳 Hiểu đơn giản

```
my-workspace/
├── apps/
│   ├── web/           # App chính
│   └── admin/         # App admin
└── libs/
    └── shared/ui/     # Components dùng chung
```

**Lợi ích:**
- Task caching: Build lần 2 = instant
- Affected: Chỉ test cái bị ảnh hưởng

---

## 6.2 gRPC-Web

### 🇻🇳 So sánh với REST

| | REST | gRPC |
|--|------|------|
| **Format** | JSON | Binary |
| **Kích thước** | Lớn | Nhỏ hơn |
| **Type safety** | Manual | Tự động |

**gRPC-Web** = gRPC cho browser (qua proxy)

---

# PHẦN 7: QUICK Q&A

---

## Event Loop

```
JavaScript = single-threaded

Thứ tự: Call Stack → Microtasks (Promises) → Macrotasks (setTimeout)
```

```js
console.log('1');                    // Sync
setTimeout(() => console.log('2'));  // Macrotask
Promise.resolve().then(() => console.log('3')); // Microtask
console.log('4');                    // Sync

// Output: 1, 4, 3, 2
```

---

## Closure

```js
function createCounter() {
  let count = 0;  // Biến private
  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
counter(); // 1
counter(); // 2
// count không access được từ ngoài
```

**Dùng để:** Data privacy, callbacks giữ context

---

## Web Vitals

| Metric | Đo gì | Tốt |
|--------|-------|-----|
| **LCP** | Load content lớn nhất | < 2.5s |
| **FID** | Phản hồi click đầu tiên | < 100ms |
| **CLS** | Độ nhảy layout | < 0.1 |

---

# CHECKLIST

## Day 4
- [ ] Hiểu Component Layers
- [ ] Phân biệt MUI vs Antd vs Shadcn
- [ ] Giải thích Compound Components
- [ ] Viết integration test với RTL + MSW
- [ ] Biết query priorities (getByRole first)
- [ ] Design Modal với accessibility
- [ ] Design Autocomplete với debounce
- [ ] Design DataTable với sort/pagination
- [ ] Hiểu Server vs Client Components

## Day 5
- [ ] Design Multi-step Form
- [ ] Design Real-time Dashboard
- [ ] Biết WCAG AA requirements
- [ ] Hiểu Nx workspace
- [ ] Biết gRPC basics
- [ ] Trả lời Event Loop, Closure, Web Vitals

---

**Good luck! 💪**
