# CodeSandbox Practice Problems

> **Mục đích**: Luyện tập format phỏng vấn thực tế - đọc requirements dài → implement → discuss
> **Platform**: https://codesandbox.io/ (tạo account trước!)
> **Thời gian mỗi bài**: 30-40 phút coding + 10-15 phút discuss

---

## Setup Instructions

1. Truy cập https://codesandbox.io/
2. Create account (GitHub hoặc email)
3. Click "Create Sandbox" → chọn "React" template
4. Làm quen với:
   - File explorer (bên trái)
   - Editor (giữa)
   - Preview (bên phải)
   - Console (dưới preview)
   - Keyboard shortcuts: `Cmd+S` save, `Cmd+P` quick open

---

# Problem 1: User Search with Filters

## Requirements (đọc kỹ trước khi code)

Build a user search interface with the following requirements:

### Functional Requirements

1. **Search Input**
   - Text input để search users by name hoặc email
   - Debounce 300ms - không gọi API mỗi keystroke
   - Clear button để xóa search term

2. **Filter Options**
   - Filter by role: All, Admin, User, Guest
   - Filter by status: All, Active, Inactive
   - Filters kết hợp với search (AND logic)

3. **Results Display**
   - Show user card với: avatar, name, email, role, status
   - Show loading state khi đang fetch
   - Show "No results found" khi không có kết quả
   - Show total count: "Showing X of Y users"

4. **Sorting**
   - Sort by: Name (A-Z), Name (Z-A), Recently joined

### Non-Functional Requirements

- TypeScript cho type safety
- Accessible: keyboard navigation, proper labels
- Responsive: works on mobile

### Mock API

```typescript
// Mock data
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', avatar: '👤', joinedAt: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', avatar: '👤', joinedAt: '2024-02-20' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'guest', status: 'inactive', avatar: '👤', joinedAt: '2024-03-10' },
  // ... add more
];

// Simulate API delay
const fetchUsers = async (params: SearchParams): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Filter logic here
  return filteredUsers;
};
```

---

## Solution Approach (đọc sau khi đã thử)

### Component Structure
```
UserSearchPage
├── SearchInput (debounced)
├── FilterBar
│   ├── RoleFilter (select)
│   └── StatusFilter (select)
├── SortSelect
├── ResultsInfo ("Showing X of Y")
└── UserList
    └── UserCard (multiple)
```

### Key Implementation Points

```tsx
// 1. Custom hook for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 2. Main component state
const [searchTerm, setSearchTerm] = useState('');
const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
const [sortBy, setSortBy] = useState<SortOption>('name-asc');

const debouncedSearch = useDebounce(searchTerm, 300);

// 3. Data fetching with React Query or useEffect
const { data: users, isLoading } = useQuery({
  queryKey: ['users', debouncedSearch, roleFilter, statusFilter, sortBy],
  queryFn: () => fetchUsers({ search: debouncedSearch, role: roleFilter, status: statusFilter, sort: sortBy }),
});
```

### Follow-up Questions sẽ được hỏi

1. "Why did you choose to debounce at 300ms?"
2. "How would you handle if the API returns an error?"
3. "What if we had 10,000 users? How would you optimize?"
4. "How would you add pagination to this?"
5. "How would you test this component?"

---

# Problem 2: Multi-Step Checkout Form

## Requirements

Build a multi-step checkout form with the following requirements:

### Functional Requirements

1. **Step 1: Contact Information**
   - Email (required, valid email format)
   - Phone (optional, valid phone format if provided)

2. **Step 2: Shipping Address**
   - Full name (required)
   - Street address (required)
   - City (required)
   - Postal code (required, format validation)
   - Country (required, select dropdown)

3. **Step 3: Payment**
   - Card number (required, show formatted: 1234 5678 9012 3456)
   - Expiry date (required, MM/YY format)
   - CVV (required, 3-4 digits)
   - Card holder name (required)

4. **Step 4: Review & Confirm**
   - Show summary of all entered data
   - Edit buttons to go back to specific step
   - Confirm button to submit

### Navigation Requirements

- Progress indicator showing current step
- Next/Back buttons
- Can only proceed to next step if current step is valid
- Can navigate back to edit previous steps
- Data persists when navigating between steps

### Validation Requirements

- Show validation errors inline below each field
- Show errors on blur and on submit attempt
- Disable Next button if current step has errors

### Non-Functional Requirements

- TypeScript
- Accessible: proper form labels, error announcements
- Responsive

---

## Solution Approach

### Component Structure
```
CheckoutForm
├── ProgressIndicator
├── StepContent
│   ├── ContactStep
│   ├── ShippingStep
│   ├── PaymentStep
│   └── ReviewStep
└── NavigationButtons
```

### Key Implementation Points

```tsx
// 1. Form state management
interface CheckoutData {
  contact: { email: string; phone: string };
  shipping: { name: string; address: string; city: string; postal: string; country: string };
  payment: { cardNumber: string; expiry: string; cvv: string; cardHolder: string };
}

const [formData, setFormData] = useState<CheckoutData>(initialData);
const [currentStep, setCurrentStep] = useState(0);
const [errors, setErrors] = useState<Partial<Record<keyof CheckoutData, Record<string, string>>>>({});

// 2. Step validation
const validateStep = (step: number): boolean => {
  const validators: Record<number, () => Record<string, string>> = {
    0: () => validateContact(formData.contact),
    1: () => validateShipping(formData.shipping),
    2: () => validatePayment(formData.payment),
  };

  const stepErrors = validators[step]?.() || {};
  setErrors(prev => ({ ...prev, [stepKeys[step]]: stepErrors }));
  return Object.keys(stepErrors).length === 0;
};

// 3. Navigation
const handleNext = () => {
  if (validateStep(currentStep)) {
    setCurrentStep(prev => prev + 1);
  }
};

const handleBack = () => {
  setCurrentStep(prev => prev - 1);
};

// 4. Card number formatting
const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};
```

