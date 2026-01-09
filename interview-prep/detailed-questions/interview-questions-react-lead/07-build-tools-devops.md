# 07 - Build Tools & DevOps

> **8 câu hỏi chuyên sâu về Build Tools và DevOps cho React**

---

## Q7.1: Webpack vs Vite - So sánh chi tiết

### Câu hỏi
So sánh Webpack và Vite. Khi nào nên dùng tool nào?

### Trả lời

#### Comparison Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  WEBPACK vs VITE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   WEBPACK                        VITE                        │
│   ────────                       ────                        │
│   Bundle-based                   Native ESM (dev)            │
│   Slower dev startup             Instant dev startup         │
│   Hot reload (seconds)           Hot reload (milliseconds)   │
│   Complex configuration          Simple configuration        │
│   Mature ecosystem               Growing ecosystem           │
│   Production-proven              Production-ready            │
│   Better for legacy              Better for modern browsers  │
│                                                              │
│   DEV SERVER ARCHITECTURE:                                  │
│                                                              │
│   Webpack:                                                   │
│   ┌──────────────────────────────────────────┐              │
│   │  Source Files → Bundle → Dev Server      │              │
│   │     (All files bundled before serving)   │              │
│   └──────────────────────────────────────────┘              │
│                                                              │
│   Vite:                                                      │
│   ┌──────────────────────────────────────────┐              │
│   │  Source Files → Native ESM → Browser     │              │
│   │     (Files served directly, on-demand)   │              │
│   └──────────────────────────────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Webpack Configuration

```javascript
// webpack.config.js - Production config
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/[name].js',
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: true
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    },

    module: {
      rules: [
        // TypeScript/JavaScript
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript'
              ],
              plugins: [
                isProduction && 'transform-remove-console'
              ].filter(Boolean)
            }
          }
        },

        // CSS/SCSS
        {
          test: /\.(css|scss|sass)$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName: isProduction
                    ? '[hash:base64:8]'
                    : '[name]__[local]--[hash:base64:5]'
                }
              }
            },
            'postcss-loader',
            'sass-loader'
          ]
        },

        // Images
        {
          test: /\.(png|jpg|jpeg|gif|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024 // 10kb
            }
          },
          generator: {
            filename: 'static/images/[name].[hash:8][ext]'
          }
        },

        // SVG as React component
        {
          test: /\.svg$/,
          use: ['@svgr/webpack', 'url-loader']
        },

        // Fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[hash:8][ext]'
          }
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        minify: isProduction && {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true
        }
      }),

      isProduction && new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
      }),

      isProduction && new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8
      }),

      env.analyze && new BundleAnalyzerPlugin()
    ].filter(Boolean),

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          }
        }),
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'initial'
          },
          react: {
            name: 'react-vendor',
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: 'single'
    },

    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      compress: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },

    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',

    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};
```

#### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        // Use SWC for faster builds
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin']
        }
      }),

      svgr({
        svgrOptions: {
          icon: true
        }
      }),

      isProduction && viteCompression({
        algorithm: 'gzip',
        ext: '.gz'
      }),

      isProduction && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br'
      }),

      env.ANALYZE && visualizer({
        open: true,
        filename: 'dist/stats.html'
      })
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils')
      }
    },

    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProduction
          ? '[hash:base64:8]'
          : '[name]__[local]--[hash:base64:5]'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            'query-vendor': ['@tanstack/react-query']
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      },
      chunkSizeWarningLimit: 500
    },

    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },

    preview: {
      port: 4173
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['@vite/client', '@vite/env']
    },

    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    }
  };
});
```

#### When to Use Each

```
┌─────────────────────────────────────────────────────────────┐
│              WHEN TO USE WEBPACK vs VITE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   USE WEBPACK when:                                          │
│   ├── Supporting legacy browsers (IE11)                     │
│   ├── Complex build requirements                            │
│   ├── Existing large Webpack codebase                       │
│   ├── Need specific Webpack plugins                         │
│   ├── Server-side rendering with complex setup              │
│   └── Module federation (micro-frontends)                   │
│                                                              │
│   USE VITE when:                                            │
│   ├── New projects                                          │
│   ├── Modern browser targets only                           │
│   ├── Want faster development experience                    │
│   ├── Simple to medium complexity builds                    │
│   ├── TypeScript-first projects                             │
│   └── Team productivity is priority                         │
│                                                              │
│   MIGRATION CONSIDERATION:                                  │
│   Webpack → Vite is usually straightforward                 │
│   Expect 10x faster dev server startup                      │
│   Some plugins may need alternatives                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Q7.2: Babel Configuration và Transpilation

