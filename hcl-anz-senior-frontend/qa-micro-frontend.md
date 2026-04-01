# 🧩 Micro Frontend — Bilingual Interview Q&A

> **Dành cho:** Senior Frontend Engineer Interview (ANZ Bank)
> **Format:** Bilingual Vietnamese 🇻🇳 + English 🇬🇧
> **Số câu hỏi:** 10 câu

---

## MFE-01: Micro Frontend Architecture

**Q:** *"What is Micro Frontend architecture? When should we use it and what are the key trade-offs?"*

🇻🇳 **Giải thích chi tiết:**
Micro Frontend là một kiến trúc chia nhỏ ứng dụng frontend thành các phần độc lập, mỗi phần được phát triển, test và deploy riêng biệt bởi các team khác nhau. Kiến trúc này lấy cảm hứng từ microservices ở backend, áp dụng nguyên tắc "vertical slice" cho frontend. Nên sử dụng khi ứng dụng quá lớn và phức tạp với nhiều team (từ 3-4 teams trở lên) cùng làm việc, hoặc khi cần technology diversity giữa các domain. Ưu điểm chính là team autonomy - mỗi team có thể release độc lập mà không ảnh hưởng team khác, giảm coupling và tăng tốc độ phát triển đáng kể. Tuy nhiên cũng có nhược điểm như tăng complexity trong việc quản lý shared dependencies, UX consistency khó đảm bảo hơn, và bundle size có thể lớn hơn nếu không optimize shared libraries đúng cách. Với ngân hàng như ANZ, micro frontend rất phù hợp vì có nhiều domain riêng biệt (accounts, payments, loans, cards) và nhiều team chuyên biệt cho từng business area.

🇬🇧 **Sample Answer:**
> *"Micro Frontend is an architectural approach that extends microservices principles to the frontend layer. Instead of building one monolithic frontend application, we decompose it into smaller, independently deployable units that can be developed by different teams. Each micro frontend owns a specific business domain or feature set end-to-end, from UI components to API integration. We should consider using it when our application grows large enough that a single team cannot efficiently manage it, typically when we have 3-4 or more teams working on the same product. The key benefits include team autonomy where teams can choose their own tech stack, deploy independently, and iterate faster without blocking each other. However, the trade-offs are significant: increased infrastructure complexity for build and deployment pipelines, potential performance overhead from loading multiple bundles, challenges in maintaining consistent user experience across MFEs, and complexity in managing shared dependencies like React. At a bank like ANZ, this architecture fits well because different domains like accounts, payments, loans, and investments can be developed by specialized teams while still providing a unified customer experience through a shell application that orchestrates everything."*

```typescript
// High-Level Micro Frontend Architecture Diagram
/*
┌─────────────────────────────────────────────────────────────────────┐
│                        Shell Application (Host)                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Global Navigation │ Auth Context │ Event Bus │ Design Tokens   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Accounts   │  │   Payments   │  │    Loans     │  │  Cards   │ │
│  │   MFE        │  │   MFE        │  │    MFE       │  │   MFE    │ │
│  │  (React 18)  │  │  (React 18)  │  │   (Vue 3)    │  │ (React)  │ │
│  │  Team Alpha  │  │  Team Beta   │  │  Team Gamma  │  │ Team Delta│
│  │  own CI/CD   │  │  own CI/CD   │  │  own CI/CD   │  │ own CI/CD│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │     Shared: Design System (npm) │ CSS Custom Properties         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

When to USE Micro Frontend:          When NOT to use:
 + 3-4+ teams on same product         - Small team (< 3 teams)
 + Different release cadences          - Simple app, few features
 + Teams need tech autonomy            - Tight coupling between modules
 + Clear domain boundaries             - Early-stage product (exploring)
 + Monolith deploys are bottleneck     - "Because Netflix does it"
*/
```

---

## MFE-02: Module Federation (Webpack 5)

**Q:** *"How does Module Federation work in Webpack 5? Explain the host/remote concept and runtime loading mechanism."*

🇻🇳 **Giải thích chi tiết:**
Module Federation là một feature trong Webpack 5 cho phép chia sẻ code giữa các ứng dụng JavaScript tại runtime, không cần build-time bundling. Có hai khái niệm chính: Host (ứng dụng chính load các remote modules) và Remote (ứng dụng expose modules cho host sử dụng). Khi build, mỗi remote app tạo ra file remoteEntry.js chứa manifest về tất cả exposed modules và cách load chúng - file này KHÔNG chứa code thực sự mà chỉ chứa references và loading logic. Khi user truy cập, host sẽ dynamically fetch remoteEntry.js của các MFE, sau đó load các chunks cần thiết on-demand. Điểm mạnh là version negotiation tự động - nếu host và remote đều cần React, Webpack sẽ quyết định dùng version nào phù hợp dựa trên shared config với semver ranges. Cơ chế này cho phép deploy MFE độc lập hoàn toàn - chỉ cần update remoteEntry.js trên CDN mà không cần rebuild host application.

🇬🇧 **Sample Answer:**
> *"Module Federation is a Webpack 5 feature that enables JavaScript applications to share code at runtime rather than build time, which is revolutionary for micro frontend architectures. The architecture involves two key concepts: the Host application that consumes remote modules, and Remote applications that expose their modules for others to use. At build time, each remote generates a manifest file called remoteEntry.js that describes all exposed modules and their chunk dependencies - importantly, this file doesn't contain actual module code, just references and async loading logic. At runtime, when the host needs a component from a remote, it first fetches the remoteEntry.js which registers the remote container in the global scope. The host then calls container.get('./ModuleName') which triggers async loading of the actual chunk files containing the component code. Version negotiation is handled automatically through the shared configuration - if both host and remote require React, Module Federation uses semver ranges to determine compatibility and ensures only one instance loads. This enables truly independent deployments because updating a remote only requires deploying new JavaScript files to CDN; the host automatically gets the latest version on next page load without any rebuild required."*

