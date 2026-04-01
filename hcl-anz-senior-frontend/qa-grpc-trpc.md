# 🔌 gRPC-Web & tRPC — Bilingual Interview Q&A

> **Dành cho:** Senior Frontend Engineer Interview (ANZ Bank)
> **Format:** Bilingual Vietnamese 🇻🇳 + English 🇬🇧
> **Số câu hỏi:** 10 câu

---

## RPC-01: gRPC vs REST vs GraphQL

**Q:** *"Can you compare gRPC, REST, and GraphQL? When would you choose each approach and what are the trade-offs?"*

🇻🇳 **Giải thích chi tiết:**
REST là architectural style phổ biến nhất, sử dụng HTTP methods (GET, POST, PUT, DELETE) với JSON payload, dễ hiểu và có tooling ecosystem rất mature. GraphQL được Facebook phát triển, cho phép client query chính xác data cần thiết, giải quyết vấn đề over-fetching và under-fetching của REST, rất phù hợp cho mobile apps hoặc khi bandwidth là concern. gRPC là framework RPC của Google sử dụng Protocol Buffers (binary format), cho performance cao nhất trong 3 options vì binary serialization nhỏ gọn và HTTP/2 multiplexing. REST phù hợp cho public APIs cần simplicity, GraphQL tốt cho complex data requirements với nhiều relationships, còn gRPC ideal cho microservices internal communication cần low latency. Trade-offs chính: REST dễ cache nhưng có thể over-fetch, GraphQL flexible nhưng cần learning curve và complexity ở server, gRPC nhanh nhất nhưng khó debug vì binary format. Trong banking context như ANZ, có thể dùng REST cho public-facing APIs, gRPC cho internal microservices communication, và GraphQL cho mobile banking apps.

🇬🇧 **Sample Answer:**
> *"REST is the most widely adopted approach using standard HTTP methods with JSON payloads. It's simple, well-understood, and has excellent tooling support including caching at the HTTP level. However, REST can suffer from over-fetching where clients receive more data than needed, or under-fetching requiring multiple round trips. GraphQL solves these problems by allowing clients to specify exactly what data they need in a single request, making it excellent for mobile applications where bandwidth matters. The trade-off is increased server complexity and the need for careful query optimization to prevent performance issues. gRPC uses Protocol Buffers for binary serialization which is significantly more compact than JSON, and leverages HTTP/2 for multiplexing and streaming capabilities. It provides the best performance characteristics but is harder to debug and requires additional tooling for browser support. In a banking environment, I would use REST for public customer-facing APIs due to its simplicity, gRPC for internal microservices communication where performance is critical, and consider GraphQL for complex mobile banking features that require flexible data fetching."*

```typescript
// REST Example
const fetchAccount = async (accountId: string) => {
  const response = await fetch(`/api/accounts/${accountId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};

// GraphQL Example
const ACCOUNT_QUERY = gql`
  query GetAccount($id: ID!) {
    account(id: $id) {
      id
      balance
      transactions(limit: 10) {
        id
        amount
        date
      }
    }
  }
`;
const { data } = await apolloClient.query({
  query: ACCOUNT_QUERY,
  variables: { id: accountId }
});

// gRPC Example (using generated client)
import { AccountServiceClient } from './generated/account_grpc_web_pb';
import { GetAccountRequest } from './generated/account_pb';

const client = new AccountServiceClient('https://api.example.com');
const request = new GetAccountRequest();
request.setAccountId(accountId);

client.getAccount(request, {}, (err, response) => {
  console.log(response.toObject());
});
```

---

## RPC-02: Protocol Buffers (Protobuf)

**Q:** *"What are Protocol Buffers and how do they provide type safety across services? Explain the schema definition and code generation process."*

🇻🇳 **Giải thích chi tiết:**
Protocol Buffers (Protobuf) là language-neutral, platform-neutral mechanism của Google để serialize structured data, hoạt động như một "contract" giữa client và server. Schema được định nghĩa trong file `.proto` với syntax riêng, specify tên fields, types (int32, string, bool, nested messages), và field numbers dùng cho binary encoding. Từ file `.proto`, protoc compiler generate code cho nhiều languages (TypeScript, Go, Java, Python), tạo ra strongly-typed classes với getters/setters và serialization methods. Binary format của Protobuf compact hơn JSON nhiều lần vì không cần field names trong payload, chỉ dùng field numbers, giúp giảm bandwidth và tăng parsing speed. Type safety được enforce ở compile time - nếu client và server dùng cùng `.proto` file, compiler sẽ catch mismatches trước khi code chạy. Điều này đặc biệt quan trọng trong banking systems như ANZ nơi data integrity là critical, một field type mismatch có thể gây sai lệch transaction amounts.

🇬🇧 **Sample Answer:**
> *"Protocol Buffers, commonly called Protobuf, is Google's language-agnostic binary serialization format that serves as a contract between services. You define your data structures in `.proto` files using a specific schema language that specifies field names, types, and unique field numbers used for binary encoding. The protoc compiler then generates strongly-typed code for your target language, creating classes with proper getters, setters, and serialization methods. Unlike JSON where field names are included in every message, Protobuf uses field numbers for encoding, resulting in significantly smaller payloads - often 3-10 times smaller than equivalent JSON. This binary format also parses much faster than text-based formats. The major advantage is compile-time type safety: if a field type changes in the schema, the generated code changes accordingly, and any mismatches are caught during compilation rather than at runtime. For banking applications, this is crucial because it prevents subtle bugs where, for example, an amount field might be interpreted as a different type, potentially causing financial discrepancies. The schema also serves as living documentation, making it clear what data each service expects and produces."*

```protobuf
// account.proto - Schema Definition
syntax = "proto3";

