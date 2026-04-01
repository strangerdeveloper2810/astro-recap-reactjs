# NX MONOREPO (6-8 cau)

> **Target**: Senior Frontend Engineer @ HCL ANZ Bank Project
> **Tech Stack**: Next.js 14 + Nx Monorepo + gRPC
> **Focus**: Practical Nx knowledge for enterprise-scale frontend

---

## NX-01: What is Nx & Why Monorepo?

**Question:** *What is Nx and why would you choose a monorepo over a polyrepo approach?*

:flag_vn: Nx la mot build system thong minh giup quan ly monorepo - noi nhieu du an (apps va libs) nam chung mot repository. So voi polyrepo (moi du an mot repo rieng), monorepo giup chia se code de dang, dam bao consistency ve dependencies va tooling, va cho phep atomic commits xuyen suot nhieu projects. Trong context ngan hang nhu ANZ, monorepo dac biet huu ich khi nhieu team cung lam viec tren cac micro frontends chia se chung design system va business logic.

:flag_gb: *"Nx is a smart build system and CLI that helps manage monorepos at scale. In a monorepo, multiple applications and libraries live in a single repository, which gives us several key advantages over polyrepo. First, code sharing becomes trivial - shared UI components, utility functions, and TypeScript interfaces are just an import away without publishing packages. Second, we get atomic commits, meaning a change to a shared library and all consuming apps can be reviewed and merged together, eliminating version drift. Third, Nx provides powerful tooling like computation caching, affected commands, and dependency graph visualization that makes working in a large monorepo efficient. At ANZ, where we have multiple frontend apps sharing a common design system and API layer, a monorepo with Nx is the ideal architecture."*

```
Polyrepo:                          Monorepo (Nx):
┌──────────┐  ┌──────────┐       ┌─────────────────────────────┐
│ repo-app1│  │ repo-app2│       │  nx-workspace/              │
│ ├─ src/  │  │ ├─ src/  │       │  ├─ apps/                   │
│ ├─ pkg/  │  │ ├─ pkg/  │       │  │  ├─ customer-portal/     │
│ └─ ...   │  │ └─ ...   │       │  │  └─ admin-dashboard/     │
└──────────┘  └──────────┘       │  ├─ libs/                   │
┌──────────┐  ┌──────────┐       │  │  ├─ shared-ui/           │
│ repo-lib1│  │ repo-lib2│       │  │  ├─ data-access/         │
│ ├─ src/  │  │ ├─ src/  │       │  │  └─ util/                │
│ └─ ...   │  │ └─ ...   │       │  ├─ nx.json                 │
└──────────┘  └──────────┘       │  └─ package.json            │
  4 repos, 4 CI pipelines         └─────────────────────────────┘
  publish + version hell             1 repo, smart CI, shared code
```

---

## NX-02: Nx Workspace Structure

**Question:** *Explain the structure of an Nx workspace. What are the key configuration files?*

:flag_vn: Mot Nx workspace co cau truc ro rang: `apps/` chua cac ung dung deployable (nhu Next.js apps), `libs/` chua cac thu vien duoc chia se giua cac apps. File `nx.json` cau hinh global cho workspace (caching, task runners, default settings), con moi project co `project.json` dinh nghia targets (build, test, lint) rieng. `tsconfig.base.json` o root dinh nghia path aliases de import libs de dang.

:flag_gb: *"An Nx workspace follows a well-defined structure. At the top level, we have two main directories: `apps/` contains deployable applications like our Next.js customer portal or admin dashboard, and `libs/` contains shared libraries organized by type - feature libraries, UI components, data-access layers, and utilities. The `nx.json` file at the root configures workspace-wide settings like caching behavior, default task runner options, and which tasks can be parallelized. Each project has its own `project.json` that defines targets - essentially the commands you can run like build, test, serve, and lint. The `tsconfig.base.json` defines path aliases so any app can import from any library using clean paths like `@anz/shared-ui` instead of relative paths. This structure enforces clear boundaries and makes dependency management explicit."*

