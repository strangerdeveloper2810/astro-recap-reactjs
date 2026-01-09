# REST API & Microservices - Interview Questions

## Mục lục
- [Phần 1: Cơ bản (Câu 1-10)](#phần-1-cơ-bản-câu-1-10)
- [Phần 2: Trung cấp (Câu 11-20)](#phần-2-trung-cấp-câu-11-20)
- [Phần 3: Nâng cao (Câu 21-30)](#phần-3-nâng-cao-câu-21-30)

---

# Phần 1: Cơ bản (Câu 1-10)

## Câu 1: REST API là gì? RESTful principles?

### Trả lời:

**REST (Representational State Transfer)** là architectural style cho web services.

### REST Principles:

```
┌─────────────────────────────────────────────────────────────┐
│              REST PRINCIPLES                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Stateless                                               │
│     - Mỗi request chứa đầy đủ thông tin                    │
│     - Không lưu state trên server                           │
│                                                             │
│  2. Resource-based                                          │
│     - URLs đại diện cho resources                           │
│     - /users, /orders, /products                            │
│                                                             │
│  3. HTTP Methods                                            │
│     - GET: Retrieve                                         │
│     - POST: Create                                          │
│     - PUT: Update (full)                                    │
│     - PATCH: Update (partial)                               │
│     - DELETE: Delete                                        │
│                                                             │
│  4. Representation                                          │
│     - JSON, XML, HTML                                       │
│                                                             │
│  5. Uniform Interface                                       │
│     - Consistent API design                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### REST API Example:

```java
// ✅ RESTful Controller
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // GET /api/users - Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    // GET /api/users/{id} - Get user by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    // POST /api/users - Create user
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User created = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    // PUT /api/users/{id} - Update user (full)
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updated = userService.updateUser(id, user);
        return ResponseEntity.ok(updated);
    }
    
    // DELETE /api/users/{id} - Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Câu 2: HTTP Status Codes? Khi nào dùng mỗi code?

### Trả lời:

**HTTP Status Codes** cho biết kết quả của HTTP request.

### Common Status Codes:

```java
// ✅ 2xx Success
@GetMapping("/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    User user = userService.getUserById(id);
    return ResponseEntity.ok(user); // 200 OK
}

// ✅ 201 Created
@PostMapping
public ResponseEntity<User> createUser(@RequestBody User user) {
    User created = userService.createUser(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(created); // 201
}

// ✅ 204 No Content
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build(); // 204
}

// ✅ 400 Bad Request
@PostMapping
public ResponseEntity<?> createUser(@RequestBody @Valid User user) {
    // Validation fails → 400
    return ResponseEntity.badRequest().build();
}

// ✅ 401 Unauthorized
@GetMapping("/profile")
public ResponseEntity<User> getProfile() {
    // Not authenticated → 401
    throw new UnauthorizedException();
}

// ✅ 403 Forbidden
@DeleteMapping("/admin/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    // Authenticated but not authorized → 403
    if (!hasAdminRole()) {
        throw new ForbiddenException();
    }
    // ...
}

// ✅ 404 Not Found
@GetMapping("/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    User user = userService.getUserById(id);
    if (user == null) {
        return ResponseEntity.notFound().build(); // 404
    }
    return ResponseEntity.ok(user);
}

// ✅ 500 Internal Server Error
@GetMapping
public ResponseEntity<List<User>> getUsers() {
    try {
        return ResponseEntity.ok(userService.getAllUsers());
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
    }
}
```

### Status Code Summary:

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Câu 3: Microservices là gì? Ưu nhược điểm?

### Trả lời:

**Microservices** là architectural pattern chia application thành các services nhỏ, độc lập.

### Microservices Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│              Microservices Architecture                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  User    │  │  Order   │  │ Product  │                 │
│  │ Service  │  │ Service │  │ Service  │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       │             │             │                         │
│       └─────────────┴─────────────┘                         │
│                    │                                       │
│              ┌─────┴─────┐                                 │
│              │   API     │                                 │
│              │  Gateway  │                                 │
│              └─────┬─────┘                                 │
│                    │                                       │
│              ┌─────┴─────┐                                 │
│              │  Client   │                                 │
│              └───────────┘                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Ưu điểm:

1. **Scalability**: Scale từng service độc lập
2. **Technology Diversity**: Mỗi service có thể dùng tech stack khác
3. **Fault Isolation**: Lỗi một service không ảnh hưởng toàn bộ
4. **Team Autonomy**: Mỗi team phụ trách một service

### Nhược điểm:

1. **Complexity**: Phức tạp hơn monolithic
2. **Network Latency**: Communication qua network
3. **Data Consistency**: Khó đảm bảo consistency
4. **Deployment**: Phải deploy nhiều services

### Ví dụ Microservices:

```java
// ✅ User Service
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}

// ✅ Order Service
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private UserServiceClient userServiceClient; // Call User Service
    
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        // Verify user exists
        User user = userServiceClient.getUser(order.getUserId());
        return orderService.createOrder(order);
    }
}
```

---

## Câu 4: API Gateway là gì? Tại sao cần?

### Trả lời:

**API Gateway** là single entry point cho tất cả client requests đến microservices.

### API Gateway Benefits:

```
┌─────────────────────────────────────────────────────────────┐
│              API Gateway Benefits                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Single Entry Point                                     │
│     - Client chỉ cần biết Gateway URL                      │
│                                                             │
│  2. Routing                                                 │
│     - Route requests đến đúng service                      │
│                                                             │
│  3. Load Balancing                                         │
│     - Distribute load                                       │
│                                                             │
│  4. Authentication & Authorization                         │
│     - Centralized security                                 │
│                                                             │
│  5. Rate Limiting                                          │
│     - Control request rate                                 │
│                                                             │
│  6. Caching                                                 │
│     - Cache responses                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Spring Cloud Gateway Example:

```java
// ✅ Spring Cloud Gateway Configuration
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r
                .path("/api/users/**")
                .uri("lb://user-service"))
            .route("order-service", r -> r
                .path("/api/orders/**")
                .uri("lb://order-service"))
            .build();
    }
}
```

---

## Câu 5: Service Discovery? Eureka, Consul?

### Trả lời:

**Service Discovery** cho phép services tự động tìm và communicate với nhau.

### Eureka Example:

```java
// ✅ Eureka Server
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}

// ✅ Eureka Client (Service)
@SpringBootApplication
@EnableEurekaClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

// ✅ Service Discovery Client
@Service
public class OrderService {
    
    @Autowired
    private DiscoveryClient discoveryClient;
    
    @Autowired
    private RestTemplate restTemplate;
    
    public User getUser(Long userId) {
        // Discover User Service
        List<ServiceInstance> instances = discoveryClient.getInstances("user-service");
        ServiceInstance instance = instances.get(0);
        
        String url = "http://" + instance.getHost() + ":" + instance.getPort() + "/api/users/" + userId;
        return restTemplate.getForObject(url, User.class);
    }
}
```

---

*[File này sẽ tiếp tục với các câu hỏi còn lại về REST API & Microservices...]*

