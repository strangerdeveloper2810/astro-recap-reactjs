# UI / Design System - Bilingual Interview Q&A
> **ANZ Senior Frontend Engineer Interview**
> Vietnamese giải thích + English sample answers
---

## UI-01: Component Architecture Layers

**Q:** *"How do you structure a component library for a large-scale application?"*

🇻🇳 **Giải thích chi tiết:**
Khi xây dựng component library cho ứng dụng lớn như banking app, ta cần phân chia thành nhiều layers rõ ràng theo mức độ abstraction. Layer thấp nhất là **Design Tokens** — chứa các giá trị nguyên thủy như colors, spacing, typography, border-radius. Tiếp theo là **Primitives** (hay Atoms) — các component cơ bản nhất như Button, Input, Text, Icon — chỉ phụ thuộc vào tokens, không chứa business logic. Layer **Composed** (hay Molecules) kết hợp nhiều primitives lại — ví dụ SearchBar = Input + Button + Icon. Layer cao nhất là **Feature Components** (hay Organisms) — chứa business logic cụ thể, ví dụ AccountTransferForm, TransactionTable. Việc phân layer giúp enforce separation of concerns: primitives team có thể phát triển độc lập, feature teams chỉ compose từ các component có sẵn. Ngoài ra, ta nên dùng **barrel exports** (index.ts) cho mỗi layer và enforce dependency rules — feature components KHÔNG được import từ feature khác, chỉ từ composed/primitives. Cách tiếp cận này scale rất tốt cho team 20-50 developers vì giảm conflicts và tăng reusability.

🇬🇧 **Sample Answer:**
> *"For a large-scale application like a banking platform, I structure the component library into four distinct layers. The foundation is Design Tokens — these are the primitive values for colors, spacing, typography, and shadows that define the visual language. Above that sits the Primitives layer — atomic components like Button, Input, Badge, and Typography that consume only tokens and have zero business logic. The third layer is Composed components — combinations of primitives such as SearchBar, DataTableHeader, or FormField that handle layout and interaction patterns. Finally, Feature components are domain-specific — AccountSummaryCard, TransactionHistoryTable — these contain business logic and are owned by product teams. I enforce strict dependency rules: primitives can only import tokens, composed can import primitives and tokens, and feature components can import from any lower layer but never from other feature modules. This architecture works exceptionally well with tools like Nx or Turborepo where you can enforce module boundaries. At scale, this means the design system team owns tokens through composed layers, while product teams own feature components, reducing merge conflicts and ensuring consistency."*

```
src/
├── design-tokens/
│   ├── colors.ts              # color primitives + semantic aliases
│   ├── spacing.ts             # 4px grid system
│   ├── typography.ts          # font families, sizes, weights
│   ├── shadows.ts             # elevation levels
│   └── index.ts               # barrel export
│
├── primitives/                # Atoms — no business logic
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   ├── Button.types.ts
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Text/
│   ├── Icon/
│   ├── Badge/
│   └── index.ts               # export all primitives
│
├── composed/                  # Molecules — combine primitives
│   ├── SearchBar/             # Input + Button + Icon
│   ├── FormField/             # Label + Input + ErrorMessage
│   ├── DataTableHeader/       # Text + SortIcon + FilterButton
│   ├── Pagination/            # Button + Text + Select
│   └── index.ts
│
├── features/                  # Organisms — business logic
│   ├── AccountSummaryCard/
│   ├── TransactionTable/
│   ├── TransferForm/
│   └── index.ts
│
└── layouts/                   # Page layouts
    ├── DashboardLayout/
    ├── AuthLayout/
    └── index.ts
```

---

## UI-02: Design Tokens

**Q:** *"What are design tokens and how do you implement them?"*

🇻🇳 **Giải thích chi tiết:**
Design Tokens là các giá trị thiết kế được lưu dưới dạng platform-agnostic — tức là có thể dùng cho Web (CSS), iOS (Swift), Android (Kotlin) từ cùng một source of truth. Tokens chia thành 3 cấp: **Global tokens** (blue-500, spacing-4), **Semantic tokens** (color-primary, color-danger — alias tới global), và **Component tokens** (button-background-color — alias tới semantic). Cách implement phổ biến nhất trên web là dùng **CSS Custom Properties** kết hợp với Tailwind config hoặc CSS-in-JS. Để support dark mode, ta define 2 sets semantic tokens: light và dark, rồi toggle bằng class hoặc `data-theme` attribute trên `<html>`. Tools như **Style Dictionary** (by Amazon) giúp generate tokens từ JSON sang CSS, SCSS, JS, Swift... tự động. Trong banking apps, tokens đặc biệt quan trọng vì brand consistency phải maintain across web, mobile, và internal tools. Khi design team thay đổi primary color, chỉ cần update token file — tất cả platforms tự động nhận thay đổi qua CI/CD pipeline.

🇬🇧 **Sample Answer:**
> *"Design tokens are the single source of truth for all visual design decisions — colors, spacing, typography, shadows, border radii — stored in a platform-agnostic format. I implement them in three tiers: global tokens are raw values like blue-500 or spacing-16, semantic tokens provide meaning like color-primary or color-danger by aliasing global tokens, and component tokens like button-bg-color alias semantic tokens for specific components. On the web, I use CSS Custom Properties as the runtime layer because they cascade naturally and can be changed at any DOM level — perfect for theming. For the build toolchain, I use Style Dictionary to transform a single JSON source into CSS custom properties, Tailwind theme config, TypeScript constants, and even iOS/Android values. Dark mode is implemented by swapping semantic token values under a `.dark` class or `[data-theme='dark']` attribute on the root element. In my Tailwind config, I map tokens to the theme object so developers use familiar utilities like `bg-primary` and `text-on-primary`. At ANZ, this approach ensures that when the brand team updates a color, it propagates across the web app, mobile app, and internal dashboards through a single token update in the design system repository."*

