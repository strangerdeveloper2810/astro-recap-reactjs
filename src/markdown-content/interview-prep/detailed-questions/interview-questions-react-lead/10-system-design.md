# 10 - System Design & Scalability

> **8 câu hỏi chuyên sâu về System Design cho React Applications**

---

## Q10.1: Design E-commerce Product Listing Page

### Câu hỏi
Design một Product Listing Page có thể handle 100,000+ products với filtering, sorting, và infinite scroll.

### Trả lời

#### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           E-COMMERCE PRODUCT LISTING ARCHITECTURE           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    CLIENT (React)                    │   │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │   │
│   │  │ Filters │  │ Sort    │  │ Product │  │ Scroll │ │   │
│   │  │ Panel   │  │ Control │  │ Grid    │  │ Loader │ │   │
│   │  └────┬────┘  └────┬────┘  └────┬────┘  └───┬────┘ │   │
│   │       │            │            │           │       │   │
│   │       └────────────┴────────────┴───────────┘       │   │
│   │                          │                          │   │
│   │                    ┌─────┴─────┐                    │   │
│   │                    │  URL State │                   │   │
│   │                    │ (filters)  │                   │   │
│   │                    └─────┬─────┘                    │   │
│   └──────────────────────────┼──────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│   ┌──────────────────────────────────────────────────────┐  │
│   │                    API Gateway                        │  │
│   │              (Rate Limiting, Caching)                 │  │
│   └─────────────────────────┬────────────────────────────┘  │
│                              │                               │
│            ┌─────────────────┴─────────────────┐            │
│            │                                   │            │
│            ▼                                   ▼            │
│   ┌─────────────────┐               ┌─────────────────┐    │
│   │  Product API    │               │  Search Service │    │
│   │  (PostgreSQL)   │               │ (Elasticsearch) │    │
│   └─────────────────┘               └─────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Frontend Implementation

