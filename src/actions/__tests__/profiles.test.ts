import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

vi.mock("@/lib/xp", () => ({
  getLevelForXP: vi.fn((xp: number) => {
    if (xp >= 150) return { level: 3, xp: 150, title: "Adventurer" };
    if (xp >= 50) return { level: 2, xp: 50, title: "Explorer" };
    return { level: 1, xp: 0, title: "Visitor" };
  }),
}));

vi.mock("@/lib/achievements", () => ({
  getAchievement: vi.fn((id: string) =>
    id === "first_steps" ? { id: "first_steps", name: "First Steps", xpReward: 10 } : undefined
  ),
}));

import { getProfile, awardXP, trackEvent } from "../profiles";

const fakeUser = { id: "user-1" };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
});

describe("getProfile", () => {
  it("returns error for unauthenticated users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await getProfile();
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns profile on success", async () => {
    const profile = { id: "user-1", xp: 100, level: 2 };
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: profile, error: null }),
        }),
      }),
    });
    const result = await getProfile();
    expect(result).toHaveProperty("profile");
  });

  it("auto-creates profile on first access", async () => {
    const newProfile = { id: "user-1", xp: 0, level: 1 };
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: newProfile, error: null }),
        }),
      }),
    });
    const result = await getProfile();
    expect(result).toHaveProperty("profile");
  });
});

describe("awardXP", () => {
  it("rejects unauthenticated users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await awardXP(10, "test");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("awards XP and returns new state", async () => {
    const profile = { xp: 40, level: 1, title: "Visitor" };
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: profile, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    const result = await awardXP(20, "test");
    expect(result).toHaveProperty("newXP", 60);
    expect(result).toHaveProperty("leveledUp", true);
  });
});

describe("trackEvent", () => {
  it("rejects unauthenticated users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await trackEvent("test_event");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("inserts event on success", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: insertMock });
    const result = await trackEvent("test_event", { foo: "bar" });
    expect(result).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalled();
  });
});
