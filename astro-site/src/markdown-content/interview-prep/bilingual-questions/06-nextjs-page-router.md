# Next.js Page Router Interview Questions / Cau hoi phong van Next.js Page Router

---

## 1. What is the pages directory in Next.js? / Thu muc pages trong Next.js la gi?

**EN:** The `pages/` directory is the core of Page Router. Each file becomes a route automatically. `pages/about.js` creates `/about` route.

```
pages/
  index.js      → /
  about.js      → /about
  blog/
    index.js    → /blog
    [slug].js   → /blog/:slug
```

**VI:** Thu muc `pages/` la core cua Page Router. Moi file tu dong tro thanh mot route. `pages/about.js` tao route `/about`.

---

## 2. How does file-based routing work? / File-based routing hoat dong nhu the nao?

**EN:** Next.js automatically creates routes based on file structure in `pages/`. No need for route configuration. Nested folders create nested routes.

```javascript
// pages/products/[category]/[id].js
// URL: /products/electronics/123
export default function Product({ params }) {
  // category = "electronics", id = "123"
}
```

**VI:** Next.js tu dong tao routes dua tren cau truc file trong `pages/`. Khong can cau hinh route. Thu muc long nhau tao nested routes.

---

## 3. How to create dynamic routes with [id].js? / Tao dynamic routes voi [id].js nhu the nao?

**EN:** Use square brackets for dynamic segments. Access params via `router.query` or data fetching methods.

```javascript
// pages/posts/[id].js
import { useRouter } from 'next/router';

export default function Post() {
  const router = useRouter();
  const { id } = router.query; // id from URL
  return <div>Post: {id}</div>;
}
```

**VI:** Dung dau ngoac vuong cho dynamic segments. Truy cap params qua `router.query` hoac cac phuong thuc fetch data.

---

## 4. What is getStaticProps? / getStaticProps la gi?

**EN:** `getStaticProps` fetches data at build time for Static Site Generation (SSG). Page is pre-rendered as static HTML.

```javascript
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  return {
    props: { posts }, // passed to page component
  };
}
```

**VI:** `getStaticProps` fetch data tai thoi diem build cho Static Site Generation (SSG). Trang duoc pre-render thanh HTML tinh.

---

## 5. What is getStaticPaths? / getStaticPaths la gi?

**EN:** `getStaticPaths` defines which dynamic routes to pre-render at build time. Required for dynamic routes using `getStaticProps`.

```javascript
export async function getStaticPaths() {
  const posts = await fetchAllPosts();

  return {
    paths: posts.map(post => ({ params: { id: post.id } })),
    fallback: false, // 404 for unknown paths
  };
}
```

**VI:** `getStaticPaths` dinh nghia dynamic routes nao se duoc pre-render luc build. Bat buoc cho dynamic routes dung `getStaticProps`.

---

## 6. What are fallback options in getStaticPaths? / Cac tuy chon fallback trong getStaticPaths la gi?

**EN:**
- `false`: Returns 404 for paths not in `paths` array
- `true`: Shows fallback page, then generates and caches the page
- `'blocking'`: SSR on first request, then caches like static

```javascript
return {
  paths: [...],
  fallback: 'blocking', // Best for SEO
};
```

**VI:**
- `false`: Tra ve 404 cho paths khong co trong mang `paths`
- `true`: Hien thi fallback page, sau do generate va cache trang
- `'blocking'`: SSR lan dau, sau do cache nhu static

---

## 7. What is getServerSideProps? / getServerSideProps la gi?

**EN:** `getServerSideProps` fetches data on every request (SSR). Use for dynamic data that changes frequently or requires request context.

```javascript
export async function getServerSideProps(context) {
  const { req, res, params, query } = context;
  const data = await fetchData(params.id);

  return {
    props: { data },
  };
}
```

**VI:** `getServerSideProps` fetch data moi request (SSR). Dung cho data dong thay doi thuong xuyen hoac can request context.

---

## 8. When to use SSG vs SSR? / Khi nao dung SSG vs SSR?

**EN:**
- **SSG (getStaticProps)**: Blog posts, docs, marketing pages - content rarely changes
- **SSR (getServerSideProps)**: User dashboards, real-time data, personalized content

**VI:**
- **SSG (getStaticProps)**: Blog posts, docs, marketing pages - noi dung it thay doi
- **SSR (getServerSideProps)**: User dashboards, du lieu real-time, noi dung ca nhan hoa

---

## 9. How to redirect or return 404 in getServerSideProps? / Cach redirect hoac tra ve 404 trong getServerSideProps?