```typescript
// types/product.ts
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tags: string[];
}

interface ProductFilters {
  category?: string[];
  brand?: string[];
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
}

interface ProductSort {
  field: 'price' | 'rating' | 'newest' | 'popularity';
  order: 'asc' | 'desc';
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  hasMore: boolean;
  facets: {
    categories: { name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
  };
}

// hooks/useProductsQuery.ts
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 24;

export function useProductsQuery(filters: ProductFilters, sort: ProductSort) {
  return useInfiniteQuery({
    queryKey: ['products', filters, sort],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: PAGE_SIZE.toString(),
        sortField: sort.field,
        sortOrder: sort.order,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined)
        )
      });

      const response = await fetch(`/api/products?${params}`);
      return response.json() as Promise<ProductsResponse>;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });
}

// hooks/useURLFilters.ts
import { useSearchParams } from 'react-router-dom';

export function useURLFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: ProductFilters = useMemo(() => ({
    category: searchParams.getAll('category'),
    brand: searchParams.getAll('brand'),
    priceMin: searchParams.get('priceMin')
      ? Number(searchParams.get('priceMin'))
      : undefined,
    priceMax: searchParams.get('priceMax')
      ? Number(searchParams.get('priceMax'))
      : undefined,
    rating: searchParams.get('rating')
      ? Number(searchParams.get('rating'))
      : undefined,
    inStock: searchParams.get('inStock') === 'true',
    search: searchParams.get('q') || undefined
  }), [searchParams]);

  const sort: ProductSort = useMemo(() => ({
    field: (searchParams.get('sortField') || 'popularity') as ProductSort['field'],
    order: (searchParams.get('sortOrder') || 'desc') as ProductSort['order']
  }), [searchParams]);

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);

      Object.entries(newFilters).forEach(([key, value]) => {
        params.delete(key);
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else if (value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      });

      return params;
    });
  }, [setSearchParams]);

  const updateSort = useCallback((newSort: ProductSort) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('sortField', newSort.field);
      params.set('sortOrder', newSort.order);
      return params;
    });
  }, [setSearchParams]);

  return { filters, sort, updateFilters, updateSort };
}

// components/ProductListingPage.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function ProductListingPage() {
  const { filters, sort, updateFilters, updateSort } = useURLFilters();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useProductsQuery(filters, sort);

  const allProducts = useMemo(
    () => data?.pages.flatMap(page => page.products) ?? [],
    [data]
  );

  const facets = data?.pages[0]?.facets;

  // Infinite scroll with intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="product-listing">
      <aside className="filters-sidebar">
        <FilterPanel
          filters={filters}
          facets={facets}
          onChange={updateFilters}
        />
      </aside>

      <main className="products-main">
        <header className="products-header">
          <span>{data?.pages[0]?.total ?? 0} products</span>
          <SortControl sort={sort} onChange={updateSort} />
        </header>

        {isLoading ? (
          <ProductGridSkeleton count={12} />
        ) : (
          <>
            <ProductGrid products={allProducts} />

            <div ref={loadMoreRef} className="load-more-trigger">
              {isFetchingNextPage && <Spinner />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// components/ProductGrid.tsx with virtualization
export function ProductGrid({ products }: { products: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate columns based on container width
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = parentRef.current?.offsetWidth ?? 1200;
      if (width < 640) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const rows = Math.ceil(products.length / columns);

  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated row height
    overscan: 3
  });

  return (
    <div ref={parentRef} className="product-grid-container">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => {
          const startIndex = virtualRow.index * columns;
          const rowProducts = products.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              className="product-grid-row"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              {rowProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// components/ProductCard.tsx - Optimized
const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`}>
        <div className="product-image">
          {!imageLoaded && <Skeleton />}
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
          {product.originalPrice && (
            <span className="discount-badge">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="brand">{product.brand}</p>

          <div className="rating">
            <Stars rating={product.rating} />
            <span>({product.reviewCount})</span>
          </div>

          <div className="price">
            <span className="current">${product.price}</span>
            {product.originalPrice && (
              <span className="original">${product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>

      <button
        className="add-to-cart"
        disabled={!product.inStock}
        onClick={(e) => {
          e.preventDefault();
          // Add to cart logic
        }}
      >
        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </article>
  );
});
```

#### Performance Optimizations

```typescript
// Prefetching on hover
function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient();

  const prefetchProductDetails = () => {
    queryClient.prefetchQuery({
      queryKey: ['product', product.id],
      queryFn: () => fetchProductDetails(product.id),
      staleTime: 5 * 60 * 1000
    });
  };

  return (
    <Link
      to={`/products/${product.id}`}
      onMouseEnter={prefetchProductDetails}
      onFocus={prefetchProductDetails}
    >
      {/* ... */}
    </Link>
  );
}

// Image optimization with srcset
function ProductImage({ images, alt }: { images: string[]; alt: string }) {
  return (
    <picture>
      <source
        media="(min-width: 1024px)"
        srcSet={`${images[0]}?w=400 1x, ${images[0]}?w=800 2x`}
      />
      <source
        media="(min-width: 640px)"
        srcSet={`${images[0]}?w=300 1x, ${images[0]}?w=600 2x`}
      />
      <img
        src={`${images[0]}?w=200`}
        srcSet={`${images[0]}?w=200 1x, ${images[0]}?w=400 2x`}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
```

---

## Q10.2: Design Real-time Chat Application

### Câu hỏi
Design một real-time chat application với typing indicators, read receipts, và offline support.

### Trả lời

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              REAL-TIME CHAT ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    CLIENT (React)                    │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│   │  │ Messages │ │ Typing   │ │ Presence │ │ Offline│ │   │
│   │  │ List     │ │Indicator │ │ Status   │ │ Queue  │ │   │
│   │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │   │
│   │       │            │            │           │       │   │
│   │       └────────────┴────────────┴───────────┘       │   │
│   │                          │                          │   │
│   │                    ┌─────┴─────┐                    │   │
│   │                    │ WebSocket │                    │   │
│   │                    │   Client  │                    │   │
│   │                    └─────┬─────┘                    │   │
│   └──────────────────────────┼──────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              WebSocket Gateway (Socket.io)            │  │
│   │        (Connection Management, Room Management)       │  │
│   └───────────────────────────┬──────────────────────────┘  │
│                               │                              │
│         ┌─────────────────────┴─────────────────────┐       │
│         │                     │                     │       │
│         ▼                     ▼                     ▼       │
│   ┌───────────┐       ┌───────────┐         ┌───────────┐  │
│   │  Message  │       │   Redis   │         │  MongoDB  │  │
│   │   Queue   │       │  Pub/Sub  │         │ (Storage) │  │
│   └───────────┘       └───────────┘         └───────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### WebSocket Hook Implementation

```typescript
// hooks/useWebSocket.ts
interface WebSocketMessage {
  type: string;
  payload: unknown;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  reconnect = true,
  reconnectInterval = 3000
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionState('connecting');
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      setConnectionState('connected');
      onConnect?.();
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      setConnectionState('disconnected');
      onDisconnect?.();

      if (reconnect) {
        setConnectionState('reconnecting');
        reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [url, onMessage, onConnect, onDisconnect, reconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, connectionState, send, disconnect, reconnect: connect };
}

// hooks/useChat.ts
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: Date;
  readBy: string[];
}

interface TypingUser {
  id: string;
  name: string;
}

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const offlineQueueRef = useRef<Message[]>([]);

  const { isConnected, send } = useWebSocket({
    url: `wss://api.example.com/chat?conversation=${conversationId}`,
    onMessage: (message) => {
      switch (message.type) {
        case 'message':
          handleNewMessage(message.payload as Message);
          break;
        case 'typing':
          handleTyping(message.payload as { userId: string; isTyping: boolean });
          break;
        case 'read':
          handleReadReceipt(message.payload as { messageIds: string[]; userId: string });
          break;
        case 'delivered':
          handleDeliveryReceipt(message.payload as { messageIds: string[] });
          break;
      }
    },
    onConnect: () => {
      // Flush offline queue
      offlineQueueRef.current.forEach(msg => {
        send({ type: 'message', payload: msg });
      });
      offlineQueueRef.current = [];
    }
  });

  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Check for duplicate (optimistic update)
      const exists = prev.some(m => m.id === message.id);
      if (exists) {
        return prev.map(m => m.id === message.id ? message : m);
      }
      return [...prev, message];
    });

    // Mark as delivered
    if (message.senderId !== currentUserId) {
      send({ type: 'delivered', payload: { messageIds: [message.id] } });
    }
  }, [send]);

  const handleTyping = useCallback(({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
    setTypingUsers(prev => {
      if (isTyping) {
        const exists = prev.some(u => u.id === userId);
        if (!exists) {
          return [...prev, { id: userId, name: getUserName(userId) }];
        }
      } else {
        return prev.filter(u => u.id !== userId);
      }
      return prev;
    });
  }, []);

  const handleReadReceipt = useCallback(({ messageIds, userId }: { messageIds: string[]; userId: string }) => {
    setMessages(prev =>
      prev.map(msg =>
        messageIds.includes(msg.id)
          ? { ...msg, readBy: [...msg.readBy, userId], status: 'read' }
          : msg
      )
    );
  }, []);

  const sendMessage = useCallback((content: string, type: 'text' | 'image' | 'file' = 'text') => {
    const message: Message = {
      id: crypto.randomUUID(),
      conversationId,
      senderId: currentUserId,
      content,
      type,
      status: 'sending',
      createdAt: new Date(),
      readBy: []
    };

    // Optimistic update
    setMessages(prev => [...prev, message]);

    if (isConnected) {
      send({ type: 'message', payload: message });
    } else {
      // Queue for later
      offlineQueueRef.current.push(message);
    }
  }, [conversationId, isConnected, send]);

  // Typing indicator with debounce
  const sendTypingIndicator = useMemo(() => {
    let timeout: NodeJS.Timeout;

    return () => {
      send({ type: 'typing', payload: { isTyping: true } });

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        send({ type: 'typing', payload: { isTyping: false } });
      }, 2000);
    };
  }, [send]);

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    send({ type: 'read', payload: { messageIds } });
  }, [send]);

  // Load history
  useEffect(() => {
    async function loadHistory() {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        const history = await response.json();
        setMessages(history);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadHistory();
  }, [conversationId]);

  return {
    messages,
    typingUsers,
    isLoadingHistory,
    isConnected,
    sendMessage,
    sendTypingIndicator,
    markAsRead
  };
}
```

#### Chat UI Components

```typescript
// components/ChatWindow.tsx
export function ChatWindow({ conversationId }: { conversationId: string }) {
  const {
    messages,
    typingUsers,
    isLoadingHistory,
    isConnected,
    sendMessage,
    sendTypingIndicator,
    markAsRead
  } = useChat(conversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark visible messages as read
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleMessageIds = entries
          .filter(e => e.isIntersecting)
          .map(e => e.target.getAttribute('data-message-id'))
          .filter(Boolean) as string[];

        if (visibleMessageIds.length > 0) {
          markAsRead(visibleMessageIds);
        }
      },
      { threshold: 0.5 }
    );

    return () => observerRef.current?.disconnect();
  }, [markAsRead]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    sendTypingIndicator();
  };

  return (
    <div className="chat-window">
      <header className="chat-header">
        <ConnectionStatus isConnected={isConnected} />
      </header>

      <div className="messages-container">
        {isLoadingHistory ? (
          <MessagesSkeleton />
        ) : (
          <>
            {messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                observerRef={observerRef}
              />
            ))}

            {typingUsers.length > 0 && (
              <TypingIndicator users={typingUsers} />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="message-input">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!inputValue.trim() || !isConnected}>
          Send
        </button>
      </form>
    </div>
  );
}