### Câu hỏi
Giải thích Babel configuration cho React project và các optimizations?

### Trả lời

```javascript
// babel.config.js
module.exports = (api) => {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  const presets = [
    [
      '@babel/preset-env',
      {
        // Only include polyfills for features used
        useBuiltIns: 'usage',
        corejs: 3,
        // Don't transform modules in test (Jest handles it)
        modules: isTest ? 'commonjs' : false,
        // Target browsers
        targets: isTest
          ? { node: 'current' }
          : {
              browsers: [
                'last 2 Chrome versions',
                'last 2 Firefox versions',
                'last 2 Safari versions',
                'last 2 Edge versions'
              ]
            },
        // Enable debug info in development
        debug: !isProduction && !isTest
      }
    ],
    [
      '@babel/preset-react',
      {
        // Use new JSX transform (React 17+)
        runtime: 'automatic',
        // Enable development helpers
        development: !isProduction
      }
    ],
    '@babel/preset-typescript'
  ];

  const plugins = [
    // Class properties (stage 3)
    '@babel/plugin-proposal-class-properties',

    // Optional chaining and nullish coalescing are now part of ES2020
    // No need for plugins if targeting modern browsers

    // Runtime helpers
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: true,
        regenerator: true
      }
    ],

    // Optimize React components
    isProduction && [
      'babel-plugin-transform-react-remove-prop-types',
      { removeImport: true }
    ],

    // Remove console in production
    isProduction && 'babel-plugin-transform-remove-console',

    // Lodash optimization
    'babel-plugin-lodash',

    // Styled-components optimization
    [
      'babel-plugin-styled-components',
      {
        displayName: !isProduction,
        ssr: true,
        minify: isProduction,
        pure: true
      }
    ]
  ].filter(Boolean);

  return {
    presets,
    plugins,
    // Source maps
    sourceMaps: true,
    // Ignore node_modules
    ignore: ['node_modules'],
    // Environment-specific overrides
    env: {
      test: {
        plugins: ['@babel/plugin-transform-modules-commonjs']
      }
    }
  };
};
```

#### Browserslist Configuration

```javascript
// .browserslistrc or package.json
// .browserslistrc
[production]
>0.2%
not dead
not op_mini all

[development]
last 1 chrome version
last 1 firefox version
last 1 safari version

[test]
current node

// package.json alternative
{
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

---

## Q7.3: Environment Variables và Configuration Management

### Câu hỏi
Làm thế nào để quản lý environment variables và configuration trong React app?

### Trả lời

```typescript
// Environment files structure
.env                  # Default values (committed)
.env.local            # Local overrides (not committed)
.env.development      # Development-specific
.env.development.local
.env.production       # Production-specific
.env.production.local
.env.test            # Test-specific

// .env.example (committed as template)
# API Configuration
VITE_API_URL=https://api.example.com
VITE_API_VERSION=v1

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false

# Third-party Services
VITE_SENTRY_DSN=
VITE_GA_TRACKING_ID=

// src/config/env.ts
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const getBoolEnvVar = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  return value === 'true';
};

export const config = {
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,

  // API
  api: {
    baseUrl: getEnvVar('VITE_API_URL'),
    version: getEnvVar('VITE_API_VERSION', 'v1'),
    timeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000'), 10)
  },

  // Feature Flags
  features: {
    analytics: getBoolEnvVar('VITE_ENABLE_ANALYTICS', false),
    debug: getBoolEnvVar('VITE_ENABLE_DEBUG', false),
    newFeature: getBoolEnvVar('VITE_ENABLE_NEW_FEATURE', false)
  },

  // Third-party
  sentry: {
    dsn: getEnvVar('VITE_SENTRY_DSN', ''),
    enabled: import.meta.env.PROD
  },

  analytics: {
    gaTrackingId: getEnvVar('VITE_GA_TRACKING_ID', '')
  }
} as const;

