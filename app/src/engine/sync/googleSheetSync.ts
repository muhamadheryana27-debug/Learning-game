/**
 * Google Apps Script Sync — CORS-safe via `mode: 'no-cors'`
 * Payload spec:
 * {
 *   name, class, absen,
 *   mod1_score, mod2_score, water_correct, final_score,
 *   pattern_recognition, algorithmic_thinking, debugging_skill, abstraction, decomposition,
 *   hints_used, debugging_attempts, reasoning, status
 * }
 * ENV: VITE_GOOGLE_APPS_SCRIPT_URL
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type GoogleReportPayload = {
  name: string;
  class: string; // VIII-A to VIII-H
  absen: number;
  mod1_score: number;
  mod2_score: number;
  water_correct: boolean;
  final_score: number;
  // CT Skills
  pattern_recognition: number;
  algorithmic_thinking: number;
  debugging_skill: number;
  abstraction: number;
  decomposition: number;
  // Activity
  hints_used: number;
  debugging_attempts: number;
  reasoning: string;
  status: "completed";
};

export type StudentProfileInput = {
  name: string;
  className: string;
  attendanceNumber: number;
  reasoningText: string;
};

export type ScoresInput = {
  mod1: number;
  mod2: number;
  water_correct: boolean;
  final_score: number;
  hints_used: number;
  debugging_attempts: number;
  pattern_recognition: number;
  algorithmic_thinking: number;
  debugging_skill: number;
  abstraction: number;
  decomposition: number;
};

// ---------------------------------------------------------------------------
// Constants / Storage keys (as per spec)
// ---------------------------------------------------------------------------
const PENDING_KEY = "pending_google_reports";
const REPORT_SENT_KEY = "report_sent";
const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined;

// ---------------------------------------------------------------------------
// Payload builder
// ---------------------------------------------------------------------------
export function buildGoogleReportPayload(
  studentProfile: StudentProfileInput,
  scores: ScoresInput,
): GoogleReportPayload {
  return {
    name: studentProfile.name,
    class: studentProfile.className,
    absen: studentProfile.attendanceNumber,
    mod1_score: scores.mod1,
    mod2_score: scores.mod2,
    water_correct: scores.water_correct,
    final_score: scores.final_score,
    pattern_recognition: scores.pattern_recognition,
    algorithmic_thinking: scores.algorithmic_thinking,
    debugging_skill: scores.debugging_skill,
    abstraction: scores.abstraction,
    decomposition: scores.decomposition,
    hints_used: scores.hints_used,
    debugging_attempts: scores.debugging_attempts,
    reasoning: studentProfile.reasoningText,
    status: "completed",
  };
}

// ---------------------------------------------------------------------------
// Core fetch — CORS safe (Google Apps Script requires no-cors)
// ---------------------------------------------------------------------------
export async function sendToGoogleSheet(payload: GoogleReportPayload): Promise<void> {
  const url = WEBHOOK_URL;
  if (!url) {
    throw new Error("VITE_GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi");
  }
  // no-cors => opaque response, no readable body/status, but request reaches GAS
  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Offline queue helpers (localStorage — spec: pending_google_reports)
// ---------------------------------------------------------------------------
export function getPendingReports(): GoogleReportPayload[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GoogleReportPayload[]) : [];
  } catch {
    return [];
  }
}

export function enqueuePendingReport(payload: GoogleReportPayload): void {
  const queue = getPendingReports();
  queue.push(payload);
  localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
}

export function clearPendingReports(): void {
  localStorage.removeItem(PENDING_KEY);
}

export function removePendingReportAt(index: number): void {
  const queue = getPendingReports();
  queue.splice(index, 1);
  if (queue.length === 0) clearPendingReports();
  else localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
}

// ---------------------------------------------------------------------------
// Report sent flag
// ---------------------------------------------------------------------------
export function isReportSent(): boolean {
  return localStorage.getItem(REPORT_SENT_KEY) === "true";
}

export function markReportSent(): void {
  localStorage.setItem(REPORT_SENT_KEY, "true");
}

// ---------------------------------------------------------------------------
// High-level: submit with offline fallback
// Returns { queued: boolean } — queued true means stored offline
// ---------------------------------------------------------------------------
export async function submitReport(payload: GoogleReportPayload): Promise<{ queued: boolean }> {
  // Spec step 5: if offline, save to localStorage under pending_google_reports
  if (!navigator.onLine) {
    enqueuePendingReport(payload);
    return { queued: true };
  }
  try {
    await sendToGoogleSheet(payload);
    markReportSent();
    return { queued: false };
  } catch {
    // Network failure → queue for retry
    enqueuePendingReport(payload);
    return { queued: true };
  }
}

// ---------------------------------------------------------------------------
// Per-module activity tracking
// ---------------------------------------------------------------------------
export type ModuleActivityPayload = {
  name: string;
  className: string;
  attendanceNumber: number;
  module: "mod1" | "mod2";
  score: number;
  details: string;
  status: "in_progress" | "completed";
};

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
    return { ok: false };
  }
}

// ---------------------------------------------------------------------------
// Auto-sync pending reports when internet returns
// Call `initGoogleSheetAutoSync()` once at app startup (e.g. Result mount or App)
// ---------------------------------------------------------------------------
let autoSyncInitialized = false;

export async function syncPendingReports(): Promise<number> {
  if (!navigator.onLine) return 0;
  const pending = getPendingReports();
  if (pending.length === 0) return 0;
  if (!WEBHOOK_URL) return 0;

  let synced = 0;
  // iterate copy; remove on success to avoid index shifts
  for (let i = pending.length - 1; i >= 0; i--) {
    try {
      await sendToGoogleSheet(pending[i]);
      pending.splice(i, 1);
      synced++;
    } catch {
      // stop on first failure (still offline)
      break;
    }
  }
  if (pending.length === 0) clearPendingReports();
  else localStorage.setItem(PENDING_KEY, JSON.stringify(pending));

  if (synced > 0) markReportSent();
  return synced;
}

export function initGoogleSheetAutoSync(onSynced?: (count: number) => void): () => void {
  if (autoSyncInitialized) return () => {};
  autoSyncInitialized = true;

  const handler = async () => {
    const count = await syncPendingReports();
    if (count > 0) onSynced?.(count);
  };

  window.addEventListener("online", handler);
  // Optionally try once on init if already online and has pending
  if (navigator.onLine && getPendingReports().length > 0) {
    void handler();
  }

  return () => {
    window.removeEventListener("online", handler);
    autoSyncInitialized = false;
  };
}

// Allow tests / HMR to reset singleton
export function _resetAutoSyncForTests() {
  autoSyncInitialized = false;
}
