/**
 * agent.ts — Lifecycle orchestrator for Agenticana Intelligence.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PURPOSE
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the main entry point for the Agenticana Intelligence AI agent system.
 * It receives a GitHub issue (or issue comment) event, dispatches to the
 * appropriate specialist agent(s), runs the `pi` agent against the user's
 * prompt, and posts the result back as an issue comment.  It also manages all
 * session state and the ReasoningBank so that multi-turn conversations across
 * multiple workflow runs are seamlessly resumed.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LIFECYCLE POSITION
 * ─────────────────────────────────────────────────────────────────────────────
 * Workflow step order:
 *   1. Authorize   (inline shell)            — auth check + add 🚀 reaction indicator
 *   2. Install     (bun install)            — install npm/bun dependencies
 *   3. Run         (agent.ts)               ← YOU ARE HERE
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AGENT EXECUTION PIPELINE
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. Fetch issue title/body from GitHub via the `gh` CLI.
 *   2. Strip the `~` prefix from the prompt (routing signal, not user content).
 *   3. Resolve (or create) a conversation session for this issue number.
 *   4. Read dispatch.yaml and issue labels to determine which agent(s) to invoke.
 *   5. Run the `pi` coding agent binary with the prompt (+ prior session if resuming).
 *   6. Extract the assistant's final text reply from the JSONL output.
 *   7. Persist the issue → session mapping and update ReasoningBank if applicable.
 *   8. Stage, commit, and push all changes back to the default branch.
 *   9. Post the extracted reply as a new comment on the originating issue.
 *  10. [finally] Add an outcome reaction: 👍 on success or 👎 on error.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SESSION CONTINUITY
 * ─────────────────────────────────────────────────────────────────────────────
 * Agenticana maintains per-issue session state in:
 *   .github-agenticana-intelligence/state/issues/<number>.json
 *   .github-agenticana-intelligence/state/sessions/<timestamp>.jsonl
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PUSH CONFLICT RESOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * Multiple agents may race to push to the same branch.  The script retries a
 * failed `git push` up to 10 times with increasing backoff delays, pulling
 * with `--rebase -X theirs` between attempts.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GITHUB COMMENT SIZE LIMIT
 * ─────────────────────────────────────────────────────────────────────────────
 * GitHub enforces a ~65 535 character limit on issue comments.  The agent reply
 * is capped at 60 000 characters to leave a comfortable safety margin.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DEPENDENCIES
 * ─────────────────────────────────────────────────────────────────────────────
 * - Node.js built-in `fs` module  (existsSync, readFileSync, writeFileSync, mkdirSync)
 * - Node.js built-in `path` module (resolve)
 * - GitHub CLI (`gh`)             — must be authenticated via GITHUB_TOKEN
 * - `pi` binary                   — installed by `bun install` from package.json
 * - System tools: `tee`, `tac`, `jq`, `git`, `bash`
 * - Bun runtime                   — for Bun.spawn and top-level await
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { route, recordStats, type RouterDecision } from "../router/router";
import { filterSkillsByStrategy } from "../router/token-estimator";
import routerConfig from "../router/config.json";

// ─── Paths and event context ───────────────────────────────────────────────────
// `import.meta.dir` resolves to `.github-agenticana-intelligence/lifecycle/`; stepping up one level
// gives us the `.github-agenticana-intelligence/` directory which contains `state/` and `node_modules/`.
const agenticanaDir = resolve(import.meta.dir, "..");
const stateDir = resolve(agenticanaDir, "state");
const issuesDir = resolve(stateDir, "issues");
const sessionsDir = resolve(stateDir, "sessions");
const piSettingsPath = resolve(agenticanaDir, ".pi", "settings.json");

// The `pi` CLI requires a repo-root-relative path for `--session-dir`, not an
// absolute one, so we keep this as a relative string constant.
const sessionsDirRelative = ".github-agenticana-intelligence/state/sessions";

// GitHub enforces a ~65 535 character limit on issue comments; cap at 60 000
// characters to leave a comfortable safety margin and avoid API rejections.
const MAX_COMMENT_LENGTH = 60000;

// ReasoningBank and ADR truncation limits
const MAX_RB_TASK_LENGTH = 200;
const MAX_RB_OUTCOME_LENGTH = 500;
const MAX_ADR_SECTION_LENGTH = 2000;
const MAX_ADR_PROMPT_LENGTH = 1000;

// ReasoningBank fast-path threshold (upstream agenticana: similarity ≥ 0.85 = fast path)
const RB_FAST_PATH_THRESHOLD = 0.85;
const RB_CONTEXT_THRESHOLD = 0.60;

// Pattern distillation: auto-distill after this many decisions
const DISTILL_THRESHOLD = 15;

// Pattern auto-distillation confidence scoring
const DISTILL_BASE_CONFIDENCE = 0.7;
const DISTILL_CONFIDENCE_INCREMENT = 0.05;
const DISTILL_MAX_CONFIDENCE = 0.98;

// Soul memory scoring weights
const SOUL_SCORE_BASE = 0.5;
const SOUL_SCORE_RESPONSE_BONUS = 0.3;
const SOUL_SCORE_FAST_PATH_BONUS = 0.1;
const SOUL_SCORE_RESPONSE_THRESHOLD = 100;

// Maximum characters shown per soul memory entry in agent prompt
const MAX_MEMORY_PREVIEW_LENGTH = 200;

// Parse the full GitHub Actions event payload (contains issue/comment details).
const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, "utf-8"));

// "issues" for new issues, "issue_comment" for replies on existing issues.
const eventName = process.env.GITHUB_EVENT_NAME!;

// "owner/repo" format — used when calling the GitHub REST API via `gh api`.
const repo = process.env.GITHUB_REPOSITORY!;

// Fall back to "main" if the repository's default branch is not set in the event.
const defaultBranch = event.repository?.default_branch ?? "main";

// The issue number is present on both the `issues` and `issue_comment` payloads.
const issueNumber: number = event.issue.number;

// Read the committed `.pi` defaults and pass them explicitly to the runtime.
const piSettings = JSON.parse(readFileSync(piSettingsPath, "utf-8"));
const configuredProvider: string = piSettings.defaultProvider;
const configuredModel: string = piSettings.defaultModel;
const configuredThinking: string | undefined = piSettings.defaultThinkingLevel;

if (!configuredProvider || !configuredModel) {
  throw new Error(
    `Invalid .pi settings at ${piSettingsPath}: expected defaultProvider and defaultModel`
  );
}

// Catch whitespace-only or obviously malformed model identifiers early so the
// pi agent doesn't start up only to fail with an opaque API error.
if (configuredModel.trim() !== configuredModel || /\s/.test(configuredModel)) {
  throw new Error(
    `Invalid model identifier "${configuredModel}" in ${piSettingsPath}: ` +
    `model IDs must not contain whitespace. ` +
    `Update the "defaultModel" field in .pi/settings.json to a valid model ID for the "${configuredProvider}" provider.`
  );
}

console.log(`Configured provider: ${configuredProvider}, model: ${configuredModel}${configuredThinking ? `, thinking: ${configuredThinking}` : ""}`);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Spawn an arbitrary subprocess, capture its stdout, and return both the
 * trimmed output and the process exit code.
 */
