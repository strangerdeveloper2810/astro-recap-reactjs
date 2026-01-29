# Design System Exercises: Build Components from Scratch

> **Mục đích**: Luyện thiết kế component theo đúng process, từ API design đến implementation
> **Approach**: Design API TRƯỚC → Implement SAU
> **Thời gian**: 30-45 phút mỗi component

---

## 🎨 Component Design Process

Luôn đi theo thứ tự này:

```
1. REQUIREMENTS: Component cần làm gì?
2. API DESIGN: Props interface trước khi code
3. STATES: Component có những states nào?
4. ACCESSIBILITY: A11y requirements
5. IMPLEMENTATION: Code
6. TESTING: Verify behavior
```

---

# Exercise 1: Button Component

## Requirements

Design a Button component với:
- **Variants**: primary, secondary, outline, ghost
- **Sizes**: sm, md, lg
- **States**: default, hover, active, disabled, loading
- **Features**: Icon support (left or right), full width option

---

## Step 1: API Design (Props Interface)

### 🧠 Thinking: Props cần gì?

<details>
<summary>Suy nghĩ về từng prop</summary>

```
1. Variant: Cần enum, không phải free string
2. Size: Cần enum
3. Disabled: boolean
4. Loading: boolean, khi loading cũng disabled
5. Icon: React element, position left/right
6. Full width: boolean
7. Children: Button text
8. onClick: Event handler
9. Type: button/submit/reset (HTML attribute)
```
</details>

### ✅ Final API Design

```tsx
interface ButtonProps {
  // Core
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  // Appearance
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';

  // States
  disabled?: boolean;
  loading?: boolean;

  // Extras
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;

  // HTML attributes
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

---

## Step 2: States & Styles

### 🧠 Thinking: Style mapping

<details>
<summary>Variant styles</summary>

```css
/* primary */
background: blue-600, color: white, hover: blue-700

/* secondary */
background: gray-200, color: gray-800, hover: gray-300

/* outline */
background: transparent, border: gray-300, hover: gray-100

/* ghost */
background: transparent, hover: gray-100
```
</details>

<details>
<summary>Size styles</summary>

```css
/* sm */
padding: 4px 8px, font-size: 14px

/* md */
padding: 8px 16px, font-size: 16px

/* lg */
padding: 12px 24px, font-size: 18px
```
</details>

---

## Step 3: Accessibility

```
✅ Use <button> element (not div)
✅ Disable focus when disabled
✅ aria-disabled when loading
✅ aria-busy="true" when loading
✅ Focus ring visible
✅ Sufficient color contrast
```

---

## Step 4: Implementation

```tsx
import { forwardRef } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  className = '',
}, ref) => {
  const isDisabled = disabled || loading;

  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-md
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-100 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={classes}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}

      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}

      {children}

      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
```

---

## Step 5: Usage Examples

```tsx
// Basic
<Button>Click me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>

// With icon
<Button icon={<PlusIcon />}>Add Item</Button>
<Button icon={<ArrowIcon />} iconPosition="right">Next</Button>

// Full width
<Button fullWidth>Full Width Button</Button>

// Form submit
<Button type="submit">Submit Form</Button>
```

---

## Step 6: Testing Checklist

```
□ Renders with default props
□ Each variant renders correctly
□ Each size renders correctly
□ Disabled state prevents click
□ Loading shows spinner
□ Loading prevents click
□ Icon renders in correct position
□ Full width applies correct style
□ forwardRef works (ref accessible)
□ Keyboard focus works
□ Click handler fires
```

---

# Exercise 2: Modal Component

## Requirements

Design a Modal với:
- Open/close controlled by parent
- Header, Body, Footer sections
- Close on backdrop click (optional)
- Close on Escape key
- Focus trap inside modal
- Accessible with ARIA

---

## Step 1: API Design

### 🧠 Thinking: Compound Components vs Props?

<details>
<summary>So sánh 2 approaches</summary>

**Props approach (config object)**
```tsx
<Modal
  open={true}
  title="Confirm"
  body="Are you sure?"
  primaryButton={{ label: 'Yes', onClick: handleYes }}
  secondaryButton={{ label: 'No', onClick: handleNo }}
/>
```
❌ Không flexible, khó customize

**Compound Components**
```tsx
<Modal open={true} onClose={handleClose}>
  <Modal.Header>
    <Modal.Title>Confirm</Modal.Title>
    <Modal.CloseButton />
  </Modal.Header>
  <Modal.Body>Are you sure?</Modal.Body>
  <Modal.Footer>
    <Button onClick={handleNo}>No</Button>
    <Button onClick={handleYes}>Yes</Button>
  </Modal.Footer>
</Modal>
```
✅ Flexible, readable, composable
</details>

### ✅ Final API Design

```tsx
// Main Modal
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

// Sub-components
interface ModalHeaderProps {
  children: React.ReactNode;
}

interface ModalTitleProps {
  children: React.ReactNode;
}

