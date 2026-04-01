# 📦 Nx Monorepo — Bilingual Interview Q&A

> **Dành cho:** Senior Frontend Engineer Interview (ANZ Bank)
> **Format:** Bilingual Vietnamese 🇻🇳 + English 🇬🇧
> **Số câu hỏi:** 10 câu

---

## NX-01: Nx Workspace Structure

**Q:** *"Can you explain how you would structure an Nx monorepo for a large enterprise application? What's the difference between apps and libs, and how do you organize shared code?"*

🇻🇳 **Giải thích chi tiết:**
Nx workspace được tổ chức thành 2 thư mục chính: `apps/` chứa các ứng dụng deployable (như web apps, mobile apps, API servers) và `libs/` chứa các thư viện có thể tái sử dụng. Apps nên càng "thin" càng tốt - chỉ chứa bootstrap code và configuration, còn business logic thì đặt trong libs. Libs được phân loại theo nhiều tiêu chí: feature libs (chứa smart components và business logic), UI libs (chứa presentational components), data-access libs (chứa API calls, state management), và util libs (chứa helper functions). Shared libraries như `shared/ui`, `shared/utils`, `shared/data-access` được đặt trong thư mục riêng để nhiều apps có thể import. Cách tổ chức phổ biến là theo domain: `libs/products/feature-list`, `libs/products/data-access`, `libs/products/ui`. Điều này giúp team dễ navigate codebase, enforce boundaries rõ ràng, và tối ưu hóa build/test chỉ những phần bị ảnh hưởng. File `nx.json` ở root là brain của workspace, định nghĩa caching, task runners, và default configurations.

🇬🇧 **Sample Answer:**
> *"In an Nx monorepo, I structure the workspace with a clear separation between apps and libs directories. The apps folder contains deployable applications - these should be kept as thin as possible, primarily containing bootstrap code, routing configuration, and environment-specific settings. All business logic, components, and services live in the libs folder. I organize libs into several categories: feature libraries containing smart components with business logic, UI libraries with reusable presentational components, data-access libraries handling API calls and state management, and utility libraries for shared helper functions. For a large enterprise app, I follow a domain-driven structure like libs/customers/feature-dashboard, libs/customers/data-access, libs/customers/ui. Shared code that multiple domains need goes into libs/shared/ui or libs/shared/utils. This structure enables better code ownership, makes it easier to enforce architectural boundaries, and allows Nx to optimize builds by only processing affected projects. The nx.json at the root configures workspace-wide settings including caching behavior, named inputs, and target defaults. I also create a libs/shared/types folder for TypeScript interfaces used across the entire workspace."*

```typescript
// Typical Nx workspace structure
my-workspace/
├── apps/
│   ├── banking-portal/          // Main customer-facing app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.tsx
│   │   │   │   └── app.routes.ts
│   │   │   └── main.tsx
│   │   └── project.json
│   ├── admin-dashboard/         // Internal admin app
│   └── banking-portal-e2e/      // E2E tests
├── libs/
│   ├── accounts/                // Domain: Accounts
│   │   ├── feature-overview/    // Smart components
│   │   ├── feature-transfer/
│   │   ├── data-access/         // API + State
│   │   └── ui/                  // Presentational
│   ├── payments/                // Domain: Payments
│   │   ├── feature-send/
│   │   ├── data-access/
│   │   └── ui/
│   └── shared/                  // Cross-domain shared
│       ├── ui/                  // Design system components
│       ├── data-access/         // Auth, HTTP interceptors
│       ├── utils/               // Helper functions
│       └── types/               // Shared TypeScript types
├── nx.json
├── package.json
└── tsconfig.base.json

// nx.json - workspace configuration
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "main",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "sharedGlobals": ["{workspaceRoot}/tsconfig.base.json"],
    "production": ["default", "!{projectRoot}/**/*.spec.ts"]
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    }
  }
}

// tsconfig.base.json - Path aliases
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@myorg/shared-ui": ["libs/shared/ui/src/index.ts"],
      "@myorg/shared-utils": ["libs/shared/utils/src/index.ts"],
      "@myorg/accounts-data-access": ["libs/accounts/data-access/src/index.ts"]
    }
  }
}
```

---

## NX-02: Computation Caching

**Q:** *"How does Nx's computation caching work? What determines a cache hit or miss, and how can you configure it for your project?"*

🇻🇳 **Giải thích chi tiết:**
Nx computation caching hoạt động bằng cách tạo hash từ nhiều inputs: source files của project, dependencies, command arguments, và environment variables. Khi bạn chạy một task như `nx build my-app`, Nx sẽ tính hash và kiểm tra trong cache folder (mặc định là `.nx/cache`). Nếu hash match (cache hit), Nx sẽ replay output từ cache thay vì chạy lại task - bao gồm cả terminal output và generated files. Cache miss xảy ra khi bất kỳ input nào thay đổi: code changes, dependencies update, hoặc command flags khác nhau. Bạn có thể configure những gì được hash thông qua `namedInputs` trong nx.json - ví dụ exclude test files khi build production. Cache invalidation tự động khi bạn update dependencies trong package.json hoặc thay đổi tsconfig. Để debug cache, dùng `nx run my-app:build --verbose` để xem hash calculation details. Local cache rất hữu ích cho development, nhưng trong CI bạn cần Nx Cloud để share cache across machines và team members.

