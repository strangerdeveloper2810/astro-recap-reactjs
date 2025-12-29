# TypeScript - Complete Guide (Basic to Advanced)

## Table of Contents
- [Level 1: Basic](#level-1-basic)
- [Level 2: Intermediate](#level-2-intermediate)
- [Level 3: Advanced](#level-3-advanced)
- [React with TypeScript](#react-with-typescript)
- [Real-world Patterns](#real-world-patterns)
- [Interview Questions](#interview-questions)

---

# Level 1: Basic

## 1.1 Primitive Types

### Basic Types

```typescript
// String
let name: string = "John";
let greeting: string = `Hello, ${name}`;

// Number (integers và floats đều là number)
let age: number = 30;
let price: number = 99.99;
let hex: number = 0xff;
let binary: number = 0b1010;

// Boolean
let isActive: boolean = true;
let hasPermission: boolean = false;

// Null và Undefined
let nullValue: null = null;
let undefinedValue: undefined = undefined;

// Symbol (unique identifier)
const sym1: symbol = Symbol("key");
const sym2: symbol = Symbol("key");
console.log(sym1 === sym2); // false

// BigInt (ES2020+)
let bigNumber: bigint = 100n;
```

### Arrays và Tuples

```typescript
// Array - 2 cách khai báo
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["John", "Jane"];

// Mixed array
let mixed: (string | number)[] = [1, "hello", 2];

// Tuple - fixed length và ordered types
let tuple: [string, number] = ["John", 30];
let coordinate: [number, number] = [10, 20];

// Named tuple (TypeScript 4.0+)
type Point = [x: number, y: number];
const point: Point = [10, 20];

// Tuple với rest
type StringNumberBooleans = [string, number, ...boolean[]];
let data: StringNumberBooleans = ["hello", 1, true, false, true];

// ⚠️ Pitfall: Tuple có thể bị push
const pair: [string, number] = ["hello", 1];
pair.push("extra"); // Không báo lỗi nhưng không nên làm
```

### Enums

```typescript
// Numeric enum (default starts at 0)
enum Status {
  Pending,    // 0
  Active,     // 1
  Completed   // 2
}

const status: Status = Status.Active;
console.log(status); // 1
console.log(Status[1]); // "Active" (reverse mapping)

// Numeric enum với custom values
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  InternalError = 500
}

// String enum (recommended for debugging)
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

// Const enum (được inline, không tạo object)
const enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}
// Color.Red → "RED" (directly in compiled JS)

// Khi nào dùng enum:
// ✅ Fixed set of related constants
// ✅ Need reverse mapping (numeric enum)
// ❌ Many values → Consider union types instead
```

### Type Inference

```typescript
// TypeScript tự động infer type
let name = "John";        // string
let age = 30;             // number
let isActive = true;      // boolean
let items = [1, 2, 3];    // number[]

// Function return inference
function add(a: number, b: number) {
  return a + b; // return type: number (inferred)
}

// Object inference
const user = {
  name: "John",
  age: 30
}; // { name: string; age: number }

// Best practice: Let TypeScript infer when obvious
// Add explicit types for:
// - Function parameters
// - Public API return types
// - Complex/ambiguous cases
```

## 1.2 Object Types

### Basic Object Types

```typescript
// Inline object type
let user: { name: string; age: number } = {
  name: "John",
  age: 30
};

// Optional properties
let config: { host: string; port?: number } = {
  host: "localhost"
  // port is optional
};

// Readonly properties
let point: { readonly x: number; readonly y: number } = {
  x: 10,
  y: 20
};
// point.x = 5; // Error!

// Index signature
let dictionary: { [key: string]: string } = {
  hello: "xin chào",
  goodbye: "tạm biệt"
};
dictionary["newKey"] = "new value"; // OK
```

### Interface

```typescript
// Basic interface
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

// Optional và readonly
interface Product {
  readonly id: number;       // Cannot change after creation
  name: string;
  description?: string;      // Optional
  price: number;
}

// Methods in interface
interface UserService {
  getUser(id: number): Promise<User>;
  createUser(data: Omit<User, "id">): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
}

// Extending interface
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

// Multiple inheritance
interface Pet extends Animal {
  owner: string;
}

interface ServiceDog extends Dog, Pet {
  trainedFor: string;
}
```

### Type Alias

```typescript
// Basic type alias
type ID = string | number;
type UserID = number;

// Object type
type Point = {
  x: number;
  y: number;
};

// Function type
type Callback = (data: string) => void;
type AsyncCallback<T> = (data: T) => Promise<void>;

// Union type (Interface không làm được)
type Status = "pending" | "active" | "completed";
type Theme = "light" | "dark";

// Intersection type
type Employee = User & {
  department: string;
  salary: number;
};

// Literal types
type Alignment = "left" | "center" | "right";
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
```

### Interface vs Type

```typescript
// Interface: Declaration merging (có thể extend)
interface User {
  name: string;
}

interface User {
  age: number;
}
// User = { name: string; age: number }

// Type: Không thể merge, nhưng flexible hơn
type Status = "active" | "inactive"; // Union
type Callback = () => void;           // Function

// Khi nào dùng Interface:
// ✅ Object shapes, especially public APIs
// ✅ Class implementation (implements)
// ✅ Need declaration merging

// Khi nào dùng Type:
// ✅ Union types
// ✅ Tuple types
// ✅ Function types
// ✅ Complex type transformations
// ✅ Mapped types

// Recommendation: Pick one and be consistent
// Many prefer `type` for most cases in modern TypeScript
```

## 1.3 Functions

### Function Types

```typescript
// Function declaration
function add(a: number, b: number): number {
  return a + b;
}

// Function expression
const subtract = function(a: number, b: number): number {
  return a - b;
};

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Function type alias
type MathOperation = (a: number, b: number) => number;
const divide: MathOperation = (a, b) => a / b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}`;
}

greet("John");           // "Hello, John"
greet("John", "Hi");     // "Hi, John"

// Default parameters
function greet2(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}`;
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4); // 10
```

### Void, Never, Unknown

```typescript
// Void: function không return gì
function logMessage(message: string): void {
  console.log(message);
  // implicit return undefined
}

// Never: function không bao giờ return
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// Never trong exhaustive checks
type Shape = "circle" | "square";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return 3.14 * 10 * 10;
    case "square":
      return 10 * 10;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}

// Unknown: safe any
let value: unknown = "hello";

// ❌ Cannot use directly
// value.toUpperCase(); // Error!

// ✅ Must check type first
if (typeof value === "string") {
  value.toUpperCase(); // OK
}
```

## 1.4 Union và Literal Types

### Union Types

```typescript
// Basic union
type StringOrNumber = string | number;

function format(value: StringOrNumber): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

format("hello"); // "HELLO"
format(123.456); // "123.46"

// Array of union
let mixed: (string | number)[] = [1, "hello", 2, "world"];

// Nullable types
function getUser(id: number): User | null {
  // Return user or null
  return null;
}

// Optional chaining với nullables
const user = getUser(1);
const name = user?.name ?? "Unknown";
```

### Literal Types

```typescript
// String literals
type Direction = "north" | "south" | "east" | "west";
let dir: Direction = "north";
// dir = "up"; // Error!

// Number literals
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 3;

// Boolean literal
type True = true;

// Mixed literals
type Response = 200 | 400 | 500 | "success" | "error";

// const assertion (literal inference)
let x = "hello";        // type: string
const y = "hello";      // type: "hello" (literal)

// as const for objects
const config = {
  endpoint: "/api",
  method: "GET"
} as const;
// { readonly endpoint: "/api"; readonly method: "GET" }
```

---

# Level 2: Intermediate

## 2.1 Generics

### Generic Functions

```typescript
// Problem: Mất type information
function identity(value: any): any {
  return value;
}
const result = identity("hello"); // type: any

// Solution: Generics
function identity<T>(value: T): T {
  return value;
}

const str = identity<string>("hello"); // type: string
const num = identity(123);             // type: number (inferred)

// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p = pair("hello", 123); // [string, number]

// Generic với arrays
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const first = firstElement([1, 2, 3]); // number | undefined
```

### Generic Constraints

```typescript
// Constraint với extends
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(value: T): void {
  console.log(value.length);
}

logLength("hello");     // OK (string has length)
logLength([1, 2, 3]);   // OK (array has length)
// logLength(123);      // Error! number doesn't have length

// Constraint với keyof
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "John", age: 30 };
getProperty(user, "name"); // OK, returns string
getProperty(user, "age");  // OK, returns number
// getProperty(user, "email"); // Error! "email" is not a key of user

// Default type parameter
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

const strings = createArray(3, "hello"); // string[]
const numbers = createArray<number>(3, 0); // number[]
```

### Generic Interfaces và Classes

```typescript
// Generic interface
interface Repository<T> {
  find(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

// Generic class
class GenericRepository<T extends { id: number }> implements Repository<T> {
  private items: T[] = [];

  async find(id: number): Promise<T | null> {
    return this.items.find(item => item.id === id) || null;
  }

  async findAll(): Promise<T[]> {
    return [...this.items];
  }

  async create(data: Omit<T, "id">): Promise<T> {
    const newItem = { ...data, id: Date.now() } as T;
    this.items.push(newItem);
    return newItem;
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) throw new Error("Not found");
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }

  async delete(id: number): Promise<void> {
    this.items = this.items.filter(item => item.id !== id);
  }
}

// Usage
interface User {
  id: number;
  name: string;
  email: string;
}

const userRepo = new GenericRepository<User>();
```

## 2.2 Type Guards

### typeof và instanceof

```typescript
// typeof guard
function process(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase(); // TypeScript knows: string
  }
  return value.toFixed(2); // TypeScript knows: number
}

// typeof checks: "string" | "number" | "boolean" | "object" | "function" | "undefined"

// instanceof guard
class Dog {
  bark() { console.log("Woof!"); }
}

class Cat {
  meow() { console.log("Meow!"); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // TypeScript knows: Dog
  } else {
    animal.meow(); // TypeScript knows: Cat
  }
}
```

### in và Custom Type Guards

```typescript
// in guard
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // TypeScript knows: Fish
  } else {
    animal.fly(); // TypeScript knows: Bird
  }
}

// Custom type guard (type predicate)
interface User {
  id: number;
  name: string;
}

interface Admin {
  id: number;
  name: string;
  role: "admin";
  permissions: string[];
}

function isAdmin(user: User | Admin): user is Admin {
  return "role" in user && user.role === "admin";
}

function handleUser(user: User | Admin) {
  if (isAdmin(user)) {
    console.log("Admin permissions:", user.permissions);
  } else {
    console.log("Regular user:", user.name);
  }
}

// Type guard for null/undefined
function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const items = [1, null, 2, undefined, 3];
const validItems = items.filter(isNotNull); // number[]
```

### Discriminated Unions

```typescript
// Common pattern: type/kind as discriminator
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

// Exhaustive check với never
function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function getAreaSafe(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape); // Error if not exhaustive
  }
}
```

## 2.3 Utility Types

### Transformation Types

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Partial<T> - All properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; ... }

// Required<T> - All properties required
type RequiredUser = Required<PartialUser>;

// Readonly<T> - All properties readonly
type ReadonlyUser = Readonly<User>;

// Pick<T, K> - Select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit<T, K> - Remove specific properties
type UserWithoutPassword = Omit<User, "password">;
// { id: number; name: string; email: string; createdAt: Date }

// Record<K, T> - Create object type with keys K and values T
type UserRoles = Record<string, string[]>;
// { [key: string]: string[] }

type HttpMethods = Record<"get" | "post" | "put" | "delete", Function>;
```

### Union Manipulation

```typescript
type Status = "pending" | "active" | "completed" | "cancelled";

// Exclude<T, U> - Remove types from union
type ActiveStatus = Exclude<Status, "cancelled">;
// "pending" | "active" | "completed"

// Extract<T, U> - Keep only types in both
type EndStates = Extract<Status, "completed" | "cancelled">;
// "completed" | "cancelled"

// NonNullable<T> - Remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// string
```

### Function Utilities

```typescript
function createUser(name: string, email: string, age: number): User {
  return { id: Date.now(), name, email, password: "", createdAt: new Date() };
}

// Parameters<T> - Get function parameter types as tuple
type CreateUserParams = Parameters<typeof createUser>;
// [string, string, number]

// ReturnType<T> - Get function return type
type CreateUserReturn = ReturnType<typeof createUser>;
// User

// Awaited<T> - Unwrap Promise type
async function fetchUser(): Promise<User> {
  return {} as User;
}

type FetchedUser = Awaited<ReturnType<typeof fetchUser>>;
// User (not Promise<User>)

// ConstructorParameters<T>
class UserClass {
  constructor(public name: string, public age: number) {}
}

type UserConstructorParams = ConstructorParameters<typeof UserClass>;
// [string, number]
```

## 2.4 Classes

### Class Basics

```typescript
class User {
  // Access modifiers
  public id: number;           // Accessible anywhere
  protected email: string;     // Accessible in class and subclasses
  private password: string;    // Only accessible in this class
  readonly createdAt: Date;    // Cannot be modified after initialization

  // Constructor
  constructor(id: number, email: string, password: string) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = new Date();
  }

  // Methods
  public getEmail(): string {
    return this.email;
  }

  private hashPassword(): string {
    return this.password.split("").reverse().join("");
  }

  protected formatEmail(): string {
    return this.email.toLowerCase();
  }
}

// Shorthand constructor (parameter properties)
class Product {
  constructor(
    public id: number,
    public name: string,
    private price: number,
    readonly sku: string
  ) {}
}

// Equivalent to:
// class Product {
//   public id: number;
//   public name: string;
//   private price: number;
//   readonly sku: string;
//   constructor(id, name, price, sku) { ... }
// }
```

### Inheritance và Abstract Classes

```typescript
// Abstract class - cannot be instantiated
abstract class Animal {
  constructor(public name: string) {}

  // Abstract method - must be implemented by subclass
  abstract makeSound(): void;

  // Concrete method - shared implementation
  move(): void {
    console.log(`${this.name} is moving`);
  }
}

// Concrete class
class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);
  }

  // Implement abstract method
  makeSound(): void {
    console.log("Woof!");
  }

  // Additional methods
  fetch(): void {
    console.log(`${this.name} is fetching`);
  }
}

