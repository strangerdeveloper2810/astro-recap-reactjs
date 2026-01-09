# Next.js App Router Interview Questions

---

## 1. What is the App Router directory structure in Next.js? / Cấu trúc thư mục App Router trong Next.js là gì?

**EN:** The App Router uses the `app/` directory with file-based routing. Special files include:
- `page.tsx` - UI for a route
- `layout.tsx` - Shared UI wrapper
- `loading.tsx` - Loading UI with Suspense
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 UI

```
app/
├── page.tsx          # /
├── layout.tsx        # Root layout
├── about/
│   └── page.tsx      # /about
└── blog/
    ├── page.tsx      # /blog
    └── [slug]/
        └── page.tsx  # /blog/:slug
```

**VI:** App Router sử dụng thư mục `app/` với routing dựa trên file. Các file đặc biệt: `page.tsx` (UI route), `layout.tsx` (wrapper chung), `loading.tsx` (UI loading), `error.tsx` (xử lý lỗi), `not-found.tsx` (trang 404).

---

## 2. What is the purpose of layout.tsx? / layout.tsx dùng để làm gì?

**EN:** `layout.tsx` wraps pages and preserves state across navigations. It receives `children` prop and doesn't re-render when navigating between child routes.

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>Navbar</nav>
        {children}
        <footer>Footer</footer>
      </body>
    </html>
  );
}
```

**VI:** `layout.tsx` bọc các trang và giữ nguyên state khi điều hướng. Nó nhận prop `children` và không re-render khi chuyển giữa các route con.

---

## 3. How do loading.tsx and error.tsx work? / loading.tsx và error.tsx hoạt động như thế nào?

**EN:** `loading.tsx` creates a Suspense boundary, showing loading UI while page loads. `error.tsx` creates an Error Boundary to catch errors in the route segment.

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>;
}

// app/dashboard/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

**VI:** `loading.tsx` tạo Suspense boundary, hiển thị UI loading trong khi trang đang tải. `error.tsx` tạo Error Boundary để bắt lỗi trong route segment. Lưu ý: `error.tsx` phải là Client Component.

---

## 4. What is the difference between Server and Client Components? / Sự khác nhau giữa Server Components và Client Components là gì?

**EN:**
- **Server Components** (default): Render on server, no JavaScript sent to client, can access backend directly
- **Client Components**: Render on client, can use hooks/events, marked with `'use client'`

| Feature | Server | Client |
|---------|--------|--------|
| useState/useEffect | No | Yes |
| Event handlers | No | Yes |
| Access DB/API directly | Yes | No |
| Bundle size | 0 | Included |

**VI:**
- **Server Components** (mặc định): Render trên server, không gửi JS đến client, truy cập backend trực tiếp
- **Client Components**: Render trên client, dùng hooks/events, đánh dấu bằng `'use client'`

---

## 5. How do you create a Client Component? / Làm thế nào để tạo Client Component?

**EN:** Add `'use client'` directive at the top of the file. This marks the component and all its imports as client-side.

```tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

**VI:** Thêm directive `'use client'` ở đầu file. Điều này đánh dấu component và tất cả imports của nó là client-side.

---

## 6. Can you import Server Components into Client Components? / Có thể import Server Components vào Client Components không?

**EN:** No, you cannot import Server Components into Client Components. However, you can pass Server Components as `children` or props.

```tsx
// ClientWrapper.tsx
'use client';
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <div onClick={() => console.log('clicked')}>{children}</div>;
}

// page.tsx (Server Component)
import ClientWrapper from './ClientWrapper';
import ServerComponent from './ServerComponent';

export default function Page() {
  return (
    <ClientWrapper>
      <ServerComponent /> {/* This works! */}
    </ClientWrapper>
  );
}
```

**VI:** Không thể import trực tiếp Server Components vào Client Components. Tuy nhiên, có thể truyền Server Components qua prop `children` hoặc các props khác.

---

## 7. How do you fetch data in Server Components? / Làm thế nào để fetch data trong Server Components?

**EN:** Use async/await directly in Server Components. No need for useEffect or useState.

```tsx
async function getData() {
  const res = await fetch('https://api.example.com/data');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data.title}</div>;
}
```

**VI:** Sử dụng async/await trực tiếp trong Server Components. Không cần useEffect hay useState.

---

## 8. What are the fetch cache and revalidate options? / Các tùy chọn cache và revalidate của fetch là gì?

**EN:** Next.js extends fetch with caching options:

```tsx
// Cached indefinitely (default)
fetch('https://api.example.com/data');

// No caching
fetch('https://api.example.com/data', { cache: 'no-store' });

// Revalidate every 60 seconds
fetch('https://api.example.com/data', { next: { revalidate: 60 } });

// Tag-based revalidation
fetch('https://api.example.com/data', { next: { tags: ['posts'] } });
```

**VI:** Next.js mở rộng fetch với các tùy chọn caching:
- Mặc định: cache vĩnh viễn
- `cache: 'no-store'`: không cache
- `next: { revalidate: 60 }`: revalidate mỗi 60 giây
- `next: { tags: ['posts'] }`: revalidate theo tag

---

## 9. How do you handle parallel data fetching? / Làm thế nào để xử lý fetch data song song?

**EN:** Use `Promise.all()` to fetch data in parallel, reducing waterfall requests.

```tsx
async function Page() {
  // Sequential (slow) - avoid this
  // const user = await getUser();
  // const posts = await getPosts();

  // Parallel (fast)
  const [user, posts] = await Promise.all([
    getUser(),
    getPosts()
  ]);

  return <div>{user.name} has {posts.length} posts</div>;
}
```

**VI:** Sử dụng `Promise.all()` để fetch data song song, tránh waterfall requests làm chậm ứng dụng.

---

## 10. What are Route Handlers in App Router? / Route Handlers trong App Router là gì?

**EN:** Route Handlers are API endpoints defined in `route.ts` files. They replace API Routes from Pages Router.

```tsx
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

**VI:** Route Handlers là các API endpoints được định nghĩa trong file `route.ts`. Chúng thay thế API Routes từ Pages Router.

---

## 11. How do you handle request and response in Route Handlers? / Làm thế nào để xử lý request và response trong Route Handlers?

**EN:** Use Web APIs (Request, Response) or Next.js helpers (NextRequest, NextResponse).

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get query params
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';

  // Get headers
  const authHeader = request.headers.get('authorization');

  // Get cookies
  const token = request.cookies.get('token');

  return NextResponse.json({ page }, {
    status: 200,
    headers: { 'X-Custom-Header': 'value' }
  });
}
```

**VI:** Sử dụng Web APIs (Request, Response) hoặc helpers của Next.js (NextRequest, NextResponse) để xử lý query params, headers, cookies.

---

## 12. How do you handle dynamic Route Handlers? / Làm thế nào để xử lý Route Handlers động?

**EN:** Use dynamic segments in the folder structure.

```tsx
// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.users.findUnique({ where: { id } });

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}
```

**VI:** Sử dụng dynamic segments trong cấu trúc thư mục. Params được truyền vào tham số thứ hai của hàm handler.

---

## 13. How do dynamic routes work in App Router? / Dynamic routes hoạt động như thế nào trong App Router?

**EN:** Use square brackets for dynamic segments:

```
app/
├── blog/[slug]/page.tsx      # /blog/hello-world
├── shop/[...slug]/page.tsx   # /shop/a/b/c (catch-all)
└── docs/[[...slug]]/page.tsx # /docs or /docs/a/b (optional catch-all)
```

```tsx
// app/blog/[slug]/page.tsx
export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}
```

**VI:** Sử dụng ngoặc vuông cho dynamic segments:
- `[slug]`: một segment
- `[...slug]`: catch-all (bắt buộc)
- `[[...slug]]`: optional catch-all

---

## 14. What are Route Groups? / Route Groups là gì?

**EN:** Route Groups organize routes without affecting URL structure. Use parentheses `(folderName)`.

```
app/
├── (marketing)/
│   ├── layout.tsx    # Marketing layout
│   ├── about/page.tsx    # /about
│   └── blog/page.tsx     # /blog
├── (shop)/
│   ├── layout.tsx    # Shop layout
│   └── products/page.tsx # /products
```