**EN:** Return `redirect` or `notFound` objects instead of props.

```javascript
export async function getServerSideProps(context) {
  const user = await getUser(context.req);

  if (!user) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  if (!user.hasAccess) {
    return { notFound: true };
  }

  return { props: { user } };
}
```

**VI:** Tra ve object `redirect` hoac `notFound` thay vi props.

---

## 10. What is ISR (Incremental Static Regeneration)? / ISR la gi?

**EN:** ISR allows updating static pages after build without rebuilding entire site. Combines benefits of SSG (fast) and SSR (fresh data).

```javascript
export async function getStaticProps() {
  const data = await fetchData();

  return {
    props: { data },
    revalidate: 60, // Regenerate every 60 seconds
  };
}
```

**VI:** ISR cho phep cap nhat trang static sau khi build ma khong can rebuild toan bo site. Ket hop loi ich cua SSG (nhanh) va SSR (data moi).

---

## 11. How does revalidate work? / revalidate hoat dong nhu the nao?

**EN:** After `revalidate` seconds, Next.js serves stale page while regenerating in background. Next visitor gets updated page (stale-while-revalidate pattern).

```javascript
return {
  props: { products },
  revalidate: 10, // At most once every 10 seconds
};
```

**VI:** Sau `revalidate` giay, Next.js phuc vu trang cu trong khi regenerate o background. Visitor tiep theo nhan trang cap nhat (stale-while-revalidate pattern).

---

## 12. What is On-Demand Revalidation? / On-Demand Revalidation la gi?

**EN:** Manually trigger page regeneration via API route instead of time-based. Useful for CMS webhooks.

```javascript
// pages/api/revalidate.js
export default async function handler(req, res) {
  await res.revalidate('/blog/post-1');
  return res.json({ revalidated: true });
}
```

**VI:** Trigger regeneration thu cong qua API route thay vi theo thoi gian. Huu ich cho CMS webhooks.

---

## 13. How to fetch data on client-side? / Cach fetch data phia client?

**EN:** Use `useEffect` with fetch or data fetching libraries. Data is fetched after page loads in browser.

```javascript
import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(setUser);
  }, []);

  if (!user) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}
```

**VI:** Dung `useEffect` voi fetch hoac thu vien fetch data. Data duoc fetch sau khi trang load trong browser.

---

## 14. How to use SWR for data fetching? / Cach dung SWR de fetch data?

**EN:** SWR (stale-while-revalidate) by Vercel provides caching, revalidation, and real-time updates.

```javascript
import useSWR from 'swr';

const fetcher = url => fetch(url).then(res => res.json());

export default function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  return <div>{data.name}</div>;
}
```

**VI:** SWR (stale-while-revalidate) cua Vercel cung cap caching, revalidation, va cap nhat real-time.

---

## 15. How to integrate React Query with Next.js? / Cach tich hop React Query voi Next.js?

**EN:** Wrap app with QueryClientProvider and use hydration for SSR data.

```javascript
// pages/_app.js
import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Component {...pageProps} />
      </Hydrate>
    </QueryClientProvider>
  );
}
```

**VI:** Wrap app voi QueryClientProvider va dung hydration cho SSR data.

---

## 16. What is _app.js? / _app.js la gi?

**EN:** Custom App component that wraps all pages. Use for global layouts, state providers, global CSS, and persisting state between pages.

```javascript
// pages/_app.js
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
```

**VI:** Component App tuy chinh wrap tat ca pages. Dung cho global layouts, state providers, global CSS, va luu tru state giua cac pages.

---

## 17. What is _document.js? / _document.js la gi?

**EN:** Custom Document for modifying `<html>` and `<body>` tags. Only runs on server. Use for fonts, meta tags, or third-party scripts.

