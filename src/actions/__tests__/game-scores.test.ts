import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

import { submitScore, getLeaderboard, getPlayerStats } from "../game-scores";

const fakeUser = { id: "user-1", user_metadata: { preferred_username: "testuser" } };

function mockChain(data: unknown = null, error: unknown = null, count: number | null = null) {
  // `.order()` is awaited directly (getPlayerStats) but is also chained with
  // `.limit()` (getLeaderboard / getRecentScores). Make it both thenable and
  // expose a `.limit()` that resolves to the same payload.
  const orderResult = {
    limit: vi.fn().mockResolvedValue({ data, error }),
    then: (resolve: (v: { data: unknown; error: unknown }) => unknown) =>
      resolve({ data, error }),
  };

  // `.gte()` is used two ways:
  //   - submitScore rate limit: `.eq().gte()` is awaited directly → { count }
  //   - getLeaderboard week:     `.eq().gte().order().limit()` is chained → { data }
  // So make it a thenable that also exposes `.order()`.
  const gteResult = Object.assign(Promise.resolve({ count, error: null }), {
    order: vi.fn().mockReturnValue(orderResult),
  });

  // `.eq()` must support: a second `.eq()` (player stats / recent scores),
  // `.gte()` (rate limit + week filter), and `.order()` (leaderboard all).
  const eqResult = {
    eq: vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue(orderResult),
    }),
    gte: vi.fn().mockReturnValue(gteResult),
    order: vi.fn().mockReturnValue(orderResult),
  };

  const chain: Record<string, unknown> = {
    insert: vi.fn().mockResolvedValue({ data, error }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue(eqResult),
      order: vi.fn().mockReturnValue(orderResult),
    }),
  };
  mockFrom.mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
});

describe("submitScore", () => {
  it("rejects unauthenticated users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await submitScore(100, "car");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("inserts score on success", async () => {
    const chain = mockChain(null, null, 0);
    const result = await submitScore(100, "car", "adventure", 5, 10);
    expect(chain.insert).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("returns error on insert failure", async () => {
    mockChain(null, { message: "DB error" }, 0);
    const result = await submitScore(100, "car");
    expect(result).toEqual({ error: "DB error" });
  });
});

describe("getLeaderboard", () => {
  it("returns scores", async () => {
    const scores = [
      { id: "1", score: 200, death_cause: "car", created_at: "2024-01-01", user_id: "user-1", display_name: "test" },
    ];
    mockChain(scores);
    const result = await getLeaderboard(10);
    expect(result.scores.length).toBe(1);
    expect(result.scores[0].rank).toBe(1);
  });

  it("returns empty on error", async () => {
    mockChain(null, { message: "fail" });
    const result = await getLeaderboard();
    expect(result.scores).toEqual([]);
    expect(result.error).toBe("fail");
  });

  it("applies 7-day filter when period is 'week'", async () => {
    const scores = [
      { id: "1", score: 100, death_cause: "water", created_at: new Date().toISOString(), user_id: "user-1", display_name: "test" },
    ];
    mockChain(scores);
    const result = await getLeaderboard(10, "adventure", "week");
    expect(result.scores.length).toBe(1);
    expect(result.error).toBeUndefined();
  });
});

describe("getPlayerStats", () => {
  it("rejects unauthenticated users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await getPlayerStats();
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns null stats when there are no rows", async () => {
    mockChain([], null);
    const result = await getPlayerStats();
    expect("stats" in result && result.stats).toBe(null);
  });

  it("counts coins exactly once: totalDistance excludes coin bonus", async () => {
    // score column = distance + coin_bonus (ranking value).
    // Row A: distance 100 + 10 coin bonus = score 110
    // Row B: distance 200 + 0  coin bonus = score 200
    const rows = [
      {
        score: 110,
        death_cause: "car",
        created_at: "2024-01-02",
        coins_collected: 5,
        coin_bonus: 10,
      },
      {
        score: 200,
        death_cause: "train",
        created_at: "2024-01-01",
        coins_collected: 0,
        coin_bonus: 0,
      },
    ];
    mockChain(rows);
    const result = await getPlayerStats();
    if (!("stats" in result) || !result.stats) throw new Error("expected stats");
    const stats = result.stats;

    // distance only: (110 - 10) + (200 - 0) = 300
    expect(stats.totalDistance).toBe(300);
    // coins reported once, via coins_collected
    expect(stats.totalCoins).toBe(5);
    // best/avg still rank on the score column (distance + coins), unchanged
    expect(stats.bestScore).toBe(200);
    expect(stats.avgScore).toBe(155);
    expect(stats.bestCoins).toBe(5);
    expect(stats.bestCoinBonus).toBe(10);
    expect(stats.gamesPlayed).toBe(2);
  });

  it("treats missing coin_bonus as zero (legacy rows count fully as distance)", async () => {
    const rows = [
      {
        score: 150,
        death_cause: "car",
        created_at: "2024-01-01",
        coins_collected: 0,
        coin_bonus: null,
      },
    ];
    mockChain(rows);
    const result = await getPlayerStats();
    if (!("stats" in result) || !result.stats) throw new Error("expected stats");
    // null coin_bonus -> subtract 0 -> distance equals raw score
    expect(result.stats.totalDistance).toBe(150);
  });
});
