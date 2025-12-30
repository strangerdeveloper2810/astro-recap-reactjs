# Spring Boot Fundamentals - Interview Questions

## Mục lục
- [Phần 1: Cơ bản (Câu 1-10)](#phần-1-cơ-bản-câu-1-10)
- [Phần 2: Trung cấp (Câu 11-20)](#phần-2-trung-cấp-câu-11-20)
- [Phần 3: Nâng cao (Câu 21-30)](#phần-3-nâng-cao-câu-21-30)

---

# Phần 1: Cơ bản (Câu 1-10)

## Câu 1: Spring Boot là gì? Khác biệt với Spring Framework?

### Trả lời:

**Spring Boot** là framework giúp tạo Spring applications dễ dàng hơn với auto-configuration và convention over configuration.

### So sánh Spring vs Spring Boot:

```
┌─────────────────────────────────────────────────────────────┐
│        Spring Framework vs Spring Boot                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Spring Framework:                                          │
│  - Manual configuration                                     │
│  - XML hoặc Java config                                    │
│  - Phải setup nhiều thứ thủ công                            │
│  - Phức tạp hơn                                             │
│                                                             │
│  Spring Boot:                                               │
│  - Auto-configuration                                       │
│  - Convention over configuration                           │
│  - Embedded server (Tomcat)                                │
│  - Starter dependencies                                     │
│  - Production-ready features                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Spring Boot Features:

```java
// ✅ Spring Boot Application
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// @SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan
```

### Auto-Configuration:

```java
// ✅ Spring Boot tự động config dựa trên classpath
// Nếu có spring-boot-starter-data-jpa → tự động config JPA
// Nếu có spring-boot-starter-web → tự động config web
// Nếu có H2 database → tự động config H2

// application.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
```

---

## Câu 2: Dependency Injection trong Spring Boot? Các cách inject?

### Trả lời:

**Dependency Injection (DI)** là core feature của Spring, giúp loose coupling.

### Injection Types:

```java
// ✅ 1. Constructor Injection (Recommended)
@Service
public class UserService {
    private final UserRepository userRepository;
    
    // Constructor injection - Spring tự động inject
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// ✅ 2. Field Injection (Not recommended)
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository; // Field injection
}

// ✅ 3. Setter Injection
@Service
public class UserService {
    private UserRepository userRepository;
    
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

### Best Practice - Constructor Injection:

```java
// ✅ Constructor injection advantages:
// - Immutable dependencies
// - Required dependencies (cannot be null)
// - Easier testing
// - No reflection needed

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentService paymentService;
    private final EmailService emailService;
    
    // All dependencies required
    public OrderService(OrderRepository orderRepository,
                       PaymentService paymentService,
                       EmailService emailService) {
        this.orderRepository = orderRepository;
        this.paymentService = paymentService;
        this.emailService = emailService;
    }
}
```

---

## Câu 3: Spring Bean là gì? Bean Scope? Lifecycle?

### Trả lời:

**Bean** là object được Spring container quản lý.

### Bean Scopes:

```java
// ✅ Singleton (Default) - Một instance cho toàn bộ application
@Component
@Scope("singleton")
public class SingletonBean {
    // Chỉ một instance
}

// ✅ Prototype - Mỗi lần request một instance mới
@Component
@Scope("prototype")
public class PrototypeBean {
    // Instance mới mỗi lần
}

// ✅ Request - Một instance cho mỗi HTTP request
@Component
@Scope("request")
public class RequestBean {
    // Một instance per HTTP request
}

// ✅ Session - Một instance cho mỗi HTTP session
@Component
@Scope("session")
public class SessionBean {
    // Một instance per HTTP session
}
```

### Bean Lifecycle:

```java
// ✅ Bean Lifecycle Callbacks
@Component
public class LifecycleBean implements InitializingBean, DisposableBean {
    
    @PostConstruct
    public void init() {
        System.out.println("After construction");
    }
    
    @Override
    public void afterPropertiesSet() {
        System.out.println("After properties set");
    }
    
    @PreDestroy
    public void cleanup() {
        System.out.println("Before destruction");
    }
    
    @Override
    public void destroy() {
        System.out.println("Destroying bean");
    }
}

// Lifecycle order:
// 1. Constructor
// 2. @PostConstruct
// 3. afterPropertiesSet()
// 4. Bean ready
// 5. @PreDestroy
// 6. destroy()
```

---

## Câu 4: @Component, @Service, @Repository, @Controller khác nhau như thế nào?

### Trả lời:

Tất cả đều là **stereotypes** của `@Component`, nhưng có semantic khác nhau.

### So sánh:

```java
// ✅ @Component - Generic component
@Component
public class UtilityService {
    // Generic Spring component
}

// ✅ @Service - Business logic layer
@Service
public class UserService {
    // Business logic
    public User createUser(User user) {
        // Business logic here
        return userRepository.save(user);
    }
}

// ✅ @Repository - Data access layer
@Repository
public class UserRepository {
    // Data access logic
    // Spring tự động translate exceptions
}

// ✅ @Controller - Web layer (MVC)
@Controller
public class UserController {
    // Handle HTTP requests
    @GetMapping("/users")
    public String getUsers(Model model) {
        model.addAttribute("users", userService.getAllUsers());
        return "users";
    }
}

// ✅ @RestController - REST API (Controller + ResponseBody)
@RestController
@RequestMapping("/api/users")
public class UserRestController {
    @GetMapping
    public List<User> getUsers() {
        return userService.getAllUsers();
    }
}
```

---

## Câu 5: Spring Boot Profiles là gì? Cách sử dụng?

### Trả lời:

**Profiles** cho phép config khác nhau cho các environments khác nhau.

### Ví dụ:

```java
// ✅ Active Profile
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// application.properties (default)
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop

// application-dev.properties
spring.datasource.url=jdbc:mysql://localhost:3306/devdb
spring.jpa.hibernate.ddl-auto=update
logging.level.root=DEBUG

// application-prod.properties
spring.datasource.url=jdbc:mysql://prod-server:3306/proddb
spring.jpa.hibernate.ddl-auto=validate
logging.level.root=INFO

// Activate profile
// java -jar app.jar --spring.profiles.active=prod
// hoặc trong application.properties:
// spring.profiles.active=dev
```

### Programmatic Profile:

```java
// ✅ Profile-specific Beans
@Configuration
@Profile("dev")
public class DevConfig {
    @Bean
    public DataSource devDataSource() {
        return new H2DataSource();
    }
}

@Configuration
@Profile("prod")
public class ProdConfig {
    @Bean
    public DataSource prodDataSource() {
        return new MySQLDataSource();
    }
}
```

---

*[File này sẽ tiếp tục với các câu hỏi còn lại về Spring Boot...]*