// Implementing interfaces
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

class Duck extends Animal implements Flyable, Swimmable {
  makeSound(): void {
    console.log("Quack!");
  }

  fly(): void {
    console.log(`${this.name} is flying`);
  }

  swim(): void {
    console.log(`${this.name} is swimming`);
  }
}
```

### Static Members và Singleton

```typescript
class Counter {
  // Static property
  private static instance: Counter | null = null;
  private static count: number = 0;

  // Private constructor (Singleton pattern)
  private constructor() {}

  // Static factory method
  static getInstance(): Counter {
    if (!Counter.instance) {
      Counter.instance = new Counter();
    }
    return Counter.instance;
  }

  // Instance methods
  increment(): void {
    Counter.count++;
  }

  decrement(): void {
    Counter.count--;
  }

  getCount(): number {
    return Counter.count;
  }
}

const counter1 = Counter.getInstance();
const counter2 = Counter.getInstance();
console.log(counter1 === counter2); // true

// Getters và Setters
class Temperature {
  private _celsius: number = 0;

  get celsius(): number {
    return this._celsius;
  }

  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Temperature cannot be below absolute zero");
    }
    this._celsius = value;
  }

  get fahrenheit(): number {
    return this._celsius * 9/5 + 32;
  }

  set fahrenheit(value: number) {
    this._celsius = (value - 32) * 5/9;
  }
}
```

---

# Level 3: Advanced

## 3.1 Conditional Types

### Basic Conditional Types

```typescript
// Syntax: T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// Practical example
type ArrayOrSingle<T> = T extends any[] ? T : T[];

