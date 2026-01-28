# Redis Interview Practice - 20 Questions

## Overview

**Position:** Frontend/Backend/Fullstack Developer
**Topics:** Redis basics, Data Types, Caching Strategies, Pub/Sub, Persistence, Clustering, Best Practices

---

## Questions & Answers

### Redis Fundamentals

---

#### Q1: Redis là gì? Tại sao dùng Redis?

**Answer:**

**Redis** (Remote Dictionary Server) là in-memory data store, thường dùng làm:

- **Cache**: Giảm database load
- **Session store**: Lưu user sessions
- **Message broker**: Pub/Sub, queues
- **Real-time features**: Leaderboards, rate limiting

**Tại sao nhanh?**

1. **In-memory**: Data trong RAM, không disk I/O
2. **Single-threaded**: Không lock contention
3. **Optimized data structures**: Hash tables, skip lists

| Comparison | Read latency |
|------------|--------------|
| Redis | ~0.1ms |
| PostgreSQL (indexed) | ~1-10ms |
| PostgreSQL (no index) | ~100ms+ |

```bash
# Benchmark
redis-benchmark -t get,set -n 100000 -q
# SET: 120000 requests/second
# GET: 150000 requests/second
```

---

#### Q2: Redis data types và use cases

**Answer:**

| Type | Description | Use Case |
|------|-------------|----------|
| **String** | Binary-safe string, max 512MB | Cache, counters, flags |
| **List** | Linked list of strings | Queues, recent items |
| **Set** | Unordered unique strings | Tags, unique visitors |
| **Sorted Set** | Set với score để sort | Leaderboards, rankings |
| **Hash** | Field-value pairs (like object) | User profiles, sessions |
| **Stream** | Append-only log | Event sourcing, messaging |

```bash
# String - caching
SET user:123:name "John"
GET user:123:name

# Hash - user object
HSET user:123 name "John" email "john@test.com" age 25
HGETALL user:123

# Sorted Set - leaderboard
ZADD leaderboard 100 "player1" 85 "player2" 120 "player3"
ZREVRANGE leaderboard 0 9 WITHSCORES  # Top 10

# List - queue
LPUSH job:queue "task1"
RPOP job:queue

# Set - unique tags
SADD article:1:tags "nodejs" "redis" "backend"
SMEMBERS article:1:tags
```

---

#### Q3: Redis Strings - các commands quan trọng

**Answer:**

```bash
# Basic
SET key value
GET key
DEL key

# With expiration
SET key value EX 3600      # Expire in 3600 seconds
SETEX key 3600 value       # Same as above
SET key value PX 5000      # Expire in 5000 milliseconds

# Conditional set
SET key value NX           # Only if NOT exists (create)
SET key value XX           # Only if EXISTS (update)
SETNX key value            # SET if Not eXists

# Atomic operations
INCR counter               # +1
INCRBY counter 5           # +5
DECR counter               # -1
INCRBYFLOAT price 0.5      # Float increment

# Multiple keys
MSET k1 v1 k2 v2
MGET k1 k2
```

**Common patterns:**

```javascript
// Cache with expiration
await redis.set('api:result:123', JSON.stringify(data), 'EX', 3600);

// Distributed lock
const acquired = await redis.set('lock:resource', 'owner', 'NX', 'EX', 30);
if (acquired) {
  // Got the lock
}

// Rate limiting counter
const count = await redis.incr(`ratelimit:${userId}:${currentMinute}`);
await redis.expire(`ratelimit:${userId}:${currentMinute}`, 60);
```

---

#### Q4: Hash vs String để store objects

**Answer:**

**String (JSON serialized):**

```bash
SET user:123 '{"name":"John","email":"john@test.com","age":25}'
GET user:123  # Phải parse cả object
```

**Hash:**

```bash
HSET user:123 name "John" email "john@test.com" age 25
HGET user:123 name       # Lấy 1 field
HGETALL user:123         # Lấy tất cả
HINCRBY user:123 age 1   # Increment field
```

