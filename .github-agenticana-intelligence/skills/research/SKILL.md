---
name: research
description: Information discovery, technology exploration, synthesis, and evidence-based technology assessment.
allowed-tools: Read, Glob, Grep, Bash
---

# Research & Exploration

> Discover, evaluate, synthesize. Turn raw information into actionable knowledge.

---

## 1. Research Methodology

### Process

```
1. DEFINE    — What question are we answering?
2. DISCOVER  — Gather sources and evidence
3. EVALUATE  — Assess quality and relevance
4. SYNTHESIZE — Combine into coherent answer
5. PRESENT   — Communicate findings clearly
```

### Framing the Question

| Good Question | Bad Question |
|---------------|-------------|
| "What are the trade-offs between Prisma and Drizzle for our use case?" | "What ORM should we use?" |
| "How does Next.js App Router handle streaming SSR?" | "Tell me about Next.js" |
| "What vulnerabilities exist in npm packages with >1M weekly downloads?" | "Is npm safe?" |

---

## 2. Information Discovery

### Source Hierarchy

| Priority | Source | Reliability |
|----------|--------|-------------|
| 1 | **Official documentation** | High |
| 2 | **Source code** | High (ground truth) |
| 3 | **RFCs, specs, standards** | High |
| 4 | **Peer-reviewed articles** | High |
| 5 | **Maintainer blog posts** | Medium-High |
| 6 | **Community tutorials** | Medium |
| 7 | **Stack Overflow answers** | Medium (verify) |
| 8 | **AI-generated content** | Low (always verify) |

### Codebase Research Techniques

| Technique | Usage |
|-----------|-------|
| **grep for patterns** | Find usage of a specific API or pattern |
| **git log with path** | History of specific files or modules |
| **git blame** | Understand why code was written this way |
| **Read tests** | Tests document intended behavior |
| **Check issues/PRs** | Context for decisions and known problems |

---

## 3. Technology Assessment

### Evaluation Framework

| Criterion | Questions to Ask |
|-----------|-----------------|
| **Maturity** | How old? Active maintenance? Major version? |
| **Community** | GitHub stars, contributors, npm downloads? |
| **Documentation** | Comprehensive? Up to date? Examples? |
| **Performance** | Benchmarks? Suitable for our scale? |
| **Security** | Known vulnerabilities? Security track record? |
| **Compatibility** | Works with our stack? Migration path? |
| **License** | Compatible with our project? |
| **Bus factor** | How many active maintainers? |

### Comparison Template

```markdown
## Comparison: [Option A] vs [Option B]

| Criterion | Option A | Option B |
|-----------|----------|----------|
| Maturity | | |
| Performance | | |
| DX | | |
| Community | | |
| Our use case fit | | |

### Recommendation
[Which option and why, with trade-offs acknowledged]
```

---

## 4. Evidence-Based Analysis

### Levels of Evidence

| Level | Type | Strength |
|-------|------|----------|
| **1** | Reproducible benchmark/test | Strongest |
| **2** | Official documentation | Strong |
| **3** | Multiple independent sources agree | Moderate |
| **4** | Single expert opinion | Weak |
| **5** | Anecdote / hearsay | Weakest |

### Avoiding Bias

| Bias | Mitigation |
|------|-----------|
| **Confirmation bias** | Actively search for counter-evidence |
| **Recency bias** | Consider established solutions, not just new ones |
| **Popularity bias** | Stars ≠ quality; evaluate on criteria |
| **Authority bias** | Even experts can be wrong; verify claims |
| **Survivorship bias** | Consider failures, not just success stories |

---

## 5. Synthesis Techniques

### Structuring Findings

| Technique | When to Use |
|-----------|-------------|
| **Summary table** | Comparing options side by side |
| **Decision matrix** | Weighted criteria scoring |
| **Pros/cons list** | Simple trade-off analysis |
| **Timeline** | Understanding evolution or sequence |
| **Architecture diagram** | Visualizing system relationships |

### Writing Research Summaries

```markdown
## Research: [Topic]

### Question
What specific question were we investigating?

### Key Findings
1. [Finding with source]
2. [Finding with source]
3. [Finding with source]

### Implications
What does this mean for our project?

### Recommendation
What action should we take?

### Sources
- [Source 1]
- [Source 2]
```

---

## 6. Exploration Patterns

### Exploring a New Codebase

1. Read the README and entry points
2. Trace a simple feature end-to-end
3. Read the test suite for expected behavior
4. Check git log for recent changes and patterns
5. Map the dependency graph

### Exploring a New Technology

1. Read the "Getting Started" guide
2. Build the simplest possible example
3. Read the architecture/design docs
4. Check the issue tracker for common problems
5. Find real-world usage examples

---

## 7. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Start with a conclusion and find supporting evidence | Start with a question and follow the evidence |
| Trust a single source | Cross-reference multiple sources |
| Ignore counter-evidence | Actively seek disconfirming evidence |
| Present opinions as facts | Cite sources and note confidence level |
| Research indefinitely | Time-box research, decide with available info |
| Skip the "why" | Understand reasoning, not just conclusions |
| Assume the latest is the best | Evaluate on your specific criteria |

---

> **Remember:** Good research answers the question "why should we believe this?" Every claim should have a source. Every recommendation should have evidence.