```javascript
// ============================================
// HOST APP (Shell) - webpack.config.js
// ============================================
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',

      // Remotes that this host will consume
      remotes: {
        // Format: 'internalName': 'remoteName@remoteEntryUrl'
        accountsMFE: 'accounts@https://accounts.anz.com/remoteEntry.js',
        paymentsMFE: 'payments@https://payments.anz.com/remoteEntry.js',
        loansMFE: 'loans@https://loans.anz.com/remoteEntry.js',
      },

      // Shared dependencies - CRITICAL for correctness
      shared: {
        react: {
          singleton: true,          // Only ONE React instance
          requiredVersion: '^18.2.0',
          eager: true,              // Load immediately in shell
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
          eager: true,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.0.0',
        },
        '@anz/design-system': {
          singleton: true,
          requiredVersion: '^2.0.0',
        },
      },
    }),
  ],
};

// ============================================
// REMOTE APP (Accounts MFE) - webpack.config.js
// ============================================
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'accounts',
      filename: 'remoteEntry.js',  // Manifest file for host

      // Modules this remote exposes
      exposes: {
        './AccountsDashboard': './src/components/AccountsDashboard',
        './TransactionHistory': './src/components/TransactionHistory',
        './AccountsApp': './src/AccountsApp',
      },

      // Shared deps - will use host's version if compatible
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
          eager: false,  // Let host provide React
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.0.0',
        },
      },
    }),
  ],
};

// ============================================
// HOST: Consuming Remote Module
// ============================================
import React, { Suspense, lazy } from 'react';

// Dynamic import of federated module
const AccountsDashboard = lazy(() => import('accountsMFE/AccountsDashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AccountsDashboard customerId="123" />
    </Suspense>
  );
}
```

---

## MFE-03: Shared Dependencies Strategy

**Q:** *"How do you manage shared dependencies in a Micro Frontend architecture? What strategies handle version mismatches?"*

🇻🇳 **Giải thích chi tiết:**
Quản lý shared dependencies là một trong những thách thức lớn nhất của Micro Frontend, đặc biệt với các thư viện "singleton-sensitive" như React - nơi mà việc có 2 instances đồng thời sẽ gây lỗi hooks nghiêm trọng. Chiến lược chính là sử dụng singleton sharing cho các thư viện không thể có nhiều instance, cấu hình qua Module Federation với `singleton: true`. Version mismatch được xử lý bằng cách định nghĩa version ranges phù hợp với semver - ví dụ `^18.0.0` cho phép 18.0.0 đến 18.x.x. Có 2 loading strategy: eager loading (load ngay khi app start, phù hợp cho critical deps trong shell) và lazy loading (load khi cần, giảm initial bundle). Khi version không compatible nghiêm trọng, có thể dùng `strictVersion: true` để fail fast với error rõ ràng, hoặc cho phép load riêng version (nhưng mất singleton). Best practice là có một shared dependencies manifest và governance process chung cho toàn organization để đảm bảo version alignment.

🇬🇧 **Sample Answer:**
> *"Managing shared dependencies in Micro Frontend architecture requires careful consideration of version compatibility, loading strategies, and fallback mechanisms. The primary strategy is singleton sharing for libraries that cannot have multiple instances - React is the classic example because having two React instances breaks hooks with cryptic 'Invalid hook call' errors. We configure this through Module Federation's shared config with singleton: true. Version negotiation uses semver ranges - specifying requiredVersion as '^18.0.0' means any version from 18.0.0 to less than 19.0.0 is acceptable, providing flexibility while maintaining compatibility. There are two loading strategies: eager loading which loads dependencies immediately when the shell starts, suitable for critical dependencies like React that remotes need immediately, and lazy loading which defers loading until needed, reducing initial bundle size. When versions are seriously incompatible, we have two options: setting strictVersion: true makes Module Federation throw a clear error at runtime forcing teams to resolve the conflict, or allowing it to load separate versions which works for some libraries but breaks singleton requirements. Best practice includes establishing a shared dependencies manifest at the organization level - a governance document that all teams agree to, specifying exact version ranges for critical libraries, enforced through CI pipeline checks before deployment."*

```javascript
// ============================================
// Shared Dependencies Configuration
// ============================================

const sharedDependencies = {
  // SINGLETON DEPENDENCIES - Only one instance allowed
  react: {
    singleton: true,           // MUST be single instance
    strictVersion: true,       // Fail if incompatible
    requiredVersion: '^18.2.0',
    eager: true,               // Load in shell's initial bundle
  },
  'react-dom': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^18.2.0',
    eager: true,
  },

  // ROUTING - Must be singleton for shared context
  'react-router-dom': {
    singleton: true,
    requiredVersion: '^6.20.0',
    eager: false,
  },

  // STATE MANAGEMENT - Singleton for shared state
  '@reduxjs/toolkit': {
    singleton: true,
    requiredVersion: '^2.0.0',
  },

  // DESIGN SYSTEM - Singleton for UI consistency
  '@anz/design-system': {
    singleton: true,
    strictVersion: true,       // Strict for visual consistency
    requiredVersion: '2.5.0',  // Exact version
  },

  // UTILITY LIBRARIES - Can have multiple versions
  lodash: {
    singleton: false,          // Multiple versions OK
    requiredVersion: '^4.17.0',
  },

  // DATE LIBRARY - Singleton to avoid timezone issues
  'date-fns': {
    singleton: true,
    requiredVersion: '^3.0.0',
  },
};

// ============================================
// Version Mismatch Scenarios
// ============================================

/*
Scenario A: Minor version difference (18.2 vs 18.3)
  → singleton: true + requiredVersion: "^18.2.0"
  → MF loads 18.3 (satisfies ^18.2.0), shares single instance
  → WORKS FINE

Scenario B: Major version difference (18 vs 17)
  → singleton: true + strictVersion: true
  → MF detects 17 doesn't satisfy ^18.2.0
  → THROWS ERROR at runtime — forces team to upgrade

Scenario C: No singleton (DANGEROUS for React)
  → singleton: false
  → Both React 17 and 18 load in same page
  → HOOKS BREAK — "Invalid hook call" error
  → NEVER do this for React!
*/

// ============================================
// Shared Dependencies Manifest (Governance)
// ============================================
// shared-deps-manifest.json - checked into mono-repo root
{
  "governance": {
    "lastReviewed": "2025-01-15",
    "approvedBy": "Platform Team"
  },
  "required": {
    "react": { "version": "^18.2.0", "singleton": true },
    "react-dom": { "version": "^18.2.0", "singleton": true },
    "react-router-dom": { "version": "^6.20.0", "singleton": true },
    "@anz/design-system": { "version": "^2.5.0", "singleton": true }
  },
  "recommended": {
    "date-fns": "^3.0.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

---

## MFE-04: Communication Between Micro Frontends

**Q:** *"What patterns do you use for communication between Micro Frontends? How do you maintain loose coupling?"*

🇻🇳 **Giải thích chi tiết:**
Communication giữa các MFEs cần được thiết kế cẩn thận để giữ loose coupling - các MFE không nên biết implementation details của nhau. Pattern phổ biến nhất là Custom Events sử dụng browser's native API với window.dispatchEvent và CustomEvent - đây là fire-and-forget pattern phù hợp cho one-way notifications như "payment completed" hoặc "user logged out". Event Bus là pub/sub middleware tập trung cho phép subscribe/publish theo topic, phù hợp khi nhiều MFE cần lắng nghe cùng một sự kiện với proper subscription lifecycle management. URL/Query Params đặt shared state vào URL (ví dụ ?accountId=ACC-456) để bất kỳ MFE nào cũng đọc được, hỗ trợ deep-linking và bookmarking tự nhiên. Shared State Store qua Zustand hoặc custom pub-sub được expose từ shell qua Module Federation, dùng cho session-level data như auth token và user profile. Anti-pattern cần tránh tuyệt đối là share global Redux store giữa các MFE vì nó tạo tight coupling nghiêm trọng.

🇬🇧 **Sample Answer:**
> *"Communication between Micro Frontends requires careful design to maintain loose coupling - MFEs should not know about each other's internal implementation details. I use different patterns depending on the communication need. Custom Events using the browser's native CustomEvent API are perfect for one-way, fire-and-forget notifications like 'payment completed' or 'user logged out' - they're framework-agnostic, easy to debug in DevTools, and require no shared infrastructure. For scenarios where multiple MFEs need to react to the same event with proper subscription lifecycle management, I implement a centralized Event Bus - a lightweight pub-sub middleware that the shell provides and all MFEs can import. For shared navigation context like a selected account ID or transaction filter, I put it in the URL as query parameters so any MFE can read it and deep-linking works naturally without coupling. For session-level data like authentication tokens and user profile, I use a shared state store - typically a Zustand vanilla store exposed from the shell via Module Federation, allowing any remote to subscribe to auth changes reactively. The critical anti-pattern to avoid is sharing a global Redux store across MFEs - this creates tight coupling because any change to state shape requires coordinating across all teams simultaneously, defeating the purpose of independent deployability."*

```typescript
// ============================================
// PATTERN 1: Custom Events (Fire-and-Forget)
// ============================================