// Type-safe config
export type Config = typeof config;

// Validate config at startup
export function validateConfig(): void {
  const requiredInProduction = [
    'VITE_API_URL',
    'VITE_SENTRY_DSN'
  ];

  if (import.meta.env.PROD) {
    requiredInProduction.forEach(key => {
      if (!import.meta.env[key]) {
        console.error(`Missing required env var in production: ${key}`);
      }
    });
  }
}

// Usage
import { config } from '@/config/env';

const apiClient = axios.create({
  baseURL: `${config.api.baseUrl}/${config.api.version}`,
  timeout: config.api.timeout
});

if (config.features.analytics) {
  initAnalytics(config.analytics.gaTrackingId);
}
```

#### Runtime Configuration

```typescript
// For configuration that can change without rebuild
// public/config.js (served statically)
window.__RUNTIME_CONFIG__ = {
  API_URL: "https://api.example.com",
  FEATURE_FLAGS: {
    newDashboard: true,
    darkMode: true
  }
};

// src/config/runtime.ts
interface RuntimeConfig {
  API_URL: string;
  FEATURE_FLAGS: Record<string, boolean>;
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__: RuntimeConfig;
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === 'undefined') {
    throw new Error('Runtime config only available in browser');
  }

  if (!window.__RUNTIME_CONFIG__) {
    throw new Error('Runtime config not loaded');
  }

  return window.__RUNTIME_CONFIG__;
}

// Fetch runtime config from server
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const response = await fetch('/api/config');
  const config = await response.json();

  window.__RUNTIME_CONFIG__ = config;

  return config;
}
```

---

## Q7.4: CI/CD Pipeline cho React

### Câu hỏi
Thiết kế CI/CD pipeline hoàn chỉnh cho React application?

### Trả lời

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ==================== QUALITY CHECKS ====================
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

  # ==================== UNIT TESTS ====================
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  # ==================== BUILD ====================
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [quality, test]
    outputs:
      build-artifact: ${{ steps.upload.outputs.artifact-id }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}

      - name: Upload build artifact
        id: upload
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/
          retention-days: 7

  # ==================== E2E TESTS ====================
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/

      - name: Run E2E tests
        run: npx playwright test --project=${{ matrix.browser }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/

  # ==================== SECURITY SCAN ====================
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run npm audit
        run: npm audit --audit-level=high

  # ==================== DEPLOY STAGING ====================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, e2e]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/checkout@v4

      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/

      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./dist

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deployed to staging: ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  # ==================== DEPLOY PRODUCTION ====================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, e2e, security]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    steps:
      - uses: actions/checkout@v4

      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./dist

      - name: Create Sentry Release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        with:
          environment: production
          sourcemaps: './dist'

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": ":rocket: Deployed to production: ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  # ==================== LIGHTHOUSE ====================
  lighthouse:
    name: Lighthouse Audit
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://staging.example.com
            https://staging.example.com/products
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true

      - name: Check Performance Budget
        run: |
          if [ $(cat .lighthouseci/assertion-results.json | jq '.[] | select(.level == "error")' | wc -l) -gt 0 ]; then
            echo "Lighthouse budget exceeded!"
            exit 1
          fi
```

#### Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   PR / Push                                                  │
│       │                                                      │
│       ▼                                                      │
│   ┌───────────┐                                             │
│   │  Quality  │  Type check, Lint, Format                   │
│   └─────┬─────┘                                             │
│         │                                                    │
│    ┌────┴────┐                                              │
│    │         │                                              │
│    ▼         ▼                                              │
│ ┌──────┐  ┌──────────┐                                      │
│ │ Test │  │ Security │  Unit tests + Security scan          │
│ └──┬───┘  └────┬─────┘                                      │
│    │           │                                            │
│    └─────┬─────┘                                            │
│          │                                                   │
│          ▼                                                   │
│      ┌───────┐                                              │
│      │ Build │  Production build                            │
│      └───┬───┘                                              │
│          │                                                   │
│          ▼                                                   │
│      ┌───────┐                                              │
│      │  E2E  │  Playwright (3 browsers)                     │
│      └───┬───┘                                              │
│          │                                                   │
│     ┌────┴────┐                                             │
│     │         │                                             │
│     ▼         ▼                                             │
│ ┌─────────┐ ┌────────────┐                                  │
│ │ Staging │ │ Production │  (main branch only)              │
│ └────┬────┘ └──────┬─────┘                                  │
│      │             │                                         │
│      ▼             ▼                                         │
│ ┌───────────┐  ┌──────────┐                                 │
│ │Lighthouse │  │  Sentry  │                                 │
│ └───────────┘  └──────────┘                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Q7.5: Docker và Containerization

### Câu hỏi
Làm thế nào để containerize React application hiệu quả?

### Trả lời

```dockerfile
# Dockerfile - Multi-stage build
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_SENTRY_DSN
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/dist .

# Add runtime config script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Don't cache HTML
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-store, no-cache, must-revalidate";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (optional)
        location /api/ {
            proxy_pass http://backend:8080/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "OK";
            add_header Content-Type text/plain;
        }
    }
}
```

```bash
# docker-entrypoint.sh
#!/bin/sh
set -e

# Generate runtime config from environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.__RUNTIME_CONFIG__ = {
  API_URL: "${API_URL:-https://api.example.com}",
  SENTRY_DSN: "${SENTRY_DSN:-}",
  FEATURE_FLAGS: {
    newDashboard: ${FEATURE_NEW_DASHBOARD:-false},
    darkMode: ${FEATURE_DARK_MODE:-true}
  }
};
EOF

exec "$@"
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${VITE_API_URL}
    ports:
      - "80:80"
    environment:
      - API_URL=${API_URL}
      - SENTRY_DSN=${SENTRY_DSN}
      - FEATURE_NEW_DASHBOARD=${FEATURE_NEW_DASHBOARD}
    depends_on:
      - backend
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    image: backend:latest
    ports:
      - "8080:8080"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

---

## Q7.6: Code Splitting và Lazy Loading Strategies

### Câu hỏi
Giải thích các strategies cho Code Splitting và Lazy Loading?

### Trả lời

```typescript
// 1. Route-based Code Splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Settings = lazy(() => import('./pages/Settings'));

// With preload capability
const ProductDetails = lazy(() =>
  import('./pages/ProductDetails')
    .then(module => {
      // Preload related modules
      import('./components/ProductReviews');
      import('./components/RelatedProducts');
      return module;
    })
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// 2. Component-based Code Splitting
// Heavy components loaded on demand
const HeavyChart = lazy(() => import('./components/HeavyChart'));
const RichTextEditor = lazy(() => import('./components/RichTextEditor'));
const PDFViewer = lazy(() => import('./components/PDFViewer'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>

      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart data={chartData} />
        </Suspense>
      )}
    </div>
  );
}

// 3. Library-based Code Splitting
// Split heavy libraries into separate chunks
async function generatePDF(data: ReportData) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  // Generate PDF...
  return doc;
}

async function parseMarkdown(content: string) {
  const { marked } = await import('marked');
  return marked(content);
}

// 4. Feature-based Code Splitting
interface FeatureLoaderProps {
  feature: string;
  fallback?: ReactNode;
}

const featureModules: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  analytics: () => import('./features/analytics/AnalyticsDashboard'),
  reports: () => import('./features/reports/ReportsPanel'),
  admin: () => import('./features/admin/AdminPanel')
};

function FeatureLoader({ feature, fallback }: FeatureLoaderProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loader = featureModules[feature];

    if (!loader) {
      setError(new Error(`Unknown feature: ${feature}`));
      return;
    }

    loader()
      .then(module => setComponent(() => module.default))
      .catch(setError);
  }, [feature]);

  if (error) return <ErrorBoundary error={error} />;
  if (!Component) return <>{fallback || <Loading />}</>;

  return <Component />;
}