```typescript
// tokens/colors.ts — Global Tokens
export const globalTokens = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a5f',
  },
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  red: { 500: '#ef4444', 600: '#dc2626' },
  green: { 500: '#22c55e', 600: '#16a34a' },
} as const;

// tokens/semantic.ts — Semantic Tokens (theme-aware)
export const lightTheme = {
  'color-primary': globalTokens.blue[600],
  'color-primary-hover': globalTokens.blue[700],
  'color-danger': globalTokens.red[500],
  'color-success': globalTokens.green[500],
  'color-bg-primary': globalTokens.neutral[0],
  'color-bg-secondary': globalTokens.neutral[50],
  'color-text-primary': globalTokens.neutral[900],
  'color-text-secondary': globalTokens.neutral[700],
  'color-border': globalTokens.neutral[100],
};

export const darkTheme = {
  'color-primary': globalTokens.blue[500],
  'color-primary-hover': globalTokens.blue[600],
  'color-danger': globalTokens.red[600],
  'color-success': globalTokens.green[600],
  'color-bg-primary': globalTokens.neutral[900],
  'color-bg-secondary': globalTokens.neutral[800],
  'color-text-primary': globalTokens.neutral[0],
  'color-text-secondary': globalTokens.neutral[100],
  'color-border': globalTokens.neutral[700],
};
```

```css
/* Generated CSS Custom Properties */
:root {
  /* Global tokens */
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-4: 16px;
  --radius-sm: 4px;
  --radius-md: 8px;

  /* Semantic tokens — light mode (default) */
  --color-primary: var(--blue-600);
  --color-bg-primary: #ffffff;
  --color-text-primary: #0f172a;
  --color-border: #f1f5f9;
}

[data-theme='dark'] {
  --color-primary: var(--blue-500);
  --color-bg-primary: #0f172a;
  --color-text-primary: #ffffff;
  --color-border: #334155;
}
```

```typescript
// tailwind.config.ts — Consuming tokens
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'bg-primary': 'var(--color-bg-primary)',
        'text-primary': 'var(--color-text-primary)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      spacing: {
        1: 'var(--spacing-1)',
        2: 'var(--spacing-2)',
        4: 'var(--spacing-4)',
      },
    },
  },
};
export default config;
```

---

## UI-03: Wrapper Components for Third-Party Libraries

**Q:** *"Should you wrap third-party UI libraries? Why?"*

🇻🇳 **Giải thích chi tiết:**
Wrap third-party UI library là best practice quan trọng cho enterprise applications. Lý do chính là **migration safety** — nếu team quyết định chuyển từ MUI sang Ant Design hoặc Radix, chỉ cần update wrapper mà không cần touch hàng trăm files sử dụng component trực tiếp. Thứ hai là **consistent API** — wrapper cho phép ta chuẩn hóa props interface, ví dụ bọc `variant` prop để mapping từ design system terminology sang MUI terminology. Thứ ba là **type safety** — ta có thể restrict props mà team không nên dùng, và add thêm custom props. Thứ tư là **centralized customization** — thay vì mỗi dev tự style MUI Button khác nhau, wrapper enforce một look-and-feel duy nhất. Tuy nhiên, cần cân nhắc: không nên wrap tất cả mọi thứ — chỉ wrap những component dùng phổ biến (Button, Input, Select, Dialog, Table). Và wrapper phải thin — chỉ là adapter layer, không nên chứa business logic. Trong banking project, điều này cực kỳ quan trọng vì vendor lock-in có thể gây chi phí migration rất lớn khi library bị deprecated hoặc có security vulnerability.

🇬🇧 **Sample Answer:**
> *"Absolutely, wrapping third-party UI libraries is a critical practice for enterprise applications. The primary reason is migration safety — when we wrapped Material UI at a previous project, we were able to migrate specific components to Radix UI incrementally without touching any consumer code. The wrapper acts as an adapter layer: it exposes our own consistent API that maps to the underlying library's props. This gives us type safety benefits too — we can restrict which props are exposed to prevent misuse and add custom props that integrate with our design token system. Centralized customization is another major benefit: instead of developers applying ad-hoc styles to MUI buttons scattered across 200 files, the wrapper enforces our exact design system specifications. I keep wrappers thin — they should only handle prop mapping, default values, and styling integration, never business logic. In practice, I wrap the 15-20 most commonly used components: Button, Input, Select, Dialog, Table, Tooltip, and similar primitives. For a banking application where security patches and library updates are frequent, this abstraction layer means we can upgrade or swap dependencies with confidence and minimal risk."*

```typescript
// components/primitives/Button/Button.tsx
// Wrapper around MUI Button — consistent API + type safety

import MuiButton, {
  type ButtonProps as MuiButtonProps,
} from '@mui/material/Button';
import { forwardRef } from 'react';
import { clsx } from 'clsx';

// Our design system variants — NOT MUI's variants
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;           // Custom prop — MUI doesn't have this
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
  // Intentionally NOT exposing all MUI props
  // This restricts usage to our design system specs
}

// Map our variants to MUI variants
const variantMap: Record<ButtonVariant, MuiButtonProps['variant']> = {
  primary: 'contained',
  secondary: 'outlined',
  danger: 'contained',
  ghost: 'text',
};

const sizeMap: Record<ButtonSize, MuiButtonProps['size']> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled = false,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <MuiButton
        ref={ref}
        variant={variantMap[variant]}
        size={sizeMap[size]}
        fullWidth={fullWidth}
        disabled={disabled || loading}
        className={clsx(
          variant === 'danger' && 'bg-danger hover:bg-danger-dark',
          className
        )}
        {...rest}
      >
        {loading ? <Spinner size="sm" /> : children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

// Usage — consumers never import from @mui/material directly
// import { Button } from '@/primitives';
// <Button variant="primary" size="md" loading={isSubmitting}>Submit</Button>
```

```typescript
// If migrating from MUI to Radix — only change the wrapper internals:
// Before: import MuiButton from '@mui/material/Button';
// After:  import * as RadixButton from '@radix-ui/react-button';
// Consumer code: ZERO changes needed
```

---

## UI-04: MUI vs Antd vs Shadcn/ui vs Radix

**Q:** *"How do you choose a UI component library for an enterprise project?"*

