/**
 * useDoughFactory — state machine hook for DoughFactory game.
 * Phase 7: replaces scattered setTimeout with reducer + ref-guarded timers.
 */
import { useReducer, useRef, useCallback, useEffect } from "react";
import { traceRoute } from "../engine/rules/doughFactoryEngine";
import {
  createInitialState,
  doughFactoryReducer,
  canChute,
  getActiveWant,
  type DoughFactoryState,
  type Shape,
} from "../core/engine/doughFactory";

const GATE_TICK_MS = 850;
const GATE_START_DELAY_MS = 700;
const RESULT_DELAY_MS = 600;
const POP_CLEAR_MS = 600;
const WIN_CELEBRATE_MS = 900;

type TimerHandle = ReturnType<typeof setTimeout> | null;

export function useDoughFactory(sessionSeed: string) {
  const [state, rawDispatch] = useReducer(doughFactoryReducer, null, () => createInitialState(sessionSeed));
  const timers = useRef<TimerHandle[]>([]);
  const traceRef = useRef<ReturnType<typeof traceRoute> | null>(null);
  const stateRef = useRef<DoughFactoryState>(state);

  // Keep stateRef current outside render
  useEffect(() => { stateRef.current = state; });

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => t && clearTimeout(t));
      timers.current = [];
    };
  }, []);

  const schedule = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  const selectShape = useCallback((shape: Shape) => rawDispatch({ type: "SELECT_SHAPE", shape }), []);
  const togglePause = useCallback(() => rawDispatch({ type: "TOGGLE_PAUSE" }), []);

  const startChute = useCallback(
    (door: number) => {
      if (!canChute(stateRef.current)) return;

      const s = stateRef.current;
      const result = traceRoute(s.selectedShape, door);
      traceRef.current = result;

      rawDispatch({ type: "START_CHUTE", door });

      const targetShape = getActiveWant(s)!;
      let currentStep = 0;

      const tick = () => {
        currentStep++;
        const st = result.steps[currentStep - 1];

        if (st?.triggered) {
          rawDispatch({ type: "SHOW_POP", shape: st.after });
          schedule(POP_CLEAR_MS, () => rawDispatch({ type: "HIDE_POP" }));
        }

        rawDispatch({ type: "ADVANCE_STEP" });

        if (currentStep >= result.steps.length) {
          schedule(RESULT_DELAY_MS, () => {
            const isWin = result.final === targetShape;
            if (isWin) {
              rawDispatch({ type: "RESULT_WIN" });
              schedule(WIN_CELEBRATE_MS, () => rawDispatch({ type: "NEXT_CUSTOMER" }));
            } else {
              rawDispatch({ type: "RESULT_LOSE" });
              schedule(RESULT_DELAY_MS, () => rawDispatch({ type: "NEXT_CUSTOMER" }));
            }
          });
          return;
        }

        schedule(GATE_TICK_MS, tick);
      };

      schedule(GATE_START_DELAY_MS, tick);
    },
    [rawDispatch, schedule],
  );

  return {
    state,
    selectShape,
    startChute,
    togglePause,
  };
}
