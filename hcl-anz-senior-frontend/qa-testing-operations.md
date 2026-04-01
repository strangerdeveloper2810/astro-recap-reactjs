# 🧪 Testing & Operations — Bilingual Interview Q&A

> **Dành cho:** Senior Frontend Engineer Interview (ANZ Bank)
> **Format:** Bilingual Vietnamese 🇻🇳 + English 🇬🇧
> **Số câu hỏi:** 15 câu (Testing: 8 + Operations: 7)

---

# PART A: Testing (T-01 to T-08)

---

## T-01: Testing Trophy / Testing Strategy

**Q:** *"Can you explain the Testing Trophy concept and how you decide on a testing strategy for a large frontend application?"*

🇻🇳 **Giải thích chi tiết:**

Testing Trophy là mô hình do Kent C. Dodds đề xuất, khác với Testing Pyramid truyền thống của Mike Cohn. Trong Testing Trophy, các lớp từ dưới lên là: Static Analysis (ESLint, TypeScript), Unit Tests, Integration Tests (lớp dày nhất), và E2E Tests. Điểm khác biệt lớn nhất so với Pyramid là Integration Tests chiếm tỷ trọng lớn nhất thay vì Unit Tests, vì integration tests mang lại ROI (Return on Investment) cao nhất -- chúng test được cách các component tương tác với nhau giống như user thực sự sử dụng. Unit tests vẫn quan trọng cho pure logic (utils, hooks), nhưng nếu chỉ viết unit tests thì bạn có thể miss nhiều bug xảy ra ở lớp integration. Static analysis là lớp rẻ nhất vì nó bắt lỗi ngay khi bạn đang code (TypeScript bắt type errors, ESLint bắt code smells). E2E tests ở đỉnh trophy thì expensive nhất về thời gian và maintenance, nên chỉ nên viết cho critical user flows như login, checkout, payment. Trong dự án lớn tại ANZ, chiến lược hợp lý là: TypeScript strict mode + ESLint cho static layer, Jest + RTL cho integration tests (chiếm 60-70% effort), unit tests cho utilities và complex logic, và Playwright cho 10-15 critical E2E scenarios.

🇬🇧 **Sample Answer:**

> *"The Testing Trophy, popularized by Kent C. Dodds, is a modern testing strategy that differs from the traditional Testing Pyramid by emphasizing integration tests as the highest-ROI layer. The trophy has four layers from bottom to top: Static Analysis, Unit Tests, Integration Tests, and End-to-End Tests. Static analysis through TypeScript and ESLint catches bugs at virtually zero cost during development -- type errors, unused variables, and potential null references. Unit tests are great for pure functions, utility helpers, and complex algorithmic logic, but they test components in isolation and can miss interaction bugs. Integration tests sit at the widest part of the trophy because they give us the most confidence per test dollar -- they test how multiple components work together, how data flows through the system, and how users actually interact with features. For a large application at ANZ, I would allocate roughly 60-70% of testing effort on integration tests using React Testing Library, 15-20% on unit tests for business logic and utilities, and 10-15% on E2E tests for critical paths like authentication, transaction flows, and account management. E2E tests with Playwright are the most expensive to write and maintain, so we reserve them for smoke tests and critical user journeys. The key insight is that integration tests give you nearly the same confidence as E2E tests at a fraction of the cost and flakiness."*

```
Testing Pyramid (Traditional)        Testing Trophy (Modern)

       /\    E2E                         ___    E2E
      /  \                              / _ \
     /----\  Integration               | |_| |  Integration (WIDEST)
    /      \                            |     |
   /--------\ Unit                      |_____|  Unit
  /          \                           |   |
 /____________\ Manual                   |___|   Static (TypeScript + ESLint)

Cost vs Confidence:
+---------------+------------+--------------+-----------+
| Layer         | Speed      | Confidence   | Cost      |
+---------------+------------+--------------+-----------+
| Static        | Instant    | Medium       | Very Low  |
| Unit          | Very Fast  | Low-Medium   | Low       |
| Integration   | Fast       | HIGH         | Medium    |
| E2E           | Slow       | Very High    | High      |
+---------------+------------+--------------+-----------+
```

---

## T-02: React Testing Library Philosophy

**Q:** *"Why does React Testing Library encourage testing user behavior rather than implementation details? How do you prioritize queries?"*

🇻🇳 **Giải thích chi tiết:**

React Testing Library (RTL) được xây dựng trên triết lý "The more your tests resemble the way your software is used, the more confidence they can give you." Điều này có nghĩa là thay vì test internal state, test xem setState được gọi bao nhiêu lần, hay test class names, chúng ta nên test những gì user thực sự thấy và tương tác. Ví dụ, thay vì check `component.state.isOpen === true`, chúng ta nên check xem dropdown có hiển thị hay không bằng cách tìm text content. RTL cung cấp một thứ tự ưu tiên cho queries: đầu tiên là getByRole (accessible nhất, giống như screen reader đọc), rồi getByLabelText (cho form inputs), getByPlaceholderText, getByText, getByDisplayValue, và cuối cùng mới là getByTestId (chỉ dùng khi không có cách nào khác). Lý do getByRole được ưu tiên nhất vì nó đảm bảo component của bạn accessible -- nếu bạn không tìm được button bằng role, có thể button của bạn không accessible cho người dùng screen reader. getByTestId là last resort vì nó không phản ánh cách user tương tác, nó chỉ là implementation detail mà developer thêm vào. Khi bạn test theo behavior, việc refactor code không làm break tests -- bạn có thể đổi từ class component sang function component, đổi state management, mà tests vẫn pass vì user experience không đổi.

🇬🇧 **Sample Answer:**

> *"React Testing Library was designed around the guiding principle that tests should resemble how users actually interact with your application. This means we avoid testing implementation details like internal state, lifecycle methods, or component instance properties, and instead focus on what the user sees and does. The query priority system in RTL is deliberately ordered by accessibility: getByRole is the top priority because it queries elements the way assistive technologies do -- if you cannot find your button by its role, it is likely not accessible to screen reader users either. Next comes getByLabelText for form elements, which ensures proper label associations, followed by getByPlaceholderText and getByText for visible content. getByTestId is intentionally last because it represents a testing implementation detail that real users never see or interact with. This approach provides two major benefits: first, your tests become resilient to refactoring -- you can completely rewrite a component's internals without breaking tests as long as the user experience remains the same. Second, your tests naturally enforce accessibility best practices by requiring proper ARIA roles and labels. For example, instead of checking expect(component.state.isModalOpen).toBe(true), we write expect(screen.getByRole('dialog')).toBeInTheDocument(), which tests both the behavior and the accessibility simultaneously. Combined with userEvent over fireEvent for realistic interaction simulation, RTL gives us thorough, maintainable, and meaningful tests."*

```typescript
// BAD -- Testing implementation details
import { render } from '@testing-library/react';

test('bad: tests implementation details', () => {
  const { container } = render(<UserProfile userId="123" />);
  // Brittle: depends on CSS class names
  expect(container.querySelector('.user-card--active')).toBeTruthy();
});

// GOOD -- Testing user behavior
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('displays user profile after loading', async () => {
  render(<UserProfile userId="123" />);

  // User sees a loading state
  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  // User sees the profile after loading
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /jane doe/i })).toBeInTheDocument();
  });
  expect(screen.getByText(/senior frontend engineer/i)).toBeInTheDocument();
});

test('allows user to edit their bio', async () => {
  const user = userEvent.setup();
  render(<UserProfile userId="123" editable />);

  await screen.findByRole('heading', { name: /jane doe/i });

  // User clicks edit button
  await user.click(screen.getByRole('button', { name: /edit profile/i }));

  // User types in the bio field
  const bioInput = screen.getByRole('textbox', { name: /bio/i });
  await user.clear(bioInput);
  await user.type(bioInput, 'Loves building accessible UIs');

  // User saves changes
  await user.click(screen.getByRole('button', { name: /save/i }));

  // User sees success message
  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/profile updated/i);
  });
});

// Query Priority (best to worst):
// 1. getByRole      -- screen.getByRole('button', { name: /submit/i })
// 2. getByLabelText -- screen.getByLabelText(/email address/i)
// 3. getByPlaceholderText -- screen.getByPlaceholderText(/search/i)
// 4. getByText      -- screen.getByText(/welcome back/i)
// 5. getByDisplayValue -- screen.getByDisplayValue(/john/i)
// 6. getByTestId    -- screen.getByTestId('complex-widget') // LAST RESORT
```

---

## T-03: MSW (Mock Service Worker) for API Mocking

**Q:** *"How does Mock Service Worker (MSW) work and why is it superior to mocking axios or fetch directly?"*

🇻🇳 **Giải thích chi tiết:**

MSW (Mock Service Worker) hoạt động bằng cách intercept network requests ở tầng Service Worker trong browser hoặc bằng request interception trong Node.js (cho testing). Điều này có nghĩa là code của bạn vẫn gọi fetch() hoặc axios.get() bình thường, và MSW bắt những requests này trước khi chúng ra khỏi ứng dụng, rồi trả về mock response. Đây là điểm khác biệt quan trọng so với cách mock truyền thống như `jest.mock('axios')` -- khi mock axios trực tiếp, bạn thay đổi implementation detail của code, và nếu mai một bạn chuyển từ axios sang fetch thì tất cả mocks đều bị break. Với MSW, bạn mock ở network level, nên bất kể bạn dùng HTTP client nào (axios, fetch, ky, got), mocks vẫn hoạt động. MSW cũng hỗ trợ REST và GraphQL handlers, cho phép bạn định nghĩa response cho từng endpoint cụ thể. Một lợi ích lớn khác là bạn có thể dùng cùng MSW handlers cho cả testing, development (Storybook), và debugging -- tạo ra một "single source of truth" cho mock data. Trong testing, MSW chạy trong Node.js environment bằng `setupServer()`, còn trong browser (Storybook, dev) thì dùng Service Worker thực sự. Điều này giúp tests của bạn realistic hơn vì request/response cycle vẫn đi qua đầy đủ các layers của application (middleware, interceptors, error handling).

