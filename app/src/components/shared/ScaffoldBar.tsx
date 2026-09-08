/**
 * ScaffoldBar — Visual progress bar showing learning scaffolding phases.
 * Phase 20: UI integration for scaffolding.
 */
import { motion } from "framer-motion";
import type { ScaffoldPhase } from "../../engine/scaffolding/scaffolding";
import { getPhaseIndex, SCAFFOLD_STEPS } from "../../engine/scaffolding/scaffolding";

const PHASE_ICONS: Record<ScaffoldPhase, string> = {
  MISSION: "\u{1F3AF}",
  OBSERVE: "\u{1F441}",
  PREDICT: "\u{1F52E}",
  TRY: "\u{1F9EA}",
  SEE_RESULT: "\u{1F4CA}",
  EXPLAIN: "\u{1F4DD}",
  DEBUG: "\u{1F50D}",
  CHALLENGE: "\u{26A1}",
  REFLECT: "\u{1F9E0}",
};

type Props = {
  currentPhase: ScaffoldPhase;
  className?: string;
};

export function ScaffoldBar({ currentPhase, className = "" }: Props) {
  const currentIdx = getPhaseIndex(currentPhase);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-3 ${className}`}>
      <div className="flex items-center gap-1 overflow-x-auto">
        {SCAFFOLD_STEPS.map((step, idx) => {
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx;

          return (
            <div key={step.phase} className="flex items-center gap-1 flex-shrink-0">
              <motion.div
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                  transition-colors duration-200
                  ${isActive
                    ? "bg-primary text-white shadow-md"
                    : isDone
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-400"
                  }
                `}
                animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
              >
                {isDone ? "\u2713" : PHASE_ICONS[step.phase]}
              </motion.div>
              {idx < SCAFFOLD_STEPS.length - 1 && (
                <div className={`w-3 h-0.5 ${isDone ? "bg-green-300" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        {SCAFFOLD_STEPS[currentIdx]?.description}
      </p>
    </div>
  );
}
