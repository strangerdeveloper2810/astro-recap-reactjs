# Day 3: Frontend System Design Fundamentals

> **Mục tiêu**: Nắm vững framework trả lời System Design, các concepts core
> **Thời gian**: 4-5 tiếng
> **Output**: Có thể design bất kỳ frontend system nào theo structure rõ ràng

---

## Schedule Day 3

| Time | Topic | Duration |
|------|-------|----------|
| Session 1 | RADIO Framework & Approach | 1h |
| Session 2 | Core Concepts Deep Dive | 1.5h |
| Session 3 | Practice: Design Autocomplete | 1h |
| Session 4 | Practice: Design News Feed | 1h |

---

## Session 1: RADIO Framework (1h)

### What is Frontend System Design?

#### Concept (Vietnamese)
Frontend System Design khác với Backend System Design:
- **Backend**: Focus vào databases, servers, scaling, distributed systems
- **Frontend**: Focus vào UI architecture, state management, performance, UX

#### Interview Answer (English)
```
"Frontend system design focuses on how to architect the client-side of an
application. It covers component architecture, state management, data flow,
API integration, performance optimization, and user experience considerations.

Unlike backend system design which deals with databases and server scaling,
frontend design addresses challenges like rendering performance, bundle size,
offline support, and responsive design across devices."
```

---

### The RADIO Framework

```
┌─────────────────────────────────────────────────────────────────┐
│  R - Requirements                                                │
│      Clarify functional & non-functional requirements            │
├─────────────────────────────────────────────────────────────────┤
│  A - Architecture                                                │
│      High-level component structure & data flow                  │
├─────────────────────────────────────────────────────────────────┤
│  D - Data Model                                                  │
│      State structure, API contracts, caching                     │
├─────────────────────────────────────────────────────────────────┤
│  I - Interface Definition                                        │
│      Component APIs, props, events                               │
├─────────────────────────────────────────────────────────────────┤
│  O - Optimizations                                               │
│      Performance, accessibility, edge cases                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### R - Requirements (5-7 minutes)

#### What to Clarify

**Functional Requirements:**
```
□ What are the core features?
□ What user interactions are needed?
□ What data needs to be displayed?
□ Are there different user roles?
□ What happens on errors?
```

**Non-Functional Requirements:**
```
□ Performance targets? (load time, FPS)
□ Scale? (users, data volume)
□ Device support? (mobile, tablet, desktop)
□ Browser support?
□ Offline support needed?
□ Accessibility requirements? (WCAG level)
□ Internationalization (i18n)?
□ SEO requirements?
```

#### Sample Questions to Ask (English)

```
"Before I dive into the design, I'd like to clarify a few things:

1. What's the expected scale - how many users and how much data?
2. Are there specific performance requirements, like load time under 3 seconds?
3. Do we need to support mobile devices or is this desktop-only?
4. Are there accessibility requirements we need to meet, like WCAG AA?
5. Do we need offline support?
6. Is SEO important for this application?"
```

#### Example: Design a Twitter-like Feed

**Your clarification questions:**
```
"Let me clarify the requirements:
- Should the feed support infinite scroll or pagination?
- Do we need real-time updates when new posts arrive?
- What media types - text only, or also images/videos?
- Do we need offline reading capability?
- What's the expected post volume - how many posts per day?
- Is this mobile-first or desktop-first?"
```

---

### A - Architecture (8-10 minutes)

#### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         App Shell                                │
│  ┌─────────────┐  ┌─────────────────────────────────────────┐  │
│  │   Navbar    │  │              Main Content                │  │
│  └─────────────┘  │  ┌─────────────────────────────────┐    │  │
│                    │  │         Feature Module          │    │  │
│  ┌─────────────┐  │  │  ┌─────────┐  ┌─────────────┐  │    │  │
│  │   Sidebar   │  │  │  │Container│  │  Presenters │  │    │  │
│  └─────────────┘  │  │  └─────────┘  └─────────────┘  │    │  │
│                    │  └─────────────────────────────────┘    │  │
│                    └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        State Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Global State │  │ Server State │  │    Local State       │  │
│  │  (Zustand)   │  │(React Query) │  │    (useState)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  API Client  │  │   WebSocket  │  │   Storage Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### Component Types

| Type | Purpose | Example |
|------|---------|---------|
| **Container** | Business logic, data fetching | `FeedContainer` |
| **Presenter** | Pure UI, receives props | `PostCard` |
| **Layout** | Page structure | `DashboardLayout` |
| **Shared/UI** | Reusable components | `Button`, `Modal` |

#### Interview Answer (English)
```
"For the architecture, I'll use a layered approach:

1. **Component Layer**: Divided into containers (handle logic and data)
   and presentational components (pure UI). This separation makes
   components easier to test and reuse.

2. **State Layer**: I'll separate state by concern:
   - Server state with React Query for API data with caching
   - Global UI state with Zustand for things like theme, user session
   - Local state with useState for component-specific state

3. **Service Layer**: Abstractions for external communication:
   - API client for REST/GraphQL calls
   - WebSocket service for real-time updates
   - Storage service for localStorage/IndexedDB

This architecture scales well and keeps concerns separated."
```

---

### D - Data Model (5-7 minutes)

#### State Structure

```typescript
// Example: Feed Application State

// Server State (managed by React Query)
interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface FeedState {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Global UI State (Zustand)
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeModal: string | null;
}

// User State
interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
}
```

#### API Contract

```typescript
// REST API Endpoints
GET  /api/feed?cursor={cursor}&limit={limit}
POST /api/posts
GET  /api/posts/{id}
POST /api/posts/{id}/like
DELETE /api/posts/{id}/like

// Response shape
interface APIResponse<T> {
  data: T;
  meta: {
    cursor: string | null;
    hasMore: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Caching Layers                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Browser Cache (HTTP)     │ Static assets, images         │
│ 2. CDN Cache                │ JS bundles, fonts             │
│ 3. Service Worker           │ Offline support               │
│ 4. React Query Cache        │ API responses                 │
│ 5. Component Memoization    │ Expensive renders             │
└─────────────────────────────────────────────────────────────┘
```

#### Interview Answer (English)
```
"For the data model, I'll define clear interfaces for our entities.

The state is divided into:
1. **Server state**: Posts, users, comments - cached with React Query
   with stale-while-revalidate strategy
2. **UI state**: Theme, modal visibility - in Zustand store
3. **Local state**: Form inputs, expanded states - in components

For caching:
- HTTP caching for static assets with proper Cache-Control headers
- React Query with 5-minute stale time for feed data
- Optimistic updates for likes to feel instant

The API uses cursor-based pagination for infinite scroll, which handles
real-time insertions better than offset pagination."
```

---

### I - Interface Definition (5-7 minutes)

#### Component Interface Design

```typescript
// Container Component
interface FeedContainerProps {
  userId?: string;        // Optional filter by user
  initialData?: Post[];   // SSR data
}

// Presenter Component
interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  isCompact?: boolean;
}

// Shared Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
```

#### Event Flow

```
User Action → Event Handler → State Update → Re-render
     │              │              │
     │              │              └── React Query mutation
     │              │                  or setState
     │              └── Optimistic update
     └── onClick, onSubmit, etc.
```

#### Interview Answer (English)
```
"For component interfaces, I follow these principles:

1. **Props down, events up**: Data flows down through props,
   user actions bubble up through callbacks

2. **Single responsibility**: Each component has a clear, focused purpose

3. **Composition over configuration**: Prefer composable components
   over prop-heavy ones

For example, the PostCard receives post data and callback functions.
It doesn't know about the API or state management - it just renders
UI and calls the provided handlers. This makes it highly reusable
and easy to test."
```

---

### O - Optimizations (5-10 minutes)

#### Performance Checklist

```
□ Code Splitting
  - Route-based splitting with React.lazy
  - Component-level splitting for heavy features

□ Bundle Optimization
  - Tree shaking
  - Minification
  - Compression (Brotli/Gzip)

□ Rendering Optimization
  - React.memo for expensive components
  - useMemo/useCallback for stable references
  - Virtualization for long lists

□ Network Optimization
  - API response caching
  - Image optimization (WebP, lazy loading)
  - Prefetching critical resources

□ Perceived Performance
  - Skeleton loaders
  - Optimistic updates
  - Progressive loading
```

#### Accessibility (WCAG AA)

```
□ Keyboard Navigation
  - All interactive elements focusable
  - Logical tab order
  - Skip links

□ Screen Reader Support
  - Semantic HTML
  - ARIA labels where needed
  - Live regions for dynamic content

□ Visual
  - Color contrast 4.5:1
  - Focus indicators
  - Text resizable to 200%

□ Cognitive
  - Clear error messages
  - Consistent navigation
  - Sufficient time for actions
```

#### Edge Cases

```
□ Empty States
  - No data
  - Search with no results

□ Error States
  - Network failure
  - API errors
  - Invalid data

□ Loading States
  - Initial load
  - Pagination loading
  - Action in progress

□ Boundary Cases
  - Very long content
  - Missing images
  - Slow connections
```

#### Interview Answer (English)
```
"For optimizations, I focus on three areas:

**Performance:**
- Code splitting at route level to reduce initial bundle
- Virtualized list for the feed to handle thousands of posts
- Image lazy loading with blur placeholders
- React Query for caching and background refetching

**Accessibility (WCAG AA):**
- Semantic HTML with proper heading hierarchy
- ARIA labels for interactive elements
- Keyboard navigation support with visible focus
- Color contrast meeting 4.5:1 ratio

**Edge cases:**
- Skeleton loaders for perceived performance
- Error boundaries with retry functionality
- Offline indicator when connection is lost
- Empty states with clear calls to action

I'd also set up monitoring with Core Web Vitals to track
LCP, FID, and CLS in production."
```

---

## Session 2: Core Concepts Deep Dive (1.5h)

### 2.1 State Management Strategies

#### When to Use What

| Type | Tool | Use Case |
|------|------|----------|
| **Local** | useState | Form inputs, UI toggles |
| **Lifted** | Props | Shared between siblings |
| **Context** | useContext | Theme, auth, locale |
| **Global** | Zustand/Redux | Complex UI state |
| **Server** | React Query | API data with caching |
| **URL** | Router | Shareable page state |

#### Interview Answer (English)
```
"I categorize state by its nature and choose tools accordingly:

**Local state** with useState for component-specific data like form
inputs or expanded/collapsed states.

**Server state** with React Query or TanStack Query. This is data from
APIs that needs caching, background updates, and optimistic mutations.
It handles loading/error states automatically.

**Global UI state** with Zustand. It's lightweight, has no boilerplate,
and works great for things like theme, sidebar state, or notifications.

**URL state** for anything that should be shareable or bookmarkable -
search filters, pagination, selected tabs.

In my current project at Cognisian, we use Zustand with 8 domain-specific
stores. Each store handles one concern - patients, appointments, billing -
which makes the codebase maintainable and testable."
```

---

### 2.2 Rendering Patterns

#### Client-Side Rendering (CSR)

```
Browser Request → Empty HTML → Download JS → Execute → Render
                                    │
                              API calls for data
```

**Pros**: Simple, good for SPAs behind auth
**Cons**: Slow initial load, poor SEO

#### Server-Side Rendering (SSR)

```
Browser Request → Server renders HTML with data → Send to browser
                                                      │
                                                Hydrate with JS
```

**Pros**: Fast first paint, SEO friendly
**Cons**: Server load, TTFB latency

#### Static Site Generation (SSG)

```
Build Time → Generate HTML for all pages → Deploy to CDN
                                                │
                                        Serve cached HTML
```

**Pros**: Fastest, cheapest, most scalable
**Cons**: Stale data, build time for many pages

#### Incremental Static Regeneration (ISR)

```
First Request → Serve cached HTML → Revalidate in background
                                              │
                                    Update cache after N seconds
```

**Pros**: Best of SSG + fresh data
**Cons**: Stale data between revalidations

#### Interview Answer (English)
```
"The choice of rendering strategy depends on the use case:

**SSG** for content that rarely changes - marketing pages, documentation.
It's the fastest because pages are pre-built and served from CDN.

**ISR** for content that changes periodically - product pages, blog posts.
Pages are cached but revalidate after a set time, balancing performance
and freshness.

**SSR** for personalized or real-time content - dashboards, feeds.
Every request gets fresh data, but it adds server load.

**CSR** for highly interactive apps behind authentication - admin panels,
internal tools. SEO isn't needed and the full interactivity is required.

In Next.js 14, I'd use the App Router with Server Components as the
default, which gives us automatic code splitting and streaming. For
dynamic content, I'd use the `revalidate` option or `fetch` with
`cache: 'no-store'` for real-time data."
```

---

### 2.3 API Communication Patterns

#### REST vs GraphQL

| Aspect | REST | GraphQL |
|--------|------|---------|
| Endpoints | Multiple | Single |
| Over-fetching | Common | Solved |
| Under-fetching | Multiple requests | Single query |
| Caching | HTTP caching easy | More complex |
| Learning curve | Lower | Higher |

#### Real-time Options

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| **Polling** | Simple, low frequency | Low |
| **Long Polling** | Near real-time | Medium |
| **SSE** | Server-to-client stream | Medium |
| **WebSocket** | Bi-directional, high frequency | High |

#### Interview Answer (English)
```
"For API communication, I consider the data requirements:

**REST** is my default for most CRUD operations. It's well understood,
has great HTTP caching support, and works well with React Query.

**GraphQL** when we have complex data requirements or multiple clients
needing different data shapes. It eliminates over-fetching and reduces
round trips. I'd use Apollo Client for caching and state management.

For **real-time updates**:
- Polling for simple cases like checking notification count
- Server-Sent Events (SSE) for one-way server pushes like live feeds
- WebSockets for bidirectional communication like chat or trading

In my trading platform at Bolt Technologies, we used WebSocket for
live price updates and GraphQL for the order book and trading history,
which gave us both real-time performance and flexible data fetching."
```

---

### 2.4 Error Handling Strategies

#### Error Boundary Pattern

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to monitoring service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorUI />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

#### API Error Handling

```typescript
// Centralized error handling
async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.message, response.status, error.code);
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new NetworkError('Network request failed');
  }
}