package banking.v1;

// Message definitions with field numbers
message Account {
  string account_id = 1;
  string account_holder = 2;
  AccountType type = 3;
  int64 balance_cents = 4;  // Store as cents to avoid float issues
  repeated Transaction recent_transactions = 5;
  google.protobuf.Timestamp created_at = 6;
}

enum AccountType {
  ACCOUNT_TYPE_UNSPECIFIED = 0;
  ACCOUNT_TYPE_SAVINGS = 1;
  ACCOUNT_TYPE_CHECKING = 2;
  ACCOUNT_TYPE_INVESTMENT = 3;
}

message Transaction {
  string transaction_id = 1;
  int64 amount_cents = 2;
  string description = 3;
  TransactionType type = 4;
}

enum TransactionType {
  TRANSACTION_TYPE_UNSPECIFIED = 0;
  TRANSACTION_TYPE_CREDIT = 1;
  TRANSACTION_TYPE_DEBIT = 2;
}

// Service definition
service AccountService {
  rpc GetAccount(GetAccountRequest) returns (GetAccountResponse);
  rpc ListTransactions(ListTransactionsRequest) returns (stream Transaction);
}

message GetAccountRequest {
  string account_id = 1;
}

message GetAccountResponse {
  Account account = 1;
}
```

```typescript
// Generated TypeScript usage (after running protoc)
import { Account, AccountType, GetAccountRequest } from './generated/account_pb';

// Creating a message with type safety
const request = new GetAccountRequest();
request.setAccountId('ACC-12345');

// Type-safe access to response
const account: Account = response.getAccount()!;
console.log('Balance:', account.getBalanceCents() / 100);
console.log('Type:', AccountType[account.getType()]);

// Serialization
const binaryData: Uint8Array = account.serializeBinary();
const restored = Account.deserializeBinary(binaryData);
```

---

## RPC-03: gRPC-Web for Browser

**Q:** *"Why doesn't gRPC work natively in browsers and how does gRPC-Web solve this? What are the limitations?"*

🇻🇳 **Giải thích chi tiết:**
Browser không hỗ trợ native gRPC vì không expose HTTP/2 trailers và low-level framing mà gRPC cần. gRPC-Web là solution: nó wrap gRPC calls thành HTTP/1.1 requests mà browser hiểu được. Giữa browser và gRPC backend cần một proxy - thường là Envoy - để convert gRPC-Web protocol thành native gRPC. Frontend install package `grpc-web`, generate client code từ .proto files, rồi gọi như function calls bình thường. Hạn chế lớn nhất: gRPC-Web chỉ hỗ trợ Unary (1 request, 1 response) và Server Streaming (1 request, nhiều responses). Client Streaming và Bidirectional Streaming KHÔNG khả dụng trong browser vì browser không thể send streaming requests. Cần một proxy layer (thường là Envoy) để translate giữa gRPC-Web format và native gRPC khi communicate với backend services. Trong ANZ context, điều này có nghĩa là real-time features như live transaction feeds có thể dùng server streaming, nhưng features cần client streaming phải implement differently (như WebSockets).

🇬🇧 **Sample Answer:**
> *"Native gRPC relies on HTTP/2 features that browsers don't fully expose to JavaScript code. Specifically, gRPC requires control over HTTP/2 framing, the ability to send HTTP trailers which carry gRPC status codes and metadata after the response body, and support for full-duplex streaming. Browser APIs like Fetch and XMLHttpRequest abstract away these low-level HTTP/2 details for security and simplicity reasons. gRPC-Web solves this by creating a browser-compatible wire format that encodes gRPC messages in a way that works over standard HTTP/1.1 or the limited HTTP/2 support browsers provide. The trade-off is that gRPC-Web only supports Unary calls (single request, single response) and Server Streaming (single request, stream of responses). Client Streaming and Bidirectional Streaming are not supported because browsers cannot send streaming request bodies. To connect gRPC-Web clients to native gRPC services, you need a proxy layer - typically Envoy - that translates between the two protocols. This proxy handles the protocol conversion, manages connection pooling, and can also handle cross-origin requests. For banking applications, this means features like fetching account details work great with unary calls, receiving real-time transaction notifications can use server streaming, but interactive features requiring client streaming need alternative implementations like WebSockets."*

```typescript
// gRPC-Web Client Setup
import { grpc } from '@improbable-eng/grpc-web';
import { AccountServiceClient } from './generated/AccountServiceClientPb';
import { GetAccountRequest, Account } from './generated/account_pb';

// Create client pointing to Envoy proxy (not backend directly)
const client = new AccountServiceClient(
  'https://grpc.api.anz.com',  // Envoy proxy URL
  null,  // credentials
  null   // options
);

// Unary call example
async function getAccount(accountId: string): Promise<Account> {
  const request = new GetAccountRequest();
  request.setAccountId(accountId);

  return new Promise((resolve, reject) => {
    client.getAccount(request, {
      'Authorization': `Bearer ${getAuthToken()}`
    }, (err, response) => {
      if (err) {
        reject(new Error(`gRPC Error: ${err.message}`));
        return;
      }
      resolve(response!);
    });
  });
}

// Server streaming example (supported in gRPC-Web)
function subscribeToTransactions(accountId: string) {
  const request = new SubscribeTransactionsRequest();
  request.setAccountId(accountId);

  const stream = client.subscribeTransactions(request, {
    'Authorization': `Bearer ${getAuthToken()}`
  });

  stream.on('data', (transaction: Transaction) => {
    console.log('New transaction:', transaction.toObject());
    updateTransactionList(transaction);
  });

  stream.on('error', (err: grpc.RpcError) => {
    console.error('Stream error:', err.code, err.message);
    // Implement reconnection logic
  });

  stream.on('end', () => {
    console.log('Stream ended');
  });

  return stream;
}

