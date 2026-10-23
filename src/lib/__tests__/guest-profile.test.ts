/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  GUEST_PROFILE_KEY,
  awardGuestXP,
  createEmptyGuestProfile,
  loadGuestState,
  mergeGuestIntoProfile,
  saveGuestState,
  unlockGuestAchievement,
  type GuestState,
} from "../guest-profile";

function fresh(overrides: Partial<GuestState> = {}): GuestState {
  return {
    profile: createEmptyGuestProfile(new Date("2026-09-20T12:00:00Z")),
    awardedKeys: [],
    ...overrides,
  };
}

describe("guest profile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("creates a level-1 visitor profile", () => {
    const profile = createEmptyGuestProfile(new Date("2026-09-20T12:00:00Z"));
    expect(profile.id).toBe("guest");
    expect(profile.xp).toBe(0);
    expect(profile.level).toBe(1);
    expect(profile.title).toBe("Visitor");
    expect(profile.achievements).toEqual([]);
  });

  it("awards first_visit XP once and ignores a second call", () => {
    const session = new Set<string>();
    const first = awardGuestXP(fresh(), "first_visit", undefined, session);
    expect(first.awarded).toBe(true);
    expect(first.state.profile.xp).toBe(10);

    const second = awardGuestXP(first.state, "first_visit", undefined, session);
    expect(second.awarded).toBe(false);
    expect(second.state.profile.xp).toBe(10);
  });

  it("levels up when crossing the Explorer threshold", () => {
    const session = new Set<string>();
    let state = fresh();
    state = awardGuestXP(state, "first_visit", undefined, session).state;
    state = awardGuestXP(state, "view_project", { key: "a" }, session).state;
    state = awardGuestXP(state, "view_project", { key: "b" }, session).state;
    state = awardGuestXP(state, "view_project", { key: "c" }, session).state;
    const result = awardGuestXP(state, "play_game", undefined, session);
    expect(result.state.profile.xp).toBe(35);
    const leveled = awardGuestXP(
      result.state,
      "use_demo",
      { key: "bar" },
      session,
    );
    expect(leveled.state.profile.xp).toBe(50);
    expect(leveled.state.profile.level).toBe(2);
    expect(leveled.state.profile.title).toBe("Explorer");
    expect(leveled.leveledUp).toBe(true);
  });

  it("unlocks an achievement once and adds its XP", () => {
    const first = unlockGuestAchievement(fresh(), "first_steps");
    expect(first.unlocked).toBe(true);
    expect(first.state.profile.achievements).toEqual(["first_steps"]);
    expect(first.state.profile.xp).toBe(10);

    const second = unlockGuestAchievement(first.state, "first_steps");
    expect(second.unlocked).toBe(false);
    expect(second.state.profile.xp).toBe(10);
  });

  it("round-trips through localStorage", () => {
    const session = new Set<string>();
    let state = awardGuestXP(fresh(), "first_visit", undefined, session).state;
    state = unlockGuestAchievement(state, "night_owl").state;
    saveGuestState(state);

    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    expect(raw).toBeTruthy();

    const loaded = loadGuestState();
    expect(loaded.profile.xp).toBe(state.profile.xp);
    expect(loaded.profile.achievements).toEqual(["night_owl"]);
    expect(loaded.awardedKeys).toContain("first_visit:");
  });

  it("merges guest progress into a signed-in profile without dropping either side", () => {
    const guest = createEmptyGuestProfile();
    guest.xp = 40;
    guest.achievements = ["first_steps", "night_owl"];
    guest.level = 1;
    guest.title = "Visitor";

    const server = createEmptyGuestProfile();
    server.id = "user-1";
    server.xp = 25;
    server.achievements = ["first_steps", "konami"];
    server.level = 1;

    const merged = mergeGuestIntoProfile(guest, server);
    expect(merged.id).toBe("user-1");
    expect(merged.xp).toBe(40);
    expect(merged.achievements.sort()).toEqual(
      ["first_steps", "konami", "night_owl"].sort(),
    );
    expect(merged.level).toBe(1);
  });
});
