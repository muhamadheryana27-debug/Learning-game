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

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & TYPES
   ═══════════════════════════════════════════════════════════════════ */

type GlassId = "A" | "B" | "C" | "D" | "E" | "F";
type Phase = 1 | 2 | 3;
type WizardStep = "2A" | "2B" | "2C" | "2D" | "2E" | "2F";

const BEAKER_TINT = "#E0F2FE";

const GLASS_PROPERTIES: Record<GlassId, string> = {
  A: "Kelopak Ganda",
  B: "Menumbuhkan Daun",
  C: "Kelopak Putih",
  D: "Air Biasa (Tanpa Efek)",
  E: "Pusat Hitam",
  F: "Tangkai Bergelombang",
};

const EXP_DATA = [
  {
    id: 1,
    glasses: ["A", "B", "C"],
    traits: ["🌸 Kelopak Ganda", "⚪ Kelopak Putih", "🌿 Daun"],
    emoji: "🧪",
    color: "from-emerald-50 to-green-50",
    border: "border-emerald-300",
    badge: "bg-emerald-600",
  },
  {
    id: 2,
    glasses: ["A", "D", "E"],
    traits: ["🌸 Kelopak Ganda", "⚫ Pusat Hitam"],
    emoji: "🔬",
    color: "from-violet-50 to-purple-50",
    border: "border-violet-300",
    badge: "bg-violet-600",
  },
  {
    id: 3,
    glasses: ["C", "D", "F"],
    traits: ["⚪ Kelopak Putih", "〰️ Tangkai Bergelombang"],
    emoji: "⚗️",
    color: "from-amber-50 to-orange-50",
    border: "border-amber-300",
    badge: "bg-amber-600",
  },
];

const TRAITS = [
  { id: "ganda", label: "🌸 Kelopak Ganda", feature: "Kelopak Ganda" },
  { id: "daun", label: "🌿 Daun", feature: "Menumbuhkan Daun" },
  { id: "putih", label: "⚪ Kelopak Putih", feature: "Kelopak Putih" },
  { id: "hitam", label: "⚫ Pusat Hitam", feature: "Pusat Hitam" },
  { id: "bergelombang", label: "〰️ Tangkai Bergelombang", feature: "Tangkai Bergelombang" },
  { id: "air", label: "💧 Air Biasa", feature: "Air Biasa (Tanpa Efek)" },
] as const;

const CORRECT_ASSIGNMENTS: Record<GlassId, string> = {
  A: "Kelopak Ganda",
  B: "Menumbuhkan Daun",
  C: "Kelopak Putih",
  D: "Air Biasa (Tanpa Efek)",
  E: "Pusat Hitam",
  F: "Tangkai Bergelombang",
};

const WIZARD_STEPS: { key: WizardStep; label: string; icon: string }[] = [
  { key: "2A", label: "Gelas A", icon: "🔍" },
  { key: "2B", label: "Ganda", icon: "🌸" },
  { key: "2C", label: "Gelas C", icon: "🔍" },
  { key: "2D", label: "Putih", icon: "⚪" },
  { key: "2E", label: "Air D", icon: "💧" },
  { key: "2F", label: "Gelas F", icon: "〰️" },
];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function flowerFromAssignments(assignments: Record<string, string>) {
  const vals = Object.values(assignments);
  return {
    hasLeaves: vals.includes("Menumbuhkan Daun"),
    petalLayers: (vals.includes("Kelopak Ganda") ? 2 : 1) as 1 | 2,
    petalColor: (vals.includes("Kelopak Putih") ? "white" : "default") as "white" | "default",
    stemType: (vals.includes("Tangkai Bergelombang") ? "wavy" : "normal") as "normal" | "wavy",
    centerColor: (vals.includes("Pusat Hitam") ? "black" : "default") as "black" | "default",
  };
}

/* ═══════════════════════════════════════════════════════════════════
   BEAKER COMPONENT (reusable)
   ═══════════════════════════════════════════════════════════════════ */

