# HCL ANZ Interview Preparation Checklist

> **Interview Date**: Thứ 5 tuần sau
> **Format**: 2 tiếng, Full English, 1 Technical Round
> **Position**: Senior Frontend Engineer
> **Platform**: CodeSandbox (tạo account trước!)

---

## Interview Format (từ JD)

```
┌─────────────────────────────────────────────────────────────┐
│  PHẦN 1: CODING trên CodeSandbox                            │
│  - Đọc requirements (dài) → Implement React solution        │
│  - Real-world problem (không phải pure algorithm)           │
│  - Sau đó: Discuss solution + Follow-up questions           │
├─────────────────────────────────────────────────────────────┤
│  PHẦN 2: EXPERIENCE QUESTIONS                               │
│  - Câu hỏi về kinh nghiệm làm việc                          │
│  - Testing mindset, Design System, CI/CD, Ownership         │
└─────────────────────────────────────────────────────────────┘
```

## JD Requirements Checklist

| Criteria | Priority | Status |
|----------|----------|--------|
| 4+ years exp, 2+ years React/Next.js + TS | Must have | ⬜ |
| Software fundamentals (testable, reusable code) | Must have | ⬜ |
| **Testing mindset** | Must have | ⬜ |
| **UI/Design System understanding** | Must have | ⬜ |
| **Operation: CI/CD, monitoring, logging** | Must have | ⬜ |
| Ownership mindset | Must have | ⬜ |
| Accessibility (WCAG AA) | Nice to have | ⬜ |

---

## Progress Tracker

| Day | Topic | Focus | Status | File |
|-----|-------|-------|--------|------|
| Day 1 | React + JS Fundamentals | Hooks, Closure, Event Loop | ⬜ | [day-1-react-fundamentals.md](day-1-react-fundamentals.md) |
| Day 2 | Advanced React + TypeScript | Patterns, Generics, Types | ⬜ | [day-2-advanced-react-algorithms.md](day-2-advanced-react-algorithms.md) |
| Day 3 | System Design Fundamentals | RADIO, State Management | ⬜ | [day-3-system-design-fundamentals.md](day-3-system-design-fundamentals.md) |
| Day 4-5 | Design System + Testing | Components, RTL, MSW, Next.js | ⬜ | [day-4-5-system-design-technical.md](day-4-5-system-design-technical.md) |
| Day 5+ | **Operation + CI/CD** | Monitoring, Logging, Incidents | ⬜ | [day-5-operations-cicd.md](day-5-operations-cicd.md) ⭐NEW |
| Day 6 | Experience Questions | STAR stories, Ownership | ⬜ | [day-6-experience-questions.md](day-6-experience-questions.md) ⭐NEW |
| Day 7 | Mock Interview | Full simulation | ⬜ | Use all materials |

### Additional Resources
| Resource | Purpose | File |
|----------|---------|------|
| CodeSandbox Practice | 3 real-world problems | [codesandbox-practice-problems.md](codesandbox-practice-problems.md) ⭐NEW |
| Follow-up Questions | Post-coding discussion | [follow-up-questions.md](follow-up-questions.md) ⭐NEW |
| **React + Algorithm Drills** | Luyện tư duy từ cơ bản đến nâng cao | [react-algorithm-drills.md](react-algorithm-drills.md) ⭐NEW |
| **Design System Exercises** | Build components từ scratch | [design-system-exercises.md](design-system-exercises.md) ⭐NEW |
| Interview Resources | Links & cheatsheets | [HCL-ANZ-Interview-Resources.md](HCL-ANZ-Interview-Resources.md) |

**Legend**: ⬜ Not started | 🟡 In progress | ✅ Completed

---

## Day 1: React Fundamentals & Hooks

### Concepts
- [ ] Virtual DOM & Reconciliation
- [ ] JSX transpilation
- [ ] Props vs State
- [ ] Component Lifecycle (useEffect mapping)

### Hooks
- [ ] useState (functional updates, lazy init)
- [ ] useEffect (deps array, cleanup)
- [ ] useCallback (when to use)
- [ ] useMemo (when to use)
- [ ] useRef (DOM access, mutable values)
- [ ] useContext (Provider pattern)
- [ ] useReducer (complex state)