async function run(cmd: string[], opts?: { stdin?: any }): Promise<{ exitCode: number; stdout: string }> {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "inherit",
    stdin: opts?.stdin,
  });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  return { exitCode, stdout: stdout.trim() };
}

/**
 * Convenience wrapper: run `gh <args>` and return trimmed stdout.
 */
async function gh(...args: string[]): Promise<string> {
  const { exitCode, stdout } = await run(["gh", ...args]);
  if (exitCode !== 0) {
    throw new Error(`gh ${args[0]} failed with exit code ${exitCode}`);
  }
  return stdout;
}

// ─── Restore reaction state from Authorize step ─────────────────────
const reactionState = existsSync("/tmp/reaction-state.json")
  ? JSON.parse(readFileSync("/tmp/reaction-state.json", "utf-8"))
  : null;

// ─── ReasoningBank: keyword-similarity search ──────────────────────────────
/**
 * Search the ReasoningBank for past decisions similar to the current task.
 * Uses Jaccard similarity over keywords (words > 3 chars).
 * Returns the highest similarity score found (0–1).
 */
function searchReasoningBank(task: string, agenticanaRoot: string): number {
  const rbPath = resolve(agenticanaRoot, "memory", "reasoning-bank", "decisions.json");
  if (!existsSync(rbPath)) return 0;

  try {
    const rb = JSON.parse(readFileSync(rbPath, "utf-8"));
    const decisions: { task: string; tags?: string[] }[] = rb.decisions ?? [];
    if (decisions.length === 0) return 0;

    const taskWords = new Set(
      task.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    );
    if (taskWords.size === 0) return 0;

    let maxSimilarity = 0;
    for (const d of decisions) {
      const decText = [d.task, ...(d.tags ?? [])].join(" ");
      const decWords = new Set(
        decText.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3)
      );
      const intersection = [...taskWords].filter((w) => decWords.has(w)).length;
      const union = new Set([...taskWords, ...decWords]).size;
      const similarity = union > 0 ? intersection / union : 0;
      if (similarity > maxSimilarity) maxSimilarity = similarity;
    }
    return maxSimilarity;
  } catch {
    return 0;
  }
}

// ─── Model tier resolution ─────────────────────────────────────────────────
/**
 * Resolve a router-recommended tier to an actual model ID for the configured
 * provider.  For lite/flash tiers, downgrades to a cheaper model.  For pro
 * and above, returns the user's configured default model.
 */
function resolveModelForTier(
  tier: string,
  provider: string,
  defaultModel: string
): string {
  if (tier === "pro" || tier === "pro-extended") return defaultModel;
  const providerModels = routerConfig.provider_models as
    Record<string, Record<string, string>> | undefined;
  return providerModels?.[provider]?.[tier] ?? defaultModel;
}

// ─── Skill content loader ──────────────────────────────────────────────────
/**
 * Load SKILL.md files for the given skill names.  Searches multiple possible
 * paths (flat, domain/, utility/).  Returns combined markdown or empty string.
 */
function loadSkillContent(skillNames: string[], agenticanaRoot: string): string {
  const parts: string[] = [];
  for (const skill of skillNames) {
    const candidates = [
      resolve(agenticanaRoot, "skills", skill, "SKILL.md"),
      resolve(agenticanaRoot, "skills", "domain", skill, "SKILL.md"),
      resolve(agenticanaRoot, "skills", "utility", skill, "SKILL.md"),
    ];
    for (const p of candidates) {
      if (existsSync(p)) {
        parts.push(`### Skill: ${skill}\n${readFileSync(p, "utf-8")}`);
        break;
      }
    }
  }
  return parts.join("\n\n");
}

// ─── ReasoningBank decision recording ──────────────────────────────────────
/**
 * Append a new decision to the ReasoningBank for future pattern reuse.
 */
