---

# 2. TypeScript với React

## Q2.1: Generic Components trong React TypeScript?

**Độ khó:** Senior

### Câu trả lời:

Generic components cho phép tạo components có thể làm việc với nhiều types khác nhau mà vẫn type-safe.

### Basic Generic Component:

```typescript
// Generic List component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items'
}: ListProps<T>) {
  if (items.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage with type inference
interface User {
  id: number;
  name: string;
  email: string;
}

function UserList({ users }: { users: User[] }) {
  return (
    <List
      items={users}
      keyExtractor={(user) => user.id}  // TypeScript knows user is User
      renderItem={(user) => (
        <div>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
      )}
    />
  );
}
```

### Generic Select Component:

```typescript
interface Option<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T> {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  compareValues?: (a: T, b: T) => boolean;
}

function Select<T>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  compareValues = (a, b) => a === b,
}: SelectProps<T>) {
  const selectedOption = options.find(
    opt => value !== null && compareValues(opt.value, value)
  );

  return (
    <select
      value={selectedOption ? options.indexOf(selectedOption) : -1}
      onChange={(e) => {
        const index = parseInt(e.target.value, 10);
        if (index >= 0) {
          onChange(options[index].value);
        }
      }}
    >
      <option value={-1} disabled>{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={index} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Usage with complex types
interface Country {
  code: string;
  name: string;
}

const countries: Option<Country>[] = [
  { value: { code: 'US', name: 'United States' }, label: 'United States' },
  { value: { code: 'VN', name: 'Vietnam' }, label: 'Vietnam' },
];

function CountrySelect() {
  const [country, setCountry] = useState<Country | null>(null);

  return (
    <Select
      options={countries}
      value={country}
      onChange={setCountry}
      compareValues={(a, b) => a.code === b.code}
    />
  );
}
```

### Generic Table Component:

```typescript
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: keyof T) => void;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}: TableProps<T>) {
  const getCellValue = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }

    const key = column.key as keyof T;
    const value = item[key];

    return String(value ?? '');
  };

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              style={{ width: column.width }}
              onClick={() => {
                if (column.sortable && onSort) {
                  onSort(column.key as keyof T);
                }
              }}
            >
              {column.header}
              {sortBy === column.key && (
                <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((column) => (
              <td key={String(column.key)}>
                {getCellValue(item, column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

const columns: Column<Product>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'price', header: 'Price', render: (p) => `$${p.price.toFixed(2)}` },
  { key: 'category', header: 'Category', sortable: true },
  {
    key: 'inStock',
    header: 'Status',
    render: (p) => (
      <span className={p.inStock ? 'in-stock' : 'out-of-stock'}>
        {p.inStock ? 'In Stock' : 'Out of Stock'}
      </span>
    ),
  },
];

function ProductTable({ products }: { products: Product[] }) {
  const [sortBy, setSortBy] = useState<keyof Product>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof Product) => {
    if (sortBy === key) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  return (
    <Table
      data={products}
      columns={columns}
      keyExtractor={(p) => p.id}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
    />
  );
}
```

---

## Q2.2: Discriminated Unions cho Component Props?

**Độ khó:** Senior

### Câu trả lời:

Discriminated Unions cho phép TypeScript narrow types dựa trên một discriminant property.

### Pattern: Conditional Props

```typescript
// ❌ Without discriminated union - allows invalid combinations
interface BadButtonProps {
  variant?: 'primary' | 'secondary' | 'link';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// ✅ With discriminated union - type-safe
type ButtonProps =
  | {
      variant: 'primary' | 'secondary';
      onClick: () => void;
      disabled?: boolean;
      href?: never;  // Cannot have href
    }
  | {
      variant: 'link';
      href: string;
      onClick?: never;  // Cannot have onClick
      disabled?: never; // Cannot be disabled
    };

function Button(props: ButtonProps) {
  if (props.variant === 'link') {
    // TypeScript knows: href exists, onClick doesn't
    return <a href={props.href}>{props.children}</a>;
  }

  // TypeScript knows: onClick exists, href doesn't
  return (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </button>
  );
}

// Usage
<Button variant="primary" onClick={() => {}} />  // ✅
<Button variant="link" href="/about" />          // ✅
<Button variant="link" onClick={() => {}} />     // ❌ Error!
<Button variant="primary" href="/about" />       // ❌ Error!
```

