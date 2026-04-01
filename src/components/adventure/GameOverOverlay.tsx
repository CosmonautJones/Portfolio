"use client";

import type { DeathCause } from "@/lib/game/types";
import type { LeaderboardEntry } from "@/lib/types";
import {
  ACHIEVEMENTS,
  TOTAL_ACHIEVEMENTS,
} from "@/lib/game/achievements";
import {
  getDeathIcon,
  getDeathMessage,
  getDeathColor,
  getRankColor,
  padScore,
} from "./game-helpers";

interface GameOverOverlayProps {
  canvasWidth: number;
  score: number;
  highScore: number;
  level: number;
  deathCause: DeathCause | null;
  coinsCollected: number;
  coinBonus: number;
  isNewHighScore: boolean;
  hasSidebars: boolean;
  leaderboard: LeaderboardEntry[];
  unlockedAchievements: Set<string>;
}

export function GameOverOverlay({
  canvasWidth,
  score,
  highScore,
  level,
  deathCause,
  coinsCollected,
  coinBonus,
  isNewHighScore,
  hasSidebars,
  leaderboard,
  unlockedAchievements,
}: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/70">
      {/* Retro frame */}
      <div
        className="flex flex-col items-center px-3 py-3"
        style={{
          width: "90%",
          maxHeight: "88%",
          background: "#1a1c2c",
          border: "2px solid #ffcd75",
          boxShadow:
            "inset 0 0 0 1px #1a1c2c, inset 0 0 0 3px #c4a35a",
          overflow: "hidden",
        }}
      >
        {/* GAME OVER title */}
        <h2
          className="font-bold mb-1"
          style={{
            fontSize: canvasWidth * 0.1,
            color: "#d4513b",
            textShadow:
              "0 0 8px #d4513b, 0 0 16px #b13e53, 0 0 24px #9e2835, 2px 2px 0 #000",
            animation: "titleFlicker 3s infinite",
          }}
        >
          GAME OVER
        </h2>

        {/* Death cause with icon */}
        <p
          className="mb-2"
          style={{
            fontSize: canvasWidth * 0.045,
            color: deathCause
              ? getDeathColor(deathCause)
              : "#f4f4f4",
            textShadow: "1px 1px 0 #000",
          }}
        >
          {getDeathIcon(deathCause)} {getDeathMessage(deathCause)}
        </p>

        {/* Score display */}
        <div
          className="font-mono font-bold mb-1"
          style={{
            fontSize: canvasWidth * 0.08,
            color: "#f4f4f4",
            textShadow: "2px 2px 0 #000",
            animation: "scoreCountUp 0.5s ease-out",
          }}
        >
          SCORE: {padScore(score)}
        </div>

        {/* Coin breakdown */}
        {coinsCollected > 0 && (
          <div
            className="font-mono mb-1"
            style={{
              fontSize: canvasWidth * 0.04,
              color: "#ffcd75",
              textShadow: "1px 1px 0 #000",
            }}
          >
            COINS: {coinsCollected} (+{coinBonus})
          </div>
        )}

        <div
          className="font-mono mb-1"
          style={{
            fontSize: canvasWidth * 0.04,
            color: "#94b0c2",
            textShadow: "1px 1px 0 #000",
          }}
        >
          LVL {level} | BEST: {padScore(highScore)}
        </div>

        {/* New high score flash */}
        {isNewHighScore && (
          <div
            className="font-bold mb-1"
            style={{
              fontSize: canvasWidth * 0.05,
              color: "#ffcd75",
              textShadow: "0 0 8px #ffcd75, 0 0 16px #ef7d57",
              animation: "newHighFlash 0.8s infinite",
            }}
          >
            NEW HIGH SCORE!
          </div>
        )}

        {/* Leaderboard -- only show inline on mobile (no sidebars) */}
        {!hasSidebars && leaderboard.length > 0 && (
          <div
            className="w-full mt-1 overflow-y-auto"
            style={{
              maxHeight: "35%",
              scrollbarWidth: "thin",
              scrollbarColor: "#566c86 #1a1c2c",
            }}
          >
            {/* Header */}
            <div
              className="text-center font-bold mb-1"
              style={{
                fontSize: canvasWidth * 0.05,
                color: "#ffcd75",
                textShadow: "1px 1px 0 #000",
              }}
            >
              HIGH SCORES
            </div>
            <div
              className="mx-auto mb-1"
              style={{
                width: "60%",
                height: 1,
                background:
                  "linear-gradient(to right, transparent, #ffcd75, transparent)",
              }}
            />

            {/* Score rows */}
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center px-1 py-0.5 font-mono"
                style={{
                  fontSize: canvasWidth * 0.032,
                  color: entry.isCurrentUser
                    ? "#ffcd75"
                    : entry.rank <= 3
                      ? getRankColor(entry.rank)
                      : "#94b0c2",
                  textShadow: "1px 1px 0 #000",
                  ...(entry.isCurrentUser
                    ? {
                        background: "rgba(255, 205, 117, 0.1)",
                        animation: "rowPulse 2s infinite",
                      }
                    : {}),
                }}
              >
                {/* Rank */}
                <span
                  className="font-bold shrink-0"
                  style={{
                    width: canvasWidth * 0.08,
                    color: getRankColor(entry.rank),
                  }}
                >
                  {entry.isCurrentUser ? ">>>" : `#${entry.rank}`}
                </span>
                {/* Display name */}
                <span
                  className="truncate shrink-1 mx-0.5"
                  style={{
                    maxWidth: canvasWidth * 0.25,
                    fontSize: canvasWidth * 0.028,
                    color: entry.isCurrentUser ? "#ffcd75" : "#73869c",
                  }}
                >
                  {entry.displayName ?? "???"}
                </span>
                {/* Dot leader */}
                <span
                  className="flex-1 overflow-hidden mx-1"
                  style={{
                    borderBottom:
                      "1px dotted rgba(148, 176, 194, 0.3)",
                  }}
                />
                {/* Death cause badge */}
                <span
                  className="mx-0.5 shrink-0"
                  style={{
                    fontSize: canvasWidth * 0.025,
                    color: getDeathColor(entry.deathCause),
                    opacity: 0.8,
                  }}
                >
                  {getDeathIcon(entry.deathCause as DeathCause)}
                </span>
                {/* Score */}
                <span className="font-bold shrink-0">
                  {padScore(entry.score)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Achievement grid */}
        <div className="w-full mt-2">
          <div
            className="text-center font-bold mb-1"
            style={{
              fontSize: canvasWidth * 0.035,
              color: "#94b0c2",
              textShadow: "1px 1px 0 #000",
            }}
          >
            ACHIEVEMENTS ({unlockedAchievements.size}/{TOTAL_ACHIEVEMENTS})
          </div>
          <div
            className="flex flex-wrap justify-center gap-1 px-1"
          >
            {ACHIEVEMENTS.map((a) => {
              const isUnlocked = unlockedAchievements.has(a.id);
              return (
                <div
                  key={a.id}
                  title={
                    isUnlocked
                      ? `${a.name}: ${a.description}`
                      : "???"
                  }
                  className="pointer-events-auto cursor-default"
                  style={{
                    fontSize: canvasWidth * 0.045,
                    opacity: isUnlocked ? 1 : 0.25,
                    filter: isUnlocked ? "none" : "grayscale(1)",
                    transition: "opacity 0.3s, filter 0.3s",
                  }}
                >
                  {a.emoji}
                </div>
              );
            })}
          </div>
        </div>

        {/* Restart prompt */}
        <p
          className="mt-2"
          style={{
            fontSize: canvasWidth * 0.035,
            color: "#566c86",
            textShadow: "1px 1px 0 #000",
          }}
        >
          Press any key to restart
        </p>
      </div>
    </div>
  );
}
