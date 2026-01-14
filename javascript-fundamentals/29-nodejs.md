# Node.js - Complete Guide (Basic to Advanced)

## Table of Contents
- [Level 1: Basic](#level-1-basic)
- [Level 2: Intermediate](#level-2-intermediate)
- [Level 3: Advanced](#level-3-advanced)
- [Interview Questions](#interview-questions)

---

# Level 1: Basic

## 1.1 Node.js là gì?

```javascript
// Node.js = JavaScript runtime built on Chrome's V8 engine
// Cho phép chạy JavaScript ở server-side

// Đặc điểm chính:
// - Non-blocking I/O (Asynchronous)
// - Single-threaded với Event Loop
// - NPM - Package manager lớn nhất thế giới
// - Cross-platform

// Check version
// $ node -v
// $ npm -v
```

## 1.2 Modules System

### CommonJS (CJS) - Default trong Node.js

```javascript
// math.js - Export
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

module.exports = { add, subtract };
// hoặc
exports.add = add;
exports.multiply = (a, b) => a * b;

// app.js - Import
const math = require('./math');
console.log(math.add(2, 3)); // 5

// Destructuring import
const { add, subtract } = require('./math');
```

### ES Modules (ESM)

```javascript
// package.json: "type": "module"
// hoặc dùng .mjs extension

// math.mjs - Export
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export default function multiply(a, b) {
  return a * b;
}

// app.mjs - Import
import multiply, { add, subtract } from './math.mjs';
```

### Built-in Modules

```javascript
const fs = require('fs');           // File system
const path = require('path');       // Path utilities
const http = require('http');       // HTTP server/client
const https = require('https');     // HTTPS
const os = require('os');           // Operating system
const events = require('events');   // Event emitter
const crypto = require('crypto');   // Cryptography
const util = require('util');       // Utilities
const stream = require('stream');   // Streams
const url = require('url');         // URL parsing
```

## 1.3 File System (fs)

```javascript
const fs = require('fs');
const path = require('path');

// ========== SYNCHRONOUS (Blocking) ==========
// Đọc file
const data = fs.readFileSync('file.txt', 'utf8');
console.log(data);

// Ghi file
fs.writeFileSync('output.txt', 'Hello World');

// Append file
fs.appendFileSync('log.txt', 'New line\n');

// Check file exists
if (fs.existsSync('file.txt')) {
  console.log('File exists');
}

// ========== ASYNCHRONOUS (Non-blocking) ==========
// Callback style
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log(data);
});

// Promise style (fs.promises)
const fsPromises = require('fs').promises;

async function readFileAsync() {
  try {
    const data = await fsPromises.readFile('file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Error:', err);
  }
}

// ========== Directory Operations ==========
// Tạo directory
fs.mkdirSync('new-folder', { recursive: true });

// Đọc directory
const files = fs.readdirSync('./');
console.log(files);

// Xóa file
fs.unlinkSync('file.txt');

// Xóa directory
fs.rmdirSync('folder', { recursive: true });

// File stats
const stats = fs.statSync('file.txt');
console.log(stats.isFile());      // true/false
console.log(stats.isDirectory()); // true/false
console.log(stats.size);          // bytes
```

## 1.4 Path Module

```javascript
const path = require('path');

// Join paths
const fullPath = path.join(__dirname, 'folder', 'file.txt');
// /Users/user/project/folder/file.txt

// Resolve to absolute path
const absolute = path.resolve('folder', 'file.txt');

// Get parts of path
console.log(path.basename('/path/to/file.txt'));  // file.txt
console.log(path.dirname('/path/to/file.txt'));   // /path/to
console.log(path.extname('/path/to/file.txt'));   // .txt

// Parse path
const parsed = path.parse('/path/to/file.txt');
// { root: '/', dir: '/path/to', base: 'file.txt', ext: '.txt', name: 'file' }

// __dirname vs __filename
console.log(__dirname);  // Directory của current file
console.log(__filename); // Full path của current file

// Với ES Modules (không có __dirname)
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

## 1.5 HTTP Server

```javascript
const http = require('http');

// Tạo basic server
const server = http.createServer((req, res) => {
  // Request info
  console.log(req.method);  // GET, POST, etc.
  console.log(req.url);     // /path
  console.log(req.headers); // Headers object

  // Response
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Hello World' }));
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

// ========== Routing cơ bản ==========
const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Home Page</h1>');
  }
  else if (method === 'GET' && url === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'John' }]));
  }
  else if (method === 'POST' && url === '/api/users') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const user = JSON.parse(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 2, ...user }));
    });
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
```

---

# Level 2: Intermediate

## 2.1 Express.js Framework

```javascript
const express = require('express');
const app = express();

// ========== Middleware ==========
// Built-in middleware
app.use(express.json());                         // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded
app.use(express.static('public'));               // Serve static files

// Custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); // QUAN TRỌNG: phải gọi next()
});

// Error handling middleware (4 params)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ========== Routing ==========
// Basic routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'John' }]);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ id: 2, name, email });
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, ...req.body });
});

app.delete('/api/users/:id', (req, res) => {
  res.status(204).send();
});

// ========== Route Parameters & Query ==========
// /users/123
app.get('/users/:id', (req, res) => {
  console.log(req.params.id); // 123
});

// /users?page=1&limit=10
app.get('/users', (req, res) => {
  console.log(req.query.page);  // 1
  console.log(req.query.limit); // 10
});

// /files/images/photo.jpg (wildcard)
app.get('/files/*', (req, res) => {
  console.log(req.params[0]); // images/photo.jpg
});

// ========== Router (Modular routes) ==========
// routes/users.js
const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

// app.js
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// ========== Response Methods ==========
res.send('Text');                    // Send text
res.json({ key: 'value' });          // Send JSON
res.status(201).json({ id: 1 });     // Status + JSON
res.sendFile('/path/to/file.pdf');   // Send file
res.download('/path/to/file.pdf');   // Download file
res.redirect('/new-url');            // Redirect
res.redirect(301, '/permanent-url'); // Permanent redirect
res.render('view', { data });        // Render template

app.listen(3000);
```

## 2.2 Middleware Patterns

```javascript
// ========== Authentication Middleware ==========
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply to specific routes
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json(req.user);
});

// Apply to all routes under path
app.use('/api/admin', authMiddleware, adminRoutes);

// ========== Validation Middleware ==========
const validateUser = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (!name || name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

app.post('/api/users', validateUser, createUser);

// ========== Rate Limiting ==========
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);

// ========== CORS ==========
const cors = require('cors');

// Allow all origins
app.use(cors());

// Configure specific origins
app.use(cors({
  origin: ['http://localhost:3000', 'https://myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ========== Compression ==========
const compression = require('compression');
app.use(compression());

// ========== Helmet (Security headers) ==========
const helmet = require('helmet');
app.use(helmet());
```

## 2.3 Environment Variables

```javascript
// .env file
// PORT=3000
// DATABASE_URL=mongodb://localhost:27017/mydb
// JWT_SECRET=your-secret-key
// NODE_ENV=development

// Load với dotenv
require('dotenv').config();

// Access variables
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;

// Config pattern
// config/index.js
module.exports = {
  port: process.env.PORT || 3000,
  db: {
    url: process.env.DATABASE_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },
  isProduction: process.env.NODE_ENV === 'production'
};

// Usage
const config = require('./config');
app.listen(config.port);
```

## 2.4 Error Handling

```javascript
// ========== Custom Error Class ==========
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

// ========== Async Error Wrapper ==========
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
}));

// ========== Global Error Handler ==========
app.use((err, req, res, next) => {
  console.error(err);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Programming or unknown errors
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
});

// ========== 404 Handler ==========
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
```

## 2.5 Events & EventEmitter

```javascript
const EventEmitter = require('events');

// ========== Basic Usage ==========
const emitter = new EventEmitter();

// Register listener
emitter.on('userCreated', (user) => {
  console.log('User created:', user.name);
});

// Register one-time listener
emitter.once('serverStart', () => {
  console.log('Server started (this runs only once)');
});

// Emit event
emitter.emit('userCreated', { id: 1, name: 'John' });
emitter.emit('serverStart');

// Remove listener
const handler = () => console.log('Hello');
emitter.on('greet', handler);
emitter.off('greet', handler); // or removeListener

// ========== Custom EventEmitter Class ==========
class UserService extends EventEmitter {
  async createUser(data) {
    const user = await User.create(data);
    this.emit('created', user);
    return user;
  }

  async deleteUser(id) {
    const user = await User.findByIdAndDelete(id);
    this.emit('deleted', user);
    return user;
  }
}

const userService = new UserService();

userService.on('created', (user) => {
  // Send welcome email
  emailService.sendWelcome(user.email);
});

userService.on('deleted', (user) => {
  // Cleanup user data
  storageService.deleteUserFiles(user.id);
});
```

---

# Level 3: Advanced

## 3.1 Streams

```javascript
const fs = require('fs');
const { Transform, pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

// ========== Types of Streams ==========
// Readable - nguồn data (fs.createReadStream, http request)
// Writable - đích data (fs.createWriteStream, http response)
// Duplex - cả đọc và ghi (TCP socket)
// Transform - modify data khi đi qua (zlib, crypto)

// ========== Reading Large Files ==========
// ❌ Bad - load toàn bộ file vào memory
const data = fs.readFileSync('large-file.txt');

// ✅ Good - stream từng chunk
const readStream = fs.createReadStream('large-file.txt', {
  highWaterMark: 64 * 1024, // 64KB chunks
  encoding: 'utf8'
});

readStream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes`);
});

readStream.on('end', () => {
  console.log('Finished reading');
});

readStream.on('error', (err) => {
  console.error('Error:', err);
});

// ========== Piping Streams ==========
const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.pipe(writeStream);

// With error handling
readStream
  .pipe(writeStream)
  .on('finish', () => console.log('Done'))
  .on('error', (err) => console.error(err));

// ========== Transform Stream ==========
const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

fs.createReadStream('input.txt')
  .pipe(upperCaseTransform)
  .pipe(fs.createWriteStream('output.txt'));

// ========== Pipeline (recommended) ==========
const zlib = require('zlib');

async function compressFile(input, output) {
  await pipelineAsync(
    fs.createReadStream(input),
    zlib.createGzip(),
    fs.createWriteStream(output)
  );
  console.log('Compression complete');
}

// ========== HTTP Streaming ==========
app.get('/video', (req, res) => {
  const videoPath = './video.mp4';
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4'
    });

    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});
```

## 3.2 Worker Threads

```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// ========== Main Thread ==========
if (isMainThread) {
  // CPU-intensive task → spawn worker
  function runWorker(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: data
      });

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with code ${code}`));
        }
      });
    });
  }

  async function main() {
    const result = await runWorker({ numbers: [1, 2, 3, 4, 5] });
    console.log('Result:', result);
  }

  main();
}
// ========== Worker Thread ==========
else {
  const { numbers } = workerData;

  // Heavy computation
  const sum = numbers.reduce((a, b) => a + b, 0);

  // Send result back to main thread
  parentPort.postMessage(sum);
}

