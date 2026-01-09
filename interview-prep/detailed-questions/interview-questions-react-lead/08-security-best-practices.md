# 08 - Security & Best Practices

> **8 câu hỏi chuyên sâu về Security trong React Applications**

---

## Q8.1: XSS Prevention trong React

### Câu hỏi
React có tự động prevent XSS không? Những trường hợp nào vẫn vulnerable?

### Trả lời

#### React's Default Protection

```typescript
// React automatically escapes values in JSX
function SafeComponent() {
  const userInput = '<script>alert("XSS")</script>';

  // ✅ SAFE - React escapes this
  return <div>{userInput}</div>;
  // Renders as: &lt;script&gt;alert("XSS")&lt;/script&gt;
}
```

#### Vulnerable Cases

```typescript
// ❌ DANGEROUS: dangerouslySetInnerHTML
function UnsafeHTML({ htmlContent }: { htmlContent: string }) {
  // This bypasses React's XSS protection
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

// ✅ SAFE: Use DOMPurify to sanitize
import DOMPurify from 'dompurify';

function SafeHTML({ htmlContent }: { htmlContent: string }) {
  const sanitizedHTML = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
}

// ❌ DANGEROUS: href with javascript:
function UnsafeLink({ url }: { url: string }) {
  // User could input: javascript:alert('XSS')
  return <a href={url}>Click me</a>;
}

// ✅ SAFE: Validate URL protocol
function SafeLink({ url }: { url: string }) {
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  if (!isValidUrl(url)) {
    return <span>Invalid URL</span>;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      Click me
    </a>
  );
}

// ❌ DANGEROUS: Dynamic attribute names
function UnsafeAttributes({ attrs }: { attrs: Record<string, string> }) {
  // Could set dangerous attributes like onError, onClick
  return <div {...attrs}>Content</div>;
}

// ✅ SAFE: Whitelist allowed attributes
const ALLOWED_ATTRIBUTES = ['className', 'id', 'data-testid', 'aria-label'];

function SafeAttributes({ attrs }: { attrs: Record<string, string> }) {
  const safeAttrs = Object.fromEntries(
    Object.entries(attrs).filter(([key]) => ALLOWED_ATTRIBUTES.includes(key))
  );

  return <div {...safeAttrs}>Content</div>;
}

// ❌ DANGEROUS: eval() or new Function()
function UnsafeEval({ code }: { code: string }) {
  // Never do this!
  eval(code);
  return null;
}

// ❌ DANGEROUS: innerHTML on ref
function UnsafeRef() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // Bypasses React's protection
      ref.current.innerHTML = userInput;
    }
  }, [userInput]);

  return <div ref={ref} />;
}
```

#### Content Security Policy

```typescript
// Next.js CSP configuration
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://trusted-cdn.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.example.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};
```

---

## Q8.2: Authentication và Authorization Best Practices

### Câu hỏi
Implement secure authentication flow trong React application như thế nào?

### Trả lời

#### JWT Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. LOGIN                                                   │
│   ┌──────┐         ┌──────┐         ┌──────┐               │
│   │Client│ ──────▶ │Server│ ──────▶ │  DB  │               │
│   │      │ email/  │      │ verify  │      │               │
│   │      │ pass    │      │ creds   │      │               │
│   └──────┘         └──────┘         └──────┘               │
│       ▲                │                                     │
│       │    JWT tokens  │                                     │
│       └────────────────┘                                     │
│                                                              │
│   2. TOKEN STORAGE                                          │
│   ├── Access Token → Memory only (short-lived)              │
│   └── Refresh Token → HttpOnly Cookie (long-lived)          │
│                                                              │
│   3. API REQUESTS                                           │
│   Authorization: Bearer <access_token>                       │
│                                                              │
│   4. TOKEN REFRESH                                          │
│   When access token expires → Use refresh token             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Secure Auth Implementation

