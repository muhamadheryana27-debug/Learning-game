import { scoreModule2 } from "../rules/fertilizerEngine";
import { scorePipeline } from "../rules/doughEngine";

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
  reflectionCorrect: number; // 0-3
  experimentChecklistCorrect: number; // 0-3
}) {
  const { mod1Score, mod2Assignments, hintsUsed, debuggingAttempts, reflectionCorrect, experimentChecklistCorrect } = params;
  const mod2Score = scoreModule2(mod2Assignments);

  const patternRecognition = Math.min(
    100,
    experimentChecklistCorrect * 20 + (mod2Score === 100 && hintsUsed === 0 ? 40 : mod2Score === 100 ? 20 : 0),
  );
  const algorithmicThinking = mod1Score;
  const debugging = Math.max(0, Math.min(100, 100 - hintsUsed * 20 + Math.min(debuggingAttempts * 5, 20)));
  const abstraction = Math.round((reflectionCorrect / 3) * 100);
  const decomposition = reflectionCorrect >= 1 ? 80 : 40; // Q1 proxy

  return {
    patternRecognition,
    algorithmicThinking,
    debugging,
    abstraction,
    decomposition,
    mod2Score,
    pipelineScore: scorePipeline,
  };
}
