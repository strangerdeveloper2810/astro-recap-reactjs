# MICRO FRONTEND ARCHITECTURE (6-8 câu)

> **Senior Frontend Engineer Interview - ANZ Bank**
> Kiến trúc Micro Frontend cho ứng dụng Banking quy mô lớn

---

## MF-01: What is Micro Frontend?

🇻🇳 Micro Frontend là kiến trúc chia nhỏ ứng dụng frontend monolith thành các ứng dụng con độc lập, mỗi app do một team sở hữu và deploy riêng. Phù hợp khi có nhiều team cùng làm việc trên một sản phẩm lớn (như internet banking), nhưng **KHÔNG nên dùng** khi team nhỏ (<3 teams), app đơn giản, hoặc khi overhead về tooling và coordination vượt quá lợi ích.

🇬🇧 *"Micro Frontend is an architectural pattern where a large frontend application is decomposed into smaller, independently deliverable apps — each owned by a separate team. At ANZ, imagine the internet banking platform: one team owns the accounts dashboard, another owns payments, another owns lending. Each can develop, test, and deploy independently. However, I would NOT recommend it for small teams or simple apps — the coordination overhead, shared dependency management, and debugging complexity simply aren't worth it unless you have at least 3-4 autonomous teams working on distinct business domains."*

```
┌──────────────────────────────────────────────────┐
│                   App Shell (Host)                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │  Accounts  │ │  Payments  │ │  Lending   │   │
│  │  (Team A)  │ │  (Team B)  │ │  (Team C)  │   │
│  │  React 18  │ │  React 18  │ │   Vue 3    │   │
│  └────────────┘ └────────────┘ └────────────┘   │
│                  Shared Design System             │
└──────────────────────────────────────────────────┘
```

**When to use:**
- 3+ teams working on the same product
- Different release cadences per domain
- Teams need tech stack autonomy

**When NOT to use:**
- Small team (< 3 teams)
- Simple application with few features
- Tight coupling between modules is unavoidable
- Performance budget is extremely tight (each MFE adds bundle overhead)

---

## MF-02: Micro Frontend Approaches

🇻🇳 Có 4 cách tiếp cận chính: **Module Federation** (Webpack 5/Rspack) cho phép load remote module tại runtime — phổ biến nhất hiện nay; **iframes** đơn giản nhưng hạn chế UX và SEO; **Web Components** dùng Shadow DOM tạo encapsulation tốt nhưng hệ sinh thái hạn chế; **Build-time integration** (npm packages) đơn giản nhất nhưng mất khả năng deploy độc lập. Tại ANZ với banking app, Module Federation là lựa chọn tối ưu nhất.

🇬🇧 *"There are four main approaches. Module Federation with Webpack 5 or Rspack is the most popular — it allows runtime loading of remote modules with shared dependency deduplication, which is perfect for large banking apps. iframes provide the strongest isolation but have poor UX with no shared routing or resizing. Web Components give good encapsulation via Shadow DOM but the ecosystem is limited. Build-time integration through npm packages is simplest but you lose independent deployability since every change requires rebuilding the host. For a banking platform like ANZ's, I'd choose Module Federation because it balances isolation, performance, and independent deployment."*

| Approach | Independent Deploy | Isolation | Performance | Complexity |
|---|---|---|---|---|
| Module Federation | Yes (runtime) | Medium | Good (shared deps) | Medium |
| iframes | Yes | Strong | Poor (duplicate deps) | Low |
| Web Components | Yes | Strong (Shadow DOM) | Medium | Medium |
| Build-time (npm) | No (rebuild needed) | Weak | Best | Low |

---

## MF-03: Module Federation Deep Dive

🇻🇳 Module Federation hoạt động bằng cách để mỗi app expose các module thông qua `remoteEntry.js`. Host app khai báo remotes và load chúng tại runtime. Shared dependencies (React, React DOM) được cấu hình với `singleton: true` để đảm bảo chỉ có một instance — tránh lỗi hooks. Version mismatch được xử lý qua `requiredVersion` và `strictVersion`.

