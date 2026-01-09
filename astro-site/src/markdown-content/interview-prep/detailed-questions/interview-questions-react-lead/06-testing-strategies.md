# 06 - Testing Strategies

> **8 câu hỏi chuyên sâu về Testing trong React**

---

## Q6.1: Testing Pyramid và Strategy cho React

### Câu hỏi
Giải thích Testing Pyramid và testing strategy cho React application?

### Trả lời

#### Testing Pyramid

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                        /\                                    │
│                       /  \                                   │
│                      / E2E\        Few, Slow, Expensive      │
│                     /──────\                                 │
│                    /        \                                │
│                   /Integration\    Some, Medium              │
│                  /──────────────\                            │
│                 /                \                           │
│                /      Unit        \    Many, Fast, Cheap     │
│               /────────────────────\                         │
│                                                              │
│   RATIO RECOMMENDATION:                                      │
│   ├── Unit Tests: 70%                                       │
│   ├── Integration Tests: 20%                                │
│   └── E2E Tests: 10%                                        │
│                                                              │
│   REACT-SPECIFIC TESTING:                                   │
│   ├── Unit: Hooks, Utils, Pure functions                    │
│   ├── Integration: Component + Context/State                │
│   └── E2E: Critical user flows                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Testing Trophy (Kent C. Dodds)

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING TROPHY                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                         E2E                                  │
│                      ┌───────┐                              │
│                     /         \                              │
│                    /           \                             │
│   Integration    ┌───────────────┐   <-- Focus here!        │
│                 /                 \                          │
│                /                   \                         │
│   Unit        ┌─────────────────────┐                       │
│              /                       \                       │
│   Static    ┌─────────────────────────┐  TypeScript/ESLint  │
│                                                              │
│   KEY INSIGHT:                                               │
│   "Write tests. Not too many. Mostly integration."          │
│                                                              │
│   Integration tests give the best ROI because they:         │
│   ├── Test real user behavior                               │
│   ├── Catch more bugs than unit tests                       │
│   ├── More stable than E2E tests                            │
│   └── Faster than E2E tests                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Project Test Setup

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)'
  ]
};

// jest.setup.ts
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`
    };
  }
});
```

---

## Q6.2: Unit Testing React Hooks

### Câu hỏi
Làm thế nào để unit test custom hooks hiệu quả?

### Trả lời

#### Testing với @testing-library/react-hooks

```typescript
// hooks/useCounter.ts
import { useState, useCallback } from 'react';

interface UseCounterOptions {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export function useCounter({
  initialValue = 0,
  min = -Infinity,
  max = Infinity,
  step = 1
}: UseCounterOptions = {}) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => Math.min(prev + step, max));
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount(prev => Math.max(prev - step, min));
  }, [step, min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const setValue = useCallback((value: number) => {
    setCount(Math.max(min, Math.min(value, max)));
  }, [min, max]);

  return {
    count,
    increment,
    decrement,
    reset,
    setValue,
    isAtMin: count <= min,
    isAtMax: count >= max
  };
}

// hooks/__tests__/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  describe('initialization', () => {
    it('should initialize with default value of 0', () => {
      const { result } = renderHook(() => useCounter());
      expect(result.current.count).toBe(0);
    });

    it('should initialize with provided initial value', () => {
      const { result } = renderHook(() => useCounter({ initialValue: 10 }));
      expect(result.current.count).toBe(10);
    });
  });

  describe('increment', () => {
    it('should increment by 1 by default', () => {
      const { result } = renderHook(() => useCounter());

      act(() => {
        result.current.increment();
      });

      expect(result.current.count).toBe(1);
    });

    it('should increment by custom step', () => {
      const { result } = renderHook(() => useCounter({ step: 5 }));

      act(() => {
        result.current.increment();
      });

      expect(result.current.count).toBe(5);
    });

    it('should not exceed max value', () => {
      const { result } = renderHook(() =>
        useCounter({ initialValue: 9, max: 10 })
      );

      act(() => {
        result.current.increment();
        result.current.increment();
      });

      expect(result.current.count).toBe(10);
      expect(result.current.isAtMax).toBe(true);
    });
  });

  describe('decrement', () => {
    it('should not go below min value', () => {
      const { result } = renderHook(() =>
        useCounter({ initialValue: 1, min: 0 })
      );

      act(() => {
        result.current.decrement();
        result.current.decrement();
      });

      expect(result.current.count).toBe(0);
      expect(result.current.isAtMin).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial value', () => {
      const { result } = renderHook(() => useCounter({ initialValue: 5 }));

      act(() => {
        result.current.increment();
        result.current.increment();
        result.current.reset();
      });

      expect(result.current.count).toBe(5);
    });
  });

  describe('setValue', () => {
    it('should set value within bounds', () => {
      const { result } = renderHook(() =>
        useCounter({ min: 0, max: 100 })
      );

      act(() => {
        result.current.setValue(50);
      });

      expect(result.current.count).toBe(50);
    });

    it('should clamp value to bounds', () => {
      const { result } = renderHook(() =>
        useCounter({ min: 0, max: 100 })
      );

      act(() => {
        result.current.setValue(150);
      });

      expect(result.current.count).toBe(100);

      act(() => {
        result.current.setValue(-50);
      });

      expect(result.current.count).toBe(0);
    });
  });

  describe('with changing options', () => {
    it('should update when options change', () => {
      const { result, rerender } = renderHook(
        ({ step }) => useCounter({ step }),
        { initialProps: { step: 1 } }
      );

      act(() => {
        result.current.increment();
      });
      expect(result.current.count).toBe(1);

      rerender({ step: 10 });

      act(() => {
        result.current.increment();
      });
      expect(result.current.count).toBe(11);
    });
  });
});
```