// Type-safe event definitions (shared contract)
interface MFEEvents {
  'anz:payment:completed': { transactionId: string; amount: number };
  'anz:auth:logout': { reason: string };
  'anz:account:selected': { accountId: string; accountType: string };
  'anz:notification:show': { message: string; type: 'success' | 'error' };
}

// Type-safe event dispatcher
function emitMFEEvent<K extends keyof MFEEvents>(
  eventName: K,
  detail: MFEEvents[K]
): void {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

// Type-safe event listener hook
function useMFEEvent<K extends keyof MFEEvents>(
  eventName: K,
  handler: (detail: MFEEvents[K]) => void
): void {
  useEffect(() => {
    const listener = (e: CustomEvent<MFEEvents[K]>) => handler(e.detail);
    window.addEventListener(eventName, listener as EventListener);
    return () => window.removeEventListener(eventName, listener as EventListener);
  }, [eventName, handler]);
}

// Payments MFE: Dispatch event after successful payment
function PaymentConfirmation({ transaction }) {
  useEffect(() => {
    emitMFEEvent('anz:payment:completed', {
      transactionId: transaction.id,
      amount: transaction.amount,
    });
  }, [transaction]);

  return <div>Payment successful!</div>;
}

// Accounts MFE: Listen and react to payment
function AccountBalance() {
  const [balance, setBalance] = useState(null);

  useMFEEvent('anz:payment:completed', (detail) => {
    console.log('Payment completed:', detail);
    refetchBalance(); // Refresh account balance
  });

  return <div>Balance: ${balance}</div>;
}

// ============================================
// PATTERN 2: Event Bus (Centralized Pub-Sub)
// ============================================

type EventHandler<T = any> = (payload: T) => void;

class MFEEventBus {
  private subscribers = new Map<string, Set<EventHandler>>();

  subscribe<T>(topic: string, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(handler);

    // Return unsubscribe function
    return () => this.subscribers.get(topic)?.delete(handler);
  }

  publish<T>(topic: string, payload: T): void {
    this.subscribers.get(topic)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${topic}":`, error);
      }
    });
  }
}

// Shell exposes singleton via Module Federation
export const eventBus = new MFEEventBus();

// ============================================
// PATTERN 3: Shared Auth Store (from Shell)
// ============================================

// shell/src/stores/authStore.ts
import { createStore } from 'zustand/vanilla';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  permissions: string[];
  setAuth: (user: AuthState['user'], token: string, perms: string[]) => void;
  logout: () => void;
}

export const authStore = createStore<AuthState>((set) => ({
  user: null,
  token: null,
  permissions: [],
  setAuth: (user, token, permissions) => set({ user, token, permissions }),
  logout: () => {
    set({ user: null, token: null, permissions: [] });
    window.dispatchEvent(new CustomEvent('anz:auth:logout', {
      detail: { reason: 'user-initiated' }
    }));
  },
}));

// Remote MFE: Consume auth store
import { authStore } from 'shell/authStore';
import { useSyncExternalStore } from 'react';

