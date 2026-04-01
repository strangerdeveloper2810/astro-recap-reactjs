# gRPC-WEB & tRPC (8-10 câu)

> **Mục đích**: Ôn nhanh gRPC-Web và tRPC cho Senior Frontend. Mỗi câu = Vietnamese hiểu nhanh + English trả lời
> **Format**: 🇻🇳 Hiểu → 🇬🇧 Answer (3-5 câu, natural speaking style)
> **Context**: ANZ banking — microservices, high-throughput APIs, strict type safety

---

# PART 1: gRPC-WEB (6 câu)

---

## GRPC-01: gRPC vs REST — Binary Protocol, Protobuf, HTTP/2

🇻🇳 gRPC dùng Protocol Buffers (binary format) thay vì JSON — nhỏ hơn, parse nhanh hơn. Chạy trên HTTP/2 nên hỗ trợ multiplexing, header compression, streaming. REST dùng JSON + HTTP/1.1, dễ đọc nhưng verbose và chậm hơn cho high-throughput.

🇬🇧
> "gRPC is an RPC framework by Google that uses Protocol Buffers as its serialization format instead of JSON. Protobuf is a binary format — messages are significantly smaller and faster to serialize than JSON, which matters a lot in high-throughput banking systems. It runs on HTTP/2, giving us multiplexing — multiple requests over a single TCP connection — header compression, and native streaming support. Compared to REST, gRPC trades human-readability for performance: you get strongly typed contracts, automatic code generation, and around 7-10x smaller payloads. In a microservices architecture like ANZ's, where services talk to each other thousands of times per second, that performance difference is substantial."

```
┌─────────────────────────────────────────────────────────────┐
│                     REST vs gRPC                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  REST:                            gRPC:                      │
│  - JSON (text, verbose)           - Protobuf (binary, compact)│
│  - HTTP/1.1 (1 req/conn)         - HTTP/2 (multiplexed)     │
│  - Human-readable                 - Machine-optimized        │
│  - No built-in streaming          - 4 streaming modes        │
│  - Manual type validation         - Auto code generation     │
│  - Loose contracts                - Strict .proto contracts  │
│                                                              │
│  Payload size example:                                       │
│  JSON: {"name":"John","age":30}   → ~29 bytes                │
│  Protobuf: (binary encoded)       → ~9 bytes                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## GRPC-02: gRPC-Web for Browsers — Proxy, Limitations

🇻🇳 Browser không hỗ trợ HTTP/2 trailers và raw gRPC — cần proxy (Envoy) đứng giữa convert gRPC-Web thành native gRPC. gRPC-Web chỉ hỗ trợ Unary + Server-streaming, không có Client-streaming hay Bidirectional.

🇬🇧
> "Browsers can't make native gRPC calls because they don't expose the low-level HTTP/2 framing and trailers that gRPC relies on. gRPC-Web solves this by providing a browser-compatible protocol that wraps gRPC calls into standard HTTP requests. You need a proxy — typically Envoy — sitting between the browser and the gRPC backend. Envoy translates gRPC-Web requests to native gRPC. The main limitation is that gRPC-Web only supports Unary calls and Server-streaming — Client-streaming and Bidirectional streaming are not available in the browser. For ANZ's architecture, this means the frontend can still call gRPC backend services efficiently, but for bidirectional real-time features like live trading, we'd complement it with WebSockets."

```
┌──────────────────────────────────────────────────────────┐
│              gRPC-Web Architecture                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Browser                Proxy              Backend        │
│  ┌──────────┐     ┌──────────────┐    ┌──────────────┐  │
│  │ React App│────►│ Envoy Proxy  │───►│ gRPC Service │  │
│  │ gRPC-Web │◄────│ (translate)  │◄───│ (native gRPC)│  │
│  │ Client   │     │              │    │              │  │
│  └──────────┘     └──────────────┘    └──────────────┘  │
│                                                           │
│  Supported:          Not supported (browser):             │
│  ✅ Unary            ❌ Client streaming                  │
│  ✅ Server streaming ❌ Bidirectional streaming            │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## GRPC-03: Protobuf & Code Generation — .proto Files, TypeScript Clients

