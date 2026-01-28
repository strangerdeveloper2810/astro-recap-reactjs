# Docker Interview Practice - 20 Questions

## Overview

**Position:** Frontend/Backend/Fullstack Developer
**Topics:** Docker basics, Dockerfile, Docker Compose, Networking, Volumes, Security, Best Practices

---

## Questions & Answers

### Docker Fundamentals

---

#### Q1: Docker là gì? Container khác gì với Virtual Machine?

**Answer:**

**Docker** là platform để develop, ship và run applications trong containers - môi trường isolated, lightweight.

**So sánh Container vs VM:**

| Aspect | Container | Virtual Machine |
|--------|-----------|-----------------|
| **OS** | Share host kernel | Full guest OS |
| **Size** | MBs (lightweight) | GBs (heavy) |
| **Startup** | Seconds | Minutes |
| **Isolation** | Process-level | Hardware-level |
| **Performance** | Near-native | Overhead từ hypervisor |
| **Resource** | Share host resources | Dedicated resources |

```
VM:          [App] [App]        Container:   [App] [App]
             [Guest OS] [Guest OS]           [Container Runtime]
             [Hypervisor]                    [Host OS]
             [Host OS]                       [Hardware]
             [Hardware]
```

> **Tip:** Container nhẹ hơn vì share kernel với host, không cần boot cả OS.

---

#### Q2: Image và Container khác nhau như thế nào?

**Answer:**

- **Image**: Template read-only, chứa code, runtime, libraries, config. Giống như "class" trong OOP
- **Container**: Running instance của image. Giống như "object" được tạo từ class

```bash
# Image là blueprint
docker pull nginx        # Download image

# Container là running instance
docker run nginx         # Tạo container từ image
docker run nginx         # Tạo container khác từ cùng image
```

**Analogy:** Image như đĩa CD phim, Container như việc bạn đang xem phim từ đĩa đó. Nhiều người có thể xem cùng 1 đĩa (nhiều containers từ 1 image).

---

#### Q3: Dockerfile là gì? Giải thích các instructions phổ biến

**Answer:**

**Dockerfile** là text file chứa instructions để build Docker image.

```dockerfile
# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (leverage cache)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (documentation)
EXPOSE 3000

# Default command
CMD ["node", "server.js"]
```

**Common Instructions:**

| Instruction | Purpose |
|-------------|---------|
| `FROM` | Base image để build |
| `WORKDIR` | Set working directory |
| `COPY` | Copy files từ host vào image |
| `RUN` | Execute command khi build |
| `ENV` | Set environment variables |
| `EXPOSE` | Document port (không thực sự publish) |
| `CMD` | Default command khi run container |
| `ENTRYPOINT` | Main executable (khó override hơn CMD) |

---

#### Q4: COPY vs ADD trong Dockerfile

**Answer:**

- **COPY**: Chỉ copy files/directories từ host vào image
- **ADD**: Copy + thêm features (auto-extract tar, download URL)

```dockerfile
# COPY - đơn giản, recommended
COPY package.json ./
COPY src/ ./src/

# ADD - có thêm features
ADD https://example.com/file.tar.gz /tmp/  # Download URL
ADD archive.tar.gz /app/                    # Auto-extract
```

> **Best Practice:** Luôn dùng **COPY** trừ khi cần auto-extract tar. COPY rõ ràng và predictable hơn.

---

#### Q5: CMD vs ENTRYPOINT

**Answer:**

- **CMD**: Default command, dễ override khi `docker run`
- **ENTRYPOINT**: Main executable, khó override (cần `--entrypoint` flag)

```dockerfile
# CMD - có thể override hoàn toàn
CMD ["npm", "start"]
# docker run myapp npm test  → chạy "npm test" thay vì "npm start"

# ENTRYPOINT - không bị override
ENTRYPOINT ["npm"]
CMD ["start"]
# docker run myapp test  → chạy "npm test" (ENTRYPOINT giữ nguyên)
```

**Best Practice Pattern:**

