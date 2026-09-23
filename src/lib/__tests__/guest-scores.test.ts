/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { LeaderboardEntry } from "@/lib/types";
import {
  computeGuestStats,
  loadGuestScores,
  mergeLeaderboard,
  recordGuestScore,
} from "../guest-scores";

describe("guest scores", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("records a run and computes stats from local scores", () => {
    recordGuestScore({
      score: 110,
      deathCause: "vehicle",
      coinsCollected: 5,
      coinBonus: 10,
      createdAt: "2026-09-20T12:00:00.000Z",
    });
    recordGuestScore({
      score: 40,
      deathCause: "water",
      coinsCollected: 0,
      coinBonus: 0,
      createdAt: "2026-09-20T12:05:00.000Z",
    });

    const scores = loadGuestScores();
    expect(scores).toHaveLength(2);

    const stats = computeGuestStats(scores);
    expect(stats).not.toBeNull();
    expect(stats?.gamesPlayed).toBe(2);
    expect(stats?.bestScore).toBe(110);
    expect(stats?.totalDistance).toBe(140);
    expect(stats?.totalCoins).toBe(5);
    expect(stats?.favoriteDeath).toBe("vehicle");
  });

  it("merges local runs onto the public board as the current player", () => {
    const local = [
      recordGuestScore({
        score: 80,
        deathCause: "train",
        coinsCollected: 1,
        coinBonus: 2,
      }),
    ];
    const server: LeaderboardEntry[] = [
      {
        id: "s1",
        rank: 1,
        score: 50,
        deathCause: "water",
        displayName: "Ada",
        createdAt: "2026-09-19T00:00:00.000Z",
        isCurrentUser: false,
      },
    ];

    const merged = mergeLeaderboard(server, local, 10);
    expect(merged[0].score).toBe(80);
    expect(merged[0].isCurrentUser).toBe(true);
    expect(merged[0].displayName).toBe("You");
    expect(merged[0].rank).toBe(1);
    expect(merged[1].displayName).toBe("Ada");
    expect(merged[1].rank).toBe(2);
  });

  it("returns null stats when the guest has never played", () => {
    expect(computeGuestStats([])).toBeNull();
  });
});