🇻🇳 **Giải thích chi tiết:**
Việc chọn UI library cho enterprise project cần đánh giá nhiều tiêu chí: **Bundle size** — MUI và Ant Design khá nặng (~80-150KB gzipped nếu dùng nhiều components), trong khi Radix + Tailwind hoặc shadcn/ui cho phép tree-shake triệt để hơn. **Customizability** — MUI dùng CSS-in-JS (Emotion/styled-components) khó override sâu, Ant Design dùng Less/CSS variables dễ theme hơn, còn shadcn/ui copy source code vào project nên customize hoàn toàn tự do. **Accessibility** — Radix UI được build từ đầu với a11y tuyệt vời (focus management, ARIA, keyboard), MUI cũng tốt, Ant Design thì yếu hơn về a11y. **Learning curve** — MUI có ecosystem lớn nhất và documentation tốt, Ant Design phổ biến trong Chinese tech ecosystem, shadcn/ui đang trend mạnh vì flexibility. Đối với banking app (ANZ), tôi recommend **Radix UI primitives + Tailwind CSS** hoặc **shadcn/ui** vì: bundle size nhỏ, a11y excellent, full control over styling, và không bị vendor lock-in. MUI phù hợp hơn cho internal tools hoặc admin dashboards cần ship nhanh. Ant Design phù hợp cho data-heavy dashboards nhưng hạn chế khi cần brand customization sâu.

🇬🇧 **Sample Answer:**
> *"Choosing a UI library for an enterprise project requires evaluating several critical dimensions. For bundle size, MUI and Ant Design are heavier — MUI's full suite with Emotion can add 80-100KB gzipped, while Radix primitives are typically 2-5KB per component since they're unstyled and tree-shakeable. For customizability, shadcn/ui is the clear winner because you literally own the source code — components are copied into your project, giving you complete control. MUI uses CSS-in-JS with a theme override system that works but gets complex for deep customization. Ant Design historically used Less variables but has moved to CSS-in-JS in v5, which improved theming but increased bundle size. Accessibility is non-negotiable for banking: Radix UI is built with WAI-ARIA patterns from the ground up — every component handles focus management, keyboard navigation, and screen reader announcements correctly. MUI is also strong here, but Ant Design has historically lagged on accessibility compliance. For ANZ specifically, I would recommend Radix UI primitives combined with Tailwind CSS, or equivalently shadcn/ui which builds on this stack. This gives us excellent accessibility out of the box, minimal bundle overhead, complete styling control to match ANZ's brand guidelines, and no vendor lock-in since we own the component code. MUI would be my pick for rapid internal tool development where design flexibility matters less, and Ant Design for data-heavy admin dashboards where its Table and Form components provide significant productivity gains."*

```
┌─────────────────────────────────────────────────────────────────────┐
│                    UI Library Comparison Matrix                      │
├──────────────┬──────────┬──────────┬──────────────┬────────────────┤
│ Criteria     │ MUI      │ Ant Design│ shadcn/ui   │ Radix UI       │
├──────────────┼──────────┼──────────┼──────────────┼────────────────┤
│ Bundle Size  │ Heavy    │ Heavy    │ Minimal      │ Minimal        │
│ (gzipped)    │ ~80KB+   │ ~100KB+  │ ~2-5KB/comp  │ ~2-5KB/comp    │
├──────────────┼──────────┼──────────┼──────────────┼────────────────┤
│ Styling      │ CSS-in-JS│ CSS-in-JS│ Tailwind CSS │ Unstyled       │
│              │ (Emotion)│ (v5)     │ (own source) │ (bring your own)│
├──────────────┼──────────┼──────────┼──────────────┼────────────────┤
│ A11y (WCAG)  │ Good     │ Fair     │ Excellent    │ Excellent      │
├──────────────┼──────────┼──────────┼──────────────┼────────────────┤
│ Customiz-    │ Theme    │ Theme    │ Full source  │ Unstyled =     │
│ ability      │ override │ tokens   │ ownership    │ total control  │
├──────────────┼──────────┼──────────┼──────────────┼────────────────┤
│ Learning     │ Moderate │ Moderate │ Low          │ Low-Moderate   │
│ Curve        │ (large   │ (Chinese │ (Tailwind +  │ (need to build │
│              │  API)    │  docs)   │  copy/paste) │  your own UI)  │
├──────────────┼──────────┼──────────┼──────────────┼────────────────┤
│ Best For     │ Internal │ Data-    │ Custom brand │ Design system  │
│              │ tools    │ heavy    │ apps         │ foundations    │
│              │ MVP/fast │ admin    │ Enterprise   │ Max control    │
├──────────────┼──────────┼──────────┼──────────────┼────────────────┤
│ TypeScript   │ Excellent│ Good     │ Excellent    │ Excellent      │
├──────────────┼──────────┼──────────┼──────────────┼────────────────┤
│ Tree-shaking │ Partial  │ Partial  │ Full         │ Full           │
└──────────────┴──────────┴──────────┴──────────────┴────────────────┘

Recommendation for ANZ Banking:
  Primary: shadcn/ui (Radix + Tailwind) for customer-facing apps
  Secondary: MUI for internal admin tools (rapid development)
```

---

## UI-05: Accessibility (WCAG AA)

**Q:** *"What are the key WCAG AA requirements for a banking application?"*

🇻🇳 **Giải thích chi tiết:**
WCAG AA compliance là bắt buộc cho banking applications vì liên quan đến luật pháp (ADA compliance ở Mỹ, Disability Discrimination Act ở Australia). Các yêu cầu chính: **Color Contrast** — text thường cần ratio tối thiểu 4.5:1, large text cần 3:1, và UI components/icons cần 3:1 against background. **Keyboard Navigation** — mọi interactive element phải accessible bằng Tab, Enter, Space, Arrow keys; focus phải visible rõ ràng (focus ring); và focus order phải logical. **ARIA attributes** — dùng đúng roles, labels, và states: `aria-label` cho elements không có visible text, `aria-describedby` cho error messages, `aria-live` cho dynamic content updates (ví dụ transaction status). **Forms** — mỗi input phải có associated label (dùng `htmlFor` hoặc `aria-labelledby`), error messages phải programmatically linked, và validation errors phải announced cho screen readers. **Screen Readers** — semantic HTML là foundation (dùng `<button>` thay vì `<div onClick>`), headings phải hierarchical (h1 > h2 > h3), và landmarks (`<nav>`, `<main>`, `<aside>`) giúp navigation. Trong banking context, điều này đặc biệt critical vì users cần access financial information — balance, transactions, transfers — và bất kỳ barrier nào đều là rủi ro pháp lý và đạo đức.