// 5. Preloading Strategies
// Preload on hover
function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const preloadRoute = () => {
    const route = routeConfig[to];
    if (route?.preload) {
      route.preload();
    }
  };

  return (
    <Link
      to={to}
      onMouseEnter={preloadRoute}
      onFocus={preloadRoute}
    >
      {children}
    </Link>
  );
}

// Route config with preload
const routeConfig: Record<string, { component: LazyExoticComponent<any>; preload: () => void }> = {
  '/dashboard': {
    component: lazy(() => import('./pages/Dashboard')),
    preload: () => import('./pages/Dashboard')
  },
  '/products': {
    component: lazy(() => import('./pages/Products')),
    preload: () => import('./pages/Products')
  }
};

// Preload during idle time
function useIdlePreload(preloadFn: () => void) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(preloadFn);
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(preloadFn, 200);
      return () => clearTimeout(id);
    }
  }, [preloadFn]);
}

// Usage
function App() {
  useIdlePreload(() => {
    // Preload likely next pages
    import('./pages/Dashboard');
    import('./pages/Products');
  });

  return <Routes />;
}
```

#### Webpack Magic Comments

```typescript
// Named chunks
const Dashboard = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ './pages/Dashboard')
);

// Prefetch (low priority, load during idle)
const Settings = lazy(() =>
  import(/* webpackPrefetch: true */ './pages/Settings')
);

// Preload (high priority, load immediately)
const CriticalFeature = lazy(() =>
  import(/* webpackPreload: true */ './features/Critical')
);

// Multiple magic comments
const AdminPanel = lazy(() =>
  import(
    /* webpackChunkName: "admin" */
    /* webpackPrefetch: true */
    './pages/AdminPanel'
  )
);
```

---

## Q7.7: Monitoring và Error Tracking

### Câu hỏi
Setup monitoring và error tracking cho React application production?

### Trả lời

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry
export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,

      integrations: [
        new BrowserTracing({
          tracingOrigins: ['localhost', 'api.example.com'],
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          )
        }),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false
        })
      ],

      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions

      // Session replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Filter errors
      beforeSend(event, hint) {
        // Don't send errors from development
        if (import.meta.env.DEV) {
          return null;
        }

        // Filter out known non-issues
        const error = hint.originalException;
        if (error instanceof Error) {
          if (error.message.includes('ResizeObserver')) {
            return null;
          }
          if (error.message.includes('Network request failed')) {
            event.level = 'warning';
          }
        }

        return event;
      },

      // Add user context
      beforeSendTransaction(event) {
        // Add custom tags
        event.tags = {
          ...event.tags,
          page: window.location.pathname
        };
        return event;
      }
    });
  }
}

// Set user context
export function setUserContext(user: User | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name
    });
  } else {
    Sentry.setUser(null);
  }
}

// Custom error boundary with Sentry
export function SentryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
      onError={(error, componentStack) => {
        console.error('Error caught by boundary:', error);
        // Additional logging if needed
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

// Performance monitoring utilities
export function measurePerformance(name: string, fn: () => void) {
  const transaction = Sentry.startTransaction({ name });

  try {
    fn();
  } finally {
    transaction.finish();
  }
}

export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startTransaction({ name });

  try {
    return await fn();
  } finally {
    transaction.finish();
  }
}

// Custom metrics
export function trackMetric(name: string, value: number, tags?: Record<string, string>) {
  Sentry.metrics.distribution(name, value, {
    tags,
    unit: 'millisecond'
  });
}
```

#### Web Vitals Monitoring

```typescript
// src/lib/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function sendToAnalytics(metric: VitalMetric) {
  // Send to your analytics service
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    page: window.location.pathname,
    timestamp: Date.now()
  });

  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true
    });
  }

  // Also send to Sentry
  Sentry.metrics.distribution(`web_vital.${metric.name}`, metric.value, {
    tags: { rating: metric.rating },
    unit: metric.name === 'CLS' ? 'none' : 'millisecond'
  });
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}

// Custom performance observer
export function observeLongTasks() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry);
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `Long task: ${entry.duration}ms`,
            level: 'warning'
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  }
}
```

