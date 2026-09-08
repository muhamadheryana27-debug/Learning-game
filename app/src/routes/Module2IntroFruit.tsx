import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProgressStore } from "../store/useProgressStore";
import { toast } from "sonner";

type FruitId = "apel" | "melon" | "jeruk" | "semangka";
type ZoneId = "adi" | "both" | "edi";

const FRUITS: Record<FruitId, { emoji: string; label: string }> = {
  apel: { emoji: "🍎", label: "Apel" },
  melon: { emoji: "🍈", label: "Melon" },
  jeruk: { emoji: "🍊", label: "Jeruk" },
  semangka: { emoji: "🍉", label: "Semangka" },
};

const EXPECTED: Record<ZoneId, FruitId[]> = {
  adi: ["apel"],
  both: ["melon", "jeruk"],
  edi: ["semangka"],
};

const ZONE_META: Record<ZoneId, { label: string; hint: string; color: string; border: string; bg: string }> = {
  adi: { label: "Hanya Suka Adi", hint: "🍎 Apel", color: "text-rose-700", border: "border-rose-300", bg: "bg-rose-50" },
  both: { label: "Suka Keduanya", hint: "🍈 Melon & 🍊 Jeruk", color: "text-amber-700", border: "border-amber-300", bg: "bg-amber-50" },
  edi: { label: "Hanya Suka Edi", hint: "🍉 Semangka", color: "text-sky-700", border: "border-sky-300", bg: "bg-sky-50" },
};

const QUESTS = [
  { id: 1, title: "Tarik buah yang HANYA disukai oleh Adi!", target: "adi" as ZoneId, hint: "Adi suka Apel 🍎, Melon 🍈, Jeruk 🍊 — tapi yang HANYA Adi?" },
  { id: 2, title: "Tarik buah yang HANYA disukai oleh Edi!", target: "edi" as ZoneId, hint: "Edi suka Melon 🍈, Semangka 🍉, Jeruk 🍊 — tapi yang HANYA Edi?" },
  { id: 3, title: "Tarik buah yang DISUKAI OLEH KEDUANYA!", target: "both" as ZoneId, hint: "Buah apa yang ada di daftar Adi DAN Edi?" },
];

