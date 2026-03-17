---
name: planning
description: Structured task planning with clear breakdowns, dependencies, and verification criteria for multi-step work.
allowed-tools: Read, Glob, Grep
---

# Planning

> Break work into clear, actionable tasks with verification criteria. Every task should be independently verifiable.

---

## Overview

This skill provides a framework for decomposing complex work into small, focused, verifiable tasks. Good plans prevent wasted effort and keep multi-agent collaboration on track.

---

## Task Breakdown Principles

### 1. Small, Focused Tasks

- Each task should take 2-5 minutes
- One clear outcome per task
- Independently verifiable

### 2. Clear Verification

- How do you know it's done?
- What can you check/test?
- What's the expected output?

### 3. Logical Ordering

- Dependencies identified
- Parallel work where possible
- Critical path highlighted
- **Verification is always LAST**

---

## Planning Principles

> 🔴 **NO fixed templates. Each plan is UNIQUE to the task.**

### Principle 1: Keep It SHORT

| ❌ Wrong | ✅ Right |
|----------|----------|
| 50 tasks with sub-sub-tasks | 5-10 clear tasks max |
| Every micro-step listed | Only actionable items |
| Verbose descriptions | One-line per task |

> **Rule:** If a plan is longer than 1 page, it's too long. Simplify.

### Principle 2: Be SPECIFIC, Not Generic

| ❌ Wrong | ✅ Right |
|----------|----------|
| "Set up project" | "Run `npx create-next-app`" |
| "Add authentication" | "Install next-auth, create `/api/auth/[...nextauth].ts`" |
| "Style the UI" | "Add Tailwind classes to `Header.tsx`" |

> **Rule:** Each task should have a clear, verifiable outcome.

### Principle 3: Dynamic Content Based on Context

**For NEW PROJECT:**
- What tech stack? (decide first)
- What's the MVP? (minimal features)
- What's the file structure?

**For FEATURE ADDITION:**
- Which files are affected?
- What dependencies needed?
- How to verify it works?

**For BUG FIX:**
- What's the root cause?
- What file/line to change?
- How to test the fix?

### Principle 4: Verification is Simple

| ❌ Wrong | ✅ Right |
|----------|----------|
| "Verify the component works correctly" | "Run `npm test`, see all green" |
| "Test the API" | "`curl localhost:3000/api/users` returns 200" |
| "Check styles" | "Open browser, verify dark mode toggle works" |

---

## Plan Structure

```markdown
# [Task Name]

## Goal
One sentence: What are we building/fixing?

## Tasks
- [ ] Task 1: [Specific action] → Verify: [How to check]
- [ ] Task 2: [Specific action] → Verify: [How to check]
- [ ] Task 3: [Specific action] → Verify: [How to check]

## Done When
- [ ] [Main success criteria]
```

> **That's it.** No phases, no sub-sections unless truly needed.

---

## Dependency Management

### Identifying Dependencies

```
Task A: Create database schema
Task B: Write migration script      ← depends on A
Task C: Add API endpoint            ← depends on B
Task D: Write unit tests for API    ← depends on C
Task E: Update documentation        ← independent, can parallel
```

### Parallelization

| Pattern | Example |
|---------|---------|
| **Independent tasks** | Tests + docs can run in parallel |
| **Fan-out** | Multiple API endpoints after schema is done |
| **Fan-in** | Integration test after all components ready |

---

## Estimation

### Task Sizing

| Size | Duration | Complexity |
|------|----------|------------|
| **XS** | < 2 min | Single line change |
| **S** | 2-5 min | Single function/file |
| **M** | 5-15 min | Multiple files, one feature |
| **L** | 15-30 min | Cross-cutting concern — split into smaller tasks |

> **Rule:** If a task is larger than M, break it down further.

---

## GitHub Actions Context

### Planning for CI/CD Tasks

- Account for workflow run time in verification steps
- Include `gh run watch` or `gh run view` for CI verification
- Plan for potential flaky test retries
- Consider workflow dependencies and triggers

### Plan Verification via CI

```bash
# Verify plan completion
gh pr checks <pr-number> --watch
gh run view <run-id> --log-failed
```

---

## Core Principles

| Principle | Application |
|-----------|-------------|
| **Outcome-oriented** | Define what "done" looks like first |
| **Incrementally verifiable** | Each step can be checked independently |
| **Minimal scope** | Do the smallest thing that achieves the goal |
| **Dependencies explicit** | Never assume ordering — state it |
| **Adaptable** | Plans change — update as you learn |

---

## Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Write 50-task plans | Keep to 5-10 focused tasks |
| Use generic descriptions | Be specific with files and commands |
| Copy-paste template plans | Tailor each plan to the task |
| Plan without understanding the codebase | Explore first, then plan |
| Skip verification criteria | Every task has a "done" check |
| Treat plans as immutable | Update plans as you learn more |
| Plan everything upfront | Plan the next phase, not the whole project |

---

## Best Practices

1. **Start with the goal** — What are we building/fixing?
2. **Max 10 tasks** — If more, break into multiple plans
3. **Each task verifiable** — Clear "done" criteria
4. **Project-specific** — No copy-paste templates
5. **Update as you go** — Mark `[x]` when complete

---

> **Remember:** A good plan is short, specific, and verifiable. If you can't explain what "done" looks like, you're not ready to start.