function useAuth() {
  return useSyncExternalStore(authStore.subscribe, authStore.getState);
}
```

---

## MFE-05: Routing in Micro Frontend

**Q:** *"How do you handle routing in a Micro Frontend architecture? Explain the relationship between shell router and MFE routers."*

🇻🇳 **Giải thích chi tiết:**
Routing trong MFE architecture thường theo mô hình two-level routing: Shell router quản lý top-level routes và quyết định MFE nào sẽ được load, còn MFE router quản lý internal routes bên trong domain của mình. Shell sở hữu URL ownership - nó delegate các route prefix cho từng MFE, ví dụ /accounts/* cho Accounts MFE, /payments/* cho Payments MFE. Điểm quan trọng là chỉ có thể có MỘT BrowserRouter trong toàn bộ application - shell sở hữu nó, còn các MFE phải dùng MemoryRouter hoặc cấu hình basename để tránh conflict với shell's history management. Navigation guards ở shell level kiểm tra authentication trước khi load MFE, còn MFE có thể có guards riêng cho business logic cụ thể. Khi MFE navigate internal routes, cần sync lại browser URL để shell navigation highlight đúng section - giải quyết bằng cách dispatch navigation event hoặc dùng replaceState. Pattern nâng cao là Route Registry - mỗi MFE khai báo routes của mình, shell dynamically stitch chúng lại.

🇬🇧 **Sample Answer:**
> *"Routing in Micro Frontend architecture follows a delegation pattern where the shell application owns top-level route matching and delegates rendering to the appropriate micro frontend based on path prefixes. For example, /accounts/* routes to Accounts MFE, /payments/* routes to Payments, and /loans/* routes to Loans. The shell doesn't know or care about internal routes like /accounts/savings or /accounts/:id/transactions - that's entirely the owning team's responsibility. The critical implementation detail is handling router instances correctly: since there can only be ONE BrowserRouter per page, the shell owns it, and each remote MFE must use either a MemoryRouter or configure a basename prop to avoid conflicting with the shell's history management. I implement a Route Registry pattern where each MFE declares its top-level route prefix and the shell dynamically stitches them together - adding a new MFE requires zero changes to shell code, just a new registry entry. One tricky aspect is coordinating history.pushState - when an MFE navigates internally, the browser URL should update so the shell navigation highlights the correct section. I solve this by having MFEs use replaceState to sync their internal route to the browser URL, or by dispatching navigation events that the shell listens to."*

```tsx
// ============================================
// SHELL APP - Route Ownership & Registry
// ============================================
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Route registry - can be loaded from config server
const routeRegistry = [
  { path: '/accounts/*', remote: 'accounts', module: './AccountsApp' },
  { path: '/payments/*', remote: 'payments', module: './PaymentsApp' },
  { path: '/loans/*', remote: 'loans', module: './LoansApp' },
];

