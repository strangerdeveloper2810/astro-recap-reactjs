# 4. Performance & Optimization

[← Quay lại README](./README.md)

---

## Q4.1: Khi nào dùng React.memo, useMemo, useCallback?

**Độ khó:** Senior

### Câu trả lời:

### Decision Flowchart:

```
┌─────────────────────────────────────────────────────────────┐
│          WHEN TO USE MEMOIZATION                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   React.memo - Memoize COMPONENT                            │
│   ─────────────────────────────                              │
│   Use when:                                                  │
│   • Component renders often with same props                  │
│   • Component is expensive to render                         │
│   • Parent re-renders frequently                             │
│                                                              │
│   const MemoizedChild = React.memo(Child);                   │
│                                                              │
│   useMemo - Memoize VALUE                                    │
│   ───────────────────────                                    │
│   Use when:                                                  │
│   • Expensive calculation on every render                    │
│   • Creating objects/arrays passed to memoized children      │
│   • Derived state that's expensive to compute                │
│                                                              │
│   const sorted = useMemo(() => items.sort(), [items]);       │
│                                                              │
│   useCallback - Memoize FUNCTION                             │
│   ──────────────────────────────                             │
│   Use when:                                                  │
│   • Passing callback to memoized child component             │
│   • Callback is dependency of other hooks                    │
│   • Function identity matters (event handlers in lists)      │
│                                                              │
│   const handleClick = useCallback(() => {}, [deps]);         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Examples:

```javascript
// ❌ WRONG - Unnecessary memoization
function BadExample({ items }) {
  // useMemo for simple operation - overhead > benefit
  const length = useMemo(() => items.length, [items]);

  // useCallback without memoized consumer
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <button onClick={handleClick}>{length}</button>;
}

// ✅ RIGHT - Appropriate memoization
function GoodExample({ items, onItemSelect }) {
  // useMemo for expensive operation
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [items]);

  // useCallback because MemoizedList is memoized
  const handleSelect = useCallback((id) => {
    onItemSelect(id);
  }, [onItemSelect]);

  return <MemoizedList items={sortedItems} onSelect={handleSelect} />;
}

const MemoizedList = React.memo(function List({ items, onSelect }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => onSelect(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});
```

### React.memo with Custom Comparison:

```javascript
const UserCard = React.memo(
  function UserCard({ user, onEdit }) {
    return (
      <div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <button onClick={() => onEdit(user.id)}>Edit</button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    // Return false to re-render
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.name === nextProps.user.name &&
      prevProps.user.email === nextProps.user.email
      // Note: We don't compare onEdit because it should be stable
    );
  }
);
```

### Common Mistakes:

```javascript
// ❌ MISTAKE 1: Creating object in render
function Parent() {
  const [count, setCount] = useState(0);

  // New object every render - breaks memoization
  const config = { color: 'blue', size: 'large' };

  return <MemoizedChild config={config} />;
}

// ✅ FIX 1: useMemo for objects
function Parent() {
  const [count, setCount] = useState(0);

  const config = useMemo(() => ({
    color: 'blue',
    size: 'large'
  }), []);

  return <MemoizedChild config={config} />;
}

// ❌ MISTAKE 2: Inline function prop
function Parent() {
  return (
    <MemoizedChild
      onClick={() => console.log('click')} // New function every render
    />
  );
}

// ✅ FIX 2: useCallback
function Parent() {
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);

  return <MemoizedChild onClick={handleClick} />;
}

// ❌ MISTAKE 3: Spreading props
function Parent(props) {
  return <MemoizedChild {...props} />; // Hard to track what changes
}