function VennDropZone({ zone, dropped, isActive, onDrop, onDragOver, onDragLeave, dragging }: {
  zone: ZoneId;
  dropped: FruitId[];
  isActive: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  dragging: FruitId | null;
}) {
  const meta = ZONE_META[zone];
  const isCorrect = dropped.length > 0 && dropped.every((f) => EXPECTED[zone].includes(f));
  const isWrong = dropped.length > 0 && !isCorrect;

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative rounded-2xl border-[3px] border-dashed p-3 sm:p-4 min-h-[120px] sm:min-h-[140px] transition-all flex flex-col items-center justify-center gap-2 ${
        isActive
          ? "border-amber-500 bg-amber-100/60 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]"
          : isCorrect
          ? "border-emerald-400 bg-emerald-50 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          : isWrong
          ? "border-red-400 bg-red-50 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
          : `${meta.border} ${meta.bg}`
      }`}
    >
      <div className="text-center mb-1">
        <p className={`text-xs sm:text-sm font-black ${meta.color}`}>{meta.label}</p>
        <p className="text-[10px] text-slate-500">{meta.hint}</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
        {dropped.length === 0 ? (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-lg">
            {dragging ? "📥" : "?"}
          </div>
        ) : (
          dropped.map((f) => (
            <motion.div
              key={f}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border-2 border-amber-200 shadow-md flex flex-col items-center justify-center"
            >
              <span className="text-xl sm:text-2xl">{FRUITS[f].emoji}</span>
              <span className="text-[9px] font-bold text-slate-600">{FRUITS[f].label}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function FruitCard({ id, fruit, isSelected, isPlaced, onSelect, onDragStart, onDragEnd }: {
  id: FruitId;
  fruit: { emoji: string; label: string };
  isSelected: boolean;
  isPlaced: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent, id: FruitId) => void;
  onDragEnd: () => void;
}) {
  return (
    <motion.button
      whileHover={!isPlaced ? { scale: 1.08, y: -4 } : undefined}
      whileTap={!isPlaced ? { scale: 0.95 } : undefined}
      onClick={onSelect}
      draggable={!isPlaced}
      onDragStart={(e) => !isPlaced && onDragStart(e as unknown as React.DragEvent, id)}
      onDragEnd={onDragEnd}
      disabled={isPlaced}
      className={`flex flex-col items-center gap-1.5 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl border-[3px] transition-all min-w-[80px] sm:min-w-[100px] ${
        isPlaced
          ? "bg-slate-100 border-slate-200 opacity-40 cursor-not-allowed"
          : isSelected
          ? "bg-indigo-50 border-indigo-500 shadow-[0_0_16px_rgba(99,102,241,0.4)] ring-4 ring-indigo-500/20 scale-105"
          : "bg-white border-amber-200 hover:border-amber-400 hover:shadow-lg cursor-grab active:cursor-grabbing"
      }`}
    >
      <span className="text-3xl sm:text-4xl">{fruit.emoji}</span>
      <span className={`text-xs sm:text-sm font-black ${isSelected ? "text-indigo-700" : "text-slate-700"}`}>{fruit.label}</span>
      {isPlaced && <span className="text-[10px] text-slate-400">✓ ditempatkan</span>}
    </motion.button>
  );
}

export default function Module2IntroFruit() {
  const nav = useNavigate();
  const { modules, setModuleIntroCompleted, _hasHydrated } = useProgressStore();
  const mod2IntroCompleted = modules.mod2?.introCompleted ?? false;
  const [questIdx, setQuestIdx] = useState(0);
  const [dropped, setDropped] = useState<Record<ZoneId, FruitId[]>>({ adi: [], both: [], edi: [] });
  const [selected, setSelected] = useState<FruitId | null>(null);
  const [dragging, setDragging] = useState<FruitId | null>(null);
  const [dragOver, setDragOver] = useState<ZoneId | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // If intro was already completed in a previous session (persisted), show celebration immediately
  /* eslint-disable react/set-state-in-effect */
  useEffect(() => {
    if (_hasHydrated && mod2IntroCompleted && !completed) {
      // Re-hydrate dropped to reflect correct placement for visual completeness
      setDropped({ adi: [...EXPECTED.adi], both: [...EXPECTED.both], edi: [...EXPECTED.edi] });
      setCompleted(true);
    }
  }, [_hasHydrated, mod2IntroCompleted, completed]);
  /* eslint-enable react/set-state-in-effect */

  const currentQuest = QUESTS[questIdx];

  // ── Automatic completion: triggers when ALL 4 fruits are correctly placed
  //    regardless of quest order — safety net so students never get stuck
  /* eslint-disable react/set-state-in-effect */
  useEffect(() => {
    if (completed) return;
    const allCorrect =
      dropped.adi.length === EXPECTED.adi.length &&
      dropped.adi.every((f) => EXPECTED.adi.includes(f)) &&
      dropped.both.length === EXPECTED.both.length &&
      dropped.both.every((f) => EXPECTED.both.includes(f)) &&
      dropped.edi.length === EXPECTED.edi.length &&
      dropped.edi.every((f) => EXPECTED.edi.includes(f));
    const totalPlaced = dropped.adi.length + dropped.both.length + dropped.edi.length;
    if (allCorrect && totalPlaced === 4) {
      setCompleted(true);
      setModuleIntroCompleted("mod2");
      toast.success("🎉 Semua buah tepat! Pemanasan selesai!");
    }
  }, [dropped, completed, setModuleIntroCompleted]);
  /* eslint-enable react/set-state-in-effect */

  const placeFruitWith = useCallback(
    (fruitId: FruitId, zone: ZoneId) => {
      if (!fruitId || completed) return;
      const expected = EXPECTED[zone];
      const isCorrect = expected.includes(fruitId);

      if (isCorrect) {
        setDropped((prev) => ({ ...prev, [zone]: [...prev[zone], fruitId] }));
        toast.success("✨ Tepat sekali!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1200);

        // Quest progression (sequential) — the useEffect above handles
        // the true "all-correct" completion even if quests are done out of order
        setTimeout(() => {
          if (zone === QUESTS[questIdx]?.target) {
            if (questIdx < QUESTS.length - 1) {
              setQuestIdx((i) => i + 1);
            }
            // Final completion is handled by the useEffect safety net above
          }
        }, 600);
      } else {
        toast.error("❌ Belum tepat, coba lagi!", { description: `Zonanya salah — baca quest-nya ya!` });
      }
    },
    [completed, questIdx],
  );

  const placeFruit = useCallback(
    (zone: ZoneId) => {
      if (!selected) return;
      placeFruitWith(selected, zone);
      setSelected(null);
    },
    [selected, placeFruitWith],
  );

  // --- HTML5 Drag & Drop (desktop) ---
  const handleDragStart = (e: React.DragEvent, id: FruitId) => {
    if (completed) return;
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDragging(id);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };
  const handleDragOver = (e: React.DragEvent, zone: ZoneId) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(zone); };
  const handleDragLeave = () => setDragOver(null);
  const handleDrop = (e: React.DragEvent, zone: ZoneId) => {
    e.preventDefault();
    const fruitId = e.dataTransfer.getData("text/plain") as FruitId;
    if (fruitId && FRUITS[fruitId]) {
      placeFruitWith(fruitId, zone);
    }
    setDragging(null);
    setDragOver(null);
  };

  // --- Click-to-select + click-to-place (mobile-friendly) ---
  const selectFruit = (id: FruitId) => {
    if (completed || Object.values(dropped).flat().includes(id)) return;
    setSelected(selected === id ? null : id);
  };
  const resetSelection = () => setSelected(null);

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center p-2 sm:p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg, #FCEFC7 0 40px, #FDF6E3 40px 80px)" }} />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-3xl bg-white rounded-[2rem] border-[3px] border-amber-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-400 via-amber-400 to-sky-400 px-4 sm:px-6 py-4 sm:py-5 border-b-[3px] border-amber-500 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)", backgroundSize: "22px 22px" }} />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-[3px] border-amber-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0">🍎</div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">Suka Buah Adi & Edi</h1>
              <p className="text-[10px] sm:text-xs font-bold text-amber-900/80 tracking-widest uppercase">Latihan Diagram Venn — Cari Kesamaan & Perbedaan</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* ── Tab Navigation: Pemanasan vs Lab Pupuk Ajaib ── */}
          <div className="flex gap-2">
            {/* Active tab — Pemanasan Buah */}
            <div className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm ${completed ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm" : "bg-amber-500 border-amber-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]"}`}>
              <span>{completed ? "✅" : "🍎"}</span>
              <span>Pemanasan Buah</span>
              {completed && <span className="hidden sm:inline text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full">Selesai</span>}
            </div>
            {/* Locked / Unlocked tab — Lab Pupuk Ajaib */}
            {completed ? (
              <motion.button
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => nav("/module/2")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm bg-emerald-500 border-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.45)] transition-all"
              >
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>🧪</motion.span>
                <span className="hidden sm:inline">Lab</span> Pupuk Ajaib
                <span className="bg-white text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full">Buka! →</span>
              </motion.button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed">
                <span>🔒</span>
                <span className="hidden sm:inline">Lab</span> Pupuk Ajaib
                <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">Terkunci</span>
              </div>
            )}
          </div>

          {/* Quest Banner */}
          {!completed && (
            <motion.div
              key={questIdx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 relative"
            >
              <div className="absolute -top-2.5 left-4 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest shadow">QUEST {questIdx + 1}/3</div>
              <p className="text-sm sm:text-base font-black text-slate-800 mt-1">{currentQuest.title}</p>
              <p className="text-xs text-slate-500 mt-1">{currentQuest.hint}</p>
              <div className="flex gap-1.5 mt-3">
                {QUESTS.map((q, i) => (
                  <div key={q.id} className={`h-1.5 flex-1 rounded-full transition-all ${i < questIdx ? "bg-emerald-400" : i === questIdx ? "bg-amber-400" : "bg-slate-200"}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Success Feedback */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-white rounded-3xl px-8 py-6 shadow-2xl border-4 border-emerald-400 text-center">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: 0.5 }} className="text-5xl block mb-2">✨</motion.span>
                  <p className="text-lg font-black text-emerald-600">Tepat sekali!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Venn Diagram */}
          <div>
            <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3 text-center">📐 Diagram Venn — Tarik atau Klik Buah ke Zona yang Tepat</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(["adi", "both", "edi"] as ZoneId[]).map((zone) => (
                <div key={zone} onClick={() => selected && placeFruit(zone)} className={selected ? "cursor-pointer" : ""}>
                  <VennDropZone
                    zone={zone}
                    dropped={dropped[zone]}
                    isActive={dragOver === zone || (selected !== null && dragOver === null)}
                    onDrop={(e) => handleDrop(e, zone)}
                    onDragOver={(e) => handleDragOver(e, zone)}
                    onDragLeave={handleDragLeave}
                    dragging={dragging}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-600">Adi: 🍎 Apel, 🍈 Melon, 🍊 Jeruk &nbsp;|&nbsp; Edi: 🍈 Melon, 🍉 Semangka, 🍊 Jeruk</p>
          </div>

          {/* Fruit Rack */}
          <div>
            <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3 text-center">🧺 Rak Buah — Klik untuk pilih, lalu klik zona</p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {(Object.keys(FRUITS) as FruitId[]).map((id) => (
                <FruitCard
                  key={id}
                  id={id}
                  fruit={FRUITS[id]}
                  isSelected={selected === id}
                  isPlaced={Object.values(dropped).flat().includes(id)}
                  onSelect={() => selectFruit(id)}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
            {selected && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-indigo-600 font-bold mt-2">
                ✋ {FRUITS[selected].emoji} {FRUITS[selected].label} dipilih — klik zona di diagram untuk menempatkan
              </motion.p>
            )}
          </div>

          {/* Reset + Emergency skip — visible before completion */}
          {!completed && (
            <div className="flex items-center justify-center gap-4 text-xs">
              <button onClick={resetSelection} className="text-slate-400 hover:text-slate-600 underline underline-offset-2 transition">
                🔄 Reset Pilihan
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => {
                  setModuleIntroCompleted("mod2");
                  nav("/module/2");
                }}
                className="text-slate-400 hover:text-emerald-600 underline underline-offset-2 transition"
              >
                Lewati Pemanasan ➔ Lanjut ke Lab Pupuk
              </button>
            </div>
          )}

          {/* Celebration / Summary */}
          <AnimatePresence>
            {completed && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                {/* Confetti Particles */}
                <div className="relative h-0 pointer-events-none">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                        x: Math.cos((i * 22.5 * Math.PI) / 180) * (80 + (i % 3) * 30),
                        y: Math.sin((i * 22.5 * Math.PI) / 180) * 60 - 40,
                      }}
                      transition={{ duration: 1.8, delay: 0.3 + i * 0.04, ease: "easeOut" }}
                      className="absolute left-1/2 -top-2 text-xl sm:text-2xl"
                      style={{ zIndex: 10 }}
                    >
                      {["🎉", "⭐", "✨", "🌟", "💫", "🎊", "🎈", "🎆"][i % 8]}
                    </motion.span>
                  ))}
                </div>

                {/* Celebration Banner */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 10 }} className="text-5xl sm:text-6xl mb-3 relative">🎉</motion.div>
                  <p className="text-lg sm:text-xl font-black text-emerald-800 relative">Luar Biasa!</p>
                  <p className="text-xs sm:text-sm text-emerald-700 mt-2 relative">Semua buah ini (Apel 🍎, Melon 🍈, Jeruk 🍊, Semangka 🍉) adalah buah yang disukai <b>Adi</b> ATAU <b>Edi</b>!</p>
                  <div className="flex justify-center gap-2 mt-3 relative flex-wrap">
                    {(["adi", "both", "edi"] as ZoneId[]).map((zone) => (
                      <div key={zone} className="bg-white border-2 border-emerald-200 rounded-xl px-3 py-2 text-center">
                        <p className="text-[10px] font-bold text-emerald-600">{ZONE_META[zone].label}</p>
                        <p className="text-lg">{dropped[zone].map((f) => FRUITS[f].emoji).join(" ")}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pak Taro Speech Bubble */}
                <div className="flex gap-3 items-start">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-inner"
                  >
                    👨‍🔬
                  </motion.div>
                  <div className="flex-1 relative">
                    <div className="hidden sm:block absolute -left-2 top-5 w-4 h-4 bg-amber-50 border-l-2 border-b-2 border-amber-200 rotate-45" />
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 shadow-sm relative">
                      <p className="text-[10px] font-black tracking-widest text-amber-700 uppercase mb-1">💬 Pesan Pak Taro</p>
                      <p className="text-sm sm:text-[15px] font-bold text-slate-800 leading-relaxed">
                        🎉 Luar biasa! Kamu sudah paham cara mencari <span className="bg-amber-200 px-1.5 py-0.5 rounded-lg border border-amber-300">irisan</span> dan <span className="bg-sky-100 px-1.5 py-0.5 rounded-lg border border-sky-200">gabungan</span> data.
                        Sekarang, yuk gunakan kemampuan detektifmu untuk memecahkan rahasia <span className="bg-emerald-100 px-1.5 py-0.5 rounded-lg border border-emerald-200">Gelas A–F</span>!
                      </p>
                      <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full -rotate-3 shadow">✨ QUEST COMPLETE</div>
                    </div>
                  </div>
                </div>

                {/* ── Prominent CTA: Clean state switch to Lab Pupuk Ajaib ── */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => nav("/module/2")}
                  className="w-full font-black text-sm sm:text-base tracking-wide py-4 sm:py-5 rounded-2xl border-[3px] text-white border-emerald-700 flex items-center justify-center gap-2 relative overflow-hidden group"
                  style={{ background: "linear-gradient(180deg, #34d399 0%, #059669 40%, #047857 100%)", boxShadow: "0 6px 0 #065f46, 0 8px 20px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.3)" }}
                >
                  <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xl relative">🧪</span>
                  <span className="relative">SELESAI PEMANASAN ➔ LANJUT KE LAB PUPUK AJAIB</span>
                </motion.button>

                {/* Backup navigation: skip or revisit */}
                <div className="flex items-center justify-center gap-4 text-xs">
                  <button
                    onClick={() => nav("/hub")}
                    className="text-slate-400 hover:text-slate-600 underline underline-offset-2 transition"
                  >
                    ← Kembali ke Hub
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => nav("/module/2")}
                    className="text-slate-400 hover:text-slate-600 underline underline-offset-2 transition"
                  >
                    Lewati Pemanasan ➔ Lanjut ke Lab Pupuk
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