function ShellApp() {
  return (
    <BrowserRouter>
      <GlobalNavigation />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {routeRegistry.map(({ path, remote, module }) => {
            const RemoteApp = lazy(() => loadRemote(remote, module));
            return (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ErrorBoundary fallback={<MFEFallback />}>
                      <RemoteApp />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
            );
          })}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

// ============================================
// REMOTE MFE (Accounts) - Internal Routing
// Uses MemoryRouter to avoid BrowserRouter conflict
// ============================================
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

export function AccountsApp() {
  // Sync initial route from browser URL
  const initialPath = window.location.pathname.replace('/accounts', '') || '/';

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <AccountsLayout>
        <Routes>
          <Route path="/" element={<AccountsList />} />
          <Route path="/savings" element={<SavingsAccount />} />
          <Route path="/term-deposits" element={<TermDeposits />} />
          <Route path="/:id" element={<AccountDetails />} />
          <Route path="/:id/transactions" element={<TransactionHistory />} />
          <Route path="*" element={<AccountsNotFound />} />
        </Routes>
      </AccountsLayout>
      <BrowserURLSync prefix="/accounts" />
    </MemoryRouter>
  );
}

// Sync MemoryRouter changes back to browser URL
function BrowserURLSync({ prefix }: { prefix: string }) {
  const location = useLocation();

  useEffect(() => {
    const newUrl = `${prefix}${location.pathname}${location.search}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [location, prefix]);

  return null;
}

/*
┌─────────────────────────────────────────────────────┐
│              Routing Architecture                    │
│                                                      │
│  Browser URL: /accounts/savings?currency=AUD         │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  Shell (BrowserRouter)                          │ │
│  │  Matches: /accounts/* → load Accounts MFE       │ │
│  │                                                  │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  Accounts MFE (MemoryRouter)              │  │ │
│  │  │  Matches: /savings → <SavingsAccount />   │  │ │
│  │  │                                            │  │ │
│  │  │  Internal routes:                          │  │ │
│  │  │  /            → AccountsList               │  │ │
│  │  │  /savings     → SavingsAccount             │  │ │
│  │  │  /:id         → AccountDetails             │  │ │
│  │  │  /:id/txns    → TransactionHistory         │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
*/
```

---

## MFE-06: Styling Isolation

**Q:** *"How do you achieve CSS isolation in Micro Frontend architecture? What strategies prevent style conflicts?"*

🇻🇳 **Giải thích chi tiết:**
CSS isolation là yếu tố quan trọng trong MFE vì tất cả MFEs đều render trong cùng một document, chia sẻ cùng một global CSS scope - nếu không có isolation strategy, styles từ MFE A có thể vô tình override styles của MFE B. CSS Modules là strategy phổ biến nhất, tự động generate unique class names tại build time (ví dụ .card thành .AccountCard_card__x7f2k), đảm bảo zero collision risk. CSS-in-JS libraries như styled-components hoặc Emotion cũng generate unique class names và scope styles to components tại runtime. Shadow DOM tạo complete isolation bằng cách encapsulate styles trong shadow root - styles hoàn toàn không xuyên qua shadow boundary, nhưng điều này cũng gây khó khăn khi share design tokens. Tailwind CSS với prefix riêng cho mỗi MFE (acc-flex, pay-text-lg) là option tốt để tránh utility class conflict. Shared design tokens qua CSS Custom Properties nên được định nghĩa ở root level trong shell, các MFE consume chúng để đảm bảo visual consistency.

🇬🇧 **Sample Answer:**
> *"CSS isolation in Micro Frontend architecture is crucial because all MFEs render in the same document and share a single global CSS scope. Without proper isolation, one team's .button class can silently break another team's button styling, causing visual bugs that are extremely difficult to debug across application boundaries. CSS Modules are my default recommendation - they generate unique class names at build time like .AccountCard_card__x7f2k, providing zero collision risk with minimal workflow changes and working with any CSS preprocessor. Shadow DOM provides the strongest isolation since styles absolutely cannot leak in or out of the shadow boundary, but this strength is also its weakness - shared theming becomes difficult because the only way to pass styles into a shadow tree is through CSS custom properties. For teams using Tailwind CSS, I configure a unique prefix per MFE - 'acc-' for Accounts, 'pay-' for Payments - which prevents utility class collisions while maintaining Tailwind's developer experience. CSS-in-JS solutions like styled-components auto-generate unique class names at runtime but need namespace configuration for style injection to avoid conflicts. My recommended approach for a banking platform is CSS Modules for component-level styles combined with a shared design system that exposes theming through CSS custom properties - each MFE imports the token values but maintains complete isolation of its own component styles."*

```css
/* ============================================ */
/* STRATEGY 1: CSS Modules (Recommended)        */
/* ============================================ */

/* AccountCard.module.css */
.card {
  background: var(--anz-surface);
  border-radius: var(--anz-radius);
  padding: var(--anz-spacing-md);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.balance {
  font-size: 24px;
  font-weight: bold;
  color: var(--anz-primary);
}

/*
 * After compilation (Webpack CSS Modules):
 * .AccountCard_card__x7f2k { ... }
 * .AccountCard_balance__m3p9j { ... }
 * ZERO collision risk — guaranteed unique
 */
```

```tsx
// Usage in component
import styles from './AccountCard.module.css';

function AccountCard({ account }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.balance}>${account.balance}</h3>
    </div>
  );
}
```

```javascript
/* ============================================ */
/* STRATEGY 2: Tailwind with MFE Prefix         */
/* ============================================ */

// accounts-mfe/tailwind.config.js
module.exports = {
  prefix: 'acc-',  // All classes: acc-flex, acc-text-lg
  corePlugins: {
    preflight: false,  // Don't inject global resets
  },
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--anz-primary)',
        'brand-secondary': 'var(--anz-secondary)',
      },
    },
  },
};

// payments-mfe/tailwind.config.js
module.exports = {
  prefix: 'pay-',  // All classes: pay-flex, pay-text-lg
  // ... same structure, different prefix
};
```

```css
/* ============================================ */
/* SHARED: Design System Tokens (Shell)         */
/* ============================================ */

/* shell/src/styles/design-tokens.css */
:root {
  /* Colors */
  --anz-primary: #004165;
  --anz-secondary: #007DBA;
  --anz-success: #00854A;
  --anz-error: #C4262E;
  --anz-surface: #FFFFFF;
  --anz-background: #F5F5F5;
  --anz-text-primary: #1A1A1A;
  --anz-text-secondary: #6B6B6B;

  /* Spacing */
  --anz-spacing-xs: 4px;
  --anz-spacing-sm: 8px;
  --anz-spacing-md: 16px;
  --anz-spacing-lg: 24px;

  /* Typography */
  --anz-font-family: 'ANZ Sans', -apple-system, sans-serif;

  /* Shape */
  --anz-radius: 8px;
  --anz-radius-lg: 12px;
}

/*
 * Every MFE consumes these tokens but scopes its OWN styles.
 * Changing a token in shell updates ALL MFEs instantly.
 */
```

---

## MFE-07: Deployment Strategies

**Q:** *"How do you design CI/CD pipelines for Micro Frontend architecture? What deployment strategies ensure safe releases?"*

🇻🇳 **Giải thích chi tiết:**
Deployment strategy cho Micro Frontend là yếu tố then chốt quyết định liệu kiến trúc có thực sự mang lại lợi ích independent deployment hay không. Mỗi MFE phải có pipeline CI/CD hoàn toàn riêng biệt - từ source code repository, build process, test suite, đến deployment target trên CDN. Khi MFE build xong, output chính là remoteEntry.js (content-hashed) và các chunk files, được deploy lên CDN path riêng của team. Shell app KHÔNG cần rebuild khi remote deploy version mới - nó reference remoteEntry URLs thông qua service discovery registry. Rollback cực kỳ đơn giản: chỉ cần update registry để trỏ lại URL của version cũ. Để đảm bảo safe releases, implement nhiều lớp bảo vệ: contract testing (Pact) giữa shell và remotes để phát hiện breaking changes, canary deployment (release cho 5% users trước rồi mới tăng lên 100%), feature flags để enable/disable MFE cho specific user segments, và blue-green deployment cho zero-downtime releases.

🇬🇧 **Sample Answer:**
> *"The deployment strategy is what makes or breaks a Micro Frontend architecture - without truly independent deployments, you lose the primary benefit. My approach gives each MFE its own complete CI/CD pipeline with its own repository, build process, test suite, and CDN deployment target. When a team pushes to main, their pipeline runs unit tests, integration tests, and critically, contract tests using Pact against the shell application to verify interface compatibility. The build output - remoteEntry.js and associated chunk files, all content-hashed - deploys to the team's own CDN path. The shell application never needs to rebuild when a remote deploys; instead, it fetches remote URLs from a service discovery registry - a lightweight API that maps MFE names to their current remoteEntry.js URLs. Rollback becomes trivial: update the registry to point to the previous version's URL, which takes effect immediately for new page loads. For safe releases, I implement multiple layers: canary deployments release to 5% of users first while monitoring error rates before gradually increasing to 100%. Feature flags allow enabling or disabling an entire MFE for specific user segments without deployment. Blue-green deployment patterns give zero-downtime releases. CDN caching strategy is also critical: content-hashed chunks get immutable cache headers, while remoteEntry.js uses short TTL or explicit invalidation."*

```yaml
# ============================================
# accounts-mfe/.github/workflows/deploy.yml
# ============================================
name: Deploy Accounts MFE

on:
  push:
    branches: [main]

env:
  MFE_NAME: accounts
  S3_BUCKET: anz-mfe-production
  CDN_DOMAIN: cdn.anz.com

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration

  contract-test:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Run Pact contract tests
        run: npm run test:contract
      - name: Publish pact to broker
        run: npx pact-broker publish pacts/ --broker-base-url=$PACT_BROKER_URL

  build:
    runs-on: ubuntu-latest
    needs: contract-test
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: mfe-build
          path: dist/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: mfe-build
          path: dist/

      - name: Deploy to S3 (versioned path)
        run: |
          aws s3 sync dist/ s3://$S3_BUCKET/$MFE_NAME/$GITHUB_SHA/ \
            --cache-control "public, max-age=31536000, immutable"
          # remoteEntry.js gets short cache
          aws s3 cp dist/remoteEntry.js \
            s3://$S3_BUCKET/$MFE_NAME/$GITHUB_SHA/remoteEntry.js \
            --cache-control "public, max-age=60"

      - name: Update Service Discovery Registry (Canary 5%)
        run: |
          curl -X PUT https://mfe-registry.anz.internal/api/v1/mfes/$MFE_NAME \
            -H "Content-Type: application/json" \
            -d '{"url": "https://$CDN_DOMAIN/$MFE_NAME/$GITHUB_SHA/remoteEntry.js", "canaryPercent": 5}'

  canary-monitor:
    runs-on: ubuntu-latest
    needs: deploy
    steps:
      - name: Monitor error rates for 15 minutes
        run: |
          sleep 900
          ERROR_RATE=$(curl -s https://monitoring.anz.internal/api/mfe/$MFE_NAME/error-rate)
          if (( $(echo "$ERROR_RATE > 1.0" | bc -l) )); then
            echo "Rolling back due to high error rate"
            curl -X POST https://mfe-registry.anz.internal/api/v1/mfes/$MFE_NAME/rollback
            exit 1
          fi

      - name: Promote to 100%
        run: |
          curl -X PUT https://mfe-registry.anz.internal/api/v1/mfes/$MFE_NAME \
            -d '{"canaryPercent": 100}'
```

```
┌──────────────────────────────────────────────────────────┐
│           Independent Deployment Flow                     │
│                                                           │
│  Team A (Accounts)        Team B (Payments)               │
│  ┌────────────────┐      ┌────────────────┐              │
│  │ 1. git push    │      │ 1. git push    │              │
│  │ 2. Test        │      │ 2. Test        │              │
│  │ 3. Contract    │      │ 3. Contract    │              │
│  │ 4. Build       │      │ 4. Build       │              │
│  │ 5. S3/CDN      │      │ 5. S3/CDN      │              │
│  │ 6. Registry    │      │ 6. Registry    │              │
│  │ 7. Canary 5%   │      │ 7. Canary 5%   │              │
│  │ 8. Monitor     │      │ 8. Monitor     │              │
│  │ 9. Promote 100%│      │ 9. Promote 100%│              │
│  └───────┬────────┘      └───────┬────────┘              │
│          └───────┬───────────────┘                        │
│                  ↓                                        │
│       ┌──────────────────┐                               │
│       │  Service Registry │                               │
│       │  accounts → v2.1  │                               │
│       │  payments → v1.8  │                               │
│       └────────┬─────────┘                               │
│                ↓                                          │
│       Shell reads registry → loads latest remoteEntry.js  │
│                                                           │
│  Rollback = Update registry → instant (no rebuild)        │
└──────────────────────────────────────────────────────────┘
```

---

## MFE-08: Authentication Across Micro Frontends

**Q:** *"How do you implement authentication in a Micro Frontend architecture? How do you share auth state across MFEs?"*

🇻🇳 **Giải thích chi tiết:**
Authentication trong MFE architecture phải được quản lý tập trung bởi Shell application - đây là nguyên tắc bắt buộc từ cả góc độ security và user experience. Shell đảm nhận toàn bộ OAuth 2.0/OIDC flow với Identity Provider (Okta, Azure AD), quản lý complete token lifecycle bao gồm acquisition, storage, refresh, và revocation. Có hai cách share auth chính: Cookie-based (httpOnly cookies tự động gửi với mọi request, phù hợp với same-domain setup và có CSRF protection inherent) và Token-based (access token stored trong memory, refresh token trong httpOnly cookie). Shell expose một auth store qua Module Federation - một Zustand vanilla store chứa user info, access token, và permissions mà remote MFEs import và subscribe reactively. Token refresh phải do shell quản lý centrally với proactive strategy - một timer check token expiry và refresh 60 giây trước khi hết hạn. Khi user logout, shell clear tokens, dispatch event anz:auth:logout để MFEs clean up local state, và redirect về login page. Tuyệt đối KHÔNG để mỗi MFE tự handle auth riêng.

🇬🇧 **Sample Answer:**
> *"Authentication in a Micro Frontend architecture must be centralized in the shell application - this is non-negotiable from both security and user experience perspectives. The shell handles the entire OAuth 2.0/OIDC flow with the identity provider and manages the complete token lifecycle including acquisition, storage, refresh, and revocation. For sharing auth state, I use a layered approach. The primary mechanism is an auth store exposed from the shell via Module Federation - a Zustand vanilla store holding the current user profile, access token, and decoded permissions. Remote MFEs import this store and subscribe to changes reactively, so when the shell refreshes the token, all MFEs automatically see the new token. For API requests, I set up an HTTP interceptor in a shared utility library that automatically attaches the Bearer token from the auth store to every outgoing request and handles 401 responses by requesting a token refresh and retrying. Token refresh is managed exclusively by the shell using a proactive strategy - a timer checks token expiry and refreshes 60 seconds before expiration, preventing any MFE from encountering an expired token. For logout, the shell clears all tokens, dispatches an auth:logout event so MFEs can clean up local state, and redirects to the login page. I strongly enforce the rule that no individual MFE should ever implement its own authentication flow - this would create inconsistent session states and potential security vulnerabilities."*

```typescript
// ============================================
// SHELL: Centralized Auth Store
// shell/src/auth/authStore.ts
// ============================================
import { createStore } from 'zustand/vanilla';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  tokenExpiresAt: number | null;

  setAuth: (user: User, token: string, permissions: string[]) => void;
  updateToken: (token: string, expiresAt: number) => void;
  logout: () => void;
}

export const authStore = createStore<AuthState>((set) => ({
  user: null,
  accessToken: null,
  permissions: [],
  isAuthenticated: false,
  tokenExpiresAt: null,

  setAuth: (user, token, permissions) => {
    const decoded = decodeJWT(token);
    set({
      user,
      accessToken: token,
      permissions,
      isAuthenticated: true,
      tokenExpiresAt: decoded.exp * 1000,
    });
  },

  updateToken: (token, expiresAt) => {
    set({ accessToken: token, tokenExpiresAt: expiresAt });
    window.dispatchEvent(
      new CustomEvent('anz:auth:token-refreshed', { detail: { token } })
    );
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      permissions: [],
      isAuthenticated: false,
      tokenExpiresAt: null,
    });
    window.dispatchEvent(
      new CustomEvent('anz:auth:logout', { detail: { reason: 'user-initiated' } })
    );
  },
}));

// ============================================
// SHELL: Proactive Token Refresh Manager
// ============================================
class TokenRefreshManager {
  private refreshTimer: NodeJS.Timeout | null = null;

  start() {
    authStore.subscribe((state) => {
      if (state.tokenExpiresAt) {
        this.scheduleRefresh(state.tokenExpiresAt);
      }
    });
  }

  private scheduleRefresh(expiresAt: number) {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    // Refresh 60 seconds before expiry
    const refreshAt = expiresAt - 60_000;
    const delay = Math.max(refreshAt - Date.now(), 0);

    this.refreshTimer = setTimeout(() => this.refresh(), delay);
  }

  async refresh(): Promise<string> {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      authStore.getState().logout();
      window.location.href = '/login?reason=session-expired';
      throw new Error('Token refresh failed');
    }

    const { accessToken, expiresAt } = await response.json();
    authStore.getState().updateToken(accessToken, expiresAt);
    return accessToken;
  }
}

export const tokenRefresher = new TokenRefreshManager();

// ============================================
// REMOTE MFE: Consuming Auth State
// ============================================
import { authStore } from 'shell/authStore';
import { useSyncExternalStore } from 'react';

export function useAuth() {
  const auth = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState
  );

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    permissions: auth.permissions,
    hasPermission: (perm: string) => auth.permissions.includes(perm),
  };
}

// Usage in MFE component
function TransferButton() {
  const { hasPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;
  if (!hasPermission('payments:transfer')) {
    return <span>You do not have transfer permissions</span>;
  }

  return <button onClick={handleTransfer}>Transfer Funds</button>;
}
```

---

## MFE-09: Error Handling & Resilience

**Q:** *"How do you implement error handling and resilience patterns in Micro Frontend architecture?"*

🇻🇳 **Giải thích chi tiết:**
Error handling trong MFE cần được thiết kế để một MFE fail không làm crash toàn bộ application - đây là nguyên tắc fault isolation quan trọng nhất. Error Boundary là React feature cho phép catch JavaScript errors trong component tree và display fallback UI thay vì crash toàn app. Mỗi MFE nên được wrap trong Error Boundary riêng ở shell level để isolate failures hoàn toàn. Graceful degradation là nguyên tắc quan trọng - nếu Payment MFE fail, user vẫn có thể xem Accounts và thực hiện các operations khác. Circuit Breaker pattern prevent cascade failures - nếu một MFE repeatedly fails, temporarily stop loading nó và show fallback thay vì liên tục retry. Retry logic với exponential backoff cho network failures giúp handle temporary issues một cách intelligent. Monitoring và error tracking qua Sentry hoặc DataDog cần được setup per MFE với proper tagging để identify issues quickly và biết chính xác MFE nào đang có vấn đề. Health checks endpoint cho mỗi MFE giúp detect problems proactively.

🇬🇧 **Sample Answer:**
> *"Error handling in Micro Frontend architecture requires careful design to ensure that one MFE failing doesn't crash the entire application - this fault isolation is the most important resilience principle. Error Boundaries are a React feature that catches JavaScript errors anywhere in the component tree and displays a fallback UI instead of crashing. Each MFE should be wrapped in its own Error Boundary at the shell level to isolate failures completely. Graceful degradation is a key principle - if the Payment MFE fails to load, users should still be able to view their accounts and perform other operations; the failed section shows a helpful fallback UI rather than breaking the whole page. The Circuit Breaker pattern prevents cascade failures by temporarily stopping attempts to load an MFE if it repeatedly fails, showing a fallback instead of continuously retrying and potentially overwhelming the system. Retry logic with exponential backoff helps handle temporary network issues intelligently by attempting to reload failed MFEs after increasing intervals. Comprehensive monitoring and error tracking through services like Sentry should be configured per MFE with proper tagging - when an error occurs, we need to know immediately which MFE caused it and what the user was trying to do. Each MFE should also expose health check endpoints that the shell can poll to detect problems proactively before users encounter them."*

```typescript
// ============================================
// MFE Error Boundary Wrapper (Shell Level)
// ============================================
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  mfeName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class MFEErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { mfeName, onError } = this.props;

    // Report to error tracking (Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { mfe: mfeName },
        extra: { componentStack: errorInfo.componentStack },
      });
    }

    console.error(`[MFE Error] ${mfeName}:`, error);
    onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render() {
    const { hasError, retryCount } = this.state;
    const { children, mfeName, fallback } = this.props;

    if (hasError) {
      if (fallback) return fallback;

      return (
        <div className="mfe-error-fallback">
          <h3>Unable to load {mfeName}</h3>
          <p>Something went wrong loading this section.</p>
          {retryCount < 3 && (
            <button onClick={this.handleRetry}>Try Again</button>
          )}
          {retryCount >= 3 && (
            <p>Multiple attempts failed. Please refresh the page.</p>
          )}
        </div>
      );
    }

    return children;
  }
}

// ============================================
// Circuit Breaker Implementation
// ============================================
enum CircuitState {
  CLOSED = 'CLOSED',       // Normal operation
  OPEN = 'OPEN',           // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing recovery
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 3;
  private readonly resetTimeout = 30000; // 30 seconds

  canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) return true;

    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        return true;
      }
      return false;
    }

    return true; // HALF_OPEN allows one attempt
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// ============================================
// Shell Usage with Circuit Breaker
// ============================================
const mfeCircuitBreakers = new Map<string, CircuitBreaker>();

function getMFECircuitBreaker(mfeName: string): CircuitBreaker {
  if (!mfeCircuitBreakers.has(mfeName)) {
    mfeCircuitBreakers.set(mfeName, new CircuitBreaker());
  }
  return mfeCircuitBreakers.get(mfeName)!;
}

function MFEContainer({ mfeName, children }) {
  const circuitBreaker = getMFECircuitBreaker(mfeName);

  if (!circuitBreaker.canExecute()) {
    return (
      <div className="mfe-unavailable">
        <h3>{mfeName} is temporarily unavailable</h3>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <MFEErrorBoundary
      mfeName={mfeName}
      onError={() => circuitBreaker.recordFailure()}
    >
      <MFELoadedWrapper onSuccess={() => circuitBreaker.recordSuccess()}>
        {children}
      </MFELoadedWrapper>
    </MFEErrorBoundary>
  );
}
```

---

## MFE-10: Performance Optimization

**Q:** *"How do you optimize performance in a Micro Frontend architecture? What loading strategies do you use?"*

🇻🇳 **Giải thích chi tiết:**
Performance optimization trong MFE cần approach khác vì có nhiều bundles riêng biệt và inherent overhead từ việc load multiple applications. Lazy loading MFEs là critical - chỉ load MFE khi user navigate đến route tương ứng, không load tất cả upfront, giúp initial shell load cực kỳ nhanh. Prefetching strategies giúp improve perceived performance - khi user hover vào navigation link, bắt đầu prefetch remoteEntry.js của MFE đó để khi click thì đã sẵn sàng. Shared dependency deduplication qua Module Federation giúp avoid duplicate code - React, ReactDOM, router chỉ load một lần cho tất cả MFEs, tiết kiệm 200-400KB. Bundle size per MFE cần được monitor chặt chẽ với performance budgets - set limit (ví dụ max 200KB gzipped) và fail CI nếu vượt quá, sử dụng tools như size-limit. CDN caching strategy quan trọng: content-hashed chunks cache immutable forever, remoteEntry.js cache ngắn để users nhận version mới nhanh. Core Web Vitals (LCP, FID, CLS) cần được track per MFE để identify bottlenecks chính xác.

🇬🇧 **Sample Answer:**
> *"Performance optimization in Micro Frontend architecture requires a systematic, multi-layered approach because the inherent overhead of loading multiple applications can significantly impact user experience if not carefully managed. The most impactful optimization is shared dependency deduplication through Module Federation's shared configuration - ensuring React, ReactDOM, router libraries, and the design system load exactly once across all MFEs, which can save 200-400KB of duplicate JavaScript. Lazy loading is the second critical strategy - I only load each MFE when the user navigates to its route prefix, using React.lazy with Suspense and meaningful skeleton UIs so the initial shell load is fast and subsequent MFEs load on demand. For predictive performance, I implement intelligent preloading based on user behavior - if analytics show 80% of users navigate from accounts to payments, I preload the payments remoteEntry.js in the background using requestIdleCallback after the accounts page renders. I also preload on hover for navigation links, so by the time the user clicks, the MFE is already loaded. I enforce strict bundle size budgets per MFE - typically 150-200KB gzipped for initial load - with CI checks that fail the build if exceeded, using tools like size-limit. CDN caching strategy is critical: content-hashed chunk files receive immutable cache headers for maximum efficiency, while remoteEntry.js uses short-lived cache or explicit invalidation. Finally, I implement per-MFE performance monitoring using Core Web Vitals instrumentation, allowing us to identify exactly which micro frontend is causing performance issues."*

```typescript
// ============================================
// STRATEGY 1: Lazy Loading with Suspense
// ============================================
function ShellApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Each MFE loaded on-demand */}
        <Route
          path="/accounts/*"
          element={
            <Suspense fallback={<AccountsSkeleton />}>
              <MFEErrorBoundary mfeName="accounts">
                <AccountsMFE />
              </MFEErrorBoundary>
            </Suspense>
          }
        />

        <Route
          path="/payments/*"
          element={
            <Suspense fallback={<PaymentsSkeleton />}>
              <MFEErrorBoundary mfeName="payments">
                <PaymentsMFE />
              </MFEErrorBoundary>
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

// Meaningful skeleton (not spinner!)
function AccountsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}

// ============================================
// STRATEGY 2: Intelligent Preloading
// ============================================
class MFEPreloader {
  private preloaded = new Set<string>();

  preload(remoteName: string, url: string) {
    if (this.preloaded.has(remoteName)) return;
    this.preloaded.add(remoteName);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'script';
    document.head.appendChild(link);
  }

  preloadWhenIdle(remoteName: string, url: string) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.preload(remoteName, url));
    } else {
      setTimeout(() => this.preload(remoteName, url), 2000);
    }
  }
}

const preloader = new MFEPreloader();

// Navigation with preload on hover
function GlobalNav() {
  const { mfes } = useMFERegistry();

  return (
    <nav>
      {mfes.map((mfe) => (
        <NavLink
          key={mfe.name}
          to={`/${mfe.name}`}
          onMouseEnter={() => preloader.preload(mfe.name, mfe.url)}
        >
          {mfe.label}
        </NavLink>
      ))}
    </nav>
  );
}

// Preload likely-next MFE when idle
useEffect(() => {
  // Analytics: 80% of users go Home → Accounts
  preloader.preloadWhenIdle('accounts', accountsRemoteUrl);
}, []);

// ============================================
// STRATEGY 3: Bundle Size Budgets
// ============================================
// .size-limit.json (per MFE)
[
  {
    "name": "Accounts MFE - Initial",
    "path": "dist/remoteEntry.js",
    "limit": "15 KB",
    "gzip": true
  },
  {
    "name": "Accounts MFE - Dashboard",
    "path": "dist/src_AccountsDashboard_tsx.*.js",
    "limit": "80 KB",
    "gzip": true
  },
  {
    "name": "Accounts MFE - Total",
    "path": "dist/*.js",
    "limit": "200 KB",
    "gzip": true
  }
]

// CI: npx size-limit
// If any limit exceeded → build FAILS

// ============================================
// STRATEGY 4: Per-MFE Web Vitals Monitoring
// ============================================
function reportMFEPerformance(mfeName: string) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      sendToAnalytics({
        mfe: mfeName,
        metric: entry.name,
        value: entry.startTime,
      });
    }
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });
  observer.observe({ type: 'first-input', buffered: true });
  observer.observe({ type: 'layout-shift', buffered: true });

  const loadStart = performance.now();
  return {
    markLoaded() {
      const loadTime = performance.now() - loadStart;
      sendToAnalytics({
        mfe: mfeName,
        metric: 'mfe-load-time',
        value: loadTime,
      });
    },
  };
}
```

```
┌──────────────────────────────────────────────────────────┐
│           Performance Optimization Summary                │
├────────────────────────┬─────────────────────────────────┤
│ Strategy               │ Impact                           │
├────────────────────────┼─────────────────────────────────┤
│ Shared deps (MF)       │ Save 200-400KB duplicate JS     │
│ Lazy loading MFEs      │ Initial load = shell only (~50KB)│
│ Preload on hover       │ Near-instant MFE switch          │
│ Preload on idle        │ Background prep for likely routes│
│ Bundle size budgets    │ Prevent regression, CI enforced  │
│ Content-hash caching   │ Immutable chunks, CDN optimized  │
│ Skeleton UIs           │ Perceived perf improvement       │
│ Per-MFE Web Vitals     │ Targeted perf debugging          │
├────────────────────────┼─────────────────────────────────┤
│ TOTAL IMPACT           │ Initial load < 200KB (gzipped)  │
│                        │ MFE switch < 500ms (preloaded)   │
└────────────────────────┴─────────────────────────────────┘
```

---