**VI:** Route Groups tổ chức routes mà không ảnh hưởng đến URL. Sử dụng dấu ngoặc đơn `(folderName)`. Hữu ích để áp dụng layouts khác nhau cho các nhóm routes.

---

## 15. What are Parallel Routes and Intercepting Routes? / Parallel Routes và Intercepting Routes là gì?

**EN:** **Parallel Routes** render multiple pages simultaneously using slots (`@folder`). **Intercepting Routes** intercept routes to show in a modal (`(.)`, `(..)`, `(...)`, `(..)(..)`).

```
app/
├── @modal/
│   └── (.)photo/[id]/page.tsx  # Intercepts /photo/[id]
├── @sidebar/
│   └── page.tsx
├── layout.tsx    # { children, modal, sidebar }
└── photo/[id]/page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  modal,
  sidebar
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div>
      {sidebar}
      {children}
      {modal}
    </div>
  );
}
```

**VI:** **Parallel Routes** render nhiều trang cùng lúc bằng slots (`@folder`). **Intercepting Routes** chặn routes để hiển thị trong modal, dùng các prefix: `(.)` (cùng level), `(..)` (lên 1 level).

---

## 16. How does Streaming work in Next.js? / Streaming hoạt động như thế nào trong Next.js?

**EN:** Streaming progressively renders UI, sending chunks as they become ready. Use `loading.tsx` or `<Suspense>`.

```tsx
import { Suspense } from 'react';

async function SlowComponent() {
  const data = await slowFetch(); // Takes 3 seconds
  return <div>{data}</div>;
}

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading slow data...</p>}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
```

**VI:** Streaming render UI theo từng phần, gửi chunks khi chúng sẵn sàng. Sử dụng `loading.tsx` hoặc `<Suspense>` để hiển thị fallback UI trong khi chờ data.

---

## 17. What are Suspense boundaries and how to use them effectively? / Suspense boundaries là gì và cách sử dụng hiệu quả?

**EN:** Suspense boundaries wrap async components to show fallback UI. Place them strategically for optimal UX.

```tsx
export default function Dashboard() {
  return (
    <div>
      {/* Independent sections stream separately */}
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      {/* Grouped components stream together */}
      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
        <TopProducts />
      </Suspense>
    </div>
  );
}
```

**VI:** Suspense boundaries bọc các async components để hiển thị fallback UI. Đặt chúng hợp lý: các section độc lập nên có Suspense riêng, các components liên quan có thể gộp chung.

---

## 18. What is Partial Prerendering (PPR)? / Partial Prerendering (PPR) là gì?

**EN:** PPR combines static shell with dynamic content. The static parts are served instantly, dynamic parts stream in.

```tsx
// Enable in next.config.js
// experimental: { ppr: true }

export default function Page() {
  return (
    <div>
      {/* Static shell - prerendered */}
      <Header />
      <Sidebar />

      {/* Dynamic content - streams in */}
      <Suspense fallback={<Skeleton />}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}
```

**VI:** PPR kết hợp shell tĩnh với nội dung động. Phần tĩnh được serve ngay lập tức, phần động stream vào sau. Đây là tính năng experimental giúp cải thiện TTFB.

---

## 19. What are Server Actions? / Server Actions là gì?

**EN:** Server Actions are async functions that run on the server, defined with `'use server'`. They can be called from Client Components for mutations.

```tsx
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.posts.create({ data: { title } });
  revalidatePath('/posts');
}

// app/posts/new/page.tsx
import { createPost } from '../actions';

export default function Page() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

**VI:** Server Actions là async functions chạy trên server, đánh dấu bằng `'use server'`. Có thể gọi từ Client Components để thực hiện mutations.

---

## 20. How do you handle forms with Server Actions? / Làm thế nào để xử lý forms với Server Actions?

**EN:** Use `action` attribute for forms or call Server Actions directly. Use `useFormStatus` for pending states.

```tsx
'use client';
import { useFormStatus } from 'react-dom';
import { createUser } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create User'}
    </button>
  );
}

export default function Form() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <SubmitButton />
    </form>
  );
}
```

**VI:** Sử dụng thuộc tính `action` cho forms hoặc gọi Server Actions trực tiếp. Dùng `useFormStatus` để hiển thị trạng thái pending.

---

## 21. How do you handle errors and validation in Server Actions? / Làm thế nào để xử lý lỗi và validation trong Server Actions?

**EN:** Return error state from Server Actions and use `useActionState` to handle it.

```tsx
// actions.ts
'use server';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function login(prevState: any, formData: FormData) {
  const result = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  // Process login...
  return { success: true };
}

// form.tsx
'use client';
import { useActionState } from 'react';
import { login } from './actions';

