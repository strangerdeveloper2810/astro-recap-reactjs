# SOLID Principles - Interview Questions

## Part 1: Basic Understanding (Questions 1-10)

### Q1: SOLID là gì? Tại sao cần SOLID principles trong phát triển phần mềm?

**Độ khó:** Junior/Mid

**Câu trả lời:**

SOLID là 5 nguyên tắc cơ bản của lập trình hướng đối tượng (OOP) được Robert C. Martin đề xuất, giúp code dễ bảo trì, mở rộng và test hơn.

**5 Nguyên tắc SOLID:**

```
S - Single Responsibility Principle (SRP)
O - Open/Closed Principle (OCP)
L - Liskov Substitution Principle (LSP)
I - Interface Segregation Principle (ISP)
D - Dependency Inversion Principle (DIP)
```

**Tại sao cần SOLID:**

1. **Maintainability** - Code dễ bảo trì, sửa lỗi nhanh
2. **Scalability** - Dễ mở rộng tính năng mới
3. **Testability** - Dễ viết unit tests
4. **Reusability** - Code có thể tái sử dụng
5. **Reduced Coupling** - Giảm sự phụ thuộc giữa các components
6. **Better Design** - Kiến trúc rõ ràng, dễ hiểu

**Ví dụ vi phạm vs tuân thủ SOLID:**

```java
// ❌ VI PHẠM - Class làm quá nhiều việc
public class UserService {
    public void createUser(User user) {
        // Validate
        if (user.getEmail() == null) {
            throw new IllegalArgumentException("Email required");
        }

        // Save to database
        Connection conn = DriverManager.getConnection("jdbc:mysql://...");
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO users...");
        stmt.executeUpdate();

        // Send email
        MimeMessage message = new MimeMessage(session);
        message.setSubject("Welcome!");
        Transport.send(message);

        // Log
        System.out.println("User created: " + user.getId());
    }
}

// ✅ TUÂN THỦ - Chia nhỏ trách nhiệm
public class UserService {
    private final UserValidator validator;
    private final UserRepository repository;
    private final EmailService emailService;
    private final Logger logger;

    public void createUser(User user) {
        validator.validate(user);
        User savedUser = repository.save(user);
        emailService.sendWelcomeEmail(savedUser);
        logger.info("User created: {}", savedUser.getId());
    }
}
```

---

### Q2: Giải thích Single Responsibility Principle (SRP) với ví dụ thực tế

**Độ khó:** Junior/Mid

**Câu trả lời:**

**SRP:** Một class chỉ nên có MỘT lý do để thay đổi. Mỗi class chỉ chịu trách nhiệm về MỘT phần chức năng của ứng dụng.

**Ví dụ vi phạm SRP:**

```java
// ❌ BAD - Employee class làm quá nhiều việc
public class Employee {
    private String name;
    private double salary;

    // Business logic
    public double calculatePay() {
        return salary * 1.2; // Bonus 20%
    }

    // Database operations
    public void save() {
        // SQL code to save employee
        Connection conn = DriverManager.getConnection(...);
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO employees...");
        stmt.executeUpdate();
    }

    // Reporting
    public String generateReport() {
        return "Employee: " + name + ", Salary: " + salary;
    }
}

// Vấn đề:
// - Thay đổi cách tính lương → phải sửa Employee class
// - Thay đổi database → phải sửa Employee class
// - Thay đổi format report → phải sửa Employee class
// → 3 lý do để thay đổi 1 class!
```

**Áp dụng SRP:**

```java
// ✅ GOOD - Tách thành nhiều classes, mỗi class 1 trách nhiệm

// 1. Business Entity - Chỉ chứa data và business logic đơn giản
public class Employee {
    private String id;
    private String name;
    private double baseSalary;

    // Getters/Setters only
    public String getId() { return id; }
    public String getName() { return name; }
    public double getBaseSalary() { return baseSalary; }
}

// 2. Salary Calculator - Chịu trách nhiệm tính toán lương
public class SalaryCalculator {
    private static final double BONUS_RATE = 0.2;

    public double calculatePay(Employee employee) {
        return employee.getBaseSalary() * (1 + BONUS_RATE);
    }

    public double calculateTax(Employee employee) {
        double salary = calculatePay(employee);
        return salary * 0.1; // 10% tax
    }
}

// 3. Employee Repository - Chịu trách nhiệm lưu trữ
public class EmployeeRepository {
    private final JdbcTemplate jdbcTemplate;

    public void save(Employee employee) {
        String sql = "INSERT INTO employees (id, name, base_salary) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql,
            employee.getId(),
            employee.getName(),
            employee.getBaseSalary()
        );
    }

    public Employee findById(String id) {
        String sql = "SELECT * FROM employees WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, new EmployeeRowMapper(), id);
    }
}

// 4. Report Generator - Chịu trách nhiệm tạo báo cáo
public class EmployeeReportGenerator {
    private final SalaryCalculator calculator;

    public String generatePayrollReport(Employee employee) {
        double pay = calculator.calculatePay(employee);
        return String.format("Employee: %s\nSalary: $%.2f",
            employee.getName(), pay);
    }

    public String generateTaxReport(Employee employee) {
        double tax = calculator.calculateTax(employee);
        return String.format("Employee: %s\nTax: $%.2f",
            employee.getName(), tax);
    }
}

// Usage
public class PayrollService {
    private final EmployeeRepository repository;
    private final SalaryCalculator calculator;
    private final EmployeeReportGenerator reportGenerator;

    public void processPayroll(String employeeId) {
        Employee employee = repository.findById(employeeId);
        double pay = calculator.calculatePay(employee);
        String report = reportGenerator.generatePayrollReport(employee);

        System.out.println(report);
    }
}
```

**Lợi ích của SRP:**

```
✅ Dễ test - Mỗi class test độc lập
✅ Dễ maintain - Sửa lương không ảnh hưởng database
✅ Dễ reuse - SalaryCalculator dùng ở nhiều nơi
✅ Giảm coupling - Các class độc lập với nhau
✅ Follow clean architecture - Tách business logic khỏi infrastructure
```

---

### Q3: Giải thích Open/Closed Principle (OCP) với ví dụ Spring Boot

**Độ khó:** Mid/Senior

**Câu trả lời:**

**OCP:** Software entities (classes, modules, functions) nên **OPEN for extension** nhưng **CLOSED for modification**.

Có nghĩa là: Khi thêm tính năng mới, ta nên **mở rộng** code (thêm code mới) chứ không **sửa đổi** code cũ.

**Ví dụ vi phạm OCP:**

```java
// ❌ BAD - Mỗi lần thêm payment method mới phải sửa class này
@Service
public class PaymentService {

    public void processPayment(Order order, String paymentType) {
        if (paymentType.equals("CREDIT_CARD")) {
            // Process credit card
            System.out.println("Processing credit card payment");
            // Credit card specific logic...

        } else if (paymentType.equals("PAYPAL")) {
            // Process PayPal
            System.out.println("Processing PayPal payment");
            // PayPal specific logic...

        } else if (paymentType.equals("BANK_TRANSFER")) {
            // Process bank transfer
            System.out.println("Processing bank transfer");
            // Bank transfer specific logic...

        }
        // Mỗi lần thêm payment method mới phải sửa code này!
        // Nếu thêm Bitcoin, Apple Pay, Google Pay... phải sửa mãi!
    }
}
```

**Áp dụng OCP với Strategy Pattern:**

```java
// ✅ GOOD - Extension point với interface

// 1. Define contract (abstraction)
public interface PaymentStrategy {
    void processPayment(Order order);
    String getPaymentType();
}

// 2. Implement different payment methods (extensions)
@Component
public class CreditCardPayment implements PaymentStrategy {

    @Override
    public void processPayment(Order order) {
        System.out.println("Processing credit card payment for: " + order.getId());
        // Credit card specific logic
        validateCardNumber(order.getPaymentDetails());
        chargeCard(order.getAmount());
    }

    @Override
    public String getPaymentType() {
        return "CREDIT_CARD";
    }

    private void validateCardNumber(String cardNumber) { /* ... */ }
    private void chargeCard(double amount) { /* ... */ }
}

@Component
public class PayPalPayment implements PaymentStrategy {

    @Override
    public void processPayment(Order order) {
        System.out.println("Processing PayPal payment for: " + order.getId());
        // PayPal specific logic
        redirectToPayPal(order);
    }

    @Override
    public String getPaymentType() {
        return "PAYPAL";
    }

    private void redirectToPayPal(Order order) { /* ... */ }
}

@Component
public class BankTransferPayment implements PaymentStrategy {

    @Override
    public void processPayment(Order order) {
        System.out.println("Processing bank transfer for: " + order.getId());
        // Bank transfer specific logic
        generateTransferReference(order);
    }

    @Override
    public String getPaymentType() {
        return "BANK_TRANSFER";
    }

    private void generateTransferReference(Order order) { /* ... */ }
}

// 3. PaymentService KHÔNG CẦN SỬA khi thêm payment method mới
@Service
public class PaymentService {
    private final Map<String, PaymentStrategy> paymentStrategies;

    // Spring auto-inject all PaymentStrategy implementations
    @Autowired
    public PaymentService(List<PaymentStrategy> strategies) {
        this.paymentStrategies = strategies.stream()
            .collect(Collectors.toMap(
                PaymentStrategy::getPaymentType,
                Function.identity()
            ));
    }

    public void processPayment(Order order, String paymentType) {
        PaymentStrategy strategy = paymentStrategies.get(paymentType);

        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported payment type: " + paymentType);
        }

        strategy.processPayment(order);
    }
}

// 4. Thêm payment method MỚI - CHỈ THÊM CODE, KHÔNG SỬA CODE CŨ
@Component
public class BitcoinPayment implements PaymentStrategy {

    @Override
    public void processPayment(Order order) {
        System.out.println("Processing Bitcoin payment for: " + order.getId());
        generateWalletAddress(order);
        waitForConfirmation();
    }

    @Override
    public String getPaymentType() {
        return "BITCOIN";
    }

    private void generateWalletAddress(Order order) { /* ... */ }
    private void waitForConfirmation() { /* ... */ }
}

// PaymentService KHÔNG CẦN SỬA!
// Spring tự động inject BitcoinPayment vào Map
```

**Real-world example - Notification Service:**

```java
// Notification system cần gửi qua nhiều kênh

// Interface (Open for extension)
public interface NotificationChannel {
    void send(String message, String recipient);
    String getChannelType();
}

// Implementations (Extensions)
@Component
public class EmailNotification implements NotificationChannel {
    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void send(String message, String recipient) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(recipient);
        email.setText(message);
        mailSender.send(email);
    }

    @Override
    public String getChannelType() {
        return "EMAIL";
    }
}

@Component
public class SmsNotification implements NotificationChannel {
    @Autowired
    private TwilioClient twilioClient;

    @Override
    public void send(String message, String recipient) {
        twilioClient.sendSms(recipient, message);
    }

    @Override
    public String getChannelType() {
        return "SMS";
    }
}

@Component
public class PushNotification implements NotificationChannel {
    @Autowired
    private FirebaseMessaging fcm;

    @Override
    public void send(String message, String recipient) {
        Message fcmMessage = Message.builder()
            .setToken(recipient)
            .setNotification(Notification.builder()
                .setBody(message)
                .build())
            .build();
        fcm.send(fcmMessage);
    }

    @Override
    public String getChannelType() {
        return "PUSH";
    }
}

// Service không cần sửa khi thêm channel mới
@Service
public class NotificationService {
    private final Map<String, NotificationChannel> channels;

    @Autowired
    public NotificationService(List<NotificationChannel> channelList) {
        this.channels = channelList.stream()
            .collect(Collectors.toMap(
                NotificationChannel::getChannelType,
                Function.identity()
            ));
    }

    public void sendNotification(String channelType, String message, String recipient) {
        NotificationChannel channel = channels.get(channelType);
        if (channel != null) {
            channel.send(message, recipient);
        }
    }

    // Send to multiple channels
    public void broadcast(String message, String recipient, List<String> channelTypes) {
        channelTypes.forEach(type -> sendNotification(type, message, recipient));
    }
}

// Thêm Slack notification - CHỈ THÊM, KHÔNG SỬA
@Component
public class SlackNotification implements NotificationChannel {
    @Autowired
    private SlackClient slackClient;

    @Override
    public void send(String message, String recipient) {
        slackClient.postMessage(recipient, message);
    }

    @Override
    public String getChannelType() {
        return "SLACK";
    }
}
```

**Lợi ích OCP:**

```
✅ Thêm tính năng không ảnh hưởng code cũ
✅ Giảm risk khi deploy (không sửa code đã hoạt động tốt)
✅ Dễ test (test từng implementation riêng)
✅ Follow SOLID và Clean Architecture
✅ Code scalable và maintainable
```

---

### Q4: Giải thích Liskov Substitution Principle (LSP)

**Độ khó:** Mid/Senior

**Câu trả lời:**

**LSP:** Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.

Nói cách khác: Subclass phải có thể thay thế cho superclass mà không làm thay đổi tính đúng đắn của chương trình.

**Ví dụ vi phạm LSP:**

```java
// ❌ BAD - Square vi phạm LSP với Rectangle

public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) {
        this.width = width;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getArea() {
        return width * height;
    }
}

public class Square extends Rectangle {
    // Square luôn có width = height
    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width; // Thay đổi cả height!
    }

    @Override
    public void setHeight(int height) {
        this.height = height;
        this.width = height; // Thay đổi cả width!
    }
}

// Test code - Vi phạm LSP!
public void testRectangle(Rectangle rectangle) {
    rectangle.setWidth(5);
    rectangle.setHeight(4);

    assert rectangle.getArea() == 20; // Đúng với Rectangle
    // FAIL với Square! Area = 16 (4x4) thay vì 20
}

// Sử dụng
Rectangle rect = new Rectangle();
testRectangle(rect); // PASS ✅

Rectangle square = new Square();
testRectangle(square); // FAIL ❌ - Vi phạm LSP!
```

**Sửa lại tuân thủ LSP:**

```java
// ✅ GOOD - Dùng composition thay vì inheritance

public interface Shape {
    int getArea();
}

public class Rectangle implements Shape {
    private final int width;
    private final int height;

    public Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public int getArea() {
        return width * height;
    }

    public int getWidth() { return width; }
    public int getHeight() { return height; }
}

public class Square implements Shape {
    private final int side;

    public Square(int side) {
        this.side = side;
    }

    @Override
    public int getArea() {
        return side * side;
    }

    public int getSide() { return side; }
}

// Test code - Không còn vi phạm LSP
public void testShape(Shape shape) {
    int area = shape.getArea();
    System.out.println("Area: " + area);
}

// Sử dụng - Cả 2 đều hoạt động đúng
testShape(new Rectangle(5, 4)); // Area: 20 ✅
testShape(new Square(4));        // Area: 16 ✅
```

**Ví dụ thực tế trong Spring Boot:**

```java
// ❌ BAD - Vi phạm LSP với ReadOnlyRepository

public class UserRepository {
    public User findById(Long id) {
        // Fetch from database
        return entityManager.find(User.class, id);
    }

    public void save(User user) {
        // Save to database
        entityManager.persist(user);
    }

    public void delete(Long id) {
        // Delete from database
        User user = findById(id);
        entityManager.remove(user);
    }
}

// ReadOnlyUserRepository extends UserRepository
public class ReadOnlyUserRepository extends UserRepository {

    @Override
    public void save(User user) {
        // Vi phạm LSP - Thay đổi hành vi expected
        throw new UnsupportedOperationException("Read-only repository!");
    }

    @Override
    public void delete(Long id) {
        // Vi phạm LSP - Thay đổi hành vi expected
        throw new UnsupportedOperationException("Read-only repository!");
    }
}

// Code sử dụng - Bị break khi thay thế
public void processUser(UserRepository repository) {
    User user = repository.findById(1L);
    user.setName("Updated");
    repository.save(user); // FAIL với ReadOnlyUserRepository! ❌
}

// Sử dụng
processUser(new UserRepository());         // OK ✅
processUser(new ReadOnlyUserRepository()); // Exception ❌ - Vi phạm LSP!
```

**Sửa lại tuân thủ LSP:**

```java
// ✅ GOOD - Tách interface rõ ràng

public interface ReadOperations<T, ID> {
    T findById(ID id);
    List<T> findAll();
}

public interface WriteOperations<T, ID> {
    void save(T entity);
    void delete(ID id);
}

// Repository đầy đủ
public interface UserRepository extends ReadOperations<User, Long>, WriteOperations<User, Long> {
    // Có cả read và write
}

// Read-only repository - KHÔNG extend WriteOperations
public interface ReadOnlyUserRepository extends ReadOperations<User, Long> {
    // Chỉ có read operations
}

// Implementations
@Repository
public class JpaUserRepository implements UserRepository {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public User findById(Long id) {
        return entityManager.find(User.class, id);
    }

    @Override
    public List<User> findAll() {
        return entityManager.createQuery("SELECT u FROM User u", User.class)
            .getResultList();
    }

    @Override
    public void save(User user) {
        entityManager.persist(user);
    }

    @Override
    public void delete(Long id) {
        User user = findById(id);
        entityManager.remove(user);
    }
}

@Repository
public class ReadOnlyUserRepositoryImpl implements ReadOnlyUserRepository {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public User findById(Long id) {
        return entityManager.find(User.class, id);
    }

    @Override
    public List<User> findAll() {
        return entityManager.createQuery("SELECT u FROM User u", User.class)
            .getResultList();
    }

    // KHÔNG có save() và delete() - Tuân thủ LSP!
}

// Code sử dụng - Type-safe
public void readUser(ReadOperations<User, Long> repository) {
    User user = repository.findById(1L);
    System.out.println(user.getName());
}

public void writeUser(WriteOperations<User, Long> repository) {
    User user = new User("John");
    repository.save(user);
}

// Sử dụng - Compiler-safe
JpaUserRepository fullRepo = new JpaUserRepository();
readUser(fullRepo);  // OK ✅
writeUser(fullRepo); // OK ✅

ReadOnlyUserRepository readOnlyRepo = new ReadOnlyUserRepositoryImpl();
readUser(readOnlyRepo);  // OK ✅
writeUser(readOnlyRepo); // COMPILE ERROR ❌ - Không thể pass vào!
```

**Quy tắc tuân thủ LSP:**

```java
// Preconditions không được strict hơn
// Postconditions không được weak hơn
// Invariants phải được maintain

class Bird {
    void fly(int distance) {
        if (distance < 0) throw new IllegalArgumentException(); // Precondition
        // Fly logic
        assert getCurrentPosition() >= 0; // Postcondition
    }
}

// ❌ BAD - Penguin vi phạm LSP
class Penguin extends Bird {
    @Override
    void fly(int distance) {
        // Penguins can't fly!
        throw new UnsupportedOperationException();
    }
}

// ✅ GOOD - Tách interface
interface Bird {
    void eat();
}

interface FlyingBird extends Bird {
    void fly(int distance);
}

class Sparrow implements FlyingBird {
    public void eat() { /* ... */ }
    public void fly(int distance) { /* ... */ }
}

class Penguin implements Bird {
    public void eat() { /* ... */ }
    // Không có fly() - Tuân thủ LSP!
}
```

**Lợi ích LSP:**

```
✅ Polymorphism hoạt động đúng
✅ Code reliable và predictable
✅ Dễ extend mà không break existing code
✅ Interface segregation tốt hơn
```

---

### Q5: Giải thích Interface Segregation Principle (ISP)

**Độ khó:** Mid/Senior

**Câu trả lời:**

**ISP:** Clients should not be forced to depend on interfaces they don't use.

Nên tách interface lớn thành nhiều interface nhỏ, specific hơn. Client chỉ implement những gì cần.

**Ví dụ vi phạm ISP:**

```java
// ❌ BAD - Fat interface buộc implement methods không cần thiết

public interface Worker {
    void work();
    void eat();
    void sleep();
    void getSalary();
}

// Human worker - OK, cần tất cả
public class HumanWorker implements Worker {
    @Override
    public void work() {
        System.out.println("Human working...");
    }

    @Override
    public void eat() {
        System.out.println("Human eating...");
    }

    @Override
    public void sleep() {
        System.out.println("Human sleeping...");
    }

    @Override
    public void getSalary() {
        System.out.println("Getting salary...");
    }
}

// Robot worker - Bị buộc implement eat() và sleep() không cần!
public class RobotWorker implements Worker {
    @Override
    public void work() {
        System.out.println("Robot working...");
    }

    @Override
    public void eat() {
        // Robot doesn't eat! Buộc phải implement
        throw new UnsupportedOperationException("Robot doesn't eat!");
    }

    @Override
    public void sleep() {
        // Robot doesn't sleep! Buộc phải implement
        throw new UnsupportedOperationException("Robot doesn't sleep!");
    }

    @Override
    public void getSalary() {
        // Robot doesn't get salary! Buộc phải implement
        throw new UnsupportedOperationException("Robot doesn't get paid!");
    }
}
```

**Áp dụng ISP:**

```java
// ✅ GOOD - Tách thành nhiều interfaces nhỏ, specific

// Base interface - Chỉ chức năng cơ bản
public interface Workable {
    void work();
}

// Interface cho sinh vật cần ăn
public interface Eatable {
    void eat();
}

// Interface cho sinh vật cần ngủ
public interface Sleepable {
    void sleep();
}

// Interface cho nhân viên nhận lương
public interface Payable {
    void getSalary();
}

// Human worker - Implement tất cả
public class HumanWorker implements Workable, Eatable, Sleepable, Payable {
    @Override
    public void work() {
        System.out.println("Human working...");
    }

    @Override
    public void eat() {
        System.out.println("Human eating...");
    }

    @Override
    public void sleep() {
        System.out.println("Human sleeping...");
    }

    @Override
    public void getSalary() {
        System.out.println("Getting salary...");
    }
}

// Robot worker - Chỉ implement những gì cần
public class RobotWorker implements Workable {
    @Override
    public void work() {
        System.out.println("Robot working 24/7...");
    }
    // KHÔNG CẦN implement eat(), sleep(), getSalary()
}

// Manager
public class WorkManager {
    // Chỉ cần Workable, không care về eat/sleep
    public void manage(Workable worker) {
        worker.work();
    }

    // Chỉ process lương cho những worker có Payable
    public void processPayroll(Payable employee) {
        employee.getSalary();
    }
}
```

**Ví dụ thực tế Spring Boot - Repository Pattern:**

```java
// ❌ BAD - CrudRepository buộc implement tất cả

public interface Repository<T, ID> {
    // Read operations
    T findById(ID id);
    List<T> findAll();

    // Write operations
    T save(T entity);
    void delete(ID id);

    // Batch operations
    void saveAll(List<T> entities);
    void deleteAll();

    // Count operations
    long count();
    boolean existsById(ID id);
}

// Reporting service - Chỉ cần read, nhưng buộc implement write!
public class UserReportRepository implements Repository<User, Long> {
    // Need these
    @Override
    public User findById(Long id) { /* ... */ }

    @Override
    public List<User> findAll() { /* ... */ }

    // Don't need but forced to implement!
    @Override
    public User save(User entity) {
        throw new UnsupportedOperationException("Read-only!");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Read-only!");
    }

    @Override
    public void saveAll(List<User> entities) {
        throw new UnsupportedOperationException("Read-only!");
    }

    @Override
    public void deleteAll() {
        throw new UnsupportedOperationException("Read-only!");
    }

    @Override
    public long count() { /* ... */ }

    @Override
    public boolean existsById(Long id) { /* ... */ }
}
```

**Áp dụng ISP - Như Spring Data JPA thực tế làm:**

```java
// ✅ GOOD - Segregate interfaces

// 1. Repository marker interface
public interface Repository<T, ID> {
    // Empty marker interface
}

// 2. Read-only operations
public interface ReadRepository<T, ID> extends Repository<T, ID> {
    Optional<T> findById(ID id);
    List<T> findAll();
    boolean existsById(ID id);
    long count();
}

// 3. Write operations
public interface WriteRepository<T, ID> extends Repository<T, ID> {
    <S extends T> S save(S entity);
    void delete(T entity);
    void deleteById(ID id);
}

// 4. Batch operations
public interface BatchRepository<T, ID> extends Repository<T, ID> {
    <S extends T> List<S> saveAll(Iterable<S> entities);
    void deleteAll();
    void deleteAll(Iterable<? extends T> entities);
}

// 5. Paging operations
public interface PagingRepository<T, ID> extends Repository<T, ID> {
    Page<T> findAll(Pageable pageable);
}

// 6. Full CRUD = Read + Write
public interface CrudRepository<T, ID>
    extends ReadRepository<T, ID>, WriteRepository<T, ID> {
}

// 7. Full JPA = CRUD + Batch + Paging
public interface JpaRepository<T, ID>
    extends CrudRepository<T, ID>, BatchRepository<T, ID>, PagingRepository<T, ID> {
}

// Usage - Chọn interface phù hợp

// Read-only service - Chỉ cần ReadRepository
@Service
public class UserReportService {
    private final ReadRepository<User, Long> userRepository;

    public UserReportService(ReadRepository<User, Long> userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}

// Full CRUD service - Dùng CrudRepository
@Service
public class UserManagementService {
    private final CrudRepository<User, Long> userRepository;

    public UserManagementService(CrudRepository<User, Long> userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

// Implementation - Chỉ implement interface cần
@Repository
public interface UserReadOnlyRepository extends ReadRepository<User, Long> {
    // Spring Data JPA tự generate implementation
    // CHỈ có read operations
}

@Repository
public interface UserCrudRepository extends CrudRepository<User, Long> {
    // Có cả read và write
}

@Repository
public interface UserJpaRepository extends JpaRepository<User, Long> {
    // Full features: CRUD + Batch + Paging
}
```