🇻🇳 `.proto` file định nghĩa service contract: messages (data shape) và services (RPC methods). Từ file này, toolchain generate TypeScript client code tự động — types, request/response classes, service stubs. Zero manual typing, luôn sync với backend.

🇬🇧
> "Protocol Buffers use .proto files as the single source of truth for your API contract. You define your message types — like request and response shapes — and your service methods in this file. Then you run a code generator — protoc with a TypeScript plugin like ts-proto or protobuf-ts — which outputs fully typed TypeScript clients, interfaces, and serialization code. This is incredibly powerful because the frontend and backend always stay in sync: if the backend changes a field, the generated client code changes too, and TypeScript catches any mismatches at compile time. At ANZ, where API correctness is critical for financial data, this eliminates an entire class of bugs."

```protobuf
// account.proto — ANZ Banking Example
syntax = "proto3";

package anz.banking;

// Message definitions (like TypeScript interfaces)
message Account {
  string account_id = 1;
  string holder_name = 2;
  double balance = 3;
  AccountType type = 4;
}

enum AccountType {
  SAVINGS = 0;
  CHECKING = 1;
  INVESTMENT = 2;
}

message GetAccountRequest {
  string account_id = 1;
}

message TransferRequest {
  string from_account = 1;
  string to_account = 2;
  double amount = 3;
  string description = 4;
}

message TransferResponse {
  string transaction_id = 1;
  bool success = 2;
  double new_balance = 3;
}

// Service definition (RPC methods)
service BankingService {
  rpc GetAccount(GetAccountRequest) returns (Account);
  rpc Transfer(TransferRequest) returns (TransferResponse);
  rpc WatchBalance(GetAccountRequest) returns (stream Account);
}
```

```bash
# Generate TypeScript client from .proto
npx protoc --ts_proto_out=./src/generated \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_opt=esModuleInterop=true \
  ./protos/account.proto
```

```typescript
// Generated TypeScript types (auto-generated, never edit manually)
export interface Account {
  accountId: string;
  holderName: string;
  balance: number;
  type: AccountType;
}

export interface TransferRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
  description: string;
}

// Usage in frontend — fully typed!
const account = await bankingClient.getAccount({ accountId: "ANZ-001" });
console.log(account.holderName); // ✅ autocomplete works
console.log(account.name);       // ❌ TypeScript error
```

---

## GRPC-04: gRPC Service Types — Unary, Server Streaming, Client Streaming, Bidirectional

🇻🇳 gRPC có 4 loại: **Unary** (1 request → 1 response, giống REST). **Server streaming** (1 request → nhiều responses, ví dụ price feed). **Client streaming** (nhiều requests → 1 response, ví dụ upload chunks). **Bidirectional** (cả 2 stream đồng thời, ví dụ chat). Browser chỉ dùng được Unary + Server streaming.

🇬🇧
> "gRPC defines four communication patterns. Unary is request-response, just like REST — the client sends one request and gets one response. Server streaming is where the client sends one request and the server returns a stream of responses — perfect for real-time price feeds or transaction notifications in a banking app. Client streaming is the reverse — the client streams multiple messages and the server responds once, useful for uploading large datasets in chunks. Bidirectional streaming is where both sides send streams simultaneously — ideal for chat or collaborative features. In gRPC-Web for browsers, we're limited to Unary and Server streaming, but those cover most frontend use cases."

