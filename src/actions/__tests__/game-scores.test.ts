import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

import { submitScore, getLeaderboard } from "../game-scores";

const fakeUser = { id: "user-1", user_metadata: { preferred_username: "testuser" } };

function mockChain(data: unknown = null, error: unknown = null, count: number | null = null) {
  const chain: Record<string, unknown> = {
    insert: vi.fn().mockResolvedValue({ data, error }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data, error }),
          }),
        }),
        gte: vi.fn().mockResolvedValue({ count, error: null }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data, error }),
        }),
      }),
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data, error }),
      }),
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
});