**Real-world example - File Operations:**

```java
// ❌ BAD - Fat interface

public interface FileSystem {
    // Read operations
    byte[] readFile(String path);
    String readTextFile(String path);

    // Write operations
    void writeFile(String path, byte[] data);
    void writeTextFile(String path, String text);
    void appendFile(String path, byte[] data);

    // Delete operations
    void deleteFile(String path);
    void deleteDirectory(String path);

    // Permissions
    void setPermissions(String path, Permissions permissions);
    Permissions getPermissions(String path);
}

// Log reader - Chỉ cần read, nhưng buộc implement tất cả!
public class LogFileReader implements FileSystem {
    // Need
    @Override
    public String readTextFile(String path) { /* ... */ }

    // Don't need but forced to implement
    @Override
    public void writeFile(String path, byte[] data) {
        throw new UnsupportedOperationException();
    }
    // ... 7 methods khác không cần!
}

// ✅ GOOD - Segregate

public interface FileReader {
    byte[] readFile(String path);
    String readTextFile(String path);
}

public interface FileWriter {
    void writeFile(String path, byte[] data);
    void writeTextFile(String path, String text);
    void appendFile(String path, byte[] data);
}

public interface FileDeleter {
    void deleteFile(String path);
    void deleteDirectory(String path);
}

public interface FilePermissions {
    void setPermissions(String path, Permissions permissions);
    Permissions getPermissions(String path);
}

// Full file system
public interface FileSystem
    extends FileReader, FileWriter, FileDeleter, FilePermissions {
}

// Log reader - Chỉ implement FileReader
public class LogFileReader implements FileReader {
    @Override
    public byte[] readFile(String path) { /* ... */ }

    @Override
    public String readTextFile(String path) { /* ... */ }
    // DONE! Chỉ 2 methods
}

// Config writer - Chỉ implement FileWriter
public class ConfigWriter implements FileWriter {
    @Override
    public void writeFile(String path, byte[] data) { /* ... */ }

    @Override
    public void writeTextFile(String path, String text) { /* ... */ }

    @Override
    public void appendFile(String path, byte[] data) { /* ... */ }
}
```

**Lợi ích ISP:**

```
✅ Classes chỉ depend vào methods thực sự cần
✅ Giảm coupling
✅ Dễ test - Mock ít methods hơn
✅ Dễ implement - Không bị buộc implement methods không cần
✅ Code clean và rõ ràng hơn
```

---

### Q6: Giải thích Dependency Inversion Principle (DIP) với ví dụ Spring Boot

**Độ khó:** Mid/Senior

**Câu trả lời:**

**DIP gồm 2 phần:**

1. **High-level modules** không nên phụ thuộc vào **low-level modules**. Cả hai nên phụ thuộc vào **abstractions** (interfaces).
2. **Abstractions** không nên phụ thuộc vào **details**. **Details** nên phụ thuộc vào **abstractions**.

Hiểu đơn giản: **Depend on interfaces, not concrete classes**.

**Ví dụ vi phạm DIP:**

```java
// ❌ BAD - OrderService phụ thuộc trực tiếp vào MySQLOrderRepository
@Service
public class OrderService {

    private MySQLOrderRepository repository;  // Phụ thuộc vào concrete class!

    public OrderService() {
        this.repository = new MySQLOrderRepository();  // Tạo trực tiếp!
    }

    public Order createOrder(Order order) {
        return repository.save(order);
    }
}

@Repository
public class MySQLOrderRepository {
    public Order save(Order order) {
        // MySQL specific logic
        System.out.println("Saving to MySQL");
        return order;
    }
}
```

**Vấn đề:**
- Không thể đổi từ MySQL sang PostgreSQL mà không sửa `OrderService`
- Không thể test `OrderService` với mock repository
- Vi phạm DIP: High-level (`OrderService`) phụ thuộc vào low-level (`MySQLOrderRepository`)

**Ví dụ tuân theo DIP:**

```java
// ✅ GOOD - Cả hai depend vào interface OrderRepository

// Interface (Abstraction)
public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findAll();
}

// High-level module - Phụ thuộc vào abstraction
@Service
public class OrderService {

    private final OrderRepository repository;  // Depend on interface!

    // Spring tự động inject implementation
    @Autowired
    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public Order createOrder(Order order) {
        // Business logic
        order.setStatus("PENDING");
        return repository.save(order);
    }
}

// Low-level module 1 - Implement abstraction
@Repository
@Profile("mysql")
public class MySQLOrderRepository implements OrderRepository {

    @Override
    public Order save(Order order) {
        System.out.println("Saving to MySQL");
        return order;
    }

    @Override
    public Optional<Order> findById(Long id) { /* ... */ }

    @Override
    public List<Order> findAll() { /* ... */ }
}

// Low-level module 2 - Implement abstraction
@Repository
@Profile("postgres")
public class PostgreSQLOrderRepository implements OrderRepository {

    @Override
    public Order save(Order order) {
        System.out.println("Saving to PostgreSQL");
        return order;
    }

    @Override
    public Optional<Order> findById(Long id) { /* ... */ }

    @Override
    public List<Order> findAll() { /* ... */ }
}

// Low-level module 3 - For testing
@Repository
@Profile("test")
public class InMemoryOrderRepository implements OrderRepository {
    private Map<Long, Order> storage = new HashMap<>();
    private AtomicLong idGenerator = new AtomicLong();

    @Override
    public Order save(Order order) {
        if (order.getId() == null) {
            order.setId(idGenerator.incrementAndGet());
        }
        storage.put(order.getId(), order);
        return order;
    }

    @Override
    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public List<Order> findAll() {
        return new ArrayList<>(storage.values());
    }
}
```

**Lợi ích DIP:**

```
✅ Dễ thay đổi implementation - Đổi DB không sửa service
✅ Dễ test - Mock interface dễ dàng
✅ Giảm coupling - Service không biết MySQL hay PostgreSQL
✅ Flexible - Thêm MongoDB repository không sửa code cũ
✅ Follow dependency rule - Dependencies point inward
```

**Config Spring Boot để switch implementation:**

```yaml
# application-dev.yml
spring:
  profiles:
    active: mysql

# application-test.yml
spring:
  profiles:
    active: test

# application-prod.yml
spring:
  profiles:
    active: postgres
```

---

### Q7: Khi nào nên và không nên áp dụng từng nguyên tắc SOLID?

**Độ khó:** Senior

**Câu trả lời:**

#### **Single Responsibility Principle (SRP)**

**NÊN áp dụng khi:**
- Class có nhiều lý do để thay đổi
- Có logic nghiệp vụ khác nhau trong một class
- Class quá dài (>300 lines)
- Khó test vì quá nhiều dependencies

**KHÔNG NÊN over-apply khi:**
- Class rất nhỏ (<50 lines) và đơn giản
- Tách class sẽ tạo ra quá nhiều class nhỏ vô nghĩa
- Các responsibilities thực sự liên quan chặt chẽ

```java
// ❌ OVER-ENGINEERING - Tách quá nhiều cho class đơn giản
public class UserNameGetter {
    public String getName(User user) { return user.getName(); }
}

public class UserEmailGetter {
    public String getEmail(User user) { return user.getEmail(); }
}

// ✅ GOOD - Đơn giản thế này là đủ
public class UserDTO {
    private String name;
    private String email;

    public UserDTO(User user) {
        this.name = user.getName();
        this.email = user.getEmail();
    }
}
```

#### **Open/Closed Principle (OCP)**

**NÊN áp dụng khi:**
- Có nhiều variants của một behavior (payment methods, notifications, etc.)
- Biết chắc sẽ có thêm variants trong tương lai
- Cần plugin architecture

**KHÔNG NÊN over-apply khi:**
- Chỉ có 1-2 implementations và không dự định mở rộng
- Behavior rất stable, không thay đổi
- Tạo abstraction quá sớm gây phức tạp không cần thiết

```java
// ❌ OVER-ENGINEERING - Tạo interface cho thứ không bao giờ thay đổi
public interface StringConcatenator {
    String concat(String a, String b);
}

public class BasicStringConcatenator implements StringConcatenator {
    public String concat(String a, String b) {
        return a + b;  // Seriously?
    }
}

// ✅ GOOD - Đơn giản thôi
public class Utils {
    public static String concat(String a, String b) {
        return a + b;
    }
}
```

#### **Liskov Substitution Principle (LSP)**

**NÊN áp dụng khi:**
- Sử dụng inheritance
- Tạo polymorphic collections
- Framework code, library code

**KHÔNG NÊN khi:**
- Không dùng inheritance → LSP không áp dụng
- Có thể dùng composition thay inheritance

```java
// ✅ GOOD - Dùng composition thay inheritance khi không có "is-a" relationship
public class User {
    private Address address;  // HAS-A, không phải IS-A

    public void updateAddress(Address newAddress) {
        this.address = newAddress;
    }
}
```

#### **Interface Segregation Principle (ISP)**

**NÊN áp dụng khi:**
- Interface có >5-7 methods
- Clients chỉ cần một phần methods
- Có nhiều implementations với capabilities khác nhau

**KHÔNG NÊN over-apply khi:**
- Interface chỉ có 2-3 methods
- Tất cả clients đều cần tất cả methods
- Tách interface gây phức tạp và khó maintain

```java
// ❌ OVER-ENGINEERING - Tách interface quá nhỏ
public interface UserIdGetter {
    Long getId();
}

public interface UserNameGetter {
    String getName();
}

// ✅ GOOD - Interface nhỏ thế này không cần tách
public interface User {
    Long getId();
    String getName();
    String getEmail();
}
```

#### **Dependency Inversion Principle (DIP)**

**NÊN áp dụng khi:**
- Cần swap implementations (DB, external services)
- Cần test với mocks
- Có nhiều implementations của cùng một behavior

**KHÔNG NÊN over-apply khi:**
- Chắc chắn chỉ có 1 implementation (Java core classes, framework classes)
- Tạo interface cho mọi thứ gây boilerplate code vô nghĩa

```java
// ❌ OVER-ENGINEERING - Tạo interface cho thứ không bao giờ thay đổi
public interface StringFormatter {
    String format(String template, Object... args);
}

public class JavaStringFormatter implements StringFormatter {
    public String format(String template, Object... args) {
        return String.format(template, args);  // Wrapper vô nghĩa
    }
}

// ✅ GOOD - Dùng trực tiếp
public class MessageService {
    public String formatMessage(String template, Object... args) {
        return String.format(template, args);
    }
}
```

#### **Tổng kết - SOLID Trade-offs:**

| Nguyên tắc | Lợi ích | Chi phí | Khi nào áp dụng |
|------------|---------|---------|----------------|
| **SRP** | Dễ maintain, test | Nhiều classes hơn | Class có >2 responsibilities |
| **OCP** | Dễ extend | Code phức tạp hơn | Có nhiều variants |
| **LSP** | Polymorphism an toàn | Cẩn thận với inheritance | Khi dùng inheritance |
| **ISP** | Clients không depend methods vô dụng | Nhiều interfaces | Interface có >5 methods |
| **DIP** | Dễ swap, test | Thêm abstraction layer | Cần flexibility |

**Quy tắc vàng:**
```
Start simple → Refactor to SOLID when pain points appear
Không apply SOLID từ đầu cho code đơn giản!
```

---

### Q8: Làm thế nào để refactor code legacy vi phạm SOLID thành code tuân thủ SOLID? Cho ví dụ cụ thể.

**Độ khó:** Senior

**Câu trả lời:**

#### **Ví dụ: Refactor Legacy E-commerce Order Processing**

**Code legacy ban đầu (vi phạm tất cả SOLID):**

```java
@Service
public class OrderProcessor {

    // Vi phạm DIP - Depend on concrete classes
    private MySQLConnection dbConnection;
    private SmtpEmailSender emailSender;

    public OrderProcessor() {
        this.dbConnection = new MySQLConnection("localhost", 3306);
        this.emailSender = new SmtpEmailSender("smtp.gmail.com", 587);
    }

    // Vi phạm SRP - Quá nhiều responsibilities
    public void processOrder(Map<String, Object> orderData) {

        // 1. Validate order (validation responsibility)
        String customerEmail = (String) orderData.get("email");
        if (customerEmail == null || !customerEmail.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }

        Double totalAmount = (Double) orderData.get("total");
        if (totalAmount == null || totalAmount <= 0) {
            throw new IllegalArgumentException("Invalid amount");
        }

        // 2. Calculate discount (business logic responsibility)
        String customerType = (String) orderData.get("customerType");
        double discount = 0;
        if (customerType.equals("VIP")) {
            discount = totalAmount * 0.2;
        } else if (customerType.equals("REGULAR")) {
            discount = totalAmount * 0.1;
        } else if (customerType.equals("NEW")) {
            discount = totalAmount * 0.05;
        }
        // Vi phạm OCP - Thêm customer type phải sửa code này

        double finalAmount = totalAmount - discount;

        // 3. Save to database (persistence responsibility)
        String sql = "INSERT INTO orders (email, total, discount, final_amount) VALUES (?, ?, ?, ?)";
        try {
            PreparedStatement stmt = dbConnection.getConnection().prepareStatement(sql);
            stmt.setString(1, customerEmail);
            stmt.setDouble(2, totalAmount);
            stmt.setDouble(3, discount);
            stmt.setDouble(4, finalAmount);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Database error", e);
        }

        // 4. Send notification (notification responsibility)
        String notificationType = (String) orderData.get("notificationType");
        if (notificationType.equals("EMAIL")) {
            emailSender.send(
                customerEmail,
                "Order Confirmation",
                "Your order total: $" + finalAmount
            );
        } else if (notificationType.equals("SMS")) {
            // Hardcoded SMS logic
            System.out.println("Sending SMS to customer");
        } else if (notificationType.equals("PUSH")) {
            // Hardcoded push notification
            System.out.println("Sending push notification");
        }
        // Vi phạm OCP - Thêm notification method phải sửa code

        // 5. Update inventory (inventory responsibility)
        List<Map<String, Object>> items = (List<Map<String, Object>>) orderData.get("items");
        for (Map<String, Object> item : items) {
            String productId = (String) item.get("productId");
            Integer quantity = (Integer) item.get("quantity");

            String updateSql = "UPDATE products SET stock = stock - ? WHERE id = ?";
            try {
                PreparedStatement stmt = dbConnection.getConnection().prepareStatement(updateSql);
                stmt.setInt(1, quantity);
                stmt.setString(2, productId);
                stmt.executeUpdate();
            } catch (SQLException e) {
                throw new RuntimeException("Inventory update failed", e);
            }
        }

        // Vi phạm SRP: 5 responsibilities trong 1 class!
        // Vi phạm OCP: Thêm tính năng phải sửa code
        // Vi phạm DIP: Depend on concrete MySQL, SMTP
        // Không test được, coupling cao!
    }
}
```

#### **Bước 1: Áp dụng Single Responsibility Principle**

Tách thành nhiều classes, mỗi class 1 responsibility:

```java
// 1. Validation responsibility
@Component
public class OrderValidator {

    public void validate(OrderRequest request) {
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new ValidationException("Invalid email");
        }

        if (request.getTotal() == null || request.getTotal() <= 0) {
            throw new ValidationException("Invalid amount");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ValidationException("Order must have items");
        }
    }
}

// 2. Business logic responsibility
@Component
public class DiscountCalculator {

    public double calculateDiscount(CustomerType customerType, double totalAmount) {
        return switch (customerType) {
            case VIP -> totalAmount * 0.2;
            case REGULAR -> totalAmount * 0.1;
            case NEW -> totalAmount * 0.05;
        };
    }
}

// 3. Persistence responsibility
@Repository
public class OrderRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Order save(Order order) {
        String sql = "INSERT INTO orders (email, total, discount, final_amount) " +
                     "VALUES (?, ?, ?, ?)";

        jdbcTemplate.update(sql,
            order.getEmail(),
            order.getTotal(),
            order.getDiscount(),
            order.getFinalAmount()
        );

        return order;
    }
}

// 4. Inventory responsibility
@Service
public class InventoryService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void reduceStock(String productId, int quantity) {
        String sql = "UPDATE products SET stock = stock - ? WHERE id = ?";
        jdbcTemplate.update(sql, quantity, productId);
    }
}
```

#### **Bước 2: Áp dụng Open/Closed Principle**

Dùng Strategy pattern để extend without modification:

```java
// Interface cho discount strategy
public interface DiscountStrategy {
    double calculate(double totalAmount);
}

// Implementations
@Component("VIP_DISCOUNT")
public class VipDiscountStrategy implements DiscountStrategy {
    @Override
    public double calculate(double totalAmount) {
        return totalAmount * 0.2;
    }
}

@Component("REGULAR_DISCOUNT")
public class RegularDiscountStrategy implements DiscountStrategy {
    @Override
    public double calculate(double totalAmount) {
        return totalAmount * 0.1;
    }
}

@Component("NEW_DISCOUNT")
public class NewCustomerDiscountStrategy implements DiscountStrategy {
    @Override
    public double calculate(double totalAmount) {
        return totalAmount * 0.05;
    }
}

// Service sử dụng strategy
@Service
public class DiscountService {

    private final Map<String, DiscountStrategy> strategies;

    @Autowired
    public DiscountService(List<DiscountStrategy> strategyList) {
        this.strategies = strategyList.stream()
            .collect(Collectors.toMap(
                strategy -> strategy.getClass().getSimpleName(),
                Function.identity()
            ));
    }

    public double calculateDiscount(CustomerType customerType, double amount) {
        String strategyName = customerType.name() + "_DISCOUNT";
        DiscountStrategy strategy = strategies.get(strategyName);

        if (strategy == null) {
            throw new IllegalArgumentException("No strategy for: " + customerType);
        }

        return strategy.calculate(amount);
    }
}

// Notification strategy (OCP)
public interface NotificationStrategy {
    void send(String recipient, String subject, String body);
    NotificationType getType();
}

@Component
public class EmailNotificationStrategy implements NotificationStrategy {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void send(String recipient, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    @Override
    public NotificationType getType() {
        return NotificationType.EMAIL;
    }
}

@Component
public class SmsNotificationStrategy implements NotificationStrategy {

    @Autowired
    private SmsClient smsClient;

    @Override
    public void send(String recipient, String subject, String body) {
        smsClient.sendSms(recipient, body);
    }

    @Override
    public NotificationType getType() {
        return NotificationType.SMS;
    }
}

// Notification service
@Service
public class NotificationService {

    private final Map<NotificationType, NotificationStrategy> strategies;

    @Autowired
    public NotificationService(List<NotificationStrategy> strategyList) {
        this.strategies = strategyList.stream()
            .collect(Collectors.toMap(
                NotificationStrategy::getType,
                Function.identity()
            ));
    }

    public void sendNotification(NotificationType type, String recipient,
                                 String subject, String body) {
        NotificationStrategy strategy = strategies.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported notification type: " + type);
        }
        strategy.send(recipient, subject, body);
    }
}
```

#### **Bước 3: Áp dụng Dependency Inversion Principle**

Tạo interfaces và depend on abstractions:

```java
// Interface cho repository (DIP)
public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
}

// Implementation có thể swap
@Repository
@Primary
public class JdbcOrderRepository implements OrderRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public Order save(Order order) {
        // JDBC implementation
    }
}

@Repository
public class JpaOrderRepository implements OrderRepository {

    @Autowired
    private EntityManager entityManager;

    @Override
    public Order save(Order order) {
        // JPA implementation
    }
}
```

#### **Bước 4: Code cuối cùng sau khi refactor (Clean SOLID Code)**

```java
@Service
public class OrderProcessingService {

    private final OrderValidator validator;
    private final DiscountService discountService;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;

    // DIP - Depend on interfaces
    @Autowired
    public OrderProcessingService(
            OrderValidator validator,
            DiscountService discountService,
            OrderRepository orderRepository,
            InventoryService inventoryService,
            NotificationService notificationService) {
        this.validator = validator;
        this.discountService = discountService;
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
        this.notificationService = notificationService;
    }

    // SRP - Chỉ orchestrate, không làm business logic
    @Transactional
    public Order processOrder(OrderRequest request) {

        // 1. Validate
        validator.validate(request);

        // 2. Calculate discount (OCP - Thêm strategy không sửa code này)
        double discount = discountService.calculateDiscount(
            request.getCustomerType(),
            request.getTotal()
        );

        // 3. Create order
        Order order = Order.builder()
            .email(request.getEmail())
            .total(request.getTotal())
            .discount(discount)
            .finalAmount(request.getTotal() - discount)
            .status(OrderStatus.PENDING)
            .build();

        // 4. Save order (DIP - Không biết JDBC hay JPA)
        order = orderRepository.save(order);

        // 5. Update inventory
        for (OrderItem item : request.getItems()) {
            inventoryService.reduceStock(item.getProductId(), item.getQuantity());
        }

        // 6. Send notification (OCP - Thêm notification type không sửa code này)
        notificationService.sendNotification(
            request.getNotificationType(),
            request.getEmail(),
            "Order Confirmation",
            "Your order total: $" + order.getFinalAmount()
        );

        return order;
    }
}
```

#### **Kết quả sau refactoring:**

| Aspect | Before | After |
|--------|--------|-------|
| **Lines in main class** | ~150 lines | ~50 lines |
| **Responsibilities** | 5+ in one class | 1 per class |
| **Testability** | Cannot unit test | Easy to mock/test |
| **Adding new discount** | Modify if-else | Add new strategy class |
| **Adding notification type** | Modify if-else | Add new strategy class |
| **Changing database** | Rewrite class | Swap repository impl |
| **Coupling** | High | Low |
| **SOLID violations** | All 5 | None |

---

### Q9: SOLID principles và Design Patterns - Mối quan hệ như thế nào?

**Độ khó:** Senior

**Câu trả lời:**

SOLID principles là **foundation**, Design Patterns là **implementation strategies** để achieve SOLID.

#### **Strategy Pattern → OCP + DIP**

```java
// OCP: Extend behavior without modifying existing code
// DIP: Depend on PaymentStrategy interface

public interface PaymentStrategy {
    PaymentResult process(Payment payment);
}

@Component
public class CreditCardStrategy implements PaymentStrategy {
    @Override
    public PaymentResult process(Payment payment) { /* ... */ }
}

@Component
public class PayPalStrategy implements PaymentStrategy {
    @Override
    public PaymentResult process(Payment payment) { /* ... */ }
}

@Service
public class PaymentProcessor {
    private final Map<PaymentType, PaymentStrategy> strategies;

    // DIP: Depend on abstraction (PaymentStrategy interface)
    @Autowired
    public PaymentProcessor(List<PaymentStrategy> strategyList) {
        // Auto-wire all implementations
    }

    // OCP: Thêm payment method không sửa code này
    public PaymentResult process(Payment payment) {
        PaymentStrategy strategy = strategies.get(payment.getType());
        return strategy.process(payment);
    }
}
```

#### **Factory Pattern → OCP + DIP**

```java
// DIP: Return interface, not concrete class
// OCP: Thêm notification type không sửa factory

public interface NotificationFactory {
    Notification create(NotificationType type);
}

@Component
public class NotificationFactoryImpl implements NotificationFactory {

    @Autowired
    private ApplicationContext context;

    // OCP: Thêm type mới không sửa code này
    @Override
    public Notification create(NotificationType type) {
        return switch (type) {
            case EMAIL -> context.getBean(EmailNotification.class);
            case SMS -> context.getBean(SmsNotification.class);
            case PUSH -> context.getBean(PushNotification.class);
        };
    }
}

@Service
public class NotificationService {

    private final NotificationFactory factory;  // DIP

    @Autowired
    public NotificationService(NotificationFactory factory) {
        this.factory = factory;
    }

    public void send(NotificationType type, String recipient, String message) {
        Notification notification = factory.create(type);  // DIP
        notification.send(recipient, message);
    }
}
```

#### **Decorator Pattern → OCP + SRP**

```java
// OCP: Thêm behavior mới bằng cách wrap, không sửa code cũ
// SRP: Mỗi decorator có 1 responsibility

public interface DataSource {
    void writeData(String data);
    String readData();
}

// Base implementation
public class FileDataSource implements DataSource {
    private String filename;

    @Override
    public void writeData(String data) {
        // Write to file
    }

    @Override
    public String readData() {
        // Read from file
    }
}

// Decorator 1 - SRP: Chỉ encryption
public class EncryptionDecorator implements DataSource {
    private DataSource wrapped;

    public EncryptionDecorator(DataSource source) {
        this.wrapped = source;
    }

    @Override
    public void writeData(String data) {
        String encrypted = encrypt(data);
        wrapped.writeData(encrypted);
    }

    @Override
    public String readData() {
        String data = wrapped.readData();
        return decrypt(data);
    }
}

// Decorator 2 - SRP: Chỉ compression
public class CompressionDecorator implements DataSource {
    private DataSource wrapped;

    public CompressionDecorator(DataSource source) {
        this.wrapped = source;
    }

    @Override
    public void writeData(String data) {
        String compressed = compress(data);
        wrapped.writeData(compressed);
    }

    @Override
    public String readData() {
        String data = wrapped.readData();
        return decompress(data);
    }
}

// Usage - OCP: Thêm behavior bằng composition
DataSource source = new FileDataSource("data.txt");
source = new EncryptionDecorator(source);  // Add encryption
source = new CompressionDecorator(source);  // Add compression
source.writeData("sensitive data");
```

#### **Observer Pattern → OCP + DIP**