// Custom error classes
class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

---

### 2.5 Security Considerations

#### Common Vulnerabilities

```
□ XSS (Cross-Site Scripting)
  - Sanitize user input
  - Use textContent instead of innerHTML
  - CSP headers

□ CSRF (Cross-Site Request Forgery)
  - CSRF tokens
  - SameSite cookies

□ Sensitive Data
  - Never store secrets in frontend code
  - Use httpOnly cookies for tokens
  - Avoid exposing user data in URLs
```

#### Interview Answer (English)
```
"Security is critical in frontend development. Key areas I focus on:

**XSS Prevention:**
- React escapes content by default, but I'm careful with dangerouslySetInnerHTML
- I sanitize any user-generated content with DOMPurify
- Implement Content Security Policy headers

**Authentication:**
- Store tokens in httpOnly cookies, not localStorage
- Implement token refresh mechanism
- Clear sensitive data on logout

**Data Protection:**
- Never expose sensitive data in URLs or client-side code
- Validate all inputs, even with backend validation
- Use HTTPS everywhere

In my healthcare project, security is especially important due to
patient data. We implemented row-level security, audit logging,
and strict CSP policies."
```

---

## Session 3: Practice - Design Autocomplete (1h)

### Problem Statement

```
Design an autocomplete/typeahead component for a search feature.
As the user types, suggestions should appear below the input.
```

