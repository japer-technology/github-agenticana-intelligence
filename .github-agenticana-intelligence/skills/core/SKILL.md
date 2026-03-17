---
name: core
description: Foundational skills loaded for every agent — clean code, git operations, session management, ReasoningBank access, prompt extraction.
allowed-tools: Read, Glob, Grep, Bash
---

# Core Skills

> Foundation loaded for every specialist agent regardless of domain.

---

## 1. Clean Code Principles

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Variables** | Descriptive, camelCase | `userCount`, `isActive` |
| **Functions** | Verb-first, camelCase | `fetchUser()`, `validateInput()` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_TIMEOUT` |
| **Files** | kebab-case | `user-service.ts`, `auth-middleware.ts` |

### Code Quality Rules

| Principle | Application |
|-----------|-------------|
| **Single Responsibility** | Each function does one thing well |
| **DRY** | Extract repeated logic into shared utilities |
| **KISS** | Prefer simple, readable solutions over clever ones |
| **Fail Fast** | Validate inputs early, return/throw immediately on error |
| **Immutability** | Prefer `const`, avoid mutating shared state |

### Function Design

- Keep functions under 30 lines
- Maximum 3 parameters; use an options object for more
- Return early to avoid deep nesting
- Pure functions where possible — no side effects

---

## 2. Git Operations

### Commit Workflow

```
1. STAGE   → git add <files>        (only changed files)
2. COMMIT  → git commit -m "..."    (conventional commit)
3. PUSH    → git push               (retry on conflict)
```

### Conventional Commits

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring without behavior change |
| `docs:` | Documentation only |
| `test:` | Adding or updating tests |
| `chore:` | Build, CI, tooling changes |

### Conflict Resolution

```
On push failure:
├── git pull --rebase origin <branch>
├── Resolve conflicts if any
├── git rebase --continue
└── git push (retry)
```

### Branch Hygiene

- Work on feature branches, never commit directly to `main`
- Branch names: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`
- Keep commits atomic — one logical change per commit

---

## 3. Session Management

### JSONL Session Transcripts

| Action | Description |
|--------|-------------|
| **Create** | Start a new session with unique ID |
| **Resume** | Continue from last checkpoint |
| **Persist** | Write session state to `.jsonl` transcript |
| **Close** | Finalize session with summary |

### Session State Tracking

- Track which files have been read/modified
- Record decisions made and their rationale
- Maintain context window awareness — summarize when needed
- Always persist before switching tasks

---

## 4. ReasoningBank Access

### Shared Decision Memory

The ReasoningBank stores decisions and rationale from all agents.

| Operation | Usage |
|-----------|-------|
| **Read** | Check if a similar decision was already made |
| **Write** | Record new decisions with rationale |
| **Query** | Search by tag, agent, or topic |

### Decision Record Format

```markdown
## Decision: [Title]
- **Agent:** [who made it]
- **Context:** [why it was needed]
- **Choice:** [what was decided]
- **Rationale:** [why this option]
- **Alternatives:** [what was rejected and why]
```

---

## 5. Prompt Extraction

### Intent Parsing

| Step | Action |
|------|--------|
| **Strip prefix** | Remove `~` or command prefix |
| **Extract intent** | Identify the core request |
| **Identify scope** | Files, features, or domains affected |
| **Detect constraints** | Deadlines, tech requirements, preferences |

### Context Gathering

Before acting on a prompt:
1. Read the issue thread for full context
2. Check recent commits for related changes
3. Identify affected files and their dependencies
4. Verify the request aligns with project conventions

---

## 6. Comment Posting

### Structured Response Format

| Section | Content |
|---------|---------|
| **Summary** | One-line description of what was done |
| **Details** | Steps taken, files changed |
| **Verification** | How to confirm the change works |
| **Notes** | Caveats, follow-up suggestions |

### Posting Rules

- Always post a comment when a task is complete
- Include code snippets for non-trivial changes
- Reference related issues or PRs with `#number`
- Use collapsible sections for long output

---

## 7. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Commit without a message | Use conventional commits |
| Push directly to main | Work on feature branches |
| Ignore failing tests | Fix tests before committing |
| Leave debug code in commits | Clean up before staging |
| Make one giant commit | Keep commits atomic and focused |
| Skip context gathering | Read issue thread and recent history |
| Overwrite ReasoningBank entries | Append with new context |
| Guess at intent | Parse prompt carefully, ask if ambiguous |

---

> **Remember:** Core skills are the foundation. Every specialist builds on these — consistency here enables collaboration across all agents.