// components/MessageBubble.tsx
const MessageBubble = memo(function MessageBubble({
  message,
  observerRef
}: {
  message: Message;
  observerRef: React.RefObject<IntersectionObserver>;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const isOwn = message.senderId === currentUserId;

  useEffect(() => {
    const el = bubbleRef.current;
    if (el && observerRef.current) {
      observerRef.current.observe(el);
      return () => observerRef.current?.unobserve(el);
    }
  }, [observerRef]);

  return (
    <div
      ref={bubbleRef}
      data-message-id={message.id}
      className={`message-bubble ${isOwn ? 'own' : 'other'}`}
    >
      <p>{message.content}</p>
      <div className="message-meta">
        <time>{formatTime(message.createdAt)}</time>
        {isOwn && <MessageStatus status={message.status} />}
      </div>
    </div>
  );
});

// components/TypingIndicator.tsx
function TypingIndicator({ users }: { users: TypingUser[] }) {
  const text = users.length === 1
    ? `${users[0].name} is typing...`
    : users.length === 2
    ? `${users[0].name} and ${users[1].name} are typing...`
    : `${users.length} people are typing...`;

  return (
    <div className="typing-indicator">
      <span className="typing-dots">
        <span />
        <span />
        <span />
      </span>
      <span className="typing-text">{text}</span>
    </div>
  );
}
```

---

## Q10.3: Design Dashboard với Real-time Data

### Câu hỏi
Design một analytics dashboard với real-time updates, multiple data sources, và customizable widgets.

### Trả lời

```typescript
// Dashboard architecture with modular widgets
interface Widget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'map';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
  refreshInterval?: number;
  position: { x: number; y: number; w: number; h: number };
}

