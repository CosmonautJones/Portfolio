"use client";

import { useState, useEffect, useMemo } from "react";
import { RetroPanel } from "./RetroPanel";
import {
  getDailyChallenges,
  getWeeklyChallenges,
  loadCompletions,
} from "@/lib/game/challenges";
import type { Challenge, ChallengeProgress } from "@/lib/game/types";

function getChallengeIcon(type: string): string {
  switch (type) {
    case "score_target": return "\u{1F3AF}";
    case "collection": return "\u{1FA99}";
    case "survival": return "\u{23F1}";
    case "restriction": return "\u{26A0}";
    default: return "\u{2753}";
  }
}

interface ChallengePanelProps {
  /** Live progress from the current game session */
  liveProgress?: ChallengeProgress[];
  /** Key to trigger refresh (e.g., death count) */
  refreshKey?: number;
}

export function ChallengePanel({ liveProgress, refreshKey }: ChallengePanelProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const dailyChallenges = useMemo(() => getDailyChallenges(), []);
  const weeklyChallenges = useMemo(() => getWeeklyChallenges(), []);
  const allChallenges = useMemo(
    () => [...dailyChallenges, ...weeklyChallenges],
    [dailyChallenges, weeklyChallenges],
  );

  useEffect(() => {
    const completions = loadCompletions();
    setCompletedIds(new Set(completions.map((c) => c.challengeId)));
  }, [refreshKey]);

  const getProgress = (challenge: Challenge): ChallengeProgress | undefined => {
    return liveProgress?.find((p) => p.challengeId === challenge.id);
  };

  const isCompleted = (challenge: Challenge): boolean => {
    const progress = getProgress(challenge);
    return completedIds.has(challenge.id) || (progress?.completed ?? false);
  };

  return (
    <RetroPanel title="Challenges">
      {/* Daily section */}
      <div className="mb-2">
        <div
          className="font-mono text-[9px] uppercase tracking-wider mb-1"
          style={{ color: "#94b0c2" }}
        >
          Daily
        </div>
        <div className="space-y-1">
          {dailyChallenges.map((challenge) => (
            <ChallengeRow
              key={challenge.id}
              challenge={challenge}
              progress={getProgress(challenge)}
              completed={isCompleted(challenge)}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="my-1.5"
        style={{
          height: 1,
          background: "linear-gradient(to right, transparent, #333c57, transparent)",
        }}
      />

      {/* Weekly section */}
      <div>
        <div
          className="font-mono text-[9px] uppercase tracking-wider mb-1"
          style={{ color: "#94b0c2" }}
        >
          Weekly
        </div>
        <div className="space-y-1">
          {weeklyChallenges.map((challenge) => (
            <ChallengeRow
              key={challenge.id}
              challenge={challenge}
              progress={getProgress(challenge)}
              completed={isCompleted(challenge)}
            />
          ))}
        </div>
      </div>

      {/* Completion count */}
      <div className="mt-2 text-center">
        <span className="font-mono text-[9px]" style={{ color: "#566c86" }}>
          {Array.from(completedIds).filter((id) =>
            allChallenges.some((c) => c.id === id),
          ).length}
          /{allChallenges.length} completed
        </span>
      </div>
    </RetroPanel>
  );
}

// --- Individual Challenge Row ---

interface ChallengeRowProps {
  challenge: Challenge;
  progress?: ChallengeProgress;
  completed: boolean;
}

function ChallengeRow({ challenge, progress, completed }: ChallengeRowProps) {
  const icon = getChallengeIcon(challenge.type);
  const progressPercent = progress
    ? Math.min(100, Math.round((progress.current / progress.target) * 100))
    : 0;

  return (
    <div
      className="flex items-start gap-1.5 font-mono text-[10px] px-1 py-0.5 rounded-sm"
      style={{
        color: completed ? "#38b764" : progress?.violated ? "#d4513b" : "#94b0c2",
        background: completed
          ? "rgba(56, 183, 100, 0.06)"
          : "transparent",
      }}
    >
      {/* Icon */}
      <span className="shrink-0 text-[11px]">{completed ? "\u2705" : icon}</span>

      {/* Description and progress */}
      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{
            textDecoration: completed ? "line-through" : "none",
            opacity: completed ? 0.7 : 1,
          }}
        >
          {challenge.description}
        </div>
        {!completed && progress && progress.current > 0 && (
          <div className="mt-0.5">
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: "#333c57" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  background: progress.violated ? "#d4513b" : "#41a6f6",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* XP Reward */}
      <span
        className="shrink-0 text-[9px]"
        style={{ color: completed ? "#38b764" : "#ffcd75" }}
      >
        {completed ? "\u2713" : `+${challenge.xpReward}xp`}
      </span>
    </div>
  );
}
