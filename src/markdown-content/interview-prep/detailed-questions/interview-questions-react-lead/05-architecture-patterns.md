# 05 - Architecture & Design Patterns

> **10 câu hỏi chuyên sâu về Kiến trúc và Design Patterns trong React**

---

## Q5.1: Folder Structure cho Large-Scale React Application

### Câu hỏi
Bạn sẽ tổ chức folder structure như thế nào cho một React application lớn với 50+ developers?

### Trả lời

#### Feature-Based Structure (Recommended)

```
src/
├── app/                          # App-level setup
│   ├── providers/                # All providers wrapped
│   ├── routes/                   # Route configuration
│   ├── store/                    # Global store setup
│   └── App.tsx
│
├── features/                     # Feature modules
│   ├── auth/
│   │   ├── api/                  # API calls
│   │   │   ├── authApi.ts
│   │   │   └── authApi.test.ts
│   │   ├── components/           # Feature-specific components
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   ├── LoginForm.styles.ts
│   │   │   │   └── index.ts
│   │   │   └── RegisterForm/
│   │   ├── hooks/                # Feature-specific hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useAuth.test.ts
│   │   ├── stores/               # Feature state
│   │   │   └── authStore.ts
│   │   ├── types/                # Feature types
│   │   │   └── auth.types.ts
│   │   ├── utils/                # Feature utilities
│   │   │   └── authHelpers.ts
│   │   └── index.ts              # Public API
│   │
│   ├── dashboard/
│   ├── products/
│   └── orders/
│
├── shared/                       # Shared across features
│   ├── components/               # Reusable UI components
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Form/
│   │   └── index.ts
│   ├── hooks/                    # Shared hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── index.ts
│   ├── types/                    # Shared types
│   │   ├── common.types.ts
│   │   └── api.types.ts
│   ├── constants/                # Constants
│   │   └── config.ts
│   └── services/                 # External services
│       ├── api.ts
│       ├── storage.ts
│       └── analytics.ts
│
├── assets/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
└── styles/                       # Global styles
    ├── variables.css
    ├── reset.css
    └── global.css
```

#### Feature Module Pattern

```typescript
// features/products/index.ts - Public API
// Only export what other features need

// Components
export { ProductList } from './components/ProductList';
export { ProductCard } from './components/ProductCard';
export { ProductDetails } from './components/ProductDetails';

// Hooks
export { useProducts } from './hooks/useProducts';
export { useProductFilters } from './hooks/useProductFilters';

// Types
export type { Product, ProductFilter } from './types/product.types';

// Do NOT export internal implementation details
// - Internal components
// - Store implementation
// - API implementation
```

#### Dependency Rules

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPENDENCY RULES                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐                                           │
│   │    app/     │  Can import from: features/, shared/      │
│   └──────┬──────┘                                           │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │  features/  │  Can import from: shared/                 │
│   │             │  Can import from: other features (public) │
│   └──────┬──────┘                                           │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │   shared/   │  Can import from: shared/ only            │
│   │             │  CANNOT import from: features/, app/      │
│   └─────────────┘                                           │
│                                                              │
│   RULE: No circular dependencies between features           │
│   RULE: shared/ is completely independent                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### ESLint Rules để Enforce

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // shared cannot import from features
          {
            target: './src/shared',
            from: './src/features',
            message: 'shared/ cannot import from features/'
          },
          // shared cannot import from app
          {
            target: './src/shared',
            from: './src/app',
            message: 'shared/ cannot import from app/'
          },
          // features cannot import internal from other features
          {
            target: './src/features/auth',
            from: './src/features/products',
            except: ['./index.ts'],
            message: 'Import only from public API (index.ts)'
          }
        ]
      }
    ]
  }
};
```

---

## Q5.2: Design Patterns trong React

### Câu hỏi
Giải thích các Design Patterns phổ biến trong React và khi nào sử dụng?

### Trả lời

#### 1. Compound Component Pattern

```typescript
// Cho phép components chia sẻ implicit state
// Ví dụ: Select component với options

import { createContext, useContext, useState, ReactNode } from 'react';

// Context for compound components
interface SelectContextType {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within Select');
  }
  return context;
}

// Main component
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

function Select({ value, onChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onChange, isOpen, setIsOpen }}>
      <div className="select-container">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// Sub-components
function SelectTrigger({ children }: { children: ReactNode }) {
  const { isOpen, setIsOpen, value } = useSelectContext();

  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {children || value || 'Select...'}
    </button>
  );
}

function SelectOptions({ children }: { children: ReactNode }) {
  const { isOpen } = useSelectContext();

  if (!isOpen) return null;

  return <ul className="select-options">{children}</ul>;
}

function SelectOption({ value, children }: { value: string; children: ReactNode }) {
  const { onChange, setIsOpen, value: selectedValue } = useSelectContext();

  return (
    <li
      className={selectedValue === value ? 'selected' : ''}
      onClick={() => {
        onChange(value);
        setIsOpen(false);
      }}
    >
      {children}
    </li>
  );
}

// Attach sub-components
Select.Trigger = SelectTrigger;
Select.Options = SelectOptions;
Select.Option = SelectOption;

// Usage
function App() {
  const [country, setCountry] = useState('');

  return (
    <Select value={country} onChange={setCountry}>
      <Select.Trigger>Choose a country</Select.Trigger>
      <Select.Options>
        <Select.Option value="us">United States</Select.Option>
        <Select.Option value="uk">United Kingdom</Select.Option>
        <Select.Option value="vn">Vietnam</Select.Option>
      </Select.Options>
    </Select>
  );
}
```

#### 2. Render Props Pattern

```typescript
// Chia sẻ logic qua render function

interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  render: (position: MousePosition) => ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <>{render(position)}</>;
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

// Alternative: Children as function
interface MouseTrackerChildrenProps {
  children: (position: MousePosition) => ReactNode;
}

