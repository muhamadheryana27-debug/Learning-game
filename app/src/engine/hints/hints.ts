/**
 * Hint System — Phase 17
 * 3 levels: Observe → Pattern → Guided.
 * Each level gives progressively more specific help without revealing the answer.
 */

export type HintLevel = 1 | 2 | 3;

export type Hint = {
  level: HintLevel;
  text: string;
  category: "observe" | "pattern" | "guided";
};

export type HintDefinition = {
  moduleId: string;
  stepId: string;
  hints: [Hint, Hint, Hint]; // Always exactly 3 levels
};

// ── Module 1 Hints (Algorithm / Dough Factory) ────────────────────────

const MOD1_HINTS: HintDefinition[] = [
  {
    moduleId: "mod1",
    stepId: "chute-selection",
    hints: [
      { level: 1, text: "Perhatikan apa yang terjadi pada adonan setiap kali melewati mesin.", category: "observe" },
      { level: 2, text: "Mesin hanya mengubah bentuk adonan jika bentuk awal cocok dengan aturan mesin.", category: "pattern" },
      { level: 3, text: "Coba Pintu 2 — jalurnya paling panjang dan punya banyak mesin. Perhatikan Brownie (🟫) di awal.", category: "guided" },
    ],
  },
  {
    moduleId: "mod1",
    stepId: "shape-matching",
    hints: [
      { level: 1, text: "Lihat pesanan pelanggan — mereka minta bentuk tertentu.", category: "observe" },
      { level: 2, text: "Bentuk awal dan bentuk akhir tidak selalu sama. Mesin bisa mengubahnya.", category: "pattern" },
      { level: 3, text: "Brownie (🟫) bisa jadi Cheesecake (🍰) lewat mesin tertentu. Coba cari jalur yang tepat.", category: "guided" },
    ],
  },
];

// ── Module 2 Hints (Pattern / Fertilizer) ──────────────────────────────

const MOD2_HINTS: HintDefinition[] = [
  {
    moduleId: "mod2",
    stepId: "experiment-observation",
    hints: [
      { level: 1, text: "Perhatikan perubahan pada bunga setelah campuran diberikan.", category: "observe" },
      { level: 2, text: "Jika sebuah gelas muncul di dua eksperimen berbeda, gelas itu membawa ciri yang sama.", category: "pattern" },
      { level: 3, text: "Bandingkan EXP1 (A+B+C) dan EXP2 (A+D+E) — gelas A muncul di keduanya.", category: "guided" },
    ],
  },
  {
    moduleId: "mod2",
    stepId: "glass-assignment",
    hints: [
      { level: 1, text: "Setiap gelas punya efek unik pada bunga.", category: "observe" },
      { level: 2, text: "Gelas yang benar akan membuat ciri spesifik muncul pada bunga.", category: "pattern" },
      { level: 3, text: "Gelas D tidak mengubah bunga — itu air biasa. Fokus pada gelas lain.", category: "guided" },
    ],
  },
  {
    moduleId: "mod2",
    stepId: "deduction",
    hints: [
      { level: 1, text: "Gunakan hasil eksperimen untuk menyimpulkan efek masing-masing gelas.", category: "observe" },
      { level: 2, text: "Jika ciri muncul di EXP1 dan EXP3, gelas yang sama di kedua eksperimen itu penyebabnya.", category: "pattern" },
      { level: 3, text: "Gelas C (Putih) ada di EXP1 dan EXP3 — coba cek kelopak putih di kedua eksperimen.", category: "guided" },
    ],
  },
];

// ── All hints registry ─────────────────────────────────────────────────

const ALL_HINTS: HintDefinition[] = [...MOD1_HINTS, ...MOD2_HINTS];

/**
 * Get a hint for a specific module and step.
 * Returns null if no hints defined, or the hint at the requested level.
 */
export function getHint(moduleId: string, stepId: string, level: HintLevel): Hint | null {
  const def = ALL_HINTS.find((h) => h.moduleId === moduleId && h.stepId === stepId);
  if (!def) return null;
  return def.hints[level - 1] ?? null;
}

/**
 * Get the next hint level for a step.
 * Returns null if all hints exhausted.
 */
export function getNextHintLevel(_moduleId: string, _stepId: string, currentLevel: number): HintLevel | null {
  if (currentLevel >= 3) return null;
  return (currentLevel + 1) as HintLevel;
}

/**
 * Get all hints for a module.
 */
export function getModuleHints(moduleId: string): HintDefinition[] {
  return ALL_HINTS.filter((h) => h.moduleId === moduleId);
}

/**
 * Get hint count for a module.
 */
export function getHintCount(moduleId: string): number {
  return ALL_HINTS.filter((h) => h.moduleId === moduleId).length * 3;
}
