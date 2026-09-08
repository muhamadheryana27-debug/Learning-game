/**
 * HintPanel — Collapsible hint panel with 3 progressive levels.
 * Phase 20: UI integration for hints.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getHint, type HintLevel } from "../../engine/hints/hints";
import { trackHintRequested } from "../../engine/telemetry/telemetry";

type Props = {
  moduleId: string;
  stepId: string;
  className?: string;
};

const LEVEL_LABELS: Record<HintLevel, string> = {
  1: "\uD83D\uDC40 Amati",
  2: "\uD83E\uDDE4 Pola",
  3: "\uD83E\uDDEA Panduan",
};

const LEVEL_COLORS: Record<HintLevel, string> = {
  1: "bg-blue-50 border-blue-200 text-blue-800",
  2: "bg-amber-50 border-amber-200 text-amber-800",
  3: "bg-purple-50 border-purple-200 text-purple-800",
};

export function HintPanel({ moduleId, stepId, className = "" }: Props) {
  const [currentLevel, setCurrentLevel] = useState<HintLevel>(1);
  const [showHint, setShowHint] = useState(false);
  const [requested, setRequested] = useState<Set<number>>(new Set());

  const hint = getHint(moduleId, stepId, currentLevel);

  if (!hint) return null;

  const handleRequest = (level: HintLevel) => {
    setCurrentLevel(level);
    setShowHint(true);
    setRequested((prev) => new Set(prev).add(level));
    const h = getHint(moduleId, stepId, level);
    if (h) trackHintRequested(level, h.text);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">
          {"\uD83D\uDCA1"} Petunjuk
        </span>
        <div className="flex gap-1">
          {([1, 2, 3] as HintLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleRequest(lvl)}
              disabled={lvl > currentLevel + 1}
              className={`
                text-xs px-2 py-1 rounded-lg font-medium transition-all
                ${lvl === currentLevel && showHint
                  ? LEVEL_COLORS[lvl]
                  : requested.has(lvl)
                    ? "bg-slate-100 text-slate-500"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }
                ${lvl > currentLevel + 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {LEVEL_LABELS[lvl]}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showHint && (
          <motion.div
            key={currentLevel}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`rounded-lg border p-3 text-sm ${LEVEL_COLORS[currentLevel]}`}
          >
            <p className="font-medium mb-1">{LEVEL_LABELS[currentLevel]}</p>
            <p>{hint.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!showHint && (
        <p className="text-xs text-slate-400 text-center py-2">
          Butuh bantuan? Klik tombol di atas.
        </p>
      )}
    </div>
  );
}