🇬🇧 **Sample Answer:**

> *"Mock Service Worker works by intercepting HTTP requests at the network level rather than replacing the HTTP client implementation. In the browser, it uses an actual Service Worker to intercept requests before they leave the application, while in Node.js testing environments, it patches the native http/https modules. This is fundamentally superior to mocking axios or fetch directly because your application code remains completely unchanged -- it still calls fetch or axios normally, and MSW intercepts those calls transparently. If you mock axios with jest.mock, you are coupling your tests to an implementation detail; switching from axios to fetch would break every single test. With MSW, your mocks are implementation-agnostic and work regardless of which HTTP client your code uses. MSW supports both REST and GraphQL APIs through dedicated handler types -- http.get, http.post for REST, and graphql.query, graphql.mutation for GraphQL. The handlers are composable and can be overridden per test for error scenarios or edge cases. Another significant advantage is reusability: the same handlers can power your tests, your Storybook stories, and your local development environment, ensuring consistent mock data across all contexts. MSW also preserves the full request/response lifecycle, meaning your error handling, request interceptors, retry logic, and loading states all get properly tested. In CI environments, MSW is completely deterministic since no actual network calls are made, eliminating flaky tests caused by network issues."*

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: string;
}

export const handlers = [
  // GET user profile
  http.get('/api/users/:userId', ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      id: userId,
      name: 'Jane Doe',
      email: 'jane@anz.com',
      role: 'admin',
    });
  }),

  // GET accounts list
  http.get('/api/accounts', ({ request }) => {
    const url = new URL(request.url);
    const currency = url.searchParams.get('currency');

    const accounts: Account[] = [
      { id: 'acc-1', name: 'Savings', balance: 15000, currency: 'AUD', type: 'savings' },
      { id: 'acc-2', name: 'Everyday', balance: 5200, currency: 'AUD', type: 'everyday' },
      { id: 'acc-3', name: 'NZ Savings', balance: 8900, currency: 'NZD', type: 'savings' },
    ];

    const filtered = currency
      ? accounts.filter((a) => a.currency === currency)
      : accounts;

    return HttpResponse.json({ accounts: filtered });
  }),

  // POST transfer funds
  http.post('/api/transfers', async ({ request }) => {
    const body = (await request.json()) as {
      fromAccount: string;
      toAccount: string;
      amount: number;
    };

    if (body.amount > 50000) {
      return HttpResponse.json(
        { error: 'Transfer limit exceeded. Maximum $50,000 per transaction.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      transferId: 'txn-' + Date.now(),
      status: 'completed',
      ...body,
    });
  }),
];

// src/mocks/server.ts (for tests -- Node.js)
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/mocks/browser.ts (for Storybook/dev -- same handlers!)
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// src/setupTests.ts (Jest setup)
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// src/components/AccountList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AccountList } from './AccountList';

test('displays list of accounts after loading', async () => {
  render(<AccountList />);

  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('$15,000.00')).toBeInTheDocument();
  });
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
});

test('handles server error gracefully', async () => {
  // Override handler for this specific test
  server.use(
    http.get('/api/accounts', () => {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    })
  );

  render(<AccountList />);

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load accounts/i);
  });
  expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
});

test('filters accounts by currency', async () => {
  const user = userEvent.setup();
  render(<AccountList />);

  await screen.findByText('$15,000.00');

  await user.selectOptions(
    screen.getByRole('combobox', { name: /currency/i }),
    'NZD'
  );

  await waitFor(() => {
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('$8,900.00')).toBeInTheDocument();
  });
});
```

---

## T-04: Testing Custom Hooks

**Q:** *"How do you test custom React hooks? When would you test them in isolation versus through a component?"*

🇻🇳 **Giải thích chi tiết:**

Testing custom hooks trong React có 2 cách chính: dùng `renderHook` từ `@testing-library/react` để test hook độc lập, hoặc test hook thông qua một component thật sự sử dụng nó. `renderHook` phù hợp khi hook có logic phức tạp cần được test kỹ lưỡng với nhiều edge cases -- ví dụ như useDebounce, usePagination, useLocalStorage. Khi dùng renderHook, bạn truyền hook vào như một callback và nhận lại kết quả (result.current). Đối với async hooks (như hooks gọi API), bạn cần wrap state updates trong `act()` hoặc dùng `waitFor` để đợi kết quả. Tuy nhiên, Kent C. Dodds khuyến cáo nên test hooks thông qua component khi có thể, vì điều này giúp test realistic hơn -- hook được test trong context thực sự của nó. Ví dụ, nếu bạn có useForm hook, thay vì test nó isolated, bạn có thể render FormComponent và test form validation thông qua user interactions. Một trường hợp đặc biệt là hooks phụ thuộc vào Context providers -- bạn cần wrap renderHook với wrapper option chứa Provider. Đối với hooks có side effects phức tạp như timers, bạn cần dùng jest.useFakeTimers() để control thời gian. Quy tắc chung là: hooks đơn giản và được dùng bởi nhiều components thì test isolated, hooks gắn chặt với một component cụ thể thì test thông qua component đó.

🇬🇧 **Sample Answer:**

> *"There are two primary approaches to testing custom hooks: isolated testing with renderHook from React Testing Library, and integration testing through a consuming component. I use renderHook for hooks with complex internal logic that warrants thorough edge-case testing -- things like useDebounce, useInfiniteScroll, usePagination, or useLocalStorage. The renderHook utility lets you invoke the hook in a test environment and access its return values through result.current, and you can trigger re-renders with the rerender function. For hooks involving asynchronous operations, I use waitFor or waitForNextUpdate to handle state transitions, and wrap synchronous state updates in act() to avoid React warnings. However, following Kent C. Dodds' recommendation, I prefer testing hooks through actual components when the hook is tightly coupled to a specific UI behavior -- this gives us more confidence because the hook is tested in its real usage context. For hooks that depend on React Context, you must provide a wrapper option to renderHook that includes the necessary Provider components. When hooks use timers like setTimeout or setInterval, I use jest.useFakeTimers() to control time progression deterministically. My general rule is: shared utility hooks get isolated tests with comprehensive edge cases, while feature-specific hooks get tested through the component that uses them. For the useDebounce example, isolated testing makes perfect sense because it is a reusable utility with subtle timing behavior that needs precise verification."*

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

// src/hooks/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('returns initial value immediately', () => {
  const { result } = renderHook(() => useDebounce('hello', 500));
  expect(result.current).toBe('hello');
});

test('debounces value changes', () => {
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'hello', delay: 500 } }
  );

  // Update the value
  rerender({ value: 'hello world', delay: 500 });

  // Value should NOT have updated yet
  expect(result.current).toBe('hello');

  // Fast forward 300ms -- still not updated
  act(() => { jest.advanceTimersByTime(300); });
  expect(result.current).toBe('hello');

  // Fast forward remaining 200ms -- now it should update
  act(() => { jest.advanceTimersByTime(200); });
  expect(result.current).toBe('hello world');
});

test('resets timer on rapid value changes', () => {
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'a', delay: 500 } }
  );

  // Rapidly change values
  rerender({ value: 'ab', delay: 500 });
  act(() => { jest.advanceTimersByTime(200); });

  rerender({ value: 'abc', delay: 500 });
  act(() => { jest.advanceTimersByTime(200); });

  rerender({ value: 'abcd', delay: 500 });

  // None of the intermediate values should appear
  expect(result.current).toBe('a');

  // After full delay from last change, final value appears
  act(() => { jest.advanceTimersByTime(500); });
  expect(result.current).toBe('abcd');
});

test('handles delay changes', () => {
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'hello', delay: 500 } }
  );

  rerender({ value: 'world', delay: 1000 });

  act(() => { jest.advanceTimersByTime(500); });
  expect(result.current).toBe('hello'); // Still old value

  act(() => { jest.advanceTimersByTime(500); });
  expect(result.current).toBe('world'); // Now updated with new delay
});

// Testing hook through a component (integration approach)
// src/components/SearchBar.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar'; // Uses useDebounce internally

test('debounces search input before making API call', async () => {
  const onSearch = jest.fn();
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  render(<SearchBar onSearch={onSearch} debounceMs={300} />);

  const input = screen.getByRole('searchbox', { name: /search/i });
  await user.type(input, 'react testing');

  // onSearch should NOT be called during typing
  expect(onSearch).not.toHaveBeenCalled();

  // After debounce delay, onSearch fires with final value
  act(() => { jest.advanceTimersByTime(300); });
  expect(onSearch).toHaveBeenCalledTimes(1);
  expect(onSearch).toHaveBeenCalledWith('react testing');
});
```

---

## T-05: E2E Testing with Playwright

**Q:** *"Why would you choose Playwright over Cypress for E2E testing, and how do you structure E2E tests in a large project?"*

🇻🇳 **Giải thích chi tiết:**

