export type Shape = "Square" | "Triangle" | "Circle";

export interface GateRule {
  id: string;
  src: Shape;
  dst: Shape;
  displayLabel: string;
}

// EXACT Gate Definitions — PRD V5 Dough Factory
export const GATES = {
  // Pintu 1 exclusive
  g1_top: { id: "g1_top", src: "Square" as Shape, dst: "Triangle" as Shape, displayLabel: "🟦 ➔ 🔺" },
  // Pintu 2 exclusive
  g2_top: { id: "g2_top", src: "Circle" as Shape, dst: "Square" as Shape, displayLabel: "🟡 ➔ 🟦" },
  g2_mid: { id: "g2_mid", src: "Triangle" as Shape, dst: "Circle" as Shape, displayLabel: "🔺 ➔ 🟡" },
  // Shared Gate: Pintu 2 merges into Pintu 1's path here!
  g_shared_midLeft: { id: "g_shared_midLeft", src: "Square" as Shape, dst: "Triangle" as Shape, displayLabel: "🟦 ➔ 🔺" },
  // Pintu 3 exclusive
  g3_top: { id: "g3_top", src: "Square" as Shape, dst: "Circle" as Shape, displayLabel: "🟦 ➔ 🟡" },
  g3_mid: { id: "g3_mid", src: "Triangle" as Shape, dst: "Circle" as Shape, displayLabel: "🔺 ➔ 🟡" },
  // Shared Gates: All doors merge into the final bottom path
  k_top: { id: "k_top", src: "Triangle" as Shape, dst: "Square" as Shape, displayLabel: "🔺 ➔ 🟦" },
  k_bot: { id: "k_bot", src: "Circle" as Shape, dst: "Triangle" as Shape, displayLabel: "🟡 ➔ 🔺" },
} as const;

// EXACT Pipeline Routes — must match spec exactly
export const PIPELINE_ROUTES: Record<number, GateRule[]> = {
  1: [GATES.g1_top, GATES.g_shared_midLeft, GATES.k_top, GATES.k_bot],
  2: [GATES.g2_top, GATES.g2_mid, GATES.g_shared_midLeft, GATES.k_top, GATES.k_bot], // Pintu 2 has 5 gates!
  3: [GATES.g3_top, GATES.g3_mid, GATES.k_top, GATES.k_bot],
};

export function processGate(currentShape: Shape, rule: GateRule): Shape {
  return currentShape === rule.src ? rule.dst : currentShape;
}

export function traceRoute(startShape: Shape, door: number): { final: Shape; history: Shape[]; steps: { gate: GateRule; before: Shape; after: Shape; triggered: boolean }[] } {
  const route = PIPELINE_ROUTES[door];
  if (!route) throw new Error(`Invalid door ${door}`);
  let cur = startShape;
  const history: Shape[] = [cur];
  const steps = route.map((gate) => {
    const before = cur;
    const after = processGate(cur, gate);
    const triggered = before !== after;
    cur = after;
    history.push(cur);
    return { gate, before, after, triggered };
  });
  return { final: cur, history, steps };
}

// Helper for UI
export const SHAPE_META: Record<Shape, { icon: string; label: string; color: string }> = {
  Square: { icon: "🟦", label: "Persegi", color: "#3B82F6" },
  Triangle: { icon: "🔺", label: "Segitiga", color: "#EF4444" },
  Circle: { icon: "🟡", label: "Lingkaran", color: "#F59E0B" },
};