```java
// DIP: Subject depend on Observer interface
// OCP: Thêm observer mới không sửa Subject

public interface OrderObserver {
    void onOrderCreated(Order order);
}

@Component
public class EmailObserver implements OrderObserver {
    @Override
    public void onOrderCreated(Order order) {
        // Send email
    }
}

@Component
public class InventoryObserver implements OrderObserver {
    @Override
    public void onOrderCreated(Order order) {
        // Update inventory
    }
}

@Component
public class AnalyticsObserver implements OrderObserver {
    @Override
    public void onOrderCreated(Order order) {
        // Track analytics
    }
}

@Service
public class OrderService {

    private final List<OrderObserver> observers;  // DIP

    @Autowired
    public OrderService(List<OrderObserver> observers) {
        this.observers = observers;
    }

    // OCP: Thêm observer không sửa method này
    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        orderRepository.save(order);

        // Notify all observers
        observers.forEach(observer -> observer.onOrderCreated(order));

        return order;
    }
}
```

#### **Adapter Pattern → LSP + DIP**

```java
// LSP: Adapter hoàn toàn thay thế được interface
// DIP: Depend on interface, not third-party class

// Our interface
public interface PaymentGateway {
    PaymentResult charge(Amount amount, PaymentMethod method);
    PaymentResult refund(String transactionId);
}

// Third-party service 1
public class StripeClient {
    public StripeCharge createCharge(int cents, String token) { /* ... */ }
    public StripeRefund createRefund(String chargeId) { /* ... */ }
}

// Adapter 1 - LSP: Tuân theo PaymentGateway contract
@Service
public class StripeAdapter implements PaymentGateway {

    @Autowired
    private StripeClient stripeClient;

    @Override
    public PaymentResult charge(Amount amount, PaymentMethod method) {
        int cents = amount.toCents();
        StripeCharge charge = stripeClient.createCharge(cents, method.getToken());
        return PaymentResult.success(charge.getId());
    }

    @Override
    public PaymentResult refund(String transactionId) {
        StripeRefund refund = stripeClient.createRefund(transactionId);
        return PaymentResult.success(refund.getId());
    }
}

// Third-party service 2
public class PayPalSDK {
    public PayPalPayment pay(double dollars, String email) { /* ... */ }
    public PayPalReverse reverse(String paymentId) { /* ... */ }
}

// Adapter 2 - LSP: Tuân theo PaymentGateway contract
@Service
public class PayPalAdapter implements PaymentGateway {

    @Autowired
    private PayPalSDK paypalSDK;

    @Override
    public PaymentResult charge(Amount amount, PaymentMethod method) {
        double dollars = amount.toDollars();
        PayPalPayment payment = paypalSDK.pay(dollars, method.getEmail());
        return PaymentResult.success(payment.getTransactionId());
    }

    @Override
    public PaymentResult refund(String transactionId) {
        PayPalReverse reverse = paypalSDK.reverse(transactionId);
        return PaymentResult.success(reverse.getReverseId());
    }
}

// Service - DIP: Depend on interface
@Service
public class PaymentService {

    private final PaymentGateway gateway;  // DIP

    @Autowired
    public PaymentService(@Qualifier("stripeAdapter") PaymentGateway gateway) {
        this.gateway = gateway;
    }

    public PaymentResult processPayment(Order order) {
        return gateway.charge(order.getAmount(), order.getPaymentMethod());
    }
}
```

#### **Bảng tổng kết:**

| Design Pattern | SOLID Principles Applied | Benefit |
|----------------|-------------------------|---------|
| **Strategy** | OCP, DIP | Extend behavior, swap algorithms |
| **Factory** | OCP, DIP | Create objects, decouple creation |
| **Decorator** | OCP, SRP | Add behavior dynamically |
| **Observer** | OCP, DIP | Loose coupling, event handling |
| **Adapter** | LSP, DIP | Integrate third-party, swap implementations |
| **Template Method** | OCP, LSP | Define skeleton, vary steps |
| **Facade** | SRP, DIP | Simplify complex subsystem |
| **Proxy** | OCP, SRP | Control access, add behavior |

**Key insight:**
```
Design Patterns = Proven implementations of SOLID principles
SOLID = Guidelines, Patterns = Concrete solutions
```

---

### Q10: Viết unit tests cho code tuân thủ SOLID có khác gì code vi phạm SOLID?

**Độ khó:** Mid/Senior

**Câu trả lời:**

Code tuân thủ SOLID **dễ test hơn GẤP 10 LẦN** so với code vi phạm SOLID.

#### **Ví dụ 1: Test code vi phạm SOLID (NIGHTMARE)**

```java
// ❌ Code vi phạm SRP và DIP - NIGHTMARE để test
@Service
public class UserService {

    // Hardcoded dependencies - Không mock được!
    private MySQLDatabase database = new MySQLDatabase("localhost", 3306);
    private SmtpEmailSender emailSender = new SmtpEmailSender("smtp.gmail.com");
    private PasswordEncryptor encryptor = new BCryptEncryptor();

    public User registerUser(String email, String password) {
        // Validation
        if (!email.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }

        // Encrypt password
        String encryptedPassword = encryptor.encrypt(password);

        // Save to database (Real DB call!)
        database.execute("INSERT INTO users (email, password) VALUES (?, ?)",
                         email, encryptedPassword);

        // Send email (Real SMTP call!)
        emailSender.send(email, "Welcome", "Thanks for registering");

        return new User(email, encryptedPassword);
    }
}

// Test - IMPOSSIBLE to unit test!
@Test
public void testRegisterUser() {
    UserService service = new UserService();

    // ❌ Vấn đề:
    // 1. Cần MySQL server chạy
    // 2. Cần SMTP server chạy
    // 3. Không mock được dependencies
    // 4. Test chậm (real DB + SMTP)
    // 5. Test không isolated (depends on external systems)

    User user = service.registerUser("test@example.com", "password123");

    // Không assert được gì vì test fail thiếu external systems!
}
```

#### **Ví dụ 2: Test code tuân thủ SOLID (EASY)**

```java
// ✅ Code tuân thủ SRP và DIP - EASY to test

// Interfaces (DIP)
public interface UserRepository {
    void save(User user);
}

public interface EmailService {
    void sendWelcomeEmail(String email);
}

public interface PasswordEncryptor {
    String encrypt(String password);
}

// Service with dependency injection
@Service
public class UserRegistrationService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncryptor passwordEncryptor;

    // Constructor injection - Dễ mock!
    @Autowired
    public UserRegistrationService(
            UserRepository userRepository,
            EmailService emailService,
            PasswordEncryptor passwordEncryptor) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncryptor = passwordEncryptor;
    }

    public User registerUser(String email, String password) {
        // Validation
        if (!email.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }

        // Encrypt password
        String encryptedPassword = passwordEncryptor.encrypt(password);

        // Create user
        User user = new User(email, encryptedPassword);

        // Save user
        userRepository.save(user);

        // Send email
        emailService.sendWelcomeEmail(email);

        return user;
    }
}

// Test - EASY with mocks!
@ExtendWith(MockitoExtension.class)
class UserRegistrationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncryptor passwordEncryptor;

    @InjectMocks
    private UserRegistrationService service;

    @Test
    void shouldRegisterUserSuccessfully() {
        // Given
        String email = "test@example.com";
        String password = "password123";
        String encryptedPassword = "encrypted_password";

        when(passwordEncryptor.encrypt(password)).thenReturn(encryptedPassword);

        // When
        User user = service.registerUser(email, password);

        // Then
        assertThat(user.getEmail()).isEqualTo(email);
        assertThat(user.getPassword()).isEqualTo(encryptedPassword);

        // Verify interactions
        verify(passwordEncryptor).encrypt(password);
        verify(userRepository).save(any(User.class));
        verify(emailService).sendWelcomeEmail(email);
    }

    @Test
    void shouldThrowExceptionForInvalidEmail() {
        // When & Then
        assertThrows(IllegalArgumentException.class,
            () -> service.registerUser("invalid-email", "password123"));

        // Verify không call dependencies khi validation fail
        verify(passwordEncryptor, never()).encrypt(anyString());
        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendWelcomeEmail(anyString());
    }

    @Test
    void shouldHandleRepositoryFailure() {
        // Given
        when(passwordEncryptor.encrypt(anyString())).thenReturn("encrypted");
        doThrow(new DatabaseException("Connection failed"))
            .when(userRepository).save(any(User.class));

        // When & Then
        assertThrows(DatabaseException.class,
            () -> service.registerUser("test@example.com", "password123"));

        // Verify email không được gửi khi DB fail
        verify(emailService, never()).sendWelcomeEmail(anyString());
    }
}
```

#### **Ví dụ 3: Test Strategy Pattern (OCP)**

```java
// ✅ Dễ test từng strategy riêng biệt

@Test
void testVipDiscountStrategy() {
    DiscountStrategy strategy = new VipDiscountStrategy();

    double discount = strategy.calculate(1000.0);

    assertThat(discount).isEqualTo(200.0);  // 20% of 1000
}

@Test
void testRegularDiscountStrategy() {
    DiscountStrategy strategy = new RegularDiscountStrategy();

    double discount = strategy.calculate(1000.0);

    assertThat(discount).isEqualTo(100.0);  // 10% of 1000
}

// ✅ Test service với mock strategy
@Test
void testDiscountService() {
    DiscountStrategy mockStrategy = mock(DiscountStrategy.class);
    when(mockStrategy.calculate(1000.0)).thenReturn(250.0);

    DiscountService service = new DiscountService(
        Map.of("VIP_DISCOUNT", mockStrategy)
    );

    double discount = service.calculateDiscount(CustomerType.VIP, 1000.0);

    assertThat(discount).isEqualTo(250.0);
    verify(mockStrategy).calculate(1000.0);
}
```

#### **Ví dụ 4: Test với Test Doubles (DIP makes this easy)**

```java
// ✅ Fake implementation cho testing
public class InMemoryUserRepository implements UserRepository {
    private Map<String, User> storage = new HashMap<>();

    @Override
    public void save(User user) {
        storage.put(user.getEmail(), user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(storage.get(email));
    }

    // Test helper methods
    public int count() {
        return storage.size();
    }

    public void clear() {
        storage.clear();
    }
}

// Integration test with fake repository
@SpringBootTest
class UserRegistrationIntegrationTest {

    @Autowired
    private UserRegistrationService service;

    @Autowired
    private InMemoryUserRepository repository;

    @BeforeEach
    void setUp() {
        repository.clear();
    }

    @Test
    void shouldRegisterAndRetrieveUser() {
        // When
        service.registerUser("test@example.com", "password123");

        // Then
        Optional<User> user = repository.findByEmail("test@example.com");
        assertThat(user).isPresent();
        assertThat(repository.count()).isEqualTo(1);
    }
}
```

#### **So sánh Testing với và không có SOLID:**

| Aspect | Without SOLID | With SOLID |
|--------|--------------|------------|
| **Setup complexity** | High - Need real DB, SMTP, etc. | Low - Mock interfaces |
| **Test speed** | Slow (seconds) | Fast (milliseconds) |
| **Test isolation** | Low - Depends on external systems | High - Pure unit tests |
| **Flakiness** | High - Network, DB issues | Low - Deterministic |
| **Coverage** | Hard to test edge cases | Easy to test all paths |
| **Maintainability** | Hard - Breaks when dependencies change | Easy - Stable interfaces |
| **Test setup** | Complex fixtures, test data | Simple mocks |
| **TDD possible?** | No - Need full system | Yes - Test-first development |

#### **Key Testing Benefits từ SOLID:**

```java
// SRP → Test từng responsibility riêng biệt
@Test void testValidation() { /* ... */ }
@Test void testEncryption() { /* ... */ }
@Test void testPersistence() { /* ... */ }

// OCP → Test new features không sửa tests cũ
@Test void testNewDiscountStrategy() { /* ... */ }  // Không touch existing tests

// LSP → Test substitutability
@Test void testAllRepositoryImplementations() {
    List<UserRepository> repos = List.of(
        new MySQLUserRepository(),
        new PostgreSQLUserRepository(),
        new MongoUserRepository()
    );

    repos.forEach(repo -> {
        // Same test applies to all implementations
        repo.save(user);
        assertThat(repo.findById(user.getId())).isPresent();
    });
}

// ISP → Mock chỉ methods cần thiết
@Mock private UserReader userReader;  // Không cần UserWriter methods

// DIP → Swap implementations dễ dàng
@Test void testWithMockRepo() { /* ... */ }
@Test void testWithFakeRepo() { /* ... */ }
@Test void testWithRealRepo() { /* ... */ }
```

**Tổng kết:**
```
SOLID code = Testable code
Testable code = High quality code
High quality code = Fewer bugs in production
```

---


### Q11: SOLID trong Microservices Architecture - Áp dụng như thế nào?

**Độ khó:** Senior/Lead

**Câu trả lời:**

SOLID principles scale từ class level lên service level trong microservices.

#### **SRP ở Service Level**

**Mỗi microservice có MỘT lý do để thay đổi (Single Business Capability)**

```yaml
# ❌ BAD - God Service vi phạm SRP
order-service:
  responsibilities:
    - Create orders
    - Process payments
    - Send notifications
    - Manage inventory
    - Generate reports
    - Handle shipping
  # Quá nhiều responsibilities!

# ✅ GOOD - Mỗi service một responsibility
order-service:
  responsibility: Manage order lifecycle

payment-service:
  responsibility: Process payments

notification-service:
  responsibility: Send notifications

inventory-service:
  responsibility: Track product stock

reporting-service:
  responsibility: Generate business reports

shipping-service:
  responsibility: Handle order delivery
```

**Spring Boot implementation:**

```java
// Order Service - Chỉ quản lý orders
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentServiceClient paymentClient;  // Call payment service

    @Autowired
    private InventoryServiceClient inventoryClient;  // Call inventory service

    @Autowired
    private NotificationServiceClient notificationClient;  // Call notification service

    @Transactional
    public Order createOrder(OrderRequest request) {
        // 1. Create order (OUR responsibility)
        Order order = Order.builder()
            .customerId(request.getCustomerId())
            .items(request.getItems())
            .status(OrderStatus.PENDING)
            .build();

        order = orderRepository.save(order);

        // 2. Delegate payment to payment service
        PaymentResult paymentResult = paymentClient.processPayment(
            order.getId(),
            order.getTotalAmount()
        );

        if (!paymentResult.isSuccess()) {
            throw new PaymentFailedException("Payment failed");
        }

        // 3. Delegate inventory to inventory service
        inventoryClient.reserveItems(order.getItems());

        // 4. Delegate notification to notification service
        notificationClient.sendOrderConfirmation(order);

        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }
}
```

#### **OCP ở Service Level**

**Thêm services mới không sửa services cũ**

```java
// ✅ Event-driven architecture để achieve OCP

// Order service publishes events
@Service
public class OrderService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public Order createOrder(OrderRequest request) {
        Order order = createAndSaveOrder(request);

        // Publish event - OCP: Thêm subscribers không sửa code này
        eventPublisher.publishEvent(new OrderCreatedEvent(order));

        return order;
    }
}

// Payment service subscribes
@Service
public class PaymentEventHandler {

    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Process payment
        processPayment(event.getOrder());
    }
}

// Inventory service subscribes
@Service
public class InventoryEventHandler {

    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Reserve items
        reserveItems(event.getOrder().getItems());
    }
}

// ✅ Thêm analytics service - KHÔNG sửa Order Service!
@Service
public class AnalyticsEventHandler {

    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Track analytics
        trackOrderCreation(event.getOrder());
    }
}
```

#### **LSP ở Service Level**

**Services implementing same interface phải interchangeable**

```java
// Interface cho notification service
public interface NotificationService {
    void send(Notification notification);
}

// Implementation 1 - Email-based
@Service
@Primary
public class EmailNotificationService implements NotificationService {

    @Override
    public void send(Notification notification) {
        // Send via email
    }
}

// Implementation 2 - SMS-based
@Service
public class SmsNotificationService implements NotificationService {

    @Override
    public void send(Notification notification) {
        // Send via SMS
    }
}

// Implementation 3 - Multi-channel (LSP: Hoàn toàn thay thế được)
@Service
public class MultiChannelNotificationService implements NotificationService {

    @Autowired
    private List<NotificationService> services;

    @Override
    public void send(Notification notification) {
        // Send via all channels
        services.forEach(service -> service.send(notification));
    }
}

// Client code - LSP: Không cần biết implementation nào
@RestController
public class OrderController {

    @Autowired
    private NotificationService notificationService;  // Bất kỳ implementation nào cũng OK

    @PostMapping("/orders")
    public Order createOrder(@RequestBody OrderRequest request) {
        Order order = orderService.createOrder(request);

        // LSP: Works với bất kỳ NotificationService nào
        notificationService.send(new OrderCreatedNotification(order));

        return order;
    }
}
```

#### **ISP ở Service Level**

**Services không nên phụ thuộc vào APIs không cần thiết**

```java
// ❌ BAD - Fat interface
public interface UserService {
    User createUser(UserRequest request);
    User updateUser(Long id, UserRequest request);
    void deleteUser(Long id);
    User findById(Long id);
    List<User> findAll();
    void changePassword(Long id, String newPassword);
    void resetPassword(String email);
    void uploadAvatar(Long id, MultipartFile file);
    void sendVerificationEmail(Long id);
    void activateAccount(String token);
    // Quá nhiều methods!
}

// ✅ GOOD - Segregated interfaces
public interface UserReader {
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    List<User> findAll(Pageable pageable);
}

public interface UserWriter {
    User save(User user);
    void delete(Long id);
}

public interface UserAuthenticator {
    void changePassword(Long id, String newPassword);
    void resetPassword(String email);
    boolean verifyPassword(Long id, String password);
}

public interface UserActivation {
    void sendActivationEmail(Long id);
    void activate(String token);
}

// Clients chỉ depend vào interface cần thiết
@Service
public class OrderService {

    @Autowired
    private UserReader userReader;  // Chỉ cần read users

    public Order createOrder(Long userId, OrderRequest request) {
        User user = userReader.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        return createOrderForUser(user, request);
    }
}

@Service
public class LoginService {

    @Autowired
    private UserAuthenticator userAuthenticator;  // Chỉ cần authentication

    public LoginResult login(String email, String password) {
        return userAuthenticator.verifyPassword(email, password);
    }
}
```

#### **DIP ở Service Level**

**Services depend on interfaces/contracts, not concrete implementations**

```java
// ✅ Define service interfaces (Contracts)

// Payment service contract
public interface PaymentServiceClient {
    PaymentResult processPayment(Long orderId, BigDecimal amount);
    PaymentResult refund(String transactionId);
}

// Inventory service contract
public interface InventoryServiceClient {
    void reserveItems(List<OrderItem> items);
    void releaseItems(List<OrderItem> items);
}

// Implementation với Feign Client
@FeignClient(name = "payment-service", url = "${services.payment.url}")
public interface PaymentServiceFeignClient extends PaymentServiceClient {
    // Feign auto-implements interface
}

@FeignClient(name = "inventory-service", url = "${services.inventory.url}")
public interface InventoryServiceFeignClient extends InventoryServiceClient {
    // Feign auto-implements interface
}

// Order service depends on interfaces (DIP)
@Service
public class OrderService {

    private final PaymentServiceClient paymentClient;  // Interface, not concrete!
    private final InventoryServiceClient inventoryClient;  // Interface, not concrete!

    @Autowired
    public OrderService(
            PaymentServiceClient paymentClient,
            InventoryServiceClient inventoryClient) {
        this.paymentClient = paymentClient;
        this.inventoryClient = inventoryClient;
    }

    public Order createOrder(OrderRequest request) {
        // Use interfaces - Không biết implementation
        paymentClient.processPayment(...);
        inventoryClient.reserveItems(...);
    }
}

// ✅ Mock implementation cho testing (DIP makes this easy!)
@Component
@Profile("test")
public class MockPaymentServiceClient implements PaymentServiceClient {

    @Override
    public PaymentResult processPayment(Long orderId, BigDecimal amount) {
        return PaymentResult.success("MOCK-TXN-" + UUID.randomUUID());
    }

    @Override
    public PaymentResult refund(String transactionId) {
        return PaymentResult.success("MOCK-REFUND-" + UUID.randomUUID());
    }
}
```

#### **API Gateway Pattern (Facade + SRP)**

```java
// ✅ API Gateway aggregates multiple services (Facade pattern)
@RestController
@RequestMapping("/api/v1")
public class OrderApiGateway {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    // Aggregated endpoint - Calls multiple services
    @GetMapping("/orders/{orderId}/details")
    public OrderDetailsResponse getOrderDetails(@PathVariable Long orderId) {
        // Call multiple services
        Order order = orderService.findById(orderId);
        User user = userService.findById(order.getUserId());
        List<Product> products = productService.findByIds(
            order.getItems().stream()
                .map(OrderItem::getProductId)
                .collect(Collectors.toList())
        );

        // Aggregate response
        return OrderDetailsResponse.builder()
            .order(order)
            .user(user)
            .products(products)
            .build();
    }
}
```

**Tổng kết - SOLID ở Microservices Level:**

| SOLID Principle | Microservices Application |
|-----------------|---------------------------|
| **SRP** | One service = One business capability |
| **OCP** | Event-driven, add services without modifying existing |
| **LSP** | Service implementations interchangeable via interface |
| **ISP** | Fine-grained service APIs, not fat interfaces |
| **DIP** | Depend on service contracts, not concrete services |

---

### Q12: SOLID và Transaction Management trong Spring Boot

**Độ khó:** Senior

**Câu trả lời:**

SOLID principles giúp manage transactions hiệu quả và tránh distributed transaction hell.

#### **SRP trong Transaction Management**

```java
// ❌ BAD - Mixed responsibilities trong transaction
@Service
public class OrderService {

    @Transactional  // Transaction bao quá nhiều thứ!
    public Order createOrder(OrderRequest request) {
        // 1. Database operations (cần transaction)
        Order order = orderRepository.save(new Order(request));

        // 2. External API call (KHÔNG nên trong transaction!)
        PaymentResult payment = paymentGateway.charge(order.getTotal());

        // 3. Email sending (KHÔNG nên trong transaction!)
        emailService.sendConfirmation(order);

        // 4. File system operations (KHÔNG nên trong transaction!)
        reportGenerator.generateInvoice(order);

        return order;
    }
    // Transaction giữ connection quá lâu → Performance issue!
}

// ✅ GOOD - Tách responsibilities, transaction chỉ cho DB operations
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    // SRP: Transaction chỉ cho DB operations
    @Transactional
    public Order createOrder(OrderRequest request) {
        Order order = orderRepository.save(new Order(request));
        return order;
    }

    // SRP: Orchestration logic KHÔNG trong transaction
    public Order processOrder(OrderRequest request) {
        // 1. DB transaction
        Order order = createOrder(request);

        // 2. Non-transactional operations
        try {
            PaymentResult payment = paymentGateway.charge(order.getTotal());
            order.setPaymentId(payment.getTransactionId());

            // 3. Publish event cho async processing
            eventPublisher.publishEvent(new OrderCreatedEvent(order));

        } catch (PaymentException e) {
            // Compensating transaction
            compensate(order);
            throw e;
        }

        return order;
    }

    @Transactional
    private void compensate(Order order) {
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}
```

#### **OCP với Transaction Strategies**

```java
// ✅ Strategy pattern cho different transaction behaviors

public interface TransactionStrategy {
    <T> T execute(Supplier<T> operation);
}

// Strategy 1: Required transaction
@Component
public class RequiredTransactionStrategy implements TransactionStrategy {

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Override
    public <T> T execute(Supplier<T> operation) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
        return template.execute(status -> operation.get());
    }
}

// Strategy 2: Requires new transaction
@Component
public class RequiresNewTransactionStrategy implements TransactionStrategy {

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Override
    public <T> T execute(Supplier<T> operation) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        return template.execute(status -> operation.get());
    }
}

// Strategy 3: No transaction
@Component
public class NoTransactionStrategy implements TransactionStrategy {

    @Override
    public <T> T execute(Supplier<T> operation) {
        return operation.get();  // Execute without transaction
    }
}

// Service using strategy (OCP)
@Service
public class OrderProcessingService {

    private final Map<TransactionType, TransactionStrategy> strategies;

    @Autowired
    public OrderProcessingService(List<TransactionStrategy> strategyList) {
        // Auto-wire all strategies
        this.strategies = mapStrategies(strategyList);
    }

    // OCP: Thêm transaction type không sửa code này
    public Order processWithStrategy(OrderRequest request, TransactionType type) {
        TransactionStrategy strategy = strategies.get(type);
        return strategy.execute(() -> processOrder(request));
    }

    private Order processOrder(OrderRequest request) {
        // Business logic here
        return new Order(request);
    }
}
```

#### **DIP trong Transaction Management**

```java
// ✅ Depend on abstraction for transaction management

// Interface (Abstraction)
public interface TransactionalOperation<T> {
    T execute();
    void rollback();
    default TransactionIsolation getIsolationLevel() {
        return TransactionIsolation.READ_COMMITTED;
    }
}

// Implementation
@Service
public class CreateOrderOperation implements TransactionalOperation<Order> {

    @Autowired
    private OrderRepository orderRepository;

    private OrderRequest request;

    public CreateOrderOperation(OrderRequest request) {
        this.request = request;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Order execute() {
        Order order = new Order(request);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void rollback() {
        // Compensating logic
    }

    @Override
    public TransactionIsolation getIsolationLevel() {
        return TransactionIsolation.SERIALIZABLE;  // Override for special case
    }
}

// Transaction executor depends on interface (DIP)
@Service
public class TransactionExecutor {

    @Autowired
    private PlatformTransactionManager transactionManager;

    // DIP: Depend on TransactionalOperation interface
    public <T> T executeInTransaction(TransactionalOperation<T> operation) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setIsolationLevel(operation.getIsolationLevel().getValue());

        try {
            return template.execute(status -> operation.execute());
        } catch (Exception e) {
            operation.rollback();
            throw e;
        }
    }
}

// Usage
@Service
public class OrderService {

    @Autowired
    private TransactionExecutor executor;

    public Order createOrder(OrderRequest request) {
        TransactionalOperation<Order> operation = new CreateOrderOperation(request);
        return executor.executeInTransaction(operation);  // DIP in action
    }
}
```