type C = ArrayOrSingle<string>;    // string[]
type D = ArrayOrSingle<number[]>;  // number[]

// Nested conditionals
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type T0 = TypeName<string>;  // "string"
type T1 = TypeName<() => void>;  // "function"
```

### Infer Keyword

```typescript
// Extract type from another type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getString(): string {
  return "hello";
}

type S = ReturnType<typeof getString>; // string

// Extract array element type
type ElementType<T> = T extends (infer E)[] ? E : T;

type E1 = ElementType<string[]>;  // string
type E2 = ElementType<number>;    // number

// Extract Promise value type
type Unpacked<T> =
  T extends Promise<infer U> ? U :
  T extends Array<infer U> ? U :
  T;

type U1 = Unpacked<Promise<string>>;  // string
type U2 = Unpacked<string[]>;         // string
type U3 = Unpacked<number>;           // number

// Extract function parameters
type FirstParameter<T extends (...args: any) => any> =
  T extends (first: infer F, ...rest: any[]) => any ? F : never;

type FP = FirstParameter<(a: string, b: number) => void>; // string
```

### Distributive Conditional Types

```typescript
// Conditional types distribute over union types
type ToArray<T> = T extends any ? T[] : never;

type TA = ToArray<string | number>;
// string[] | number[] (not (string | number)[])