```
anz-workspace/
├── apps/
│   ├── customer-portal/          # Next.js app
│   │   ├── src/
│   │   ├── project.json          # App-specific targets
│   │   └── tsconfig.json
│   └── admin-dashboard/          # Another Next.js app
│       ├── src/
│       ├── project.json
│       └── tsconfig.json
├── libs/
│   ├── shared/
│   │   ├── ui/                   # Shared UI components
│   │   │   ├── src/
│   │   │   └── project.json
│   │   ├── data-access/          # API clients, services
│   │   │   ├── src/
│   │   │   └── project.json
│   │   └── util/                 # Helper functions
│   │       ├── src/
│   │       └── project.json
│   └── customer/
│       └── feature-dashboard/    # Feature-specific lib
│           ├── src/
│           └── project.json
├── nx.json                       # Workspace config
├── tsconfig.base.json            # Path aliases
└── package.json                  # Root dependencies
```

```jsonc
// nx.json - Workspace configuration
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],      // Build dependencies first
      "cache": true                   // Enable caching
    },
    "test": {
      "cache": true
    },
    "lint": {
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": ["default", "!{projectRoot}/**/*.spec.ts"]
  },
  "defaultBase": "main"
}
```

```jsonc
// tsconfig.base.json - Path aliases
{
  "compilerOptions": {
    "paths": {
      "@anz/shared-ui":        ["libs/shared/ui/src/index.ts"],
      "@anz/data-access":      ["libs/shared/data-access/src/index.ts"],
      "@anz/util":             ["libs/shared/util/src/index.ts"],
      "@anz/customer-feature": ["libs/customer/feature-dashboard/src/index.ts"]
    }
  }
}
```

---

## NX-03: Task Caching & Affected Commands

**Question:** *How does Nx computation caching work, and what are affected commands?*

:flag_vn: Nx cache ket qua cua moi task (build, test, lint) dua tren hash cua source files, dependencies va environment. Khi chay lai mot task ma inputs khong doi, Nx tra ve ket qua tu cache ngay lap tuc thay vi chay lai - giup tiet kiem thoi gian CI dang ke. Lenh `nx affected` chi chay tasks tren cac projects bi anh huong boi thay doi code hien tai (so voi base branch), rat quan trong cho CI/CD trong monorepo lon nhu o ANZ noi mot thay doi nho khong nen trigger build toan bo 20+ projects.

:flag_gb: *"Nx computation caching is one of its most powerful features. When you run a task like `nx build customer-portal`, Nx creates a hash based on the source files, dependencies, environment variables, and the command itself. If nothing has changed, running the same command again returns the cached result instantly - we're talking milliseconds instead of minutes. This extends to test and lint as well. The `nx affected` command is equally important for CI efficiency. Instead of building and testing every project on every PR, `nx affected --target=test` analyzes the git diff against the base branch and only runs tests for projects that could be impacted by the changes. For example, if I change the shared-ui library, Nx knows which apps depend on it and only tests those. In a large workspace at ANZ with 20+ projects, this can reduce CI time from 45 minutes to 5 minutes."*

```bash
# Computation Caching in action
$ nx build customer-portal
# First run: 45s - compiles everything
# > nx run customer-portal:build (45s)

$ nx build customer-portal
# Second run: instant - from cache!
# > nx run customer-portal:build [local cache]  (0.2s)

# Affected Commands - only run what's impacted
$ nx affected --target=build --base=main --head=HEAD
# Only builds projects affected by current changes

$ nx affected --target=test --base=main
# Only tests affected projects

$ nx affected --target=lint --base=main
# Only lints affected projects

# Visualize what's affected
$ nx affected:graph
# Opens browser with dependency graph highlighting affected projects
```

