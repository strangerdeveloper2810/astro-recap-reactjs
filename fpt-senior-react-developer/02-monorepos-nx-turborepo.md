# Monorepos với NX và Turborepo

> **Vị trí**: Senior/Lead React Developer - FPT Software
> **Ngôn ngữ phỏng vấn**: Tiếng Việt
> **Mục tiêu**: Hiểu rõ và trả lời được các câu hỏi về Monorepo, NX, Turborepo

---

## Mục lục

1. [Tổng quan về Monorepo](#1-tổng-quan-về-monorepo)
2. [Nx Workspace](#2-nx-workspace)
3. [Turborepo](#3-turborepo)
4. [So sánh Nx vs Turborepo](#4-so-sánh-nx-vs-turborepo)
5. [Câu hỏi phỏng vấn thường gặp](#5-câu-hỏi-phỏng-vấn-thường-gặp)

---

## 1. Tổng quan về Monorepo

### 1.1 Monorepo là gì?

**Định nghĩa**: Monorepo là chiến lược quản lý code, trong đó nhiều projects/packages được lưu trữ trong một repository duy nhất.

**So sánh với Polyrepo:**

```
POLYREPO (Nhiều repos riêng biệt)
├── frontend-repo/
├── backend-repo/
├── shared-components-repo/
└── design-system-repo/

MONOREPO (Một repo chứa tất cả)
└── company-monorepo/
    ├── apps/
    │   ├── frontend/
    │   └── backend/
    ├── packages/
    │   ├── shared-components/
    │   └── design-system/
    └── package.json
```

### 1.2 Ưu điểm của Monorepo

| Ưu điểm | Giải thích |
|---------|------------|
| **Code Sharing** | Dễ dàng share code giữa các projects |
| **Atomic Changes** | Thay đổi cross-project trong 1 commit |
| **Consistent Tooling** | Một bộ config cho tất cả (ESLint, Prettier) |
| **Dependency Management** | Quản lý versions tập trung |
| **Visibility** | Dễ tìm kiếm và hiểu codebase |

### 1.3 Thách thức của Monorepo

| Thách thức | Giải pháp |
|------------|-----------|
| **Build time dài** | Task caching, affected builds |
| **Repo size lớn** | Sparse checkout, Git LFS |
| **CI/CD phức tạp** | Only run affected tests/builds |
| **Permission** | CODEOWNERS, branch protection |

### 1.4 Cấu trúc thư mục phổ biến

```
monorepo/
├── apps/                      # Các ứng dụng chạy độc lập
│   ├── web/                   # React web app
│   ├── mobile/                # React Native app
│   └── admin/                 # Admin dashboard
│
├── packages/                  # Shared packages
│   ├── ui/                    # Design system, components
│   ├── utils/                 # Utility functions
│   ├── config/                # Shared configs (ESLint, TS)
│   └── types/                 # Shared TypeScript types
│
├── tools/                     # Build tools, scripts
│   ├── generators/            # Code generators
│   └── scripts/               # Automation scripts
│
├── package.json               # Root package.json
├── nx.json / turbo.json       # Monorepo tool config
└── tsconfig.base.json         # Base TypeScript config
```

---

## 2. Nx Workspace

### 2.1 Nx là gì?

**Nx** là build system và monorepo tool mạnh mẽ, hỗ trợ nhiều framework (React, Angular, Node, Next.js). Cung cấp:
- Task caching (local & remote)
- Affected commands
- Code generators
- Dependency graph visualization

### 2.2 Khởi tạo Nx Workspace

```bash
# Tạo mới với React preset
npx create-nx-workspace@latest fpt-monorepo --preset=react-monorepo

# Hoặc thêm Nx vào repo có sẵn
npx nx@latest init
```

### 2.3 Cấu trúc Nx Workspace

```
fpt-monorepo/
├── apps/
│   ├── web/                       # React app
│   │   ├── src/
│   │   ├── project.json           # App-specific config
│   │   └── tsconfig.json
│   └── web-e2e/                   # E2E tests cho web
│
├── libs/                          # Shared libraries
│   ├── ui/                        # UI components
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── button/
│   │   │   │   └── modal/
│   │   │   └── index.ts           # Public API
│   │   └── project.json
│   │
│   ├── data-access/               # API calls, state
│   ├── utils/                     # Utilities
│   └── types/                     # Shared types
│
├── nx.json                        # Nx configuration
├── tsconfig.base.json             # Base TS config
└── package.json
```

### 2.4 nx.json - Cấu hình Nx

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "npmScope": "fpt",

  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"]
      }
    }
  },

  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"]
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"]
    }
  },

  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.tsx",
      "!{projectRoot}/tsconfig.spec.json"
    ],
    "sharedGlobals": ["{workspaceRoot}/tsconfig.base.json"]
  },

  "generators": {
    "@nx/react": {
      "component": {
        "style": "css"
      },
      "library": {
        "style": "css"
      }
    }
  }
}
```

### 2.5 project.json - Cấu hình Project

```json
{
  "name": "web",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/web/src",
  "projectType": "application",
  "tags": ["type:app", "scope:web"],

  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/web",
        "index": "apps/web/src/index.html",
        "main": "apps/web/src/main.tsx",
        "tsConfig": "apps/web/tsconfig.app.json"
      },
      "configurations": {
        "production": {
          "optimization": true,
          "sourceMap": false
        },
        "development": {
          "optimization": false,
          "sourceMap": true
        }
      }
    },

    "serve": {
      "executor": "@nx/webpack:dev-server",
      "options": {
        "buildTarget": "web:build:development"
      }
    },

    "test": {
      "executor": "@nx/jest:jest",
      "options": {
        "jestConfig": "apps/web/jest.config.ts"
      }
    },

    "lint": {
      "executor": "@nx/eslint:lint",
      "options": {
        "lintFilePatterns": ["apps/web/**/*.{ts,tsx,js,jsx}"]
      }
    }
  }
}
```

### 2.6 Các lệnh Nx quan trọng

```bash
# ===== BUILD & SERVE =====
nx serve web                    # Chạy dev server cho app 'web'
nx build web                    # Build app 'web'
nx build web --configuration=production

