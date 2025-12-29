# Recap JS - Astro Website

Website để visualize và học các tài liệu markdown về React Lead/Senior.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Cấu Trúc

```
astro-site/
├── src/
│   ├── components/     # UI components (Navbar, Sidebar)
│   ├── layouts/        # Page layouts
│   ├── pages/          # Astro pages (routes)
│   ├── styles/         # Global CSS
│   └── utils/          # Utilities (markdown loader)
└── public/             # Static assets
```

## 🎨 Features

- ✅ Full responsive (mobile-first)
- ✅ Dark mode support
- ✅ Mermaid diagrams support
- ✅ Markdown rendering
- ✅ Touch-friendly UI (44px min touch targets)
- ✅ Smooth scrolling
- ✅ Sidebar navigation

## 📝 Cách sử dụng

1. Chạy `pnpm dev`
2. Mở browser tại `http://localhost:4321`
3. Navigate đến các sections:
   - `/` - Trang chủ
   - `/interview-prep` - Tài liệu phỏng vấn
   - `/javascript-fundamentals` - JavaScript basics

## 🔧 Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS** - Styling
- **Marked** - Markdown parser
- **Mermaid** - Diagrams (via CDN)

## 📱 Mobile Optimizations

- Touch targets minimum 44x44px
- Responsive navigation menu
- Optimized font sizes
- Smooth scrolling
- Viewport meta tags