// ✅ FIX 3: Explicit props
function Parent({ name, onClick }) {
  return <MemoizedChild name={name} onClick={onClick} />;
}
```

---

## Q4.2: Virtual Scrolling / Windowing?

**Độ khó:** Senior

### Câu trả lời:

### Concept:

```
┌─────────────────────────────────────────────────────────────┐
│                    VIRTUAL SCROLLING                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   TRADITIONAL (10,000 items)                                 │
│   ┌─────────────────────┐                                   │
│   │ Item 1              │ ← Rendered                        │
│   │ Item 2              │ ← Rendered                        │
│   │ Item 3              │ ← Rendered                        │
│   │ ...                 │                                    │
│   │ Item 10,000         │ ← Rendered (ALL in DOM!)          │
│   └─────────────────────┘                                   │
│   Problem: 10,000 DOM nodes = SLOW                          │
│                                                              │
│   VIRTUAL (10,000 items, 20 visible)                        │
│   ┌─────────────────────┐                                   │
│   │ ░░░░░░░░░░░░░░░░░░░ │ ← Spacer (empty div)              │
│   │ Item 50             │ ← Rendered (visible)              │
│   │ Item 51             │ ← Rendered (visible)              │
│   │ Item 52             │ ← Rendered (visible)              │
│   │ ...                 │   (only ~25 items rendered)       │
│   │ Item 70             │ ← Rendered (visible)              │
│   │ ░░░░░░░░░░░░░░░░░░░ │ ← Spacer (empty div)              │
│   └─────────────────────┘                                   │
│   Only 25 DOM nodes regardless of list size!                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Implementation with @tanstack/react-virtual:

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated item height
    overscan: 5, // Render 5 extra items above/below viewport
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: '400px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Virtual Grid:

```javascript
function VirtualGrid({ items, columns = 4 }) {
  const parentRef = useRef(null);
  const rowCount = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 2,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 1,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: '600px',
        width: '800px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: `${columnVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <React.Fragment key={virtualRow.key}>
            {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
              const index = virtualRow.index * columns + virtualColumn.index;
              if (index >= items.length) return null;

              return (
                <div
                  key={virtualColumn.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${virtualColumn.size}px`,
                    height: `${virtualRow.size}px`,
                    transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                  }}
                >
                  <ProductCard product={items[index]} />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
```

### Infinite Scroll with Virtual List:

```javascript
function InfiniteVirtualList({ fetchNextPage, hasNextPage, isFetching }) {
  const parentRef = useRef(null);
  const [items, setItems] = useState([]);

  const virtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Check if we need to load more
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem) return;

    if (
      lastItem.index >= items.length - 1 &&
      hasNextPage &&
      !isFetching
    ) {
      fetchNextPage();
    }
  }, [virtualItems, hasNextPage, isFetching, items.length, fetchNextPage]);

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index > items.length - 1;

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                hasNextPage ? 'Loading more...' : 'Nothing more to load'
              ) : (
                <Item data={items[virtualRow.index]} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Q4.3: Code Splitting và Lazy Loading?

**Độ khó:** Mid-Senior

### Câu trả lời:

### Code Splitting Strategies:

```
┌─────────────────────────────────────────────────────────────┐
│                CODE SPLITTING STRATEGIES                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. ROUTE-BASED SPLITTING                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  main.js ─────▶ [Home, Header, Footer]              │   │
│   │  about.chunk.js ─────▶ [About page]                 │   │
│   │  dashboard.chunk.js ─────▶ [Dashboard + charts]     │   │
│   │  admin.chunk.js ─────▶ [Admin panel]                │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   2. COMPONENT-BASED SPLITTING                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Heavy components loaded on demand:                  │   │
│   │  • Rich text editor                                  │   │
│   │  • Chart library                                     │   │
│   │  • Image gallery                                     │   │
│   │  • PDF viewer                                        │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   3. LIBRARY SPLITTING                                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  vendors.js ─────▶ [React, ReactDOM]                │   │
│   │  charts.chunk.js ─────▶ [Chart.js]                  │   │
│   │  moment.chunk.js ─────▶ [Moment.js]                 │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Route-Based Code Splitting:

```javascript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

// Named exports need different syntax
const Admin = lazy(() =>
  import('./pages/Admin').then(module => ({ default: module.AdminPage }))
);

// With prefetch hint
const Products = lazy(() =>
  import(/* webpackPrefetch: true */ './pages/Products')
);

// With preload hint
const Checkout = lazy(() =>
  import(/* webpackPreload: true */ './pages/Checkout')
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/products" element={<Products />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Component-Based Lazy Loading:

```javascript
const HeavyChart = lazy(() => import('./components/HeavyChart'));
const RichTextEditor = lazy(() => import('./components/RichTextEditor'));
const ImageGallery = lazy(() => import('./components/ImageGallery'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      <button onClick={() => setShowEditor(true)}>Show Editor</button>

      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart data={chartData} />
        </Suspense>
      )}

      {showEditor && (
        <Suspense fallback={<EditorSkeleton />}>
          <RichTextEditor />
        </Suspense>
      )}
    </div>
  );
}
```

### Preloading on Hover:

```javascript
function NavigationLink({ to, children }) {
  const preloadComponent = () => {
    // Trigger lazy import on hover
    switch (to) {
      case '/dashboard':
        import('./pages/Dashboard');
        break;
      case '/settings':
        import('./pages/Settings');
        break;
      case '/profile':
        import('./pages/Profile');
        break;
    }
  };

  return (
    <Link
      to={to}
      onMouseEnter={preloadComponent}
      onFocus={preloadComponent}
    >
      {children}
    </Link>
  );
}
```

### Error Boundary for Lazy Components:

```javascript
class LazyErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Failed to load component</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={this.retry}>Retry</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<LazyErrorBoundary>
  <Suspense fallback={<Loading />}>
    <LazyComponent />
  </Suspense>
</LazyErrorBoundary>
```

---

## Q4.4: Image Optimization Techniques?

**Độ khó:** Mid-Senior

### Câu trả lời:

### Image Optimization Strategies:

```javascript
// 1. Lazy Loading Images
function LazyImage({ src, alt, placeholder }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="image-container">
      {!isLoaded && <div className="placeholder">{placeholder}</div>}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
}

// 2. Responsive Images with srcset
function ResponsiveImage({ src, alt }) {
  return (
    <img
      src={`${src}-800w.jpg`}
      srcSet={`
        ${src}-400w.jpg 400w,
        ${src}-800w.jpg 800w,
        ${src}-1200w.jpg 1200w,
        ${src}-1600w.jpg 1600w
      `}
      sizes="(max-width: 400px) 400px,
             (max-width: 800px) 800px,
             (max-width: 1200px) 1200px,
             1600px"
      alt={alt}
      loading="lazy"
    />
  );
}

// 3. Next.js Image Component (if using Next.js)
import Image from 'next/image';

function OptimizedImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      priority={false} // Set true for above-the-fold images
    />
  );
}