function recordDecisionToBank(
  task: string,
  agent: string,
  outcome: string,
  success: boolean,
  model: string,
  agenticanaRoot: string
): void {
  const rbPath = resolve(agenticanaRoot, "memory", "reasoning-bank", "decisions.json");
  try {
    const defaultRb = {
      version: "2.0",
      description: "Agenticana ReasoningBank",
      last_consolidated: null,
      total_decisions: 0,
      decisions: [],
    };
    const rb = existsSync(rbPath)
      ? JSON.parse(readFileSync(rbPath, "utf-8"))
      : defaultRb;
    const id = `rb-${String((rb.total_decisions ?? 0) + 1).padStart(3, "0")}`;
    rb.decisions.push({
      id,
      timestamp: new Date().toISOString(),
      task: task.slice(0, MAX_RB_TASK_LENGTH),
      task_type: "auto",
      agent,
      decision: outcome.slice(0, MAX_RB_OUTCOME_LENGTH),
      outcome: success ? "Task completed successfully" : "Task failed",
      success,
      tokens_used: null,
      model_used: model,
      embedding: null,
      tags: [],
    });
    rb.total_decisions = rb.decisions.length;
    writeFileSync(rbPath, JSON.stringify(rb, null, 2) + "\n");
  } catch (e) {
    console.error("Failed to record decision to ReasoningBank:", e);
  }
}

// ─── ADR generation for simulacrum debates ─────────────────────────────────
/**
 * Generate an Architecture Decision Record from a simulacrum (multi-agent
 * debate) session.  Writes to docs/decisions/.
 */
