---
name: codebase-analysis
description: Legacy code understanding, dependency mapping, architecture recovery, and codebase discovery techniques.
allowed-tools: Read, Glob, Grep, Bash
---

# Codebase Analysis

> Understand before you change. Map the territory before you build the road.

---

## 1. Discovery Process

### Initial Assessment

```
1. ORIENT    — What does this project do?
2. MAP       — What's the structure?
3. TRACE     — How does data flow?
4. ASSESS    — What's the health?
5. DOCUMENT  — Record findings
```

### First Steps

| Action | Command/Approach |
|--------|-----------------|
| **Read README** | Start with project documentation |
| **Check package.json / requirements.txt** | Understand dependencies |
| **Map directory structure** | `find . -type f \| head -50` or `tree -L 3` |
| **Find entry points** | `main`, `index`, `app`, `server` files |
| **Read tests** | Tests document intended behavior |
| **Check git history** | `git log --oneline -30` for recent activity |

---

## 2. Architecture Recovery

### Identifying Architecture Patterns

| Pattern | Indicators |
|---------|-----------|
| **MVC** | `controllers/`, `models/`, `views/` directories |
| **Layered** | `services/`, `repositories/`, `handlers/` |
| **Microservices** | Multiple `package.json`, Docker Compose, API gateways |
| **Monolith** | Single deploy unit, shared database |
| **Event-driven** | Message queues, event handlers, pub/sub |
| **Serverless** | Lambda handlers, `serverless.yml` |

### Component Mapping

```
Entry Points → Controllers/Routes → Services → Data Layer
      ↓              ↓                 ↓          ↓
  Configuration   Middleware      Business     Database
                                   Logic      External APIs
```

---

## 3. Dependency Mapping

### Internal Dependencies

| Technique | Purpose |
|-----------|---------|
| **Import graph** | `grep -r "import\|require" --include="*.ts"` |
| **Circular dependency check** | Tools like `madge` or `dpdm` |
| **Module boundaries** | Which modules depend on which |
| **Shared utilities** | Common code used across modules |

### External Dependencies

| Check | Command |
|-------|---------|
| **List all deps** | `npm ls --depth=0` or `pip list` |
| **Check outdated** | `npm outdated` or `pip list --outdated` |
| **Audit vulnerabilities** | `npm audit` or `pip-audit` |
| **License compliance** | `npx license-checker` |
| **Unused deps** | `npx depcheck` |

### Dependency Health Assessment

| Metric | Healthy | Concerning |
|--------|---------|-----------|
| **Outdated deps** | < 10% | > 30% |
| **Known vulns** | 0 critical/high | Any critical |
| **Unmaintained deps** | 0 | Any with no updates in 2+ years |
| **Dependency depth** | Shallow | Very deep transitive chains |

---

## 4. Code Health Assessment

### Metrics to Evaluate

| Metric | Tool | Healthy |
|--------|------|---------|
| **Cyclomatic complexity** | ESLint, SonarQube | < 10 per function |
| **File length** | Line count | < 300 lines |
| **Function length** | Line count | < 30 lines |
| **Test coverage** | Coverage tool | > 70% |
| **Duplication** | jscpd, SonarQube | < 5% |
| **Dead code** | ts-prune, knip | 0 unused exports |

### Code Smell Detection

| Smell | Indicator | Severity |
|-------|-----------|----------|
| **God class/file** | > 500 lines, does everything | High |
| **Shotgun surgery** | One change touches 10+ files | High |
| **Feature envy** | Module accesses another module's data excessively | Medium |
| **Dead code** | Unreachable functions, unused exports | Medium |
| **Magic numbers** | Unexplained literals | Low |

---

## 5. Data Flow Tracing

### Tracing a Feature

```
1. Find the entry point (route, handler, event)
2. Follow the call chain through layers
3. Note data transformations at each step
4. Identify external calls (DB, APIs, queues)
5. Trace the response path back
```

### Tools for Tracing

| Technique | Usage |
|-----------|-------|
| **grep for function names** | Follow call chains manually |
| **IDE "Find References"** | Navigate call hierarchy |
| **Git blame** | Who wrote this and when |
| **Git log for file** | History of changes to a file |
| **Add logging** | Temporary trace logging for runtime flow |

---

## 6. Legacy Code Strategies

### Working with Unfamiliar Code

| Strategy | Application |
|----------|-------------|
| **Read tests first** | Tests document intended behavior |
| **Strangler fig pattern** | Replace legacy code incrementally |
| **Characterization tests** | Write tests that capture current behavior |
| **Scratch refactoring** | Refactor to understand, then revert |
| **Seam identification** | Find safe points to insert new code |

### Safe Changes in Legacy Code

1. **Add characterization tests** — capture what it does now
2. **Extract small functions** — name what the code is doing
3. **Introduce seams** — dependency injection for testability
4. **Incremental replacement** — one module at a time

---

## 7. Documentation of Findings

### Architecture Report Format

```markdown
# Codebase Analysis: [Project Name]

## Summary
One paragraph overview of the system.

## Architecture
- Pattern: [MVC / Layered / etc.]
- Entry points: [list]
- Key modules: [list with descriptions]

## Dependencies
- Total: X direct, Y transitive
- Outdated: X
- Vulnerabilities: X critical, Y high

## Health Metrics
- Test coverage: X%
- Average complexity: X
- Code duplication: X%

## Risks
1. [Risk description and impact]
2. [Risk description and impact]

## Recommendations
1. [Prioritized recommendation]
2. [Prioritized recommendation]
```

---

## 8. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Start changing code before understanding it | Map the codebase first |
| Ignore tests (they document behavior) | Read tests before code |
| Rewrite from scratch | Incremental strangler fig |
| Skip dependency audit | Check for vulnerabilities and outdated deps |
| Assume the code is correct | Verify behavior with tests |
| Document once and forget | Keep analysis up to date |
| Analyze everything at once | Focus on the area you need to change |

---

> **Remember:** The best way to understand code is to trace a feature end-to-end. Start at the entry point, follow the data, and document what you find.
