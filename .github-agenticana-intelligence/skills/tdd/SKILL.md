---
name: tdd
description: Test-driven development — red-green-refactor cycle, test pyramid, AAA pattern, coverage analysis.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Test-Driven Development

> Write the test first. Watch it fail. Make it pass. Refactor. Repeat.

---

## 1. The TDD Cycle

### Red → Green → Refactor

```
1. RED    — Write a failing test that defines desired behavior
2. GREEN  — Write the minimum code to make the test pass
3. REFACTOR — Clean up the code while keeping tests green
```

### Rules

| Rule | Rationale |
|------|-----------|
| **Never write code without a failing test** | Tests drive the design |
| **Write the simplest test first** | Build complexity incrementally |
| **Only write enough code to pass** | Avoid speculative features |
| **Refactor after green** | Clean code is part of TDD |
| **Run all tests after each change** | Catch regressions immediately |

---

## 2. Test Pyramid

### Structure

```
        ╱ E2E ╲              Few, slow, high confidence
       ╱───────╲
      ╱ Integr. ╲           Some, medium speed
     ╱───────────╲
    ╱  Unit Tests  ╲         Many, fast, focused
   ╱─────────────────╲
```

### Distribution

| Type | Percentage | Scope | Speed |
|------|-----------|-------|-------|
| **Unit** | 70% | Single function/class | < 10ms |
| **Integration** | 20% | Multiple modules, DB, API | 100ms-2s |
| **E2E** | 10% | Full user flow | 5-30s |

---

## 3. AAA Pattern

### Arrange → Act → Assert

```typescript
describe('UserService', () => {
  it('should create a user with valid data', async () => {
    // Arrange — set up test data and dependencies
    const userData = { name: 'Alice', email: 'alice@example.com' };
    const mockRepo = { create: vi.fn().mockResolvedValue({ id: '1', ...userData }) };
    const service = new UserService(mockRepo);

    // Act — execute the behavior under test
    const result = await service.createUser(userData);

    // Assert — verify the outcome
    expect(result.id).toBe('1');
    expect(result.name).toBe('Alice');
    expect(mockRepo.create).toHaveBeenCalledWith(userData);
  });
});
```

### Rules for Each Phase

| Phase | Rules |
|-------|-------|
| **Arrange** | Set up only what this test needs. Use factories for complex objects. |
| **Act** | One action per test. If you're calling two things, write two tests. |
| **Assert** | Assert on behavior, not implementation. One logical assertion per test. |

---

## 4. Test Naming

### Convention

```
[unit] should [expected behavior] when [condition]
```

### Examples

```typescript
it('should return null when user is not found')
it('should throw ValidationError when email is empty')
it('should send welcome email after user creation')
it('should retry 3 times when database connection fails')
```

---

## 5. Test Doubles

### Types

| Double | Purpose | Use When |
|--------|---------|----------|
| **Stub** | Returns canned data | Need controlled inputs |
| **Mock** | Verifies interactions | Testing side effects (calls, events) |
| **Spy** | Records calls without replacing | Need real behavior + observation |
| **Fake** | Simplified implementation | In-memory DB, test server |

### When to Use Mocks vs Real Dependencies

| Use Mocks | Use Real |
|-----------|----------|
| External APIs | Pure functions |
| Databases (in unit tests) | Utility libraries |
| File system | Deterministic logic |
| Time/random | Data transformations |

---

## 6. Coverage Analysis

### Meaningful Coverage

| Metric | Target | Note |
|--------|--------|------|
| **Line coverage** | 80%+ | Minimum threshold |
| **Branch coverage** | 75%+ | More meaningful than lines |
| **Critical path coverage** | 100% | Auth, payments, data mutation |

### What NOT to Cover

- Generated code (Prisma client, GraphQL types)
- Configuration files
- Simple getters/setters with no logic
- Third-party library wrappers (test the integration instead)

---

## 7. Testing in CI/CD

### GitHub Actions Integration

```yaml
- name: Run tests
  run: npm test -- --coverage --ci

- name: Check coverage threshold
  run: npx vitest run --coverage --coverage.thresholds.lines=80
```

### CI Test Rules

| Rule | Rationale |
|------|-----------|
| **Tests must pass before merge** | Gate quality at PR level |
| **No skipped tests in main** | `.skip` is a temporary measure |
| **Flaky tests are bugs** | Fix or quarantine immediately |
| **Coverage can't decrease** | Ratchet up over time |

---

## 8. Test Organization

### File Structure

```
src/
  services/
    user-service.ts
    user-service.test.ts    ← Co-located unit tests
tests/
  integration/
    api/
      users.test.ts         ← Integration tests
  e2e/
    user-flow.test.ts       ← E2E tests
  fixtures/
    users.ts                ← Shared test data
  helpers/
    setup.ts                ← Test setup utilities
```

---

## 9. Core Principles

| Principle | Application |
|-----------|-------------|
| **Tests are documentation** | A reader should understand behavior from tests alone |
| **Isolated** | Each test runs independently, no shared state |
| **Deterministic** | Same input → same result, always |
| **Fast** | Slow tests don't get run |
| **Maintainable** | Refactoring code shouldn't break unrelated tests |

---

## 10. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Test implementation details | Test behavior and outcomes |
| Share mutable state between tests | Fresh setup per test |
| Write tests after the feature | Write the failing test first |
| Assert on everything | One logical assertion per test |
| Mock everything | Mock boundaries, test logic directly |
| Ignore flaky tests | Fix or quarantine immediately |
| Skip hard-to-test code | Refactor to make it testable |
| Write tests only for happy path | Cover error cases and edge cases |

---

> **Remember:** TDD is a design tool, not just a testing tool. The test-first approach forces you to think about the interface before the implementation.
