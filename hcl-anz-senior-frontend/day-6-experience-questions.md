# Day 6: Experience Questions & STAR Stories

> **Mục tiêu**: Chuẩn bị câu trả lời cho phần behavioral interview
> **Format**: STAR (Situation → Task → Action → Result)
> **Thời gian**: 2-3 tiếng chuẩn bị + practice nói

---

## 🎯 Các chủ đề thường hỏi

Dựa trên JD, interviewer sẽ tập trung vào:

1. **Leadership & Mentoring** - Vì đây là Senior position
2. **Cross-geography collaboration** - ANZ có team distributed
3. **Technical decision making** - Architectural choices
4. **Problem solving** - Debugging, performance issues
5. **Ownership** - Not just feature delivery

---

# PHẦN 1: STAR STORIES TỪ CÁC PROJECTS

## Project 1: Caresa HIS (Cognisian) - Current

### Story 1.1: Architecture Decision - Monorepo Setup

> **Q: Tell me about an architectural decision you made and why**

```
SITUATION:
At Cognisian, we were building a healthcare information system with
5 different applications: patient portal, doctor dashboard, admin panel,
appointment booking, and billing system.

Initially, each app was in a separate repository with its own dependencies.
This led to:
- Inconsistent UI components across apps
- Duplicate code for common utilities
- Difficult to share TypeScript types
- Version mismatches between shared packages

TASK:
As the Frontend Lead, I was responsible for improving developer experience
and ensuring consistency across all applications.

ACTION:
I proposed and implemented a Turbo monorepo structure:

1. Migrated all 5 apps into a single monorepo
2. Created shared packages:
   - @caresa/ui: Common components (Button, Modal, Form)
   - @caresa/utils: Shared utilities
   - @caresa/api: Type-safe API client with auto-generated types
3. Set up Turbo for task orchestration with caching
4. Configured path aliases for clean imports

The migration took 2 weeks with careful planning to avoid disrupting
ongoing development.

RESULT:
- Build times reduced by 60% thanks to Turbo caching
- Code sharing became seamless - change once, use everywhere
- New team members onboarded faster with consistent patterns
- TypeScript errors caught early through shared types
```

### Story 1.2: Type-Safe RPC Abstraction

> **Q: Describe a technical problem you solved**

```
SITUATION:
Our React frontend communicated with a Go backend through REST APIs.
The problem was type safety - backend changes often broke the frontend
at runtime because TypeScript types were manually maintained and
frequently out of sync.

TASK:
I needed to ensure type safety between frontend and backend, reducing
runtime errors and improving developer confidence.

ACTION:
I designed a custom RPC abstraction layer:

1. Created a code generator that reads Go struct definitions
2. Auto-generates TypeScript interfaces matching the Go types
3. Built a type-safe fetch wrapper that enforces correct
   request/response types
4. Integrated generation into CI - types regenerate on backend changes

Example:
// Instead of:
const user = await fetch('/api/users/1').then(r => r.json()) // any

// Now:
const user = await api.users.get({ id: '1' }) // fully typed User

RESULT:
- Reduced API-related bugs by 70%
- Developer productivity improved - IDE autocomplete for API responses
- Runtime type errors dropped to near zero
- Backend team appreciated the contract enforcement
```

### Story 1.3: Mentoring Junior Developers

> **Q: Tell me about a time you mentored someone**

```
SITUATION:
Two junior developers joined our team. They had basic React knowledge
but struggled with:
- TypeScript advanced patterns
- State management architecture
- Testing practices
- Code review etiquette

TASK:
As Frontend Lead, I was responsible for their growth and ensuring
they could contribute effectively within 2 months.

ACTION:
I implemented a structured mentoring program:

1. Weekly 1:1s to discuss challenges and goals
2. Pair programming sessions on complex features
3. Created internal documentation:
   - "TypeScript Patterns We Use"
   - "State Management Guide"
   - "Testing Philosophy"
4. Assigned progressively complex tasks:
   - Week 1-2: Bug fixes and small UI changes
   - Week 3-4: New component with guidance
   - Week 5-6: Feature with light review
   - Week 7+: Independent features
5. Code reviews with detailed explanations, not just corrections

RESULT:
- Both juniors became productive contributors within 6 weeks
- One junior now leads a feature independently
- Code review quality improved across the team
- Created reusable onboarding materials for future hires
```

