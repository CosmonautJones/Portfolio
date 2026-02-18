import { lazy, type ComponentType } from "react";

const registry: Record<string, React.LazyExoticComponent<ComponentType>> = {
  "json-formatter": lazy(() => import("@/components/tools/json-formatter")),
  "notes": lazy(() => import("@/components/tools/notes/notes-app")),
};

export function getInternalToolComponent(slug: string) {
  return registry[slug] ?? null;
}
