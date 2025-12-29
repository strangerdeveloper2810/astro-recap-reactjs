# WebSocket & Real-time Communication

## Level 1: Basic - WebSocket Fundamentals

### 1.1. What is WebSocket?

```
WebSocket là protocol cho phép:
- Full-duplex communication (two-way)
- Persistent connection
- Real-time data transfer
- Low latency

Use cases:
- Chat applications
- Live notifications
- Real-time trading data
- Multiplayer games
- Collaborative editing
- Live sports updates
```

### 1.2. WebSocket vs HTTP

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP vs WebSocket                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HTTP:                           WebSocket:                  │
│  - Request/Response              - Full-duplex               │
│  - New connection each request   - Persistent connection     │
│  - Higher overhead               - Lower overhead            │
│  - Client initiates              - Both can initiate         │
│  - Polling for updates           - Push updates              │
│                                                              │
│  HTTP Polling:                   WebSocket:                  │
│                                                              │
│  Client ─────► Server            Client ◄────► Server        │
│  Client ─────► Server            (persistent connection)     │
│  Client ─────► Server                                        │
│  (repeated requests)                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3. WebSocket Handshake

```
┌─────────────────────────────────────────────────────────────┐
│                  WebSocket Handshake Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Client sends HTTP upgrade request                       │
│  2. Server responds with 101 Switching Protocols            │
│  3. Connection upgraded to WebSocket                        │
│                                                              │
│  Client Request:                                             │
│  GET /chat HTTP/1.1                                         │
│  Host: server.example.com                                   │
│  Upgrade: websocket                                         │
│  Connection: Upgrade                                        │
│  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==               │
│  Sec-WebSocket-Version: 13                                  │
│                                                              │
│  Server Response:                                            │
│  HTTP/1.1 101 Switching Protocols                           │
│  Upgrade: websocket                                         │
│  Connection: Upgrade                                        │
│  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.4. Native WebSocket API

```javascript
// Create connection
const ws = new WebSocket("wss://api.example.com/socket");

// Connection opened
ws.onopen = (event) => {
  console.log("Connected to WebSocket");
  ws.send("Hello Server!");
};

// Listen for messages
ws.onmessage = (event) => {
  console.log("Received:", event.data);

  // Parse JSON data
  const data = JSON.parse(event.data);
  handleMessage(data);
};

// Handle errors
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

// Connection closed
ws.onclose = (event) => {
  console.log("Disconnected:", event.code, event.reason);

  if (event.code !== 1000) {
    // Abnormal close, attempt reconnect
    reconnect();
  }
};

// Send message
ws.send(JSON.stringify({ type: "message", text: "Hello" }));

// Close connection
ws.close(1000, "Normal closure");
```

### 1.5. Connection States

```javascript
// WebSocket states
WebSocket.CONNECTING; // 0 - Connection not yet open
WebSocket.OPEN; // 1 - Connection is open
WebSocket.CLOSING; // 2 - Connection is closing
WebSocket.CLOSED; // 3 - Connection is closed

// Check state before sending
if (ws.readyState === WebSocket.OPEN) {
  ws.send(message);
}

// State diagram:
// CONNECTING → OPEN → CLOSING → CLOSED
//                ↘      ↗
//                  CLOSED (on error)
```

---

## Level 2: Intermediate - Socket.IO & React Integration

### 2.1. Socket.IO Client

```javascript
import { io } from "socket.io-client";