// 4. Progressive Image Loading
function ProgressiveImage({ lowQualitySrc, highQualitySrc, alt }) {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = highQualitySrc;
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsLoaded(true);
    };
  }, [highQualitySrc]);

  return (
    <img
      src={src}
      alt={alt}
      className={isLoaded ? 'loaded' : 'loading'}
      style={{
        filter: isLoaded ? 'none' : 'blur(10px)',
        transition: 'filter 0.3s ease-out',
      }}
    />
  );
}
```

### Image Format Selection:

```
┌─────────────────────────────────────────────────────────────┐
│                  IMAGE FORMAT SELECTION                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   FORMAT      USE CASE                    BROWSER SUPPORT    │
│   ──────      ────────                    ───────────────    │
│   WebP        Photos, complex images      95%+               │
│   AVIF        Next-gen, best compression  75%+               │
│   SVG         Icons, logos, illustrations 99%+               │
│   PNG         Transparency needed         99%+               │
│   JPEG        Photos (fallback)           99%+               │
│                                                              │
│   <picture>                                                  │
│     <source srcset="img.avif" type="image/avif">            │
│     <source srcset="img.webp" type="image/webp">            │
│     <img src="img.jpg" alt="...">                           │
│   </picture>                                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Q4.5: Web Vitals (LCP, FID, CLS)?

**Độ khó:** Senior

### Câu trả lời:

### Core Web Vitals:

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE WEB VITALS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   LCP (Largest Contentful Paint)                            │
│   ─────────────────────────────────                          │
│   Measures: Loading performance                              │
│   Target: < 2.5 seconds                                      │
│   What: Time until largest content element visible           │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ 0s        1s        2s        2.5s       4s          │  │
│   │ |─────────|─────────|─────────|─────────|            │  │
│   │ [  GOOD  ][ NEEDS IMPROVEMENT ][ POOR  ]             │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
│   FID (First Input Delay) → INP (Interaction to Next Paint) │
│   ────────────────────────────────────────────────────────   │
│   Measures: Interactivity                                    │
│   Target: < 100ms (FID) / < 200ms (INP)                     │
│   What: Time from user interaction to response               │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ 0ms      100ms     200ms     300ms      500ms        │  │
│   │ |─────────|─────────|─────────|─────────|            │  │
│   │ [ GOOD  ][NEEDS IMPROVE][   POOR   ]                 │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
│   CLS (Cumulative Layout Shift)                              │
│   ─────────────────────────────                              │
│   Measures: Visual stability                                 │
│   Target: < 0.1                                              │
│   What: How much content shifts unexpectedly                 │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ 0        0.1       0.25      0.5       1.0           │  │
│   │ |─────────|─────────|─────────|─────────|            │  │
│   │ [ GOOD  ][NEEDS IMPROVE][   POOR   ]                 │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Measuring Web Vitals:

