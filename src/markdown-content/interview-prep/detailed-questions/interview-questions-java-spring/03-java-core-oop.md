# Java Core & OOP - Interview Questions

## Mục lục
- [Phần 1: Cơ bản (Câu 1-10)](#phần-1-cơ-bản-câu-1-10)
- [Phần 2: Trung cấp (Câu 11-20)](#phần-2-trung-cấp-câu-11-20)
- [Phần 3: Nâng cao (Câu 21-30)](#phần-3-nâng-cao-câu-21-30)

---

# Phần 1: Cơ bản (Câu 1-10)

## Câu 1: OOP là gì? Các tính chất của OOP trong Java?

### Trả lời:

**OOP (Object-Oriented Programming)** là paradigm lập trình dựa trên khái niệm objects và classes.

### OOP Principles:

```
┌─────────────────────────────────────────────────────────────┐
│              OOP PRINCIPLES IN JAVA                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Encapsulation (Đóng gói)                                 │
│     - Ẩn implementation details                              │
│     - Sử dụng private, protected, public                    │
│                                                             │
│  2. Inheritance (Kế thừa)                                    │
│     - Class con kế thừa từ class cha                        │
│     - Sử dụng extends keyword                               │
│                                                             │
│  3. Polymorphism (Đa hình)                                   │
│     - Method overriding và overloading                      │
│     - Runtime và compile-time polymorphism                  │
│                                                             │
│  4. Abstraction (Trừu tượng)                                │
│     - Abstract classes và interfaces                        │
│     - Ẩn complexity, chỉ expose essentials                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Ví dụ Encapsulation:

```java
// ✅ Encapsulation
public class BankAccount {
    private double balance; // Private - ẩn implementation
    
    public BankAccount(double initialBalance) {
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Balance cannot be negative");
        }
        this.balance = initialBalance;
    }
    
    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        balance += amount;
    }
    
    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (amount > balance) {
            throw new InsufficientFundsException();
        }
        balance -= amount;
    }
    
    public double getBalance() {
        return balance; // Controlled access
    }
}
```

### Ví dụ Inheritance:

```java
// ✅ Inheritance
public class Animal {
    protected String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    public void eat() {
        System.out.println(name + " is eating");
    }
    
    public void sleep() {
        System.out.println(name + " is sleeping");
    }
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }
    
    @Override
    public void eat() {
        System.out.println(name + " is eating dog food");
    }
    
    public void bark() {
        System.out.println(name + " is barking");
    }
}
```

### Ví dụ Polymorphism:

```java
// ✅ Polymorphism
public interface Shape {
    double calculateArea();
}

public class Circle implements Shape {
    private double radius;
    
    public Circle(double radius) {
        this.radius = radius;
    }
    
    @Override
    public double calculateArea() {
        return Math.PI * radius * radius;
    }
}

public class Rectangle implements Shape {
    private double width, height;
    
    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
    
    @Override
    public double calculateArea() {
        return width * height;
    }
}

// Polymorphism in action
public class AreaCalculator {
    public double calculateTotalArea(List<Shape> shapes) {
        return shapes.stream()
            .mapToDouble(Shape::calculateArea) // Runtime polymorphism
            .sum();
    }
}
```

---

## Câu 2: Abstract Class vs Interface? Khi nào dùng mỗi loại?

### Trả lời:

**Abstract Class** và **Interface** đều dùng để abstraction, nhưng có use cases khác nhau.

### So sánh:

```
┌─────────────────────────────────────────────────────────────┐
│        Abstract Class vs Interface                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Abstract Class:                                            │
│  - Có thể có concrete methods                               │
│  - Có thể có instance variables                            │
│  - Chỉ single inheritance                                  │
│  - Constructor được phép                                   │
│  - Access modifiers: public, protected, private            │
│  - Phù hợp: Shared implementation                          │
│                                                             │
│  Interface:                                                 │
│  - Chỉ abstract methods (Java 8+: default methods)         │
│  - Chỉ constants (public static final)                     │
│  - Multiple inheritance                                     │
│  - Không có constructor                                    │
│  - Chỉ public methods                                      │
│  - Phù hợp: Contract definition                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Ví dụ Abstract Class:

```java
// ✅ Abstract Class - Shared implementation
public abstract class Animal {
    protected String name;
    protected int age;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // Concrete method - shared implementation
    public void sleep() {
        System.out.println(name + " is sleeping");
    }
    
    // Abstract method - must be implemented by subclasses
    public abstract void makeSound();
    
    // Concrete method với template method pattern
    public void dailyRoutine() {
        wakeUp();
        makeSound();
        eat();
        sleep();
    }
    
    protected void wakeUp() {
        System.out.println(name + " woke up");
    }
    
    protected abstract void eat();
}

public class Dog extends Animal {
    public Dog(String name, int age) {
        super(name, age);
    }
    
    @Override
    public void makeSound() {
        System.out.println(name + " barks");
    }
    
    @Override
    protected void eat() {
        System.out.println(name + " eats dog food");
    }
}
```

### Ví dụ Interface:

```java
// ✅ Interface - Contract definition
public interface Flyable {
    void fly();
    
    // Default method (Java 8+)
    default void takeOff() {
        System.out.println("Taking off...");
    }
}

public interface Swimmable {
    void swim();
}

public interface Runnable {
    void run();
}

// Multiple inheritance với interfaces
public class Duck implements Flyable, Swimmable, Runnable {
    @Override
    public void fly() {
        System.out.println("Duck is flying");
    }
    
    @Override
    public void swim() {
        System.out.println("Duck is swimming");
    }
    
    @Override
    public void run() {
        System.out.println("Duck is running");
    }
}
```

### Khi nào dùng:

```java
// ✅ Dùng Abstract Class khi:
// - Cần shared implementation
// - Có common state (fields)
// - Cần constructor
// - Template method pattern

// ✅ Dùng Interface khi:
// - Chỉ định nghĩa contract
// - Cần multiple inheritance
// - API design
// - Strategy pattern
```

---

## Câu 3: Method Overloading vs Overriding? Cho ví dụ.

### Trả lời:

**Overloading** là compile-time polymorphism, **Overriding** là runtime polymorphism.

### Method Overloading:

```java
// ✅ Method Overloading - Same name, different parameters
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    public int add(int a, int b, int c) {
        return a + b + c;
    }
    
    public double add(double a, double b) {
        return a + b;
    }
    
    public String add(String a, String b) {
        return a + b;
    }
}

// Compile-time decision
Calculator calc = new Calculator();
calc.add(1, 2);        // Calls int add(int, int)
calc.add(1, 2, 3);     // Calls int add(int, int, int)
calc.add(1.5, 2.5);    // Calls double add(double, double)
```

### Method Overriding:

```java
// ✅ Method Overriding - Runtime polymorphism
public class Animal {
    public void makeSound() {
        System.out.println("Animal makes sound");
    }
}

public class Dog extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Dog barks");
    }
}

public class Cat extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Cat meows");
    }
}

// Runtime decision
Animal animal1 = new Dog();
animal1.makeSound(); // "Dog barks" - Runtime decision

Animal animal2 = new Cat();
animal2.makeSound(); // "Cat meows" - Runtime decision
```

---

## Câu 4: Exception Handling trong Java? Checked vs Unchecked Exceptions?

### Trả lời:

**Exception Handling** cho phép xử lý lỗi một cách có cấu trúc.

### Exception Hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│              Exception Hierarchy                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Throwable                                │
│                  /           \                              │
│            Error          Exception                         │
│                            /     \                          │
│                    RuntimeException    Checked Exception    │
│                    (Unchecked)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Checked vs Unchecked:

```java
// ✅ Checked Exception - Phải handle hoặc declare
public void readFile(String filename) throws IOException {
    FileReader file = new FileReader(filename);
    // IOException là checked exception
}

// Phải handle
try {
    readFile("test.txt");
} catch (IOException e) {
    e.printStackTrace();
}

// ✅ Unchecked Exception - Không bắt buộc handle
public void divide(int a, int b) {
    if (b == 0) {
        throw new ArithmeticException("Division by zero"); // Unchecked
    }
    return a / b;
}

// Không cần try-catch
int result = divide(10, 2); // OK
```

### Best Practices:

```java
// ✅ Custom Exception
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

// ✅ Exception Handling
public void withdraw(double amount) {
    try {
        if (amount > balance) {
            throw new InsufficientFundsException("Insufficient funds");
        }
        balance -= amount;
    } catch (InsufficientFundsException e) {
        logger.error("Withdrawal failed", e);
        throw e; // Re-throw
    } finally {
        // Always execute
        updateLastTransactionTime();
    }
}
```

---

*[File này sẽ tiếp tục với các câu hỏi còn lại về Java Core & OOP...]*