| Aspect | String (JSON) | Hash |
|--------|---------------|------|
| **Get single field** | Phải get + parse all | `HGET` trực tiếp |
| **Update single field** | Get, parse, modify, set all | `HSET` field |
| **Atomic field update** | Không được | `HINCRBY`, `HSET` |
| **Memory** | Overhead từ JSON | Optimized encoding |
| **Complex nested** | Supported | Chỉ flat fields |

> **Best Practice:** Hash cho flat objects cần partial updates. String cho complex nested hoặc read-all scenarios.

---

#### Q5: Sorted Set và leaderboard implementation

**Answer:**

**Sorted Set** = Set + Score để ranking.

```bash
# Add players với scores
ZADD leaderboard 100 "alice" 85 "bob" 120 "charlie"

# Top 10 (high to low)
ZREVRANGE leaderboard 0 9 WITHSCORES

# Player rank (0-indexed, từ cao xuống thấp)
ZREVRANK leaderboard "alice"  # Returns 1 (charlie=0, alice=1)

# Score of player
ZSCORE leaderboard "alice"    # Returns 100

# Update score
ZINCRBY leaderboard 15 "bob"  # bob: 85 → 100

# Range by score
ZRANGEBYSCORE leaderboard 90 100 WITHSCORES

# Count in range
ZCOUNT leaderboard 80 100
```

**Real-world leaderboard:**

```javascript
class Leaderboard {
  async addScore(userId, score) {
    await redis.zincrby('leaderboard', score, userId);
  }

  async getTopPlayers(count = 10) {
    return redis.zrevrange('leaderboard', 0, count - 1, 'WITHSCORES');
  }

  async getPlayerRank(userId) {
    const rank = await redis.zrevrank('leaderboard', userId);
    return rank !== null ? rank + 1 : null; // 1-indexed
  }

  async getPlayerScore(userId) {
    return redis.zscore('leaderboard', userId);
  }
}
```

---

### Caching Strategies

---

#### Q6: Cache-Aside Pattern (Lazy Loading)

**Answer:**

Application quản lý cache, read from cache first, miss → load from DB → write cache.

```javascript
async function getUser(userId) {
  // 1. Check cache
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss → query DB
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

  // 3. Write to cache
  if (user) {
    await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 3600);
  }

  return user;
}
```

**Pros:**
- Chỉ cache data thực sự được request
- Cache failure không block reads (fallback DB)

**Cons:**
- Cache miss = latency (DB query)
- Stale data possible

---

#### Q7: Write-Through vs Write-Behind

**Answer:**

**Write-Through:** Write cache và DB đồng thời

```javascript
async function updateUser(userId, data) {
  // Write DB
  await db.query('UPDATE users SET ... WHERE id = $1', [userId]);

  // Write cache immediately
  await redis.set(`user:${userId}`, JSON.stringify(data), 'EX', 3600);
}
```

**Write-Behind (Write-Back):** Write cache first, async write DB later

```javascript
async function updateUser(userId, data) {
  // Write cache immediately
  await redis.set(`user:${userId}`, JSON.stringify(data));

  // Queue async DB write
  await redis.lpush('db:write:queue', JSON.stringify({ userId, data }));
}

// Background worker processes queue
async function processWriteQueue() {
  const item = await redis.rpop('db:write:queue');
  if (item) {
    const { userId, data } = JSON.parse(item);
    await db.query('UPDATE users SET ...', [userId]);
  }
}
```

| Pattern | Consistency | Performance | Data Loss Risk |
|---------|-------------|-------------|----------------|
| **Write-Through** | Strong | Slower (2 writes sync) | Low |
| **Write-Behind** | Eventual | Fast | Higher (queue loss) |

---

#### Q8: Cache Invalidation Strategies

**Answer:**

**"There are only two hard things in CS: cache invalidation and naming things."**

**1. Time-based (TTL):**

```javascript
await redis.set('data', value, 'EX', 3600); // Auto-expire
```

**2. Event-based invalidation:**

```javascript
// On update
async function updateProduct(productId, data) {
  await db.update(productId, data);
  await redis.del(`product:${productId}`);         // Delete specific
  await redis.del(`product:list:*`);               // Pattern delete (scan)
}
```