function MouseTrackerWithChildren({ children }: MouseTrackerChildrenProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <>{children(position)}</>;
}

// Usage
<MouseTrackerWithChildren>
  {({ x, y }) => <div>Position: {x}, {y}</div>}
</MouseTrackerWithChildren>
```

#### 3. Higher-Order Component (HOC) Pattern

```typescript
// Wrap component để thêm functionality

interface WithLoadingProps {
  isLoading: boolean;
}

function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithLoadingComponent(props: P & WithLoadingProps) {
    const { isLoading, ...restProps } = props;

    if (isLoading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    return <WrappedComponent {...(restProps as P)} />;
  };
}

// Usage
interface UserListProps {
  users: User[];
}

function UserList({ users }: UserListProps) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

const UserListWithLoading = withLoading(UserList);

// In parent
<UserListWithLoading users={users} isLoading={loading} />

// HOC với authentication
function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  redirectTo: string = '/login'
) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate(redirectTo);
      }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

const ProtectedDashboard = withAuth(Dashboard);
```

#### 4. Custom Hook Pattern (Recommended)

```typescript
// Thay thế HOC và Render Props trong hầu hết cases

function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}

// useAuth hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus().then(user => {
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  const login = async (credentials: Credentials) => {
    setIsLoading(true);
    const user = await loginApi(credentials);
    setUser(user);
    setIsLoading(false);
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };
}

// Usage - much cleaner than HOC
function Dashboard() {
  const { x, y } = useMousePosition();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Mouse: {x}, {y}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### 5. Provider Pattern

```typescript
// Centralized state management với Context

// Theme Provider
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  }
};

const darkTheme: Theme = {
  colors: {
    primary: '#0d6efd',
    secondary: '#adb5bd',
    background: '#212529',
    text: '#f8f9fa'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  }
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, isDark, toggleTheme }),
    [theme, isDark, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Combine multiple providers
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

#### Pattern Selection Guide

```
┌─────────────────────────────────────────────────────────────┐
│              PATTERN SELECTION GUIDE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   USE CASE                          PATTERN                  │
│   ─────────────────────────────────────────────────────     │
│   Share logic between components    Custom Hooks            │
│   Share implicit state (UI libs)    Compound Components     │
│   Cross-cutting concerns (legacy)   HOC                     │
│   Flexible rendering                Render Props            │
│   App-wide state                    Provider Pattern        │
│   Component composition             Composition Pattern     │
│                                                              │
│   MODERN PREFERENCE ORDER:                                  │
│   1. Custom Hooks (most cases)                              │
│   2. Compound Components (UI libraries)                     │
│   3. Provider Pattern (global state)                        │
│   4. Composition (layout/structure)                         │
│   5. Render Props (very flexible rendering)                 │
│   6. HOC (legacy code, rare cases)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Q5.3: Container/Presentational Pattern và hiện đại hóa

### Câu hỏi
Container/Presentational Pattern còn phù hợp không? Cách tiếp cận hiện đại là gì?

### Trả lời

#### Classic Container/Presentational (Legacy)

```typescript
// Presentational Component - Pure UI, no logic
interface UserListProps {
  users: User[];
  isLoading: boolean;
  onUserClick: (user: User) => void;
}

function UserList({ users, isLoading, onUserClick }: UserListProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ul className="user-list">
      {users.map(user => (
        <li key={user.id} onClick={() => onUserClick(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}

// Container Component - Logic only
function UserListContainer() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setIsLoading(false);
    });
  }, []);

  const handleUserClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  return (
    <UserList
      users={users}
      isLoading={isLoading}
      onUserClick={handleUserClick}
    />
  );
}
```

#### Modern Approach: Custom Hooks + Components

```typescript
// Custom Hook - All the logic
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchUsers()
      .then(data => {
        if (!cancelled) {
          setUsers(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { users, isLoading, error };
}

// Component - Uses hook directly
function UserList() {
  const { users, isLoading, error } = useUsers();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul className="user-list">
      {users.map(user => (
        <li key={user.id} onClick={() => navigate(`/users/${user.id}`)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}

// Even more modern: React Query
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
}

function UserList() {
  const { data: users, isLoading, error } = useUsers();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul>
      {users?.map(user => (
        <UserItem
          key={user.id}
          user={user}
          onClick={() => navigate(`/users/${user.id}`)}
        />
      ))}
    </ul>
  );
}
```

#### When Each Approach Works

```
┌─────────────────────────────────────────────────────────────┐
│           CONTAINER/PRESENTATIONAL VS HOOKS                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   CONTAINER/PRESENTATIONAL still useful for:                │
│   ├── Design system components (Button, Input, Card)        │
│   ├── Storybook documentation                               │
│   ├── Components used in multiple contexts                  │
│   └── Clear separation needed for large teams               │
│                                                              │
│   CUSTOM HOOKS preferred for:                               │
│   ├── Feature-specific components                           │
│   ├── Data fetching logic                                   │
│   ├── Business logic                                        │
│   └── State management                                      │
│                                                              │
│   HYBRID APPROACH (Recommended):                            │
│   ├── Shared UI components → Pure/Presentational            │
│   ├── Feature components → Hooks + Component together       │
│   └── Complex logic → Extract to custom hooks               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Q5.4: Dependency Injection trong React

### Câu hỏi
Làm thế nào để implement Dependency Injection trong React?

### Trả lời

#### 1. Context-based DI

```typescript
// Service interfaces
interface Logger {
  log: (message: string) => void;
  error: (message: string, error?: Error) => void;
}

interface AnalyticsService {
  track: (event: string, data?: Record<string, unknown>) => void;
}

interface ApiClient {
  get: <T>(url: string) => Promise<T>;
  post: <T>(url: string, data: unknown) => Promise<T>;
}

// Service implementations
class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
  error(message: string, error?: Error) {
    console.error(`[ERROR] ${message}`, error);
  }
}

