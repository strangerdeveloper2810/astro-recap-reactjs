# HCL ANZ Senior Frontend Engineer - Interview Preparation Resources

> **Target**: Senior Frontend Engineer @ HCL ANZ Bank Project
> **Interview Date**: Thứ 5 tuần sau (8 ngày chuẩn bị)
> **Format**: 2 tiếng, full English, 1 technical round
> **Tech Stack**: Next.js 14 + Nx + gRPC

---

## Table of Contents

1. [Priority Roadmap](#priority-roadmap)
2. [Live Coding Resources](#1-live-coding-react--algorithms)
3. [System Design Resources](#2-system-design)
4. [Technical Deep Dive](#3-technical-deep-dive)
5. [Project & Behavioral](#4-project--behavioral)
6. [English Practice](#5-english-practice)
7. [Daily Study Plan](#daily-study-plan)

---

## Priority Roadmap

| Priority | Topic | Time | Why |
|----------|-------|------|-----|
| **P0** | Live Coding (React + Algo) | 3 days | Dễ fail nhất, cần practice |
| **P1** | Project Stories (STAR) | 1.5 days | Differentiator cho Senior |
| **P1** | System Design | 1.5 days | Senior-level expectation |
| **P2** | Technical (Next.js, A11y) | 1.5 days | JD requirements |
| **P3** | Mock Interview | 0.5 day | Full simulation |

---

## 1. Live Coding (React + Algorithms)

### 1.1 React Coding Challenges

#### GitHub Repositories (FREE)

| Resource | Stars | Description |
|----------|-------|-------------|
| [sudheerj/reactjs-interview-questions](https://github.com/sudheerj/reactjs-interview-questions) | 40k+ | 500+ React Q&A, coding exercises |
| [greatfrontend/top-reactjs-interview-questions](https://github.com/greatfrontend/top-reactjs-interview-questions) | - | Updated 2025, by ex-FAANG |
| [Devinterview-io/react-interview-questions](https://github.com/Devinterview-io/react-interview-questions) | - | 2026 updated |

#### Practice Platforms

| Platform | Type | Link |
|----------|------|------|
| **GreatFrontEnd** | React coding questions | [greatfrontend.com/questions/react](https://www.greatfrontend.com/questions/react-interview-questions) |
| **Frontend Interview Handbook** | UI components | [frontendinterviewhandbook.com](https://www.frontendinterviewhandbook.com/coding/build-front-end-user-interfaces) |
| **Roadside Coder** | Course + Mock | [roadsidecoder.com](https://roadsidecoder.com/course-details) |

#### Common React Coding Tasks

```
□ Build a Todo App with CRUD
□ Implement infinite scroll
□ Build autocomplete/typeahead
□ Create a modal with focus trap
□ Implement debounce/throttle hooks
□ Build a data table with sorting/filtering
□ Create a form with validation
□ Implement a carousel/slider
□ Build a tabs component
□ Create a dropdown menu
```

### 1.2 JavaScript Algorithms

#### Must-Know Patterns (16 patterns)

| Pattern | Problems | Priority |
|---------|----------|----------|
| Two Pointers | Valid palindrome, 3Sum | HIGH |
| Sliding Window | Max subarray, Longest substring | HIGH |
| Fast & Slow Pointers | Linked list cycle | MEDIUM |
| Merge Intervals | Meeting rooms | MEDIUM |
| BFS/DFS | Tree traversal | HIGH |
| Binary Search | Search in sorted array | HIGH |
| Top K Elements | K most frequent | MEDIUM |
| Dynamic Programming | Climbing stairs, Coin change | MEDIUM |

#### Resources

| Resource | Link |
|----------|------|
| **LeetCode Patterns** | [github.com/seanprashad/leetcode-patterns](https://github.com/seanprashad/leetcode-patterns) |
| **Coding Patterns Guide** | [github.com/Chanda-Abdul/Several-Coding-Patterns](https://github.com/Chanda-Abdul/Several-Coding-Patterns-for-Solving-Data-Structures-and-Algorithms-Problems-during-Interviews) |
| **Tech Interview Handbook - Algo** | [techinterviewhandbook.org/algorithms](https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/) |
| **AlgoMonster** | [algo.monster](https://algo.monster/problems/stats) |
| **NeetCode** | [neetcode.io](https://neetcode.io/) |

#### Recommended LeetCode Problems (JavaScript)

**Easy (Warm-up)**
- Two Sum
- Valid Parentheses
- Merge Two Sorted Lists
- Best Time to Buy and Sell Stock
- Valid Palindrome

**Medium (Focus here)**
- 3Sum
- Longest Substring Without Repeating Characters
- Container With Most Water
- Group Anagrams
- Merge Intervals

---

## 2. System Design

### Framework: RADIO

```
R - Requirements (Functional & Non-functional)
A - Architecture (High-level components)
D - Data Model (Entities, relationships)
I - Interface (API design between components)
O - Optimizations (Performance, scalability, a11y)
```

### Resources

| Resource | Type | Link |
|----------|------|------|
| **Frontend Interview Handbook** | FREE Guide | [frontendinterviewhandbook.com/front-end-system-design](https://www.frontendinterviewhandbook.com/front-end-system-design) |
| **GreatFrontEnd System Design** | Paid (some free) | [greatfrontend.com/front-end-system-design-playbook](https://www.greatfrontend.com/front-end-system-design-playbook) |
| **awesome-front-end-system-design** | GitHub | [github.com/greatfrontend/awesome-front-end-system-design](https://github.com/greatfrontend/awesome-front-end-system-design) |
| **devkodeio/frontend-system-design** | GitHub | [github.com/devkodeio/frontend-system-design](https://github.com/devkodeio/frontend-system-design) |
| **Frontend at Scale** | FREE Course | [frontendatscale.com/courses/frontend-architecture](https://frontendatscale.com/courses/frontend-architecture/) |
| **GFG System Design** | Questions | [geeksforgeeks.org/top-25-front-end-system-design](https://www.geeksforgeeks.org/system-design/top-25-front-end-system-design-interview-questions/) |

### Common Questions

```
□ Design a Social Media Feed (Facebook/Twitter)
□ Design an E-commerce Product Page (Amazon)
□ Design Autocomplete/Typeahead
□ Design a Chat Application
□ Design an Image Gallery with lazy loading
□ Design a Real-time Collaborative Editor
□ Design a Dashboard with widgets
```

### Key Topics for Senior Level

- [ ] Performance optimization strategies
- [ ] Caching (browser, CDN, service worker)
- [ ] Code splitting & lazy loading
- [ ] State management at scale
- [ ] Error handling & monitoring
- [ ] Accessibility (WCAG 2.0 AA)
- [ ] Internationalization (i18n)
- [ ] Security (XSS, CSRF)

---

## 3. Technical Deep Dive

### 3.1 Next.js 14 (JD Requirement)

#### Resources

| Resource | Link |
|----------|------|
| **500 Next.js Questions** | [github.com/mrhrifat/nextjs-interview-questions](https://github.com/mrhrifat/nextjs-interview-questions) |
| **90+ Questions** | [finalroundai.com/blog/nextjs-interview-questions](https://www.finalroundai.com/blog/nextjs-interview-questions) |
| **100+ Questions DEV** | [dev.to/joodi/100-nextjs-interview-questions](https://dev.to/joodi/100-nextjs-interview-questions-with-answers-42a4) |
| **Senior-Level App Router** | [medium.com/@aayushpagare21](https://medium.com/@aayushpagare21/senior-level-next-js-interview-questions-part-1-571b85306b94) |
| **40 NextJS Questions** | [mentorcruise.com/questions/nextjs](https://mentorcruise.com/questions/nextjs/) |

#### Must-Know Topics

**App Router (Next.js 13+)**
- [ ] `app/` directory structure
- [ ] `layout.tsx` vs `template.tsx`
- [ ] `page.tsx`, `loading.tsx`, `error.tsx`
- [ ] Server Components vs Client Components
- [ ] `'use client'` directive
- [ ] Streaming & Suspense

**Rendering Patterns**
- [ ] SSR (Server-Side Rendering)
- [ ] SSG (Static Site Generation)
- [ ] ISR (Incremental Static Regeneration)
- [ ] CSR (Client-Side Rendering)
- [ ] When to use which?

**Data Fetching**
- [ ] `fetch()` in Server Components
- [ ] `cache()` and `revalidate`
- [ ] Server Actions
- [ ] Route Handlers (API routes)

**Performance**
- [ ] Image optimization (`next/image`)
- [ ] Font optimization (`next/font`)
- [ ] Script optimization (`next/script`)
- [ ] Metadata API

### 3.2 Nx Monorepo (JD Requirement)

#### Resources

| Resource | Link |
|----------|------|
| **Official Nx Docs** | [nx.dev/docs](https://nx.dev/docs/getting-started/tutorials/react-monorepo-tutorial) |
| **Mastering Nx Guide** | [dev.to/mcheremnov/mastering-nx](https://dev.to/mcheremnov/mastering-nx-the-complete-guide-to-modern-monorepo-development-5573) |
| **Nx + React + Node** | [mayallo.com/nx-monorepo-nodejs-react](https://mayallo.com/nx-monorepo-nodejs-react/) |

#### Key Concepts

```
□ Workspace structure (apps/ vs libs/)
□ Generators & Executors
□ Affected commands
□ Computation caching
□ Task orchestration
□ Dependency graph visualization
```

### 3.3 gRPC-Web (JD Requirement)

#### Resources

| Resource | Link |
|----------|------|
| **Official gRPC-Web Basics** | [grpc.io/docs/platforms/web/basics](https://grpc.io/docs/platforms/web/basics/) |
| **gRPC-Web Quick Start** | [grpc.io/docs/platforms/web/quickstart](https://grpc.io/docs/platforms/web/quickstart/) |
| **GitHub grpc-web** | [github.com/grpc/grpc-web](https://github.com/grpc/grpc-web) |
| **gRPC Frontend Guide** | [grpcguide.com/grpc-web-frontend](https://grpcguide.com/grpc-web-frontend) |

#### Key Concepts

```
□ Protocol Buffers (.proto files)
□ Service definition
□ grpc-web vs REST comparison
□ Envoy proxy setup
□ Code generation (protoc)
□ Error handling
□ Streaming limitations
```

### 3.4 WCAG Accessibility (JD Requirement: Level AA)

#### Resources

| Resource | Link |
|----------|------|
| **Accessibility Interview Questions** | [github.com/scottaohara/accessibility_interview_questions](https://github.com/scottaohara/accessibility_interview_questions) |
| **50 A11y Questions** | [index.dev/interview-questions/frontend-accessibility-engineer](https://www.index.dev/interview-questions/frontend-accessibility-engineer) |
| **Web A11y Guide** | [hellonehha.medium.com](https://hellonehha.medium.com/web-accessibility-interview-questions-guide-ac4fcf61cbf5) |

#### Must-Know for Level AA

| Topic | Requirement |
|-------|-------------|
| **Color Contrast** | 4.5:1 (normal text), 3:1 (large text) |
| **Keyboard Navigation** | All interactive elements focusable |
| **Focus Management** | Visible focus indicator |
| **ARIA** | Proper roles, states, properties |
| **Semantic HTML** | Correct heading hierarchy |
| **Form Labels** | Associated labels for inputs |
| **Error Handling** | Clear error messages |
| **Skip Links** | Skip to main content |

#### Common Questions

```
□ Difference between A, AA, AAA levels?
□ When should you use ARIA?
□ How to handle focus in SPA route changes?
□ What is accessible name computation?
□ How to make a modal accessible?
□ Describe your accessibility testing process
```

### 3.5 Testing (JD Requirement)

#### Key Areas

- [ ] Unit testing (Jest, React Testing Library)
- [ ] Integration testing
- [ ] E2E testing (Playwright, Cypress)
- [ ] Test patterns (AAA: Arrange, Act, Assert)
- [ ] Mocking strategies
- [ ] Code coverage

---

## 4. Project & Behavioral

### STAR Method

```
S - Situation (Context/Background)
T - Task (Your responsibility)
A - Action (What you did)
R - Result (Measurable outcome)
```

### Your Projects to Prepare (from CV)

#### 1. Caresa HIS (Cognisian) - Current

**Key Points to Highlight:**
- Led frontend for AI-powered healthcare system
- Turbo monorepo with 5 applications
- Type-safe RPC abstraction (70% boilerplate reduction)
- Zustand state architecture (8 modular stores)
- Playwright E2E testing

**Sample STAR:**
```
S: "At Cognisian, we were building a healthcare information system
   that needed to support multiple applications..."
T: "As Frontend Lead, I was responsible for architecting the
   frontend infrastructure and ensuring type safety across..."
A: "I designed a custom RPC abstraction layer with auto-generated
   TypeScript contracts from our Go backend..."
R: "This reduced API boilerplate by 70% and eliminated runtime
   type errors, improving developer productivity significantly."
```

#### 2. Nano Trading Platform (Bolt Technologies)

**Key Points:**
- Architected from scratch (ownership)
- Web Worker for 30K+ records/day
- TradingView integration
- Apollo GraphQL multi-endpoint
- Production in 2 months, 200+ traders

#### 3. KOMO Booking (Eye Design Sydney)

**Key Points:**
- Multi-tenant architecture (AU & VN)
- Real-time WebSocket updates
- Stripe payment integration
- Docker CI/CD pipeline

#### 4. IoT Platform 8TEN (WNE Singapore)

**Key Points:**
- RBAC with 50+ permissions
- Redux-Saga with token refresh
- 81+ test files
- React 18 upgrade

### Behavioral Questions

**Leadership & Mentoring (JD Focus)**
```
□ Tell me about a time you mentored a junior engineer
□ How do you handle disagreements in technical decisions?
□ Describe your approach to code reviews
□ How do you ensure knowledge sharing in a team?
```

**Cross-geography Collaboration (JD Focus)**
```
□ Experience working with remote/distributed teams?
□ How do you handle timezone differences?
□ Communication strategies for async work?
□ How do you build relationships with remote colleagues?
```

**Problem Solving**
```
□ Describe a challenging bug you fixed
□ Tell me about a project that failed. What did you learn?
□ How do you handle tight deadlines?
□ Describe a time you had to learn a new technology quickly
```

---

## 5. English Practice

### Technical English Resources

| Resource | Type | Link |
|----------|------|------|
| **English for Tech Interviews** | Course | [speaktechenglish.com](https://speaktechenglish.com/product/english-for-interviews/) |
| **Tech Interview Handbook** | Guide | [techinterviewhandbook.org](https://www.techinterviewhandbook.org/) |
| **Interviewing.io** | Mock interviews | [interviewing.io](https://interviewing.io/) |

### Common Phrases

#### Starting an Answer
```
"Let me walk you through my thought process..."
"The way I would approach this is..."
"Based on my experience with [X], I would..."
"First, I'd consider... then..."
```

#### Clarifying
```
"Could you clarify what you mean by...?"
"If I understand correctly, you're asking about..."
"Just to make sure I understand the requirements..."
"Let me confirm - you want me to...?"
```

#### During Live Coding
```
"I'm going to start by defining the interface..."
"Let me think about edge cases first..."
"The reason I'm choosing this approach is..."
"I'll optimize this after getting a working solution..."
"Let me refactor this to make it cleaner..."
```

#### When Stuck
```
"Let me think about this for a moment..."
"I haven't worked with this specific pattern before, but..."
"Could I ask a clarifying question?"
"My initial thought is... but let me verify..."
```

#### Wrapping Up
```
"To summarize my approach..."
"The trade-offs of this solution are..."
"If I had more time, I would also consider..."
"Do you have any questions about my implementation?"
```

### Grammar Fixes (Common Vietnamese Mistakes)

| Wrong ❌ | Correct ✅ |
|---------|-----------|
| "I have 4 years experience" | "I have 4 years **of** experience" |
| "I responsible for..." | "I **was/am responsible for**..." |
| "We use React for build..." | "We use React **to build**..." |
| "It have many features" | "It **has** many features" |
| "I working on..." | "I **worked/am working** on..." |
| "The code is work" | "The code **works/is working**" |
| "I will explain you" | "I will explain **to** you" |
| "Depend of the situation" | "Depend**s on** the situation" |

### Practice Tips

1. **Record yourself** explaining a project in English
2. **Think in English** while coding
3. **Practice with ChatGPT/Claude** - ask for mock interview
4. **Watch tech talks** on YouTube (with subtitles)
5. **Read documentation** in English (Next.js, React docs)

---

## Daily Study Plan

### Day 1-2: Live Coding Foundation

**Morning (2-3h)**
- Review React hooks (useState, useEffect, useCallback, useMemo)
- Practice 3-5 React coding challenges on GreatFrontEnd

**Afternoon (2-3h)**
- Algorithm patterns: Two Pointers, Sliding Window
- Solve 3-5 LeetCode Easy/Medium problems in JavaScript

**Evening (1h)**
- Record yourself explaining solutions in English

### Day 3: Live Coding Advanced

**Morning (2-3h)**
- Custom hooks creation
- Context API & state management patterns

**Afternoon (2-3h)**
- Algorithm patterns: BFS/DFS, Binary Search
- Practice more LeetCode problems

**Evening (1h)**
- Mock coding session (time yourself: 30 min per problem)

### Day 4-5: System Design

**Morning (2-3h)**
- Study RADIO framework
- Read Frontend Interview Handbook - System Design section

**Afternoon (2-3h)**
- Practice designing: Social Feed, E-commerce page, Autocomplete
- Focus on performance, caching, accessibility

**Evening (1h)**
- Record yourself explaining a design in English

### Day 6: Technical Deep Dive

**Morning (2-3h)**
- Next.js 14 App Router concepts
- Server Components vs Client Components

**Afternoon (2-3h)**
- WCAG Accessibility Level AA requirements
- Nx monorepo basics

**Evening (1h)**
- Review gRPC-Web concepts (high-level understanding)

### Day 7: Project Stories & Behavioral

**Morning (2-3h)**
- Prepare STAR stories for all 4 main projects
- Write down key metrics and achievements

**Afternoon (2-3h)**
- Practice answering behavioral questions
- Focus on leadership & mentoring examples

**Evening (1h)**
- Full English practice session

### Day 8: Mock Interview Day

**Morning (2h)**
- Full mock interview simulation (2 hours)
- Cover all sections: coding, system design, technical, behavioral

**Afternoon (2h)**
- Review weak areas
- Rest and prepare mentally

**Evening**
- Light review, sleep early

---

## Quick Reference Cards

### React Hooks Cheatsheet

```javascript
// State
const [state, setState] = useState(initialValue);

// Effect
useEffect(() => {
  // side effect
  return () => { /* cleanup */ };
}, [dependencies]);

// Memoization
const memoizedValue = useMemo(() => computeValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a), [a]);

// Ref
const ref = useRef(initialValue);

// Context
const value = useContext(MyContext);

// Reducer
const [state, dispatch] = useReducer(reducer, initialState);
```

### Next.js 14 App Router Structure

```
app/
├── layout.tsx      # Root layout (persistent)
├── page.tsx        # Home page
├── loading.tsx     # Loading UI
├── error.tsx       # Error UI
├── not-found.tsx   # 404 page
├── api/
│   └── route.ts    # API route handler
└── dashboard/
    ├── layout.tsx  # Nested layout
    └── page.tsx    # Dashboard page
```

### Accessibility Checklist (AA)

```
□ Color contrast: 4.5:1 (normal), 3:1 (large)
□ All images have alt text
□ Form inputs have labels
□ Keyboard navigation works
□ Focus is visible
□ Skip link to main content
□ Heading hierarchy (h1 > h2 > h3)
□ ARIA roles where needed
□ Error messages are clear
□ Touch targets: 44x44px minimum
```

---

## Final Tips

1. **Don't memorize** - Understand concepts deeply
2. **Practice out loud** - Get comfortable speaking in English
3. **Time yourself** - 30 min coding, 20 min system design
4. **Ask questions** - Clarify before jumping into solutions
5. **Think out loud** - Show your thought process
6. **Stay calm** - It's okay to pause and think
7. **Be honest** - If you don't know, say so and explain your approach

---

**Good luck! Bạn có thể làm được! 💪**

*Last updated: January 2026*
