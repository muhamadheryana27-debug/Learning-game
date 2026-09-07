import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ShapeType = "Square" | "Triangle" | "Circle";

export interface GateRule {
  id: string;
  src: ShapeType;
  dst: ShapeType;
  x: number;
  y: number;
  isActive?: boolean;
}

const SHAPE_ASSETS: Record<ShapeType, { name: string; fill: string; stroke: string; shadow: string }> = {
  Square: { name: "Persegi", fill: "#3B82F6", stroke: "#1D4ED8", shadow: "#1E40AF" },
  Triangle: { name: "Segitiga", fill: "#EF4444", stroke: "#B91C1C", shadow: "#991B1B" },
  Circle: { name: "Lingkaran", fill: "#F59E0B", stroke: "#D97706", shadow: "#B45309" },
};

export const FactoryGameMockup: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<ShapeType | null>("Square");
  const [targetShape] = useState<ShapeType>("Triangle");
  const [activeDoor, setActiveDoor] = useState<number | null>(null);
  const [animatingDough, setAnimatingDough] = useState<{ shape: ShapeType; pathIndex: number } | null>(null);

  const gates: GateRule[] = [
    { id: "G1", src: "Square", dst: "Triangle", x: 220, y: 190, isActive: false },
    { id: "G2", src: "Triangle", dst: "Circle", x: 400, y: 190, isActive: false },
    { id: "G3", src: "Circle", dst: "Triangle", x: 310, y: 310, isActive: false },
  ];

  const handleDropToDoor = (doorNumber: number) => {
    if (!selectedToken || animatingDough) return;
    setActiveDoor(doorNumber);
    setAnimatingDough({ shape: selectedToken, pathIndex: doorNumber });
    setTimeout(() => {
      setAnimatingDough(null);
      setActiveDoor(null);
    }, 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-100 p-6 rounded-3xl shadow-2xl border-4 border-slate-300 font-sans select-none overflow-hidden">
      <div className="flex justify-between items-center mb-4 bg-white/80 backdrop-blur p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center border-2 border-amber-600 shadow-inner">
            <span className="text-2xl">🏭</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-wide uppercase">Pabrik Kue Cetak (Module 1)</h1>
            <p className="text-xs text-slate-500 font-bold">Pilih Adonan & Masukkan ke Pintu Masuk</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl border-2 border-slate-700 shadow-md">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Target Kue:</span>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-xl">{targetShape === "Square" ? "🟦" : targetShape === "Triangle" ? "🔺" : "🟡"}</span>
            <span className="text-sm font-black text-amber-400">{SHAPE_ASSETS[targetShape].name}</span>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-slate-200 to-slate-300 rounded-2xl p-4 border-2 border-slate-300 min-h-[460px] flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 600 450" className="w-full h-auto max-h-[440px] drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="iso-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.15" />
            </filter>
            <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          <g id="conveyor-tracks" filter="url(#iso-shadow)">
            <path d="M 150 70 L 150 130 L 220 190" fill="none" stroke="url(#pipeGrad)" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 150 70 L 150 130 L 220 190" fill="none" stroke="#64748B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 300 70 L 300 190" fill="none" stroke="url(#pipeGrad)" strokeWidth="24" strokeLinecap="round" />
            <path d="M 300 70 L 300 190" fill="none" stroke="#64748B" strokeWidth="12" strokeLinecap="round" />
            <path d="M 450 70 L 450 130 L 380 190" fill="none" stroke="url(#pipeGrad)" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 450 70 L 450 130 L 380 190" fill="none" stroke="#64748B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 220 190 L 300 190 L 310 310 L 310 390" fill="none" stroke="url(#pipeGrad)" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 220 190 L 300 190 L 310 310 L 310 390" fill="none" stroke="#0EA5E9" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          </g>

          {[
            { id: 1, x: 150, label: "Pintu 1" },
            { id: 2, x: 300, label: "Pintu 2" },
            { id: 3, x: 450, label: "Pintu 3" },
          ].map((door) => (
            <g key={door.id} onClick={() => handleDropToDoor(door.id)} className="cursor-pointer group">
              <circle cx={door.x} cy={60} r={26} fill={activeDoor === door.id ? "#38BDF8" : "#FFFFFF"} stroke={activeDoor === door.id ? "#0284C7" : "#94A3B8"} strokeWidth="4" className="transition-all duration-300 group-hover:scale-110" />
              <circle cx={door.x} cy={60} r={18} fill="#0F172A" opacity="0.8" />
              <text x={door.x} y={64} textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900">
                {door.id}
              </text>
              <rect x={door.x - 30} y={15} width={60} height={20} rx={6} fill="#1E293B" />
              <text x={door.x} y={29} textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="bold">
                {door.label}
              </text>
            </g>
          ))}

          {gates.map((gate) => (
            <g key={gate.id} transform={`translate(${gate.x - 35}, ${gate.y - 30})`}>
              <rect x="0" y="0" width="70" height="50" rx="12" fill={gate.isActive ? "#1E1B4B" : "#0F172A"} stroke={gate.isActive ? "#818CF8" : "#334155"} strokeWidth="4" filter="url(#iso-shadow)" />
              <rect x="8" y="8" width="54" height="22" rx="6" fill="#020617" />
              <text x="35" y="23" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#F8FAFC">
                {SHAPE_ASSETS[gate.src].name[0]} ➔ {SHAPE_ASSETS[gate.dst].name[0]}
              </text>
              <circle cx="35" cy="38" r="4" fill={gate.isActive ? "#22C55E" : "#64748B"} className={gate.isActive ? "animate-pulse" : ""} />
            </g>
          ))}

          <g transform="translate(310, 390)">
            <rect x="-45" y="-5" width="90" height="35" rx="10" fill="#166534" stroke="#22C55E" strokeWidth="3" />
            <text x="0" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900" letterSpacing="1">
              FINISH (K)
            </text>
          </g>

          <AnimatePresence>
            {animatingDough && (
              <motion.g
                initial={{ x: animatingDough.pathIndex * 150 - 0, y: 60, scale: 0.8 }}
                animate={{
                  x: [animatingDough.pathIndex * 150, animatingDough.pathIndex === 1 ? 220 : animatingDough.pathIndex === 3 ? 380 : 300, 300, 310, 310],
                  y: [60, 190, 190, 310, 390],
                  scale: [0.9, 1.1, 1, 1.05, 1],
                }}
                transition={{ duration: 2.8, ease: "easeInOut" }}
              >
                <g transform="translate(-20, -20)">
                  <rect x="4" y="4" width="32" height="32" rx="8" fill={SHAPE_ASSETS[animatingDough.shape].fill} stroke={SHAPE_ASSETS[animatingDough.shape].stroke} strokeWidth="3" />
                  <circle cx="12" cy="16" r="2.5" fill="#0F172A" />
                  <circle cx="28" cy="16" r="2.5" fill="#0F172A" />
                  <path d="M 16 22 Q 20 25 24 22" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="10" cy="19" r="2" fill="#F472B6" opacity="0.6" />
                  <circle cx="30" cy="19" r="2" fill="#F472B6" opacity="0.6" />
                </g>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      <div className="mt-5 bg-white p-4 rounded-2xl border-2 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Baki Adonan Siswa:</span>
          <p className="text-xs text-slate-600 font-semibold">Pilih jenis kue adonan awal sebelum dimasukkan ke dalam pipa:</p>
        </div>
        <div className="flex gap-4">
          {(["Square", "Triangle", "Circle"] as ShapeType[]).map((shape) => {
            const isSelected = selectedToken === shape;
            const asset = SHAPE_ASSETS[shape];
            return (
              <button
                key={shape}
                onClick={() => setSelectedToken(shape)}
                className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 min-w-[90px] ${isSelected ? "border-indigo-600 bg-indigo-50/80 shadow-lg scale-105 ring-4 ring-indigo-500/20" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-sm" style={{ backgroundColor: asset.fill, borderColor: asset.stroke }}>
                  <span className="text-white text-xs font-black">{shape === "Square" ? "⬛" : shape === "Triangle" ? "▲" : "●"}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-700">{asset.name}</span>
                {isSelected && <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">PILIH</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