// Prevent distribution với []
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;

type TB = ToArrayNonDistributive<string | number>;
// (string | number)[]

// Practical: Filter union types
type Filter<T, U> = T extends U ? T : never;

type Numbers = Filter<string | number | boolean, number>;
// number
```

## 3.2 Mapped Types

### Basic Mapped Types

```typescript
// Create new type by mapping over properties
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];  // -? removes optional
};

// Custom mapped type
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface User {
  name: string;
  age: number;
}

type NullableUser = Nullable<User>;
// { name: string | null; age: number | null }
```

### Key Remapping (TypeScript 4.1+)

```typescript
// Rename keys using `as`
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }

// Filter keys
type FilterByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

interface Mixed {
  name: string;
  age: number;
  active: boolean;
  email: string;
}

type StringProps = FilterByType<Mixed, string>;
// { name: string; email: string }

// Remove specific keys
type RemoveKind<T> = {
  [P in keyof T as Exclude<P, "kind">]: T[P];
};
```

## 3.3 Template Literal Types

### Basic Template Literals

```typescript
// String manipulation at type level
type World = "world";
type Greeting = `hello ${World}`;
// "hello world"

// Union of template literals
type Color = "red" | "green" | "blue";
type Brightness = "light" | "dark";

type ColorVariant = `${Brightness}-${Color}`;
// "light-red" | "light-green" | "light-blue" | "dark-red" | "dark-green" | "dark-blue"