```javascript
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    delta: metric.delta,
    id: metric.id,
  });

  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true });
  }
}

// Measure all Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getFCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Optimizing LCP:

```javascript
// 1. Preload critical resources
<link rel="preload" href="/hero-image.webp" as="image" />
<link rel="preload" href="/main-font.woff2" as="font" crossOrigin />

// 2. Priority hints for images
<img src="/hero.jpg" fetchpriority="high" alt="Hero" />

// 3. Optimize server response
// - Use CDN
// - Enable caching
// - Compress responses

// 4. Remove render-blocking resources
<link rel="stylesheet" href="/critical.css" />
<link rel="preload" href="/non-critical.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'" />
```

### Optimizing CLS:

```javascript
// 1. Reserve space for images
function ImageWithDimensions({ src, alt, width, height }) {
  return (
    <div style={{ aspectRatio: `${width} / ${height}` }}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
      />
    </div>
  );
}

// 2. Reserve space for ads/embeds
function AdSlot() {
  return (
    <div style={{ minHeight: '250px', minWidth: '300px' }}>
      <AdComponent />
    </div>
  );
}

// 3. Avoid inserting content above existing content
function NotificationBanner({ message }) {
  // Use transform instead of affecting layout
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        transform: message ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s',
      }}
    >
      {message}
    </div>
  );
}

// 4. Use CSS contain
.card {
  contain: layout; /* Isolate layout calculations */
}
```

### Optimizing FID/INP:

```javascript
// 1. Break up long tasks
function processLargeArray(items) {
  const CHUNK_SIZE = 100;
  let index = 0;

  function processChunk() {
    const chunk = items.slice(index, index + CHUNK_SIZE);
    chunk.forEach(processItem);
    index += CHUNK_SIZE;

    if (index < items.length) {
      // Yield to browser between chunks
      setTimeout(processChunk, 0);
    }
  }

  processChunk();
}

// 2. Use requestIdleCallback for non-critical work
function deferNonCriticalWork(work) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(work, { timeout: 2000 });
  } else {
    setTimeout(work, 200);
  }
}

// 3. Web Workers for heavy computation
const worker = new Worker('/heavy-computation.js');
worker.postMessage(data);
worker.onmessage = (e) => {
  setResult(e.data);
};

// 4. Debounce expensive event handlers
const handleScroll = useMemo(
  () => debounce((e) => {
    // Expensive scroll handling
  }, 100),
  []
);
```

---

## Q4.6: React DevTools Profiler?

**Độ khó:** Mid-Senior

### Câu trả lời:

### Using React Profiler:

```javascript
import { Profiler } from 'react';

function onRenderCallback(
  id,                   // Profiler tree "id"
  phase,                // "mount" or "update"
  actualDuration,       // Time spent rendering
  baseDuration,         // Estimated time without memoization
  startTime,            // When React started rendering
  commitTime,           // When React committed
  interactions          // Set of interactions
) {
  // Log or send to analytics
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });

  // Track slow renders
  if (actualDuration > 16) { // More than 1 frame
    reportSlowRender(id, actualDuration);
  }
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Profiler id="MainContent" onRender={onRenderCallback}>
        <MainContent />
      </Profiler>
      <Footer />
    </Profiler>
  );
}
```

### Why Did You Render:

```javascript
// In development only
import whyDidYouRender from '@welldone-software/why-did-you-render';

if (process.env.NODE_ENV === 'development') {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
    logOnDifferentValues: true,
  });
}

// Mark specific components
const MyComponent = () => { /* ... */ };
MyComponent.whyDidYouRender = true;

