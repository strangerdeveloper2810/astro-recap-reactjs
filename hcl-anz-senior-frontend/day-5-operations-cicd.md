# Day 5 Bonus: Operations - CI/CD, Monitoring & Incident Handling

> **Mục tiêu**: Trả lời tự tin các câu hỏi về post-deployment, monitoring, CI/CD
> **Lý do quan trọng**: Đây là **Must have** requirement trong JD ANZ
> **Thời gian**: 1-1.5 tiếng

---

## 🎯 Câu hỏi hay gặp

> "Describe your experience with CI/CD pipelines"
> "How do you monitor frontend applications in production?"
> "Tell me about a time you handled a production incident"
> "What metrics do you track for frontend performance?"

---

## 1. CI/CD cho Frontend

### 🇻🇳 Hiểu đơn giản

**CI (Continuous Integration)** = Tự động test code mỗi khi push
**CD (Continuous Deployment)** = Tự động deploy khi merge

```
Developer Push → Build → Lint → Test → Deploy Preview → Review → Merge → Production
```

### Pipeline cơ bản (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
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

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test:ci

      - name: Build
        run: npm run build

      - name: E2E tests
        run: npm run test:e2e

  deploy-preview:
    needs: build-and-test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel Preview
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: Describe your CI/CD pipeline experience**

```
"In my current project at Cognisian, I set up a GitHub Actions pipeline with
several stages:

1. **Build & Lint**: Every push triggers type checking and ESLint
2. **Testing**: Unit tests with Jest, integration tests with RTL + MSW
3. **E2E Tests**: Playwright for critical user flows
4. **Preview Deployments**: Each PR gets a preview URL for review
5. **Production**: Auto-deploy on merge to main

Key practices:
- Branch protection requiring passing CI before merge
- Caching node_modules to speed up builds
- Parallel test execution to reduce pipeline time
- Slack notifications for failed builds

This reduced our deployment time from manual 30 minutes to automated 8 minutes,
and caught bugs before they reached production."
```

---

## 2. Frontend Monitoring

### 🇻🇳 Các loại monitoring

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Monitoring Stack                      │
├─────────────────────────────────────────────────────────────────┤
│ 1. Error Monitoring         │ Sentry, LogRocket, Bugsnag         │
│    - JS errors              │                                     │
│    - Unhandled rejections   │                                     │
│    - Network errors         │                                     │
├─────────────────────────────────────────────────────────────────┤
│ 2. Performance Monitoring   │ Lighthouse CI, SpeedCurve           │
│    - Core Web Vitals        │                                     │
│    - Bundle size tracking   │                                     │
│    - API latency            │                                     │
├─────────────────────────────────────────────────────────────────┤
│ 3. User Analytics           │ Google Analytics, Mixpanel          │
│    - User behavior          │                                     │
│    - Conversion funnel      │                                     │
│    - Feature usage          │                                     │
├─────────────────────────────────────────────────────────────────┤
│ 4. Real User Monitoring     │ Datadog RUM, New Relic Browser      │
│    - Real performance data  │                                     │
│    - Session replays        │                                     │
│    - User frustration       │                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Sentry Setup Example

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERSION,

  // Environment
  environment: process.env.NODE_ENV,

  // Filter sensitive data
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});

// Usage in code
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'checkout' },
    extra: { orderId: order.id },
  });
}
```

### Core Web Vitals Tracking

```tsx
// web-vitals.ts
import { onLCP, onFID, onCLS, onTTFB, onINP } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      delta: metric.delta,
    }),
  });
}

// Track all Core Web Vitals
onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onCLS(sendToAnalytics);
onTTFB(sendToAnalytics);
onINP(sendToAnalytics);  // Interaction to Next Paint (replacing FID)
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: How do you monitor frontend applications in production?**

