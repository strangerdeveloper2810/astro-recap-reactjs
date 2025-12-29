# GraphQL & Apollo Client - Complete Guide (Basic to Advanced)

## Table of Contents
- [Level 1: Basic](#level-1-basic)
- [Level 2: Intermediate](#level-2-intermediate)
- [Level 3: Advanced](#level-3-advanced)
- [Real-world Applications](#real-world-applications)
- [Interview Questions](#interview-questions)

---

# Level 1: Basic

## 1.1 GraphQL Fundamentals

### What is GraphQL?

```
GraphQL là query language cho APIs:
- Client request chính xác data cần
- Single endpoint (thay vì multiple REST endpoints)
- Strong typing với schema
- Real-time với subscriptions
- Introspection (self-documenting)
```

### GraphQL vs REST

```
┌─────────────────────────────────────────────────────────────────┐
│                      REST vs GraphQL                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REST:                              GraphQL:                     │
│  ────────                          ─────────                     │
│  - Multiple endpoints              - Single endpoint             │
│  - Over-fetching/under-fetching    - Exact data requested        │
│  - Versioning (v1, v2, v3)         - Schema evolution            │
│  - Multiple round trips            - Single request              │
│  - Fixed response structure        - Flexible structure          │
│                                                                  │
│  Example:                                                        │
│  ─────────                                                       │
│  REST:                              GraphQL:                     │
│  GET /users/1                       query {                      │
│  GET /users/1/posts                   user(id: 1) {              │
│  GET /posts/1/comments                  name                     │
│                                         posts {                  │
│  3 requests                               title                  │
│                                           comments { text }      │
│                                         }                        │
│                                       }                          │
│                                     }                            │
│                                     1 request                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Schema Definition Language (SDL)

```graphql
# ========== SCALAR TYPES ==========
# Built-in: Int, Float, String, Boolean, ID
# Custom: DateTime, JSON, etc.

# ========== OBJECT TYPES ==========
type User {
  id: ID!                    # Non-nullable
  name: String!
  email: String!
  age: Int                   # Nullable
  posts: [Post!]!            # Non-nullable array of non-nullable Posts
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!              # Relationship
  comments: [Comment!]!
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
}

# ========== INPUT TYPES ==========
input CreateUserInput {
  name: String!
  email: String!
  age: Int
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
}

# ========== QUERY TYPE (READ) ==========
type Query {
  user(id: ID!): User                        # Single user
  users(limit: Int, offset: Int): [User!]!   # List of users
  post(id: ID!): Post
  posts(authorId: ID): [Post!]!
  searchUsers(query: String!): [User!]!
}

# ========== MUTATION TYPE (WRITE) ==========
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createPost(title: String!, content: String!, authorId: ID!): Post!
}

# ========== SUBSCRIPTION TYPE (REAL-TIME) ==========
type Subscription {
  postCreated: Post!
  commentAdded(postId: ID!): Comment!
  userOnlineStatus(userId: ID!): Boolean!
}

# ========== ENUM ==========
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

# ========== INTERFACE ==========
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String!
}

# ========== UNION ==========
union SearchResult = User | Post | Comment
```

### Operations Syntax

```graphql
# ========== QUERY ==========
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      title
    }
  }
}

# Variables:
# { "id": "123" }

# ========== MUTATION ==========
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}

# Variables:
# { "input": { "name": "John", "email": "john@example.com" } }

# ========== SUBSCRIPTION ==========
subscription OnPostCreated {
  postCreated {
    id
    title
    author {
      name
    }
  }
}
```

---

# Level 2: Intermediate

## 2.1 Advanced Query Features

### Fragments - Reusable Selections

```graphql
# Define fragment
fragment UserFields on User {
  id
  name
  email
  avatar
}

fragment PostFields on Post {
  id
  title
  content
  createdAt
  author {
    ...UserFields
  }
}

# Use fragments
query GetPosts {
  posts {
    ...PostFields
    comments {
      id
      text
      author {
        ...UserFields
      }
    }
  }
}
```

### Aliases - Multiple Same Fields

```graphql
query GetTwoUsers {
  firstUser: user(id: "1") {
    name
    email
  }
  secondUser: user(id: "2") {
    name
    email
  }
}
```

### Directives - Conditional Fields

```graphql
query GetUser($id: ID!, $withPosts: Boolean!, $skipEmail: Boolean!) {
  user(id: $id) {
    name
    email @skip(if: $skipEmail)
    posts @include(if: $withPosts) {
      title
    }
  }
}

# Variables:
# { "id": "1", "withPosts": true, "skipEmail": false }
```

## 2.2 Apollo Client Setup

### Installation & Configuration

```javascript
// npm install @apollo/client graphql

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// HTTP link
const httpLink = createHttpLink({
  uri: "https://api.example.com/graphql"
});

// Auth link - add token to headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

// Create client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network"
    }
  }
});

// Provider
function App() {
  return (
    <ApolloProvider client={client}>
      <Router />
    </ApolloProvider>
  );
}
```

## 2.3 Queries with Apollo

### useQuery Hook

```javascript
import { useQuery, gql } from "@apollo/client";