// Intrinsic string types
type Upper = Uppercase<"hello">;      // "HELLO"
type Lower = Lowercase<"HELLO">;      // "hello"
type Cap = Capitalize<"hello">;       // "Hello"
type Uncap = Uncapitalize<"Hello">;   // "hello"
```

### Event Handlers Pattern

```typescript
// Type-safe event system
type EventName = "click" | "scroll" | "mousemove";
type EventHandler = `on${Capitalize<EventName>}`;
// "onClick" | "onScroll" | "onMousemove"

// Object with event handlers
type EventHandlers = {
  [E in EventName as `on${Capitalize<E>}`]: (event: Event) => void;
};
// {
//   onClick: (event: Event) => void;
//   onScroll: (event: Event) => void;
//   onMousemove: (event: Event) => void;
// }

// CSS-like properties
type CSSProperty = "margin" | "padding";
type CSSDirection = "top" | "right" | "bottom" | "left";

type CSSSpacing = `${CSSProperty}-${CSSDirection}` | CSSProperty;
// "margin-top" | "margin-right" | ... | "margin" | "padding"
```

## 3.4 Advanced Patterns

### Builder Pattern

```typescript
interface QueryBuilder<T> {
  select<K extends keyof T>(...keys: K[]): QueryBuilder<Pick<T, K>>;
  where(condition: Partial<T>): QueryBuilder<T>;
  orderBy(key: keyof T, direction?: "asc" | "desc"): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  execute(): Promise<T[]>;
}