export default function LoginForm() {
  const [state, action] = useActionState(login, null);

  return (
    <form action={action}>
      <input name="email" />
      {state?.error?.email && <p>{state.error.email}</p>}
      <input name="password" type="password" />
      {state?.error?.password && <p>{state.error.password}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

**VI:** Trả về error state từ Server Actions và sử dụng `useActionState` để xử lý. Dùng thư viện như Zod để validate data.

---

## 22. How does the Metadata API work? / Metadata API hoạt động như thế nào?

**EN:** Export `metadata` object or `generateMetadata` function from page/layout files.

```tsx
// Static metadata
export const metadata = {
  title: 'My App',
  description: 'Welcome to my app',
  openGraph: {
    title: 'My App',
    images: ['/og-image.png'],
  },
};

// Dynamic metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

**VI:** Export object `metadata` hoặc function `generateMetadata` từ các file page/layout. Có thể tạo metadata tĩnh hoặc động dựa trên params/data.

---

## 23. What metadata options are available for SEO? / Có những tùy chọn metadata nào cho SEO?

**EN:** Next.js supports comprehensive metadata options:

```tsx
export const metadata = {
  title: {
    default: 'My Site',
    template: '%s | My Site', // "About | My Site"
  },
  description: 'Site description',
  keywords: ['Next.js', 'React'],
  authors: [{ name: 'John' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mysite.com',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@username',
  },
  alternates: {
    canonical: 'https://mysite.com',
    languages: { 'vi-VN': 'https://mysite.com/vi' },
  },
};
```

**VI:** Next.js hỗ trợ nhiều tùy chọn metadata: title templates, description, keywords, robots, Open Graph, Twitter cards, canonical URLs, và alternate languages.

---

## 24. How do you generate dynamic sitemap and robots.txt? / Làm thế nào để tạo sitemap và robots.txt động?

**EN:** Create `sitemap.ts` and `robots.ts` in the app directory.

```tsx
// app/sitemap.ts
export default async function sitemap() {
  const posts = await getPosts();

  return [
    { url: 'https://mysite.com', lastModified: new Date() },
    { url: 'https://mysite.com/about', lastModified: new Date() },
    ...posts.map(post => ({
      url: `https://mysite.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ];
}

// app/robots.ts
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin/' },
    sitemap: 'https://mysite.com/sitemap.xml',
  };
}
```

**VI:** Tạo file `sitemap.ts` và `robots.ts` trong thư mục app. Có thể fetch data để tạo sitemap động với tất cả các trang.

---

## 25. How does Middleware work in Next.js? / Middleware hoạt động như thế nào trong Next.js?

**EN:** Middleware runs before requests are processed. Create `middleware.ts` in project root.

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check auth
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add headers
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'value');
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

**VI:** Middleware chạy trước khi requests được xử lý. Tạo file `middleware.ts` ở root. Dùng `matcher` để chỉ định routes áp dụng middleware.

---

## 26. How do you use cookies() and headers() functions? / Làm thế nào để sử dụng hàm cookies() và headers()?

**EN:** Use these functions in Server Components, Server Actions, or Route Handlers.

```tsx
import { cookies, headers } from 'next/headers';

export default async function Page() {
  // Read cookies
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value;

  // Read headers
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');

  return <div>Theme: {theme}</div>;
}

// In Server Action
'use server';
import { cookies } from 'next/headers';

export async function setTheme(theme: string) {
  const cookieStore = await cookies();
  cookieStore.set('theme', theme, { httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
}
```

**VI:** Sử dụng các functions này trong Server Components, Server Actions, hoặc Route Handlers để đọc/ghi cookies và đọc headers.

---

## 27. How do you use redirect() and notFound()? / Làm thế nào để sử dụng redirect() và notFound()?

**EN:** Use `redirect()` to navigate and `notFound()` to show 404 page.

```tsx
import { redirect, notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound(); // Shows not-found.tsx
  }

  if (!user.isActive) {
    redirect('/inactive'); // Redirects to /inactive
  }

  return <div>{user.name}</div>;
}

// With redirect type
redirect('/login', 'replace'); // 'push' (default) or 'replace'

// Permanent redirect (308)
import { permanentRedirect } from 'next/navigation';
permanentRedirect('/new-url');
```

**VI:** Sử dụng `redirect()` để điều hướng và `notFound()` để hiển thị trang 404. `redirect` mặc định dùng 307, `permanentRedirect` dùng 308.

---

## 28. What are the caching layers in Next.js App Router? / Các lớp caching trong Next.js App Router là gì?

**EN:** Next.js has 4 caching mechanisms:

| Cache | What | Where | Duration |
|-------|------|-------|----------|
| Request Memoization | fetch() deduplication | Server | Per request |
| Data Cache | fetch() results | Server | Persistent |
| Full Route Cache | Rendered HTML/RSC | Server | Persistent |
| Router Cache | RSC payload | Client | Session |

```tsx
// Data Cache - persists across requests
fetch('https://api.example.com/data'); // cached

// Opt out of Data Cache
fetch('https://api.example.com/data', { cache: 'no-store' });

// Time-based revalidation
fetch('https://api.example.com/data', { next: { revalidate: 3600 } });
```

**VI:** Next.js có 4 lớp caching: Request Memoization (dedupe fetch trong 1 request), Data Cache (lưu kết quả fetch), Full Route Cache (lưu HTML/RSC), Router Cache (lưu payload RSC ở client).

---

## 29. How do revalidatePath and revalidateTag work? / revalidatePath và revalidateTag hoạt động như thế nào?

**EN:** Use these to invalidate cached data on-demand.

```tsx
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate specific path
export async function updatePost(id: string, data: FormData) {
  await db.posts.update({ where: { id }, data: { title: data.get('title') } });

  revalidatePath('/posts');           // Revalidate /posts page
  revalidatePath('/posts/[slug]', 'page'); // Revalidate dynamic pages
  revalidatePath('/', 'layout');      // Revalidate all
}

// Revalidate by tag
export async function createPost(data: FormData) {
  await db.posts.create({ data: { title: data.get('title') } });
  revalidateTag('posts'); // Invalidate all fetches with 'posts' tag
}

// Tag your fetches
fetch('https://api.example.com/posts', { next: { tags: ['posts'] } });
```

**VI:** Sử dụng để invalidate cached data theo yêu cầu. `revalidatePath` invalidate theo path, `revalidateTag` invalidate theo tag đã gắn cho fetch requests.

---

## 30. What are best practices for caching in Next.js? / Các best practices cho caching trong Next.js là gì?

**EN:** Follow these caching best practices:

```tsx
// 1. Use tags for related data
fetch('/api/posts', { next: { tags: ['posts'] } });
fetch('/api/posts/1', { next: { tags: ['posts', 'post-1'] } });

// 2. Set appropriate revalidation times
fetch('/api/static-content', { next: { revalidate: 86400 } }); // Daily
fetch('/api/dynamic-content', { next: { revalidate: 60 } });    // Minutely

// 3. Use unstable_cache for non-fetch data
import { unstable_cache } from 'next/cache';

const getCachedData = unstable_cache(
  async (id: string) => db.items.findUnique({ where: { id } }),
  ['items'],
  { revalidate: 3600, tags: ['items'] }
);

// 4. Configure route segment caching
export const dynamic = 'force-dynamic';  // No caching
export const revalidate = 60;            // Revalidate every 60s
export const fetchCache = 'force-no-store'; // All fetches no-store

// 5. Use generateStaticParams for static generation
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

**VI:** Best practices:
1. Dùng tags cho data liên quan
2. Đặt thời gian revalidate phù hợp
3. Dùng `unstable_cache` cho non-fetch data
4. Cấu hình route segment options
5. Dùng `generateStaticParams` cho static generation

---

## 31. What is the difference between template.tsx and layout.tsx? / Sự khác nhau giữa template.tsx và layout.tsx là gì?

**EN:** `layout.tsx` preserves state and doesn't re-render on navigation. `template.tsx` creates a new instance on every navigation, resetting state and effects.

```tsx
// app/layout.tsx - State persists across navigations
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>; // Keeps state
}

// app/template.tsx - New instance on each navigation
export default function Template({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>; // Resets state, re-runs effects
}

// Render order: Layout → Template → Page
```

**VI:** `layout.tsx` giữ nguyên state và không re-render khi điều hướng. `template.tsx` tạo instance mới mỗi lần điều hướng, reset state và chạy lại effects.

---

## 32. When should you use template.tsx vs layout.tsx? / Khi nào nên dùng template.tsx thay vì layout.tsx?

**EN:** Use `template.tsx` when you need:
- Enter/exit animations between pages
- Features that rely on useEffect on every navigation
- Reset state per page (e.g., form state, scroll position)
- Per-page analytics or logging

```tsx
// app/dashboard/template.tsx
'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Runs on every page navigation
    analytics.pageView(window.location.pathname);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {children}
    </motion.div>
  );
}
```

**VI:** Dùng `template.tsx` khi cần: animations enter/exit giữa các trang, chạy useEffect mỗi lần điều hướng, reset state theo trang, hoặc logging/analytics theo trang.

---

## 33. Can you nest template.tsx and layout.tsx together? / Có thể lồng template.tsx và layout.tsx với nhau không?

**EN:** Yes, both can coexist. Layout wraps Template which wraps the page.

```
app/
├── layout.tsx       # Root layout (persistent)
├── template.tsx     # Root template (re-creates)
└── dashboard/
    ├── layout.tsx   # Dashboard layout (persistent sidebar)
    └── template.tsx # Dashboard template (page transitions)
    └── page.tsx

// Render hierarchy:
// RootLayout → RootTemplate → DashboardLayout → DashboardTemplate → Page
```

```tsx
// Practical use case:
// layout.tsx - persistent navigation/sidebar
// template.tsx - page transition animations
```

**VI:** Có, cả hai có thể cùng tồn tại. Layout bọc Template, Template bọc Page. Thứ tự render: Layout → Template → Page.

---

## 34. How does not-found.tsx work? / not-found.tsx hoạt động như thế nào?

**EN:** `not-found.tsx` renders when `notFound()` is called or when a route doesn't exist. You can have a root 404 and segment-specific 404 pages.

```tsx
// app/not-found.tsx - Global 404
export default function NotFound() {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <p>Could not find the requested resource</p>
      <a href="/">Return Home</a>
    </div>
  );
}

// app/blog/not-found.tsx - Blog-specific 404
export default function BlogNotFound() {
  return (
    <div>
      <h2>Blog Post Not Found</h2>
      <a href="/blog">View all posts</a>
    </div>
  );
}

// Trigger 404 manually
import { notFound } from 'next/navigation';

async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound(); // Shows nearest not-found.tsx
  return <div>{post.title}</div>;
}
```

**VI:** `not-found.tsx` hiển thị khi gọi `notFound()` hoặc route không tồn tại. Có thể có 404 global và 404 riêng cho từng segment.

---

## 35. What is global-error.tsx and when to use it? / global-error.tsx là gì và khi nào sử dụng?

**EN:** `global-error.tsx` catches errors in the root layout. It must include `<html>` and `<body>` tags since it replaces the entire app.

```tsx
// app/global-error.tsx
'use client'; // Must be a Client Component

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <p>Error: {error.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}

// Note: Only works in production mode
// error.tsx catches segment errors
// global-error.tsx catches root layout errors
```

**VI:** `global-error.tsx` bắt lỗi trong root layout. Phải bao gồm thẻ `<html>` và `<body>` vì nó thay thế toàn bộ app. Chỉ hoạt động ở production mode.

---

## 36. What are Route Segment Config options? / Các Route Segment Config options là gì?

**EN:** Export config variables from page/layout to control caching and rendering behavior.

```tsx
// app/dashboard/page.tsx

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic';

// Force static rendering (build time)
export const dynamic = 'force-static';

// Revalidation time in seconds
export const revalidate = 60;

// Control fetch caching
export const fetchCache = 'force-no-store'; // or 'force-cache'

// Runtime: 'nodejs' (default) or 'edge'
export const runtime = 'edge';

// Preferred region for edge runtime
export const preferredRegion = 'iad1';

// Maximum duration for serverless functions (seconds)
export const maxDuration = 30;

export default function Page() {
  return <div>Dashboard</div>;
}
```

**VI:** Export các biến config từ page/layout để điều khiển caching và rendering: `dynamic`, `revalidate`, `fetchCache`, `runtime`, `preferredRegion`, `maxDuration`.

---

## 37. How does generateStaticParams work? / generateStaticParams hoạt động như thế nào?

**EN:** `generateStaticParams` pre-renders dynamic routes at build time (Static Site Generation).

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
  // Returns: [{ slug: 'post-1' }, { slug: 'post-2' }]
}

// For nested dynamic routes
// app/products/[category]/[id]/page.tsx
export async function generateStaticParams() {
  const products = await getProducts();

  return products.map((product) => ({
    category: product.category,
    id: product.id,
  }));
}

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.title}</article>;
}
```

**VI:** `generateStaticParams` pre-render các dynamic routes lúc build time (SSG). Trả về array các params objects để Next.js tạo static pages.

---

## 38. What is the difference between force-static and force-dynamic? / Sự khác nhau giữa force-static và force-dynamic là gì?

**EN:** These control whether a route is statically or dynamically rendered.

```tsx
// force-static: Pre-render at build time, even with dynamic functions
export const dynamic = 'force-static';

async function Page() {
  // This would normally make the page dynamic
  // With force-static, it's rendered at build time with empty values
  const cookieStore = await cookies(); // Returns empty
  return <div>Static page</div>;
}

// force-dynamic: Always render on request, never cache
export const dynamic = 'force-dynamic';

async function Page() {
  // Fresh data on every request
  const data = await fetch('https://api.example.com/data');
  return <div>{data.timestamp}</div>;
}

// auto (default): Next.js decides based on dynamic function usage
export const dynamic = 'auto';

// error: Throw error if dynamic functions are used
export const dynamic = 'error';
```

**VI:**
- `force-static`: Pre-render lúc build, kể cả khi có dynamic functions
- `force-dynamic`: Luôn render on-request, không cache
- `auto` (mặc định): Next.js tự quyết định
- `error`: Báo lỗi nếu dùng dynamic functions

---

## 39. How do you combine generateStaticParams with dynamic rendering fallback? / Làm thế nào kết hợp generateStaticParams với dynamic rendering fallback?

**EN:** Use `dynamicParams` to control behavior for non-generated paths.

```tsx
// app/blog/[slug]/page.tsx

// Generate static pages for existing posts
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// true (default): Generate new paths on-demand
export const dynamicParams = true;

// false: Return 404 for paths not in generateStaticParams
// export const dynamicParams = false;

// ISR: Revalidate generated pages
export const revalidate = 3600; // Revalidate every hour

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return <article>{post.title}</article>;
}
```

**VI:** Dùng `dynamicParams` để kiểm soát paths không được generate:
- `true` (mặc định): Generate paths mới on-demand
- `false`: Trả về 404 cho paths không có trong generateStaticParams

---

## 40. What is useOptimistic and how does it work? / useOptimistic là gì và hoạt động như thế nào?

**EN:** `useOptimistic` shows optimistic UI updates before server confirms the action.

```tsx
'use client';
import { useOptimistic } from 'react';
import { addTodo } from './actions';

type Todo = { id: string; text: string; pending?: boolean };

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: string) => [
      ...state,
      { id: crypto.randomUUID(), text: newTodo, pending: true }
    ]
  );

  async function handleSubmit(formData: FormData) {
    const text = formData.get('text') as string;
    addOptimisticTodo(text); // Immediately update UI
    await addTodo(text);     // Server action
  }

  return (
    <form action={handleSubmit}>
      <input name="text" />
      <button>Add</button>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

**VI:** `useOptimistic` hiển thị UI updates lạc quan trước khi server xác nhận. Cải thiện UX bằng cách cập nhật ngay lập tức trong khi chờ server response.

---

## 41. How do you handle optimistic updates with error rollback? / Làm thế nào xử lý optimistic updates với rollback khi lỗi?

**EN:** Use try-catch with state management to rollback on errors.

```tsx
'use client';
import { useOptimistic, useTransition } from 'react';

type Message = { id: string; text: string; sending?: boolean };

export default function Chat({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage]
  );
  const [isPending, startTransition] = useTransition();

  async function sendMessage(formData: FormData) {
    const text = formData.get('text') as string;
    const tempId = crypto.randomUUID();

    startTransition(async () => {
      // Add optimistic message
      addOptimistic({ id: tempId, text, sending: true });

      try {
        await sendMessageAction(text);
        // On success, server revalidates and real data replaces optimistic
      } catch (error) {
        // On error, optimistic state is automatically rolled back
        // because the server data hasn't changed
        alert('Failed to send message');
      }
    });
  }

  return (
    <form action={sendMessage}>
      <input name="text" />
      {optimisticMessages.map((msg) => (
        <div key={msg.id} className={msg.sending ? 'opacity-50' : ''}>
          {msg.text}
        </div>
      ))}
    </form>
  );
}
```

**VI:** Dùng try-catch với useTransition để rollback khi lỗi. Khi server action fail, state tự động rollback về dữ liệu thật từ server.

---

## 42. What are common use cases for useOptimistic? / Các use cases phổ biến của useOptimistic là gì?

**EN:** Common patterns for optimistic UI updates:

```tsx
// 1. Like/Unlike buttons
const [optimisticLikes, addLike] = useOptimistic(
  likes,
  (state, liked: boolean) => liked ? state + 1 : state - 1
);

// 2. Add/Remove items from list
const [optimisticItems, updateItems] = useOptimistic(
  items,
  (state, action: { type: 'add' | 'remove'; item: Item }) => {
    if (action.type === 'add') return [...state, action.item];
    return state.filter(i => i.id !== action.item.id);
  }
);

// 3. Toggle states
const [optimisticBookmarked, setBookmark] = useOptimistic(
  isBookmarked,
  (_, newValue: boolean) => newValue
);

// 4. Shopping cart
const [optimisticCart, updateCart] = useOptimistic(
  cart,
  (state, { productId, quantity }: { productId: string; quantity: number }) =>
    state.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    )
);
```

**VI:** Use cases phổ biến: nút Like/Unlike, thêm/xóa items trong list, toggle states, giỏ hàng shopping. Tất cả đều cần phản hồi UI ngay lập tức.

---

## 43. How does useFormStatus work? / useFormStatus hoạt động như thế nào?

**EN:** `useFormStatus` returns the pending status of the parent form. Must be used inside a component rendered within a form.

```tsx
'use client';
import { useFormStatus } from 'react-dom';

// Must be a separate component inside the form
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

function FormFields() {
  const { pending } = useFormStatus();

  return (
    <>
      <input name="email" disabled={pending} />
      <input name="password" type="password" disabled={pending} />
    </>
  );
}

// Usage
export default function LoginForm() {
  return (
    <form action={loginAction}>
      <FormFields />
      <SubmitButton />
    </form>
  );
}
```

**VI:** `useFormStatus` trả về trạng thái pending của form cha. Phải dùng bên trong component được render trong form, không thể dùng trực tiếp trong form component.

---

## 44. How does useActionState work for form handling? / useActionState hoạt động như thế nào cho form handling?

**EN:** `useActionState` (formerly `useFormState`) manages form state and action results.

```tsx
'use client';
import { useActionState } from 'react';
import { createUser } from './actions';

type State = {
  success?: boolean;
  error?: string;
  fieldErrors?: { name?: string[]; email?: string[] };
};

export default function CreateUserForm() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    createUser,
    { success: false } // initial state
  );

  return (
    <form action={formAction}>
      <input name="name" />
      {state.fieldErrors?.name && <p>{state.fieldErrors.name[0]}</p>}

      <input name="email" type="email" />
      {state.fieldErrors?.email && <p>{state.fieldErrors.email[0]}</p>}

      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>

      {state.success && <p>User created successfully!</p>}
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}

// Server Action
'use server';
export async function createUser(prevState: State, formData: FormData): Promise<State> {
  // Validate and create user...
  return { success: true };
}
```

**VI:** `useActionState` quản lý form state và kết quả action. Trả về [state, formAction, isPending]. Server action nhận prevState làm tham số đầu tiên.

---

## 45. How do you combine useFormStatus with useActionState? / Làm thế nào kết hợp useFormStatus với useActionState?

**EN:** Use both for complete form UX with field validation and loading states.

```tsx
'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

function FormInput({ name, error }: { name: string; error?: string[] }) {
  const { pending } = useFormStatus();
  return (
    <div>
      <input name={name} disabled={pending} />
      {error && <span className="error">{error[0]}</span>}
    </div>
  );
}

export default function ProfileForm() {
  const [state, action] = useActionState(updateProfile, {});

  return (
    <form action={action}>
      <FormInput name="name" error={state.errors?.name} />
      <FormInput name="bio" error={state.errors?.bio} />
      <SubmitButton />
      {state.message && <p>{state.message}</p>}
    </form>
  );
}
```

**VI:** Kết hợp cả hai để có UX hoàn chỉnh: `useActionState` cho validation và state, `useFormStatus` cho loading states trên từng field và button.

---

## 46. How does next/image optimize images? / next/image tối ưu hóa hình ảnh như thế nào?

**EN:** `next/image` provides automatic image optimization with lazy loading, responsive sizes, and modern formats.

```tsx
import Image from 'next/image';

// Basic usage
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
/>

// Responsive image
<Image
  src="/banner.jpg"
  alt="Banner"
  fill                    // Fill parent container
  sizes="(max-width: 768px) 100vw, 50vw"  // Responsive hints
  style={{ objectFit: 'cover' }}
  priority                // Preload (above-the-fold images)
/>

// Remote images - configure in next.config.js
<Image
  src="https://cdn.example.com/photo.jpg"
  alt="Remote image"
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' }
    ],
    formats: ['image/avif', 'image/webp'],
  },
};
```

**VI:** `next/image` tự động tối ưu: lazy loading, responsive sizes, convert sang WebP/AVIF. Dùng `priority` cho ảnh above-the-fold, `fill` cho ảnh responsive.

---

## 47. How does next/font optimize fonts? / next/font tối ưu hóa fonts như thế nào?

**EN:** `next/font` self-hosts fonts with zero layout shift and automatic subset optimization.

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

// Google Fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

// Local fonts
import localFont from 'next/font/local';

const myFont = localFont({
  src: [
    { path: './fonts/MyFont-Regular.woff2', weight: '400' },
    { path: './fonts/MyFont-Bold.woff2', weight: '700' },
  ],
  variable: '--font-my-font',
});

// Use in Tailwind CSS
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-roboto-mono)'],
      },
    },
  },
};
```

