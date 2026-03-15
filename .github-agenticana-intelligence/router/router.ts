/**
 * Agenticana — Model Router
 * Ported from https://github.com/ashrafmusa/agenticana router/router.js
 *
 * Main routing engine. Combines complexity score + token estimation
 * to produce a routing decision: { model, strategy, skills, estimatedTokens }
 *
 * Usage:
 *   import { route } from "./router";
 *   const decision = route({ task, agentName, skills, agenticanaRoot });
 *   console.log(decision);
 *   // { model: "gemini-2.0-flash", tier: "flash", strategy: "COMPRESSED", ... }
 */

import { scoreComplexity } from "./complexity-scorer";
import { estimateInvocation, filterSkillsByStrategy } from "./token-estimator";
import config from "./config.json";

export interface RouterDecision {
  model: string;
  tier: string;
  strategy: string;
  skills: string[];
  skills_dropped: string[];
  estimated_tokens: number;
  token_budget: number;
  complexity_score: number;
  complexity_breakdown: Record<string, unknown>;
  reasoning_bank_similarity: number;
  handshake_suggestion: {
    recommended: boolean;
    steps: string[];
  } | null;
  token_savings_estimate: string;
  timestamp: string;
}

/**
 * Route a task to the optimal model and context strategy
 */
export function route(params: {
  task: string;
  agentName: string;
  skills?: string[];
  rb_similarity?: number;
  agenticanaRoot?: string;
}): RouterDecision {
  const {
    task,
    agentName,
    skills = [],
    rb_similarity = 0,
    agenticanaRoot = process.cwd(),
  } = params;

  // ── Step 1: Score complexity ──────────────────────────────────────────────
  const {
    score,
    model_tier,
    breakdown: complexityBreakdown,
  } = scoreComplexity(task, {
    reasoning_bank_similarity: rb_similarity,
  });

  // ── Step 2: Estimate tokens with full skill list ──────────────────────────
  const fullEstimate = estimateInvocation({
    task,
    agentName,
    skills,
    model_tier,
    agenticanaRoot,
  });

  // ── Step 3: Upgrade tier if token estimate exceeds budget ─────────────────
  let finalTier = model_tier;
  if (fullEstimate.over_budget) {
    if (score >= 6) {
      finalTier = upgradeTier(model_tier);
    }
  }

  // ── Step 4: Filter skills to strategy ────────────────────────────────────
  const filteredSkills = filterSkillsByStrategy(
    skills,
    fullEstimate.strategy,
    agenticanaRoot
  );

  // ── Step 5: Re-estimate with filtered skills ──────────────────────────────
  const finalEstimate = estimateInvocation({
    task,
    agentName,
    skills: filteredSkills,
    model_tier: finalTier,
    agenticanaRoot,
  });

  // ── Step 6: Compose decision ──────────────────────────────────────────────
  const models = config.models as Record<string, string>;
  const modelName = models[finalTier] ?? models.pro;

  // Step 6.1: Handshake Suggestion (Efficiency Upgrade)
  const suggestsHandshake =
    score >= 5 || finalEstimate.estimated_tokens > 20000;
  const handshake = suggestsHandshake
    ? {
        recommended: true,
        steps: [
          "1. Phase 1: SCOUT (flash-lite) - Perform file discovery & search",
          "2. Phase 2: TRIM (local) - Use context trimmer to shrink file context",
          "3. Phase 3: BUILD (pro) - Implementation with high accuracy/low cost",
        ],
      }
    : null;

  const decision: RouterDecision = {
    model: modelName,
    tier: finalTier,
    strategy: finalEstimate.strategy,
    skills: filteredSkills,
    skills_dropped: skills.filter((s) => !filteredSkills.includes(s)),
    estimated_tokens: finalEstimate.estimated_tokens,
    token_budget: finalEstimate.budget,
    complexity_score: score,
    complexity_breakdown: complexityBreakdown,
    reasoning_bank_similarity: rb_similarity,
    handshake_suggestion: handshake,
    token_savings_estimate:
      skills.length > filteredSkills.length
        ? `~${Math.round((1 - filteredSkills.length / skills.length) * 100)}% from skill filtering`
        : "none",
    timestamp: new Date().toISOString(),
  };

  return decision;
}

/**
 * Upgrade a model tier by one level
 */
function upgradeTier(
  tier: string
): "lite" | "flash" | "pro" | "pro-extended" {
  const tiers = ["lite", "flash", "pro", "pro-extended"] as const;
  const idx = tiers.indexOf(tier as (typeof tiers)[number]);
  if (idx < 0) return tier as "lite" | "flash" | "pro" | "pro-extended";
  return tiers[Math.min(idx + 1, tiers.length - 1)];
}

/**
 * In-memory stats tracking (resets on restart)
 */
const _stats = {
  total_calls: 0,
  total_tokens_estimated: 0,
  tokens_saved: 0,
  by_tier: {} as Record<string, number>,
};

export function recordStats(decision: RouterDecision): void {
  _stats.total_calls++;
  _stats.total_tokens_estimated += decision.estimated_tokens;
  _stats.by_tier[decision.tier] =
    (_stats.by_tier[decision.tier] || 0) + 1;
}

export function getStats(): typeof _stats & { session_start: string } {
  return { ..._stats, session_start: new Date().toISOString() };
}