Playwright là framework E2E testing của Microsoft, có nhiều ưu điểm so với Cypress. Thứ nhất, Playwright hỗ trợ multi-browser thực sự (Chromium, Firefox, WebKit) trong khi Cypress chỉ mới hỗ trợ Chromium-based browsers tốt. Thứ hai, Playwright có auto-waiting thông minh -- khi bạn gọi `page.click('button')`, nó tự động đợi button visible, enabled, và stable trước khi click, giảm thiểu flaky tests đáng kể. Thứ ba, Playwright chạy ngoài browser (out-of-process) nên có thể tương tác với nhiều tabs, nhiều browser contexts, và thực hiện network interception mạnh hơn. Playwright cũng hỗ trợ parallel execution built-in, mỗi test chạy trong một isolated browser context nên không bị ảnh hưởng lẫn nhau. Page Object Model (POM) là pattern quan trọng khi tổ chức E2E tests trong dự án lớn -- bạn tạo các class đại diện cho từng page/section, encapsulate selectors và actions, giúp tests dễ đọc và dễ maintain. Playwright Fixtures là cơ chế dependency injection mạnh mẽ cho phép bạn setup/teardown test data, authentication state, và shared resources. Trong CI, Playwright chạy headless mặc định và có thể generate HTML reports, trace files để debug failed tests. Một tính năng rất hay là `codegen` -- Playwright có thể record actions của bạn trên browser và generate test code tự động.

🇬🇧 **Sample Answer:**

> *"I would choose Playwright over Cypress for several compelling technical reasons. First, Playwright provides true multi-browser support -- it can test against Chromium, Firefox, and WebKit (Safari's engine) with a single test suite, which is critical for a banking application like ANZ where customers use diverse browsers. Second, Playwright's auto-waiting mechanism is significantly more sophisticated; every action automatically waits for elements to be visible, enabled, and stable before interacting, which dramatically reduces test flakiness without explicit wait statements. Third, Playwright runs outside the browser process, enabling capabilities impossible in Cypress like multi-tab testing, cross-origin navigation, and native browser context isolation. For structuring E2E tests in a large project, I follow the Page Object Model pattern where each page or significant UI section has a corresponding class that encapsulates selectors and user actions. Playwright's fixture system provides elegant dependency injection for test setup -- you can create custom fixtures for authenticated sessions, test data seeding, and shared resources that automatically clean up after tests. I organize tests by user journey rather than by page, grouping related flows like 'account-management.spec.ts' and 'funds-transfer.spec.ts'. In CI, I run tests in parallel across multiple workers with sharding for large test suites, and generate HTML reports with trace files that capture screenshots, network logs, and DOM snapshots for debugging failures. The authentication state is saved and reused across tests using storageState, avoiding redundant login flows. Playwright's built-in codegen tool also accelerates test authoring by recording browser interactions and generating test code automatically."*

```typescript
// e2e/pages/LoginPage.ts -- Page Object Model
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

// e2e/pages/DashboardPage.ts
import { type Page, type Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeHeading: Locator;
  readonly accountsList: Locator;
  readonly transferButton: Locator;
  readonly totalBalance: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeHeading = page.getByRole('heading', { name: /welcome/i });
    this.accountsList = page.getByRole('list', { name: /accounts/i });
    this.transferButton = page.getByRole('button', { name: /transfer funds/i });
    this.totalBalance = page.getByTestId('total-balance');
  }

  async getAccountCount(): Promise<number> {
    return await this.accountsList.getByRole('listitem').count();
  }
}

// e2e/fixtures.ts -- Custom fixtures with dependency injection
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test@anz.com', 'securePassword123');
    await page.waitForURL('/dashboard');
    const dashboard = new DashboardPage(page);
    await use(dashboard);
  },
});

export { expect } from '@playwright/test';

// e2e/tests/account-management.spec.ts
import { test, expect } from '../fixtures';

test.describe('Account Management', () => {
  test('user can login and view accounts', async ({ loginPage, dashboardPage }) => {
    await loginPage.goto();
    await loginPage.login('jane@anz.com', 'password123');

    await expect(dashboardPage.welcomeHeading).toContainText('Jane');
    const accountCount = await dashboardPage.getAccountCount();
    expect(accountCount).toBeGreaterThan(0);
  });

  test('displays total balance across all accounts', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.totalBalance).toBeVisible();
    await expect(authenticatedPage.totalBalance).toContainText('$');
  });

  test('navigates to transfer page', async ({ authenticatedPage }) => {
    await authenticatedPage.transferButton.click();
    await expect(authenticatedPage.page).toHaveURL(/\/transfer/);
  });
});

// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## T-06: Visual Regression Testing

**Q:** *"How do you implement visual regression testing, and when is it most valuable?"*

🇻🇳 **Giải thích chi tiết:**

Visual regression testing là phương pháp test bằng cách chụp screenshot của UI và so sánh với baseline screenshots để phát hiện những thay đổi không mong muốn về mặt visual. Các tool phổ biến bao gồm Chromatic (tích hợp tốt với Storybook), Percy (của BrowserStack), và Playwright's built-in screenshot comparison. Chromatic là lựa chọn tốt nhất khi team đã dùng Storybook -- nó tự động chụp screenshot mỗi story, so sánh với version trước, và tạo visual review workflow cho team. Visual testing đặc biệt giá trị khi bạn làm việc với design system hoặc shared component library, vì một thay đổi CSS nhỏ có thể ảnh hưởng đến hàng chục components mà functional tests không bắt được. Ví dụ, bạn đổi font-size của base button component, functional tests vẫn pass vì button vẫn clickable, nhưng visual test sẽ bắt việc text bị tràn ra ngoài button. Threshold (ngưỡng sai số) là concept quan trọng -- bạn cần set một mức pixel difference chấp nhận được để tránh false positives từ anti-aliasing hoặc rendering differences giữa environments. Trong CI, visual tests thường chạy như một bước riêng và cần human approval cho những changes được phát hiện, vì không phải mọi visual change đều là bug -- có thể là intentional design update. Một lưu ý quan trọng là visual tests cần một stable rendering environment (consistent fonts, screen size, OS) để cho kết quả deterministic.

🇬🇧 **Sample Answer:**

> *"Visual regression testing captures screenshots of UI components and compares them against approved baselines to detect unintended visual changes that functional tests cannot catch. I find it most valuable in three scenarios: maintaining a design system or component library where a single CSS change can cascade across dozens of components, during large-scale refactoring where you are changing styling infrastructure like migrating from SASS to CSS-in-JS, and for ensuring responsive layouts render correctly across breakpoints. Chromatic is my preferred tool when working with Storybook because it automatically captures every story as a visual snapshot and provides a collaborative review workflow where designers and developers can approve or reject changes. For projects without Storybook, Playwright's built-in toHaveScreenshot assertion works well and runs entirely within your existing E2E infrastructure. Setting the right comparison threshold is critical -- too strict and you get false positives from sub-pixel rendering differences and anti-aliasing, too loose and you miss real regressions. I typically use a 0.1% to 0.2% threshold and configure consistent viewport sizes. In CI, visual tests should run in a consistent Docker environment to eliminate OS-level rendering differences in fonts and sub-pixel rendering. The workflow is typically: CI captures new screenshots, compares against baselines, flags differences for human review, and team members approve intentional changes which become the new baseline. It is important to note that visual testing complements but does not replace functional testing -- it answers 'does it look right?' while functional tests answer 'does it work right?'"*

```typescript
// src/components/Button/Button.stories.tsx -- Storybook + Chromatic
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    chromatic: {
      viewports: [375, 768, 1280],  // Capture at multiple breakpoints
      delay: 300,                    // Wait for animations to settle
      diffThreshold: 0.063,          // Pixel diff tolerance
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary Button' },
};

export const Disabled: Story = {
  args: { variant: 'primary', children: 'Disabled', disabled: true },
};

export const Loading: Story = {
  args: { variant: 'primary', children: 'Loading...', loading: true },
};

// All states in one story for comprehensive visual coverage
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="lg">Large</Button>
      <Button variant="primary" disabled>Disabled</Button>
      <Button variant="primary" loading>Loading</Button>
    </div>
  ),
};

// Playwright visual regression (alternative approach)
// e2e/visual/components.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression -- Component Library', () => {
  test('Button variants match baseline', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--all-variants');

    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'button-all-variants.png',
      {
        maxDiffPixelRatio: 0.01,   // Allow 1% pixel difference
        threshold: 0.2,            // Per-pixel color threshold
        animations: 'disabled',    // Disable CSS animations for consistency
      }
    );
  });

  test('Dashboard page visual snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Mask dynamic content to avoid false positives
    await expect(page).toHaveScreenshot('dashboard.png', {
      mask: [
        page.locator('[data-testid="current-time"]'),
        page.locator('[data-testid="live-balance"]'),
      ],
      fullPage: true,
    });
  });
});