🇬🇧 **Sample Answer:**
> *"Nx computation caching works by creating a hash of all inputs that could affect a task's output. These inputs include the source files of the project, its dependencies' outputs, the command being run with its arguments, and relevant environment variables. When you run a task like nx build my-app, Nx first computes this hash and checks the local cache directory at .nx/cache. If there's a cache hit - meaning the exact same hash exists - Nx replays the cached terminal output and restores the cached artifacts instead of executing the task again. This can speed up builds dramatically, especially for unchanged projects. A cache miss occurs when any input changes: modified source code, updated dependencies, different CLI flags, or changed environment variables. You can fine-tune what gets included in the hash using namedInputs in nx.json - for instance, excluding spec files from production builds so that test changes don't invalidate build cache. The inputs array in targetDefaults lets you specify which namedInputs apply to each target. For debugging cache issues, running with --verbose shows the hash computation details, helping identify why cache misses occur. The outputs configuration tells Nx exactly which directories to cache and restore."*

```typescript
// nx.json - Cache configuration
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    // Default inputs for all tasks
    "default": [
      "{projectRoot}/**/*",          // All files in project
      "sharedGlobals"                 // Workspace-level configs
    ],
    // Shared global files that affect all projects
    "sharedGlobals": [
      "{workspaceRoot}/tsconfig.base.json",
      "{workspaceRoot}/babel.config.json"
    ],
    // Production builds exclude test files
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/**/*.spec.tsx",
      "!{projectRoot}/**/*.test.ts",
      "!{projectRoot}/jest.config.ts"
    ]
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],           // Build deps first
      "inputs": ["production", "^production"],
      "outputs": ["{options.outputPath}"],
      "cache": true                       // Enable caching
    },
    "test": {
      "inputs": [
        "default",
        "^production",                   // Deps' production output
        "{workspaceRoot}/jest.preset.js"
      ],
      "cache": true
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"],
      "cache": true
    }
  }
}

// Cache behavior demonstration
// First run - executes task:
$ nx build my-app
> nx run my-app:build (45.2s)

// Second run - cache hit, instant!
$ nx build my-app
> nx run my-app:build [local cache]
> Output restored from cache (0.18s)

// Clear cache when needed:
$ nx reset

// Debug cache hash:
$ nx build my-app --verbose

// project.json - Override cache settings per project
{
  "name": "my-app",
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "inputs": [
        "production",
        "^production",
        { "env": "NODE_ENV" },           // Include env var in hash
        { "runtime": "node --version" }  // Include node version
      ]
    }
  }
}
```

---

## NX-03: Nx Cloud & Distributed Task Execution

**Q:** *"What are the benefits of Nx Cloud, and how does Distributed Task Execution (DTE) improve CI performance? Can you explain the setup process?"*

🇻🇳 **Giải thích chi tiết:**
Nx Cloud cung cấp distributed caching và Distributed Task Execution (DTE) để tăng tốc CI đáng kể. Với distributed caching, cache được share giữa tất cả developers và CI agents - khi một người build xong, người khác có thể reuse kết quả ngay lập tức thay vì build lại từ đầu. DTE là tính năng mạnh hơn: thay vì mỗi CI agent chạy một subset tasks cố định, Nx Cloud dynamically phân phối tasks dựa trên project graph và task duration history. Ví dụ, nếu bạn có 100 tests cần chạy trên 10 agents, DTE sẽ intelligent schedule để tất cả agents finish gần như cùng lúc, tránh tình trạng 1 agent chạy quá lâu trong khi 9 agents đã xong. Setup rất đơn giản: chạy `nx connect` để link workspace với Nx Cloud, sau đó trong CI config dùng `nx-cloud start-ci-run` để enable DTE. Access tokens có 2 loại: read-only token cho CI (chỉ read cache), và read-write token cho những agents cần write cache. Nx Cloud cũng cung cấp dashboard để visualize task execution và cache hit rates.

🇬🇧 **Sample Answer:**
> *"Nx Cloud provides two major benefits: distributed caching and Distributed Task Execution (DTE). Distributed caching shares computation results across all team members and CI pipelines - when one developer builds a library, everyone else gets instant cache hits for that exact version. This alone can reduce CI times by 50% or more. DTE takes this further by intelligently distributing tasks across multiple CI agents based on the project dependency graph and historical timing data. Instead of naively splitting tasks evenly, DTE dynamically assigns work so all agents finish around the same time, preventing the common problem of one slow agent holding up the entire pipeline. For setup, you run nx connect to link your workspace to Nx Cloud, which adds the necessary configuration to nx.json. In your CI workflow, you use nx-cloud start-ci-run to initialize DTE, then run your nx affected commands normally - Nx Cloud handles the distribution automatically. You configure two types of access tokens: read-only tokens for PR builds that only consume cache, and read-write tokens for main branch builds that populate the cache. The Nx Cloud dashboard provides visibility into task execution timelines, cache hit rates, and historical CI performance trends, helping you identify optimization opportunities."*

```typescript
// 1. Connect to Nx Cloud
$ nx connect

// 2. nx.json after connecting
{
  "nxCloudAccessToken": "YOUR_READ_WRITE_TOKEN",
  // Or use environment variable (recommended)
  "nxCloudId": "your-workspace-id"
}

// 3. GitHub Actions CI with DTE
// .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:

env:
  NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - uses: nrwl/nx-set-shas@v4

      # Start DTE - distributes tasks across agents
      - run: npx nx-cloud start-ci-run --distribute-on="5 linux-medium-js"

      # Run affected commands - DTE handles distribution
      - run: npx nx affected -t lint test build --parallel=3

  # Agents that receive distributed tasks
  agents:
    runs-on: ubuntu-latest
    name: Agent ${{ matrix.agent }}
    strategy:
      matrix:
        agent: [1, 2, 3, 4, 5]
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx nx-cloud start-agent

// 4. Using Nx Cloud's managed agents (simpler)
name: CI
jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
      - run: npm ci
      - uses: nrwl/nx-set-shas@v4

      # Use Nx Cloud's managed agents - no self-hosted needed!
      - run: npx nx-cloud start-ci-run --distribute-on="5 linux-medium-js"
      - run: npx nx affected -t lint test build e2e
```