interface DashboardConfig {
  id: string;
  name: string;
  widgets: Widget[];
  layout: 'grid' | 'freeform';
  refreshInterval: number;
}

// hooks/useDashboard.ts
export function useDashboard(dashboardId: string) {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load dashboard config
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: () => fetchDashboard(dashboardId)
  });

  // Real-time updates subscription
  useEffect(() => {
    if (!dashboard) return;

    const subscriptions = dashboard.widgets
      .filter(w => w.refreshInterval)
      .map(widget => {
        return subscribeToDataSource(widget.dataSource, (data) => {
          // Update widget data
        });
      });

    return () => {
      subscriptions.forEach(unsub => unsub());
    };
  }, [dashboard]);

  const updateLayout = useCallback((newLayout: Widget['position'][]) => {
    setConfig(prev => prev ? {
      ...prev,
      widgets: prev.widgets.map((w, i) => ({
        ...w,
        position: newLayout[i]
      }))
    } : null);
  }, []);

  const addWidget = useCallback((widget: Omit<Widget, 'id'>) => {
    setConfig(prev => prev ? {
      ...prev,
      widgets: [
        ...prev.widgets,
        { ...widget, id: crypto.randomUUID() }
      ]
    } : null);
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setConfig(prev => prev ? {
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    } : null);
  }, []);

  return {
    config,
    isEditing,
    setIsEditing,
    updateLayout,
    addWidget,
    removeWidget
  };
}

// components/Dashboard.tsx
import GridLayout from 'react-grid-layout';

export function Dashboard({ dashboardId }: { dashboardId: string }) {
  const {
    config,
    isEditing,
    setIsEditing,
    updateLayout,
    addWidget,
    removeWidget
  } = useDashboard(dashboardId);

  if (!config) return <DashboardSkeleton />;

  const layout = config.widgets.map(w => ({
    i: w.id,
    ...w.position
  }));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{config.name}</h1>
        <div className="dashboard-actions">
          <button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Done' : 'Edit'}
          </button>
          {isEditing && (
            <WidgetPicker onSelect={addWidget} />
          )}
        </div>
      </header>

      <GridLayout
        className="dashboard-grid"
        layout={layout}
        cols={12}
        rowHeight={100}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={(newLayout) => {
          updateLayout(newLayout.map(l => ({
            x: l.x,
            y: l.y,
            w: l.w,
            h: l.h
          })));
        }}
      >
        {config.widgets.map(widget => (
          <div key={widget.id} className="widget-container">
            <WidgetRenderer
              widget={widget}
              isEditing={isEditing}
              onRemove={() => removeWidget(widget.id)}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
}

// components/WidgetRenderer.tsx
const widgetComponents: Record<Widget['type'], React.ComponentType<{ widget: Widget }>> = {
  chart: ChartWidget,
  metric: MetricWidget,
  table: TableWidget,
  map: MapWidget
};

function WidgetRenderer({
  widget,
  isEditing,
  onRemove
}: {
  widget: Widget;
  isEditing: boolean;
  onRemove: () => void;
}) {
  const Component = widgetComponents[widget.type];

  return (
    <div className="widget">
      <header className="widget-header">
        <h3>{widget.title}</h3>
        {isEditing && (
          <button onClick={onRemove} aria-label="Remove widget">
            ×
          </button>
        )}
      </header>
      <div className="widget-content">
        <Suspense fallback={<WidgetSkeleton />}>
          <ErrorBoundary fallback={<WidgetError />}>
            <Component widget={widget} />
          </ErrorBoundary>
        </Suspense>
      </div>
    </div>
  );
}

// components/widgets/ChartWidget.tsx
function ChartWidget({ widget }: { widget: Widget }) {
  const { data, isLoading, error } = useWidgetData(widget);

  if (isLoading) return <ChartSkeleton />;
  if (error) return <ChartError error={error} />;

  const chartType = widget.config.chartType as 'line' | 'bar' | 'pie';

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === 'line' && (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      )}
      {chartType === 'bar' && (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      )}
      {chartType === 'pie' && (
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          />
          <Tooltip />
        </PieChart>
      )}
    </ResponsiveContainer>
  );
}

// hooks/useWidgetData.ts with real-time updates
function useWidgetData(widget: Widget) {
  const queryClient = useQueryClient();

  // Initial data fetch
  const query = useQuery({
    queryKey: ['widget-data', widget.id, widget.dataSource],
    queryFn: () => fetchWidgetData(widget.dataSource, widget.config),
    refetchInterval: widget.refreshInterval
  });

  // Real-time updates via SSE
  useEffect(() => {
    if (!widget.config.realtime) return;

    const eventSource = new EventSource(
      `/api/data-stream/${widget.dataSource}`
    );

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      queryClient.setQueryData(
        ['widget-data', widget.id, widget.dataSource],
        (old: unknown[]) => [...(old || []).slice(-99), newData]
      );
    };

    return () => eventSource.close();
  }, [widget, queryClient]);

  return query;
}
```

---

## Q10.4: Design Form Builder Application

### Câu hỏi
Design một drag-and-drop form builder cho phép users create custom forms.

### Trả lời

```typescript
// Form builder types
interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'file';
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: { label: string; value: string }[]; // For select, radio, checkbox
  defaultValue?: unknown;
}

