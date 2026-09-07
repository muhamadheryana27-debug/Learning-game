// Port dari PRD V4 Module1DoughEngine — src/engine/rules/doughEngine.ts:1
export type Shape = "Square" | "Triangle" | "Circle";
export type Rule = [Shape, Shape]; // [src, dst] IF input==src THEN dst

export const SHAPES: Shape[] = ["Square", "Triangle", "Circle"];

export const SHAPE_ICON: Record<Shape, string> = {
  Square: "▢",
  Triangle: "△",
  Circle: "○",
};

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

// Preset pipeline untuk MVP1 (2 level)
export const PIPELINES = {
  easy: {
    start: "Square" as Shape,
    rules: [
      ["Square", "Triangle"] as Rule,
      ["Triangle", "Circle"] as Rule,
    ],
    expected: "Circle" as Shape,
  },
  medium: {
    start: "Square" as Shape,
    rules: [
      ["Square", "Triangle"] as Rule,
      ["Square", "Circle"] as Rule, // no-op jika sudah Triangle
      ["Triangle", "Circle"] as Rule,
    ],
    expected: "Circle" as Shape,
  },
} as const;

export function scorePipeline(result: Shape, expected: Shape, history: Shape[]): number {
  if (result === expected) return 100;
  if (history.includes(expected)) return 50;
  return 0;
}