```protobuf
service BankingService {
  // 1. Unary — single request, single response
  rpc GetAccount(GetAccountRequest) returns (Account);

  // 2. Server Streaming — single request, stream of responses
  rpc WatchTransactions(WatchRequest) returns (stream Transaction);

  // 3. Client Streaming — stream of requests, single response
  // ❌ NOT available in gRPC-Web (browser)
  rpc UploadDocuments(stream Document) returns (UploadResult);

  // 4. Bidirectional Streaming — stream both ways
  // ❌ NOT available in gRPC-Web (browser)
  rpc LiveChat(stream ChatMessage) returns (stream ChatMessage);
}
```

```typescript
// Unary call — simple request/response
const account = await client.getAccount({ accountId: "ANZ-001" });

// Server streaming — receive multiple responses
const stream = client.watchTransactions({ accountId: "ANZ-001" });
stream.on("data", (transaction: Transaction) => {
  console.log("New transaction:", transaction.amount);
  updateTransactionList(transaction);
});
stream.on("end", () => console.log("Stream ended"));
stream.on("error", (err) => console.error("Stream error:", err));
```

---

## GRPC-05: gRPC-Web in React — Integration Patterns, Hooks, Error Handling

🇻🇳 Wrap gRPC client calls trong custom hooks, tương tự React Query pattern. Handle loading/error/data states. Dùng `AbortController` tương đương để cancel requests. Error handling qua gRPC status codes (NOT_FOUND, PERMISSION_DENIED, INTERNAL).

🇬🇧
> "In React, I wrap gRPC-Web calls in custom hooks following a similar pattern to React Query. Each hook manages loading, error, and data states. For server streaming, I use useEffect with cleanup to properly close streams when components unmount. Error handling maps gRPC status codes — like UNAUTHENTICATED, NOT_FOUND, or PERMISSION_DENIED — to user-friendly messages. In a banking context, proper error handling is critical: a PERMISSION_DENIED on a transfer attempt needs to show a clear message, not a generic error. I also pair gRPC calls with React Query or TanStack Query for caching and retry logic."

```typescript
// Custom hook for gRPC Unary calls
function useGrpcQuery<TReq, TRes>(
  method: (req: TReq) => Promise<TRes>,
  request: TReq,
  deps: any[] = []
) {
  const [data, setData] = useState<TRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<GrpcError | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    method(request)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(parseGrpcError(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error };
}

// Custom hook for Server Streaming
function useGrpcStream<TReq, TRes>(
  method: (req: TReq) => grpc.ClientReadableStream<TRes>,
  request: TReq,
  deps: any[] = []
) {
  const [messages, setMessages] = useState<TRes[]>([]);
  const [status, setStatus] = useState<"connecting" | "streaming" | "ended" | "error">("connecting");

  useEffect(() => {
    const stream = method(request);
    setStatus("streaming");

    stream.on("data", (message: TRes) => {
      setMessages((prev) => [...prev, message]);
    });

    stream.on("end", () => setStatus("ended"));
    stream.on("error", (err) => {
      setStatus("error");
      console.error("Stream error:", err);
    });

    // Cleanup: cancel stream on unmount
    return () => stream.cancel();
  }, deps);

  return { messages, status };
}

// gRPC Error handling
interface GrpcError {
  code: number;
  message: string;
  userMessage: string;
}

function parseGrpcError(err: any): GrpcError {
  const grpcStatusMap: Record<number, string> = {
    2:  "Something went wrong. Please try again.",       // UNKNOWN
    3:  "Invalid request. Please check your input.",     // INVALID_ARGUMENT
    5:  "Resource not found.",                           // NOT_FOUND
    7:  "You don't have permission for this action.",    // PERMISSION_DENIED
    13: "Internal server error. Contact support.",       // INTERNAL
    16: "Session expired. Please log in again.",         // UNAUTHENTICATED
  };

  return {
    code: err.code,
    message: err.message,
    userMessage: grpcStatusMap[err.code] || "An unexpected error occurred.",
  };
}

// Usage in component
function AccountDashboard({ accountId }: { accountId: string }) {
  const { data: account, loading, error } = useGrpcQuery(
    (req) => bankingClient.getAccount(req),
    { accountId },
    [accountId]
  );

  const { messages: transactions, status } = useGrpcStream(
    (req) => bankingClient.watchTransactions(req),
    { accountId },
    [accountId]
  );

  if (loading) return <Skeleton />;
  if (error) return <ErrorBanner message={error.userMessage} />;

  return (
    <div>
      <AccountHeader account={account!} />
      <TransactionFeed
        transactions={transactions}
        isLive={status === "streaming"}
      />
    </div>
  );
}
```

