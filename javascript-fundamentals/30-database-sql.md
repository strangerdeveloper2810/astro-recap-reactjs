# Database & SQL - Complete Guide (Basic to Advanced)

## Table of Contents
- [Level 1: Basic](#level-1-basic)
- [Level 2: Intermediate](#level-2-intermediate)
- [Level 3: Advanced](#level-3-advanced)
- [Supabase](#supabase)
- [Interview Questions](#interview-questions)

---

# Level 1: Basic

## 1.1 Database Types

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE TYPES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RELATIONAL (SQL)              │  NON-RELATIONAL (NoSQL)        │
│  ─────────────────             │  ────────────────────          │
│  • PostgreSQL                  │  • MongoDB (Document)          │
│  • MySQL                       │  • Redis (Key-Value)           │
│  • SQLite                      │  • Cassandra (Wide-Column)     │
│  • SQL Server                  │  • Neo4j (Graph)               │
│                                │                                 │
│  Đặc điểm:                     │  Đặc điểm:                     │
│  • Structured data             │  • Flexible schema             │
│  • ACID compliance             │  • Horizontal scaling          │
│  • Complex queries             │  • High performance            │
│  • Relationships               │  • Various data models         │
│                                │                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1.2 SQL Basics

### CREATE - Tạo bảng

```sql
-- Tạo database
CREATE DATABASE myapp;

-- Sử dụng database
USE myapp;

-- Tạo bảng
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,    -- MySQL
  -- id SERIAL PRIMARY KEY,             -- PostgreSQL
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INT DEFAULT 18,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng với Foreign Key
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tạo bảng Many-to-Many
CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id INT,
  tag_id INT,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### INSERT - Thêm dữ liệu

```sql
-- Insert một row
INSERT INTO users (name, email, age)
VALUES ('John Doe', 'john@example.com', 25);

-- Insert nhiều rows
INSERT INTO users (name, email, age) VALUES
  ('Jane Doe', 'jane@example.com', 28),
  ('Bob Smith', 'bob@example.com', 32),
  ('Alice Johnson', 'alice@example.com', 24);

-- Insert với SELECT
INSERT INTO users_backup (name, email)
SELECT name, email FROM users WHERE is_active = true;
```

### SELECT - Truy vấn dữ liệu

```sql
-- Select tất cả
SELECT * FROM users;

-- Select specific columns
SELECT name, email FROM users;

-- WHERE clause
SELECT * FROM users WHERE age > 25;
SELECT * FROM users WHERE name = 'John' AND age >= 18;
SELECT * FROM users WHERE age BETWEEN 20 AND 30;
SELECT * FROM users WHERE name IN ('John', 'Jane', 'Bob');
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM users WHERE name LIKE 'J%';     -- Bắt đầu bằng J
SELECT * FROM users WHERE name LIKE '%son';   -- Kết thúc bằng son

-- NULL check
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;

-- ORDER BY
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM users ORDER BY age ASC, name DESC;

-- LIMIT & OFFSET (Pagination)
SELECT * FROM users LIMIT 10;           -- First 10 rows
SELECT * FROM users LIMIT 10 OFFSET 20; -- Skip 20, get next 10

-- DISTINCT
SELECT DISTINCT country FROM users;

-- Aliases
SELECT name AS user_name, email AS user_email FROM users;
SELECT u.name, u.email FROM users u;
```

### UPDATE - Cập nhật dữ liệu

```sql
-- Update single row
UPDATE users SET age = 26 WHERE id = 1;

-- Update multiple columns
UPDATE users
SET name = 'John Smith', age = 27, updated_at = NOW()
WHERE id = 1;

-- Update multiple rows
UPDATE users SET is_active = false WHERE age < 18;

-- Update với calculation
UPDATE products SET price = price * 1.1; -- Tăng giá 10%
```

### DELETE - Xóa dữ liệu

```sql
-- Delete specific rows
DELETE FROM users WHERE id = 1;

-- Delete với condition
DELETE FROM users WHERE is_active = false;

-- Delete tất cả rows (giữ structure)
DELETE FROM users;
-- hoặc (faster, reset auto_increment)
TRUNCATE TABLE users;

-- Drop table (xóa hoàn toàn)
DROP TABLE users;
DROP TABLE IF EXISTS users;
```

## 1.3 Data Types

### MySQL Data Types

```sql
-- Numeric
INT, BIGINT, SMALLINT, TINYINT
DECIMAL(10,2)   -- Chính xác cho tiền tệ
FLOAT, DOUBLE   -- Số thực

-- String
VARCHAR(255)    -- Variable length string
CHAR(10)        -- Fixed length string
TEXT            -- Long text
LONGTEXT        -- Very long text
ENUM('small', 'medium', 'large')

-- Date/Time
DATE            -- 'YYYY-MM-DD'
TIME            -- 'HH:MM:SS'
DATETIME        -- 'YYYY-MM-DD HH:MM:SS'
TIMESTAMP       -- Auto timezone convert

-- Boolean
BOOLEAN         -- true/false (MySQL dùng TINYINT(1))

-- Binary
BLOB            -- Binary data
JSON            -- JSON data
```

### PostgreSQL Data Types

```sql
-- Unique to PostgreSQL
SERIAL          -- Auto-increment integer
UUID            -- Universally unique identifier
JSONB           -- Binary JSON (faster queries)
ARRAY           -- Array type
INET            -- IP address
CIDR            -- Network address
MACADDR         -- MAC address

-- Example
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  tags TEXT[],                    -- Array of text
  metadata JSONB,                 -- JSON data
  price NUMERIC(10,2)
);

-- Array operations
INSERT INTO products (name, tags)
VALUES ('Laptop', ARRAY['electronics', 'computers']);

SELECT * FROM products WHERE 'electronics' = ANY(tags);

-- JSONB operations
INSERT INTO products (name, metadata)
VALUES ('Phone', '{"brand": "Apple", "model": "iPhone 15"}');

SELECT * FROM products WHERE metadata->>'brand' = 'Apple';
SELECT * FROM products WHERE metadata @> '{"brand": "Apple"}';
```

---

# Level 2: Intermediate

## 2.1 JOINs

```sql
-- Sample tables
-- users: id, name, email
-- posts: id, title, user_id
-- comments: id, content, post_id, user_id

-- ========== INNER JOIN ==========
-- Chỉ lấy rows match ở cả 2 bảng
SELECT users.name, posts.title
FROM users
INNER JOIN posts ON users.id = posts.user_id;

-- ========== LEFT JOIN (LEFT OUTER JOIN) ==========
-- Lấy TẤT CẢ rows từ bảng trái, match từ bảng phải (NULL nếu không match)
SELECT users.name, posts.title
FROM users
LEFT JOIN posts ON users.id = posts.user_id;
-- Users không có posts sẽ hiện với posts.title = NULL

-- ========== RIGHT JOIN ==========
-- Lấy TẤT CẢ rows từ bảng phải
SELECT users.name, posts.title
FROM users
RIGHT JOIN posts ON users.id = posts.user_id;

-- ========== FULL OUTER JOIN ==========
-- Lấy tất cả rows từ cả 2 bảng
SELECT users.name, posts.title
FROM users
FULL OUTER JOIN posts ON users.id = posts.user_id;

-- ========== Multiple JOINs ==========
SELECT
  u.name AS user_name,
  p.title AS post_title,
  c.content AS comment_content
FROM users u
JOIN posts p ON u.id = p.user_id
JOIN comments c ON p.id = c.post_id
WHERE u.is_active = true;

-- ========== Self JOIN ==========
-- Employees với manager (cùng bảng)
SELECT
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- ========== CROSS JOIN ==========
-- Cartesian product - mỗi row bảng A với mỗi row bảng B
SELECT colors.name, sizes.name
FROM colors
CROSS JOIN sizes;
```

```
┌─────────────────────────────────────────────────────────────┐
│                     JOIN VISUALIZATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   INNER JOIN          LEFT JOIN           RIGHT JOIN         │
│   ┌───┬───┐          ┌───┬───┐           ┌───┬───┐          │
│   │   │███│          │███│███│           │   │███│          │
│   │ A │███│ B        │███│███│ B         │ A │███│          │
│   │   │███│          │███│███│           │   │███│          │
│   └───┴───┘          └───┴───┘           └───┴───┘          │
│   Only matching      All A +             All B +            │
│                      matching B          matching A          │
│                                                              │
│   FULL OUTER JOIN                                            │
│   ┌───┬───┐                                                  │
│   │███│███│                                                  │
│   │███│███│                                                  │
│   │███│███│                                                  │
│   └───┴───┘                                                  │
│   All A + All B                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 2.2 Aggregate Functions & GROUP BY

```sql
-- ========== Aggregate Functions ==========
SELECT COUNT(*) FROM users;                    -- Đếm tất cả rows
SELECT COUNT(email) FROM users;               -- Đếm non-NULL values
SELECT COUNT(DISTINCT country) FROM users;    -- Đếm unique values

SELECT SUM(price) FROM orders;                -- Tổng
SELECT AVG(age) FROM users;                   -- Trung bình
SELECT MIN(price), MAX(price) FROM products;  -- Min, Max

-- ========== GROUP BY ==========
-- Số posts của mỗi user
SELECT user_id, COUNT(*) AS post_count
FROM posts
GROUP BY user_id;

-- Tổng doanh thu theo tháng
SELECT
  DATE_FORMAT(created_at, '%Y-%m') AS month,
  SUM(amount) AS total_revenue
FROM orders
GROUP BY month
ORDER BY month DESC;

-- Multiple columns
SELECT country, city, COUNT(*) AS user_count
FROM users
GROUP BY country, city;

-- ========== HAVING (filter sau GROUP BY) ==========
-- Users có hơn 5 posts
SELECT user_id, COUNT(*) AS post_count
FROM posts
GROUP BY user_id
HAVING COUNT(*) > 5;

-- WHERE vs HAVING
SELECT user_id, COUNT(*) AS post_count
FROM posts
WHERE created_at > '2024-01-01'    -- Filter rows TRƯỚC khi group
GROUP BY user_id
HAVING COUNT(*) > 5;               -- Filter groups SAU khi group
```

## 2.3 Subqueries

```sql
-- ========== Subquery trong WHERE ==========
-- Users có posts
SELECT * FROM users
WHERE id IN (SELECT DISTINCT user_id FROM posts);

-- Users không có posts
SELECT * FROM users
WHERE id NOT IN (SELECT DISTINCT user_id FROM posts);

-- Products giá cao hơn trung bình
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- ========== Subquery trong FROM ==========
SELECT avg_data.category, avg_data.avg_price
FROM (
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
) AS avg_data
WHERE avg_data.avg_price > 100;

-- ========== Correlated Subquery ==========
-- Users với số posts
SELECT
  u.name,
  (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) AS post_count
FROM users u;

-- Latest post của mỗi user
SELECT * FROM posts p1
WHERE created_at = (
  SELECT MAX(created_at)
  FROM posts p2
  WHERE p2.user_id = p1.user_id
);

-- ========== EXISTS ==========
-- Users có ít nhất 1 post
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM posts p WHERE p.user_id = u.id
);
```

## 2.4 Indexes

```sql
-- ========== Tạo Index ==========
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (multiple columns)
CREATE INDEX idx_posts_user_date ON posts(user_id, created_at);

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- ========== Xem Indexes ==========
-- MySQL
SHOW INDEX FROM users;

-- PostgreSQL
SELECT * FROM pg_indexes WHERE tablename = 'users';

-- ========== Xóa Index ==========
DROP INDEX idx_users_email ON users;  -- MySQL
DROP INDEX idx_users_email;           -- PostgreSQL

-- ========== Khi nào dùng Index ==========
-- ✅ Nên index:
-- - Columns trong WHERE clause
-- - Columns trong JOIN conditions
-- - Columns trong ORDER BY
-- - Foreign keys

-- ❌ Không nên index:
-- - Tables nhỏ
-- - Columns ít distinct values (boolean, gender)
-- - Columns thường xuyên UPDATE
-- - Columns trong expressions (WHERE YEAR(date) = 2024)

-- ========== EXPLAIN (Query Analysis) ==========
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';
```

## 2.5 Node.js Database Connection

### MySQL với mysql2

```javascript
// ========== Basic Connection ==========
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Query
async function getUsers() {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
}

// Parameterized query (prevent SQL injection)
async function getUserById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Insert
async function createUser(name, email) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email]
  );
  return result.insertId;
}

// Transaction
async function transferMoney(fromId, toId, amount) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, fromId]
    );
    await connection.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, toId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
```

### PostgreSQL với pg

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// Query
async function getUsers() {
  const { rows } = await pool.query('SELECT * FROM users');
  return rows;
}

// Parameterized query ($1, $2, ...)
async function getUserById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
}

// Insert returning
async function createUser(name, email) {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  return rows[0];
}

// Transaction
async function transferMoney(fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromId]
    );
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

---

# Level 3: Advanced

## 3.1 Transactions & ACID

```sql
-- ========== ACID Properties ==========
-- A - Atomicity: All or nothing
-- C - Consistency: Valid state to valid state
-- I - Isolation: Concurrent transactions don't interfere
-- D - Durability: Committed data persists

-- ========== Transaction Syntax ==========
-- MySQL
START TRANSACTION;
-- hoặc BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- Nếu success
COMMIT;

-- Nếu fail
ROLLBACK;

-- ========== Savepoints ==========
BEGIN;
INSERT INTO orders (user_id, total) VALUES (1, 100);
SAVEPOINT order_created;

INSERT INTO order_items (order_id, product_id) VALUES (1, 1);
-- Có lỗi, rollback đến savepoint
ROLLBACK TO order_created;

-- Tiếp tục với order khác
COMMIT;

-- ========== Isolation Levels ==========
-- Read Uncommitted: Dirty reads possible
-- Read Committed: Only see committed data (PostgreSQL default)
-- Repeatable Read: Same query = same result in transaction (MySQL default)
-- Serializable: Fully isolated, slowest

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
-- queries
COMMIT;
```

## 3.2 Views & Stored Procedures

```sql
-- ========== Views ==========
-- Virtual table based on query result
CREATE VIEW active_users AS
SELECT id, name, email
FROM users
WHERE is_active = true;

-- Usage
SELECT * FROM active_users;

-- View với JOIN
CREATE VIEW user_posts AS
SELECT
  u.id AS user_id,
  u.name AS user_name,
  p.id AS post_id,
  p.title AS post_title
FROM users u
JOIN posts p ON u.id = p.user_id;

-- Update view
CREATE OR REPLACE VIEW active_users AS
SELECT id, name, email, created_at
FROM users
WHERE is_active = true;

-- Drop view
DROP VIEW active_users;

-- ========== Stored Procedures (MySQL) ==========
DELIMITER //

CREATE PROCEDURE GetUserPosts(IN userId INT)
BEGIN
  SELECT * FROM posts WHERE user_id = userId;
END //

DELIMITER ;

-- Call procedure
CALL GetUserPosts(1);

-- Procedure với output
DELIMITER //

CREATE PROCEDURE CountUserPosts(
  IN userId INT,
  OUT postCount INT
)
BEGIN
  SELECT COUNT(*) INTO postCount
  FROM posts
  WHERE user_id = userId;
END //

DELIMITER ;

-- Call với output
CALL CountUserPosts(1, @count);
SELECT @count;

-- ========== Functions (PostgreSQL) ==========
CREATE OR REPLACE FUNCTION get_user_post_count(user_id_param INT)
RETURNS INT AS $$
DECLARE
  post_count INT;
BEGIN
  SELECT COUNT(*) INTO post_count
  FROM posts
  WHERE user_id = user_id_param;

  RETURN post_count;
END;
$$ LANGUAGE plpgsql;

-- Usage
SELECT get_user_post_count(1);
SELECT name, get_user_post_count(id) FROM users;
```

## 3.3 Window Functions

```sql
-- ========== ROW_NUMBER ==========
-- Đánh số thứ tự
SELECT
  name,
  department,
  salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS rank
FROM employees;

-- Đánh số theo group
SELECT
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;

-- ========== RANK & DENSE_RANK ==========
-- RANK: skip numbers for ties (1, 2, 2, 4)
-- DENSE_RANK: no skip (1, 2, 2, 3)
SELECT
  name,
  salary,
  RANK() OVER (ORDER BY salary DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM employees;

-- ========== LAG & LEAD ==========
-- LAG: giá trị row trước
-- LEAD: giá trị row sau
SELECT
  date,
  revenue,
  LAG(revenue, 1) OVER (ORDER BY date) AS prev_revenue,
  LEAD(revenue, 1) OVER (ORDER BY date) AS next_revenue,
  revenue - LAG(revenue, 1) OVER (ORDER BY date) AS revenue_change
FROM daily_sales;

-- ========== Running Total ==========
SELECT
  date,
  amount,
  SUM(amount) OVER (ORDER BY date) AS running_total
FROM transactions;

-- Running total per user
SELECT
  user_id,
  date,
  amount,
  SUM(amount) OVER (PARTITION BY user_id ORDER BY date) AS user_running_total
FROM transactions;

-- ========== Moving Average ==========
SELECT
  date,
  revenue,
  AVG(revenue) OVER (
    ORDER BY date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS seven_day_avg
FROM daily_sales;
```

## 3.4 Query Optimization

```sql
-- ========== EXPLAIN ANALYZE ==========
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'john@example.com';

-- ========== Common Optimizations ==========

-- 1. Use indexes effectively
-- ❌ Index không được dùng với function
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- ✅ Better
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- 2. Avoid SELECT *
-- ❌
SELECT * FROM users;
-- ✅
SELECT id, name, email FROM users;

-- 3. Use LIMIT
SELECT * FROM logs ORDER BY created_at DESC LIMIT 100;

-- 4. Optimize JOINs
-- Đảm bảo có index trên columns JOIN
-- JOIN từ bảng nhỏ đến bảng lớn

-- 5. Use EXISTS instead of IN for large datasets
-- ❌ Slow với large dataset
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
-- ✅ Faster
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 6. Batch operations
-- ❌ Multiple queries
INSERT INTO users (name) VALUES ('A');
INSERT INTO users (name) VALUES ('B');
INSERT INTO users (name) VALUES ('C');
-- ✅ Single query
INSERT INTO users (name) VALUES ('A'), ('B'), ('C');

-- 7. Use covering index
-- Index chứa tất cả columns cần thiết
CREATE INDEX idx_covering ON users(email, name, created_at);
SELECT name, created_at FROM users WHERE email = 'john@example.com';
-- Query hoàn toàn từ index, không cần đọc table
```

---

# Supabase

## Supabase là gì?

```
Supabase = Open source Firebase alternative
- PostgreSQL database
- Authentication
- Real-time subscriptions
- Storage
- Edge Functions
- Auto-generated APIs (REST & GraphQL)
```

## Setup & Basic Usage

```javascript
// Install
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ========== CRUD Operations ==========

// SELECT
const { data, error } = await supabase
  .from('users')
  .select('*');

// SELECT với columns cụ thể
const { data } = await supabase
  .from('users')
  .select('id, name, email');

// SELECT với relationships
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    users (
      id,
      name
    )
  `);

// INSERT
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'John', email: 'john@example.com' })
  .select(); // Return inserted row