// package.json scripts
// {
//   "chromatic": "chromatic --exit-zero-on-changes --auto-accept-changes=main",
//   "test:visual": "playwright test --config=playwright-visual.config.ts",
//   "test:visual:update": "playwright test --update-snapshots"
// }
```

---

## T-07: Test Coverage Strategy

**Q:** *"How do you approach test coverage metrics? When can 100% coverage actually be harmful?"*

🇻🇳 **Giải thích chi tiết:**

Test coverage metrics bao gồm nhiều loại: Statement coverage (bao nhiêu dòng code được chạy), Branch coverage (bao nhiêu nhánh if/else được test), Function coverage (bao nhiêu functions được gọi), và Line coverage. Nhiều team đặt mục tiêu 100% coverage nhưng điều này có thể có hại vì nhiều lý do. Thứ nhất, 100% coverage tạo ra áp lực viết tests vô nghĩa chỉ để tăng con số -- ví dụ test getter/setter, test trivial rendering mà không có logic. Thứ hai, coverage cao không có nghĩa là tests có chất lượng -- bạn có thể có 100% statement coverage mà không test edge cases, error cases, hoặc race conditions. Thứ ba, quá tập trung vào coverage số có thể dẫn đến việc ignore các loại testing khác quan trọng hơn như integration tests, visual tests, hoặc accessibility tests. Cách tiếp cận tốt hơn là tập trung vào "meaningful coverage" -- xác định critical paths (authentication, payment, data mutations) và đảm bảo chúng có coverage gần 100%, trong khi cho phép coverage thấp hơn cho UI boilerplate và generated code. Mutation testing (với tool như Stryker) là kỹ thuật nâng cao hơn -- nó thay đổi code (mutations) và kiểm tra xem tests có fail không; nếu mutation không bị bắt, có nghĩa là tests thiếu. Trong CI, nên set coverage gates (ví dụ 80% tổng thể, 95% cho business logic) để ngăn coverage giảm dần, nhưng không nên set 100% vì nó tạo ra friction không cần thiết và incentivize bad testing practices.

🇬🇧 **Sample Answer:**

> *"I approach test coverage as a useful diagnostic tool rather than a goal in itself. Coverage metrics come in several flavors -- statement, branch, function, and line coverage -- and branch coverage is typically the most informative because it reveals untested conditional logic paths. I believe 100% coverage can be actively harmful for three reasons. First, it incentivizes writing low-value tests just to hit the number -- testing trivial getters, simple renders without assertions, or auto-generated code adds maintenance burden without confidence. Second, high coverage creates a false sense of security; you can achieve 100% statement coverage without testing a single edge case, error scenario, or race condition. Third, the diminishing returns of going from 85% to 100% are enormous -- that last 15% often involves testing framework code, defensive error handlers, or platform-specific branches that are extremely difficult to trigger in tests. My strategy is to establish different coverage thresholds for different code categories: business logic and utilities should have 90-95% branch coverage, API integration layers around 85%, and UI presentation components around 70-80%. I configure coverage gates in CI using Istanbul or c8 -- the build fails if coverage drops below the threshold, but the thresholds are set at meaningful levels rather than arbitrary 100%. I am a strong advocate of mutation testing with Stryker, which goes beyond coverage by verifying test quality -- it mutates your source code and checks if tests catch the mutations, revealing tests that execute code without actually verifying behavior. In practice, I focus coverage efforts on the critical user paths that matter most -- for a banking app, that means transaction processing, authentication, and account management get the highest scrutiny."*

```typescript
// jest.config.ts -- Coverage with tiered thresholds
export default {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',    // Exclude Storybook
    '!src/**/*.d.ts',                // Exclude type declarations
    '!src/**/index.ts',              // Exclude barrel re-exports
    '!src/**/*.constants.ts',        // Exclude pure constants
    '!src/generated/**',             // Exclude auto-generated code
    '!src/mocks/**',                 // Exclude test mocks
    '!src/test-utils/**',            // Exclude test utilities
  ],
  coverageThresholds: {
    // Global minimums -- safety net
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    // Stricter for critical business logic
    './src/services/**/*.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    './src/hooks/**/*.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/utils/**/*.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    // Relaxed for UI components
    './src/components/**/*.tsx': {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70,
    },
  },
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
};

// Example: High coverage but LOW quality (bad practice)
test('BAD: achieves coverage without meaningful assertions', () => {
  const result = calculateTransferFee(1000, 'international');
  // Executes code (coverage goes up) but doesn't verify correctness!
  expect(result).toBeDefined();
});

// Example: Lower coverage but HIGH quality (good practice)
test('GOOD: meaningful assertions on transfer fee calculation', () => {
  // Normal cases
  expect(calculateTransferFee(1000, 'domestic')).toBe(0);
  expect(calculateTransferFee(1000, 'international')).toBe(25);

  // Edge cases
  expect(calculateTransferFee(0, 'international')).toBe(0);
  expect(calculateTransferFee(50_001, 'international')).toBe(50);

  // Error cases
  expect(() => calculateTransferFee(-100, 'domestic')).toThrow('Invalid amount');
  expect(() => calculateTransferFee(1000, 'unknown' as any)).toThrow('Invalid type');
});

// stryker.conf.mjs -- Mutation testing
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  mutate: [
    'src/services/**/*.ts',
    'src/utils/**/*.ts',
    'src/hooks/**/*.ts',
    '!src/**/*.test.ts',
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50, // CI fails if mutation score below 50%
  },
  incremental: true,
};
```

---

## T-08: Testing State Management

**Q:** *"How do you test state management stores (Redux/Zustand) and what patterns do you follow for testing async operations?"*

🇻🇳 **Giải thích chi tiết:**

Testing state management có 2 trường phái chính: test store isolated (unit test) và test store thông qua components (integration test). Với Zustand, test isolated rất dễ vì store chỉ là một function trả về object -- bạn có thể gọi actions trực tiếp và assert state changes. Với Redux, bạn có thể tạo một real store với configureStore và dispatch actions để test reducers và async thunks. Một pattern quan trọng là test selectors độc lập -- selectors thường chứa derived state logic phức tạp và cần được test kỹ với nhiều input combinations. Đối với async operations (API calls trong thunks hoặc Zustand actions), bạn cần mock API layer (tốt nhất là dùng MSW) và test các trạng thái: loading, success, và error. Khi test Redux async thunks, bạn dispatch thunk và kiểm tra state sau khi thunk hoàn thành. Với Zustand, cách tiếp cận đơn giản là gọi async action và await nó, rồi check state. Một lỗi thường gặp là mock store (ví dụ `redux-mock-store`) -- cách này chỉ test actions được dispatch mà không test state thay đổi thực sự, nên kém giá trị. Nên dùng real store trong tests để đảm bảo reducers, middleware, và selectors hoạt động cùng nhau đúng. Integration testing approach -- render component với real store và test user interactions -- cho kết quả confident nhất vì nó test toàn bộ flow từ UI đến state và ngược lại.

🇬🇧 **Sample Answer:**

> *"My approach to testing state management follows a layered strategy: isolated store tests for complex business logic, selector tests for derived state, and integration tests through components for end-to-end confidence. For Zustand stores, testing is remarkably straightforward because a store is just a function that returns state and actions -- I can call actions directly and assert the resulting state without any special setup. For Redux, I create a real store using configureStore with the actual reducers and middleware, then dispatch actions and verify state changes; I avoid redux-mock-store because it only records dispatched actions without actually running reducers, which misses a whole class of bugs. Selectors deserve their own dedicated tests because they often contain complex derived-state logic -- for example, a selector that computes portfolio performance from multiple account objects should be tested with various input scenarios. For async operations, I use MSW to mock the API layer so that async thunks and Zustand async actions make real HTTP calls that get intercepted, preserving the full request/response cycle in tests. The key states to verify in async tests are: the loading state is set when the operation starts, the success state contains the correct data and clears loading, and the error state captures the error message and clears loading. I always test the race condition where a user triggers multiple async operations in sequence -- does the latest response win, or does the store get corrupted by stale responses? Finally, my highest-confidence tests render actual components with the real store and test user interactions end-to-end, verifying that clicking buttons dispatches the right actions and the UI updates correctly based on state changes."*

```typescript
// src/store/accountStore.ts -- Zustand store
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'savings' | 'everyday' | 'term-deposit';
}

interface TransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  selectedAccountId: string | null;

  fetchAccounts: () => Promise<void>;
  selectAccount: (id: string) => void;
  transferFunds: (payload: TransferPayload) => Promise<void>;
  getTotalBalance: () => number;
  getAccountById: (id: string) => Account | undefined;
}

export const useAccountStore = create<AccountState>()(
  devtools(
    (set, get) => ({
      accounts: [],
      isLoading: false,
      error: null,
      selectedAccountId: null,

      fetchAccounts: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/accounts');
          if (!res.ok) throw new Error('Failed to fetch accounts');
          const data = await res.json();
          set({ accounts: data.accounts, isLoading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      selectAccount: (id) => set({ selectedAccountId: id }),

      transferFunds: async ({ fromAccountId, toAccountId, amount }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/transfers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromAccountId, toAccountId, amount }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Transfer failed');
          }
          await get().fetchAccounts(); // Refresh after transfer
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Transfer failed',
            isLoading: false,
          });
        }
      },

      getTotalBalance: () => {
        return get().accounts.reduce((sum, acc) => sum + acc.balance, 0);
      },

      getAccountById: (id) => {
        return get().accounts.find((acc) => acc.id === id);
      },
    }),
    { name: 'account-store' }
  )
);

// src/store/accountStore.test.ts -- Isolated store tests
import { useAccountStore } from './accountStore';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

// Reset store between tests
const initialState = useAccountStore.getState();
beforeEach(() => useAccountStore.setState(initialState, true));