🇬🇧 **Sample Answer:**
> *"WCAG AA compliance is legally mandated for banking applications in Australia under the Disability Discrimination Act, and it's also a core business requirement since banking services must be accessible to all customers. The key requirements fall into several categories. Color contrast ratios must meet 4.5:1 for normal text and 3:1 for large text — I use tools like axe DevTools and Lighthouse to audit this, and our design tokens encode AA-compliant color pairings. Keyboard navigation is critical: every interactive element must be reachable via Tab, operable with Enter/Space, and dismissible with Escape for overlays. Focus indicators must be clearly visible — I ensure a minimum 2px focus ring with sufficient contrast. ARIA implementation includes proper roles, labels, and live regions: form inputs need associated labels via htmlFor or aria-labelledby, error messages use aria-describedby to be announced by screen readers, and dynamic content like transaction status updates use aria-live regions. I enforce semantic HTML as the foundation — using button elements instead of div with onClick, proper heading hierarchy, and landmark regions like nav, main, and aside. For forms specifically, which are central to banking, I implement inline validation that announces errors immediately, group related fields with fieldset and legend, and ensure error recovery is straightforward. We integrate automated accessibility testing with jest-axe in unit tests and axe-core in our CI pipeline, catching about 30-40% of issues automatically. The remaining 60% requires manual testing with screen readers like VoiceOver and NVDA, which we do as part of our QA process for every feature release."*

```tsx
// Accessible Form Example — Banking Transfer Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const transferSchema = z.object({
  fromAccount: z.string().min(1, 'Please select a source account'),
  toAccount: z.string().min(1, 'Please select a destination account'),
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than zero')
    .max(50000, 'Maximum transfer amount is $50,000'),
  description: z.string().max(100).optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

export function TransferForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Transfer funds"
      noValidate
    >
      {/* Grouped related fields with fieldset */}
      <fieldset>
        <legend className="text-lg font-semibold">Account Details</legend>

        {/* From Account — proper label association */}
        <div className="form-field">
          <label htmlFor="fromAccount">From Account</label>
          <select
            id="fromAccount"
            {...register('fromAccount')}
            aria-required="true"
            aria-invalid={!!errors.fromAccount}
            aria-describedby={
              errors.fromAccount ? 'fromAccount-error' : undefined
            }
          >
            <option value="">Select account</option>
            <option value="savings">Savings ****1234</option>
            <option value="checking">Checking ****5678</option>
          </select>
          {errors.fromAccount && (
            <p
              id="fromAccount-error"
              role="alert"
              className="text-danger text-sm"
            >
              {errors.fromAccount.message}
            </p>
          )}
        </div>

        {/* Amount — with aria-describedby for help text + error */}
        <div className="form-field">
          <label htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            aria-required="true"
            aria-invalid={!!errors.amount}
            aria-describedby={[
              'amount-help',
              errors.amount ? 'amount-error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          <p id="amount-help" className="text-sm text-secondary">
            Daily limit: $50,000
          </p>
          {errors.amount && (
            <p id="amount-error" role="alert" className="text-danger text-sm">
              {errors.amount.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* Submit with loading state announced */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        aria-label={isSubmitting ? 'Processing transfer' : 'Submit transfer'}
      >
        {isSubmitting ? 'Processing...' : 'Transfer Funds'}
      </button>

      {/* Live region for status updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isSubmitting && 'Transfer is being processed. Please wait.'}
      </div>
    </form>
  );
}
```

```tsx
// jest-axe — Automated a11y testing in CI
import { render, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('TransferForm accessibility', () => {
  it('should have no WCAG AA violations', async () => {
    const { container } = render(<TransferForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should announce errors to screen readers', async () => {
    const { getByRole, findByRole } = render(<TransferForm />);
    fireEvent.click(getByRole('button', { name: /submit/i }));
    const errorAlert = await findByRole('alert');
    expect(errorAlert).toBeInTheDocument();
  });
});
```

---

## UI-06: Responsive Design

**Q:** *"How do you approach responsive design in a large React application?"*

🇻🇳 **Giải thích chi tiết:**
Responsive design trong large React app cần approach có hệ thống, không phải ad-hoc media queries rải khắp nơi. Đầu tiên là **Mobile-first strategy** — viết styles cho mobile trước, rồi add breakpoints cho tablet/desktop. Lý do: mobile constraints force tập trung vào content hierarchy và performance. Thứ hai là **Breakpoint system** — define một bộ breakpoints chuẩn trong design tokens (sm: 640px, md: 768px, lg: 1024px, xl: 1280px) và dùng nhất quán. Với Tailwind CSS, responsive prefixes (sm:, md:, lg:) rất tiện — `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"`. Thứ ba là dùng **CSS Grid + Flexbox** kết hợp: Grid cho page-level layouts (sidebar + content + aside), Flexbox cho component-level alignment. Thứ tư là tránh dùng JavaScript cho responsive logic — CSS media queries và container queries hiệu quả hơn rất nhiều. Chỉ dùng JS (useMediaQuery hook) khi cần conditionally render hoàn toàn khác nhau — ví dụ mobile drawer vs desktop sidebar. Trong banking apps, responsive đặc biệt quan trọng vì customers check balances và làm transfers trên phone — nếu form bị broken trên mobile, đó là mất revenue trực tiếp. Container queries (CSS `@container`) là game changer cho component-based responsive vì component tự adapt theo container size, không phải viewport size.

🇬🇧 **Sample Answer:**
> *"I approach responsive design with a systematic mobile-first strategy. We start by defining a standardized breakpoint system in our design tokens — typically sm at 640px, md at 768px, lg at 1024px, and xl at 1280px — and enforce these consistently. With Tailwind CSS, this is ergonomic: developers write `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` and the mobile-first cascade handles the rest. For layout architecture, I use CSS Grid for page-level layouts — the classic sidebar-content-aside pattern — and Flexbox for component-level alignment and distribution. A critical principle is keeping responsive logic in CSS, not JavaScript. CSS media queries and the newer container queries are vastly more performant than JavaScript-based resize observers for layout changes. I only reach for a useMediaQuery hook when we need to conditionally render entirely different component trees — like swapping a desktop data table for a mobile card-based list. Container queries are particularly valuable for our component library because they allow components to adapt to their container's width rather than the viewport, making them truly reusable across different layout contexts. For banking applications where over 60% of customer sessions are on mobile, we implement a rigorous responsive testing matrix across breakpoints, and our Storybook stories include viewport presets for each component. We also pay special attention to touch targets — ensuring buttons and interactive elements are at least 44x44px on mobile, as recommended by WCAG."*