#### **Saga Pattern (Distributed Transactions với SOLID)**

```java
// ✅ Saga pattern implementation với SOLID

// SRP: Mỗi step một responsibility
public interface SagaStep<T> {
    T execute();
    void compensate();
}

// Step 1: Create order
public class CreateOrderStep implements SagaStep<Order> {

    private OrderRepository orderRepository;
    private OrderRequest request;

    @Override
    public Order execute() {
        Order order = new Order(request);
        return orderRepository.save(order);
    }

    @Override
    public void compensate() {
        // Delete order if subsequent steps fail
        orderRepository.delete(order);
    }
}

// Step 2: Process payment
public class ProcessPaymentStep implements SagaStep<PaymentResult> {

    private PaymentService paymentService;
    private Order order;

    @Override
    public PaymentResult execute() {
        return paymentService.charge(order.getTotal());
    }

    @Override
    public void compensate() {
        // Refund payment
        paymentService.refund(paymentResult.getTransactionId());
    }
}

// Step 3: Reserve inventory
public class ReserveInventoryStep implements SagaStep<ReservationResult> {

    private InventoryService inventoryService;
    private Order order;

    @Override
    public ReservationResult execute() {
        return inventoryService.reserve(order.getItems());
    }

    @Override
    public void compensate() {
        // Release inventory
        inventoryService.release(order.getItems());
    }
}

// Saga orchestrator (OCP: Thêm steps không sửa orchestrator)
@Service
public class OrderSagaOrchestrator {

    private final List<SagaStep<?>> steps = new ArrayList<>();
    private final Stack<SagaStep<?>> executedSteps = new Stack<>();

    // OCP: Build saga với different steps
    public OrderSagaOrchestrator addStep(SagaStep<?> step) {
        steps.add(step);
        return this;
    }

    public void execute() {
        try {
            // Execute all steps
            for (SagaStep<?> step : steps) {
                step.execute();
                executedSteps.push(step);
            }
        } catch (Exception e) {
            // Rollback executed steps in reverse order
            while (!executedSteps.isEmpty()) {
                SagaStep<?> step = executedSteps.pop();
                try {
                    step.compensate();
                } catch (Exception compensationError) {
                    // Log compensation failure
                    logCompensationFailure(step, compensationError);
                }
            }
            throw new SagaExecutionException("Saga failed", e);
        }
    }
}

// Usage
@Service
public class OrderService {

    @Autowired
    private OrderSagaOrchestrator orchestrator;

    public Order createOrderWithSaga(OrderRequest request) {
        // Build saga with steps (OCP)
        Order order = orchestrator
            .addStep(new CreateOrderStep(orderRepository, request))
            .addStep(new ProcessPaymentStep(paymentService, order))
            .addStep(new ReserveInventoryStep(inventoryService, order))
            .execute();

        return order;
    }
}
```

#### **Best Practices:**

```java
// ✅ 1. Keep transactions SHORT
@Transactional
public Order createOrder(OrderRequest request) {
    // ONLY database operations
    return orderRepository.save(new Order(request));
}

// ✅ 2. Async processing OUTSIDE transaction
@Service
public class OrderService {

    @Transactional
    public Order createOrder(OrderRequest request) {
        return orderRepository.save(new Order(request));
    }

    @Async
    public void processOrderAsync(Order order) {
        // Long-running operations outside transaction
        emailService.sendConfirmation(order);
        reportGenerator.generate(order);
    }
}

// ✅ 3. Read-only optimization
@Transactional(readOnly = true)  // Performance optimization
public List<Order> findOrdersByCustomer(Long customerId) {
    return orderRepository.findByCustomerId(customerId);
}

// ✅ 4. Proper isolation levels
@Transactional(isolation = Isolation.SERIALIZABLE)  // Prevent dirty reads
public void updateInventory(Long productId, int quantity) {
    Product product = productRepository.findById(productId).orElseThrow();
    product.setStock(product.getStock() - quantity);
    productRepository.save(product);
}
```

---

### Q13: SOLID và Exception Handling trong Spring Boot

**Độ khó:** Mid/Senior

**Câu trả lời:**

#### **SRP trong Exception Handling**

```java
// ❌ BAD - Exception handling mixed với business logic
@RestController
public class OrderController {

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(order);

        } catch (ValidationException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));

        } catch (PaymentException e) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                .body(new ErrorResponse("Payment failed: " + e.getMessage()));

        } catch (InventoryException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("Out of stock: " + e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Internal error"));
        }
        // Controller làm quá nhiều việc!
    }
}

// ✅ GOOD - SRP: Controller chỉ handle HTTP, delegate exception handling
@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Clean controller - Chỉ business logic
    @PostMapping("/orders")
    public Order createOrder(@RequestBody OrderRequest request) {
        return orderService.createOrder(request);  // Let exceptions propagate
    }
}

// SRP: Centralized exception handling
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
        ErrorResponse error = ErrorResponse.builder()
            .code("VALIDATION_ERROR")
            .message(e.getMessage())
            .timestamp(Instant.now())
            .build();

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ErrorResponse> handlePayment(PaymentException e) {
        ErrorResponse error = ErrorResponse.builder()
            .code("PAYMENT_FAILED")
            .message(e.getMessage())
            .timestamp(Instant.now())
            .build();

        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(error);
    }

    @ExceptionHandler(InventoryException.class)
    public ResponseEntity<ErrorResponse> handleInventory(InventoryException e) {
        ErrorResponse error = ErrorResponse.builder()
            .code("OUT_OF_STOCK")
            .message(e.getMessage())
            .timestamp(Instant.now())
            .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        ErrorResponse error = ErrorResponse.builder()
            .code("INTERNAL_ERROR")
            .message("An unexpected error occurred")
            .timestamp(Instant.now())
            .build();

        // Log full stack trace
        log.error("Unexpected error", e);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

#### **OCP trong Exception Hierarchy**

```java
// ✅ Exception hierarchy theo domain (OCP)

// Base exception
public abstract class BusinessException extends RuntimeException {
    private final String errorCode;
    private final HttpStatus httpStatus;

    protected BusinessException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}

// Domain exceptions (OCP: Thêm exception type không sửa base)
public class OrderNotFoundException extends BusinessException {
    public OrderNotFoundException(Long orderId) {
        super("Order not found: " + orderId, "ORDER_NOT_FOUND", HttpStatus.NOT_FOUND);
    }
}

public class InsufficientStockException extends BusinessException {
    public InsufficientStockException(String productName, int available, int requested) {
        super(
            String.format("Insufficient stock for %s. Available: %d, Requested: %d",
                         productName, available, requested),
            "INSUFFICIENT_STOCK",
            HttpStatus.CONFLICT
        );
    }
}

public class PaymentDeclinedException extends BusinessException {
    public PaymentDeclinedException(String reason) {
        super("Payment declined: " + reason, "PAYMENT_DECLINED", HttpStatus.PAYMENT_REQUIRED);
    }
}

// Generic handler (OCP: Handle all BusinessException)
@RestControllerAdvice
public class GlobalExceptionHandler {

    // OCP: One handler cho tất cả BusinessException subclasses
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        ErrorResponse error = ErrorResponse.builder()
            .code(e.getErrorCode())
            .message(e.getMessage())
            .timestamp(Instant.now())
            .build();

        return ResponseEntity
            .status(e.getHttpStatus())
            .body(error);
    }
}
```

#### **LSP trong Exception Handling**

```java
// ✅ LSP: Subclass exceptions tuân theo base exception contract

public abstract class ValidationException extends BusinessException {

    private final List<FieldError> fieldErrors;

    protected ValidationException(String message, List<FieldError> fieldErrors) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
        this.fieldErrors = fieldErrors;
    }

    public List<FieldError> getFieldErrors() {
        return fieldErrors;
    }
}

// Subclass 1 - LSP: Giữ contract của ValidationException
public class EmailValidationException extends ValidationException {
    public EmailValidationException(String email) {
        super(
            "Invalid email format: " + email,
            List.of(new FieldError("email", "Invalid email format"))
        );
    }
}

// Subclass 2 - LSP: Giữ contract của ValidationException
public class PasswordValidationException extends ValidationException {
    public PasswordValidationException(String reason) {
        super(
            "Invalid password: " + reason,
            List.of(new FieldError("password", reason))
        );
    }
}

// Subclass 3 - LSP: Giữ contract của ValidationException
public class AgeValidationException extends ValidationException {
    public AgeValidationException(int age, int minAge) {
        super(
            String.format("Age %d is below minimum age %d", age, minAge),
            List.of(new FieldError("age", "Below minimum age"))
        );
    }
}

// Handler - LSP: Works với tất cả ValidationException subclasses
@ExceptionHandler(ValidationException.class)
public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
    ErrorResponse error = ErrorResponse.builder()
        .code(e.getErrorCode())
        .message(e.getMessage())
        .fieldErrors(e.getFieldErrors())  // LSP: All subclasses có fieldErrors
        .timestamp(Instant.now())
        .build();

    return ResponseEntity
        .status(e.getHttpStatus())
        .body(error);
}
```

#### **DIP trong Exception Handling**

```java
// ✅ DIP: Depend on exception handler interface

// Interface (Abstraction)
public interface ExceptionHandler<T extends Exception> {
    ErrorResponse handle(T exception);
    HttpStatus getHttpStatus();
}

// Implementation 1
@Component
public class ValidationExceptionHandler implements ExceptionHandler<ValidationException> {

    @Override
    public ErrorResponse handle(ValidationException exception) {
        return ErrorResponse.builder()
            .code("VALIDATION_ERROR")
            .message(exception.getMessage())
            .fieldErrors(exception.getFieldErrors())
            .timestamp(Instant.now())
            .build();
    }

    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.BAD_REQUEST;
    }
}

// Implementation 2
@Component
public class PaymentExceptionHandler implements ExceptionHandler<PaymentException> {

    @Override
    public ErrorResponse handle(PaymentException exception) {
        return ErrorResponse.builder()
            .code("PAYMENT_FAILED")
            .message(exception.getMessage())
            .transactionId(exception.getTransactionId())
            .timestamp(Instant.now())
            .build();
    }

    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.PAYMENT_REQUIRED;
    }
}

// Exception handler registry (DIP)
@Component
public class ExceptionHandlerRegistry {

    private final Map<Class<? extends Exception>, ExceptionHandler<?>> handlers;

    @Autowired
    public ExceptionHandlerRegistry(List<ExceptionHandler<?>> handlerList) {
        this.handlers = handlerList.stream()
            .collect(Collectors.toMap(
                handler -> getExceptionType(handler),
                Function.identity()
            ));
    }

    @SuppressWarnings("unchecked")
    public <T extends Exception> ErrorResponse handle(T exception) {
        ExceptionHandler<T> handler = (ExceptionHandler<T>) handlers.get(exception.getClass());

        if (handler == null) {
            throw new IllegalStateException("No handler for: " + exception.getClass());
        }

        return handler.handle(exception);
    }
}

// Global advice using registry (DIP)
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Autowired
    private ExceptionHandlerRegistry registry;

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        ErrorResponse error = registry.handle(e);
        ExceptionHandler<?> handler = registry.getHandler(e.getClass());

        return ResponseEntity
            .status(handler.getHttpStatus())
            .body(error);
    }
}
```

**Best Practices:**

```
✅ Centralized exception handling (@RestControllerAdvice)
✅ Domain-specific exceptions
✅ Proper HTTP status codes
✅ Consistent error response format
✅ Log exceptions with context
✅ Don't expose internal details to clients
✅ Use exception hierarchy (OCP)
```

---


### Q14: SOLID với Spring Boot Configuration và Dependency Injection

**Độ khó:** Mid

**Câu trả lời:**

Spring Boot's dependency injection framework naturally enforces nhiều SOLID principles.

#### **DIP với Constructor Injection (Best Practice)**

```java
// ❌ BAD - Field injection vi phạm DIP
@Service
public class OrderService {

    @Autowired
    private OrderRepository repository;  // Tight coupling, hard to test

    @Autowired
    private PaymentService paymentService;

    // Cannot create instance without Spring container!
}

// ❌ WORSE - Direct instantiation vi phạm DIP
@Service
public class OrderService {

    private OrderRepository repository = new MySQLOrderRepository();  // Hardcoded!

    private PaymentService paymentService = new StripePaymentService();  // Hardcoded!
}

// ✅ GOOD - Constructor injection tuân thủ DIP
@Service
public class OrderService {

    private final OrderRepository repository;
    private final PaymentService paymentService;

    // DIP: Depend on interfaces
    // Testable: Can inject mocks
    // Immutable: final fields
    public OrderService(
            OrderRepository repository,
            PaymentService paymentService) {
        this.repository = repository;
        this.paymentService = paymentService;
    }

    public Order createOrder(OrderRequest request) {
        // Use injected dependencies
        Order order = new Order(request);
        repository.save(order);
        paymentService.process(order);
        return order;
    }
}

// Test với constructor injection (DIP makes testing easy)
@Test
void testCreateOrder() {
    // Easy to create with mocks
    OrderRepository mockRepo = mock(OrderRepository.class);
    PaymentService mockPayment = mock(PaymentService.class);

    OrderService service = new OrderService(mockRepo, mockPayment);

    // Test...
}
```

#### **OCP với @Conditional Beans**

```java
// ✅ OCP: Different implementations based on conditions

// Interface
public interface NotificationService {
    void send(String recipient, String message);
}

// Implementation 1
@Service
@ConditionalOnProperty(name = "notification.type", havingValue = "email")
public class EmailNotificationService implements NotificationService {

    @Override
    public void send(String recipient, String message) {
        // Send email
    }
}

// Implementation 2
@Service
@ConditionalOnProperty(name = "notification.type", havingValue = "sms")
public class SmsNotificationService implements NotificationService {

    @Override
    public void send(String recipient, String message) {
        // Send SMS
    }
}

// Implementation 3 - OCP: Thêm implementation không sửa code cũ
@Service
@ConditionalOnProperty(name = "notification.type", havingValue = "push")
public class PushNotificationService implements NotificationService {

    @Override
    public void send(String recipient, String message) {
        // Send push notification
    }
}

// Configuration
# application.yml
notification:
  type: email  # Switch implementation without code changes!
```

#### **ISP với @Configuration Classes**

```java
// ✅ ISP: Segregated configuration classes

// Database configuration
@Configuration
@EnableJpaRepositories(basePackages = "com.example.repository")
public class DatabaseConfiguration {

    @Bean
    public DataSource dataSource() {
        // DataSource configuration
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
        // EntityManager configuration
    }
}

// Security configuration (separate concern)
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        // Security configuration
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// Redis configuration (separate concern)
@Configuration
@EnableCaching
public class CacheConfiguration {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        // Cache configuration
    }
}

// Message queue configuration (separate concern)
@Configuration
public class MessagingConfiguration {

    @Bean
    public RabbitTemplate rabbitTemplate() {
        // RabbitMQ configuration
    }
}
```

#### **SRP với @Profile-specific Configurations**

```java
// ✅ SRP: Mỗi profile một configuration responsibility

// Development configuration
@Configuration
@Profile("dev")
public class DevelopmentConfiguration {

    @Bean
    public DataSource devDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:h2:mem:testdb")
            .username("sa")
            .password("")
            .build();
    }

    @Bean
    public Logger devLogger() {
        return LoggerFactory.getLogger("DEV");
    }
}

// Production configuration
@Configuration
@Profile("prod")
public class ProductionConfiguration {

    @Bean
    public DataSource prodDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:mysql://prod-server:3306/mydb")
            .username(System.getenv("DB_USER"))
            .password(System.getenv("DB_PASS"))
            .build();
    }

    @Bean
    public Logger prodLogger() {
        // Production logging with Sentry, CloudWatch, etc.
    }
}

// Test configuration
@Configuration
@Profile("test")
public class TestConfiguration {

    @Bean
    public DataSource testDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:h2:mem:test")
            .build();
    }

    @Bean
    public Clock fixedClock() {
        return Clock.fixed(Instant.parse("2024-01-01T00:00:00Z"), ZoneOffset.UTC);
    }
}
```

#### **DIP với Bean Qualifiers**

```java
// ✅ Multiple implementations, choose at runtime

@Service
public class PaymentService {

    private final PaymentGateway primaryGateway;
    private final PaymentGateway fallbackGateway;

    // DIP: Inject different implementations
    public PaymentService(
            @Qualifier("stripeGateway") PaymentGateway primaryGateway,
            @Qualifier("paypalGateway") PaymentGateway fallbackGateway) {
        this.primaryGateway = primaryGateway;
        this.fallbackGateway = fallbackGateway;
    }

    public PaymentResult process(Payment payment) {
        try {
            return primaryGateway.charge(payment);
        } catch (PaymentException e) {
            // Fallback to secondary gateway
            return fallbackGateway.charge(payment);
        }
    }
}

// Bean definitions
@Configuration
public class PaymentConfiguration {

    @Bean("stripeGateway")
    public PaymentGateway stripeGateway() {
        return new StripeGateway(stripeApiKey);
    }

    @Bean("paypalGateway")
    public PaymentGateway paypalGateway() {
        return new PayPalGateway(paypalClientId, paypalSecret);
    }

    @Bean("squareGateway")
    public PaymentGateway squareGateway() {
        return new SquareGateway(squareAccessToken);
    }
}
```

#### **Factory Pattern với Spring**

```java
// ✅ OCP + DIP: Factory pattern với Spring

// Factory interface
public interface NotificationFactory {
    NotificationService create(NotificationType type);
}

@Component
public class SpringNotificationFactory implements NotificationFactory {

    @Autowired
    private ApplicationContext context;

    // OCP: Thêm type mới không sửa factory
    @Override
    public NotificationService create(NotificationType type) {
        return switch (type) {
            case EMAIL -> context.getBean("emailNotification", NotificationService.class);
            case SMS -> context.getBean("smsNotification", NotificationService.class);
            case PUSH -> context.getBean("pushNotification", NotificationService.class);
        };
    }
}

// Service using factory
@Service
public class UserService {

    private final NotificationFactory notificationFactory;

    public UserService(NotificationFactory notificationFactory) {
        this.notificationFactory = notificationFactory;
    }

    public void registerUser(User user, NotificationType preferredNotification) {
        // Business logic
        userRepository.save(user);

        // Use factory (OCP + DIP)
        NotificationService notification = notificationFactory.create(preferredNotification);
        notification.send(user.getEmail(), "Welcome!");
    }
}
```

**Best Practices:**

```java
✅ Prefer constructor injection over field injection
✅ Use @Qualifier for multiple implementations
✅ Use @Profile for environment-specific configurations
✅ Use @Conditional for conditional bean creation
✅ Segregate @Configuration classes by concern (ISP)
✅ Depend on interfaces, not implementations (DIP)
✅ Make injected fields final for immutability
```

---

### Q15: SOLID Anti-patterns - Những cách vi phạm phổ biến nhất

**Độ khó:** Senior

**Câu trả lời:**

#### **Anti-pattern 1: God Class (Vi phạm SRP)**

```java
// ❌ ANTI-PATTERN: God Class
@Service
public class UserManagementService {

    // Vi phạm SRP: Quá nhiều responsibilities

    // 1. User CRUD
    public User createUser(UserRequest request) { /* ... */ }
    public User updateUser(Long id, UserRequest request) { /* ... */ }
    public void deleteUser(Long id) { /* ... */ }
    public User findById(Long id) { /* ... */ }

    // 2. Authentication
    public LoginResult login(String email, String password) { /* ... */ }
    public void logout(String token) { /* ... */ }
    public String refreshToken(String token) { /* ... */ }

    // 3. Authorization
    public boolean hasPermission(Long userId, String permission) { /* ... */ }
    public void grantRole(Long userId, String role) { /* ... */ }
    public void revokeRole(Long userId, String role) { /* ... */ }

    // 4. Password management
    public void changePassword(Long userId, String oldPass, String newPass) { /* ... */ }
    public void resetPassword(String email) { /* ... */ }
    public void validatePassword(String password) { /* ... */ }

    // 5. Email notifications
    public void sendWelcomeEmail(User user) { /* ... */ }
    public void sendPasswordResetEmail(String email) { /* ... */ }
    public void sendVerificationEmail(User user) { /* ... */ }

    // 6. File uploads
    public String uploadAvatar(Long userId, MultipartFile file) { /* ... */ }
    public void deleteAvatar(Long userId) { /* ... */ }

    // 7. Reporting
    public UserReport generateUserReport(Long userId) { /* ... */ }
    public List<User> findInactiveUsers(int days) { /* ... */ }

    // 8. Audit logging
    public void logUserAction(Long userId, String action) { /* ... */ }

    // Class có 8+ responsibilities → NIGHTMARE để maintain và test!
}

// ✅ SOLUTION: Tách thành nhiều services theo SRP

@Service
public class UserService {
    public User createUser(UserRequest request) { /* ... */ }
    public User updateUser(Long id, UserRequest request) { /* ... */ }
    public void deleteUser(Long id) { /* ... */ }
    public User findById(Long id) { /* ... */ }
}

@Service
public class AuthenticationService {
    public LoginResult login(String email, String password) { /* ... */ }
    public void logout(String token) { /* ... */ }
    public String refreshToken(String token) { /* ... */ }
}

@Service
public class AuthorizationService {
    public boolean hasPermission(Long userId, String permission) { /* ... */ }
    public void grantRole(Long userId, String role) { /* ... */ }
}

@Service
public class PasswordService {
    public void changePassword(Long userId, String oldPass, String newPass) { /* ... */ }
    public void resetPassword(String email) { /* ... */ }
}

@Service
public class UserNotificationService {
    public void sendWelcomeEmail(User user) { /* ... */ }
    public void sendPasswordResetEmail(String email) { /* ... */ }
}

@Service
public class UserAvatarService {
    public String uploadAvatar(Long userId, MultipartFile file) { /* ... */ }
    public void deleteAvatar(Long userId) { /* ... */ }
}
```

#### **Anti-pattern 2: Shotgun Surgery (Vi phạm SRP + OCP)**

```java
// ❌ ANTI-PATTERN: Thay đổi một feature phải sửa nhiều files

// Thêm payment method mới phải sửa TẤT CẢ các files này:

// File 1: PaymentService.java
if (type.equals("CREDIT_CARD")) { /* ... */ }
else if (type.equals("PAYPAL")) { /* ... */ }
else if (type.equals("BITCOIN")) { /* NEW */ }

// File 2: PaymentController.java
if (request.getType().equals("BITCOIN")) {
    // Special handling for Bitcoin
}

// File 3: PaymentValidator.java
if (type.equals("BITCOIN")) {
    validateBitcoinWallet(request.getWallet());
}

// File 4: PaymentRepository.java
if (payment.getType() == PaymentType.BITCOIN) {
    // Special save logic
}

// File 5: PaymentNotification.java
if (payment.getType() == PaymentType.BITCOIN) {
    sendBitcoinConfirmation();
}

// ✅ SOLUTION: Strategy pattern (OCP)

// Thêm Bitcoin payment chỉ cần TẠO MỘT FILE mới:
@Component
public class BitcoinPaymentStrategy implements PaymentStrategy {
    @Override
    public PaymentResult process(Payment payment) {
        // All Bitcoin logic here
        validate(payment);
        processPayment(payment);
        savePayment(payment);
        sendNotification(payment);
        return PaymentResult.success();
    }

    private void validate(Payment payment) { /* ... */ }
    private void processPayment(Payment payment) { /* ... */ }
    private void savePayment(Payment payment) { /* ... */ }
    private void sendNotification(Payment payment) { /* ... */ }
}
// DONE! Không sửa code cũ!
```

#### **Anti-pattern 3: Leaky Abstraction (Vi phạm LSP)**

```java
// ❌ ANTI-PATTERN: Abstraction leak implementation details

public interface PaymentGateway {
    PaymentResult charge(Amount amount);

    // ❌ Leaky: Exposes Stripe-specific method
    String getStripeCustomerId();

    // ❌ Leaky: Exposes PayPal-specific method
    String getPayPalAgreementId();
}

// Client code vi phạm LSP vì phải check implementation
public class PaymentService {

    private PaymentGateway gateway;

    public void processPayment(Amount amount) {
        PaymentResult result = gateway.charge(amount);

        // ❌ Vi phạm LSP: Phải check concrete type!
        if (gateway instanceof StripeGateway) {
            String customerId = gateway.getStripeCustomerId();
            // Stripe-specific logic
        } else if (gateway instanceof PayPalGateway) {
            String agreementId = gateway.getPayPalAgreementId();
            // PayPal-specific logic
        }
    }
}

// ✅ SOLUTION: Proper abstraction (LSP)

public interface PaymentGateway {
    PaymentResult charge(Amount amount);
    String getTransactionId();  // Generic method
    Map<String, String> getMetadata();  // Generic method for extras
}

public class StripeGateway implements PaymentGateway {
    private String customerId;

    @Override
    public String getTransactionId() {
        return stripeCharge.getId();
    }

    @Override
    public Map<String, String> getMetadata() {
        return Map.of("customerId", customerId);  // Hide implementation detail
    }
}

// Client code tuân thủ LSP
public class PaymentService {

    private PaymentGateway gateway;

    public void processPayment(Amount amount) {
        PaymentResult result = gateway.charge(amount);
        String transactionId = result.getTransactionId();  // Generic!
        // No instanceof checks needed!
    }
}
```

#### **Anti-pattern 4: Interface Pollution (Vi phạm ISP)**

```java
// ❌ ANTI-PATTERN: Fat interface

public interface OrderRepository {
    // Basic CRUD
    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findAll();
    void deleteById(Long id);

