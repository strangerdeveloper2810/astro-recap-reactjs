# FPT Software - Senior/Lead React Developer

## Thông tin phỏng vấn

> **Vị trí**: Senior/Lead React Developer
> **Công ty**: FPT Software
> **Ngôn ngữ**: Full tiếng Việt
> **JD Focus**: Các technologies trong JD cần ôn

---

## Các tài liệu đã soạn

| # | File | Chủ đề | Status |
|---|------|--------|--------|
| 1 | [01-micro-frontends.md](./01-micro-frontends.md) | Micro Frontends (single-spa, Module Federation) | ⬜ |
| 2 | [02-monorepos-nx-turborepo.md](./02-monorepos-nx-turborepo.md) | Monorepos (NX, Turborepo) | ⬜ |
| 3 | [03-state-management.md](./03-state-management.md) | State Management (Redux Toolkit, Zustand, Jotai, Recoil) | ⬜ |
| 4 | [04-pwa-service-workers-caching.md](./04-pwa-service-workers-caching.md) | PWAs, Service Workers, Caching | ⬜ |
| 5 | [05-cross-browser-compatibility.md](./05-cross-browser-compatibility.md) | Cross-browser Compatibility | ⬜ |
| 6 | [06-ai-assisted-development.md](./06-ai-assisted-development.md) | AI-assisted Development (GitHub Copilot) | ⬜ |

**Legend**: ⬜ Chưa ôn | 🟡 Đang ôn | ✅ Đã ôn xong

---

## JD Requirements Mapping

### Đã cover trong tài liệu mới

| Requirement | Tài liệu | Priority |
|-------------|----------|----------|
| Micro frontends (single-spa, Module Federation) | 01-micro-frontends.md | ⭐⭐⭐ |
| Monorepos (NX, Turborepo) | 02-monorepos-nx-turborepo.md | ⭐⭐⭐ |
| State Management (Redux Toolkit, Zustand, Jotai, Recoil) | 03-state-management.md | ⭐⭐⭐ |
| PWAs, caching, service workers | 04-pwa-service-workers-caching.md | ⭐⭐ |
| Cross-browser compatibility | 05-cross-browser-compatibility.md | ⭐⭐ |
| AI-assisted development (GitHub Copilot) | 06-ai-assisted-development.md | ⭐⭐ |

### Có thể tham khảo từ HCL ANZ materials

| Requirement | File tham khảo | Notes |
|-------------|----------------|-------|
| React.js (React 17+) | hcl-anz-senior-frontend/day-1-react-fundamentals.md | Đã có chi tiết |
| JavaScript (ES2025), TypeScript | hcl-anz-senior-frontend/day-1-react-fundamentals.md, day-2 | Đã có |
| Next.js SSR/SSG | hcl-anz-senior-frontend/day-4-5-system-design-technical.md | Đã có |
| Accessibility (WCAG 2.1) | hcl-anz-senior-frontend/day-4-5-system-design-technical.md | Đã có |
| Testing (Jest, RTL, Cypress) | hcl-anz-senior-frontend/day-4-5-system-design-technical.md | Đã có |
| RESTful APIs, GraphQL, WebSockets | hcl-anz-senior-frontend/day-3-system-design-fundamentals.md | Đã có |
| Tailwind CSS, Ant Design | General knowledge | - |

---

## Checklist ôn tập theo chủ đề

### 1. Micro Frontends
- [ ] Hiểu khái niệm Micro Frontends
- [ ] Module Federation: Host, Remote, Shared
- [ ] Single-SPA: Root config, lifecycles
- [ ] Communication giữa các MFEs
- [ ] Ưu/nhược điểm, khi nào dùng
- [ ] **Trả lời được 6 câu hỏi phỏng vấn**

### 2. Monorepos
- [ ] Ưu/nhược điểm so với Polyrepo
- [ ] Nx: workspace, project.json, generators
- [ ] Turborepo: turbo.json, pipeline
- [ ] Affected commands
- [ ] Task caching (local & remote)
- [ ] **Trả lời được 7 câu hỏi phỏng vấn**