---

## Q7.8: Build Optimization Strategies

### Câu hỏi
Những strategies nào để optimize build cho production?

### Trả lời

```typescript
// vite.config.ts - Optimized production build
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),

    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024
    }),

    // Brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024
    }),

    // PWA support
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    }),

    // Bundle analyzer
    mode === 'analyze' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],

  build: {
    // Target modern browsers
    target: 'es2020',

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },

    // CSS optimization
    cssMinify: true,
    cssCodeSplit: true,

    // Chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react')) {
            return 'react-vendor';
          }

          // UI libraries
          if (id.includes('@radix-ui') || id.includes('@headlessui')) {
            return 'ui-vendor';
          }

          // Data fetching
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }

          // Charts
          if (id.includes('chart') || id.includes('d3')) {
            return 'charts-vendor';
          }

          // Date libraries
          if (id.includes('date-fns') || id.includes('dayjs')) {
            return 'date-vendor';
          }

          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // Asset naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },

    // Source maps for error tracking
    sourcemap: true,

    // Report compressed sizes
    reportCompressedSize: true,

    // Chunk size warning
    chunkSizeWarningLimit: 500
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ]
  }
}));
```

#### Build Analysis Script

```javascript
// scripts/analyze-bundle.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run build with analyzer
execSync('ANALYZE=true npm run build', { stdio: 'inherit' });

// Read build stats
const distPath = path.join(__dirname, '../dist');
const files = fs.readdirSync(distPath, { recursive: true });

const stats = {
  totalSize: 0,
  gzipSize: 0,
  brotliSize: 0,
  chunks: []
};

files.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.statSync(filePath).isFile()) {
    const size = fs.statSync(filePath).size;

    if (file.endsWith('.js') || file.endsWith('.css')) {
      stats.totalSize += size;

      const gzipPath = filePath + '.gz';
      const brotliPath = filePath + '.br';

      if (fs.existsSync(gzipPath)) {
        stats.gzipSize += fs.statSync(gzipPath).size;
      }

      if (fs.existsSync(brotliPath)) {
        stats.brotliSize += fs.statSync(brotliPath).size;
      }

      stats.chunks.push({
        name: file,
        size,
        gzipSize: fs.existsSync(gzipPath) ? fs.statSync(gzipPath).size : null,
        brotliSize: fs.existsSync(brotliPath) ? fs.statSync(brotliPath).size : null
      });
    }
  }
});

console.log('\n📦 Bundle Analysis\n');
console.log(`Total Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
console.log(`Gzip Size: ${(stats.gzipSize / 1024).toFixed(2)} KB`);
console.log(`Brotli Size: ${(stats.brotliSize / 1024).toFixed(2)} KB`);

console.log('\n📊 Chunks:\n');
stats.chunks
  .sort((a, b) => b.size - a.size)
  .slice(0, 10)
  .forEach(chunk => {
    console.log(`  ${chunk.name}`);
    console.log(`    Raw: ${(chunk.size / 1024).toFixed(2)} KB`);
    if (chunk.gzipSize) {
      console.log(`    Gzip: ${(chunk.gzipSize / 1024).toFixed(2)} KB`);
    }
  });
```

---

## Tổng kết

| Tool | Use Case | Key Feature |
|------|----------|-------------|
| Vite | Modern dev experience | ESM-based, instant HMR |
| Webpack | Complex builds | Mature ecosystem |
| Babel | Transpilation | Plugin system |
| Terser | JS minification | Dead code elimination |
| PostCSS | CSS processing | Autoprefixer |
| Docker | Containerization | Consistent environments |
| GitHub Actions | CI/CD | Native integration |
| Sentry | Error tracking | Session replay |

**Key Takeaways:**
1. Choose Vite for new projects, Webpack for complex requirements
2. Implement code splitting at route and feature level
3. Use multi-stage Docker builds
4. Automate everything in CI/CD
5. Monitor performance with Web Vitals
6. Set up proper error tracking before production