🇬🇧 *"Module Federation works by having each micro frontend expose specific modules through a manifest file called remoteEntry.js. The host application declares which remotes it needs and loads them at runtime via async script loading. The key configuration is shared dependencies — for React, you must set singleton to true because multiple React instances break hooks. I always configure requiredVersion to match the semver range across all apps, and use eager loading for the shell's React to avoid initialization race conditions. In practice at scale, we version the remoteEntry with content hashes and use a service discovery mechanism so the host always knows which version to load."*

```javascript
// Host App - webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        // Runtime remote - URL can be dynamic
        accounts: 'accounts@https://accounts.anz.com/remoteEntry.js',
        payments: 'payments@https://payments.anz.com/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,        // Only ONE React instance
          requiredVersion: '^18.2.0',
          eager: true,            // Load immediately in shell
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
          eager: true,
        },
        '@anz/design-system': {
          singleton: true,
          requiredVersion: '^2.0.0',
        },
      },
    }),
  ],
};
```

```javascript
// Remote App (Accounts) - webpack.config.js
new ModuleFederationPlugin({
  name: 'accounts',
  filename: 'remoteEntry.js',
  exposes: {
    './AccountsDashboard': './src/AccountsDashboard',
    './AccountDetails': './src/AccountDetails',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
  },
});
```

```tsx
// Host App - Lazy load remote component
const AccountsDashboard = React.lazy(
  () => import('accounts/AccountsDashboard')
);

function App() {
  return (
    <React.Suspense fallback={<LoadingSkeleton />}>
      <ErrorBoundary fallback={<FallbackUI />}>
        <AccountsDashboard customerId={customerId} />
      </ErrorBoundary>
    </React.Suspense>
  );
}
```

---

## MF-04: State Sharing Between Micro Frontends

🇻🇳 Micro frontends nên giao tiếp qua **loose coupling**: Custom Events cho fire-and-forget messages, URL/query params cho shared navigation state, và shared state library (như Zustand external store) cho dữ liệu session dùng chung (auth token, user info). Tuyệt đối tránh shared global Redux store vì nó tạo tight coupling giữa các teams.

🇬🇧 *"The golden rule is: micro frontends should be as decoupled as possible. I use three patterns depending on the use case. For fire-and-forget communication like 'payment completed', Custom Events on the window are perfect — simple, framework-agnostic, and easy to debug. For navigation state like selected account ID, I put it in the URL so any MFE can read it and deep-linking works naturally. For session-level data like auth tokens or user profile, I use a lightweight shared store — something like a Zustand store exposed from the shell, or even a simple pub-sub. The anti-pattern is sharing a global Redux store between MFEs — that creates tight coupling and defeats the purpose of independent deployability."*

```typescript
// Pattern 1: Custom Events (fire-and-forget)
// Payments MFE dispatches
window.dispatchEvent(new CustomEvent('anz:payment-completed', {
  detail: { transactionId: 'TXN-123', amount: 500, status: 'success' }
}));

// Accounts MFE listens
useEffect(() => {
  const handler = (e: CustomEvent) => {
    console.log('Payment completed:', e.detail);
    refetchBalance(); // Refresh account balance
  };
  window.addEventListener('anz:payment-completed', handler);
  return () => window.removeEventListener('anz:payment-completed', handler);
}, []);
```

```typescript
// Pattern 2: URL State (shared navigation)
// Any MFE can read from URL
const params = new URLSearchParams(window.location.search);
const accountId = params.get('accountId'); // ?accountId=ACC-456
```

```typescript
// Pattern 3: Shared Auth Store (exposed from Shell)
// shell/src/stores/authStore.ts
import { createStore } from 'zustand/vanilla';

export const authStore = createStore((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

// Expose via Module Federation
// shell exposes: './authStore': './src/stores/authStore'

// Remote MFE consumes:
import { authStore } from 'shell/authStore';
const { user, token } = authStore.getState();
authStore.subscribe((state) => {
  // React to auth changes
});
```