// React hook for gRPC-Web
function useGrpcAccount(accountId: string) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getAccount(accountId)
      .then(setAccount)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [accountId]);

  return { account, loading, error };
}
```

---

## RPC-04: Envoy Proxy Configuration

**Q:** *"What role does Envoy proxy play in gRPC-Web architecture? How would you configure it for a banking application?"*

🇻🇳 **Giải thích chi tiết:**
Envoy Proxy đóng vai trò critical trong gRPC-Web architecture như một translation layer giữa browser clients và backend gRPC services. Khi browser gửi gRPC-Web request, Envoy nhận request đó, decode gRPC-Web format, và forward như native gRPC call đến backend service, rồi làm ngược lại cho response. Envoy cũng handle CORS (Cross-Origin Resource Sharing) rất quan trọng vì frontend thường hosted ở domain khác với API. Configuration bao gồm định nghĩa listeners (ports Envoy listen), clusters (backend services), và filters (xử lý logic như gRPC-Web transcoding). Trong banking context, Envoy còn có thể implement rate limiting, circuit breaking để protect services, và integrate với service mesh như Istio. Security configurations như TLS termination, mTLS cho service-to-service communication cũng được handle ở Envoy layer. Ngoài ra, Envoy có thể thực hiện HTTP/JSON to gRPC transcoding, cho phép expose cả REST và gRPC interfaces từ cùng một backend service.

🇬🇧 **Sample Answer:**
> *"Envoy Proxy serves as the critical bridge between gRPC-Web clients in the browser and native gRPC backend services. When a browser sends a gRPC-Web request, Envoy receives it, translates the gRPC-Web wire format to native gRPC protocol, forwards it to the appropriate backend service, and then converts the response back to gRPC-Web format for the browser. Beyond protocol translation, Envoy handles CORS which is essential since frontend applications typically run on different domains than the API. The configuration consists of three main parts: listeners that define which ports and protocols Envoy accepts, clusters that define the backend services and their health checking, and filters that implement the actual processing logic including gRPC-Web transcoding. For banking applications, Envoy provides additional critical features like rate limiting to prevent abuse, circuit breaking to handle backend failures gracefully, and comprehensive observability with access logging and metrics. Security is paramount in banking, so Envoy handles TLS termination, can enforce mTLS for service-to-service communication, and integrates with authentication providers. Envoy can also perform HTTP/JSON to gRPC transcoding, allowing you to expose both REST and gRPC interfaces from the same backend, which is useful during migration periods or for different client needs."*

```yaml
# envoy.yaml - gRPC-Web Proxy Configuration for Banking App
admin:
  address:
    socket_address: { address: 0.0.0.0, port_value: 9901 }

static_resources:
  listeners:
    - name: grpc_web_listener
      address:
        socket_address: { address: 0.0.0.0, port_value: 8080 }
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                codec_type: AUTO
                stat_prefix: ingress_http

                # Access logging for audit trail
                access_log:
                  - name: envoy.access_loggers.file
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
                      path: /var/log/envoy/access.log

                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: grpc_services
                      domains: ["*"]
                      routes:
                        - match: { prefix: "/banking.v1.AccountService" }
                          route:
                            cluster: account_service
                            timeout: 30s
                        - match: { prefix: "/banking.v1.TransactionService" }
                          route:
                            cluster: transaction_service
                            timeout: 60s

                      # CORS Configuration for browser access
                      cors:
                        allow_origin_string_match:
                          - exact: "https://banking.anz.com"
                          - exact: "https://app.anz.com"
                        allow_methods: "GET, POST, OPTIONS"
                        allow_headers: "authorization,content-type,x-grpc-web,grpc-timeout"
                        expose_headers: "grpc-status,grpc-message"
                        max_age: "86400"

                http_filters:
                  # CORS filter
                  - name: envoy.filters.http.cors
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.cors.v3.Cors

                  # gRPC-Web filter for protocol translation
                  - name: envoy.filters.http.grpc_web
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.grpc_web.v3.GrpcWeb

                  # Rate limiting
                  - name: envoy.filters.http.local_ratelimit
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit
                      stat_prefix: http_local_rate_limiter
                      token_bucket:
                        max_tokens: 1000
                        tokens_per_fill: 100
                        fill_interval: 1s

                  # Router must be last
                  - name: envoy.filters.http.router
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router

  clusters:
    - name: account_service
      connect_timeout: 5s
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      http2_protocol_options: {}  # Enable HTTP/2 for gRPC
      load_assignment:
        cluster_name: account_service
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: account-service.internal
                      port_value: 50051
      # Health checking
      health_checks:
        - timeout: 5s
          interval: 10s
          grpc_health_check: {}
      # Circuit breaker
      circuit_breakers:
        thresholds:
          - max_connections: 1000
            max_pending_requests: 1000

    - name: transaction_service
      connect_timeout: 5s
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      http2_protocol_options: {}
      load_assignment:
        cluster_name: transaction_service
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: transaction-service.internal
                      port_value: 50052