# ===== TESTING =====
nx test ui                      # Chạy tests cho lib 'ui'
nx e2e web-e2e                  # Chạy E2E tests

# ===== LINTING =====
nx lint web                     # Lint app 'web'
nx format:check                 # Check formatting
nx format:write                 # Fix formatting

# ===== AFFECTED COMMANDS (Chỉ chạy những gì thay đổi) =====
nx affected:build               # Build các projects bị ảnh hưởng
nx affected:test                # Test các projects bị ảnh hưởng
nx affected:lint                # Lint các projects bị ảnh hưởng
nx affected --target=build --base=main  # So với branch main

# ===== DEPENDENCY GRAPH =====
nx graph                        # Mở dependency graph trong browser
nx graph --affected             # Chỉ hiển thị affected projects

# ===== GENERATORS =====
nx g @nx/react:app admin        # Tạo React app mới
nx g @nx/react:lib ui           # Tạo React library
nx g @nx/react:component Button --project=ui  # Tạo component

# ===== CACHING =====
nx reset                        # Xóa cache
nx run-many --target=build --all --skip-nx-cache  # Bỏ qua cache
```

### 2.7 Affected Commands - Chi tiết

```bash
# Affected dựa trên thay đổi so với base branch
nx affected:test --base=origin/main --head=HEAD

# Affected với parallel execution
nx affected --target=build --parallel=3

# Liệt kê các projects bị affected
nx print-affected --type=app
nx print-affected --select=projects
```

**Cách hoạt động:**
```
┌─────────────────────────────────────────────────┐
│  Developer thay đổi libs/ui/button.tsx          │
│                      ↓                          │
│  Nx phân tích dependency graph                  │
│                      ↓                          │
│  Xác định: apps/web và apps/admin dùng ui       │
│                      ↓                          │
│  Chỉ build/test: libs/ui, apps/web, apps/admin  │
│  (Bỏ qua apps/mobile nếu không dùng ui)         │
└─────────────────────────────────────────────────┘
```

### 2.8 Task Caching

```json
// nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        // Các operations được cache
        "cacheableOperations": ["build", "lint", "test", "e2e"],

        // Remote cache (Nx Cloud)
        "accessToken": "your-nx-cloud-token"
      }
    }
  }
}
```

**Local Cache:**
```bash
# Cache được lưu tại .nx/cache
# Khi chạy lại cùng task với cùng input → lấy từ cache

$ nx build web
> nx run web:build [local cache]
# Hoàn thành trong < 1 giây thay vì 30 giây
```

**Remote Cache (Nx Cloud):**
```bash
# CI/CD chạy build → cache lên cloud
# Developer pull → lấy cache từ cloud
# Không cần build lại từ đầu
```

### 2.9 Tạo Library và Import

```bash
# Tạo UI library
nx g @nx/react:lib ui --directory=libs/shared