```
┌──────────────────────────────────────────────────┐
│              Communication Patterns               │
├──────────────┬───────────────┬───────────────────┤
│ Custom Events│  URL State    │  Shared Store     │
│              │               │                   │
│ - Loose      │ - Bookmarkable│ - Auth/Session    │
│ - Fire&Forget│ - Deep-linking│ - User profile    │
│ - Any→Any    │ - Any MFE     │ - Shell→Remotes   │
│              │   can read    │                   │
│ "payment     │ "?accountId=  │ "authStore from   │
│  completed"  │   ACC-456"   │  shell/authStore" │
└──────────────┴───────────────┴───────────────────┘
```

---

## MF-05: Routing in Micro Frontends

🇻🇳 Shell app sở hữu top-level routes và delegate cho từng MFE theo prefix (`/accounts/*`, `/payments/*`). Mỗi MFE quản lý nested routes bên trong domain của mình. Quan trọng: dùng `basename` hoặc `MemoryRouter` trong remote app để tránh xung đột với shell router. Shell chỉ biết route prefix, không biết chi tiết route con của MFE.

🇬🇧 *"The shell application owns top-level routing and delegates to each micro frontend based on path prefixes. So /accounts/* goes to the Accounts MFE, /payments/* goes to Payments, and so on. Each MFE manages its own internal nested routes — the shell doesn't know or care about /accounts/savings or /accounts/transaction-history. The critical implementation detail is that remote MFEs should use MemoryRouter or set a basename to avoid conflicting with the shell's BrowserRouter. I also recommend a route registry pattern where each MFE declares its routes, and the shell dynamically stitches them together. This way, adding a new MFE is just adding an entry to the registry."*

```tsx
// Shell App - Route ownership
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Route registry - each MFE declares its prefix
const routeRegistry = [
  { path: '/accounts/*', remote: 'accounts', module: './AccountsApp' },
  { path: '/payments/*', remote: 'payments', module: './PaymentsApp' },
  { path: '/lending/*',  remote: 'lending',  module: './LendingApp' },
];

function ShellApp() {
  return (
    <BrowserRouter>
      <GlobalNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {routeRegistry.map(({ path, remote, module }) => {
          const RemoteApp = React.lazy(() => loadRemote(remote, module));
          return (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<Skeleton />}>
                  <ErrorBoundary>
                    <RemoteApp />
                  </ErrorBoundary>
                </Suspense>
              }
            />
          );
        })}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

```tsx
// Accounts MFE - Internal nested routing
// Uses MemoryRouter to avoid conflicting with shell's BrowserRouter
import { MemoryRouter, Routes, Route } from 'react-router-dom';

export function AccountsApp() {
  // Get current path from shell to sync initial route
  const initialPath = window.location.pathname.replace('/accounts', '') || '/';

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<AccountsList />} />
        <Route path="/savings" element={<SavingsAccount />} />
        <Route path="/:id" element={<AccountDetails />} />
        <Route path="/:id/transactions" element={<TransactionHistory />} />
      </Routes>
    </MemoryRouter>
  );
}
```

---

## MF-06: Styling Isolation

🇻🇳 CSS isolation là thách thức lớn nhất khi nhiều MFE cùng render trên một trang. Các giải pháp: **CSS Modules** (scoped class names tự động), **Tailwind prefix** (`accounts-` prefix riêng cho mỗi MFE), **Shadow DOM** (isolation mạnh nhất nhưng khó theme), hoặc **naming convention** (BEM + namespace). Tại ANZ, CSS Modules kết hợp shared design system tokens là thực tế nhất.

🇬🇧 *"CSS isolation is one of the biggest challenges because all MFEs render in the same document. I've used several strategies. CSS Modules are my go-to — they generate unique class names at build time, so there's zero risk of collision. For Tailwind, you can configure a prefix per MFE like 'acc-' for accounts or 'pay-' for payments, preventing utility class conflicts. Shadow DOM gives the strongest isolation but makes shared theming very difficult because styles don't cross the shadow boundary. In a banking context at ANZ, I'd use CSS Modules combined with a shared design system that exposes CSS custom properties for theming — each MFE imports the tokens but scopes its own component styles."*

```javascript
// Tailwind prefix per MFE - accounts/tailwind.config.js
module.exports = {
  prefix: 'acc-',  // All classes: acc-flex, acc-text-lg, etc.
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Use shared CSS custom properties for consistency
        'brand-primary': 'var(--anz-primary)',
        'brand-secondary': 'var(--anz-secondary)',
      },
    },
  },
};
```

```tsx
// CSS Modules - zero collision risk
// AccountCard.module.css
// .card { background: white; border-radius: 8px; }
// .balance { font-size: 24px; font-weight: bold; }

