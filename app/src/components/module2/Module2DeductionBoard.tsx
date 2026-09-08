import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { FlowerSVG } from "../shared/FlowerSVG";
import { Button, SecondaryButton } from "../shared/Button";
import { Card } from "../shared/Card";

/* ─── Constants ──────────────────────────────────────────────────── */

type GlassId = "A" | "B" | "C" | "D" | "E" | "F";
type Phase = 1 | 2 | 3;
type WizardStep = "2A" | "2B" | "2C" | "2D";

const BEAKER_TINT = "#E0F2FE";

const GLASS_PROPERTIES: Record<GlassId, string> = {
  A: "Air Biasa (Tanpa Efek)",
  B: "Menumbuhkan Daun",
  C: "Kelopak Berlapis & Putih",
  D: "Tangkai Bergelombang",
  E: "Tengah Bunga Hitam",
  F: "Air Biasa (Tanpa Efek)",
};

const EXP_DATA = [
  {
    id: 1,
    glasses: ["A", "B", "C"],
    traits: ["🌿 Daun", "🌸 Kelopak Berlapis", "⚪ Kelopak Putih"],
  },
  {
    id: 2,
    glasses: ["A", "D", "E"],
    traits: ["〰️ Tangkai Bergelombang", "⚫ Pusat Hitam"],
  },
  {
    id: 3,
    glasses: ["C", "D", "F"],
    traits: ["🌸 Kelopak Berlapis", "⚪ Kelopak Putih", "〰️ Tangkai Bergelombang"],
  },
];

const TRAITS = [
  { id: "daun", label: "🌿 Daun", feature: "Menumbuhkan Daun" },
  { id: "berlapis", label: "🌸 Kelopak Berlapis", feature: "Kelopak Berlapis & Putih" },
  { id: "putih", label: "⚪ Kelopak Putih", feature: "Kelopak Berlapis & Putih" },
  { id: "bergelombang", label: "〰️ Tangkai Bergelombang", feature: "Tangkai Bergelombang" },
  { id: "hitam", label: "⚫ Pusat Hitam", feature: "Tengah Bunga Hitam" },
  { id: "air", label: "💧 Air Biasa", feature: "Air Biasa (Tanpa Efek)" },
] as const;

const CORRECT_ASSIGNMENTS: Record<GlassId, string> = {
  A: "Air Biasa (Tanpa Efek)",
  B: "Menumbuhkan Daun",
  C: "Kelopak Berlapis & Putih",
  D: "Tangkai Bergelombang",
  E: "Tengah Bunga Hitam",
  F: "Air Biasa (Tanpa Efek)",
};

/* ─── Helpers ────────────────────────────────────────────────────── */

function flowerFromAssignments(assignments: Record<string, string>) {
  const vals = Object.values(assignments);
  return {
    hasLeaves: vals.includes("Menumbuhkan Daun"),
    petalLayers: (vals.includes("Kelopak Berlapis & Putih") ? 2 : 1) as 1 | 2,
    petalColor: (vals.includes("Kelopak Berlapis & Putih") ? "white" : "default") as "white" | "default",
    stemType: (vals.includes("Tangkai Bergelombang") ? "wavy" : "normal") as "normal" | "wavy",
    centerColor: (vals.includes("Tengah Bunga Hitam") ? "black" : "default") as "black" | "default",
  };
}

/* ─── Sortable Beaker Item (Phase 3) ────────────────────────────── */