```
Cache Flow:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Input Hash  │────>│  Cache Check │────>│   Hit?       │
│  - source    │     │  (local/     │     │   Yes → ⚡    │
│  - deps      │     │   remote)    │     │   No  → 🔨   │
│  - env       │     └──────────────┘     └──────────────┘
│  - command   │
└──────────────┘

Affected Command Flow:
┌──────────┐    ┌──────────────┐    ┌─────────────────┐
│ Git Diff │───>│ Dep Graph    │───>│ Affected Only   │
│ main..   │    │ Analysis     │    │ ├─ shared-ui    │
│ HEAD     │    │              │    │ ├─ portal (dep)  │
└──────────┘    └──────────────┘    │ └─ admin (dep)  │
                                    └─────────────────┘
                                    Skips: util, data-access (not affected)
```

---

## NX-04: Nx Generators & Plugins

**Question:** *What are Nx generators and how do plugins like @nx/react or @nx/next help?*

:flag_vn: Nx generators la cong cu code scaffolding giup tao projects, components, libraries theo cau truc chuan. Thay vi tao file thu cong va lo bi sai convention, generators dam bao moi project moi deu consistent. Plugins nhu `@nx/next` va `@nx/react` cung cap generators, executors (build/serve commands) va cac cau hinh duoc toi uu rieng cho tung framework. Team cung co the tao custom generators de enforce company-specific patterns.

:flag_gb: *"Nx generators are code scaffolding tools that automate the creation of projects, libraries, and components following consistent patterns. Instead of manually creating files and hoping everyone follows the same conventions, you run a generator and it sets up everything correctly - the project structure, configuration files, test setup, and even barrel exports. Plugins like `@nx/next` provide generators specifically tailored for Next.js - for example, generating a new Next.js app with proper SSR configuration, or creating a new page with the correct file conventions. Similarly, `@nx/react` offers generators for React components, hooks, and libraries. What's really powerful for enterprise teams like ANZ is the ability to create custom workspace generators. We can encode our team's conventions - folder structure, naming patterns, boilerplate code - into a generator so every new feature library is consistent across the entire organization."*

```bash
# Generate a new Next.js application
npx nx g @nx/next:app customer-portal --directory=apps/customer-portal

# Generate a new React library
npx nx g @nx/react:lib shared-ui --directory=libs/shared/ui

# Generate a React component inside a library
npx nx g @nx/react:component Button --project=shared-ui --export

# Generate a new library (framework-agnostic)
npx nx g @nx/js:lib util --directory=libs/shared/util

# List all available generators
npx nx list @nx/next
npx nx list @nx/react
```

```typescript
// Custom generator: tools/generators/feature-lib/index.ts
// Enforces ANZ-specific conventions for new feature libraries
import { Tree, generateFiles, joinPathFragments, names } from '@nx/devkit';

interface FeatureLibSchema {
  name: string;
  domain: string; // e.g., 'customer', 'admin'
}

export default async function featureLibGenerator(
  tree: Tree,
  schema: FeatureLibSchema
) {
  const { fileName, className } = names(schema.name);

  generateFiles(
    tree,
    joinPathFragments(__dirname, './files'),
    `libs/${schema.domain}/feature-${fileName}`,
    {
      fileName,
      className,
      domain: schema.domain,
      tmpl: '', // template marker
    }
  );

  // Auto-update tsconfig paths
  // Auto-add to module boundary rules
  // Auto-generate barrel export (index.ts)
}

// Usage: npx nx g @anz/workspace:feature-lib --name=dashboard --domain=customer
```

---

## NX-05: Library Types in Nx

**Question:** *How do you organize libraries in Nx? What are the different library types?*

:flag_vn: Nx khuyen khich chia code thanh 4 loai thu vien chinh: **feature** libs chua smart components va business logic cua mot tinh nang cu the; **ui** libs chua presentational/dumb components co the tai su dung; **data-access** libs chua state management, API calls va services; **util** libs chua helper functions, constants va pipes. Ngoai ra con co the enforce dependency rules - vi du, ui libs khong duoc import tu feature libs. Cach to chuc nay giup dam bao separation of concerns va kha nang tai su dung trong enterprise.