```javascript
// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/..." rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

**VI:** Document tuy chinh de sua the `<html>` va `<body>`. Chi chay tren server. Dung cho fonts, meta tags, hoac third-party scripts.

---

## 18. Difference between _app.js and _document.js? / Khac biet giua _app.js va _document.js?

**EN:**
- `_app.js`: Runs on client and server, wraps page component, use for layouts/providers
- `_document.js`: Server only, modifies HTML structure, runs once per request

**VI:**
- `_app.js`: Chay tren client va server, wrap page component, dung cho layouts/providers
- `_document.js`: Chi server, sua cau truc HTML, chay mot lan moi request

---

## 19. How to create API routes? / Cach tao API routes?

**EN:** Create files in `pages/api/`. Each file exports a handler function receiving `req` and `res`.

```javascript
// pages/api/users.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ users: ['John', 'Jane'] });
  } else if (req.method === 'POST') {
    const { name } = req.body;
    res.status(201).json({ created: name });
  }
}
```

**VI:** Tao files trong `pages/api/`. Moi file export handler function nhan `req` va `res`.

---

## 20. How to create dynamic API routes? / Cach tao dynamic API routes?

**EN:** Use bracket syntax like page routes. Access params via `req.query`.

```javascript
// pages/api/users/[id].js
export default function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return res.json({ id, name: 'User ' + id });
    case 'DELETE':
      return res.status(204).end();
    default:
      return res.status(405).end();
  }
}
```

**VI:** Dung cu phap dau ngoac nhu page routes. Truy cap params qua `req.query`.

---

## 21. Are API routes serverless functions? / API routes co phai serverless functions?

**EN:** Yes, when deployed to Vercel. Each API route becomes an independent serverless function. Consider cold starts and execution limits (10s default, 60s max on Vercel).

**VI:** Co, khi deploy len Vercel. Moi API route tro thanh mot serverless function doc lap. Can luu y cold starts va gioi han thuc thi (10s mac dinh, 60s toi da tren Vercel).

---

## 22. How to use next/link for navigation? / Cach dung next/link de dieuhuong?

**EN:** `Link` component enables client-side navigation with prefetching. Replaces `<a>` for internal links.

```javascript
import Link from 'next/link';

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href={`/posts/${postId}`}>Post</Link>
      <Link href="/dashboard" prefetch={false}>Dashboard</Link>
    </nav>
  );
}
```

**VI:** Component `Link` cho phep client-side navigation voi prefetching. Thay the `<a>` cho internal links.

---

## 23. How to use next/router for programmatic navigation? / Cach dung next/router de dieu huong?

**EN:** `useRouter` hook provides methods for programmatic navigation and accessing route info.

```javascript
import { useRouter } from 'next/router';

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async () => {
    await login();
    router.push('/dashboard'); // Navigate
    // router.replace('/dashboard'); // Replace history
    // router.back(); // Go back
  };

  // Access: router.query, router.pathname, router.asPath
}
```

**VI:** Hook `useRouter` cung cap cac methods de dieu huong va truy cap thong tin route.

---

## 24. How to pass query parameters with next/router? / Cach truyen query parameters voi next/router?

**EN:** Use object syntax with `pathname` and `query` for complex navigation.

```javascript
import { useRouter } from 'next/router';

export default function Search() {
  const router = useRouter();

  const handleSearch = (term) => {
    router.push({
      pathname: '/search',
      query: { q: term, page: 1 },
    });
    // Results in: /search?q=term&page=1
  };

  // Access: router.query.q, router.query.page
}
```

**VI:** Dung cu phap object voi `pathname` va `query` cho dieu huong phuc tap.

---

## 25. How does next/image optimize images? / next/image toi uu hoa anh nhu the nao?

**EN:** Automatic optimization: lazy loading, responsive sizes, modern formats (WebP/AVIF), prevents layout shift.

```javascript
import Image from 'next/image';

export default function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority // Disable lazy loading for LCP images
      placeholder="blur"
      blurDataURL="data:image/..."
    />
  );
}
```

**VI:** Tu dong toi uu: lazy loading, responsive sizes, format hien dai (WebP/AVIF), ngan layout shift.

---

## 26. How to use next/head for metadata? / Cach dung next/head cho metadata?

**EN:** `Head` component injects elements into page `<head>`. Last instance wins for duplicate tags.

```javascript
import Head from 'next/head';

export default function BlogPost({ post }) {
  return (
    <>
      <Head>
        <title>{post.title} | My Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:image" content={post.image} />
      </Head>
      <article>{post.content}</article>
    </>
  );
}
```

**VI:** Component `Head` chen elements vao `<head>` cua trang. Instance cuoi cung thang khi co tags trung lap.

---

## 27. How to add favicon and global meta tags? / Cach them favicon va global meta tags?

**EN:** Add in `_document.js` for site-wide tags, or `_app.js` with Head for defaults that pages can override.

```javascript
// pages/_document.js
<Head>
  <link rel="icon" href="/favicon.ico" />
  <meta name="theme-color" content="#000000" />
</Head>