// Usage with type inference
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

declare const query: QueryBuilder<User>;

const result = query
  .select("id", "name")  // QueryBuilder<{ id: number; name: string }>
  .where({ age: 30 })
  .orderBy("name")
  .limit(10)
  .execute();  // Promise<{ id: number; name: string }[]>
```

### Function Overloads

```typescript
// Function overloading
function format(value: string): string;
function format(value: number): string;
function format(value: Date): string;
function format(value: string | number | Date): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.toISOString();
}

// With different return types
function createElement(tag: "a"): HTMLAnchorElement;
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const anchor = createElement("a");  // HTMLAnchorElement
const div = createElement("div");   // HTMLDivElement
```

### Brand Types

```typescript
// Nominal typing với brands
type UserId = number & { readonly brand: unique symbol };
type ProductId = number & { readonly brand: unique symbol };

function createUserId(id: number): UserId {
  return id as UserId;
}

function createProductId(id: number): ProductId {
  return id as ProductId;
}

function getUser(id: UserId): void {
  console.log("Getting user:", id);
}

const userId = createUserId(1);
const productId = createProductId(1);

getUser(userId);    // OK
// getUser(productId); // Error! Cannot use ProductId as UserId

// Validated string types
type Email = string & { readonly __brand: "Email" };

function validateEmail(input: string): Email | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input) ? (input as Email) : null;
}

function sendEmail(to: Email, subject: string): void {
  // Can trust that `to` is a valid email
}
```

---

# React with TypeScript

## Component Types

```typescript
import React, { FC, ReactNode, PropsWithChildren } from "react";

// Props interface
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

// Option 1: FC (Function Component)
const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  size = "md"
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Option 2: Regular function (recommended)
function Button2({ children, onClick, variant = "primary" }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// With PropsWithChildren
type CardProps = PropsWithChildren<{
  title: string;
  footer?: ReactNode;
}>;

function Card({ children, title, footer }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="content">{children}</div>
      {footer && <div className="footer">{footer}</div>}
    </div>
  );
}

// Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <span>{user.name}</span>}
/>
```

## Hooks with TypeScript

```typescript
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useReducer
} from "react";

// useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);

// useState với lazy initialization
const [data, setData] = useState<Data>(() => {
  const saved = localStorage.getItem("data");
  return saved ? JSON.parse(saved) : defaultData;
});

// useRef
const inputRef = useRef<HTMLInputElement>(null);
const valueRef = useRef<number>(0); // Mutable value

// Access DOM element
const focusInput = () => {
  inputRef.current?.focus();
};

// useCallback
const handleClick = useCallback((id: number) => {
  console.log("Clicked:", id);
}, []);

// useMemo
const expensiveValue = useMemo<number>(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);

// useReducer
interface State {
  count: number;
  step: number;
}

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "setStep"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step };
    case "decrement":
      return { ...state, count: state.count - state.step };
    case "setStep":
      return { ...state, step: action.payload };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
```

## Event Types

```typescript
// Common event types
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.clientX, e.clientY);
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    // submit
  }
};

const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.select();
};

// Generic handler
const handleInput = <T extends HTMLInputElement | HTMLTextAreaElement>(
  e: React.ChangeEvent<T>
) => {
  console.log(e.target.value);
};
```

## Custom Hooks

```typescript
// useLocalStorage
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