```

---

## RPC-05: tRPC Overview

**Q:** *"What is tRPC and how does it achieve end-to-end type safety without code generation? When is it the right choice?"*

🇻🇳 **Giải thích chi tiết:**
tRPC (TypeScript RPC) là một framework cho phép build type-safe APIs trong TypeScript applications mà không cần schema files hay code generation steps. Thay vì define schema riêng như Protobuf hay GraphQL, tRPC leverage TypeScript's type inference - bạn define procedures trên server với input/output types, và những types đó automatically available ở client thông qua TypeScript compiler. Điều này possible vì tRPC designed cho TypeScript monorepo setup nơi client và server share cùng codebase hoặc có direct dependency. Magic nằm ở việc tRPC export router type từ server, client import type đó (chỉ type, không phải runtime code), và TypeScript inference làm phần còn lại. So với gRPC cần protoc compiler và GraphQL cần codegen, tRPC workflow đơn giản hơn nhiều - change server code, types automatically update ở client, compiler báo lỗi nếu có breaking changes. tRPC ideal cho full-stack TypeScript applications, startups cần iterate nhanh, hoặc teams muốn simplicity. Tuy nhiên, nếu có non-TypeScript clients hoặc cần formal API contract với external teams, gRPC hoặc OpenAPI vẫn better choices.

🇬🇧 **Sample Answer:**
> *"tRPC is a framework for building end-to-end typesafe APIs in TypeScript applications without requiring schema files or code generation. Unlike gRPC which uses Protobuf schemas and GraphQL which uses SDL, tRPC leverages TypeScript's powerful type inference system. You define procedures on the server with their input validation and return types, and those types automatically become available on the client through TypeScript's compiler - no build step required. This works because tRPC is designed for TypeScript monorepo architectures where the client and server share the same codebase or have a direct package dependency. The magic happens through TypeScript's ability to infer types across module boundaries: the server exports its router type, the client imports only that type (not runtime code), and TypeScript inference does the rest. When you change a server procedure's signature, the client immediately sees the updated types, and the compiler catches any mismatches. This dramatically speeds up development compared to traditional API development where you might need to regenerate clients after schema changes. tRPC is ideal for full-stack TypeScript applications, startups that need to iterate quickly, internal tools, and teams that want maximum type safety with minimal ceremony. However, if you have non-TypeScript clients, need a formal API contract for external consumers, or require language-agnostic service communication, gRPC or OpenAPI would be more appropriate choices."*

```typescript
// server/trpc.ts - tRPC Router Definition
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

// Context type for all procedures
interface Context {
  user: { id: string; role: string } | null;
  db: DatabaseClient;
}

const t = initTRPC.context<Context>().create();

// Input validation schemas using Zod
const AccountIdSchema = z.object({
  accountId: z.string().regex(/^ACC-\d+$/, 'Invalid account ID format'),
});

const TransferSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amountCents: z.number().positive().int(),
  description: z.string().max(200).optional(),
});

// Router definition with full type inference
export const appRouter = t.router({
  account: t.router({
    // Query - for fetching data
    getById: t.procedure
      .input(AccountIdSchema)
      .query(async ({ ctx, input }) => {
        const account = await ctx.db.account.findUnique({
          where: { id: input.accountId },
        });
        if (!account) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        // Return type is inferred automatically!
        return {
          id: account.id,
          balance: account.balanceCents,
          type: account.type,
        };
      }),

    listAll: t.procedure.query(async ({ ctx }) => {
      return ctx.db.account.findMany({
        where: { userId: ctx.user?.id },
      });
    }),
  }),

  transaction: t.router({
    // Mutation - for modifying data
    transfer: t.procedure
      .input(TransferSchema)
      .mutation(async ({ ctx, input }) => {
        // Business logic here
        const result = await processTransfer(ctx.db, input);
        return { success: true, transactionId: result.id };
      }),
  }),
});

// Export type for client - THIS IS THE KEY!
export type AppRouter = typeof appRouter;
```

```typescript
// client/trpc.ts - Client Setup with Type Inference
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/trpc'; // Type-only import!

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});

// Usage - fully typed without any codegen!
async function example() {
  // TypeScript knows the return type
  const account = await trpc.account.getById.query({ accountId: 'ACC-12345' });
  console.log(account.balance); // number - typed!

  // TypeScript enforces input types
  const result = await trpc.transaction.transfer.mutate({
    fromAccountId: 'ACC-12345',
    toAccountId: 'ACC-67890',
    amountCents: 10000,
  });

  // TypeScript error: 'invalid' is not a valid property
  // await trpc.account.getById.query({ invalid: 'prop' });
}
```

---

## RPC-06: tRPC with Next.js

**Q:** *"How do you integrate tRPC with Next.js App Router? Explain the setup for both server and client components."*

🇻🇳 **Giải thích chi tiết:**
tRPC với Next.js App Router là combination rất powerful cho full-stack TypeScript applications. Setup bao gồm tạo tRPC router, expose nó qua Next.js API route handler, và configure client để consume API đó. Với App Router, có hai cách gọi tRPC: từ Server Components bằng cách call procedures trực tiếp (server-side), hoặc từ Client Components dùng React Query hooks. Server Components có thể import và call tRPC procedures trực tiếp vì chúng run trên server, không cần HTTP round-trip, cực kỳ efficient. Client Components dùng `@trpc/react-query` package cung cấp hooks như `useQuery`, `useMutation` với full type safety. Setup yêu cầu TRPCProvider wrap application để provide query client và trpc client. Một pattern quan trọng là server-side caller cho Server Components và prefetching - bạn có thể prefetch data trên server và hydrate React Query cache, tránh waterfall requests. Đặc biệt cho banking apps, pattern này cho phép render initial account data ngay lập tức từ server, improving perceived performance.

🇬🇧 **Sample Answer:**
> *"Integrating tRPC with Next.js App Router provides a powerful full-stack TypeScript experience with multiple ways to call your API depending on the component type. The setup involves creating your tRPC router, exposing it through a Next.js route handler at `/api/trpc/[trpc]`, and configuring both server-side and client-side consumption. For Server Components, which run on the server, you can call tRPC procedures directly without any HTTP overhead - this is called server-side calling and is extremely efficient. For Client Components that run in the browser, you use the `@trpc/react-query` package which provides React Query hooks with full type safety. The client setup requires wrapping your application with providers for both React Query and tRPC. A powerful pattern with App Router is prefetching: you can call tRPC procedures in a Server Component, prefetch the data into React Query's cache, and then hydrate that cache on the client so data is immediately available without loading states. For banking applications, this means you can render the initial account balance and recent transactions instantly from the server, then enable real-time updates through client-side refetching. The setup also supports React Server Actions integration for mutations, allowing form submissions to call tRPC procedures directly."*

```typescript
// app/api/trpc/[trpc]/route.ts - API Route Handler
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createContext } from '@/server/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });

