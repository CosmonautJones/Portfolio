"use client";

import { Trophy, Lock } from "lucide-react";
import * as Icons from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useVisitor } from "@/hooks/use-visitor";
import { ACHIEVEMENTS, getTotalAchievementCount } from "@/lib/achievements";
import { cn } from "@/lib/utils";

function AchievementIcon({ iconName, className }: { iconName: string; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[iconName] as React.ComponentType<{ className?: string }> | undefined;
  if (!IconComponent) return <Trophy className={className} />;
  return <IconComponent className={className} />;
}

export function AchievementPanel() {
  const { profile, isAuthenticated, loading } = useVisitor();

  if (!isAuthenticated || loading) return null;

  const unlockedIds = new Set(profile?.achievements ?? []);
  const unlockedCount = unlockedIds.size;
  const totalCount = getTotalAchievementCount();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <Trophy className="h-4 w-4" />
          {unlockedCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
              {unlockedCount}
            </span>
          )}
          <span className="sr-only">Achievements</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Achievements
          </SheetTitle>
          <SheetDescription>
            {unlockedCount} / {totalCount} unlocked
            {profile && (
              <span className="ml-2 text-violet-400">
                &middot; Level {profile.level} &middot; {profile.title}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3 p-4">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = unlockedIds.has(achievement.id);
            const isSecret = achievement.secret && !unlocked;

            return (
              <div
                key={achievement.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors",
                  unlocked
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border/50 bg-muted/30 opacity-60"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    unlocked ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground"
                  )}
                >
                  {isSecret ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <AchievementIcon iconName={achievement.icon} className="h-5 w-5" />
                  )}
                </div>
                <p className="text-xs font-medium leading-tight">
                  {isSecret ? "???" : achievement.name}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {isSecret ? "Hidden achievement" : achievement.description}
                </p>
                {unlocked && (
                  <span className="text-[10px] font-semibold text-amber-400">
                    +{achievement.xpReward} XP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