class ProductionLogger implements Logger {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  log(message: string) {
    fetch(this.endpoint, {
      method: 'POST',
      body: JSON.stringify({ level: 'log', message })
    });
  }

  error(message: string, error?: Error) {
    fetch(this.endpoint, {
      method: 'POST',
      body: JSON.stringify({
        level: 'error',
        message,
        stack: error?.stack
      })
    });
  }
}

// DI Container
interface Services {
  logger: Logger;
  analytics: AnalyticsService;
  apiClient: ApiClient;
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({
  services,
  children
}: {
  services: Services;
  children: ReactNode;
}) {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

// Hook to access services
export function useServices() {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices must be used within ServicesProvider');
  }
  return services;
}

// Individual service hooks
export function useLogger() {
  return useServices().logger;
}

export function useAnalytics() {
  return useServices().analytics;
}

export function useApiClient() {
  return useServices().apiClient;
}

// App setup
function App() {
  const services: Services = useMemo(() => ({
    logger: process.env.NODE_ENV === 'production'
      ? new ProductionLogger('/api/logs')
      : new ConsoleLogger(),
    analytics: new MixpanelAnalytics(process.env.MIXPANEL_TOKEN!),
    apiClient: new FetchApiClient(process.env.API_URL!)
  }), []);

  return (
    <ServicesProvider services={services}>
      <Router>
        <Routes />
      </Router>
    </ServicesProvider>
  );
}

// Usage in components
function UserProfile({ userId }: { userId: string }) {
  const logger = useLogger();
  const apiClient = useApiClient();
  const analytics = useAnalytics();

  useEffect(() => {
    logger.log(`Loading profile for user ${userId}`);
    analytics.track('profile_view', { userId });
  }, [userId, logger, analytics]);

  // ... rest of component
}
```

#### 2. Factory Pattern with DI

```typescript
// Factory để tạo components với dependencies
interface CreateUserFormOptions {
  userService: UserService;
  validationService: ValidationService;
  onSuccess?: (user: User) => void;
}

function createUserForm({
  userService,
  validationService,
  onSuccess
}: CreateUserFormOptions) {
  return function UserForm() {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();

      const validationErrors = validationService.validate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      try {
        const user = await userService.create(formData);
        onSuccess?.(user);
      } catch (error) {
        setErrors({ form: 'Failed to create user' });
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        {/* form fields */}
      </form>
    );
  };
}

// Usage
const AdminUserForm = createUserForm({
  userService: adminUserService,
  validationService: strictValidation,
  onSuccess: (user) => console.log('Admin created:', user)
});

const PublicUserForm = createUserForm({
  userService: publicUserService,
  validationService: basicValidation
});
```

#### 3. Props-based DI (Simple)

```typescript
// Inject dependencies via props
interface DataFetcherProps<T> {
  fetcher: () => Promise<T>;
  children: (data: T) => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: (error: Error) => ReactNode;
}

function DataFetcher<T>({
  fetcher,
  children,
  loadingComponent = <Loading />,
  errorComponent = (error) => <Error error={error} />
}: DataFetcherProps<T>) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetcher()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }));
  }, [fetcher]);

  if (state.loading) return <>{loadingComponent}</>;
  if (state.error) return <>{errorComponent(state.error)}</>;
  if (state.data) return <>{children(state.data)}</>;

  return null;
}

// Usage - inject different fetchers
<DataFetcher fetcher={fetchUsers}>
  {users => <UserList users={users} />}
</DataFetcher>

<DataFetcher fetcher={() => mockUsers}>
  {users => <UserList users={users} />}
</DataFetcher>
```

---

## Q5.5: Micro-Frontend Architecture

### Câu hỏi
Giải thích Micro-Frontend architecture và cách implement trong React?

### Trả lời

#### Micro-Frontend Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 MICRO-FRONTEND ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌─────────────────┐                      │
│                    │   Container     │                      │
│                    │   Application   │                      │
│                    └────────┬────────┘                      │
│                             │                                │
│         ┌───────────────────┼───────────────────┐           │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│   ┌───────────┐      ┌───────────┐      ┌───────────┐      │
│   │   Auth    │      │  Product  │      │  Checkout │      │
│   │   MFE     │      │   MFE     │      │    MFE    │      │
│   │           │      │           │      │           │      │
│   │  Team A   │      │  Team B   │      │  Team C   │      │
│   │  React 18 │      │  Vue 3    │      │  React 18 │      │
│   └───────────┘      └───────────┘      └───────────┘      │
│                                                              │
│   BENEFITS:                                                  │
│   ├── Independent deployments                               │
│   ├── Team autonomy                                         │
│   ├── Technology flexibility                                │
│   └── Scalable development                                  │
│                                                              │
│   CHALLENGES:                                                │
│   ├── Shared state                                          │
│   ├── Consistent UX                                         │
│   ├── Bundle size                                           │
│   └── Communication between MFEs                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Module Federation (Webpack 5)

```javascript
// webpack.config.js - Container App
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      remotes: {
        authApp: 'authApp@http://localhost:3001/remoteEntry.js',
        productApp: 'productApp@http://localhost:3002/remoteEntry.js',
        checkoutApp: 'checkoutApp@http://localhost:3003/remoteEntry.js'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'react-router-dom': { singleton: true }
      }
    })
  ]
};

// webpack.config.js - Auth MFE
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'authApp',
      filename: 'remoteEntry.js',
      exposes: {
        './AuthApp': './src/AuthApp',
        './LoginForm': './src/components/LoginForm',
        './useAuth': './src/hooks/useAuth'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
      }
    })
  ]
};
```

#### Container Application

```typescript
// Container App - Dynamic imports
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Dynamic imports from remote modules
const AuthApp = lazy(() => import('authApp/AuthApp'));
const ProductApp = lazy(() => import('productApp/ProductApp'));
const CheckoutApp = lazy(() => import('checkoutApp/CheckoutApp'));