// pages/_app.js
<Head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</Head>
```

**VI:** Them trong `_document.js` cho tags toan site, hoac `_app.js` voi Head cho mac dinh ma pages co the override.

---

## 28. How does Middleware work in Page Router? / Middleware hoat dong nhu the nao trong Page Router?

**EN:** Middleware runs before request completes. Use for auth, redirects, headers. Create `middleware.js` in root.

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

**VI:** Middleware chay truoc khi request hoan thanh. Dung cho auth, redirects, headers. Tao `middleware.js` o root.

---

## 29. How to implement authentication in Page Router? / Cach implement authentication trong Page Router?

**EN:** Combine `getServerSideProps` for server-side checks and middleware for route protection.

```javascript
// pages/dashboard.js
export async function getServerSideProps(context) {
  const session = await getSession(context.req);

  if (!session) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  return { props: { user: session.user } };
}

// Or use HOC pattern
export default withAuth(DashboardPage);
```

**VI:** Ket hop `getServerSideProps` cho kiem tra server-side va middleware cho bao ve route.

---

## 30. How to create protected routes pattern? / Cach tao pattern protected routes?

**EN:** Create a wrapper component or HOC that checks auth and redirects if unauthorized.

```javascript
// components/ProtectedRoute.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=' + router.asPath);
    }
  }, [user, loading, router]);

  if (loading || !user) return <div>Loading...</div>;
  return children;
}

// Usage in _app.js or individual pages
```

**VI:** Tao wrapper component hoac HOC kiem tra auth va redirect neu khong co quyen.

---

## 31. How to customize _document.js for advanced use cases? / Cach tuy chinh _document.js cho cac truong hop nang cao?

**EN:** `_document.js` controls the HTML shell. Use for custom fonts, lang attribute, body classes, or injecting scripts.

```javascript
// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        {/* Preload fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Meta tags that don't change */}
        <meta name="theme-color" content="#000000" />
      </Head>
      <body className="antialiased">
        {/* Portal target for modals */}
        <div id="modal-root" />
        <Main />
        <NextScript />
        {/* Non-critical scripts */}
        <script src="/non-critical.js" defer />
      </body>
    </Html>
  );
}
```

**VI:** `_document.js` dieu khien HTML shell. Dung cho custom fonts, lang attribute, body classes, hoac inject scripts.

---

## 32. How to use _app.js for global state and layouts? / Cach dung _app.js cho global state va layouts?

**EN:** `_app.js` wraps all pages. Use for providers, global CSS, layout persistence, and page transitions.

```javascript
// pages/_app.js
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '../components/Layout';
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [queryClient] = useState(() => new QueryClient());

  // Per-page layouts
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {getLayout(<Component {...pageProps} />)}
      </QueryClientProvider>
    </SessionProvider>
  );
}

// In page component:
// Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
```

**VI:** `_app.js` wrap tat ca pages. Dung cho providers, global CSS, layout persistence, va page transitions.

---

## 33. How to create custom error pages with error boundaries? / Cach tao trang loi tuy chinh voi error boundaries?

**EN:** Combine `_error.js` with React Error Boundaries for comprehensive error handling.

```javascript
// pages/_error.js
function Error({ statusCode, hasGetInitialPropsRun, err }) {
  return (
    <div className="error-container">
      <h1>{statusCode || 'Client Error'}</h1>
      <p>{statusCode === 404 ? 'Page not found' : 'An error occurred'}</p>
      {process.env.NODE_ENV === 'development' && err && (
        <pre>{err.stack}</pre>
      )}
    </div>
  );
}

Error.getInitialProps = async ({ res, err, asPath }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;

  // Log error to monitoring service
  if (err) {
    console.error('Error:', { statusCode, asPath, error: err.message });
  }

  return { statusCode, hasGetInitialPropsRun: true, err };
};

export default Error;

// components/ErrorBoundary.js - For client-side errors
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

**VI:** Ket hop `_error.js` voi React Error Boundaries de xu ly loi toan dien.

---

## 34. How does Middleware work in Pages Router? / Middleware hoat dong nhu the nao trong Pages Router?

**EN:** Middleware runs at the Edge before requests complete. Use for auth, redirects, rewrites, and headers.

```javascript
// middleware.js (root directory)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Auth check
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add custom headers
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'my-value');

  // Geolocation-based redirect
  const country = request.geo?.country || 'US';
  if (pathname === '/' && country === 'VN') {
    return NextResponse.redirect(new URL('/vi', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};
```

**VI:** Middleware chay tai Edge truoc khi request hoan thanh. Dung cho auth, redirects, rewrites, va headers.

---

## 35. How to implement advanced Middleware patterns? / Cach implement cac patterns Middleware nang cao?

**EN:** Chain multiple middleware functions, handle A/B testing, rate limiting at edge.

