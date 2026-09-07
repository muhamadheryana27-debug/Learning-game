import React from "react";
import type { FertilizerId } from "../../store/useLabStore";

interface BeakerItemProps {
  id: FertilizerId;
  label?: string;
  color?: string;
  disabled?: boolean;
  onClick: () => void;
}

// Blind Test Mode: neutral mysterious liquid — no spoiler hint
const NEUTRAL_LIQUID = "#E0F2FE"; // light blue/gray translucent

export const BeakerItem: React.FC<BeakerItemProps> = ({ id, color, disabled, onClick }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onClick={() => !disabled && onClick()}
      className={`relative group flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
        disabled
          ? "opacity-40 border-slate-700 bg-slate-900 cursor-not-allowed"
          : "border-slate-700 bg-slate-800 hover:border-indigo-500 hover:scale-105 active:scale-95 shadow-lg"
      }`}
    >
      <div className="w-10 h-14 relative flex items-end justify-center border-2 border-slate-300 rounded-b-lg overflow-hidden bg-white/80 backdrop-blur">
        <div className="w-full transition-all duration-300 rounded-b-sm opacity-70" style={{ backgroundColor: color ?? NEUTRAL_LIQUID, height: "62%" }} />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-700 drop-shadow-sm">{id}</span>
      </div>
      <span className="text-[11px] font-bold text-slate-200 mt-2 text-center tracking-wide">Gelas {id}</span>
    </div>
  );
};