```dockerfile
ENTRYPOINT ["node"]           # Fixed executable
CMD ["app.js"]                # Default argument (overridable)
# docker run myapp other.js   → chạy "node other.js"
```

---

#### Q6: Docker Layer là gì? Làm sao optimize layer caching?

**Answer:**

Mỗi instruction trong Dockerfile tạo một **layer**. Docker cache layers để tăng tốc builds.

**Cache hoạt động:** Nếu instruction và context không đổi → dùng cached layer.

```dockerfile
# ❌ Bad - mỗi code change → reinstall dependencies
COPY . .
RUN npm install

# ✅ Good - dependencies cached nếu package.json không đổi
COPY package*.json ./
RUN npm ci
COPY . .
```

**Best Practices:**

1. **Ít thay đổi → đặt trước** (base image, dependencies)
2. **Hay thay đổi → đặt sau** (source code)
3. **Gộp RUN commands** để giảm layers:

```dockerfile
# ❌ 3 layers
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# ✅ 1 layer
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

---

#### Q7: Multi-stage build là gì? Khi nào dùng?

**Answer:**

**Multi-stage build** dùng nhiều `FROM` statements để tạo image nhỏ hơn, chỉ copy artifacts cần thiết.

```dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (chỉ copy build output)
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

**Benefits:**

- **Smaller image**: Không có devDependencies, source code, build tools
- **Security**: Ít attack surface
- **Separation**: Build environment khác production environment

| Without Multi-stage | With Multi-stage |
|---------------------|------------------|
| ~1GB (node:18 + devDeps) | ~150MB (alpine + production) |

---

### Docker Compose

---

#### Q8: Docker Compose là gì? Khi nào dùng?

**Answer:**

**Docker Compose** là tool để define và run multi-container applications bằng YAML file.

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

**Khi nào dùng:**

- **Development**: Setup local dev environment nhanh
- **Testing**: Spin up test environment với dependencies
- **Staging**: Simple multi-container deployments
- **CI/CD**: Run integration tests

```bash
docker compose up -d      # Start all services
docker compose down       # Stop and remove
docker compose logs -f    # Follow logs
```

---

#### Q9: depends_on có đảm bảo service ready không?

**Answer:**

**Không!** `depends_on` chỉ đảm bảo **container started**, không phải **application ready**.

```yaml
services:
  web:
    depends_on:
      - db    # db container starts first, nhưng Postgres có thể chưa accept connections
```

**Solutions:**

1. **`depends_on` với condition (Compose v2.1+):**

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

2. **Wait script trong application:**

```dockerfile
# wait-for-it.sh hoặc application retry logic
CMD ["./wait-for-it.sh", "db:5432", "--", "npm", "start"]
```

---

#### Q10: Docker Volume là gì? Có mấy loại?

**Answer:**

**Volume** là cơ chế persist data ngoài container lifecycle.

**3 loại mounting:**

```yaml
services:
  app:
    volumes:
      # 1. Named Volume - Docker managed, best for databases
      - postgres_data:/var/lib/postgresql/data

      # 2. Bind Mount - Host path, good for development
      - ./src:/app/src

      # 3. tmpfs - Memory only, temporary data
      - type: tmpfs
        target: /tmp

volumes:
  postgres_data:  # Named volume declaration
```

| Type | Use Case | Persistence |
|------|----------|-------------|
| **Named Volume** | Database, uploads | Survives container removal |
| **Bind Mount** | Development, config files | Host filesystem |
| **tmpfs** | Secrets, temp files | Memory only, no disk |

```bash
docker volume ls                    # List volumes
docker volume inspect postgres_data # Details
docker volume rm postgres_data      # Remove
```

---

### Docker Networking

---

#### Q11: Docker Network types và khi nào dùng?

**Answer:**

```bash
# Các network drivers
docker network ls
```

| Driver | Description | Use Case |
|--------|-------------|----------|
| **bridge** | Default, isolated network | Single-host containers |
| **host** | Share host network stack | Performance-critical, no isolation |
| **none** | No networking | Security-critical containers |
| **overlay** | Multi-host networking | Docker Swarm, Kubernetes |