---

## NX-04: Project Graph & Affected Commands

**Q:** *"How does Nx's project graph work, and how do affected commands optimize CI pipelines? Can you give an example of using nx affected in a PR workflow?"*

🇻🇳 **Giải thích chi tiết:**
Project graph là core feature của Nx - nó tự động phân tích codebase để xây dựng dependency graph giữa các projects. Nx scan tất cả import statements trong TypeScript/JavaScript files để xác định project nào depend on project nào. Ví dụ, nếu `feature-dashboard` import từ `shared-ui`, Nx biết rằng thay đổi trong `shared-ui` sẽ affect `feature-dashboard`. Command `nx affected` sử dụng graph này để chỉ chạy tasks trên projects bị ảnh hưởng bởi changes giữa 2 git commits (thường là PR branch vs main). Điều này cực kỳ powerful cho large monorepos: thay vì build/test 100 projects, bạn chỉ build/test 5 projects thực sự bị ảnh hưởng. Trong CI, bạn cần set `NX_BASE` và `NX_HEAD` để Nx biết compare với commit nào - thường dùng action `nrwl/nx-set-shas` để tự động set. Bạn có thể visualize graph bằng `nx graph` hoặc `nx affected:graph` để xem exactly những gì sẽ được processed. Graph cũng giúp Nx determine build order đúng - build dependencies trước.

🇬🇧 **Sample Answer:**
> *"Nx's project graph is automatically constructed by analyzing the source code and understanding the dependencies between projects. Nx scans all TypeScript and JavaScript import statements to determine which projects depend on which - if feature-dashboard imports from shared-ui, Nx records that dependency relationship. The nx affected command leverages this graph to determine which projects are impacted by changes between two git commits. In a PR workflow, Nx compares the PR branch against the base branch (usually main) and identifies all modified files, then traces through the dependency graph to find every project that could be affected by those changes. This is incredibly powerful for CI optimization - instead of running all 100 tests in your monorepo, you might only run 5 tests for projects that actually changed or depend on changed code. To use affected commands, you need to set the base and head commits using NX_BASE and NX_HEAD environment variables. The nrwl/nx-set-shas GitHub Action handles this automatically for most CI scenarios. You can visualize the affected projects using nx affected:graph, which opens an interactive visualization showing exactly which projects will be processed. The graph also determines the correct build order, ensuring dependencies are built before the projects that depend on them."*

```typescript
// 1. Visualize the full project graph
$ nx graph

// 2. See only affected projects
$ nx affected:graph

// 3. Common affected commands
nx affected -t test          // Only test affected projects
nx affected -t build         // Only build affected projects
nx affected -t lint          // Only lint affected projects
nx affected -t lint test build  // Multiple targets

// 4. Specifying base and head commits
nx affected -t test --base=main --head=HEAD
nx affected -t build --base=abc1234

// 5. GitHub Actions workflow with affected
// .github/workflows/pr.yml
name: PR Checks
on:
  pull_request:
    branches: [main]

jobs:
  affected:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Need full history for affected

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      # Automatically sets NX_BASE and NX_HEAD
      - uses: nrwl/nx-set-shas@v4
        with:
          main-branch-name: 'main'

      # Run affected commands
      - run: npx nx affected -t lint --parallel=3
      - run: npx nx affected -t test --parallel=3 --ci
      - run: npx nx affected -t build --parallel=3

      # List affected projects
      - run: npx nx show projects --affected

// 6. Understanding dependency detection
// libs/shared/ui/src/index.ts
export * from './lib/button/button';
export * from './lib/modal/modal';

// libs/feature-dashboard/src/lib/dashboard.tsx
import { Button, Modal } from '@myorg/shared-ui';  // Nx detects this!

// If shared-ui changes, feature-dashboard is "affected"
// nx affected -t test will include feature-dashboard

// 7. Practical example - PR changes shared-ui
// Git diff shows: libs/shared/ui/src/lib/button.tsx modified
//
// Affected projects (auto-detected):
// - shared-ui (directly changed)
// - feature-dashboard (imports shared-ui)
// - banking-portal (imports feature-dashboard)
//
// NOT affected (skipped):
// - shared-utils (no dependency on shared-ui)
// - payments-feature (no dependency on shared-ui)
```

---

## NX-05: Module Boundaries & Tags

**Q:** *"How do you enforce module boundaries in an Nx monorepo? Explain project tags and the @nx/enforce-module-boundaries ESLint rule."*

🇻🇳 **Giải thích chi tiết:**
Module boundaries là architectural constraints ngăn chặn improper dependencies giữa projects. Nx sử dụng system of tags trong `project.json` để classify projects, ví dụ: `scope:accounts`, `scope:payments`, `type:feature`, `type:ui`, `type:data-access`. Sau đó, bạn define rules trong `.eslintrc.json` sử dụng `@nx/enforce-module-boundaries` rule để specify project nào được phép import project nào. Ví dụ: feature libs chỉ được import ui và data-access libs cùng scope; ui libs không được import feature libs; và shared libs có thể được import bởi tất cả nhưng chỉ import từ shared. Rule này chạy trong ESLint nên violations bị catch ngay trong IDE và CI. Điều này cực kỳ quan trọng trong large teams để prevent spaghetti dependencies và maintain clean architecture. Nếu developer cố import một project không được phép, họ sẽ thấy ESLint error ngay lập tức với message giải thích tại sao. Tags cũng useful cho grouping projects trong `nx graph` hoặc target specific projects.

