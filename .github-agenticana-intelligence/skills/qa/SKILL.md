---
name: qa
description: Test automation, integration testing, CI pipeline testing, quality assurance strategy, and defect management.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Quality Assurance

> Quality is everyone's responsibility. QA provides the safety net and the strategy.

---

## 1. QA Strategy

### Test Pyramid in Practice

```
        ╱ E2E Tests ╲           5-10% — Full user flows
       ╱─────────────╲
      ╱  Integration   ╲        20-30% — Module interactions
     ╱─────────────────╲
    ╱   Unit Tests      ╲       60-70% — Individual functions
   ╱─────────────────────╲
```

### Quality Gates

| Gate | When | Must Pass |
|------|------|-----------|
| **Pre-commit** | Before commit | Lint, format, type-check |
| **PR check** | On pull request | Unit tests, integration tests |
| **Merge gate** | Before merge | All tests, coverage threshold |
| **Pre-deploy** | Before production | E2E tests, smoke tests |
| **Post-deploy** | After production | Health checks, smoke tests |

---

## 2. Test Automation

### Automation Principles

| Principle | Application |
|-----------|-------------|
| **Automate the repetitive** | Tests you'd run every PR |
| **Manual for exploratory** | Edge cases, UX, accessibility |
| **Fast feedback** | Unit tests < 10s, integration < 2min |
| **Deterministic** | Same input → same result, always |
| **Independent** | No test depends on another test's state |

### What to Automate

| Type | Automate | Keep Manual |
|------|----------|-------------|
| **Regression** | ✅ Always | — |
| **Smoke tests** | ✅ Always | — |
| **CRUD operations** | ✅ Always | — |
| **Exploratory** | — | ✅ Always |
| **Visual/UX** | Partial (screenshot) | ✅ Final review |
| **Security** | ✅ SAST/DAST scans | ✅ Penetration testing |

---

## 3. Integration Testing

### API Integration Tests

```typescript
describe('POST /api/users', () => {
  it('should create a user with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Alice', email: 'alice@example.com' })
      .expect(201);

    expect(response.body.data.name).toBe('Alice');
  });

  it('should return 400 for missing email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Alice' })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Database Integration Tests

| Pattern | Application |
|---------|-------------|
| **Test database** | Separate DB for tests, reset between suites |
| **Transactions** | Wrap each test in a transaction, rollback after |
| **Fixtures/factories** | Create test data programmatically |
| **Migration tests** | Verify migrations up and down |

---

## 4. CI Pipeline Testing

### GitHub Actions Test Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:unit -- --coverage

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
```

### CI Best Practices

| Practice | Rationale |
|----------|-----------|
| **Parallelize test suites** | Faster feedback |
| **Cache dependencies** | Don't re-download every run |
| **Fail fast** | Run fastest tests first |
| **Report coverage** | Track trends over time |
| **Retry flaky tests** (with limit) | Don't block on intermittent failures |
| **Test matrix** | Multiple Node/OS versions if needed |

---

## 5. Defect Management

### Bug Report Template

```markdown
## Bug: [Short description]

**Severity:** Critical / High / Medium / Low
**Environment:** Production / Staging / Local

### Steps to Reproduce
1. [Step 1]
2. [Step 2]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Evidence
[Screenshots, logs, error messages]

### Possible Cause
[If known]
```

### Severity Definitions

| Severity | Criteria | Response |
|----------|----------|----------|
| **Critical** | Production down, data loss | Immediate fix |
| **High** | Major feature broken | Fix this sprint |
| **Medium** | Minor feature broken, workaround exists | Fix next sprint |
| **Low** | Cosmetic, edge case | Backlog |

---

## 6. Test Data Management

### Strategies

| Strategy | Use Case |
|----------|----------|
| **Factories** | Generate test data programmatically |
| **Fixtures** | Static data files for predictable tests |
| **Seeding** | Populate database with baseline data |
| **Anonymization** | Use production-like data without PII |

### Factory Pattern

```typescript
const createUser = (overrides = {}) => ({
  name: 'Test User',
  email: `user-${Date.now()}@test.com`,
  role: 'user',
  ...overrides,
});
```

---

## 7. Flaky Test Management

### Identifying Flaky Tests

| Indicator | Action |
|-----------|--------|
| Passes locally, fails in CI | Check environment differences |
| Intermittent failures | Look for timing, ordering, shared state |
| Depends on external services | Mock external dependencies |
| Different results on re-run | Check for randomness, time dependency |

### Fixing Flaky Tests

1. **Isolate** — Run the test alone, then with others
2. **Identify the cause** — Timing? State? Network? Order?
3. **Fix the root cause** — Don't just add retries
4. **Quarantine if needed** — Move to a separate suite temporarily
5. **Track metrics** — Monitor flakiness rate over time

---

## 8. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Test everything with E2E | Use the test pyramid |
| Ignore flaky tests | Fix or quarantine immediately |
| Skip testing in CI | Tests must run on every PR |
| Test implementation details | Test behavior and contracts |
| Share state between tests | Isolate each test completely |
| Write tests after bugs ship | Write tests before code (TDD) |
| Manual regression testing | Automate regression suites |
| No coverage tracking | Monitor coverage trends in CI |

---

> **Remember:** QA is not a phase — it's a continuous practice. Every test you automate is a regression you'll never ship again.
