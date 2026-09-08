/**
 * DoughFactory Game Engine — pure logic, no React, no UI.
 * Phase 6: separated from DoughFactory.tsx
 */
import { traceRoute, type Shape } from "../../engine/rules/doughFactoryEngine";
import { createSeededRandom } from "./random";

export type { Shape };

// ── Constants ──────────────────────────────────────────────────────────
export const MAX_CUSTOMERS = 5;
export const INGREDIENTS: Shape[] = ["Square", "Triangle", "Circle"];
export const CUSTOMERS_EMOJI = ["👧", "👦", "🧑‍🍳", "👩‍🦰", "🧒", "👨‍🦱"];
export const CHEF_QUOTES: Record<Shape, string> = {
  Square: "Aku mau Brownie 🟫!",
  Triangle: "Mau Cheesecake 🍰 ya!",
  Circle: "",
};

// ── Queue Generation ───────────────────────────────────────────────────
export function generateQueue(seed: string, count: number = MAX_CUSTOMERS): Shape[] {
  const rand = createSeededRandom(seed);
  const targets: Shape[] = ["Square", "Triangle"];
  return Array.from({ length: count }, () => targets[Math.floor(rand() * targets.length)]);
}

// ── Animation State Machine ────────────────────────────────────────────
export type AnimPhase =
  | "idle"
  | "running"
  | "gate_processing"
  | "result"
  | "success"
  | "failure"
  | "next_customer"
  | "completed";

export type DoughFactoryState = {
  phase: AnimPhase;
  selectedShape: Shape;
  door: number | null;
  trace: ReturnType<typeof traceRoute> | null;
  step: number;
  popShape: Shape | null;
  score: number;
  level: number;
  served: number;
  queue: Shape[];
  happy: boolean;
};

export type DoughFactoryAction =
  | { type: "SELECT_SHAPE"; shape: Shape }
  | { type: "START_CHUTE"; door: number }
  | { type: "ADVANCE_STEP" }
  | { type: "SHOW_POP"; shape: Shape }
  | { type: "HIDE_POP" }
  | { type: "RESULT_WIN" }
  | { type: "RESULT_LOSE" }
  | { type: "NEXT_CUSTOMER" }
  | { type: "COMPLETE" }
  | { type: "TOGGLE_PAUSE" };

export function createInitialState(seed: string): DoughFactoryState {
  return {
    phase: "idle",
    selectedShape: "Square",
    door: null,
    trace: null,
    step: 0,
    popShape: null,
    score: 0,
    level: 1,
    served: 0,
    queue: generateQueue(seed),
    happy: false,
  };
}

export function getActiveWant(state: DoughFactoryState): Shape | undefined {
  return state.queue[0];
}

export function computeScore(served: number): number {
  return Math.min(100, 60 + served * 10);
}

export function isFinished(state: DoughFactoryState): boolean {
  return state.phase === "completed";
}

export function canChute(state: DoughFactoryState): boolean {
  return state.phase === "idle" && !state.happy && getActiveWant(state) !== undefined;
}

/**
 * Core reducer — pure state transitions.
 * No side effects, no React, no timers.
 */
export function doughFactoryReducer(
  state: DoughFactoryState,
  action: DoughFactoryAction,
): DoughFactoryState {
  switch (action.type) {
    case "SELECT_SHAPE":
      if (state.phase !== "idle" || state.happy) return state;
      return { ...state, selectedShape: action.shape };

    case "START_CHUTE": {
      if (!canChute(state) || state.door === action.door) return state;
      const result = traceRoute(state.selectedShape, action.door);
      return {
        ...state,
        phase: "running",
        door: action.door,
        trace: result,
        step: 0,
        popShape: null,
      };
    }

    case "ADVANCE_STEP": {
      if (state.phase !== "running" && state.phase !== "gate_processing") return state;
      const nextStep = state.step + 1;
      if (!state.trace || nextStep > state.trace.steps.length) {
        return { ...state, phase: "result", step: nextStep };
      }
      const st = state.trace.steps[nextStep - 1];
      if (st.triggered) {
        return { ...state, phase: "gate_processing", step: nextStep, popShape: st.after };
      }
      return { ...state, step: nextStep };
    }

    case "SHOW_POP":
      return { ...state, popShape: action.shape };

    case "HIDE_POP":
      return { ...state, popShape: null };

    case "RESULT_WIN": {
      if (state.phase !== "result") return state;
      const nextServed = state.served + 1;
      const isLast = nextServed >= MAX_CUSTOMERS;
      return {
        ...state,
        phase: "success",
        happy: true,
        score: state.score + 100,
        served: nextServed,
        level: !isLast && nextServed % 3 === 0 ? state.level + 1 : state.level,
      };
    }

    case "RESULT_LOSE":
      return { ...state, phase: "failure" };

    case "NEXT_CUSTOMER": {
      const newQueue = state.queue.slice(1);
      if (newQueue.length === 0 && state.served >= MAX_CUSTOMERS) {
        return { ...state, phase: "completed", happy: false, trace: null, door: null, step: 0 };
      }
      return {
        ...state,
        phase: "idle",
        happy: false,
        trace: null,
        door: null,
        step: 0,
        popShape: null,
        queue: newQueue,
      };
    }

    case "TOGGLE_PAUSE":
      return state;

    default:
      return state;
  }
}
