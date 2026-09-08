import { gasApi } from "./gasClient";
import type { GameApi, RegisterStudentInput, StartSessionInput, SaveEventInput, SaveModuleResultInput, CompleteSessionInput, DashboardQuery, ApiResult, HealthResult, DashboardRow } from "./gameApi";

/**
 * Composite API layer.
 * Tries GAS backend; on failure, returns error without throwing.
 * Components never call Supabase or GAS directly — only this.
 */
export const gameApi: GameApi = {
  async health(): Promise<HealthResult> {
    return gasApi.health();
  },

  async registerStudent(input: RegisterStudentInput): Promise<ApiResult> {
    return gasApi.registerStudent(input);
  },

  async startSession(input: StartSessionInput): Promise<ApiResult> {
    return gasApi.startSession(input);
  },

  async saveEvent(input: SaveEventInput): Promise<ApiResult> {
    return gasApi.saveEvent(input);
  },

  async saveModuleResult(input: SaveModuleResultInput): Promise<ApiResult> {
    return gasApi.saveModuleResult(input);
  },

  async completeSession(input: CompleteSessionInput): Promise<ApiResult> {
    return gasApi.completeSession(input);
  },

  async dashboard(query?: DashboardQuery): Promise<{ ok: boolean; data: DashboardRow[] }> {
    return gasApi.dashboard(query);
  },
};
