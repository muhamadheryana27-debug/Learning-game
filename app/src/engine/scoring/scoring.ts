/**
 * Scoring Engine — Phase 16
 * 5-component scoring: Accuracy, Reasoning, Experimentation, Debugging, Independence.
 * Final score 0–100.
 */
import { scoreModule2 } from "../rules/fertilizerEngine";

// ── Component Weights ──────────────────────────────────────────────────
const WEIGHTS = {
  accuracy: 0.40,
  reasoning: 0.25,
  experimentation: 0.15,
  debugging: 0.10,
  independence: 0.10,
} as const;

export type ScoreComponents = {
  accuracy: number;      // 0–100: correctness of answers
  reasoning: number;     // 0–100: quality of explanation
  experimentation: number; // 0–100: systematic exploration
  debugging: number;     // 0–100: ability to find and fix errors
  independence: number;  // 0–100: solved without hints/help
};

export type ScoreResult = {
  components: ScoreComponents;
  finalScore: number;
  breakdown: Record<keyof ScoreComponents, { score: number; weight: number; contribution: number }>;
};

// ── Component Calculators ──────────────────────────────────────────────

/**
 * Accuracy: How correct are the final answers?
 * Module 1: based on customers served correctly
 * Module 2: based on glass assignments
 */
export function computeAccuracy(params: {
  mod1CustomersCorrect?: number;
  mod1TotalCustomers?: number;
  mod2Score?: number;
}): number {
  const { mod1CustomersCorrect = 0, mod1TotalCustomers = 5, mod2Score = 0 } = params;
  const mod1Accuracy = mod1TotalCustomers > 0 ? (mod1CustomersCorrect / mod1TotalCustomers) * 100 : 0;
  return Math.round(mod1Accuracy * 0.4 + mod2Score * 0.6);
}

/**
 * Reasoning: Quality of written explanation.
 * Based on reasoning text length and correctness of key concepts.
 */
export function computeReasoning(params: {
  reasoningText: string;
  hasCorrectPattern?: boolean;
}): number {
  const { reasoningText, hasCorrectPattern = false } = params;
  let score = 0;

  // Length component (0-40): longer = more thoughtful (up to 100 chars)
  const len = Math.min(reasoningText.length, 150);
  score += (len / 150) * 40;

  // Pattern correctness (0-40): mentions key concepts
  if (hasCorrectPattern) score += 40;

  // Structure (0-20): has logical connectors
  const connectors = ["karena", "jadi", "maka", "sehingga", "jika", "karena itu", "hal ini"];
  const hasConnectors = connectors.some((c) => reasoningText.toLowerCase().includes(c));
  if (hasConnectors) score += 20;

  return Math.min(100, Math.round(score));
}

/**
 * Experimentation: How systematically did the student explore?
 * Based on number of experiments tried and variety of approaches.
 */
export function computeExperimentation(params: {
  experimentsAttempted: number;
  totalExperiments: number;
  mixtureAnalyses: number;
}): number {
  const { experimentsAttempted, totalExperiments, mixtureAnalyses } = params;
  const expCoverage = totalExperiments > 0 ? (experimentsAttempted / totalExperiments) * 60 : 0;
  const exploration = Math.min(40, mixtureAnalyses * 10);
  return Math.min(100, Math.round(expCoverage + exploration));
}

/**
 * Debugging: Ability to identify and fix errors.
 * Based on debugging attempts and success rate.
 */