interface FormConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: {
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
  };
}

// Form Builder Context
interface FormBuilderContextType {
  config: FormConfig;
  selectedFieldId: string | null;
  selectField: (id: string | null) => void;
  addField: (type: FormField['type']) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  duplicateField: (id: string) => void;
}

const FormBuilderContext = createContext<FormBuilderContextType | null>(null);

// Form Builder Provider
export function FormBuilderProvider({ children, initialConfig }: {
  children: ReactNode;
  initialConfig?: FormConfig;
}) {
  const [config, setConfig] = useState<FormConfig>(initialConfig || {
    id: crypto.randomUUID(),
    title: 'Untitled Form',
    fields: [],
    settings: {
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!'
    }
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const addField = useCallback((type: FormField['type']) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: getDefaultLabel(type),
      name: `field_${Date.now()}`,
      required: false
    };

    if (['select', 'radio', 'checkbox'].includes(type)) {
      newField.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ];
    }

    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setSelectedFieldId(newField.id);
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f =>
        f.id === id ? { ...f, ...updates } : f
      )
    }));
  }, []);

  const removeField = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== id)
    }));
    setSelectedFieldId(null);
  }, []);

  const reorderFields = useCallback((startIndex: number, endIndex: number) => {
    setConfig(prev => {
      const fields = [...prev.fields];
      const [removed] = fields.splice(startIndex, 1);
      fields.splice(endIndex, 0, removed);
      return { ...prev, fields };
    });
  }, []);

  const duplicateField = useCallback((id: string) => {
    setConfig(prev => {
      const field = prev.fields.find(f => f.id === id);
      if (!field) return prev;

      const newField = {
        ...field,
        id: crypto.randomUUID(),
        name: `${field.name}_copy`
      };

      const index = prev.fields.findIndex(f => f.id === id);
      const fields = [...prev.fields];
      fields.splice(index + 1, 0, newField);

      return { ...prev, fields };
    });
  }, []);

  const value = {
    config,
    selectedFieldId,
    selectField: setSelectedFieldId,
    addField,
    updateField,
    removeField,
    reorderFields,
    duplicateField
  };

  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
}