---

## Project 2: Nano Trading Platform (Bolt Technologies)

### Story 2.1: Performance Optimization

> **Q: Tell me about a performance problem you solved**

```
SITUATION:
The trading platform needed to display 30,000+ OHLC records in a chart
and update the order book in real-time. Users complained about:
- Slow initial load (8+ seconds)
- UI freezing during data processing
- Chart becoming unresponsive

TASK:
As the architect who built this from scratch, I needed to make it
performant enough for professional traders who expect sub-second responses.

ACTION:
I implemented several optimizations:

1. **Web Worker for data processing**
   - Moved heavy calculations (moving averages, indicators) off main thread
   - Main thread stays responsive during computation

2. **Virtualization for order book**
   - Only render visible rows
   - Used react-window for the order book list
   - Reduced DOM nodes from 1000+ to ~20 visible

3. **Data chunking**
   - Load initial data in chunks
   - Show progressive loading indicator
   - Background-fetch older data

4. **Memoization strategy**
   - React.memo for chart components
   - useMemo for expensive calculations
   - Stable references with useCallback

5. **WebSocket optimization**
   - Batch updates (process every 100ms, not every message)
   - Throttle re-renders during high-frequency updates

RESULT:
- Initial load time: 8s → 2s
- UI remains responsive with 60fps even during market volatility
- Successfully deployed to 200+ traders
- Zero performance complaints after optimization
```

### Story 2.2: Building from Scratch with Tight Deadline

> **Q: Tell me about a challenging project with tight deadlines**

```
SITUATION:
Bolt Technologies needed a trading platform in 2 months. The requirements:
- Real-time price charts with TradingView
- Order book with live updates
- Multi-exchange support (3 different GraphQL endpoints)
- Production-ready with 200+ daily active traders

No existing codebase - needed to build from scratch.

TASK:
I was responsible for architecting and implementing the entire frontend,
ensuring it would be maintainable and performant.

ACTION:
1. **Week 1: Architecture planning**
   - Chose Next.js for SSR benefits
   - Apollo Client for GraphQL multi-endpoint handling
   - Designed component hierarchy and state management

2. **Week 2-4: Core features**
   - TradingView integration with custom indicators
   - Real-time WebSocket connection for prices
   - Order management UI

3. **Week 5-6: Polish and performance**
   - Web Worker implementation
   - Error handling and edge cases
   - Loading states and skeletons

4. **Week 7-8: Testing and deployment**
   - Integration tests for critical flows
   - Performance testing with load simulation
   - Staged rollout to beta traders

I worked closely with backend team, having daily syncs to resolve
blockers quickly.

RESULT:
- Launched on time with all requirements met
- 200+ traders using it daily within first month
- Platform handled market volatility without issues
- Codebase remained maintainable for future development
```

---

## Project 3: KOMO Booking (Eye Design Sydney)

### Story 3.1: Cross-Geography Collaboration

> **Q: How do you handle working with remote/distributed teams?**

