---
name: agile
description: Backlog management, user stories, acceptance criteria, sprint planning, and agile ceremonies.
allowed-tools: Read, Glob, Grep
---

# Agile Practices

> Deliver value incrementally. Inspect and adapt continuously.

---

## 1. Agile Principles

### Core Values

| Value | Application |
|-------|-------------|
| **Working software** over comprehensive documentation | Ship something that works |
| **Responding to change** over following a plan | Adapt when you learn new things |
| **Customer collaboration** over contract negotiation | Stay close to the user |
| **Individuals and interactions** over processes and tools | People solve problems, not tools |

### Applied Principles

| Principle | Practice |
|-----------|----------|
| **Deliver frequently** | Every sprint produces a shippable increment |
| **Welcome change** | Reprioritize based on new information |
| **Simplicity** | Maximize work not done |
| **Self-organizing teams** | Teams decide how to do the work |
| **Continuous improvement** | Retrospect and adapt every sprint |

---

## 2. Backlog Management

### Backlog Hierarchy

```
Epic (large initiative)
├── Feature (deliverable capability)
│   ├── User Story (user-facing value)
│   │   ├── Task (implementation step)
│   │   └── Task
│   └── User Story
└── Feature
```

### Backlog Grooming Rules

| Rule | Rationale |
|------|-----------|
| **Top items are refined** | Ready for the next sprint |
| **Bottom items are rough** | Just enough detail to prioritize |
| **Regular grooming** | Weekly, not just before planning |
| **Size limit** | Max 2-3 sprints of ready work |
| **Single source of truth** | One backlog per team |

### Priority Ordering

| Priority | Description | SLA |
|----------|-------------|-----|
| **P0 — Critical** | Production broken, data loss | Immediate |
| **P1 — High** | Major feature blocked, security issue | This sprint |
| **P2 — Normal** | Standard feature work | Next 2-3 sprints |
| **P3 — Low** | Nice to have, polish | When capacity allows |

---

## 3. User Stories

### Writing Good Stories

```
As a [user type],
I want to [action],
so that [outcome/value].
```

### INVEST Criteria

| Criterion | Check |
|-----------|-------|
| **Independent** | Can be developed without waiting on other stories |
| **Negotiable** | Implementation details are flexible |
| **Valuable** | Delivers clear value to user or business |
| **Estimable** | Team can estimate the effort |
| **Small** | Completable in one sprint |
| **Testable** | Has clear pass/fail acceptance criteria |

### Acceptance Criteria

```markdown
### Story: User login

**Given** a registered user on the login page
**When** they enter valid credentials and click "Login"
**Then** they are redirected to the dashboard

**Given** a user enters an incorrect password
**When** they click "Login"
**Then** they see an error message "Invalid credentials"
**And** the password field is cleared
```

---

## 4. Sprint Planning

### Planning Process

```
1. Review sprint goal       → What are we trying to achieve?
2. Select stories           → What fits in the sprint?
3. Break into tasks         → How will we build each story?
4. Estimate tasks           → How long will each take?
5. Commit                   → Team agrees to the plan
```

### Estimation

| Method | When to Use |
|--------|-------------|
| **Story points** | Relative sizing, team velocity tracking |
| **T-shirt sizes** | Quick rough estimates (S/M/L/XL) |
| **Time-based** | When story points aren't adopted |
| **Planning poker** | Team consensus on estimates |

### Sprint Capacity

```
Team capacity = Members × Sprint days × Focus factor

Focus factor:
├── New team:    0.5-0.6
├── Mature team: 0.7-0.8
└── Expert team: 0.8-0.9
```

---

## 5. Agile Ceremonies

### Sprint Ceremonies

| Ceremony | Duration | Purpose |
|----------|----------|---------|
| **Planning** | 2-4 hours | Select work, create plan |
| **Daily standup** | 15 minutes | Sync, surface blockers |
| **Review/Demo** | 1-2 hours | Show completed work |
| **Retrospective** | 1-2 hours | Inspect and adapt process |
| **Grooming** | 1 hour/week | Refine upcoming work |

### Standup Format

```
1. What did I complete since last standup?
2. What will I work on next?
3. Any blockers?
```

### Retrospective Format

```
What went well?     → Keep doing
What didn't go well? → Stop or change
What to try?        → Experiment next sprint
```

---

## 6. Definition of Done

### Standard DoD

- [ ] Code complete and reviewed
- [ ] Tests written and passing
- [ ] CI/CD pipeline green
- [ ] Documentation updated
- [ ] Acceptance criteria verified
- [ ] No known bugs introduced
- [ ] Deployed to staging

---

## 7. Metrics

### Key Metrics

| Metric | Purpose | Target |
|--------|---------|--------|
| **Velocity** | Sprint throughput | Stable trend |
| **Cycle time** | Idea to production | Decreasing |
| **Lead time** | Request to delivery | Decreasing |
| **Escaped defects** | Bugs found in production | Zero |
| **Sprint burndown** | Progress tracking | Smooth descent |

---

## 8. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Treat story points as hours | Use for relative sizing only |
| Skip retrospectives | They're the most valuable ceremony |
| Change scope mid-sprint | Protect the sprint commitment |
| Write tasks without acceptance criteria | Every story has clear "done" criteria |
| One-person stories only | Encourage pairing and collaboration |
| Carry over unfinished work silently | Discuss why and adjust estimates |
| Sprint goal = list of stories | Sprint goal = user/business outcome |
| Skip grooming | Unrefined stories cause planning chaos |

---

> **Remember:** Agile is about learning and adapting, not following a process. The ceremonies are tools for continuous improvement — use them intentionally.
