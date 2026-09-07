// Port dari PRD V4 Module2FertilizerEngine — GLASS_PROPERTIES
export const GLASS_PROPERTIES: Record<string, string> = {
  A: "Air Biasa (Tanpa Efek)",
  B: "Menumbuhkan Daun",
  C: "Kelopak Berlapis & Putih",
  D: "Tangkai Bergelombang",
  E: "Tengah Bunga Hitam",
  F: "Air Biasa (Tanpa Efek)",
};

export const FEATURES = [
  "Menumbuhkan Daun",
  "Kelopak Berlapis & Putih",
  "Tangkai Bergelombang",
  "Tengah Bunga Hitam",
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
  const aIsWater = assignments["A"]?.includes("Air");
  const fIsWater = assignments["F"]?.includes("Air");
  return Boolean(aIsWater || fIsWater);
}

export function isPerfectWater(assignments: Record<string, string>): boolean {
  return Boolean(assignments["A"]?.includes("Air") && assignments["F"]?.includes("Air"));
}

export type ExperimentDef = {
  id: number;
  glasses: GlassId[];
  expectedFeatures: string[];
};

export const EXPERIMENTS: ExperimentDef[] = [
  { id: 1, glasses: ["A", "B", "C"], expectedFeatures: ["Menumbuhkan Daun", "Kelopak Berlapis & Putih"] },
  { id: 2, glasses: ["A", "D", "E"], expectedFeatures: ["Tangkai Bergelombang", "Tengah Bunga Hitam"] },
  { id: 3, glasses: ["C", "D", "F"], expectedFeatures: ["Kelopak Berlapis & Putih", "Tangkai Bergelombang"] },
];

export function verifyAll(
  assignments: Record<string, string>,
  experiments: ExperimentDef[] = EXPERIMENTS,
) {
  return experiments.map((exp) => {
    // Prediksi fitur berdasarkan assignment siswa: mapping glass->feature
    // Jika siswa assign "A"->Air, maka A tidak kontribusi fitur
    const predictedGlasses = exp.glasses.filter((g) => {
      const assigned = assignments[g] ?? "";
      return !assigned.includes("Air");
    });
    // Ambil fitur dari assignment (bukan dari GLASS_PROPERTIES asli, tapi dari tebakan siswa)
    // Untuk verifikasi sederhana: cek apakah set fitur prediksi == expected
    const predictedFeatures = exp.glasses
      .map((g) => assignments[g])
      .filter((f) => f && !f.includes("Air"));

    const expectedSet = new Set(exp.expectedFeatures);
    const predictedSet = new Set(predictedFeatures);
    const match =
      expectedSet.size === predictedSet.size &&
      [...expectedSet].every((f) => predictedSet.has(f)) &&
      predictedGlasses.length === predictedFeatures.length;

    // Fallback: jika siswa belum assign semua, gunakan evaluasi asli untuk expected
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

// Skor M2: water bonus + feature accuracy (PRD V5 §11.1)
export function scoreModule2(assignments: Record<string, string>): number {
  const totalGlasses = 6;
  let correct = 0;
  for (const g of ["A", "B", "C", "D", "E", "F"] as GlassId[]) {
    if (assignments[g] === GLASS_PROPERTIES[g]) correct++;
  }
  // Alternatif: hitung via water + feature
  const waterBonus = isPerfectWater(assignments) ? 40 : isWaterCorrect(assignments) ? 20 : 0;
  const featureCorrect = (Object.entries(assignments).filter(([k, v]) => k !== "A" && k !== "F" && v === GLASS_PROPERTIES[k]).length / 4) * 60;
  // Jika siswa benar semua 6, pakai correct/total untuk pastikan 100
  if (correct === totalGlasses) return 100;
  return Math.round(waterBonus + featureCorrect);
}
