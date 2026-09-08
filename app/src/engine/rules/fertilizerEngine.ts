// Module 2 — Pupuk Ajaib core logic (revised v2)
// 5 traits: double_petal, leaves, wavy_stem, white_petal, black_center
// Mapping: A=double, B=leaves, C=white, D=water, E=black, F=wavy

export const TRAIT_IDS = ["double_petal", "leaves", "wavy_stem", "white_petal", "black_center"] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

export const TRAIT_LABELS: Record<TraitId, string> = {
  double_petal: "Kelopak Ganda",
  leaves: "Menumbuhkan Daun",
  wavy_stem: "Tangkai Bergelombang",
  white_petal: "Kelopak Putih",
  black_center: "Pusat Hitam",
};

export const GLASS_PROPERTIES: Record<string, string> = {
  A: TRAIT_LABELS.double_petal, // Kelopak Ganda
  B: TRAIT_LABELS.leaves, // Menumbuhkan Daun
  C: TRAIT_LABELS.white_petal, // Kelopak Putih
  D: "Air Biasa (Tanpa Efek)",
  E: TRAIT_LABELS.black_center, // Pusat Hitam
  F: TRAIT_LABELS.wavy_stem, // Tangkai Bergelombang
};

export const FEATURES = [
  TRAIT_LABELS.leaves,
  TRAIT_LABELS.double_petal,
  TRAIT_LABELS.white_petal,
  TRAIT_LABELS.wavy_stem,
  TRAIT_LABELS.black_center,
  "Air Biasa (Tanpa Efek)",
] as const;

export type GlassId = "A" | "B" | "C" | "D" | "E" | "F";
export type Feature = (typeof FEATURES)[number];

export function evaluateMixture(glasses: string[]): string[] {
  const features = new Set<string>();
  for (const g of glasses) {
    const prop = GLASS_PROPERTIES[g.toUpperCase()] ?? "";
    if (prop && !prop.includes("Air")) features.add(prop);
  }
  return [...features];
}

export function isWaterCorrect(assignments: Record<string, string>): boolean {
  return Boolean(assignments["D"]?.includes("Air"));
}

export function isPerfectWater(assignments: Record<string, string>): boolean {
  return Boolean(assignments["D"]?.includes("Air"));
}

export type ExperimentDef = {
  id: number;
  glasses: GlassId[];
  expectedFeatures: string[];
};

export const EXPERIMENTS: ExperimentDef[] = [
  { id: 1, glasses: ["A", "B", "C"], expectedFeatures: [TRAIT_LABELS.double_petal, TRAIT_LABELS.white_petal, TRAIT_LABELS.leaves] },
  { id: 2, glasses: ["A", "D", "E"], expectedFeatures: [TRAIT_LABELS.double_petal, TRAIT_LABELS.black_center] },
  { id: 3, glasses: ["C", "D", "F"], expectedFeatures: [TRAIT_LABELS.white_petal, TRAIT_LABELS.wavy_stem] },
];

export function verifyAll(
  assignments: Record<string, string>,
  experiments: ExperimentDef[] = EXPERIMENTS,
) {
  return experiments.map((exp) => {
    const predictedGlasses = exp.glasses.filter((g) => {
      const assigned = assignments[g] ?? "";
      return !assigned.includes("Air");
    });
    const predictedFeatures = exp.glasses
      .map((g) => assignments[g])
      .filter((f) => f && !f.includes("Air"));

    const expectedSet = new Set(exp.expectedFeatures);
    const predictedSet = new Set(predictedFeatures);
    const match =
      expectedSet.size === predictedSet.size &&
      [...expectedSet].every((f) => predictedSet.has(f)) &&
      predictedGlasses.length === predictedFeatures.length;

    const got = evaluateMixture(exp.glasses);
    return {
      expId: exp.id,
      glasses: exp.glasses,
      expected: exp.expectedFeatures,
      predicted: predictedFeatures,
      got,
      match,
    };
  });
}

// Skor M2: water (D) + 5 trait accuracy
export function scoreModule2(assignments: Record<string, string>): number {
  const totalGlasses = 6;
  let correct = 0;
  for (const g of ["A", "B", "C", "D", "E", "F"] as GlassId[]) {
    if (assignments[g] === GLASS_PROPERTIES[g]) correct++;
  }
  if (correct === totalGlasses) return 100;
  const waterBonus = isWaterCorrect(assignments) ? 20 : 0;
  const traitKeys: GlassId[] = ["A", "B", "C", "E", "F"];
  const traitCorrect = traitKeys.filter((k) => assignments[k] === GLASS_PROPERTIES[k]).length;
  const featureScore = (traitCorrect / traitKeys.length) * 80;
  return Math.round(waterBonus + featureScore);
}