### Follow-up Questions

1. "How would you persist form data if user refreshes the page?"
2. "How would you handle form submission errors from the API?"
3. "What if we need to support multiple payment methods?"
4. "How would you add a loading state during form submission?"
5. "How would you implement form analytics (track drop-off at each step)?"

---

# Problem 3: Real-time Notification Center

## Requirements

Build a notification center with the following requirements:

### Functional Requirements

1. **Notification Bell**
   - Bell icon in header
   - Badge showing unread count
   - Clicking opens notification panel

2. **Notification Panel**
   - Dropdown panel showing notifications
   - Each notification shows: title, message, time ago, read/unread status
   - Group notifications by: Today, Yesterday, Earlier
   - "Mark all as read" button
   - Click notification to mark as read

3. **Notification Types**
   - Info (blue) - general information
   - Success (green) - action completed
   - Warning (yellow) - attention needed
   - Error (red) - something went wrong

4. **Real-time Updates** (simulate)
   - New notifications can arrive while panel is open
   - New notification shows toast briefly
   - Counter updates automatically

### Non-Functional Requirements

- TypeScript
- Accessible: keyboard navigation, focus management
- Click outside to close panel
- Escape key to close panel
- Smooth animations

---

## Solution Approach

### Component Structure
```
Header
└── NotificationCenter
    ├── NotificationBell (button + badge)
    └── NotificationPanel
        ├── PanelHeader ("Notifications" + "Mark all read")
        ├── NotificationGroup
        │   ├── GroupHeader ("Today", "Yesterday", "Earlier")
        │   └── NotificationItem (multiple)
        └── EmptyState (if no notifications)
```

### Key Implementation Points

```tsx
// 1. Notification state
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

const [notifications, setNotifications] = useState<Notification[]>([]);
const [isOpen, setIsOpen] = useState(false);

// 2. Unread count
const unreadCount = useMemo(
  () => notifications.filter(n => !n.isRead).length,
  [notifications]
);

// 3. Group by date
const groupedNotifications = useMemo(() => {
  const today = startOfToday();
  const yesterday = subDays(today, 1);

  return {
    today: notifications.filter(n => isToday(n.createdAt)),
    yesterday: notifications.filter(n => isSameDay(n.createdAt, yesterday)),
    earlier: notifications.filter(n => isBefore(n.createdAt, yesterday)),
  };
}, [notifications]);

// 4. Mark as read
const markAsRead = (id: string) => {
  setNotifications(prev =>
    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
  );
};

const markAllAsRead = () => {
  setNotifications(prev =>
    prev.map(n => ({ ...n, isRead: true }))
  );
};

// 5. Click outside to close
const panelRef = useRef(null);
useOnClickOutside(panelRef, () => setIsOpen(false));

// 6. Simulate real-time
useEffect(() => {
  const interval = setInterval(() => {
    const shouldAdd = Math.random() > 0.7;
    if (shouldAdd) {
      const newNotification = generateRandomNotification();
      setNotifications(prev => [newNotification, ...prev]);
      // Show toast
      toast(newNotification.title);
    }
  }, 10000); // Every 10 seconds

  return () => clearInterval(interval);
}, []);
```

### Follow-up Questions

1. "How would you handle 1000+ notifications?"
2. "How would you implement WebSocket for real notifications?"
3. "How would you persist read/unread status?"
4. "How would you add infinite scroll to the notification list?"
5. "How would you handle notification preferences (email, push, in-app)?"

---

# General Tips for Live Coding

## Before Coding

1. **Read requirements thoroughly** - Don't rush
2. **Ask clarifying questions**:
   - "Should I handle error states?"
   - "Is accessibility a requirement?"
   - "Should this work on mobile?"
3. **Outline your approach** before writing code

## While Coding

1. **Think out loud** - Explain what you're doing
2. **Start simple** - Get it working, then improve
3. **Use good naming** - Self-documenting code
4. **Handle edge cases** as you go
5. **Type everything** - Show TypeScript skills

## Common Phrases to Use

```
"Let me start by setting up the component structure..."
"I'll create a custom hook for this logic..."
"Let me add TypeScript types first..."
"I'm using this pattern because..."
"Let me handle the loading state..."
"I should also consider accessibility here..."
"Let me refactor this to be more reusable..."
```

## After Coding

1. **Walk through your solution**
2. **Mention what you would improve** with more time
3. **Discuss trade-offs** of your approach
4. **Be ready for follow-up questions**

---

## Practice Checklist

```
□ Set up CodeSandbox account
□ Create a React TypeScript project
□ Practice Problem 1 (User Search) - 45 min
□ Practice Problem 2 (Checkout Form) - 45 min
□ Practice Problem 3 (Notifications) - 45 min
□ Practice explaining solutions out loud
□ Review follow-up questions for each problem
```

---

**Pro tip**: Time yourself! In the real interview, you'll have 30-45 minutes for coding before discussion.

**Good luck! 💪**
