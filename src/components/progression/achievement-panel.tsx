"use client";

import { useMemo } from "react";
import { Trophy, Lock, Compass, Gamepad2 } from "lucide-react";
import { getIcon } from "@/lib/icon-map";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useVisitor } from "@/hooks/use-visitor";
import {
  getTotalAchievementCount,
  getSiteAchievements,
  getGameAchievements,
} from "@/lib/achievements";
import type { Achievement } from "@/lib/types";
import { cn } from "@/lib/utils";

function AchievementIcon({ iconName, className }: { iconName: string; className?: string }) {
  const IconComponent = getIcon(iconName);
  return <IconComponent className={className} />;
}

function AchievementGrid({
  achievements,
  unlockedIds,
}: {
  achievements: Achievement[];
  unlockedIds: Set<string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {achievements.map((achievement) => {
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
  );
}

export function AchievementPanel() {
  const { profile, isAuthenticated, loading } = useVisitor();
  const unlockedIds = useMemo(() => new Set(profile?.achievements ?? []), [profile?.achievements]);

  const siteAchievements = useMemo(() => getSiteAchievements(), []);
  const gameAchievements = useMemo(() => getGameAchievements(), []);

  if (!isAuthenticated || loading) return null;

  const unlockedCount = unlockedIds.size;
  const totalCount = getTotalAchievementCount();
  const siteUnlocked = siteAchievements.filter((a) => unlockedIds.has(a.id)).length;
  const gameUnlocked = gameAchievements.filter((a) => unlockedIds.has(a.id)).length;

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
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full accent-dot text-[9px] font-bold text-white">
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
              <span className="ml-2 text-accent-glow">
                &middot; Level {profile.level} &middot; {profile.title}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="p-4">
          <Tabs defaultValue="exploration">
            <TabsList className="w-full">
              <TabsTrigger value="exploration" className="flex-1 gap-1">
                <Compass className="h-3.5 w-3.5" />
                Exploration
                <span className="text-[10px] text-muted-foreground">
                  {siteUnlocked}/{siteAchievements.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="adventure" className="flex-1 gap-1">
                <Gamepad2 className="h-3.5 w-3.5" />
                Adventure
                <span className="text-[10px] text-muted-foreground">
                  {gameUnlocked}/{gameAchievements.length}
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="exploration" className="mt-3">
              <AchievementGrid achievements={siteAchievements} unlockedIds={unlockedIds} />
            </TabsContent>
            <TabsContent value="adventure" className="mt-3">
              <AchievementGrid achievements={gameAchievements} unlockedIds={unlockedIds} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