🇬🇧 **Sample Answer:**
> *"Module boundaries in Nx are enforced through a combination of project tags and the @nx/enforce-module-boundaries ESLint rule. Each project in the monorepo is assigned tags in its project.json file that classify it by scope (business domain) and type (architectural layer). Common tag patterns include scope:accounts, scope:payments for domains, and type:feature, type:ui, type:data-access, type:util for layers. In the root .eslintrc.json, you configure the enforce-module-boundaries rule with depConstraints that define which tags can depend on which. For example, you might specify that type:feature projects can only import from type:ui, type:data-access, and type:util within the same scope, while type:ui projects cannot import from type:feature at all. This prevents common architectural violations like UI components importing business logic or one domain directly coupling to another domain's internals. The rule runs as part of ESLint, so developers get immediate feedback in their IDE when they violate boundaries, and CI will fail if violations are committed. You can also use notDependOnLibsWithTags to explicitly block certain combinations. This enforcement is crucial for maintaining clean architecture in large enterprise codebases where multiple teams work across different domains."*

```typescript
// 1. Project tags in project.json
// libs/accounts/feature-overview/project.json
{
  "name": "accounts-feature-overview",
  "tags": ["scope:accounts", "type:feature"]
}

// libs/accounts/ui/project.json
{
  "name": "accounts-ui",
  "tags": ["scope:accounts", "type:ui"]
}

// libs/shared/ui/project.json
{
  "name": "shared-ui",
  "tags": ["scope:shared", "type:ui"]
}

// libs/shared/utils/project.json
{
  "name": "shared-utils",
  "tags": ["scope:shared", "type:util"]
}

// 2. ESLint configuration with module boundaries
// .eslintrc.json (root)
{
  "root": true,
  "plugins": ["@nx"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              // Feature can import ui, data-access, util
              {
                "sourceTag": "type:feature",
                "onlyDependOnLibsWithTags": [
                  "type:ui",
                  "type:data-access",
                  "type:util",
                  "scope:shared"
                ]
              },
              // UI can only import other UI and utils
              {
                "sourceTag": "type:ui",
                "onlyDependOnLibsWithTags": [
                  "type:ui",
                  "type:util",
                  "scope:shared"
                ]
              },
              // Data-access can import utils and other data-access
              {
                "sourceTag": "type:data-access",
                "onlyDependOnLibsWithTags": [
                  "type:data-access",
                  "type:util",
                  "scope:shared"
                ]
              },
              // Scope restrictions - accounts cannot import payments
              {
                "sourceTag": "scope:accounts",
                "notDependOnLibsWithTags": ["scope:payments", "scope:loans"]
              },
              // Shared can only import shared
              {
                "sourceTag": "scope:shared",
                "onlyDependOnLibsWithTags": ["scope:shared"]
              }
            ]
          }
        ]
      }
    }
  ]
}

// 3. What happens when you violate boundaries
// libs/accounts/ui/src/lib/account-card.tsx
import { fetchAccountData } from '@myorg/accounts-data-access';
// ESLint Error: A project tagged with "type:ui" can only depend on
// libs tagged with "type:ui", "type:util", "scope:shared"

import { formatCurrency } from '@myorg/shared-utils'; // OK
import { Button } from '@myorg/shared-ui'; // OK

// 4. Run module boundary checks
nx lint accounts-feature-overview
nx affected -t lint
```

---

## NX-06: Code Generators (nx generate)

**Q:** *"How do you use Nx generators to maintain consistency across a large team? Can you explain how to create a custom workspace generator?"*

🇻🇳 **Giải thích chi tiết:**
Nx generators là powerful tool để tự động tạo code theo patterns chuẩn của team. Built-in generators như `nx g @nx/react:lib my-lib` tạo library với structure đúng, tests, và configs. Nhưng real power là custom generators: bạn có thể tạo generators riêng để enforce team conventions. Ví dụ, generator `feature-lib` có thể tạo library với folder structure chuẩn (components/, hooks/, services/), pre-configured với đúng tags, và include boilerplate code như Redux slice hoặc React Query hooks. Custom generators sống trong `tools/generators/` folder. Mỗi generator có 2 files chính: `schema.json` define input parameters (tên lib, scope, có include tests không), và `index.ts` chứa logic để generate files. Bạn có thể dùng `generateFiles()` function để copy template files với variable substitution, hoặc call other generators programmatically. Team members chỉ cần chạy `nx g @myorg/workspace:feature-lib --name=payments --scope=banking` và nhận được consistent structure. Điều này reduce onboarding time và ensure best practices được applied automatically.

🇬🇧 **Sample Answer:**
> *"Nx generators are essential for maintaining consistency in large teams by automating the creation of code that follows established patterns and conventions. Built-in generators from plugins like @nx/react or @nx/node create libraries and applications with the correct structure, configuration files, and test setup. However, the real power comes from creating custom workspace generators tailored to your team's specific needs. Custom generators live in the tools/generators directory and consist of a schema.json file that defines the input parameters and an index.ts file containing the generation logic. For example, I might create a feature-lib generator that creates a library with our standard folder structure including components, hooks, services, and state management, pre-configured with the correct project tags, and including boilerplate code like a Redux slice template or React Query hook setup. The generator can use the generateFiles function to copy template files with variable substitution, applying the project name, scope, and other parameters throughout the generated code. It can also programmatically invoke other generators, like calling the base React library generator first then adding our customizations on top. Team members simply run the generator command and get a fully structured, properly configured library. This dramatically reduces onboarding time and ensures architectural decisions are automatically enforced."*