```javascript
// middleware.js
import { NextResponse } from 'next/server';

// Compose multiple middleware
const middlewares = [authMiddleware, abTestMiddleware, rateLimitMiddleware];

export async function middleware(request) {
  for (const mw of middlewares) {
    const result = await mw(request);
    if (result) return result; // Return if middleware responds
  }
  return NextResponse.next();
}

// Auth middleware
function authMiddleware(request) {
  const token = request.cookies.get('token');
  const isProtected = request.nextUrl.pathname.startsWith('/app');

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// A/B testing middleware
function abTestMiddleware(request) {
  const bucket = request.cookies.get('ab-bucket')?.value;

  if (!bucket && request.nextUrl.pathname === '/pricing') {
    const newBucket = Math.random() < 0.5 ? 'control' : 'variant';
    const response = NextResponse.rewrite(
      new URL(`/pricing/${newBucket}`, request.url)
    );
    response.cookies.set('ab-bucket', newBucket, { maxAge: 60 * 60 * 24 * 7 });
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**VI:** Chain nhieu middleware functions, xu ly A/B testing, rate limiting tai edge.

---

## 36. How to use Middleware for URL rewrites and redirects? / Cach dung Middleware cho URL rewrites va redirects?

**EN:** Middleware rewrites preserve URL, redirects change it. Useful for legacy URLs, multi-tenant apps.

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get('host');

  // Multi-tenant: subdomain routing
  const subdomain = hostname?.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    return NextResponse.rewrite(
      new URL(`/tenants/${subdomain}${pathname}`, request.url)
    );
  }

  // Legacy URL redirects
  const legacyRedirects = {
    '/old-blog': '/blog',
    '/products/old-product': '/products/new-product',
  };

  if (legacyRedirects[pathname]) {
    return NextResponse.redirect(
      new URL(legacyRedirects[pathname], request.url),
      301 // Permanent redirect
    );
  }

  // Trailing slash normalization
  if (pathname !== '/' && pathname.endsWith('/')) {
    return NextResponse.redirect(
      new URL(pathname.slice(0, -1) + request.nextUrl.search, request.url)
    );
  }

  return NextResponse.next();
}
```

**VI:** Middleware rewrites giu nguyen URL, redirects thay doi URL. Huu ich cho legacy URLs, multi-tenant apps.

---

## 37. How to implement API middleware pattern? / Cach implement pattern API middleware?

**EN:** Create reusable middleware wrappers for API routes using higher-order functions.

```javascript
// lib/apiMiddleware.js
export function withMiddleware(...middlewares) {
  return (handler) => async (req, res) => {
    for (const middleware of middlewares) {
      await new Promise((resolve, reject) => {
        middleware(req, res, (result) => {
          if (result instanceof Error) reject(result);
          resolve(result);
        });
      });
      if (res.headersSent) return; // Response already sent
    }
    return handler(req, res);
  };
}

// Logging middleware
export const withLogging = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
};

// Error handling middleware
export const withErrorHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Usage: pages/api/users.js
import { withMiddleware, withLogging, withErrorHandler } from '../../lib/apiMiddleware';

const handler = async (req, res) => {
  const users = await getUsers();
  res.json(users);
};

export default withErrorHandler(withMiddleware(withLogging)(handler));
```

**VI:** Tao middleware wrappers co the tai su dung cho API routes bang higher-order functions.

---

## 38. How to implement CORS in API routes? / Cach implement CORS trong API routes?

**EN:** Handle CORS manually or use `cors` package. Handle preflight OPTIONS requests.

```javascript
// lib/cors.js
const allowedOrigins = ['https://app.example.com', 'http://localhost:3000'];

export function cors(req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// pages/api/data.js
import { cors } from '../../lib/cors';

export default function handler(req, res) {
  cors(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle actual request
  if (req.method === 'GET') {
    return res.json({ data: 'Hello' });
  }

  res.status(405).end();
}

// Using cors package
// npm install cors
import Cors from 'cors';

const cors = Cors({ origin: allowedOrigins, credentials: true });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) reject(result);
      resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  res.json({ data: 'Hello' });
}
```

**VI:** Xu ly CORS thu cong hoac dung package `cors`. Xu ly preflight OPTIONS requests.

---

## 39. How to implement rate limiting for API routes? / Cach implement rate limiting cho API routes?

**EN:** Use in-memory store for simple cases, Redis for production. Track requests by IP or user.