**VI:** `next/font` self-host fonts, không có layout shift, tự động subset. Hỗ trợ Google Fonts và local fonts. Dùng CSS variables để tích hợp với Tailwind.

---

## 48. What are best practices for image and font optimization? / Best practices cho tối ưu hóa image và font là gì?

**EN:** Follow these optimization best practices:

```tsx
// Images
// 1. Always specify width and height to prevent layout shift
<Image src="/photo.jpg" width={800} height={600} alt="Description" />

// 2. Use fill for unknown dimensions with container
<div className="relative h-64 w-full">
  <Image src="/banner.jpg" fill sizes="100vw" alt="Banner" />
</div>

// 3. Add priority to LCP (Largest Contentful Paint) images
<Image src="/hero.jpg" priority ... />

// 4. Use appropriate sizes prop
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"

// 5. Provide blur placeholder for better UX
<Image placeholder="blur" blurDataURL="..." ... />

// Fonts
// 1. Use variable fonts when possible (smaller file size)
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// 2. Preload critical fonts
const font = Inter({ subsets: ['latin'], preload: true });

// 3. Use font-display: swap
const font = Inter({ display: 'swap' });

// 4. Subset fonts to reduce size
const font = Inter({ subsets: ['latin', 'vietnamese'] });
```

**VI:** Best practices:
- Images: luôn có width/height, dùng priority cho LCP images, dùng sizes đúng, thêm blur placeholder
- Fonts: dùng variable fonts, preload critical fonts, display swap, subset phù hợp