```typescript
// auth/authService.ts
interface AuthTokens {
  accessToken: string;
  expiresAt: number;
}

class AuthService {
  private tokens: AuthTokens | null = null;
  private refreshPromise: Promise<void> | null = null;

  async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Important for cookies
    });

    if (!response.ok) {
      throw new AuthError('Invalid credentials');
    }

    const data = await response.json();

    // Store access token in memory only
    this.tokens = {
      accessToken: data.accessToken,
      expiresAt: Date.now() + data.expiresIn * 1000
    };

    // Refresh token is set as HttpOnly cookie by server

    return data.user;
  }

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    this.tokens = null;
  }

  async getAccessToken(): Promise<string | null> {
    // Check if token is expired or about to expire
    if (!this.tokens || this.tokens.expiresAt < Date.now() + 60000) {
      await this.refreshTokens();
    }

    return this.tokens?.accessToken || null;
  }

  private async refreshTokens(): Promise<void> {
    // Prevent multiple simultaneous refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<void> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      this.tokens = null;
      throw new AuthError('Session expired');
    }

    const data = await response.json();

    this.tokens = {
      accessToken: data.accessToken,
      expiresAt: Date.now() + data.expiresIn * 1000
    };
  }
}

export const authService = new AuthService();

// auth/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await authService.getAccessToken();
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const userData = await authService.login(email, password);
    setUser(userData);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Role-based access
interface RequireRoleProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage
<ProtectedRoute>
  <RequireRole roles={['admin', 'manager']}>
    <AdminDashboard />
  </RequireRole>
</ProtectedRoute>
```

---

## Q8.3: CSRF Protection

### Câu hỏi
Làm thế nào để protect React app khỏi CSRF attacks?

### Trả lời

```typescript
// CSRF Token Implementation
// The server should:
// 1. Generate CSRF token and send in cookie
// 2. Expect token in request header

// api/csrfClient.ts
async function getCsrfToken(): Promise<string> {
  // Get CSRF token from cookie
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith('XSRF-TOKEN='));

  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  }

  // If no cookie, fetch from server
  const response = await fetch('/api/csrf-token', {
    credentials: 'include'
  });

  const data = await response.json();
  return data.token;
}

// Axios interceptor for CSRF
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true
});

apiClient.interceptors.request.use(async (config) => {
  // Only add CSRF token for state-changing methods
  if (['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
    const csrfToken = await getCsrfToken();
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
});

// React Query with CSRF
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onMutate: async () => {
        // Ensure CSRF token is fresh before mutations
        await getCsrfToken();
      }
    }
  }
});

// Custom fetch with CSRF
async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = await getCsrfToken();

    options.headers = {
      ...options.headers,
      'X-XSRF-TOKEN': csrfToken
    };
  }

  return fetch(url, {
    ...options,
    credentials: 'include'
  });
}
```

#### SameSite Cookie Configuration

```typescript
// Server-side cookie settings (Express example)
app.use(session({
  cookie: {
    httpOnly: true,      // Prevent JavaScript access
    secure: true,        // HTTPS only
    sameSite: 'strict',  // Prevent CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// For JWT refresh tokens
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth/refresh', // Limit to refresh endpoint
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

---

## Q8.4: Sensitive Data Handling

### Câu hỏi
Làm thế nào để handle sensitive data an toàn trong React?

### Trả lời

```typescript
// ❌ NEVER store sensitive data in:
// - localStorage (accessible via XSS)
// - sessionStorage (accessible via XSS)
// - Redux store (can be inspected)
// - URL parameters (logged, cached)
// - Console logs (visible in dev tools)

// ✅ DO: Store tokens in memory only
class SecureStorage {
  private data: Map<string, string> = new Map();

  set(key: string, value: string): void {
    this.data.set(key, value);
  }

  get(key: string): string | undefined {
    return this.data.get(key);
  }

