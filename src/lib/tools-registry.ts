import { lazy, type ComponentType } from "react";

const registry: Record<string, React.LazyExoticComponent<ComponentType>> = {
  "json-formatter": lazy(() => import("@/components/tools/json-formatter")),
  "notes": lazy(() => import("@/components/tools/notes/notes-app")),
  "markdown-previewer": lazy(() => import("@/components/tools/markdown-previewer")),
  "project-tracker": lazy(() => import("@/components/tools/project-tracker/project-tracker-app")),
};

export function getInternalToolComponent(slug: string) {
  return registry[slug] ?? null;
}