// components/FormBuilder.tsx
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function FormBuilder() {
  const { config, reorderFields } = useFormBuilder();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderFields(result.source.index, result.destination.index);
  };

  return (
    <div className="form-builder">
      <aside className="field-palette">
        <h3>Fields</h3>
        <FieldPalette />
      </aside>

      <main className="form-canvas">
        <div className="form-header">
          <EditableTitle />
          <EditableDescription />
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="form-fields">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="fields-list"
              >
                {config.fields.map((field, index) => (
                  <Draggable
                    key={field.id}
                    draggableId={field.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`field-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="drag-handle"
                        >
                          ⋮⋮
                        </div>
                        <FieldPreview field={field} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {config.fields.length === 0 && (
                  <EmptyState message="Drag fields here to build your form" />
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      <aside className="field-settings">
        <FieldSettingsPanel />
      </aside>
    </div>
  );
}

// components/FieldPalette.tsx
const fieldTypes: { type: FormField['type']; label: string; icon: ReactNode }[] = [
  { type: 'text', label: 'Text', icon: <TextIcon /> },
  { type: 'email', label: 'Email', icon: <EmailIcon /> },
  { type: 'number', label: 'Number', icon: <NumberIcon /> },
  { type: 'textarea', label: 'Long Text', icon: <TextareaIcon /> },
  { type: 'select', label: 'Dropdown', icon: <SelectIcon /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckboxIcon /> },
  { type: 'radio', label: 'Radio', icon: <RadioIcon /> },
  { type: 'date', label: 'Date', icon: <DateIcon /> },
  { type: 'file', label: 'File Upload', icon: <FileIcon /> }
];

function FieldPalette() {
  const { addField } = useFormBuilder();

  return (
    <div className="field-palette-list">
      {fieldTypes.map(({ type, label, icon }) => (
        <button
          key={type}
          className="field-type-button"
          onClick={() => addField(type)}
          draggable
          onDragEnd={() => addField(type)}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// Generated form renderer
function FormRenderer({ config }: { config: FormConfig }) {
  const form = useForm();

  const onSubmit = async (data: Record<string, unknown>) => {
    await submitFormData(config.id, data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <h1>{config.title}</h1>
      {config.description && <p>{config.description}</p>}

      {config.fields.map(field => (
        <DynamicField
          key={field.id}
          field={field}
          register={form.register}
          errors={form.formState.errors}
        />
      ))}

      <button type="submit">
        {config.settings.submitButtonText}
      </button>
    </form>
  );
}
```

---

## Q10.5: Design Multi-tenant SaaS Application

### Câu hỏi
Design frontend architecture cho multi-tenant SaaS application với customizable themes và features per tenant.

### Trả lời

```typescript
// Tenant context and configuration
interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
    fontFamily: string;
  };
  features: {
    analytics: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    sso: boolean;
    advancedReporting: boolean;
  };
  limits: {
    maxUsers: number;
    maxProjects: number;
    storageGB: number;
  };
  settings: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

// Tenant detection and loading
async function detectTenant(): Promise<string> {
  // Option 1: Subdomain
  const subdomain = window.location.hostname.split('.')[0];
  if (subdomain !== 'www' && subdomain !== 'app') {
    return subdomain;
  }

  // Option 2: Path-based
  const pathTenant = window.location.pathname.split('/')[1];
  if (pathTenant && pathTenant !== 'app') {
    return pathTenant;
  }

  // Option 3: Custom domain lookup
  const response = await fetch('/api/tenant/lookup', {
    method: 'POST',
    body: JSON.stringify({ domain: window.location.hostname })
  });
  const { tenantId } = await response.json();
  return tenantId;
}

// Tenant Provider
const TenantContext = createContext<{
  tenant: TenantConfig | null;
  isLoading: boolean;
  error: Error | null;
} | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTenant() {
      try {
        const tenantId = await detectTenant();
        const response = await fetch(`/api/tenants/${tenantId}/config`);

        if (!response.ok) {
          throw new Error('Tenant not found');
        }

        const config = await response.json();
        setTenant(config);

        // Apply theme
        applyTheme(config.theme);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTenant();
  }, []);

  if (isLoading) {
    return <TenantLoadingScreen />;
  }

  if (error) {
    return <TenantErrorScreen error={error} />;
  }

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

// Theme application
function applyTheme(theme: TenantConfig['theme']) {
  const root = document.documentElement;

  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-secondary', theme.secondaryColor);
  root.style.setProperty('--font-family', theme.fontFamily);

  // Update favicon
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) {
    favicon.href = theme.favicon;
  }

  // Update title
  document.title = theme.logo ? '' : document.title;
}

// Feature flag hook
export function useFeature(featureName: keyof TenantConfig['features']): boolean {
  const { tenant } = useTenant();
  return tenant?.features[featureName] ?? false;
}

// Feature gate component
export function FeatureGate({
  feature,
  children,
  fallback = null
}: {
  feature: keyof TenantConfig['features'];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const isEnabled = useFeature(feature);
  return <>{isEnabled ? children : fallback}</>;
}

// Usage in app
function App() {
  return (
    <TenantProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />

            {/* Feature-gated routes */}
            <Route
              path="/analytics"
              element={
                <FeatureGate feature="analytics" fallback={<UpgradePage />}>
                  <Analytics />
                </FeatureGate>
              }
            />

            <Route
              path="/api"
              element={
                <FeatureGate feature="apiAccess" fallback={<UpgradePage />}>
                  <ApiDocs />
                </FeatureGate>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </TenantProvider>
  );
}

// Tenant-aware API client
export function createTenantApiClient() {
  const { tenant } = useTenant();

  return {
    async fetch(path: string, options?: RequestInit) {
      return fetch(`/api/v1${path}`, {
        ...options,
        headers: {
          ...options?.headers,
          'X-Tenant-ID': tenant?.id || '',
          'Content-Type': 'application/json'
        }
      });
    }
  };
}
```

---

## Q10.6: Design Collaborative Document Editor

### Câu hỏi
Design a Google Docs-like collaborative editor với real-time sync.

### Trả lời

```typescript
// Using Yjs for CRDT-based collaboration
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useState } from 'react';

// Document types
interface DocumentMeta {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  collaborators: {
    userId: string;
    permission: 'view' | 'edit' | 'admin';
  }[];
}

// Collaborative document hook
export function useCollaborativeDocument(documentId: string) {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    const wsProvider = new WebsocketProvider(
      'wss://collaboration.example.com',
      documentId,
      ydoc
    );

    wsProvider.on('status', ({ status }: { status: string }) => {
      setIsConnected(status === 'connected');
    });

    // Awareness for cursor positions
    wsProvider.awareness.on('change', () => {
      const states = Array.from(wsProvider.awareness.getStates().entries());
      const users = states
        .filter(([clientId]) => clientId !== ydoc.clientID)
        .map(([_, state]) => state.user as Collaborator);
      setCollaborators(users);
    });

    // Set local user info
    wsProvider.awareness.setLocalStateField('user', {
      id: currentUser.id,
      name: currentUser.name,
      color: generateUserColor(currentUser.id)
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
    };
  }, [documentId, ydoc]);

  // Get shared types
  const yContent = ydoc.getXmlFragment('content');
  const yTitle = ydoc.getText('title');

  return {
    ydoc,
    yContent,
    yTitle,
    provider,
    isConnected,
    collaborators
  };
}

// Rich text editor component using Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import StarterKit from '@tiptap/starter-kit';

function CollaborativeEditor({ documentId }: { documentId: string }) {
  const {
    ydoc,
    yContent,
    provider,
    isConnected,
    collaborators
  } = useCollaborativeDocument(documentId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false // Disable default history, Yjs handles it
      }),
      Collaboration.configure({
        document: ydoc,
        field: 'content'
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: currentUser.name,
          color: generateUserColor(currentUser.id)
        }
      })
    ]
  }, [ydoc, provider]);

  return (
    <div className="collaborative-editor">
      <header className="editor-header">
        <EditableTitle ydoc={ydoc} />
        <div className="collaborators">
          {collaborators.map(user => (
            <Avatar
              key={user.id}
              name={user.name}
              style={{ borderColor: user.color }}
            />
          ))}
        </div>
        <ConnectionStatus isConnected={isConnected} />
      </header>

      <Toolbar editor={editor} />

      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

// Editable title with Yjs binding
function EditableTitle({ ydoc }: { ydoc: Y.Doc }) {
  const [title, setTitle] = useState('');
  const yTitle = ydoc.getText('title');

  useEffect(() => {
    setTitle(yTitle.toString());

    const observer = () => {
      setTitle(yTitle.toString());
    };

    yTitle.observe(observer);
    return () => yTitle.unobserve(observer);
  }, [yTitle]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    ydoc.transact(() => {
      yTitle.delete(0, yTitle.length);
      yTitle.insert(0, newTitle);
    });
  };

  return (
    <input
      type="text"
      value={title}
      onChange={handleChange}
      className="document-title"
      placeholder="Untitled Document"
    />
  );
}

// Toolbar component
function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="editor-toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'active' : ''}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'active' : ''}
      >
        Bullet List
      </button>
      <button onClick={() => editor.chain().focus().undo().run()}>
        Undo
      </button>
      <button onClick={() => editor.chain().focus().redo().run()}>
        Redo
      </button>
    </div>
  );
}
```

---

## Q10.7: Design Image Gallery với Advanced Features

### Câu hỏi
Design image gallery với lazy loading, virtualization, zoom, và lightbox.

### Trả lời

```typescript
// Image gallery with advanced features
interface GalleryImage {
  id: string;
  src: string;
  thumbnail: string;
  width: number;
  height: number;
  alt: string;
  blurhash?: string;
}

// Masonry layout hook
function useMasonryLayout(images: GalleryImage[], columnCount: number) {
  return useMemo(() => {
    const columns: GalleryImage[][] = Array.from(
      { length: columnCount },
      () => []
    );
    const heights = new Array(columnCount).fill(0);

    images.forEach(image => {
      // Find shortest column
      const shortestColumn = heights.indexOf(Math.min(...heights));

      columns[shortestColumn].push(image);
      heights[shortestColumn] += image.height / image.width;
    });

    return columns;
  }, [images, columnCount]);
}

// Gallery component
export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [columnCount, setColumnCount] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => {
      const width = containerRef.current?.offsetWidth ?? 1200;
      if (width < 640) setColumnCount(2);
      else if (width < 1024) setColumnCount(3);
      else setColumnCount(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const columns = useMasonryLayout(images, columnCount);

  return (
    <div ref={containerRef} className="image-gallery">
      <div className="masonry-grid" style={{ '--columns': columnCount } as React.CSSProperties}>
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="masonry-column">
            {column.map((image) => {
              const globalIndex = images.findIndex(img => img.id === image.id);
              return (
                <GalleryImage
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedIndex(globalIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </div>
  );
}

// Lazy loading image with blurhash placeholder
function GalleryImage({
  image,
  onClick
}: {
  image: GalleryImage;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const aspectRatio = image.height / image.width;

  return (
    <div
      className="gallery-image"
      style={{ paddingBottom: `${aspectRatio * 100}%` }}
      onClick={onClick}
    >
      {/* Blurhash placeholder */}
      {image.blurhash && !isLoaded && (
        <BlurhashCanvas
          hash={image.blurhash}
          width={32}
          height={Math.round(32 * aspectRatio)}
          className="blurhash-placeholder"
        />
      )}

      <img
        ref={imgRef}
        src={isInView ? image.thumbnail : undefined}
        alt={image.alt}
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0 }}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

// Lightbox with zoom and pan
function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const currentImage = images[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onNavigate(currentIndex - 1);
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
          break;
        case '+':
        case '=':
          setScale(s => Math.min(s * 1.2, 5));
          break;
        case '-':
          setScale(s => Math.max(s / 1.2, 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Pinch zoom handling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.min(Math.max(s * delta, 1), 5));
  };

  // Pan handling
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition(p => ({
        x: p.x + e.movementX,
        y: p.y + e.movementY
      }));
    }
  };

  return (
    <div className="lightbox" onClick={onClose}>
      <div
        className="lightbox-content"
        onClick={e => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
        />
      </div>

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          className="lightbox-nav prev"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
        >
          ‹
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          className="lightbox-nav next"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
        >
          ›
        </button>
      )}

      {/* Controls */}
      <div className="lightbox-controls">
        <span>{currentIndex + 1} / {images.length}</span>
        <button onClick={() => setScale(s => Math.min(s * 1.2, 5))}>+</button>
        <button onClick={() => setScale(1)}>Reset</button>
        <button onClick={() => setScale(s => Math.max(s / 1.2, 1))}>-</button>
        <button onClick={onClose}>×</button>
      </div>

      {/* Thumbnails */}
      <div className="lightbox-thumbnails">
        {images.map((img, index) => (
          <button
            key={img.id}
            className={index === currentIndex ? 'active' : ''}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index);
            }}
          >
            <img src={img.thumbnail} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Q10.8: Design Notification System

### Câu hỏi
Design a comprehensive notification system với push notifications, in-app notifications, và email preferences.

### Trả lời

```typescript
// Notification types
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'message' | 'activity' | 'marketing';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  actions?: {
    label: string;
    action: string;
  }[];
  metadata?: Record<string, unknown>;
}

interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
    categories: {
      system: boolean;
      message: boolean;
      activity: boolean;
      marketing: boolean;
    };
  };
  push: {
    enabled: boolean;
    categories: {
      system: boolean;
      message: boolean;
      activity: boolean;
      marketing: boolean;
    };
  };
  inApp: {
    sound: boolean;
    desktop: boolean;
  };
}

// Notification context and provider
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  // Load notifications
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000
  });

  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data]);

  // Real-time notifications via WebSocket
  useWebSocket({
    url: 'wss://api.example.com/notifications',
    onMessage: (message) => {
      if (message.type === 'notification') {
        const notification = message.payload as Notification;

        setNotifications(prev => [notification, ...prev]);

        // Show toast
        if (preferences.inApp.sound) {
          playNotificationSound();
        }

        showToast(notification);

        // Show desktop notification
        if (preferences.inApp.desktop && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/notification-icon.png'
          });
        }
      }
    }
  });

  // Request push notification permission
  useEffect(() => {
    if (preferences.push.enabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [preferences.push.enabled]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    await markNotificationRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markAllNotificationsRead();
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await deleteNotificationApi(id);
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
    await saveNotificationPreferences(updates);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Notification bell component
function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="notification-bell">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <header>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}>Mark all read</button>
            )}
          </header>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <EmptyState message="No notifications" />
            ) : (
              notifications.slice(0, 20).map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                />
              ))
            )}
          </div>

          <footer>
            <Link to="/notifications">View all</Link>
          </footer>
        </div>
      )}
    </div>
  );
}