// INSERT multiple
const { data } = await supabase
  .from('users')
  .insert([
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' }
  ])
  .select();

// UPDATE
const { data, error } = await supabase
  .from('users')
  .update({ name: 'John Doe' })
  .eq('id', 1)
  .select();

// DELETE
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', 1);

// UPSERT (Insert or Update)
const { data } = await supabase
  .from('users')
  .upsert({ id: 1, name: 'John', email: 'john@example.com' })
  .select();
```

## Filtering & Querying

```javascript
// ========== Filters ==========
// eq - equals
const { data } = await supabase
  .from('users')
  .select()
  .eq('is_active', true);

// neq - not equals
.neq('status', 'deleted')

// gt, gte, lt, lte - comparison
.gt('age', 18)
.gte('price', 100)
.lt('quantity', 10)
.lte('rating', 5)

// like, ilike (case insensitive)
.like('name', '%John%')
.ilike('email', '%@gmail.com')

// in - multiple values
.in('status', ['active', 'pending'])

// is - null check
.is('deleted_at', null)

// contains, containedBy (arrays)
.contains('tags', ['javascript', 'react'])

// range
.gte('price', 10)
.lte('price', 100)

// ========== Combining Filters ==========
const { data } = await supabase
  .from('products')
  .select()
  .eq('category', 'electronics')
  .gte('price', 100)
  .lte('price', 500)
  .order('price', { ascending: true })
  .limit(10);

