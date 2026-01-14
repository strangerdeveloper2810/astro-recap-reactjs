# NestJS - Complete Guide (Basic to Advanced)

## Table of Contents
- [Level 1: Basic](#level-1-basic)
- [Level 2: Intermediate](#level-2-intermediate)
- [Level 3: Advanced](#level-3-advanced)
- [Interview Questions](#interview-questions)

---

# Level 1: Basic

## 1.1 NestJS là gì?

```typescript
/*
NestJS = Framework Node.js để xây dựng server-side applications

Đặc điểm:
- Built với TypeScript (support JavaScript)
- Inspired by Angular (Decorators, Modules, DI)
- Express/Fastify under the hood
- Modular architecture
- Built-in support cho microservices, GraphQL, WebSocket

Kiến trúc:
┌─────────────────────────────────────────────────────┐
│                    Controllers                       │
│              (Handle HTTP requests)                  │
├─────────────────────────────────────────────────────┤
│                     Services                         │
│               (Business logic)                       │
├─────────────────────────────────────────────────────┤
│                     Modules                          │
│            (Organize application)                    │
└─────────────────────────────────────────────────────┘
*/

// Installation
// $ npm i -g @nestjs/cli
// $ nest new project-name
// $ cd project-name
// $ npm run start:dev
```

## 1.2 Project Structure

```
src/
├── app.controller.ts      # Basic controller
├── app.controller.spec.ts # Unit tests
├── app.module.ts          # Root module
├── app.service.ts         # Basic service
└── main.ts                # Entry point

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

## 1.3 Modules

```typescript
// Module = Container cho related components
// Mỗi app có ít nhất 1 root module (AppModule)

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [],           // Import other modules
  controllers: [UsersController], // Controllers trong module này
  providers: [UsersService],      // Services, repositories, etc.
  exports: [UsersService],        // Export để modules khác dùng
})
export class UsersModule {}

// ========== Root Module ==========
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [UsersModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// ========== Generate module với CLI ==========
// $ nest g module users
// $ nest g mo users (shorthand)
```

## 1.4 Controllers

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users') // Base route: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET /users/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id); // +id converts to number
  }

  // GET /users?page=1&limit=10
  @Get()
  findWithQuery(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.findAll({ page, limit });
  }

  // POST /users
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // PUT /users/:id (full update)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // PATCH /users/:id (partial update)
  @Patch(':id')
  partialUpdate(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // DELETE /users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // ========== Access Request/Response directly ==========
  @Get('raw')
  getRaw(@Req() req: Request, @Res() res: Response) {
    res.status(200).json({ message: 'Hello' });
  }

  // ========== Headers ==========
  @Get('with-headers')
  getWithHeaders(@Headers('authorization') auth: string) {
    return { auth };
  }
}

// Generate controller
// $ nest g controller users
// $ nest g co users
```

## 1.5 Services (Providers)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable() // Decorator để NestJS quản lý dependency injection
export class UsersService {
  private users = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  create(createUserDto: CreateUserDto) {
    const newUser = {
      id: this.users.length + 1,
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.findOne(id);
    Object.assign(user, updateUserDto);
    return user;
  }

  remove(id: number) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User #${id} not found`);
    }
    this.users.splice(index, 1);
  }
}

// Generate service
// $ nest g service users
// $ nest g s users
```

## 1.6 DTOs (Data Transfer Objects)

```typescript
// dto/create-user.dto.ts
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  age?: number;
}

// dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialType makes all properties optional
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// ========== Với Validation (class-validator) ==========
// $ npm i class-validator class-transformer

import { IsEmail, IsNotEmpty, IsOptional, IsInt, Min, Max, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  age?: number;
}

// Enable validation globally in main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Strip properties không có trong DTO
    forbidNonWhitelisted: true, // Throw error nếu có extra properties
    transform: true,        // Auto transform types
  }));
  await app.listen(3000);
}
```

---

# Level 2: Intermediate

## 2.1 Dependency Injection

```typescript
// NestJS có built-in IoC (Inversion of Control) container