---

## GRPC-06: When to Use gRPC vs REST vs GraphQL — Decision Framework

🇻🇳 **gRPC**: microservice-to-microservice, high performance, strict contracts, streaming. **REST**: public APIs, simple CRUD, browser-friendly, caching dễ. **GraphQL**: frontend-driven queries, nhiều data sources, tránh over/under-fetching. Banking context: gRPC cho internal services, REST/GraphQL cho customer-facing APIs.

🇬🇧
> "My decision framework has three axes: performance, flexibility, and ecosystem. gRPC excels in service-to-service communication — binary protocol, streaming support, and code generation make it ideal for internal microservices in a banking platform where milliseconds matter. REST is my choice for public-facing APIs — it's universally understood, cacheable with HTTP semantics, and browser-native. GraphQL fits when the frontend needs flexible data fetching across multiple domains — like a dashboard aggregating accounts, transactions, and notifications in one query. At ANZ, I'd expect gRPC between backend services, REST or GraphQL for the customer-facing BFF layer, and gRPC-Web only where we need direct streaming from the browser — like real-time balance updates."

```
┌───────────────────────────────────────────────────────────────┐
│                  Decision Framework                            │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Choose gRPC when:              Choose REST when:              │
│  ✅ Service-to-service          ✅ Public/external APIs        │
│  ✅ High throughput needed      ✅ Simple CRUD operations      │
│  ✅ Streaming required          ✅ HTTP caching important      │
│  ✅ Strict type contracts       ✅ Wide tool/ecosystem support │
│  ✅ Polyglot microservices      ✅ Browser-first, no proxy     │
│                                                                │
│  Choose GraphQL when:           ANZ Architecture:              │
│  ✅ Flexible frontend queries   ┌─────────────────────────┐   │
│  ✅ Multiple data sources       │ Mobile/Web (React)      │   │
│  ✅ Avoid over-fetching         │   ↕ REST / GraphQL      │   │
│  ✅ Rapid frontend iteration    │ BFF Layer (Node.js)     │   │
│  ✅ Real-time via subscriptions │   ↕ gRPC (internal)     │   │
│                                 │ Microservices (Go/Java) │   │
│                                 └─────────────────────────┘   │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

# PART 2: tRPC (4 câu)

---

## TRPC-01: What is tRPC — End-to-End Type Safety Without Code Generation

🇻🇳 tRPC cho phép frontend gọi backend functions trực tiếp, tự động infer TypeScript types từ server → client mà không cần code generation hay schema file. Server viết function, client dùng ngay với full autocompletion. Yêu cầu: cả frontend và backend đều TypeScript.

🇬🇧
> "tRPC stands for TypeScript Remote Procedure Call. It provides end-to-end type safety between your frontend and backend without any code generation, schema files, or build steps. You define procedures on the server with input validation using Zod, and the client automatically gets full TypeScript types — autocompletion, type checking, the whole thing. The magic is that tRPC uses TypeScript's type inference to share types at compile time, not runtime. The tradeoff is that both your frontend and backend must be in TypeScript — it's not suitable for polyglot environments. For a full-stack TypeScript project at ANZ — say a Next.js internal tool — tRPC gives you the fastest developer experience with zero type drift."

```typescript
// Server: define a procedure — that's it, no schema files
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