**3. Version-based:**

```javascript
const version = await redis.incr('products:version');
const cacheKey = `products:list:v${version}`;
```

**4. Pub/Sub invalidation:**

```javascript
// Publisher (on data change)
await redis.publish('cache:invalidate', JSON.stringify({ type: 'product', id: 123 }));

// Subscriber (all app instances)
redis.subscribe('cache:invalidate');
redis.on('message', (channel, message) => {
  const { type, id } = JSON.parse(message);
  localCache.delete(`${type}:${id}`);
});
```

---

#### Q9: Cache Stampede (Thundering Herd) và cách xử lý

**Answer:**

**Problem:** Cache expires → nhiều requests đồng thời hit DB → DB overload.

```
Cache expires at 10:00:00
10:00:01 - 1000 concurrent requests all miss cache
         - 1000 DB queries simultaneously
         - DB overwhelmed
```

**Solutions:**

**1. Locking (distributed lock):**

```javascript
async function getWithLock(key) {
  let data = await redis.get(key);
  if (data) return JSON.parse(data);

  // Try to acquire lock
  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', 'NX', 'EX', 10);

  if (acquired) {
    // Got lock - fetch and cache
    data = await fetchFromDB();
    await redis.set(key, JSON.stringify(data), 'EX', 3600);
    await redis.del(lockKey);
  } else {
    // Wait and retry
    await sleep(100);
    return getWithLock(key);
  }

  return data;
}
```

**2. Background refresh (stale-while-revalidate):**

```javascript
async function getWithBackgroundRefresh(key) {
  const data = await redis.get(key);
  const ttl = await redis.ttl(key);

  // If TTL < threshold, refresh in background
  if (ttl < 300 && ttl > 0) {
    refreshInBackground(key); // Don't await
  }

  return data ? JSON.parse(data) : fetchFromDB();
}
```

**3. Randomized TTL:**

```javascript
const baseTTL = 3600;
const jitter = Math.random() * 300; // 0-5 minutes random
await redis.set(key, value, 'EX', baseTTL + jitter);
```

---

### Pub/Sub & Messaging

---

#### Q10: Redis Pub/Sub

**Answer:**

**Pub/Sub** = Fire-and-forget messaging. Messages không persist, chỉ subscribers online nhận được.

```javascript
// Publisher
const publisher = createClient();
await publisher.publish('notifications', JSON.stringify({
  type: 'new_order',
  orderId: 123
}));

// Subscriber
const subscriber = createClient();
await subscriber.subscribe('notifications', (message) => {
  const data = JSON.parse(message);
  console.log('Received:', data);
});

// Pattern subscribe
await subscriber.pSubscribe('user:*', (message, channel) => {
  console.log(`Channel ${channel}:`, message);
});
```

**Use cases:**
- Real-time notifications
- Cache invalidation across servers
- Chat messages
- Live updates

**Limitations:**
- No persistence (miss messages if offline)
- No acknowledgment
- No replay

> **Need persistence?** Use Redis Streams instead.

---

#### Q11: Redis Streams vs Pub/Sub

**Answer:**

| Feature | Pub/Sub | Streams |
|---------|---------|---------|
| **Persistence** | No | Yes |
| **Replay messages** | No | Yes (read from any ID) |
| **Consumer groups** | No | Yes |
| **Acknowledgment** | No | Yes (XACK) |
| **Blocking read** | SUBSCRIBE | XREAD BLOCK |

**Streams example:**

```bash
# Producer
XADD mystream * event "order_created" orderId 123

# Consumer (simple)
XREAD BLOCK 5000 STREAMS mystream $

# Consumer group (distributed processing)
XGROUP CREATE mystream mygroup $ MKSTREAM
XREADGROUP GROUP mygroup consumer1 BLOCK 5000 STREAMS mystream >

# Acknowledge processed
XACK mystream mygroup <message-id>
```