describe('AccountStore', () => {
  describe('fetchAccounts', () => {
    test('sets loading state and fetches accounts', async () => {
      const { fetchAccounts } = useAccountStore.getState();

      const promise = fetchAccounts();

      // Loading state is set immediately
      expect(useAccountStore.getState().isLoading).toBe(true);
      expect(useAccountStore.getState().error).toBeNull();

      await promise;

      const state = useAccountStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.accounts).toHaveLength(3);
      expect(state.accounts[0]).toMatchObject({
        id: 'acc-1',
        balance: 15000,
        currency: 'AUD',
      });
    });

    test('handles API errors gracefully', async () => {
      server.use(
        http.get('/api/accounts', () => {
          return HttpResponse.json(
            { error: 'Service unavailable' },
            { status: 503 }
          );
        })
      );

      await useAccountStore.getState().fetchAccounts();

      const state = useAccountStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch accounts');
      expect(state.accounts).toHaveLength(0);
    });
  });

  describe('transferFunds', () => {
    test('transfers funds and refreshes accounts', async () => {
      await useAccountStore.getState().fetchAccounts();
      expect(useAccountStore.getState().accounts).toHaveLength(3);

      await useAccountStore.getState().transferFunds({
        fromAccountId: 'acc-1',
        toAccountId: 'acc-2',
        amount: 500,
      });

      const state = useAccountStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.accounts).toHaveLength(3); // Refreshed
    });

    test('handles transfer limit exceeded', async () => {
      await useAccountStore.getState().transferFunds({
        fromAccountId: 'acc-1',
        toAccountId: 'acc-2',
        amount: 100_000, // Exceeds $50,000 limit
      });

      const state = useAccountStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(
        'Transfer limit exceeded. Maximum $50,000 per transaction.'
      );
    });
  });

  describe('selectors', () => {
    test('getTotalBalance computes sum of all balances', async () => {
      await useAccountStore.getState().fetchAccounts();
      const total = useAccountStore.getState().getTotalBalance();
      expect(total).toBe(15000 + 5200 + 8900); // 29100
    });

    test('getTotalBalance returns 0 when no accounts', () => {
      expect(useAccountStore.getState().getTotalBalance()).toBe(0);
    });

    test('getAccountById returns correct account', async () => {
      await useAccountStore.getState().fetchAccounts();
      const account = useAccountStore.getState().getAccountById('acc-2');
      expect(account).toMatchObject({ id: 'acc-2', balance: 5200 });
    });

    test('getAccountById returns undefined for non-existent ID', async () => {
      await useAccountStore.getState().fetchAccounts();
      expect(useAccountStore.getState().getAccountById('acc-999')).toBeUndefined();
    });
  });
});

// Integration test: testing store through a component
// src/components/AccountDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAccountStore } from '../store/accountStore';
import { AccountDashboard } from './AccountDashboard';

const initialState = useAccountStore.getState();
beforeEach(() => useAccountStore.setState(initialState, true));

