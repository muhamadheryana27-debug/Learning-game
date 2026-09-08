import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PIPELINE_ROUTES, traceRoute, type Shape } from "../../engine/rules/doughFactoryEngine";
import { useProgressStore } from "../../store/useProgressStore";
import { toast } from "sonner";

const PASTRY_META: Record<Shape, { icon: string; label: string; color: string }> = {
  Square: { icon: "🟫", label: "Brownie", color: "#6D4C41" },
  Triangle: { icon: "🍰", label: "Cheesecake", color: "#FDE68A" },
  Circle: { icon: "🍩", label: "Donut", color: "#F472B6" },
};

function PastryIcon({ shape, size = 40 }: { shape: Shape; size?: number }) {
  if (shape === "Square") {
    return (
      <svg width={size} height={size} viewBox="0 0 50 50" className="drop-shadow-sm">
        <rect x="10" y="10" width="30" height="30" rx="4" fill="#5D4037" stroke="white" strokeWidth="2" />
        <rect x="10" y="10" width="30" height="30" rx="4" fill="#795548" />
        <circle cx="18" cy="18" r="2.2" fill="#3E2723" />
        <circle cx="28" cy="16" r="1.8" fill="#3E2723" />
        <circle cx="22" cy="26" r="2" fill="#4E342E" />
        <circle cx="32" cy="28" r="1.6" fill="#3E2723" />
        <circle cx="20" cy="32" r="1.4" fill="#4E342E" />
      </svg>
    );
  }
  if (shape === "Triangle") {
    return (
      <svg width={size} height={size} viewBox="0 0 50 50" className="drop-shadow-sm">
        <path d="M 25 10 L 42 38 L 8 38 Z" fill="#FDE68A" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 25 10 L 42 38 L 8 38 Z" fill="#FACC15" opacity="0.35" />
        <ellipse cx="25" cy="38" rx="14" ry="3" fill="#92400E" opacity="0.25" />
        <circle cx="25" cy="16" r="3.5" fill="#EF4444" stroke="white" strokeWidth="1.2" />
        <circle cx="26" cy="14.5" r="1" fill="white" opacity="0.7" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className="drop-shadow-sm">
      <circle cx="25" cy="25" r="18" fill="#F472B6" stroke="white" strokeWidth="2" />
      <circle cx="25" cy="25" r="18" fill="#EC4899" opacity="0.3" />
      <circle cx="25" cy="25" r="7" fill="white" stroke="#F472B6" strokeWidth="1.5" />
      <circle cx="25" cy="25" r="7" fill="#FFF7ED" />
      <rect x="18" y="14" width="6" height="2" rx="1" fill="#FACC15" transform="rotate(-20 21 15)" />
      <rect x="28" y="16" width="5" height="2" rx="1" fill="#34D399" transform="rotate(30 30 17)" />
      <rect x="14" y="24" width="5" height="2" rx="1" fill="#60A5FA" transform="rotate(15 16 25)" />
      <rect x="32" y="30" width="6" height="2" rx="1" fill="#FACC15" transform="rotate(-25 35 31)" />
      <rect x="20" y="34" width="5" height="2" rx="1" fill="white" transform="rotate(20 22 35)" />
    </svg>
  );
}

function Puff({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-white/90 blur-[1px] border border-white"
              initial={{ scale: 0.2, opacity: 0.9, x: 0, y: 0 }}
              animate={{ scale: [0.2, 1.4, 0], opacity: [0.9, 0.6, 0], x: (i - 2) * 8 + (Math.random() * 6 - 3), y: -14 - i * 6 - Math.random() * 8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
              style={{ left: "50%", top: "50%" }}
            />
          ))}
          <motion.div className="absolute -inset-3 rounded-full bg-amber-200/40 blur-xl" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.6, opacity: [0, 0.6, 0] }} transition={{ duration: 0.6 }} />
        </>
      )}
    </AnimatePresence>
  );
}