// ========== Standard Injection ==========
@Injectable()
export class UsersService {
  constructor(
    private readonly postsService: PostsService,
    private readonly emailService: EmailService,
  ) {}
}

// ========== Custom Providers ==========
@Module({
  providers: [
    // Standard (class-based)
    UsersService,

    // Value provider
    {
      provide: 'CONFIG',
      useValue: { apiKey: 'abc123' },
    },

    // Factory provider
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async () => {
        const connection = await createConnection();
        return connection;
      },
    },

    // Factory với dependencies
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: (configService: ConfigService) => {
        return createConnection(configService.get('DATABASE_URL'));
      },
      inject: [ConfigService],
    },

    // Class provider (alias)
    {
      provide: 'LOGGER',
      useClass: process.env.NODE_ENV === 'production'
        ? ProductionLogger
        : DevelopmentLogger,
    },

    // Existing provider (alias)
    {
      provide: 'AliasedUsersService',
      useExisting: UsersService,
    },
  ],
})
export class AppModule {}

// ========== Inject custom provider ==========
@Injectable()
export class SomeService {
  constructor(
    @Inject('CONFIG') private config: any,
    @Inject('DATABASE_CONNECTION') private db: Connection,
  ) {}
}
```

## 2.2 Middleware

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// ========== Class Middleware ==========
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
  }
}

// ========== Functional Middleware ==========
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
}

// ========== Apply Middleware ==========
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

@Module({
  imports: [UsersModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply to specific routes
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('users'); // All /users routes

    // Apply với method
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'users', method: RequestMethod.GET });

    // Apply to controller
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(UsersController);

    // Exclude routes
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        { path: 'users', method: RequestMethod.GET },
        'users/(.*)',
      )
      .forRoutes(UsersController);

    // Multiple middlewares
    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      .forRoutes('*');
  }
}

// ========== Global Middleware ==========
// main.ts
const app = await NestFactory.create(AppModule);
app.use(logger); // Function middleware
```

## 2.3 Exception Filters

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// ========== Built-in Exceptions ==========
throw new BadRequestException('Invalid data');
throw new NotFoundException('User not found');
throw new UnauthorizedException('Not authorized');
throw new ForbiddenException('Forbidden');
throw new ConflictException('Email already exists');
throw new InternalServerErrorException('Something went wrong');

// Với custom response
throw new BadRequestException({
  statusCode: 400,
  message: 'Validation failed',
  errors: ['name is required', 'email is invalid'],
});

// ========== Custom Exception ==========
export class UserNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(`User with ID ${userId} not found`);
  }
}

// ========== Custom Exception Filter ==========
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message,
    });
  }
}

// Catch all exceptions
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// ========== Apply Exception Filter ==========
// Method level
@Get()
@UseFilters(HttpExceptionFilter)
findAll() {}

// Controller level
@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UsersController {}

// Global level
// main.ts
app.useGlobalFilters(new HttpExceptionFilter());

// Global với DI
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

## 2.4 Pipes

```typescript
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ParseIntPipe,
  ParseBoolPipe,
  ParseArrayPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
} from '@nestjs/common';

// ========== Built-in Pipes ==========
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  // id is guaranteed to be a number
  return this.usersService.findOne(id);
}

// Với custom error
@Get(':id')
findOne(
  @Param('id', new ParseIntPipe({
    errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
  }))
  id: number,
) {}

// Default value
@Get()
findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {}

// Parse UUID
@Get(':uuid')
findByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {}

// ========== Custom Pipe ==========
@Injectable()
export class ParseUserPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Validation logic
    if (!value.name || !value.email) {
      throw new BadRequestException('Name and email are required');
    }
    // Transformation
    return {
      ...value,
      name: value.name.trim(),
      email: value.email.toLowerCase(),
    };
  }
}

// Usage
@Post()
create(@Body(ParseUserPipe) createUserDto: CreateUserDto) {}

// ========== Validation Pipe (class-validator) ==========
// Global validation - main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  forbidNonWhitelisted: true,// Error on unknown properties
  transform: true,           // Auto-transform payloads
  transformOptions: {
    enableImplicitConversion: true, // Implicit type conversion
  },
}));
```

