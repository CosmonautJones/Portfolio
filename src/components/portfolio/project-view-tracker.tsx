"use client";

import { useEffect, useRef } from "react";
import { useVisitor } from "@/hooks/use-visitor";
import { rememberProjectView } from "@/lib/project-views";

export function ProjectViewTracker({ projectKey }: { projectKey: string }) {
  const { awardXP, unlockAchievement } = useVisitor();
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current || !projectKey) return;
    recorded.current = true;
    awardXP("view_project", { key: projectKey });
    if (rememberProjectView(projectKey)) {
      unlockAchievement("road_scholar");
    }
  }, [awardXP, unlockAchievement, projectKey]);

  return null;
}