```javascript
// lib/rateLimit.js
const rateLimitMap = new Map();

export function rateLimit({ windowMs = 60000, max = 10 }) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const key = `${ip}:${req.url}`;
    const now = Date.now();

    const windowStart = now - windowMs;
    const requestData = rateLimitMap.get(key) || [];
    const requestsInWindow = requestData.filter(time => time > windowStart);

    if (requestsInWindow.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    requestsInWindow.push(now);
    rateLimitMap.set(key, requestsInWindow);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - requestsInWindow.length);

    next();
  };
}

// pages/api/submit.js
import { rateLimit } from '../../lib/rateLimit';

const limiter = rateLimit({ windowMs: 60000, max: 5 }); // 5 requests per minute

export default function handler(req, res) {
  return new Promise((resolve) => {
    limiter(req, res, () => {
      // Handle request
      res.json({ success: true });
      resolve();
    });
  });
}

// Production: Use Redis
// import { Ratelimit } from '@upstash/ratelimit';
// import { Redis } from '@upstash/redis';
// const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, '10 s') });
```

**VI:** Dung in-memory store cho don gian, Redis cho production. Track requests theo IP hoac user.

---

## 40. How to implement NextAuth.js authentication? / Cach implement authentication voi NextAuth.js?

**EN:** NextAuth.js provides complete auth solution. Configure providers, callbacks, and session handling.

```javascript
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await verifyCredentials(credentials);
        return user || null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: { strategy: 'jwt' },
});

// Usage in pages
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  if (session) {
    return <button onClick={() => signOut()}>Sign out</button>;
  }
  return <button onClick={() => signIn()}>Sign in</button>;
}
```

**VI:** NextAuth.js cung cap giai phap auth day du. Cau hinh providers, callbacks, va session handling.

---

## 41. How to protect pages and API routes with NextAuth? / Cach bao ve pages va API routes voi NextAuth?

**EN:** Use `getSession` for SSR, `useSession` for client, and middleware for edge protection.

```javascript
// Protected page with getServerSideProps
import { getSession } from 'next-auth/react';

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: { destination: '/auth/signin', permanent: false },
    };
  }

  // Role-based access
  if (session.user.role !== 'admin') {
    return { notFound: true };
  }

  return { props: { session } };
}

// Protected API route
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // API logic
  res.json({ data: 'protected data' });
}

// Client-side protection with HOC
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'unauthenticated') {
        router.push('/auth/signin');
      }
    }, [status, router]);

    if (status === 'loading') return <div>Loading...</div>;
    if (!session) return null;

    return <Component {...props} />;
  };
}
```

**VI:** Dung `getSession` cho SSR, `useSession` cho client, va middleware cho edge protection.

---

## 42. How to implement role-based access control (RBAC)? / Cach implement role-based access control (RBAC)?

**EN:** Store roles in JWT/session, create permission checks, protect routes based on roles.

```javascript
// lib/auth.js
export const ROLES = { ADMIN: 'admin', USER: 'user', EDITOR: 'editor' };

export const PERMISSIONS = {
  'posts:read': [ROLES.ADMIN, ROLES.USER, ROLES.EDITOR],
  'posts:write': [ROLES.ADMIN, ROLES.EDITOR],
  'posts:delete': [ROLES.ADMIN],
  'users:manage': [ROLES.ADMIN],
};

export function hasPermission(userRole, permission) {
  return PERMISSIONS[permission]?.includes(userRole) ?? false;
}

// pages/api/posts.js
import { getSession } from 'next-auth/react';
import { hasPermission } from '../../lib/auth';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { role } = session.user;

  if (req.method === 'DELETE' && !hasPermission(role, 'posts:delete')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Handle request based on method
  res.json({ success: true });
}

// HOC for role-based page protection
export function withRole(roles) {
  return (Component) => {
    return function RoleProtectedComponent(props) {
      const { data: session } = useSession();

      if (!session || !roles.includes(session.user.role)) {
        return <AccessDenied />;
      }

      return <Component {...props} />;
    };
  };
}

// Usage
export default withRole(['admin', 'editor'])(EditorPage);
```

**VI:** Luu roles trong JWT/session, tao permission checks, bao ve routes dua tren roles.

---

## 43. How to configure i18n routing in Page Router? / Cach cau hinh i18n routing trong Page Router?

**EN:** Configure locales in `next.config.js`. Next.js handles locale detection and URL prefixes automatically.

```javascript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'vi', 'ja', 'ko'],
    defaultLocale: 'en',
    localeDetection: true, // Auto-detect from Accept-Language

    // Domain-based routing (optional)
    domains: [
      { domain: 'example.com', defaultLocale: 'en' },
      { domain: 'example.vn', defaultLocale: 'vi' },
      { domain: 'example.jp', defaultLocale: 'ja' },
    ],
  },
};

// Accessing locale in pages
import { useRouter } from 'next/router';

export default function Page() {
  const { locale, locales, defaultLocale, asPath } = useRouter();

  return (
    <div>
      <p>Current: {locale}</p>
      <p>Available: {locales.join(', ')}</p>
    </div>
  );
}

// In getStaticProps/getServerSideProps
export async function getStaticProps({ locale }) {
  return {
    props: {
      messages: (await import(`../locales/${locale}.json`)).default,
    },
  };
}
```

