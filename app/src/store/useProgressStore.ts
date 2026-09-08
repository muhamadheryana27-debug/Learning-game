import { create } from "zustand";
import { persist } from "zustand/middleware";

type ModuleProgress = {
  score: number;
  attempts: number;
  hintsUsed: number;
  reasoning: string;
  introCompleted: boolean;
  completedAt?: string;
};

type ProgressState = {
  modules: Record<string, ModuleProgress>;
  waterCorrect: boolean;
  assignments: Record<string, string>;
  experimentAnswers: Record<number, string[]>;
  setModuleScore: (moduleId: string, score: number) => void;
  setModuleIntroCompleted: (moduleId: string) => void;
  addModuleAttempt: (moduleId: string) => void;
  addModuleHint: (moduleId: string) => void;
  setModuleReasoning: (moduleId: string, text: string) => void;
  setWaterCorrect: (v: boolean) => void;
  setAssignment: (key: string, value: string) => void;
  setAssignments: (assignments: Record<string, string>) => void;
  setExperimentAnswer: (expId: number, features: string[]) => void;
  reset: () => void;
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
};

type ProgressData = {
  modules: Record<string, ModuleProgress>;
  waterCorrect: boolean;
  assignments: Record<string, string>;
  experimentAnswers: Record<number, string[]>;
};

const initial: ProgressData = {
  modules: {},
  waterCorrect: false,
  assignments: {},
  experimentAnswers: {},
};

const getModule = (modules: Record<string, ModuleProgress>, id: string): ModuleProgress =>
  modules[id] ?? { score: 0, attempts: 0, hintsUsed: 0, reasoning: "", introCompleted: false };

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...initial,
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      setModuleScore: (moduleId, score) =>
        set((s) => ({
          modules: {
            ...s.modules,
            [moduleId]: { ...getModule(s.modules, moduleId), score, completedAt: new Date().toISOString() },
          },
        })),

      setModuleIntroCompleted: (moduleId) =>
        set((s) => ({
          modules: {
            ...s.modules,
            [moduleId]: { ...getModule(s.modules, moduleId), introCompleted: true },
          },
        })),

      addModuleAttempt: (moduleId) =>
        set((s) => ({
          modules: {
            ...s.modules,
            [moduleId]: {
              ...getModule(s.modules, moduleId),
              attempts: getModule(s.modules, moduleId).attempts + 1,
            },
          },
        })),

      addModuleHint: (moduleId) =>
        set((s) => ({
          modules: {
            ...s.modules,
            [moduleId]: {
              ...getModule(s.modules, moduleId),
              hintsUsed: Math.min(getModule(s.modules, moduleId).hintsUsed + 1, 3),
            },
          },
        })),

      setModuleReasoning: (moduleId, text) =>
        set((s) => ({
          modules: {
            ...s.modules,
            [moduleId]: { ...getModule(s.modules, moduleId), reasoning: text },
          },
        })),

      setWaterCorrect: (v) => set({ waterCorrect: v }),

      setAssignment: (key, value) =>
        set((s) => ({ assignments: { ...s.assignments, [key]: value } })),

      setAssignments: (assignments) => set({ assignments }),

      setExperimentAnswer: (expId, features) =>
        set((s) => ({ experimentAnswers: { ...s.experimentAnswers, [expId]: features } })),

      reset: () => set(initial),
    }),
    {
      name: "vect-progress",
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          useProgressStore.getState()._setHasHydrated(true);
        }
      },
    },
  ),
);