### Coding Challenges
- [ ] Counter with History (undo/redo)
- [ ] Debounced Search Input
- [ ] Toggle with Compound Pattern
- [ ] Fetch with Error Boundary
- [ ] Todo List with Filter

### JavaScript Fundamentals ⭐ NEW
- [ ] var vs let vs const (scope, hoisting)
- [ ] Hoisting và Temporal Dead Zone
- [ ] this keyword (các context khác nhau)
- [ ] Closure và ứng dụng
- [ ] Promises và async/await
- [ ] Event Loop (microtask vs macrotask)
- [ ] == vs === (type coercion)

### English Practice
- [ ] Record: "Explain Virtual DOM"
- [ ] Record: "useState vs useReducer"
- [ ] Record: "useEffect cleanup function"
- [ ] Record: "Explain closure in JavaScript"
- [ ] Record: "How does the event loop work?"

---

## Day 2: Advanced React & Algorithms

### React Patterns
- [ ] Custom Hooks (useDebounce, useLocalStorage, useOnClickOutside)
- [ ] Render Props pattern
- [ ] Higher-Order Components (HOC)
- [ ] Compound Components
- [ ] Controlled vs Uncontrolled

### Performance
- [ ] React.memo
- [ ] Code Splitting (React.lazy, Suspense)
- [ ] Virtualization concept

### Algorithm Patterns
- [ ] Two Pointers (Two Sum sorted, Valid Palindrome, 3Sum)
- [ ] Sliding Window (Max subarray, Longest substring)
- [ ] Hash Map (Two Sum, Group Anagrams, Top K)
- [ ] Binary Search (Rotated array, First/Last position)
- [ ] BFS/DFS (Tree traversal, Max depth, Validate BST)

### Practice Problems (LeetCode)
- [ ] Two Sum
- [ ] Valid Palindrome
- [ ] 3Sum
- [ ] Longest Substring Without Repeating
- [ ] Group Anagrams
- [ ] Search in Rotated Sorted Array
- [ ] Maximum Depth of Binary Tree

### TypeScript Essentials ⭐ NEW
- [ ] type vs interface (khi nào dùng gì)
- [ ] Generics (T extends, constraints)
- [ ] Utility Types (Partial, Pick, Omit, Record)
- [ ] Type Guards (typeof, instanceof, 'in', custom)
- [ ] Discriminated Unions
- [ ] React với TypeScript (props, events, forwardRef)

### English Practice
- [ ] Record: "Walk through Two Sum solution"
- [ ] Record: "Explain Sliding Window pattern"
- [ ] Record: "BFS vs DFS - when to use"
- [ ] Record: "Explain generics in TypeScript"
- [ ] Record: "What utility types do you use?"

---

## Day 3: React Coding Practice (CodeSandbox) ⭐ QUAN TRỌNG

> Format phỏng vấn: Đọc requirements → Implement → Discuss solution

### Setup
- [ ] Tạo account CodeSandbox: https://codesandbox.io/
- [ ] Làm quen với editor, shortcuts
- [ ] Test tạo React project mới

### Real-World Coding Problems (Practice)

**Problem 1: Search & Filter List**
- [ ] Fetch data từ API
- [ ] Search by keyword (debounced)
- [ ] Filter by category
- [ ] Sort by different fields
- [ ] Loading & Error states

**Problem 2: Multi-step Form**
- [ ] Wizard với 3-4 steps
- [ ] Validation mỗi step
- [ ] Navigate back/forward
- [ ] Submit final data
- [ ] Success/Error handling

**Problem 3: Data Table**
- [ ] Display paginated data
- [ ] Sorting columns
- [ ] Row selection (checkbox)
- [ ] Bulk actions
- [ ] Responsive design

**Problem 4: Real-time Feature**
- [ ] Counter với increment/decrement
- [ ] Undo/Redo functionality
- [ ] Persist to localStorage
- [ ] Keyboard shortcuts

### Coding Best Practices (để discuss)
- [ ] Component structure (separation of concerns)
- [ ] Custom hooks extraction
- [ ] Error handling patterns
- [ ] TypeScript types
- [ ] Performance considerations
- [ ] Accessibility basics