function MFELoader({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<div>Failed to load module</div>}
      onError={(error) => {
        console.error('MFE Error:', error);
        // Report to monitoring service
      }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="container-app">
        <Header />
        <main>
          <Routes>
            <Route
              path="/auth/*"
              element={
                <MFELoader>
                  <AuthApp />
                </MFELoader>
              }
            />
            <Route
              path="/products/*"
              element={
                <MFELoader>
                  <ProductApp />
                </MFELoader>
              }
            />
            <Route
              path="/checkout/*"
              element={
                <MFELoader>
                  <CheckoutApp />
                </MFELoader>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
```

#### Cross-MFE Communication

```typescript
// Shared event bus
class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  publish(event: string, data?: unknown) {
    this.listeners.get(event)?.forEach(callback => {
      callback(data);
    });
  }
}

// Global event bus
const eventBus = new EventBus();
(window as any).__MFE_EVENT_BUS__ = eventBus;

// Hook for MFEs
function useEventBus() {
  const bus = (window as any).__MFE_EVENT_BUS__ as EventBus;

  const subscribe = useCallback((event: string, callback: Function) => {
    return bus.subscribe(event, callback);
  }, [bus]);

  const publish = useCallback((event: string, data?: unknown) => {
    bus.publish(event, data);
  }, [bus]);

  return { subscribe, publish };
}

// Auth MFE publishes login event
function LoginForm() {
  const { publish } = useEventBus();

  const handleLogin = async (credentials: Credentials) => {
    const user = await login(credentials);
    publish('auth:login', { user });
  };

  // ...
}

// Product MFE subscribes to auth events
function ProductApp() {
  const { subscribe } = useEventBus();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe('auth:login', ({ user }: { user: User }) => {
      setUser(user);
    });

    return unsubscribe;
  }, [subscribe]);

  // ...
}
```

#### Shared State với Custom Events

```typescript
// Shared auth state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Custom element for shared state
class SharedState extends HTMLElement {
  private _state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false
  };

  get state() {
    return this._state;
  }

  set state(newState: AuthState) {
    this._state = newState;
    this.dispatchEvent(new CustomEvent('state-change', {
      detail: newState,
      bubbles: true
    }));
  }

  updateState(partial: Partial<AuthState>) {
    this.state = { ...this._state, ...partial };
  }
}

customElements.define('shared-state', SharedState);

// React hook to use shared state
function useSharedAuthState() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const sharedState = document.querySelector('shared-state') as SharedState;

    if (sharedState) {
      setAuthState(sharedState.state);

      const handleChange = (e: CustomEvent<AuthState>) => {
        setAuthState(e.detail);
      };

      sharedState.addEventListener('state-change', handleChange as EventListener);

      return () => {
        sharedState.removeEventListener('state-change', handleChange as EventListener);
      };
    }
  }, []);

  const updateAuth = useCallback((partial: Partial<AuthState>) => {
    const sharedState = document.querySelector('shared-state') as SharedState;
    sharedState?.updateState(partial);
  }, []);

  return { authState, updateAuth };
}
```

---

## Q5.6: Clean Architecture trong React

### Câu hỏi
Làm thế nào để áp dụng Clean Architecture vào React application?

### Trả lời

#### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   CLEAN ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    PRESENTATION                      │   │
│   │         (React Components, Hooks, Context)          │   │
│   │                                                      │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │                APPLICATION                   │   │   │
│   │   │           (Use Cases, Services)             │   │   │
│   │   │                                              │   │   │
│   │   │   ┌─────────────────────────────────────┐   │   │   │
│   │   │   │              DOMAIN                  │   │   │   │
│   │   │   │     (Entities, Business Logic)      │   │   │   │
│   │   │   │                                      │   │   │   │
│   │   │   └─────────────────────────────────────┘   │   │   │
│   │   │                                              │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   INFRASTRUCTURE (APIs, Storage, External Services)         │
│                                                              │
│   DEPENDENCY RULE: Inner layers don't know outer layers     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Folder Structure

```
src/
├── domain/                    # Core business logic
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   └── Order.ts
│   ├── repositories/          # Repository interfaces
│   │   ├── IUserRepository.ts
│   │   └── IProductRepository.ts
│   ├── services/              # Domain services
│   │   └── PricingService.ts
│   └── value-objects/
│       ├── Email.ts
│       └── Money.ts
│
├── application/               # Use cases
│   ├── use-cases/
│   │   ├── user/
│   │   │   ├── CreateUser.ts
│   │   │   ├── GetUser.ts
│   │   │   └── UpdateUser.ts
│   │   └── product/
│   │       ├── GetProducts.ts
│   │       └── CreateProduct.ts
│   ├── dto/                   # Data Transfer Objects
│   │   ├── UserDTO.ts
│   │   └── ProductDTO.ts
│   └── services/              # Application services
│       └── NotificationService.ts
│
├── infrastructure/            # External implementations
│   ├── api/
│   │   ├── ApiClient.ts
│   │   ├── UserApi.ts
│   │   └── ProductApi.ts
│   ├── repositories/          # Repository implementations
│   │   ├── UserRepository.ts
│   │   └── ProductRepository.ts
│   ├── storage/
│   │   └── LocalStorage.ts
│   └── services/
│       └── AnalyticsService.ts
│
└── presentation/              # React UI
    ├── components/
    ├── hooks/
    ├── pages/
    └── context/
```

#### Domain Layer

```typescript
// domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly createdAt: Date
  ) {}

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  canAccessResource(resource: Resource): boolean {
    return resource.allowedRoles.includes(this.role);
  }
}

// domain/value-objects/Email.ts
export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    this.value = email.toLowerCase();
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(criteria?: UserSearchCriteria): Promise<User[]>;
}
```

#### Application Layer (Use Cases)

```typescript
// application/use-cases/user/CreateUser.ts
export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

