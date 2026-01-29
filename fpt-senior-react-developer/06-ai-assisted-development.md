# AI-Assisted Development - GitHub Copilot & Tools

> **Vị trí**: Senior/Lead React Developer - FPT Software
> **Ngôn ngữ phỏng vấn**: Tiếng Việt
> **Mục tiêu**: Hiểu và sử dụng hiệu quả AI tools trong development

---

## Mục lục

1. [Tổng quan AI-Assisted Development](#1-tổng-quan-ai-assisted-development)
2. [GitHub Copilot](#2-github-copilot)
3. [Copilot Best Practices](#3-copilot-best-practices)
4. [Các AI Tools khác](#4-các-ai-tools-khác)
5. [AI trong Development Workflow](#5-ai-trong-development-workflow)
6. [Câu hỏi phỏng vấn thường gặp](#6-câu-hỏi-phỏng-vấn-thường-gặp)

---

## 1. Tổng quan AI-Assisted Development

### 1.1 AI-Assisted Development là gì?

**AI-Assisted Development** là việc sử dụng AI tools để hỗ trợ quá trình phát triển phần mềm:
- Code completion
- Code generation
- Bug detection
- Documentation
- Code review
- Testing

### 1.2 Landscape của AI Development Tools

```
┌─────────────────────────────────────────────────────────────┐
│                 AI DEVELOPMENT TOOLS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CODE COMPLETION & GENERATION                                │
│  ├── GitHub Copilot (Microsoft/OpenAI)                      │
│  ├── Amazon CodeWhisperer                                    │
│  ├── Tabnine                                                │
│  └── Codeium                                                │
│                                                              │
│  CHAT-BASED ASSISTANTS                                       │
│  ├── GitHub Copilot Chat                                    │
│  ├── ChatGPT / Claude                                       │
│  ├── Cursor (AI-first IDE)                                  │
│  └── Claude Code (CLI)                                      │
│                                                              │
│  SPECIALIZED TOOLS                                           │
│  ├── Sourcegraph Cody (codebase search)                     │
│  ├── Codacy (code quality)                                  │
│  ├── Snyk (security)                                        │
│  └── Testim (test generation)                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Lợi ích của AI-Assisted Development

| Lợi ích | Mô tả |
|---------|-------|
| **Tăng tốc độ** | Viết code nhanh hơn với auto-completion |
| **Giảm boilerplate** | Generate code lặp lại tự động |
| **Learning** | Học patterns mới từ suggestions |
| **Consistency** | Maintain coding style nhất quán |
| **Documentation** | Tự động generate docs và comments |
| **Bug detection** | Phát hiện lỗi tiềm ẩn |

### 1.4 Limitations và Risks

| Risk | Mitigation |
|------|------------|
| **Incorrect code** | Luôn review và test |
| **Security vulnerabilities** | Security scanning |
| **License issues** | Kiểm tra source của suggestions |
| **Over-reliance** | Giữ skills và understanding |
| **Privacy concerns** | Hiểu data policy |

---

## 2. GitHub Copilot

### 2.1 GitHub Copilot là gì?

**GitHub Copilot** là AI pair programmer từ GitHub/Microsoft, sử dụng OpenAI Codex để:
- Suggest code completions
- Generate functions từ comments
- Explain code
- Fix bugs
- Write tests

### 2.2 Cài đặt và Setup

**VS Code:**
1. Install extension "GitHub Copilot"
2. Sign in với GitHub account
3. Subscription: $10/month (Individual) hoặc $19/month (Business)

**JetBrains IDEs:**
1. Settings → Plugins → Marketplace
2. Search "GitHub Copilot"
3. Install và sign in

### 2.3 Các tính năng chính

**1. Inline Suggestions:**
```typescript
// Gõ comment hoặc function signature
// Copilot sẽ suggest code

// Hàm validate email
function validateEmail(email: string): boolean {
  // Copilot suggests:
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**2. Multi-line Suggestions:**
```typescript
// Tạo hook useLocalStorage
// Copilot có thể generate toàn bộ hook

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

**3. Copilot Chat (VS Code):**
- Explain code: "Explain this function"
- Fix bugs: "Fix the bug in this code"
- Refactor: "Refactor this to use async/await"
- Generate tests: "Write tests for this function"

### 2.4 Keyboard Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| Accept suggestion | `Tab` | `Tab` |
| Dismiss suggestion | `Esc` | `Esc` |
| Next suggestion | `Option + ]` | `Alt + ]` |
| Previous suggestion | `Option + [` | `Alt + [` |
| Accept word | `Cmd + →` | `Ctrl + →` |
| Open Copilot panel | `Ctrl + Enter` | `Ctrl + Enter` |
| Copilot Chat | `Cmd + I` | `Ctrl + I` |

### 2.5 Copilot Commands (Chat)

```
/explain    - Giải thích code được chọn
/fix        - Suggest fix cho code
/tests      - Generate unit tests
/doc        - Generate documentation
/simplify   - Simplify complex code
```

**Ví dụ sử dụng:**
```typescript
// Chọn đoạn code, mở Copilot Chat
// Gõ: /explain

// Copilot sẽ giải thích:
// "This function implements a debounce pattern..."
```

---

## 3. Copilot Best Practices

### 3.1 Writing Effective Prompts

**Comment-driven development:**

```typescript
// ❌ Bad: Vague comment
// Handle form

// ✅ Good: Specific, detailed comment
// Validate registration form with:
// - Email: required, valid format
// - Password: min 8 chars, 1 uppercase, 1 number
// - Confirm password: must match password
// Return object with isValid and errors array

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateRegistrationForm(
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult {
  // Copilot will generate based on your specification
}
```

**Function signature hints:**

```typescript
// Copilot understands types and generates accordingly

// ❌ Less context
function process(data) {
  // Copilot doesn't know what to do
}

// ✅ More context
function processUserOrders(
  userId: string,
  orders: Order[],
  options?: { includeRefunds: boolean }
): ProcessedOrderSummary {
  // Copilot understands the structure
}
```

### 3.2 Effective Patterns

**1. Start with interface/types:**
```typescript
// Define types first - Copilot will use them
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

// Now Copilot can generate type-safe functions
function calculateCartTotal(items: CartItem[]): number {
  // Copilot will suggest:
  return items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
}
```

**2. Examples in comments:**
```typescript
// Parse price string to number
// Examples:
// "1,234.56" -> 1234.56
// "$1,234.56" -> 1234.56
// "1.234,56" (EU format) -> 1234.56

function parsePrice(priceString: string): number {
  // Copilot generates handling for all cases
}
```

**3. Edge cases specification:**
```typescript
// Find user by ID
// - Returns user object if found
// - Returns null if not found
// - Throws error if ID is invalid format

async function findUserById(id: string): Promise<User | null> {
  // Copilot handles edge cases
}
```

### 3.3 Code Review với AI

```typescript
// Code cần review
function processData(data) {
  var result = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].active == true) {
      result.push(data[i].value);
    }
  }
  return result;
}

// Sử dụng Copilot Chat:
// "Review this code for improvements"

// Copilot suggests:
// 1. Use const instead of var
// 2. Use === instead of ==
// 3. Use filter/map instead of for loop
// 4. Add TypeScript types

// Improved version:
function processData(data: DataItem[]): number[] {
  return data
    .filter((item) => item.active === true)
    .map((item) => item.value);
}
```

### 3.4 Test Generation

```typescript
// Original function
function calculateDiscount(
  price: number,
  discountPercent: number,
  maxDiscount?: number
): number {
  const discount = price * (discountPercent / 100);
  if (maxDiscount && discount > maxDiscount) {
    return price - maxDiscount;
  }
  return price - discount;
}

// Sử dụng Copilot: /tests
// Copilot generates:

describe('calculateDiscount', () => {
  it('should calculate discount correctly', () => {
    expect(calculateDiscount(100, 10)).toBe(90);
  });

  it('should apply max discount limit', () => {
    expect(calculateDiscount(100, 50, 20)).toBe(80);
  });

  it('should handle zero discount', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });

  it('should handle 100% discount', () => {
    expect(calculateDiscount(100, 100)).toBe(0);
  });

  it('should not apply max discount if not exceeded', () => {
    expect(calculateDiscount(100, 10, 50)).toBe(90);
  });
});
```

### 3.5 Documentation Generation

```typescript
// Sử dụng Copilot: /doc

// Before
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// After (Copilot generated)
/**
 * Creates a debounced version of a function that delays execution
 * until after a specified wait time has elapsed since the last call.
 *
 * @template T - The function type
 * @param {T} fn - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {(...args: Parameters<T>) => void} - The debounced function
 *
 * @example
 * const debouncedSearch = debounce(search, 300);
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

### 3.6 Những điều cần tránh

```typescript
// ❌ Không accept suggestion mù quáng
// Luôn review logic và security

// ❌ Không dựa hoàn toàn vào Copilot cho:
// - Security-critical code (auth, encryption)
// - Business logic phức tạp
// - Performance-critical sections

// ❌ Không copy proprietary code
// Copilot trained trên public repos

// ✅ Luôn:
// - Review suggestions
// - Test generated code
// - Understand what code does
// - Check for security issues
```

---

## 4. Các AI Tools khác

### 4.1 Amazon CodeWhisperer

**Đặc điểm:**
- Free tier available
- AWS integration tốt
- Security scanning built-in
- Reference tracking

```typescript
// CodeWhisperer hoạt động tương tự Copilot
// Đặc biệt mạnh với AWS SDK

// Comment để generate
// Upload file to S3 bucket

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function uploadToS3(
  bucket: string,
  key: string,
  body: Buffer
): Promise<void> {
  const client = new S3Client({ region: 'ap-southeast-1' });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
  });
  await client.send(command);
}
```

### 4.2 Cursor IDE

**Đặc điểm:**
- AI-first IDE (fork of VS Code)
- Chat với codebase context
- Multi-file editing
- Codebase understanding

```
// Cursor Commands
Cmd+K    - AI edit selection
Cmd+L    - Chat with AI
@file    - Reference specific file
@codebase - Search entire codebase
```

### 4.3 Claude (Anthropic)

**Đặc điểm:**
- Long context window (200K tokens)
- Tốt cho explaining và reviewing
- Web interface + API

**Use cases:**
- Complex code review
- Architecture discussions
- Documentation writing
- Learning new concepts

### 4.4 ChatGPT / GPT-4

**Đặc điểm:**
- General purpose
- Good for explanations
- Custom GPTs
- Plugin ecosystem

**Use cases:**
- Quick questions
- Code snippets
- Regex help
- Algorithm explanations

### 4.5 So sánh các tools

| Tool | Best For | Pricing | Context |
|------|----------|---------|---------|
| **Copilot** | Real-time completion | $10/mo | File context |
| **Cursor** | Multi-file editing | $20/mo | Codebase |
| **Claude** | Long documents, review | $20/mo | 200K tokens |
| **ChatGPT** | Quick Q&A | $20/mo | Conversation |
| **CodeWhisperer** | AWS code | Free tier | File context |

---

## 5. AI trong Development Workflow

### 5.1 Development Workflow với AI

```
┌─────────────────────────────────────────────────────────────┐
│                  AI-ENHANCED WORKFLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PLANNING & DESIGN                                        │
│     └── Claude/ChatGPT: Architecture discussions             │
│                                                              │
│  2. CODING                                                   │
│     ├── Copilot: Real-time completion                       │
│     └── Cursor: Multi-file changes                          │
│                                                              │
│  3. TESTING                                                  │
│     ├── Copilot: Generate test cases                        │
│     └── AI: Suggest edge cases                              │
│                                                              │
│  4. CODE REVIEW                                              │
│     ├── AI: Automated review                                │
│     └── Security scanning                                   │
│                                                              │
│  5. DOCUMENTATION                                            │
│     └── AI: Generate docs from code                         │
│                                                              │
│  6. DEBUGGING                                                │
│     └── AI: Explain errors, suggest fixes                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 AI cho Code Review

```typescript
// Prompt cho Claude/ChatGPT:
// "Review this React component for:
// 1. Performance issues
// 2. Security vulnerabilities
// 3. Best practices
// 4. Accessibility"

function UserList({ users }) {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search)
  );

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filteredUsers.map(user => (
        <div onClick={() => selectUser(user.id)}>
          {user.name}
        </div>
      ))}
    </div>
  );
}

// AI Review Output:
// 1. Performance: useMemo for filteredUsers
// 2. Missing key in map
// 3. Accessibility: use button instead of div for click
// 4. XSS: sanitize search input
// 5. useCallback for onChange
```

### 5.3 AI cho Debugging

```typescript
// Error message từ console:
// "TypeError: Cannot read property 'map' of undefined"

// Prompt cho AI:
// "I'm getting this error. Here's my code:"

function ProductList({ products }) {
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}

// AI Response:
// The error occurs because 'products' is undefined.
// Solutions:
// 1. Add default prop: products = []
// 2. Add early return: if (!products) return null;
// 3. Use optional chaining: products?.map(...)
// 4. Check API response before passing

// Fixed code:
function ProductList({ products = [] }) {
  if (!products.length) {
    return <p>No products found</p>;
  }

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

### 5.4 AI cho Learning

```typescript
// Prompt: "Explain React Server Components vs Client Components"

// AI explains:
// Server Components (default in Next.js 13+):
// - Render on server only
// - No bundle to client
// - Can directly access database
// - Cannot use hooks, events

// Client Components ('use client'):
// - Render on client
// - Included in JS bundle
// - Can use hooks, events
// - For interactivity

// Use Server for:
// - Data fetching
// - Static content
// - SEO content

// Use Client for:
// - User interactions
// - Browser APIs
// - State management
```

### 5.5 Team Guidelines cho AI Tools

```markdown
## AI Tools Usage Guidelines

### Approved Tools
- GitHub Copilot (company license)
- Cursor (approved for specific projects)

### Usage Rules
1. **Code Review Required**: All AI-generated code must be reviewed
2. **No Sensitive Data**: Don't paste credentials, PII in prompts
3. **Attribution**: Comment when significant AI assistance used
4. **Testing**: AI code must have tests
5. **Security**: Run security scan on generated code

### Best Practices
- Use for boilerplate, not core logic
- Understand code before accepting
- Verify suggestions against docs
- Don't blindly trust AI for security

### Prohibited
- Pasting proprietary code to public AI
- Using AI output without review
- Relying on AI for security decisions
```

---

## 6. Câu hỏi phỏng vấn thường gặp

### Câu hỏi 1: "Bạn có kinh nghiệm với AI development tools không? Dùng như thế nào?"

**Trả lời:**
> "Tôi sử dụng GitHub Copilot daily trong workflow của mình.
>
> **Các use cases chính:**
> 1. **Boilerplate code**: Generate CRUD functions, form handling
> 2. **Test generation**: Viết unit tests nhanh hơn
> 3. **Documentation**: Generate JSDoc comments
> 4. **Refactoring**: Convert code patterns (callbacks → async/await)
>
> **Workflow của tôi:**
> - Viết comment mô tả function cần làm gì
> - Review suggestion, adjust nếu cần
> - Chạy tests để verify
>
> **Productivity impact:**
> - Boilerplate code: ~50% faster
> - Test writing: ~40% faster
> - Learning new APIs: faster with explanations
>
> **Quan trọng là tôi luôn review và hiểu code trước khi accept, không trust mù quáng.**"

---

### Câu hỏi 2: "Ưu và nhược điểm của việc dùng AI tools trong development?"

**Trả lời:**
> "**Ưu điểm:**
> - **Tăng productivity**: Code nhanh hơn, đặc biệt boilerplate
> - **Learning tool**: Học patterns mới từ suggestions
> - **Consistency**: Maintain coding style
> - **Documentation**: Auto-generate docs
> - **Testing**: Generate test cases nhanh
>
> **Nhược điểm:**
> - **Incorrect code**: AI có thể suggest code sai
> - **Security risks**: Có thể generate vulnerable code
> - **Over-reliance**: Dev có thể giảm kỹ năng problem-solving
> - **Privacy**: Code có thể được gửi lên cloud
> - **License concerns**: Training data có thể có copyrighted code
>
> **Cách tôi mitigate:**
> - Luôn review code
> - Chạy security scan
> - Không dùng cho sensitive logic
> - Hiểu code trước khi accept
> - Giữ fundamentals strong"

---

### Câu hỏi 3: "Làm sao để sử dụng Copilot hiệu quả?"

**Trả lời:**
> "Có một số techniques tôi dùng:
>
> **1. Comment-driven development:**
> - Viết comment chi tiết mô tả function
> - Include examples và edge cases
> - Copilot generate based on context
>
> **2. Type-first approach:**
> - Define interfaces/types trước
> - Copilot sẽ generate type-safe code
>
> **3. Incremental acceptance:**
> - Dùng Cmd+→ để accept từng word
> - Không accept toàn bộ nếu chưa chắc
>
> **4. Multiple suggestions:**
> - Dùng Option+] để xem suggestions khác
> - Chọn option phù hợp nhất
>
> **5. Copilot Chat:**
> - /explain cho code phức tạp
> - /tests để generate tests
> - /fix cho bug fixes
>
> **Key mindset: Copilot là pair programmer, không phải replacement. Vẫn cần review và understand code.**"

---

### Câu hỏi 4: "Có lo ngại về security khi dùng AI tools không?"

**Trả lời:**
> "Có, và tôi có các measures để handle:
>
> **Concerns:**
> 1. **Data leakage**: Code gửi lên servers
> 2. **Vulnerable suggestions**: AI generate insecure code
> 3. **License issues**: Training data có copyright
>
> **Mitigation strategies:**
> 1. **Enterprise plans**: Copilot Business không dùng code để train
> 2. **Code review**: Double-check security-sensitive code
> 3. **Security scanning**: Chạy SAST/DAST trên generated code
> 4. **Sensitive data**: Không paste credentials, PII
> 5. **Critical paths**: Manual code cho auth, payment
>
> **Team guidelines:**
> - Approved tools list
> - Security review cho AI-generated code
> - No proprietary code to public AI
> - Training cho team về risks"

---

### Câu hỏi 5: "AI sẽ replace developers không?"

**Trả lời:**
> "Theo quan điểm của tôi, AI sẽ **augment** chứ không **replace** developers.
>
> **AI giỏi:**
> - Boilerplate code
> - Pattern completion
> - Documentation
> - Simple transformations
>
> **AI yếu:**
> - Complex architecture decisions
> - Understanding business context
> - Debugging tricky issues
> - Innovation và creativity
> - Communication với stakeholders
>
> **Tương lai:**
> - Developers sẽ focus vào high-level decisions
> - AI handle routine tasks
> - Productivity tăng, không phải headcount giảm
> - New skills: prompt engineering, AI collaboration
>
> **Advice:**
> - Embrace AI tools
> - Giữ fundamentals strong
> - Focus on problem-solving skills
> - Learn to work WITH AI effectively"

---

### Câu hỏi 6: "Bạn dùng AI tools trong project thực tế như thế nào?"

**Trả lời (ví dụ):**
> "Trong dự án e-commerce gần đây:
>
> **Use cases:**
> 1. **Component generation**: Copilot generate boilerplate components
> 2. **API integration**: Generate fetch functions từ OpenAPI spec
> 3. **Testing**: Generate test cases cho utils
> 4. **Type definitions**: Generate types từ API responses
>
> **Workflow:**
> ```
> 1. Define types/interfaces
> 2. Write descriptive comments
> 3. Accept Copilot suggestions
> 4. Review và adjust
> 5. Write tests (với AI help)
> 6. Security review
> ```
>
> **Results:**
> - Development speed tăng ~30%
> - Test coverage tăng (vì dễ generate)
> - Consistent code style
>
> **Lessons learned:**
> - AI suggestions không luôn optimal
> - Review là bắt buộc
> - Best for routine tasks
> - Team training cần thiết"

---

## Tài liệu tham khảo

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Amazon CodeWhisperer](https://aws.amazon.com/codewhisperer/)
- [Cursor IDE](https://cursor.sh/)
- [Anthropic Claude](https://www.anthropic.com/claude)
- [AI Pair Programming Best Practices](https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/)
