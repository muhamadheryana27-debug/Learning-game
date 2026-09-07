export type HintLevel = 1 | 2 | 3;

export const HINTS: Record<HintLevel, { title: string; text: string; cost: number }> = {
  1: {
    title: "Petunjuk Level 1 — Pertanyaan",
    text: "Coba lihat gelas yang muncul pada dua eksperimen berbeda. Gelas mana yang selalu bersama fitur yang sama?",
    cost: 10,
  },
  2: {
    title: "Petunjuk Level 2 — Arah",
    text: "Bandingkan Eksperimen 1 (A+B+C) dan Eksperimen 3 (C+D+F). Gelas C muncul di keduanya — fitur apa yang juga muncul dua kali?",
    cost: 10,
  },
  3: {
    title: "Petunjuk Level 3 — Visual",
    text: "Perhatikan: Gelas C selalu bersama 'Kelopak Berlapis & Putih'. Gelas A dan F tidak pernah menambah fitur — kemungkinan besar Air Biasa.",
    cost: 10,
  },
};

export function getHint(level: HintLevel) {
  return HINTS[level];
}
