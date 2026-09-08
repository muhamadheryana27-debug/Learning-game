export type ApiResult = {
  ok: boolean;
  requestId: string;
  data?: unknown;
  error?: { code: string; message: string };
};

export type HealthResult = {
  ok: boolean;
  requestId: string;
  data: { status: string; timestamp: string };
};

export type RegisterStudentInput = {
  studentId: string;
  name: string;
  className: string;
  attendanceNumber: number;
};

export type StartSessionInput = {
  sessionId: string;
  studentId: string;
  startedAt: string;
};

export type SaveEventInput = {
  sessionId: string;
  studentId: string;
  moduleId: string;
  eventType: string;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type SaveModuleResultInput = {
  sessionId: string;
  studentId: string;
  moduleId: string;
  score: number;
  attempts: number;
  hintsUsed: number;
  timeSpent: number;
  mastery?: number;
  completedAt: string;
};

export type CompleteSessionInput = {
  sessionId: string;
  studentId: string;
  totalScore: number;
  completedAt: string;
};

export type DashboardQuery = {
  className?: string;
  limit?: number;
};

export type DashboardRow = {
  studentId: string;
  name: string;
  className: string;
  attendanceNumber: number;
  sessionId: string;
  startedAt: string;
  completedAt?: string;
  status: string;
  totalScore: number;
  modules: Record<string, { score: number; attempts: number; hintsUsed: number; mastery?: number }>;
};

export interface GameApi {
  health(): Promise<HealthResult>;
  registerStudent(input: RegisterStudentInput): Promise<ApiResult>;
  startSession(input: StartSessionInput): Promise<ApiResult>;
  saveEvent(input: SaveEventInput): Promise<ApiResult>;
  saveModuleResult(input: SaveModuleResultInput): Promise<ApiResult>;
  completeSession(input: CompleteSessionInput): Promise<ApiResult>;
  dashboard(query?: DashboardQuery): Promise<{ ok: boolean; data: DashboardRow[] }>;
}