**VI:** Cau hinh locales trong `next.config.js`. Next.js tu dong xu ly phat hien locale va URL prefixes.

---

## 44. How to implement language switching and translations? / Cach implement chuyen ngon ngu va translations?

**EN:** Use `next/link` with locale prop, load translations from JSON files or CMS.

```javascript
// components/LanguageSwitcher.js
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LanguageSwitcher() {
  const { locales, locale, asPath } = useRouter();

  return (
    <div>
      {locales.map((l) => (
        <Link key={l} href={asPath} locale={l}>
          <span className={l === locale ? 'active' : ''}>{l.toUpperCase()}</span>
        </Link>
      ))}
    </div>
  );
}

// lib/translations.js - Simple translation hook
import { useRouter } from 'next/router';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

const translations = { en, vi };

export function useTranslation() {
  const { locale } = useRouter();

  const t = (key, params = {}) => {
    let text = translations[locale]?.[key] || translations.en[key] || key;
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, v);
    });
    return text;
  };

  return { t, locale };
}

// Usage
export default function Greeting() {
  const { t } = useTranslation();
  return <h1>{t('welcome', { name: 'John' })}</h1>;
}

// locales/en.json
// { "welcome": "Welcome, {{name}}!", "home": "Home" }
// locales/vi.json
// { "welcome": "Xin chao, {{name}}!", "home": "Trang chu" }
```

**VI:** Dung `next/link` voi prop locale, load translations tu JSON files hoac CMS.

---

## 45. How to generate static pages for multiple locales? / Cach generate trang static cho nhieu locales?

**EN:** Use `locales` parameter in `getStaticPaths`. Generate paths for each locale combination.

```javascript
// pages/blog/[slug].js
export async function getStaticPaths({ locales }) {
  const posts = await getAllPosts();

  // Generate paths for each locale
  const paths = posts.flatMap((post) =>
    locales.map((locale) => ({
      params: { slug: post.slug },
      locale,
    }))
  );

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params, locale }) {
  // Fetch locale-specific content
  const post = await getPost(params.slug, locale);
  const translations = await import(`../../locales/${locale}.json`);

  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      post,
      messages: translations.default,
    },
    revalidate: 60,
  };
}

// Sitemap generation with hreflang
// pages/sitemap.xml.js
export async function getServerSideProps({ res, locales, defaultLocale }) {
  const posts = await getAllPosts();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:xhtml="http://www.w3.org/1999/xhtml">
      ${posts.map((post) => `
        <url>
          <loc>https://example.com/${defaultLocale}/blog/${post.slug}</loc>
          ${locales.map((locale) => `
            <xhtml:link rel="alternate" hreflang="${locale}"
                        href="https://example.com/${locale}/blog/${post.slug}"/>
          `).join('')}
        </url>
      `).join('')}
    </urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  return { props: {} };
}
```

**VI:** Dung tham so `locales` trong `getStaticPaths`. Generate paths cho moi to hop locale.

---

## 46. How to analyze and optimize bundle size? / Cach phan tich va toi uu kich thuoc bundle?

**EN:** Use `@next/bundle-analyzer`, dynamic imports, and tree shaking for smaller bundles.

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Optimize packages
  modularizeImports: {
    'lodash': { transform: 'lodash/{{member}}' },
    '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
  },
});

// Run: ANALYZE=true npm run build

// Dynamic imports to reduce initial bundle
import dynamic from 'next/dynamic';

// Heavy component - loaded on demand
const Chart = dynamic(() => import('../components/Chart'), {
  loading: () => <Skeleton />,
  ssr: false, // Skip SSR for browser-only libs
});

// Conditional loading
const AdminPanel = dynamic(() => import('../components/AdminPanel'));

export default function Dashboard({ isAdmin }) {
  return (
    <>
      <Chart data={data} />
      {isAdmin && <AdminPanel />}
    </>
  );
}

// Import only what you need
// Bad: import _ from 'lodash';
// Good: import debounce from 'lodash/debounce';

