import { create } from "zustand";

export type FertilizerId = "A" | "B" | "C" | "D" | "E" | "F";

export interface FlowerState {
  stemType: "normal" | "wavy";
  hasLeaves: boolean;
  petalLayers: 1 | 2;
  petalColor: "default" | "white";
  centerColor: "default" | "black";
}

interface LabStore {
  selectedBeakers: FertilizerId[];
  addBeaker: (id: FertilizerId) => void;
  removeBeaker: (index: number) => void;
  clearBeakers: () => void;
  isAnalyzing: boolean;
  animationPhase: "idle" | "pouring" | "growing" | "blooming";
  currentFlowerState: FlowerState;
  discoveredTraits: Set<string>;
  evaluateMixture: () => void;
  resetExperiment: () => void;
}

const DEFAULT_FLOWER: FlowerState = {
  stemType: "normal",
  hasLeaves: false,
  petalLayers: 1,
  petalColor: "default",
  centerColor: "default",
};

export const useLabStore = create<LabStore>((set, get) => ({
  selectedBeakers: [],
  isAnalyzing: false,
  animationPhase: "idle",
  currentFlowerState: DEFAULT_FLOWER,
  discoveredTraits: new Set<string>(),

  addBeaker: (id) => {
    const { selectedBeakers } = get();
    if (selectedBeakers.length < 3 && !selectedBeakers.includes(id)) {
      set({ selectedBeakers: [...selectedBeakers, id] });
    }
  },

  removeBeaker: (index) => {
    const { selectedBeakers } = get();
    set({ selectedBeakers: selectedBeakers.filter((_, i) => i !== index) });
  },

  clearBeakers: () => set({ selectedBeakers: [] }),

  evaluateMixture: () => {
    const { selectedBeakers, discoveredTraits } = get();
    if (selectedBeakers.length === 0) return;

    const nextFlower: FlowerState = {
      stemType: selectedBeakers.includes("D") ? "wavy" : "normal",
      hasLeaves: selectedBeakers.includes("B"),
      petalLayers: selectedBeakers.includes("C") ? 2 : 1,
      petalColor: selectedBeakers.includes("C") ? "white" : "default",
      centerColor: selectedBeakers.includes("E") ? "black" : "default",
    };

    const newTraits = new Set(discoveredTraits);
    // Friendly Indonesian — no (Pupuk X) spoiler, detective notebook style
    if (nextFlower.hasLeaves) newTraits.add("🌿 Daunnya Tumbuh Lebat");
    if (nextFlower.petalLayers === 2) newTraits.add("🌸 Kelopak Jadi Berlapis (Ganda)");
    if (nextFlower.petalColor === "white") newTraits.add("⚪ Warna Kelopak Jadi Putih");
    if (nextFlower.stemType === "wavy") newTraits.add("〰️ Tangkai Batangnya Bergelombang");
    if (nextFlower.centerColor === "black") newTraits.add("⚫ Bagian Tengah Bunga Jadi Hitam");
    // Plain water — no special trait: notebook will show neutral note in UI

    set({ isAnalyzing: true, animationPhase: "pouring" });

    setTimeout(() => {
      set({ animationPhase: "growing", currentFlowerState: nextFlower });
    }, 1200);

    setTimeout(() => {
      set({ animationPhase: "blooming" });
    }, 2400);

    setTimeout(() => {
      set({ isAnalyzing: false, discoveredTraits: newTraits });
    }, 3200);
  },

  resetExperiment: () => {
    set({
      selectedBeakers: [],
      isAnalyzing: false,
      animationPhase: "idle",
      currentFlowerState: DEFAULT_FLOWER,
    });
  },
}));