### Pattern: Loading/Error/Success States

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

interface DataDisplayProps<T> {
  state: AsyncState<T>;
  renderData: (data: T) => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
  loadingComponent?: React.ReactNode;
}

function DataDisplay<T>({
  state,
  renderData,
  renderError,
  loadingComponent = <Spinner />,
}: DataDisplayProps<T>) {
  switch (state.status) {
    case 'idle':
      return null;

    case 'loading':
      return <>{loadingComponent}</>;

    case 'error':
      if (renderError) {
        return <>{renderError(state.error)}</>;  // TypeScript knows error exists
      }
      return <div>Error: {state.error.message}</div>;

    case 'success':
      return <>{renderData(state.data)}</>;  // TypeScript knows data exists

    default:
      // Exhaustiveness check
      const _exhaustive: never = state;
      return _exhaustive;
  }
}
```

### Pattern: Form Field Types

```typescript
type BaseFieldProps = {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
};

type TextFieldProps = BaseFieldProps & {
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
};

type NumberFieldProps = BaseFieldProps & {
  type: 'number';
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

type SelectFieldProps = BaseFieldProps & {
  type: 'select';
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
};

type CheckboxFieldProps = BaseFieldProps & {
  type: 'checkbox';
  value: boolean;
  onChange: (value: boolean) => void;
};

type FieldProps =
  | TextFieldProps
  | NumberFieldProps
  | SelectFieldProps
  | CheckboxFieldProps;

function FormField(props: FieldProps) {
  const { name, label, error, required } = props;

  const renderField = () => {
    switch (props.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <input
            type={props.type}
            name={name}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            name={name}
            value={props.value}
            onChange={(e) => props.onChange(Number(e.target.value))}
            min={props.min}
            max={props.max}
            step={props.step}
          />
        );

      case 'select':
        return (
          <select
            name={name}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
          >
            {props.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            name={name}
            checked={props.value}
            onChange={(e) => props.onChange(e.target.checked)}
          />
        );
    }
  };

  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label} {required && <span>*</span>}
      </label>
      {renderField()}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

---

## Q2.3: Type-safe Event Handlers và Refs?

**Độ khó:** Mid-Senior

### Câu trả lời:

### Event Handlers:

```typescript
// Built-in event types
type MouseEventHandler = React.MouseEventHandler<HTMLButtonElement>;
type ChangeEventHandler = React.ChangeEventHandler<HTMLInputElement>;
type FormEventHandler = React.FormEventHandler<HTMLFormElement>;
type KeyboardEventHandler = React.KeyboardEventHandler<HTMLInputElement>;

// Component với typed event handlers
function FormComponent() {
  // Type-safe change handler
  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    // e.target is HTMLInputElement
    console.log(e.target.value);
    console.log(e.target.checked); // Available for checkboxes
  };

  // Type-safe submit handler
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
  };

  // Type-safe keyboard handler
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Generic handler for multiple elements
  const handleClick = <T extends HTMLElement>(
    callback: (element: T) => void
  ): React.MouseEventHandler<T> => {
    return (e) => {
      callback(e.currentTarget);
    };
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleClick<HTMLButtonElement>((el) => {
        console.log('Clicked button:', el.textContent);
      })}>
        Submit
      </button>
    </form>
  );
}
```

### Refs:

```typescript
// DOM element refs
function DOMRefExamples() {
  // Specific element types
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Working with refs
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.value = 'Hello';
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      // ctx is CanvasRenderingContext2D | null
    }
  }, []);

  return (
    <>
      <input ref={inputRef} />
      <div ref={divRef} />
      <canvas ref={canvasRef} />
    </>
  );
}

// Mutable refs (for values, not DOM)
function MutableRefExample() {
  // For timeout IDs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // For previous values
  const prevValueRef = useRef<string>();

  // For instance variables
  const countRef = useRef(0);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      countRef.current += 1;
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
}

// Callback refs
function CallbackRefExample() {
  const [height, setHeight] = useState(0);

  // Callback ref for measuring
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return <div ref={measureRef}>Content</div>;
}

// forwardRef with TypeScript
interface CustomInputProps {
  label: string;
  error?: string;
}

interface CustomInputRef {
  focus: () => void;
  clear: () => void;
}

const CustomInput = forwardRef<CustomInputRef, CustomInputProps>(
  function CustomInput({ label, error }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      },
    }));

    return (
      <div>
        <label>{label}</label>
        <input ref={inputRef} />
        {error && <span>{error}</span>}
      </div>
    );
  }
);

// Usage
function Form() {
  const inputRef = useRef<CustomInputRef>(null);

  return (
    <>
      <CustomInput ref={inputRef} label="Name" />
      <button onClick={() => inputRef.current?.focus()}>
        Focus Input
      </button>
    </>
  );
}
```

---

## Q2.4: Utility Types cho React Components?

**Độ khó:** Senior

### Câu trả lời:

### Built-in React Types:

```typescript
// ComponentProps - Extract props from component
type ButtonProps = React.ComponentProps<'button'>;
type DivProps = React.ComponentProps<'div'>;
type InputProps = React.ComponentProps<'input'>;

// ComponentPropsWithRef - Props including ref
type ButtonPropsWithRef = React.ComponentPropsWithRef<'button'>;

// ComponentPropsWithoutRef - Props excluding ref
type ButtonPropsWithoutRef = React.ComponentPropsWithoutRef<'button'>;

// Extract props from custom component
type MyComponentProps = React.ComponentProps<typeof MyComponent>;
```

### Extending HTML Element Props:

```typescript
// Method 1: Intersection
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary';
  loading?: boolean;
}

// Method 2: ComponentPropsWithoutRef
interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  label: string;
  error?: string;
}

// Method 3: With ref support
interface CustomInputProps extends React.ComponentPropsWithRef<'input'> {
  label: string;
}

// Usage
function Button({ variant, loading, children, ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={loading}
      {...rest}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

### Custom Utility Types:

```typescript
// Make specific props required
type RequireProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

type ButtonProps = {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
};

type RequiredButtonProps = RequireProps<ButtonProps, 'onClick' | 'label'>;
// Result: onClick and label are required, disabled is optional

// Make specific props optional
type PartialProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UserFormProps = {
  name: string;
  email: string;
  age: number;
};

type PartialUserFormProps = PartialProps<UserFormProps, 'age'>;
// Result: name and email required, age optional

// Omit common HTML attributes for custom handling
type OmitCommonProps<T> = Omit<T, 'className' | 'style' | 'children'>;

interface CardProps extends OmitCommonProps<React.HTMLAttributes<HTMLDivElement>> {
  // Custom className handling
  className?: string | string[];
  // Custom children handling
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// Props with render props
type RenderProp<T> = (props: T) => React.ReactNode;

interface DataFetcherProps<T> {
  url: string;
  children: RenderProp<{ data: T; loading: boolean; error: Error | null }>;
}

// Polymorphic component types
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

// Polymorphic component with ref
type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProp<C, Props> & {
  ref?: PolymorphicRef<C>;
};
```

### Polymorphic Component Example:

```typescript
interface TextOwnProps {
  color?: 'primary' | 'secondary' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

type TextProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<
  C,
  TextOwnProps
>;

type TextComponent = <C extends React.ElementType = 'span'>(
  props: TextProps<C>
) => React.ReactElement | null;

const Text: TextComponent = forwardRef(function Text<
  C extends React.ElementType = 'span'
>(
  { as, color = 'primary', size = 'md', children, ...rest }: TextProps<C>,
  ref?: PolymorphicRef<C>
) {
  const Component = as || 'span';

  return (
    <Component
      ref={ref}
      className={`text-${color} text-${size}`}
      {...rest}
    >
      {children}
    </Component>
  );
});

// Usage
<Text>Default span</Text>
<Text as="p">Paragraph</Text>
<Text as="h1" size="lg">Heading</Text>
<Text as="a" href="/about">Link</Text>
<Text as={Link} to="/home">Router Link</Text>
```

---

## Q2.5: Strict Typing cho State và Reducers?

**Độ khó:** Senior

### Câu trả lời:

### Typed useState:

```typescript
// Explicit type when initial value doesn't match full type
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);

// Inferred type from initial value
const [count, setCount] = useState(0); // number
const [name, setName] = useState(''); // string

// Complex object state
interface FormState {
  values: {
    email: string;
    password: string;
  };
  errors: Partial<Record<keyof FormState['values'], string>>;
  touched: Partial<Record<keyof FormState['values'], boolean>>;
  isSubmitting: boolean;
}

const [formState, setFormState] = useState<FormState>({
  values: { email: '', password: '' },
  errors: {},
  touched: {},
  isSubmitting: false,
});
```

### Typed useReducer:

```typescript
// State type
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  loading: boolean;
  error: string | null;
}

// Action types using discriminated unions
type TodoAction =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'REMOVE_TODO'; payload: { id: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: Partial<Todo> } }
  | { type: 'SET_FILTER'; payload: TodoState['filter'] }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Todo[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'CLEAR_COMPLETED' };

