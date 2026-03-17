---
name: documentation
description: Technical writing, API documentation, README templates, Architecture Decision Records (ADRs).
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Documentation

> Write for the reader who has zero context. Clear docs prevent entire categories of bugs.

---

## 1. Documentation Principles

### Core Values

| Principle | Application |
|-----------|-------------|
| **Audience-first** | Write for the reader, not yourself |
| **Minimal but complete** | Say enough, no more |
| **Maintained** | Outdated docs are worse than no docs |
| **Discoverable** | Easy to find, well-organized |
| **Actionable** | Reader should know what to do next |

### Writing Rules

| Rule | Example |
|------|---------|
| **Use active voice** | "Run `npm install`" not "The dependencies should be installed" |
| **Lead with the action** | "Install dependencies:" not "In order to proceed, you need to..." |
| **Use code blocks** | Every command, path, or code reference in backticks |
| **One idea per paragraph** | Short, focused paragraphs |
| **Link, don't repeat** | Reference other docs instead of duplicating |

---

## 2. README Structure

### Essential Sections

```markdown
# Project Name

> One-line description of what this does.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Prerequisites

- Node.js >= 20
- PostgreSQL 15+

## Installation

Step-by-step setup instructions.

## Usage

How to use the project with examples.

## Configuration

Environment variables and settings.

## Contributing

How to contribute to the project.

## License

MIT (or applicable license)
```

### README Checklist

- [ ] One-line description at the top
- [ ] Quick start in under 3 commands
- [ ] Prerequisites listed
- [ ] All environment variables documented
- [ ] At least one usage example
- [ ] Link to contributing guide

---

## 3. API Documentation

### Endpoint Documentation Format

```markdown
### POST /api/users

Create a new user account.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email address |
| name | string | Yes | Display name |
| role | string | No | Default: "user" |

**Response (201):**

\`\`\`json
{
  "data": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "Alice"
  }
}
\`\`\`

**Errors:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Missing required fields |
| 409 | DUPLICATE_EMAIL | Email already registered |
```

### API Documentation Principles

| Principle | Application |
|-----------|-------------|
| **Every endpoint documented** | No undocumented public APIs |
| **Include request and response** | With realistic examples |
| **Document errors** | All error codes and when they occur |
| **Authentication noted** | Which endpoints require auth |
| **Versioning** | Note the API version |

---

## 4. Architecture Decision Records (ADRs)

### ADR Format

```markdown
# ADR-001: Use PostgreSQL for primary database

## Status
Accepted

## Context
We need a relational database for our application. The data is
highly relational with complex queries needed for reporting.

## Decision
Use PostgreSQL 15+ as the primary database.

## Consequences
- **Positive:** Strong JSON support, excellent query planner
- **Positive:** Mature ecosystem, widely supported ORMs
- **Negative:** More complex ops than SQLite for development
- **Negative:** Requires dedicated hosting
```

### ADR Principles

| Rule | Rationale |
|------|-----------|
| **One decision per ADR** | Focused and searchable |
| **Include context** | Why was this decision needed? |
| **Record alternatives** | What else was considered? |
| **Note consequences** | Both positive and negative |
| **Never modify** | Supersede with a new ADR instead |

---

## 5. Code Documentation

### When to Comment

| Comment When | Don't Comment When |
|-------------|-------------------|
| **Why** something is done (non-obvious reasoning) | Restating what the code does |
| Business rules that aren't obvious | Obvious code: `i++; // increment i` |
| Workarounds with context | Getter/setter methods |
| TODOs with issue numbers | Every function |
| API contracts (JSDoc for public APIs) | Internal implementation details |

### JSDoc for Public APIs

```typescript
/**
 * Fetch a user by their unique identifier.
 *
 * @param id - The user's unique ID (cuid format)
 * @returns The user object, or null if not found
 * @throws {DatabaseError} If the database connection fails
 */
async function getUser(id: string): Promise<User | null> {
```

---

## 6. Changelog & Release Notes

### CHANGELOG Format

```markdown
# Changelog

## [1.2.0] - 2025-03-15

### Added
- User profile editing endpoint
- Dark mode support

### Fixed
- Login timeout on slow connections (#142)

### Changed
- Upgraded Node.js to v20 LTS
```

### Release Notes vs Changelog

| Changelog | Release Notes |
|-----------|---------------|
| Technical audience | All stakeholders |
| Every notable change | Highlights only |
| Grouped by type | Grouped by impact |
| In the repository | In GitHub Releases |

---

## 7. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Write docs after the project is "done" | Document as you build |
| Duplicate information | Link to the source of truth |
| Leave outdated docs | Update docs with every code change |
| Write a novel | Keep it concise and scannable |
| Assume reader knows the context | Start from zero context |
| Skip error documentation | Document every error the user might see |
| Use jargon without definition | Define terms or link to glossary |
| Document implementation details | Document behavior and contracts |

---

> **Remember:** Documentation is a gift to your future self and your teammates. Write what you wish you'd found when you started.