```typescript
// 1. Using built-in generators
nx g @nx/react:lib shared-ui --directory=libs/shared/ui --tags="scope:shared,type:ui"
nx g @nx/react:component button --project=shared-ui --export
nx g @nx/node:lib shared-utils --directory=libs/shared/utils

// 2. Create custom generator scaffold
nx g @nx/plugin:generator feature-lib --project=workspace-plugin

// 3. Custom generator structure
// tools/generators/feature-lib/
// ├── index.ts           # Generator logic
// ├── schema.json        # Input schema
// ├── schema.d.ts        # TypeScript types
// └── files/             # Template files
//     └── src/
//         ├── index.ts__tmpl__
//         └── lib/
//             └── __fileName__.tsx__tmpl__

// 4. schema.json - Define generator inputs
{
  "$schema": "http://json-schema.org/schema",
  "$id": "FeatureLib",
  "title": "Create a Feature Library",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Library name",
      "x-prompt": "What is the name of the feature library?"
    },
    "scope": {
      "type": "string",
      "description": "The scope/domain of the library",
      "enum": ["accounts", "payments", "loans", "shared"],
      "x-prompt": "Which scope does this library belong to?"
    },
    "withRedux": {
      "type": "boolean",
      "description": "Include Redux Toolkit slice",
      "default": true
    }
  },
  "required": ["name", "scope"]
}

// 5. index.ts - Generator implementation
import {
  Tree,
  formatFiles,
  generateFiles,
  names,
  joinPathFragments,
  addProjectConfiguration,
  updateJson,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/react';

interface FeatureLibSchema {
  name: string;
  scope: string;
  withRedux: boolean;
}

export default async function (tree: Tree, schema: FeatureLibSchema) {
  const { name, scope, withRedux } = schema;
  const { fileName, className, propertyName } = names(name);

  const projectName = `${scope}-feature-${fileName}`;
  const projectRoot = `libs/${scope}/feature-${fileName}`;

  // 1. Generate base React library
  await libraryGenerator(tree, {
    name: `feature-${fileName}`,
    directory: `libs/${scope}`,
    tags: `scope:${scope},type:feature`,
    style: 'css',
  });

  // 2. Generate custom template files
  generateFiles(
    tree,
    joinPathFragments(__dirname, './files'),
    projectRoot,
    {
      fileName,
      className,
      propertyName,
      scope,
      withRedux,
      tmpl: '',
    }
  );

  // 3. Update tsconfig paths
  updateJson(tree, 'tsconfig.base.json', (json) => {
    json.compilerOptions.paths[`@myorg/${projectName}`] = [
      `${projectRoot}/src/index.ts`,
    ];
    return json;
  });

  await formatFiles(tree);

  return () => {
    console.log(`Feature library "${projectName}" created!`);
  };
}

// 6. Running the custom generator
nx g @myorg/workspace:feature-lib dashboard --scope=accounts --withRedux=true
```

---

## NX-07: Task Pipeline & Dependencies

**Q:** *"How do you configure task pipelines in Nx? Explain dependsOn, targetDefaults, and how Nx determines the correct execution order."*

🇻🇳 **Giải thích chi tiết:**
Task pipeline trong Nx được configure thông qua `targetDefaults` trong `nx.json` và `dependsOn` property. `dependsOn` specify những tasks nào phải complete trước khi task hiện tại có thể chạy. Có 2 loại dependencies: `^build` (với caret) có nghĩa là build tất cả dependencies' build targets trước - tức là nếu app-A depend on lib-B, thì lib-B:build phải xong trước app-A:build. Dependencies không có caret như `["lint", "test"]` có nghĩa là lint và test của cùng project phải xong trước. Bạn có thể combine: `dependsOn: ["^build", "lint"]` yêu cầu cả dependencies được build VÀ lint pass trước. `targetDefaults` cho phép define default configuration cho tất cả targets cùng tên across workspace - thay vì specify `dependsOn` trong mỗi project.json, bạn define một lần trong nx.json. Nx sử dụng project graph và task dependencies để build execution plan, chạy independent tasks in parallel và ensure đúng order cho dependent tasks. Property `inputs` và `outputs` crucial để caching hoạt động đúng.

🇬🇧 **Sample Answer:**
> *"Task pipelines in Nx are configured using targetDefaults in nx.json and the dependsOn property in individual project configurations. The dependsOn array specifies which tasks must complete before the current task can run, and there are two types of dependencies. Dependencies prefixed with a caret like ^build mean 'run the build target on all projects this project depends on first' - so if my-app imports from shared-ui, shared-ui:build must complete before my-app:build starts. Dependencies without the caret, like lint or test, refer to targets on the same project - so dependsOn: ['lint'] means lint must pass before the task runs. You can combine these: dependsOn: ['^build', 'lint', 'test'] requires all dependency builds AND the current project's lint and test to complete first. The targetDefaults section in nx.json lets you define default configurations that apply to all targets with the same name across the workspace, avoiding repetition in individual project.json files. Nx uses the project dependency graph combined with task dependencies to build a complete execution plan, running independent tasks in parallel while respecting the ordering constraints. The inputs and outputs properties are crucial for caching - inputs define what affects the cache hash, while outputs tell Nx what files to cache and restore."*

