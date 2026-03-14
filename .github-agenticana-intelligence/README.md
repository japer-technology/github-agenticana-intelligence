# Agenticana Intelligence

> A multi-agent AI system that lives inside your GitHub repository — 20 specialist agents, complexity-based model routing, and three execution modes.

Agenticana Intelligence is activated by the `~` prefix on issues and comments. It routes prompts to specialist agents through a dispatch system, selects model tiers based on complexity scoring, and supports single-agent, swarm, and simulacrum execution modes — while keeping all session state, file changes, and conversation history in Git.

### https://github.com/ashrafmusa/agenticana using GitHub as Infrastructure

---

## How It Works

1. **Open an issue** (or add a comment) starting with `~`.
2. **GitHub Actions** detects the prefix and runs the Agenticana workflow.
3. **The dispatch system** routes your prompt to the appropriate specialist agent(s) based on issue labels and complexity.
4. **The agent** reads your prompt, uses its skills to process it, and posts the response as a comment.
5. **Everything is committed** — session state, file changes, and conversation history all live in Git.

---

## The Prefix Protocol

| Prefix | Intelligence | Description |
|--------|-------------|-------------|
| `~` | Agenticana Intelligence | Multi-agent, routed specialist tasks |
| _(other)_ | None | No agent responds |

---

## Project Structure

```
.github-agenticana-intelligence/
├── .pi/
│   └── settings.json              # LLM provider, model, thinking level
├── AGENTS.md                      # Agent identity and standing orders
├── README.md
├── VERSION
├── dispatch.yaml                  # Agent routing and execution modes
├── package.json
├── agents/                        # 20 specialist agent definitions
│   ├── orchestrator.{md,yaml}
│   ├── backend-specialist.{md,yaml}
│   ├── frontend-specialist.{md,yaml}
│   ├── security-auditor.{md,yaml}
│   ├── penetration-tester.{md,yaml}
│   ├── database-architect.{md,yaml}
│   ├── devops-engineer.{md,yaml}
│   ├── test-engineer.{md,yaml}
│   ├── qa-automation-engineer.{md,yaml}
│   ├── documentation-writer.{md,yaml}
│   ├── performance-optimizer.{md,yaml}
│   ├── debugger.{md,yaml}
│   ├── code-archaeologist.{md,yaml}
│   ├── product-manager.{md,yaml}
│   ├── product-owner.{md,yaml}
│   ├── project-planner.{md,yaml}
│   ├── explorer-agent.{md,yaml}
│   ├── game-developer.{md,yaml}
│   ├── mobile-developer.{md,yaml}
│   └── seo-specialist.{md,yaml}
├── docs/
│   └── decisions/                 # Architecture Decision Records
├── install/
│   ├── AGENTICANA-AGENTS.md       # Default AGENTS.md for fresh installs
│   └── settings.json              # Default .pi/settings.json
├── lifecycle/
│   └── agent.ts                   # Core orchestrator
├── public-fabric/                 # GitHub Pages content
├── router/
│   └── model-router.ts           # Complexity-based model selection
├── skills/
│   ├── core/                      # Core skills (all agents)
│   ├── domain/                    # 19 domain-specific skills
│   └── utility/                   # 4 utility skills
└── state/
    ├── issues/                    # Issue-to-session mappings
    └── sessions/                  # Conversation transcripts (JSONL)
```

---

## Configuration

Edit `.github-agenticana-intelligence/.pi/settings.json` to change the LLM provider and model:

```json
{
  "defaultProvider": "openai",
  "defaultModel": "gpt-5.4",
  "defaultThinkingLevel": "high"
}
```

### Supported Providers

| Provider | Secret Name | Models |
|----------|------------|--------|
| OpenAI | `OPENAI_API_KEY` | GPT-5.4 (default), GPT-4o, GPT-4o-mini |
| Anthropic | `ANTHROPIC_API_KEY` | Claude Sonnet, Claude Haiku, Claude Opus |
| Google | `GEMINI_API_KEY` | Gemini 2.5 Pro, Gemini 2.0 Flash |
| xAI | `XAI_API_KEY` | Grok 3, Grok 3 Mini |
| OpenRouter | `OPENROUTER_API_KEY` | DeepSeek, and hundreds more |
| Mistral | `MISTRAL_API_KEY` | Mistral Large |
| Groq | `GROQ_API_KEY` | DeepSeek R1 distills |

---

## Dispatch & Routing

Agent routing is configured in `dispatch.yaml`:

```yaml
default_agent: orchestrator
auto_route: true

routes:
  - label: security
    agent: security-auditor
    model_tier: pro
    skills: [core, vulnerability-scanner, red-team-tactics]
  # ... 15 more routes
```

### Execution Modes

| Mode | Description |
|------|-------------|
| **Single** | One specialist agent handles the task |
| **Swarm** | Multiple agents collaborate in parallel |
| **Simulacrum** | Agents debate and converge on a solution |

### Model Tiers

| Tier | Complexity Score | Cost Range |
|------|-----------------|------------|
| Lite | 0–30 | $0.15–$0.25/1M tokens |
| Flash | 31–60 | $0.50–$3.00/1M tokens |
| Pro | 61–85 | $2.50–$15.00/1M tokens |
| Pro-Extended | 86–100 | $5.00–$30.00/1M tokens |

---

## Specialist Agents

| Agent | Domain | Default Tier |
|-------|--------|-------------|
| Orchestrator | Planning, delegation, synthesis | Pro |
| Backend Specialist | APIs, server logic, integration | Flash |
| Frontend Specialist | UI/UX, components, browser dev | Flash |
| Security Auditor | Vulnerability assessment, compliance | Pro |
| Penetration Tester | Offensive testing, attack surface | Pro |
| Database Architect | Schema design, query optimization | Flash |
| DevOps Engineer | CI/CD, infrastructure, deployment | Flash |
| Test Engineer | Test strategy, case design, QA | Flash |
| QA Automation Engineer | Test frameworks, automation | Flash |
| Documentation Writer | Technical writing, API docs | Lite |
| Performance Optimizer | Profiling, bottleneck analysis | Flash |
| Debugger | Root cause analysis, bug resolution | Flash |
| Code Archaeologist | Legacy code, refactoring | Flash |
| Product Manager | Feature prioritization, roadmap | Flash |
| Product Owner | Backlog, user stories, acceptance | Flash |
| Project Planner | Sprint planning, task breakdown | Flash |
| Explorer Agent | Codebase discovery, dependency mapping | Flash |
| Game Developer | Game logic, rendering, physics | Flash |
| Mobile Developer | iOS, Android, cross-platform | Flash |
| SEO Specialist | SEO, metadata, web performance | Lite |

---

## Skills

### Core Skills (loaded for every agent)
- Issue thread reading
- Git operations (stage, commit, push)
- Session management (JSONL format)
- Comment posting

### Domain Skills (19 available)
`nextjs-react-expert` · `backend` · `database` · `vulnerability-scanner` · `red-team-tactics` · `tdd` · `performance` · `systematic-debugging` · `devops` · `documentation` · `product` · `codebase-analysis` · `game-dev` · `seo` · `mobile` · `qa` · `research` · `agile` · `planning`

### Utility Skills (4 available)
- **cost-estimator** — Token usage and cost estimation
- **adr-writer** — Architecture Decision Records
- **attestation** — Cryptographic commit attestations
- **budget-guard** — Model tier budget enforcement

---

## License

[MIT](LICENSE.md) — © 2026 Eric Mourant