```yaml
# docker-compose.yml
services:
  frontend:
    networks:
      - frontend-net

  backend:
    networks:
      - frontend-net
      - backend-net

  db:
    networks:
      - backend-net  # db không expose ra frontend

networks:
  frontend-net:
  backend-net:
```

> **Tip:** Trong Compose, services cùng file tự động join default network và có thể communicate bằng service name (DNS).

---

#### Q12: Container communicate với nhau như thế nào?

**Answer:**

Containers trong cùng network communicate qua **service name** (built-in DNS).

```yaml
services:
  web:
    environment:
      # Dùng service name "db" thay vì IP
      - DATABASE_URL=postgres://db:5432/myapp
      - REDIS_URL=redis://redis:6379

  db:
    image: postgres:15

  redis:
    image: redis:7
```

```javascript
// Application code
const dbConnection = 'postgres://db:5432/myapp';  // "db" resolves to container IP
const redisClient = createClient({ url: 'redis://redis:6379' });
```

**Port mapping (`-p`)** chỉ cần khi expose ra host:

```yaml
services:
  web:
    ports:
      - "3000:3000"  # Host:Container - access từ localhost:3000

  db:
    # Không cần ports - chỉ internal access từ web service
```

---

### Security & Best Practices

---

#### Q13: Làm sao secure Docker container?

**Answer:**

**1. Non-root user:**

```dockerfile
# Tạo user và switch
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

**2. Read-only filesystem:**

```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
```

**3. Limit resources:**

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

**4. Use minimal base images:**

```dockerfile
# ❌ Full image với vulnerabilities
FROM node:18

# ✅ Minimal image
FROM node:18-alpine

# ✅✅ Distroless (chỉ app, không có shell)
FROM gcr.io/distroless/nodejs18
```

**5. Scan vulnerabilities:**

```bash
docker scout cve myimage:latest
# hoặc
trivy image myimage:latest
```

**6. Don't store secrets in image:**

```dockerfile
# ❌ Bad
ENV API_KEY=secret123

# ✅ Pass at runtime
# docker run -e API_KEY=secret123 myapp
```

---

#### Q14: .dockerignore dùng để làm gì?

**Answer:**

**`.dockerignore`** exclude files khỏi build context, giống `.gitignore`.

```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
Dockerfile
docker-compose*.yml
.dockerignore
README.md
coverage
.nyc_output
dist
```

**Benefits:**

- **Faster builds**: Ít files gửi đến Docker daemon
- **Smaller images**: Không copy unnecessary files
- **Security**: Không include secrets (.env, .git)

```bash
# Without .dockerignore: gửi cả node_modules (có thể 500MB+)
# With .dockerignore: chỉ gửi source code (vài MB)
```

---

#### Q15: Environment variables trong Docker

**Answer:**

**Thứ tự ưu tiên (cao → thấp):**

1. `docker run -e VAR=value`
2. `docker-compose.yml` environment
3. `.env` file
4. Dockerfile `ENV`

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - NODE_ENV=production
      - API_URL=${API_URL}  # Từ .env file hoặc shell
    env_file:
      - .env.production     # Load từ file
```

```dockerfile
# Dockerfile - default values
ENV NODE_ENV=development
ENV PORT=3000
```

**Best Practices:**

- **Secrets**: Dùng Docker secrets hoặc external secret manager, không hardcode
- **Build-time vs Runtime**: `ARG` cho build-time, `ENV` cho runtime

```dockerfile
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production  # Runtime variable
```

---

### Practical Scenarios

---

#### Q16: Debug container đang chạy

**Answer:**

```bash
# Xem logs
docker logs <container_id>
docker logs -f --tail 100 <container_id>  # Follow last 100 lines

# Exec vào container
docker exec -it <container_id> sh        # Shell access
docker exec -it <container_id> bash      # If bash available

# Inspect container
docker inspect <container_id>            # Full details
docker inspect --format='{{.State.Status}}' <container_id>

# Resource usage
docker stats <container_id>

# Processes inside container
docker top <container_id>

# Copy files from container
docker cp <container_id>:/app/logs ./local-logs
```