```typescript
// 1. nx.json - Complete targetDefaults configuration
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "sharedGlobals": ["{workspaceRoot}/tsconfig.base.json"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/jest.config.ts"
    ]
  },
  "targetDefaults": {
    // Build configuration
    "build": {
      "dependsOn": ["^build"],  // Build all dependencies first
      "inputs": ["production", "^production"],
      "outputs": ["{options.outputPath}"],
      "cache": true
    },

    // Test configuration
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "cache": true
    },

    // E2E tests - depend on app being built
    "e2e": {
      "dependsOn": ["^build"],
      "inputs": ["default", "^production"],
      "cache": true
    },

    // Serve - needs build first
    "serve": {
      "dependsOn": ["build"],
      "cache": false
    },

    // Custom deploy target
    "deploy": {
      "dependsOn": ["build", "lint", "test"],
      "cache": false
    }
  }
}

// 2. Project-specific overrides in project.json
{
  "name": "banking-portal",
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "dependsOn": [
        "^build",
        "generate-api-types"  // Custom pre-build step
      ]
    },
    "generate-api-types": {
      "executor": "nx:run-commands",
      "options": {
        "command": "openapi-typescript api/schema.yaml -o src/types/api.ts"
      },
      "inputs": ["{projectRoot}/api/schema.yaml"],
      "outputs": ["{projectRoot}/src/types/api.ts"],
      "cache": true
    }
  }
}

// 3. Understanding execution order
// Dependency graph:
//   banking-portal (app)
//     └── accounts-feature (lib)
//           ├── accounts-ui (lib)
//           └── accounts-data-access (lib)
//                 └── shared-utils (lib)

// Running: nx build banking-portal
// Execution order (respecting ^build):
// 1. shared-utils:build      (no deps)
// 2. accounts-ui:build       (parallel)
// 3. accounts-data-access:build (waits for shared-utils)
// 4. accounts-feature:build  (waits for ui + data-access)
// 5. banking-portal:build    (waits for accounts-feature)

// 4. Visualize task pipeline
nx graph --target=build --focus=banking-portal

// 5. Run with verbose to see execution plan
nx build banking-portal --verbose
```

---

## NX-08: Migrating to Nx

**Q:** *"How would you migrate an existing React/Angular project to an Nx monorepo? What are the different adoption strategies?"*

🇻🇳 **Giải thích chi tiết:**
Có nhiều strategies để migrate sang Nx, từ minimal đến full adoption. Strategy đơn giản nhất là `nx init` trong existing project - nó adds Nx mà không change project structure, bạn được caching và task running ngay lập tức. Đây gọi là "package-based" monorepo. Strategy tiếp theo là migrate sang "integrated" monorepo với `nx add @nx/react` để có full Nx features như generators, executors, và code splitting thành libs. Với large existing projects, approach tốt nhất là incremental: giữ existing app structure, dần dần extract shared code thành libs. Nx cung cấp `nx migrate` command để update Nx version và automatically apply breaking changes thông qua codemods. Khi migrate từ CRA (Create React App), bạn có thể dùng `npx nx@latest init` rồi chạy migrations. Từ Angular CLI, process smooth hơn vì Nx được build on top of Angular CLI - chạy `ng add @nx/angular` là đủ. Key consideration là maintain CI/CD pipeline working throughout migration - start với caching, sau đó gradually adopt more features.

🇬🇧 **Sample Answer:**
> *"There are several strategies for migrating to Nx, ranging from minimal adoption to full integration. The simplest approach is running nx init in your existing project, which adds Nx without changing your project structure - you immediately get computation caching and the task runner. This is called a package-based monorepo and is ideal for teams that want quick wins without disruption. The next level is migrating to an integrated monorepo using nx add @nx/react or @nx/angular, which enables full Nx features like code generators, executors, and the ability to split your application into well-structured libraries. For large existing projects, I recommend an incremental approach: keep the existing app structure initially, then gradually extract shared code into libs over time as natural refactoring opportunities arise. Nx provides the nx migrate command which updates your Nx version and automatically applies breaking changes through codemods - this makes staying up to date much easier. When migrating from Create React App, you run npx nx@latest init followed by migration scripts that convert webpack configurations. Migrating from Angular CLI is smoother since Nx is built on top of it - ng add @nx/angular handles most of the work. The key consideration throughout any migration is maintaining a working CI/CD pipeline - start with caching benefits first, then gradually adopt more features."*

```typescript
// 1. MINIMAL ADOPTION - Add Nx to existing project
$ npx nx@latest init

// This adds:
// - nx.json with basic configuration
// - nx package to package.json
// - Enables caching for existing npm scripts

// After init, you can run:
nx build    // Uses caching!
nx test     // Uses caching!

// 2. MIGRATE CRA (Create React App) TO NX
// Step 1: Initialize Nx
npx nx@latest init

// Step 2: Add React plugin
nx add @nx/react

// Step 3: Convert CRA to Nx React app (follow prompts)

// 3. MIGRATE ANGULAR CLI TO NX
ng add @nx/angular

// 4. INCREMENTAL ADOPTION - Recommended for large projects
// Phase 1: Add Nx basics
npx nx@latest init

// Phase 2: Add plugin for your framework
nx add @nx/react

// Phase 3: Extract first shared library
nx g @nx/react:lib shared-ui --directory=libs/shared/ui
// Manually move shared components from src/ to libs/shared/ui/

// Phase 4: Extract feature libraries over time
nx g @nx/react:lib feature-auth --directory=libs/auth/feature

// Phase 5: Enable module boundaries
// Add tags and ESLint rules

// 5. NX MIGRATE - Keeping Nx up to date
// Check for available migrations
nx migrate latest

// Review migrations (creates migrations.json)
cat migrations.json

// Run migrations
nx migrate --run-migrations

// 6. Migration scripts in package.json
{
  "scripts": {
    "start": "nx serve",
    "build": "nx build",
    "test": "nx test",
    "affected:build": "nx affected -t build",
    "affected:test": "nx affected -t test"
  }
}

// 7. Converting existing structure to libs
// Before (typical CRA structure):
// src/
// ├── components/
// ├── features/
// ├── services/
// └── utils/

// After (Nx integrated structure):
// apps/
// └── web-app/
//     └── src/app/app.tsx  // Thin shell
// libs/
// ├── shared/ui/          // Button, Modal, Form
// ├── shared/utils/       // Utility functions
// ├── auth/feature/       // Auth pages
// └── dashboard/feature/  // Dashboard pages

// 8. Workspace presets for new projects
npx create-nx-workspace@latest myorg --preset=react-monorepo
npx create-nx-workspace@latest myorg --preset=angular-monorepo
npx create-nx-workspace@latest myorg --preset=next
npx create-nx-workspace@latest myorg --preset=ts  // Package-based
```