```tsx
// Responsive Layout Pattern — Banking Dashboard
import { clsx } from 'clsx';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={clsx(
        // Mobile: single column, stacked
        'grid grid-cols-1 gap-4 p-4',
        // Tablet: sidebar + content
        'md:grid-cols-[240px_1fr] md:gap-6 md:p-6',
        // Desktop: sidebar + content + aside
        'lg:grid-cols-[280px_1fr_300px] lg:gap-8 lg:p-8',
        // Large desktop: constrained width
        'xl:max-w-[1440px] xl:mx-auto'
      )}
    >
      {children}
    </div>
  );
}

// Responsive Component — Transaction List
// Desktop: table layout | Mobile: card layout
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <>
      {/* Desktop Table — hidden on mobile */}
      <table className="hidden md:table w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.date}</td>
              <td>{tx.description}</td>
              <td className={tx.amount < 0 ? 'text-danger' : 'text-success'}>
                {formatCurrency(tx.amount)}
              </td>
              <td>{formatCurrency(tx.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards — hidden on desktop */}
      <div className="flex flex-col gap-3 md:hidden">
        {transactions.map((tx) => (
          <div key={tx.id} className="rounded-lg border p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{tx.description}</p>
                <p className="text-sm text-secondary">{tx.date}</p>
              </div>
              <span
                className={clsx(
                  'font-semibold text-lg',
                  tx.amount < 0 ? 'text-danger' : 'text-success'
                )}
              >
                {formatCurrency(tx.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
```

```css
/* Container Queries — Component adapts to container, not viewport */
.account-card-container {
  container-type: inline-size;
  container-name: account-card;
}

@container account-card (min-width: 400px) {
  .account-card {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
  }
}

@container account-card (max-width: 399px) {
  .account-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
```

---

## UI-07: Storybook for Component Development

**Q:** *"How does Storybook fit into your component development workflow?"*

🇻🇳 **Giải thích chi tiết:**
Storybook là công cụ cốt lõi trong component-driven development, đặc biệt quan trọng cho design system teams. Thứ nhất, Storybook cho phép **isolated development** — dev có thể build và test component mà không cần chạy cả app, không cần mock API, không cần navigate qua 5 pages để tới component cần test. Thứ hai là **auto-generated documentation** — với `autodocs` tag, Storybook tự generate docs từ TypeScript types, JSDoc comments, và stories, tạo thành living documentation luôn sync với code. Thứ ba là **visual testing** — kết hợp với Chromatic (by Storybook team), mỗi PR tự động chụp screenshots của tất cả stories và so sánh pixel-by-pixel để phát hiện visual regressions. Thứ tư là **interaction testing** — play functions trong Storybook cho phép viết user interaction tests ngay trong story (click, type, verify). Thứ năm là **team collaboration** — designers review components trực tiếp trên published Storybook, QA test edge cases (error states, loading states, empty states) mà không cần build app. Trong enterprise context, Storybook cũng là nơi enforce accessibility — dùng `@storybook/addon-a11y` để hiện a11y violations ngay khi dev đang build component. Ngoài ra, Storybook 7+ hỗ trợ Component Story Format 3 (CSF3) giúp stories gọn hơn rất nhiều.

🇬🇧 **Sample Answer:**
> *"Storybook is central to our component development workflow — it's not just a documentation tool, it's the primary development environment for UI components. Developers build components in isolation first, focusing purely on the component's visual states and behavior without needing the full application context, API connections, or complex navigation. We use the autodocs feature extensively — it generates comprehensive documentation directly from TypeScript interfaces and JSDoc comments, creating living documentation that never goes stale. For visual regression testing, we integrate Chromatic in our CI pipeline. Every pull request triggers automatic screenshot comparisons across all stories, catching unintended visual changes pixel-by-pixel before they reach production. Interaction testing with play functions allows us to script user interactions — clicking buttons, filling forms, verifying error states — directly in stories, complementing our unit tests. The accessibility addon runs axe-core audits on every story, so developers see WCAG violations immediately while building, not as an afterthought. For team collaboration, our published Storybook serves as the contract between design and engineering: designers verify their specifications against real components, QA testers explore edge cases like error states and loading skeletons, and product managers demo features. We organize stories by our component architecture layers — tokens, primitives, composed, features — and require stories for every component in the primitives and composed layers as a pull request requirement."*

```tsx
// Button.stories.tsx — CSF3 format with autodocs + interaction testing
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],             // Auto-generate documentation
  parameters: {
    layout: 'centered',
    a11y: {                       // a11y addon config
      config: { rules: [{ id: 'color-contrast', enabled: true }] },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'Visual style variant from the design system',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default state
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Transfer Funds',
    size: 'md',
  },
};

// All variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Processing...',
  },
};

// Interaction test — verify click behavior
export const ClickInteraction: Story = {
  args: {
    variant: 'primary',
    children: 'Submit',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /submit/i });

    // Verify button is enabled
    await expect(button).not.toBeDisabled();

    // Click the button
    await userEvent.click(button);

    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// Keyboard accessibility test
export const KeyboardNavigation: Story = {
  args: {
    variant: 'primary',
    children: 'Accessible Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Tab to button
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Activate with Enter
    await userEvent.keyboard('{Enter}');

    // Activate with Space
    await userEvent.keyboard(' ');
  },
};
```

```typescript
// .storybook/main.ts — Storybook configuration
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/design-tokens/**/*.stories.@(ts|tsx)',
    '../src/primitives/**/*.stories.@(ts|tsx)',
    '../src/composed/**/*.stories.@(ts|tsx)',
    '../src/features/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',   // Controls, Actions, Docs
    '@storybook/addon-a11y',         // Accessibility auditing
    '@storybook/addon-interactions', // Interaction testing
    '@storybook/addon-coverage',     // Code coverage
  ],
  docs: {
    autodocs: 'tag',                 // Auto-docs for tagged stories
  },
};

export default config;
```

---

## UI-08: Modal/Dialog System Design

**Q:** *"How would you implement a reusable modal system in React?"*