const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      id
      name
      email
    }
  }
`;

function UserList() {
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_USERS, {
    variables: { limit: 10, offset: 0 },

    // Fetch policies
    fetchPolicy: "cache-and-network",

    // Polling
    pollInterval: 30000, // Every 30 seconds

    // Callbacks
    onCompleted: (data) => console.log("Done:", data),
    onError: (error) => console.error("Error:", error)
  });

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data.users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button
        onClick={() =>
          fetchMore({ variables: { offset: data.users.length } })
        }
      >
        Load More
      </button>
    </div>
  );
}
```

### useLazyQuery - Manual Execution

```javascript
import { useLazyQuery } from "@apollo/client";

function UserSearch() {
  const [searchUsers, { data, loading }] = useLazyQuery(SEARCH_USERS);
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    searchUsers({ variables: { query } });
  };

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch} disabled={loading}>
        Search
      </button>
      {data?.searchUsers.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Fetch Policies

```javascript
// cache-first (default)
// Check cache first, fetch if not found

// cache-and-network
// Return cache immediately, then fetch and update

// network-only
// Always fetch from network, update cache

// cache-only
// Only read from cache, never fetch

// no-cache
// Always fetch, don't update cache

useQuery(GET_USERS, {
  fetchPolicy: "cache-and-network",
  nextFetchPolicy: "cache-first" // For subsequent requests
});
```

## 2.4 Mutations with Apollo

### useMutation Hook

```javascript
import { useMutation, gql } from "@apollo/client";

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

function CreateUserForm() {
  const [createUser, { data, loading, error }] = useMutation(CREATE_USER, {
    // Update cache after mutation
    update(cache, { data: { createUser } }) {
      const { users } = cache.readQuery({ query: GET_USERS });
      cache.writeQuery({
        query: GET_USERS,
        data: { users: [...users, createUser] }
      });
    },

    // Or refetch queries
    refetchQueries: [{ query: GET_USERS }],

    // Optimistic response - instant UI update
    optimisticResponse: {
      createUser: {
        __typename: "User",
        id: "temp-id",
        name: formData.name,
        email: formData.email
      }
    },

    onCompleted: (data) => {
      console.log("Created:", data.createUser);
    }
  });

  const handleSubmit = async (formData) => {
    try {
      await createUser({ variables: { input: formData } });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

---

# Level 3: Advanced

## 3.1 Subscriptions

### WebSocket Setup

```javascript
import { split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

// WebSocket link
const wsLink = new GraphQLWsLink(
  createClient({
    url: "wss://api.example.com/graphql",
    connectionParams: {
      authToken: localStorage.getItem("token")
    }
  })
);

// Split: queries/mutations -> HTTP, subscriptions -> WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: authLink.concat(splitLink),
  cache: new InMemoryCache()
});
```

### useSubscription Hook

```javascript
import { useSubscription, gql } from "@apollo/client";

const POST_CREATED = gql`
  subscription OnPostCreated {
    postCreated {
      id
      title
      author {
        name
      }
    }
  }
`;

function NewPostNotification() {
  const { data, loading, error } = useSubscription(POST_CREATED, {
    onSubscriptionData: ({ subscriptionData }) => {
      toast.success(`New post: ${subscriptionData.data.postCreated.title}`);
    }
  });

  return data ? <NewPostBanner post={data.postCreated} /> : null;
}
```

### subscribeToMore - Update Query with Subscription

```javascript
function PostList() {
  const { data, subscribeToMore } = useQuery(GET_POSTS);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: POST_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newPost = subscriptionData.data.postCreated;
        return {
          ...prev,
          posts: [newPost, ...prev.posts]
        };
      }
    });

    return () => unsubscribe();
  }, [subscribeToMore]);

  return (
    <ul>
      {data?.posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 3.2 Cache Management

### Cache Configuration

```javascript
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      keyFields: ["id"], // Default, can customize
      fields: {
        // Computed field
        fullName: {
          read(_, { readField }) {
            const firstName = readField("firstName");
            const lastName = readField("lastName");
            return `${firstName} ${lastName}`;
          }
        }
      }
    },
    Query: {
      fields: {
        // Pagination merge
        posts: {
          keyArgs: ["authorId"], // Cache separately by author
          merge(existing = [], incoming, { args }) {
            if (args?.offset === 0) return incoming;
            return [...existing, ...incoming];
          }
        }
      }
    }
  }
});
```

### Manual Cache Updates

```javascript
// Evict item
cache.evict({ id: cache.identify(deletedUser) });
cache.gc(); // Garbage collect

// Modify fields
cache.modify({
  fields: {
    users(existingUsers = [], { readField }) {
      return existingUsers.filter(
        (ref) => readField("id", ref) !== deletedId
      );
    }
  }
});