const appRouter = t.router({
  // Query — read data
  getAccount: t.procedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input }) => {
      const account = await db.account.findUnique({
        where: { id: input.accountId },
      });
      return account; // Return type is inferred automatically!
    }),

  // Mutation — write data
  transfer: t.procedure
    .input(z.object({
      fromAccount: z.string(),
      toAccount: z.string(),
      amount: z.number().positive(),
    }))
    .mutation(async ({ input }) => {
      return await processTransfer(input);
    }),
});

// Export the router TYPE (not the router itself)
export type AppRouter = typeof appRouter;
```

```typescript
// Client: full autocompletion, zero codegen
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../server/router"; // TYPE-only import

const trpc = createTRPCReact<AppRouter>();

// ✅ Full autocompletion: trpc.getAccount, trpc.transfer
// ✅ Input types inferred from Zod schema
// ✅ Return types inferred from server function
// ❌ No .proto files, no codegen, no schema stitching
```

---

## TRPC-02: tRPC Architecture — Router, Procedures, Context, Middleware

🇻🇳 **Router**: nhóm các procedures (giống Express router). **Procedure**: 1 endpoint = input validation + handler (query/mutation/subscription). **Context**: shared data cho mọi request (user session, DB connection). **Middleware**: chạy trước procedure — auth check, logging, rate limiting. Chain middleware được.

🇬🇧
> "tRPC's architecture has four key building blocks. Routers group related procedures — you can nest them for organization, like having an accounts router and a transactions router. Procedures are the actual endpoints — each has optional input validation with Zod, optional middleware, and a handler that returns data. Context is created per-request and shared across all procedures — it's where you put the authenticated user, database connection, or logger. Middleware runs before the procedure handler — I use it for authentication, authorization, and logging. The powerful thing is middleware can extend the context: an auth middleware can add the user object, and downstream procedures can access it with full type safety."

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

// 1. Context — created per request
interface Context {
  user: User | null;
  db: DatabaseClient;
  logger: Logger;
}

const createContext = async ({ req }: { req: Request }): Promise<Context> => ({
  user: await getUserFromToken(req.headers.get("authorization")),
  db: prisma,
  logger: createLogger(req),
});

const t = initTRPC.context<Context>().create();

// 2. Middleware — auth guard
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Extend context with guaranteed user
  return next({ ctx: { ...ctx, user: ctx.user } }); // user is now non-null
});

const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

// 3. Reusable procedure builders
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(isAuthenticated);
const adminProcedure = t.procedure.use(isAuthenticated).use(isAdmin);

// 4. Router — group procedures
const accountRouter = t.router({
  getBalance: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ ctx, input }) => {
      // ctx.user is guaranteed non-null here (middleware)
      ctx.logger.info(`User ${ctx.user.id} checking balance`);
      return ctx.db.account.findUnique({
        where: { id: input.accountId, ownerId: ctx.user.id },
      });
    }),

  closeAccount: adminProcedure
    .input(z.object({ accountId: z.string(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.account.update({
        where: { id: input.accountId },
        data: { status: "CLOSED", closedBy: ctx.user.id },
      });
    }),
});

// 5. Nested routers — app-level composition
const appRouter = t.router({
  accounts: accountRouter,
  transactions: transactionRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
```

---

## TRPC-03: tRPC with React Query — useQuery, useMutation, Optimistic Updates

🇻🇳 tRPC tích hợp sẵn với React Query (TanStack Query). `trpc.xxx.useQuery()` = fetch data với caching, refetch, stale time. `trpc.xxx.useMutation()` = write data. Optimistic updates qua `onMutate` — update cache trước khi server respond, rollback nếu fail.

🇬🇧
> "tRPC's React integration is built on top of TanStack Query, so you get all its caching, deduplication, and background refetching for free. Queries use `trpc.procedure.useQuery()` with the same options as React Query — staleTime, refetchInterval, enabled. Mutations use `trpc.procedure.useMutation()` with onSuccess, onError, and onMutate for optimistic updates. For optimistic updates, I snapshot the current cache in onMutate, apply the expected change immediately, and rollback from the snapshot if the mutation fails. In a banking app, I'd use optimistic updates for non-critical UI — like marking a notification as read — but never for financial transactions where the server response is the source of truth."