  delete(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

export const secureStorage = new SecureStorage();

// Clear on tab close/refresh
window.addEventListener('beforeunload', () => {
  secureStorage.clear();
});

// ✅ DO: Mask sensitive data in UI
function MaskedInput({
  value,
  onChange,
  showLast = 4
}: {
  value: string;
  onChange: (value: string) => void;
  showLast?: number;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  const maskedValue = isRevealed
    ? value
    : '•'.repeat(Math.max(0, value.length - showLast)) + value.slice(-showLast);

  return (
    <div className="masked-input">
      <input
        type={isRevealed ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setIsRevealed(!isRevealed)}
        aria-label={isRevealed ? 'Hide' : 'Show'}
      >
        {isRevealed ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

// ✅ DO: Sanitize data before logging
const sanitizeForLogging = (data: Record<string, unknown>): Record<string, unknown> => {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'ssn', 'credit'];

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      const isSensitive = sensitiveKeys.some(k =>
        key.toLowerCase().includes(k)
      );

      return [key, isSensitive ? '[REDACTED]' : value];
    })
  );
};

// Usage in error reporting
Sentry.init({
  beforeSend(event) {
    if (event.extra) {
      event.extra = sanitizeForLogging(event.extra as Record<string, unknown>);
    }
    return event;
  }
});

// ✅ DO: Clear clipboard after paste
function SecurePasteInput({ onPaste }: { onPaste: (value: string) => void }) {
  const handlePaste = async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    onPaste(pastedText);

    // Clear clipboard after a short delay
    setTimeout(async () => {
      try {
        await navigator.clipboard.writeText('');
      } catch {
        // Clipboard API may not be available
      }
    }, 100);
  };

  return <input onPaste={handlePaste} />;
}

// ✅ DO: Auto-clear sensitive data after timeout
function useAutoExpire<T>(
  value: T | null,
  setter: (value: T | null) => void,
  timeoutMs: number = 300000 // 5 minutes
) {
  useEffect(() => {
    if (value === null) return;

    const timer = setTimeout(() => {
      setter(null);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [value, setter, timeoutMs]);
}
```

---

## Q8.5: API Security Best Practices

### Câu hỏi
Những best practices nào khi gọi APIs từ React?

### Trả lời

```typescript
// Secure API Client
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token
    const token = await authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracing
    config.headers['X-Request-ID'] = crypto.randomUUID();

    // Add timestamp to prevent replay attacks
    config.headers['X-Timestamp'] = Date.now().toString();

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authService.refreshTokens();
        const token = await authService.getAccessToken();

        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.warn(`Rate limited. Retry after ${retryAfter}s`);
    }

    return Promise.reject(error);
  }
);

// Input validation before API calls
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[a-z]/, 'Password must contain lowercase')
    .regex(/[0-9]/, 'Password must contain number')
});

async function createUser(data: unknown) {
  // Validate input
  const validated = CreateUserSchema.parse(data);

  // Send to API
  return apiClient.post('/users', validated);
}

// Rate limiting on client side
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove old timestamps
    const validTimestamps = timestamps.filter(t => now - t < this.windowMs);

    if (validTimestamps.length >= this.limit) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return true;
  }
}

const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

async function rateLimitedFetch(url: string, options?: RequestInit) {
  if (!rateLimiter.canMakeRequest(url)) {
    throw new Error('Rate limit exceeded');
  }

  return fetch(url, options);
}
```

---

## Q8.6: Third-party Dependencies Security

### Câu hỏi
Làm thế nào để đảm bảo security khi sử dụng third-party packages?

### Trả lời

```bash
# Regular security audits
npm audit
npm audit fix

# Use Snyk for deeper analysis
npx snyk test
npx snyk monitor

# Check for outdated packages
npm outdated
```

```json
// package.json - Security configurations
{
  "scripts": {
    "preinstall": "npx npm-force-resolutions",
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix",
    "check-deps": "npx depcheck",
    "check-licenses": "npx license-checker --summary"
  },
  "resolutions": {
    // Force specific versions for security fixes
    "lodash": "^4.17.21",
    "minimist": "^1.2.6"
  }
}
```

```javascript
// .npmrc - Security settings
audit=true
fund=false
save-exact=true
package-lock=true

// Deny scripts from untrusted packages
ignore-scripts=true
```

```yaml
# GitHub Dependabot configuration
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
    commit-message:
      prefix: "chore(deps):"
    ignore:
      # Ignore major version updates for stability
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

```typescript
// Validate external resources
// Safe iframe embedding
function SafeIframe({ src, title }: { src: string; title: string }) {
  const trustedDomains = ['youtube.com', 'vimeo.com', 'maps.google.com'];

  const isValidSource = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return trustedDomains.some(domain =>
        parsed.hostname.endsWith(domain)
      );
    } catch {
      return false;
    }
  };

  if (!isValidSource(src)) {
    return <div>Invalid embed source</div>;
  }

  return (
    <iframe
      src={src}
      title={title}
      sandbox="allow-scripts allow-same-origin"
      referrerPolicy="no-referrer"
      loading="lazy"
    />
  );
}

// Subresource Integrity for CDN resources
// In index.html
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>
```

---

## Q8.7: Secure Forms và User Input

