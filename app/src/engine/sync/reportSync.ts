/**
 * Google Report Sync — uses unified sync engine.
 * Replaces the old localStorage-based approach.
 */
import { enqueue, type SyncJob } from "./syncEngine";
import { buildGoogleReportPayload, type GoogleReportPayload } from "./googleSheetSync";

const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined;

const REPORT_SENT_KEY = "report_sent";

// ── Report sent flag ───────────────────────────────────────────────────
export function isReportSent(): boolean {
  return localStorage.getItem(REPORT_SENT_KEY) === "true";
}

export function markReportSent(): void {
  localStorage.setItem(REPORT_SENT_KEY, "true");
}

// ── Submit with offline fallback ───────────────────────────────────────
export async function submitReport(payload: GoogleReportPayload): Promise<{ queued: boolean }> {
  if (!navigator.onLine || !WEBHOOK_URL) {
    const studentId = `${payload.class}-${String(payload.absen).padStart(2, "0")}`;
    await enqueue("google_report", "", studentId, payload);
    return { queued: true };
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    markReportSent();
    return { queued: false };
  } catch {
    const studentId = `${payload.class}-${String(payload.absen).padStart(2, "0")}`;
    await enqueue("google_report", "", studentId, payload);
    return { queued: true };
  }
}

// ── Flush handler for sync engine ──────────────────────────────────────
async function reportFlushHandler(job: SyncJob): Promise<boolean> {
  if (!WEBHOOK_URL) return false;
  const payload = job.payload as GoogleReportPayload;
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    markReportSent();
    return true;
  } catch {
    return false;
  }
}

export { reportFlushHandler as flushHandler };

// Re-export for convenience
export { buildGoogleReportPayload };
export type { GoogleReportPayload };