// OR conditions
const { data } = await supabase
  .from('users')
  .select()
  .or('role.eq.admin,role.eq.moderator');

// ========== Pagination ==========
const { data } = await supabase
  .from('posts')
  .select()
  .range(0, 9); // First 10 items (0-9)

// With count
const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .range(0, 9);

// ========== Ordering ==========
const { data } = await supabase
  .from('posts')
  .select()
  .order('created_at', { ascending: false });

// Multiple order
.order('category', { ascending: true })
.order('price', { ascending: false })
```

## Authentication

```javascript
// ========== Sign Up ==========
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// ========== Sign In ==========
// Email/Password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Magic Link
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
});

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});

// ========== Sign Out ==========
const { error } = await supabase.auth.signOut();

// ========== Get Current User ==========
const { data: { user } } = await supabase.auth.getUser();

// ========== Session ==========
const { data: { session } } = await supabase.auth.getSession();

// ========== Auth State Change ==========
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
  // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
});

// ========== Password Reset ==========
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: 'https://example.com/reset-password' }
);

// Update password
const { error } = await supabase.auth.updateUser({
  password: 'newpassword123'
});
```

## Real-time Subscriptions

```javascript
// ========== Subscribe to changes ==========
const channel = supabase
  .channel('posts-channel')
  .on(
    'postgres_changes',
    {
      event: '*',  // INSERT, UPDATE, DELETE, or *
      schema: 'public',
      table: 'posts'
    },
    (payload) => {
      console.log('Change received:', payload);
      // { eventType, new, old, ... }
    }
  )
  .subscribe();