---

## NX-09: Release Management

**Q:** *"How do you handle versioning and releases in an Nx monorepo? Explain the nx release workflow and the difference between fixed and independent versioning."*

🇻🇳 **Giải thích chi tiết:**
Nx release là built-in feature để manage versioning và publishing packages trong monorepo. Có 2 versioning strategies: "fixed" (tất cả packages share cùng version number, như Angular) và "independent" (mỗi package có version riêng, như Babel). Fixed versioning đơn giản hơn - khi release, tất cả packages bump lên cùng version. Independent versioning flexible hơn nhưng complex hơn - chỉ packages có changes mới được bump. Nx release workflow gồm 3 steps: version (determine new version numbers), changelog (generate CHANGELOG.md từ conventional commits), và publish (publish lên npm registry). Bạn config trong nx.json với `release` object, specify projects nào được release, versioning strategy, và changelog format. Conventional commits (feat:, fix:, BREAKING CHANGE:) được parse để automatically determine semver bump: fix = patch, feat = minor, BREAKING CHANGE = major. Nx cũng hỗ trợ release groups để group related packages và git tags để track releases. Command `nx release --dry-run` cho phép preview changes.

🇬🇧 **Sample Answer:**
> *"Nx release provides a comprehensive workflow for versioning and publishing packages in a monorepo. There are two main versioning strategies: fixed versioning where all packages share the same version number, and independent versioning where each package has its own version. Fixed versioning, used by frameworks like Angular, is simpler to manage - when you release, all packages bump to the same version regardless of individual changes. Independent versioning, used by projects like Babel, is more flexible but complex - only packages with actual changes get version bumps. The nx release workflow consists of three main steps: version determination based on conventional commits, changelog generation from commit history, and publishing to npm or other registries. You configure this in nx.json under the release property, specifying which projects to include, the versioning strategy, and changelog formatting options. Conventional commits like feat:, fix:, and BREAKING CHANGE: are parsed to automatically determine the appropriate semver bump - fix commits trigger patch versions, feat commits trigger minor versions, and breaking changes trigger major versions. Nx also supports release groups for handling related packages together and generates git tags to track release points. The nx release --dry-run command lets you preview all changes before actually executing."*

```typescript
// 1. nx.json - Release configuration
{
  "release": {
    "projects": ["packages/*"],
    "projectsRelationship": "fixed",  // or "independent"

    "version": {
      "preVersionCommand": "npx nx run-many -t build",
      "conventionalCommits": true
    },

    "changelog": {
      "projectChangelogs": true,
      "workspaceChangelog": {
        "createRelease": "github"
      }
    },

    "git": {
      "commit": true,
      "commitMessage": "chore(release): publish {version}",
      "tag": true
    },

    "releaseTagPattern": "v{version}"
  }
}

// 2. Fixed versioning - All packages same version
{
  "release": {
    "projects": ["packages/*"],
    "projectsRelationship": "fixed"
  }
}
// After release: all packages -> 2.1.0

// 3. Independent versioning - Each package own version
{
  "release": {
    "projects": ["packages/*"],
    "projectsRelationship": "independent"
  }
}
// After release (only changed packages bump):
// shared-ui: 2.1.0 -> 2.2.0 (had changes)
// shared-utils: 1.5.0 (no changes)
// data-access: 3.0.0 -> 3.0.1 (had fix)

// 4. Release groups
{
  "release": {
    "groups": {
      "core": {
        "projects": ["shared-ui", "shared-utils"],
        "projectsRelationship": "fixed"
      },
      "features": {
        "projects": ["feature-*"],
        "projectsRelationship": "independent"
      }
    }
  }
}

// 5. Running releases
nx release --dry-run           // Preview
nx release                     // Interactive release
nx release patch               // 1.0.0 -> 1.0.1
nx release minor               // 1.0.0 -> 1.1.0
nx release major               // 1.0.0 -> 2.0.0
nx release premajor --preid=beta  // 1.0.0 -> 2.0.0-beta.0

// 6. Individual release steps
nx release version             // Just bump versions
nx release changelog           // Just generate changelogs
nx release publish             // Just publish to npm

// 7. Conventional commits for automatic versioning
git commit -m "fix(shared-ui): correct button padding"    // patch
git commit -m "feat(shared-ui): add Tooltip component"    // minor
git commit -m "feat(shared-ui)!: redesign Button API      // major
BREAKING CHANGE: Button props renamed"

// 8. CI workflow for releases
// .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npx nx run-many -t build

      - name: Release
        run: npx nx release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## NX-10: Nx Plugins & Executors

**Q:** *"How does the Nx plugin ecosystem work? Explain how to configure executors and when you might create a custom executor."*

🇻🇳 **Giải thích chi tiết:**
Nx plugins extend Nx với support cho specific frameworks và tools. Official plugins như @nx/react, @nx/angular, @nx/next, @nx/node cung cấp generators để tạo projects và executors để run tasks như build, serve, test. Executors là functions chạy tasks - chúng wrap underlying tools (webpack, vite, jest) với configuration phù hợp cho Nx ecosystem. Mỗi executor được configure trong project.json với options specific cho executor đó. Ví dụ, @nx/webpack:webpack executor có options cho entry point, output path, optimization settings. Community plugins mở rộng hỗ trợ cho tools như Storybook, Cypress, Tailwind. Bạn có thể tạo custom executors khi cần automate repetitive tasks không có sẵn executor, như generate API types từ OpenAPI spec, run custom deployment scripts, hoặc integrate với internal tools. Custom executors sống trong workspace plugin. Executor nhận context (project info, workspace root) và options (từ project.json), trả về success/failure status. Đây là cách powerful để standardize complex build processes.

🇬🇧 **Sample Answer:**
> *"The Nx plugin ecosystem extends Nx's capabilities with first-class support for specific frameworks and tools. Official plugins like @nx/react, @nx/angular, @nx/next, and @nx/node provide generators for creating properly structured projects and executors for running tasks like build, serve, and test. Executors are essentially functions that perform tasks - they wrap underlying tools like webpack, vite, or jest with configuration optimized for the Nx ecosystem, handling caching, dependency management, and parallel execution automatically. Each executor is configured in project.json with options specific to that executor - for example, @nx/webpack:webpack has options for entry points, output paths, and optimization settings. The community plugin ecosystem extends support to tools like Storybook, Cypress, Tailwind, and many more. You would create a custom executor when you need to automate repetitive tasks that no existing executor handles - common examples include generating TypeScript types from OpenAPI specifications, running custom deployment scripts to your cloud infrastructure, or integrating with internal company tools. Custom executors live either in a workspace plugin under tools/plugins or in a publishable plugin package. An executor receives context containing project information and workspace root, plus options from project.json, and returns a success or failure status. This provides a powerful way to standardize complex build processes across your entire team."*

```typescript
// 1. Installing and using official plugins
npm install @nx/react @nx/node @nx/storybook

