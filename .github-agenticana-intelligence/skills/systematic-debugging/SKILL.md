---
name: systematic-debugging
description: 4-phase systematic debugging methodology with root cause analysis and evidence-based verification.
allowed-tools: Read, Glob, Grep, Bash
---

# Systematic Debugging

> Structured approach to debugging that prevents random guessing and ensures problems are properly understood before solving.

---

## Overview

This skill provides a repeatable, evidence-based debugging process. Follow all four phases in order — skipping phases leads to incomplete fixes and regressions.

---

## 4-Phase Debugging Process

### Phase 1: Reproduce

Before fixing, reliably reproduce the issue.

```markdown
## Reproduction Steps
1. [Exact step to reproduce]
2. [Next step]
3. [Expected vs actual result]

## Reproduction Rate
- [ ] Always (100%)
- [ ] Often (50-90%)
- [ ] Sometimes (10-50%)
- [ ] Rare (<10%)
```

**Key questions:**
- Can I reproduce it locally?
- Can I reproduce it in CI?
- What is the minimum input that triggers the bug?

### Phase 2: Isolate

Narrow down the source systematically.

```markdown
## Isolation Questions
- When did this start happening?
- What changed recently? (git log, PR history)
- Does it happen in all environments?
- Can we reproduce with minimal code?
- What's the smallest change that triggers it?
```

**Techniques:**
- `git bisect` to find the introducing commit
- Binary search through code paths
- Strip away unrelated code until minimal repro
- Check environment differences (versions, config)

### Phase 3: Understand

Find the root cause, not just symptoms.

```markdown
## Root Cause Analysis — The 5 Whys
1. Why: [First observation]
2. Why: [Deeper reason]
3. Why: [Still deeper]
4. Why: [Getting closer]
5. Why: [Root cause]
```

**Root cause categories:**
| Category | Examples |
|----------|----------|
| **Logic error** | Wrong condition, off-by-one, missing case |
| **State issue** | Race condition, stale cache, shared mutation |
| **Data issue** | Unexpected null, wrong type, encoding |
| **Environment** | Missing env var, version mismatch, permissions |
| **Integration** | API contract change, dependency update |

### Phase 4: Fix & Verify

Fix the root cause and verify it's truly fixed.

```markdown
## Fix Verification
- [ ] Bug no longer reproduces
- [ ] Related functionality still works
- [ ] No new issues introduced
- [ ] Test added to prevent regression
- [ ] Fix addresses root cause, not just symptom
```

---

## Debugging Checklist

### Before Starting
- [ ] Can reproduce consistently
- [ ] Have minimal reproduction case
- [ ] Understand expected behavior

### During Investigation
- [ ] Check recent changes (`git log --oneline -20`)
- [ ] Check logs for errors
- [ ] Add logging/tracing if needed
- [ ] Use debugger/breakpoints
- [ ] Read error messages carefully — they usually say what's wrong

### After Fix
- [ ] Root cause documented
- [ ] Fix verified in same environment as reproduction
- [ ] Regression test added
- [ ] Similar code paths checked for same bug

---

## Common Debugging Commands

```bash
# Recent changes
git log --oneline -20
git diff HEAD~5

# Find the introducing commit
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>

# Search for patterns in code
grep -r "errorPattern" --include="*.ts"

# Check GitHub Actions logs
gh run view <run-id> --log-failed
```

---

## CI/CD Debugging

### GitHub Actions Specific

| Problem | Investigation |
|---------|---------------|
| **Flaky test** | Check for timing issues, shared state, order dependency |
| **Works locally, fails in CI** | Compare Node/runtime versions, env vars, file paths |
| **Intermittent failure** | Look for race conditions, network timeouts, resource limits |
| **Permission denied** | Check `permissions:` block, token scopes |

### Log Analysis

- Read the full error, not just the first line
- Check timestamps for ordering of events
- Look for warnings before the error — they often reveal context
- Compare passing vs failing run logs side-by-side

---

## Core Principles

| Principle | Application |
|-----------|-------------|
| **Evidence over assumption** | Prove it with data, don't guess |
| **Root cause over symptom** | Fix why, not just what |
| **Reproduce before fixing** | No fix without reliable repro |
| **One change at a time** | Isolate the effect of each change |
| **Document findings** | Future you will thank present you |

---

## Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Make random changes — "Maybe if I change this..." | Follow the 4-phase process |
| Ignore evidence — "That can't be the cause" | Trust the data, question assumptions |
| Assume — "It must be X" without proof | Gather evidence first |
| Fix without reproducing | Reproduce reliably before fixing |
| Stop at symptoms | Dig to root cause with 5 Whys |
| Skip regression tests | Always add a test for the bug |
| Debug in production | Reproduce locally or in CI first |

---

> **Remember:** Debugging is detective work. Collect evidence, form hypotheses, test them. The answer is always in the data.