// Specific events
.on('postgres_changes', { event: 'INSERT', ... }, handleInsert)
.on('postgres_changes', { event: 'UPDATE', ... }, handleUpdate)
.on('postgres_changes', { event: 'DELETE', ... }, handleDelete)

// Filter changes
.on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'posts',
    filter: 'user_id=eq.1'  // Only user_id = 1
  },
  handleUpdate
)

// ========== Unsubscribe ==========
supabase.removeChannel(channel);

// ========== Presence (online users) ==========
const channel = supabase.channel('room-1');

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Online users:', state);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: 1, username: 'john' });
    }
  });
```

## Storage

```javascript
// ========== Upload ==========
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar1.png', file, {
    cacheControl: '3600',
    upsert: false
  });

// ========== Download ==========
const { data, error } = await supabase.storage
  .from('avatars')
  .download('public/avatar1.png');

// ========== Get Public URL ==========
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('public/avatar1.png');
// data.publicUrl

// ========== List files ==========
const { data, error } = await supabase.storage
  .from('avatars')
  .list('public', {
    limit: 100,
    offset: 0
  });

// ========== Delete ==========
const { error } = await supabase.storage
  .from('avatars')
  .remove(['public/avatar1.png']);

// ========== Move/Copy ==========
await supabase.storage
  .from('avatars')
  .move('public/avatar1.png', 'archive/avatar1.png');