// Type-safe reducer
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };

    case 'REMOVE_TODO':
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.payload.id),
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload.id
            ? { ...t, completed: !t.completed }
            : t
        ),
      };

    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload.id
            ? { ...t, ...action.payload.updates }
            : t
        ),
      };

    case 'SET_FILTER':
      return { ...state, filter: action.payload };

    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, todos: action.payload };

    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(t => !t.completed),
      };

    default:
      // Exhaustiveness check
      const _exhaustiveCheck: never = action;
      return state;
  }
}

// Action creators for type safety
const todoActions = {
  addTodo: (todo: Todo): TodoAction => ({
    type: 'ADD_TODO',
    payload: todo,
  }),

  removeTodo: (id: string): TodoAction => ({
    type: 'REMOVE_TODO',
    payload: { id },
  }),

  toggleTodo: (id: string): TodoAction => ({
    type: 'TOGGLE_TODO',
    payload: { id },
  }),

  updateTodo: (id: string, updates: Partial<Todo>): TodoAction => ({
    type: 'UPDATE_TODO',
    payload: { id, updates },
  }),

  setFilter: (filter: TodoState['filter']): TodoAction => ({
    type: 'SET_FILTER',
    payload: filter,
  }),

  fetchStart: (): TodoAction => ({ type: 'FETCH_START' }),

  fetchSuccess: (todos: Todo[]): TodoAction => ({
    type: 'FETCH_SUCCESS',
    payload: todos,
  }),

  fetchError: (error: string): TodoAction => ({
    type: 'FETCH_ERROR',
    payload: error,
  }),

  clearCompleted: (): TodoAction => ({ type: 'CLEAR_COMPLETED' }),
};