// Compiled: .AccountCard_card__x7f2k { ... }

import styles from './AccountCard.module.css';

function AccountCard({ account }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.balance}>${account.balance}</h3>
    </div>
  );
}
```

```css
/* Shared Design Tokens - exposed by Shell */
/* shell/src/styles/tokens.css */
:root {
  --anz-primary: #004165;
  --anz-secondary: #007DBA;
  --anz-success: #00854A;
  --anz-error: #C4262E;
  --anz-spacing-sm: 8px;
  --anz-spacing-md: 16px;
  --anz-spacing-lg: 24px;
  --anz-radius: 8px;
  --anz-font-family: 'ANZ Sans', sans-serif;
}

/* Each MFE consumes tokens but scopes its own styles */
```

---

## MF-07: Deployment Strategy

🇻🇳 Mỗi MFE có pipeline CI/CD riêng, deploy lên CDN độc lập (S3 + CloudFront). Shell app reference remote entry URLs — khi MFE deploy version mới, chỉ cần update `remoteEntry.js`. Rollback bằng cách trỏ lại URL version cũ hoặc dùng feature flags. Quan trọng: phải có contract testing giữa shell và remotes để đảm bảo compatibility.

🇬🇧 *"Each micro frontend has its own CI/CD pipeline and deploys to its own CDN origin — typically S3 plus CloudFront at ANZ. The shell references remoteEntry.js URLs which are content-hashed, so when the Payments team deploys a new version, only their remoteEntry changes. Rollback is straightforward — you either revert the CDN deployment or, better yet, use a service discovery endpoint that maps MFE names to URLs, and just update that mapping. I always implement contract testing between shell and remotes using something like Pact — this catches breaking changes before they reach production. Version pinning and canary deployments give you additional safety nets for gradual rollouts."*

```yaml
# accounts-mfe/.github/workflows/deploy.yml
name: Deploy Accounts MFE
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install & Build
        run: |
          npm ci
          npm run build
          # Output: dist/remoteEntry.js, dist/assets/*

      - name: Run Contract Tests
        run: npm run test:contract  # Pact tests against shell

      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://anz-mfe-accounts/${{ github.sha }}/
          # Content-hash based versioning

      - name: Update Service Discovery
        run: |
          curl -X PUT https://mfe-registry.anz.internal/accounts \
            -d '{"url": "https://cdn.anz.com/accounts/${{ github.sha }}/remoteEntry.js"}'

      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --paths "/accounts/*"
```

```typescript
// Service Discovery - Dynamic remote URLs
// shell/src/mfeRegistry.ts
interface MFEConfig {
  name: string;
  url: string;
  version: string;
  enabled: boolean;  // Feature flag
}

async function loadMFERegistry(): Promise<MFEConfig[]> {
  const response = await fetch('https://mfe-registry.anz.internal/config');
  return response.json();
  // Returns:
  // [
  //   { name: "accounts", url: "https://cdn.anz.com/accounts/abc123/remoteEntry.js", version: "2.1.0", enabled: true },
  //   { name: "payments", url: "https://cdn.anz.com/payments/def456/remoteEntry.js", version: "1.8.0", enabled: true },
  //   { name: "lending",  url: "https://cdn.anz.com/lending/ghi789/remoteEntry.js",  version: "3.0.0", enabled: false },
  // ]
}