# Tạo component trong library
nx g @nx/react:component Button --project=shared-ui
```

**Import trong app:**
```tsx
// apps/web/src/app/page.tsx
// Import từ lib thông qua path alias
import { Button, Modal } from '@fpt/shared-ui';

function App() {
  return (
    <div>
      <Button variant="primary">Click me</Button>
    </div>
  );
}
```

**tsconfig.base.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@fpt/shared-ui": ["libs/shared/ui/src/index.ts"],
      "@fpt/utils": ["libs/utils/src/index.ts"],
      "@fpt/types": ["libs/types/src/index.ts"]
    }
  }
}
```

---

## 3. Turborepo

### 3.1 Turborepo là gì?

**Turborepo** là build system cho JavaScript/TypeScript monorepos, tập trung vào tốc độ với:
- Incremental builds
- Content-aware hashing
- Parallel execution
- Remote caching

**Đặc điểm**: Nhẹ hơn Nx, ít opinionated hơn, dễ adopt vào repo có sẵn.

### 3.2 Khởi tạo Turborepo

```bash
# Tạo mới
npx create-turbo@latest

# Thêm vào repo có sẵn
npm install turbo --save-dev
```

### 3.3 Cấu trúc Turborepo

```
fpt-monorepo/
├── apps/
│   ├── web/                   # Next.js app
│   │   ├── src/
│   │   ├── package.json       # Mỗi app có package.json riêng
│   │   └── tsconfig.json
│   └── docs/                  # Documentation site
│
├── packages/
│   ├── ui/                    # Shared UI components
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── eslint-config/         # Shared ESLint config
│   └── tsconfig/              # Shared TS configs
│
├── turbo.json                 # Turborepo config
├── package.json               # Root package.json (workspaces)
└── pnpm-workspace.yaml        # Workspace definition (nếu dùng pnpm)
```

### 3.4 turbo.json - Cấu hình Turborepo

```json
{
  "$schema": "https://turbo.build/schema.json",

  "globalDependencies": [
    "**/.env.*local"
  ],

  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },

    "lint": {
      "outputs": [],
      "cache": true
    },

    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    },

    "dev": {
      "cache": false,
      "persistent": true
    },

    "clean": {
      "cache": false
    }
  }
}
```

**Giải thích pipeline:**

| Key | Ý nghĩa |
|-----|---------|
| `dependsOn: ["^build"]` | Chạy build của dependencies trước |
| `outputs` | Files được cache |
| `inputs` | Files được watch để invalidate cache |
| `cache: false` | Không cache task này |
| `persistent: true` | Task chạy liên tục (dev server) |

### 3.5 Package.json với Workspaces