## 2.5 Guards

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// ========== Auth Guard ==========
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// ========== Roles Guard ==========
// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Usage
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get()
  @Roles('admin')
  getAdminData() {
    return { data: 'admin only' };
  }

  @Get('moderator')
  @Roles('admin', 'moderator')
  getModeratorData() {
    return { data: 'admin or moderator' };
  }
}

// ========== Apply Guards ==========
// Method level
@UseGuards(AuthGuard)
@Get('profile')
getProfile() {}

// Controller level
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {}

// Global level - main.ts
app.useGlobalGuards(new AuthGuard());

// Global với DI
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
```

## 2.6 Interceptors

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// ========== Logging Interceptor ==========
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();

    console.log(`Before... ${request.method} ${request.url}`);

    return next.handle().pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`)),
    );
  }
}

// ========== Transform Response Interceptor ==========
export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        data,
        statusCode: context.switchToHttp().getResponse().statusCode,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// ========== Cache Interceptor ==========
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const key = request.url;

    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }

    return next.handle().pipe(
      tap(response => this.cache.set(key, response)),
    );
  }
}

// ========== Timeout Interceptor ==========
import { timeout, catchError } from 'rxjs/operators';
import { TimeoutError, throwError } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException();
        }
        return throwError(() => err);
      }),
    );
  }
}

// ========== Apply Interceptors ==========
@UseInterceptors(LoggingInterceptor)
@Get()
findAll() {}

// Global
app.useGlobalInterceptors(new TransformInterceptor());
```

---

# Level 3: Advanced

## 3.1 Database Integration (TypeORM)

```typescript
// $ npm install @nestjs/typeorm typeorm pg

// ========== Configuration ==========
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Dev only!
    }),
  ],
})
export class AppModule {}

// ========== Entity ==========
// user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Exclude from default select
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];
}

// post.entity.ts
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @Column()
  authorId: number;
}

// ========== Repository Pattern ==========
// users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// users.service.ts
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  findWithPosts(id: number): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['posts'],
    });
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Query Builder
  async findByEmail(email: string): Promise<User> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.name LIKE :query', { query: `%${query}%` })
      .orWhere('user.email LIKE :query', { query: `%${query}%` })
      .orderBy('user.createdAt', 'DESC')
      .take(10)
      .getMany();
  }
}
```

## 3.2 Authentication (Passport + JWT)

```typescript
// $ npm install @nestjs/passport passport passport-local passport-jwt
// $ npm install @nestjs/jwt
// $ npm install bcrypt

// ========== Auth Module ==========
// auth/auth.module.ts
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

// ========== Auth Service ==========
// auth/auth.service.ts
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.login(user);
  }
}

// ========== Local Strategy ==========
// auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}

// ========== JWT Strategy ==========
// auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}

// ========== Guards ==========
// auth/guards/local-auth.guard.ts
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

// auth/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// ========== Auth Controller ==========
// auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

// ========== Custom User Decorator ==========
// decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Usage
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) {
  return user;
}
```

## 3.3 Configuration Module

```typescript
// $ npm install @nestjs/config

// ========== Basic Setup ==========
// app.module.ts
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,           // Available everywhere
      envFilePath: '.env',      // or ['.env.local', '.env']
    }),
  ],
})
export class AppModule {}

// Usage
@Injectable()
export class SomeService {
  constructor(private configService: ConfigService) {}

  getDbHost() {
    return this.configService.get<string>('DATABASE_HOST');
  }
}

// ========== Configuration Files ==========
// config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));

// config/jwt.config.ts
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));

// app.module.ts
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
  ],
})
export class AppModule {}

// Usage
@Injectable()
export class SomeService {
  constructor(private configService: ConfigService) {}