function generateADR(
  agentResponses: { agent: string; text: string }[],
  prompt: string,
  agenticanaRoot: string
): void {
  const decisionsDir = resolve(agenticanaRoot, "docs", "decisions");
  mkdirSync(decisionsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = prompt
    .split("\n")[0]
    .slice(0, 60)
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  const filename = `ADR-${timestamp}-${slug || "untitled"}.md`;

  const sections = agentResponses
    .map((r) => `### ${r.agent}\n\n${r.text.slice(0, MAX_ADR_SECTION_LENGTH)}`)
    .join("\n\n---\n\n");

  const adr =
    `# Architecture Decision Record\n\n` +
    `**Date:** ${new Date().toISOString()}\n` +
    `**Status:** Proposed\n` +
    `**Mode:** Simulacrum (multi-agent debate)\n\n` +
    `## Context\n\n${prompt.slice(0, MAX_ADR_PROMPT_LENGTH)}\n\n` +
    `## Agent Perspectives\n\n${sections}\n\n` +
    `## Decision\n\n_Synthesized from ${agentResponses.length} agent perspectives._\n`;

  writeFileSync(resolve(decisionsDir, filename), adr);
  console.log(`ADR generated: ${filename}`);
}

// ─── Agent YAML spec loader ────────────────────────────────────────────────
/**
 * Load and parse the companion .yaml spec for an agent.  Returns token budget,
 * routing hints, and complexity tier — or null when no spec exists.
 */
interface AgentSpec {
  name: string;
  model_tier?: string;
  complexity_tier?: string;
  token_budget?: { context_max?: number; output_max?: number; skill_slots?: number };
  routing_hints?: { trigger_keywords?: string[]; auto_invoke?: boolean };
  learning?: { enabled?: boolean; pattern_threshold?: number };
}

function loadAgentSpec(agentName: string, agenticanaRoot: string): AgentSpec | null {
  const yamlPath = resolve(agenticanaRoot, "agents", `${agentName}.yaml`);
  if (!existsSync(yamlPath)) return null;

  try {
    const content = readFileSync(yamlPath, "utf-8");
    const spec: Record<string, unknown> = {};
    let currentSection: string | null = null;
    let sectionObj: Record<string, unknown> = {};

    for (const line of content.split("\n")) {
      const trimmed = line.trimEnd();
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Top-level key: value (no leading whitespace)
      if (!trimmed.startsWith(" ") && !trimmed.startsWith("\t")) {
        if (currentSection) { spec[currentSection] = sectionObj; }
        const colonIdx = trimmed.indexOf(":");
        if (colonIdx > 0) {
          const key = trimmed.slice(0, colonIdx).trim();
          const val = trimmed.slice(colonIdx + 1).trim();
          if (val) {
            spec[key] = parseYamlValue(val);
            currentSection = null;
          } else {
            currentSection = key;
            sectionObj = {};
          }
        }
        continue;
      }

      // Nested key: value
      if (currentSection) {
        const propMatch = trimmed.match(/^\s+([\w_-]+):\s*(.+)$/);
        if (propMatch) {
          sectionObj[propMatch[1]] = parseYamlValue(propMatch[2]);
        }
      }
    }
    if (currentSection) { spec[currentSection] = sectionObj; }

    return {
      name: (spec.name as string) ?? agentName,
      model_tier: spec.model_tier as string | undefined,
      complexity_tier: spec.complexity_tier as string | undefined,
      token_budget: spec.token_budget as AgentSpec["token_budget"],
      routing_hints: spec.routing_hints as AgentSpec["routing_hints"],
      learning: spec.learning as AgentSpec["learning"],
    };
  } catch {
    return null;
  }
}

// ─── Trajectory recording ──────────────────────────────────────────────────
/**
 * Record a full run trajectory: input, agents invoked, model used, duration,
 * outcome.  Stored as individual JSON files in memory/trajectories/.
 */
interface Trajectory {
  id: string;
  timestamp: string;
  issue_number: number;
  prompt_length: number;
  agents: string[];
  mode: string;
  model_used: string;
  tier: string;
  strategy: string;
  rb_similarity: number;
  fast_path: boolean;
  skills_loaded: string[];
  duration_ms: number;
  success: boolean;
  response_length: number;
}

function recordTrajectory(
  trajectory: Trajectory,
  agenticanaRoot: string
): void {
  const trajDir = resolve(agenticanaRoot, "memory", "trajectories");
  mkdirSync(trajDir, { recursive: true });
  const filename = `traj-${trajectory.timestamp.replace(/[:.]/g, "-")}.json`;
  try {
    writeFileSync(
      resolve(trajDir, filename),
      JSON.stringify(trajectory, null, 2) + "\n"
    );
    console.log(`Trajectory recorded: ${filename}`);
  } catch (e) {
    console.error("Failed to record trajectory:", e);
  }
}

// ─── Soul Memory: cross-session key-value store ────────────────────────────
/**
 * Read all soul memory entries from memory/memory.json.
 */
interface SoulMemoryEntry {
  key: string;
  value: string;
  tags: string[];
  score: number;
  created_at: string;
  updated_at: string;
  access_count: number;
}

function readSoulMemory(agenticanaRoot: string): SoulMemoryEntry[] {
  const memPath = resolve(agenticanaRoot, "memory", "memory.json");
  if (!existsSync(memPath)) return [];
  try {
    const data = JSON.parse(readFileSync(memPath, "utf-8"));
    return data.entries ?? [];
  } catch {
    return [];
  }
}

/**
 * Write a new entry to soul memory (or update existing by key).
 */
function writeSoulMemory(
  key: string,
  value: string,
  tags: string[],
  score: number,
  agenticanaRoot: string
): void {
  const memPath = resolve(agenticanaRoot, "memory", "memory.json");
  try {
    const data = existsSync(memPath)
      ? JSON.parse(readFileSync(memPath, "utf-8"))
      : { version: "2.0", entries: [] };
    const entries: SoulMemoryEntry[] = data.entries ?? [];
    const now = new Date().toISOString();
    const existing = entries.findIndex((e) => e.key === key);
    if (existing >= 0) {
      entries[existing].value = value;
      entries[existing].tags = tags;
      entries[existing].score = score;
      entries[existing].updated_at = now;
      entries[existing].access_count = (entries[existing].access_count ?? 0) + 1;
    } else {
      entries.push({
        key,
        value,
        tags,
        score,
        created_at: now,
        updated_at: now,
        access_count: 0,
      });
    }
    data.entries = entries;
    writeFileSync(memPath, JSON.stringify(data, null, 2) + "\n");
  } catch (e) {
    console.error("Failed to write soul memory:", e);
  }
}

// ─── Pattern auto-distillation ─────────────────────────────────────────────
/**
 * When the ReasoningBank exceeds DISTILL_THRESHOLD decisions, auto-distill
 * recurring patterns by grouping decisions by overlapping tags and extracting
 * common approaches.
 */
function autoDistillPatterns(agenticanaRoot: string): void {
  const rbPath = resolve(agenticanaRoot, "memory", "reasoning-bank", "decisions.json");
  const patPath = resolve(agenticanaRoot, "memory", "reasoning-bank", "patterns.json");
  if (!existsSync(rbPath)) return;

  try {
    const rb = JSON.parse(readFileSync(rbPath, "utf-8"));
    const decisions: { id: string; task: string; agent: string; decision: string; success: boolean; tags: string[] }[] =
      rb.decisions ?? [];

    if (decisions.length < DISTILL_THRESHOLD) return;

    const patterns = existsSync(patPath)
      ? JSON.parse(readFileSync(patPath, "utf-8"))
      : { version: "2.0", description: "Distilled patterns from ReasoningBank decisions", last_distilled: null, total_patterns: 0, patterns: [] };

    // Group successful decisions by primary tag
    const tagGroups: Record<string, typeof decisions> = {};
    for (const d of decisions) {
      if (!d.success || !d.tags?.length) continue;
      for (const tag of d.tags) {
        (tagGroups[tag] ??= []).push(d);
      }
    }

    // Extract new patterns from groups with ≥ 3 decisions not already covered
    const existingPatternTags = new Set(
      (patterns.patterns ?? []).flatMap((p: { tags?: string[] }) => p.tags ?? [])
    );
    let newPatterns = 0;

    for (const [tag, group] of Object.entries(tagGroups)) {
      if (group.length < 3 || existingPatternTags.has(tag)) continue;

      const patternId = `pat-${String((patterns.total_patterns ?? 0) + newPatterns + 1).padStart(3, "0")}`;
      patterns.patterns.push({
        id: patternId,
        name: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Pattern`,
        description: `Auto-distilled pattern from ${group.length} ${tag}-related decisions`,
        frequency: group.length,
        confidence: Math.min(DISTILL_BASE_CONFIDENCE + group.length * DISTILL_CONFIDENCE_INCREMENT, DISTILL_MAX_CONFIDENCE),
        source_decisions: group.map((d) => d.id),
        template: {
          approach: group[0].decision,
          key_decisions: group.slice(0, 3).map((d) => d.decision),
        },
        tags: [tag],
      });
      newPatterns++;
    }

    if (newPatterns > 0) {
      patterns.total_patterns = (patterns.total_patterns ?? 0) + newPatterns;
      patterns.last_distilled = new Date().toISOString();
      writeFileSync(patPath, JSON.stringify(patterns, null, 2) + "\n");
      console.log(`Auto-distilled ${newPatterns} new pattern(s)`);
    }
  } catch (e) {
    console.error("Pattern auto-distillation failed (non-fatal):", e);
  }
}

// ─── Dispatch routing types ─────────────────────────────────────────────────
interface DispatchRoute {
  label: string;
  agent?: string;
  agents?: string[];
  mode?: string;
  model_tier?: string;
  skills?: string[];
}

interface DispatchConfig {
  default_agent: string;
  auto_route: boolean;
  routes: DispatchRoute[];
}

/**
 * Parse the dispatch.yaml configuration file.
 *
 * This is a purpose-built parser for the dispatch.yaml format rather than a
 * general-purpose YAML parser.  It handles the specific structures used:
 * top-level scalar key-value pairs and an array of route objects with scalar
 * and inline-array values.
 */
function parseDispatchYaml(content: string): DispatchConfig {
  const lines = content.split("\n");
  const config: Record<string, unknown> = {};
  const routes: DispatchRoute[] = [];
  let currentRoute: Record<string, unknown> | null = null;
  let inRoutes = false;

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Top-level key: value
    if (!trimmed.startsWith(" ") && !trimmed.startsWith("-")) {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0) {
        const key = trimmed.slice(0, colonIdx).trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        if (key === "routes") {
          inRoutes = true;
        } else {
          config[key] = val === "true" ? true : val === "false" ? false : val;
        }
      }
      continue;
    }

    if (!inRoutes) continue;

    // New route entry: "  - label: value"
    const dashMatch = trimmed.match(/^\s+-\s+([\w-]+):\s*(.*)$/);
    if (dashMatch) {
      if (currentRoute) routes.push(currentRoute as unknown as DispatchRoute);
      currentRoute = {};
      const key = dashMatch[1];
      const val = dashMatch[2];
      currentRoute[key] = parseYamlValue(val);
      continue;
    }

    // Route property: "    key: value"
    const propMatch = trimmed.match(/^\s+([\w-]+):\s*(.*)$/);
    if (propMatch && currentRoute) {
      const key = propMatch[1];
      const val = propMatch[2];
      currentRoute[key] = parseYamlValue(val);
    }
  }
  if (currentRoute) routes.push(currentRoute as unknown as DispatchRoute);

  return {
    default_agent: (config.default_agent as string) ?? "orchestrator",
    auto_route: (config.auto_route as boolean) ?? true,
    routes,
  };
}

/** Parse a YAML inline value — handles booleans, numbers, inline arrays, and strings. */
function parseYamlValue(val: string): string | boolean | number | string[] {
  if (val === "true") return true;
  if (val === "false") return false;
  // Inline array: [a, b, c] or []
  const arrMatch = val.match(/^\[(.*)\]$/);
  if (arrMatch) {
    const inner = arrMatch[1].trim();
    if (!inner) return [];
    return inner.split(",").map((s) => s.trim());
  }
  // Numeric values
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  return val;
}

/**
 * Resolve which agent(s) to invoke based on issue labels and dispatch config.
 * Returns the matched route (if any), the list of agents to invoke, the
 * execution mode, and the skills.
 */
function resolveDispatch(
  dispatchConfig: DispatchConfig,
  issueLabels: string[]
): {
  matchedRoute: DispatchRoute | null;
  agents: string[];
  mode: "single" | "swarm" | "simulacrum";
  skills: string[];
} {
  const labelsLower = issueLabels.map((l) => l.toLowerCase());
  const matchedRoute =
    dispatchConfig.routes.find((r) => labelsLower.includes(r.label.toLowerCase())) ?? null;

  if (!matchedRoute) {
    return {
      matchedRoute: null,
      agents: [dispatchConfig.default_agent],
      mode: "single",
      skills: [],
    };
  }

  const mode =
    matchedRoute.mode === "swarm"
      ? "swarm" as const
      : matchedRoute.mode === "simulacrum"
        ? "simulacrum" as const
        : "single" as const;

  const agents =
    matchedRoute.agents && matchedRoute.agents.length > 0
      ? matchedRoute.agents
      : [matchedRoute.agent ?? dispatchConfig.default_agent];

  return { matchedRoute, agents, mode, skills: matchedRoute.skills ?? [] };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {

// Track whether the agent completed successfully so the `finally` block can
// add the correct outcome reaction (👍 on success, 👎 on error).
let succeeded = false;

try {
  // ── Read issue title and body from the event payload ──────────────────────────
  // Use the webhook payload directly to avoid two `gh` API round-trips (~2–4 s).
  // GitHub truncates string fields at 65 536 characters in webhook payloads, so
  // we fall back to the API only when the body hits that limit.
  const title = event.issue.title;
  let body: string = event.issue.body ?? "";
  if (body.length >= 65536) {
    body = await gh("issue", "view", String(issueNumber), "--json", "body", "--jq", ".body");
  }

  // ── Strip the ~ prefix (routing signal, not part of the user's question) ────
  let prompt: string;
  if (eventName === "issue_comment") {
    prompt = event.comment.body.replace(/^~\s*/, "");
  } else {
    prompt = `${title.replace(/^~\s*/, "")}\n\n${body}`;
  }

  // ── Resolve or create session mapping ───────────────────────────────────────
  mkdirSync(issuesDir, { recursive: true });
  mkdirSync(sessionsDir, { recursive: true });

  let mode = "new";
  let sessionPath = "";
  const mappingFile = resolve(issuesDir, `${issueNumber}.json`);

  if (existsSync(mappingFile)) {
    const mapping = JSON.parse(readFileSync(mappingFile, "utf-8"));
    if (existsSync(mapping.sessionPath)) {
      mode = "resume";
      sessionPath = mapping.sessionPath;
      console.log(`Found existing session: ${sessionPath}`);
    } else {
      console.log("Mapped session file missing, starting fresh");
    }
  } else {
    console.log("No session mapping found, starting fresh");
  }

  // ── Configure git identity ───────────────────────────────────────────────────
  await run(["git", "config", "user.name", "github-agenticana-intelligence[bot]"]);
  await run(["git", "config", "user.email", "github-agenticana-intelligence[bot]@users.noreply.github.com"]);

  // ── Validate provider API key ────────────────────────────────────────────────
  const providerKeyMap: Record<string, string> = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    google: "GEMINI_API_KEY",
    xai: "XAI_API_KEY",
    openrouter: "OPENROUTER_API_KEY",
    mistral: "MISTRAL_API_KEY",
    groq: "GROQ_API_KEY",
  };
  const requiredKeyName = providerKeyMap[configuredProvider];
  if (requiredKeyName && !process.env[requiredKeyName]) {
    await gh(
      "issue", "comment", String(issueNumber),
      "--body",
      `## ⚠️ Missing API Key: \`${requiredKeyName}\`\n\n` +
      `The configured provider is \`${configuredProvider}\`, but the \`${requiredKeyName}\` secret is not available to this workflow run.\n\n` +
      `### How to fix\n\n` +
      `**Option A — Repository secret** _(simplest)_\n` +
      `1. Go to **Settings → Secrets and variables → Actions → New repository secret**\n` +
      `2. Name: \`${requiredKeyName}\`, Value: your API key\n\n` +
      `**Option B — Organization secret** _(already have one?)_\n` +
      `Organization secrets are only available to workflows if the secret has been explicitly granted to this repository:\n` +
      `1. Go to your **Organization Settings → Secrets and variables → Actions**\n` +
      `2. Click the \`${requiredKeyName}\` secret → **Repository access**\n` +
      `3. Add **this repository** to the selected repositories list\n\n` +
      `Once the secret is accessible, re-trigger this workflow by posting a new comment on this issue.`
    );
    throw new Error(
      `${requiredKeyName} is not available to this workflow run. ` +
      `If you have set it as a repository secret, verify the secret name matches exactly. ` +
      `If you have set it as an organization secret, ensure this repository has been granted access ` +
      `(Organization Settings → Secrets and variables → Actions → ${requiredKeyName} → Repository access).`
    );
  }

  // ── Dispatch: resolve agent(s) from labels + dispatch.yaml ─────────────────
  const dispatchPath = resolve(agenticanaDir, "dispatch.yaml");
  const dispatchConfig = existsSync(dispatchPath)
    ? parseDispatchYaml(readFileSync(dispatchPath, "utf-8"))
    : { default_agent: "orchestrator", auto_route: true, routes: [] };

  const issueLabels: string[] = (event.issue.labels ?? []).map((l: { name: string }) => l.name);
  const { matchedRoute, agents: dispatchedAgents, mode: dispatchMode, skills: routeSkills } =
    resolveDispatch(dispatchConfig, issueLabels);

  console.log(
    matchedRoute
      ? `Dispatch: label "${matchedRoute.label}" → ${dispatchMode} [${dispatchedAgents.join(", ")}]`
      : `Dispatch: no label match → default agent "${dispatchedAgents[0]}"`
  );

  // ── Invoke all agent(s) in a single pipeline ──────────────────────────────
  // Single mode: one agent, one invocation.
  // Swarm mode: each agent runs independently on the same prompt; responses are combined.
  // Simulacrum mode: agents run sequentially, each seeing prior agents' responses to
  //                  enable structured debate; responses are combined into a single comment.
  const piBin = resolve(agenticanaDir, "node_modules", ".bin", "pi");
  const agentResponses: { agent: string; text: string }[] = [];
  let simulacrumContext = "";
  let lastModelUsed = configuredModel;
  let lastTier = "pro";
  let lastStrategy = "FULL";
  let lastRbSimilarity = 0;
  let fastPathUsed = false;
  let effectiveSkills: string[] = routeSkills;
  const runStartTime = Date.now();

  // ── Load soul memory for cross-session context ────────────────────────────
  const soulEntries = readSoulMemory(agenticanaDir);
  if (soulEntries.length > 0) {
    console.log(`Soul memory: ${soulEntries.length} entries loaded`);
  }

  // jq filter to extract the final assistant text from JSONL output
  const jqAssistantFilter =
    '[ .[] | select(.type == "message_end" and .message.role == "assistant") | select((.message.content // []) | map(select(.type == "text")) | length > 0) ] | .[0].message.content[] | select(.type == "text") | .text';

  for (const currentAgent of dispatchedAgents) {
    console.log(`\n── Invoking agent: ${currentAgent} (${dispatchMode}) ──`);

    // Load agent identity (.md)
    const identityPath = resolve(agenticanaDir, "agents", `${currentAgent}.md`);
    let identity = "";
    if (existsSync(identityPath)) {
      identity = readFileSync(identityPath, "utf-8");
      console.log(`  Loaded identity: ${identityPath} (${identity.length} chars)`);
    }

    // Load agent YAML spec for token budget and routing hints
    const agentSpec = loadAgentSpec(currentAgent, agenticanaDir);
    if (agentSpec) {
      console.log(
        `  Agent spec: tier=${agentSpec.model_tier ?? "default"}, ` +
        `complexity=${agentSpec.complexity_tier ?? "unset"}` +
        (agentSpec.token_budget?.context_max ? `, budget=${agentSpec.token_budget.context_max}` : "")
      );
    }

    // Route: complexity-aware model selection (ReasoningBank + tier resolution)
    let modelToUse = configuredModel;
    if (dispatchConfig.auto_route) {
      try {
        const rbSimilarity = searchReasoningBank(prompt, agenticanaDir);
        lastRbSimilarity = rbSimilarity;

        // ReasoningBank fast-path: similarity ≥ 0.85 means we've seen this before
        if (rbSimilarity >= RB_FAST_PATH_THRESHOLD) {
          console.log(`  ReasoningBank: similarity=${rbSimilarity.toFixed(2)} → 🚀 FAST PATH (pattern reuse)`);
          fastPathUsed = true;
        } else if (rbSimilarity >= RB_CONTEXT_THRESHOLD) {
          console.log(`  ReasoningBank: similarity=${rbSimilarity.toFixed(2)} → 💡 CONTEXT (reference available)`);
        } else if (rbSimilarity > 0) {
          console.log(`  ReasoningBank: similarity=${rbSimilarity.toFixed(2)} → ✅ NEW (proceed normally)`);
        }

        const decision = route({
          task: prompt,
          agentName: currentAgent,
          skills: routeSkills,
          rb_similarity: rbSimilarity,
          agenticanaRoot: agenticanaDir,
        });
        recordStats(decision);
        lastTier = decision.tier;
        lastStrategy = decision.strategy;

        // Strategy-aware skill filtering: trim skills based on router recommendation
        effectiveSkills = filterSkillsByStrategy(routeSkills, decision.strategy, agenticanaDir);
        if (effectiveSkills.length !== routeSkills.length) {
          console.log(
            `  Skills filtered: ${routeSkills.length} → ${effectiveSkills.length} (strategy=${decision.strategy})`
          );
        }

        modelToUse = resolveModelForTier(
          decision.tier,
          configuredProvider,
          configuredModel
        );
        lastModelUsed = modelToUse;
        console.log(
          `  Router: complexity=${decision.complexity_score}, tier=${decision.tier}, ` +
          `model=${modelToUse}, strategy=${decision.strategy}, ` +
          `tokens=${decision.estimated_tokens}/${decision.token_budget}` +
          (decision.handshake_suggestion?.recommended ? " [handshake recommended]" : "")
        );
      } catch (e) {
        console.error("  Router scoring failed (non-fatal):", e);
      }
    }

    // Build the prompt for this agent
    let agentPrompt = prompt;
    if (identity) {
      agentPrompt = `[You are the "${currentAgent}" specialist agent. Follow your identity and guidelines below.]\n\n${identity}\n\n---\n\n${prompt}`;
    }
    // In simulacrum mode, append prior agents' responses so each agent
    // can build on / respond to earlier perspectives.
    if (dispatchMode === "simulacrum" && simulacrumContext) {
      agentPrompt += `\n\n---\n\n**Prior agent perspectives (for your reference in this collaborative discussion):**\n\n${simulacrumContext}`;
    }

    // Inject skill content using strategy-filtered skills
    const skillContent = loadSkillContent(effectiveSkills, agenticanaDir);
    if (skillContent) {
      agentPrompt += `\n\n---\n\n**Loaded skills:**\n\n${skillContent}`;
    }

    // Inject relevant soul memory as cross-session context
    if (soulEntries.length > 0) {
      const topMemories = soulEntries
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((e) => `- **${e.key}**: ${e.value.slice(0, MAX_MEMORY_PREVIEW_LENGTH)}`)
        .join("\n");
      agentPrompt += `\n\n---\n\n**Cross-session memory:**\n\n${topMemories}`;
    }

    // In fast-path mode, hint to the agent that similar tasks have been solved before
    if (fastPathUsed) {
      agentPrompt += `\n\n---\n\n**Note:** A highly similar task has been solved before (ReasoningBank similarity ≥ ${RB_FAST_PATH_THRESHOLD}). Consider reusing proven patterns and keeping the response concise.`;
    }

    // Run the pi agent
    const outputFile = `/tmp/agent-raw-${currentAgent}.jsonl`;
    const piArgs = [
      piBin,
      "--mode", "json",
      "--provider", configuredProvider,
      "--model", modelToUse,
      ...(configuredThinking ? ["--thinking", configuredThinking] : []),
      "--session-dir", sessionsDirRelative,
      "-p", agentPrompt,
    ];
    if (mode === "resume" && sessionPath) {
      piArgs.push("--session", sessionPath);
    }

    const piProc = Bun.spawn(piArgs, { stdout: "pipe", stderr: "inherit" });
    const teeProc = Bun.spawn(["tee", outputFile], { stdin: piProc.stdout, stdout: "inherit" });
    await teeProc.exited;

    const piExitCode = await piProc.exited;
    if (piExitCode !== 0) {
      console.error(`  pi agent (${currentAgent}) exited with code ${piExitCode}`);
      agentResponses.push({ agent: currentAgent, text: `⚠️ Agent "${currentAgent}" failed (exit code ${piExitCode}).` });
      continue;
    }

    // Extract final assistant text
    const tac = Bun.spawn(["tac", outputFile], { stdout: "pipe" });
    const jq = Bun.spawn(
      ["jq", "-r", "-s", jqAssistantFilter],
      { stdin: tac.stdout, stdout: "pipe" }
    );
    const text = (await new Response(jq.stdout).text()).trim();
    await jq.exited;

    agentResponses.push({ agent: currentAgent, text });
    console.log(`  Response: ${text.length} chars`);

    // In simulacrum mode, accumulate context for the next agent
    if (dispatchMode === "simulacrum") {
      simulacrumContext += `### ${currentAgent}\n${text}\n\n`;
    }
  }

  // ── Combine agent responses into a single reply ───────────────────────────
  let agentText: string;
  if (dispatchedAgents.length === 1) {
    agentText = agentResponses[0]?.text ?? "";
  } else {
    // Multi-agent: format each agent's contribution with a header
    const modeLabel = dispatchMode === "swarm" ? "Swarm" : "Simulacrum";
    const sections = agentResponses.map(
      (r) => `## 🤖 ${r.agent}\n\n${r.text}`
    );
    agentText = `_${modeLabel} response from ${dispatchedAgents.length} agents:_\n\n${sections.join("\n\n---\n\n")}`;
  }

  // Generate ADR for simulacrum debates
  if (dispatchMode === "simulacrum" && agentResponses.length > 1) {
    generateADR(agentResponses, prompt, agenticanaDir);
  }

  // Copy final output to standard location for downstream tools
  const lastAgent = dispatchedAgents[dispatchedAgents.length - 1];
  writeFileSync("/tmp/agent-raw.jsonl", "");
  const lastOutputFile = `/tmp/agent-raw-${lastAgent}.jsonl`;
  if (existsSync(lastOutputFile)) {
    const lastOutput = readFileSync(lastOutputFile);
    writeFileSync("/tmp/agent-raw.jsonl", lastOutput);
  }

  // ── Determine latest session file ────────────────────────────────────────────
  const { stdout: latestSession } = await run([
    "bash", "-c", `ls -t ${sessionsDirRelative}/*.jsonl 2>/dev/null | head -1`,
  ]);

  // ── Persist issue → session mapping ─────────────────────────────────────────
  if (latestSession) {
    writeFileSync(
      mappingFile,
      JSON.stringify({
        issueNumber,
        sessionPath: latestSession,
        updatedAt: new Date().toISOString(),
      }, null, 2) + "\n"
    );
    console.log(`Saved mapping: issue #${issueNumber} -> ${latestSession}`);
  } else {
    console.log("Warning: no session file found to map");
  }

  // ── Commit and push state changes ───────────────────────────────────────────
  const addResult = await run(["git", "add", "-A"]);
  if (addResult.exitCode !== 0) {
    console.error("git add failed with exit code", addResult.exitCode);
  }
  const { exitCode } = await run(["git", "diff", "--cached", "--quiet"]);
  if (exitCode !== 0) {
    const commitResult = await run(["git", "commit", "-m", `agenticana-intelligence: work on issue #${issueNumber}`]);
    if (commitResult.exitCode !== 0) {
      console.error("git commit failed with exit code", commitResult.exitCode);
    }
  }

  // Retry push up to 10 times with increasing backoff delays.
  const pushBackoffs = [1000, 2000, 3000, 5000, 7000, 8000, 10000, 12000, 12000];
  let pushSucceeded = false;
  for (let i = 1; i <= 10; i++) {
    const push = await run(["git", "push", "origin", `HEAD:${defaultBranch}`]);
    if (push.exitCode === 0) { pushSucceeded = true; break; }
    if (i < 10) {
      console.log(`Push failed, rebasing and retrying (${i}/10)...`);
      await run(["git", "pull", "--rebase", "-X", "theirs", "origin", defaultBranch]);
      await new Promise(r => setTimeout(r, pushBackoffs[i - 1]));
    }
  }

  // ── Post reply as issue comment ──────────────────────────────────────────────
  const trimmedText = agentText.trim();
  let commentBody = trimmedText.length > 0
    ? trimmedText.slice(0, MAX_COMMENT_LENGTH)
    : `✅ The agent ran successfully but did not produce a text response. Check the repository for any file changes that were made.\n\nFor full details, see the [workflow run logs](https://github.com/${repo}/actions).`;
  if (!pushSucceeded) {
    commentBody += `\n\n---\n⚠️ **Warning:** The agent's session state could not be pushed to the repository. Conversation context may not be preserved for follow-up comments. See the [workflow run logs](https://github.com/${repo}/actions) for details.`;
  }

  // Post the comment first — user always gets a response even if push failed.
  await gh("issue", "comment", String(issueNumber), "--body", commentBody);

  // Then fail the step so the workflow shows the real status.
  if (!pushSucceeded) {
    throw new Error(
      "All 10 push attempts failed. Auto-reconciliation could not be completed. " +
      "Session state was not persisted to remote. Check the workflow logs for details."
    );
  }

  succeeded = true;

  // Record successful decision to ReasoningBank for future pattern reuse
  recordDecisionToBank(
    prompt,
    dispatchedAgents.join(", "),
    agentText.slice(0, MAX_RB_OUTCOME_LENGTH),
    true,
    lastModelUsed,
    agenticanaDir
  );

  // ── Record trajectory for full run audit trail ────────────────────────────
  const runDuration = Date.now() - runStartTime;
  recordTrajectory(
    {
      id: `traj-${issueNumber}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      issue_number: issueNumber,
      prompt_length: prompt.length,
      agents: dispatchedAgents,
      mode: dispatchMode,
      model_used: lastModelUsed,
      tier: lastTier,
      strategy: lastStrategy,
      rb_similarity: lastRbSimilarity,
      fast_path: fastPathUsed,
      skills_loaded: effectiveSkills,
      duration_ms: runDuration,
      success: true,
      response_length: agentText.length,
    },
    agenticanaDir
  );

  // ── Update soul memory with run summary ───────────────────────────────────
  writeSoulMemory(
    `issue-${issueNumber}`,
    `Issue #${issueNumber}: ${dispatchMode} with ${dispatchedAgents.join(", ")} (${lastTier}/${lastStrategy}). ` +
    `Duration: ${(runDuration / 1000).toFixed(1)}s. ` +
    `Response: ${agentText.length} chars.` +
    (fastPathUsed ? " Fast-path used." : ""),
    [dispatchMode, lastTier, ...dispatchedAgents],
    Math.min(
      SOUL_SCORE_BASE +
      (agentText.length > SOUL_SCORE_RESPONSE_THRESHOLD ? SOUL_SCORE_RESPONSE_BONUS : 0) +
      (fastPathUsed ? SOUL_SCORE_FAST_PATH_BONUS : 0),
      1.0
    ),
    agenticanaDir
  );

  // ── Auto-distill patterns if ReasoningBank has enough decisions ────────────
  autoDistillPatterns(agenticanaDir);

} finally {
  // ── Guaranteed outcome reaction: 👍 on success, 👎 on error ─────────────────
  if (reactionState) {
    try {
      const { reactionTarget, commentId: stateCommentId } = reactionState;
      const outcomeContent = succeeded ? "+1" : "-1";
      if (reactionTarget === "comment" && stateCommentId) {
        await gh("api", `repos/${repo}/issues/comments/${stateCommentId}/reactions`, "-f", `content=${outcomeContent}`);
      } else {
        await gh("api", `repos/${repo}/issues/${issueNumber}/reactions`, "-f", `content=${outcomeContent}`);
      }
    } catch (e) {
      console.error("Failed to add outcome reaction:", e);
    }
  }
}

} // end main

main();
