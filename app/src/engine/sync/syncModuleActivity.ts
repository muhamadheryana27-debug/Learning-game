/**
 * Module Activity Sync — wraps sendModuleActivity with offline queue fallback.
 */
import { enqueue } from "./syncEngine";

type ModuleActivityPayload = {
  name: string;
  className: string;
  attendanceNumber: number;
  module: "mod1" | "mod2";
  score: number;
  details: string;
  status: "in_progress" | "completed";
};

const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined;

export async function sendModuleActivity(payload: ModuleActivityPayload): Promise<{ ok: boolean }> {
  const url = WEBHOOK_URL;
  if (!url) return { ok: false };

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        class: payload.className,
        absen: payload.attendanceNumber,
        module: payload.module,
        score: payload.score,
        details: payload.details,
        status: payload.status,
        _type: "module_activity",
      }),
    });
    return { ok: true };
  } catch {
    // Offline — enqueue for retry
    const studentId = `${payload.className}-${String(payload.attendanceNumber).padStart(2, "0")}`;
    await enqueue("module_activity", "", studentId, payload);
    return { ok: false };
  }
}