// Or with options
MyComponent.whyDidYouRender = {
  logOnDifferentValues: true,
  customName: 'MyComponent'
};
```

### Custom Performance Hooks:

```javascript
// Hook to measure render count
function useRenderCount(componentName) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });

  return renderCount.current;
}

// Hook to measure render time
function useRenderTime(componentName) {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;

    if (duration > 16) {
      console.warn(`${componentName} slow render: ${duration.toFixed(2)}ms`);
    }

    startTime.current = performance.now();
  });
}

// Hook to track prop changes
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};

      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// Usage
function MyComponent(props) {
  useWhyDidYouUpdate('MyComponent', props);
  useRenderTime('MyComponent');
  // ...
}
```

---

## Q4.7: Bundle Size Optimization?

**Độ khó:** Senior

### Câu trả lời:

### Bundle Analysis:

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html',
    }),
  ],
};

// For Vite
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
    }),
  ],
};
```

### Tree Shaking:

```javascript
// ❌ BAD - Imports entire library
import _ from 'lodash';
const result = _.get(obj, 'path');

// ✅ GOOD - Import only what you need
import get from 'lodash/get';
const result = get(obj, 'path');

// ✅ BETTER - Use lodash-es for tree shaking
import { get } from 'lodash-es';

// ❌ BAD - Named exports prevent tree shaking in some cases
export * from './utils';

// ✅ GOOD - Explicit named exports
export { formatDate, formatCurrency } from './utils';
```

### Dynamic Imports:

```javascript
// Split heavy libraries
async function loadChart() {
  const { Chart } = await import('chart.js');
  return Chart;
}

// Conditional loading
if (userNeedsEditor) {
  const { Editor } = await import('./RichTextEditor');
  renderEditor(Editor);
}

// Route-based splitting
const routes = {
  '/dashboard': () => import('./pages/Dashboard'),
  '/settings': () => import('./pages/Settings'),
  '/admin': () => import('./pages/Admin'),
};
```

### Webpack Optimization:

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true, // Tree shaking
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunk
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        // React chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        // Common chunk
        common: {
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

---

## Q4.8: Memory Leaks Prevention?

**Độ khó:** Senior

### Câu trả lời:

### Common Memory Leak Patterns:

```javascript
// ❌ LEAK 1: Forgotten cleanup
function Component() {
  useEffect(() => {
    const handler = () => console.log('scroll');
    window.addEventListener('scroll', handler);
    // Missing cleanup!
  }, []);
}

// ✅ FIX
function Component() {
  useEffect(() => {
    const handler = () => console.log('scroll');
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
}

// ❌ LEAK 2: Stale closure in timer
function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData().then(setData);
    }, 5000);
    // If component unmounts, interval keeps running
  }, []);
}

// ✅ FIX
function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      fetchData().then((result) => {
        if (mounted) setData(result);
      });
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
}

// ❌ LEAK 3: Unhandled async operations
function Component({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
    // If userId changes before fetch completes,
    // old request's setUser still runs
  }, [userId]);
}

// ✅ FIX with AbortController
function Component({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchUser(userId, { signal: controller.signal })
      .then(setUser)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, [userId]);
}

// ❌ LEAK 4: Closure holding large data
function Component() {
  const largeData = useMemo(() => generateLargeData(), []);

  const handleClick = useCallback(() => {
    // This closure holds reference to largeData
    // even if we only need a small part
    console.log(largeData.items[0].name);
  }, [largeData]);
}

// ✅ FIX
function Component() {
  const largeData = useMemo(() => generateLargeData(), []);
  const firstItemName = useMemo(() => largeData.items[0].name, [largeData]);

  const handleClick = useCallback(() => {
    console.log(firstItemName);
  }, [firstItemName]);
}
```

### Memory Leak Detection:

```javascript
// Custom hook for detecting leaks
function useMemoryLeakDetection(componentName) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} mounted`);

      return () => {
        console.log(`${componentName} unmounted`);
        // Check for any lingering references
      };
    }
  }, [componentName]);
}