export { handler as GET, handler as POST };
```

```typescript
// lib/trpc/server.ts - Server-side Caller
import { appRouter } from '@/server/trpc/router';
import { createContext } from '@/server/trpc/context';
import { headers } from 'next/headers';

export async function createServerCaller() {
  const context = await createContext(
    new Request('http://localhost', { headers: headers() })
  );
  return appRouter.createCaller(context);
}
```

```tsx
// app/providers.tsx - React Query + tRPC Provider
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import type { AppRouter } from '@/server/trpc';

export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: '/api/trpc' })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

```tsx
// app/accounts/page.tsx - Server Component with Direct Call
import { createServerCaller } from '@/lib/trpc/server';
import { AccountList } from './account-list';

export default async function AccountsPage() {
  // Direct server-side call - no HTTP overhead!
  const caller = await createServerCaller();
  const accounts = await caller.account.listAll();

  return <AccountList initialAccounts={accounts} />;
}
```

```tsx
// app/accounts/account-list.tsx - Client Component with Hooks
'use client';

import { trpc } from '@/app/providers';

export function AccountList({ initialAccounts }: { initialAccounts: Account[] }) {
  const { data: accounts } = trpc.account.listAll.useQuery(undefined, {
    initialData: initialAccounts,
    refetchInterval: 30000,
  });

  const transferMutation = trpc.transaction.transfer.useMutation({
    onSuccess: () => {
      trpc.useUtils().account.listAll.invalidate();
    },
  });

  return (
    <div>
      {accounts?.map((account) => (
        <div key={account.id}>
          <h3>{account.type}</h3>
          <p>${(account.balanceCents / 100).toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## RPC-07: BFF Pattern (Backend for Frontend)

**Q:** *"What is the Backend for Frontend (BFF) pattern and why is it valuable for frontend applications? How would you implement it?"*

🇻🇳 **Giải thích chi tiết:**
Backend for Frontend (BFF) là architectural pattern nơi mỗi frontend application có dedicated backend service riêng, thay vì tất cả frontends gọi chung một general-purpose API. BFF layer đứng giữa frontend và downstream microservices, aggregate data từ nhiều services, transform responses theo đúng format frontend cần, và hide complexity của backend architecture. Trong banking như ANZ, mobile app có thể cần BFF riêng optimized cho mobile (smaller payloads, offline support), web app cần BFF khác với richer data, và internal admin tools cần BFF với full data access. BFF giúp frontend teams move independently - họ own BFF của mình, có thể modify API contract mà không affect other teams hay downstream services. BFF cũng là ideal place để implement frontend-specific concerns như response caching, request batching, authentication token handling, và error formatting phù hợp với frontend error UI. Pattern này đặc biệt valuable khi có nhiều microservices - thay vì frontend call 5-10 services, frontend call 1 BFF endpoint mà BFF orchestrate calls đến các services cần thiết.

🇬🇧 **Sample Answer:**
> *"The Backend for Frontend pattern involves creating a dedicated backend service for each type of frontend application rather than having all frontends consume a single general-purpose API. The BFF acts as an intermediary layer that aggregates data from multiple downstream microservices, transforms responses to match exactly what the frontend needs, and shields the frontend from the complexity of the backend architecture. In a banking context like ANZ, you might have separate BFFs for mobile banking optimized for smaller payloads and offline capabilities, web banking with richer data and real-time features, and internal admin tools with full data access and audit capabilities. This separation allows frontend teams to own their BFF and evolve their API contract independently without coordinating with other teams or affecting downstream services. The BFF is also the ideal location for frontend-specific concerns like response caching strategies, request batching to reduce round trips, authentication token management, and error formatting that matches the frontend's error handling UI. When you have numerous microservices, the BFF prevents the frontend from becoming a distributed systems orchestrator - instead of the mobile app calling 10 different services, it calls one BFF endpoint that handles all the orchestration, retry logic, and fallback behavior. This dramatically simplifies frontend code and improves user experience by providing faster, more reliable responses."*

```typescript
// bff/routes/dashboard.ts - BFF Route Aggregating Multiple Services
import { Router } from 'express';

const router = Router();

// Service clients
import { accountService } from '../services/account-service';
import { transactionService } from '../services/transaction-service';
import { notificationService } from '../services/notification-service';