function BeakerVisual({
  id,
  size = "md",
  tint = BEAKER_TINT,
}: {
  id: string;
  size?: "sm" | "md" | "lg";
  tint?: string;
}) {
  const dims = {
    sm: { w: "w-7", h: "h-9", fs: "text-[9px]", inner: "text-[8px]" },
    md: { w: "w-9", h: "h-12", fs: "text-[11px]", inner: "text-[10px]" },
    lg: { w: "w-11", h: "h-14", fs: "text-sm", inner: "text-[11px]" },
  }[size];

  return (
    <div
      className={`${dims.w} ${dims.h} relative flex items-end justify-center border-2 border-slate-300 rounded-b-lg overflow-hidden bg-white/80`}
    >
      <div
        className="w-full rounded-b-sm opacity-70"
        style={{ backgroundColor: tint, height: "62%" }}
      />
      <span
        className={`absolute inset-0 flex items-center justify-center ${dims.inner} font-black text-slate-700`}
      >
        {id}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SORTABLE BEAKER (Phase 3)
   ═══════════════════════════════════════════════════════════════════ */

function SortableBeakerItem({ id }: { id: GlassId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `beaker-${id}`,
    data: { type: "beaker", id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : ("auto" as const),
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center justify-center p-2 rounded-xl border-2 cursor-grab active:cursor-grabbing select-none transition-all border-amber-400 bg-amber-50 hover:border-amber-500 hover:bg-amber-100 shadow-md hover:shadow-lg"
    >
      <BeakerVisual id={id} />
      <span className="text-[10px] font-bold text-amber-800 mt-1">
        Gelas {id}
      </span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TRAIT DROP SLOT (Phase 3)
   ═══════════════════════════════════════════════════════════════════ */

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
    <motion.div
      ref={setNodeRef}
      layout
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
        isOver
          ? "border-amber-400 bg-amber-50 shadow-md scale-[1.02]"
          : placedBeaker
            ? "border-green-300 bg-green-50"
            : "border-dashed border-slate-300 bg-white hover:border-slate-400"
      }`}
    >
      <span className="text-lg shrink-0">{traitLabel.split(" ")[0]}</span>
      <span className="text-sm font-medium text-slate-700 flex-1">
        {traitLabel}
      </span>
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
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

interface Module2DeductionBoardProps {
  onComplete: (assignments: Record<string, string>) => void;
}

export function Module2DeductionBoard({
  onComplete,
}: Module2DeductionBoardProps) {
  /* ── Core state ── */
  const [phase, setPhase] = useState<Phase>(1);
  const [wizardStep, setWizardStep] = useState<WizardStep>("2A");
  const [sharedTraits, setSharedTraits] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  /* ── DnD state ── */
  const [beakerOrder, setBeakerOrder] = useState<GlassId[]>([
    "A", "B", "C", "D", "E", "F",
  ]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  /* ── DnD sensors ── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /* ── All placed? ── */
  const allPlaced = useMemo(
    () =>
      Object.keys(assignments).filter((k) => k.startsWith("trait-")).length ===
      TRAITS.length,
    [assignments],
  );

  /* ── Wizard step index ── */
  const wizardIdx = WIZARD_STEPS.findIndex((s) => s.key === wizardStep);

  /* ═══════════════════════════════════════════════════════════════════
     PHASE NAVIGATION
     ═══════════════════════════════════════════════════════════════════ */

  const goToPhase2 = () => {
    setPhase(2);
    setWizardStep("2A");
    toast.info("Fase 2: Saatnya menyelidiki!");
  };

  const goToPhase3 = () => {
    setPhase(3);
    toast.success("Fase 3: Papan Deduksi Terbuka!");
  };

  /* ═══════════════════════════════════════════════════════════════════
     WIZARD HANDLERS (Phase 2) — revised elimination flow
     ═══════════════════════════════════════════════════════════════════ */

  const handleBeakerSelectA = (id: string) => {
    if (id === "A") {
      toast.success("Benar! Gelas A ada di Eksperimen 1 & 2!");
      setTimeout(() => setWizardStep("2B"), 1100);
    } else {
      toast.error(`${id} tidak muncul di kedua eksperimen. Coba lagi!`);
    }
  };

  const handleBeakerSelectC = (id: string) => {
    if (id === "C") {
      toast.success("Benar! Gelas C ada di Eksperimen 1 & 3!");
      setTimeout(() => {
        setSharedTraits([]);
        setWizardStep("2D");
      }, 1100);
    } else {
      toast.error(`${id} tidak muncul di kedua eksperimen. Coba lagi!`);
    }
  };

  const handleTraitToggle = (trait: string) => {
    setSharedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait],
    );
  };

  const handleTraitConfirmGanda = () => {
    const correct = ["🌸 Kelopak Ganda"];
    const isCorrect =
      sharedTraits.length === correct.length &&
      correct.every((t) => sharedTraits.includes(t));
    if (isCorrect) {
      setShowCelebration(true);
      toast.success("🎉 Tepat! Gelas A = Kelopak Ganda!");
      setTimeout(() => {
        setShowCelebration(false);
        setSharedTraits([]);
        setWizardStep("2C");
      }, 2000);
    } else {
      toast.warning("Coba lagi — ciri apa yang SAMA di EXP 1 & 2?");
    }
  };

  const handleTraitConfirmPutih = () => {
    const correct = ["⚪ Kelopak Putih"];
    const isCorrect =
      sharedTraits.length === correct.length &&
      correct.every((t) => sharedTraits.includes(t));
    if (isCorrect) {
      setShowCelebration(true);
      toast.success("🎉 Tepat! Gelas C = Kelopak Putih!");
      setTimeout(() => {
        setShowCelebration(false);
        setWizardStep("2E");
      }, 2000);
    } else {
      toast.warning("Coba lagi — ciri apa yang SAMA di EXP 1 & 3?");
    }
  };

  const handleWaterMaster = (answer: string) => {
    if (answer === "tidak") {
      setShowCelebration(true);
      toast.success("🎉 Tepat sekali! Karena Gelas D ada di keduanya tapi tidak ada khasiat yang terbawa, maka GELAS D = AIR BIASA!");
      setTimeout(() => {
        setShowCelebration(false);
        setWizardStep("2F");
      }, 2600);
    } else {
      toast.error("Coba periksa lagi — bandingkan daftar ciri EXP 2 dan EXP 3, ada yang sama?");
    }
  };

  const handleWavySelect = (id: string) => {
    if (id === "F") {
      toast.success("Benar! Gelas F = Tangkai Bergelombang!");
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        goToPhase3();
      }, 1600);
    } else if (id === "D") {
      toast.error("Gelas D sudah terbukti Air Biasa — tidak punya khasiat.");
    } else {
      toast.error("Gelas C = Kelopak Putih, bukan Bergelombang. Coba lagi!");
    }
  };

  /* ═══════════════════════════════════════════════════════════════════
     DND HANDLERS (Phase 3)
     ═══════════════════════════════════════════════════════════════════ */

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

      if (activeData?.type === "beaker" && overData?.type === "trait-slot") {
        const beakerId = activeData.id as GlassId;
        const traitId = overData.traitId as string;
        setAssignments((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(next)) {
            if (k.startsWith("trait-") && v === beakerId) delete next[k];
          }
          next[`trait-${traitId}`] = beakerId;
          return next;
        });
        setBeakerOrder((prev) => prev.filter((b) => b !== beakerId));
        return;
      }

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

  const handleBeakerClick = (beakerId: GlassId) => {
    const emptySlot = TRAITS.find((t) => !assignments[`trait-${t.id}`]);
    if (emptySlot) {
      setAssignments((prev) => ({
        ...prev,
        [`trait-${emptySlot.id}`]: beakerId,
      }));
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
    for (const [k, v] of Object.entries(final)) {
      if (CORRECT_ASSIGNMENTS[k as GlassId] !== v) allCorrect = false;
    }
    if (allCorrect) {
      toast.success("Semua benar! Pupuk Ajaib berhasil diidentifikasi!");
      setTimeout(() => onComplete(final), 1500);
    } else {
      toast.warning("Ada yang belum cocok. Coba cek lagi polanya!");
    }
  };

  const activeBeaker = activeId ? activeId.replace("beaker-", "") : null;

  const phaseLabels: Record<Phase, string> = {
    1: "Fase 1: Kartu Bukti",
    2: "Fase 2: Panduan Deduksi",
    3: "Fase 3: Papan Penugasan",
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-5">
      {/* ── Global Phase Progress Bar ── */}
      <div className="flex items-center gap-3 bg-white rounded-card border border-muted px-5 py-3 shadow-sm">
        <span className="text-sm font-bold text-primary shrink-0">
          Detektif Progress
        </span>
        <div className="flex-1 flex gap-2">
          {([1, 2, 3] as Phase[]).map((p) => (
            <div
              key={p}
              className="flex-1 h-3 rounded-full overflow-hidden bg-muted"
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width:
                    phase >= p
                      ? "100%"
                      : phase === p - 1
                        ? "30%"
                        : "0%",
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  backgroundColor:
                    p === 1
                      ? "#38a169"
                      : p === 2
                        ? "#d69e2e"
                        : phase >= 3
                          ? "#e53e3e"
                          : "#cbd5e0",
                }}
              />
            </div>
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-600 shrink-0">
          {phaseLabels[phase]}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════════
            PHASE 1 — EVIDENCE CARDS
            ═══════════════════════════════════════════════════════════ */}
        {phase === 1 && (
          <motion.div
            key="phase1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50/40 to-white">
              {/* Header */}
              <div className="flex items-start gap-3 mb-1">
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="text-3xl"
                >
                  📋
                </motion.span>
                <div>
                  <h2 className="text-lg font-bold text-primary">
                    Fase 1 — Kartu Bukti Eksperimen
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Amati ketiga eksperimen ini. Catat gelas mana yang muncul
                    dan ciri bunga apa yang dihasilkan — ini akan membantumu di
                    fase berikutnya!
                  </p>
                </div>
              </div>

              {/* Detective Notebook Divider */}
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-amber-200" />
                <span className="text-xs text-amber-500 font-semibold tracking-wider uppercase">
                  📓 Catatan Detektif
                </span>
                <div className="flex-1 h-px bg-amber-200" />
              </div>

              {/* Evidence Cards Grid */}
              <div className="grid md:grid-cols-3 gap-4 mb-5">
                {EXP_DATA.map((exp, idx) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 30, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      delay: idx * 0.18,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 120,
                    }}
                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.15)" }}
                    className={`bg-gradient-to-b ${exp.color} border-2 ${exp.border} rounded-2xl p-4 shadow-md transition-shadow relative overflow-hidden`}
                  >
                    {/* Notebook Tape decoration */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-4 bg-amber-100/80 rounded-b-md border border-amber-200/60" />

                    {/* Card Header */}
                    <div className="flex items-center gap-2 mb-3 mt-1">
                      <span
                        className={`text-xs font-bold ${exp.badge} text-white px-3 py-1 rounded-full shadow-sm`}
                      >
                        {exp.emoji} EXP {exp.id}
                      </span>
                      <div className="flex gap-1">
                        {exp.glasses.map((g) => (
                          <span
                            key={g}
                            className="bg-white/80 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-sm"
                          >
                            Gelas {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center my-2">
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut",
                        }}
                        className="text-xl text-slate-400"
                      >
                        ➔
                      </motion.span>
                    </div>

                    {/* Flower Preview */}
                    <div className="flex justify-center my-2 bg-white/60 rounded-xl py-3 border border-white/80 shadow-inner">
                      <FlowerSVG
                        {...flowerFromAssignments(
                          Object.fromEntries(
                            exp.glasses.map((g) => [
                              g,
                              GLASS_PROPERTIES[g as GlassId],
                            ]),
                          ),
                        )}
                        className="w-20 h-32"
                        animate={false}
                      />
                    </div>

                    {/* Traits */}
                    <div className="space-y-1.5 mt-3">
                      {exp.traits.map((t) => (
                        <motion.div
                          key={t}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.18 + 0.3 }}
                          className="flex items-center gap-2 text-sm bg-white/70 border border-white rounded-full px-3 py-1.5 shadow-sm"
                        >
                          <span>{t}</span>
                        </motion.div>
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

        {/* ═══════════════════════════════════════════════════════════
            PHASE 2 — GUIDED DEDUCTION WIZARD
            ═══════════════════════════════════════════════════════════ */}
        {phase === 2 && (
          <motion.div
            key="phase2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50/40 to-white">
              {/* Header */}
              <div className="flex items-start gap-3 mb-1">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-3xl"
                >
                  🔍
                </motion.span>
                <div>
                  <h2 className="text-lg font-bold text-primary">
                    Fase 2 — Panduan Deduksi
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Ikuti langkah-langkah berikut untuk menemukan isi setiap
                    gelas secara logis.
                  </p>
                </div>
              </div>

              {/* Step Progress Indicators */}
              <div className="flex items-center gap-1.5 my-4 overflow-x-auto pb-1">
                {WIZARD_STEPS.map((step, idx) => {
                  const isActive = step.key === wizardStep;
                  const isDone = idx < wizardIdx;
                  return (
                    <div key={step.key} className="flex items-center gap-1.5">
                      <motion.div
                        layout
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                          isActive
                            ? "border-amber-400 bg-amber-100 text-amber-800 shadow-md scale-105"
                            : isDone
                              ? "border-green-300 bg-green-100 text-green-700"
                              : "border-slate-200 bg-slate-50 text-slate-400"
                        }`}
                      >
                        <span>
                          {isDone ? "✅" : step.icon}
                        </span>
                        <span className="hidden sm:inline">{step.label}</span>
                      </motion.div>
                      {idx < WIZARD_STEPS.length - 1 && (
                        <div
                          className={`w-4 h-0.5 rounded-full ${
                            isDone ? "bg-green-300" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ═══ Step 2A — Beaker Exp1&Exp2 ═══ */}
              <AnimatePresence mode="wait">
                {wizardStep === "2A" && (
                  <motion.div key="step2A" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                      <p className="font-bold text-amber-800 text-sm flex items-center gap-2">
                        <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-xs">Langkah 1a</span> Temukan Gelas A
                      </p>
                      <p className="text-slate-700 mt-2">
                        Gelas apa yang <strong className="text-red-600">sama-sama ada</strong> di{" "}
                        <strong className="text-emerald-700">Eksperimen 1 [A, B, C]</strong> dan{" "}
                        <strong className="text-violet-700">Eksperimen 2 [A, D, E]</strong>?
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <div className="bg-emerald-50 rounded-xl px-4 py-3 text-center border-2 border-emerald-200 shadow-sm">
                        <span className="text-xs text-emerald-600 font-bold">EXP 1</span>
                        <div className="flex gap-1.5 mt-2">
                          {["A", "B", "C"].map((g) => (<span key={g} className="bg-white border-2 border-emerald-300 rounded-full w-8 h-8 flex items-center justify-center text-xs font-black text-emerald-700 shadow-sm">{g}</span>))}
                        </div>
                      </div>
                      <span className="text-3xl text-amber-400 font-black">∩</span>
                      <div className="bg-violet-50 rounded-xl px-4 py-3 text-center border-2 border-violet-200 shadow-sm">
                        <span className="text-xs text-violet-600 font-bold">EXP 2</span>
                        <div className="flex gap-1.5 mt-2">
                          {["A", "D", "E"].map((g) => (<span key={g} className="bg-white border-2 border-violet-300 rounded-full w-8 h-8 flex items-center justify-center text-xs font-black text-violet-700 shadow-sm">{g}</span>))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
                      {(["A", "B", "C", "D", "E", "F"] as GlassId[]).map((id) => (
                        <motion.button key={id} whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.92 }} onClick={() => handleBeakerSelectA(id)} className="flex flex-col items-center p-2 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm hover:shadow-md">
                          <BeakerVisual id={id} size="sm" /><span className="text-[10px] font-bold text-slate-600 mt-1">Gelas {id}</span>
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-center text-xs text-slate-400 italic">💡 Petunjuk: Cari huruf yang muncul di kedua daftar!</p>
                  </motion.div>
                )}

                {/* Step 2B: Trait Exp1&Exp2 */}
                {wizardStep === "2B" && (
                  <motion.div key="step2B" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4">
                      <p className="font-bold text-blue-800 text-sm flex items-center gap-2">
                        <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs">Langkah 1b</span> Khasiat yang Sama
                      </p>
                      <p className="text-slate-700 mt-2">
                        Khasiat apa yang <strong className="text-blue-700">SAMA-SAMA MUNCUL</strong> di Eksperimen 1 dan 2?<br />
                        <span className="text-xs text-slate-500">Petunjuk: Gelas A ada di keduanya — khasiat yang dibawa pasti sama!</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <span className="bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">EXP 1: 🌸 Ganda · ⚪ Putih · 🌿 Daun</span>
                      <span className="bg-violet-50 border border-violet-200 rounded-full px-3 py-1">EXP 2: 🌸 Ganda · ⚫ Hitam</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                      {["🌸 Kelopak Ganda", "⚪ Kelopak Putih", "🌿 Daun", "⚫ Pusat Hitam"].map((trait) => {
                        const selected = sharedTraits.includes(trait);
                        return (
                          <motion.button key={trait} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleTraitToggle(trait)} className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm ${selected ? "border-green-400 bg-green-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                            <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs shrink-0 ${selected ? "border-green-500 bg-green-500 text-white" : "border-slate-300"}`}>{selected ? "✓" : ""}</span>
                            <span>{trait}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    <div className="flex justify-center"><Button onClick={handleTraitConfirmGanda} disabled={sharedTraits.length === 0}>Konfirmasi Pilihan</Button></div>
                    {showCelebration && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                        <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-2xl px-5 py-3">
                          <span className="text-2xl">🎉</span><span className="text-sm font-bold text-green-700">Gelas A = Kelopak Ganda!</span>
                          <FlowerSVG petalLayers={2} petalColor="default" className="w-10 h-14" animate />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 2C: Beaker Exp1&Exp3 */}
                {wizardStep === "2C" && (
                  <motion.div key="step2C-beaker" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                      <p className="font-bold text-amber-800 text-sm flex items-center gap-2">
                        <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-xs">Langkah 1c</span> Temukan Gelas C
                      </p>
                      <p className="text-slate-700 mt-2">
                        Sekarang, gelas apa yang <strong className="text-red-600">sama-sama ada</strong> di{" "}
                        <strong className="text-emerald-700">Eksperimen 1 [A, B, C]</strong> dan{" "}
                        <strong className="text-amber-700">Eksperimen 3 [C, D, F]</strong>?
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <div className="bg-emerald-50 rounded-xl px-4 py-3 text-center border-2 border-emerald-200 shadow-sm">
                        <span className="text-xs text-emerald-600 font-bold">EXP 1</span>
                        <div className="flex gap-1.5 mt-2">{["A", "B", "C"].map((g) => (<span key={g} className="bg-white border-2 border-emerald-300 rounded-full w-8 h-8 flex items-center justify-center text-xs font-black text-emerald-700 shadow-sm">{g}</span>))}</div>
                      </div>
                      <span className="text-3xl text-amber-400 font-black">∩</span>
                      <div className="bg-amber-50 rounded-xl px-4 py-3 text-center border-2 border-amber-200 shadow-sm">
                        <span className="text-xs text-amber-600 font-bold">EXP 3</span>
                        <div className="flex gap-1.5 mt-2">{["C", "D", "F"].map((g) => (<span key={g} className="bg-white border-2 border-amber-300 rounded-full w-8 h-8 flex items-center justify-center text-xs font-black text-amber-700 shadow-sm">{g}</span>))}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
                      {(["A", "B", "C", "D", "E", "F"] as GlassId[]).map((id) => (
                        <motion.button key={id} whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.92 }} onClick={() => handleBeakerSelectC(id)} className="flex flex-col items-center p-2 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm hover:shadow-md">
                          <BeakerVisual id={id} size="sm" /><span className="text-[10px] font-bold text-slate-600 mt-1">Gelas {id}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2D: Trait Exp1&Exp3 */}
                {wizardStep === "2D" && (
                  <motion.div key="step2D-trait" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4">
                      <p className="font-bold text-blue-800 text-sm flex items-center gap-2">
                        <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs">Langkah 1d</span> Khasiat yang Sama
                      </p>
                      <p className="text-slate-700 mt-2">Khasiat apa yang <strong className="text-blue-700">SAMA-SAMA MUNCUL</strong> di Eksperimen 1 dan 3?</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <span className="bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">EXP 1: 🌸 Ganda · ⚪ Putih · 🌿 Daun</span>
                      <span className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1">EXP 3: ⚪ Putih · 〰️ Wavy</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                      {["🌸 Kelopak Ganda", "⚪ Kelopak Putih", "🌿 Daun", "〰️ Tangkai Bergelombang"].map((trait) => {
                        const selected = sharedTraits.includes(trait);
                        return (
                          <motion.button key={trait} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleTraitToggle(trait)} className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm ${selected ? "border-green-400 bg-green-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                            <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs shrink-0 ${selected ? "border-green-500 bg-green-500 text-white" : "border-slate-300"}`}>{selected ? "✓" : ""}</span>
                            <span>{trait}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    <div className="flex justify-center"><Button onClick={handleTraitConfirmPutih} disabled={sharedTraits.length === 0}>Konfirmasi Pilihan</Button></div>
                    {showCelebration && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                        <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-2xl px-5 py-3">
                          <span className="text-2xl">🎉</span><span className="text-sm font-bold text-green-700">Gelas C = Kelopak Putih!</span>
                          <FlowerSVG petalLayers={1} petalColor="white" className="w-10 h-14" animate />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 2E: MASTER STROKE — Finding Water D */}
                {wizardStep === "2E" && (
                  <motion.div key="step2E" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-l-4 border-violet-500 rounded-r-xl p-4">
                      <p className="font-bold text-violet-800 text-sm flex items-center gap-2">
                        <span className="bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full text-xs">Langkah 2</span> The Master Stroke — Temukan Air!
                      </p>
                      <p className="text-slate-700 mt-2">
                        Coba perhatikan <strong>Eksperimen 2 [A, D, E]</strong> dan <strong>Eksperimen 3 [C, D, F]</strong>. Keduanya menggunakan <strong className="text-sky-700">Gelas D</strong>. Tapi, apakah ada khasiat yang <strong className="text-violet-700">SAMA-SAMA MUNCUL</strong> di Eksperimen 2 dan 3?
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                      <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-3 text-center">
                        <span className="text-xs font-bold text-violet-600">EXP 2</span>
                        <div className="flex flex-wrap gap-1 justify-center mt-2">{["🌸 Kelopak Ganda", "⚫ Pusat Hitam"].map((t) => (<span key={t} className="bg-white border border-violet-200 rounded-full px-2 py-0.5 text-[11px]">{t}</span>))}</div>
                      </div>
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-center">
                        <span className="text-xs font-bold text-amber-600">EXP 3</span>
                        <div className="flex flex-wrap gap-1 justify-center mt-2">{["⚪ Kelopak Putih", "〰️ Tangkai Bergelombang"].map((t) => (<span key={t} className="bg-white border border-amber-200 rounded-full px-2 py-0.5 text-[11px]">{t}</span>))}</div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-slate-500">Keduanya berbagi Gelas D — tapi apakah ciri bunganya sama?</div>
                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleWaterMaster("ada")} className="py-4 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50 font-bold text-sm">Ada</motion.button>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleWaterMaster("tidak")} className="py-4 rounded-xl border-2 border-slate-200 bg-white hover:border-green-300 hover:bg-green-50 font-bold text-sm">Tidak Ada</motion.button>
                    </div>
                    {showCelebration && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-2xl p-5 max-w-md mx-auto text-center shadow-lg">
                        <p className="text-2xl mb-2">🎉</p>
                        <p className="font-black text-sky-700">Tepat sekali!</p>
                        <p className="text-sm text-slate-700 mt-1">Karena Gelas D ada di keduanya tapi <strong>tidak ada khasiat yang terbawa</strong>, maka <strong>GELAS D = AIR BIASA!</strong></p>
                        <div className="flex justify-center mt-3"><span className="text-4xl">💧</span></div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 2F: Who makes Wavy? */}
                {wizardStep === "2F" && (
                  <motion.div key="step2F" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl p-4">
                      <p className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                        <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-xs">Langkah 3</span> Siapa Pembuat Bergelombang?
                      </p>
                      <p className="text-slate-700 mt-2">
                        Jika <strong>Gelas D = Air Biasa</strong> dan <strong>Gelas C = Kelopak Putih</strong>, maka di <strong>Eksperimen 3 [C, D, F]</strong> yang menghasilkan <strong>⚪ Kelopak Putih</strong> dan <strong>〰️ Tangkai Bergelombang</strong>, siapa yang membuat <strong className="text-emerald-700">Tangkai Bergelombang</strong>?
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto">
                      <p className="text-xs text-slate-500 font-semibold mb-2">🧠 Rantai Penalaran:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2"><span className="bg-amber-100 border border-amber-300 rounded-full px-2.5 py-0.5 text-xs font-bold">Gelas C</span><span>=</span><span>⚪ Kelopak Putih</span><span className="text-green-600">✓</span></div>
                        <div className="flex items-center gap-2"><span className="bg-sky-100 border border-sky-300 rounded-full px-2.5 py-0.5 text-xs font-bold">Gelas D</span><span>=</span><span>💧 Air Biasa</span><span className="text-green-600">✓</span></div>
                        <div className="border-t border-slate-200 pt-2 flex items-center gap-2"><span className="bg-slate-200 border border-slate-300 rounded-full px-2.5 py-0.5 text-xs font-bold">Gelas ?</span><span>=</span><span>〰️ Tangkai Bergelombang</span><span className="text-slate-400">?</span></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                      {(["C", "D", "F"] as GlassId[]).map((id) => (
                        <motion.button key={id} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.92 }} onClick={() => handleWavySelect(id)} className="flex flex-col items-center p-3 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 transition-all shadow-sm">
                          <BeakerVisual id={id} size="sm" /><span className="text-xs font-bold mt-1">Gelas {id}</span>
                        </motion.button>
                      ))}
                    </div>
                    {showCelebration && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-5 py-3">
                          <span className="text-2xl">🎉</span><span className="text-sm font-bold text-emerald-700">Gelas F = Tangkai Bergelombang!</span>
                          <FlowerSVG stemType="wavy" className="w-10 h-14" animate />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Back button */}
              <div className="mt-4 flex justify-start">
                <SecondaryButton
                  onClick={() => {
                    setPhase(1);
                  }}
                >
                  ← Kembali ke Fase 1
                </SecondaryButton>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            PHASE 3 — FINAL DRAG & DROP PATTERN BOARD
            ═══════════════════════════════════════════════════════════ */}
        {phase === 3 && (
          <motion.div
            key="phase3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50/40 to-white">
              {/* Header */}
              <div className="flex items-start gap-3 mb-1">
                <motion.span
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-3xl"
                >
                  🧩
                </motion.span>
                <div>
                  <h2 className="text-lg font-bold text-primary">
                    Fase 3 — Papan Penugasan Deduksi
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Sekarang kamu sudah mengerti cara mengisolasi variabel!
                    Seret setiap gelas ke slot ciri yang sesuai, atau klik gelas
                    lalu klik slot.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-amber-200" />
                <span className="text-xs text-amber-500 font-semibold tracking-wider uppercase">
                  🎯 Penugasan Akhir
                </span>
                <div className="flex-1 h-px bg-amber-200" />
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left: Draggable Beakers */}
                  <div className="bg-amber-50/50 border-2 border-amber-200 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      🧴 Gelas Tersedia
                      <span className="bg-amber-200 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">
                        {beakerOrder.length}
                      </span>
                    </p>
                    <SortableContext
                      items={beakerOrder.map((b) => `beaker-${b}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {beakerOrder.map((id) => (
                          <div key={id} onClick={() => handleBeakerClick(id)}>
                            <SortableBeakerItem id={id} />
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                    {beakerOrder.length === 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-amber-600 text-center py-4 font-semibold"
                      >
                        Semua gelas sudah ditempatkan!
                      </motion.p>
                    )}
                  </div>

                  {/* Right: Trait Drop Slots */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      🎯 Slot Ciri Bunga
                    </p>
                    {TRAITS.map((trait) => {
                      const placedBeaker = assignments[
                        `trait-${trait.id}`
                      ] as GlassId | undefined;
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
                    <div className="flex flex-col items-center p-2 rounded-xl border-2 border-amber-500 bg-amber-50 shadow-xl opacity-90 rotate-3 scale-110">
                      <BeakerVisual id={activeBeaker} />
                      <span className="text-[10px] font-bold text-amber-700 mt-1">
                        {activeBeaker}
                      </span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              {/* Verify & Live Preview */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  <SecondaryButton
                    onClick={() => {
                      setPhase(1);
                      setWizardStep("2A");
                    }}
                  >
                    ← Kembali
                  </SecondaryButton>
                  <Button
                    onClick={handleVerify}
                    disabled={!allPlaced}
                    className="px-8"
                  >
                    🔬 Verifikasi Jawaban
                  </Button>
                </div>

                {allPlaced && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center shadow-sm"
                  >
                    <p className="text-xs text-slate-500 mb-2">
                      Preview bunga dari hipotesismu:
                    </p>
                    <FlowerSVG
                      {...flowerFromAssignments(assignments)}
                      className="w-28 h-40"
                      animate
                    />
                    <div className="flex flex-wrap gap-1 mt-2 justify-center">
                      {TRAITS.map((t) => {
                        const bid = assignments[`trait-${t.id}`];
                        return bid ? (
                          <span
                            key={t.id}
                            className="text-[10px] bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5"
                          >
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
