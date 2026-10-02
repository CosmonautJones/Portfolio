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
  const angle = index * 2.399963;
  const radius = 12 + 30 * Math.sqrt(index / Math.max(1, projects.length - 1));
  return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius };
}