### Câu hỏi
Best practices nào cho việc handle user input an toàn?

### Trả lời

```typescript
// Input validation and sanitization
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Schema validation
const ContactFormSchema = z.object({
  name: z.string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),

  email: z.string()
    .email()
    .max(255),

  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Invalid phone format')
    .optional(),

  message: z.string()
    .min(10)
    .max(5000)
    .transform(val => DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })),

  website: z.string()
    .url()
    .optional()
    .refine(url => {
      if (!url) return true;
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    }, 'Invalid URL protocol')
});

// React Hook Form with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(ContactFormSchema)
  });

  const onSubmit = async (data: z.infer<typeof ContactFormSchema>) => {
    // Data is already validated and sanitized
    await submitForm(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          {...register('name')}
          autoComplete="name"
          maxLength={100}
        />
        {errors.name && <span role="alert">{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          autoComplete="email"
          maxLength={255}
        />
        {errors.email && <span role="alert">{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          {...register('message')}
          maxLength={5000}
          rows={5}
        />
        {errors.message && <span role="alert">{errors.message.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}

// File upload validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 5MB)' };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }

  // Check file signature (magic bytes)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);
      const header = arr.slice(0, 4).join(' ');

      const validSignatures: Record<string, string[]> = {
        'image/jpeg': ['255 216 255'],
        'image/png': ['137 80 78 71'],
        'application/pdf': ['37 80 68 70']
      };

      const expectedSignatures = validSignatures[file.type] || [];
      const isValid = expectedSignatures.some(sig => header.startsWith(sig));

      resolve({
        valid: isValid,
        error: isValid ? undefined : 'File content does not match type'
      });
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

// Secure file upload component
function SecureFileUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsValidating(true);
    setError(null);

    try {
      const validation = await validateFile(file);

      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        e.target.value = ''; // Clear input
        return;
      }

      onUpload(file);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFileChange}
        disabled={isValidating}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

---

## Q8.8: Security Headers và HTTPS

### Câu hỏi
Những security headers nào cần configure cho React app?

### Trả lời

```typescript
// Security headers configuration
// For Next.js - next.config.js
const securityHeaders = [
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },

  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },

  // Enable XSS filter (legacy browsers)
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },

  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },

  // Permissions Policy (formerly Feature Policy)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },

  // HSTS - Force HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },

  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.example.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.example.com https://sentry.io",
      "frame-src 'self' https://www.youtube.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};

// For Express/Node.js backend
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      connectSrc: ["'self'", 'api.example.com'],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// nginx configuration
server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL configuration
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';" always;

    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

---

## Tổng kết Security Checklist

```
┌─────────────────────────────────────────────────────────────┐
│                 SECURITY CHECKLIST                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   XSS Prevention                                            │
│   □ Never use dangerouslySetInnerHTML without sanitization │
│   □ Validate URLs before using in href                      │
│   □ Use Content Security Policy                             │
│                                                              │
│   Authentication                                             │
│   □ Store tokens in memory, not localStorage                │
│   □ Use HttpOnly cookies for refresh tokens                 │
│   □ Implement proper token refresh flow                     │
│   □ Clear sensitive data on logout                          │
│                                                              │
│   CSRF Protection                                            │
│   □ Use CSRF tokens for state-changing requests             │
│   □ Set SameSite cookie attribute                           │
│   □ Verify Origin/Referer headers server-side               │
│                                                              │
│   API Security                                               │
│   □ Validate all inputs client and server side              │
│   □ Implement rate limiting                                 │
│   □ Use HTTPS everywhere                                    │
│   □ Set appropriate CORS policies                           │
│                                                              │
│   Dependencies                                               │
│   □ Regular npm audit                                       │
│   □ Use Dependabot/Snyk                                     │
│   □ Pin dependency versions                                 │
│   □ Review new packages before installing                   │
│                                                              │
│   Headers                                                    │
│   □ HSTS enabled                                            │
│   □ X-Frame-Options set                                     │
│   □ X-Content-Type-Options set                              │
│   □ CSP configured                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Takeaways:**
1. React provides default XSS protection but has escape hatches
2. Never store sensitive tokens in localStorage
3. Use HttpOnly cookies with SameSite for auth tokens
4. Always validate input on both client and server
5. Keep dependencies updated and audited
6. Configure proper security headers