```javascript
// Producer
await redis.xAdd('events', '*', {
  type: 'order_created',
  orderId: '123'
});

// Consumer with group
while (true) {
  const messages = await redis.xReadGroup(
    'mygroup', 'consumer1',
    { key: 'events', id: '>' },
    { BLOCK: 5000 }
  );

  for (const message of messages) {
    await processMessage(message);
    await redis.xAck('events', 'mygroup', message.id);
  }
}
```

> **Use Streams** when: Need reliability, replay, distributed consumers.

---

### Persistence & Reliability

---

#### Q12: RDB vs AOF Persistence

**Answer:**

**RDB (Redis Database):** Point-in-time snapshots

```
# redis.conf
save 900 1      # Save if 1 key changed in 900s
save 300 10     # Save if 10 keys changed in 300s
save 60 10000   # Save if 10000 keys changed in 60s
```

**AOF (Append Only File):** Log every write operation

```
# redis.conf
appendonly yes
appendfsync everysec   # Fsync every second (recommended)
# appendfsync always   # Fsync every write (slow but safe)
# appendfsync no       # OS decides (fastest, risky)
```

| Aspect | RDB | AOF |
|--------|-----|-----|
| **Data loss** | Minutes (last snapshot) | Seconds (last fsync) |
| **File size** | Compact (binary) | Larger (log format) |
| **Recovery speed** | Fast | Slower (replay log) |
| **Performance** | Better (periodic) | Slight overhead |
| **Use case** | Backups, replicas | Durability priority |

**Best Practice:** Enable both

```
# redis.conf
save 900 1
appendonly yes
appendfsync everysec
```

---

#### Q13: Redis Transactions (MULTI/EXEC)

**Answer:**

Redis transactions = atomic execution của multiple commands.

```bash
MULTI
SET user:1:balance 100
INCR user:1:login_count
EXEC
```

```javascript
const results = await redis.multi()
  .set('key1', 'value1')
  .incr('counter')
  .get('counter')
  .exec();
// results = ['OK', 1, '1']
```

**WATCH - Optimistic locking:**

```javascript
async function transferMoney(from, to, amount) {
  await redis.watch(`balance:${from}`);

  const balance = parseInt(await redis.get(`balance:${from}`));
  if (balance < amount) {
    await redis.unwatch();
    throw new Error('Insufficient funds');
  }

  const result = await redis.multi()
    .decrBy(`balance:${from}`, amount)
    .incrBy(`balance:${to}`, amount)
    .exec();

  if (result === null) {
    // WATCH detected change, retry
    return transferMoney(from, to, amount);
  }
}
```

> **Note:** Redis transactions không có rollback. Nếu 1 command fail, các commands khác vẫn chạy.

---

#### Q14: Lua Scripts trong Redis

**Answer:**

**Lua scripts** chạy atomically trong Redis, tránh race conditions.

```lua
-- rate_limiter.lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local current = redis.call('INCR', key)
if current == 1 then
    redis.call('EXPIRE', key, window)
end

if current > limit then
    return 0  -- Exceeded
end
return 1  -- Allowed
```

```javascript
const script = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])

  local current = redis.call('INCR', key)
  if current == 1 then
    redis.call('EXPIRE', key, window)
  end

  return current <= limit and 1 or 0
`;

// Load script
const sha = await redis.scriptLoad(script);

// Execute
const allowed = await redis.evalSha(sha, {
  keys: [`ratelimit:${userId}`],
  arguments: ['100', '60']  // 100 requests per 60 seconds
});
```

**Benefits:**
- **Atomic**: Không bị race condition
- **Performance**: Giảm round-trips
- **Cached**: Script được cache bằng SHA

---

### Scaling & High Availability

---

#### Q15: Redis Replication (Master-Replica)

**Answer:**

```
         [Master]
        /    |    \
       /     |     \
[Replica1] [Replica2] [Replica3]
  (read)    (read)     (read)
```

```bash
# replica redis.conf
replicaof master-host 6379
```

**Benefits:**
- **Read scaling**: Nhiều replicas xử lý reads
- **High availability**: Replica promote thành master khi master fail
- **Backup**: Replicas có copy của data

**Application pattern:**

```javascript
// Write to master
await masterClient.set('key', 'value');