function SortableBeakerItem({ id, disabled }: { id: GlassId; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `beaker-${id}`,
    data: { type: "beaker", id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 cursor-grab active:cursor-grabbing select-none transition-all
        ${disabled
          ? "opacity-30 border-slate-600 bg-slate-800 cursor-not-allowed"
          : "border-slate-600 bg-slate-800 hover:border-indigo-500 hover:scale-105 shadow-md"
        }`}
    >
      <div className="w-9 h-12 relative flex items-end justify-center border-2 border-slate-300 rounded-b-lg overflow-hidden bg-white/80">
        <div className="w-full rounded-b-sm opacity-70" style={{ backgroundColor: BEAKER_TINT, height: "62%" }} />
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-700">{id}</span>
      </div>
      <span className="text-[10px] font-bold text-slate-300 mt-1">{id}</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */

interface Module2DeductionBoardProps {
  onComplete: (assignments: Record<string, string>) => void;
}

export function Module2DeductionBoard({ onComplete }: Module2DeductionBoardProps) {
  /* Phase / Wizard state */
  const [phase, setPhase] = useState<Phase>(1);
  const [wizardStep, setWizardStep] = useState<WizardStep>("2A");
  const [sharedTraits, setSharedTraits] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  /* Drag & Drop state */
  const [beakerOrder, setBeakerOrder] = useState<GlassId[]>(["A", "B", "C", "D", "E", "F"]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  /* DnD Sensors */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /* All 6 beakers placed? */
  const allPlaced = useMemo(
    () => Object.keys(assignments).filter((k) => k.startsWith("trait-")).length === TRAITS.length,
    [assignments],
  );

  /* ── Phase Navigation ── */

  const goToPhase2 = () => {
    setPhase(2);
    setWizardStep("2A");
    toast.info(" fase 2: Saatnya menyelidiki!");
  };

  const goToPhase3 = () => {
    setPhase(3);
    toast.success(" Fase 3: Papan Deduksi Terbuka!");
  };

  /* ── Wizard Handlers (Phase 2) ── */

  const handleBeakerSelect = (id: string) => {
    if (id === "C") {
      toast.success("Benar! Gelas C muncul di KEDUA eksperimen!");
      setTimeout(() => setWizardStep("2B"), 1200);
    } else {
      toast.error(` ${id} tidak muncul di kedua eksperimen. Coba lagi!`);
    }
  };

  const handleTraitToggle = (trait: string) => {
    setSharedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait],
    );
  };

  const handleTraitConfirm = () => {
    const correct = ["🌸 Kelopak Berlapis", "⚪ Kelopak Putih"];
    const isCorrect =
      sharedTraits.length === correct.length && correct.every((t) => sharedTraits.includes(t));
    if (isCorrect) {
      setWizardStep("2C");
      setShowCelebration(true);
      toast.success("🎉 Luar Biasa! Gelas C = Kelopak Berlapis & Putih!");
      setTimeout(() => {
        setShowCelebration(false);
        setWizardStep("2D");
      }, 2200);
    } else {
      toast.warning("🔍 Coba lagi — ciri apa yang SAMA muncul di EXP 1 & 3?");
    }
  };

  const handleWaterSelect = (answer: string) => {
    if (answer === "air") {
      toast.success(" Benar! Gelas A = Air Biasa (Tanpa Khasiat)!");
      setTimeout(() => goToPhase3(), 1400);
    } else {
      toast.error(" Coba pikirkan lagi — jika A sudah punya khasiat, kenapa EXP 1 & 2 beda?");
    }
  };

  /* ── Drag & Drop Handlers (Phase 3) ── */

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      /* Beaker → Trait Slot drop */
      if (activeData?.type === "beaker" && overData?.type === "trait-slot") {
        const beakerId = activeData.id as GlassId;
        const traitId = overData.traitId as string;
        setAssignments((prev) => {
          const next = { ...prev };
          /* Remove this beaker from any previous slot */
          for (const [k, v] of Object.entries(next)) {
            if (k.startsWith("trait-") && v === beakerId) delete next[k];
          }
          next[`trait-${traitId}`] = beakerId;
          return next;
        });
        /* Remove from the sortable beaker list */
        setBeakerOrder((prev) => prev.filter((b) => b !== beakerId));
        return;
      }

      /* Beaker ↔ Beaker reorder */
      if (activeData?.type === "beaker" && overData?.type === "beaker") {
        const oldIdx = beakerOrder.indexOf(activeData.id as GlassId);
        const newIdx = beakerOrder.indexOf(overData.id as GlassId);
        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
          setBeakerOrder(arrayMove(beakerOrder, oldIdx, newIdx));
        }
      }
    },
    [beakerOrder],
  );

  /* Click-to-place fallback (mobile-friendly) */
  const handleBeakerClick = (beakerId: GlassId) => {
    /* Find the first empty trait slot */
    const emptySlot = TRAITS.find((t) => !assignments[`trait-${t.id}`]);
    if (emptySlot) {
      setAssignments((prev) => ({ ...prev, [`trait-${emptySlot.id}`]: beakerId }));
      setBeakerOrder((prev) => prev.filter((b) => b !== beakerId));
      toast.success(`Gelas ${beakerId} → ${emptySlot.label}`);
    }
  };

  const handleSlotRemove = (traitId: string) => {
    const beakerId = assignments[`trait-${traitId}`] as GlassId | undefined;
    if (beakerId) {
      setAssignments((prev) => {
        const next = { ...prev };
        delete next[`trait-${traitId}`];
        return next;
      });
      setBeakerOrder((prev) => [...prev, beakerId].sort());
    }
  };

  const handleVerify = () => {
    /* Build final assignments from the trait slots */
    const final: Record<string, string> = {};
    let allCorrect = true;
    for (const t of TRAITS) {
      const beakerId = assignments[`trait-${t.id}`];
      if (!beakerId) {
        toast.error("Lengkapi semua slot dulu!");
        return;
      }
      final[beakerId] = t.feature;
    }
    /* Check correctness */
    for (const [k, v] of Object.entries(final)) {
      if (CORRECT_ASSIGNMENTS[k as GlassId] !== v) allCorrect = false;
    }
    if (allCorrect) {
      toast.success("🏆 Semua benar! Pupuk Ajaib berhasil diidentifikasi!");
      setTimeout(() => onComplete(final), 1500);
    } else {
      toast.warning("🔍 Ada yang belum cocok. Coba cek lagi polanya!");
    }
  };

  /* ── Active Drag Item ── */

  const activeBeaker = activeId ? activeId.replace("beaker-", "") : null;

  /* ── Phase Labels ── */
  const phaseLabels: Record<Phase, string> = {
    1: "📋 Fase 1: Kartu Bukti",
    2: "🔍 Fase 2: Panduan Deduksi",
    3: "🧩 Fase 3: Papan Penugasan",
  };

  /* ═══════════════════════════════════════════════════════════════ */
  /* RENDER                                                          */
  /* ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-5">
      {/* Phase Progress Bar */}
      <div className="flex items-center gap-3 bg-white rounded-card border border-muted px-5 py-3 shadow-sm">
        <span className="text-sm font-bold text-primary">Phase Progress</span>
        <div className="flex-1 flex gap-2">
          {([1, 2, 3] as Phase[]).map((p) => (
            <div key={p} className="flex-1 h-3 rounded-full overflow-hidden bg-muted">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: phase >= p ? "100%" : phase === p - 1 ? "30%" : "0%",
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  backgroundColor:
                    p === 1 ? "#38a169" : p === 2 ? "#d69e2e" : phase >= 3 ? "#e53e3e" : "#cbd5e0",
                }}
              />
            </div>
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-600">{phaseLabels[phase]}</span>
      </div>

      {/* ═══ PHASE 1: Evidence Cards ═══════════════════════════════ */}
      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.div
            key="phase1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <h2 className="text-lg font-bold text-primary mb-1">
                📋 Fase 1 — Kartu Bukti Eksperimen
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Amati ketiga eksperimen ini. Catat gelas mana yang muncul dan ciri bunga apa yang
                dihasilkan — ini akan membantumu di fase berikutnya.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-5">
                {EXP_DATA.map((exp, idx) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15, duration: 0.4 }}
                    className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold bg-slate-800 text-white px-3 py-1 rounded-full">
                        EXP {exp.id}
                      </span>
                      <div className="flex gap-1">
                        {exp.glasses.map((g) => (
                          <span
                            key={g}
                            className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center my-2">
                      <span className="text-xl">➔</span>
                    </div>

                    {/* Flower Preview */}
                    <div className="flex justify-center my-2 bg-gradient-to-b from-slate-50 to-white rounded-xl py-3 border border-slate-100">
                      <FlowerSVG
                        {...flowerFromAssignments(
                          Object.fromEntries(exp.glasses.map((g) => [g, GLASS_PROPERTIES[g as GlassId]])),
                        )}
                        className="w-20 h-32"
                        animate={false}
                      />
                    </div>

                    {/* Traits */}
                    <div className="space-y-1.5 mt-3">
                      {exp.traits.map((t) => (
                        <div
                          key={t}
                          className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5"
                        >
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={goToPhase2} className="px-8">
                  Mulai Penyelidikan →
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ═══ PHASE 2: Guided Deduction Wizard ════════════════════ */}
        {phase === 2 && (
          <motion.div
            key="phase2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <h2 className="text-lg font-bold text-primary mb-1">
                🔍 Fase 2 — Panduan Deduksi
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Ikuti langkah-langkah berikut untuk menemukan isi setiap gelas secara logis.
              </p>

              {/* Step 2A: Identify Shared Beaker */}
              {wizardStep === "2A" && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                    <p className="font-bold text-amber-800 text-sm">Pertanyaan 2A</p>
                    <p className="text-slate-700 mt-1">
                      Bandingkan <strong>Eksperimen 1 (A, B, C)</strong> dan{" "}
                      <strong>Eksperimen 3 (C, D, F)</strong>. Gelas mana yang muncul di{" "}
                      <strong>KEDUANYA</strong>?
                    </p>
                  </div>

                  {/* Visual Comparison */}
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="bg-slate-100 rounded-xl px-4 py-2 text-center border border-slate-200">
                      <span className="text-xs text-slate-500">EXP 1</span>
                      <div className="flex gap-1 mt-1">
                        {["A", "B", "C"].map((g) => (
                          <span key={g} className="bg-white border border-slate-300 rounded-full px-2 py-0.5 text-xs font-bold">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-2xl text-slate-400">∩</span>
                    <div className="bg-slate-100 rounded-xl px-4 py-2 text-center border border-slate-200">
                      <span className="text-xs text-slate-500">EXP 3</span>
                      <div className="flex gap-1 mt-1">
                        {["C", "D", "F"].map((g) => (
                          <span key={g} className="bg-white border border-slate-300 rounded-full px-2 py-0.5 text-xs font-bold">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Beaker Selection Buttons */}
                  <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
                    {(["A", "B", "C", "D", "E", "F"] as GlassId[]).map((id) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBeakerSelect(id)}
                        className="flex flex-col items-center p-2 rounded-xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                      >
                        <div className="w-8 h-11 relative flex items-end justify-center border-2 border-slate-300 rounded-b-lg overflow-hidden bg-white/80">
                          <div className="w-full rounded-b-sm opacity-70" style={{ backgroundColor: BEAKER_TINT, height: "62%" }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">
                            {id}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 mt-1">Gelas {id}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2B: Identify Shared Trait */}
              {wizardStep === "2B" && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4">
                    <p className="font-bold text-blue-800 text-sm">Pertanyaan 2B</p>
                    <p className="text-slate-700 mt-1">
                      Ciri bunga apa yang <strong>SAMA-SAMA MUNCUL</strong> di Eksperimen 1 dan 3?
                      <br />
                      <span className="text-xs text-slate-500">(Pilih semua yang sesuai)</span>
                    </p>
                  </div>

                  {/* Visual: Shared Beaker C */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-slate-100 rounded-xl px-4 py-2 text-center border border-slate-200">
                      <span className="text-xs text-slate-500">EXP 1</span>
                      <div className="flex gap-1 mt-1">
                        {["A", "B", "C"].map((g) => (
                          <span
                            key={g}
                            className={`rounded-full px-2 py-0.5 text-xs font-bold border ${
                              g === "C"
                                ? "bg-amber-200 border-amber-400 text-amber-800"
                                : "bg-white border-slate-300"
                            }`}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xl text-amber-500 font-bold">→</span>
                    <div className="bg-amber-100 rounded-xl px-4 py-2 text-center border-2 border-amber-300">
                      <span className="text-xs text-amber-700 font-bold">GELAS C</span>
                    </div>
                    <span className="text-xl text-amber-500 font-bold">←</span>
                    <div className="bg-slate-100 rounded-xl px-4 py-2 text-center border border-slate-200">
                      <span className="text-xs text-slate-500">EXP 3</span>
                      <div className="flex gap-1 mt-1">
                        {["C", "D", "F"].map((g) => (
                          <span
                            key={g}
                            className={`rounded-full px-2 py-0.5 text-xs font-bold border ${
                              g === "C"
                                ? "bg-amber-200 border-amber-400 text-amber-800"
                                : "bg-white border-slate-300"
                            }`}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Trait Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                    {EXP_DATA[0].traits.concat(EXP_DATA[2].traits.filter((t) => !EXP_DATA[0].traits.includes(t))).map((trait) => (
                      <motion.button
                        key={trait}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTraitToggle(trait)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm ${
                          sharedTraits.includes(trait)
                            ? "border-green-400 bg-green-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs ${
                            sharedTraits.includes(trait) ? "border-green-500 bg-green-500 text-white" : "border-slate-300"
                          }`}
                        >
                          {sharedTraits.includes(trait) ? "✓" : ""}
                        </span>
                        <span>{trait}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={handleTraitConfirm} disabled={sharedTraits.length === 0}>
                      ✅ Konfirmasi Pilihan
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2C: Eureka Moment */}
              {wizardStep === "2C" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  {showCelebration && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="text-6xl mb-4"
                    >
                      🎉
                    </motion.div>
                  )}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 max-w-md mx-auto">
                    <p className="text-2xl font-black text-green-700 mb-2">🎉 Luar Biasa!</p>
                    <p className="text-slate-700">
                      Artinya <strong>GELAS C = Pupuk Kelopak Berlapis & Putih!</strong>
                    </p>
                    <div className="flex justify-center mt-4">
                      <FlowerSVG
                        petalLayers={2}
                        petalColor="white"
                        className="w-24 h-36"
                        animate
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2D: Discovering Water */}
              {wizardStep === "2D" && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-purple-50 border-l-4 border-purple-400 rounded-r-xl p-4">
                    <p className="font-bold text-purple-800 text-sm">Pertanyaan 2D</p>
                    <p className="text-slate-700 mt-1">
                      Jika <strong>Gelas C = Kelopak Berlapis & Putih</strong> dan{" "}
                      <strong>Gelas B = Daun</strong>, apa isi <strong>Gelas A</strong>?
                    </p>
                  </div>

                  {/* Visual Reasoning Chain */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto">
                    <p className="text-xs text-slate-500 font-semibold mb-2">🧠 rantai penalaran:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 border border-amber-300 rounded-full px-2 py-0.5 text-xs font-bold">Gelas C</span>
                        <span>=</span>
                        <span>🌸 Kelopak Berlapis & Putih</span>
                        <span className="text-green-600">✓</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 border border-amber-300 rounded-full px-2 py-0.5 text-xs font-bold">Gelas B</span>
                        <span>=</span>
                        <span>🌿 Daun</span>
                        <span className="text-green-600">✓</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-200 border border-slate-300 rounded-full px-2 py-0.5 text-xs font-bold">Gelas A</span>
                          <span>=</span>
                          <span className="text-slate-500 italic">???</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Option Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleWaterSelect("hitam")}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-red-300 hover:bg-red-50 transition-all"
                    >
                      <span className="text-2xl">⚫</span>
                      <span className="font-semibold text-sm">Pupuk Hitam</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleWaterSelect("air")}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <span className="text-2xl">💧</span>
                      <div className="text-left">
                        <span className="font-semibold text-sm block">Air Biasa</span>
                        <span className="text-[11px] text-slate-500">(Tanpa Khasiat)</span>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}

        {/* ═══ PHASE 3: Drag & Drop Board ═════════════════════════ */}
        {phase === 3 && (
          <motion.div
            key="phase3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <h2 className="text-lg font-bold text-primary mb-1">
                🧩 Fase 3 — Papan Penugasan Deduksi
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Sekarang kamu sudah mengerti cara mengisolasi variabel! Seret setiap gelas ke slot ciri
                yang sesuai, atau klik gelas lalu klik slot.
              </p>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left: Draggable Beakers */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                      🧴 Gelas Tersedia{" "}
                      <span className="text-slate-400 font-normal">({beakerOrder.length})</span>
                    </p>
                    <SortableContext items={beakerOrder.map((b) => `beaker-${b}`)} strategy={verticalListSortingStrategy}>
                      <div className="grid grid-cols-3 gap-2">
                        {beakerOrder.map((id) => (
                          <div key={id} onClick={() => handleBeakerClick(id)}>
                            <SortableBeakerItem id={id} />
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                    {beakerOrder.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">
                        Semua gelas sudah ditempatkan!
                      </p>
                    )}
                  </div>

                  {/* Right: Trait Drop Slots */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                      🎯 Slot Ciri Bunga
                    </p>
                    {TRAITS.map((trait) => {
                      const placedBeaker = assignments[`trait-${trait.id}`] as GlassId | undefined;
                      return (
                        <TraitDropSlot
                          key={trait.id}
                          traitId={trait.id}
                          traitLabel={trait.label}
                          placedBeaker={placedBeaker ?? null}
                          onRemove={() => handleSlotRemove(trait.id)}
                        />
                      );
                    })}
                  </div>
                </div>

                <DragOverlay dropAnimation={null}>
                  {activeBeaker ? (
                    <div className="flex flex-col items-center p-2 rounded-xl border-2 border-indigo-500 bg-indigo-50 shadow-xl opacity-90 rotate-3 scale-110">
                      <div className="w-9 h-12 relative flex items-end justify-center border-2 border-slate-300 rounded-b-lg overflow-hidden bg-white/80">
                        <div className="w-full rounded-b-sm opacity-70" style={{ backgroundColor: BEAKER_TINT, height: "62%" }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-700">
                          {activeBeaker}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 mt-1">{activeBeaker}</span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              {/* Verify & Complete */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  <SecondaryButton onClick={() => { setPhase(1); setWizardStep("2A"); }}>
                    ← Kembali
                  </SecondaryButton>
                  <Button onClick={handleVerify} disabled={!allPlaced} className="px-8">
                    🔬 Verifikasi Jawaban
                  </Button>
                </div>

                {/* Live Flower Preview */}
                {allPlaced && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center"
                  >
                    <p className="text-xs text-slate-500 mb-2">Preview bunga dari hipotesismu:</p>
                    <FlowerSVG {...flowerFromAssignments(assignments)} className="w-28 h-40" animate />
                    <div className="flex flex-wrap gap-1 mt-2 justify-center">
                      {TRAITS.map((t) => {
                        const bid = assignments[`trait-${t.id}`];
                        return bid ? (
                          <span key={t.id} className="text-[10px] bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                            {bid}→{t.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Trait Drop Slot Sub-Component ──────────────────────────────── */

function TraitDropSlot({
  traitId,
  traitLabel,
  placedBeaker,
  onRemove,
}: {
  traitId: string;
  traitLabel: string;
  placedBeaker: GlassId | null;
  onRemove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `trait-${traitId}`,
    data: { type: "trait-slot", traitId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
        isOver
          ? "border-indigo-400 bg-indigo-50 shadow-md scale-[1.02]"
          : placedBeaker
            ? "border-green-300 bg-green-50"
            : "border-dashed border-slate-300 bg-white hover:border-slate-400"
      }`}
    >
      <span className="text-lg shrink-0">{traitLabel.split(" ")[0]}</span>
      <span className="text-sm font-medium text-slate-700 flex-1">{traitLabel}</span>
      {placedBeaker ? (
        <div className="flex items-center gap-1.5">
          <span className="bg-green-100 border border-green-300 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
            🧴 Gelas {placedBeaker}
          </span>
          <button
            onClick={onRemove}
            className="text-xs bg-slate-200 hover:bg-red-200 rounded-full w-6 h-6 flex items-center justify-center transition"
          >
            ×
          </button>
        </div>
      ) : (
        <span className="text-[11px] text-slate-400 italic">Drop di sini</span>
      )}
    </div>
  );
}