// Usage with typed context
interface TodoContextValue {
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
  actions: typeof todoActions;
}

const TodoContext = createContext<TodoContextValue | null>(null);

function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within TodoProvider');
  }
  return context;
}

function TodoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
    loading: false,
    error: null,
  });

  const value = useMemo(
    () => ({ state, dispatch, actions: todoActions }),
    [state]
  );

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}
```

---

## Q2.6: Type-safe API Integration với React Query/SWR?

**Độ khó:** Senior

### Câu trả lời:

### Typed API Client:

```typescript
// API response types
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

// API functions
async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }
  return response.json();
}

async function apiPost<T, D>(url: string, data: D): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }
  return response.json();
}

// Entity types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
}
```

### React Query Integration:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys factory
const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Query functions
const userApi = {
  getUsers: (filters: UserFilters) =>
    apiGet<ApiResponse<User[]>>(`/api/users?${new URLSearchParams(filters)}`),

  getUser: (id: string) =>
    apiGet<User>(`/api/users/${id}`),

  createUser: (data: CreateUserData) =>
    apiPost<User, CreateUserData>('/api/users', data),

  updateUser: ({ id, data }: { id: string; data: UpdateUserData }) =>
    apiPost<User, UpdateUserData>(`/api/users/${id}`, data),

  deleteUser: (id: string) =>
    apiPost<void, {}>(`/api/users/${id}/delete`, {}),
};

// Typed hooks
function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userApi.getUsers(filters),
    select: (response) => response.data,
  });
}

function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
  });
}

function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: (newUser) => {
      // Invalidate user list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Or optimistically add to cache
      queryClient.setQueryData<ApiResponse<User[]>>(
        userKeys.list({}),
        (old) => old ? {
          ...old,
          data: [...old.data, newUser],
        } : undefined
      );
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateUser,
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(userKeys.detail(id));

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<User>(userKeys.detail(id), {
          ...previousUser,
          ...data,
        });
      }

      return { previousUser };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(id), context.previousUser);
      }
    },
    onSettled: (_, __, { id }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

// Usage in component
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  if (!user) return <NotFound />;

  const handleUpdate = (data: UpdateUserData) => {
    updateUser.mutate(
      { id: userId, data },
      {
        onSuccess: () => toast.success('User updated'),
      }
    );
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button
        onClick={() => handleUpdate({ name: 'New Name' })}
        disabled={updateUser.isPending}
      >
        Update Name
      </button>
    </div>
  );
}
```