// Read from replica
const value = await replicaClient.get('key');
```

> **Note:** Replication là async by default → có thể đọc stale data từ replica.

---

#### Q16: Redis Cluster vs Sentinel

**Answer:**

**Sentinel** - High Availability for single master:

```
[Sentinel1] [Sentinel2] [Sentinel3]
      \          |          /
       \         |         /
         [Master] ↔ [Replica]
```

- Monitors master/replicas
- Automatic failover
- Không partition data

**Cluster** - Sharding + HA:

```
[Master1] ←→ [Replica1]    Slots 0-5460
[Master2] ←→ [Replica2]    Slots 5461-10922
[Master3] ←→ [Replica3]    Slots 10923-16383
```

- Data partitioned across nodes (16384 hash slots)
- Automatic failover per shard
- Horizontal scaling

| Aspect | Sentinel | Cluster |
|--------|----------|---------|
| **Scaling** | Vertical only | Horizontal (sharding) |
| **Data size** | Single node limit | Unlimited (add nodes) |
| **Complexity** | Simpler | More complex |
| **Multi-key ops** | Full support | Same slot only |

```javascript
// Cluster client
const cluster = new Redis.Cluster([
  { host: 'node1', port: 6379 },
  { host: 'node2', port: 6379 },
  { host: 'node3', port: 6379 }
]);

// Keys with same hash tag go to same slot
await cluster.mset('{user:123}:name', 'John', '{user:123}:email', 'john@test.com');
```

---

#### Q17: Redis memory management và eviction policies

**Answer:**

```bash
# Set max memory
maxmemory 2gb

# Eviction policy
maxmemory-policy allkeys-lru
```

| Policy | Description |
|--------|-------------|
| `noeviction` | Return error khi full (default) |
| `allkeys-lru` | Evict least recently used từ all keys |
| `volatile-lru` | LRU chỉ từ keys có TTL |
| `allkeys-lfu` | Least frequently used từ all keys |
| `volatile-lfu` | LFU chỉ từ keys có TTL |
| `allkeys-random` | Random eviction |
| `volatile-ttl` | Evict keys với TTL ngắn nhất |

**Best Practices:**

- **Cache:** `allkeys-lru` hoặc `allkeys-lfu`
- **Sessions:** `volatile-lru` (chỉ evict sessions có TTL)
- **Critical data:** `noeviction` + monitor memory

```bash
# Monitor memory
INFO memory
# used_memory: 1.5gb
# maxmemory: 2gb
```

---

### Practical Patterns

---

#### Q18: Distributed Lock với Redis

**Answer:**

```javascript
class RedisLock {
  constructor(redis, lockKey, ttlMs = 30000) {
    this.redis = redis;
    this.lockKey = lockKey;
    this.ttlMs = ttlMs;
    this.lockValue = crypto.randomUUID();
  }

  async acquire() {
    const result = await this.redis.set(
      this.lockKey,
      this.lockValue,
      'NX',           // Only if not exists
      'PX', this.ttlMs // Expire in ms
    );
    return result === 'OK';
  }

