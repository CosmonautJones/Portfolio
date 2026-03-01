"use client";

import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/lib/types";

function AchievementIcon({ iconName, className }: { iconName: string; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[iconName] as React.ComponentType<{ className?: string }> | undefined;
  if (!IconComponent) return <Trophy className={className} />;
  return <IconComponent className={className} />;
}

interface AchievementToastProps {
  achievement: Achievement;
  visible: boolean;
}

/**
 * Standalone animated achievement toast for special occasions.
 * For standard toasts, we use Sonner via toast.success() in visitor-context.
 * This component is available for custom overlays if needed.
 */
export function AchievementToast({ achievement, visible }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="pointer-events-none fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-lg border border-amber-500/40 bg-background/95 px-4 py-3 shadow-lg shadow-amber-500/10 backdrop-blur-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <AchievementIcon iconName={achievement.icon} className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-400">Achievement Unlocked</p>
            <p className="text-sm font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
          </div>
          <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-accent-glow" style={{ background: "color-mix(in oklch, var(--accent-1), transparent 80%)" }}>
            +{achievement.xpReward} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