```

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own posts
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own posts
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public read, authenticated write
CREATE POLICY "Public read" ON posts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated insert" ON posts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

---

# Interview Questions

## Basic Questions

**1. SQL vs NoSQL - Khi nào dùng cái nào?**
```
SQL (Relational):
- Structured data với relationships
- ACID compliance quan trọng (banking, e-commerce)
- Complex queries, JOINs
- Data integrity constraints

NoSQL:
- Flexible/unstructured data
- High scalability, horizontal scaling
- Real-time applications
- Rapid development, schema changes thường xuyên
```

**2. PRIMARY KEY vs UNIQUE vs INDEX?**
```sql
PRIMARY KEY:
- Unique identifier cho row
- Không cho phép NULL
- Mỗi table chỉ có 1 PRIMARY KEY
- Auto-indexed

UNIQUE:
- Đảm bảo values không trùng
- Cho phép NULL (nhưng chỉ 1 NULL)
- Có thể nhiều UNIQUE constraints

INDEX:
- Tăng tốc queries
- Không enforce uniqueness (trừ UNIQUE INDEX)
- Trade-off: faster reads, slower writes
```

**3. Sự khác nhau giữa WHERE và HAVING?**
```sql
-- WHERE: filter rows TRƯỚC khi GROUP BY
-- HAVING: filter groups SAU khi GROUP BY