```
"I implement monitoring at three levels:

1. **Error Tracking with Sentry**:
   - Capture unhandled errors and promise rejections
   - Track release versions for regression detection
   - Set up alerts for error rate spikes
   - Use breadcrumbs to understand error context

2. **Performance Monitoring with Core Web Vitals**:
   - Track LCP, FID/INP, CLS for real users
   - Set up Lighthouse CI in pipeline with budget thresholds
   - Monitor bundle size changes in PRs

3. **Real User Monitoring**:
   - Session replays to understand user frustration
   - Track slow API calls affecting UX
   - Geographic performance variations

In my trading platform, we set up alerts when API latency exceeded 500ms
because traders need real-time data. This helped us catch a CDN issue
before users reported it."
```

---

## 3. Logging Best Practices

### 🇻🇳 Frontend Logging Levels

```typescript
// logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logger = {
  debug: (message: string, data?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },

  info: (message: string, data?: object) => {
    console.info(`[INFO] ${message}`, data);
    // Send to logging service in production
    if (process.env.NODE_ENV === 'production') {
      sendToLoggingService('info', message, data);
    }
  },

  warn: (message: string, data?: object) => {
    console.warn(`[WARN] ${message}`, data);
    sendToLoggingService('warn', message, data);
  },

  error: (message: string, error?: Error, data?: object) => {
    console.error(`[ERROR] ${message}`, error, data);
    Sentry.captureException(error, { extra: data });
    sendToLoggingService('error', message, { error: error?.message, ...data });
  },
};

// Usage
logger.info('User logged in', { userId: user.id });
logger.error('Payment failed', error, { orderId, amount });
```

### What to Log (and NOT log)

```
✅ DO LOG:
- User actions (login, form submit, navigation)
- API request/response times
- Feature usage events
- Error states and recovery
- Performance metrics

❌ DON'T LOG:
- Passwords or tokens
- Personal data (PII)
- Credit card numbers
- Full request/response bodies with sensitive data
```

---

## 4. Incident Handling

### 🇻🇳 Incident Response Process

```
1. DETECT     → Alert triggered (Sentry, PagerDuty, Slack)
2. ASSESS     → Severity? Impact? How many users?
3. MITIGATE   → Quick fix: rollback, feature flag, hotfix
4. COMMUNICATE→ Update stakeholders, status page
5. RESOLVE    → Deploy permanent fix
6. POST-MORTEM→ Root cause analysis, prevent recurrence
```

### Severity Levels

| Level | Impact | Response Time | Example |
|-------|--------|---------------|---------|
| P0 Critical | Site down, all users affected | 15 min | App won't load |
| P1 High | Major feature broken | 1 hour | Checkout broken |
| P2 Medium | Feature degraded | 4 hours | Search slow |
| P3 Low | Minor issue | 24 hours | UI glitch |

### 🇬🇧 Trả lời phỏng vấn (STAR Format)

> **Q: Tell me about a time you handled a production incident**

```
"SITUATION:
At Bolt Technologies, our trading platform had a critical incident where
the order book wasn't updating in real-time. This was P0 for a trading app.

TASK:
As the frontend lead, I needed to identify and fix the issue quickly
while keeping the team and stakeholders informed.

ACTION:
1. First, I checked Sentry and saw increased WebSocket reconnection errors
2. Enabled verbose logging to trace the issue
3. Found that our WebSocket was disconnecting but reconnect logic had a bug
4. While I worked on the fix, I deployed a feature flag to fall back to
   polling every 5 seconds as a temporary mitigation
5. Communicated status updates to the trading team every 15 minutes
6. Deployed the WebSocket fix after testing in staging

RESULT:
Mitigated within 20 minutes, fully resolved within 2 hours.
Post-mortem led to adding:
- WebSocket health monitoring dashboard
- Automatic fallback to polling when WebSocket fails
- Better reconnection backoff strategy

This reduced similar incidents by 90% in the following months."
```

---

## 5. Feature Flags