**Root package.json:**
```json
{
  "name": "fpt-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

**packages/ui/package.json:**
```json
{
  "name": "@fpt/ui",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.tsx --format esm,cjs --dts",
    "dev": "tsup src/index.tsx --format esm,cjs --watch --dts",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "@fpt/eslint-config": "workspace:*",
    "@fpt/tsconfig": "workspace:*",
    "tsup": "^7.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

**apps/web/package.json:**
```json
{
  "name": "@fpt/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start"
  },
  "dependencies": {
    "@fpt/ui": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0"
  }
}
```

### 3.6 Các lệnh Turborepo

```bash
# ===== BASIC COMMANDS =====
turbo run build                 # Build tất cả packages
turbo run dev                   # Chạy dev cho tất cả
turbo run lint                  # Lint tất cả
turbo run test                  # Test tất cả

# ===== FILTERING =====
turbo run build --filter=@fpt/web          # Build chỉ web app
turbo run build --filter=@fpt/ui           # Build chỉ ui package
turbo run build --filter=@fpt/web...       # Build web và dependencies
turbo run build --filter=...@fpt/ui        # Build ui và dependents
turbo run dev --filter=@fpt/web --filter=@fpt/ui  # Nhiều filters

# ===== CACHING =====
turbo run build --force                    # Bỏ qua cache
turbo run build --dry-run                  # Xem tasks sẽ chạy
turbo run build --summarize                # Xem summary sau khi chạy

# ===== PARALLEL EXECUTION =====
turbo run build --concurrency=10           # Giới hạn parallel tasks
turbo run build --concurrency=50%          # 50% số CPU cores

# ===== REMOTE CACHING (Vercel) =====
turbo login                                # Đăng nhập Vercel
turbo link                                 # Link repo với Vercel
turbo run build                            # Tự động dùng remote cache
```

### 3.7 Filtering Syntax

```bash
# Theo tên package
--filter=@fpt/web

# Theo directory
--filter=./apps/web

# Dependencies của package (upstream)
--filter=@fpt/web...

# Dependents của package (downstream)
--filter=...@fpt/ui

# Cả hai
--filter=...@fpt/ui...

# Theo thay đổi git
--filter=[origin/main]           # Changed since main
--filter=[HEAD^1]                # Changed in last commit

# Kết hợp
--filter=@fpt/web...--filter=!@fpt/docs
```

### 3.8 Remote Caching với Vercel

```bash
# 1. Đăng nhập Vercel
npx turbo login

# 2. Link project
npx turbo link

# 3. Chạy build - tự động cache lên Vercel
turbo run build

# Hoặc cấu hình trong turbo.json
{
  "remoteCache": {
    "signature": true
  }
}
```

---

## 4. So sánh Nx vs Turborepo

### 4.1 Feature Comparison

| Feature | Nx | Turborepo |
|---------|-----|-----------|
| **Task Caching** | ✅ Local + Remote (Nx Cloud) | ✅ Local + Remote (Vercel) |
| **Affected Commands** | ✅ Built-in | ⚠️ Via git filter |
| **Dependency Graph** | ✅ Visual UI | ⚠️ CLI only |
| **Code Generators** | ✅ Powerful | ❌ Không có |
| **Plugins** | ✅ Nhiều (React, Angular, Node) | ❌ Không có |
| **Configuration** | Nhiều files | Ít files |
| **Learning Curve** | Cao hơn | Thấp hơn |
| **Adoption** | Cần setup nhiều | Dễ thêm vào repo có sẵn |
| **Size** | Nặng hơn | Nhẹ hơn |
| **Opinionated** | Cao | Thấp |

### 4.2 Khi nào chọn Nx?

- Team lớn, cần structure rõ ràng
- Dự án mới, muốn có generators
- Cần plugins cho Angular, React, Node
- Muốn dependency graph visualization
- Enterprise với Nx Cloud

### 4.3 Khi nào chọn Turborepo?

- Đã có repo, muốn thêm monorepo features
- Team thích minimal tooling
- Chủ yếu Next.js/Vercel stack
- Muốn setup nhanh
- Startup, team nhỏ-trung

---

## 5. Câu hỏi phỏng vấn thường gặp

### Câu hỏi 1: "Monorepo là gì? Ưu nhược điểm so với Polyrepo?"

**Trả lời:**
> "Monorepo là cách tổ chức code, trong đó nhiều projects được lưu trong một repository duy nhất, thay vì mỗi project một repo riêng.
>
> **Ưu điểm:**
> - **Code sharing dễ dàng**: Import trực tiếp, không cần publish npm package
> - **Atomic changes**: Thay đổi nhiều projects trong một commit, đảm bảo consistency
> - **Unified tooling**: Một bộ ESLint, Prettier, TypeScript config cho tất cả
> - **Dependency management**: Quản lý versions tập trung, tránh version mismatch
>
> **Nhược điểm:**
> - **Build time**: Cần tools như Nx/Turborepo để tối ưu
> - **Repo size lớn**: Clone lần đầu lâu hơn
> - **Permission complexity**: Khó phân quyền theo team
>
> Tôi recommend Monorepo cho team từ 5-10 người trở lên, có nhiều projects share code với nhau."

---

### Câu hỏi 2: "Nx và Turborepo khác nhau như thế nào?"

**Trả lời:**
> "Cả hai đều là build system cho monorepo, nhưng approach khác nhau:
>
> **Nx:**
> - Full-featured, có generators, plugins, dependency graph UI
> - Phù hợp khi bắt đầu dự án mới, cần structure rõ ràng
> - Learning curve cao hơn nhưng powerful hơn
>
> **Turborepo:**
> - Lightweight, chỉ tập trung vào task running và caching
> - Dễ adopt vào repo có sẵn
> - Tích hợp tốt với Vercel ecosystem
>
> Nếu dự án dùng Next.js và đã có Vercel, tôi sẽ chọn Turborepo. Nếu bắt đầu mới và cần generators, plugins, tôi sẽ chọn Nx."

---

### Câu hỏi 3: "Affected commands hoạt động như thế nào?"

**Trả lời:**
> "Affected commands giúp chỉ build/test những projects bị ảnh hưởng bởi thay đổi code, thay vì build/test toàn bộ.
>
> **Cách hoạt động:**
> 1. Tool phân tích dependency graph của repo
> 2. Khi có code thay đổi, xác định project nào chứa file đó
> 3. Trace ngược dependency graph để tìm tất cả projects phụ thuộc
> 4. Chỉ chạy task cho những projects bị affected
>
> **Ví dụ:** Nếu tôi thay đổi `libs/ui/Button.tsx`:
> - Affected sẽ xác định `libs/ui` bị thay đổi
> - Các apps như `web`, `admin` import từ `ui` → cũng bị affected
> - Chỉ build/test 3 projects này, bỏ qua `mobile` nếu không dùng `ui`
>
> Điều này giảm thời gian CI từ 30 phút xuống còn 5 phút trong dự án tôi đã làm."

---

### Câu hỏi 4: "Task caching hoạt động như thế nào?"

**Trả lời:**
> "Task caching lưu kết quả của task đã chạy, để lần sau không cần chạy lại nếu inputs không đổi.
>
> **Cách hoạt động:**
> 1. Tool tạo hash từ: source files, config files, dependencies
> 2. Nếu hash match với cache → trả về output từ cache
> 3. Nếu không → chạy task và lưu output vào cache
>
> **Local cache:** Lưu trên máy developer, nhanh nhưng không share được
>
> **Remote cache:** Lưu trên cloud (Nx Cloud, Vercel)
> - CI build xong → push lên cloud
> - Developer pull → lấy cache từ cloud
> - Không cần build lại từ đầu
>
> Trong dự án của tôi, remote cache giảm CI time từ 20 phút xuống 3 phút vì hầu hết packages đã được cache."

---

### Câu hỏi 5: "Bạn tổ chức structure monorepo như thế nào?"

**Trả lời:**
> "Tôi thường dùng structure sau:
>
> ```
> monorepo/
> ├── apps/           # Ứng dụng chạy độc lập
> │   ├── web/        # Main web app
> │   ├── admin/      # Admin dashboard
> │   └── mobile/     # React Native
> │
> ├── packages/       # Shared packages
> │   ├── ui/         # Design system
> │   ├── utils/      # Utilities
> │   ├── api/        # API client
> │   └── config/     # Shared configs
> │
> └── tools/          # Build tools, generators
> ```
>
> **Nguyên tắc:**
> - `apps/` chứa deployable units
> - `packages/` chứa reusable code
> - Mỗi package có scope rõ ràng, single responsibility
> - TypeScript path aliases để import đẹp: `@fpt/ui`, `@fpt/utils`"

---

### Câu hỏi 6: "Làm sao handle shared dependencies trong monorepo?"

**Trả lời:**
> "Có 2 approaches chính:
>
> **1. Hoisting (npm/yarn workspaces):**
> - Dependencies được install ở root `node_modules`
> - Các packages dùng chung, tránh duplicate
> - Vấn đề: Version conflicts, phantom dependencies
>
> **2. Isolated (pnpm):**
> - Mỗi package có `node_modules` riêng với symlinks
> - Strict mode: Chỉ import được dependencies đã declare
> - Recommend cho dự án mới
>
> **Best practices:**
> - Dùng `peerDependencies` cho React, React DOM
> - Sync versions với `syncpack` hoặc Nx sync
> - Trong Nx, dùng `shared` config cho Module Federation
>
> Tôi prefer pnpm vì strict mode giúp phát hiện missing dependencies sớm."

---

### Câu hỏi 7: "Kinh nghiệm triển khai monorepo của bạn?"

**Trả lời (ví dụ):**
> "Tôi đã triển khai Turborepo cho dự án e-commerce tại [công ty]:
>
> **Bối cảnh:**
> - 3 apps: Web, Admin, API
> - 2 shared packages: UI, Utils
> - Team 8 người, 4 FE + 4 BE
>
> **Kết quả:**
> - CI time giảm 60% nhờ affected + caching
> - Code sharing tăng, không còn copy-paste giữa apps
> - Một lần update UI → tất cả apps đều có
>
> **Thách thức:**
> - Ban đầu setup CI/CD hơi phức tạp
> - Phải train team về workflow mới
> - Cần convention rõ ràng về package boundaries
>
> **Bài học:**
> - Start simple, add complexity khi cần
> - Document conventions rõ ràng
> - Invest vào CI/CD automation sớm"

---

## Tài liệu tham khảo

- [Nx Documentation](https://nx.dev/)
- [Turborepo Documentation](https://turbo.build/)
- [Monorepo Tools Comparison](https://monorepo.tools/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
