---
name: backend
description: API design, REST/GraphQL, Node.js/Express server architecture, middleware patterns, and database integration.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Backend Development

> Design APIs that are consistent, secure, and maintainable. Think in layers.

---

## 1. API Design Principles

### REST Conventions

| Principle | Application |
|-----------|-------------|
| **Resource-oriented URLs** | `/users`, `/users/:id`, `/users/:id/posts` |
| **HTTP verbs for actions** | GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove |
| **Consistent naming** | Plural nouns, kebab-case: `/user-profiles` |
| **Idempotency** | PUT and DELETE should be idempotent |
| **Stateless** | No server-side session state between requests |

### URL Design

```
GET    /api/v1/users          → List users
GET    /api/v1/users/:id      → Get single user
POST   /api/v1/users          → Create user
PATCH  /api/v1/users/:id      → Update user
DELETE /api/v1/users/:id      → Delete user

# Nested resources
GET    /api/v1/users/:id/posts → List user's posts

# Query parameters for filtering/pagination
GET    /api/v1/users?role=admin&page=2&limit=20
```

### Response Format

```json
{
  "data": { },
  "meta": { "page": 1, "total": 42 },
  "error": null
}
```

| Status Code | Usage |
|-------------|-------|
| `200` | Success |
| `201` | Created |
| `204` | Deleted (no content) |
| `400` | Validation error |
| `401` | Unauthenticated |
| `403` | Unauthorized (forbidden) |
| `404` | Not found |
| `409` | Conflict |
| `422` | Unprocessable entity |
| `500` | Internal server error |

---

## 2. GraphQL Patterns

### When to Use GraphQL vs REST

| Use GraphQL When | Use REST When |
|------------------|---------------|
| Clients need flexible queries | Fixed, well-defined endpoints |
| Multiple resources in one request | Simple CRUD operations |
| Mobile apps with bandwidth concerns | Server-to-server APIs |
| Rapid iteration on frontend | Caching is critical (HTTP caching) |

### Schema Design

- Types should map to domain concepts
- Use input types for mutations
- Paginate with cursor-based connections
- Keep resolvers thin — delegate to service layer

---

## 3. Server Architecture

### Layered Architecture

```
Request → Middleware → Controller → Service → Repository → Database
                                       ↓
                                  Domain Logic
```

| Layer | Responsibility |
|-------|---------------|
| **Middleware** | Auth, logging, rate limiting, CORS |
| **Controller** | Request parsing, response formatting |
| **Service** | Business logic, orchestration |
| **Repository** | Data access, queries |

### Middleware Patterns

```typescript
// Auth middleware
app.use('/api', authenticate);

// Rate limiting
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Error handling (always last)
app.use(errorHandler);
```

---

## 4. Error Handling

### Consistent Error Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "must be a valid email" }
    ]
  }
}
```

### Error Handling Strategy

| Layer | Strategy |
|-------|----------|
| **Controller** | Catch known errors, return proper status |
| **Service** | Throw domain-specific errors |
| **Global handler** | Catch everything else, log, return 500 |

---

## 5. Authentication & Authorization

### Token-Based Auth

| Pattern | Usage |
|---------|-------|
| **JWT** | Stateless, short-lived access tokens |
| **Refresh tokens** | Long-lived, stored server-side |
| **API keys** | Service-to-service, rate-limited |
| **OAuth 2.0** | Third-party integrations |

### Authorization Patterns

- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Check authorization in the service layer, not the controller
- Never trust client-side roles

---

## 6. Database Integration

### Connection Management

- Use connection pooling (never open per-request connections)
- Configure pool size based on expected concurrency
- Handle connection errors gracefully with retries
- Close connections cleanly on shutdown

### Query Optimization

- Avoid N+1 queries — use joins or batch loading
- Index columns used in WHERE, ORDER BY, JOIN
- Use `EXPLAIN` to verify query plans
- Paginate all list endpoints

---

## 7. Validation & Sanitization

### Input Validation

| Rule | Application |
|------|-------------|
| **Validate early** | At the controller/middleware level |
| **Whitelist, don't blacklist** | Accept known-good, reject everything else |
| **Type coercion** | Parse strings to numbers, dates, etc. |
| **Schema validation** | Use Zod, Joi, or similar |

### Sanitization

- Escape HTML in user-generated content
- Parameterize all SQL queries
- Validate file uploads (type, size, content)
- Sanitize log output to prevent log injection

---

## 8. Testing Backend Code

### Test Strategy

| Test Type | Scope | Speed |
|-----------|-------|-------|
| **Unit** | Service/utility functions | Fast |
| **Integration** | API endpoints with DB | Medium |
| **Contract** | API schema compliance | Fast |
| **Load** | Performance under stress | Slow |

---

## 9. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Business logic in controllers | Move logic to service layer |
| Catch errors and silently ignore | Log and re-throw or handle properly |
| Return 200 for errors | Use appropriate HTTP status codes |
| N+1 database queries | Batch load or join |
| Store secrets in code | Use environment variables |
| Skip input validation | Validate every external input |
| Couple to a specific database | Use repository pattern for abstraction |

---

> **Remember:** Good backend code is boring — predictable, consistent, and easy to debug. Every endpoint should be a variation on a well-understood pattern.