```typescript
import { trpc } from "../utils/trpc";

function AccountDashboard({ accountId }: { accountId: string }) {
  // Query — cached, auto-refetched
  const accountQuery = trpc.accounts.getBalance.useQuery(
    { accountId },
    {
      staleTime: 30_000,        // 30s before refetch
      refetchInterval: 60_000,  // Poll every 60s for balance
    }
  );

  // Dependent query — only runs when first query succeeds
  const transactionsQuery = trpc.transactions.getRecent.useQuery(
    { accountId },
    { enabled: !!accountQuery.data }
  );

  if (accountQuery.isLoading) return <Skeleton />;
  if (accountQuery.error) return <Error message={accountQuery.error.message} />;

  return (
    <div>
      <BalanceCard balance={accountQuery.data.balance} />
      <TransactionList data={transactionsQuery.data ?? []} />
      <TransferForm accountId={accountId} />
    </div>
  );
}

// Mutation with Optimistic Update
function NotificationList() {
  const utils = trpc.useUtils(); // Access to cache utilities

  const notifications = trpc.notifications.getAll.useQuery();

  const markAsRead = trpc.notifications.markRead.useMutation({
    // Optimistic update
    onMutate: async ({ notificationId }) => {
      // Cancel outgoing refetches
      await utils.notifications.getAll.cancel();

      // Snapshot current data
      const previous = utils.notifications.getAll.getData();

      // Optimistically update cache
      utils.notifications.getAll.setData(undefined, (old) =>
        old?.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );

      return { previous }; // Return snapshot for rollback
    },
    onError: (_err, _input, context) => {
      // Rollback on error
      if (context?.previous) {
        utils.notifications.getAll.setData(undefined, context.previous);
      }
    },
    onSettled: () => {
      // Refetch to ensure server state
      utils.notifications.getAll.invalidate();
    },
  });

  return (
    <ul>
      {notifications.data?.map((n) => (
        <li
          key={n.id}
          onClick={() => markAsRead.mutate({ notificationId: n.id })}
          style={{ opacity: n.read ? 0.5 : 1 }}
        >
          {n.message}
        </li>
      ))}
    </ul>
  );
}

// Type-safe error handling
function TransferForm({ accountId }: { accountId: string }) {
  const transfer = trpc.transactions.transfer.useMutation({
    onSuccess: (data) => {
      toast.success(`Transfer complete! Ref: ${data.transactionId}`);
    },
    onError: (error) => {
      // error.data?.code is typed — "BAD_REQUEST" | "FORBIDDEN" | etc.
      if (error.data?.code === "FORBIDDEN") {
        toast.error("Insufficient permissions for this transfer.");
      } else if (error.data?.code === "BAD_REQUEST") {
        toast.error(error.message); // Zod validation error message
      } else {
        toast.error("Transfer failed. Please try again.");
      }
    },
  });

  const handleSubmit = (formData: TransferFormData) => {
    // ✅ Input is type-checked against Zod schema on server
    transfer.mutate({
      fromAccount: accountId,
      toAccount: formData.toAccount,
      amount: formData.amount,
    });
  };

  return <Form onSubmit={handleSubmit} isLoading={transfer.isLoading} />;
}
```

---

## TRPC-04: tRPC vs GraphQL vs REST — When to Choose Each

🇻🇳 **tRPC**: full-stack TypeScript, internal tools, rapid prototyping — nhanh nhất, zero overhead. **GraphQL**: multi-platform (web + mobile), complex data requirements, team lớn tách FE/BE. **REST**: public APIs, cần caching HTTP, đa ngôn ngữ backend. tRPC không thể thay thế GraphQL/REST khi cần hỗ trợ non-TypeScript clients.