:flag_gb: *"In Nx, we organize libraries into four main types following a well-established pattern. Feature libraries contain smart components and business logic for a specific feature - like a dashboard or account management page. UI libraries hold presentational, reusable components - buttons, cards, modals - that are stateless and receive everything via props. Data-access libraries encapsulate state management, API clients, and services - this is where our gRPC client wrappers or TanStack Query hooks would live. Utility libraries contain pure helper functions, constants, type definitions, and formatters with zero framework dependencies. What makes this powerful is that Nx lets us enforce module boundary rules using tags. For example, we can ensure that a UI library never imports from a feature library, maintaining clean architecture. At ANZ, this means teams can independently develop features while sharing a consistent UI layer and data-access patterns."*

```
Library Types & Dependency Rules:
┌─────────────────────────────────────────────────────────┐
│                        apps/                             │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  customer-   │    │  admin-      │                   │
│  │  portal      │    │  dashboard   │  Can import ALL   │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                    │                           │
├─────────┼────────────────────┼───────────────────────────┤
│         ▼                    ▼          libs/            │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  feature-    │    │  feature-    │  Can import:      │
│  │  accounts    │    │  users       │  ui, data-access, │
│  │  (type:feat) │    │  (type:feat) │  util             │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                    │                           │
│         ▼                    ▼                           │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  shared-ui   │    │  data-access │  ui: only util    │
│  │  (type:ui)   │    │  (type:data) │  data: only util  │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                    │                           │
│         ▼                    ▼                           │
│  ┌─────────────────────────────────┐                    │
│  │          shared-util            │  No imports from   │
│  │          (type:util)            │  other lib types   │
│  └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

```jsonc
// nx.json or .eslintrc.json - Module Boundary Rules
{
  "@nx/enforce-module-boundaries": [
    "error",
    {
      "depConstraints": [
        {
          "sourceTag": "type:feature",
          "onlyDependOnLibsWithTags": ["type:ui", "type:data-access", "type:util"]
        },
        {
          "sourceTag": "type:ui",
          "onlyDependOnLibsWithTags": ["type:util"]
        },
        {
          "sourceTag": "type:data-access",
          "onlyDependOnLibsWithTags": ["type:util"]
        },
        {
          "sourceTag": "type:util",
          "onlyDependOnLibsWithTags": ["type:util"]
        },
        {
          "sourceTag": "scope:customer",
          "onlyDependOnLibsWithTags": ["scope:customer", "scope:shared"]
        },
        {
          "sourceTag": "scope:admin",
          "onlyDependOnLibsWithTags": ["scope:admin", "scope:shared"]
        }
      ]
    }
  ]
}
```

```jsonc
// libs/shared/ui/project.json
{
  "name": "shared-ui",
  "tags": ["type:ui", "scope:shared"],
  "targets": {
    "build": { "executor": "@nx/vite:build" },
    "test": { "executor": "@nx/jest:jest" },
    "lint": { "executor": "@nx/eslint:lint" },
    "storybook": { "executor": "@nx/storybook:storybook" }
  }
}
```

---

## NX-06: Module Federation with Nx

**Question:** *How would you set up micro frontends using Module Federation with Nx?*

:flag_vn: Module Federation cho phep nhieu ung dung (micro frontends) chay doc lap nhung co the chia se code tai runtime thong qua Webpack 5. Trong Nx, plugin `@nx/react` ho tro tao host app (shell) va remote apps. Host app load cac remote apps dynamically qua URL, cho phep moi team deploy doc lap. Dieu nay dac biet phu hop voi to chuc lon nhu ANZ noi team Customer Portal va team Admin Dashboard co the release doc lap nhung van chia se chung design system.

:flag_gb: *"Module Federation is a Webpack 5 feature that allows multiple independently built applications to share code at runtime, and Nx has first-class support for it. The setup involves a host application - the shell that handles routing and layout - and multiple remote applications that are loaded dynamically. Each remote exposes specific modules, and the host consumes them at runtime rather than build time. In Nx, you generate this with `@nx/react:host` and `@nx/react:remote`, which sets up all the webpack configuration automatically. The real power for ANZ is independent deployability - the customer accounts team can deploy their micro frontend without rebuilding the entire platform. Shared dependencies like React, the design system, and authentication libraries are loaded once by the host, avoiding duplication. We also get type safety across boundaries using Nx's library approach for shared contracts."*

```bash
# Generate Module Federation setup with Nx
npx nx g @nx/react:host shell --directory=apps/shell
npx nx g @nx/react:remote customer-accounts --directory=apps/customer-accounts --host=shell
npx nx g @nx/react:remote admin-settings --directory=apps/admin-settings --host=shell
```

```typescript
// apps/shell/module-federation.config.ts (Host)
import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: ['customer-accounts', 'admin-settings'],
  shared: (libraryName, sharedConfig) => {
    // Share React as singleton to avoid multiple instances
    if (libraryName === 'react' || libraryName === 'react-dom') {
      return { ...sharedConfig, singleton: true, eager: true };
    }
    // Share ANZ design system
    if (libraryName.startsWith('@anz/')) {
      return { ...sharedConfig, singleton: true };
    }
    return sharedConfig;
  },
};
export default config;
```

```typescript
// apps/customer-accounts/module-federation.config.ts (Remote)
import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'customer-accounts',
  exposes: {
    './Module': './src/remote-entry.ts',
  },
};
export default config;
```

```tsx
// apps/shell/src/app/app.tsx (Host routing)
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Dynamically loaded micro frontends
const CustomerAccounts = lazy(() => import('customer-accounts/Module'));
const AdminSettings = lazy(() => import('admin-settings/Module'));

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/accounts/*" element={<CustomerAccounts />} />
        <Route path="/settings/*" element={<AdminSettings />} />
      </Routes>
    </Suspense>
  );
}
```

```
Module Federation Architecture:
┌─────────────────────────────────────────────────────────────┐
│                    Shell (Host App)                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Layout / Navigation / Auth                             ││
│  ├───────────┬──────────────┬──────────────────────────────┤│
│  │ /accounts │ /settings    │ /reports                     ││
│  │           │              │                              ││
│  │ ┌───────┐ │ ┌──────────┐ │ ┌────────────┐              ││
│  │ │Remote │ │ │  Remote  │ │ │  Remote    │              ││
│  │ │App 1  │ │ │  App 2   │ │ │  App 3    │              ││
│  │ └───────┘ │ └──────────┘ │ └────────────┘              ││
│  └───────────┴──────────────┴──────────────────────────────┘│
│                                                             │
│  Shared: React, React-DOM, @anz/shared-ui, @anz/auth       │
│  (loaded once, shared across all remotes)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## NX-07: Nx Cloud & CI Integration

**Question:** *How does Nx Cloud improve CI performance, and how would you set it up for a large team?*

:flag_vn: Nx Cloud cung cap remote caching va distributed task execution (DTE). Remote caching cho phep moi developer va CI runner chia se cache - neu mot nguoi da build thu vien X, nguoi khac se nhan ket qua tu cache thay vi build lai. DTE chia cac tasks ra nhieu CI agents chay song song, giam thoi gian CI tu 45 phut xuong con 10 phut. Voi team lon o ANZ (20+ developers, 30+ projects), Nx Cloud la thiet yeu de giu CI nhanh va developer experience tot.

:flag_gb: *"Nx Cloud provides two game-changing features for enterprise CI: remote caching and distributed task execution. Remote caching means that when one developer or CI agent builds a project, the result is stored in the cloud. When another developer or a different CI run needs the same build with the same inputs, it gets the cached result instantly instead of rebuilding. This alone can save 50-70% of CI time. Distributed task execution takes it further - instead of running all tasks on one machine, Nx Cloud intelligently distributes tasks across multiple CI agents while respecting the dependency graph. So if we have 30 projects to test, it might spread them across 5 agents running in parallel. For ANZ, I would set up Nx Cloud connected to our GitHub Actions pipeline, configure access tokens for the team, and establish cache retention policies that comply with our security requirements. The setup is straightforward - literally one command to connect - and the ROI is immediate."*

```bash
# Connect workspace to Nx Cloud (one-time setup)
npx nx connect-to-nx-cloud

# This adds to nx.json:
# "nxCloudAccessToken": "xxx..."
```

```yaml
# .github/workflows/ci.yml - GitHub Actions with Nx Cloud
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for affected commands

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Set SHAs for affected commands
      - uses: nrwl/nx-set-shas@v4

      # Run only affected tasks - with Nx Cloud remote caching
      - run: npx nx affected --target=lint --parallel=3
      - run: npx nx affected --target=test --parallel=3 --ci
      - run: npx nx affected --target=build --parallel=3
```

```yaml
# Advanced: Distributed Task Execution across agents
# .github/workflows/ci.yml
jobs:
  agents:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        agent: [1, 2, 3, 4, 5]  # 5 parallel agents
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: npx nx-cloud start-agent

  orchestrator:
    runs-on: ubuntu-latest
    needs: [agents]
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - uses: nrwl/nx-set-shas@v4
      # Nx Cloud distributes tasks to agents automatically
      - run: npx nx-cloud start-ci-run --distribute-on="5 linux-medium-js"
      - run: npx nx affected --target=lint,test,build --parallel=5
```

```
CI Performance Comparison:
Without Nx Cloud:          With Nx Cloud:
┌────────────────────┐    ┌────────────────────┐
│ lint   ████████ 8m │    │ lint   ██ 2m (cache)│
│ test   █████████ 15m│   │ test   ███ 4m (DTE) │
│ build  ████████ 12m│    │ build  ██ 3m (cache)│
│ e2e    ██████ 10m  │    │ e2e    ██ 3m (DTE)  │
├────────────────────┤    ├────────────────────┤
│ Total: ~45 min     │    │ Total: ~10 min     │
└────────────────────┘    └────────────────────┘
```

---

## NX-08: Migration Strategy - From Existing Repos to Nx Monorepo

**Question:** *How would you migrate existing polyrepo projects into an Nx monorepo?*

:flag_vn: Viec migration sang Nx monorepo can thuc hien theo tung buoc, khong nen lam mot lan. Buoc 1: tao Nx workspace moi va migrate app chinh truoc, dam bao CI/CD hoat dong. Buoc 2: tach shared code thanh libs (ui, data-access, util). Buoc 3: migrate cac apps con lai va cap nhat imports de dung shared libs. Buoc 4: thiet lap module boundary rules va Nx Cloud. Quan trong nhat la dam bao khong co disruption cho team - co the chay song song ca hai he thong trong giai doan chuyen doi, va su dung `nx import` de giu nguyen git history.

:flag_gb: *"Migration to an Nx monorepo should be incremental, not a big bang approach. I would start by creating a new Nx workspace and migrating the most critical application first - in ANZ's case, probably the customer-facing portal. I would use `nx import` which preserves the full git history of the imported project, so we don't lose any commit history. Once the first app is running with CI/CD verified, I would identify shared code - common UI components, API clients, utility functions - and extract them into dedicated libraries. Then I'd migrate the remaining applications one by one, refactoring them to consume the shared libraries instead of their local copies. Throughout this process, both the old repos and the new monorepo can coexist. The key milestones are: first app migrated and deployed, shared libraries extracted, remaining apps migrated, and finally Nx Cloud configured with module boundary rules. I've found that the entire migration for 3-4 apps typically takes about 4-6 sprints when done properly alongside feature work."*

```bash
# Step 1: Create new Nx workspace
npx create-nx-workspace@latest anz-platform \
  --preset=next \
  --appName=customer-portal \
  --style=css \
  --nxCloud=true

# Step 2: Import existing repo (preserves git history!)
npx nx import ../old-customer-portal \
  --ref=main \
  --sourceRoot=src \
  --destinationRoot=apps/customer-portal

# Step 3: Extract shared code into libraries
npx nx g @nx/react:lib shared-ui --directory=libs/shared/ui
npx nx g @nx/js:lib util --directory=libs/shared/util
npx nx g @nx/js:lib data-access --directory=libs/shared/data-access

# Step 4: Move shared components from app to lib
# (manual refactoring - update imports)

# Step 5: Import second app
npx nx import ../old-admin-dashboard \
  --ref=main \
  --sourceRoot=src \
  --destinationRoot=apps/admin-dashboard

# Step 6: Update second app to use shared libs
# Step 7: Set up module boundaries and Nx Cloud
```

```
Migration Timeline (Recommended):
Sprint 1-2:  ┌────────────────────────────────────────────┐
             │ Create workspace, migrate main app,        │
             │ verify CI/CD works, team onboarding        │
             └────────────────────────────────────────────┘

Sprint 3:    ┌────────────────────────────────────────────┐
             │ Extract shared UI components → libs/       │
             │ Extract shared utils → libs/               │
             │ Update imports in main app                 │
             └────────────────────────────────────────────┘

Sprint 4:    ┌────────────────────────────────────────────┐
             │ Migrate second app, refactor to use        │
             │ shared libs, extract data-access layer     │
             └────────────────────────────────────────────┘

Sprint 5:    ┌────────────────────────────────────────────┐
             │ Migrate remaining apps, set up module      │
             │ boundary rules, configure Nx Cloud         │
             └────────────────────────────────────────────┘

Sprint 6:    ┌────────────────────────────────────────────┐
             │ Decommission old repos, full team          │
             │ training, custom generators, optimize CI   │
             └────────────────────────────────────────────┘
```

```typescript
// Checklist for migration readiness
const migrationChecklist = {
  'Pre-Migration': [
    'Audit all repos - identify shared code',
    'Map dependency graph between projects',
    'Align Node.js & package versions across repos',
    'Document current CI/CD pipelines',
    'Get team buy-in and training plan',
  ],
  'During Migration': [
    'Migrate one app at a time',
    'Use nx import to preserve git history',
    'Run old and new repos in parallel',
    'Verify CI/CD after each migration step',
    'Extract shared code incrementally',
  ],
  'Post-Migration': [
    'Configure module boundary rules (enforce-module-boundaries)',
    'Set up Nx Cloud for remote caching',
    'Create custom generators for team conventions',
    'Decommission old repositories',
    'Monitor CI performance and cache hit rates',
  ],
};
```

---

## Quick Reference: Essential Nx Commands

```bash
# Workspace Management
npx nx graph                          # Visualize dependency graph
npx nx list                           # List installed plugins
npx nx migrate latest                 # Update Nx to latest version

# Running Tasks
npx nx build customer-portal          # Build specific project
npx nx test shared-ui                 # Test specific project
npx nx serve customer-portal          # Dev server
npx nx run-many --target=build --all  # Build all projects
npx nx run-many --target=test -p=shared-ui,util  # Test specific projects

# Affected Commands (CI)
npx nx affected --target=build        # Build only affected
npx nx affected --target=test         # Test only affected
npx nx affected:graph                 # See affected graph
npx nx print-affected                 # Print affected project names

# Generators
npx nx g @nx/next:app my-app          # New Next.js app
npx nx g @nx/react:lib my-lib         # New React library
npx nx g @nx/react:component MyComp --project=my-lib  # New component
npx nx g @nx/js:lib my-util           # New utility library
npx nx g remove my-old-lib            # Remove a project

# Cache Management
npx nx reset                          # Clear local cache
npx nx repair                         # Repair workspace
```
