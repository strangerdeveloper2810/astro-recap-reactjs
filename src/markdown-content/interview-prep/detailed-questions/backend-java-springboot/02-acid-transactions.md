---
title: "ACID Principles & Transaction Management - 30 Questions Backend Java Spring Boot"
description: "30 câu hỏi chi tiết về ACID principles, transaction management, isolation levels, và concurrency control trong Spring Boot"
---

# ACID Principles & Transaction Management

## Table of Contents

1. [ACID Basics (Q1-Q5)](#acid-basics)
2. [Atomicity & Consistency (Q6-Q10)](#atomicity-consistency)
3. [Isolation Levels (Q11-Q15)](#isolation-levels)
4. [Durability & Recovery (Q16-Q20)](#durability-recovery)
5. [Spring Transaction Management (Q21-Q25)](#spring-transactions)
6. [Advanced Patterns (Q26-Q30)](#advanced-patterns)

---

## ACID Basics

### Q1: Giải thích ACID properties với ví dụ thực tế trong Banking System

**Độ khó:** Junior/Mid

**Câu trả lời:**

**ACID** là 4 thuộc tính đảm bảo tính toàn vẹn của transactions trong database:

#### **A - Atomicity (Tính nguyên tử)**

**Định nghĩa:** Transaction là "all-or-nothing" - Hoặc tất cả operations thành công, hoặc không có operation nào thực hiện.

**Ví dụ: Chuyển tiền $100 từ Account A → Account B**

```java
@Service
public class BankTransferService {

    @Autowired
    private AccountRepository accountRepository;

    @Transactional  // Atomicity enforcement
    public void transferMoney(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        // Operation 1: Debit from account A
        Account fromAccount = accountRepository.findById(fromAccountId).orElseThrow();
        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
        accountRepository.save(fromAccount);

        // Simulate failure
        if (Math.random() > 0.5) {
            throw new RuntimeException("System error!");  // Rollback happens here
        }

        // Operation 2: Credit to account B
        Account toAccount = accountRepository.findById(toAccountId).orElseThrow();
        toAccount.setBalance(toAccount.getBalance().add(amount));
        accountRepository.save(toAccount);

        // ✅ Atomicity ensures:
        // - If exception occurs, BOTH operations rollback
        // - No partial state (money disappeared or duplicated)
        // - Database returns to state before transaction started
    }
}
```

**Không có Atomicity:**
```
Before: A = $1000, B = $500
Operation 1: A = $900 (debit $100) ✅
[System crashes]
Operation 2: B = $500 (not executed) ❌
Result: A = $900, B = $500
Problem: $100 disappeared! 💰❌
```

**Với Atomicity:**
```
Before: A = $1000, B = $500
Operation 1: A = $900 (debit $100)
[Exception thrown]
Rollback: A = $1000 (restored)
Result: A = $1000, B = $500
Success: No money lost! ✅
```

#### **C - Consistency (Tính nhất quán)**

**Định nghĩa:** Transaction đưa database từ consistent state này sang consistent state khác, tuân thủ tất cả constraints, triggers, và business rules.

**Ví dụ: Constraint "Total money in system phải không đổi"**

```java
@Service
public class ConsistentTransferService {

    @Transactional
    public void transferMoney(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        // Business rule: Cannot overdraft
        Account fromAccount = accountRepository.findById(fromAccountId).orElseThrow();

        if (fromAccount.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Balance too low");
            // ✅ Consistency: Prevents invalid state (negative balance)
        }

        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));

        Account toAccount = accountRepository.findById(toAccountId).orElseThrow();
        toAccount.setBalance(toAccount.getBalance().add(amount));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        // ✅ Consistency verified:
        // Total before = A($1000) + B($500) = $1500
        // Total after  = A($900) + B($600) = $1500
        // Constraint satisfied!
    }
}
```

**Database Constraints kiểm tra Consistency:**

```sql
-- Check constraint: Balance cannot be negative
ALTER TABLE accounts
ADD CONSTRAINT check_balance CHECK (balance >= 0);

-- Trigger: Verify total money unchanged
CREATE TRIGGER verify_total_money
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    DECLARE total_before DECIMAL(15,2);
    DECLARE total_after DECIMAL(15,2);

    SELECT SUM(balance) INTO total_before FROM accounts_audit WHERE timestamp = OLD.timestamp;
    SELECT SUM(balance) INTO total_after FROM accounts WHERE 1=1;

    IF total_before != total_after THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Total money changed - Consistency violated!';
    END IF;
END;
```

#### **I - Isolation (Tính cô lập)**

**Định nghĩa:** Concurrent transactions không ảnh hưởng lẫn nhau. Mỗi transaction như thể chạy độc lập.

**Ví dụ: 2 người cùng check balance và withdraw**

```java
// ❌ Không có Isolation - Race condition
public void withdraw(Long accountId, BigDecimal amount) {
    // User 1 và User 2 cùng đọc balance = $100
    Account account = accountRepository.findById(accountId).orElseThrow();

    if (account.getBalance().compareTo(amount) >= 0) {
        // Cả 2 pass check vì cùng thấy $100
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
    }
}

// Timeline:
// T1: User 1 reads balance = $100 ✅
// T2: User 2 reads balance = $100 ✅ (should see $50!)
// T3: User 1 withdraws $50 → balance = $50
// T4: User 2 withdraws $50 → balance = $0
// Problem: Withdrew $100 but only had $100!
```

**✅ Với Isolation (Serializable level):**

```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public void withdraw(Long accountId, BigDecimal amount) {
    Account account = accountRepository.findById(accountId).orElseThrow();

    if (account.getBalance().compareTo(amount) >= 0) {
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
    }

    // ✅ Isolation ensures:
    // - Transaction 2 waits for Transaction 1 to complete
    // - Transaction 2 sees updated balance ($50)
    // - Transaction 2 fails check (cannot withdraw $50 from $50)
}

// Timeline:
// T1: User 1 locks account, reads balance = $100
// T2: User 2 waits (blocked by lock)
// T3: User 1 withdraws $50 → balance = $50, commits
// T4: User 1 releases lock
// T5: User 2 acquires lock, reads balance = $50
// T6: User 2 check fails ($50 < $50), no withdrawal
// Success: Only $50 withdrawn! ✅
```

#### **D - Durability (Tính bền vững)**

**Định nghĩa:** Sau khi transaction commit, data được lưu vĩnh viễn, ngay cả khi system crash.

**Ví dụ: Đảm bảo transaction không mất sau khi commit**

```java
@Service
public class DurableTransferService {

    @Transactional
    public void transferMoney(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        Account fromAccount = accountRepository.findById(fromAccountId).orElseThrow();
        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));

        Account toAccount = accountRepository.findById(toAccountId).orElseThrow();
        toAccount.setBalance(toAccount.getBalance().add(amount));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        // Transaction commits here
        // ✅ Durability ensures:
        // - Data written to disk (not just in memory)
        // - WAL (Write-Ahead Logging) persisted
        // - Even if power outage now, data is safe
    }

    // System crashes after this line
}

// After recovery:
// 1. Database reads WAL (Write-Ahead Log)
// 2. Replays committed transactions
// 3. Data restored: A = $900, B = $600
// ✅ Durability: No data loss!
```

**Durability Implementation (Database Level):**

```
Write-Ahead Logging (WAL):
1. Log change to WAL file on disk
2. Modify data in memory (buffer pool)
3. Periodically flush dirty pages to disk (checkpoint)

Timeline:
T1: Write "A = $900" to WAL ✅ (durable)
T2: Write "B = $600" to WAL ✅ (durable)
T3: COMMIT
T4: [System crash]
T5: Recovery: Read WAL, apply changes
Result: Data recovered! ✅
```

---

### Q2: So sánh isolation levels: READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE

**Độ khó:** Mid/Senior

**Câu trả lời:**

#### **Bảng tổng hợp Isolation Levels:**

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Performance | Use Case |
|----------------|------------|---------------------|--------------|-------------|----------|
| **READ_UNCOMMITTED** | ❌ Có | ❌ Có | ❌ Có | ⚡⚡⚡⚡⚡ Fastest | Analytics, logging |
| **READ_COMMITTED** | ✅ Không | ❌ Có | ❌ Có | ⚡⚡⚡⚡ Fast | Default cho most apps |
| **REPEATABLE_READ** | ✅ Không | ✅ Không | ❌ Có | ⚡⚡⚡ Medium | Financial reports |
| **SERIALIZABLE** | ✅ Không | ✅ Không | ✅ Không | ⚡ Slow | Money transfers |

#### **1. READ_UNCOMMITTED (Lowest isolation)**

**Cho phép đọc uncommitted data (dirty reads)**

```java
@Transactional(isolation = Isolation.READ_UNCOMMITTED)
public BigDecimal getAccountBalance(Long accountId) {
    return accountRepository.findById(accountId)
        .orElseThrow()
        .getBalance();
}

// Timeline:
// T1: Transaction 1 updates balance to $500 (NOT committed yet)
// T2: Transaction 2 reads balance = $500 (DIRTY READ!) ❌
// T3: Transaction 1 ROLLBACK (oops!)
// T4: Transaction 2 used wrong value $500 (should be $1000)
```

**Problem: Dirty Read**
```
Session 1:                    Session 2:
BEGIN;
UPDATE accounts
SET balance = 500
WHERE id = 1;
                             BEGIN;
                             SELECT balance FROM accounts
                             WHERE id = 1;
                             → Returns 500 (DIRTY!)
ROLLBACK;
                             -- Used wrong value!
                             COMMIT;
```

**Use case:** Real-time analytics where approximate data is acceptable.

#### **2. READ_COMMITTED (Default level)**

**Chỉ đọc committed data, nhưng cho phép non-repeatable reads**

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void processOrder(Long orderId) {
    // Read 1
    Order order = orderRepository.findById(orderId).orElseThrow();
    BigDecimal price1 = order.getTotalPrice();  // $100

    // Some processing...
    Thread.sleep(1000);

    // Read 2 (same transaction)
    orderRepository.flush();
    orderRepository.clear();  // Clear cache
    order = orderRepository.findById(orderId).orElseThrow();
    BigDecimal price2 = order.getTotalPrice();  // $150 (CHANGED!)

    // ❌ Non-Repeatable Read: price1 != price2
}

// Timeline:
// T1: Session 1 reads price = $100
// T2: Session 2 updates price to $150 and COMMITS
// T3: Session 1 reads price again = $150 (DIFFERENT!)
```

**Problem: Non-Repeatable Read**
```
Session 1:                    Session 2:
BEGIN;
SELECT price FROM orders
WHERE id = 1;
→ Returns $100
                             BEGIN;
                             UPDATE orders
                             SET price = 150
                             WHERE id = 1;
                             COMMIT;
SELECT price FROM orders
WHERE id = 1;
→ Returns $150 (CHANGED!)
```

**Use case:** Most web applications, REST APIs.

#### **3. REPEATABLE_READ (Higher isolation)**

**Đảm bảo same reads trong transaction, nhưng cho phép phantom reads**

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void generateReport(String category) {
    // Read 1: Count products
    long count1 = productRepository.countByCategory(category);  // 10 products

    // Some processing...
    Thread.sleep(1000);

    // Read 2: Count products again
    long count2 = productRepository.countByCategory(category);  // 12 products (PHANTOM!)

    // ❌ Phantom Read: count1 != count2
    // New products appeared (phantoms!)
}

// Timeline:
// T1: Session 1 counts products = 10
// T2: Session 2 inserts 2 new products and COMMITS
// T3: Session 1 counts again = 12 (PHANTOM ROWS!)
```

**Problem: Phantom Read**
```
Session 1:                              Session 2:
BEGIN;
SELECT COUNT(*) FROM products
WHERE category = 'Electronics';
→ Returns 10
                                       BEGIN;
                                       INSERT INTO products
                                       VALUES (..., 'Electronics');
                                       INSERT INTO products
                                       VALUES (..., 'Electronics');
                                       COMMIT;
SELECT COUNT(*) FROM products
WHERE category = 'Electronics';
→ Returns 12 (PHANTOMS!)
```

**Use case:** Financial reports, inventory management.

#### **4. SERIALIZABLE (Highest isolation)**

**Đảm bảo transactions chạy như thể sequential (no concurrency issues)**

```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
    // Complete isolation - No dirty, non-repeatable, or phantom reads

    Account from = accountRepository.findById(fromId).orElseThrow();
    Account to = accountRepository.findById(toId).orElseThrow();

    from.setBalance(from.getBalance().subtract(amount));
    to.setBalance(to.getBalance().add(amount));

    accountRepository.save(from);
    accountRepository.save(to);

    // ✅ Guaranteed: No other transaction can interfere
    // ✅ All reads are consistent
    // ✅ No phantom or non-repeatable reads
    // ❌ Performance cost: Other transactions WAIT
}
```

**How it works:**
```
Session 1:                              Session 2:
BEGIN TRANSACTION
ISOLATION LEVEL SERIALIZABLE;

SELECT * FROM accounts
WHERE id = 1;
-- LOCKS rows
                                       BEGIN TRANSACTION
                                       ISOLATION LEVEL SERIALIZABLE;

                                       SELECT * FROM accounts
                                       WHERE id = 1;
                                       -- BLOCKED, waiting...

UPDATE accounts
SET balance = 900
WHERE id = 1;
COMMIT;
-- UNLOCK
                                       -- NOW executes
                                       -- Sees committed value
```

**Use case:** Money transfers, booking systems, critical transactions.

---