🇬🇧
> "Each has a sweet spot. tRPC is the best choice when both frontend and backend are TypeScript — you get the fastest development cycle with zero code generation, zero schema files, and instant type safety. It's perfect for internal tools, admin dashboards, and full-stack Next.js applications. GraphQL shines when you have multiple client platforms — web, mobile, third-party — each needing different data shapes, or when you're aggregating data from many microservices through a gateway. REST is still the right choice for public APIs consumed by external partners, when you need HTTP caching semantics, or when your backend is in Go, Java, or another non-TypeScript language. For ANZ specifically, I'd use tRPC for internal tooling and admin panels, GraphQL for customer-facing BFF layers serving web and mobile, and REST for external partner APIs and integrations."

```
┌────────────────────────────────────────────────────────────────┐
│              tRPC vs GraphQL vs REST                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Criteria          │ tRPC      │ GraphQL   │ REST               │
│  ─────────────────────────────────────────────────────────────  │
│  Type safety       │ ⭐⭐⭐    │ ⭐⭐      │ ⭐ (manual)        │
│  Code generation   │ None!     │ Required  │ Optional (OpenAPI)  │
│  Learning curve    │ Low       │ Medium    │ Low                 │
│  Multi-language    │ TS only   │ Any       │ Any                 │
│  Caching           │ Via RQ    │ Complex   │ HTTP native         │
│  Real-time         │ ✅ subs   │ ✅ subs   │ ❌ (need WS)       │
│  Over-fetching     │ N/A       │ Solved    │ Common problem      │
│  Ecosystem         │ Growing   │ Mature    │ Ubiquitous          │
│  Best for          │ Full-stack│ Multi-    │ Public APIs,        │
│                    │ TS apps   │ platform  │ External integr.    │
│                                                                 │
│  ANZ Architecture Example:                                      │
│  ┌─────────────────────────────────────────────────┐           │
│  │ Internal Admin Panel (Next.js) → tRPC           │           │
│  │ Customer App (React + React Native) → GraphQL   │           │
│  │ Partner/Third-party Integrations → REST          │           │
│  │ Service-to-Service → gRPC                        │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

```typescript
// Quick comparison: Same "getUser" endpoint in all three

// 1. REST — manual types, no safety
const res = await fetch("/api/users/1");
const user = await res.json(); // type: any 😬

// 2. GraphQL — codegen required for types
const { data } = useQuery(GET_USER, { variables: { id: "1" } });
// type: GetUserQuery (from codegen) ✅ but needs build step

// 3. tRPC — instant types, zero codegen
const { data } = trpc.users.getById.useQuery({ id: "1" });
// type: { id: string; name: string; email: string } ✅ inferred!
```

---

# BONUS: Quick Reference Card

```
┌────────────────────────────────────────────────────────────┐
│         ANZ Senior Frontend — API Layer Cheatsheet          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  "Which API protocol should I use?"                        │
│                                                             │
│  Is backend TypeScript?                                    │
│    ├── YES → Is it internal/same-team? → tRPC              │
│    └── NO ↓                                                │
│                                                             │
│  Need flexible queries from multiple clients?              │
│    ├── YES → GraphQL (with BFF pattern)                    │
│    └── NO ↓                                                │
│                                                             │
│  Need high-perf service-to-service?                        │
│    ├── YES → gRPC (native) / gRPC-Web (browser)           │
│    └── NO → REST (simple, cacheable, universal)            │
│                                                             │
│  Key Takeaways for Interview:                              │
│  1. "I choose the protocol based on constraints,           │
│     not hype"                                              │
│  2. "In banking, type safety = fewer production bugs"      │
│  3. "gRPC for performance, GraphQL for flexibility,        │
│     tRPC for velocity, REST for compatibility"             │
│  4. "These are complementary, not competing"               │
│                                                             │
└────────────────────────────────────────────────────────────┘
```