export interface CreateUserResult {
  user: User;
  token: string;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: IPasswordService,
    private tokenService: ITokenService,
    private notificationService: INotificationService
  ) {}

  async execute(dto: CreateUserDTO): Promise<CreateUserResult> {
    // Validate email
    const email = new Email(dto.email);

    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError(dto.email);
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Create user entity
    const user = new User(
      generateId(),
      email,
      dto.name,
      UserRole.USER,
      new Date()
    );

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Generate token
    const token = this.tokenService.generate(savedUser);

    // Send welcome email
    await this.notificationService.sendWelcomeEmail(savedUser);

    return { user: savedUser, token };
  }
}

// application/use-cases/user/GetUser.ts
export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return user;
  }
}
```

#### Infrastructure Layer

```typescript
// infrastructure/repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: string): Promise<User | null> {
    try {
      const response = await this.apiClient.get<UserResponse>(`/users/${id}`);
      return this.toDomain(response);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const response = await this.apiClient.get<UserResponse>(
        `/users/by-email/${email.toString()}`
      );
      return this.toDomain(response);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async save(user: User): Promise<User> {
    const response = await this.apiClient.post<UserResponse>('/users', {
      email: user.email.toString(),
      name: user.name,
      role: user.role
    });
    return this.toDomain(response);
  }

  private toDomain(response: UserResponse): User {
    return new User(
      response.id,
      new Email(response.email),
      response.name,
      response.role as UserRole,
      new Date(response.createdAt)
    );
  }
}
```

#### Presentation Layer (React)

```typescript
// presentation/hooks/useCreateUser.ts
export function useCreateUser() {
  const createUserUseCase = useInjection<CreateUserUseCase>('CreateUserUseCase');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUser = async (dto: CreateUserDTO) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createUserUseCase.execute(dto);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, isLoading, error };
}

// presentation/pages/RegisterPage.tsx
export function RegisterPage() {
  const { createUser, isLoading, error } = useCreateUser();
  const navigate = useNavigate();

  const handleSubmit = async (formData: RegisterFormData) => {
    try {
      const { user, token } = await createUser({
        email: formData.email,
        name: formData.name,
        password: formData.password
      });

      // Store token and redirect
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error) {
      // Error is already set in hook
    }
  };

  return (
    <div className="register-page">
      <h1>Create Account</h1>
      {error && <ErrorMessage error={error} />}
      <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
```

---

## Q5.7: State Machine Pattern trong React

### Câu hỏi
Làm thế nào để implement State Machine pattern cho complex UI flows?

### Trả lời

#### XState Integration

```typescript
// State machine definition
import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';

interface CheckoutContext {
  cart: CartItem[];
  shippingAddress: Address | null;
  paymentMethod: PaymentMethod | null;
  order: Order | null;
  error: string | null;
}

type CheckoutEvent =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SET_SHIPPING'; address: Address }
  | { type: 'SET_PAYMENT'; method: PaymentMethod }
  | { type: 'SUBMIT_ORDER' }
  | { type: 'RETRY' };

const checkoutMachine = createMachine<CheckoutContext, CheckoutEvent>({
  id: 'checkout',
  initial: 'cart',
  context: {
    cart: [],
    shippingAddress: null,
    paymentMethod: null,
    order: null,
    error: null
  },
  states: {
    cart: {
      on: {
        NEXT: {
          target: 'shipping',
          cond: 'hasItems'
        }
      }
    },
    shipping: {
      on: {
        SET_SHIPPING: {
          actions: assign({
            shippingAddress: (_, event) => event.address
          })
        },
        NEXT: {
          target: 'payment',
          cond: 'hasShippingAddress'
        },
        BACK: 'cart'
      }
    },
    payment: {
      on: {
        SET_PAYMENT: {
          actions: assign({
            paymentMethod: (_, event) => event.method
          })
        },
        NEXT: {
          target: 'review',
          cond: 'hasPaymentMethod'
        },
        BACK: 'shipping'
      }
    },
    review: {
      on: {
        SUBMIT_ORDER: 'submitting',
        BACK: 'payment'
      }
    },
    submitting: {
      invoke: {
        src: 'submitOrder',
        onDone: {
          target: 'success',
          actions: assign({
            order: (_, event) => event.data
          })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data.message
          })
        }
      }
    },
    success: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'submitting',
        BACK: 'review'
      }
    }
  }
}, {
  guards: {
    hasItems: (context) => context.cart.length > 0,
    hasShippingAddress: (context) => context.shippingAddress !== null,
    hasPaymentMethod: (context) => context.paymentMethod !== null
  },
  services: {
    submitOrder: async (context) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: context.cart,
          shippingAddress: context.shippingAddress,
          paymentMethod: context.paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      return response.json();
    }
  }
});

