import { shouldUnlockRoadScholar } from "@/lib/easter-eggs/triggers";

export const PROJECT_VIEWS_KEY = "portfolio_viewed_projects";

function readViews(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PROJECT_VIEWS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return new Set();
  }
}

function writeViews(views: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROJECT_VIEWS_KEY, JSON.stringify([...views]));
  } catch {
    // localStorage unavailable
  }
}

/** Record a distinct project view. Returns true when Road Scholar should unlock. */
export function rememberProjectView(projectKey: string): boolean {
  const views = readViews();
  views.add(projectKey);
  writeViews(views);
  return shouldUnlockRoadScholar(views);
}
