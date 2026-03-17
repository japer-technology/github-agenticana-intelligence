---
name: database
description: Schema design, query optimization, migrations, indexing strategies, and ORM patterns (Prisma, SQL).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Database Design & Optimization

> Good schema design prevents 90% of performance problems. Get the foundations right.

---

## 1. Schema Design Principles

### Normalization Guidelines

| Normal Form | Rule | When to Denormalize |
|-------------|------|---------------------|
| **1NF** | No repeating groups, atomic values | Never skip |
| **2NF** | No partial dependencies | Never skip |
| **3NF** | No transitive dependencies | Read-heavy analytics tables |
| **BCNF** | Every determinant is a candidate key | Rarely needed |

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Tables** | plural, snake_case | `user_profiles` |
| **Columns** | singular, snake_case | `created_at`, `email` |
| **Primary keys** | `id` | `id` (auto-increment or UUID) |
| **Foreign keys** | `<table_singular>_id` | `user_id`, `post_id` |
| **Indexes** | `idx_<table>_<columns>` | `idx_users_email` |
| **Booleans** | `is_` or `has_` prefix | `is_active`, `has_verified` |

### Data Types

| Use Case | Type | Avoid |
|----------|------|-------|
| **IDs** | UUID or BIGINT | INT (runs out) |
| **Timestamps** | TIMESTAMPTZ (with timezone) | TIMESTAMP (ambiguous) |
| **Money** | DECIMAL(19,4) | FLOAT (precision loss) |
| **Short text** | VARCHAR(n) | TEXT (when length is known) |
| **JSON data** | JSONB | JSON (can't index) |
| **Booleans** | BOOLEAN | INT 0/1 |

---

## 2. Indexing Strategies

### When to Index

| Index When | Don't Index When |
|------------|------------------|
| Column in WHERE clauses | Table has few rows (<1000) |
| Column in JOIN conditions | Column has low cardinality |
| Column in ORDER BY | Column is rarely queried |
| Unique constraints needed | Write-heavy with no reads |

### Index Types

| Type | Use Case |
|------|----------|
| **B-tree** | Default, equality and range queries |
| **Hash** | Exact match only (if supported) |
| **GIN** | Full-text search, JSONB, arrays |
| **GiST** | Geometric data, range types |
| **Partial** | Index subset of rows (`WHERE is_active = true`) |
| **Composite** | Multi-column queries (leftmost prefix rule) |

### Composite Index Rule

```sql
-- Index on (a, b, c) helps:
WHERE a = 1                     ✅
WHERE a = 1 AND b = 2          ✅
WHERE a = 1 AND b = 2 AND c = 3 ✅
WHERE b = 2                     ❌ (leftmost missing)
WHERE a = 1 AND c = 3          ⚠️ (partial, skips b)
```

---

## 3. Query Optimization

### Common Performance Killers

| Problem | Solution |
|---------|----------|
| **N+1 queries** | Use JOIN or batch loading |
| **SELECT \*** | Select only needed columns |
| **Missing indexes** | Add indexes for WHERE/JOIN/ORDER columns |
| **Full table scans** | Add appropriate indexes |
| **Large offsets** | Use cursor/keyset pagination |
| **Unoptimized subqueries** | Rewrite as JOINs or CTEs |

### EXPLAIN Analysis

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Look for:
-- ✅ Index Scan (good)
-- ❌ Seq Scan on large table (bad)
-- ❌ Nested Loop with no index (bad)
-- ✅ Hash Join (usually good for large sets)
```

### Pagination

```sql
-- ❌ Offset pagination (slow at high offsets)
SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 10000;

-- ✅ Cursor pagination (constant time)
SELECT * FROM posts WHERE id > :last_id ORDER BY id LIMIT 20;
```

---

## 4. Migration Best Practices

### Migration Rules

| Rule | Rationale |
|------|-----------|
| **One change per migration** | Easy to rollback |
| **Always reversible** | Include down migration |
| **Never edit deployed migrations** | Create new ones instead |
| **Test migrations on production-size data** | Small test DBs hide problems |
| **Separate schema and data migrations** | Different risk profiles |

### Safe Migration Patterns

```sql
-- ✅ Add column (safe, nullable)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- ✅ Add index concurrently (no lock)
CREATE INDEX CONCURRENTLY idx_users_phone ON users(phone);

-- ❌ Add NOT NULL column without default (locks table)
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NOT NULL;

-- ✅ Safe NOT NULL addition (three-step)
-- 1. Add nullable column
-- 2. Backfill data
-- 3. Add NOT NULL constraint
```

---

## 5. Prisma Patterns

### Schema Best Practices

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}
```

### Query Patterns

```typescript
// ✅ Select only needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true },
});

// ✅ Batch operations
const [users, count] = await prisma.$transaction([
  prisma.user.findMany({ take: 20, skip: 0 }),
  prisma.user.count(),
]);

// ❌ N+1 — fetching relations in a loop
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// ✅ Include relations
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

---

## 6. Connection Management

| Setting | Recommendation |
|---------|---------------|
| **Pool size** | 2-5× number of CPU cores |
| **Idle timeout** | 10-30 seconds |
| **Connection timeout** | 5 seconds |
| **Statement timeout** | 30 seconds for web, longer for batch |

---

## 7. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Use SELECT * in production | Select only needed columns |
| Skip indexes on foreign keys | Index all FK columns |
| Use OFFSET for deep pagination | Use cursor-based pagination |
| Store files in the database | Use object storage, store URL |
| Use string concatenation in queries | Use parameterized queries |
| Edit deployed migrations | Create new corrective migrations |
| Ignore EXPLAIN output | Profile queries before optimizing |
| Use floating point for money | Use DECIMAL or integer cents |

---

> **Remember:** The database is the bottleneck in most applications. Good schema design, proper indexing, and efficient queries prevent 90% of performance issues.