---

## 49. What is Turbopack and how to use it? / Turbopack là gì và cách sử dụng?

**EN:** Turbopack is Next.js's Rust-based bundler, much faster than Webpack for development.

```bash
# Enable Turbopack in development
next dev --turbo

# Or in package.json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start"
  }
}
```

```tsx
// Key features:
// - Incremental computation (only rebuild what changed)
// - Lazy bundling (bundle on demand)
// - Native speed (Rust-based)

// Supported features (as of Next.js 15):
// ✅ App Router
// ✅ Pages Router
// ✅ TypeScript
// ✅ CSS/Sass/Tailwind
// ✅ next/image, next/font
// ✅ Server Components
// ✅ Fast Refresh

// Note: Turbopack is for development only
// Production still uses Webpack or will use Turbopack when stable
```

**VI:** Turbopack là bundler Rust-based của Next.js, nhanh hơn nhiều so với Webpack cho development. Dùng `next dev --turbo` để bật. Hiện tại chỉ hỗ trợ development mode.

---

## 50. What are important next.config.js options? / Các options quan trọng trong next.config.js là gì?

**EN:** Key configuration options for Next.js applications:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router settings
  experimental: {
    ppr: true,                    // Partial Prerendering
    typedRoutes: true,            // Type-safe routes
  },

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.example.com' }
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Redirects and rewrites
  async redirects() {
    return [
      { source: '/old-page', destination: '/new-page', permanent: true }
    ];
  },

  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'https://api.example.com/:path*' }
    ];
  },

  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' }
        ],
      },
    ];
  },

  // Environment variables (public)
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },

  // Output mode
  output: 'standalone',           // For Docker deployment

  // Disable features
  reactStrictMode: true,
  poweredByHeader: false,

  // Webpack customization
  webpack: (config, { isServer }) => {
    // Custom webpack config
    return config;
  },
};

module.exports = nextConfig;
```

**VI:** Các options quan trọng: `images` (remote patterns, formats), `redirects/rewrites`, `headers`, `experimental` (ppr, typedRoutes), `output` (standalone cho Docker), `reactStrictMode`, `webpack` customization.

---

## 51. How do Parallel Routes work with slots? / Parallel Routes hoạt động với slots như thế nào?

**EN:** Parallel Routes use `@folder` naming to create slots that render simultaneously. Each slot receives its own loading/error states.

```tsx
// Folder structure
app/
├── @dashboard/
│   ├── page.tsx
│   └── loading.tsx
├── @analytics/
│   ├── page.tsx
│   └── loading.tsx
├── layout.tsx
└── page.tsx

// app/layout.tsx
export default function Layout({
  children,
  dashboard,
  analytics,
}: {
  children: React.ReactNode;
  dashboard: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2">
      <div>{dashboard}</div>
      <div>{analytics}</div>
      <div>{children}</div>
    </div>
  );
}

// Each slot streams independently
// @dashboard/loading.tsx shows while dashboard loads
// @analytics/loading.tsx shows while analytics loads
```

**VI:** Parallel Routes dùng `@folder` để tạo slots render đồng thời. Mỗi slot có loading/error states riêng, cho phép streaming độc lập.

---

## 52. What is default.tsx in Parallel Routes? / default.tsx trong Parallel Routes là gì?

**EN:** `default.tsx` is a fallback for slots when the current URL doesn't match the slot's route. Essential for handling soft navigation.

```tsx
// app/
├── @modal/
│   ├── default.tsx      # Fallback when no modal
│   └── (.)photo/[id]/
│       └── page.tsx     # Modal content
├── layout.tsx
└── page.tsx