test('renders accounts and allows transfer (full integration)', async () => {
  const user = userEvent.setup();
  render(<AccountDashboard />);

  await waitFor(() => {
    expect(screen.getByText('$15,000.00')).toBeInTheDocument();
  });

  expect(screen.getByText(/total.*\$29,100/i)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /transfer/i }));

  await user.selectOptions(
    screen.getByRole('combobox', { name: /destination/i }),
    'acc-2'
  );
  await user.type(screen.getByRole('spinbutton', { name: /amount/i }), '500');
  await user.click(screen.getByRole('button', { name: /confirm/i }));

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/transfer successful/i);
  });
});
```

---

# PART B: Operations (O-01 to O-07)

---

## O-01: CI/CD Pipeline for Frontend

**Q:** *"Walk me through how you would design a CI/CD pipeline for a large frontend application."*

🇻🇳 **Giải thích chi tiết:**

CI/CD pipeline cho frontend application cần được thiết kế để đảm bảo code quality, catch bugs sớm, và deploy an toàn. Pipeline thường có các bước chính: Install dependencies (với cache để tăng tốc), sau đó chạy parallel jobs cho Lint (ESLint), Type Check (TypeScript), Unit/Integration Tests (Jest + RTL), và E2E Tests (Playwright). Việc chạy parallel jobs cực kỳ quan trọng vì nó giảm thời gian CI từ 15-20 phút xuống còn 5-7 phút. Dependency caching (cache node_modules hoặc pnpm store) giúp tiết kiệm 1-2 phút mỗi lần chạy. Sau khi tất cả checks pass, build step sẽ tạo production bundle, và chúng ta nên kiểm tra bundle size để đảm bảo không vượt quá budget. Deployment thường dùng Vercel hoặc AWS CloudFront -- preview deployments cho mỗi PR để team review, và production deployment cho main branch với canary/blue-green strategy. Branch protection rules đảm bảo không ai có thể merge code không pass CI vào main. Ngoài ra, nên có notification (Slack/Teams) khi pipeline fail để team phản ứng nhanh. Secret management trong CI dùng GitHub Secrets hoặc Vault, không bao giờ hardcode secrets trong workflow files.

🇬🇧 **Sample Answer:**

> *"For a large frontend application at ANZ, I would design a multi-stage CI/CD pipeline optimized for speed and reliability. The pipeline starts with a dependency installation step that leverages aggressive caching -- I use pnpm for its content-addressable store and cache it between runs, saving 60-90 seconds per pipeline execution. After dependencies are installed, the pipeline fans out into parallel jobs: ESLint with strict rules, TypeScript type checking with tsc --noEmit, unit and integration tests with Jest, and E2E tests with Playwright running across multiple browser targets. Running these in parallel is crucial -- sequential execution might take 20 minutes while parallel execution completes in 5-7 minutes. Each job should fail fast and provide clear error messages. After all quality gates pass, the build step creates the production bundle and runs bundle size analysis, failing the pipeline if the bundle exceeds our size budget. For deployments, I implement a tiered strategy: every PR gets a preview deployment so reviewers can test the actual built application, not just read code. Merges to main trigger an automatic deployment to staging, followed by a manual promotion gate to production. Production deployments use a canary strategy where traffic is gradually shifted -- 5%, then 25%, then 100% -- with automatic rollback if error rates spike. Branch protection rules ensure main always requires passing CI, at least one code review approval, and no force pushes."*

```yaml
# .github/workflows/ci.yml
name: Frontend CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # Step 1: Install dependencies (shared cache)
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - uses: actions/cache/save@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}

  # Step 2: Parallel quality checks
  lint:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm lint --max-warnings 0
      - run: pnpm format:check

  typecheck:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm tsc --noEmit

  test-unit:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm test --ci --coverage --maxWorkers=2
      - uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
          fail_ci_if_error: true

  test-e2e:
    needs: install
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: npx playwright install --with-deps chromium
      - run: pnpm exec playwright test --shard=${{ matrix.shard }}/3
      - if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 7

  # Step 3: Build and check bundle size
  build:
    needs: [lint, typecheck, test-unit, test-e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm build
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
      - run: pnpm size-limit
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
          retention-days: 3

  # Step 4: Deploy
  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: preview
      url: ${{ steps.deploy.outputs.url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/
      - name: Deploy preview
        id: deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.anz.com
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/
      - name: Deploy to production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## O-02: Error Monitoring (Sentry)

**Q:** *"How do you set up error monitoring with Sentry in a React application, and how do you use it effectively in production?"*

🇻🇳 **Giải thích chi tiết:**

Sentry là platform error monitoring phổ biến nhất cho frontend, cung cấp real-time error tracking, performance monitoring, và release management. Khi tích hợp Sentry vào React app, bạn cần cấu hình Sentry.init() ở entry point của app với DSN (Data Source Name), environment (production/staging), và release version. Source maps là cực kỳ quan trọng -- khi deploy production code đã minified, source maps cho phép Sentry map error stack traces về original source code để bạn biết chính xác lỗi ở dòng nào, file nào. Error Boundaries trong React kết hợp với Sentry.ErrorBoundary giúp catch rendering errors và báo cáo chúng tự động, đồng thời hiển thị fallback UI cho user thay vì white screen. Breadcrumbs là feature mạnh của Sentry -- nó ghi lại các sự kiện xảy ra trước khi error xảy ra (user clicks, navigation, API calls, console logs), giúp bạn hiểu context của error. Performance monitoring với Sentry cho phép track toàn bộ transaction từ page load đến API calls, giúp identify bottlenecks. Alert rules nên được cấu hình để notify team qua Slack/PagerDuty khi có spike error rate hoặc new error types xuất hiện. Release tracking giúp bạn biết error xuất hiện từ release nào và có regression hay không. Sentry cũng hỗ trợ Session Replay để xem lại chính xác những gì user đã làm trước khi gặp error.

🇬🇧 **Sample Answer:**

> *"Setting up Sentry in a React application involves several layers of integration for comprehensive error monitoring. First, I initialize Sentry at the application entry point with the DSN, environment, release version tied to the git commit SHA, and a sample rate for performance monitoring -- typically 10-20% in production to balance data collection with cost. Source map uploading is critical and happens during the CI build step; without source maps, production errors show minified code that is nearly impossible to debug. I wrap the application root with Sentry.ErrorBoundary to catch React rendering errors and automatically report them while showing a user-friendly fallback UI instead of a blank screen. For more granular error handling, I place additional error boundaries around feature sections -- if the notification panel crashes, the rest of the dashboard should continue working. Breadcrumbs are incredibly valuable for debugging; Sentry automatically captures user clicks, navigation events, console logs, and network requests that occurred before the error, giving you the full context of what led to the crash. I configure custom breadcrumbs for business-critical actions like 'user initiated transfer' or 'user changed account' for domain-specific context. Performance monitoring with Sentry traces full transactions including component renders, API calls, and resource loading, helping identify slow pages and bottleneck APIs. Alert rules are configured in tiers: P1 alerts via PagerDuty for error rate spikes above 5% on critical paths, P2 alerts via Slack for new error types, and daily digest emails for error trends. Release health tracking shows the crash-free session rate per release, enabling quick identification and rollback of problematic deployments."*

```typescript
// src/lib/sentry.ts -- Sentry initialization
import * as Sentry from '@sentry/react';

export function initSentry() {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.VITE_APP_ENV,
    release: `anz-frontend@${process.env.VITE_COMMIT_SHA}`,

    // Performance -- sample 10% in prod
    tracesSampleRate: process.env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay -- 1% normal, 100% error sessions
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,     // Privacy: banking app
        maskAllInputs: true,
        blockAllMedia: true,
      }),
      Sentry.httpClientIntegration({
        failedRequestStatusCodes: [[400, 599]],
        failedRequestTargets: ['/api/'],
      }),
    ],

    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Loading chunk \d+ failed/,
    ],

    // Scrub sensitive data before sending
    beforeSend(event) {
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((crumb) => {
          if (crumb.data?.url) {
            crumb.data.url = crumb.data.url.replace(
              /\/accounts\/\d+/g,
              '/accounts/[REDACTED]'
            );
          }
          return crumb;
        });
      }
      return event;
    },
  });
}

// src/components/AppErrorBoundary.tsx
import * as Sentry from '@sentry/react';
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'section' | 'widget';
}

interface State {
  hasError: boolean;
  eventId: string | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, eventId: null };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
      tags: { boundary_level: this.props.level || 'page' },
    });
    this.setState({ eventId });
  }

  handleReset = () => this.setState({ hasError: false, eventId: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <p>We have been notified and are looking into the issue.</p>
          <button onClick={this.handleReset}>Try again</button>
          {this.state.eventId && (
            <button onClick={() =>
              Sentry.showReportDialog({ eventId: this.state.eventId! })
            }>
              Report feedback
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// src/main.tsx -- Entry point
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { initSentry } from './lib/sentry';
import { App } from './App';

initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <div role="alert">
          <h1>Application Error</h1>
          <button onClick={resetError}>Reload</button>
        </div>
      )}
      showDialog
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
```

---

## O-03: Performance Monitoring (Core Web Vitals)

**Q:** *"Explain the Core Web Vitals metrics and how you monitor and optimize them in production."*

🇻🇳 **Giải thích chi tiết:**

Core Web Vitals là bộ 3 metrics chính mà Google dùng để đánh giá trải nghiệm người dùng trên web. LCP (Largest Contentful Paint) đo thời gian render phần tử lớn nhất trên viewport -- mục tiêu là dưới 2.5 giây, thường là hero image, heading text, hoặc video. FID (First Input Delay) đã được thay thế bởi INP (Interaction to Next Paint) từ năm 2024 -- INP đo responsiveness của trang khi user tương tác (click, tap, keyboard), mục tiêu dưới 200ms. CLS (Cumulative Layout Shift) đo mức độ layout bị xô đẩy khi trang đang load -- mục tiêu dưới 0.1, thường xảy ra khi images không có dimensions, fonts load muộn, hoặc dynamic content được insert. Để monitor, bạn cần cả lab data (Lighthouse, Chrome DevTools) và field data (Real User Monitoring - RUM) vì lab data không phản ánh trải nghiệm thực của tất cả users trên nhiều loại device và mạng. Thư viện `web-vitals` của Google cho phép thu thập metrics từ real users và gửi về analytics service. Để optimize LCP: dùng priority hints cho critical images, preload fonts, optimize server response time (TTFB), sử dụng SSR/SSG khi phù hợp. Để optimize INP: giảm main thread blocking (break long tasks, dùng web workers), optimize event handlers, dùng `startTransition` cho non-urgent updates. Để optimize CLS: luôn set width/height cho images và videos, dùng font-display: swap với size-adjust, reserve space cho dynamic content bằng skeleton loading.

🇬🇧 **Sample Answer:**

> *"Core Web Vitals are the three metrics Google uses to measure real user experience: LCP (Largest Contentful Paint), INP (Interaction to Next Paint, which replaced FID), and CLS (Cumulative Layout Shift). LCP measures loading performance -- specifically how long it takes for the largest visible element to render; the target is under 2.5 seconds. INP measures interactivity by capturing the latency from user input to the next visual update across all interactions during a page session; the target is under 200 milliseconds. CLS measures visual stability by quantifying unexpected layout shifts during the page lifecycle; the target is a score below 0.1. I monitor these using both lab tools (Lighthouse CI in the pipeline) and field data through Real User Monitoring, because lab data cannot capture the diversity of real user devices, network conditions, and interaction patterns. The web-vitals library from Google captures these metrics from real users and I report them to our analytics backend for aggregation and alerting. For LCP optimization, the key strategies are: using fetchpriority='high' on the hero image, preloading critical fonts and above-the-fold resources, optimizing server response time, and implementing SSR or SSG for critical landing pages. For INP optimization, I focus on reducing main thread blocking -- breaking long tasks with scheduler.yield(), moving heavy computations to Web Workers, using React's startTransition for non-urgent state updates, and debouncing expensive event handlers. For CLS optimization, I always specify explicit dimensions on images and videos, use font-display: optional or swap with size-adjust to minimize font-swap layout shift, and implement skeleton loading patterns to reserve space for async content."*

```typescript
// src/lib/web-vitals.ts -- Core Web Vitals reporting
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    navigationType: metric.navigationType,
    id: metric.id,
  });

  // Use sendBeacon for reliability (works during page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    });
  }

  // Dev logging
  if (process.env.NODE_ENV === 'development') {
    const color =
      metric.rating === 'good' ? 'green' :
      metric.rating === 'needs-improvement' ? 'orange' : 'red';
    console.log(
      `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// Optimization: LCP -- priority hints for hero image
// <img src="/hero.webp" alt="Welcome" fetchPriority="high" loading="eager" />
// <link rel="preload" href="/fonts/ANZSans.woff2" as="font" crossOrigin="" />

// Optimization: CLS -- prevent layout shift
// .hero-container { aspect-ratio: 2 / 1; width: 100%; }

// Optimization: INP -- break long tasks
async function processLargeDataSet(items: unknown[]) {
  const CHUNK_SIZE = 50;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    processChunk(chunk);
    // Yield to main thread so UI stays responsive
    if (i + CHUNK_SIZE < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

function processChunk(items: unknown[]) {
  /* expensive computation on subset */
}

// Optimization: INP -- React startTransition for non-urgent updates
import { startTransition, useState } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);                      // Urgent: update input NOW
    startTransition(() => {
      setResults(filterResults(value));   // Non-urgent: update later
    });
  }

  return (
    <div>
      <input value={query} onChange={handleSearch} />
      <ul>{results.map((r, i) => <li key={i}>{r}</li>)}</ul>
    </div>
  );
}

function filterResults(query: string): string[] {
  return []; // expensive filtering logic
}
```

---

## O-04: Feature Flags

**Q:** *"How do you implement feature flags in a frontend application, and how do they enable trunk-based development?"*

🇻🇳 **Giải thích chi tiết:**

Feature flags (hay feature toggles) là kỹ thuật cho phép bạn bật/tắt features trong production mà không cần deploy lại code. Có nhiều loại feature flags: Release flags (để giấu feature chưa hoàn thành), Experiment flags (A/B testing), Ops flags (để bật/tắt tính năng khi có sự cố), và Permission flags (feature cho nhóm user cụ thể). Feature flags là nền tảng của trunk-based development -- thay vì tạo long-lived feature branches, developers commit trực tiếp vào main/trunk nhưng wrap code mới trong feature flags, chỉ bật khi feature hoàn thành và được test. Các platform phổ biến bao gồm LaunchDarkly (enterprise, paid), Unleash (open-source), và Flagsmith. Khi implement trong React, bạn thường tạo một custom hook như `useFeatureFlag('new-dashboard')` trả về boolean, và dùng nó để conditional render components. Gradual rollout là một use case mạnh -- bạn có thể bật feature cho 5% users trước, monitor metrics, rồi tăng dần lên 25%, 50%, 100%. Điều này giúp giảm risk khi release features mới. Lifecycle management rất quan trọng -- feature flags nên có expiration date và được clean up sau khi feature đã được bật cho 100% users, nếu không code sẽ đầy những dead flags gây confusion. Trong banking context như ANZ, feature flags cũng giúp comply với regulatory requirements -- bạn có thể bật feature mới cho internal users trước để QA test trong production environment trước khi release cho customers.

🇬🇧 **Sample Answer:**

> *"Feature flags are a powerful technique that allows toggling features on and off in production without redeployment, and they are essential for trunk-based development in large teams. There are four main types: release flags for hiding incomplete features, experiment flags for A/B testing, operational flags for kill switches during incidents, and permission flags for role-based access. Feature flags enable trunk-based development by allowing developers to commit directly to the main branch with new code wrapped behind flags -- this eliminates long-lived feature branches, reduces merge conflicts, and enables continuous integration. For implementation, I use a provider pattern where the flag evaluation SDK is initialized at the app root and a custom hook provides flag values to any component. Gradual rollout is one of the most valuable capabilities -- when launching a new transaction flow at ANZ, we might enable it for 1% of users initially, monitor error rates and performance metrics, then progressively increase to 10%, 50%, and eventually 100%. If metrics degrade at any stage, we can instantly disable the flag without a rollback deployment. Server-side evaluation is preferred for banking applications because it prevents flag logic from being inspected in client-side JavaScript and ensures consistent evaluation. Flag lifecycle management is critical -- every flag should have an owner, creation date, and planned removal date; stale flags create technical debt and cognitive overhead, so I enforce flag cleanup as part of the definition of done. In CI, I run tests with flags in both on and off states to ensure the application works correctly regardless of flag configuration."*

```typescript
// src/lib/featureFlags.tsx -- Feature flag provider and hook
import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from 'react';

interface FeatureFlags {
  [key: string]: boolean | string | number;
}

interface FeatureFlagContextType {
  flags: FeatureFlags;
  isLoading: boolean;
  isEnabled: (flagKey: string) => boolean;
  getValue: <T>(flagKey: string, defaultValue: T) => T;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

const DEFAULT_FLAGS: FeatureFlags = {
  'new-dashboard-layout': false,
  'instant-transfers': false,
  'biometric-login': false,
  'dark-mode': false,
};

export function FeatureFlagProvider({
  children, userId,
}: { children: ReactNode; userId?: string }) {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      try {
        const res = await fetch('/api/feature-flags', {
          headers: { 'X-User-Id': userId || 'anonymous' },
        });
        if (res.ok) {
          const serverFlags = await res.json();
          setFlags((prev) => ({ ...prev, ...serverFlags }));
        }
      } catch {
        console.warn('Failed to fetch feature flags, using defaults');
      } finally {
        setIsLoading(false);
      }
    }
    fetchFlags();
  }, [userId]);

  const isEnabled = (key: string): boolean => {
    const val = flags[key];
    return typeof val === 'boolean' ? val : Boolean(val);
  };

  const getValue = <T,>(key: string, def: T): T => {
    const val = flags[key];
    return (val !== undefined ? val : def) as T;
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, isLoading, isEnabled, getValue }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlag(flagKey: string): boolean {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) throw new Error('useFeatureFlag must be used within FeatureFlagProvider');
  return ctx.isEnabled(flagKey);
}

