export type TelemetryEventType =
  | "SESSION_STARTED"
  | "MODULE_STARTED"
  | "MISSION_STARTED"
  | "ACTION_ATTEMPTED"
  | "ANSWER_SUBMITTED"
  | "ANSWER_CORRECT"
  | "ANSWER_WRONG"
  | "HINT_REQUESTED"
  | "DEBUG_ATTEMPT"
  | "DEBUG_SUCCESS"
  | "MODULE_COMPLETED"
  | "SESSION_COMPLETED";

export type TelemetryEvent = {
  eventId: string;
  sessionId: string;
  studentId: string;
  moduleId: string;
  stepId?: string;
  eventType: TelemetryEventType;
  payload: Record<string, unknown>;
  timestamp: string;
};

export function createTelemetryEvent(
  params: Omit<TelemetryEvent, "eventId" | "timestamp">,
): TelemetryEvent {
  return {
    ...params,
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
}