// @modal/default.tsx - Renders nothing when no modal active
export default function Default() {
  return null;
}

// Without default.tsx, you get 404 on hard refresh
// because Next.js doesn't know what to render for @modal slot

// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

**VI:** `default.tsx` là fallback cho slots khi URL hiện tại không match route của slot. Cần thiết để tránh 404 khi hard refresh.

---

## 53. How do Intercepting Routes work for modals? / Intercepting Routes hoạt động cho modals như thế nào?

**EN:** Intercepting Routes use `(.)`, `(..)`, `(...)` prefixes to intercept navigation and show content in a modal while preserving the underlying page.

```tsx
// Folder structure for photo modal
app/
├── @modal/
│   ├── default.tsx
│   └── (.)photo/[id]/    # Intercepts /photo/[id]
│       └── page.tsx
├── photo/[id]/
│   └── page.tsx          # Full page for direct access
├── layout.tsx
└── page.tsx

// @modal/(.)photo/[id]/page.tsx - Modal view
export default async function PhotoModal({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg">
        <img src={photo.url} alt={photo.title} />
        <Link href="/">Close</Link>
      </div>
    </div>
  );
}

// photo/[id]/page.tsx - Full page view
export default async function PhotoPage({ params }) {
  const { id } = await params;
  const photo = await getPhoto(id);
  return <FullPhotoView photo={photo} />;
}

// Prefixes:
// (.) - same level
// (..) - one level up
// (..)(..) - two levels up
// (...) - from app root
```

**VI:** Intercepting Routes dùng prefix `(.)`, `(..)`, `(...)` để chặn navigation và hiện modal. Direct access (paste URL) vẫn hiển thị full page.

---

## 54. How do you handle authentication in Route Handlers? / Làm thế nào xử lý authentication trong Route Handlers?

**EN:** Use cookies, headers, or JWT tokens with middleware for Route Handler authentication.

```tsx
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Method 1: Cookie-based auth
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Method 2: Bearer token
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const bearerToken = authHeader.split(' ')[1];

  return NextResponse.json({ data: 'protected data', user });
}

// Reusable auth wrapper
async function withAuth(
  request: NextRequest,
  handler: (user: User) => Promise<NextResponse>
) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handler(user);
}
```

**VI:** Dùng cookies, headers, hoặc JWT tokens cho Route Handler authentication. Kết hợp với middleware để bảo vệ routes.

---

## 55. What are advanced Middleware patterns? / Các Middleware patterns nâng cao là gì?

**EN:** Advanced patterns include chaining, conditional logic, and feature flags.

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Rate limiting
  const ip = request.ip ?? '127.0.0.1';
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 2. A/B Testing
  let response = NextResponse.next();
  if (!request.cookies.has('ab-test')) {
    const variant = Math.random() > 0.5 ? 'A' : 'B';
    response.cookies.set('ab-test', variant);
  }

  // 3. Geolocation-based routing
  const country = request.geo?.country || 'US';
  if (pathname === '/shop' && country === 'VN') {
    return NextResponse.redirect(new URL('/shop/vn', request.url));
  }

  // 4. Auth with role-based access
  const token = request.cookies.get('token')?.value;
  const user = token ? await verifyToken(token) : null;

  if (pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // 5. Add custom headers
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**VI:** Middleware nâng cao: rate limiting, A/B testing, routing theo địa lý, role-based access, thêm custom headers. Dùng matcher để chọn routes áp dụng.

---

## 56. How do you chain multiple middleware functions? / Làm thế nào chain nhiều middleware functions?

**EN:** Create a middleware chain pattern for modular middleware.

```tsx
// lib/middleware.ts
import { NextResponse, NextRequest } from 'next/server';

type MiddlewareFn = (
  request: NextRequest,
  response: NextResponse
) => Promise<NextResponse | void>;

export function chain(...middlewares: MiddlewareFn[]) {
  return async function(request: NextRequest) {
    let response = NextResponse.next();

    for (const middleware of middlewares) {
      const result = await middleware(request, response);
      if (result) {
        response = result;
        // If it's a redirect or error, stop chain
        if (result.status !== 200) break;
      }
    }

    return response;
  };
}

// Individual middlewares
const authMiddleware: MiddlewareFn = async (request, response) => {
  const token = request.cookies.get('token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
};

const loggingMiddleware: MiddlewareFn = async (request, response) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
};

const corsMiddleware: MiddlewareFn = async (request, response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
};

// middleware.ts
import { chain } from './lib/middleware';

export default chain(loggingMiddleware, corsMiddleware, authMiddleware);
```

**VI:** Tạo middleware chain pattern để modular hóa. Mỗi middleware function nhận request và response, có thể return response mới hoặc void để tiếp tục chain.

---

## 57. How do Server Actions work with progressive enhancement? / Server Actions hoạt động với progressive enhancement như thế nào?

**EN:** Server Actions work without JavaScript, enabling progressive enhancement for forms.

```tsx
// Works without JS, enhanced with JS
// app/contact/page.tsx
import { submitContact } from './actions';

export default function ContactPage() {
  return (
    <form action={submitContact}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">Send</button>
    </form>
  );
}

// app/contact/actions.ts
'use server';
import { redirect } from 'next/navigation';

export async function submitContact(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    message: formData.get('message') as string,
  };

  await db.contacts.create({ data });

  // Without JS: Full page redirect
  // With JS: Client-side navigation
  redirect('/contact/success');
}

// Enhanced version with client-side feedback
'use client';
import { useActionState } from 'react';

export function EnhancedForm() {
  const [state, action, pending] = useActionState(submitContact, null);

  return (
    <form action={action}>
      {/* Same fields, but with JS feedback */}
      <button disabled={pending}>
        {pending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
```

**VI:** Server Actions hoạt động không cần JavaScript, hỗ trợ progressive enhancement. Form submit bình thường khi không có JS, có feedback tốt hơn khi có JS.

---

## 58. How do you handle file uploads with Server Actions? / Làm thế nào xử lý file uploads với Server Actions?

**EN:** Use FormData to handle file uploads in Server Actions.

```tsx
// app/upload/page.tsx
import { uploadFile } from './actions';

export default function UploadPage() {
  return (
    <form action={uploadFile}>
      <input type="file" name="file" accept="image/*" required />
      <input type="text" name="description" placeholder="Description" />
      <button type="submit">Upload</button>
    </form>
  );
}

// app/upload/actions.ts
'use server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  const description = formData.get('description') as string;

  if (!file || file.size === 0) {
    return { error: 'No file provided' };
  }

  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { error: 'File too large' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Invalid file type' };
  }

  // Save file
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const path = join(process.cwd(), 'public/uploads', filename);

  await writeFile(path, buffer);

  // Save to database
  await db.files.create({
    data: { filename, description, size: file.size }
  });

  revalidatePath('/gallery');
  return { success: true, filename };
}
```

**VI:** Dùng FormData để xử lý file uploads. Validate file size, type trước khi lưu. Có thể lưu local hoặc upload lên cloud storage.

---

## 59. How do you implement useFormState with Zod validation? / Làm thế nào implement useFormState với Zod validation?

**EN:** Combine `useActionState` with Zod for type-safe form validation.

```tsx
// lib/schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// actions.ts
'use server';
import { registerSchema } from '@/lib/schemas';

export type FormState = {
  success?: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function register(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = Object.fromEntries(formData);
  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Create user...
  return { success: true, message: 'Account created!' };
}

// RegisterForm.tsx
'use client';
import { useActionState } from 'react';
import { register, FormState } from './actions';

export default function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    register,
    {}
  );

  return (
    <form action={action}>
      <input name="username" />
      {state.errors?.username?.map(e => <p key={e} className="error">{e}</p>)}

      <input name="email" type="email" />
      {state.errors?.email?.map(e => <p key={e} className="error">{e}</p>)}

      <input name="password" type="password" />
      {state.errors?.password?.map(e => <p key={e} className="error">{e}</p>)}

      <input name="confirmPassword" type="password" />
      {state.errors?.confirmPassword?.map(e => <p key={e} className="error">{e}</p>)}

      <button disabled={pending}>{pending ? 'Creating...' : 'Register'}</button>
      {state.success && <p className="success">{state.message}</p>}
    </form>
  );
}
```

**VI:** Kết hợp `useActionState` với Zod cho type-safe validation. Schema validate ở server, errors trả về client để hiển thị.

---

## 60. How does streaming work with nested Suspense? / Streaming hoạt động với nested Suspense như thế nào?

**EN:** Nested Suspense boundaries create a waterfall of progressive loading, each streaming independently.

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';

async function Header() {
  const user = await getUser(); // 100ms
  return <h1>Welcome, {user.name}</h1>;
}

async function Stats() {
  const stats = await getStats(); // 500ms
  return (
    <div>
      <Suspense fallback={<p>Loading chart...</p>}>
        <Chart data={stats} />  {/* 300ms more */}
      </Suspense>
    </div>
  );
}

async function Chart({ data }) {
  const chartData = await processChart(data); // 300ms
  return <canvas>{/* render chart */}</canvas>;
}

async function RecentActivity() {
  const activity = await getActivity(); // 800ms
  return <ul>{activity.map(a => <li key={a.id}>{a.text}</li>)}</ul>;
}

export default function Dashboard() {
  return (
    <div>
      {/* Streams at ~100ms */}
      <Suspense fallback={<p>Loading header...</p>}>
        <Header />
      </Suspense>

      {/* Streams at ~500ms, Chart at ~800ms */}
      <Suspense fallback={<p>Loading stats...</p>}>
        <Stats />
      </Suspense>

      {/* Streams at ~800ms (parallel with Stats) */}
      <Suspense fallback={<p>Loading activity...</p>}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}

// Timeline:
// 0ms    - Shell renders with all skeletons
// 100ms  - Header streams in
// 500ms  - Stats outer streams in (Chart skeleton shows)
// 800ms  - RecentActivity AND Chart stream in
```

**VI:** Nested Suspense tạo loading waterfall. Mỗi boundary stream độc lập. Outer component stream trước, nested components stream sau. Parallel fetches stream cùng lúc.

---

## 61. How do you implement skeleton loading with Suspense? / Làm thế nào implement skeleton loading với Suspense?

**EN:** Create skeleton components that match your content layout for smooth loading transitions.

```tsx
// components/skeletons.tsx
export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-t-lg" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-2" /> {/* Header */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-100 rounded mb-1" />
      ))}
    </div>
  );
}