  async release() {
    // Only release if we own the lock (Lua for atomicity)
    const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `;
    return this.redis.eval(script, 1, this.lockKey, this.lockValue);
  }
}

// Usage
const lock = new RedisLock(redis, 'lock:order:123');
if (await lock.acquire()) {
  try {
    await processOrder();
  } finally {
    await lock.release();
  }
}
```

> **Production:** Consider Redlock algorithm for distributed systems with multiple Redis instances.

---

#### Q19: Rate Limiting với Redis

**Answer:**

**Fixed Window:**

```javascript
async function fixedWindowRateLimit(userId, limit, windowSec) {
  const key = `ratelimit:${userId}:${Math.floor(Date.now() / 1000 / windowSec)}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSec);
  }

  return count <= limit;
}
```

**Sliding Window (more accurate):**

```javascript
async function slidingWindowRateLimit(userId, limit, windowSec) {
  const key = `ratelimit:${userId}`;
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  await redis.multi()
    .zRemRangeByScore(key, 0, windowStart)     // Remove old entries
    .zAdd(key, { score: now, value: `${now}` }) // Add current request
    .expire(key, windowSec)
    .exec();

  const count = await redis.zCard(key);
  return count <= limit;
}
```

**Token Bucket (smooth rate):**

```javascript
async function tokenBucketRateLimit(userId, maxTokens, refillRate) {
  const key = `bucket:${userId}`;
  const now = Date.now();

  // Lua script for atomic token bucket
  const script = `
    local tokens = tonumber(redis.call('HGET', KEYS[1], 'tokens') or ARGV[1])
    local lastRefill = tonumber(redis.call('HGET', KEYS[1], 'lastRefill') or ARGV[3])

    local elapsed = (tonumber(ARGV[3]) - lastRefill) / 1000
    tokens = math.min(tonumber(ARGV[1]), tokens + elapsed * tonumber(ARGV[2]))

    if tokens >= 1 then
      tokens = tokens - 1
      redis.call('HSET', KEYS[1], 'tokens', tokens, 'lastRefill', ARGV[3])
      redis.call('EXPIRE', KEYS[1], 3600)
      return 1
    end
    return 0
  `;

  return redis.eval(script, 1, key, maxTokens, refillRate, now);
}
```

---

#### Q20: Session Storage với Redis

**Answer:**

```javascript
// Express with connect-redis
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: 'redis://localhost:6379' });
await redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Usage
app.post('/login', (req, res) => {
  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ success: true });
});

app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ...
});
```

**Manual session management:**

```javascript
class SessionManager {
  constructor(redis, ttlSeconds = 86400) {
    this.redis = redis;
    this.ttl = ttlSeconds;
  }

  async create(userId, data = {}) {
    const sessionId = crypto.randomUUID();
    const session = { userId, ...data, createdAt: Date.now() };

    await this.redis.hSet(`session:${sessionId}`, session);
    await this.redis.expire(`session:${sessionId}`, this.ttl);

    return sessionId;
  }

  async get(sessionId) {
    const session = await this.redis.hGetAll(`session:${sessionId}`);
    return Object.keys(session).length ? session : null;
  }

  async destroy(sessionId) {
    await this.redis.del(`session:${sessionId}`);
  }

  async refresh(sessionId) {
    await this.redis.expire(`session:${sessionId}`, this.ttl);
  }
}
```

---

## Quick Commands Reference

```bash
# Connection
redis-cli
redis-cli -h host -p 6379 -a password

# Keys
KEYS pattern          # Find keys (avoid in production)
SCAN 0 MATCH pattern  # Safe iteration
EXISTS key
DEL key
EXPIRE key seconds
TTL key
TYPE key

# Strings
SET key value [EX seconds] [NX|XX]
GET key
INCR/DECR key
MSET/MGET

# Hashes
HSET key field value
HGET key field
HGETALL key
HDEL key field

# Lists
LPUSH/RPUSH key value
LPOP/RPOP key
LRANGE key start stop

# Sets
SADD key member
SMEMBERS key
SISMEMBER key member

# Sorted Sets
ZADD key score member
ZRANGE key start stop [WITHSCORES]
ZREVRANGE key start stop [WITHSCORES]
ZRANK/ZREVRANK key member

# Server
INFO
DBSIZE
FLUSHDB
MONITOR           # Real-time commands
SLOWLOG GET 10    # Slow queries
```

---

## Summary

| Topic | Key Points |
|-------|------------|
| **Data Types** | String, Hash, List, Set, Sorted Set, Stream |
| **Caching** | Cache-Aside, Write-Through, TTL, Invalidation |
| **Pub/Sub** | Fire-and-forget, no persistence |
| **Streams** | Persistent messaging, consumer groups |
| **Persistence** | RDB (snapshots) + AOF (write log) |
| **Transactions** | MULTI/EXEC, WATCH for optimistic locking |
| **Scaling** | Sentinel (HA), Cluster (sharding) |
| **Patterns** | Distributed lock, Rate limiting, Sessions |