  getDbConfig() {
    return this.configService.get('database');
    // { host, port, username, password, database }
  }

  getJwtSecret() {
    return this.configService.get('jwt.secret');
  }
}

// ========== Async Configuration ==========
// TypeORM with Config
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('database.host'),
    port: configService.get('database.port'),
    username: configService.get('database.username'),
    password: configService.get('database.password'),
    database: configService.get('database.database'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') !== 'production',
  }),
  inject: [ConfigService],
}),
```

## 3.4 Testing

```typescript
// ========== Unit Testing ==========
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: 1, name: 'John', email: 'john@example.com' }];
      mockRepository.find.mockResolvedValue(users);

      expect(await service.findAll()).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = { id: 1, name: 'John', email: 'john@example.com' };
      mockRepository.findOne.mockResolvedValue(user);

      expect(await service.findOne(1)).toEqual(user);
    });

    it('should throw NotFoundException', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});

// ========== E2E Testing ==========
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should return all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: 'john@example.com', password: 'password123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('John');
          expect(res.body.email).toBe('john@example.com');
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'J' }) // Invalid
        .expect(400);
    });
  });
});
```

## 3.5 Microservices

```typescript
// $ npm install @nestjs/microservices

// ========== Microservice Setup ==========
// main.ts (Microservice)
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3001,
      },
    },
  );
  await app.listen();
}

// ========== Message Patterns ==========
// users.controller.ts (Microservice)
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class UsersController {
  @MessagePattern({ cmd: 'get_users' })
  getUsers() {
    return this.usersService.findAll();
  }

  @MessagePattern({ cmd: 'get_user' })
  getUser(@Payload() data: { id: number }) {
    return this.usersService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'create_user' })
  createUser(@Payload() data: CreateUserDto) {
    return this.usersService.create(data);
  }
}

// ========== Client (API Gateway) ==========
// app.module.ts
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
    ]),
  ],
})
export class AppModule {}

// users.controller.ts (API Gateway)
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private client: ClientProxy) {}

  @Get()
  getUsers() {
    return this.client.send({ cmd: 'get_users' }, {});
  }

  @Get(':id')
  getUser(@Param('id') id: number) {
    return this.client.send({ cmd: 'get_user' }, { id });
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.client.send({ cmd: 'create_user' }, createUserDto);
  }
}

// ========== Events (Fire and Forget) ==========
// Emit event
this.client.emit('user_created', { id: 1, name: 'John' });

// Handle event
@EventPattern('user_created')
handleUserCreated(@Payload() data: any) {
  console.log('User created:', data);
}

// ========== Redis Transport ==========
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  },
);

// Client
ClientsModule.register([
  {
    name: 'USERS_SERVICE',
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  },
]),
```

---

# Interview Questions

## Basic Questions

**1. NestJS là gì? Tại sao chọn NestJS?**
```
NestJS là framework Node.js để build server-side applications.

Tại sao chọn:
- TypeScript first: Type safety, better IDE support
- Modular architecture: Organized, maintainable code
- Dependency Injection: Testable, loosely coupled
- Decorators: Clean, declarative code
- Built-in support: GraphQL, WebSockets, Microservices
- Familiar patterns: Giống Angular, dễ học với Angular devs
- Express/Fastify: Dùng battle-tested platforms
- Active ecosystem: Nhiều packages official
```

**2. Giải thích kiến trúc Module trong NestJS**
```typescript
// Module = container tổ chức application
// Mỗi feature nên có riêng module

@Module({
  imports: [],      // Import modules khác
  controllers: [],  // Handle HTTP requests
  providers: [],    // Services, repositories (DI)
  exports: [],      // Export cho modules khác dùng
})

// Relationships:
// - Module import Module khác
// - Controllers dùng Services (inject)
// - Services có thể inject Services khác
// - Exports để share providers
```

**3. Sự khác nhau giữa Middleware, Guard, Interceptor, Pipe?**
```typescript
// Execution order:
// Middleware → Guard → Interceptor (before) → Pipe → Handler → Interceptor (after)