interface ModalBodyProps {
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}
```

---

## Step 2: Accessibility Requirements

```
✅ role="dialog"
✅ aria-modal="true"
✅ aria-labelledby pointing to title
✅ Focus moves to modal when opened
✅ Focus trapped inside modal
✅ Focus returns to trigger when closed
✅ Escape key closes modal
✅ Body scroll locked when open
```

---

## Step 3: Implementation

```tsx
import { createContext, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Context for sharing state
const ModalContext = createContext<{
  onClose: () => void;
  titleId: string;
} | null>(null);

// Custom hook to use modal context
function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within Modal');
  }
  return context;
}

// Main Modal component
function Modal({
  open,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus modal when opened
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }

    // Return focus when closed
    return () => {
      if (!open && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Focus trap
  useEffect(() => {
    if (!open) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <ModalContext.Provider value={{ onClose, titleId: titleId.current }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        {/* Modal container */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId.current}
          tabIndex={-1}
          className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  );
}

// Sub-components
Modal.Header = function ModalHeader({ children }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      {children}
    </div>
  );
};

Modal.Title = function ModalTitle({ children }: ModalTitleProps) {
  const { titleId } = useModalContext();
  return (
    <h2 id={titleId} className="text-lg font-semibold">
      {children}
    </h2>
  );
};

Modal.CloseButton = function ModalCloseButton() {
  const { onClose } = useModalContext();
  return (
    <button
      onClick={onClose}
      className="p-1 hover:bg-gray-100 rounded"
      aria-label="Close modal"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
};

Modal.Body = function ModalBody({ children }: ModalBodyProps) {
  return (
    <div className="px-6 py-4 overflow-y-auto flex-1">
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
      {children}
    </div>
  );
};

export default Modal;
```

---

## Step 4: Usage Example

```tsx
function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header>
          <Modal.Title>Confirm Action</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>

        <Modal.Body>
          <p>Are you sure you want to proceed with this action?</p>
          <p className="text-gray-500 mt-2">This cannot be undone.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            console.log('Confirmed!');
            setIsOpen(false);
          }}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
```

---

## Step 5: Testing Checklist

```
□ Opens when open=true
□ Closes when open=false
□ onClose called when backdrop clicked
□ onClose called when Escape pressed
□ Focus moves to modal on open
□ Focus trapped inside modal
□ Focus returns to trigger on close
□ Body scroll locked when open
□ ARIA attributes correct
□ Compound components work together
□ Custom content renders correctly
```

---

# Exercise 3: Tabs Component

## Requirements

Design a Tabs component với:
- Multiple tabs with panels
- Controlled or uncontrolled mode
- Keyboard navigation (arrow keys)
- Accessible (ARIA tabs pattern)

---

## Step 1: API Design

### 🧠 Thinking: Controlled vs Uncontrolled

<details>
<summary>Two modes</summary>

**Uncontrolled**: Component manages its own state
```tsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs>
```

**Controlled**: Parent manages state
```tsx
const [tab, setTab] = useState('tab1');
<Tabs value={tab} onValueChange={setTab}>
  ...
</Tabs>
```
</details>

### ✅ Final API Design

```tsx
interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;        // uncontrolled
  value?: string;               // controlled
  onValueChange?: (value: string) => void;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

interface TabsPanelProps {
  value: string;
  children: React.ReactNode;
}
```

---

## Step 2: Accessibility (ARIA Tabs Pattern)

```
TabList:
  - role="tablist"

Tab:
  - role="tab"
  - aria-selected="true/false"
  - aria-controls="panel-id"
  - tabIndex: 0 for selected, -1 for others

Panel:
  - role="tabpanel"
  - aria-labelledby="tab-id"
  - tabIndex="0" (focusable)

Keyboard:
  - Arrow Left/Right: navigate tabs
  - Home: first tab
  - End: last tab
  - Enter/Space: select tab (if not auto-select)
```

---

## Step 3: Implementation

```tsx
import { createContext, useContext, useState, useRef, useEffect } from 'react';

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within Tabs');
  return context;
}

// Main Tabs component
function Tabs({
  children,
  defaultValue,
  value: controlledValue,
  onValueChange,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
  const baseId = useRef(`tabs-${Math.random().toString(36).slice(2)}`);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const onChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onChange, baseId: baseId.current }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// TabsList
Tabs.List = function TabsList({ children }: TabsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { value, onChange } = useTabs();

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const tabs = listRef.current?.querySelectorAll('[role="tab"]:not([disabled])');
    if (!tabs) return;

    const tabArray = Array.from(tabs) as HTMLElement[];
    const currentIndex = tabArray.findIndex(tab => tab.getAttribute('aria-selected') === 'true');

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % tabArray.length;
        break;
      case 'ArrowLeft':
        newIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabArray.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const newTab = tabArray[newIndex];
    newTab.focus();
    const newValue = newTab.getAttribute('data-value');
    if (newValue) onChange(newValue);
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      className="flex border-b"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

// Tab button
Tabs.Tab = function Tab({ value: tabValue, children, disabled }: TabProps) {
  const { value, onChange, baseId } = useTabs();
  const isSelected = value === tabValue;

  return (
    <button
      role="tab"
      data-value={tabValue}
      aria-selected={isSelected}
      aria-controls={`${baseId}-panel-${tabValue}`}
      id={`${baseId}-tab-${tabValue}`}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && onChange(tabValue)}
      className={`
        px-4 py-2 -mb-px border-b-2 transition-colors
        ${isSelected
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
};

// Panel
Tabs.Panel = function TabsPanel({ value: panelValue, children }: TabsPanelProps) {
  const { value, baseId } = useTabs();
  const isSelected = value === panelValue;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${panelValue}`}
      aria-labelledby={`${baseId}-tab-${panelValue}`}
      tabIndex={0}
      className="py-4"
    >
      {children}
    </div>
  );
};

export default Tabs;
```

---

## Step 4: Usage Example

```tsx
// Uncontrolled
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="features">Features</Tabs.Tab>
    <Tabs.Tab value="pricing" disabled>Pricing</Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel value="overview">
    <h3>Overview</h3>
    <p>Product overview content here.</p>
  </Tabs.Panel>

  <Tabs.Panel value="features">
    <h3>Features</h3>
    <ul>
      <li>Feature 1</li>
      <li>Feature 2</li>
    </ul>
  </Tabs.Panel>

  <Tabs.Panel value="pricing">
    <h3>Pricing</h3>
    <p>Pricing information.</p>
  </Tabs.Panel>
</Tabs>

// Controlled
const [activeTab, setActiveTab] = useState('overview');

<Tabs value={activeTab} onValueChange={setActiveTab}>
  {/* same content */}
</Tabs>
```

---

## Step 5: Testing Checklist

```
□ Default tab selected on mount
□ Click changes active tab
□ Correct panel shows for active tab
□ Arrow keys navigate between tabs
□ Home/End keys work
□ Disabled tabs cannot be selected
□ ARIA attributes correct
□ Focus management works
□ Controlled mode works
□ Uncontrolled mode works
```

---

# Exercise 4: Select/Dropdown Component

## Requirements

Design a Select component với:
- Trigger button showing selected value
- Dropdown menu with options
- Keyboard navigation
- Search/filter options (optional)
- Multi-select (optional)

---

## Step 1: API Design

```tsx
interface SelectProps {
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  children: React.ReactNode;
}

interface SelectOptionProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}
```

---

## Step 2: Key Features

```
1. Click trigger → open dropdown
2. Click option → select, close (single) / toggle (multiple)
3. Click outside → close
4. Escape → close
5. Arrow keys → navigate options
6. Enter → select highlighted option
7. Type to search (if searchable)
```

---

## Step 3: Implementation (Simplified)

```tsx
import { createContext, useContext, useState, useRef, useEffect } from 'react';

interface SelectContextType {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

function useSelect() {
  const context = useContext(SelectContext);
  if (!context) throw new Error('Select components must be used within Select');
  return context;
}

function Select({
  value,
  onValueChange,
  placeholder = 'Select...',
  disabled = false,
  children,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{
      value,
      onChange: onValueChange,
      isOpen,
      setIsOpen,
      highlightedIndex,
      setHighlightedIndex,
    }}>
      <div ref={containerRef} className="relative inline-block w-64">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`
            w-full px-3 py-2 text-left border rounded-md
            flex items-center justify-between
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400'}
          `}
        >
          <span className={value ? '' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <ul
            role="listbox"
            className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {children}
          </ul>
        )}
      </div>
    </SelectContext.Provider>
  );
}

