---
name: devops
description: CI/CD pipelines, Docker, infrastructure as code, deployment strategies, and GitHub Actions patterns.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# DevOps & CI/CD

> Automate everything. Make deployments boring.

---

## 1. CI/CD Principles

### Core Values

| Principle | Application |
|-----------|-------------|
| **Automate everything** | No manual steps in deploy path |
| **Fast feedback** | Tests and checks run in minutes, not hours |
| **Immutable artifacts** | Build once, deploy the same artifact everywhere |
| **Infrastructure as code** | Version-controlled, reviewable infra |
| **Fail fast** | Catch issues at the earliest possible stage |

### Pipeline Stages

```
Code Push → Lint → Test → Build → Stage → Deploy → Monitor
   ↓         ↓       ↓       ↓       ↓        ↓        ↓
  PR      Quality   Unit   Artifact  QA    Production  Alert
```

---

## 2. GitHub Actions Patterns

### Workflow Structure

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test -- --coverage
```

### Best Practices

| Practice | Rationale |
|----------|-----------|
| **Pin actions to SHA** | Prevent supply chain attacks |
| **Use `permissions:`** | Least privilege for GITHUB_TOKEN |
| **Cache dependencies** | Speed up workflows |
| **Use `concurrency:`** | Cancel redundant runs |
| **Separate lint/test/build** | Parallel execution, clear failures |
| **Use reusable workflows** | DRY across repositories |

### Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## 3. Docker Patterns

### Dockerfile Best Practices

```dockerfile
# Multi-stage build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Layer Optimization

| Technique | Impact |
|-----------|--------|
| **Order by change frequency** | Least-changed first (OS → deps → code) |
| **Multi-stage builds** | Smaller final image |
| **`.dockerignore`** | Exclude unnecessary files |
| **Use slim/alpine bases** | Smaller attack surface |
| **Pin base image versions** | Reproducible builds |
| **Run as non-root** | Security best practice |

---

## 4. Deployment Strategies

### Strategy Comparison

| Strategy | Risk | Rollback | Downtime |
|----------|------|----------|----------|
| **Rolling** | Low | Slow | None |
| **Blue-Green** | Low | Instant | None |
| **Canary** | Very Low | Instant | None |
| **Recreate** | High | Slow | Yes |

### Blue-Green Deployment

```
                ┌─── Blue (current) ← Live traffic
Load Balancer ──┤
                └─── Green (new)    ← Deploy & verify here
                                       Then switch traffic
```

### Canary Release

```
Traffic split:
├── 95% → Current version
└── 5%  → New version (canary)

Monitor metrics → if OK → gradually increase → 100%
                → if bad → rollback to 0%
```

---

## 5. Infrastructure as Code

### Principles

| Principle | Application |
|-----------|-------------|
| **Declarative** | Describe desired state, not steps |
| **Version controlled** | All infra in git |
| **Modular** | Reusable components |
| **Idempotent** | Apply multiple times, same result |
| **Documented** | README for every module |

### Secret Management

| Method | Use Case |
|--------|----------|
| **GitHub Secrets** | CI/CD pipeline secrets |
| **Environment secrets** | Per-environment configuration |
| **Secret manager (AWS/GCP/Azure)** | Application runtime secrets |
| **SOPS/sealed-secrets** | Encrypted secrets in git |

---

## 6. Monitoring & Observability

### Three Pillars

| Pillar | Purpose | Tools |
|--------|---------|-------|
| **Logs** | Event recording | Structured logging, ELK |
| **Metrics** | Quantitative measurements | Prometheus, Grafana |
| **Traces** | Request flow tracking | OpenTelemetry, Jaeger |

### Health Checks

```yaml
# Kubernetes-style
/health/live    → Is the process running?
/health/ready   → Can it serve traffic?
/health/startup → Has it finished initialization?
```

---

## 7. Key Patterns

| Pattern | Application |
|---------|-------------|
| **GitOps** | Git as single source of truth for infra |
| **12-Factor** | Follow 12-factor app methodology |
| **Feature flags** | Decouple deployment from release |
| **Progressive delivery** | Canary → gradual rollout |
| **Shift left** | Security and quality checks early in pipeline |

---

## 8. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Manual deployment steps | Fully automated pipelines |
| Secrets in code or logs | Use secret managers, mask in CI |
| Mutable infrastructure | Immutable, reproducible builds |
| Deploy on Fridays | Deploy frequently with confidence |
| Skip staging environment | Test in staging before production |
| Ignore monitoring | Monitor everything, alert on anomalies |
| Use `latest` tag in production | Pin specific image versions |
| One giant workflow | Modular, reusable workflow jobs |

---

> **Remember:** The goal of DevOps is to make deployments boring and routine. If deploying is scary, automate more.