// Rollback = update registry to point to previous version URL
// Canary = enable for percentage of users via feature flag
```

```
┌─────────────────────────────────────────────────────┐
│              Independent Deployment Flow              │
│                                                       │
│  Team A (Accounts)     Team B (Payments)              │
│  ┌──────────────┐     ┌──────────────┐               │
│  │ git push     │     │ git push     │               │
│  │   ↓          │     │   ↓          │               │
│  │ CI/CD        │     │ CI/CD        │               │
│  │   ↓          │     │   ↓          │               │
│  │ Build + Test │     │ Build + Test │               │
│  │   ↓          │     │   ↓          │               │
│  │ S3/CDN       │     │ S3/CDN       │               │
│  │   ↓          │     │   ↓          │               │
│  │ Registry ────│─────│──Registry    │               │
│  └──────────────┘     └──────────────┘               │
│                    ↓                                  │
│         Shell reads registry                          │
│         Loads latest remoteEntry.js                   │
│         Users get new version                         │
└─────────────────────────────────────────────────────┘
```

---

## MF-08: Trade-offs & Challenges

🇻🇳 Micro Frontend mang lại team autonomy và independent deployment, nhưng phải đánh đổi: tăng complexity (tooling, debugging, contract testing), performance overhead (multiple bundles, duplicate code nếu shared deps không tối ưu), developer experience phức tạp hơn (local dev cần chạy nhiều app), và khó đảm bảo UX consistency giữa các team. Quyết định dùng MFE phải dựa trên **organizational scaling needs**, không phải technical trends.

🇬🇧 *"This is the most important question because micro frontends are not a silver bullet. The benefits are clear: team autonomy, independent deployments, and technology flexibility. But the trade-offs are significant. First, complexity increases dramatically — you need contract testing, a service discovery mechanism, shared dependency management, and sophisticated CI/CD. Second, there's a real performance cost — even with Module Federation's shared dependencies, there's additional network overhead loading remoteEntry files and potential duplicate code. Third, developer experience suffers because running the full system locally requires orchestrating multiple apps. Fourth, UX consistency is hard to maintain when different teams make different design decisions. My rule of thumb: adopt micro frontends when organizational scaling pain exceeds the technical complexity cost — typically when you have 4+ teams and monolith deploys are bottlenecking delivery."*

```
┌─────────────────────────────────────────────────────────────┐
│                    DECISION FRAMEWORK                        │
├──────────────────────────────┬───────────────────────────────┤
│          BENEFITS            │          COSTS                │
├──────────────────────────────┼───────────────────────────────┤
│ ✅ Independent deployments   │ ❌ Increased complexity       │
│ ✅ Team autonomy             │ ❌ Performance overhead        │
│ ✅ Isolated failures         │ ❌ Harder debugging           │
│ ✅ Tech stack flexibility    │ ❌ Duplicate dependencies     │
│ ✅ Parallel development      │ ❌ Complex local dev setup    │
│ ✅ Smaller, focused codebases│ ❌ UX consistency challenges  │
│ ✅ Independent scaling       │ ❌ Contract testing required  │
│                              │ ❌ Shared state complexity    │
└──────────────────────────────┴───────────────────────────────┘

When to adopt:
  ✅ 4+ teams on same product
  ✅ Monolith deploys bottleneck delivery (>1 week cycle)
  ✅ Teams need different tech stacks or release cadences
  ✅ Clear domain boundaries exist

When to AVOID:
  ❌ Small team (< 3 teams)
  ❌ Early-stage product (still exploring)
  ❌ Tightly coupled features
  ❌ "Because Netflix does it"
```

```typescript
// Performance mitigation strategies
// 1. Shared dependencies reduce duplicate code
shared: {
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },
  // Share large libs to avoid duplicating
  'date-fns': { singleton: true },
  'lodash-es': { singleton: true },
}

// 2. Preload critical MFEs
<link rel="preload" href="https://cdn.anz.com/accounts/remoteEntry.js" as="script" />

// 3. Use import() with retry logic for resilience
async function loadRemoteWithRetry(remote, module, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await loadRemote(remote, module);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// 4. Error boundaries prevent cascade failures
<ErrorBoundary fallback={<FallbackAccountsUI />}>
  <AccountsMFE />
</ErrorBoundary>
```
