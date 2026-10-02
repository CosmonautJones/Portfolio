import { PROJECTS } from "@/lib/constants";

export const projects = PROJECTS;
export const modes = ["CORE", "JAC", "COSMOS", "TERMINAL"] as const;
export type Mode = (typeof modes)[number];

export function connections(index: number) {
  return projects.flatMap((project, other) => {
    const shared = project.tags.filter((tag) => projects[index].tags.includes(tag));
    return other !== index && shared.length ? [{ index: other, shared }] : [];
  });
}

export function position(index: number, mode: Mode) {
  if (mode === "JAC") return { x: 12 + (index % 4) * 25, y: 12 + Math.floor(index / 4) * (76 / Math.max(1, Math.ceil(projects.length / 4) - 1)) };
  if (index === 0) return { x: 50, y: 50 };
  const inner = index <= 5;
  const angle = -Math.PI / 2 + (inner ? (index - 1) / 5 : (index - 6 + .5) / Math.max(1, projects.length - 6)) * Math.PI * 2;
  const radius = inner ? 22 : 42;
  return { x: Number((50 + Math.cos(angle) * radius).toFixed(4)), y: Number((50 + Math.sin(angle) * radius).toFixed(4)) };
}

export function driftingPosition(index: number, mode: Mode, seconds: number) {
  const point = position(index, mode);
  const amplitude = mode === "COSMOS" ? 2.8 : 1.2;
  const phase = index * 2.399963;
  return {
    x: point.x + Math.sin(seconds * .22 + phase) * amplitude,
    y: point.y + Math.cos(seconds * .17 + phase) * amplitude,
  };
}