// React component using state machine
function Checkout() {
  const [state, send] = useMachine(checkoutMachine);

  const renderStep = () => {
    switch (true) {
      case state.matches('cart'):
        return (
          <CartStep
            items={state.context.cart}
            onNext={() => send('NEXT')}
          />
        );

      case state.matches('shipping'):
        return (
          <ShippingStep
            address={state.context.shippingAddress}
            onAddressChange={(address) => send({ type: 'SET_SHIPPING', address })}
            onNext={() => send('NEXT')}
            onBack={() => send('BACK')}
          />
        );

      case state.matches('payment'):
        return (
          <PaymentStep
            method={state.context.paymentMethod}
            onMethodChange={(method) => send({ type: 'SET_PAYMENT', method })}
            onNext={() => send('NEXT')}
            onBack={() => send('BACK')}
          />
        );

      case state.matches('review'):
        return (
          <ReviewStep
            cart={state.context.cart}
            shipping={state.context.shippingAddress!}
            payment={state.context.paymentMethod!}
            onSubmit={() => send('SUBMIT_ORDER')}
            onBack={() => send('BACK')}
          />
        );

      case state.matches('submitting'):
        return <LoadingSpinner message="Processing your order..." />;

      case state.matches('success'):
        return <OrderSuccess order={state.context.order!} />;

      case state.matches('error'):
        return (
          <OrderError
            error={state.context.error!}
            onRetry={() => send('RETRY')}
            onBack={() => send('BACK')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="checkout">
      <CheckoutProgress currentStep={state.value as string} />
      {renderStep()}
    </div>
  );
}
```

#### useReducer-based State Machine (Simple)

```typescript
// Simple state machine without XState
type FormState = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

interface FormMachineState {
  status: FormState;
  data: FormData | null;
  error: string | null;
}

type FormAction =
  | { type: 'SUBMIT'; data: FormData }
  | { type: 'VALIDATION_SUCCESS' }
  | { type: 'VALIDATION_ERROR'; error: string }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'RESET' };

// State transition table
const transitions: Record<FormState, Partial<Record<FormAction['type'], FormState>>> = {
  idle: {
    SUBMIT: 'validating'
  },
  validating: {
    VALIDATION_SUCCESS: 'submitting',
    VALIDATION_ERROR: 'error'
  },
  submitting: {
    SUBMIT_SUCCESS: 'success',
    SUBMIT_ERROR: 'error'
  },
  success: {
    RESET: 'idle'
  },
  error: {
    SUBMIT: 'validating',
    RESET: 'idle'
  }
};

function formReducer(state: FormMachineState, action: FormAction): FormMachineState {
  const nextStatus = transitions[state.status][action.type];

  if (!nextStatus) {
    // Invalid transition, return current state
    console.warn(`Invalid transition: ${state.status} -> ${action.type}`);
    return state;
  }

  switch (action.type) {
    case 'SUBMIT':
      return { ...state, status: nextStatus, data: action.data, error: null };

    case 'VALIDATION_SUCCESS':
      return { ...state, status: nextStatus };

    case 'VALIDATION_ERROR':
    case 'SUBMIT_ERROR':
      return { ...state, status: nextStatus, error: action.error };

    case 'SUBMIT_SUCCESS':
      return { ...state, status: nextStatus, error: null };

    case 'RESET':
      return { status: nextStatus, data: null, error: null };

    default:
      return state;
  }
}

function useFormMachine() {
  const [state, dispatch] = useReducer(formReducer, {
    status: 'idle',
    data: null,
    error: null
  });

  const submit = useCallback(async (data: FormData) => {
    dispatch({ type: 'SUBMIT', data });

    // Validate
    const validationError = validate(data);
    if (validationError) {
      dispatch({ type: 'VALIDATION_ERROR', error: validationError });
      return;
    }

    dispatch({ type: 'VALIDATION_SUCCESS' });

    // Submit
    try {
      await submitToServer(data);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR', error: (error as Error).message });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { state, submit, reset };
}
```

---

## Q5.8: Plugin Architecture trong React

### Câu hỏi
Làm thế nào để thiết kế một Plugin Architecture cho React application?

### Trả lời

```typescript
// Plugin interface
interface Plugin {
  name: string;
  version: string;
  initialize: (context: PluginContext) => void | Promise<void>;
  destroy?: () => void;
}

interface PluginContext {
  // Registry for components
  registerComponent: (slot: string, component: React.ComponentType<any>) => void;

  // Registry for routes
  registerRoute: (route: RouteConfig) => void;

  // Registry for hooks
  registerHook: (hookName: string, callback: Function) => void;

  // Event system
  on: (event: string, handler: Function) => void;
  emit: (event: string, data?: unknown) => void;

  // State access
  getState: <T>(key: string) => T | undefined;
  setState: <T>(key: string, value: T) => void;

  // API access
  api: ApiClient;
}

// Plugin Manager
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private components: Map<string, React.ComponentType[]> = new Map();
  private routes: RouteConfig[] = [];
  private hooks: Map<string, Function[]> = new Map();
  private eventEmitter = new EventEmitter();
  private state: Map<string, unknown> = new Map();

  constructor(private api: ApiClient) {}

  private createContext(): PluginContext {
    return {
      registerComponent: (slot, component) => {
        if (!this.components.has(slot)) {
          this.components.set(slot, []);
        }
        this.components.get(slot)!.push(component);
      },

      registerRoute: (route) => {
        this.routes.push(route);
      },

      registerHook: (hookName, callback) => {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName)!.push(callback);
      },

      on: (event, handler) => {
        this.eventEmitter.on(event, handler);
      },

      emit: (event, data) => {
        this.eventEmitter.emit(event, data);
      },

      getState: (key) => this.state.get(key) as any,

      setState: (key, value) => {
        this.state.set(key, value);
        this.eventEmitter.emit(`state:${key}`, value);
      },

      api: this.api
    };
  }

  async register(plugin: Plugin) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} already registered`);
      return;
    }

    const context = this.createContext();
    await plugin.initialize(context);
    this.plugins.set(plugin.name, plugin);

    console.log(`Plugin ${plugin.name}@${plugin.version} registered`);
  }

  unregister(name: string) {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.destroy?.();
      this.plugins.delete(name);
    }
  }

  getComponents(slot: string): React.ComponentType[] {
    return this.components.get(slot) || [];
  }

  getRoutes(): RouteConfig[] {
    return this.routes;
  }

  async executeHook<T>(hookName: string, data: T): Promise<T> {
    const callbacks = this.hooks.get(hookName) || [];
    let result = data;

    for (const callback of callbacks) {
      result = await callback(result);
    }

    return result;
  }
}

// React integration
const PluginManagerContext = createContext<PluginManager | null>(null);

function PluginProvider({
  manager,
  children
}: {
  manager: PluginManager;
  children: ReactNode;
}) {
  return (
    <PluginManagerContext.Provider value={manager}>
      {children}
    </PluginManagerContext.Provider>
  );
}

function usePluginManager() {
  const manager = useContext(PluginManagerContext);
  if (!manager) {
    throw new Error('usePluginManager must be used within PluginProvider');
  }
  return manager;
}

// Slot component for rendering plugin components
function PluginSlot({
  name,
  props = {}
}: {
  name: string;
  props?: Record<string, unknown>;
}) {
  const manager = usePluginManager();
  const components = manager.getComponents(name);

  return (
    <>
      {components.map((Component, index) => (
        <Component key={index} {...props} />
      ))}
    </>
  );
}

// Example plugin
const analyticsPlugin: Plugin = {
  name: 'analytics',
  version: '1.0.0',

  initialize(context) {
    // Register dashboard widget
    context.registerComponent('dashboard.widgets', AnalyticsWidget);

    // Register settings page
    context.registerRoute({
      path: '/settings/analytics',
      component: AnalyticsSettings
    });

    // Hook into navigation
    context.registerHook('navigation', (items: NavItem[]) => {
      return [
        ...items,
        { label: 'Analytics', path: '/analytics', icon: ChartIcon }
      ];
    });

    // Listen for events
    context.on('page:view', (data: { path: string }) => {
      trackPageView(data.path);
    });
  },

  destroy() {
    // Cleanup
  }
};

// App usage
function App() {
  const [manager] = useState(() => {
    const mgr = new PluginManager(apiClient);

    // Register plugins
    mgr.register(analyticsPlugin);
    mgr.register(notificationsPlugin);
    mgr.register(themePlugin);

    return mgr;
  });

  return (
    <PluginProvider manager={manager}>
      <Dashboard>
        <PluginSlot name="dashboard.widgets" />
      </Dashboard>
    </PluginProvider>
  );
}
```

---

## Q5.9: Feature Flags Architecture

### Câu hỏi
Thiết kế Feature Flags system cho React application như thế nào?

### Trả lời

```typescript
// Feature Flag types
interface FeatureFlag {
  key: string;
  enabled: boolean;
  variants?: Record<string, unknown>;
  rules?: FeatureRule[];
}

interface FeatureRule {
  type: 'percentage' | 'user' | 'group' | 'date';
  value: unknown;
}

interface FeatureFlagsConfig {
  flags: FeatureFlag[];
  userId?: string;
  userGroups?: string[];
}

// Feature Flags Service
class FeatureFlagsService {
  private flags: Map<string, FeatureFlag> = new Map();
  private userId?: string;
  private userGroups: string[] = [];

  constructor(config: FeatureFlagsConfig) {
    config.flags.forEach(flag => {
      this.flags.set(flag.key, flag);
    });
    this.userId = config.userId;
    this.userGroups = config.userGroups || [];
  }

  isEnabled(key: string): boolean {
    const flag = this.flags.get(key);

    if (!flag) {
      console.warn(`Feature flag "${key}" not found`);
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    if (!flag.rules || flag.rules.length === 0) {
      return true;
    }

    return flag.rules.every(rule => this.evaluateRule(rule));
  }

  getVariant<T = unknown>(key: string, defaultValue: T): T {
    const flag = this.flags.get(key);

    if (!flag?.variants) {
      return defaultValue;
    }

    // Simple variant selection based on user ID hash
    if (this.userId) {
      const hash = this.hashString(this.userId);
      const variantKeys = Object.keys(flag.variants);
      const index = hash % variantKeys.length;
      return flag.variants[variantKeys[index]] as T;
    }

    return defaultValue;
  }

  private evaluateRule(rule: FeatureRule): boolean {
    switch (rule.type) {
      case 'percentage': {
        if (!this.userId) return false;
        const hash = this.hashString(this.userId);
        return (hash % 100) < (rule.value as number);
      }

      case 'user': {
        const users = rule.value as string[];
        return this.userId ? users.includes(this.userId) : false;
      }

      case 'group': {
        const groups = rule.value as string[];
        return groups.some(g => this.userGroups.includes(g));
      }

      case 'date': {
        const { after, before } = rule.value as { after?: string; before?: string };
        const now = new Date();
        if (after && new Date(after) > now) return false;
        if (before && new Date(before) < now) return false;
        return true;
      }

      default:
        return true;
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  updateFlags(flags: FeatureFlag[]) {
    flags.forEach(flag => {
      this.flags.set(flag.key, flag);
    });
  }

  setUser(userId: string, groups: string[] = []) {
    this.userId = userId;
    this.userGroups = groups;
  }
}

// React Context
const FeatureFlagsContext = createContext<FeatureFlagsService | null>(null);

function FeatureFlagsProvider({
  config,
  children
}: {
  config: FeatureFlagsConfig;
  children: ReactNode;
}) {
  const [service] = useState(() => new FeatureFlagsService(config));

  // Optionally fetch flags from server
  useEffect(() => {
    async function fetchFlags() {
      const response = await fetch('/api/feature-flags');
      const flags = await response.json();
      service.updateFlags(flags);
    }

    fetchFlags();

    // Poll for updates
    const interval = setInterval(fetchFlags, 60000);
    return () => clearInterval(interval);
  }, [service]);

  return (
    <FeatureFlagsContext.Provider value={service}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// Hooks
function useFeatureFlags() {
  const service = useContext(FeatureFlagsContext);
  if (!service) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return service;
}

function useFeatureFlag(key: string): boolean {
  const service = useFeatureFlags();
  return service.isEnabled(key);
}

function useFeatureVariant<T>(key: string, defaultValue: T): T {
  const service = useFeatureFlags();
  return service.getVariant(key, defaultValue);
}

// Components
interface FeatureProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

function Feature({ flag, children, fallback = null }: FeatureProps) {
  const isEnabled = useFeatureFlag(flag);
  return <>{isEnabled ? children : fallback}</>;
}

// Usage
function Dashboard() {
  const showNewDashboard = useFeatureFlag('new-dashboard');
  const buttonColor = useFeatureVariant('button-color-test', 'blue');

  return (
    <div>
      <Feature flag="announcement-banner">
        <AnnouncementBanner />
      </Feature>

      {showNewDashboard ? <NewDashboard /> : <OldDashboard />}

      <Button style={{ backgroundColor: buttonColor }}>
        Click me
      </Button>

      <Feature flag="beta-features" fallback={<ComingSoon />}>
        <BetaFeatures />
      </Feature>
    </div>
  );
}

// App setup
const featureFlagsConfig: FeatureFlagsConfig = {
  userId: currentUser?.id,
  userGroups: currentUser?.groups,
  flags: [
    {
      key: 'new-dashboard',
      enabled: true,
      rules: [
        { type: 'percentage', value: 50 }
      ]
    },
    {
      key: 'beta-features',
      enabled: true,
      rules: [
        { type: 'group', value: ['beta-testers', 'employees'] }
      ]
    },
    {
      key: 'announcement-banner',
      enabled: true,
      rules: [
        {
          type: 'date',
          value: {
            after: '2024-01-01',
            before: '2024-01-31'
          }
        }
      ]
    }
  ]
};

function App() {
  return (
    <FeatureFlagsProvider config={featureFlagsConfig}>
      <Dashboard />
    </FeatureFlagsProvider>
  );
}
```

---

## Q5.10: Monorepo Architecture cho React Projects

### Câu hỏi
Thiết kế Monorepo architecture cho large-scale React project như thế nào?

### Trả lời

#### Monorepo Structure với Turborepo

```
my-monorepo/
├── apps/                         # Applications
│   ├── web/                      # Main web app
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── admin/                    # Admin dashboard
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── mobile/                   # React Native app
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── docs/                     # Documentation site
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                     # Shared packages
│   ├── ui/                       # Design system
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/                   # Shared configs
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   ├── utils/                    # Shared utilities
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api-client/               # API client
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── types/                    # Shared types
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── turbo.json                    # Turborepo config
├── package.json                  # Root package.json
├── pnpm-workspace.yaml           # pnpm workspaces
└── tsconfig.json                 # Base TypeScript config
```

#### Root Configuration

```json
// package.json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@8.0.0"
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### Shared UI Package

```typescript
// packages/ui/package.json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "files": ["dist/**"],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "@repo/types": "workspace:*",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}

// packages/ui/src/index.ts
export * from './components/Button';
export * from './components/Input';
export * from './components/Modal';
export * from './components/Card';
export * from './hooks/useDialog';
export * from './hooks/useToast';

// packages/ui/src/components/Button/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700'
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### App Using Shared Packages

```typescript
// apps/web/package.json
{
  "name": "web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/utils": "workspace:*",
    "@repo/api-client": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "@repo/types": "workspace:*"
  }
}

// apps/web/src/app/page.tsx
import { Button, Card, Input } from '@repo/ui';
import { formatDate, capitalize } from '@repo/utils';
import { useUsers } from '@repo/api-client';

export default function HomePage() {
  const { data: users, isLoading } = useUsers();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {capitalize('welcome to our app')}
      </h1>

      <div className="grid gap-4">
        {users?.map(user => (
          <Card key={user.id}>
            <h2>{user.name}</h2>
            <p>Joined: {formatDate(user.createdAt)}</p>
            <Button variant="primary">View Profile</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                 MONOREPO DEPENDENCY GRAPH                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   APPS                          PACKAGES                     │
│   ────                          ────────                     │
│                                                              │
│   ┌─────────┐                  ┌──────────────┐             │
│   │   web   │───────────────▶  │     ui       │             │
│   └────┬────┘                  └──────┬───────┘             │
│        │                              │                      │
│        │                              ▼                      │
│        │                       ┌──────────────┐             │
│        │ ───────────────────▶  │    utils     │             │
│        │                       └──────────────┘             │
│        │                              ▲                      │
│        │                              │                      │
│        │                       ┌──────────────┐             │
│        └───────────────────▶   │  api-client  │             │
│                                └──────────────┘             │
│                                       │                      │
│   ┌─────────┐                        │                      │
│   │  admin  │────────────────────────┤                      │
│   └─────────┘                        │                      │
│                                       ▼                      │
│   ┌─────────┐                  ┌──────────────┐             │
│   │ mobile  │───────────────▶  │    types     │             │
│   └─────────┘                  └──────────────┘             │
│                                       ▲                      │
│   ┌─────────┐                        │                      │
│   │  docs   │────────────────────────┘                      │
│   └─────────┘                                               │
│                                                              │
│   All apps depend on:                                        │
│   - @repo/ui (design system)                                │
│   - @repo/utils (utilities)                                 │
│   - @repo/types (TypeScript types)                          │
│   - @repo/config (shared configs)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tổng kết

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| Feature-Based Structure | Large teams, scalability | Medium |
| Compound Components | UI libraries, flexibility | Medium |
| Custom Hooks | Logic sharing (most cases) | Low |
| Provider Pattern | Global state/services | Low-Medium |
| Clean Architecture | Enterprise apps | High |
| Micro-Frontend | Multiple teams, independence | Very High |
| State Machine | Complex flows | Medium |
| Plugin Architecture | Extensible apps | High |
| Feature Flags | A/B testing, gradual rollout | Medium |
| Monorepo | Multiple apps sharing code | Medium-High |

**Key Principles:**
1. **Separation of Concerns** - Each layer/module has single responsibility
2. **Dependency Inversion** - Depend on abstractions, not implementations
3. **Open/Closed** - Open for extension, closed for modification
4. **DRY** - Don't Repeat Yourself, but also avoid premature abstraction