// app/products/loading.tsx
import { CardSkeleton } from '@/components/skeletons';

export default function Loading() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// app/products/page.tsx
import { Suspense } from 'react';
import { CardSkeleton, TableSkeleton } from '@/components/skeletons';

export default function ProductsPage() {
  return (
    <div>
      <Suspense fallback={<div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
      </div>}>
        <ProductGrid />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <ProductTable />
      </Suspense>
    </div>
  );
}
```

**VI:** Tạo skeleton components khớp với layout content thật. Dùng animate-pulse cho hiệu ứng loading. Có thể dùng trong loading.tsx hoặc inline Suspense.

---

## 62. What is the difference between loading.tsx and Suspense boundaries? / Sự khác nhau giữa loading.tsx và Suspense boundaries?

**EN:** `loading.tsx` auto-wraps page in Suspense; inline Suspense gives granular control.

```tsx
// loading.tsx - Wraps entire page
// app/dashboard/loading.tsx
export default function Loading() {
  return <FullPageSkeleton />; // Shows until ALL page content loads
}

// app/dashboard/page.tsx
export default async function Page() {
  const data = await getData(); // loading.tsx shows during this
  return <Dashboard data={data} />;
}

// Suspense - Granular control
// app/dashboard/page.tsx
export default function Page() {
  return (
    <div>
      {/* This renders immediately */}
      <StaticHeader />

      {/* These stream independently */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>

      <StaticFooter />
    </div>
  );
}

// Combined approach
// app/dashboard/loading.tsx - Shows on first load
// page.tsx uses Suspense for streaming after shell loads

// Key differences:
// loading.tsx: Route-level, auto-applied, single skeleton
// Suspense: Component-level, manual, multiple skeletons
// loading.tsx = Suspense wrapper around page.tsx
```

**VI:** `loading.tsx` tự động wrap toàn bộ page trong Suspense, show 1 skeleton cho tất cả. Inline Suspense cho phép kiểm soát chi tiết, stream từng phần riêng biệt.

---

## 63. How do you catch errors at different levels? / Làm thế nào bắt lỗi ở các level khác nhau?

**EN:** Use error.tsx at different route segments for granular error handling.

```tsx
// Error hierarchy (innermost catches first)
app/
├── error.tsx           # Catches errors from page.tsx, not layout.tsx
├── global-error.tsx    # Catches root layout errors
├── layout.tsx
├── page.tsx
└── dashboard/
    ├── error.tsx       # Catches dashboard segment errors
    ├── layout.tsx
    └── page.tsx

// app/error.tsx - Root error boundary
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/dashboard/error.tsx - Dashboard-specific
'use client';

export default function DashboardError({ error, reset }) {
  return (
    <div className="dashboard-error">
      <h2>Dashboard Error</h2>
      <p>Failed to load dashboard data.</p>
      <button onClick={reset}>Retry</button>
      <Link href="/">Go Home</Link>
    </div>
  );
}

// Throwing errors
async function Page() {
  const data = await fetchData();
  if (!data) throw new Error('Failed to fetch data');
  return <div>{data}</div>;
}
```

**VI:** Đặt error.tsx ở các route segment khác nhau để xử lý lỗi chi tiết. Error innermost sẽ catch trước. error.tsx không catch lỗi từ layout cùng cấp.

---

## 64. How does global-error.tsx differ from error.tsx? / global-error.tsx khác error.tsx như thế nào?

**EN:** `global-error.tsx` catches root layout errors and must include full HTML structure.

```tsx
// app/global-error.tsx
'use client';

// MUST be a Client Component
// MUST include <html> and <body> tags
// Only active in production

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Critical Error</h1>
            <p className="mt-4">A critical error occurred in the application.</p>
            <p className="text-gray-500">Error ID: {error.digest}</p>
            <button
              onClick={reset}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

// When each is used:
// error.tsx: Catches errors in page.tsx and child components
// global-error.tsx: Catches errors in root layout.tsx

// Note: global-error.tsx is a fallback for catastrophic failures
// It replaces the entire app, including root layout
// Only works in production mode (dev shows error overlay)

// app/layout.tsx
export default function RootLayout({ children }) {
  // If this throws, global-error.tsx catches it
  const config = getConfig(); // If this fails, global-error shows
  return (
    <html><body>{children}</body></html>
  );
}
```

**VI:** `global-error.tsx` bắt lỗi từ root layout, phải có `<html>` và `<body>`. Chỉ hoạt động ở production. error.tsx không catch lỗi từ layout cùng cấp.

---

## 65. How do you handle errors in Server Actions? / Làm thế nào xử lý lỗi trong Server Actions?

**EN:** Return error state from actions or use try-catch with proper error handling.

```tsx
// Option 1: Return error state (recommended)
'use server';

type ActionResult = {
  success: boolean;
  error?: string;
  data?: any;
};

export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    const title = formData.get('title') as string;

    if (!title) {
      return { success: false, error: 'Title is required' };
    }

    const post = await db.posts.create({ data: { title } });
    revalidatePath('/posts');
    return { success: true, data: post };

  } catch (error) {
    // Log error internally
    console.error('Failed to create post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

// Option 2: Throw errors (caught by error.tsx)
export async function deletePost(id: string) {
  const post = await db.posts.findUnique({ where: { id } });

  if (!post) {
    throw new Error('Post not found');
  }

  await db.posts.delete({ where: { id } });
  revalidatePath('/posts');
}

// Client handling
'use client';

export function CreatePostForm() {
  const [state, action] = useActionState(createPost, { success: false });

  return (
    <form action={action}>
      <input name="title" />
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">Post created!</p>}
      <button>Create</button>
    </form>
  );
}

// For thrown errors, wrap in try-catch or let error.tsx handle
async function handleDelete(id: string) {
  try {
    await deletePost(id);
  } catch (error) {
    toast.error(error.message);
  }
}
```

**VI:** Hai cách: 1) Return error state từ action (recommended), 2) Throw error để error.tsx catch. Return error state cho UX tốt hơn với validation.

---

## 66. What is unstable_cache and when to use it? / unstable_cache là gì và khi nào sử dụng?

**EN:** `unstable_cache` caches non-fetch data like database queries with tags and revalidation.

```tsx
import { unstable_cache } from 'next/cache';

// Cache database queries
const getCachedPosts = unstable_cache(
  async (userId: string) => {
    return db.posts.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['user-posts'], // cache key parts
  {
    revalidate: 3600, // 1 hour
    tags: ['posts'], // for revalidateTag
  }
);

// Usage in Server Component
export default async function UserPosts({ userId }: { userId: string }) {
  const posts = await getCachedPosts(userId);
  return <PostList posts={posts} />;
}

// Revalidate with tag
'use server';
import { revalidateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  await db.posts.create({ data: { ... } });
  revalidateTag('posts'); // Invalidates getCachedPosts
}

// Cache with dynamic keys
const getCachedPost = unstable_cache(
  async (slug: string) => db.posts.findUnique({ where: { slug } }),
  ['post'], // Base key
  { tags: ['posts'] }
);

// Each unique argument creates a separate cache entry
await getCachedPost('hello-world'); // Cached separately
await getCachedPost('another-post'); // Cached separately
```

**VI:** `unstable_cache` cache non-fetch data như database queries. Hỗ trợ revalidate time và tags. Mỗi argument tạo cache entry riêng.

---

## 67. How do you implement on-demand revalidation patterns? / Làm thế nào implement on-demand revalidation patterns?

**EN:** Use `revalidatePath` and `revalidateTag` for targeted cache invalidation.

```tsx
// Pattern 1: Revalidate after mutation
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: FormData) {
  await db.products.update({ where: { id }, data: { ... } });

  // Revalidate specific page
  revalidatePath(`/products/${id}`);

  // Revalidate layout (and all child pages)
  revalidatePath('/products', 'layout');

  // Revalidate by tag (all fetches with this tag)
  revalidateTag('products');
  revalidateTag(`product-${id}`);
}

// Pattern 2: Webhook revalidation
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tag, path } = await request.json();

  if (tag) revalidateTag(tag);
  if (path) revalidatePath(path);

  return Response.json({ revalidated: true, now: Date.now() });
}