    // Querying
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByDateRange(LocalDate start, LocalDate end);

    // Reporting
    OrderStatistics getStatistics();
    List<Order> findTopOrders(int limit);
    BigDecimal getTotalRevenue();

    // Batch operations
    void batchInsert(List<Order> orders);
    void batchUpdate(List<Order> orders);

    // Caching
    void evictCache();
    void warmUpCache();

    // Export
    byte[] exportToCsv();
    byte[] exportToExcel();
}

// ❌ Client chỉ cần read nhưng phải implement TẤT CẢ methods!
public class OrderReportService implements OrderRepository {

    @Override
    public Order save(Order order) {
        throw new UnsupportedOperationException();  // Don't need this!
    }

    @Override
    public void deleteById(Long id) {
        throw new UnsupportedOperationException();  // Don't need this!
    }

    // ... 10+ methods throwing UnsupportedOperationException
}

// ✅ SOLUTION: Segregated interfaces (ISP)

public interface OrderReader {
    Optional<Order> findById(Long id);
    List<Order> findByCustomerId(Long customerId);
}

public interface OrderWriter {
    Order save(Order order);
    void deleteById(Long id);
}

public interface OrderStatisticsProvider {
    OrderStatistics getStatistics();
    BigDecimal getTotalRevenue();
}

public interface OrderExporter {
    byte[] exportToCsv();
    byte[] exportToExcel();
}

// Client chỉ depend vào interface cần thiết
public class OrderReportService {

    private final OrderReader orderReader;  // Only need reader!
    private final OrderStatisticsProvider statsProvider;

    public OrderReportService(OrderReader reader, OrderStatisticsProvider stats) {
        this.orderReader = reader;
        this.statsProvider = stats;
    }

    public Report generateReport(Long customerId) {
        List<Order> orders = orderReader.findByCustomerId(customerId);
        OrderStatistics stats = statsProvider.getStatistics();
        return new Report(orders, stats);
    }
}
```

#### **Anti-pattern 5: Service Locator (Vi phạm DIP)**

```java
// ❌ ANTI-PATTERN: Service Locator

public class ServiceLocator {
    private static Map<String, Object> services = new HashMap<>();

    public static void registerService(String name, Object service) {
        services.put(name, service);
    }

    public static <T> T getService(String name) {
        return (T) services.get(name);
    }
}

// ❌ Client code vi phạm DIP
public class OrderService {

    public Order createOrder(OrderRequest request) {
        // ❌ Hidden dependency - Hard to test!
        PaymentService paymentService = ServiceLocator.getService("paymentService");
        InventoryService inventoryService = ServiceLocator.getService("inventoryService");

        // Business logic...

        // Problems:
        // 1. Dependencies hidden (không thấy trong constructor)
        // 2. Hard to test (phải setup ServiceLocator)
        // 3. Runtime errors nếu service không registered
        // 4. Global state (ServiceLocator)
    }
}

// ✅ SOLUTION: Dependency Injection (DIP)

public class OrderService {

    private final PaymentService paymentService;
    private final InventoryService inventoryService;

    // ✅ Dependencies explicit và testable
    public OrderService(
            PaymentService paymentService,
            InventoryService inventoryService) {
        this.paymentService = paymentService;
        this.inventoryService = inventoryService;
    }

    public Order createOrder(OrderRequest request) {
        // Use injected dependencies
        // Easy to test with mocks!
    }
}
```

#### **Anti-pattern 6: Anemic Domain Model (Vi phạm SRP + OCP)**

```java
// ❌ ANTI-PATTERN: Anemic domain model

// Domain object chỉ có getters/setters (no behavior)
public class Order {
    private Long id;
    private List<OrderItem> items;
    private OrderStatus status;
    private BigDecimal total;

    // Only getters and setters, NO BUSINESS LOGIC
}

// Business logic nằm trong Service (God Class)
@Service
public class OrderService {

    public void calculateTotal(Order order) {
        BigDecimal total = order.getItems().stream()
            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotal(total);
    }

    public void applyDiscount(Order order, BigDecimal discount) {
        order.setTotal(order.getTotal().subtract(discount));
    }

    public boolean canBeCancelled(Order order) {
        return order.getStatus() == OrderStatus.PENDING;
    }

    public void cancel(Order order) {
        if (canBeCancelled(order)) {
            order.setStatus(OrderStatus.CANCELLED);
        }
    }

    // All business logic in service, not in domain object!
}

// ✅ SOLUTION: Rich domain model

public class Order {
    private Long id;
    private List<OrderItem> items;
    private OrderStatus status;
    private BigDecimal total;

    // ✅ Business logic belongs in domain object
    public void calculateTotal() {
        this.total = items.stream()
            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void applyDiscount(BigDecimal discount) {
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Discount cannot be negative");
        }
        this.total = this.total.subtract(discount);
    }

    public boolean canBeCancelled() {
        return this.status == OrderStatus.PENDING ||
               this.status == OrderStatus.CONFIRMED;
    }

    public void cancel() {
        if (!canBeCancelled()) {
            throw new IllegalStateException("Cannot cancel order in status: " + status);
        }
        this.status = OrderStatus.CANCELLED;
    }

    // Encapsulation: Logic stays with data
}

// Service chỉ orchestrate, không chứa business logic
@Service
public class OrderService {

    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        order.calculateTotal();  // Domain object does the work
        orderRepository.save(order);
        return order;
    }

    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.cancel();  // Domain object validates and updates
        orderRepository.save(order);
    }
}
```

**Tổng kết Anti-patterns:**

| Anti-pattern | Vi phạm SOLID | Giải pháp |
|--------------|---------------|-----------|
| God Class | SRP | Tách thành nhiều classes |
| Shotgun Surgery | SRP, OCP | Strategy pattern |
| Leaky Abstraction | LSP | Proper abstraction |
| Interface Pollution | ISP | Segregated interfaces |
| Service Locator | DIP | Dependency Injection |
| Anemic Domain Model | SRP, OCP | Rich domain model |

---

### Q16: SOLID với Caching Strategies trong Spring Boot

**Độ khó:** Senior

**Câu trả lời:**

#### **SRP trong Caching**

```java
// ❌ BAD - Caching logic mixed với business logic
@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    @Autowired
    private CacheManager cacheManager;

    public Product getProduct(Long id) {
        // ❌ Manual cache logic in business method
        Cache cache = cacheManager.getCache("products");
        Cache.ValueWrapper wrapper = cache.get(id);

        if (wrapper != null) {
            return (Product) wrapper.get();
        }

        Product product = repository.findById(id).orElseThrow();

        cache.put(id, product);

        return product;
    }
}

// ✅ GOOD - SRP: Caching handled by Spring
@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    // SRP: Method chỉ business logic, Spring handle caching
    @Cacheable(value = "products", key = "#id")
    public Product getProduct(Long id) {
        return repository.findById(id).orElseThrow();
    }

    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        repository.deleteById(id);
    }

    @CachePut(value = "products", key = "#product.id")
    public Product updateProduct(Product product) {
        return repository.save(product);
    }
}
```

#### **OCP với Multiple Cache Providers**

```java
// ✅ OCP: Switch cache implementation without code changes

// Interface (abstraction)
public interface CacheProvider {
    <T> Optional<T> get(String key, Class<T> type);
    void put(String key, Object value);
    void evict(String key);
}

// Implementation 1: Redis
@Service
@ConditionalOnProperty(name = "cache.provider", havingValue = "redis")
public class RedisCacheProvider implements CacheProvider {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public <T> Optional<T> get(String key, Class<T> type) {
        T value = (T) redisTemplate.opsForValue().get(key);
        return Optional.ofNullable(value);
    }

    @Override
    public void put(String key, Object value) {
        redisTemplate.opsForValue().set(key, value, Duration.ofHours(1));
    }

    @Override
    public void evict(String key) {
        redisTemplate.delete(key);
    }
}

// Implementation 2: Caffeine (in-memory)
@Service
@ConditionalOnProperty(name = "cache.provider", havingValue = "caffeine")
public class CaffeineCacheProvider implements CacheProvider {

    private final Cache<String, Object> cache = Caffeine.newBuilder()
        .maximumSize(10000)
        .expireAfterWrite(Duration.ofHours(1))
        .build();

    @Override
    public <T> Optional<T> get(String key, Class<T> type) {
        T value = (T) cache.getIfPresent(key);
        return Optional.ofNullable(value);
    }

    @Override
    public void put(String key, Object value) {
        cache.put(key, value);
    }

    @Override
    public void evict(String key) {
        cache.invalidate(key);
    }
}

// Implementation 3: Hazelcast
@Service
@ConditionalOnProperty(name = "cache.provider", havingValue = "hazelcast")
public class HazelcastCacheProvider implements CacheProvider {

    @Autowired
    private HazelcastInstance hazelcastInstance;

    @Override
    public <T> Optional<T> get(String key, Class<T> type) {
        IMap<String, Object> map = hazelcastInstance.getMap("cache");
        T value = (T) map.get(key);
        return Optional.ofNullable(value);
    }

    // ... implementation
}

// Service depends on interface (DIP + OCP)
@Service
public class ProductService {

    private final CacheProvider cacheProvider;  // DIP
    private final ProductRepository repository;

    public ProductService(CacheProvider cacheProvider, ProductRepository repository) {
        this.cacheProvider = cacheProvider;
        this.repository = repository;
    }

    public Product getProduct(Long id) {
        String cacheKey = "product:" + id;

        // OCP: Works với bất kỳ cache provider nào
        return cacheProvider.get(cacheKey, Product.class)
            .orElseGet(() -> {
                Product product = repository.findById(id).orElseThrow();
                cacheProvider.put(cacheKey, product);
                return product;
            });
    }
}

// Configuration
# application.yml
cache:
  provider: redis  # Switch to: caffeine, hazelcast, etc.
```

#### **Strategy Pattern cho Cache Eviction**

```java
// ✅ OCP: Different eviction strategies

public interface CacheEvictionStrategy {
    void evict(String key);
    void evictAll();
}

@Component
public class ImmediateCacheEviction implements CacheEvictionStrategy {

    @Autowired
    private CacheManager cacheManager;

    @Override
    public void evict(String key) {
        cacheManager.getCache("products").evict(key);
    }

    @Override
    public void evictAll() {
        cacheManager.getCache("products").clear();
    }
}

@Component
public class DelayedCacheEviction implements CacheEvictionStrategy {

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private TaskScheduler taskScheduler;

    @Override
    public void evict(String key) {
        // Delay eviction by 5 seconds
        taskScheduler.schedule(
            () -> cacheManager.getCache("products").evict(key),
            Instant.now().plusSeconds(5)
        );
    }

    @Override
    public void evictAll() {
        taskScheduler.schedule(
            () -> cacheManager.getCache("products").clear(),
            Instant.now().plusSeconds(5)
        );
    }
}

@Component
public class BatchCacheEviction implements CacheEvictionStrategy {

    private final Set<String> pendingEvictions = new ConcurrentHashSet<>();

    @Autowired
    private CacheManager cacheManager;

    @Override
    public void evict(String key) {
        pendingEvictions.add(key);
    }

    @Scheduled(fixedRate = 60000)  // Every minute
    public void processBatch() {
        Cache cache = cacheManager.getCache("products");
        pendingEvictions.forEach(cache::evict);
        pendingEvictions.clear();
    }

    @Override
    public void evictAll() {
        cacheManager.getCache("products").clear();
    }
}
```

**Best Practices:**

```
✅ Use @Cacheable for read operations
✅ Use @CachePut for updates
✅ Use @CacheEvict for deletions
✅ Implement cache warmup strategy
✅ Monitor cache hit/miss ratios
✅ Set appropriate TTL
✅ Use cache aside pattern for resilience
```

---


### Q17: SOLID với Asynchronous Processing và Event-Driven Architecture

**Độ khó:** Senior/Lead

**Câu trả lời:**

#### **SRP trong Async Processing**

```java
// ❌ BAD - Synchronous, blocking operations
@Service
public class OrderService {

    @Transactional
    public Order createOrder(OrderRequest request) {
        // 1. Save order (fast)
        Order order = orderRepository.save(new Order(request));

        // 2. Send email (SLOW - blocks transaction!)
        emailService.sendConfirmation(order);

        // 3. Generate PDF invoice (SLOW - blocks transaction!)
        pdfService.generateInvoice(order);

        // 4. Update analytics (SLOW - blocks transaction!)
        analyticsService.trackOrderCreation(order);

        // Transaction held open too long!
        return order;
    }
}

// ✅ GOOD - SRP: Separate fast/slow operations, use async
@Service
public class OrderService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    // SRP: Fast operation only
    @Transactional
    public Order createOrder(OrderRequest request) {
        Order order = orderRepository.save(new Order(request));

        // Publish event for async processing
        eventPublisher.publishEvent(new OrderCreatedEvent(order));

        return order;  // Fast return!
    }
}

// SRP: Separate async handlers
@Service
public class OrderEventHandlers {

    @Async
    @EventListener
    public void sendConfirmationEmail(OrderCreatedEvent event) {
        // Slow operation runs async
        emailService.sendConfirmation(event.getOrder());
    }

    @Async
    @EventListener
    public void generateInvoice(OrderCreatedEvent event) {
        // Slow operation runs async
        pdfService.generateInvoice(event.getOrder());
    }

    @Async
    @EventListener
    public void trackAnalytics(OrderCreatedEvent event) {
        // Slow operation runs async
        analyticsService.trackOrderCreation(event.getOrder());
    }
}
```

#### **OCP với Event-Driven Architecture**

```java
// ✅ OCP: Thêm event listeners không sửa publisher

// Event
public class OrderCreatedEvent extends ApplicationEvent {
    private final Order order;

    public OrderCreatedEvent(Object source, Order order) {
        super(source);
        this.order = order;
    }

    public Order getOrder() {
        return order;
    }
}

// Publisher (KHÔNG SỬA khi thêm listeners)
@Service
public class OrderService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public Order createOrder(OrderRequest request) {
        Order order = orderRepository.save(new Order(request));

        // OCP: Publish once, nhiều listeners có thể subscribe
        eventPublisher.publishEvent(new OrderCreatedEvent(this, order));

        return order;
    }
}

// Listener 1
@Service
public class EmailNotificationListener {

    @Async
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        emailService.sendConfirmation(event.getOrder());
    }
}

// Listener 2
@Service
public class InventoryListener {

    @Async
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        inventoryService.reserveItems(event.getOrder().getItems());
    }
}

// Listener 3 - OCP: Thêm listener mới, KHÔNG SỬA OrderService!
@Service
public class LoyaltyPointsListener {

    @Async
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        loyaltyService.awardPoints(event.getOrder());
    }
}

// Listener 4 - OCP: Thêm listener mới
@Service
public class FraudDetectionListener {

    @Async
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        fraudService.analyzeOrder(event.getOrder());
    }
}
```

#### **DIP với Message Queue Abstraction**

```java
// ✅ DIP: Depend on message publisher interface

// Interface (Abstraction)
public interface MessagePublisher {
    void publish(String topic, Object message);
}

// Implementation 1: RabbitMQ
@Service
@Profile("rabbitmq")
public class RabbitMQPublisher implements MessagePublisher {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Override
    public void publish(String topic, Object message) {
        rabbitTemplate.convertAndSend(topic, message);
    }
}

// Implementation 2: Kafka
@Service
@Profile("kafka")
public class KafkaPublisher implements MessagePublisher {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(String topic, Object message) {
        kafkaTemplate.send(topic, message);
    }
}

// Implementation 3: AWS SQS
@Service
@Profile("aws")
public class SqsPublisher implements MessagePublisher {

    @Autowired
    private AmazonSQS sqsClient;

    @Override
    public void publish(String topic, Object message) {
        SendMessageRequest request = new SendMessageRequest()
            .withQueueUrl(topic)
            .withMessageBody(toJson(message));
        sqsClient.sendMessage(request);
    }
}

// Service depends on interface (DIP)
@Service
public class OrderService {

    private final MessagePublisher messagePublisher;  // DIP

    public OrderService(MessagePublisher messagePublisher) {
        this.messagePublisher = messagePublisher;
    }

    public Order createOrder(OrderRequest request) {
        Order order = orderRepository.save(new Order(request));

        // DIP: Không biết RabbitMQ, Kafka hay SQS
        messagePublisher.publish("orders.created", order);

        return order;
    }
}
```

#### **Strategy Pattern cho Retry Logic**

```java
// ✅ OCP: Different retry strategies

public interface RetryStrategy {
    <T> T execute(Supplier<T> operation);
}

// Strategy 1: Exponential backoff
@Component
public class ExponentialBackoffRetry implements RetryStrategy {

    @Override
    public <T> T execute(Supplier<T> operation) {
        int maxAttempts = 5;
        long delay = 1000;  // 1 second

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return operation.get();
            } catch (Exception e) {
                if (attempt == maxAttempts) {
                    throw e;
                }
                try {
                    Thread.sleep(delay);
                    delay *= 2;  // Exponential backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ie);
                }
            }
        }
        throw new RuntimeException("Should not reach here");
    }
}

// Strategy 2: Fixed delay
@Component
public class FixedDelayRetry implements RetryStrategy {

    @Override
    public <T> T execute(Supplier<T> operation) {
        int maxAttempts = 3;
        long delay = 2000;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return operation.get();
            } catch (Exception e) {
                if (attempt == maxAttempts) {
                    throw e;
                }
                try {
                    Thread.sleep(delay);  // Fixed delay
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ie);
                }
            }
        }
        throw new RuntimeException("Should not reach here");
    }
}

// Strategy 3: No retry
@Component
public class NoRetryStrategy implements RetryStrategy {

    @Override
    public <T> T execute(Supplier<T> operation) {
        return operation.get();  // Execute once, no retry
    }
}

// Usage with Spring Retry
@Service
public class ExternalApiClient {

    @Retryable(
        value = {RestClientException.class},
        maxAttempts = 5,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public ApiResponse callExternalApi(ApiRequest request) {
        return restTemplate.postForObject(apiUrl, request, ApiResponse.class);
    }

    @Recover
    public ApiResponse recover(RestClientException e, ApiRequest request) {
        // Fallback logic when all retries failed
        return ApiResponse.error("Service temporarily unavailable");
    }
}
```

#### **Circuit Breaker Pattern (OCP + SRP)**

```java
// ✅ OCP + SRP: Circuit breaker với Resilience4j

@Service
public class PaymentService {

    @Autowired
    private PaymentGatewayClient paymentGateway;

    // Circuit breaker configuration
    @CircuitBreaker(
        name = "paymentService",
        fallbackMethod = "paymentFallback"
    )
    @Retry(name = "paymentService")
    @RateLimiter(name = "paymentService")
    public PaymentResult processPayment(Payment payment) {
        // Call external payment gateway
        return paymentGateway.charge(payment);
    }

    // Fallback method (SRP: Separate failure handling)
    private PaymentResult paymentFallback(Payment payment, Exception e) {
        log.error("Payment gateway failed, using fallback", e);

        // Fallback logic
        return PaymentResult.builder()
            .status(PaymentStatus.PENDING)
            .message("Payment is being processed offline")
            .build();
    }
}

// Configuration
# application.yml
resilience4j:
  circuitbreaker:
    instances:
      paymentService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 3

  retry:
    instances:
      paymentService:
        maxAttempts: 3
        waitDuration: 1s
        exponentialBackoffMultiplier: 2

  ratelimiter:
    instances:
      paymentService:
        limitForPeriod: 100
        limitRefreshPeriod: 1s
        timeoutDuration: 0
```

#### **Dead Letter Queue (DLQ) Pattern**

```java
// ✅ SRP: Separate success và failure handling

@Service
public class OrderMessageListener {

    @Autowired
    private OrderService orderService;

    @Autowired
    private MessagePublisher messagePublisher;

    @RabbitListener(queues = "orders.queue")
    public void handleOrderMessage(OrderMessage message) {
        try {
            // Process message
            orderService.processOrder(message);

        } catch (RetryableException e) {
            // Retry logic
            if (message.getRetryCount() < 3) {
                message.incrementRetryCount();
                messagePublisher.publish("orders.retry.queue", message);
            } else {
                // Max retries exceeded, send to DLQ
                sendToDeadLetterQueue(message, e);
            }

        } catch (NonRetryableException e) {
            // Permanent failure, send to DLQ immediately
            sendToDeadLetterQueue(message, e);
        }
    }

    private void sendToDeadLetterQueue(OrderMessage message, Exception e) {
        DeadLetterMessage dlq = DeadLetterMessage.builder()
            .originalMessage(message)
            .error(e.getMessage())
            .stackTrace(getStackTrace(e))
            .timestamp(Instant.now())
            .build();

        messagePublisher.publish("orders.dlq", dlq);

        // Alert operations team
        alertService.sendAlert("Message sent to DLQ", dlq);
    }
}
```

**Best Practices:**

```
✅ Use @Async for non-critical operations
✅ Use events for loose coupling
✅ Implement proper retry logic
✅ Use circuit breakers for external services
✅ Implement DLQ for failed messages
✅ Monitor async operations
✅ Set appropriate timeouts
✅ Handle backpressure
```

---

### Q18: SOLID với Logging và Monitoring trong Spring Boot

**Độ khó:** Mid/Senior

**Câu trả lời:**

#### **SRP trong Logging**

```java
// ❌ BAD - Logging mixed với business logic
@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public Order createOrder(OrderRequest request) {
        log.info("Creating order for customer: {}", request.getCustomerId());
        log.debug("Order request: {}", request);

        // Validation
        if (request.getItems().isEmpty()) {
            log.error("Order validation failed: no items");
            throw new ValidationException("No items in order");
        }

        log.info("Validation passed");

        Order order = new Order(request);

        log.info("Saving order to database");
        order = orderRepository.save(order);
        log.info("Order saved with ID: {}", order.getId());

        log.info("Processing payment");
        PaymentResult payment = paymentService.processPayment(order);
        log.info("Payment result: {}", payment.getStatus());

        if (!payment.isSuccess()) {
            log.error("Payment failed: {}", payment.getMessage());
            throw new PaymentException("Payment failed");
        }

        log.info("Order created successfully: {}", order.getId());
        return order;
        // Too much logging code mixed with business logic!
    }
}

// ✅ GOOD - SRP: Logging via AOP
@Service
public class OrderService {

    // Clean business logic, no logging code
    public Order createOrder(OrderRequest request) {
        validateRequest(request);

        Order order = new Order(request);
        order = orderRepository.save(order);

        PaymentResult payment = paymentService.processPayment(order);

        if (!payment.isSuccess()) {
            throw new PaymentException("Payment failed");
        }

        return order;
    }

    private void validateRequest(OrderRequest request) {
        if (request.getItems().isEmpty()) {
            throw new ValidationException("No items in order");
        }
    }
}

// SRP: Logging aspect (separate concern)
@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("@annotation(Loggable)")
    public Object logMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        log.info("Executing method: {} with args: {}", methodName, args);

        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;

            log.info("Method {} completed in {}ms", methodName, duration);

            return result;

        } catch (Exception e) {
            log.error("Method {} failed: {}", methodName, e.getMessage(), e);
            throw e;
        }
    }
}

// Usage
@Service
public class OrderService {

    @Loggable
    public Order createOrder(OrderRequest request) {
        // Business logic only
    }
}
```

#### **Strategy Pattern cho Logging**

```java
// ✅ OCP: Different logging strategies

public interface LoggingStrategy {
    void log(LogLevel level, String message, Object... args);
}

// Strategy 1: Console logging
@Component
@Profile("dev")
public class ConsoleLoggingStrategy implements LoggingStrategy {

    @Override
    public void log(LogLevel level, String message, Object... args) {
        System.out.printf("[%s] %s%n", level, String.format(message, args));
    }
}

// Strategy 2: File logging
@Component
@Profile("prod")
public class FileLoggingStrategy implements LoggingStrategy {

    private static final Logger logger = LoggerFactory.getLogger(FileLoggingStrategy.class);

    @Override
    public void log(LogLevel level, String message, Object... args) {
        switch (level) {
            case ERROR -> logger.error(message, args);
            case WARN -> logger.warn(message, args);
            case INFO -> logger.info(message, args);
            case DEBUG -> logger.debug(message, args);
        }
    }
}

// Strategy 3: Cloud logging (CloudWatch, Stackdriver, etc.)
@Component
@Profile("cloud")
public class CloudLoggingStrategy implements LoggingStrategy {

    @Autowired
    private CloudWatchLogsClient cloudWatchClient;

    @Override
    public void log(LogLevel level, String message, Object... args) {
        PutLogEventsRequest request = PutLogEventsRequest.builder()
            .logGroupName("/aws/application")
            .logStreamName("orders")
            .logEvents(InputLogEvent.builder()
                .message(String.format(message, args))
                .timestamp(System.currentTimeMillis())
                .build())
            .build();

        cloudWatchClient.putLogEvents(request);
    }
}
```

#### **Structured Logging với SRP**

```java
// ✅ SRP: Structured logging

@Component
public class StructuredLogger {

    private static final Logger log = LoggerFactory.getLogger(StructuredLogger.class);

    public void logOrderCreated(Order order) {
        // Structured log entry
        Map<String, Object> logData = Map.of(
            "event", "order_created",
            "orderId", order.getId(),
            "customerId", order.getCustomerId(),
            "totalAmount", order.getTotal(),
            "itemCount", order.getItems().size(),
            "timestamp", Instant.now()
        );

        log.info("Order event: {}", toJson(logData));
    }

    public void logPaymentProcessed(Payment payment) {
        Map<String, Object> logData = Map.of(
            "event", "payment_processed",
            "paymentId", payment.getId(),
            "orderId", payment.getOrderId(),
            "amount", payment.getAmount(),
            "gateway", payment.getGateway(),
            "status", payment.getStatus(),
            "timestamp", Instant.now()
        );

        log.info("Payment event: {}", toJson(logData));
    }