### 3. State Management
- [ ] Khi nào cần global state
- [ ] Redux Toolkit: slices, async thunks, RTK Query
- [ ] Zustand: create store, middleware
- [ ] Jotai: atoms, derived atoms
- [ ] Recoil: atoms, selectors
- [ ] So sánh và lựa chọn
- [ ] **Trả lời được 6 câu hỏi phỏng vấn**

### 4. PWAs & Service Workers
- [ ] PWA core features
- [ ] Service Worker lifecycle
- [ ] Caching strategies (Cache First, Network First, Stale While Revalidate)
- [ ] Web App Manifest
- [ ] Workbox configuration
- [ ] Push Notifications basics
- [ ] **Trả lời được 6 câu hỏi phỏng vấn**

### 5. Cross-browser Compatibility
- [ ] Vendor prefixes, Autoprefixer
- [ ] CSS feature detection (@supports)
- [ ] JavaScript polyfills, core-js
- [ ] Testing với Playwright/BrowserStack
- [ ] Safari-specific issues
- [ ] **Trả lời được 6 câu hỏi phỏng vấn**

### 6. AI-assisted Development
- [ ] GitHub Copilot: features, shortcuts
- [ ] Best practices: prompts, patterns
- [ ] Security concerns
- [ ] Workflow integration
- [ ] **Trả lời được 6 câu hỏi phỏng vấn**

---

## Câu hỏi ôn nhanh

### Micro Frontends
1. Micro Frontends là gì? Khi nào nên dùng?
2. Module Federation hoạt động như thế nào?
3. Làm sao để share state giữa các MFEs?
4. Single-SPA khác gì Module Federation?
5. Thách thức khi triển khai và cách giải quyết?

### Monorepos
1. Monorepo là gì? Ưu nhược điểm?
2. Nx và Turborepo khác nhau như thế nào?
3. Affected commands hoạt động như thế nào?
4. Task caching hoạt động như thế nào?
5. Tổ chức structure monorepo như thế nào?

### State Management
1. Khi nào cần state management library thay vì Context?
2. Redux Toolkit khác gì Redux cũ?
3. Zustand có gì hay so với Redux?
4. Atomic state khác gì centralized store?
5. Làm sao tối ưu performance?

### PWAs
1. PWA là gì? Ưu nhược điểm so với Native App?
2. Service Worker hoạt động như thế nào?
3. Có những caching strategies nào? Khi nào dùng?
4. Làm sao handle update cho PWA?
5. Workbox là gì? Tại sao dùng?

### Cross-browser
1. Tại sao cross-browser compatibility quan trọng?
2. Làm sao handle CSS compatibility?
3. Polyfill là gì? Khi nào cần?
4. Feature detection vs Browser detection?
5. Safari có những issues gì đặc biệt?

### AI-assisted Development
1. Kinh nghiệm với AI development tools?
2. Ưu và nhược điểm của AI tools?
3. Làm sao sử dụng Copilot hiệu quả?
4. Lo ngại về security khi dùng AI tools?
5. AI sẽ replace developers không?

---

## Tips phỏng vấn tiếng Việt

### Cách trả lời
1. **Mở đầu**: Định nghĩa ngắn gọn khái niệm
2. **Chi tiết**: Giải thích cách hoạt động
3. **Ví dụ**: Đưa ra use case thực tế
4. **Kinh nghiệm**: Chia sẻ từ project đã làm

### Phrases hữu ích
- "Theo kinh nghiệm của em/tôi..."
- "Trong dự án gần đây, em/tôi đã..."
- "Có một số cách tiếp cận..."
- "Ưu điểm chính là... Tuy nhiên nhược điểm là..."
- "Em/Tôi recommend... trong trường hợp..."

### Khi không biết câu trả lời
- "Em/Tôi chưa có kinh nghiệm trực tiếp với..., nhưng theo hiểu biết của em/tôi thì..."
- "Để trả lời chính xác, em/tôi cần research thêm, nhưng approach của em/tôi sẽ là..."

---

## Good luck! 💪