```
SITUATION:
At Eye Design, KOMO Booking was a multi-tenant platform serving clients
in Australia and Vietnam. The team was distributed:
- Product & Design in Sydney (AU timezone)
- Development team in Vietnam (7 hours behind)
- Client meetings in AU business hours

TASK:
I needed to ensure smooth collaboration despite timezone differences
and deliver features that met both AU and VN market needs.

ACTION:
1. **Async communication by default**
   - Detailed PR descriptions with screenshots
   - Loom videos for complex explanations
   - Written decisions in Confluence/Notion

2. **Overlap hours**
   - Identified 2-3 hour overlap window
   - Reserved for real-time discussions and blockers
   - Stand-up at 5pm VN / 9pm Sydney

3. **Documentation culture**
   - Technical decisions documented in ADRs
   - API contracts shared in Notion
   - Figma annotations for design specs

4. **Clear ownership**
   - Feature leads responsible for their domain
   - Escalation path for cross-team issues

5. **Regular sync meetings**
   - Weekly planning: priorities for next week
   - Bi-weekly demo: show progress to stakeholders

RESULT:
- Reduced back-and-forth by 50% through better async docs
- Client feedback turnaround improved (same-day responses)
- Successfully launched in both markets
- Team satisfaction improved (less late-night calls)
```

### Story 3.2: Real-time Features with WebSocket

> **Q: Tell me about implementing a real-time feature**

```
SITUATION:
KOMO Booking needed real-time availability updates. When a customer
books a slot, other users viewing the same calendar should see it
become unavailable immediately - no page refresh.

TASK:
Implement real-time calendar updates without compromising performance
or user experience.

ACTION:
1. **WebSocket connection management**
   - Single connection per session
   - Auto-reconnect with exponential backoff
   - Heartbeat to detect stale connections

2. **Event-driven updates**
   - Server broadcasts booking events
   - Client listens for relevant calendar IDs
   - Optimistic UI for own bookings

3. **State synchronization**
   - React Query for data fetching
   - WebSocket updates invalidate relevant queries
   - Merge real-time updates with cached data

4. **Fallback mechanism**
   - Periodic polling (every 30s) as backup
   - Handle offline gracefully
   - Queue failed bookings for retry

RESULT:
- Availability updates appear within 500ms
- Zero double-bookings reported
- Works reliably even with unstable connections
- Improved customer satisfaction (no "sorry, already booked" errors)
```

---

## Project 4: IoT Platform 8TEN (WNE Singapore)

### Story 4.1: Complex Permission System

> **Q: Tell me about a complex feature you implemented**

```
SITUATION:
8TEN IoT platform had 50+ different permissions across multiple user
roles. The existing system was:
- Hardcoded permission checks scattered throughout the code
- Inconsistent behavior between frontend and backend
- Difficult to add new permissions

TASK:
Redesign the permission system to be maintainable, consistent, and
easy to extend.

ACTION:
1. **Centralized permission definitions**
   - Single source of truth for all permissions
   - TypeScript enum for type safety
   - Permission grouped by feature area

2. **Permission hook**
   ```tsx
   const { hasPermission, hasAnyPermission } = usePermissions();

   if (hasPermission('devices:write')) {
     // show edit button
   }
   ```

3. **Declarative permission component**
   ```tsx
   <RequirePermission permission="reports:export">
     <ExportButton />
   </RequirePermission>
   ```

4. **Backend sync**
   - Permission definitions shared between FE/BE
   - API returns user's permissions on login
   - Middleware validates on every request

RESULT:
- Permission checks reduced from 200+ scattered calls to centralized hook
- Adding new permission: change 1 file instead of 10+
- Zero permission-related bugs in 6 months after implementation
- Backend team adopted same permission names for consistency
```

---

# PHẦN 2: BEHAVIORAL QUESTIONS BY CATEGORY

## Leadership & Mentoring

### Q: How do you handle disagreements on technical decisions?

```
"When there's a technical disagreement, I focus on data and trade-offs,
not opinions.

For example, a team member wanted to use Redux for state management in
our new project. I preferred Zustand for simplicity.

Instead of debating, I:
1. Listed requirements: What do we actually need?
2. Created a small proof-of-concept with both approaches
3. Compared: bundle size, boilerplate, learning curve
4. Made decision transparent: documented why we chose Zustand

The key is separating technical merit from personal preference.
If someone has a better argument with data, I'm happy to change my mind."
```

### Q: How do you ensure knowledge sharing in a team?