🇻🇳 **Giải thích chi tiết:**
Modal/Dialog system trong enterprise app cần xử lý nhiều concerns phức tạp. **Portal rendering** — modal phải render qua React Portal (`createPortal`) tới `document.body` hoặc dedicated modal root, để tránh CSS overflow/z-index issues từ parent containers. **Focus trap** — khi modal mở, focus phải bị "trap" bên trong (Tab cycles qua các interactive elements trong modal, không escape ra ngoài). **Escape key** — nhấn Escape phải đóng modal, và phải handle nested modals (Escape đóng modal trên cùng). **Scroll lock** — body scroll phải bị disable khi modal mở, nhưng modal content vẫn scrollable nếu content dài. **ARIA attributes** — cần `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (trỏ tới title), và `aria-describedby` (trỏ tới description). **Compound components pattern** — API nên là `<Dialog>`, `<Dialog.Trigger>`, `<Dialog.Content>`, `<Dialog.Title>`, `<Dialog.Close>` — dùng React Context để share state, cho phép flexible composition. **Animation** — dùng CSS transitions hoặc Framer Motion cho enter/exit animations, nhưng phải đảm bảo `prefers-reduced-motion` được respect. Trong banking context, modals thường dùng cho confirmation dialogs (chuyển khoản), session timeout warnings, và 2FA prompts — mỗi cái đều critical về UX và accessibility.

🇬🇧 **Sample Answer:**
> *"A production-grade modal system requires handling several interconnected concerns correctly. I use React Portals to render the modal at the document body level, avoiding CSS stacking context issues that plague nested components. Focus management is critical: when the modal opens, focus moves to the first focusable element inside, Tab and Shift+Tab cycle through interactive elements within the modal without escaping, and when the modal closes, focus returns to the trigger element. I implement Escape key handling that respects modal stacking — pressing Escape closes only the topmost modal. Scroll lock prevents the background page from scrolling while the modal is open, but I ensure the modal content itself remains scrollable for long content. For the component API, I use the compound components pattern — Dialog, Dialog.Trigger, Dialog.Content, Dialog.Title, Dialog.Description, Dialog.Close — sharing state through React Context. This gives consumers maximum flexibility in composition while maintaining correct accessibility semantics. ARIA implementation includes role=dialog, aria-modal=true, aria-labelledby pointing to the title, and aria-describedby pointing to the description. I also respect the prefers-reduced-motion media query by disabling animations for users who request it. In banking applications, modals serve critical functions — transfer confirmations, session timeout warnings, two-factor authentication prompts — so they must be bulletproof in terms of accessibility and interaction reliability. Rather than building this from scratch, I typically start with Radix Dialog which handles all the accessibility primitives correctly, then add our design system styling on top."*

```tsx
// Dialog System — Compound Components + Portal + Focus Trap + ARIA
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useId,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

// --- Context ---
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('Dialog components must be used within <Dialog>');
  return ctx;
}

// --- Root ---
interface DialogProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export function Dialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnChange,
  defaultOpen = false,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnChange ?? setInternalOpen;
  const id = useId();

  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange,
        titleId: `${id}-title`,
        descriptionId: `${id}-desc`,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