#### Testing Async Hooks

```typescript
// hooks/useAsync.ts
import { useState, useCallback, useEffect, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  status: 'idle' | 'pending' | 'success' | 'error';
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    status: 'idle'
  });

  const isMounted = useRef(true);

  const execute = useCallback(async () => {
    setState({ data: null, error: null, status: 'pending' });

    try {
      const data = await asyncFunction();
      if (isMounted.current) {
        setState({ data, error: null, status: 'success' });
      }
      return data;
    } catch (error) {
      if (isMounted.current) {
        setState({ data: null, error: error as Error, status: 'error' });
      }
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    isMounted.current = true;

    if (immediate) {
      execute();
    }

    return () => {
      isMounted.current = false;
    };
  }, [execute, immediate]);

  return { ...state, execute };
}

// hooks/__tests__/useAsync.test.ts
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsync } from '../useAsync';

describe('useAsync', () => {
  it('should handle successful async operation', async () => {
    const mockData = { id: 1, name: 'Test' };
    const asyncFn = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useAsync(asyncFn));

    // Initially pending
    expect(result.current.status).toBe('pending');

    // Wait for success
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle failed async operation', async () => {
    const error = new Error('Failed');
    const asyncFn = jest.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useAsync(asyncFn));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(error);
  });

  it('should not execute immediately when immediate is false', () => {
    const asyncFn = jest.fn().mockResolvedValue('data');

    const { result } = renderHook(() => useAsync(asyncFn, false));

    expect(result.current.status).toBe('idle');
    expect(asyncFn).not.toHaveBeenCalled();
  });

  it('should allow manual execution', async () => {
    const asyncFn = jest.fn().mockResolvedValue('data');

    const { result } = renderHook(() => useAsync(asyncFn, false));

    act(() => {
      result.current.execute();
    });

    expect(result.current.status).toBe('pending');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(asyncFn).toHaveBeenCalledTimes(1);
  });

  it('should not update state if unmounted', async () => {
    const asyncFn = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('data'), 100))
    );

    const { result, unmount } = renderHook(() => useAsync(asyncFn));

    expect(result.current.status).toBe('pending');

    // Unmount before async completes
    unmount();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should not have updated (no error thrown)
    expect(asyncFn).toHaveBeenCalled();
  });
});
```

---

## Q6.3: Component Integration Testing

### Câu hỏi
Làm thế nào để viết integration tests cho React components?

### Trả lời

#### Testing Component với Context và State

