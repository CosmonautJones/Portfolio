"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useVisitor } from "@/hooks/use-visitor";
import { getLevelProgress, getNextLevelXP } from "@/lib/xp";

export function XPBar() {
  const { profile, isAuthenticated, loading } = useVisitor();

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const progress = getLevelProgress(xp);
  const nextXP = getNextLevelXP(xp);
  const springProgress = useSpring(progress, { stiffness: 100, damping: 30 });
  const width = useTransform(springProgress, (v) => `${v}%`);

  if (!isAuthenticated || loading || !profile) return null;

  const tooltipText = nextXP
    ? `Level ${level} \u2014 ${xp}/${nextXP} XP`
    : `Level ${level} \u2014 MAX`;

  return (
    <div className="group relative flex items-center gap-2" title={tooltipText}>
      <span className="text-[10px] font-bold text-accent-glow tabular-nums">
        {level}
      </span>
      <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full xp-bar-fill"
          style={{ width }}
        />
      </div>
      {/* Hover tooltip */}
      <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {tooltipText}
      </div>
    </div>
  );
}