// --- Trigger ---
function DialogTrigger({
  children,
  ...props
}: { children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useDialogContext();
  return (
    <button onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  );
}
Dialog.Trigger = DialogTrigger;

// --- Content (Portal + Backdrop + Focus Trap) ---
function DialogContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open, onOpenChange, titleId, descriptionId } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save and restore focus
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Scroll lock
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !contentRef.current) return;

      const focusableEls = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    []
  );

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        className={clsx(
          'relative z-10 bg-bg-primary rounded-xl shadow-xl',
          'max-h-[85vh] overflow-y-auto',
          'w-full max-w-lg mx-4 p-6',
          'animate-scale-in',
          'motion-reduce:animate-none',
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
Dialog.Content = DialogContent;

// --- Title ---
function DialogTitle({ children }: { children: ReactNode }) {
  const { titleId } = useDialogContext();
  return (
    <h2 id={titleId} className="text-xl font-semibold">
      {children}
    </h2>
  );
}
Dialog.Title = DialogTitle;

// --- Description ---
function DialogDescription({ children }: { children: ReactNode }) {
  const { descriptionId } = useDialogContext();
  return (
    <p id={descriptionId} className="text-secondary mt-2">
      {children}
    </p>
  );
}
Dialog.Description = DialogDescription;

// --- Close ---
function DialogClose({ children }: { children: ReactNode }) {
  const { onOpenChange } = useDialogContext();
  return <button onClick={() => onOpenChange(false)}>{children}</button>;
}
Dialog.Close = DialogClose;
```

```tsx
// Usage — Banking Transfer Confirmation Dialog
function TransferConfirmation({ amount, toAccount, onConfirm }) {
  return (
    <Dialog>
      <Dialog.Trigger className="btn-primary">
        Transfer ${amount}
      </Dialog.Trigger>

      <Dialog.Content>
        <Dialog.Title>Confirm Transfer</Dialog.Title>
        <Dialog.Description>
          You are about to transfer ${amount} to account {toAccount}.
          This action cannot be undone.
        </Dialog.Description>

        <div className="mt-6 flex gap-3 justify-end">
          <Dialog.Close>
            <span className="btn-secondary">Cancel</span>
          </Dialog.Close>
          <button className="btn-primary" onClick={onConfirm}>
            Confirm Transfer
          </button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
```

---

## UI-09: Form Design Patterns

**Q:** *"What patterns do you use for complex forms in React?"*

🇻🇳 **Giải thích chi tiết:**
Forms là phần phức tạp nhất trong frontend banking apps — từ simple login form tới multi-step loan application với conditional fields, file uploads, và real-time validation. **React Hook Form** là lựa chọn tốt nhất hiện tại vì: uncontrolled by default (ít re-renders), API đơn giản, integration tốt với UI libraries, và bundle size nhỏ (~9KB). So với Formik, RHF nhanh hơn đáng kể cho forms lớn (50+ fields) vì không re-render toàn bộ form khi 1 field thay đổi. **Validation** dùng **Zod** (hoặc Yup) — Zod ưu tiên hơn vì TypeScript-first, infer types từ schema, và ecosystem đang grow nhanh. Pattern quan trọng: define schema trước, rồi infer TypeScript type từ schema — single source of truth cho cả validation lẫn types. **Multi-step forms** dùng state machine pattern hoặc đơn giản hơn là current step state + array of step configs. Mỗi step có schema riêng, validate khi chuyển step. **Error handling** cần inline errors (ngay dưới field), summary errors (đầu form cho screen readers), và server errors mapping. **Field arrays** (dynamic rows) dùng `useFieldArray` của RHF. Trong banking, forms thường cần **debounced validation** (check account number real-time), **conditional fields** (hiện extra fields dựa trên account type), và **autosave** (save draft để user quay lại sau).

🇬🇧 **Sample Answer:**
> *"For complex forms in React, I use React Hook Form as the foundation because its uncontrolled approach minimizes re-renders — critical for forms with 30-50 fields like loan applications. I pair it with Zod for schema validation because Zod is TypeScript-first and lets me infer form types directly from the schema, creating a single source of truth for both validation rules and TypeScript types. For multi-step forms, I define each step as a configuration object with its own Zod schema, and validate the current step before allowing navigation to the next. I use useFormContext to share form state across step components without prop drilling. React Hook Form's useFieldArray handles dynamic fields elegantly — adding or removing beneficiaries in a payment form, for instance. Error handling follows a three-tier approach: inline errors immediately below the field with aria-describedby linking, a summary error section at the top for screen reader users with aria-live, and server-side error mapping that matches API error paths to form field paths. For banking-specific patterns, I implement debounced async validation for account number verification, conditional field rendering based on transaction type, and form state persistence to localStorage so users can resume partially completed applications. Performance optimization includes using the `watch` function sparingly and preferring `useWatch` for specific fields to minimize subscription scope. We also implement optimistic field-level validation that runs on blur rather than onChange to avoid overwhelming users with premature error messages."*

```tsx
// Complex Banking Form — React Hook Form + Zod + Multi-step
import {
  useForm,
  useFormContext,
  FormProvider,
  useFieldArray,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect, useId, forwardRef } from 'react';

// --- Step 1: Define Schemas (Single Source of Truth) ---
const accountDetailsSchema = z.object({
  accountType: z.enum(['personal', 'business'], {
    errorMap: () => ({ message: 'Please select an account type' }),
  }),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'),
  companyName: z.string().optional(),
  abn: z.string().optional(),
});

const transferDetailsSchema = z.object({
  fromAccount: z.string().min(1, 'Please select source account'),
  toAccountBSB: z.string().regex(/^\d{6}$/, 'BSB must be 6 digits'),
  toAccountNumber: z
    .string()
    .regex(/^\d{6,10}$/, 'Account number must be 6-10 digits'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(50000, 'Maximum $50,000'),
  description: z.string().max(200).optional(),
  scheduledDate: z.date().optional(),
  additionalPayees: z
    .array(
      z.object({
        name: z.string().min(1, 'Payee name required'),
        bsb: z.string().regex(/^\d{6}$/, 'Invalid BSB'),
        accountNumber: z.string().min(6, 'Invalid account'),
        amount: z.number().positive(),
      })
    )
    .optional(),
});

const confirmationSchema = z.object({
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
  twoFactorCode: z.string().length(6, 'Code must be 6 digits'),
});

// Combined schema — infer full form type
const fullFormSchema = accountDetailsSchema
  .merge(transferDetailsSchema)
  .merge(confirmationSchema);

type FullFormData = z.infer<typeof fullFormSchema>;

// --- Step 2: Step Configuration ---
const STEPS = [
  { id: 'account', title: 'Account Details', schema: accountDetailsSchema },
  { id: 'transfer', title: 'Transfer Details', schema: transferDetailsSchema },
  { id: 'confirm', title: 'Confirmation', schema: confirmationSchema },
] as const;

// --- Step 3: Multi-step Form Container ---
export function MultiStepTransferForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const methods = useForm<FullFormData>({
    resolver: zodResolver(fullFormSchema),
    mode: 'onBlur',
  });

  // Autosave draft on change
  useEffect(() => {
    const subscription = methods.watch((data) => {
      localStorage.setItem('transfer-draft', JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [methods, methods.watch]);

  // Validate current step before proceeding
  const handleNext = async () => {
    const stepSchema = STEPS[currentStep].schema;
    const fields = Object.keys(stepSchema.shape) as (keyof FullFormData)[];
    const isValid = await methods.trigger(fields);
    if (isValid) setCurrentStep((s) => s + 1);
  };

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await submitTransfer(data);
      localStorage.removeItem('transfer-draft');
    } catch (error: any) {
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          methods.setError(field as keyof FullFormData, {
            type: 'server',
            message: message as string,
          });
        });
      }
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} aria-label="Transfer funds">
        {/* Progress indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step content */}
        {currentStep === 0 && <AccountDetailsStep />}
        {currentStep === 1 && <TransferDetailsStep />}
        {currentStep === 2 && <ConfirmationStep />}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button
              variant="secondary"
              onClick={() => setCurrentStep((s) => s - 1)}
            >
              Back
            </Button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button variant="primary" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              type="submit"
              loading={methods.formState.isSubmitting}
            >
              Submit Transfer
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

// --- Step 4: Dynamic Field Array (Multiple Payees) ---
function TransferDetailsStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FullFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionalPayees',
  });

  return (
    <div>
      <FormField
        label="To Account BSB"
        error={errors.toAccountBSB?.message}
        {...register('toAccountBSB')}
      />
      <FormField
        label="Amount"
        type="number"
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      {/* Dynamic payee rows */}
      <fieldset>
        <legend>Additional Payees</legend>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start">
            <FormField
              label="Name"
              {...register(`additionalPayees.${index}.name`)}
              error={errors.additionalPayees?.[index]?.name?.message}
            />
            <FormField
              label="Amount"
              type="number"
              {...register(`additionalPayees.${index}.amount`, {
                valueAsNumber: true,
              })}
            />
            <Button variant="ghost" onClick={() => remove(index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={() =>
            append({ name: '', bsb: '', accountNumber: '', amount: 0 })
          }
        >
          + Add Payee
        </Button>
      </fieldset>
    </div>
  );
}

// --- Reusable FormField Component ---
interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helpText, required, ...inputProps }, ref) => {
    const id = useId();
    return (
      <div className="form-field">
        <label htmlFor={id}>
          {label} {required && <span aria-hidden="true">*</span>}
        </label>
        <input
          ref={ref}
          id={id}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={
            [helpText ? `${id}-help` : '', error ? `${id}-error` : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...inputProps}
        />
        {helpText && (
          <p id={`${id}-help`} className="text-sm text-secondary">
            {helpText}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
```

---

## UI-10: Theme System & Dark Mode

**Q:** *"How do you implement a theme system with dark mode support?"*

🇻🇳 **Giải thích chi tiết:**
Theme system cần handle nhiều concerns: **CSS Custom Properties** là runtime mechanism cho theme switching — khi toggle theme, chỉ cần thay đổi CSS variables trên root element, tất cả components tự update mà không cần re-render React tree. **System preference detection** dùng `window.matchMedia('(prefers-color-scheme: dark)')` để detect OS-level dark mode setting. **User preference persistence** — save choice vào localStorage, và cần load trước khi React hydrate để tránh flash of incorrect theme (FOIT). Trick quan trọng: inject `<script>` blocking vào `<head>` (trước body) để set `data-theme` attribute TRƯỚC khi browser render — tránh flash hoàn toàn. **React Context** cung cấp `theme`, `setTheme`, `resolvedTheme` (actual theme khi user chọn "system"), và `systemTheme` cho components cần biết. **Three-way toggle**: Light, Dark, System — "System" follow OS preference và auto-switch khi user thay đổi OS setting (dùng matchMedia event listener). Trong Tailwind CSS, config `darkMode: 'class'` hoặc `darkMode: ['class', '[data-theme="dark"]']` để utilities `dark:bg-gray-900` work correctly. Banking apps thường cần thêm **high contrast mode** cho accessibility — đây là theme thứ 4 với tăng contrast ratio lên trên 7:1 cho tất cả text. Ngoài ra, theme system nên support custom themes cho white-label banking platforms.

🇬🇧 **Sample Answer:**
> *"I implement theme systems using CSS Custom Properties as the runtime layer, React Context for state management, and a carefully designed initialization strategy to prevent flash of incorrect theme. The CSS approach works by defining semantic color tokens as custom properties on the root element, then swapping their values based on a data-theme attribute. This means theme switching only changes CSS variable values — no React re-renders needed for the visual update, which is extremely performant. For dark mode specifically, I implement a three-way toggle: Light, Dark, and System. The System option uses matchMedia to detect the OS preference and includes an event listener to react to changes in real-time — so when a user toggles their Mac to dark mode, the app follows instantly. To prevent the dreaded flash of wrong theme on page load, I inject a blocking script in the HTML head — before any CSS or JavaScript loads — that reads localStorage and sets the data-theme attribute synchronously. The React ThemeProvider then hydrates with the correct initial value. User preference is persisted to localStorage with a fallback chain: user explicit choice takes precedence, then system preference, then light as the default. For Tailwind integration, I configure darkMode as class-based with a custom selector matching our data-theme attribute. In banking applications, I also implement a high-contrast mode as an additional theme option, which increases all contrast ratios above 7:1 — exceeding WCAG AAA requirements for users with visual impairments. The theme context exposes theme (the user's choice), resolvedTheme (the actual applied theme), setTheme, and systemTheme, giving components fine-grained access to theme state."*

```tsx
// --- Theme Provider — Full Implementation ---
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system' | 'high-contrast';
type ResolvedTheme = 'light' | 'dark' | 'high-contrast';

interface ThemeContextValue {
  theme: Theme;                   // User's choice (including "system")
  resolvedTheme: ResolvedTheme;   // Actual applied theme
  systemTheme: 'light' | 'dark'; // Current OS preference
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

const STORAGE_KEY = 'anz-theme-preference';

// Detect system preference
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// Resolve "system" to actual theme
function resolveTheme(
  theme: Theme,
  systemTheme: 'light' | 'dark'
): ResolvedTheme {
  if (theme === 'system') return systemTheme;
  return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
  });

  const [systemTheme, setSystemTheme] =
    useState<'light' | 'dark'>(getSystemTheme);
  const resolvedTheme = resolveTheme(theme, systemTheme);

  // Apply theme to DOM
  const applyTheme = useCallback((resolved: ResolvedTheme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme =
      resolved === 'high-contrast' ? 'light' : resolved;
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  // Set theme and persist
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  // Quick toggle: light -> dark -> system
  const toggleTheme = useCallback(() => {
    setTheme(
      theme === 'light'
        ? 'dark'
        : theme === 'dark'
          ? 'system'
          : 'light'
    );
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, systemTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, systemTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
```

```html
<!-- Blocking Script (prevents FOIT) -->
<!-- Place this in <head> BEFORE any CSS or JS -->
<script>
  (function () {
    var STORAGE_KEY = 'anz-theme-preference';
    var stored = localStorage.getItem(STORAGE_KEY);
    var theme;

    if (
      stored === 'dark' ||
      stored === 'light' ||
      stored === 'high-contrast'
    ) {
      theme = stored;
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme =
      theme === 'high-contrast' ? 'light' : theme;
  })();
</script>
```

```css
/* Theme Tokens via CSS Custom Properties */
:root,
[data-theme='light'] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
  --color-border: #e2e8f0;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-danger: #dc2626;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
}

[data-theme='dark'] {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-text-muted: #64748b;
  --color-border: #334155;
  --color-primary: #3b82f6;
  --color-primary-hover: #60a5fa;
  --color-danger: #f87171;
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
}

[data-theme='high-contrast'] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f0f0f0;
  --color-bg-tertiary: #e0e0e0;
  --color-text-primary: #000000;
  --color-text-secondary: #1a1a1a;
  --color-text-muted: #333333;
  --color-border: #000000;
  --color-primary: #0000cc;
  --color-primary-hover: #000099;
  --color-danger: #cc0000;
  --color-success: #006600;
  --color-warning: #cc6600;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
}
```

```tsx
// --- Theme Toggle Component ---
import { useTheme } from './ThemeProvider';
import { clsx } from 'clsx';

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'System' },
  { value: 'high-contrast' as const, label: 'High Contrast' },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div role="radiogroup" aria-label="Theme preference">
      {THEME_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={`${label} theme${
            value === 'system' ? ` (currently ${resolvedTheme})` : ''
          }`}
          onClick={() => setTheme(value)}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            theme === value
              ? 'bg-primary text-white'
              : 'hover:bg-bg-tertiary'
          )}
        >
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
```

```typescript
// tailwind.config.ts — Dark mode integration
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        primary: 'var(--color-primary)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
    },
  },
};

export default config;

// Usage in app layout:
// <ThemeProvider>
//   <header>
//     <ThemeToggle />
//   </header>
//   <main>{children}</main>
// </ThemeProvider>
```

---