SELECT department, AVG(salary) as avg_salary
FROM employees
WHERE is_active = true      -- Filter individual rows
GROUP BY department
HAVING AVG(salary) > 50000; -- Filter grouped results

-- WHERE không thể dùng aggregate functions
-- HAVING có thể dùng aggregate functions
```

## Intermediate Questions

**4. Giải thích các loại JOINs**
```sql
INNER JOIN: Chỉ rows match ở cả 2 bảng
LEFT JOIN:  Tất cả rows bảng trái + matching rows bảng phải
RIGHT JOIN: Tất cả rows bảng phải + matching rows bảng trái
FULL JOIN:  Tất cả rows cả 2 bảng
CROSS JOIN: Cartesian product (mỗi row A với mỗi row B)

-- Ví dụ thực tế:
-- "Lấy tất cả users kể cả không có orders"
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

**5. ACID là gì?**
```
A - Atomicity: Transaction hoàn toàn thành công hoặc hoàn toàn fail
    Ví dụ: Chuyển tiền - trừ account A và cộng account B
    phải cùng thành công hoặc cùng fail

C - Consistency: Database chuyển từ valid state sang valid state khác
    Ví dụ: Balance không thể âm, foreign keys phải valid

I - Isolation: Concurrent transactions không ảnh hưởng nhau
    Ví dụ: 2 người cùng đặt vé, không được đặt trùng seat

D - Durability: Data committed thì phải persist dù system crash
    Ví dụ: Sau khi commit transaction, restart server data vẫn còn
```

