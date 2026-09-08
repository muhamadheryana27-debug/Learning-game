/**
 * Telemetry Service — Phase 15
 * Sends learning events to backend via sync engine.
 */
import { enqueue } from "../sync/syncEngine";
import { createTelemetryEvent, type TelemetryEventType } from "../../types/telemetry";

type TelemetryContext = {
  sessionId: string;
  studentId: string;
  moduleId: string;
};

let context: TelemetryContext | null = null;

export function initTelemetry(ctx: TelemetryContext): void {
  context = ctx;
}

export function clearTelemetry(): void {
  context = null;
}

export function trackEvent(
  eventType: TelemetryEventType,
  payload: Record<string, unknown> = {},
  stepId?: string,
): void {
  if (!context) return;

  const event = createTelemetryEvent({
    sessionId: context.sessionId,
    studentId: context.studentId,
    moduleId: context.moduleId,
    stepId,
    eventType,
    payload,
  });

  // Fire and forget — don't block game
  enqueue("save_event", context.sessionId, context.studentId, event).catch(() => {
    // Silently fail — telemetry should never block gameplay
  });
}

// ── Convenience trackers ───────────────────────────────────────────────

export function trackSessionStarted(): void {
  trackEvent("SESSION_STARTED", { startedAt: new Date().toISOString() });
}

export function trackModuleStarted(moduleId: string): void {
  if (!context) return;
  context.moduleId = moduleId;
  trackEvent("MODULE_STARTED", { moduleId });
}

export function trackMissionStarted(missionId: string): void {
  trackEvent("MISSION_STARTED", { missionId });
}

export function trackActionAttempted(action: string, details: Record<string, unknown> = {}): void {
  trackEvent("ACTION_ATTEMPTED", { action, ...details });
}

export function trackAnswerSubmitted(answer: unknown, correct: boolean): void {
  trackEvent(correct ? "ANSWER_CORRECT" : "ANSWER_WRONG", { answer, correct });
}

export function trackHintRequested(level: number, hint: string): void {
  trackEvent("HINT_REQUESTED", { level, hint });
}

export function trackDebugAttempt(attempt: number, correct: boolean): void {
  trackEvent(correct ? "DEBUG_SUCCESS" : "DEBUG_ATTEMPT", { attempt, correct });
}

export function trackModuleCompleted(moduleId: string, score: number): void {
  trackEvent("MODULE_COMPLETED", { moduleId, score });
}

export function trackSessionCompleted(totalScore: number): void {
  trackEvent("SESSION_COMPLETED", { totalScore });
}
