/**
 * Level Content — Phase 19
 * All game content defined as data, not hardcoded in components.
 */

// ── Module 1: Pabrik Kue (Dough Factory) ──────────────────────────────

export type PastryShape = "Square" | "Triangle" | "Circle";

export type PastryDef = {
  shape: PastryShape;
  icon: string;
  label: string;
  color: string;
};

export type Customer = {
  id: string;
  name: string;
  avatar: string;
  order: PastryShape;
  flavor: string;
  line: string;
};

export type Machine = {
  id: string;
  input: PastryShape;
  output: PastryShape;
  name: string;
};

export type Chute = {
  id: string;
  label: string;
  machines: string[]; // machine IDs in order
};

export const PASTRIES: Record<PastryShape, PastryDef> = {
  Square: { shape: "Square", icon: "\u{1F7EB}", label: "Brownie", color: "#6D4C41" },
  Triangle: { shape: "Triangle", icon: "\u{1F370}", label: "Cheesecake", color: "#FDE68A" },
  Circle: { shape: "Circle", icon: "\u{1F369}", label: "Donut", color: "#F472B6" },
};

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Andi", avatar: "\u{1F466}", order: "Triangle", flavor: "Keju", line: "Saya mau kue segitiga yang lembut!" },
  { id: "c2", name: "Bunga", avatar: "\u{1F467}", order: "Circle", flavor: "Cokelat", line: "Donat cokelat favoritku!" },
  { id: "c3", name: "Citra", avatar: "\u{1F469}", order: "Square", flavor: "Red Velvet", line: "Brownie red velvet, please!" },
  { id: "c4", name: "Dedi", avatar: "\u{1F468}", order: "Triangle", flavor: "Matcha", line: "Segitiga matcha satu, Kak!" },
  { id: "c5", name: "Eka", avatar: "\u{1F469}\u200D\u{1F373}", order: "Circle", flavor: "Strawberry", line: "Donat stroberi, yang lucu!" },
];

export const MACHINES: Machine[] = [
  { id: "M1", input: "Square", output: "Triangle", name: "Pembentuk Segitiga" },
  { id: "M2", input: "Triangle", output: "Circle", name: "Pembentuk Donat" },
  { id: "M3", input: "Circle", output: "Square", name: "Pembentuk Brownie" },
  { id: "M4", input: "Square", output: "Square", name: "Penguat Rasa" },
  { id: "M5", input: "Triangle", output: "Triangle", name: "Pemanis Alami" },
];

export const CHUTES: Chute[] = [
  { id: "chute-1", label: "Pintu 1", machines: ["M4", "M1"] },
  { id: "chute-2", label: "Pintu 2", machines: ["M1", "M2", "M3", "M4", "M5"] },
  { id: "chute-3", label: "Pintu 3", machines: ["M3", "M5"] },
];

// ── Module 2: Pupuk Ajaib (Fertilizer) ────────────────────────────────

export type GlassDef = {
  id: string;
  label: string;
  effect: string;
  color: string;
};

export type ExperimentDef = {
  id: number;
  title: string;
  glasses: string[];
  expectedFeatures: string[];
  observation: string;
};

export type TraitDef = {
  id: string;
  label: string;
  description: string;
  color: string;
};

export const GLASSES: GlassDef[] = [
  { id: "A", label: "Gelas A", effect: "Kelopak Ganda", color: "#F472B6" },
  { id: "B", label: "Gelas B", effect: "Menumbuhkan Daun", color: "#34D399" },
  { id: "C", label: "Gelas C", effect: "Kelopak Putih", color: "#E2E8F0" },
  { id: "D", label: "Gelas D", effect: "Air Biasa (Tanpa Efek)", color: "#60A5FA" },
  { id: "E", label: "Gelas E", effect: "Pusat Hitam", color: "#1E293B" },
  { id: "F", label: "Gelas F", effect: "Tangkai Bergelombang", color: "#FBBF24" },
];

export const TRAITS: TraitDef[] = [
  { id: "double_petal", label: "Kelopak Ganda", description: "Bunga punya dua lapis kelopak", color: "#F472B6" },
  { id: "leaves", label: "Menumbuhkan Daun", description: "Daun muncul di tangkai", color: "#34D399" },
  { id: "wavy_stem", label: "Tangkai Bergelombang", description: "Tangkai berbentuk gelombang", color: "#FBBF24" },
  { id: "white_petal", label: "Kelopak Putih", description: "Kelopak berwarna putih", color: "#E2E8F0" },
  { id: "black_center", label: "Pusat Hitam", description: "Bagian tengah bunga hitam", color: "#1E293B" },
];

export const EXPERIMENTS: ExperimentDef[] = [
  {
    id: 1,
    title: "Eksperimen 1: A + B + C",
    glasses: ["A", "B", "C"],
    expectedFeatures: ["Kelopak Ganda", "Menumbuhkan Daun", "Kelopak Putih"],
    observation: "Bunga punya kelopak ganda, daun, dan kelopak putih.",
  },
  {
    id: 2,
    title: "Eksperimen 2: A + D + E",
    glasses: ["A", "D", "E"],
    expectedFeatures: ["Kelopak Ganda", "Pusat Hitam"],
    observation: "Bunga punya kelopak ganda dan pusat hitam.",
  },
  {
    id: 3,
    title: "Eksperimen 3: C + D + F",
    glasses: ["C", "D", "F"],
    expectedFeatures: ["Kelopak Putih", "Tangkai Bergelombang"],
    observation: "Bunga punya kelopak putih dan tangkai bergelombang.",
  },
];

// ── Mission Descriptions ───────────────────────────────────────────────

export const MISSIONS = {
  mod1: {
    title: "Pabrik Kue Ceria",
    description: "Bantu pelanggan mendapatkan kue yang mereka pesan dengan memilih jalur yang tepat!",
    goal: "Cocokkan adonan dengan pesanan pelanggan",
    hint: "Perhatikan bentuk awal dan mesin di setiap pintu.",
  },
  mod2: {
    title: "Pupuk Ajaib",
    description: "Temukan efek masing-masing gelas campuran pada bunga melalui eksperimen!",
    goal: "Identifikasi efek 6 gelas campuran",
    hint: "Gunakan hasil eksperimen untuk menyimpulkan.",
  },
} as const;