// Connect with options
const socket = io("https://api.example.com", {
  auth: {
    token: "your-auth-token"
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ["websocket", "polling"]
});

// Connection events
socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
  // Reasons: 'io server disconnect', 'io client disconnect',
  // 'ping timeout', 'transport close', 'transport error'
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

// Emit events
socket.emit("message", { text: "Hello" });

// Emit with acknowledgment
socket.emit("message", { text: "Hello" }, (response) => {
  console.log("Server acknowledged:", response);
});

// Listen for events
socket.on("message", (data) => {
  console.log("Received message:", data);
});

// One-time listener
socket.once("welcome", (data) => {
  console.log("Welcome message:", data);
});

// Remove listener
socket.off("message");

// Disconnect
socket.disconnect();
```

### 2.2. Socket.IO vs Native WebSocket

```
┌───────────────────────────────────────────────────────────────┐
│               Socket.IO vs Native WebSocket                   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Native WebSocket:                                            │
│  ✅ No dependencies, lighter                                 │
│  ✅ Standard protocol                                        │
│  ❌ Manual reconnection                                      │
│  ❌ No rooms/namespaces                                      │
│  ❌ Binary only, no events                                   │
│                                                               │
│  Socket.IO:                                                   │
│  ✅ Auto-reconnection                                        │
│  ✅ Rooms & namespaces                                       │
│  ✅ Event-based API                                          │
│  ✅ Fallback to polling                                      │
│  ✅ Acknowledgments                                          │
│  ❌ Larger bundle                                            │
│  ❌ Not pure WebSocket (protocol layer)                      │
│                                                               │
│  When to use what:                                            │
│  - Native: Simple apps, minimal overhead needed              │
│  - Socket.IO: Complex apps, need rooms, reliability          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 2.3. Rooms & Namespaces

```javascript
// Client-side
// Namespaces - separate concerns
const chatSocket = io("https://api.example.com/chat");
const notificationSocket = io("https://api.example.com/notifications");

chatSocket.on("message", handleChatMessage);
notificationSocket.on("notification", handleNotification);

// Join room
chatSocket.emit("join-room", { roomId: "room-123" });

// Leave room
chatSocket.emit("leave-room", { roomId: "room-123" });

// Server-side (Node.js reference)
io.on("connection", (socket) => {
  // Join room
  socket.join("room-123");

  // Leave room
  socket.leave("room-123");

  // Emit to room (including sender)
  io.to("room-123").emit("message", data);

  // Emit to room (excluding sender)
  socket.to("room-123").emit("message", data);

  // Emit to all clients
  io.emit("broadcast", data);

  // Emit to specific socket
  io.to(socketId).emit("private", data);
});
```

### 2.4. React Custom Hook

```javascript
import { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";

function useSocket(url, options = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(url, options);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("message", (data) => {
      setLastMessage(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [url]);

  const sendMessage = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const subscribe = useCallback((event, callback) => {
    socketRef.current?.on(event, callback);

    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    lastMessage,
    sendMessage,
    subscribe
  };
}

// Usage
function ChatComponent() {
  const { isConnected, sendMessage, subscribe } = useSocket(
    "https://api.example.com"
  );
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribe("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return unsubscribe;
  }, [subscribe]);

  const handleSend = (text) => {
    sendMessage("message", { text });
  };

  return (
    <div>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
```

### 2.5. Context Provider Pattern

```javascript
const SocketContext = createContext(null);

function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io("https://api.example.com", {
      auth: { token: getAuthToken() }
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const value = useMemo(
    () => ({ socket, isConnected }),
    [socket, isConnected]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }
  return context;
}

// Usage in app
function App() {
  return (
    <SocketProvider>
      <Dashboard />
    </SocketProvider>
  );
}
```

---

## Level 3: Advanced - Robust Connections & Scaling

### 3.1. Reconnection with Exponential Backoff

```javascript
class WebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      maxReconnectAttempts: 5,
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      heartbeatInterval: 30000,
      ...options
    };

    this.ws = null;
    this.reconnectAttempts = 0;
    this.heartbeatTimer = null;
    this.listeners = new Map();
    this.messageQueue = []; // Queue messages during disconnect
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushMessageQueue();
        this.emit("connected");
        resolve();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "pong") {
          return; // Heartbeat response
        }

        this.emit("message", data);
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();

        if (event.code !== 1000) {
          this.reconnect();
        }

        this.emit("disconnected", event);
      };

      this.ws.onerror = (error) => {
        this.emit("error", error);
        reject(error);
      };
    });
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, this.options.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  reconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit("maxReconnectAttemptsReached");
      return;
    }

    // Exponential backoff với jitter
    const delay = Math.min(
      this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      this.options.maxReconnectInterval
    );
    const jitter = delay * 0.1 * Math.random();

    this.reconnectAttempts++;
    this.emit("reconnecting", { attempt: this.reconnectAttempts, delay });

    setTimeout(() => this.connect(), delay + jitter);
  }

  send(data) {
    const message = JSON.stringify(data);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(message);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event, data) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  close() {
    this.stopHeartbeat();
    this.ws?.close(1000, "Normal closure");
  }
}
```

### 3.2. Message Protocol Design

```javascript
// Message format design
const MessageTypes = {
  // Client → Server
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  MESSAGE: "message",
  PING: "ping",

  // Server → Client
  DATA: "data",
  ERROR: "error",
  PONG: "pong",
  ACK: "ack"
};

// Message structure
const createMessage = (type, payload, id = null) => ({
  id: id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  payload,
  timestamp: Date.now()
});

// Request-Response pattern với acknowledgment
class WebSocketRPC {
  constructor(ws) {
    this.ws = ws;
    this.pendingRequests = new Map();
    this.timeout = 30000;

    ws.on("message", (data) => {
      if (data.type === "ack" && this.pendingRequests.has(data.requestId)) {
        const { resolve } = this.pendingRequests.get(data.requestId);
        this.pendingRequests.delete(data.requestId);
        resolve(data.payload);
      }
    });
  }

  async request(type, payload) {
    return new Promise((resolve, reject) => {
      const message = createMessage(type, payload);

      this.pendingRequests.set(message.id, { resolve, reject });

      // Timeout handling
      setTimeout(() => {
        if (this.pendingRequests.has(message.id)) {
          this.pendingRequests.delete(message.id);
          reject(new Error("Request timeout"));
        }
      }, this.timeout);

      this.ws.send(message);
    });
  }
}

// Usage
const rpc = new WebSocketRPC(wsClient);
const result = await rpc.request("getUser", { userId: 123 });
```

### 3.3. Subscription Management

```javascript
// Subscription manager for real-time data
class SubscriptionManager {
  constructor(socket) {
    this.socket = socket;
    this.subscriptions = new Map();
    this.handlers = new Map();

    socket.on("message", (data) => {
      if (data.type === "data") {
        this.handleData(data.channel, data.payload);
      }
    });

    // Resubscribe on reconnect
    socket.on("connected", () => {
      this.resubscribeAll();
    });
  }

  subscribe(channel, options = {}) {
    if (this.subscriptions.has(channel)) {
      return this.subscriptions.get(channel);
    }

    const subscription = {
      channel,
      options,
      handlers: new Set(),
      unsubscribe: () => this.unsubscribe(channel)
    };

    this.subscriptions.set(channel, subscription);

    this.socket.send({
      type: "subscribe",
      channel,
      ...options
    });

    return subscription;
  }

  unsubscribe(channel) {
    if (!this.subscriptions.has(channel)) return;

    this.subscriptions.delete(channel);
    this.handlers.delete(channel);

    this.socket.send({
      type: "unsubscribe",
      channel
    });
  }

  on(channel, handler) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel).add(handler);

    return () => {
      this.handlers.get(channel)?.delete(handler);
    };
  }

  handleData(channel, data) {
    this.handlers.get(channel)?.forEach((handler) => handler(data));
  }

  resubscribeAll() {
    this.subscriptions.forEach((sub) => {
      this.socket.send({
        type: "subscribe",
        channel: sub.channel,
        ...sub.options
      });
    });
  }
}

// Usage
const subManager = new SubscriptionManager(wsClient);

// Subscribe to channels
const pricesSub = subManager.subscribe("prices", { symbols: ["BTC", "ETH"] });
const unsubscribe = subManager.on("prices", (data) => {
  console.log("Price update:", data);
});

// Later cleanup
unsubscribe();
pricesSub.unsubscribe();
```

### 3.4. State Synchronization Pattern

```javascript
// Sync state between client and server
class StateSyncManager {
  constructor(socket) {
    this.socket = socket;
    this.localState = {};
    this.serverState = {};
    this.pendingChanges = [];
    this.version = 0;

    socket.on("message", (data) => {
      switch (data.type) {
        case "STATE_SYNC":
          this.handleFullSync(data);
          break;
        case "STATE_PATCH":
          this.handlePatch(data);
          break;
        case "CONFLICT":
          this.handleConflict(data);
          break;
      }
    });
  }

  // Request full state sync
  requestSync() {
    this.socket.send({ type: "REQUEST_SYNC" });
  }

  handleFullSync(data) {
    this.serverState = data.state;
    this.localState = { ...data.state };
    this.version = data.version;
    this.pendingChanges = [];
    this.emit("synced", this.localState);
  }

  handlePatch(data) {
    // Apply server patches
    if (data.baseVersion === this.version) {
      this.applyPatch(data.patch);
      this.version = data.version;
    } else {
      // Version mismatch, request full sync
      this.requestSync();
    }
  }

  // Local change với optimistic update
  applyLocalChange(change) {
    // Apply locally immediately (optimistic)
    const patch = this.createPatch(change);
    this.applyPatch(patch);

    // Queue for server
    this.pendingChanges.push({
      patch,
      baseVersion: this.version,
      timestamp: Date.now()
    });

    // Send to server
    this.socket.send({
      type: "CHANGE",
      patch,
      baseVersion: this.version
    });
  }

  handleConflict(data) {
    // Server rejected our change
    // Option 1: Rollback to server state
    this.localState = { ...this.serverState };

    // Option 2: Merge strategies (Last-write-wins, CRDT, etc.)
    this.emit("conflict", data);
  }

  createPatch(change) {
    // Create JSON patch from change
    return {
      op: change.operation, // 'add', 'remove', 'replace'
      path: change.path,
      value: change.value
    };
  }

  applyPatch(patch) {
    // Apply JSON patch to local state
    // Using immer or similar for immutable updates
  }
}
```

### 3.5. Load Balancing & Scaling

```
┌─────────────────────────────────────────────────────────────┐
│                WebSocket Scaling Architecture                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌─────────────┐                          │
│                    │   Clients   │                          │
│                    └──────┬──────┘                          │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │Load Balancer│                          │
│                    │(Sticky/Hash)│                          │
│                    └──────┬──────┘                          │
│           ┌───────────────┼───────────────┐                 │
│           │               │               │                 │
│    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐        │
│    │  Server 1   │ │  Server 2   │ │  Server 3   │        │
│    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘        │
│           │               │               │                 │
│           └───────────────┼───────────────┘                 │
│                    ┌──────▼──────┐                          │
│                    │    Redis    │                          │
│                    │   Pub/Sub   │                          │
│                    └─────────────┘                          │
│                                                              │
│  Challenges:                                                 │
│  1. Sticky sessions (client → same server)                  │
│  2. Cross-server messaging (Redis Pub/Sub)                  │
│  3. State synchronization                                   │
│  4. Connection handoff during deployment                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// Redis adapter for Socket.IO (server-side reference)
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// Now messages can be broadcast across all servers
io.to("room").emit("message", data); // Works across servers
```

---

## Real-world Applications

### Real-time Chat Application

```jsx
function useChat(roomId) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit("join-room", { roomId });

    // Message handlers
    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message-history", (history) => {
      setMessages(history);
    });

    socket.on("user-typing", ({ userId, isTyping }) => {
      setTyping((prev) => {
        if (isTyping) {
          return [...new Set([...prev, userId])];
        }
        return prev.filter((id) => id !== userId);
      });
    });

    socket.on("users-online", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user-joined", (user) => {
      setOnlineUsers((prev) => [...prev, user]);
    });

    socket.on("user-left", (userId) => {
      setOnlineUsers((prev) => prev.filter((u) => u.id !== userId));
      setTyping((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("message");
      socket.off("message-history");
      socket.off("user-typing");
      socket.off("users-online");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [socket, roomId]);

  const sendMessage = useCallback(
    (text, attachments = []) => {
      const message = {
        roomId,
        text,
        attachments,
        timestamp: Date.now()
      };

      // Optimistic update
      setMessages((prev) => [...prev, { ...message, pending: true }]);

      socket?.emit("send-message", message, (ack) => {
        // Update with server response
        setMessages((prev) =>
          prev.map((m) =>
            m.timestamp === message.timestamp ? { ...ack, pending: false } : m
          )
        );
      });
    },
    [socket, roomId]
  );

  const setIsTyping = useCallback(
    (isTyping) => {
      socket?.emit("typing", { roomId, isTyping });
    },
    [socket, roomId]
  );

  return { messages, typing, onlineUsers, sendMessage, setIsTyping };
}

// Chat Component
function ChatRoom({ roomId }) {
  const { messages, typing, onlineUsers, sendMessage, setIsTyping } =
    useChat(roomId);
  const [input, setInput] = useState("");
  const typingTimeoutRef = useRef();

  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Debounced typing indicator
    setIsTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
    setIsTyping(false);
  };

  return (
    <div className="chat-room">
      <OnlineUsersList users={onlineUsers} />
      <MessageList messages={messages} />
      <TypingIndicator typingUsers={typing} />
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### Real-time Trading Data

```jsx
function usePriceUpdates(symbols) {
  const [prices, setPrices] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const { socket, isConnected } = useSocketContext();

  useEffect(() => {
    if (!socket || !isConnected) return;

    setConnectionStatus("connected");

    // Subscribe to price updates
    socket.emit("subscribe", {
      channel: "prices",
      symbols
    });

    const handlePriceUpdate = (data) => {
      setPrices((prev) => ({
        ...prev,
        [data.symbol]: {
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          volume: data.volume,
          timestamp: data.timestamp
        }
      }));
    };

    const handleBatchUpdate = (updates) => {
      setPrices((prev) => {
        const newPrices = { ...prev };
        updates.forEach((data) => {
          newPrices[data.symbol] = {
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            timestamp: data.timestamp
          };
        });
        return newPrices;
      });
    };

    socket.on("price-update", handlePriceUpdate);
    socket.on("price-batch", handleBatchUpdate);

    return () => {
      socket.emit("unsubscribe", { channel: "prices", symbols });
      socket.off("price-update", handlePriceUpdate);
      socket.off("price-batch", handleBatchUpdate);
    };
  }, [socket, isConnected, symbols.join(",")]);

  return { prices, connectionStatus };
}

// Price ticker component
function PriceTicker({ symbol }) {
  const { prices } = usePriceUpdates([symbol]);
  const price = prices[symbol];
  const prevPriceRef = useRef(price?.price);

  // Flash animation on price change
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (price && prevPriceRef.current !== price.price) {
      setFlash(price.price > prevPriceRef.current ? "up" : "down");
      prevPriceRef.current = price.price;

      const timer = setTimeout(() => setFlash(null), 300);
      return () => clearTimeout(timer);
    }
  }, [price?.price]);

  if (!price) return <div>Loading...</div>;

  return (
    <div className={`price-ticker ${flash}`}>
      <span className="symbol">{symbol}</span>
      <span className="price">${price.price.toFixed(2)}</span>
      <span className={`change ${price.change >= 0 ? "positive" : "negative"}`}>
        {price.change >= 0 ? "+" : ""}
        {price.changePercent.toFixed(2)}%
      </span>
    </div>
  );
}
```

### Live Notifications System

```jsx
function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      showToast(notification);

      // Request permission for browser notifications
      if (Notification.permission === "granted" && document.hidden) {
        new Notification(notification.title, {
          body: notification.message,
          icon: notification.icon
        });
      }
    });

    socket.on("notification-history", (history) => {
      setNotifications(history);
      setUnreadCount(history.filter((n) => !n.read).length);
    });

    // Request initial notifications
    socket.emit("get-notifications");

    return () => {
      socket.off("notification");
      socket.off("notification-history");
    };
  }, [socket]);

  const markAsRead = useCallback(
    (notificationId) => {
      socket?.emit("mark-read", { notificationId });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [socket]
  );

  const markAllAsRead = useCallback(() => {
    socket?.emit("mark-all-read");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [socket]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
```

---

## Interview Questions

### Level 1: Basic

**1. WebSocket vs HTTP?**
```
HTTP:
- Request/Response model
- New connection each request
- Client initiates only
- Higher overhead (headers)

WebSocket:
- Full-duplex (bi-directional)
- Persistent connection
- Both can send anytime
- Lower overhead after handshake
```

**2. WebSocket handshake process?**
```
1. Client sends HTTP request với Upgrade header
2. Server responds 101 Switching Protocols
3. Connection upgraded to WebSocket
4. Both can now send/receive messages

Key headers:
- Upgrade: websocket
- Connection: Upgrade
- Sec-WebSocket-Key (client)
- Sec-WebSocket-Accept (server)
```

**3. WebSocket states?**
```
0 - CONNECTING: Connection not yet open
1 - OPEN: Connection is open
2 - CLOSING: Connection is closing
3 - CLOSED: Connection is closed

Always check readyState before sending
```

### Level 2: Intermediate

**4. Socket.IO vs native WebSocket?**
```
Socket.IO:
- Auto-reconnection
- Rooms & namespaces
- Fallback to polling
- Event-based API
- Acknowledgments

Native WebSocket:
- Lighter, no dependencies
- Standard protocol
- Manual everything
- Lower-level control

Choose Socket.IO for complex apps
Choose native for simple/lightweight needs
```

**5. How to handle reconnection?**
```javascript
// Exponential backoff pattern
let attempts = 0;
const maxAttempts = 5;

function reconnect() {
  if (attempts >= maxAttempts) return;

  const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
  attempts++;

  setTimeout(() => connect(), delay);
}

// Reset attempts on successful connect
ws.onopen = () => { attempts = 0; };
```

**6. WebSocket security best practices?**
```
1. Always use wss:// (TLS encryption)
2. Authenticate on connection (tokens)
3. Validate all incoming messages
4. Implement rate limiting
5. Use CORS properly
6. Don't trust client data
7. Sanitize before broadcasting
```

### Level 3: Advanced

**7. How to scale WebSocket servers?**
```
Challenges:
1. Sticky sessions needed
2. Cross-server messaging

Solutions:
1. Redis Pub/Sub for message broadcast
2. Consistent hashing for server assignment
3. Shared session store
4. Message queues for reliability

Architecture:
Client → Load Balancer (sticky) → Server → Redis Pub/Sub
```

**8. Heartbeat/Ping-Pong mechanism?**
```javascript
// Purpose:
// 1. Detect dead connections
// 2. Keep connection alive through proxies
// 3. Measure latency

// Implementation
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping', time: Date.now() }));
}, 30000);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'pong') {
    const latency = Date.now() - data.time;
  }
};
```

**9. Handle message ordering and delivery?**
```
Challenges:
- Network can reorder packets
- Messages can be lost
- Reconnection gaps

Solutions:
1. Sequence numbers on messages
2. Acknowledgment system
3. Message queue for pending
4. Request missed messages on reconnect
5. Idempotent message handling
```

**10. WebSocket vs Server-Sent Events (SSE)?**
```
WebSocket:
- Bi-directional
- Binary + text
- Manual reconnection
- More complex

SSE:
- Server → Client only
- Text only (event stream)
- Auto-reconnection
- Simpler, HTTP-based
- Better for notifications/feeds

Use SSE when you only need server push
Use WebSocket when you need two-way comm
```