    private String toJson(Map<String, Object> data) {
        try {
            return new ObjectMapper().writeValueAsString(data);
        } catch (JsonProcessingException e) {
            return data.toString();
        }
    }
}
```

#### **Monitoring với Micrometer (DIP)**

```java
// ✅ DIP: Depend on metrics abstraction

@Service
public class OrderService {

    @Autowired
    private MeterRegistry meterRegistry;  // DIP: Abstraction

    private final Counter orderCreatedCounter;
    private final Timer orderProcessingTimer;
    private final Gauge activeOrdersGauge;

    public OrderService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        // Initialize metrics
        this.orderCreatedCounter = Counter.builder("orders.created")
            .description("Total orders created")
            .register(meterRegistry);

        this.orderProcessingTimer = Timer.builder("orders.processing.time")
            .description("Order processing time")
            .register(meterRegistry);

        // Active orders gauge
        this.activeOrdersGauge = Gauge.builder("orders.active", this, value -> getActiveOrderCount())
            .description("Number of active orders")
            .register(meterRegistry);
    }

    public Order createOrder(OrderRequest request) {
        return orderProcessingTimer.record(() -> {
            Order order = processOrder(request);

            // Increment counter
            orderCreatedCounter.increment();

            // Record custom metrics
            meterRegistry.counter("orders.items.total")
                .increment(order.getItems().size());

            meterRegistry.gauge("orders.value", order.getTotal().doubleValue());

            return order;
        });
    }

    private int getActiveOrderCount() {
        return orderRepository.countByStatus(OrderStatus.ACTIVE);
    }
}
```

#### **Health Checks (ISP)**

```java
// ✅ ISP: Specific health indicators

// Health indicator 1: Database
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    @Autowired
    private DataSource dataSource;

    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            return Health.up()
                .withDetail("database", "Available")
                .build();
        } catch (SQLException e) {
            return Health.down()
                .withDetail("database", "Unavailable")
                .withException(e)
                .build();
        }
    }
}

// Health indicator 2: External API
@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {

    @Autowired
    private PaymentGatewayClient paymentGateway;

    @Override
    public Health health() {
        try {
            paymentGateway.ping();
            return Health.up()
                .withDetail("paymentGateway", "Available")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("paymentGateway", "Unavailable")
                .withException(e)
                .build();
        }
    }
}

// Health indicator 3: Message queue
@Component
public class MessageQueueHealthIndicator implements HealthIndicator {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Override
    public Health health() {
        try {
            rabbitTemplate.execute(channel -> {
                channel.queueDeclarePassive("orders.queue");
                return null;
            });

            return Health.up()
                .withDetail("messageQueue", "Available")
                .build();

        } catch (Exception e) {
            return Health.down()
                .withDetail("messageQueue", "Unavailable")
                .withException(e)
                .build();
        }
    }
}
```

**Best Practices:**

```
✅ Use SLF4J for logging abstraction
✅ Use structured logging (JSON format)
✅ Implement logging via AOP for cross-cutting concerns
✅ Use Micrometer for metrics
✅ Implement custom health indicators
✅ Monitor business metrics, not just technical metrics
✅ Use distributed tracing (Sleuth + Zipkin)
✅ Set up alerts for critical metrics
```

---

### Q19: SOLID với Security Implementation trong Spring Boot

**Độ khó:** Senior

**Câu trả lời:**

#### **SRP trong Security Configuration**

```java
// ❌ BAD - Monolithic security config
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS config
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // CSRF config
            .csrf(csrf -> csrf.disable())

            // Session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated())

            // Authentication
            .httpBasic(Customizer.withDefaults())

            // OAuth2 config
            .oauth2Login(oauth -> oauth
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oauth2UserService())))

            // JWT config
            .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class)

            // Exception handling
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint())
                .accessDeniedHandler(accessDeniedHandler()));

        return http.build();
        // Too many responsibilities in one method!
    }
}

// ✅ GOOD - SRP: Tách thành nhiều configuration classes

// 1. Base security config
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

// 2. Authorization config (SRP)
@Configuration
public class AuthorizationConfig {

    @Bean
    public SecurityFilterChain authorizationFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
            .anyRequest().authenticated());

        return http.build();
    }
}

// 3. CORS config (SRP)
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

// 4. OAuth2 config (SRP)
@Configuration
public class OAuth2Config {

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        return new CustomOAuth2UserService();
    }
}
```

#### **Strategy Pattern cho Authentication**

```java
// ✅ OCP: Multiple authentication strategies

// Interface
public interface AuthenticationStrategy {
    Authentication authenticate(AuthenticationRequest request);
    boolean supports(AuthenticationType type);
}

// Strategy 1: JWT authentication
@Component
public class JwtAuthenticationStrategy implements AuthenticationStrategy {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public Authentication authenticate(AuthenticationRequest request) {
        String token = request.getToken();

        if (!jwtTokenProvider.validateToken(token)) {
            throw new AuthenticationException("Invalid JWT token");
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        List<GrantedAuthority> authorities = jwtTokenProvider.getAuthorities(token);

        return new UsernamePasswordAuthenticationToken(username, null, authorities);
    }

    @Override
    public boolean supports(AuthenticationType type) {
        return type == AuthenticationType.JWT;
    }
}

// Strategy 2: OAuth2 authentication
@Component
public class OAuth2AuthenticationStrategy implements AuthenticationStrategy {

    @Autowired
    private OAuth2TokenValidator tokenValidator;

    @Override
    public Authentication authenticate(AuthenticationRequest request) {
        String accessToken = request.getToken();

        OAuth2User user = tokenValidator.validateAndGetUser(accessToken);

        return new OAuth2AuthenticationToken(
            user,
            user.getAuthorities(),
            "oauth2"
        );
    }

    @Override
    public boolean supports(AuthenticationType type) {
        return type == AuthenticationType.OAUTH2;
    }
}

// Strategy 3: API Key authentication
@Component
public class ApiKeyAuthenticationStrategy implements AuthenticationStrategy {

    @Autowired
    private ApiKeyService apiKeyService;

    @Override
    public Authentication authenticate(AuthenticationRequest request) {
        String apiKey = request.getApiKey();

        if (!apiKeyService.isValid(apiKey)) {
            throw new AuthenticationException("Invalid API key");
        }

        ApiKeyDetails details = apiKeyService.getDetails(apiKey);

        return new ApiKeyAuthenticationToken(
            details.getClientId(),
            apiKey,
            details.getAuthorities()
        );
    }

    @Override
    public boolean supports(AuthenticationType type) {
        return type == AuthenticationType.API_KEY;
    }
}

// Authentication manager using strategies (OCP)
@Service
public class MultiAuthenticationManager {

    private final List<AuthenticationStrategy> strategies;

    @Autowired
    public MultiAuthenticationManager(List<AuthenticationStrategy> strategies) {
        this.strategies = strategies;
    }

    // OCP: Thêm authentication type không sửa code này
    public Authentication authenticate(AuthenticationRequest request) {
        for (AuthenticationStrategy strategy : strategies) {
            if (strategy.supports(request.getType())) {
                return strategy.authenticate(request);
            }
        }

        throw new AuthenticationException("No authentication strategy found for: " + request.getType());
    }
}
```

#### **DIP trong Authorization**

```java
// ✅ DIP: Depend on authorization interface

// Interface (Abstraction)
public interface AuthorizationService {
    boolean hasPermission(String userId, String resource, String action);
    List<String> getUserPermissions(String userId);
}

// Implementation 1: Role-based
@Service
@Profile("role-based")
public class RoleBasedAuthorizationService implements AuthorizationService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean hasPermission(String userId, String resource, String action) {
        User user = userRepository.findById(userId).orElseThrow();

        return user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .anyMatch(permission ->
                permission.getResource().equals(resource) &&
                permission.getAction().equals(action)
            );
    }

    @Override
    public List<String> getUserPermissions(String userId) {
        User user = userRepository.findById(userId).orElseThrow();

        return user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .map(Permission::getName)
            .toList();
    }
}

// Implementation 2: Attribute-based (ABAC)
@Service
@Profile("attribute-based")
public class AttributeBasedAuthorizationService implements AuthorizationService {

    @Autowired
    private PolicyEvaluator policyEvaluator;

    @Override
    public boolean hasPermission(String userId, String resource, String action) {
        AuthorizationContext context = AuthorizationContext.builder()
            .userId(userId)
            .resource(resource)
            .action(action)
            .build();

        return policyEvaluator.evaluate(context);
    }

    @Override
    public List<String> getUserPermissions(String userId) {
        return policyEvaluator.getUserPermissions(userId);
    }
}

// Controller depends on interface (DIP)
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private AuthorizationService authorizationService;  // DIP

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id, Principal principal) {
        // DIP: Không biết implementation nào
        if (!authorizationService.hasPermission(
                principal.getName(),
                "order:" + id,
                "read")) {
            throw new AccessDeniedException("Not authorized");
        }

        return orderService.findById(id);
    }
}
```

#### **Permission Annotation (AOP + SRP)**

```java
// ✅ SRP: Permission checking via AOP

// Custom annotation
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {
    String resource();
    String action();
}

// AOP aspect for permission checking
@Aspect
@Component
public class PermissionAspect {

    @Autowired
    private AuthorizationService authorizationService;

    @Around("@annotation(requiresPermission)")
    public Object checkPermission(
            ProceedingJoinPoint joinPoint,
            RequiresPermission requiresPermission) throws Throwable {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        boolean hasPermission = authorizationService.hasPermission(
            userId,
            requiresPermission.resource(),
            requiresPermission.action()
        );

        if (!hasPermission) {
            throw new AccessDeniedException(
                String.format("User %s not authorized for %s:%s",
                    userId,
                    requiresPermission.resource(),
                    requiresPermission.action())
            );
        }

        return joinPoint.proceed();
    }
}

// Usage - Clean controller code
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping("/{id}")
    @RequiresPermission(resource = "order", action = "read")
    public Order getOrder(@PathVariable Long id) {
        return orderService.findById(id);  // Permission checked by AOP
    }

    @PutMapping("/{id}")
    @RequiresPermission(resource = "order", action = "update")
    public Order updateOrder(@PathVariable Long id, @RequestBody OrderRequest request) {
        return orderService.updateOrder(id, request);
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(resource = "order", action = "delete")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }
}
```

**Best Practices:**

```
✅ Use Spring Security for authentication/authorization
✅ Implement multiple authentication strategies
✅ Use method-level security with annotations
✅ Implement proper password encoding
✅ Use JWT for stateless authentication
✅ Implement CSRF protection for stateful apps
✅ Use HTTPS in production
✅ Implement rate limiting
✅ Log security events
✅ Use security headers (HSTS, CSP, etc.)
```

---


### Q20: SOLID với Validation và Data Transfer Objects (DTOs)

**Độ khó:** Mid

**Câu trả lời:**

#### **SRP trong Validation**

```java
// ❌ BAD - Validation mixed with business logic
@Service
public class UserService {

    public User createUser(UserRequest request) {
        // Validation logic mixed with business logic
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ValidationException("Email is required");
        }

        if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ValidationException("Invalid email format");
        }

        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new ValidationException("Password must be at least 8 characters");
        }

        if (!request.getPassword().matches(".*[A-Z].*")) {
            throw new ValidationException("Password must contain uppercase letter");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists");
        }

        // Finally, business logic
        User user = new User(request);
        return userRepository.save(user);
    }
}

// ✅ GOOD - SRP: Separate validation

// 1. Bean Validation in DTO
public class UserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = ".*[A-Z].*", message = "Password must contain uppercase letter")
    @Pattern(regexp = ".*[a-z].*", message = "Password must contain lowercase letter")
    @Pattern(regexp = ".*\\d.*", message = "Password must contain digit")
    private String password;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @Min(value = 18, message = "Must be at least 18 years old")
    @Max(value = 120, message = "Age must be realistic")
    private Integer age;
}

// 2. Custom validator for business rules
@Component
public class UserRequestValidator implements Validator {

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean supports(Class<?> clazz) {
        return UserRequest.class.equals(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        UserRequest request = (UserRequest) target;

        // Business rule validation
        if (userRepository.existsByEmail(request.getEmail())) {
            errors.rejectValue("email", "email.exists", "Email already registered");
        }

        // Complex validation logic
        if (request.getAge() < 18 && request.isRequiresParentalConsent() == null) {
            errors.rejectValue("requiresParentalConsent",
                "parental.consent.required",
                "Parental consent required for users under 18");
        }
    }
}

// 3. Clean service with separated validation
@Service
public class UserService {

    @Autowired
    private UserRequestValidator validator;

    // SRP: Only business logic
    public User createUser(@Valid UserRequest request) {
        // Bean validation handled by @Valid
        // Custom validation
        Errors errors = new BeanPropertyBindingResult(request, "userRequest");
        validator.validate(request, errors);

        if (errors.hasErrors()) {
            throw new ValidationException(errors.getAllErrors());
        }

        // Clean business logic
        User user = new User(request);
        return userRepository.save(user);
    }
}
```

#### **Strategy Pattern cho Different Validation Rules**

```java
// ✅ OCP: Different validation strategies

public interface ValidationStrategy<T> {
    void validate(T object, Errors errors);
}

// Strategy 1: Email validation
@Component
public class EmailValidationStrategy implements ValidationStrategy<UserRequest> {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void validate(UserRequest request, Errors errors) {
        if (userRepository.existsByEmail(request.getEmail())) {
            errors.rejectValue("email", "email.exists", "Email already exists");
        }
    }
}

// Strategy 2: Password strength validation
@Component
public class PasswordStrengthValidationStrategy implements ValidationStrategy<UserRequest> {

    @Override
    public void validate(UserRequest request, Errors errors) {
        String password = request.getPassword();

        int strength = 0;
        if (password.matches(".*[A-Z].*")) strength++;
        if (password.matches(".*[a-z].*")) strength++;
        if (password.matches(".*\\d.*")) strength++;
        if (password.matches(".*[!@#$%^&*].*")) strength++;

        if (strength < 3) {
            errors.rejectValue("password", "password.weak",
                "Password must contain at least 3 of: uppercase, lowercase, digit, special char");
        }
    }
}

// Strategy 3: Age validation
@Component
public class AgeValidationStrategy implements ValidationStrategy<UserRequest> {

    @Override
    public void validate(UserRequest request, Errors errors) {
        if (request.getAge() < 13) {
            errors.rejectValue("age", "age.too.young",
                "Users must be at least 13 years old");
        }
    }
}

// Composite validator (OCP)
@Component
public class CompositeUserValidator implements Validator {

    private final List<ValidationStrategy<UserRequest>> strategies;

    @Autowired
    public CompositeUserValidator(List<ValidationStrategy<UserRequest>> strategies) {
        this.strategies = strategies;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return UserRequest.class.equals(clazz);
    }

    // OCP: Thêm validation strategy không sửa code này
    @Override
    public void validate(Object target, Errors errors) {
        UserRequest request = (UserRequest) target;

        for (ValidationStrategy<UserRequest> strategy : strategies) {
            strategy.validate(request, errors);
        }
    }
}
```

#### **DTO Pattern (SRP + ISP)**

```java
// ✅ SRP: Separate DTOs cho different use cases

// 1. Request DTO - For creating user
public class CreateUserRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank
    private String name;

    @Min(18)
    private Integer age;
}

// 2. Request DTO - For updating user
public class UpdateUserRequest {
    // Không có email (cannot update)
    // Không có password (use separate endpoint)

    @NotBlank
    private String name;

    @Min(18)
    private Integer age;

    private String phoneNumber;
    private String address;
}

// 3. Response DTO - Public profile
public class UserPublicResponse {
    private Long id;
    private String name;
    private String avatarUrl;
    private LocalDateTime memberSince;

    // Không có email, password, sensitive data
}

// 4. Response DTO - Full profile (for owner)
public class UserPrivateResponse {
    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
    private String address;
    private Integer age;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    // Có email và private data, nhưng không có password
}

// 5. Response DTO - Admin view
public class UserAdminResponse {
    private Long id;
    private String email;
    private String name;
    private UserStatus status;
    private List<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Integer loginCount;
    private boolean emailVerified;
}

// ISP: Mỗi client chỉ nhận data cần thiết
@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping
    public UserPrivateResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(request);
        return toPrivateResponse(user);  // Owner gets full data
    }

    @GetMapping("/{id}/public")
    public UserPublicResponse getPublicProfile(@PathVariable Long id) {
        User user = userService.findById(id);
        return toPublicResponse(user);  // Public gets limited data
    }

    @GetMapping("/{id}/private")
    public UserPrivateResponse getPrivateProfile(@PathVariable Long id, Principal principal) {
        checkOwnership(id, principal);
        User user = userService.findById(id);
        return toPrivateResponse(user);  // Owner gets full data
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserAdminResponse getAdminView(@PathVariable Long id) {
        User user = userService.findById(id);
        return toAdminResponse(user);  // Admin gets admin data
    }
}
```

**Best Practices:**

```
✅ Use Bean Validation (@Valid, @NotNull, etc.)
✅ Implement custom validators for business rules
✅ Create separate DTOs for different use cases
✅ Never expose entity classes directly in API
✅ Use validation groups for conditional validation
✅ Implement proper error messages
✅ Use DTO mappers (MapStruct, ModelMapper)
```

---

### Q21: SOLID Code Metrics - Làm sao đo lường code quality?

**Độ khó:** Senior/Lead

**Câu trả lời:**

#### **Metrics để đánh giá SOLID Compliance**

**1. Single Responsibility Principle Metrics:**

```
Lines of Code (LOC) per class:
✅ < 200 lines: Good
⚠️ 200-500 lines: Review needed
❌ > 500 lines: Likely violates SRP

Number of methods per class:
✅ < 10 methods: Good
⚠️ 10-20 methods: Review needed
❌ > 20 methods: Likely violates SRP

Cyclomatic Complexity:
✅ < 10: Good
⚠️ 10-20: Review needed
❌ > 20: Refactor immediately

Number of dependencies:
✅ < 5 dependencies: Good
⚠️ 5-10 dependencies: Review
❌ > 10 dependencies: Violates SRP
```

**2. Open/Closed Principle Metrics:**

```
Number of if-else/switch statements for type checking:
✅ 0: Good (using polymorphism)
❌ > 0: Consider Strategy/Factory pattern

Modification frequency:
✅ Low: Class stable, extends via subclasses
❌ High: Violates OCP, needs refactoring

Abstract/Interface usage:
✅ High: Design for extension
❌ Low: Hard to extend
```

**3. Liskov Substitution Principle Metrics:**

```
Test coverage for polymorphic code:
✅ All implementations tested with same test suite: Good
❌ Different tests per implementation: Review LSP

instanceof checks in client code:
✅ 0: Perfect LSP compliance
❌ > 0: Violates LSP

Exception differences between parent/child:
✅ Same exceptions: Good LSP
❌ Different exceptions: Violates LSP
```

**4. Interface Segregation Principle Metrics:**

```
Number of methods per interface:
✅ < 5 methods: Good
⚠️ 5-10 methods: Review
❌ > 10 methods: Violates ISP

Interface implementation ratio:
✅ Classes implement 100% of methods: Good
❌ Classes throw UnsupportedOperationException: Violates ISP

Number of clients per interface:
✅ Specialized interfaces with few clients: Good
❌ Fat interface with many clients using subsets: Violates ISP
```

**5. Dependency Inversion Principle Metrics:**

```
Abstraction/Instability ratio (A/I):
✅ Close to 1 for unstable packages: Good
✅ Close to 0 for stable packages: Good
❌ Unstable packages with low abstraction: Violates DIP

Dependency direction:
✅ Dependencies point toward abstractions: Good
❌ Dependencies point toward concrete classes: Violates DIP

Testability:
✅ Easy to mock dependencies: Good DIP
❌ Hard to test (new keyword in business logic): Violates DIP
```

#### **Tools để đo lường SOLID**

**1. SonarQube Configuration:**

```xml
<!-- pom.xml -->
<properties>
    <sonar.java.codeCoveragePlugin>jacoco</sonar.java.codeCoveragePlugin>
    <sonar.dynamicAnalysis>reuseReports</sonar.dynamicAnalysis>
    <sonar.jacoco.reportPath>${project.basedir}/../target/jacoco.exec</sonar.jacoco.reportPath>
</properties>

<profiles>
    <profile>
        <id>sonar</id>
        <build>
            <plugins>
                <plugin>
                    <groupId>org.sonarsource.scanner.maven</groupId>
                    <artifactId>sonar-maven-plugin</artifactId>
                    <version>3.9.1.2184</version>
                </plugin>
            </plugins>
        </build>
    </profile>
</profiles>
```

```yaml
# sonar-project.properties
sonar.projectKey=my-spring-boot-app
sonar.projectName=My Spring Boot Application

# Quality Gates
sonar.qualitygate.wait=true

# Code Smells thresholds
sonar.issue.ignore.multicriteria=e1,e2,e3