// Usage in component
import { useFeatureFlag } from '../lib/featureFlags';

export function Dashboard() {
  const hasNewDashboard = useFeatureFlag('new-dashboard-layout');
  const hasBiometricLogin = useFeatureFlag('biometric-login');

  return (
    <div>
      {hasNewDashboard ? <NewDashboard /> : <LegacyDashboard />}

      {hasBiometricLogin && (
        <section aria-label="Biometric Settings">
          <h3>Biometric Login</h3>
          <BiometricSetup />
        </section>
      )}
    </div>
  );
}

// Testing feature flags in both states
import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider } from '../lib/featureFlags';
import { Dashboard } from './Dashboard';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

function renderWithFlags(overrides: Record<string, boolean> = {}) {
  server.use(http.get('/api/feature-flags', () => HttpResponse.json(overrides)));
  return render(
    <FeatureFlagProvider userId="test-user">
      <Dashboard />
    </FeatureFlagProvider>
  );
}

test('renders new dashboard when flag enabled', async () => {
  renderWithFlags({ 'new-dashboard-layout': true });
  await screen.findByTestId('new-dashboard');
  expect(screen.queryByTestId('legacy-dashboard')).not.toBeInTheDocument();
});

test('renders legacy dashboard when flag disabled', async () => {
  renderWithFlags({ 'new-dashboard-layout': false });
  await screen.findByTestId('legacy-dashboard');
  expect(screen.queryByTestId('new-dashboard')).not.toBeInTheDocument();
});
```

---

## O-05: Incident Response

**Q:** *"Describe your approach to incident response for a production frontend application. How do you handle, communicate, and learn from incidents?"*

🇻🇳 **Giải thích chi tiết:**

Incident response là quy trình xử lý sự cố trong production, rất quan trọng trong môi trường banking như ANZ nơi downtime ảnh hưởng trực tiếp đến khách hàng và revenue. Quy trình chuẩn gồm 4 giai đoạn: Detection (phát hiện) thông qua monitoring alerts từ Sentry, Datadog, hoặc synthetic monitoring; Triage (đánh giá mức độ) phân loại theo severity levels (SEV1: service down, SEV2: major feature broken, SEV3: minor issue); Response (xử lý) với incident commander điều phối, engineers debug và fix, và communications team update stakeholders; và Postmortem (rút kinh nghiệm) sau khi sự cố được giải quyết. Communication là yếu tố cực kỳ quan trọng -- trong SEV1, cần update stakeholders mỗi 15-30 phút qua status page và internal channels (Slack war room). Runbooks là tài liệu step-by-step cho các sự cố thường gặp -- ví dụ "API response time > 5s" thì check backend health, check CDN, check database connections. Blameless postmortem là văn hóa quan trọng -- tập trung vào hệ thống và process thay vì đổ lỗi cá nhân, hỏi "tại sao hệ thống cho phép điều này xảy ra?" thay vì "ai đã làm lỗi?". SLA (Service Level Agreement) là cam kết với khách hàng (ví dụ 99.9% uptime), còn SLO (Service Level Objective) là mục tiêu nội bộ (ví dụ 99.95% uptime), và SLI (Service Level Indicator) là metric thực tế đo được. Sau mỗi incident, action items từ postmortem phải được track và hoàn thành để ngăn sự cố tương tự tái diễn.

🇬🇧 **Sample Answer:**

> *"My approach to incident response follows a structured four-phase lifecycle: Detection, Triage, Response, and Learning. Detection relies on multiple monitoring layers -- Sentry alerts for error rate spikes, synthetic monitoring that simulates critical user journeys every 5 minutes, and real user monitoring dashboards that surface performance degradation before users report it. When an incident is detected, triage immediately classifies severity: SEV1 means the application is down or a critical function like payments is broken affecting many users, SEV2 means a major feature is degraded but workarounds exist, and SEV3 is a minor issue affecting few users. For SEV1 and SEV2, I follow a structured incident response: an incident commander is designated to coordinate, engineers begin debugging using our runbooks which provide step-by-step diagnostic procedures for common scenarios, and a communications lead posts updates to the status page and internal Slack channel every 15 minutes. The first priority is always mitigation, not root cause -- if a bad deployment caused the incident, we rollback immediately rather than trying to fix forward under pressure. Feature flags are invaluable here because we can instantly disable a problematic feature without a full deployment rollback. After the incident is resolved, we conduct a blameless postmortem within 48 hours -- the document covers timeline of events, root cause analysis using the 5 Whys technique, impact assessment, and concrete action items with owners and due dates. We ask 'why did the system allow this to happen?' rather than 'who caused this?' -- focusing on systemic improvements like better testing, improved monitoring, or architectural changes. Every action item from postmortems is tracked in Jira and reviewed weekly until completion, ensuring we actually learn and improve rather than repeating the same failures."*

```
Incident Response Flow
======================

1. DETECT                    2. TRIAGE                    3. RESPOND
   Sentry alert                 Assess severity              Incident commander assigned
   Synthetic monitor fail       SEV1: Service down           War room opened (Slack)
   User reports                 SEV2: Major degradation      Engineers diagnose
   Anomaly detection            SEV3: Minor issue            Mitigate first, fix later
                                                             Communicate every 15min

4. RESOLVE                   5. POSTMORTEM                6. IMPROVE
   Confirm fix                  Within 48 hours              Track action items in Jira
   Monitor for recurrence       Blameless culture            Update runbooks
   Update status page           Timeline + 5 Whys            Improve monitoring
   Close incident               Impact assessment            Share learnings with team

Severity Levels
===============
SEV1 (Critical) - Service down, data loss risk
  Response: All hands, 15-min updates, exec notification
  SLO: Acknowledge < 5 min, Mitigate < 30 min

SEV2 (Major) - Core feature broken, significant user impact
  Response: On-call team, 30-min updates
  SLO: Acknowledge < 15 min, Mitigate < 1 hour

SEV3 (Minor) - Feature degraded, workaround available
  Response: Next business day
  SLO: Acknowledge < 1 hour, Fix < 1 business day

Postmortem Example
==================
Title: [2024-03-15] Transfer validation rejects NZ accounts
Duration: 14:00 - 15:00 UTC (60 minutes)
Impact: ~2,500 NZ users unable to transfer funds

Timeline:
- 14:00 - Sentry alert: Error rate spike on /transfer
- 14:03 - On-call acknowledges alert
- 14:10 - Root cause: regex doesn't match NZ account format
- 14:15 - Feature flag 'instant-transfers' disabled (mitigation)
- 14:45 - Hotfix deployed with corrected regex
- 15:00 - Feature flag re-enabled, monitoring stable

Root Cause (5 Whys):
1. Why did transfers fail? -> Validation rejected valid NZ account numbers
2. Why? -> Regex pattern didn't account for NZ format
3. Why? -> Test data only included AU accounts
4. Why? -> No test data generation for NZ accounts
5. Why? -> No process to ensure multi-region test coverage

Action Items:
[ ] Add NZ account formats to test data generators - @alice - Mar 22
[ ] Integration tests for all account formats    - @bob   - Mar 25
[ ] Sentry alert for validation error spikes     - @charlie - Mar 20
[ ] Review all regex patterns in validation layer - @dave  - Mar 29
```

---

## O-06: Bundle Size Optimization

**Q:** *"What techniques do you use to optimize bundle size in a large frontend application, and how do you enforce size budgets?"*

🇻🇳 **Giải thích chi tiết:**

Bundle size optimization là yếu tố quan trọng ảnh hưởng trực tiếp đến performance, đặc biệt trên mobile devices và mạng chậm. Tree-shaking là kỹ thuật cơ bản nhất -- bundler (Webpack/Vite/Rollup) loại bỏ code không được sử dụng, nhưng chỉ hoạt động tốt với ES modules (import/export), nên cần đảm bảo dependencies hỗ trợ ESM và dùng named imports thay vì import toàn bộ library. Code splitting tách bundle thành nhiều chunks nhỏ được load theo nhu cầu -- route-based splitting (mỗi page là một chunk), component-based splitting (lazy load heavy components như charts, editors), và vendor splitting (tách thư viện bên thứ ba ra riêng để browser cache lâu hơn). Dynamic imports với React.lazy() và Suspense cho phép lazy load components khi user cần -- ví dụ modal, tab content, hoặc route chưa được visit. Bundle analyzer tools như `webpack-bundle-analyzer` hoặc `rollup-plugin-visualizer` giúp hiển thị tree map của bundle để xác định dependencies nào chiếm nhiều không gian nhất. Module Federation (Webpack 5) cho phép chia sẻ code giữa micro-frontends tại runtime thay vì bundle vào mỗi app. Performance budgets trong CI (dùng size-limit hoặc bundlesize) tự động fail build nếu bundle vượt quá giới hạn đã đặt, ngăn việc bundle phình to dần theo thời gian. Một số kỹ thuật khác bao gồm: replace heavy libraries với lighter alternatives (moment.js -> date-fns, lodash -> lodash-es với cherry-picking), dùng CDN cho common libraries, và compress với Brotli thay vì gzip.

🇬🇧 **Sample Answer:**

> *"Bundle size optimization is crucial for performance, especially in banking applications where users access the platform on diverse devices and network conditions across Australia and New Zealand. My first line of defense is tree-shaking, which eliminates unused code at build time -- but it only works effectively with ES modules, so I ensure all dependencies support ESM and use named imports like import { debounce } from 'lodash-es' instead of import _ from 'lodash'. Code splitting is the next major technique, and I implement it at three levels: route-based splitting where each page loads its own JavaScript chunk, component-based splitting where heavy widgets like charts and data grids are lazy-loaded, and vendor splitting where stable third-party libraries are separated into a long-lived cached chunk. Dynamic imports with React.lazy and Suspense make this seamless -- a chart component might be 200KB but only loads when the user navigates to the analytics tab. I regularly use bundle analyzers like rollup-plugin-visualizer to inspect what is in the bundle; this often reveals surprising size contributors like accidentally importing an entire icon library. For enforcement, I configure size-limit in the CI pipeline with specific budgets for each entry point -- the main bundle might have a 150KB gzipped budget, while individual route chunks have 50KB budgets. When a build exceeds the budget, CI fails and the developer must investigate before merging. I also maintain an allow-list of approved large dependencies, and any new dependency over 10KB gzipped requires team review. Module Federation with Webpack 5 or Vite's federation plugin is valuable in micro-frontend architectures for sharing common dependencies like React and the design system at runtime rather than bundling them into every application."*

```typescript
// vite.config.ts -- Optimized build
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-charts': ['recharts'],
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
    chunkSizeWarningLimit: 250,
  },
});