// Write fragment
cache.writeFragment({
  id: cache.identify(updatedUser),
  fragment: gql`
    fragment UpdatedUser on User {
      name
      email
    }
  `,
  data: updatedUser
});
```

## 3.3 Error Handling

### Error Types

```javascript
function UserProfile({ id }) {
  const { data, error } = useQuery(GET_USER, {
    variables: { id },
    errorPolicy: "all" // none, ignore, all
  });

  if (error) {
    // Network error
    if (error.networkError) {
      return <p>Network error: {error.networkError.message}</p>;
    }

    // GraphQL errors (can have partial data)
    if (error.graphQLErrors) {
      return (
        <div>
          {error.graphQLErrors.map((err, i) => (
            <p key={i}>
              {err.message}
              {err.extensions?.code && ` (${err.extensions.code})`}
            </p>
          ))}
        </div>
      );
    }
  }

  return <div>{data?.user.name}</div>;
}
```

### Error Link

```javascript
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`GraphQL error: ${message}`);

      if (extensions?.code === "UNAUTHENTICATED") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache()
});
```

---

# Real-world Applications

## Authentication Flow

```javascript
// Login mutation
const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

function LoginForm() {
  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: ({ login: { token, user } }) => {
      localStorage.setItem("token", token);
      // Update cache with current user
      client.writeQuery({
        query: GET_CURRENT_USER,
        data: { me: user }
      });
    }
  });

  const handleSubmit = async (data) => {
    try {
      await login({ variables: data });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };
}
```

## Chat Application

```javascript
// Messages with subscription
const MESSAGES_QUERY = gql`
  query Messages($chatId: ID!) {
    messages(chatId: $chatId) {
      id
      text
      sender { id name avatar }
      createdAt
    }
  }
`;

const MESSAGE_ADDED = gql`
  subscription MessageAdded($chatId: ID!) {
    messageAdded(chatId: $chatId) {
      id
      text
      sender { id name avatar }
      createdAt
    }
  }
`;

function ChatRoom({ chatId }) {
  const { data, subscribeToMore } = useQuery(MESSAGES_QUERY, {
    variables: { chatId }
  });

  useEffect(() => {
    return subscribeToMore({
      document: MESSAGE_ADDED,
      variables: { chatId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          ...prev,
          messages: [...prev.messages, subscriptionData.data.messageAdded]
        };
      }
    });
  }, [chatId, subscribeToMore]);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    optimisticResponse: ({ text }) => ({
      sendMessage: {
        __typename: "Message",
        id: "temp-" + Date.now(),
        text,
        sender: currentUser,
        createdAt: new Date().toISOString()
      }
    })
  });

  return (
    <div>
      <MessageList messages={data?.messages} />
      <MessageInput onSend={(text) => sendMessage({ variables: { chatId, text } })} />
    </div>
  );
}
```

## E-commerce with Fragments

```javascript
// Fragments for consistency
const PRODUCT_FIELDS = gql`
  fragment ProductFields on Product {
    id
    name
    price
    image
    stock
  }
`;

const CART_ITEM_FIELDS = gql`
  fragment CartItemFields on CartItem {
    id
    quantity
    product {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

// Queries use fragments
const GET_CART = gql`
  query GetCart {
    cart {
      id
      items {
        ...CartItemFields
      }
      total
    }
  }
  ${CART_ITEM_FIELDS}
`;

// Mutations update cache
const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      ...CartItemFields
    }
  }
  ${CART_ITEM_FIELDS}
`;
```

---

# Interview Questions

## Basic Level

1. **GraphQL vs REST?**
   - GraphQL: single endpoint, exact data, no over/under-fetching
   - REST: multiple endpoints, fixed responses, versioning

2. **Query vs Mutation vs Subscription?**
   - Query: read data (like GET)
   - Mutation: modify data (like POST/PUT/DELETE)
   - Subscription: real-time updates (WebSocket)

3. **! trong schema nghĩa là gì?**
   - Non-nullable field
   - `String!` = required string
   - `[Post!]!` = required array of required posts

4. **Input types?**
   - Special types for mutation arguments
   - Cannot have fields with arguments
   - Reusable across mutations

## Intermediate Level

5. **Apollo Cache hoạt động như thế nào?**
   - Normalized cache by `__typename + id`
   - Automatic updates khi cùng id
   - Manual updates với update, modify, evict

6. **Fetch policies?**
   - cache-first: cache → network if miss
   - cache-and-network: cache immediately, then network
   - network-only: always network
   - cache-only: only cache

7. **Optimistic updates?**
   - Show expected result immediately
   - Rollback if server fails
   - Better UX for mutations

8. **Fragments là gì?**
   - Reusable query selections
   - DRY principle
   - Colocation với components

## Advanced Level

9. **N+1 problem trong GraphQL?**
   - Nested queries cause multiple DB calls
   - Solution: DataLoader for batching requests

10. **Subscriptions khi nào dùng?**
    - Real-time updates: chat, notifications
    - Live data: stock prices, sports scores
    - Collaborative editing

11. **Error handling strategies?**
    - errorPolicy: all để get partial data
    - Error link for global handling
    - GraphQL errors vs network errors

12. **Schema stitching vs Federation?**
    - Stitching: combine schemas at gateway
    - Federation: distributed, each service owns schema
    - Federation is more scalable