// BFF endpoint aggregating data for dashboard
router.get('/api/dashboard', async (req, res) => {
  const userId = req.user!.id;

  try {
    // Parallel calls to multiple backend services
    const [accounts, transactions, notifications] = await Promise.allSettled([
      accountService.getAccountsByUserId(userId),
      transactionService.getRecentTransactions(userId, { limit: 5 }),
      notificationService.getUnreadNotifications(userId, { limit: 3 }),
    ]);

    // Transform and aggregate responses for frontend
    const response = {
      accounts: accounts.status === 'fulfilled'
        ? accounts.value.map(transformAccount)
        : [],
      recentTransactions: transactions.status === 'fulfilled'
        ? transactions.value.map(transformTransaction)
        : [],
      notifications: notifications.status === 'fulfilled'
        ? notifications.value
        : [],
      // Partial failure handling
      _errors: {
        accounts: accounts.status === 'rejected',
        transactions: transactions.status === 'rejected',
        notifications: notifications.status === 'rejected',
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Transform backend data to frontend-friendly format
function transformAccount(account: BackendAccount): FrontendAccount {
  return {
    id: account.account_id,
    displayName: account.nickname || `****${account.number.slice(-4)}`,
    balance: formatCurrency(account.balance_cents),
    type: account.account_type,
    isNegative: account.balance_cents < 0,
  };
}

function transformTransaction(tx: BackendTransaction): FrontendTransaction {
  return {
    id: tx.transaction_id,
    description: tx.merchant_name || tx.description,
    amount: formatCurrency(Math.abs(tx.amount_cents)),
    isCredit: tx.amount_cents > 0,
    date: formatRelativeDate(tx.created_at),
    category: tx.category || 'Other',
  };
}

export default router;
```

```typescript
// Next.js App Router BFF Pattern
// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Aggregate from multiple internal services
  const [accountsRes, transactionsRes] = await Promise.all([
    fetch(`${ACCOUNT_SERVICE}/accounts?userId=${session.userId}`),
    fetch(`${TRANSACTION_SERVICE}/recent?userId=${session.userId}&limit=10`),
  ]);

  const accounts = await accountsRes.json();
  const transactions = await transactionsRes.json();

  // Transform for frontend consumption
  return NextResponse.json({
    accounts: accounts.map(transformForFrontend),
    transactions: transactions.map(transformForFrontend),
    lastUpdated: new Date().toISOString(),
  });
}
```

---

## RPC-08: tRPC Middleware & Authentication

**Q:** *"How do you implement authentication and authorization in tRPC using middleware? Explain the middleware chain and protected procedures."*

🇻🇳 **Giải thích chi tiết:**
Middleware trong tRPC cho phép inject logic vào procedure execution pipeline, tương tự middleware trong Express nhưng với full type safety. Mỗi middleware nhận context và `next` function, có thể modify context, validate conditions, hoặc reject request trước khi procedure chạy. Authentication middleware thường verify JWT token, fetch user từ database, và inject user vào context. Authorization middleware check xem user có permission để thực hiện action không. Middleware có thể chain - ví dụ `isAuthenticated` -> `hasRole('admin')` -> actual procedure. Context được augment qua mỗi middleware, và TypeScript track những changes này, nên trong protected procedure bạn có guarantee `ctx.user` exists. Pattern phổ biến là tạo các "procedure builders" khác nhau: `publicProcedure` cho endpoints không cần auth, `protectedProcedure` require logged in user, `adminProcedure` require admin role. Trong banking context, bạn có thể có thêm `accountOwnerProcedure` verify user owns specific account trước khi cho phép operations trên account đó.

🇬🇧 **Sample Answer:**
> *"Middleware in tRPC allows you to inject reusable logic into the procedure execution pipeline with full type safety, similar to Express middleware but type-aware. Each middleware receives the current context and a `next` function, can modify the context, validate conditions, or reject the request before the procedure executes. For authentication, a middleware typically verifies the JWT or session token, fetches the user from the database, and injects the user object into the context for downstream use. Authorization middleware then checks whether the authenticated user has permission to perform the specific action. Middlewares can be chained together - for example, `isAuthenticated` followed by `hasRole('admin')` followed by the actual procedure. The context is augmented through each middleware, and TypeScript tracks these changes, so within a protected procedure you have a compile-time guarantee that `ctx.user` exists and is not null. A common pattern is creating different procedure builders: `publicProcedure` for endpoints that don't require authentication, `protectedProcedure` that requires a logged-in user, and `adminProcedure` that requires admin privileges. For banking applications, you might add an `accountOwnerProcedure` that verifies the user owns the specific account before allowing operations. This approach centralizes security logic, makes it reusable across procedures, and ensures you can't accidentally create an unprotected endpoint."*

```typescript
// server/trpc/middleware/auth.ts
import { TRPCError, initTRPC } from '@trpc/server';
import { verify } from 'jsonwebtoken';
import type { Context } from '../context';

const t = initTRPC.context<Context>().create();

// Authentication middleware - verify JWT and inject user
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authorization header',
    });
  }

  const token = authHeader.slice(7);

  try {
    const payload = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      roles: string[];
    };

    const user = await ctx.db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // Augment context - TypeScript tracks this!
    return next({
      ctx: { ...ctx, user },
    });
  } catch {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
});

// Role-based authorization middleware
const hasRole = (requiredRole: string) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user?.roles.includes(requiredRole)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Required role: ${requiredRole}`,
      });
    }
    return next({ ctx });
  });

// Account ownership middleware
const ownsAccount = t.middleware(async ({ ctx, next, input }) => {
  const { accountId } = input as { accountId: string };

  const account = await ctx.db.account.findUnique({
    where: { id: accountId },
  });

  if (!account || account.userId !== ctx.user?.id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not own this account',
    });
  }

  return next({ ctx: { ...ctx, account } });
});

// Procedure builders with stacked middleware
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(isAuthenticated);

export const adminProcedure = t.procedure
  .use(isAuthenticated)
  .use(hasRole('admin'));

export const accountProcedure = t.procedure
  .use(isAuthenticated)
  .use(ownsAccount);
```