```typescript
// components/ShoppingCart/ShoppingCart.tsx
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/formatters';

export function ShoppingCart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <p>Your cart is empty</p>
        <a href="/products">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      {user && <p>Welcome, {user.name}!</p>}

      <ul className="cart-items">
        {items.map(item => (
          <li key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>{formatCurrency(item.price)}</p>
            </div>
            <div className="quantity-controls">
              <button
                aria-label="Decrease quantity"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <button
              aria-label={`Remove ${item.name} from cart`}
              onClick={() => removeItem(item.id)}
              className="remove-btn"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <p>Total: {formatCurrency(total)}</p>
        <button className="checkout-btn">Proceed to Checkout</button>
      </div>
    </div>
  );
}

// components/ShoppingCart/__tests__/ShoppingCart.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingCart } from '../ShoppingCart';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Test utilities
function renderWithProviders(
  ui: React.ReactElement,
  {
    initialCart = [],
    user = null
  }: {
    initialCart?: CartItem[];
    user?: User | null;
  } = {}
) {
  return render(
    <AuthProvider initialUser={user}>
      <CartProvider initialItems={initialCart}>
        {ui}
      </CartProvider>
    </AuthProvider>
  );
}

const mockCartItems: CartItem[] = [
  { id: '1', name: 'Product 1', price: 29.99, quantity: 2, image: '/img1.jpg' },
  { id: '2', name: 'Product 2', price: 49.99, quantity: 1, image: '/img2.jpg' }
];

const mockUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com'
};

describe('ShoppingCart', () => {
  describe('empty state', () => {
    it('should display empty message when cart is empty', () => {
      renderWithProviders(<ShoppingCart />);

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText('Continue Shopping')).toHaveAttribute('href', '/products');
    });
  });

  describe('with items', () => {
    it('should display all cart items', () => {
      renderWithProviders(<ShoppingCart />, { initialCart: mockCartItems });

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });

    it('should display correct quantities', () => {
      renderWithProviders(<ShoppingCart />, { initialCart: mockCartItems });

      const items = screen.getAllByRole('listitem');

      expect(within(items[0]).getByText('2')).toBeInTheDocument();
      expect(within(items[1]).getByText('1')).toBeInTheDocument();
    });

    it('should display correct total', () => {
      renderWithProviders(<ShoppingCart />, { initialCart: mockCartItems });

      // Total = (29.99 * 2) + (49.99 * 1) = 109.97
      expect(screen.getByText('Total: $109.97')).toBeInTheDocument();
    });

    it('should show welcome message when user is logged in', () => {
      renderWithProviders(<ShoppingCart />, {
        initialCart: mockCartItems,
        user: mockUser
      });

      expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should increase quantity when + button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShoppingCart />, { initialCart: mockCartItems });

      const items = screen.getAllByRole('listitem');
      const increaseBtn = within(items[0]).getByLabelText('Increase quantity');

      await user.click(increaseBtn);

      expect(within(items[0]).getByText('3')).toBeInTheDocument();
    });

    it('should decrease quantity when - button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShoppingCart />, { initialCart: mockCartItems });

      const items = screen.getAllByRole('listitem');
      const decreaseBtn = within(items[0]).getByLabelText('Decrease quantity');

      await user.click(decreaseBtn);

      expect(within(items[0]).getByText('1')).toBeInTheDocument();
    });

    it('should disable decrease button when quantity is 1', () => {
      renderWithProviders(<ShoppingCart />, { initialCart: mockCartItems });

      const items = screen.getAllByRole('listitem');
      const decreaseBtn = within(items[1]).getByLabelText('Decrease quantity');

      expect(decreaseBtn).toBeDisabled();
    });

    it('should remove item when remove button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShoppingCart />, { initialCart: mockCartItems });

      const removeBtn = screen.getByLabelText('Remove Product 1 from cart');
      await user.click(removeBtn);

      expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });

    it('should update total when quantity changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ShoppingCart />, { initialCart: mockCartItems });

      const items = screen.getAllByRole('listitem');
      const increaseBtn = within(items[0]).getByLabelText('Increase quantity');

      await user.click(increaseBtn);

      // New total = (29.99 * 3) + (49.99 * 1) = 139.96
      expect(screen.getByText('Total: $139.96')).toBeInTheDocument();
    });
  });
});
```

#### Custom Render với All Providers