// Middleware: Request/Response manipulation (logging, cors)
// - Có access đến req, res, next
// - Chạy trước Guards

// Guard: Authorization/Authentication
// - Return true/false
// - Có access đến ExecutionContext
// - Chạy sau Middleware, trước Interceptor

// Interceptor: Transform response, add extra logic
// - Before và after handler
// - Có thể modify response
// - Logging, caching, timeout

// Pipe: Validation, transformation
// - Transform input data
// - Validate DTOs
// - Chạy trước handler
```

## Intermediate Questions

**4. Dependency Injection trong NestJS hoạt động như thế nào?**
```typescript
// NestJS có IoC container tự động quản lý dependencies

// 1. Đánh dấu class là Injectable
@Injectable()
export class UsersService {}

// 2. Register trong Module
@Module({
  providers: [UsersService],
})

// 3. Inject qua constructor
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  // NestJS tự động inject UsersService instance
}

// Types of providers:
// - Class provider: useClass
// - Value provider: useValue
// - Factory provider: useFactory
// - Existing provider: useExisting
```

**5. Cách handle errors trong NestJS?**
```typescript
// 1. Built-in exceptions
throw new BadRequestException('Invalid data');
throw new NotFoundException('User not found');
throw new UnauthorizedException();

// 2. Custom exceptions
export class UserNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(`User ${userId} not found`);
  }
}

// 3. Exception filters (catch và transform errors)
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // Custom error response
  }
}

// 4. Global exception filter
app.useGlobalFilters(new HttpExceptionFilter());
```

**6. Giải thích DTO và Validation trong NestJS**
```typescript
// DTO = Data Transfer Object
// Định nghĩa shape của data

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

// Enable validation
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,    // Strip unknown properties
  transform: true,    // Auto-transform types
  forbidNonWhitelisted: true,
}));

// PartialType cho Update DTO
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

## Advanced Questions

**7. Cách implement Authentication với JWT trong NestJS?**
```typescript
// 1. Setup Passport + JWT
@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '7d' } }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})

// 2. Local Strategy (login)
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

// 3. JWT Strategy (protected routes)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}

// 4. Guards
@UseGuards(LocalAuthGuard)  // Login
@UseGuards(JwtAuthGuard)    // Protected routes
```

**8. Request Lifecycle trong NestJS**
```
1. Incoming request
2. Globally bound middleware
3. Module bound middleware
4. Global guards
5. Controller guards
6. Route guards
7. Global interceptors (pre-controller)
8. Controller interceptors (pre-controller)
9. Route interceptors (pre-controller)
10. Global pipes
11. Controller pipes
12. Route pipes
13. Route parameter pipes
14. Controller (method handler)
15. Route interceptors (post-request)
16. Controller interceptors (post-request)
17. Global interceptors (post-request)
18. Exception filters (if exception thrown)
19. Response sent
```

**9. Cách test NestJS application?**
```typescript
// Unit Test
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository, // Mock dependencies
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should find user', async () => {
    mockRepository.findOne.mockResolvedValue({ id: 1, name: 'John' });
    expect(await service.findOne(1)).toEqual({ id: 1, name: 'John' });
  });
});

// E2E Test
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200);
  });
});
```

**10. Microservices trong NestJS?**
```typescript
// NestJS hỗ trợ nhiều transports:
// - TCP, Redis, NATS, MQTT, gRPC, Kafka

// Microservice
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.TCP,
  options: { port: 3001 },
});

// Message patterns
@MessagePattern({ cmd: 'get_user' })
getUser(@Payload() data: { id: number }) {
  return this.usersService.findOne(data.id);
}

// Client
@Inject('USERS_SERVICE') private client: ClientProxy;

getUser(id: number) {
  return this.client.send({ cmd: 'get_user' }, { id });
}

// Events (fire-and-forget)
this.client.emit('user_created', user);

@EventPattern('user_created')
handleUserCreated(@Payload() data) {}
```