type Pos = { x: number; y: number };
const CHUTE_POS: Record<number, Pos> = { 1: { x: 22, y: 14 }, 2: { x: 50, y: 12 }, 3: { x: 78, y: 14 } };
const STATION_POS: Record<string, Pos> = {
  g1_top: { x: 22, y: 30 },
  g2_top: { x: 50, y: 26 },
  g2_mid: { x: 50, y: 38 },
  g_shared_midLeft: { x: 33, y: 48 },
  g3_top: { x: 78, y: 30 },
  g3_mid: { x: 78, y: 42 },
  k_top: { x: 50, y: 62 },
  k_bot: { x: 50, y: 76 },
};
const SERVE_POS: Pos = { x: 50, y: 88 };

const CUSTOMERS_EMOJI = ["👧", "👦", "🧑‍🍳", "👩‍🦰", "🧒", "👨‍🦱"];
const CHEF_QUOTES: Record<Shape, string> = {
  Square: "Aku mau Brownie 🟫!",
  Triangle: "Mau Cheesecake 🍰 ya!",
  Circle: "",
};
function randomWant(): Shape {
  const arr: Shape[] = ["Square", "Triangle"];
  return arr[Math.floor(Math.random() * 2)];
}

const MAX_CUSTOMERS = 5;
const INGREDIENTS: Shape[] = ["Square", "Triangle", "Circle"];

