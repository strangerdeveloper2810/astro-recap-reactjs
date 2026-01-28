# HCL ANZ Interview Preparation Checklist

> **Interview Date**: Thứ 5 tuần sau
> **Format**: 2 tiếng, Full English, 1 Technical Round
> **Position**: Senior Frontend Engineer

---

## Progress Tracker

| Day | Topic | Status |
|-----|-------|--------|
| Day 1 | React Fundamentals & Hooks | ⬜ |
| Day 2 | Advanced React & Algorithms | ⬜ |
| Day 3 | System Design Fundamentals | ⬜ |
| Day 4 | System Design Practice + Next.js 14 | ⬜ |
| Day 5 | Accessibility + Nx + gRPC | ⬜ |
| Day 6 | Project Stories & Behavioral | ⬜ |
| Day 7 | Overview & Mock Interview | ⬜ |

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

## Day 3: System Design Fundamentals

### RADIO Framework
- [ ] R - Requirements (functional & non-functional)
- [ ] A - Architecture (component diagram)
- [ ] D - Data Model (state, API contracts)
- [ ] I - Interface (component props, events)
- [ ] O - Optimizations (performance, a11y, edge cases)

### Core Concepts
- [ ] State Management strategies (local, server, global, URL)
- [ ] Rendering Patterns (CSR, SSR, SSG, ISR)
- [ ] API Communication (REST vs GraphQL, real-time options)
- [ ] Error Handling (Error Boundary, API errors)
- [ ] Security (XSS, CSRF, auth tokens)

### Practice Designs
- [ ] Design Autocomplete (full RADIO walkthrough)
- [ ] Design News Feed (full RADIO walkthrough)

### English Practice
- [ ] Can explain RADIO framework fluently
- [ ] Can draw architecture diagram while talking

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
