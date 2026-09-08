import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSession, type GameSession } from "../types/session";
import { gameApi } from "../services/api";
import { enqueue } from "../engine/sync/syncEngine";

type SessionState = {
  session: GameSession | null;
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  startSession: (studentId: string, firstModuleId: string) => GameSession;
  completeModule: (moduleId: string, score: number) => void;
  setActiveModule: (moduleId: string) => void;
  completeSession: () => Promise<{ ok: boolean }>;
  abandonSession: () => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      session: null,
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      startSession: (studentId, firstModuleId) => {
        const session = createSession(studentId, firstModuleId);
        set({ session });
        gameApi.startSession({
          sessionId: session.sessionId,
          studentId,
          startedAt: session.startedAt,
        }).catch(() => {
          enqueue("start_session", session.sessionId, studentId, { ...session });
        });
        return session;
      },

      completeModule: (moduleId, score) => {
        const { session } = get();
        if (!session) return;
        const now = new Date().toISOString();
        const module = session.modules[moduleId];
        set({
          session: {
            ...session,
            updatedAt: now,
            modules: {
              ...session.modules,
              [moduleId]: {
                ...module,
                score,
                status: "completed" as const,
                completedAt: now,
              },
            },
          },
        });
      },

      setActiveModule: (moduleId) => {
        const { session } = get();
        if (!session) return;
        const now = new Date().toISOString();
        set({
          session: {
            ...session,
            currentModuleId: moduleId,
            updatedAt: now,
            modules: {
              ...session.modules,
              [moduleId]: {
                ...(session.modules[moduleId] ?? {
                  moduleId,
                  status: "in_progress",
                  score: 0,
                  attempts: 0,
                  hintsUsed: 0,
                  startedAt: now,
                }),
                status: "in_progress",
              },
            },
          },
        });
      },

      completeSession: async () => {
        const { session } = get();
        if (!session) return { ok: false };
        const now = new Date().toISOString();
        const totalScore = Object.values(session.modules)
          .reduce((sum, m) => sum + m.score, 0);
        set({
          session: { ...session, completedAt: now, status: "completed", totalScore, updatedAt: now },
        });
        const result = await gameApi.completeSession({
          sessionId: session.sessionId,
          studentId: session.studentId,
          totalScore,
          completedAt: now,
        });
        if (!result.ok) {
          await enqueue("complete_session", session.sessionId, session.studentId, { ...session, completedAt: now, status: "completed", totalScore });
        }
        return result;
      },

      abandonSession: () => {
        const { session } = get();
        if (!session) return;
        set({ session: { ...session, status: "abandoned", updatedAt: new Date().toISOString() } });
      },

      reset: () => set({ session: null }),
    }),
    {
      name: "vect-session",
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          useSessionStore.getState()._setHasHydrated(true);
        }
      },
    },
  ),
);