// ========== Worker Pool Pattern ==========
const { StaticPool } = require('node-worker-threads-pool');

const pool = new StaticPool({
  size: 4, // 4 workers
  task: './heavy-task.js'
});

async function processItems(items) {
  const results = await Promise.all(
    items.map(item => pool.exec(item))
  );
  return results;
}

// heavy-task.js
module.exports = function(data) {
  // CPU-intensive work
  return heavyComputation(data);
};
```

## 3.3 Cluster Mode

```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Restart worker
    cluster.fork();
  });
} else {
  // Workers share TCP connection
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from worker ${process.pid}\n`);
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}

// ========== Với PM2 (Production) ==========
// pm2 start app.js -i max  // Auto-scale to all CPUs
// pm2 start app.js -i 4    // 4 instances
// pm2 reload app           // Zero-downtime reload
// pm2 logs                 // View logs
// pm2 monit                // Monitor

// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

## 3.4 Caching Strategies

```javascript
// ========== In-Memory Cache ==========
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 min default TTL

// Cache middleware
const cacheMiddleware = (duration) => (req, res, next) => {
  const key = req.originalUrl;
  const cached = cache.get(key);

  if (cached) {
    return res.json(cached);
  }

  // Override res.json to cache response
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(key, data, duration);
    originalJson(data);
  };

  next();
};

app.get('/api/products', cacheMiddleware(300), async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ========== Redis Cache ==========
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const redisCache = {
  async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key, value, ttl = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value));
  },

  async del(key) {
    await redis.del(key);
  },

  async invalidatePattern(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};

// Usage
async function getUser(id) {
  const cacheKey = `user:${id}`;

  // Try cache first
  let user = await redisCache.get(cacheKey);
  if (user) return user;

  // Fetch from DB
  user = await User.findById(id);

  // Cache for 1 hour
  await redisCache.set(cacheKey, user, 3600);

  return user;
}

// Invalidate on update
async function updateUser(id, data) {
  const user = await User.findByIdAndUpdate(id, data, { new: true });
  await redisCache.del(`user:${id}`);
  return user;
}
```

## 3.5 Security Best Practices

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

// ========== Security Middleware Stack ==========
// Set security HTTP headers
app.use(helmet());

// Rate limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
}));

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit']
}));

// ========== Password Hashing ==========
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ========== JWT Authentication ==========
const jwt = require('jsonwebtoken');

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// ========== Input Validation ==========
const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  age: Joi.number().integer().min(18).max(120)
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

app.post('/api/users', validate(userSchema), createUser);
```

---

# Interview Questions

## Basic Questions

**1. Node.js là gì? Tại sao dùng Node.js?**
```
Node.js là JavaScript runtime dựa trên V8 engine của Chrome, cho phép chạy
JavaScript ở server-side.

Ưu điểm:
- Non-blocking I/O: Xử lý nhiều concurrent connections hiệu quả
- Single language: Dùng JavaScript cả frontend và backend
- NPM ecosystem: Package manager lớn nhất
- Real-time apps: Phù hợp cho WebSocket, chat, gaming
- Microservices: Lightweight, fast startup
```