### Step 1: Requirements (R)

**Clarifying Questions:**
```
- What's the data source? API or local data?
- How many suggestions to show?
- Should it support keyboard navigation?
- Do we need to highlight matching text?
- Mobile support?
- Debounce delay preference?
```

**Assumed Requirements:**
```
Functional:
- Fetch suggestions from API as user types
- Show max 10 suggestions
- Keyboard navigation (up/down/enter/escape)
- Click to select
- Highlight matching text

Non-Functional:
- Debounce 300ms
- Response time < 200ms
- Accessible (WCAG AA)
- Mobile responsive
```

### Step 2: Architecture (A)

```
┌─────────────────────────────────────────────────────────┐
│                  AutocompleteContainer                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              SearchInput                         │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │ <input>                                  │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              SuggestionList                      │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │ SuggestionItem (highlighted)            │   │   │
│  │  │ SuggestionItem                          │   │   │
│  │  │ SuggestionItem                          │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Data Model (D)

```typescript
// State
interface AutocompleteState {
  query: string;
  suggestions: Suggestion[];
  isOpen: boolean;
  highlightedIndex: number;
  isLoading: boolean;
  error: Error | null;
}

// Suggestion item
interface Suggestion {
  id: string;
  text: string;
  category?: string;
  metadata?: Record<string, any>;
}

