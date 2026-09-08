export type ModuleProgress = {
  moduleId: string;
  status: "locked" | "available" | "in_progress" | "completed";
  score: number;
  attempts: number;
  hintsUsed: number;
  startedAt?: string;
  completedAt?: string;
  mastery?: number;
};

export type GameSession = {
  sessionId: string;
  studentId: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  currentModuleId: string;
  status: "active" | "completed" | "abandoned";
  totalScore: number;
  modules: Record<string, ModuleProgress>;
};

export function createSession(studentId: string, firstModuleId: string): GameSession {
  const now = new Date().toISOString();
  return {
    sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    studentId,
    startedAt: now,
    updatedAt: now,
    currentModuleId: firstModuleId,
    status: "active",
    totalScore: 0,
    modules: {
      [firstModuleId]: {
        moduleId: firstModuleId,
        status: "in_progress",
        score: 0,
        attempts: 0,
        hintsUsed: 0,
        startedAt: now,
      },
    },
  };
}
