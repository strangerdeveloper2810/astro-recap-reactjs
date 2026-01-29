# AI Coding với Claude & Cursor - Hướng dẫn thực tế

> **Dành cho**: Senior Developer muốn sử dụng AI hiệu quả
> **Focus**: Claude (Anthropic) và Cursor IDE
> **Ngôn ngữ**: Tiếng Việt

---

## Mục lục

1. [Tổng quan AI Coding Tools 2024-2025](#1-tổng-quan-ai-coding-tools-2024-2025)
2. [Claude - Cách sử dụng hiệu quả](#2-claude---cách-sử-dụng-hiệu-quả)
3. [Cursor IDE - AI-first Editor](#3-cursor-ide---ai-first-editor)
4. [Best Practices khi code với AI](#4-best-practices-khi-code-với-ai)
5. [Workflow thực tế](#5-workflow-thực-tế)
6. [Câu hỏi phỏng vấn](#6-câu-hỏi-phỏng-vấn)

---

## 1. Tổng quan AI Coding Tools 2024-2025

### 1.1 Landscape hiện tại

```
┌─────────────────────────────────────────────────────────────┐
│              AI CODING TOOLS LANDSCAPE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CHAT-BASED (Conversation)                                  │
│  ├── Claude (Anthropic) ⭐ - Best for reasoning, long code  │
│  ├── ChatGPT/GPT-4 (OpenAI) - Popular, versatile           │
│  └── Gemini (Google) - Good with Google ecosystem           │
│                                                              │
│  IDE-INTEGRATED                                              │
│  ├── Cursor ⭐ - AI-first IDE, best DX                      │
│  ├── GitHub Copilot - Inline completion, popular            │
│  ├── Codeium - Free alternative                             │
│  └── Amazon CodeWhisperer - AWS focused                     │
│                                                              │
│  CLI-BASED                                                   │
│  ├── Claude Code (Anthropic) - Terminal AI assistant        │
│  ├── Aider - Git-aware AI coding                            │
│  └── Continue - Open source                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 So sánh nhanh

| Tool | Best For | Context | Price |
|------|----------|---------|-------|
| **Claude** | Complex reasoning, long code | 200K tokens | $20/mo |
| **Cursor** | Real-time coding, multi-file | Codebase aware | $20/mo |
| **Copilot** | Inline completion | Current file | $10/mo |
| **ChatGPT** | Quick questions, versatile | Conversation | $20/mo |

---

## 2. Claude - Cách sử dụng hiệu quả

### 2.1 Tại sao Claude tốt cho coding?

```
ƯU ĐIỂM CỦA CLAUDE:

1. CONTEXT WINDOW LỚN (200K tokens)
   - Paste được cả file dài
   - Hiểu được nhiều files cùng lúc
   - Không bị "quên" context giữa conversation

2. REASONING TỐT
   - Giải thích code rõ ràng
   - Debug logic phức tạp
   - Architecture decisions

3. CODE QUALITY
   - Ít hallucination hơn
   - Code clean, follow best practices
   - Hiểu TypeScript rất tốt

4. SAFE & HELPFUL
   - Thừa nhận khi không chắc
   - Không bịa đặt thông tin
```

### 2.2 Cách viết Prompt hiệu quả cho Claude

**❌ Prompt kém:**
```
Viết cho tôi một form đăng ký
```

**✅ Prompt tốt:**
```
Viết React component cho form đăng ký user với:

Requirements:
- Fields: email, password, confirm password, full name
- Validation: email format, password min 8 chars + 1 uppercase + 1 number
- Show inline errors
- Submit disabled khi form invalid
- Loading state khi submitting

Tech stack:
- React 18 + TypeScript
- React Hook Form + Zod validation
- Tailwind CSS

Preferences:
- Tách validation schema riêng
- Custom hook cho form logic
- Accessible (ARIA labels)
```

### 2.3 Các use cases phổ biến với Claude

**1. Code Review:**
```
Review đoạn code sau và chỉ ra:
1. Bugs tiềm ẩn
2. Security issues
3. Performance problems
4. Suggestions để improve

```tsx
[paste code here]
```
```

**2. Refactoring:**
```
Refactor component này theo hướng:
1. Tách thành smaller components
2. Extract custom hooks
3. Improve TypeScript types
4. Add error handling

Current code:
```tsx
[paste code]
```
```

**3. Debugging:**
```
Tôi đang gặp lỗi sau:
[paste error message]

Code của tôi:
```tsx
[paste relevant code]
```

Đã thử:
- [what you tried]

Expected behavior:
- [what should happen]
```

**4. Architecture Discussion:**
```
Tôi đang thiết kế feature [X] cho app [type].

Context:
- Tech stack: Next.js 14, TypeScript, Prisma, PostgreSQL
- Current architecture: [describe]
- Scale: [expected users/data]

Question:
- Nên structure như thế nào?
- Pros/cons của các approaches?
- Best practices cho case này?
```

**5. Learning:**
```
Giải thích [concept] cho tôi như senior developer.
Bao gồm:
1. Concept là gì, tại sao cần
2. Cách hoạt động
3. Code example thực tế
4. Common pitfalls
5. Best practices
```

### 2.4 Claude Artifacts - Tạo code có thể chạy

```
Claude có thể tạo "Artifacts" - code có thể preview ngay:

Prompt:
"Tạo một React component để visualize sorting algorithms.
User có thể chọn algorithm (bubble, quick, merge) và xem animation."

→ Claude tạo artifact có thể chạy ngay trong chat!
```

### 2.5 Tips khi dùng Claude

```
1. CONTEXT RÕ RÀNG
   - Nói rõ tech stack
   - Paste relevant code
   - Describe expected behavior

2. ITERATIVE REFINEMENT
   - Bắt đầu broad, refine dần
   - "Sửa phần X thành Y"
   - "Thêm feature Z"

3. ASK FOR EXPLANATIONS
   - "Tại sao chọn approach này?"
   - "Có alternative nào không?"
   - "Trade-offs là gì?"

4. VERIFY OUTPUT
   - Luôn test code
   - Check for security issues
   - Understand before using

5. CONVERSATION CONTINUITY
   - Claude nhớ context
   - Reference previous messages
   - Build on previous answers
```

---

## 3. Cursor IDE - AI-first Editor

### 3.1 Cursor là gì?

```
CURSOR = VS Code + AI SUPERPOWERS

- Fork của VS Code (familiar UI)
- AI tích hợp native
- Hiểu TOÀN BỘ codebase
- Multi-file editing
- Chat với code
```

### 3.2 Các tính năng chính

**1. Cmd+K - AI Edit**
```
Chọn code → Cmd+K → Describe changes

Ví dụ:
- Chọn function → "Add error handling"
- Chọn component → "Convert to TypeScript"
- Chọn CSS → "Make responsive"

Cursor sẽ:
- Hiểu context
- Generate diff
- Apply changes
```

**2. Cmd+L - AI Chat**
```
Mở chat panel → Hỏi bất kỳ điều gì về code

Features:
- @file - Reference specific file
- @folder - Reference folder
- @codebase - Search entire codebase
- @docs - Reference documentation
- @web - Search web

Ví dụ:
"@codebase How is authentication implemented?"
"@file:api/users.ts Add pagination to this endpoint"
```

**3. Composer - Multi-file Editing**
```
Cmd+Shift+I → Composer mode

- Describe feature cần build
- Cursor tạo/edit NHIỀU FILES
- Review changes trước khi apply
- Git-aware

Ví dụ:
"Add a dark mode toggle to the app.
Create the context, hook, and update the Navbar component."

→ Cursor tạo:
  - contexts/ThemeContext.tsx
  - hooks/useTheme.ts
  - Sửa components/Navbar.tsx
```

**4. Tab - Intelligent Autocomplete**
```
Không chỉ autocomplete syntax:
- Hiểu context của codebase
- Suggest code phù hợp với patterns đang dùng
- Multi-line suggestions
- Tab to accept, Esc to dismiss
```

### 3.3 Cursor Rules - Customize AI behavior

```
Tạo file .cursorrules ở root project:

---
# Project Context
This is a Next.js 14 e-commerce application.
Tech stack: TypeScript, Tailwind CSS, Prisma, PostgreSQL.

# Coding Standards
- Use functional components with hooks
- Prefer named exports
- Use Zod for validation
- Error messages in Vietnamese

# File Structure
- Components in /components
- API routes in /app/api
- Utilities in /lib

# Naming Conventions
- Components: PascalCase
- Hooks: use* prefix
- Utils: camelCase

# Testing
- Use Jest + React Testing Library
- Test files next to source: Component.test.tsx
---

→ AI sẽ follow rules này cho MỌI suggestions
```

### 3.4 Workflow với Cursor

```
1. EXPLORE CODEBASE
   Cmd+L: "@codebase explain the authentication flow"

2. PLAN FEATURE
   Cmd+L: "I need to add [feature]. What files should I modify?"

3. IMPLEMENT
   Composer: Describe feature → Review → Apply

4. REFINE
   Cmd+K: Select code → "improve this" / "add tests"

5. DEBUG
   Cmd+L: Paste error → "Fix this error in @file:xxx"
```

### 3.5 Tips Cursor Pro

```
1. CODEBASE INDEXING
   - Let Cursor index your codebase
   - Better @codebase searches
   - More accurate suggestions

2. CUSTOM DOCS
   - Add docs với @docs
   - AI references khi generate code
   - "Use @docs:react-query for data fetching"

3. DIFF VIEW
   - Always review diffs
   - Cmd+Enter to accept
   - Cmd+Backspace to reject

4. CONVERSATION HISTORY
   - Cursor remembers context
   - Reference previous changes
   - "Like we discussed earlier..."

5. GIT INTEGRATION
   - Commit messages generation
   - PR descriptions
   - Code review assistance
```

---

## 4. Best Practices khi code với AI

### 4.1 Nguyên tắc vàng

```
┌─────────────────────────────────────────────────────────────┐
│              AI CODING BEST PRACTICES                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. AI LÀ ASSISTANT, KHÔNG PHẢI REPLACEMENT                 │
│     - Bạn vẫn là người quyết định                           │
│     - Hiểu code trước khi dùng                              │
│     - Không blindly trust                                   │
│                                                              │
│  2. CONTEXT IS KING                                         │
│     - Cung cấp đủ context                                   │
│     - Specific > Vague                                      │
│     - Examples help                                         │
│                                                              │
│  3. ITERATIVE REFINEMENT                                    │
│     - Start simple, add complexity                          │
│     - Review → Feedback → Improve                           │
│     - Multiple rounds OK                                    │
│                                                              │
│  4. VERIFY EVERYTHING                                       │
│     - Test generated code                                   │
│     - Check for security issues                             │
│     - Code review như code của người khác                   │
│                                                              │
│  5. LEARN FROM AI                                           │
│     - Ask "why this approach?"                              │
│     - Learn new patterns                                    │
│     - Improve your skills                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Khi nào dùng tool nào?

```
CLAUDE:
├── Complex architecture discussions
├── Code review với explanations
├── Learning new concepts
├── Debugging complex issues
└── Long-form documentation

CURSOR:
├── Real-time coding
├── Multi-file changes
├── Refactoring codebase
├── Quick edits và fixes
└── Exploring unfamiliar codebase

COPILOT:
├── Inline completions
├── Boilerplate code
├── Repetitive patterns
└── Quick snippets

CHATGPT:
├── Quick questions
├── Regex generation
├── One-off scripts
└── General explanations
```

### 4.3 Những gì AI làm TỐT vs CHƯA TỐT

```
AI LÀM TỐT:
✅ Boilerplate code
✅ Common patterns
✅ Syntax và APIs
✅ Code transformations
✅ Documentation
✅ Test generation
✅ Explaining code

AI CHƯA TỐT:
❌ Complex business logic
❌ Security-critical code
❌ Performance optimization (cần measure)
❌ Architecture decisions (cần human judgment)
❌ Edge cases (cần domain knowledge)
❌ UI/UX decisions
❌ Code that needs human creativity
```

### 4.4 Security considerations

```
⚠️ SECURITY CHECKLIST:

1. KHÔNG PASTE:
   - API keys, secrets
   - Production credentials
   - Customer data
   - Proprietary algorithms

2. LUÔN REVIEW:
   - SQL queries (injection?)
   - User input handling (XSS?)
   - Authentication code
   - File operations

3. COMPANY POLICY:
   - Check AI usage policy
   - Enterprise plans cho data privacy
   - NDA considerations
```

---

## 5. Workflow thực tế

### 5.1 Building a Feature

```
SCENARIO: Thêm feature "Wishlist" cho e-commerce app

STEP 1: PLANNING (Claude)
─────────────────────────
Prompt:
"Tôi cần thêm Wishlist feature cho e-commerce app.
Tech stack: Next.js 14, Prisma, PostgreSQL.

Hãy help tôi plan:
1. Database schema
2. API endpoints
3. React components needed
4. State management approach"

→ Claude trả về plan chi tiết

STEP 2: DATABASE (Cursor)
─────────────────────────
Composer:
"Add Wishlist model to Prisma schema.
- User can have many wishlist items
- Each item references a Product
- Track added_at timestamp
Update schema.prisma"

→ Cursor tạo/update schema

STEP 3: API (Cursor)
─────────────────────────
Composer:
"Create API routes for Wishlist:
- GET /api/wishlist - get user's wishlist
- POST /api/wishlist - add item
- DELETE /api/wishlist/[id] - remove item
Include error handling và auth check"

→ Cursor tạo route files

STEP 4: FRONTEND (Cursor + Claude)
─────────────────────────
Composer:
"Create Wishlist components:
- WishlistButton (add/remove from wishlist)
- WishlistPage (show all items)
- WishlistCount (header badge)
Use Zustand for state"

→ Cursor tạo components

Nếu cần clarify logic:
Cmd+L → Copy to Claude → Discuss → Apply

STEP 5: TESTING (Claude)
─────────────────────────
Prompt:
"Generate tests cho Wishlist feature:
1. API route tests
2. Component tests
3. Integration tests

[paste relevant code]"

→ Claude generate comprehensive tests

STEP 6: CODE REVIEW (Claude)
─────────────────────────
Prompt:
"Review Wishlist implementation:
[paste all new files]

Check for:
- Security issues
- Performance problems
- Edge cases
- Best practices"

→ Claude review và suggest improvements
```

### 5.2 Debugging với AI

```
SCENARIO: "TypeError: Cannot read property 'map' of undefined"

STEP 1: GATHER CONTEXT
─────────────────────────
- Error message
- Stack trace
- Relevant code
- What you expected

STEP 2: ASK AI (Claude hoặc Cursor)
─────────────────────────
Prompt:
"Error: TypeError: Cannot read property 'map' of undefined

Stack trace:
[paste]

Code:
```tsx
[paste component]
```

API response:
```json
[paste sample]
```

This happens when: [describe when]
Expected: [what should happen]"

STEP 3: APPLY FIX
─────────────────────────
AI suggests: "The issue is products might be undefined initially.
Add optional chaining or default value."

Cursor Cmd+K:
"Add null check for products before mapping"

STEP 4: VERIFY
─────────────────────────
- Test the fix
- Check similar code for same issue
- Add unit test to prevent regression
```

### 5.3 Learning với AI

```
SCENARIO: Học về React Server Components

STEP 1: OVERVIEW (Claude)
─────────────────────────
"Giải thích React Server Components cho tôi:
1. Concept và motivation
2. Khác gì với Client Components
3. Khi nào dùng gì
4. Ví dụ code"

STEP 2: HANDS-ON (Cursor)
─────────────────────────
Cmd+L:
"Convert this Client Component to Server Component.
Explain what changes và why:

```tsx
[paste component]
```"

STEP 3: EXPLORE PATTERNS
─────────────────────────
"Show me common patterns for:
- Data fetching in Server Components
- Mixing Server và Client Components
- Passing data from Server to Client"

STEP 4: APPLY TO PROJECT
─────────────────────────
Cursor Composer:
"Refactor /app/products/page.tsx to use Server Components
for data fetching. Keep interactivity in Client Components."
```

---

## 6. Câu hỏi phỏng vấn

### Câu 1: "Bạn sử dụng AI tools như thế nào trong development?"

**Trả lời:**
> "Tôi sử dụng AI tools theo workflow cụ thể:
>
> **Claude** cho:
> - Planning và architecture discussions
> - Code review với explanations
> - Learning concepts mới
> - Debug complex issues
>
> **Cursor** cho:
> - Day-to-day coding
> - Multi-file refactoring
> - Quick edits với Cmd+K
> - Exploring unfamiliar codebases
>
> **Key principle**: AI là assistant, không phải replacement. Tôi luôn review, test, và đảm bảo hiểu code trước khi dùng."

### Câu 2: "Làm sao viết prompt hiệu quả?"

**Trả lời:**
> "Prompt tốt cần có:
>
> 1. **Context rõ ràng**: Tech stack, constraints, existing code
> 2. **Specific requirements**: Không vague, list cụ thể cần gì
> 3. **Examples nếu có**: Input/output mong muốn
> 4. **Format preference**: Code style, naming conventions
>
> Ví dụ thay vì 'viết form đăng ký', tôi sẽ specify: fields nào, validation rules, tech stack, accessibility requirements."

### Câu 3: "Cursor khác gì với GitHub Copilot?"

**Trả lời:**
> "Khác biệt chính:
>
> **Copilot:**
> - Inline completion trong file hiện tại
> - Tab to accept
> - Không có chat deeply với codebase
>
> **Cursor:**
> - AI-first IDE, built-in chat
> - Hiểu TOÀN BỘ codebase với @codebase
> - Multi-file editing với Composer
> - Custom rules với .cursorrules
>
> Tôi dùng Cursor cho projects lớn cần codebase awareness, Copilot cho quick completions."

### Câu 4: "Những risks khi dùng AI tools?"

**Trả lời:**
> "Có vài risks cần aware:
>
> 1. **Security**: AI có thể generate vulnerable code, cần review carefully cho auth, SQL, user input handling
>
> 2. **Accuracy**: AI có thể hallucinate, cần verify với docs và testing
>
> 3. **Privacy**: Không paste credentials, customer data, proprietary code vào public AI
>
> 4. **Over-reliance**: Dùng AI nhiều có thể giảm skills, cần balance và continue learning
>
> 5. **License**: Code generated có thể có copyright concerns
>
> Mitigation: Luôn review, test, dùng enterprise plans cho sensitive projects, maintain core skills."

### Câu 5: "AI sẽ thay thế developers không?"

**Trả lời:**
> "Theo tôi, AI sẽ **augment**, không **replace** developers.
>
> **AI giỏi**: Boilerplate, patterns, documentation, explanations
>
> **AI chưa giỏi**: Complex business logic, architecture decisions, creativity, understanding user needs, team collaboration
>
> Tương lai: Developers sẽ làm việc **với** AI, focus vào high-level decisions, system design, và những gì cần human judgment. Skills quan trọng sẽ shift: prompt engineering, AI collaboration, critical thinking.
>
> Advice: Embrace AI tools nhưng giữ fundamentals strong. AI là tool để amplify productivity, không phải để thay thế thinking."

### Câu 6: "Chia sẻ một case bạn dùng AI hiệu quả?"

**Trả lời (ví dụ):**
> "Gần đây tôi refactor một legacy component 2000 lines thành smaller pieces.
>
> **Approach:**
> 1. Paste entire component vào Claude, hỏi suggest cách split
> 2. Claude suggest tách thành 5 components + 3 custom hooks
> 3. Dùng Cursor Composer để implement từng phần
> 4. Mỗi phần generate, tôi review và adjust
> 5. Claude help generate tests cho new structure
>
> **Result:**
> - Hoàn thành trong 1 ngày thay vì 3-4 ngày
> - Code cleaner, testable
> - Tôi hiểu code hơn nhờ AI explanations
>
> **Key**: AI speed up execution, nhưng tôi vẫn make decisions về architecture."

---

## Tóm tắt

```
CLAUDE:
- Best for: Complex reasoning, long context, learning
- Tips: Specific prompts, ask "why", verify outputs

CURSOR:
- Best for: Real-time coding, multi-file edits
- Tips: Use @codebase, .cursorrules, Composer for features

BEST PRACTICES:
1. AI = Assistant, not replacement
2. Context is king
3. Verify everything
4. Learn from AI suggestions
5. Maintain security awareness

WORKFLOW:
Planning (Claude) → Implementation (Cursor) → Review (Claude) → Test
```
