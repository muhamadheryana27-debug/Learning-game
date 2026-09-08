/**
 * ScoreBreakdown — Visual breakdown of 5-component score.
 * Phase 20: UI integration for scoring.
 */
import { motion } from "framer-motion";
import type { ScoreResult } from "../../engine/scoring/scoring";

type Props = {
  result: ScoreResult;
  className?: string;
};

const COMPONENT_META: Record<string, { label: string; icon: string; color: string }> = {
  accuracy: { label: "Akurasi", icon: "\u2705", color: "bg-green-500" },
  reasoning: { label: "Penalaran", icon: "\uD83E\uDDE0", color: "bg-purple-500" },
  experimentation: { label: "Eksperimen", icon: "\uD83E\uDDEA", color: "bg-blue-500" },
  debugging: { label: "Debugging", icon: "\uD83D\uDD0D", color: "bg-amber-500" },
  independence: { label: "Kemandirian", icon: "\uD83C\uDF1F", color: "bg-pink-500" },
};

export function ScoreBreakdown({ result, className = "" }: Props) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">
          {"\uD83C\uDFAF"} Skor Akhir
        </h3>
        <motion.span
          className="text-3xl font-bold text-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {result.finalScore}
        </motion.span>
      </div>

      <div className="space-y-3">
        {Object.entries(result.breakdown).map(([key, { score, weight, contribution }], idx) => {
          const meta = COMPONENT_META[key] ?? { label: key, icon: "\u2022", color: "bg-slate-500" };
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600">
                  {meta.icon} {meta.label}
                  <span className="text-slate-400 ml-1">({Math.round(weight * 100)}%)</span>
                </span>
                <span className="font-semibold text-slate-800">
                  {score} {"\u2192"} {contribution}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${meta.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