# Too many parameters (> 7) - Violates SRP
sonar.issue.ignore.multicriteria.e1.ruleKey=java:S107
sonar.issue.ignore.multicriteria.e1.resourceKey=**/*.java

# Cognitive Complexity
sonar.java.cognitiveComplexity.threshold=15

# Coverage
sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml
```

**2. ArchUnit Tests for SOLID:**

```java
// Test cho Dependency Inversion Principle
@Test
void servicesShouldDependOnInterfaces() {
    classes()
        .that().resideInAPackage("..service..")
        .should().dependOnClassesThat()
            .resideInAnyPackage("..repository..", "..client..")
        .orShould().onlyDependOnClassesThat()
            .areInterfaces()
        .check(importedClasses);
}

// Test cho Single Responsibility
@Test
void classesShouldNotBeNamedXXXManager() {
    noClasses()
        .should().haveSimpleNameEndingWith("Manager")
        .orShould().haveSimpleNameEndingWith("Util")
        .orShould().haveSimpleNameEndingWith("Helper")
        .because("These names suggest violation of SRP")
        .check(importedClasses);
}

// Test cho Liskov Substitution
@Test
void implementationsShouldNotThrowUnsupportedOperationException() {
    methods()
        .that().areDeclaredInClassesThat()
            .implement(Repository.class)
        .should().notThrowException(UnsupportedOperationException.class)
        .because("All methods should be properly implemented (LSP)")
        .check(importedClasses);
}

// Test cho Interface Segregation
@Test
void interfacesShouldNotHaveTooManyMethods() {
    classes()
        .that().areInterfaces()
        .should(ArchConditions.notHaveMoreThan(7).methods())
        .because("Interfaces should be specific (ISP)")
        .check(importedClasses);
}
```

**3. Checkstyle Rules:**

```xml
<!-- checkstyle.xml -->
<module name="Checker">
    <!-- SRP: Limit file length -->
    <module name="FileLength">
        <property name="max" value="500"/>
    </module>

    <module name="TreeWalker">
        <!-- SRP: Limit method length -->
        <module name="MethodLength">
            <property name="max" value="50"/>
            <property name="tokens" value="METHOD_DEF"/>
        </module>

        <!-- SRP: Limit class fan-out complexity -->
        <module name="ClassFanOutComplexity">
            <property name="max" value="20"/>
        </module>

        <!-- SRP: Limit cyclomatic complexity -->
        <module name="CyclomaticComplexity">
            <property name="max" value="10"/>
        </module>

        <!-- ISP: Limit parameter number -->
        <module name="ParameterNumber">
            <property name="max" value="7"/>
        </module>

        <!-- DIP: Avoid star imports -->
        <module name="AvoidStarImport"/>
    </module>
</module>
```

**4. PMD Rules:**

```xml
<!-- pmd-ruleset.xml -->
<ruleset name="SOLID Rules">
    <!-- SRP: God Class detection -->
    <rule ref="category/java/design.xml/GodClass"/>

    <!-- SRP: Too many methods -->
    <rule ref="category/java/design.xml/TooManyMethods">
        <properties>
            <property name="maxmethods" value="10"/>
        </properties>
    </rule>

    <!-- SRP: Too many fields -->
    <rule ref="category/java/design.xml/TooManyFields">
        <properties>
            <property name="maxfields" value="15"/>
        </properties>
    </rule>

    <!-- OCP: Switch statements -->
    <rule ref="category/java/design.xml/AvoidDeeplyNestedIfStmts"/>

    <!-- SRP: Excessive imports -->
    <rule ref="category/java/design.xml/ExcessiveImports">
        <properties>
            <property name="minimum" value="30"/>
        </properties>
    </rule>

    <!-- SRP: Coupling between objects -->
    <rule ref="category/java/design.xml/CouplingBetweenObjects">
        <properties>
            <property name="threshold" value="20"/>
        </properties>
    </rule>
</ruleset>
```

**5. Custom Gradle Task:**

```gradle
// build.gradle
task solidMetrics {
    doLast {
        def metrics = [:]

        // Count classes with > 500 LOC
        def longClasses = fileTree('src/main/java')
            .filter { it.readLines().size() > 500 }

        metrics['Classes > 500 LOC'] = longClasses.files.size()

        // Count interfaces vs implementations
        def interfaces = fileTree('src/main/java')
            .filter { it.text.contains('interface ') }

        def classes = fileTree('src/main/java')
            .filter { it.text.contains('class ') }

        metrics['Abstraction ratio'] =
            interfaces.files.size() / (classes.files.size() ?: 1)

        // Report
        println "========== SOLID Metrics =========="
        metrics.each { key, value ->
            println "$key: $value"
        }
    }
}
```

**Quality Gates:**

```
MUST PASS:
- Code coverage > 80%
- No critical/blocker issues
- Technical debt ratio < 5%
- Duplicated lines < 3%

SHOULD PASS:
- Cognitive complexity < 15 per method
- Cyclomatic complexity < 10 per method
- Lines of code < 200 per class
- Methods < 10 per class
- Parameters < 7 per method
```

---

### Q22: SOLID Real-World Examples trong Production Systems

**Độ khó:** Senior/Lead

**Câu trả lời:**

#### **Case Study 1: E-commerce Order Processing**

**Before SOLID (Monolithic Nightmare):**

```java
// ❌ 1500+ lines God Class
@Service
public class OrderProcessor {

    public void processOrder(Map<String, Object> orderData) {
        // 50+ lines validation
        // 100+ lines price calculation with if-else
        // 200+ lines payment processing with switch
        // 150+ lines inventory management
        // 100+ lines email notification
        // 200+ lines shipping calculation
        // 150+ lines tax calculation
        // 300+ lines fraud detection
        // 100+ lines loyalty points
        // 150+ lines analytics tracking

        // NIGHTMARE:
        // - Cannot test individual pieces
        // - One bug breaks everything
        // - Takes 10 seconds to process
        // - Holds DB connection entire time
        // - Cannot scale
        // - Adding new payment method requires changing 5+ places
    }
}
```

**After SOLID (Microservices + Events):**

```java
// ✅ Clean orchestration (50 lines)
@Service
public class OrderService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Transactional
    public Order createOrder(OrderRequest request) {
        // SRP: Only order creation
        Order order = Order.builder()
            .customerId(request.getCustomerId())
            .items(request.getItems())
            .status(OrderStatus.PENDING)
            .build();

        order = orderRepository.save(order);

        // OCP: Publish event, listeners can subscribe
        eventPublisher.publishEvent(new OrderCreatedEvent(order));

        return order;
    }
}

// Separate event handlers (SRP)
@Service
public class PaymentEventHandler {

    @Async
    @EventListener
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Only payment logic
        paymentService.processPayment(event.getOrder());
    }
}

@Service
public class InventoryEventHandler {

    @Async
    @EventListener
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Only inventory logic
        inventoryService.reserveItems(event.getOrder().getItems());
    }
}

// Results:
// ✅ Order creation: 50ms (was 10s)
// ✅ Each component can scale independently
// ✅ Easy to test each piece
// ✅ Adding new payment method: 1 new class (was changing 5+ files)
// ✅ Can deploy payment service without touching order service
```

#### **Case Study 2: Payment Gateway Integration**

**Before SOLID:**

```java
// ❌ Tightly coupled to Stripe
@Service
public class PaymentService {

    private StripeClient stripeClient = new StripeClient(apiKey);

    public String processPayment(Order order) {
        try {
            Charge charge = stripeClient.charges().create(
                ChargeCreateParams.builder()
                    .setAmount(order.getTotal().longValue())
                    .setCurrency("usd")
                    .setCustomer(order.getCustomerId())
                    .build()
            );

            return charge.getId();

        } catch (StripeException e) {
            throw new PaymentException("Stripe failed", e);
        }
    }

    // Problem: Switching to PayPal requires rewriting ENTIRE class!
}
```

**After SOLID:**

```java
// ✅ DIP + Strategy Pattern
public interface PaymentGateway {
    PaymentResult charge(PaymentRequest request);
    PaymentResult refund(String transactionId);
}

@Service
@Qualifier("stripe")
public class StripeGateway implements PaymentGateway {

    @Autowired
    private StripeClient stripeClient;

    @Override
    public PaymentResult charge(PaymentRequest request) {
        // Stripe implementation
    }
}

@Service
@Qualifier("paypal")
public class PayPalGateway implements PaymentGateway {

    @Autowired
    private PayPalClient paypalClient;

    @Override
    public PaymentResult charge(PaymentRequest request) {
        // PayPal implementation
    }
}

// Smart routing with fallback
@Service
public class PaymentService {

    @Autowired
    @Qualifier("stripe")
    private PaymentGateway primaryGateway;

    @Autowired
    @Qualifier("paypal")
    private PaymentGateway fallbackGateway;

    @CircuitBreaker(name = "payment", fallbackMethod = "paymentFallback")
    public PaymentResult processPayment(PaymentRequest request) {
        try {
            return primaryGateway.charge(request);
        } catch (PaymentException e) {
            log.warn("Primary gateway failed, using fallback");
            return fallbackGateway.charge(request);
        }
    }
}

// Results:
// ✅ Switch gateway: Change config, no code change
// ✅ Add new gateway: Create 1 new class
// ✅ Test with mock gateway: Easy
// ✅ Automatic fallback: 99.99% uptime
```

#### **Case Study 3: Notification System**

**Before SOLID:**

```java
// ❌ Shotgun surgery - Adding SMS requires changing 10+ files
@Service
public class NotificationService {

    public void sendNotification(User user, String message, String type) {
        if (type.equals("EMAIL")) {
            // Email logic in service
            emailSender.send(user.getEmail(), message);

        } else if (type.equals("PUSH")) {
            // Push notification logic in service
            pushSender.send(user.getDeviceToken(), message);
        }

        // Want to add SMS? Modify this method + 9 other files!
    }
}
```

**After SOLID:**

```java
// ✅ Strategy + Factory Pattern
public interface NotificationChannel {
    void send(String recipient, String message);
    NotificationType getType();
}

@Component
public class EmailChannel implements NotificationChannel {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void send(String recipient, String message) {
        // Email implementation
    }

    @Override
    public NotificationType getType() {
        return NotificationType.EMAIL;
    }
}

@Component
public class SmsChannel implements NotificationChannel {

    @Autowired
    private TwilioClient twilioClient;

    @Override
    public void send(String recipient, String message) {
        // SMS implementation
    }

    @Override
    public NotificationType getType() {
        return NotificationType.SMS;
    }
}

// OCP: Adding WhatsApp = 1 new class, ZERO changes to existing code
@Component
public class WhatsAppChannel implements NotificationChannel {

    @Autowired
    private WhatsAppClient whatsAppClient;

    @Override
    public void send(String recipient, String message) {
        // WhatsApp implementation
    }

    @Override
    public NotificationType getType() {
        return NotificationType.WHATSAPP;
    }
}

@Service
public class NotificationService {

    private final Map<NotificationType, NotificationChannel> channels;

    @Autowired
    public NotificationService(List<NotificationChannel> channelList) {
        this.channels = channelList.stream()
            .collect(Collectors.toMap(
                NotificationChannel::getType,
                Function.identity()
            ));
    }

    // OCP: Add channels without modifying this method!
    public void send(NotificationType type, String recipient, String message) {
        NotificationChannel channel = channels.get(type);

        if (channel == null) {
            throw new IllegalArgumentException("Unsupported channel: " + type);
        }

        channel.send(recipient, message);
    }

    // Send to multiple channels
    public void broadcast(Set<NotificationType> types, String recipient, String message) {
        types.forEach(type -> send(type, recipient, message));
    }
}

// Results:
// ✅ Add WhatsApp: 1 file created, 0 files modified
// ✅ Test each channel independently
// ✅ Can disable/enable channels via config
// ✅ Easy to add rate limiting per channel
```

**Production Metrics Comparison:**

| Metric | Before SOLID | After SOLID | Improvement |
|--------|--------------|-------------|-------------|
| **Deployment frequency** | 1x per month | 10x per day | 300x |
| **Mean time to recovery** | 4 hours | 15 minutes | 16x |
| **Change failure rate** | 45% | 5% | 9x |
| **Lead time for changes** | 2 weeks | 2 hours | 168x |
| **Test coverage** | 30% | 85% | 2.8x |
| **Bug rate** | 15 per week | 2 per week | 7.5x |
| **Code review time** | 2 days | 2 hours | 24x |

---


### Q23: SOLID với Domain-Driven Design (DDD)

**Độ khó:** Senior/Lead

**Câu trả lời:**

#### **Aggregate Pattern (SRP + DIP)**

```java
// ✅ Aggregate Root tuân theo SOLID

// Value Object (Immutable, SRP)
@Embeddable
public class Money {
    private BigDecimal amount;
    private String currency;

    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    // Immutable - Không có setters
}

// Entity (SRP: Chỉ order item logic)
@Entity
public class OrderItem {
    @Id
    private Long id;

    private String productId;
    private int quantity;

    @Embedded
    private Money unitPrice;

    // Business logic trong entity
    public Money calculateTotal() {
        return new Money(
            unitPrice.getAmount().multiply(BigDecimal.valueOf(quantity)),
            unitPrice.getCurrency()
        );
    }

    public void changeQuantity(int newQuantity) {
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        this.quantity = newQuantity;
    }
}

// Aggregate Root (SRP: Order orchestration)
@Entity
public class Order {
    @Id
    private Long id;

    private String customerId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Embedded
    private Money totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // SRP: Business rules trong aggregate root
    public void addItem(String productId, int quantity, Money unitPrice) {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify confirmed order");
        }

        OrderItem item = new OrderItem(productId, quantity, unitPrice);
        items.add(item);
        recalculateTotal();
    }

    public void removeItem(Long itemId) {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify confirmed order");
        }

        items.removeIf(item -> item.getId().equals(itemId));
        recalculateTotal();
    }

    public void confirm() {
        if (items.isEmpty()) {
            throw new IllegalStateException("Cannot confirm empty order");
        }

        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Order already confirmed");
        }

        this.status = OrderStatus.CONFIRMED;
    }

    private void recalculateTotal() {
        this.totalAmount = items.stream()
            .map(OrderItem::calculateTotal)
            .reduce(Money.ZERO, Money::add);
    }

    // Aggregate root ensures consistency
    // All modifications go through aggregate root methods
}
```

#### **Repository Pattern (DIP + ISP)**

```java
// ✅ DIP: Repository interface (abstraction)

// Interface segregation - Specific repositories
public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findByCustomerId(String customerId);
}

public interface OrderReadRepository {
    Optional<Order> findById(Long id);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByCustomerId(String customerId);
}

public interface OrderWriteRepository {
    Order save(Order order);
    void delete(Order order);
}

// Implementation (JPA)
@Repository
public class JpaOrderRepository implements OrderRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Order save(Order order) {
        if (order.getId() == null) {
            entityManager.persist(order);
            return order;
        } else {
            return entityManager.merge(order);
        }
    }

    @Override
    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(entityManager.find(Order.class, id));
    }

    @Override
    public List<Order> findByCustomerId(String customerId) {
        return entityManager
            .createQuery("SELECT o FROM Order o WHERE o.customerId = :customerId", Order.class)
            .setParameter("customerId", customerId)
            .getResultList();
    }
}

// Service depends on interface (DIP)
@Service
public class OrderService {

    private final OrderRepository orderRepository;  // DIP

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Order createOrder(CreateOrderCommand command) {
        Order order = new Order(command.getCustomerId());

        command.getItems().forEach(item ->
            order.addItem(item.getProductId(), item.getQuantity(), item.getUnitPrice())
        );

        return orderRepository.save(order);
    }
}
```

#### **Domain Events (OCP + SRP)**

```java
// ✅ Domain events for cross-aggregate communication

// Domain event
public class OrderConfirmedEvent extends DomainEvent {
    private final Long orderId;
    private final String customerId;
    private final Money totalAmount;

    public OrderConfirmedEvent(Order order) {
        super();
        this.orderId = order.getId();
        this.customerId = order.getCustomerId();
        this.totalAmount = order.getTotalAmount();
    }
}

// Aggregate publishes events
@Entity
public class Order extends AbstractAggregateRoot<Order> {

    public void confirm() {
        if (items.isEmpty()) {
            throw new IllegalStateException("Cannot confirm empty order");
        }

        this.status = OrderStatus.CONFIRMED;

        // Register domain event
        registerEvent(new OrderConfirmedEvent(this));
    }
}

// Event handlers (OCP: Thêm handlers không sửa aggregate)
@Service
public class OrderEventHandlers {

    @Async
    @TransactionalEventListener
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        // Update inventory
        inventoryService.reserveItems(event.getOrderId());
    }

    @Async
    @TransactionalEventListener
    public void sendConfirmationEmail(OrderConfirmedEvent event) {
        // Send email
        emailService.sendOrderConfirmation(event.getCustomerId(), event.getOrderId());
    }

    @Async
    @TransactionalEventListener
    public void awardLoyaltyPoints(OrderConfirmedEvent event) {
        // Award points
        loyaltyService.awardPoints(event.getCustomerId(), event.getTotalAmount());
    }
}
```

#### **Specification Pattern (OCP)**

```java
// ✅ OCP: Composable specifications

public interface Specification<T> {
    boolean isSatisfiedBy(T candidate);
    Specification<T> and(Specification<T> other);
    Specification<T> or(Specification<T> other);
    Specification<T> not();
}

// Base implementation
public abstract class AbstractSpecification<T> implements Specification<T> {

    @Override
    public Specification<T> and(Specification<T> other) {
        return new AndSpecification<>(this, other);
    }

    @Override
    public Specification<T> or(Specification<T> other) {
        return new OrSpecification<>(this, other);
    }

    @Override
    public Specification<T> not() {
        return new NotSpecification<>(this);
    }
}

// Concrete specifications
public class OrderIsConfirmedSpecification extends AbstractSpecification<Order> {

    @Override
    public boolean isSatisfiedBy(Order order) {
        return order.getStatus() == OrderStatus.CONFIRMED;
    }
}

public class OrderTotalExceedsSpecification extends AbstractSpecification<Order> {

    private final Money threshold;

    public OrderTotalExceedsSpecification(Money threshold) {
        this.threshold = threshold;
    }

    @Override
    public boolean isSatisfiedBy(Order order) {
        return order.getTotalAmount().isGreaterThan(threshold);
    }
}

public class OrderIsRecentSpecification extends AbstractSpecification<Order> {

    private final int days;

    public OrderIsRecentSpecification(int days) {
        this.days = days;
    }

    @Override
    public boolean isSatisfiedBy(Order order) {
        LocalDate cutoff = LocalDate.now().minusDays(days);
        return order.getCreatedAt().toLocalDate().isAfter(cutoff);
    }
}

// Usage - OCP: Compose specifications
@Service
public class OrderService {

    public List<Order> findHighValueRecentOrders() {
        Specification<Order> spec = new OrderIsConfirmedSpecification()
            .and(new OrderTotalExceedsSpecification(Money.of(1000, "USD")))
            .and(new OrderIsRecentSpecification(30));

        return orderRepository.findAll().stream()
            .filter(spec::isSatisfiedBy)
            .collect(Collectors.toList());
    }
}
```

**DDD + SOLID Benefits:**

```
✅ Business logic in domain objects (Rich Domain Model)
✅ Aggregate roots enforce consistency
✅ Domain events for loose coupling
✅ Repository pattern for persistence abstraction
✅ Specification pattern for flexible queries
✅ Value objects for immutability
```

---

### Q24: SOLID Common Pitfalls và Solutions

**Độ khó:** Senior

**Câu trả lời:**

#### **Pitfall 1: Over-Engineering với SOLID**

```java
// ❌ PITFALL: Premature abstraction

// Don't create interface cho simple utility
public interface StringFormatter {
    String format(String input);
}

public class UpperCaseFormatter implements StringFormatter {
    public String format(String input) {
        return input.toUpperCase();  // Too simple for interface!
    }
}

// ✅ SOLUTION: Keep it simple
public class StringUtils {
    public static String toUpperCase(String input) {
        return input.toUpperCase();
    }
}

// Rule: Create abstraction when you have 2+ implementations OR when you plan to swap implementations
```

#### **Pitfall 2: Interface Explosion (Violates ISP wrongly)**

```java
// ❌ PITFALL: Too many tiny interfaces
public interface UserIdProvider {
    Long getId();
}

public interface UserNameProvider {
    String getName();
}

public interface UserEmailProvider {
    String getEmail();
}

// 50+ interfaces for a simple User!

// ✅ SOLUTION: Balance ISP với practicality
public interface UserBasicInfo {
    Long getId();
    String getName();
    String getEmail();
}

public interface UserSensitiveInfo {
    String getPhoneNumber();
    String getAddress();
    LocalDate getDateOfBirth();
}

// Group related methods
```

#### **Pitfall 3: Circular Dependencies (Violates DIP)**

```java
// ❌ PITFALL: Circular dependency
@Service
public class OrderService {

    @Autowired
    private PaymentService paymentService;  // Depends on PaymentService

    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        orderRepository.save(order);
        paymentService.processPayment(order);  // Calls PaymentService
        return order;
    }
}

@Service
public class PaymentService {

    @Autowired
    private OrderService orderService;  // Depends on OrderService!

    public void processPayment(Order order) {
        // ...
        orderService.updateOrderStatus(order.getId(), OrderStatus.PAID);  // Circular!
    }
}

// ✅ SOLUTION: Use events or extract common dependency
@Service
public class OrderService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        orderRepository.save(order);

        // Publish event instead of direct call
        eventPublisher.publishEvent(new OrderCreatedEvent(order));

        return order;
    }
}

@Service
public class PaymentService {

    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        processPayment(event.getOrder());
    }

    private void processPayment(Order order) {
        // No circular dependency!
        // Update order via repository
        orderRepository.updateStatus(order.getId(), OrderStatus.PAID);
    }
}
```

#### **Pitfall 4: Hidden Dependencies (Service Locator)**

```java
// ❌ PITFALL: Hidden dependencies
@Service
public class OrderService {

    public Order createOrder(OrderRequest request) {
        // Hidden dependency - Not in constructor!
        PaymentService paymentService =
            ApplicationContextProvider.getBean(PaymentService.class);

        Order order = new Order(request);
        paymentService.processPayment(order);

        return order;
    }
}

// ✅ SOLUTION: Explicit dependency injection
@Service
public class OrderService {

    private final PaymentService paymentService;

    @Autowired
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;  // Explicit!
    }

    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        paymentService.processPayment(order);
        return order;
    }
}
```

#### **Pitfall 5: Anemic Domain Model Disguised as SOLID**

```java
// ❌ PITFALL: All logic in services, entities are just data bags
@Entity
public class Order {
    private Long id;
    private List<OrderItem> items;
    private BigDecimal total;
    private OrderStatus status;

    // Only getters and setters
}

@Service
public class OrderService {
    // All business logic here - NOT in domain object!
    public void calculateTotal(Order order) { /* ... */ }
    public void validateOrder(Order order) { /* ... */ }
    public void applyDiscount(Order order) { /* ... */ }
}

// ✅ SOLUTION: Put business logic in domain objects
@Entity
public class Order {
    private Long id;
    private List<OrderItem> items;
    private BigDecimal total;
    private OrderStatus status;

    // Business logic in domain object
    public void calculateTotal() {
        this.total = items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void validateBeforeConfirm() {
        if (items.isEmpty()) {
            throw new IllegalStateException("Cannot confirm empty order");
        }
        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Total must be positive");
        }
    }

    public void applyDiscount(BigDecimal discountPercentage) {
        if (discountPercentage.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Discount cannot be negative");
        }
        BigDecimal discount = total.multiply(discountPercentage).divide(BigDecimal.valueOf(100));
        this.total = this.total.subtract(discount);
    }
}

@Service
public class OrderService {
    // Service only orchestrates
    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        order.calculateTotal();  // Domain object does it
        order.validateBeforeConfirm();  // Domain object validates
        return orderRepository.save(order);
    }
}
```

#### **Pitfall 6: Violating LSP with Exceptions**

```java
// ❌ PITFALL: Subclass throws different exceptions
public interface PaymentGateway {
    PaymentResult charge(Payment payment) throws PaymentException;
}

public class StripeGateway implements PaymentGateway {
    @Override
    public PaymentResult charge(Payment payment) throws PaymentException {
        // Throws PaymentException as declared
    }
}

public class PayPalGateway implements PaymentGateway {
    @Override
    public PaymentResult charge(Payment payment)
            throws PaymentException, NetworkException {  // ❌ Additional exception!
        // Violates LSP - Client code can't handle this!
    }
}

// ✅ SOLUTION: Same exception contract
public class PayPalGateway implements PaymentGateway {
    @Override
    public PaymentResult charge(Payment payment) throws PaymentException {
        try {
            // PayPal logic
        } catch (NetworkException e) {
            // Wrap in declared exception
            throw new PaymentException("PayPal network error", e);
        }
    }
}
```

**Summary of Pitfalls:**

| Pitfall | SOLID Violation | Solution |
|---------|----------------|----------|
| Over-engineering | OCP | Start simple, refactor when needed |
| Interface explosion | ISP | Group related methods |
| Circular dependencies | DIP | Use events or extract common |
| Hidden dependencies | DIP | Explicit constructor injection |
| Anemic domain model | SRP | Business logic in domain objects |
| Exception inconsistency | LSP | Same exception contract |

---

### Q25: SOLID Performance Considerations

**Độ khó:** Senior/Lead

**Câu trả lời:**

#### **Performance Impact of SOLID**

**1. Abstraction Overhead:**

```java
// Abstraction có minimal overhead nhưng có benefits lớn

// Direct call (faster, nhưng tightly coupled)
public class OrderService {
    private MySQLOrderRepository repository = new MySQLOrderRepository();

    public Order save(Order order) {
        return repository.save(order);  // Direct method call
    }
}

// Interface call (slightly slower, nhưng flexible)
public class OrderService {
    private OrderRepository repository;  // Interface

    public Order save(Order order) {
        return repository.save(order);  // Virtual method call (1-2ns overhead)
    }
}

// Performance impact: ~1-2 nanoseconds per call
// Business benefit: Can swap implementations, easy testing
// Verdict: WORTH IT! The flexibility outweighs tiny overhead
```

**2. Lazy Initialization Pattern:**

```java
// ✅ Strategy pattern with lazy loading
@Service
public class ReportService {

    private final Map<ReportType, ReportGenerator> generators = new ConcurrentHashMap<>();
    private final ApplicationContext context;

    @Autowired
    public ReportService(ApplicationContext context) {
        this.context = context;
    }

    public Report generate(ReportType type, ReportRequest request) {
        // Lazy initialization - Only create when needed
        ReportGenerator generator = generators.computeIfAbsent(type, t -> {
            return switch (t) {
                case PDF -> context.getBean(PdfReportGenerator.class);
                case EXCEL -> context.getBean(ExcelReportGenerator.class);
                case CSV -> context.getBean(CsvReportGenerator.class);
            };
        });

        return generator.generate(request);
    }

    // Benefits:
    // - Only loads generators actually used
    // - No memory wasted on unused strategies
    // - Fast startup time
}
```

**3. Caching Decorator Pattern:**

```java
// ✅ Add caching without modifying original class (OCP)

// Original service
public interface ProductService {
    Product findById(Long id);
    List<Product> findAll();
}

@Service
public class ProductServiceImpl implements ProductService {

    @Override
    public Product findById(Long id) {
        // Database query
        return productRepository.findById(id).orElseThrow();
    }

    @Override
    public List<Product> findAll() {
        return productRepository.findAll();
    }
}

// Caching decorator (OCP: Add caching without modifying original)
@Service
@Primary
public class CachedProductService implements ProductService {

    private final ProductService delegate;
    private final Cache cache;

    @Autowired
    public CachedProductService(
            @Qualifier("productServiceImpl") ProductService delegate,
            CacheManager cacheManager) {
        this.delegate = delegate;
        this.cache = cacheManager.getCache("products");
    }

    @Override
    public Product findById(Long id) {
        return cache.get(id, () -> delegate.findById(id));
    }

    @Override
    public List<Product> findAll() {
        return cache.get("all", () -> delegate.findAll());
    }

    // Result: 1000x faster for cached reads, no modification to original service
}
```

**4. Batch Processing with Strategy:**

```java
// ✅ Different strategies for different data sizes

public interface DataProcessor {
    void process(List<Data> data);
}

@Component
public class SmallBatchProcessor implements DataProcessor {

    @Override
    public void process(List<Data> data) {
        // Process all at once (< 100 items)
        processInMemory(data);
    }
}

@Component
public class LargeBatchProcessor implements DataProcessor {

    @Override
    public void process(List<Data> data) {
        // Process in chunks (> 100 items)
        Lists.partition(data, 100).forEach(this::processChunk);
    }
}

@Service
public class DataProcessingService {

    @Autowired
    private ApplicationContext context;

    public void processData(List<Data> data) {
        DataProcessor processor;

        if (data.size() < 100) {
            processor = context.getBean(SmallBatchProcessor.class);
        } else {
            processor = context.getBean(LargeBatchProcessor.class);
        }

        processor.process(data);
    }

    // Auto-select optimal strategy based on data size
}
```

**5. Connection Pooling (DIP + Performance):**

```java
// ✅ DIP với connection pooling

// Interface
public interface DataSource {
    Connection getConnection();
}

// Implementation with pooling
@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        config.setUsername("user");
        config.setPassword("pass");

        // Performance tuning
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        // Connection pooling = 100x faster than creating new connections
        return new HikariDataSource(config);
    }
}

// Service depends on interface (DIP)
@Service
public class OrderRepository {

    @Autowired
    private DataSource dataSource;  // DIP

    public Order save(Order order) {
        try (Connection conn = dataSource.getConnection()) {
            // Use pooled connection (fast!)
        }
    }
}
```

**6. Asynchronous Processing (SRP + Performance):**

```java
// ✅ Separate fast/slow operations

@Service
public class OrderService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    // Fast operation (< 100ms)
    @Transactional
    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        orderRepository.save(order);  // Fast DB write

        // Async processing of slow operations
        eventPublisher.publishEvent(new OrderCreatedEvent(order));

        return order;  // Return immediately!
    }
}

// Slow operations run async
@Service
public class OrderEventHandlers {

    @Async
    @EventListener
    public void sendEmail(OrderCreatedEvent event) {
        // Slow: 2-5 seconds
        emailService.send(event.getOrder());
    }