Select.Option = function SelectOption({
  value: optionValue,
  children,
  disabled = false,
}: SelectOptionProps) {
  const { value, onChange, setIsOpen } = useSelect();
  const isSelected = value === optionValue;

  const handleSelect = () => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      onClick={handleSelect}
      className={`
        px-3 py-2 cursor-pointer
        ${isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </li>
  );
};

export default Select;
```

---

## Step 4: Usage Example

```tsx
const [country, setCountry] = useState('');

<Select value={country} onValueChange={setCountry} placeholder="Select country">
  <Select.Option value="us">United States</Select.Option>
  <Select.Option value="uk">United Kingdom</Select.Option>
  <Select.Option value="au">Australia</Select.Option>
  <Select.Option value="vn">Vietnam</Select.Option>
</Select>
```

---

# Practice Schedule

```
Day 1: Button component (30 min)
Day 2: Modal component (45 min)
Day 3: Tabs component (45 min)
Day 4: Select component (45 min)
Day 5: Combine: Build a form with all components
```

---

## Key Principles to Remember

```
1. API Design FIRST - Props interface before implementation
2. Compound Components for flexibility
3. Controlled + Uncontrolled support
4. Accessibility is NOT optional
5. Keyboard navigation always
6. Focus management matters
7. Context for implicit state sharing
```

---

**Good luck! 💪**