```typescript
// server/trpc/router.ts - Using protected procedures
import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure, accountProcedure } from './middleware/auth';

export const appRouter = t.router({
  // Public - no auth required
  health: publicProcedure.query(() => ({ status: 'ok' })),

  // Protected - requires authenticated user
  user: t.router({
    me: protectedProcedure.query(({ ctx }) => {
      // ctx.user is guaranteed to exist!
      return { id: ctx.user.id, email: ctx.user.email };
    }),
  }),

  // Account procedures - verify ownership
  account: t.router({
    getDetails: accountProcedure
      .input(z.object({ accountId: z.string() }))
      .query(async ({ ctx }) => {
        // ctx.account is guaranteed to exist and user owns it!
        return ctx.db.account.findUnique({
          where: { id: ctx.account.id },
        });
      }),
  }),

  // Admin only
  admin: t.router({
    getAllUsers: adminProcedure.query(async ({ ctx }) => {
      return ctx.db.user.findMany();
    }),
  }),
});
```

---

## RPC-09: Error Handling in tRPC

**Q:** *"How do you handle errors in tRPC? Explain TRPCError, custom error formatting, and client-side error handling strategies."*

🇻🇳 **Giải thích chi tiết:**
Error handling trong tRPC được design để type-safe và consistent across client-server boundary. TRPCError là built-in error class với predefined error codes mapping tới HTTP status codes: UNAUTHORIZED (401), FORBIDDEN (403), NOT_FOUND (404), BAD_REQUEST (400), INTERNAL_SERVER_ERROR (500), etc. Khi throw TRPCError trên server, tRPC serialize nó và send về client với đúng HTTP status code và error structure. Bạn có thể customize error formatting qua `errorFormatter` option khi init tRPC, thêm custom fields hoặc transform error messages cho frontend consumption. Ở client side, React Query integration cho phép handle errors trong `onError` callbacks của mutations, hoặc check `error` property từ queries. Pattern quan trọng là phân biệt operational errors (user input invalid, resource not found) với programming errors (bugs). Operational errors nên có user-friendly messages, programming errors nên log chi tiết nhưng show generic message cho users. Trong banking apps, error messages cần careful - không leak sensitive info nhưng vẫn helpful để users know what to do.

🇬🇧 **Sample Answer:**
> *"Error handling in tRPC is designed to be type-safe and consistent across the client-server boundary. TRPCError is the built-in error class with predefined error codes that map to appropriate HTTP status codes: UNAUTHORIZED becomes 401, FORBIDDEN becomes 403, NOT_FOUND becomes 404, BAD_REQUEST becomes 400, and so on. When you throw a TRPCError on the server, tRPC serializes it and sends it to the client with the correct HTTP status and error structure, maintaining type information throughout. You can customize error formatting through the `errorFormatter` option when initializing tRPC, allowing you to add custom fields, transform error messages, or include additional context for the frontend. On the client side, the React Query integration provides `onError` callbacks for mutations and an `error` property on query results that you can use for displaying error states. A critical pattern is distinguishing between operational errors like invalid user input or resource not found, and programming errors which are actual bugs. Operational errors should have user-friendly messages, while programming errors should log detailed information server-side but show generic messages to users. For banking applications, error messages require special care - they should never leak sensitive information like account details, but still be helpful enough that users understand what action to take."*

```typescript
// server/trpc/init.ts - Error Formatter Configuration
import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Add Zod validation details
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
        // Add request ID for debugging
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    };
  },
});
```

```typescript
// server/trpc/router.ts - Throwing errors in procedures
import { TRPCError } from '@trpc/server';

export const transactionRouter = t.router({
  transfer: protectedProcedure
    .input(z.object({
      fromAccountId: z.string(),
      toAccountId: z.string(),
      amountCents: z.number().positive().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.db.account.findUnique({
        where: { id: input.fromAccountId },
      });

      if (!account) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source account not found',
        });
      }

      if (account.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this account',
        });
      }

      if (account.balanceCents < input.amountCents) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Insufficient funds',
        });
      }

      // Perform transfer...
      return { success: true };
    }),
});
```

```tsx
// client/hooks/useTransfer.ts - Client-side Error Handling
import { trpc } from '@/lib/trpc/client';
import { TRPCClientError } from '@trpc/client';

export function useTransfer() {
  return trpc.transaction.transfer.useMutation({
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        const code = error.data?.code;

        switch (code) {
          case 'UNAUTHORIZED':
            router.push('/login');
            break;
          case 'BAD_REQUEST':
            // Check for Zod field-level errors
            if (error.data?.zodError) {
              setFormErrors(error.data.zodError.fieldErrors);
            } else {
              toast.error(error.message);
            }
            break;
          case 'FORBIDDEN':
            toast.error('You do not have permission for this action');
            break;
          case 'NOT_FOUND':
            toast.error('Account not found');
            break;
          default:
            toast.error('Something went wrong. Please try again.');
        }
      }
    },
    onSuccess: () => {
      toast.success('Transfer completed successfully');
    },
  });
}
```

```tsx
// client/components/TransferForm.tsx - Using error handling
'use client';

export function TransferForm() {
  const transfer = useTransfer();
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (data: TransferInput) => {
    setFormErrors({});
    try {
      await transfer.mutateAsync(data);
    } catch {
      // Error handled in onError callback
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="amount" />
      {formErrors.amount && (
        <span className="error">{formErrors.amount[0]}</span>
      )}
      <button disabled={transfer.isPending}>
        {transfer.isPending ? 'Processing...' : 'Transfer'}
      </button>
    </form>
  );
}
```

