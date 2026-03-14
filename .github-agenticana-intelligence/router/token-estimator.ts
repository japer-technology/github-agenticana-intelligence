/**
 * Agenticana — Token Estimator
 * Ported from https://github.com/ashrafmusa/agenticana router/token-estimator.js
 *
 * Pre-flight token estimation before any agent invocation.
 * Prevents context overflow and triggers compression when needed.
 *
 * Estimation approach:
 *  - 1 token ≈ 4 characters (English text)
 *  - Adds overhead for prompt formatting + model instructions
 */

import { readFileSync } from "fs";
import { join } from "path";
import config from "./config.json";

const CHARS_PER_TOKEN = 4;
const PROMPT_OVERHEAD = 800;
const SKILL_OVERHEAD = 200;

export interface TokenEstimate {
  estimated_tokens: number;
  budget: number;
  over_budget: boolean;
  ratio: number;
  strategy: "FULL" | "COMPRESSED" | "MINIMAL";
  breakdown: Record<string, unknown>;
}

/**
 * Estimate token count of a text string
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate size of a skill file in tokens
 */
export function estimateSkillTokens(
  skillName: string,
  agenticanaRoot: string = process.cwd()
): number {
  const skillPath = join(agenticanaRoot, "skills", skillName, "SKILL.md");
  try {
    const content = readFileSync(skillPath, "utf-8");
    return estimateTokens(content) + SKILL_OVERHEAD;
  } catch {
    return 500; // Default estimate if file not found
  }
}

/**
 * Estimate size of an agent context file in tokens
 */
export function estimateAgentTokens(
  agentName: string,
  agenticanaRoot: string = process.cwd()
): number {
  const agentPath = join(agenticanaRoot, "agents", `${agentName}.md`);
  try {
    const content = readFileSync(agentPath, "utf-8");
    return estimateTokens(content);
  } catch {
    return 1000; // Default if not found
  }
}

/**
 * Full pre-flight token estimation for an agent invocation
 */
export function estimateInvocation(params: {
  task: string;
  agentName: string;
  skills?: string[];
  model_tier?: string;
  agenticanaRoot?: string;
}): TokenEstimate {
  const {
    task,
    agentName,
    skills = [],
    model_tier = "pro",
    agenticanaRoot = process.cwd(),
  } = params;

  const breakdown: Record<string, unknown> = {};

  // Task tokens
  breakdown.task = estimateTokens(task);

  // Agent context tokens
  breakdown.agent_context = estimateAgentTokens(agentName, agenticanaRoot);

  // Skills tokens
  const skillsBreakdown: Record<string, number> = {};
  let skillTotal = 0;
  for (const skill of skills) {
    const t = estimateSkillTokens(skill, agenticanaRoot);
    skillsBreakdown[skill] = t;
    skillTotal += t;
  }
  breakdown.skills = skillsBreakdown;
  breakdown.total_skills = skillTotal;

  // System overhead
  breakdown.overhead = PROMPT_OVERHEAD;

  // Total
  const estimated_tokens =
    (breakdown.task as number) +
    (breakdown.agent_context as number) +
    skillTotal +
    PROMPT_OVERHEAD;
  breakdown.total = estimated_tokens;

  // Budget from config
  const thresholds = config.thresholds as Record<
    string,
    { max_complexity: number; max_tokens: number }
  >;
  const budget = thresholds[model_tier]?.max_tokens ?? 80000;
  const over_budget = estimated_tokens > budget;

  // Context strategy selection
  let strategy: TokenEstimate["strategy"];
  const ratio = estimated_tokens / budget;
  if (ratio > 0.9) strategy = "MINIMAL";
  else if (ratio > 0.65) strategy = "COMPRESSED";
  else strategy = "FULL";

  return {
    estimated_tokens,
    budget,
    over_budget,
    ratio: Number(ratio.toFixed(2)),
    strategy,
    breakdown,
  };
}

/**
 * Get skills for a given context strategy and tier
 */
export function filterSkillsByStrategy(
  requestedSkills: string[],
  strategy: string,
  _agenticanaRoot: string = process.cwd()
): string[] {
  const strategies = config.context_strategies as Record<
    string,
    { max_skills: number; load_tier: number; compress: boolean }
  >;
  const strategyConfig = strategies[strategy];
  if (!strategyConfig) return requestedSkills;

  const maxSkills = strategyConfig.max_skills;
  const maxTier = strategyConfig.load_tier;

  const tier1Skills = new Set([
    "clean-code",
    "brainstorming",
    "plan-writing",
    "intelligent-routing",
    "behavioral-modes",
    "parallel-agents",
  ]);
  const tier2Skills = new Set([
    "frontend-design",
    "mobile-design",
    "api-patterns",
    "database-design",
    "testing-patterns",
    "nextjs-react-expert",
    "nodejs-best-practices",
    "architecture",
    "game-development",
    "systematic-debugging",
  ]);

  const filtered = requestedSkills.filter((skill) => {
    if (tier1Skills.has(skill)) return maxTier >= 1;
    if (tier2Skills.has(skill)) return maxTier >= 2;
    return maxTier >= 3; // tier 3
  });

  return filtered.slice(0, maxSkills);
}