// Check bundle impact with import-cost VSCode extension
```

**VI:** Dung `@next/bundle-analyzer`, dynamic imports, va tree shaking de co bundles nho hon.

---

## 47. How to optimize images and fonts for performance? / Cach toi uu images va fonts cho performance?

**EN:** Use `next/image` for automatic optimization, `next/font` for font loading without layout shift.

```javascript
// Image optimization
import Image from 'next/image';

export default function Hero() {
  return (
    <>
      {/* Optimized image with priority for LCP */}
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={600}
        priority // Load immediately for above-fold
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />

      {/* Responsive image */}
      <Image
        src="/product.jpg"
        alt="Product"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </>
  );
}

// Font optimization
// pages/_app.js
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export default function App({ Component, pageProps }) {
  return (
    <main className={`${inter.variable} ${robotoMono.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}

// next.config.js - Remote image domains
module.exports = {
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

**VI:** Dung `next/image` cho tu dong toi uu, `next/font` cho font loading khong layout shift.

---

## 48. How to implement caching strategies for performance? / Cach implement caching strategies cho performance?

**EN:** Combine ISR, CDN caching, and HTTP cache headers for optimal performance.

```javascript
// ISR with revalidation
export async function getStaticProps() {
  const data = await fetchData();

  return {
    props: { data },
    revalidate: 60, // Revalidate every 60 seconds
  };
}

// API route with cache headers
export default function handler(req, res) {
  // Cache for 60s, stale-while-revalidate for 1 day
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=86400'
  );

  res.json({ data: 'cached response' });
}

// Page-level caching in getServerSideProps
export async function getServerSideProps({ res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );

  const data = await fetchData();
  return { props: { data } };
}

// next.config.js - Static asset caching
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

**VI:** Ket hop ISR, CDN caching, va HTTP cache headers de co performance toi uu.

---

## 49. What is the migration strategy from Page Router to App Router? / Chien luoc migrate tu Page Router sang App Router la gi?

**EN:** Incremental migration - both routers coexist. Migrate page by page, update data fetching patterns.

```javascript
// Step 1: Create app/ directory alongside pages/
// app/ and pages/ work together

// Step 2: Convert pages incrementally
// BEFORE: pages/blog/[slug].js
export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post }, revalidate: 60 };
}

export default function Post({ post }) {
  return <article>{post.content}</article>;
}

// AFTER: app/blog/[slug]/page.js
async function getPost(slug) {
  const res = await fetch(`${API}/posts/${slug}`, {
    next: { revalidate: 60 }, // ISR equivalent
  });
  return res.json();
}

export default async function Post({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}

// Step 3: Update imports
// BEFORE: import { useRouter } from 'next/router';
// AFTER:  import { useRouter, useParams, useSearchParams } from 'next/navigation';

// Step 4: Convert _app.js to app/layout.js
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// Migration priority:
// 1. Shared layouts → app/layout.js
// 2. Static pages → app/page.js with async components
// 3. Dynamic pages → Server Components
// 4. Client interactivity → 'use client' components
```

**VI:** Migration tang dan - ca hai routers cung ton tai. Migrate tung trang, cap nhat patterns fetch data.

---

## 50. What are the key differences between Page Router and App Router? / Nhung khac biet chinh giua Page Router va App Router la gi?

**EN:** App Router introduces Server Components, new data fetching, nested layouts, and streaming.

```javascript
// Key Differences Comparison:

// 1. DATA FETCHING
// Page Router:
export async function getServerSideProps() {
  return { props: { data } };
}
// App Router: Direct async/await in components
async function Page() {
  const data = await fetchData(); // Server Component
  return <div>{data}</div>;
}

// 2. LAYOUTS
// Page Router: _app.js + getLayout pattern
// App Router: Nested layout.js files
// app/dashboard/layout.js - Persists across navigations

// 3. ROUTING HOOKS
// Page Router:
import { useRouter } from 'next/router';
const { query, pathname, push } = useRouter();

// App Router:
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';

// 4. METADATA
// Page Router: next/head
import Head from 'next/head';
<Head><title>Page</title></Head>

// App Router: metadata export
export const metadata = { title: 'Page' };
// or generateMetadata() for dynamic

// 5. SERVER VS CLIENT
// Page Router: All components are client components
// App Router: Server Components by default, 'use client' for client

// Migration Checklist:
// [ ] Audit pages and identify migration order
// [ ] Convert layouts first (most value)
// [ ] Update data fetching patterns
// [ ] Add 'use client' to interactive components
// [ ] Update routing hooks imports
// [ ] Test thoroughly - both routers coexist
// [ ] Remove pages/ files after migration verified
```

**VI:** App Router gioi thieu Server Components, data fetching moi, nested layouts, va streaming.