// Toast notification system
const ToastContext = createContext<{
  show: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(Notification & { visible: boolean })[]>([]);

  const show = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const toast: Notification & { visible: boolean } = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date(),
      visible: true
    };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => t.id === toast.id ? { ...t, visible: false } : t)
      );

      // Remove from DOM after animation
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 300);
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            notification={toast}
            visible={toast.visible}
            onClose={() => {
              setToasts(prev =>
                prev.map(t => t.id === toast.id ? { ...t, visible: false } : t)
              );
            }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({
  notification,
  visible,
  onClose
}: {
  notification: Notification;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <div className={`toast toast-${notification.type} ${visible ? 'visible' : ''}`}>
      <div className="toast-content">
        <strong>{notification.title}</strong>
        <p>{notification.message}</p>
      </div>
      <button onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}
```

---

## Tổng kết System Design

| Topic | Key Considerations |
|-------|-------------------|
| Product Listing | Virtual scrolling, URL state, image optimization |
| Chat App | WebSocket, offline queue, typing indicators |
| Dashboard | Widget system, real-time updates, drag-drop |
| Form Builder | Drag-drop, validation schema, dynamic rendering |
| Multi-tenant | Tenant detection, feature flags, theming |
| Collaborative Editor | CRDT (Yjs), awareness, conflict resolution |
| Image Gallery | Lazy loading, masonry layout, lightbox |
| Notifications | Push, in-app, preferences, WebSocket |

**Key Takeaways:**
1. Start with clear requirements and constraints
2. Consider scale from the beginning
3. Use appropriate data structures and algorithms
4. Plan for offline/error scenarios
5. Optimize for perceived performance
6. Think about accessibility and UX
