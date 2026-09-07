import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProgressState = {
  mod1Score: number;
  mod2Score: number;
  waterCorrect: boolean;
  reasoning: string;
  hintsUsed: number;
  debuggingAttempts: number;
  assignments: Record<string, string>;
  experimentAnswers: Record<number, string[]>; // expId -> checked features
  setMod1Score: (v: number) => void;
  setMod2: (assignments: Record<string, string>, score: number, waterCorrect: boolean) => void;
  setReasoning: (v: string) => void;
  addHint: () => void;
  addDebuggingAttempt: () => void;
  setExperimentAnswer: (expId: number, features: string[]) => void;
  reset: () => void;
};

const initial = {
  mod1Score: 0,
  mod2Score: 0,
  waterCorrect: false,
  reasoning: "",
  hintsUsed: 0,
  debuggingAttempts: 0,
  assignments: {} as Record<string, string>,
  experimentAnswers: {} as Record<number, string[]>,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...initial,
      setMod1Score: (v) => set({ mod1Score: v }),
      setMod2: (assignments, score, waterCorrect) => set({ assignments, mod2Score: score, waterCorrect }),
      setReasoning: (v) => set({ reasoning: v }),
      addHint: () => set((s) => ({ hintsUsed: Math.min(s.hintsUsed + 1, 3) })),
      addDebuggingAttempt: () => set((s) => ({ debuggingAttempts: s.debuggingAttempts + 1 })),
      setExperimentAnswer: (expId, features) =>
        set((s) => ({ experimentAnswers: { ...s.experimentAnswers, [expId]: features } })),
      reset: () => set(initial),
    }),
    { name: "vect-progress" },
  ),
);