**Compose:**

```bash
docker compose logs -f web    # Logs của service "web"
docker compose exec web sh    # Shell vào service "web"
```

---

#### Q17: Container restart policies

**Answer:**

```yaml
services:
  app:
    restart: unless-stopped
```

| Policy | Behavior |
|--------|----------|
| `no` | Không tự restart (default) |
| `always` | Luôn restart, kể cả khi manually stopped |
| `on-failure` | Chỉ restart khi exit code ≠ 0 |
| `unless-stopped` | Restart trừ khi manually stopped |

```bash
# Command line
docker run --restart=unless-stopped nginx

# Check restart count
docker inspect --format='{{.RestartCount}}' <container>
```

> **Production:** Dùng `unless-stopped` hoặc `on-failure` để auto-recovery.

---

#### Q18: Optimize Docker image size

**Answer:**

**1. Minimal base image:**

```dockerfile
# Node images comparison
FROM node:18          # ~1GB
FROM node:18-slim     # ~200MB
FROM node:18-alpine   # ~130MB
```

**2. Multi-stage build:**

```dockerfile
FROM node:18 AS builder
RUN npm ci && npm run build

FROM node:18-alpine
COPY --from=builder /app/dist ./dist
```

**3. Single RUN với cleanup:**

```dockerfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*
```

**4. .dockerignore:**

```
node_modules
.git
*.md
```

**5. Production dependencies only:**

```dockerfile
RUN npm ci --only=production
```

| Technique | Size Reduction |
|-----------|----------------|
| Alpine base | ~60-80% |
| Multi-stage | ~50-70% |
| Production deps only | ~30-50% |

---

#### Q19: Docker trong CI/CD pipeline

**Answer:**

```yaml
# .github/workflows/docker.yml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

**Best Practices:**

- **Tag với git SHA** cho traceability
- **Cache layers** để tăng tốc builds
- **Scan vulnerabilities** trước khi push
- **Use specific tags** trong production (không dùng `latest`)

---

#### Q20: Docker health checks

**Answer:**

```dockerfile
# Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```yaml
# docker-compose.yml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Health status:**

```bash
docker ps  # Shows health status
# CONTAINER ID  IMAGE  STATUS
# abc123        web    Up 5 min (healthy)

docker inspect --format='{{.State.Health.Status}}' <container>
# healthy | unhealthy | starting
```

**Use with depends_on:**

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy
```

> **Tip:** Health checks quan trọng cho orchestrators (Kubernetes, Swarm) để biết khi nào restart container.

---

## Quick Commands Reference

```bash
# Images
docker build -t myapp:v1 .
docker images
docker rmi <image>
docker pull <image>
docker push <image>

# Containers
docker run -d -p 3000:3000 --name myapp myapp:v1
docker ps -a
docker stop/start/restart <container>
docker rm <container>
docker logs -f <container>
docker exec -it <container> sh

# Compose
docker compose up -d
docker compose down -v  # Remove volumes too
docker compose logs -f
docker compose ps

# Cleanup
docker system prune -a  # Remove all unused data
docker volume prune     # Remove unused volumes
```

---

## Summary

| Topic | Key Points |
|-------|------------|
| **Image vs Container** | Image = template, Container = running instance |
| **Dockerfile** | FROM, WORKDIR, COPY, RUN, EXPOSE, CMD |
| **Layer caching** | Ít thay đổi trước, hay thay đổi sau |
| **Multi-stage** | Smaller images, separate build/runtime |
| **Compose** | Multi-container apps, depends_on + healthcheck |
| **Networking** | Service names for DNS, bridge network default |
| **Volumes** | Named volumes for data, bind mounts for dev |
| **Security** | Non-root, minimal images, scan vulnerabilities |