```typescript
// test-utils/render.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: User | null;
  initialRoute?: string;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  });
}

function AllProviders({
  children,
  initialUser
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export function customRender(
  ui: ReactElement,
  { initialUser, initialRoute = '/', ...options }: CustomRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', initialRoute);

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialUser={initialUser}>{children}</AllProviders>
    ),
    ...options
  });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
```

---

## Q6.4: Mocking API Calls với MSW

### Câu hỏi
Làm thế nào để mock API calls trong tests một cách hiệu quả?

### Trả lời

#### Setup MSW (Mock Service Worker)

```typescript
// mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  // GET users
  http.get('/api/users', async () => {
    await delay(100);
    return HttpResponse.json([
      { id: '1', name: 'John', email: 'john@example.com' },
      { id: '2', name: 'Jane', email: 'jane@example.com' }
    ]);
  }),

  // GET single user
  http.get('/api/users/:id', async ({ params }) => {
    const { id } = params;

    if (id === 'not-found') {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      id,
      name: 'John',
      email: 'john@example.com'
    });
  }),

  // POST user
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json(
      {
        id: 'new-id',
        ...body
      },
      { status: 201 }
    );
  }),

  // PUT user
  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();

    return HttpResponse.json({
      id,
      ...body
    });
  }),

  // DELETE user
  http.delete('/api/users/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Login
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();

    if (email === 'invalid@example.com') {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      user: { id: '1', name: 'John', email },
      token: 'mock-jwt-token'
    });
  })
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// mocks/browser.ts (for Storybook/development)
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

#### Testing với MSW

```typescript
// features/users/__tests__/UserList.test.tsx
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { UserList } from '../UserList';

describe('UserList', () => {
  it('should display loading state initially', () => {
    render(<UserList />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display users after loading', async () => {
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
  });

  it('should display error message on API failure', async () => {
    // Override handler for this test
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json(
          { message: 'Server error' },
          { status: 500 }
        );
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });

  it('should display empty state when no users', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json([]);
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('should delete user and update list', async () => {
    const user = userEvent.setup();
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    const deleteBtn = screen.getAllByRole('button', { name: /delete/i })[0];
    await user.click(deleteBtn);

    // Confirm dialog
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(screen.queryByText('John')).not.toBeInTheDocument();
    });
  });
});

// Testing Login form with MSW
describe('LoginForm', () => {
  it('should login successfully', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    render(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        user: expect.objectContaining({ email: 'john@example.com' }),
        token: 'mock-jwt-token'
      });
    });
  });

  it('should display error on invalid credentials', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSuccess={jest.fn()} />);

    await user.type(screen.getByLabelText('Email'), 'invalid@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should disable button while submitting', async () => {
    const user = userEvent.setup();

    // Add delay to handler
    server.use(
      http.post('/api/auth/login', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({ user: {}, token: '' });
      })
    );

    render(<LoginForm onSuccess={jest.fn()} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');

    const submitBtn = screen.getByRole('button', { name: 'Login' });
    await user.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });
});
```

---

## Q6.5: Testing React Query

### Câu hỏi
Làm thế nào để test components sử dụng React Query hiệu quả?

### Trả lời

```typescript
// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/api/products';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdate }) =>
      productsApi.update(id, data),
    onSuccess: (updatedProduct) => {
      // Update cache directly
      queryClient.setQueryData(
        ['products', updatedProduct.id],
        updatedProduct
      );
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}

