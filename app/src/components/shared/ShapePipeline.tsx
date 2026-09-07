import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type Shape = "Square" | "Triangle" | "Circle";
export type Rule = [Shape, Shape];

export interface PipelineProps {
  startShape: Shape;
  pipeline: Rule[];
  onStepChange?: (currentShape: Shape, stepIndex: number) => void;
  onComplete?: (finalShape: Shape) => void;
}

const SHAPE_CONFIG: Record<Shape, { label: string; color: string; path: string; icon: string }> = {
  Square: {
    label: "Persegi",
    color: "#3B82F6",
    path: "M 10 10 L 40 10 L 40 40 L 10 40 Z",
    icon: "🟩",
  },
  Triangle: {
    label: "Segitiga",
    color: "#EF4444",
    path: "M 25 8 L 42 40 L 8 40 Z",
    icon: "🔺",
  },
  Circle: {
    label: "Lingkaran",
    color: "#10B981",
    path: "M 25 8 C 34.38 8 42 15.62 42 25 C 42 34.38 34.38 42 25 42 C 15.62 42 8 34.38 8 25 C 8 15.62 15.62 8 25 8 Z",
    icon: "⚪",
  },
};

const applyRule = (current: Shape, rule: Rule): Shape => {
  const [src, dst] = rule;
  return current === src ? dst : current;
};

export const ShapePipeline: React.FC<PipelineProps> = ({ startShape, pipeline, onStepChange, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [history, setHistory] = useState<Shape[]>([startShape]);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentShape = history[currentStep] || startShape;

  useEffect(() => {
    handleReset();
  }, [startShape, JSON.stringify(pipeline)]);

  const handleStepNext = () => {
    if (currentStep >= pipeline.length) {
      setIsPlaying(false);
      return;
    }
    const nextStep = currentStep + 1;
    const rule = pipeline[currentStep];
    const newShape = applyRule(currentShape, rule);
    const updatedHistory = [...history.slice(0, currentStep + 1), newShape];
    setHistory(updatedHistory);
    setCurrentStep(nextStep);
    if (onStepChange) onStepChange(newShape, nextStep);
    if (nextStep === pipeline.length && onComplete) {
      onComplete(newShape);
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setHistory([startShape]);
    if (onStepChange) onStepChange(startShape, 0);
  };

  const handleToggleAutoPlay = () => {
    if (currentStep >= pipeline.length) {
      handleReset();
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStep < pipeline.length) {
      timer = setTimeout(() => {
        if (isPlayingRef.current) handleStepNext();
      }, 1200);
    } else if (currentStep >= pipeline.length) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, pipeline]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Mesin Pembentuk Adonan (Pipeline Engine)
          </h2>
          <p className="text-xs text-slate-400 mt-1">Modul 1: Transisi Bentuk Interaktif</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleToggleAutoPlay}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 shadow-md ${isPlaying ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Jalankan Auto"}
          </button>
          <button
            onClick={handleStepNext}
            disabled={isPlaying || currentStep >= pipeline.length}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-semibold text-sm transition-all"
          >
            Step Next ➔
          </button>
          <button onClick={handleReset} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-sm transition-all">
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="relative bg-slate-950/80 rounded-xl p-8 border border-slate-800/80 mb-6 overflow-hidden min-h-[220px] flex items-center">
        <div className="absolute left-12 right-12 top-1/2 h-1.5 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / pipeline.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="relative w-full flex justify-between items-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${currentStep === 0 ? "border-blue-400 bg-blue-950/80 text-blue-300 ring-4 ring-blue-500/20" : "border-slate-700 bg-slate-900 text-slate-500"}`}
            >
              START
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Posisi 0</span>
          </div>

          {pipeline.map((rule, idx) => {
            const gateIndex = idx + 1;
            const isActive = currentStep === gateIndex;
            const isPassed = currentStep > gateIndex;
            const [src, dst] = rule;
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div
                  className={`relative p-3 rounded-xl border-2 transition-all backdrop-blur-md flex flex-col items-center min-w-[84px] ${isActive ? "border-indigo-400 bg-indigo-950/90 shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/20 scale-105" : isPassed ? "border-emerald-600/60 bg-emerald-950/30 text-slate-400" : "border-slate-800 bg-slate-900/90 text-slate-500"}`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-400">Gate {gateIndex}</span>
                  <div className="flex items-center gap-1 text-sm bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800/50">
                    <span>{SHAPE_CONFIG[src].icon}</span>
                    <span className="text-slate-500 text-xs">➔</span>
                    <span>{SHAPE_CONFIG[dst].icon}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Posisi {gateIndex}</span>
              </div>
            );
          })}
        </div>

        <motion.div
          className="absolute z-20 top-1/2 pointer-events-none"
          initial={false}
          animate={{ left: `calc(48px + ${(currentStep / pipeline.length) * (100 - 96 / (pipeline.length + 1))}% )` }}
          transition={{ type: "spring", stiffness: 90, damping: 15 }}
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute w-16 h-16 rounded-full filter blur-md opacity-60"
              animate={{ backgroundColor: SHAPE_CONFIG[currentShape].color }}
              transition={{ duration: 0.4 }}
            />
            <svg className="w-14 h-14 z-10 drop-shadow-md" viewBox="0 0 50 50">
              <motion.path
                d={SHAPE_CONFIG[currentShape].path}
                fill={SHAPE_CONFIG[currentShape].color}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                animate={{ d: SHAPE_CONFIG[currentShape].path, fill: SHAPE_CONFIG[currentShape].color }}
                transition={{ d: { duration: 0.45, ease: "backOut" }, fill: { duration: 0.3 } }}
              />
            </svg>
          </div>
        </motion.div>
      </div>

      <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
        <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
          <span>📜 History Transisi Adonan</span>
          {currentStep === pipeline.length && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Selesai</span>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <AnimatePresence mode="popLayout">
            {history.map((shape, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-slate-600 text-xs font-bold">
                    ➔
                  </motion.span>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap ${index === currentStep ? "border-indigo-500 bg-indigo-950/60 text-indigo-200 font-semibold ring-2 ring-indigo-500/20" : "border-slate-800 bg-slate-900/80 text-slate-400"}`}
                >
                  <span className="text-sm">{SHAPE_CONFIG[shape].icon}</span>
                  <span>{SHAPE_CONFIG[shape].label}</span>
                  <span className="text-[9px] opacity-50 ml-0.5 font-mono">[{index === 0 ? "Start" : `G${index}`}]</span>
                </motion.div>
              </React.Fragment>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