**6. Cách optimize slow query?**
```sql
1. EXPLAIN ANALYZE để xem execution plan
2. Thêm INDEX cho columns trong WHERE, JOIN, ORDER BY
3. Tránh SELECT *, chỉ select columns cần
4. Tránh functions trên indexed columns
5. Dùng LIMIT cho large results
6. Dùng EXISTS thay IN cho large subqueries
7. Denormalization nếu cần (trade-off với data integrity)
8. Caching layer (Redis)
```

## Advanced Questions

**7. N+1 Query Problem là gì? Cách fix?**
```javascript
// ❌ N+1 Problem: 1 query users + N queries cho mỗi user's posts
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  const posts = await db.query(
    'SELECT * FROM posts WHERE user_id = ?',
    [user.id]
  );
  user.posts = posts;
}

// ✅ Fix 1: JOIN
const results = await db.query(`
  SELECT u.*, p.*
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
`);

// ✅ Fix 2: Batch query (2 queries total)
const users = await db.query('SELECT * FROM users');
const userIds = users.map(u => u.id);
const posts = await db.query(
  'SELECT * FROM posts WHERE user_id IN (?)',
  [userIds]
);
// Group posts by user_id
```

**8. Database Normalization là gì?**
```
Normalization = Tổ chức data để giảm redundancy và dependency

1NF: Atomic values, no repeating groups
- ❌ products: { colors: "red, blue, green" }
- ✅ product_colors: { product_id, color }

2NF: 1NF + no partial dependencies
- Tất cả non-key columns depend on entire primary key

3NF: 2NF + no transitive dependencies
- Non-key columns chỉ depend on primary key, không depend on other non-key columns

Trade-off:
- Normalized = less redundancy, more JOINs
- Denormalized = more redundancy, faster reads
```

**9. Optimistic vs Pessimistic Locking?**
```sql
-- Pessimistic Locking: Lock row khi đọc
-- Dùng khi: high contention, conflicts thường xuyên
SELECT * FROM products WHERE id = 1 FOR UPDATE;
-- Row bị lock đến khi COMMIT/ROLLBACK

-- Optimistic Locking: Không lock, check version khi update
-- Dùng khi: low contention, conflicts hiếm
UPDATE products
SET name = 'New Name', version = version + 1
WHERE id = 1 AND version = 5;
-- Nếu affected rows = 0 → conflict, retry
```

**10. Connection Pooling là gì? Tại sao cần?**
```javascript
// Connection pool = giữ sẵn connections để reuse
// Thay vì: open connection → query → close (expensive)
// Pool: get connection from pool → query → return to pool

const pool = mysql.createPool({
  connectionLimit: 10,  // Max connections
  queueLimit: 0         // Unlimited queue
});

// Benefits:
// - Giảm overhead tạo/đóng connections
// - Limit số connections đến database
// - Handle concurrent requests hiệu quả
// - Connection reuse

// Best practices:
// - connectionLimit dựa trên DB max_connections
// - Monitor pool usage
// - Handle connection errors gracefully
```