export function computeDebugging(params: {
  debuggingAttempts: number;
  debuggingSuccesses: number;
  hintsUsed: number;
}): number {
  const { debuggingAttempts, debuggingSuccesses, hintsUsed } = params;
  let score = 50; // base

  if (debuggingAttempts > 0) {
    const successRate = debuggingSuccesses / debuggingAttempts;
    score += successRate * 30;
  }

  // Penalty for excessive hints (hints indicate struggling)
  score -= hintsUsed * 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Independence: Solved without hints or external help.
 * Based on hints used and whether student asked for help.
 */
export function computeIndependence(params: {
  hintsUsed: number;
  maxHints: number;
  debuggingAttempts: number;
}): number {
  const { hintsUsed, maxHints = 6, debuggingAttempts } = params;
  const hintPenalty = (hintsUsed / maxHints) * 60;
  const debugPenalty = Math.min(debuggingAttempts * 5, 20);
  return Math.max(0, Math.min(100, Math.round(100 - hintPenalty - debugPenalty)));
}

// ── Final Score ────────────────────────────────────────────────────────

export function computeScoreResult(params: {
  mod1CustomersCorrect?: number;
  mod1TotalCustomers?: number;
  mod2Assignments: Record<string, string>;
  reasoningText: string;
  experimentsAttempted: number;
  totalExperiments: number;
  mixtureAnalyses: number;
  debuggingAttempts: number;
  debuggingSuccesses: number;
  hintsUsed: number;
}): ScoreResult {
  const mod2Score = scoreModule2(params.mod2Assignments);

  const components: ScoreComponents = {
    accuracy: computeAccuracy({
      mod1CustomersCorrect: params.mod1CustomersCorrect,
      mod1TotalCustomers: params.mod1TotalCustomers,
      mod2Score,
    }),
    reasoning: computeReasoning({
      reasoningText: params.reasoningText,
      hasCorrectPattern: mod2Score >= 80,
    }),
    experimentation: computeExperimentation({
      experimentsAttempted: params.experimentsAttempted,
      totalExperiments: params.totalExperiments,
      mixtureAnalyses: params.mixtureAnalyses,
    }),
    debugging: computeDebugging({
      debuggingAttempts: params.debuggingAttempts,
      debuggingSuccesses: params.debuggingSuccesses,
      hintsUsed: params.hintsUsed,
    }),
    independence: computeIndependence({
      hintsUsed: params.hintsUsed,
      maxHints: 6,
      debuggingAttempts: params.debuggingAttempts,
    }),
  };

  const breakdown = {} as Record<keyof ScoreComponents, { score: number; weight: number; contribution: number }>;
  let finalScore = 0;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const k = key as keyof ScoreComponents;
    const contribution = Math.round(components[k] * weight);
    breakdown[k] = { score: components[k], weight, contribution };
    finalScore += contribution;
  }

  return {
    components,
    finalScore: Math.max(0, Math.min(100, finalScore)),
    breakdown,
  };
}

// ── Legacy compatibility ───────────────────────────────────────────────
export function computeFinalScore(mod1: number, mod2: number, hintsUsed: number): number {
  const base = Math.round(mod1 * 0.4 + mod2 * 0.6);
  const penalty = Math.min(hintsUsed * 10, 30);
  return Math.max(0, Math.min(100, base - penalty));
}

export function computeCTSkills(params: {
  mod1Score: number;
  mod2Assignments: Record<string, string>;
  hintsUsed: number;
  debuggingAttempts: number;
  reflectionCorrect: number;
  experimentChecklistCorrect: number;
}) {
  const { mod1Score, mod2Assignments, hintsUsed, debuggingAttempts, reflectionCorrect, experimentChecklistCorrect } = params;
  const mod2Score = scoreModule2(mod2Assignments);

  return {
    patternRecognition: Math.min(100, experimentChecklistCorrect * 20 + (mod2Score === 100 && hintsUsed === 0 ? 40 : mod2Score === 100 ? 20 : 0)),
    algorithmicThinking: mod1Score,
    debugging: Math.max(0, Math.min(100, 100 - hintsUsed * 20 + Math.min(debuggingAttempts * 5, 20))),
    abstraction: Math.round((reflectionCorrect / 3) * 100),
    decomposition: reflectionCorrect >= 1 ? 80 : 40,
    mod2Score,
  };
}