---

## RPC-10: Streaming & Real-time with gRPC/tRPC

**Q:** *"How do you implement real-time features using gRPC streaming or tRPC subscriptions? What are the patterns and trade-offs?"*

🇻🇳 **Giải thích chi tiết:**
Real-time features trong banking apps như live transaction notifications, balance updates, và market data feeds cần streaming capabilities. gRPC cung cấp 4 types: unary (1:1), server streaming (1:N), client streaming (N:1), và bidirectional streaming (N:N). Tuy nhiên, gRPC-Web chỉ support unary và server streaming do browser limitations. Server streaming phù hợp cho scenarios như subscribe to new transactions - client gửi 1 request, server stream transactions khi chúng xảy ra. tRPC cung cấp subscriptions built on WebSocket hoặc Server-Sent Events (SSE). Subscriptions trong tRPC type-safe như queries/mutations - bạn define subscription procedure với input type và yield type. Client subscribe và receive typed messages. Trade-offs: gRPC streaming efficient về bandwidth và latency, nhưng cần proxy setup và limited browser support. tRPC subscriptions dễ implement hơn trong TypeScript ecosystem, integrate tốt với React Query, nhưng performance có thể không bằng gRPC binary protocol. Cả hai đều cần handle reconnection, backpressure, và cleanup properly để tránh memory leaks.

🇬🇧 **Sample Answer:**
> *"Real-time features in banking applications like live transaction notifications, balance updates, and market data feeds require streaming capabilities that both gRPC and tRPC can provide, each with different approaches and trade-offs. gRPC offers four communication patterns: unary for single request-response, server streaming where the server sends multiple responses to one request, client streaming where the client sends multiple requests, and bidirectional streaming for full-duplex communication. However, gRPC-Web in browsers only supports unary and server streaming due to browser API limitations. Server streaming is perfect for scenarios like subscribing to new transactions - the client sends one subscription request and the server streams transactions as they occur. tRPC provides subscriptions built on WebSocket or Server-Sent Events. Subscriptions in tRPC are fully type-safe like queries and mutations - you define a subscription procedure with input and yield types, and the client receives properly typed messages. The trade-offs are significant: gRPC streaming is more efficient in bandwidth and latency due to binary protocol and HTTP/2 multiplexing, but requires proxy setup and has limited browser support. tRPC subscriptions are easier to implement in a TypeScript ecosystem and integrate naturally with React, but may have slightly higher overhead. Both approaches require careful handling of reconnection logic, backpressure when the client can't keep up, and proper cleanup to avoid memory leaks in long-running subscriptions."*

```typescript
// tRPC Subscription - Server Side
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';

const transactionEvents = new EventEmitter();

export const subscriptionRouter = t.router({
  onAccountUpdate: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .subscription(({ ctx, input }) => {
      return observable<TransactionEvent>((emit) => {
        const channel = `account:${input.accountId}`;

        const handler = (event: TransactionEvent) => {
          emit.next(event);
        };

        transactionEvents.on(channel, handler);

        // Cleanup on unsubscribe
        return () => {
          transactionEvents.off(channel, handler);
        };
      });
    }),
});

// Emit events when transactions occur
export async function processTransaction(transaction: Transaction) {
  await db.transaction.create({ data: transaction });

  transactionEvents.emit(`account:${transaction.accountId}`, {
    type: 'NEW_TRANSACTION',
    data: transaction,
    timestamp: new Date().toISOString(),
  });
}
```

```tsx
// tRPC Subscription - Client Side
'use client';

import { trpc } from '@/lib/trpc/client';

export function useAccountSubscription(
  accountId: string,
  onEvent: (event: TransactionEvent) => void
) {
  trpc.subscription.onAccountUpdate.useSubscription(
    { accountId },
    {
      onData: (event) => {
        onEvent(event);
      },
      onError: (error) => {
        console.error('Subscription error:', error);
      },
    }
  );
}

// Usage in component
export function AccountDashboard({ accountId }: { accountId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useAccountSubscription(accountId, (event) => {
    if (event.type === 'NEW_TRANSACTION') {
      setTransactions((prev) => [event.data, ...prev]);
      toast.info(`New transaction: ${event.data.description}`);
    }
  });

  return (
    <div>
      {transactions.map((tx) => (
        <TransactionCard key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}
```

```typescript
// gRPC Server Streaming - Server Side (Node.js)
import { ServerWritableStream } from '@grpc/grpc-js';

class TransactionServiceImpl {
  subscribeTransactions(
    call: ServerWritableStream<SubscribeRequest, Transaction>
  ) {
    const accountId = call.request.getAccountId();

    const handler = (transaction: Transaction) => {
      call.write(transaction);
    };

    transactionEvents.on(`account:${accountId}`, handler);

    call.on('cancelled', () => {
      transactionEvents.off(`account:${accountId}`, handler);
    });
  }
}
```

```typescript
// gRPC Server Streaming - Client Side (Browser with gRPC-Web)
function useGrpcTransactionStream(accountId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const request = new SubscribeRequest();
    request.setAccountId(accountId);

    const stream = transactionClient.subscribeTransactions(request);
    setIsConnected(true);

    stream.on('data', (transaction: Transaction) => {
      setTransactions((prev) => [transaction.toObject(), ...prev]);
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      setIsConnected(false);
      // Implement reconnection with exponential backoff
    });

    stream.on('end', () => {
      setIsConnected(false);
    });

    return () => {
      stream.cancel();
    };
  }, [accountId]);

  return { transactions, isConnected };
}
```

---
