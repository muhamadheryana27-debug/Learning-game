import type {
  GameApi,
  ApiResult,
  HealthResult,
  RegisterStudentInput,
  StartSessionInput,
  SaveEventInput,
  SaveModuleResultInput,
  CompleteSessionInput,
  DashboardQuery,
  DashboardRow,
} from "./gameApi";

const GAS_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined;
const TIMEOUT_MS = 10_000;

function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function gasFetch(action: string, payload: Record<string, unknown>): Promise<ApiResult> {
  const requestId = generateRequestId();
  if (!GAS_URL) {
    return { ok: false, requestId, error: { code: "NO_URL", message: "VITE_GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi" } };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, requestId, ...payload }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    // no-cors returns opaque response — we can't read body
    // treat as success if no exception thrown
    void res;
    return { ok: true, requestId };
  } catch (err) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, requestId, error: { code: "NETWORK_ERROR", message } };
  }
}

export const gasApi: GameApi = {
  async health(): Promise<HealthResult> {
    const requestId = generateRequestId();
    if (!GAS_URL) {
      return { ok: false, requestId, data: { status: "no_url", timestamp: "" } };
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      await fetch(`${GAS_URL}?action=health`, { signal: controller.signal });
      clearTimeout(timer);
      return { ok: true, requestId, data: { status: "ok", timestamp: new Date().toISOString() } };
    } catch {
      return { ok: false, requestId, data: { status: "unreachable", timestamp: "" } };
    }
  },

  async registerStudent(input: RegisterStudentInput): Promise<ApiResult> {
    return gasFetch("registerStudent", { student: input });
  },

  async startSession(input: StartSessionInput): Promise<ApiResult> {
    return gasFetch("startSession", { session: input });
  },

  async saveEvent(input: SaveEventInput): Promise<ApiResult> {
    return gasFetch("saveEvent", { event: input });
  },

  async saveModuleResult(input: SaveModuleResultInput): Promise<ApiResult> {
    return gasFetch("saveModuleResult", { result: input });
  },

  async completeSession(input: CompleteSessionInput): Promise<ApiResult> {
    return gasFetch("completeSession", { session: input });
  },

  async dashboard(query?: DashboardQuery): Promise<{ ok: boolean; data: DashboardRow[] }> {
    const requestId = generateRequestId();
    if (!GAS_URL) {
      return { ok: false, data: [] };
    }
    try {
      const params = new URLSearchParams({ action: "dashboard", requestId });
      if (query?.className) params.set("class", query.className);
      if (query?.limit) params.set("limit", String(query.limit));

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      await fetch(`${GAS_URL}?${params}`, { signal: controller.signal });
      clearTimeout(timer);

      // no-cors: opaque, can't read body
      return { ok: true, data: [] };
    } catch {
      return { ok: false, data: [] };
    }
  },
};