// hooks/__tests__/useProducts.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { useProducts, useProduct, useCreateProduct } from '../useProducts';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useProducts', () => {
  it('should fetch products successfully', async () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('should fetch with filters', async () => {
    server.use(
      http.get('/api/products', ({ request }) => {
        const url = new URL(request.url);
        const category = url.searchParams.get('category');

        if (category === 'electronics') {
          return HttpResponse.json([
            { id: '1', name: 'Phone', category: 'electronics' }
          ]);
        }

        return HttpResponse.json([]);
      })
    );

    const { result } = renderHook(
      () => useProducts({ category: 'electronics' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].category).toBe('electronics');
  });

  it('should handle error', async () => {
    server.use(
      http.get('/api/products', () => {
        return HttpResponse.json(
          { message: 'Server error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useProduct', () => {
  it('should fetch single product', async () => {
    server.use(
      http.get('/api/products/:id', ({ params }) => {
        return HttpResponse.json({
          id: params.id,
          name: 'Test Product',
          price: 99.99
        });
      })
    );

    const { result } = renderHook(() => useProduct('123'), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('Test Product');
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => useProduct(''), {
      wrapper: createWrapper()
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateProduct', () => {
  it('should create product and invalidate cache', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });

    // Pre-populate cache
    queryClient.setQueryData(['products'], [{ id: '1', name: 'Existing' }]);

    server.use(
      http.post('/api/products', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({ id: 'new', ...body }, { status: 201 });
      }),
      http.get('/api/products', () => {
        return HttpResponse.json([
          { id: '1', name: 'Existing' },
          { id: 'new', name: 'New Product' }
        ]);
      })
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateProduct(), { wrapper });

    await result.current.mutateAsync({
      name: 'New Product',
      price: 49.99
    });

    // Cache should be invalidated and refetched
    await waitFor(() => {
      const products = queryClient.getQueryData(['products']);
      expect(products).toHaveLength(2);
    });
  });
});
```

---

## Q6.6: End-to-End Testing với Playwright

### Câu hỏi
Làm thế nào để setup và viết E2E tests với Playwright cho React app?

### Trả lời

#### Playwright Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});
```

#### Page Object Model

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
    this.rememberMeCheckbox = page.getByLabel('Remember me');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }

    await this.submitButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }
}

// e2e/pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly sidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.getByTestId('welcome-message');
    this.userMenu = page.getByTestId('user-menu');
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    this.sidebar = page.getByRole('navigation');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }

  async navigateTo(menuItem: string) {
    await this.sidebar.getByRole('link', { name: menuItem }).click();
  }
}

// e2e/pages/ProductsPage.ts
import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly productGrid: Locator;
  readonly filterDropdown: Locator;
  readonly addProductButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Search products...');
    this.productGrid = page.getByTestId('product-grid');
    this.filterDropdown = page.getByRole('combobox', { name: 'Filter' });
    this.addProductButton = page.getByRole('button', { name: 'Add Product' });
  }

  async goto() {
    await this.page.goto('/products');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async filterByCategory(category: string) {
    await this.filterDropdown.selectOption(category);
  }

  async getProductCount() {
    return this.productGrid.locator('[data-testid="product-card"]').count();
  }

  async clickProduct(name: string) {
    await this.productGrid
      .locator('[data-testid="product-card"]')
      .filter({ hasText: name })
      .click();
  }
}
```

#### E2E Tests

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('john@example.com', 'password123');

    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardPage.welcomeMessage).toContainText('Welcome, John');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/login?redirect=/dashboard');
  });

  test('should persist session with remember me', async ({ page, context }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('john@example.com', 'password123', true);

    await expect(page).toHaveURL('/dashboard');

    // Check cookie is set
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name === 'auth-token');
    expect(authCookie?.expires).toBeGreaterThan(Date.now() / 1000);
  });

  test('should logout successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('john@example.com', 'password123');
    await dashboardPage.logout();

    await expect(page).toHaveURL('/login');

    // Try accessing protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});

// e2e/products.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';

test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('john@example.com', 'password123');
  });

  test('should display products list', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    const count = await productsPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should search products', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await productsPage.search('laptop');

    // Wait for results
    await page.waitForResponse(resp =>
      resp.url().includes('/api/products') && resp.status() === 200
    );

    const products = await page.getByTestId('product-card').all();
    for (const product of products) {
      await expect(product).toContainText(/laptop/i);
    }
  });

  test('should filter by category', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await productsPage.filterByCategory('electronics');

    await page.waitForLoadState('networkidle');

    const count = await productsPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to product details', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await productsPage.clickProduct('Test Product');

    await expect(page).toHaveURL(/\/products\/\w+/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Test Product');
  });
});

// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('complete purchase flow', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Navigate to products
    await page.goto('/products');

    // Add product to cart
    await page.getByTestId('product-card').first().click();
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Verify cart updated
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    // Go to cart
    await page.getByTestId('cart-icon').click();
    await expect(page).toHaveURL('/cart');

    // Proceed to checkout
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL('/checkout');

    // Fill shipping info
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('City').fill('New York');
    await page.getByLabel('ZIP').fill('10001');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Fill payment info
    await page.getByLabel('Card Number').fill('4111111111111111');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Verify success
    await expect(page).toHaveURL(/\/orders\/\w+/);
    await expect(page.getByRole('heading')).toContainText('Order Confirmed');
  });
});
```

---

## Q6.7: Snapshot Testing và Visual Regression

### Câu hỏi
Khi nào nên dùng Snapshot Testing? Làm thế nào để implement Visual Regression Testing?

### Trả lời

#### Snapshot Testing với Jest

```typescript
// components/Card/__tests__/Card.test.tsx
import { render } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <Card title="Test Title" description="Test description">
        <p>Card content</p>
      </Card>
    );

    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with different variants', () => {
    const { container: primary } = render(
      <Card variant="primary" title="Primary" />
    );
    const { container: secondary } = render(
      <Card variant="secondary" title="Secondary" />
    );
    const { container: outlined } = render(
      <Card variant="outlined" title="Outlined" />
    );

    expect(primary).toMatchSnapshot('primary variant');
    expect(secondary).toMatchSnapshot('secondary variant');
    expect(outlined).toMatchSnapshot('outlined variant');
  });
});

// Inline snapshot
it('should render correct structure', () => {
  const { container } = render(<Button>Click me</Button>);

  expect(container.innerHTML).toMatchInlineSnapshot(`
    "<button class="btn btn-primary">Click me</button>"
  `);
});
```

#### When to Use Snapshot Testing

```
┌─────────────────────────────────────────────────────────────┐
│              SNAPSHOT TESTING GUIDELINES                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   GOOD USE CASES:                                           │
│   ├── UI component structure verification                   │
│   ├── Serialized data structures (JSON, configs)            │
│   ├── Error messages                                        │
│   ├── API response shapes                                   │
│   └── Generated code/markup                                 │
│                                                              │
│   BAD USE CASES:                                            │
│   ├── Large, frequently changing components                 │
│   ├── Components with dynamic content (dates, IDs)          │
│   ├── Business logic testing                                │
│   └── User interaction testing                              │
│                                                              │
│   BEST PRACTICES:                                           │
│   ├── Keep snapshots small and focused                      │
│   ├── Review snapshot diffs carefully                       │
│   ├── Use inline snapshots for small outputs                │
│   ├── Delete obsolete snapshots                             │
│   └── Don't blindly update snapshots                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Visual Regression với Playwright

```typescript
// playwright.config.ts
export default defineConfig({
  // ...
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2
    }
  }
});

// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage should match screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true
    });
  });

  test('login page should match screenshot', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveScreenshot('login-page.png');
  });

  test('button variants should match screenshots', async ({ page }) => {
    await page.goto('/components/button');

    // Individual component screenshots
    await expect(page.getByTestId('btn-primary')).toHaveScreenshot('btn-primary.png');
    await expect(page.getByTestId('btn-secondary')).toHaveScreenshot('btn-secondary.png');
    await expect(page.getByTestId('btn-disabled')).toHaveScreenshot('btn-disabled.png');
  });

  test('responsive layouts', async ({ page }) => {
    await page.goto('/dashboard');

    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page).toHaveScreenshot('dashboard-desktop.png');

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('dashboard-tablet.png');

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('dashboard-mobile.png');
  });

  test('dark mode', async ({ page }) => {
    await page.goto('/');

    // Light mode
    await expect(page).toHaveScreenshot('homepage-light.png');

    // Toggle dark mode
    await page.getByRole('button', { name: 'Toggle theme' }).click();

    await expect(page).toHaveScreenshot('homepage-dark.png');
  });
});
```

#### Storybook Visual Testing với Chromatic

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};

export default config;

// components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    chromatic: { viewports: [320, 768, 1200] }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary'
  }
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary'
  }
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button disabled>Disabled</Button>
      <Button isLoading>Loading</Button>
    </div>
  )
};

// Interaction test
export const WithInteraction: Story = {
  args: {
    children: 'Click me'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.hover(button);
    // Chromatic captures hover state
  }
};
```

---

## Q6.8: Testing Best Practices và CI Integration

### Câu hỏi
Những best practices nào cần tuân theo khi testing React app? Làm thế nào để integrate vào CI/CD?

### Trả lời

#### Testing Best Practices