// Pattern 3: Tag hierarchy
fetch('/api/categories', { next: { tags: ['categories'] } });
fetch('/api/categories/electronics', {
  next: { tags: ['categories', 'category-electronics'] }
});

// Revalidate all categories
revalidateTag('categories');

// Revalidate only electronics
revalidateTag('category-electronics');
```

**VI:** Dùng `revalidatePath` cho pages/layouts cụ thể, `revalidateTag` cho fetch requests theo tag. Có thể tạo tag hierarchy cho revalidation chi tiết.

---

## 68. What are Time-based vs On-demand revalidation strategies? / Time-based vs On-demand revalidation strategies là gì?

**EN:** Choose between automatic time-based revalidation and manual on-demand invalidation.

```tsx
// Time-based (ISR - Incremental Static Regeneration)
// Good for: Content that updates periodically

// Page-level revalidation
export const revalidate = 3600; // Revalidate every hour

// Fetch-level revalidation
const posts = await fetch('/api/posts', {
  next: { revalidate: 60 } // Every minute
});

// On-demand revalidation
// Good for: Content that updates on user action

'use server';
export async function publishPost(id: string) {
  await db.posts.update({ where: { id }, data: { published: true } });
  revalidatePath('/blog');        // Revalidate immediately
  revalidateTag('posts');         // Invalidate all post caches
}

// Hybrid approach (recommended)
// Use time-based as fallback, on-demand for immediate updates

// Set long revalidation time
export const revalidate = 86400; // 24 hours

// But trigger on-demand when data changes
export async function updateSettings(data: FormData) {
  await db.settings.update({ ... });
  revalidatePath('/settings'); // Immediate update
}

// Comparison:
// Time-based:
// ✅ Automatic, no code needed
// ✅ Good for frequently changing data
// ❌ Stale until revalidation time
// ❌ Unnecessary revalidations if data unchanged

// On-demand:
// ✅ Immediate updates
// ✅ Only revalidate when needed
// ❌ Requires explicit calls
// ❌ Must track all places to revalidate
```

**VI:** Time-based: tự động revalidate theo thời gian, tốt cho data thay đổi đều đặn. On-demand: revalidate ngay khi cần, tốt cho user actions. Kết hợp cả hai là best practice.

---

## 69. What is Partial Prerendering (PPR) and how to enable it? / Partial Prerendering (PPR) là gì và cách bật?

**EN:** PPR combines static shell with dynamic streaming content in a single request.

```tsx
// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    ppr: true, // Enable PPR globally
    // Or ppr: 'incremental' for per-route opt-in
  },
};

// With incremental, opt-in per route:
// app/dashboard/page.tsx
export const experimental_ppr = true;

// How PPR works:
// 1. Static shell is prerendered at build time
// 2. Dynamic content is streamed at request time
// 3. Single HTTP request, progressive loading

// app/page.tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      {/* Static - Prerendered at build time */}
      <Header />
      <Navigation />

      {/* Dynamic - Streamed at request time */}
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile /> {/* Uses cookies(), headers(), etc. */}
      </Suspense>

      {/* Static */}
      <StaticContent />

      {/* Dynamic */}
      <Suspense fallback={<FeedSkeleton />}>
        <PersonalizedFeed />
      </Suspense>

      {/* Static */}
      <Footer />
    </div>
  );
}

// Benefits:
// - Fast TTFB (static shell served from CDN)
// - Dynamic personalization without full SSR
// - Progressive loading with Suspense
// - Best of static + dynamic rendering
```

**VI:** PPR kết hợp shell tĩnh (build time) với content động (request time) trong 1 request. Bật qua `experimental.ppr`. Suspense boundaries phân tách phần static và dynamic.

---

## 70. What are key features in Next.js 15? / Các tính năng chính trong Next.js 15 là gì?

**EN:** Next.js 15 brings major improvements to caching, async APIs, and React 19 support.

```tsx
// 1. Async Request APIs (breaking change)
// cookies(), headers(), params, searchParams are now async
import { cookies, headers } from 'next/headers';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const cookieStore = await cookies();
  const headersList = await headers();

  return <div>{slug} - {q}</div>;
}

// 2. Caching changes
// fetch() is no longer cached by default
fetch('/api/data'); // No caching (previously cached)
fetch('/api/data', { cache: 'force-cache' }); // Opt-in to caching

// GET Route Handlers are not cached by default
export async function GET() {
  return Response.json({ time: Date.now() }); // Dynamic
}
export const dynamic = 'force-static'; // Opt-in to caching

// 3. React 19 support
// - New 'use' hook
// - Actions support
// - Document metadata

// 4. Turbopack stable for development
// next dev --turbo (now stable)

// 5. Static Indicator
// Visual indicator shows if page is static/dynamic in dev

// 6. unstable_after API
import { unstable_after as after } from 'next/server';

export async function POST() {
  const result = await saveData();

  after(async () => {
    // Runs after response is sent
    await sendAnalytics();
    await sendNotification();
  });

  return Response.json(result);
}

// 7. instrumentation.js support
// app/instrumentation.ts
export async function register() {
  // Initialize monitoring, tracing, etc.
}
```

**VI:** Next.js 15: async request APIs (cookies, headers, params), fetch không cache mặc định, React 19 support, Turbopack stable, `unstable_after` cho background tasks. Cần migrate async params/searchParams.