**2. Event Loop là gì? Giải thích cách hoạt động**
```javascript
// Event Loop cho phép Node.js thực hiện non-blocking I/O
// dù JavaScript là single-threaded

// Phases của Event Loop:
// 1. Timers: setTimeout, setInterval callbacks
// 2. Pending callbacks: I/O callbacks deferred
// 3. Idle, prepare: internal use
// 4. Poll: retrieve new I/O events
// 5. Check: setImmediate callbacks
// 6. Close callbacks: socket.on('close')

console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// Output: 1, 4, 3, 2
// Microtasks (Promise) chạy trước Macrotasks (setTimeout)
```

**3. Sự khác nhau giữa require và import?**
```javascript
// require (CommonJS) - Synchronous, dynamic
const fs = require('fs');
const module = require(condition ? './a' : './b'); // Dynamic

// import (ES Modules) - Asynchronous, static
import fs from 'fs';
// import module from condition ? './a' : './b'; // ❌ Error

// Dynamic import với ESM
const module = await import('./module.js');
```

## Intermediate Questions

**4. Middleware trong Express là gì?**
```javascript
// Middleware = function có access đến req, res, và next
// Chạy theo thứ tự được define

// Types:
// 1. Application-level: app.use()
// 2. Router-level: router.use()
// 3. Error-handling: (err, req, res, next)
// 4. Built-in: express.json(), express.static()
// 5. Third-party: cors, helmet, morgan

// Order matters!
app.use(express.json());     // 1st: parse body
app.use(authMiddleware);     // 2nd: authenticate
app.use('/api', apiRoutes);  // 3rd: routes
app.use(errorHandler);       // Last: handle errors
```

**5. Streams là gì? Khi nào nên dùng?**
```javascript
// Streams = xử lý data theo chunks thay vì load toàn bộ vào memory

// Dùng khi:
// - Đọc/ghi large files
// - Real-time data processing
// - HTTP request/response với large payload
// - Video/audio streaming

// 4 types: Readable, Writable, Duplex, Transform

// ❌ Bad: Load 1GB file vào memory
const data = fs.readFileSync('huge-file.txt');

// ✅ Good: Stream từng chunk
fs.createReadStream('huge-file.txt')
  .pipe(transformStream)
  .pipe(fs.createWriteStream('output.txt'));
```

**6. Cách handle errors trong async/await?**
```javascript
// 1. Try-catch
async function getUser(id) {
  try {
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.error(err);
    throw new AppError('User not found', 404);
  }
}

// 2. asyncHandler wrapper cho Express
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await getUser(req.params.id);
  res.json(user);
}));

// 3. Global error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    error: err.message
  });
});
```

## Advanced Questions

**7. Cách scale Node.js application?**
```javascript
// 1. Cluster mode - multiple processes
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}

// 2. PM2 - Process manager
// pm2 start app.js -i max

// 3. Worker Threads - CPU-intensive tasks
const { Worker } = require('worker_threads');

// 4. Horizontal scaling - multiple servers + load balancer
// 5. Caching - Redis
// 6. Database optimization - indexing, connection pooling
// 7. CDN cho static assets
```

**8. Memory leak trong Node.js và cách phát hiện?**
```javascript
// Common causes:
// 1. Global variables
// 2. Closures giữ reference
// 3. Event listeners không remove
// 4. Caching không có limit

// Detect:
// - process.memoryUsage()
// - node --inspect + Chrome DevTools
// - clinic.js, heapdump

// Fix event listener leak:
const handler = () => {};
emitter.on('event', handler);
// Cleanup
emitter.off('event', handler);

// Fix cache leak:
const LRU = require('lru-cache');
const cache = new LRU({ max: 500 }); // Limit items
```

**9. Giải thích Buffer trong Node.js**
```javascript
// Buffer = raw binary data, fixed-size memory allocation
// Dùng cho: files, network I/O, crypto, streams

// Create
const buf1 = Buffer.alloc(10);           // 10 bytes, filled with 0
const buf2 = Buffer.from('Hello');       // From string
const buf3 = Buffer.from([1, 2, 3]);     // From array

// Operations
buf2.toString();                // 'Hello'
buf2.toString('base64');        // 'SGVsbG8='
buf2.length;                    // 5
Buffer.concat([buf1, buf2]);    // Combine buffers

// Streams return Buffers
stream.on('data', (chunk) => {
  console.log(chunk);           // <Buffer ...>
  console.log(chunk.toString());// String content
});
```

**10. So sánh process.nextTick() vs setImmediate()**
```javascript
// process.nextTick - chạy NGAY SAU current operation
// setImmediate - chạy ở CHECK phase của event loop

setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));
console.log('sync');

// Output:
// sync
// nextTick
// setImmediate

// nextTick queue được xử lý trước khi event loop tiếp tục
// Cẩn thận: nextTick recursive có thể block event loop
```