// Route-based code splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageLoader } from '../components/PageLoader';

// Eager: critical pages
import { Dashboard } from '../pages/Dashboard';
import { Login } from '../pages/Login';

// Lazy: non-critical pages
const Accounts = lazy(() => import('../pages/Accounts'));
const TransferFunds = lazy(() => import('../pages/TransferFunds'));
const Analytics = lazy(() => import('../pages/Analytics'));     // ~200KB charts
const Settings = lazy(() => import('../pages/Settings'));
const HelpCenter = lazy(() => import('../pages/HelpCenter'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts/*" element={<Accounts />} />
        <Route path="/transfer" element={<TransferFunds />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help/*" element={<HelpCenter />} />
      </Routes>
    </Suspense>
  );
}

// Component-level lazy loading for heavy widgets
import { lazy, Suspense, useState } from 'react';

const RechartsLineChart = lazy(() => import('./charts/TransactionLineChart'));

export function TransactionChart({ accountId }: { accountId: string }) {
  const [showChart, setShowChart] = useState(false);

  if (!showChart) {
    return <button onClick={() => setShowChart(true)}>Show Chart</button>;
  }

  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <RechartsLineChart accountId={accountId} />
    </Suspense>
  );
}

// .size-limit.json -- Bundle budgets enforced in CI
// [
//   { "name": "Main JS",          "path": "dist/assets/index-*.js",         "limit": "150 KB", "gzip": true },
//   { "name": "Main CSS",         "path": "dist/assets/index-*.css",        "limit": "30 KB",  "gzip": true },
//   { "name": "React vendor",     "path": "dist/assets/vendor-react-*.js",  "limit": "50 KB",  "gzip": true },
//   { "name": "Charts chunk",     "path": "dist/assets/vendor-charts-*.js", "limit": "80 KB",  "gzip": true },
//   { "name": "Total initial JS", "path": "dist/assets/*.js",               "limit": "300 KB", "gzip": true }
// ]
```

---

## O-07: Security Best Practices

**Q:** *"What are the most important frontend security practices, especially for a banking application?"*

🇻🇳 **Giải thích chi tiết:**

Security trong frontend banking application là cực kỳ quan trọng vì nó xử lý thông tin tài chính nhạy cảm. XSS (Cross-Site Scripting) là mối đe dọa lớn nhất -- attacker inject malicious script vào trang web để đánh cắp session tokens, cookies, hoặc thông tin tài khoản. React tự động escape JSX output, nhưng vẫn có rủi ro khi dùng `dangerouslySetInnerHTML`, khi render user-generated content, hoặc khi inject data vào URLs. CSP (Content Security Policy) headers là tuyến phòng thủ mạnh chống XSS -- nó chỉ định nguồn nào được phép load scripts, styles, images, preventing unauthorized code execution. CORS (Cross-Origin Resource Sharing) kiểm soát domains nào được phép gọi API của bạn -- trong banking, chỉ cho phép origin của app. Dependency audit rất quan trọng vì supply chain attacks ngày càng phổ biến -- `npm audit` và tools như Snyk/Socket kiểm tra vulnerabilities trong dependencies. Secrets management đảm bảo API keys, tokens không bao giờ được expose trong client-side code -- dùng environment variables chỉ ở build time, không bao giờ bundle secrets vào JavaScript. Ngoài ra, cần implement: HTTP-only cookies cho session tokens (JavaScript không đọc được), Subresource Integrity (SRI) cho CDN scripts, regular penetration testing, và Content-Type: nosniff header để ngăn MIME type sniffing. OWASP Top 10 cho frontend bao gồm: Injection, Broken Authentication, Sensitive Data Exposure, và Security Misconfiguration là những mối đe dọa hàng đầu.

🇬🇧 **Sample Answer:**

> *"For a banking application like ANZ, frontend security is paramount because we handle sensitive financial data and any breach could have severe consequences for customers and the institution. XSS prevention is the top priority -- while React's JSX automatically escapes content, vulnerabilities still arise from dangerouslySetInnerHTML, href attributes with javascript: URLs, and rendering unsanitized user content in rich text editors. I implement defense in depth: input sanitization with DOMPurify before rendering any user-generated content, Content Security Policy headers that restrict script sources to our own domains only, and HTTP-only secure cookies for session tokens so they cannot be accessed by JavaScript even if XSS occurs. CSP is our strongest defense against XSS -- by setting script-src to only allow our own domain and disabling inline scripts with nonce-based exceptions, we prevent injected scripts from executing entirely. CORS configuration must be restrictive in banking -- only our exact production and staging origins should be allowed, never wildcard origins. Dependency security is increasingly critical due to supply chain attacks; I configure npm audit in CI to fail on high and critical vulnerabilities, use Snyk or Socket for continuous monitoring, and maintain a lockfile to prevent dependency confusion attacks. Secrets management requires strict discipline -- API keys and tokens must never appear in client-side JavaScript bundles; instead, they should be stored in environment variables used only during server-side rendering or build processes, with runtime secrets fetched through authenticated API calls. Additional security headers I configure include X-Frame-Options: DENY to prevent clickjacking, X-Content-Type-Options: nosniff to prevent MIME sniffing, Strict-Transport-Security to enforce HTTPS, and Referrer-Policy to control information leakage. Regular security audits, penetration testing, and keeping dependencies updated are ongoing operational requirements, not one-time setup tasks."*

```typescript
// src/middleware.ts -- Security headers (Next.js middleware, adaptable to any framework)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const nonce = generateNonce();

  // Content Security Policy -- strongest XSS protection
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: https://cdn.anz.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' https://api.anz.com https://*.sentry.io`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '0'); // CSP is superior
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );

  response.headers.set('X-Nonce', nonce);
  return response;
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

// src/lib/sanitize.ts -- Input sanitization (banking context: very restrictive)
import DOMPurify from 'dompurify';

const purifyConfig: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
};

/** Sanitize HTML to prevent XSS. Use for any user-generated content. */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, purifyConfig);
}

/** Validate URLs to prevent javascript: protocol attacks. */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '#';
    return parsed.toString();
  } catch {
    return '#';
  }
}

// src/components/SafeHTML.tsx -- Use instead of dangerouslySetInnerHTML
import { sanitizeHTML } from '../lib/sanitize';

interface SafeHTMLProps {
  html: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function SafeHTML({ html, className, as: Tag = 'div' }: SafeHTMLProps) {
  const clean = sanitizeHTML(html);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}

// Security Checklist for Banking Frontend
// ========================================
//
// XSS Prevention:
//   [ ] Never use dangerouslySetInnerHTML with unsanitized input
//   [ ] Sanitize all user-generated content with DOMPurify
//   [ ] Validate URLs before rendering in href attributes
//   [ ] CSP headers blocking inline scripts (nonce-based)
//
// Authentication & Sessions:
//   [ ] HTTP-only, Secure, SameSite=Strict cookies for tokens
//   [ ] No sensitive data in localStorage
//   [ ] Auto-logout on inactivity (banking requirement)
//   [ ] CSRF tokens for state-changing requests
//
// Data Protection:
//   [ ] No PII in console.log (strip in production builds)
//   [ ] Mask account numbers in UI (show last 4 digits)
//   [ ] No sensitive data in URL parameters
//   [ ] autocomplete="off" for sensitive fields
//
// Supply Chain Security:
//   [ ] npm audit in CI pipeline (fail on high/critical)
//   [ ] Dependabot / Snyk automated scanning
//   [ ] Lock file committed (pnpm-lock.yaml)
//   [ ] SRI hashes for third-party CDN resources
//
// HTTP Security Headers:
//   [ ] Content-Security-Policy (strict, nonce-based)
//   [ ] X-Frame-Options: DENY
//   [ ] X-Content-Type-Options: nosniff
//   [ ] Referrer-Policy: strict-origin-when-cross-origin
//   [ ] Strict-Transport-Security (HSTS with preload)
//   [ ] Permissions-Policy (disable unused browser features)
```

---

> **Tổng kết:** 15 câu hỏi covering Testing (8) và Operations (7) -- các chủ đề thiết yếu cho Senior Frontend Engineer tại ANZ Bank. Focus vào thực hành, code examples, và kiến thức chiều sâu để tự tin trả lời phỏng vấn.