// useFetch
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Usage
const { data, loading, error } = useFetch<User[]>("/api/users");
```

---

# Real-world Patterns

## API Response Types

```typescript
// Generic API response
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiError {
  status: number;
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}

// Type-safe fetch wrapper
async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }

  return response.json();
}

// Usage
const { data: user } = await fetchApi<User>("/api/users/1");
const { data: users } = await fetchApi<User[]>("/api/users");
```

## Redux Toolkit Types

```typescript
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

// State type
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunk
export const fetchUser = createAsyncThunk<
  User,                    // Return type
  number,                  // First argument type
  { rejectValue: string }  // ThunkAPI config
>(
  "user/fetchUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    } catch (error) {
      return rejectWithValue("Failed to fetch user");
    }
  }
);

// Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      });
  },
});

// Typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## Form Validation Types

```typescript
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod schema
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
  role: z.enum(["user", "admin", "moderator"]),
});

// Infer type from schema
type UserFormData = z.infer<typeof userSchema>;
// { name: string; email: string; age: number; role: "user" | "admin" | "moderator" }

function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      age: 18,
      role: "user",
    },
  });

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    await createUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="number" {...register("age", { valueAsNumber: true })} />
      {errors.age && <span>{errors.age.message}</span>}

      <select {...register("role")}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="moderator">Moderator</option>
      </select>

      <button disabled={isSubmitting}>Submit</button>
    </form>
  );
}
```

---

# Interview Questions

## Basic Level

1. **Primitive types trong TypeScript?**
   - string, number, boolean, null, undefined
   - symbol, bigint
   - any, unknown, never, void

2. **Interface vs Type?**
   - Interface: extendable, mergeable, tốt cho object shapes
   - Type: flexible hơn, union/tuple, không merge
   - Recommendation: Pick one, be consistent

3. **any vs unknown?**
   - any: bypass type checking, không an toàn
   - unknown: phải type check trước khi dùng
   - Prefer unknown over any

4. **Optional vs nullable?**
   - Optional (`?`): property có thể không tồn tại
   - Nullable (`| null`): property tồn tại nhưng có thể null

## Intermediate Level

5. **Generics là gì?**
   - Type parameters cho reusable code
   - Maintain type safety với flexibility
   - `function identity<T>(value: T): T`

6. **Type guards?**
   - typeof, instanceof, in
   - Custom type guards với `is` keyword
   - Discriminated unions

7. **Utility types thường dùng?**
   - Partial, Required, Readonly
   - Pick, Omit, Record
   - ReturnType, Parameters
   - Exclude, Extract, NonNullable

8. **Discriminated unions?**
   - Union với common literal property
   - Giúp TypeScript narrow types
   - Pattern: `kind` hoặc `type` field

## Advanced Level

9. **Conditional types?**
   - `T extends U ? X : Y`
   - infer keyword
   - Distributive over unions

10. **Mapped types?**
    - Transform properties: `[P in keyof T]`
    - Key remapping với `as`
    - Modifiers: `readonly`, `?`, `-?`

11. **Template literal types?**
    - String manipulation at type level
    - Uppercase, Lowercase, Capitalize
    - Union combinations

12. **const assertion?**
    - `as const` - readonly và literal types
    - Useful cho config objects
    - Array becomes tuple

13. **Brand types?**
    - Nominal typing trong structural type system
    - Prevent ID confusion
    - Runtime validation integration

14. **Function overloads?**
    - Multiple signatures, single implementation
    - Different return types per input
    - Order matters: specific first

## Practical Questions

15. **How to type React component props?**
    - Interface với ReactNode cho children
    - Generic components cho reusability
    - PropsWithChildren utility

16. **How to type custom hooks?**
    - Return type: tuple or object
    - Generic hooks cho flexibility
    - Proper typing for refs

17. **How to handle API responses?**
    - Generic wrapper types
    - Error types
    - Discriminated unions for states

18. **TypeScript strict mode?**
    - Enable all strict checks
    - strictNullChecks most important
    - noImplicitAny prevents any leaks