### 🇻🇳 Tại sao cần Feature Flags?

```
┌─────────────────────────────────────────────────────────────────┐
│                    Feature Flags Use Cases                       │
├─────────────────────────────────────────────────────────────────┤
│ 1. Gradual Rollout    │ Release to 10% users → 50% → 100%       │
│ 2. Kill Switch        │ Instant disable broken feature           │
│ 3. A/B Testing        │ Compare two versions                     │
│ 4. Beta Features      │ Enable for specific users                │
│ 5. Environment Config │ Different behavior dev/staging/prod      │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Example

```tsx
// Using LaunchDarkly, Unleash, or custom solution
const { isEnabled } = useFeatureFlag('new-checkout-flow');

function CheckoutPage() {
  const { isEnabled: useNewCheckout } = useFeatureFlag('new-checkout-flow');

  if (useNewCheckout) {
    return <NewCheckoutFlow />;
  }

  return <LegacyCheckoutFlow />;
}

// Quick kill switch during incident
// In dashboard: Turn OFF 'new-checkout-flow' → Instant rollback
```

### 🇬🇧 Trả lời phỏng vấn

> **Q: How do you safely deploy new features?**

```
"I use feature flags for safe deployments:

1. **Gradual Rollout**: Deploy to 5% of users, monitor metrics,
   then increase gradually. If errors spike, roll back instantly.

2. **Kill Switch**: Every major feature has a flag. If something
   breaks in production, we can disable it without a deploy.

3. **Preview for Stakeholders**: Enable features for internal users
   or specific accounts for testing before public release.

In my current project, we use feature flags for all new features.
This has allowed us to ship faster because we can merge to main
without waiting for a release window, and revert without deploys."
```

---

## 6. Performance Budgets

### 🇻🇳 Thiết lập Performance Budget

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: ['http://localhost:3000/', 'http://localhost:3000/dashboard'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Bundle Size Tracking

```bash
# In CI pipeline
npx bundlesize

# bundlesize.config.json
{
  "files": [
    {
      "path": ".next/static/chunks/main-*.js",
      "maxSize": "100 kB"
    },
    {
      "path": ".next/static/chunks/pages/_app-*.js",
      "maxSize": "50 kB"
    }
  ]
}
```

---

## Quick Q&A Practice

### Q: What's your experience with CI/CD?

```
"I've set up pipelines using GitHub Actions and CircleCI. Key stages include
linting, type checking, unit tests, integration tests, and E2E tests.
I implement preview deployments for PRs and automated production deploys
on merge to main. Caching and parallelization reduce build times."
```

### Q: How do you handle errors in production?

```
"I use Sentry for error tracking with release versioning to track regressions.
Critical errors trigger PagerDuty alerts. We have runbooks for common issues
and post-mortems for significant incidents to prevent recurrence."
```

### Q: What metrics do you track?

```
"Core Web Vitals: LCP under 2.5s, CLS under 0.1, INP under 200ms.
Business metrics: Error rate, API latency, conversion funnel.
Technical: Bundle size, build time, test coverage."
```

### Q: How do you ensure reliability?

```
"Multiple layers: Feature flags for quick rollback, preview deployments
for testing, staged rollouts to catch issues early, comprehensive monitoring
with alerts, and on-call rotation for incident response."
```

---

## Checklist

```
□ Can explain CI/CD pipeline setup
□ Know monitoring tools (Sentry, Lighthouse)
□ Understand logging best practices
□ Have incident handling story (STAR format)
□ Know feature flags benefits
□ Can discuss performance budgets
□ Understand deployment strategies (gradual rollout)
```

---

**Pro tip**: Liên hệ với experience thực tế từ projects của bạn:
- **Caresa HIS**: Có Playwright E2E testing
- **Nano Trading**: Cần high reliability cho trading
- **KOMO Booking**: Docker CI/CD pipeline

---

**Good luck! 💪**