export const DoughFactory: React.FC = () => {
  const setMod1Score = useProgressStore((s) => s.setMod1Score);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [selectedShape, setSelectedShape] = useState<Shape>("Square");
  const [queue, setQueue] = useState<Shape[]>(() => Array.from({ length: MAX_CUSTOMERS }, () => randomWant()));
  const [served, setServed] = useState(0);
  const [queueOpen, setQueueOpen] = useState(false);
  const [activeDoor, setActiveDoor] = useState<number | null>(null);
  const [trace, setTrace] = useState<ReturnType<typeof traceRoute> | null>(null);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [popShape, setPopShape] = useState<Shape | null>(null);
  const [happy, setHappy] = useState(false);
  const timerRef = useRef<number | null>(null);

  const isFinished = served >= MAX_CUSTOMERS && queue.length === 0;
  const activeWant = queue[0];

  const getTokenPos = (): Pos => {
    if (!trace || activeDoor === null) return CHUTE_POS[activeDoor ?? 2];
    if (step === 0) return CHUTE_POS[activeDoor];
    if (step > trace.steps.length) return SERVE_POS;
    const gateId = trace.steps[step - 1].gate.id;
    return STATION_POS[gateId] ?? SERVE_POS;
  };
  const currentShape: Shape = trace ? trace.history[Math.min(step, trace.history.length - 1)] : selectedShape;

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleChute = (door: number) => {
    if (animating || paused || isFinished) return;
    const result = traceRoute(selectedShape, door);
    setActiveDoor(door);
    setTrace(result);
    setStep(0);
    setAnimating(true);
    setPopShape(null);
    let s = 0;
    const tick = () => {
      if (paused) {
        timerRef.current = window.setTimeout(tick, 300);
        return;
      }
      s++;
      setStep(s);
      if (s <= result.steps.length) {
        const st = result.steps[s - 1];
        if (st.triggered) {
          setPopShape(st.after);
          setTimeout(() => setPopShape(null), 600);
        }
      }
      if (s >= result.steps.length) {
        setTimeout(() => {
          setAnimating(false);
          const final = result.final;
          const isWin = final === activeWant;
          if (isWin) {
            setHappy(true);
            setScore((p) => p + 100);
            const nextServed = served + 1;
            setServed(nextServed);
            setMod1Score(Math.min(100, 60 + nextServed * 10));
            const isLast = nextServed >= MAX_CUSTOMERS;
            toast.success(isLast ? `Selesai! ${MAX_CUSTOMERS}/${MAX_CUSTOMERS} 🎉` : `Pesanan tepat! +100 🎉`, { description: `${PASTRY_META[final].icon} ${PASTRY_META[final].label} disajikan!` });
            setTimeout(() => {
              setQueue((q) => q.slice(1));
              if (!isLast && nextServed % 3 === 0) setLevel((l) => l + 1);
              setHappy(false);
              setTrace(null);
              setActiveDoor(null);
              setStep(0);
            }, 900);
          } else {
            toast.error(`Oops! Mau ${PASTRY_META[activeWant].icon} tapi kamu antar ${PASTRY_META[final].icon}`, { description: "Coba pintu lain atau ganti adonan!" });
            setAnimating(false);
          }
        }, 600);
        return;
      }
      timerRef.current = window.setTimeout(tick, 850);
    };
    timerRef.current = window.setTimeout(tick, 700);
  };

  const stationsToShow = activeDoor ? PIPELINE_ROUTES[activeDoor].map((g) => g.id) : [];

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-3 md:px-0 pb-[160px] md:pb-0">
      {/* HUD */}
      <div className="bg-white rounded-2xl md:rounded-[1.5rem] border-2 md:border-[3px] border-amber-200 shadow-xl p-2 sm:p-3 md:p-4 flex flex-wrap items-center justify-between gap-2 md:gap-3 mb-3 md:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-lg sm:text-xl shrink-0">🏭</div>
          <div>
            <h2 className="font-black text-slate-800 leading-none text-sm sm:text-base md:text-lg">Dapur Pabrik Kue</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">Antar kue impian pelanggan!</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-400 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-amber-600 shadow flex items-center gap-1.5 sm:gap-2 min-h-[40px] sm:min-h-[48px]">
            <span className="text-[11px] sm:text-xs font-black">SKOR</span>
            <motion.span key={score} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-base sm:text-lg font-black">{score}</motion.span>
          </div>
          <div className="bg-slate-900 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border-2 border-slate-700 flex items-center gap-1.5 sm:gap-2 min-h-[40px] sm:min-h-[48px]">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400">LVL</span>
            <span className="font-black text-amber-300 text-sm sm:text-base">{level}</span>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold text-emerald-700 hidden sm:flex min-h-[40px] sm:min-h-[48px] items-center gap-1">
            <span>👤</span> <span>{served}/{MAX_CUSTOMERS}</span>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className={`min-h-[40px] min-w-[40px] sm:min-h-[48px] sm:min-w-[48px] rounded-full border-2 flex items-center justify-center font-black text-sm sm:text-base active:scale-95 transition ${paused ? "bg-amber-500 border-amber-600 text-white" : "bg-white border-slate-200 active:bg-slate-50"}`}
            aria-label={paused ? "Resume" : "Pause"}
          >
            {paused ? "▶" : "⏸"}
          </button>
        </div>
      </div>

      {/* Customer Queue — responsive single component */}
      <div className="mb-3">
        <div className="bg-white rounded-[1.5rem] border-[3px] border-slate-200 shadow-xl p-3">
          <button
            onClick={() => setQueueOpen(!queueOpen)}
            className="w-full flex items-center justify-between p-2 sm:p-3 active:bg-slate-50 rounded-xl min-h-[44px]"
          >
            <span className="text-xs font-black tracking-widest text-slate-500 uppercase">👥 Antrean ({served}/{MAX_CUSTOMERS}) {queueOpen ? "▾" : "▸"}</span>
            {queue.length > 0 ? (
              <span className="text-xs font-bold text-amber-600">{PASTRY_META[queue[0]].icon} {PASTRY_META[queue[0]].label}</span>
            ) : (
              <span className="text-xs font-bold text-emerald-600">✅ Selesai!</span>
            )}
          </button>
          <AnimatePresence>
            {queueOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="space-y-2 mt-2">
                  {queue.map((want, idx) => {
                    const isActive = idx === 0;
                    return (
                      <div key={idx} className={`rounded-xl border-2 p-2 sm:p-3 flex items-center gap-2 sm:gap-3 ${isActive ? "bg-amber-50 border-amber-300 shadow" : "bg-slate-50 border-slate-200 opacity-60"}`}>
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg border-2 shrink-0 ${isActive ? "bg-white border-amber-300" : "bg-white border-slate-200"}`}>{CUSTOMERS_EMOJI[idx % CUSTOMERS_EMOJI.length]}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black ${isActive ? "text-slate-800" : "text-slate-500"}`}>{isActive ? "Pelanggan Aktif" : `Antre ${idx + 1}`}</p>
                          <span className="text-xs font-bold">{PASTRY_META[want].icon} {CHEF_QUOTES[want]}</span>
                        </div>
                        {isActive && happy && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">😍</motion.span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {queue.length === 0 && (
            <div className="mt-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3 text-center">
              <p className="text-sm font-black text-emerald-700">🎉 Semua {MAX_CUSTOMERS} pelanggan sudah dilayani!</p>
              <p className="text-xs text-emerald-600">Skor akhir: {score}</p>
            </div>
          )}
        </div>
      </div>

      {/* Kitchen + Sidebar */}
      <div className="grid grid-cols-12 gap-3 md:gap-4">
        {/* Sidebar tip */}
        <div className="hidden md:block md:col-span-3">
          <div className="bg-white rounded-[1.5rem] border-[3px] border-slate-200 shadow-xl p-3 h-full flex flex-col">
            <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3">📋 Cara Main</p>
            <div className="space-y-2 text-xs text-slate-600">
              <p>1. Pilih adonan di bawah</p>
              <p>2. Tap <b>Pintu 1/2/3</b></p>
              <p>3. Amati adonan berubah di pipa</p>
              <p>4. Samakan hasil di <b>Oven K</b></p>
            </div>
            <div className="mt-auto pt-3 bg-slate-900 text-white rounded-xl p-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <p className="text-xs leading-tight">Cocokkan akhir di <b>Oven K</b>!</p>
            </div>
          </div>
        </div>

        {/* Kitchen floor */}
        <div className="col-span-12 md:col-span-9">
          <div className="w-full max-w-4xl mx-auto">
            <div className="relative rounded-2xl md:rounded-[1.75rem] border-2 md:border-[3px] border-amber-200 shadow-xl overflow-hidden bg-[#FDF6E3]">
              <div className="overflow-x-auto overflow-y-hidden touch-pan-x overscroll-contain scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-50 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-300">
                <div className="relative min-w-[560px] md:min-w-0 w-full" style={{ minHeight: "clamp(420px, 55vh, 520px)", height: "clamp(420px, 55vh, 520px)" }}>
                  <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg, #FDF6E3 0 40px, #FCEFC7 40px 80px), linear-gradient(to bottom, #FDF6E3, #F5E6B8)" }} />
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                  <div className="absolute top-0 inset-x-0 h-5 md:h-6 bg-gradient-to-b from-slate-200 to-slate-300 border-b-2 border-slate-400 flex items-center justify-center">
                    <span className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-500">── STAINLESS COUNTER ──</span>
                  </div>

                  {/* Conveyor SVG */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <path d={`M ${CHUTE_POS[1].x} ${CHUTE_POS[1].y + 7} C ${CHUTE_POS[1].x} 22, ${STATION_POS.g1_top.x} 22, ${STATION_POS.g1_top.x} ${STATION_POS.g1_top.y - 5}`} fill="none" stroke="#D97706" strokeWidth="3.2" strokeDasharray="3 2" opacity="0.9" />
                    <path d={`M ${STATION_POS.g1_top.x} ${STATION_POS.g1_top.y + 5} L ${STATION_POS.g_shared_midLeft.x} ${STATION_POS.g_shared_midLeft.y - 4}`} fill="none" stroke="#D97706" strokeWidth="3.2" strokeDasharray="3 2" />
                    <path d={`M ${CHUTE_POS[2].x} ${CHUTE_POS[2].y + 7} L ${STATION_POS.g2_top.x} ${STATION_POS.g2_top.y - 4}`} fill="none" stroke="#D97706" strokeWidth="3.2" strokeDasharray="3 2" />
                    <path d={`M ${STATION_POS.g2_top.x} ${STATION_POS.g2_top.y + 5} L ${STATION_POS.g2_mid.x} ${STATION_POS.g2_mid.y - 4}`} fill="none" stroke="#D97706" strokeWidth="3.2" strokeDasharray="3 2" />
                    <path d={`M ${STATION_POS.g2_mid.x} ${STATION_POS.g2_mid.y + 5} L ${STATION_POS.g_shared_midLeft.x} ${STATION_POS.g_shared_midLeft.y - 4}`} fill="none" stroke="#D97706" strokeWidth="3.2" strokeDasharray="3 2" />
                    <path d={`M ${CHUTE_POS[3].x} ${CHUTE_POS[3].y + 7} L ${STATION_POS.g3_top.x} ${STATION_POS.g3_top.y - 4}`} fill="none" stroke="#D97706" strokeWidth="3.2" strokeDasharray="3 2" />
                    <path d={`M ${STATION_POS.g3_top.x} ${STATION_POS.g3_top.y + 5} L ${STATION_POS.g3_mid.x} ${STATION_POS.g3_mid.y - 4}`} fill="none" stroke="#D97706" strokeWidth="3.2" strokeDasharray="3 2" />
                    <path d={`M ${STATION_POS.g3_mid.x} ${STATION_POS.g3_mid.y + 5} Q 74 52, ${STATION_POS.k_top.x} ${STATION_POS.k_top.y - 4}`} fill="none" stroke="#D97706" strokeWidth="3.2" strokeDasharray="3 2" />
                    <path d={`M ${STATION_POS.g_shared_midLeft.x} ${STATION_POS.g_shared_midLeft.y + 5} Q 40 56, ${STATION_POS.k_top.x} ${STATION_POS.k_top.y - 4}`} fill="none" stroke="#D97706" strokeWidth="3.2" strokeDasharray="3 2" />
                    <path d={`M ${STATION_POS.k_top.x} ${STATION_POS.k_top.y + 5} L ${STATION_POS.k_bot.x} ${STATION_POS.k_bot.y - 4}`} fill="none" stroke="#B45309" strokeWidth="4" strokeDasharray="4 2" />
                    <path d={`M ${STATION_POS.k_bot.x} ${STATION_POS.k_bot.y + 5} L ${SERVE_POS.x} ${SERVE_POS.y - 5}`} fill="none" stroke="#B45309" strokeWidth="4" strokeDasharray="4 2" />
                  </svg>

                  {/* Chutes */}
                  {[1, 2, 3].map((door) => {
                    const isActive = activeDoor === door;
                    return (
                      <button
                        key={door}
                        onClick={() => handleChute(door)}
                        disabled={animating || isFinished}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group min-h-[48px] min-w-[48px] active:scale-95 transition-transform"
                        style={{ left: `${CHUTE_POS[door].x}%`, top: `${CHUTE_POS[door].y}%` }}
                      >
                        <div className={`w-[68px] sm:w-[78px] h-[56px] sm:h-[62px] rounded-t-3xl rounded-b-xl border-[3px] flex flex-col items-center justify-center shadow-lg transition-all ${isActive ? "bg-sky-500 border-sky-300 scale-105 shadow-sky-300/40" : "bg-white border-slate-300 group-hover:border-amber-400 group-active:border-amber-500"} ${animating ? "opacity-60" : ""}`}>
                          <div className={`w-9 sm:w-10 h-5 rounded-b-xl border-2 border-t-0 -mt-1 ${isActive ? "bg-sky-700 border-sky-800" : "bg-slate-800 border-slate-900"}`} />
                          <span className={`text-[9px] sm:text-[10px] font-black tracking-widest mt-1 ${isActive ? "text-white" : "text-slate-700"}`}>CHUTE {door}</span>
                          <span className="text-[8px] sm:text-[9px] text-slate-500">Pintu {door}</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Stations */}
                  {Object.entries(STATION_POS).map(([id, pos]) => {
                    const gate = Object.values(PIPELINE_ROUTES).flat().find((g) => g.id === id);
                    if (!gate) return null;
                    const isInRoute = stationsToShow.includes(id);
                    const isPop = popShape && trace && trace.steps[step - 1]?.gate.id === id;
                    const dimmed = activeDoor !== null && !isInRoute;
                    const srcIcon = PASTRY_META[gate.src as Shape].icon;
                    const dstIcon = PASTRY_META[gate.dst as Shape].icon;
                    return (
                      <div key={id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                        <motion.div
                          animate={isPop ? { scale: 1.18, rotate: [0, -6, 6, 0] } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 12 }}
                          className={`w-[68px] sm:w-[78px] rounded-2xl border-2 shadow-md flex flex-col items-center overflow-hidden ${isPop ? "bg-emerald-400 border-emerald-600" : dimmed ? "bg-white/50 border-white/60 opacity-40" : "bg-white border-amber-200"}`}
                        >
                          <div className={`w-full flex items-center justify-center gap-1 py-1 text-xs ${isPop ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"}`}>
                            <span className="text-xs">{srcIcon}</span>
                            <span className="text-[10px] opacity-70">➔</span>
                            <span className="text-xs">{dstIcon}</span>
                          </div>
                          <div className={`relative w-full flex items-center justify-center py-1.5 sm:py-2 ${isPop ? "bg-emerald-50" : "bg-gradient-to-b from-amber-50 to-orange-50"}`}>
                            <span className="text-lg sm:text-xl">{isPop ? "✨" : "🍳"}</span>
                            <Puff show={!!isPop} />
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 flex">
                            <motion.div className="h-full bg-amber-400" initial={{ width: "0%" }} animate={{ width: isPop ? "100%" : "45%" }} transition={{ duration: 0.5 }} />
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}

                  {/* Serving Counter */}
                  <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${SERVE_POS.x}%`, top: `${SERVE_POS.y}%` }}>
                    <div className={`px-3 sm:px-5 py-2 sm:py-3 rounded-2xl border-[3px] shadow-xl flex items-center gap-1.5 sm:gap-2 ${trace && step === trace.steps.length && !animating ? (trace.final === activeWant ? "bg-emerald-500 border-emerald-300 text-white" : "bg-amber-500 border-amber-300 text-white") : "bg-slate-900 border-amber-400 text-white"}`}>
                      <span className="text-base sm:text-xl">🍽️</span>
                      <div>
                        <p className="text-[10px] sm:text-xs font-black tracking-widest leading-none">SERVING COUNTER</p>
                        <p className="text-[9px] sm:text-[10px] opacity-80 hidden sm:block">Oven K</p>
                      </div>
                      <motion.span animate={{ rotate: trace && step === trace.steps.length && !animating ? [0, 10, -10, 0] : 0 }} transition={{ duration: 0.5, repeat: trace && step === trace.steps.length ? 2 : 0 }} className="text-base sm:text-lg ml-1">🔔</motion.span>
                    </div>
                  </div>

                  {/* Token */}
                  <AnimatePresence>
                    {trace && (
                      <motion.div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20" initial={false} animate={{ left: `${getTokenPos().x}%`, top: `${getTokenPos().y}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
                        <motion.div key={currentShape + step} initial={{ y: -8, scale: 0.9 }} animate={{ y: 0, scale: popShape ? 1.35 : 1 }} transition={{ type: "spring", stiffness: 350, damping: 14 }} className="relative">
                          <div className="absolute -inset-2 rounded-full blur-xl opacity-40" style={{ backgroundColor: PASTRY_META[currentShape].color }} />
                          <div className="relative bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl border-2 border-amber-200">
                            <PastryIcon shape={currentShape} size={32} />
                          </div>
                          <AnimatePresence>
                            {popShape && <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">✨</motion.div>}
                          </AnimatePresence>
                          <Puff show={!!popShape} />
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/15 rounded-full blur-sm" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!trace && !isFinished && (
                    <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-amber-200 shadow flex items-center gap-2 text-[11px] sm:text-xs font-bold text-slate-700 whitespace-nowrap max-w-[90%]">
                      <span>👇</span> <span className="hidden sm:inline">Pilih adonan,</span> tap Chute!
                    </div>
                  )}
                  {isFinished && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                      <div className="bg-white rounded-2xl p-6 text-center shadow-2xl">
                        <p className="text-3xl mb-2">🎉</p>
                        <p className="font-black text-lg text-slate-800">Semua Pelanggan Selesai!</p>
                        <p className="text-sm text-slate-500 mt-1">Skor: {score} | Level: {level}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex md:hidden items-center justify-center gap-1 py-1.5 text-[10px] text-amber-700/60">
                <span>←</span> geser untuk lihat semua jalur <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredient Station */}
      <div className="fixed bottom-0 inset-x-0 z-30 md:static md:z-auto bg-white md:bg-gradient-to-br md:from-amber-50 md:to-orange-50 border-t-2 md:border-[3px] border-amber-200 md:rounded-[1.5rem] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] md:shadow-xl p-2 sm:p-3 md:p-4 pb-[max(8px,env(safe-area-inset-bottom))] md:pb-4">
        <p className="hidden md:flex text-xs font-black tracking-widest text-amber-800 uppercase mb-3 items-center justify-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">🧺</span> Meja Bahan — Pilih Adonan
        </p>
        <p className="md:hidden text-[11px] font-black tracking-widest text-amber-800 uppercase mb-2 text-center">🧺 Pilih Adonan</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-4xl mx-auto">
          {INGREDIENTS.map((s) => {
            const isSelected = selectedShape === s;
            const meta = PASTRY_META[s];
            return (
              <button
                key={s}
                onClick={() => !animating && !isFinished && setSelectedShape(s)}
                disabled={isFinished}
                className={`relative flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 rounded-2xl sm:rounded-[1.5rem] border-2 sm:border-[3px] transition-all min-h-[72px] sm:min-h-[96px] min-w-[48px] active:scale-95 ${isSelected ? "bg-white border-indigo-500 shadow-xl scale-[1.02] sm:scale-[1.04] ring-2 sm:ring-4 ring-indigo-500/20" : "bg-white/95 md:bg-white/80 border-amber-200 md:border-white hover:border-amber-300 shadow-md"} ${animating || isFinished ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 shadow-inner shrink-0 ${isSelected ? "bg-indigo-50 border-indigo-200" : "bg-amber-50 border-amber-200"}`}>
                  <PastryIcon shape={s} size={32} />
                </div>
                <span className={`text-xs sm:text-sm font-black leading-none ${isSelected ? "text-indigo-700" : "text-slate-700"}`}>{meta.label}</span>
                <span className="hidden sm:flex text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full items-center gap-1">
                  <span>{meta.icon}</span> {meta.label}
                </span>
                <span className="sm:hidden text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded-full">{meta.icon}</span>
                {isSelected && <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">PILIH</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mt-3 md:mt-4 grid md:grid-cols-3 gap-2 sm:gap-3 mb-2 md:mb-0">
        <div className="md:col-span-2 bg-white rounded-2xl border-2 border-slate-200 p-2.5 sm:p-3 flex items-center gap-1.5 sm:gap-2 flex-wrap min-h-[48px]">
          <span className="text-xs font-black text-slate-400 uppercase flex items-center gap-1 shrink-0">📜 Jejak:</span>
          {!trace ? (
            <span className="text-xs sm:text-sm text-slate-400 italic">Belum ada perjalanan</span>
          ) : (
            trace.history.slice(0, step + 1).map((sh, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-400 font-bold text-xs sm:text-sm">➔</span>}
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border-2 text-xs sm:text-sm shrink-0 ${i === step ? "bg-indigo-600 border-indigo-400 text-white scale-110" : i === 0 ? "bg-amber-400 border-amber-600" : "bg-white border-slate-200"}`}>{PASTRY_META[sh].icon}</motion.span>
              </React.Fragment>
            ))
          )}
          {trace && step === trace.steps.length && !animating && <span className={`ml-1 sm:ml-2 text-[11px] sm:text-xs font-black px-2 py-1 rounded-full shrink-0 ${trace.final === activeWant ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>{trace.final === activeWant ? "✅ Cocok!" : "❌ Coba lagi"}</span>}
        </div>
        <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between min-h-[48px]">
          <span className="text-xs text-slate-400 hidden sm:inline">Butuh bantuan?</span>
          <span className="text-xs text-slate-400 sm:hidden">Reset?</span>
          <button
            onClick={() => {
              setTrace(null);
              setActiveDoor(null);
              setStep(0);
            }}
            className="text-xs bg-white text-slate-800 px-3 sm:px-3 py-1.5 rounded-full font-bold hover:bg-slate-100 active:scale-95 min-h-[36px] min-w-[48px]"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};