// Plugins add generators and executors:
nx g @nx/react:app my-app
nx g @nx/react:lib my-lib
nx g @nx/storybook:configuration my-lib

// 2. Project.json with executor configuration
{
  "name": "banking-portal",
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "defaultConfiguration": "production",
      "options": {
        "compiler": "babel",
        "outputPath": "dist/apps/banking-portal",
        "index": "apps/banking-portal/src/index.html",
        "main": "apps/banking-portal/src/main.tsx",
        "tsConfig": "apps/banking-portal/tsconfig.app.json",
        "assets": ["apps/banking-portal/src/assets"],
        "styles": ["apps/banking-portal/src/styles.css"]
      },
      "configurations": {
        "development": {
          "optimization": false,
          "sourceMap": true
        },
        "production": {
          "optimization": true,
          "sourceMap": false
        }
      }
    },
    "serve": {
      "executor": "@nx/webpack:dev-server",
      "options": {
        "buildTarget": "banking-portal:build",
        "hmr": true,
        "port": 4200
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "apps/banking-portal/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "options": {
        "lintFilePatterns": ["apps/banking-portal/**/*.{ts,tsx}"]
      }
    }
  }
}

// 3. Creating a custom executor
// tools/plugins/my-plugin/src/executors/generate-api-types/executor.ts
import { ExecutorContext } from '@nx/devkit';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export interface GenerateApiTypesOptions {
  specPath: string;
  outputPath: string;
  generator?: 'typescript-fetch' | 'typescript-axios';
}

export default async function runExecutor(
  options: GenerateApiTypesOptions,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const { specPath, outputPath, generator = 'typescript-fetch' } = options;
  const projectRoot = context.projectGraph.nodes[context.projectName].data.root;

  const fullSpecPath = join(context.root, projectRoot, specPath);
  const fullOutputPath = join(context.root, projectRoot, outputPath);

  console.log(`Generating API types from ${fullSpecPath}`);

  if (!existsSync(fullSpecPath)) {
    console.error(`OpenAPI spec not found: ${fullSpecPath}`);
    return { success: false };
  }

  try {
    execSync(
      `npx openapi-generator-cli generate -i ${fullSpecPath} -g ${generator} -o ${fullOutputPath}`,
      { stdio: 'inherit' }
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to generate API types:', error);
    return { success: false };
  }
}

// 4. Executor schema
// tools/plugins/my-plugin/src/executors/generate-api-types/schema.json
{
  "$schema": "http://json-schema.org/schema",
  "type": "object",
  "properties": {
    "specPath": {
      "type": "string",
      "description": "Path to OpenAPI spec file"
    },
    "outputPath": {
      "type": "string",
      "description": "Output directory for generated types"
    },
    "generator": {
      "type": "string",
      "enum": ["typescript-fetch", "typescript-axios"],
      "default": "typescript-fetch"
    }
  },
  "required": ["specPath", "outputPath"]
}

// 5. Using custom executor in project.json
{
  "name": "data-access",
  "targets": {
    "generate-types": {
      "executor": "@myorg/my-plugin:generate-api-types",
      "options": {
        "specPath": "api/openapi.yaml",
        "outputPath": "src/generated"
      },
      "inputs": ["{projectRoot}/api/openapi.yaml"],
      "outputs": ["{projectRoot}/src/generated"],
      "cache": true
    },
    "build": {
      "dependsOn": ["generate-types"]
    }
  }
}

// 6. Run commands executor - Quick custom tasks
{
  "targets": {
    "docker-build": {
      "executor": "nx:run-commands",
      "options": {
        "commands": [
          "docker build -t myapp:{args.tag} .",
          "docker push myapp:{args.tag}"
        ],
        "cwd": "apps/banking-portal",
        "parallel": false
      }
    }
  }
}

// 7. Popular community plugins
// @nx/storybook - Storybook integration
// @nx/cypress - Cypress E2E testing
// @nxext/vite - Vite bundler
// @nx/expo - Expo/React Native
// @nx/nest - NestJS backend

// 8. List available executors
nx list @nx/react    // See all executors from plugin
nx list              // See all installed plugins
```

---