---

## Q2.7: Context Type Safety Best Practices?

**Độ khó:** Mid-Senior

### Câu trả lời:

### Pattern 1: Non-null Context with Custom Hook

```typescript
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

// Create with undefined default
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Custom hook with type guard
function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Provider implementation
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (credentials: Credentials) => {
    setIsLoading(true);
    try {
      const user = await authApi.login(credentials);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    login,
    logout,
    isLoading,
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Pattern 2: Context with Selectors (Performance)

```typescript
import { createContext, useContextSelector } from 'use-context-selector';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
  settings: Settings;
}

interface AppContextValue {
  state: AppState;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// Typed selector hook
function useAppSelector<T>(selector: (state: AppState) => T): T {
  const selected = useContextSelector(AppContext, (ctx) => {
    if (ctx === null) {
      throw new Error('useAppSelector must be used within AppProvider');
    }
    return selector(ctx.state);
  });

  return selected;
}

// Typed action hook
function useAppActions() {
  const ctx = useContextSelector(AppContext, (ctx) => {
    if (ctx === null) {
      throw new Error('useAppActions must be used within AppProvider');
    }
    return {
      setUser: ctx.setUser,
      setTheme: ctx.setTheme,
      addNotification: ctx.addNotification,
      updateSettings: ctx.updateSettings,
    };
  });

  return ctx;
}

// Usage - only re-renders when selected value changes
function UserDisplay() {
  const userName = useAppSelector(state => state.user?.name);
  return <span>{userName}</span>;
}

function ThemeToggle() {
  const theme = useAppSelector(state => state.theme);
  const { setTheme } = useAppActions();

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

### Pattern 3: Factory for Multiple Similar Contexts

```typescript
// Generic context factory
function createDataContext<T, Actions extends Record<string, (...args: any[]) => void>>() {
  type ContextValue = {
    data: T | null;
    loading: boolean;
    error: Error | null;
    actions: Actions;
  };

  const Context = createContext<ContextValue | undefined>(undefined);

  function useDataContext(): ContextValue {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error('useDataContext must be used within DataProvider');
    }
    return context;
  }

  function useData(): T | null {
    return useDataContext().data;
  }

  function useActions(): Actions {
    return useDataContext().actions;
  }

  return {
    Context,
    useDataContext,
    useData,
    useActions,
  };
}

// Usage
interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductActions {
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  updatePrice: (id: string, price: number) => void;
}

const {
  Context: ProductContext,
  useData: useProducts,
  useActions: useProductActions,
} = createDataContext<Product[], ProductActions>();
```

---

## Q2.8: Advanced TypeScript Patterns trong React?

**Độ khó:** Lead

### Câu trả lời:

### Pattern 1: Branded Types for IDs

```typescript
// Branded types prevent mixing IDs
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;
type OrderId = Brand<string, 'OrderId'>;

// Helper to create branded IDs
const createUserId = (id: string): UserId => id as UserId;
const createProductId = (id: string): ProductId => id as ProductId;

// Usage - TypeScript prevents ID mixing
function getUser(id: UserId): Promise<User> { /* ... */ }
function getProduct(id: ProductId): Promise<Product> { /* ... */ }

const userId = createUserId('user-123');
const productId = createProductId('prod-456');

getUser(userId);      // ✅ OK
getUser(productId);   // ❌ Error: ProductId not assignable to UserId
```

### Pattern 2: Template Literal Types for Routes

```typescript
// Define route patterns
type RouteParams = {
  '/users': {};
  '/users/:id': { id: string };
  '/products': {};
  '/products/:id': { id: string };
  '/orders/:orderId/items/:itemId': { orderId: string; itemId: string };
};

type RoutePath = keyof RouteParams;

// Extract params from path
type ExtractParams<P extends string> =
  P extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : P extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string }
      : {};

// Type-safe navigation
function navigate<P extends RoutePath>(
  path: P,
  params: RouteParams[P]
): void {
  let url: string = path;

  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, value as string);
  }

  window.history.pushState(null, '', url);
}

// Usage
navigate('/users', {});                                    // ✅
navigate('/users/:id', { id: '123' });                    // ✅
navigate('/orders/:orderId/items/:itemId', {              // ✅
  orderId: 'order-1',
  itemId: 'item-2',
});
navigate('/users/:id', {});                               // ❌ Error: missing id
navigate('/users/:id', { id: '123', extra: 'x' });       // ❌ Error: extra property
```

### Pattern 3: Infer Props from Component

```typescript
// Get props type from any component
type PropsOf<C> = C extends React.ComponentType<infer P> ? P : never;

// Get return type of hooks
type UseStateReturn<T> = [T, React.Dispatch<React.SetStateAction<T>>];

// Infer generic from component usage
type InferTableData<T> = T extends React.ComponentType<{ data: infer D }> ? D : never;

// Example: Wrapper component that passes through props
function withLogging<C extends React.ComponentType<any>>(
  Component: C
): React.ComponentType<PropsOf<C>> {
  return function LoggedComponent(props: PropsOf<C>) {
    useEffect(() => {
      console.log('Props:', props);
    }, [props]);

    return <Component {...props} />;
  };
}
```

### Pattern 4: Recursive Types for Tree Structures

```typescript
// Recursive tree node type
interface TreeNode<T> {
  id: string;
  data: T;
  children?: TreeNode<T>[];
}

// Recursive component props
interface TreeViewProps<T> {
  nodes: TreeNode<T>[];
  renderNode: (node: TreeNode<T>, level: number) => React.ReactNode;
  level?: number;
}

function TreeView<T>({
  nodes,
  renderNode,
  level = 0,
}: TreeViewProps<T>): React.ReactElement {
  return (
    <ul>
      {nodes.map(node => (
        <li key={node.id}>
          {renderNode(node, level)}
          {node.children && node.children.length > 0 && (
            <TreeView
              nodes={node.children}
              renderNode={renderNode}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

// Usage
interface FileNode {
  name: string;
  type: 'file' | 'folder';
}

const fileTree: TreeNode<FileNode>[] = [
  {
    id: '1',
    data: { name: 'src', type: 'folder' },
    children: [
      { id: '2', data: { name: 'App.tsx', type: 'file' } },
      { id: '3', data: { name: 'index.tsx', type: 'file' } },
    ],
  },
];

<TreeView
  nodes={fileTree}
  renderNode={(node, level) => (
    <span style={{ marginLeft: level * 20 }}>
      {node.data.type === 'folder' ? '📁' : '📄'} {node.data.name}
    </span>
  )}
/>
```

---
