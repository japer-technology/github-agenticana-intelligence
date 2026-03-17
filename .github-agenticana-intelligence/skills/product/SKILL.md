---
name: product
description: Requirements gathering, feature prioritization, PRD writing, user story crafting, and roadmap planning.
allowed-tools: Read, Glob, Grep
---

# Product Management

> Build the right thing before building the thing right. Every feature should tie to a user outcome.

---

## 1. Requirements Gathering

### Discovery Framework

| Step | Action |
|------|--------|
| **Who** | Identify target users and stakeholders |
| **What** | Define the problem being solved |
| **Why** | Articulate the business value |
| **How** | Outline the solution approach |
| **When** | Set timeline and milestones |

### Asking the Right Questions

| Question | Purpose |
|----------|---------|
| "What problem does this solve?" | Validates the need |
| "Who experiences this problem?" | Identifies the user |
| "How are they solving it today?" | Understands current state |
| "What does success look like?" | Defines measurable outcome |
| "What happens if we don't build this?" | Assesses urgency |

---

## 2. Feature Prioritization

### Frameworks

| Framework | Best For |
|-----------|----------|
| **RICE** | Data-driven scoring (Reach, Impact, Confidence, Effort) |
| **MoSCoW** | Quick categorization (Must, Should, Could, Won't) |
| **Kano Model** | Understanding user satisfaction curves |
| **Value vs Effort** | Simple 2x2 matrix |
| **ICE** | Quick scoring (Impact, Confidence, Ease) |

### RICE Scoring

```
RICE Score = (Reach × Impact × Confidence) / Effort

Reach:      Users affected per quarter
Impact:     0.25 (minimal) to 3 (massive)
Confidence: 0.5 (low) to 1.0 (high)
Effort:     Person-weeks
```

### Value vs Effort Matrix

```
         High Value
              │
  Quick Wins  │  Big Bets
  (Do First)  │  (Plan Carefully)
──────────────┼──────────────
  Fill-ins    │  Money Pits
  (Maybe)     │  (Avoid)
              │
         Low Value
  Low Effort ─────── High Effort
```

---

## 3. Product Requirements Document (PRD)

### PRD Structure

```markdown
# PRD: [Feature Name]

## Overview
One paragraph explaining what and why.

## Problem Statement
What user problem does this solve?

## Goals & Success Metrics
- Goal 1: [measurable outcome]
- Goal 2: [measurable outcome]

## User Stories
- As a [user type], I want to [action] so that [outcome]

## Requirements
### Must Have
- [Requirement 1]
- [Requirement 2]

### Nice to Have
- [Requirement 3]

## Design
[Link to mockups / wireframes]

## Technical Considerations
- [Dependencies, constraints, risks]

## Timeline
| Milestone | Date |
|-----------|------|
| Design complete | Week 1 |
| MVP | Week 3 |
| Launch | Week 5 |

## Open Questions
- [Question 1]
- [Question 2]
```

### PRD Principles

| Principle | Application |
|-----------|-------------|
| **Problem-first** | Start with the problem, not the solution |
| **Measurable** | Every goal has a metric |
| **Scoped** | Clear "in scope" and "out of scope" |
| **Living document** | Update as you learn |
| **Accessible** | Anyone can understand it |

---

## 4. User Stories

### Format

```
As a [user type],
I want to [action],
so that [outcome/value].
```

### INVEST Criteria

| Criterion | Meaning |
|-----------|---------|
| **I**ndependent | Can be built and delivered alone |
| **N**egotiable | Details can be discussed |
| **V**aluable | Delivers value to the user |
| **E**stimable | Team can estimate the work |
| **S**mall | Fits in one sprint |
| **T**estable | Clear acceptance criteria |

### Acceptance Criteria Format

```markdown
**Given** [initial context]
**When** [action occurs]
**Then** [expected outcome]
```

---

## 5. Roadmap Planning

### Roadmap Types

| Type | Audience | Time Horizon |
|------|----------|-------------|
| **Strategic** | Leadership | 6-12 months |
| **Release** | Engineering | 1-3 months |
| **Sprint** | Team | 1-2 weeks |

### Now / Next / Later

```
NOW (this sprint)     → Committed, in progress
NEXT (next 2 sprints) → Planned, designed
LATER (future)        → Validated need, not yet planned
```

---

## 6. Stakeholder Communication

### Status Update Format

```markdown
## Weekly Update: [Feature Name]

### Status: 🟢 On Track / 🟡 At Risk / 🔴 Blocked

### Completed This Week
- [Achievement 1]
- [Achievement 2]

### Planned Next Week
- [Task 1]
- [Task 2]

### Risks / Blockers
- [Risk and mitigation]
```

---

## 7. Core Principles

| Principle | Application |
|-----------|-------------|
| **User outcome > Feature** | Focus on what the user achieves |
| **Data over opinions** | Measure, test, validate |
| **Scope ruthlessly** | Say no to protect focus |
| **Ship and learn** | MVP first, iterate from feedback |
| **Document decisions** | ADRs for significant choices |

---

## 8. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Build without validating the problem | Talk to users first |
| Prioritize by loudest voice | Use a scoring framework |
| Write a 30-page PRD | Keep PRDs focused and concise |
| Ship without success metrics | Define how you'll measure success |
| Scope creep mid-sprint | Defer new requests to backlog |
| Assume you know the user | Validate assumptions with evidence |
| Plan 12 months in detail | Detailed near-term, directional long-term |

---

> **Remember:** The most important product skill is saying "no" to good ideas so you can say "yes" to the right ones.