### English Practice
- [ ] Explain your solution approach
- [ ] Discuss trade-offs
- [ ] Answer "Why did you choose this approach?"
- [ ] Handle follow-up questions

---

## Day 4: System Design Practice + Next.js 14

### Design System & Components (Session 0)
- [ ] Component Abstraction Layers (tokens → primitives → composed → features)
- [ ] Design Tokens concept
- [ ] Headless vs Styled Components
- [ ] Shadcn/ui vs MUI vs Antd tradeoffs
- [ ] Compound Components pattern
- [ ] Wrapper Components pattern
- [ ] Storybook benefits

### Component Integration Testing (Session 0.5) ⭐ HOT
- [ ] Unit vs Integration vs E2E differences
- [ ] Testing Library philosophy (test behavior, not implementation)
- [ ] Query priorities (getByRole first)
- [ ] MSW (Mock Service Worker) setup
- [ ] Testing components with API calls
- [ ] Testing forms with validation
- [ ] Testing components with Context/Provider
- [ ] Testing Compound Components
- [ ] Testing custom hooks (renderHook)

### Component Design Practice
- [ ] Design Modal System (accessibility, focus trap)
- [ ] Design Autocomplete (debounce, keyboard nav)
- [ ] Design DataTable (sort, filter, pagination)

### Next.js 14 App Router
- [ ] App Router vs Pages Router differences
- [ ] Server Components vs Client Components
- [ ] 'use client' directive
- [ ] File conventions (layout, page, loading, error)

### Data Fetching
- [ ] fetch() in Server Components
- [ ] cache options (force-cache, no-store, revalidate)
- [ ] Parallel vs Sequential fetching
- [ ] Server Actions

### Other Next.js Topics
- [ ] Route Handlers (API routes)
- [ ] Middleware
- [ ] generateStaticParams
- [ ] generateMetadata

### English Practice
- [ ] Record: "Server vs Client Components"
- [ ] Record: "Data fetching in Next.js 14"
- [ ] Record: "Unit vs Integration testing"
- [ ] Record: "How do you test components with API calls?"

---

## Day 5+: Operations & CI/CD ⭐ NEW (Must Have!)

> **File chi tiết**: [day-5-operations-cicd.md](day-5-operations-cicd.md)

### CI/CD
- [ ] Explain CI/CD pipeline (build, test, deploy stages)
- [ ] Know GitHub Actions / CircleCI basics
- [ ] Preview deployments concept
- [ ] Feature flags for safe rollouts

### Monitoring
- [ ] Error tracking (Sentry setup, release tracking)
- [ ] Core Web Vitals (LCP, FID/INP, CLS targets)
- [ ] Performance budgets (Lighthouse CI)

### Incident Handling
- [ ] STAR story for production incident
- [ ] Severity levels understanding
- [ ] Post-mortem process

### English Practice
- [ ] Record: "Describe your CI/CD experience"
- [ ] Record: "How do you monitor frontend apps?"
- [ ] Record: "Tell me about a production incident"

---

## Day 5: Accessibility + Nx + gRPC

### WCAG AA Requirements
- [ ] Color Contrast (4.5:1 text, 3:1 large/UI)
- [ ] Keyboard Navigation
- [ ] Focus Management (visible focus, focus trap)
- [ ] ARIA basics (roles, states, properties)

### ARIA Patterns
- [ ] Accessible Modal (focus trap, escape key)
- [ ] Accessible Tabs (arrow key navigation)
- [ ] Form with error handling

### Accessibility Testing
- [ ] Know tools: axe, Lighthouse, VoiceOver
- [ ] Manual testing checklist

### Nx Monorepo
- [ ] Workspace structure (apps/, libs/)
- [ ] Project graph concept
- [ ] Task caching
- [ ] Affected commands
- [ ] Creating libraries

### gRPC-Web
- [ ] What is gRPC vs REST
- [ ] Protocol Buffers basics
- [ ] gRPC-Web architecture (Envoy proxy)
- [ ] Client usage pattern

### Technical Q&A
- [ ] Event loop explanation
- [ ] Closure explanation
- [ ] == vs ===
- [ ] Web Vitals (LCP, FID, CLS)
- [ ] State management in large apps