```typescript
// 1. Test behavior, not implementation
// BAD - Testing implementation
it('should set loading state', () => {
  const { result } = renderHook(() => useUsers());
  expect(result.current.loading).toBe(true);
});

// GOOD - Testing behavior
it('should show loading indicator while fetching', async () => {
  render(<UserList />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

// 2. Use accessible queries
// BAD
screen.getByClassName('submit-btn');
screen.getByTestId('submit');

// GOOD - By role (best)
screen.getByRole('button', { name: 'Submit' });

// GOOD - By label
screen.getByLabelText('Email');

// GOOD - By text
screen.getByText('Welcome');

// OK - By testId (when no better option)
screen.getByTestId('complex-animation');

// 3. Avoid testing third-party libraries
// BAD - Testing React Query's behavior
it('should cache data', async () => {
  // Testing React Query's caching...
});

// GOOD - Testing your usage of the library
it('should display cached data immediately on revisit', async () => {
  // Navigate away and back, check data appears without loading
});

// 4. Use userEvent over fireEvent
// BAD
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'test' } });

// GOOD
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'test');

// 5. Arrange-Act-Assert pattern
it('should update quantity', async () => {
  // Arrange
  const user = userEvent.setup();
  render(<CartItem item={mockItem} />);

  // Act
  await user.click(screen.getByLabelText('Increase quantity'));

  // Assert
  expect(screen.getByText('2')).toBeInTheDocument();
});

// 6. One assertion focus per test
// BAD - Multiple concerns
it('should work correctly', async () => {
  render(<Form />);
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  await user.type(emailInput, 'invalid');
  expect(screen.getByText('Invalid email')).toBeInTheDocument();
  await user.type(emailInput, 'valid@example.com');
  expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
  await user.click(submitBtn);
  expect(mockSubmit).toHaveBeenCalled();
});

// GOOD - Focused tests
it('should display email field', () => {
  render(<Form />);
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
});

it('should show validation error for invalid email', async () => {
  const user = userEvent.setup();
  render(<Form />);
  await user.type(screen.getByLabelText('Email'), 'invalid');
  expect(screen.getByText('Invalid email')).toBeInTheDocument();
});

it('should clear error when email becomes valid', async () => {
  // ...
});

it('should submit form with valid data', async () => {
  // ...
});
```

#### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true
```

#### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:visual": "playwright test --config=playwright.visual.config.ts",
    "test:update-snapshots": "jest -u && playwright test --update-snapshots",
    "coverage": "jest --coverage && open coverage/lcov-report/index.html"
  }
}
```

#### Test Quality Metrics

```
┌─────────────────────────────────────────────────────────────┐
│                  TEST QUALITY METRICS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   CODE COVERAGE TARGETS:                                    │
│   ├── Statements: >= 80%                                    │
│   ├── Branches: >= 80%                                      │
│   ├── Functions: >= 80%                                     │
│   └── Lines: >= 80%                                         │
│                                                              │
│   BUT REMEMBER:                                              │
│   - 100% coverage ≠ bug-free code                           │
│   - Focus on critical paths                                 │
│   - Test edge cases                                         │
│   - Integration > Unit for ROI                              │
│                                                              │
│   MUTATION TESTING (Optional):                              │
│   - Use Stryker for mutation testing                        │
│   - Helps find weak tests                                   │
│   - Target: >= 80% mutation score                           │
│                                                              │
│   TEST PERFORMANCE:                                         │
│   ├── Unit tests: < 5 minutes                               │
│   ├── Integration tests: < 10 minutes                       │
│   └── E2E tests: < 20 minutes                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tổng kết

| Test Type | Tools | Speed | Confidence | Use For |
|-----------|-------|-------|------------|---------|
| Unit | Jest, RTL | Fast | Low-Medium | Hooks, Utils |
| Integration | RTL, MSW | Medium | High | Components + State |
| E2E | Playwright | Slow | Very High | Critical Flows |
| Visual | Chromatic | Medium | Medium | UI Regression |
| Snapshot | Jest | Fast | Low | Structure verification |

**Key Takeaways:**
1. Write tests that test user behavior, not implementation
2. Use Testing Library's accessible queries
3. Mock at the network level (MSW), not at the module level
4. Focus on integration tests for best ROI
5. Keep E2E tests for critical user journeys only
6. Automate everything in CI/CD