// Using Chrome DevTools
// 1. Open DevTools → Memory tab
// 2. Take heap snapshot before action
// 3. Perform action (mount/unmount component)
// 4. Take heap snapshot after
// 5. Compare snapshots to find leaked objects
```

---

## Q4.9: Server-Side Rendering (SSR) Performance?

**Độ khó:** Senior

### Câu trả lời:

### SSR vs CSR vs SSG:

```
┌─────────────────────────────────────────────────────────────┐
│              RENDERING STRATEGIES COMPARISON                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   CSR (Client-Side Rendering)                                │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Server ──▶ Empty HTML + JS ──▶ Browser renders      │   │
│   │                                                      │   │
│   │ Pros: Simple, cheap hosting                          │   │
│   │ Cons: Slow initial load, poor SEO                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   SSR (Server-Side Rendering)                                │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Request ──▶ Server renders ──▶ Full HTML + JS       │   │
│   │                                                      │   │
│   │ Pros: Fast FCP, good SEO                             │   │
│   │ Cons: Server load, TTFB delay                        │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   SSG (Static Site Generation)                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Build time ──▶ Pre-render ──▶ CDN serves static     │   │
│   │                                                      │   │
│   │ Pros: Fastest, cheapest, most reliable               │   │
│   │ Cons: Build time, stale content                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   ISR (Incremental Static Regeneration)                      │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Best of SSG + SSR: Static with background refresh   │   │
│   │                                                      │   │
│   │ Pros: Fast + fresh content                           │   │
│   │ Cons: Complexity, hosting requirements               │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Next.js SSR Optimization:

```javascript
// pages/products/[id].js

// Option 1: getServerSideProps (SSR)
export async function getServerSideProps({ params, res }) {
  // Set cache headers
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );

  const product = await fetchProduct(params.id);

  return {
    props: { product },
  };
}

// Option 2: getStaticProps + getStaticPaths (SSG)
export async function getStaticPaths() {
  const products = await fetchTopProducts();

  return {
    paths: products.map((p) => ({ params: { id: p.id } })),
    fallback: 'blocking', // Generate on-demand for other IDs
  };
}

export async function getStaticProps({ params }) {
  const product = await fetchProduct(params.id);

  return {
    props: { product },
    revalidate: 60, // ISR: Regenerate every 60 seconds
  };
}

// Option 3: React Server Components (Next.js 13+)
// app/products/[id]/page.tsx
async function ProductPage({ params }) {
  // This runs on the server
  const product = await fetchProduct(params.id);

  return (
    <div>
      <ProductDetails product={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />
      </Suspense>
    </div>
  );
}
```

---

## Q4.10: Debounce và Throttle?

**Độ khó:** Mid-Senior

### Câu trả lời:

### Debounce vs Throttle:

```
┌─────────────────────────────────────────────────────────────┐
│              DEBOUNCE vs THROTTLE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   DEBOUNCE                                                   │
│   ─────────                                                  │
│   Wait until user stops, then execute once                   │
│                                                              │
│   Events:  ─●─●─●─●─────────────●─●─●─●─────────            │
│   Calls:   ──────────────────●──────────────────●            │
│                              ↑                  ↑            │
│                         delay elapsed      delay elapsed     │
│                                                              │
│   Use case: Search input, resize handler, form validation    │
│                                                              │
│   THROTTLE                                                   │
│   ─────────                                                  │
│   Execute at most once per interval                          │
│                                                              │
│   Events:  ─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─                   │
│   Calls:   ─●─────●─────●─────●─────●─────                   │
│            ↑     ↑     ↑     ↑     ↑                         │
│         fixed interval between calls                         │
│                                                              │
│   Use case: Scroll handler, mousemove, progress update       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Custom Hooks:

```javascript
// useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}

// useDebouncedCallback hook
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debouncedFn = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        callbackRef.current(...args);
      }, delay),
    [delay]
  );

  useEffect(() => {
    return () => debouncedFn.cancel();
  }, [debouncedFn]);

  return debouncedFn as T;
}

// useThrottle hook
function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// Usage
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 100);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use throttledScrollY for expensive operations
  useEffect(() => {
    updateScrollIndicator(throttledScrollY);
  }, [throttledScrollY]);

  return <ScrollIndicator position={throttledScrollY} />;
}
```

---

[← Quay lại: State Management](./03-state-management.md) | [Tiếp theo: Architecture & Design Patterns →](./05-architecture-patterns.md)