---

## CodeSandbox Practice ⭐ NEW (QUAN TRỌNG!)

> **File chi tiết**: [codesandbox-practice-problems.md](codesandbox-practice-problems.md)

### Setup
- [ ] Create CodeSandbox account: https://codesandbox.io/
- [ ] Create React + TypeScript project
- [ ] Làm quen với editor, shortcuts, file navigation

### Practice Problems (30-45 min mỗi bài)
- [ ] **Problem 1**: User Search with Filters
- [ ] **Problem 2**: Multi-Step Checkout Form
- [ ] **Problem 3**: Real-time Notification Center

### Post-Coding Discussion
- [ ] Review [follow-up-questions.md](follow-up-questions.md)
- [ ] Practice explaining your approach out loud
- [ ] Know trade-offs of your decisions
- [ ] Prepare improvements you would make with more time

---

## Day 6: Experience Questions ⭐ NEW

> **File chi tiết**: [day-6-experience-questions.md](day-6-experience-questions.md)

### STAR Stories (chuẩn bị 4-5 stories)
- [ ] Architecture decision story (Monorepo, RPC abstraction)
- [ ] Performance optimization story (30K records, Web Worker)
- [ ] Cross-geography collaboration story (AU/VN timezone)
- [ ] Mentoring junior developers story
- [ ] Production incident story (với CI/CD section)

### Common Questions Practice
- [ ] "Tell me about yourself" (2 minutes)
- [ ] "Why are you interested in this role?"
- [ ] "Describe a challenging project"
- [ ] "How do you handle technical disagreements?"
- [ ] "Tell me about a time you went beyond your responsibilities"

### Questions to Ask Interviewer
- [ ] Prepare 3 questions about role/team/technology

---

## Interview Day Checklist

### Before Interview
- [ ] Review RADIO framework
- [ ] Review React hooks cheatsheet
- [ ] Review algorithm patterns
- [ ] Review STAR stories for projects
- [ ] Test camera/microphone
- [ ] Prepare quiet environment
- [ ] Have water ready

### English Phrases Ready
- [ ] "Let me clarify the requirements..."
- [ ] "The way I would approach this is..."
- [ ] "Let me think about this for a moment..."
- [ ] "Could you clarify what you mean by...?"

### Key Points to Mention
- [ ] Leadership experience (Frontend Lead at Cognisian, Eye Design)
- [ ] Cross-geography experience (AU clients)
- [ ] Performance optimization (Web Worker, 30K records)
- [ ] Testing experience (Playwright, Jest, RTL, MSW)
- [ ] Monorepo experience (Turbo at Cognisian)
- [ ] Design System experience (component library, Storybook)
- [ ] Integration testing methodology

---

## Quick Self-Assessment

Rate yourself 1-5 after each day:

| Topic | Confidence (1-5) | Notes |
|-------|------------------|-------|
| **JavaScript Fundamentals** | | |
| **TypeScript** | | |
| React Hooks | | |
| Custom Hooks | | |
| Algorithms | | |
| System Design | | |
| **Design System/Components** | | |
| **Integration Testing** | | |
| Next.js 14 | | |
| Accessibility | | |
| Nx/gRPC | | |
| English Speaking | | |
| Project Stories | | |

---

## Daily Completion Log

### Day 1: ____/____
- Start time: ______
- End time: ______
- Completed: ______%
- Notes:


### Day 2: ____/____
- Start time: ______
- End time: ______
- Completed: ______%
- Notes:


### Day 3: ____/____
- Start time: ______
- End time: ______
- Completed: ______%
- Notes:


### Day 4: ____/____
- Start time: ______
- End time: ______
- Completed: ______%
- Notes:


### Day 5: ____/____
- Start time: ______
- End time: ______
- Completed: ______%
- Notes:


### Day 6: ____/____
- Start time: ______
- End time: ______
- Completed: ______%
- Notes:


### Day 7 (Overview): ____/____
- Start time: ______
- End time: ______
- Completed: ______%
- Notes:


---

## Weak Areas to Review

List topics you struggled with:

1.
2.
3.
4.
5.

---

**Good luck! You've got this! 💪**