    @Async
    @EventListener
    public void generateInvoice(OrderCreatedEvent event) {
        // Slow: 3-10 seconds
        pdfService.generateInvoice(event.getOrder());
    }

    // Result: API responds in 100ms instead of 15 seconds!
}
```

**Performance Benchmarks:**

| Pattern | Performance Impact | Business Value |
|---------|-------------------|----------------|
| **Interface vs Direct** | +1-2ns overhead | High flexibility, worth it |
| **Lazy Loading** | -50% startup time | Load only what's needed |
| **Caching Decorator** | 1000x faster reads | Massive performance gain |
| **Batch Strategy** | 10x faster for large data | Optimal for each size |
| **Connection Pooling** | 100x faster | Reuse connections |
| **Async Processing** | 150x faster response | Better user experience |

**Guidelines:**

```
✅ Use interfaces - Tiny overhead, huge benefits
✅ Cache expensive operations with decorator
✅ Use lazy initialization for heavy objects
✅ Async processing for non-critical paths
✅ Connection pooling always
✅ Batch processing for large datasets
❌ Don't optimize prematurely
❌ Measure before optimizing
```

---

### Q26: SOLID Interview Questions - Cách trả lời hiệu quả

**Độ khó:** All Levels

**Câu trả lời:**

#### **Q: "Explain SOLID principles with examples"**

**❌ Weak Answer:**
"SOLID is S-R-P, O-C-P, L-S-P, I-S-P, D-I-P. SRP means one responsibility per class..."

**✅ Strong Answer:**
"SOLID principles guide us to write maintainable code. Let me give you a real example from my last project:

We had a payment processing class that violated SRP - it handled validation, payment gateway calls, AND sending notifications. When Stripe API changed, we had to modify code that also contained email logic, which caused bugs.

We refactored using SOLID:
- **SRP**: Separated into PaymentValidator, PaymentGateway, NotificationService
- **OCP**: Used Strategy pattern for different payment methods
- **DIP**: Services depend on interfaces, not concrete implementations

Result: Adding PayPal took 2 hours instead of 2 weeks, and tests became 10x easier to write."

#### **Q: "What's the difference between OCP and Strategy Pattern?"**

**✅ Strong Answer:**
"OCP is a **principle** (what to achieve), Strategy is a **pattern** (how to implement it).

Example: We need to support multiple discount strategies.

**OCP says:** "Don't modify existing code when adding new discount types"

**Strategy Pattern shows:** "Create DiscountStrategy interface, implement VipDiscount, SeasonalDiscount, etc."

In Spring Boot:
```java
public interface DiscountStrategy {
    double calculate(Order order);
}

@Component
public class VipDiscount implements DiscountStrategy {
    // Implementation
}

// Adding new discount = New class, zero modifications
```

Strategy Pattern is one way to achieve OCP."

#### **Q: "How do you know when you're violating SOLID?"**

**✅ Strong Answer:**
"I watch for these red flags:

**SRP violations:**
- Class > 300 lines
- Many unrelated dependencies
- Changes for different reasons

**OCP violations:**
- Adding feature requires modifying multiple files
- if/else chains checking types

**LSP violations:**
- instanceof checks in polymorphic code
- Subclass throws UnsupportedOperationException

**ISP violations:**
- Implementing methods we don't need
- Interface has 10+ methods

**DIP violations:**
- `new` keyword in business logic
- Hard to unit test

We use SonarQube with custom rules to catch these early."

#### **Q: "SOLID vs Performance - Any trade-offs?"**

**✅ Strong Answer:**
"SOLID actually **improves** performance in real systems:

**Example from production:**
Before SOLID: Monolithic order processing took 10 seconds
After SOLID: Async event-driven architecture took 50ms

The abstraction overhead (1-2 nanoseconds) is negligible compared to business benefits:

1. **Caching** becomes easy with Decorator pattern
2. **Async processing** possible with separated concerns
3. **Connection pooling** via DIP
4. **Lazy loading** with Strategy pattern

The only trade-off is startup time due to dependency injection, but that's 100ms - worth it for maintainability."

#### **Q: "Give example of when NOT to use SOLID"**

**✅ Strong Answer:**
"Don't over-engineer simple code:

**Bad example:**
```java
// Too much for simple utility
public interface StringUpperCaser {
    String toUpper(String input);
}
```

**Good example:**
```java
// Just use static method
public class StringUtils {
    public static String toUpper(String input) {
        return input.toUpperCase();
    }
}
```

**Rule:** Apply SOLID when:
- Multiple implementations exist or planned
- Need to swap implementations
- Code will grow in complexity

Don't apply SOLID for:
- Simple utilities
- One-time scripts
- Prototypes"

#### **Q: "How do you refactor legacy code to SOLID?"**

**✅ Strong Answer:**
"I use the Strangler Fig pattern:

1. **Identify hot spots** (frequently changed code)
2. **Add tests** for existing behavior
3. **Extract interface** from legacy class
4. **Create new implementation** following SOLID
5. **Use adapter** to integrate with legacy
6. **Gradually migrate** callers to new implementation

Example from my last project:
- Legacy `OrderProcessor` (1500 lines, all responsibilities)
- Created `OrderService` interface
- Implemented clean `OrderServiceImpl` with SRP
- Used `OrderServiceAdapter` to delegate to new impl
- Migrated 10% of traffic per day
- Zero downtime, no big-bang rewrite

This approach is safer than rewriting everything at once."

**Interview Tips:**

```
✅ Always provide concrete examples from experience
✅ Mention specific tools (SonarQube, ArchUnit)
✅ Show trade-off thinking (not just theoretical benefits)
✅ Discuss real metrics (performance, maintainability)
✅ Demonstrate problem-solving approach
❌ Don't just recite definitions
❌ Don't ignore practical constraints
❌ Don't claim SOLID solves everything
```

---

### Q27: SOLID with Modern Java Features (Java 17+)

**Độ khó:** Senior

**Câu trả lời:**

#### **Records (Immutable DTOs)**

```java
// ✅ Java Records for DTOs (SRP + Immutability)

// Before Java 14
public class OrderRequest {
    private final String customerId;
    private final List<OrderItem> items;

    public OrderRequest(String customerId, List<OrderItem> items) {
        this.customerId = customerId;
        this.items = items;
    }

    public String getCustomerId() { return customerId; }
    public List<OrderItem> getItems() { return items; }

    @Override
    public boolean equals(Object o) { /* ... */ }
    @Override
    public int hashCode() { /* ... */ }
    @Override
    public String toString() { /* ... */ }
}

// ✅ With Java Records (Java 14+)
public record OrderRequest(
    String customerId,
    List<OrderItem> items
) {
    // Compact constructor for validation
    public OrderRequest {
        Objects.requireNonNull(customerId, "Customer ID required");
        Objects.requireNonNull(items, "Items required");

        if (items.isEmpty()) {
            throw new IllegalArgumentException("Items cannot be empty");
        }
    }

    // Custom methods
    public int getTotalItems() {
        return items.stream()
            .mapToInt(OrderItem::getQuantity)
            .sum();
    }
}

// Usage
OrderRequest request = new OrderRequest("CUST-123", List.of(item1, item2));
// Immutable, thread-safe, concise!
```

#### **Sealed Classes (OCP + LSP)**

```java
// ✅ Sealed classes for controlled hierarchy (Java 17+)

// Define exact permitted subclasses
public sealed interface PaymentMethod
    permits CreditCardPayment, PayPalPayment, BankTransferPayment {

    PaymentResult process(Money amount);
}

public final class CreditCardPayment implements PaymentMethod {
    private final String cardNumber;
    private final String cvv;

    @Override
    public PaymentResult process(Money amount) {
        // Credit card logic
    }
}

public final class PayPalPayment implements PaymentMethod {
    private final String email;

    @Override
    public PaymentResult process(Money amount) {
        // PayPal logic
    }
}

public final class BankTransferPayment implements PaymentMethod {
    private final String accountNumber;

    @Override
    public PaymentResult process(Money amount) {
        // Bank transfer logic
    }
}

// Pattern matching with sealed classes
public class PaymentService {

    public PaymentResult processPayment(PaymentMethod method, Money amount) {
        // Exhaustive switch (compiler ensures all cases covered)
        return switch (method) {
            case CreditCardPayment cc -> processCreditCard(cc, amount);
            case PayPalPayment pp -> processPayPal(pp, amount);
            case BankTransferPayment bt -> processBankTransfer(bt, amount);
            // No default needed - compiler knows all possible types!
        };
    }
}

// Benefits:
// ✅ Controlled hierarchy (OCP with constraints)
// ✅ Exhaustive switch expressions
// ✅ No need for default case
// ✅ Compiler-enforced LSP
```

#### **Pattern Matching (Type-safe Strategy)**

```java
// ✅ Pattern matching for instanceof (Java 16+)

// Before Java 16
public String formatNotification(Notification notification) {
    if (notification instanceof EmailNotification) {
        EmailNotification email = (EmailNotification) notification;
        return "Email to: " + email.getRecipient();

    } else if (notification instanceof SmsNotification) {
        SmsNotification sms = (SmsNotification) notification;
        return "SMS to: " + sms.getPhoneNumber();

    } else if (notification instanceof PushNotification) {
        PushNotification push = (PushNotification) notification;
        return "Push to device: " + push.getDeviceId();
    }

    throw new IllegalArgumentException("Unknown notification type");
}

// ✅ With pattern matching
public String formatNotification(Notification notification) {
    return switch (notification) {
        case EmailNotification(var recipient, var subject, var body) ->
            "Email to: " + recipient;

        case SmsNotification(var phoneNumber, var message) ->
            "SMS to: " + phoneNumber;

        case PushNotification(var deviceId, var title, var message) ->
            "Push to device: " + deviceId;
    };
}

// Even cleaner with records
public sealed interface Notification
    permits EmailNotification, SmsNotification, PushNotification {}

public record EmailNotification(
    String recipient,
    String subject,
    String body
) implements Notification {}

public record SmsNotification(
    String phoneNumber,
    String message
) implements Notification {}

public record PushNotification(
    String deviceId,
    String title,
    String message
) implements Notification {}
```

#### **Text Blocks (Cleaner Code)**

```java
// ✅ Text blocks for SQL, JSON, etc. (Java 15+)

// Before Java 15
String sql = "SELECT o.id, o.customer_id, o.total_amount, " +
             "       c.name, c.email " +
             "FROM orders o " +
             "JOIN customers c ON o.customer_id = c.id " +
             "WHERE o.status = ? " +
             "  AND o.created_at > ? " +
             "ORDER BY o.created_at DESC";

// ✅ With text blocks
String sql = """
    SELECT o.id, o.customer_id, o.total_amount,
           c.name, c.email
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.status = ?
      AND o.created_at > ?
    ORDER BY o.created_at DESC
    """;

// JSON templates
String jsonTemplate = """
    {
        "orderId": "%s",
        "customer": {
            "id": "%s",
            "name": "%s"
        },
        "items": %s,
        "total": %.2f
    }
    """.formatted(orderId, customerId, customerName, itemsJson, total);
```

#### **Virtual Threads (Project Loom - Java 21+)**

```java
// ✅ Virtual threads for massive concurrency

@Service
public class OrderService {

    @Async("virtualThreadExecutor")
    public CompletableFuture<Order> createOrderAsync(OrderRequest request) {
        // Runs on virtual thread - 1 million+ threads possible!
        Order order = processOrder(request);
        return CompletableFuture.completedFuture(order);
    }
}

@Configuration
public class AsyncConfig {

    @Bean("virtualThreadExecutor")
    public Executor virtualThreadExecutor() {
        // Virtual threads (lightweight, millions possible)
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}

// Benefits:
// ✅ Create millions of threads (was thousands)
// ✅ No thread pool tuning needed
// ✅ Simple blocking code, massive concurrency
```

**Modern Java + SOLID Benefits:**

| Feature | SOLID Benefit |
|---------|--------------|
| **Records** | Immutable DTOs (SRP, thread-safe) |
| **Sealed Classes** | Controlled inheritance (OCP with constraints) |
| **Pattern Matching** | Type-safe polymorphism (LSP) |
| **Text Blocks** | Cleaner code (Readability) |
| **Virtual Threads** | Massive async (SRP + Performance) |

---

### Q28: SOLID with Reactive Programming (Spring WebFlux)

**Độ khó:** Senior/Lead

**Câu trả lời:**

#### **Reactive Repositories (DIP)**

```java
// ✅ Reactive repository interface (DIP)

public interface ReactiveOrderRepository {
    Mono<Order> save(Order order);
    Mono<Order> findById(Long id);
    Flux<Order> findByCustomerId(String customerId);
    Flux<Order> findAll();
}

@Repository
public class R2dbcOrderRepository implements ReactiveOrderRepository {

    @Autowired
    private R2dbcEntityTemplate template;

    @Override
    public Mono<Order> save(Order order) {
        return template.insert(order);
    }

    @Override
    public Mono<Order> findById(Long id) {
        return template.selectOne(
            Query.query(where("id").is(id)),
            Order.class
        );
    }

    @Override
    public Flux<Order> findByCustomerId(String customerId) {
        return template.select(
            Query.query(where("customer_id").is(customerId)),
            Order.class
        );
    }
}
```

#### **Reactive Strategy Pattern**

```java
// ✅ Reactive payment strategies (OCP + DIP)

public interface ReactivePaymentStrategy {
    Mono<PaymentResult> process(Payment payment);
    PaymentType getType();
}

@Component
public class ReactiveStripeStrategy implements ReactivePaymentStrategy {

    @Autowired
    private WebClient stripeClient;

    @Override
    public Mono<PaymentResult> process(Payment payment) {
        return stripeClient.post()
            .uri("/charges")
            .bodyValue(toStripeRequest(payment))
            .retrieve()
            .bodyToMono(StripeResponse.class)
            .map(this::toPaymentResult)
            .onErrorResume(e -> Mono.just(PaymentResult.failure(e.getMessage())));
    }

    @Override
    public PaymentType getType() {
        return PaymentType.STRIPE;
    }
}

@Component
public class ReactivePayPalStrategy implements ReactivePaymentStrategy {

    @Autowired
    private WebClient paypalClient;

    @Override
    public Mono<PaymentResult> process(Payment payment) {
        return paypalClient.post()
            .uri("/payments")
            .bodyValue(toPayPalRequest(payment))
            .retrieve()
            .bodyToMono(PayPalResponse.class)
            .map(this::toPaymentResult);
    }

    @Override
    public PaymentType getType() {
        return PaymentType.PAYPAL;
    }
}

// Service using strategies
@Service
public class ReactivePaymentService {

    private final Map<PaymentType, ReactivePaymentStrategy> strategies;

    @Autowired
    public ReactivePaymentService(List<ReactivePaymentStrategy> strategyList) {
        this.strategies = strategyList.stream()
            .collect(Collectors.toMap(
                ReactivePaymentStrategy::getType,
                Function.identity()
            ));
    }

    public Mono<PaymentResult> processPayment(Payment payment) {
        ReactivePaymentStrategy strategy = strategies.get(payment.getType());

        if (strategy == null) {
            return Mono.error(new IllegalArgumentException(
                "Unsupported payment type: " + payment.getType()
            ));
        }

        return strategy.process(payment)
            .doOnSuccess(result -> log.info("Payment processed: {}", result))
            .doOnError(e -> log.error("Payment failed", e));
    }
}
```

#### **Reactive Chain of Responsibility**

```java
// ✅ Reactive middleware chain (SRP + OCP)

public interface ReactiveOrderMiddleware {
    Mono<Order> process(Order order, ReactiveOrderMiddlewareChain chain);
}

@Component
@Order(1)
public class ValidationMiddleware implements ReactiveOrderMiddleware {

    @Override
    public Mono<Order> process(Order order, ReactiveOrderMiddlewareChain chain) {
        return Mono.just(order)
            .flatMap(this::validate)
            .flatMap(chain::next);
    }

    private Mono<Order> validate(Order order) {
        if (order.getItems().isEmpty()) {
            return Mono.error(new ValidationException("Order has no items"));
        }
        return Mono.just(order);
    }
}

@Component
@Order(2)
public class EnrichmentMiddleware implements ReactiveOrderMiddleware {

    @Autowired
    private ReactiveCustomerService customerService;

    @Override
    public Mono<Order> process(Order order, ReactiveOrderMiddlewareChain chain) {
        return customerService.findById(order.getCustomerId())
            .map(customer -> {
                order.setCustomerEmail(customer.getEmail());
                order.setCustomerName(customer.getName());
                return order;
            })
            .flatMap(chain::next);
    }
}

@Component
@Order(3)
public class FraudDetectionMiddleware implements ReactiveOrderMiddleware {

    @Autowired
    private ReactiveFraudService fraudService;

    @Override
    public Mono<Order> process(Order order, ReactiveOrderMiddlewareChain chain) {
        return fraudService.check(order)
            .flatMap(isFraud -> {
                if (isFraud) {
                    return Mono.error(new FraudException("Suspicious order"));
                }
                return chain.next(order);
            });
    }
}

// Chain executor
@Service
public class ReactiveOrderService {

    private final List<ReactiveOrderMiddleware> middlewares;

    @Autowired
    public ReactiveOrderService(List<ReactiveOrderMiddleware> middlewares) {
        this.middlewares = middlewares;
    }

    public Mono<Order> createOrder(OrderRequest request) {
        Order order = new Order(request);

        ReactiveOrderMiddlewareChain chain = new ReactiveOrderMiddlewareChain(middlewares);

        return chain.next(order)
            .flatMap(orderRepository::save);
    }
}
```

**Reactive SOLID Benefits:**

```
✅ Non-blocking I/O - Handle 10,000+ concurrent requests
✅ Backpressure - Prevent overwhelming downstream
✅ Composable - Chain operations declaratively
✅ Resilient - Built-in error handling
✅ Scalable - Fewer threads needed
```

---

### Q29: SOLID Future Trends & Best Practices 2025+

**Độ khó:** Lead/Architect

**Câu trả lời:**

#### **1. AI-Assisted SOLID Refactoring**

```
GitHub Copilot / GPT-4 Code Assistant:
- Suggest SOLID violations
- Auto-generate interfaces from concrete classes
- Propose Strategy/Factory patterns
- Create test suites for SOLID compliance

Example workflow:
1. Write business logic
2. AI suggests: "This class violates SRP - extract validation to separate class"
3. AI generates refactored code
4. Developer reviews and accepts
```

#### **2. SOLID with Microservices Mesh**

```java
// Service Mesh Pattern (Istio/Linkerd)
// SOLID at service level

// Each service = Single Responsibility
@Service
public class OrderService {
    // ONLY order management
}

@Service
public class PaymentService {
    // ONLY payment processing
}

// Service mesh handles:
// - Load balancing (OCP: Add instances without code changes)
// - Circuit breaking (DIP: Services don't know about failures)
// - Observability (SRP: Separate from business logic)
// - Security (ISP: Fine-grained service access)
```

#### **3. SOLID with Event Sourcing & CQRS**

```java
// ✅ Command side (Write)
@Service
public class OrderCommandService {

    @Autowired
    private EventStore eventStore;

    public void createOrder(CreateOrderCommand command) {
        List<Event> events = List.of(
            new OrderCreatedEvent(command),
            new OrderItemsAddedEvent(command.getItems())
        );

        eventStore.append(command.getOrderId(), events);
    }
}

// ✅ Query side (Read) - Separate models (ISP)
@Service
public class OrderQueryService {

    @Autowired
    private OrderReadRepository readRepository;

    public OrderView getOrder(Long orderId) {
        return readRepository.findById(orderId);
    }
}

// Benefits:
// - SRP: Separate write/read concerns
// - OCP: Add new projections without modifying commands
// - DIP: Commands don't know about queries
```

#### **4. SOLID with GraphQL**

```java
// ✅ GraphQL resolvers following SOLID

// Interface Segregation - Specific resolvers
@Component
public class OrderQueryResolver implements GraphQLQueryResolver {

    @Autowired
    private OrderService orderService;

    public Order order(Long id) {
        return orderService.findById(id);
    }

    public List<Order> orders(OrderFilter filter) {
        return orderService.findAll(filter);
    }
}

@Component
public class OrderMutationResolver implements GraphQLMutationResolver {

    @Autowired
    private OrderService orderService;

    public Order createOrder(OrderInput input) {
        return orderService.createOrder(input);
    }

    public Order updateOrder(Long id, OrderInput input) {
        return orderService.updateOrder(id, input);
    }
}

// Type-safe, flexible, ISP-compliant
```

#### **5. SOLID Quality Metrics Dashboard**

```
Real-time SOLID compliance dashboard:

┌──────────────────────────────────────┐
│  SOLID Health Score: 87/100         │
├──────────────────────────────────────┤
│ SRP Compliance:        92% ✅        │
│ OCP Compliance:        85% ⚠️         │
│ LSP Compliance:        95% ✅        │
│ ISP Compliance:        80% ⚠️         │
│ DIP Compliance:        88% ✅        │
├──────────────────────────────────────┤
│ Top Violations:                      │
│ 1. PaymentService - Too many deps   │
│ 2. OrderController - Fat interface  │
│ 3. UserService - God class          │
└──────────────────────────────────────┘

Auto-generated:
- Refactoring suggestions
- Risk assessment
- Technical debt estimates
```

**2025+ Best Practices:**

```
✅ Use AI for code review and SOLID suggestions
✅ Implement service mesh for microservices SOLID
✅ Use Event Sourcing + CQRS for complex domains
✅ GraphQL for flexible, ISP-compliant APIs
✅ Real-time SOLID metrics in CI/CD
✅ Automated refactoring tools
✅ Contract testing for LSP compliance
✅ Chaos engineering to validate DIP
```

---

### Q30: SOLID Mastery Checklist - Self-Assessment

**Độ khó:** All Levels

**Câu trả lời:**

#### **Junior Level (0-2 years)**

```
□ Can explain what each SOLID letter stands for
□ Can identify basic SRP violations (God classes)
□ Understands why we use interfaces (DIP basics)
□ Can write unit tests with mocks
□ Recognizes if/else chains that should be Strategy pattern
□ Uses constructor injection in Spring Boot
□ Can refactor small methods following SRP
```

#### **Mid Level (2-5 years)**

```
□ Can apply all 5 SOLID principles in new code
□ Can refactor legacy code to SOLID
□ Implements Design Patterns (Strategy, Factory, etc.)
□ Writes comprehensive unit tests
□ Uses Spring Boot features (DI, AOP) effectively
□ Understands trade-offs (when NOT to apply SOLID)
□ Can explain SOLID in interviews with examples
□ Reviews code for SOLID violations
□ Uses tools (SonarQube, ArchUnit) for SOLID checks
```

#### **Senior Level (5-10 years)**

```
□ Architects systems following SOLID at service level
□ Implements DDD with SOLID principles
□ Uses Event-Driven Architecture with SOLID
□ Mentors juniors on SOLID best practices
□ Balances SOLID with performance requirements
□ Implements Microservices following SOLID
□ Uses Reactive Programming with SOLID
□ Creates reusable frameworks following SOLID
□ Writes technical documentation on SOLID patterns
□ Conducts code reviews focusing on SOLID
```

#### **Lead/Architect Level (10+ years)**

```
□ Defines SOLID standards for entire organization
□ Designs systems that enforce SOLID via architecture
□ Implements automated SOLID compliance checks
□ Balances SOLID with business requirements
□ Migrates legacy systems to SOLID architecture
□ Trains teams on SOLID principles
□ Creates tools/libraries that promote SOLID
□ Publishes articles/talks on SOLID
□ Contributes to open-source following SOLID
□ Measures business impact of SOLID adoption
```

#### **Continuous Learning Path**

```
1. Read books:
   - Clean Code (Robert Martin)
   - Clean Architecture (Robert Martin)
   - Domain-Driven Design (Eric Evans)

2. Practice:
   - Refactor 1 legacy class per week
   - Code review focusing on SOLID
   - Implement 1 design pattern per month

3. Contribute:
   - Open source projects
   - Internal frameworks
   - Tech blog posts

4. Teach:
   - Mentor junior developers
   - Tech talks at company
   - Conference presentations
```

#### **SOLID Mastery Indicators**

**You've mastered SOLID when:**

```
✅ You instinctively write SOLID code
✅ You spot violations in code reviews instantly
✅ You can explain trade-offs clearly
✅ Your code has 80%+ test coverage
✅ Your PRs rarely have SOLID-related comments
✅ You can refactor legacy code confidently
✅ You mentor others on SOLID principles
✅ Your systems are easy to extend and maintain
```

**Key Metrics:**

| Metric | Junior | Mid | Senior | Lead |
|--------|--------|-----|--------|------|
| **Code review comments** | 10-20 per PR | 5-10 per PR | 2-5 per PR | 0-2 per PR |
| **Test coverage** | 40-60% | 60-75% | 75-85% | 85-95% |
| **Refactoring confidence** | Low | Medium | High | Expert |
| **Design patterns used** | 1-2 | 3-5 | 5-10 | 10+ |
| **Mentoring ability** | None | 1-2 juniors | 3-5 developers | Team/org level |

---

## Kết luận

SOLID principles không phải là quy tắc cứng nhắc mà là **guidelines** giúp code:
- **Maintainable** - Dễ maintain
- **Testable** - Dễ test
- **Flexible** - Dễ mở rộng
- **Understandable** - Dễ hiểu

**Nhớ:**
```
Start simple → Identify pain points → Apply SOLID → Measure impact
```

**Không:**
```
Over-engineer từ đầu → Complexity explosion → Maintenance nightmare
```

**Best Practice:** Áp dụng SOLID khi có pain points, không phải từ ngày đầu tiên!

---

**Chúc bạn thành công trong hành trình master SOLID principles! 🚀**