// API
GET /api/search/suggestions?q={query}&limit=10

// Response
interface SuggestionsResponse {
  suggestions: Suggestion[];
  query: string;
}
```

### Step 4: Interface (I)

```typescript
// Main component
interface AutocompleteProps {
  onSelect: (suggestion: Suggestion) => void;
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
}

// Input component
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  placeholder?: string;
  ariaProps: AriaAttributes;
}

// List component
interface SuggestionListProps {
  suggestions: Suggestion[];
  highlightedIndex: number;
  onSelect: (suggestion: Suggestion) => void;
  onHighlight: (index: number) => void;
  query: string;  // For highlighting matches
}
```

### Step 5: Implementation

```jsx
function Autocomplete({ onSelect, placeholder, debounceMs = 300 }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Debounced search
  const debouncedQuery = useDebounce(query, debounceMs);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchSuggestions(debouncedQuery)
      .then(data => {
        if (!cancelled) {
          setSuggestions(data.suggestions);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (highlightedIndex >= 0) {
          e.preventDefault();
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.text);
    setIsOpen(false);
    onSelect(suggestion);
  };

  // Click outside to close
  useOnClickOutside(listRef, () => setIsOpen(false));

  return (
    <div className="autocomplete" ref={listRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="suggestion-list"
        aria-activedescendant={
          highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
        }
      />

      {isLoading && <span className="loading-indicator" />}

      {isOpen && suggestions.length > 0 && (
        <ul
          id="suggestion-list"
          role="listbox"
          className="suggestion-list"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              className={index === highlightedIndex ? 'highlighted' : ''}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <HighlightMatch text={suggestion.text} query={query} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Highlight matching text
function HighlightMatch({ text, query }) {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}
```

### Step 6: Optimizations (O)

```
Performance:
□ Debounce API calls (300ms)
□ Cancel in-flight requests on new input
□ Cache recent queries
□ Virtualize list if > 100 items

Accessibility:
□ ARIA combobox pattern
□ Keyboard navigation
□ Screen reader announcements
□ Focus management

Edge Cases:
□ Empty results message
□ Error state with retry
□ Loading indicator
□ Very long suggestion text (truncate)
□ Special characters in query
```

---

## Session 4: Practice - Design News Feed (1h)

### Problem Statement

```
Design a news feed like Facebook or Twitter.
Users can view posts, like, comment, and share.
```

### Step 1: Requirements (R)

**Clarifying Questions:**
```
- Infinite scroll or pagination?
- Real-time updates for new posts?
- What content types? (text, images, videos)
- Nested comments or flat?
- Optimistic updates for likes?
```

**Assumed Requirements:**
```
Functional:
- Infinite scroll feed
- Posts with text, images, videos
- Like/unlike posts
- View comments (flat list)
- Create new posts

Non-Functional:
- Load time < 2s
- Smooth scrolling (60fps)
- Optimistic updates
- Offline indicator
- WCAG AA accessible
```

### Step 2: Architecture (A)

```
┌─────────────────────────────────────────────────────────────────┐
│                           FeedPage                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CreatePostBox                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    FeedContainer                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  VirtualizedList                                 │   │   │
│  │  │  ┌─────────────────────────────────────────┐   │   │   │
│  │  │  │ PostCard                                 │   │   │   │
│  │  │  │  - PostHeader (author, time)            │   │   │   │
│  │  │  │  - PostContent (text, media)            │   │   │   │
│  │  │  │  - PostActions (like, comment, share)   │   │   │   │
│  │  │  └─────────────────────────────────────────┘   │   │   │
│  │  │  ┌─────────────────────────────────────────┐   │   │   │
│  │  │  │ PostCard                                 │   │   │   │
│  │  │  └─────────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ LoadMoreTrigger (Intersection Observer)         │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

State Management:
┌─────────────────────────────────────────────────────────────────┐
│  React Query                    │  Zustand                      │
│  - Feed posts (cached)          │  - Current user               │
│  - Post details                 │  - UI state (modals)          │
│  - Comments                     │  - Draft post                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Data Model (D)

```typescript
interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  content: string;
  media: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
  }>;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
}

// API Endpoints
GET  /api/feed?cursor={cursor}&limit=20
POST /api/posts
POST /api/posts/{id}/like
DELETE /api/posts/{id}/like
GET  /api/posts/{id}/comments
POST /api/posts/{id}/comments
```

### Step 4: Implementation Highlights

```jsx
// Feed with React Query + Infinite Scroll
function FeedContainer() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => fetchFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  if (isLoading) return <FeedSkeleton />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="feed">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}

      <div ref={loadMoreRef}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
}

// Optimistic Like
function useToggleLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isLiked: boolean) =>
      isLiked ? unlikePost(postId) : likePost(postId),

    onMutate: async (isLiked) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot previous value
      const previousFeed = queryClient.getQueryData(['feed']);

      // Optimistically update
      queryClient.setQueryData(['feed'], (old) => ({
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          posts: page.posts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !isLiked,
                  likeCount: post.likeCount + (isLiked ? -1 : 1),
                }
              : post
          ),
        })),
      }));

      return { previousFeed };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['feed'], context.previousFeed);
    },
  });
}
```

### Step 5: Optimizations (O)

```
Performance:
□ Virtualized list (react-window) for smooth scrolling
□ Image lazy loading with blur placeholder
□ Video poster images, load on interaction
□ Skeleton loading for perceived performance
□ Optimistic updates for instant feedback

Accessibility:
□ Semantic article elements for posts
□ Alt text for all images
□ Keyboard navigation through feed
□ Focus management for modals
□ Announce new posts to screen readers

Edge Cases:
□ Empty feed state
□ Post with very long text (expand/collapse)
□ Failed media loading
□ Network offline indicator
□ Pull-to-refresh on mobile
```

---

## Day 3 Checklist

```
□ Memorize RADIO framework
□ Can explain each step in English
□ Understand state management strategies
□ Know rendering patterns (CSR, SSR, SSG, ISR)
□ Practiced Autocomplete design
□ Practiced News Feed design
□ Can draw architecture diagrams
□ Know accessibility requirements
```

---

## Quick Reference: System Design Template

```markdown
## 1. Requirements (5 min)
- Ask clarifying questions
- List functional requirements
- List non-functional requirements

## 2. Architecture (10 min)
- Draw high-level component diagram
- Explain component responsibilities
- Show data flow

## 3. Data Model (5 min)
- Define state structure
- Define API contracts
- Explain caching strategy

## 4. Interface (5 min)
- Define component props
- Explain event handling
- Show composition pattern

## 5. Optimizations (5 min)
- Performance optimizations
- Accessibility considerations
- Edge cases handling
```

---

**End of Day 3 - Tomorrow: More System Design Practice + Next.js 14 Deep Dive!**
