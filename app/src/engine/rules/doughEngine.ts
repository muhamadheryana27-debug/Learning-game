export type Shape = "Square" | "Triangle" | "Circle";

export interface GateRule {
  id: string;
  src: Shape;
  dst: Shape;
  displayLabel: string;
}

// EXACT Gate Definitions — PRD V5 (pastry-mapped but logic unchanged)
export const GATES = {
  // Pintu 1 exclusive
  g1_top: { id: "g1_top", src: "Square" as Shape, dst: "Triangle" as Shape, displayLabel: "🟫 ➔ 🍰" },
  // Pintu 2 exclusive
  g2_top: { id: "g2_top", src: "Circle" as Shape, dst: "Square" as Shape, displayLabel: "🍩 ➔ 🟫" },
  g2_mid: { id: "g2_mid", src: "Triangle" as Shape, dst: "Circle" as Shape, displayLabel: "🍰 ➔ 🍩" },
  // Shared Gate: Pintu 2 merges into Pintu 1's path here!
  g_shared_midLeft: { id: "g_shared_midLeft", src: "Square" as Shape, dst: "Triangle" as Shape, displayLabel: "🟫 ➔ 🍰" },
  // Pintu 3 exclusive
  g3_top: { id: "g3_top", src: "Square" as Shape, dst: "Circle" as Shape, displayLabel: "🟫 ➔ 🍩" },
  g3_mid: { id: "g3_mid", src: "Triangle" as Shape, dst: "Circle" as Shape, displayLabel: "🍰 ➔ 🍩" },
  // Shared Gates: All doors merge into the final bottom path (Lorong K)
  k_top: { id: "k_top", src: "Triangle" as Shape, dst: "Square" as Shape, displayLabel: "🍰 ➔ 🟫" },
  k_bot: { id: "k_bot", src: "Circle" as Shape, dst: "Triangle" as Shape, displayLabel: "🍩 ➔ 🍰" },
} as const;

// Pipeline Routes — Door 2: Donut→Brownie, Cheesecake→Donut, Brownie→Cheesecake, Cheesecake→Brownie, Donut→Cheesecake
// g2_top (Circle→Square) → g2_mid (Triangle→Circle) → g_shared_midLeft (Square→Triangle) → k_top (Triangle→Square) → k_bot (Circle→Triangle)
export const PIPELINE_ROUTES: Record<number, GateRule[]> = {
  1: [GATES.g1_top, GATES.g_shared_midLeft, GATES.k_top, GATES.k_bot],
  2: [GATES.g2_top, GATES.g2_mid, GATES.g_shared_midLeft, GATES.k_top, GATES.k_bot],
  3: [GATES.g3_top, GATES.g3_mid, GATES.k_top, GATES.k_bot],
};

export function processGate(currentShape: Shape, rule: GateRule): Shape {
  return currentShape === rule.src ? rule.dst : currentShape;
}

// Helper: trace full route with history & triggered flags
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

// Validation helper — run on startup, logs if any door cannot produce a target pastry
export function validateAllRoutes(): boolean {
  const shapes: Shape[] = ["Square", "Triangle", "Circle"];
  const pastryName: Record<Shape, string> = { Square: "Brownie 🟫", Triangle: "Cheesecake 🍰", Circle: "Donut 🍩" };
  let allOk = true;
  for (const door of [1, 2, 3] as const) {
    const reachable = new Set(shapes.map((s) => traceRoute(s, door).final));
    for (const target of shapes) {
      if (!reachable.has(target)) {
        console.warn(`[doughEngine] Door ${door} cannot produce ${pastryName[target]} — reachable: ${[...reachable].map((r) => pastryName[r]).join(", ")}`);
        allOk = false;
      }
    }
    if (reachable.size === shapes.length) {
      console.info(`[doughEngine] Door ${door} OK — can produce all 3 pastries: ${[...reachable].map((r) => pastryName[r]).join(", ")}`);
    }
  }
  return allOk;
}

// Auto-validate in dev (no side effect in production build, but helpful during dev)
if (typeof window !== "undefined") {
  // defer to next tick so console is ready
  setTimeout(() => validateAllRoutes(), 0);
}

// Legacy exports for backward compatibility (old doughEngine used Rule tuples)
export type Rule = [Shape, Shape];
export const SHAPES: Shape[] = ["Square", "Triangle", "Circle"];
export const SHAPE_ICON: Record<Shape, string> = { Square: "🟫", Triangle: "🍰", Circle: "🍩" };
export function applyGate(input: Shape, rule: Rule): Shape {
  const [src, dst] = rule;
  return input === src ? dst : input;
}
export function tracePipeline(start: Shape, pipeline: Rule[]) {
  let cur = start;
  const history: Shape[] = [cur];
  for (const rule of pipeline) {
    cur = applyGate(cur, rule);
    history.push(cur);
  }
  return { result: cur, history };
}
export const PIPELINES = {
  easy: { start: "Square" as Shape, rules: [["Square", "Triangle"] as Rule, ["Triangle", "Circle"] as Rule], expected: "Circle" as Shape },
  medium: { start: "Square" as Shape, rules: [["Square", "Triangle"] as Rule, ["Square", "Circle"] as Rule, ["Triangle", "Circle"] as Rule], expected: "Circle" as Shape },
} as const;
export function scorePipeline(result: Shape, expected: Shape, history: Shape[]): number {
  if (result === expected) return 100;
  if (history.includes(expected)) return 50;
  return 0;
}

// UI helper
export const SHAPE_META: Record<Shape, { icon: string; label: string; color: string }> = {
  Square: { icon: "🟫", label: "Brownie", color: "#6D4C41" },
  Triangle: { icon: "🍰", label: "Cheesecake", color: "#FDE68A" },
  Circle: { icon: "🍩", label: "Donut", color: "#F472B6" },
};
