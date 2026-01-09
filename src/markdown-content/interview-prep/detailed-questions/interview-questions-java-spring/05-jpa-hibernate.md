# JPA/Hibernate - Interview Questions

## Mục lục
- [Phần 1: Cơ bản (Câu 1-10)](#phần-1-cơ-bản-câu-1-10)
- [Phần 2: Trung cấp (Câu 11-20)](#phần-2-trung-cấp-câu-11-20)
- [Phần 3: Nâng cao (Câu 21-30)](#phần-3-nâng-cao-câu-21-30)

---

# Phần 1: Cơ bản (Câu 1-10)

## Câu 1: JPA và Hibernate là gì? Mối quan hệ giữa chúng?

### Trả lời:

**JPA (Java Persistence API)** là specification, **Hibernate** là implementation của JPA.

### So sánh:

```
┌─────────────────────────────────────────────────────────────┐
│              JPA vs Hibernate                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  JPA:                                                        │
│  - Java Persistence API (Specification)                     │
│  - Standard API cho ORM                                      │
│  - Định nghĩa interfaces và annotations                     │
│  - Vendor independent                                       │
│                                                             │
│  Hibernate:                                                  │
│  - Implementation của JPA                                    │
│  - Most popular JPA provider                                │
│  - Có thêm features ngoài JPA spec                         │
│  - High performance                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Ví dụ JPA Entity:

```java
// ✅ JPA Entity
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", nullable = false, unique = true)
    private String username;
    
    @Column(name = "email")
    private String email;
    
    // Getters, setters
}
```

---

## Câu 2: Entity Manager là gì? Persistence Context?

### Trả lời:

**EntityManager** là interface để quản lý entities, **Persistence Context** là set các entity instances được quản lý.

### Ví dụ:

```java
// ✅ EntityManager
@Repository
public class UserRepository {
    @PersistenceContext
    private EntityManager entityManager;
    
    public User findById(Long id) {
        return entityManager.find(User.class, id);
    }
    
    public void save(User user) {
        entityManager.persist(user);
    }
    
    public void update(User user) {
        entityManager.merge(user);
    }
    
    public void delete(Long id) {
        User user = entityManager.find(User.class, id);
        if (user != null) {
            entityManager.remove(user);
        }
    }
}
```

### Persistence Context:

```java
// ✅ Persistence Context - First Level Cache
@Transactional
public void testPersistenceContext() {
    // First query - hits database
    User user1 = entityManager.find(User.class, 1L);
    
    // Second query - from persistence context (cache)
    User user2 = entityManager.find(User.class, 1L);
    
    // user1 == user2 (same instance from cache)
}
```

---

## Câu 3: @Entity, @Table, @Id, @GeneratedValue là gì?

### Trả lời:

Các annotations cơ bản để map Java class với database table.

### Ví dụ:

```java
// ✅ Entity Annotations
@Entity // Đánh dấu là JPA entity
@Table(name = "users", schema = "public") // Map với table "users"
public class User {
    
    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment
    private Long id;
    
    @Column(name = "user_name", length = 50, nullable = false)
    private String username;
    
    @Column(name = "email", unique = true)
    private String email;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    // Transient - không persist vào database
    @Transient
    private String temporaryField;
}
```

### Generation Strategies:

```java
// ✅ GenerationType.IDENTITY - Database auto-increment
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id; // MySQL AUTO_INCREMENT

// ✅ GenerationType.SEQUENCE - Database sequence
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
@SequenceGenerator(name = "user_seq", sequenceName = "user_sequence")
private Long id; // PostgreSQL SEQUENCE

// ✅ GenerationType.TABLE - Table-based generator
@Id
@GeneratedValue(strategy = GenerationType.TABLE, generator = "user_gen")
@TableGenerator(name = "user_gen", table = "id_generator")
private Long id;

// ✅ GenerationType.AUTO - Let JPA choose
@Id
@GeneratedValue(strategy = GenerationType.AUTO)
private Long id;
```

---

## Câu 4: Relationships trong JPA? @OneToMany, @ManyToOne, @ManyToMany?

### Trả lời:

JPA hỗ trợ các relationships giữa entities.

### Ví dụ Relationships:

```java
// ✅ @ManyToOne - Many Orders to One Customer
@Entity
public class Order {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
}

// ✅ @OneToMany - One Customer to Many Orders
@Entity
public class Customer {
    @Id
    @GeneratedValue
    private Long id;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Order> orders = new ArrayList<>();
}

// ✅ @ManyToMany - Many Students to Many Courses
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> courses = new ArrayList<>();
}

@Entity
public class Course {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToMany(mappedBy = "courses")
    private List<Student> students = new ArrayList<>();
}
```

---

## Câu 5: Fetch Types? EAGER vs LAZY Loading?

### Trả lời:

**FetchType** xác định khi nào load related entities.

### EAGER vs LAZY:

```java
// ✅ LAZY Loading (Default cho @OneToMany, @ManyToMany)
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.LAZY) // Load khi access
    private Customer customer;
}

// Usage
Order order = orderRepository.findById(1L);
// Customer chưa được load

Customer customer = order.getCustomer(); // Load customer ở đây
// SQL: SELECT * FROM customers WHERE id = ?

// ✅ EAGER Loading (Default cho @ManyToOne, @OneToOne)
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.EAGER) // Load ngay lập tức
    private Customer customer;
}

// Usage
Order order = orderRepository.findById(1L);
// Customer đã được load cùng lúc
// SQL: SELECT o.*, c.* FROM orders o JOIN customers c ON ...
```

### N+1 Problem:

```java
// ❌ N+1 Problem với LAZY
List<Order> orders = orderRepository.findAll();
// SQL 1: SELECT * FROM orders

for (Order order : orders) {
    Customer customer = order.getCustomer(); // SQL N: SELECT * FROM customers WHERE id = ?
    // N queries cho N orders
}

// ✅ Solution: JOIN FETCH
@Query("SELECT o FROM Order o JOIN FETCH o.customer")
List<Order> findAllWithCustomer();
// Single query với JOIN
```

---

*[File này sẽ tiếp tục với các câu hỏi còn lại về JPA/Hibernate...]*

