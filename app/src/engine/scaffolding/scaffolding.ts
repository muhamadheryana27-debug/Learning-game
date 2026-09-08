/**
 * Learning Scaffolding — Phase 18
 * Structured flow: MISSION → OBSERVE → PREDICT → TRY → SEE RESULT → EXPLAIN → DEBUG → CHALLENGE → REFLECT
 */

export type ScaffoldPhase =
  | "MISSION"
  | "OBSERVE"
  | "PREDICT"
  | "TRY"
  | "SEE_RESULT"
  | "EXPLAIN"
  | "DEBUG"
  | "CHALLENGE"
  | "REFLECT";

export type ScaffoldStep = {
  phase: ScaffoldPhase;
  label: string;
  description: string;
  moduleIds: string[];
};

export const SCAFFOLD_STEPS: ScaffoldStep[] = [
  {
    phase: "MISSION",
    label: "Misi",
    description: "Pahami apa yang harus kamu kerjakan",
    moduleIds: ["mod1", "mod2"],
  },
  {
    phase: "OBSERVE",
    label: "Amati",
    description: "Perhatikan pola dan informasi yang tersedia",
    moduleIds: ["mod1", "mod2"],
  },
  {
    phase: "PREDICT",
    label: "Prediksi",
    description: "Buat hipotesis tentang apa yang akan terjadi",
    moduleIds: ["mod1", "mod2"],
  },
  {
    phase: "TRY",
    label: "Coba",
    description: "Jalankan percobaan atau pilih jalur",
    moduleIds: ["mod1", "mod2"],
  },
  {
    phase: "SEE_RESULT",
    label: "Lihat Hasil",
    description: "Amati hasil dari percobaanmu",
    moduleIds: ["mod1", "mod2"],
  },
  {
    phase: "EXPLAIN",
    label: "Jelaskan",
    description: "Tuliskan pemahamanmu tentang pola",
    moduleIds: ["mod1", "mod2"],
  },
  {
    phase: "DEBUG",
    label: "Debug",
    description: "Periksa kesalahan dan perbaiki",
    moduleIds: ["mod1", "mod2"],
  },
  {
    phase: "CHALLENGE",
    label: "Tantangan",
    description: "Selesaikan kasus yang lebih kompleks",
    moduleIds: ["mod1", "mod2"],
  },
  {
    phase: "REFLECT",
    label: "Refleksi",
    description: "Tinjau kembali apa yang sudah dipelajari",
    moduleIds: ["mod1", "mod2"],
  },
];

/**
 * Get the scaffold for a module (all 9 phases).
 */
export function getModuleScaffold(moduleId: string): ScaffoldStep[] {
  return SCAFFOLD_STEPS.filter((s) => s.moduleIds.includes(moduleId));
}

/**
 * Get the current phase index (0-based).
 */
export function getPhaseIndex(phase: ScaffoldPhase): number {
  return SCAFFOLD_STEPS.findIndex((s) => s.phase === phase);
}

/**
 * Get next phase. Returns null if at end.
 */
export function getNextPhase(current: ScaffoldPhase): ScaffoldPhase | null {
  const idx = getPhaseIndex(current);
  if (idx < 0 || idx >= SCAFFOLD_STEPS.length - 1) return null;
  return SCAFFOLD_STEPS[idx + 1].phase;
}

/**
 * Get previous phase. Returns null if at start.
 */
export function getPrevPhase(current: ScaffoldPhase): ScaffoldPhase | null {
  const idx = getPhaseIndex(current);
  if (idx <= 0) return null;
  return SCAFFOLD_STEPS[idx - 1].phase;
}