```
"I've implemented several knowledge sharing practices:

1. **Documentation**: Technical decisions in ADRs (Architecture Decision Records)
2. **Code reviews**: Detailed explanations, not just approvals
3. **Tech talks**: Bi-weekly sessions where team members present topics
4. **Pair programming**: Scheduled sessions for complex features
5. **Runbooks**: For common operational tasks

In my current team, we went from 2 people knowing the system to everyone
being able to handle any feature within 3 months."
```

## Problem Solving

### Q: Describe a challenging bug you fixed

```
"In the trading platform, we had an intermittent bug where prices
would sometimes show stale data.

DIAGNOSIS:
1. Couldn't reproduce consistently
2. Added logging to track WebSocket messages
3. Found: WebSocket was reconnecting but old subscription wasn't cleared

ROOT CAUSE:
Race condition - new connection established before old one fully closed,
causing duplicate subscriptions with stale data.

FIX:
1. Implemented connection state machine
2. Ensured cleanup before reconnect
3. Added idempotency check for subscriptions

PREVENTION:
- Added integration test for reconnection scenarios
- Monitoring alert for duplicate subscriptions"
```

### Q: Tell me about a project that failed or had major issues

```
"At a previous company, we launched a feature without proper testing
in a rush to meet deadline. It had bugs that affected 30% of users.

WHAT WENT WRONG:
- Skipped integration tests to save time
- No staged rollout
- Insufficient error monitoring

WHAT I LEARNED:
1. Testing is non-negotiable, even with tight deadlines
2. Always do staged rollouts for new features
3. Have monitoring in place BEFORE launching

HOW I APPLY IT NOW:
- Built CI pipeline that blocks merge without tests
- All features launch behind feature flags with gradual rollout
- Sentry configured with alerts before any deploy

The failure taught me more than many successes."
```

## Ownership & Initiative

### Q: Tell me about a time you went beyond your job description

```
"At Cognisian, I noticed our Playwright E2E tests were flaky - failing
randomly about 20% of the time. It wasn't technically my responsibility,
but it was affecting the whole team.

I spent a weekend analyzing the failures and found:
- Some tests had hardcoded timeouts
- Element selectors were fragile
- Test data wasn't isolated

I refactored the test suite:
- Replaced timeouts with proper waitFor conditions
- Used data-testid for stable selectors
- Each test creates and cleans up its own data

Result: Flaky tests dropped from 20% to under 2%.

I believe owning the team's productivity is part of being a senior engineer."
```

---

# PHẦN 3: QUESTIONS TO ASK INTERVIEWER

Luôn có 2-3 câu hỏi để hỏi interviewer cuối buổi:

### About the Role
- "What does success look like in this role after 6 months?"
- "What are the biggest technical challenges the team is facing?"
- "How does the team balance new features vs technical debt?"

### About the Team
- "How is the team structured? Frontend, backend, cross-functional?"
- "What's the code review process like?"
- "How do you handle on-call and production incidents?"

### About Technology
- "What's the current tech stack and any planned migrations?"
- "How do you approach testing? What's the coverage like?"
- "What monitoring and observability tools do you use?"

### About Culture
- "How does the team handle disagreements on technical decisions?"
- "What opportunities are there for learning and growth?"
- "How does the team celebrate wins and handle failures?"

---

## English Practice Checklist

Ghi âm và tự nghe lại:

```
□ Record 1 leadership story
□ Record 1 technical challenge story
□ Record 1 cross-geography collaboration story
□ Record answers to 5 common questions
□ Record your "Tell me about yourself" (2 minutes)
□ Practice asking questions to interviewer
```

---

## Day 6 Checklist

```
□ Write out 4-5 STAR stories from your projects
□ Practice answering common behavioral questions
□ Prepare 3 questions to ask interviewer
□ Record yourself answering in English
□ Time yourself - answers should be 2-3 minutes
□ Review key metrics from your projects
```

---

**Pro tip**: Viết ra và đọc to nhiều lần. Interview là về cách bạn trình bày, không chỉ nội dung.

**Good luck! 💪**
