import { describe, expect, it } from "vitest";
import {
  loadPrefs,
  parsePrefs,
  removeFavorite,
  resetStoryForgeStorage,
  savePrefs,
  upsertFavorite,
} from "../story-storage";
import { DEFAULT_PREFS, STORAGE_KEY, type FavoriteRoll, type StoryPrefs } from "../story-types";

function memoryStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    get length() {
      return Object.keys(store).length;
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
  };
}

const sampleFavorite: FavoriteRoll = {
  seed: "COSMO-7F3K",
  mode: "family",
  difficulty: "everyone",
  title: "The Tiny Dragon and the Suspicious Sandwich",
  prompts: {
    character: "Tiny dragon",
    place: "Abandoned theme park",
    object: "Suspicious sandwich",
    problem: "Everything is floating",
    twist: "The villain is actually helping",
  },
  savedAt: 1,
};

describe("story forge storage", () => {
  it("returns defaults for missing or malformed localStorage", () => {
    expect(loadPrefs(null).preferredMode).toBe(DEFAULT_PREFS.preferredMode);
    const broken = memoryStorage({ [STORAGE_KEY]: "{not-json" });
    const prefs = loadPrefs(broken);
    expect(prefs.favorites).toHaveLength(0);
    expect(prefs.playerCount).toBe(2);
    expect(parsePrefs({ version: 99, preferredMode: "nope", playerCount: 400 }).playerCount).toBe(5);
  });

  it("saves and loads favorites", () => {
    const storage = memoryStorage();
    const prefs: StoryPrefs = upsertFavorite(
      { ...DEFAULT_PREFS, playerNames: [...DEFAULT_PREFS.playerNames] },
      sampleFavorite,
    );
    expect(savePrefs(prefs, storage)).toBe(true);
    const loaded = loadPrefs(storage);
    expect(loaded.favorites[0]?.seed).toBe("COSMO-7F3K");
    expect(removeFavorite(loaded, "COSMO-7F3K", "family", "everyone").favorites).toHaveLength(0);
  });

  it("reset clears only Story Forge-owned keys", () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: "{}",
      "cosmonaut-story-forge:extra": "1",
      unrelated: "keep-me",
    });
    resetStoryForgeStorage(storage);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(storage.getItem("cosmonaut-story-forge:extra")).toBeNull();
    expect(storage.getItem("unrelated")).toBe("keep-me");
  });

  it("save failures degrade gracefully", () => {
    const exploding = {
      setItem() {
        throw new Error("quota");
      },
    };
    expect(
      savePrefs({ ...DEFAULT_PREFS, playerNames: [...DEFAULT_PREFS.playerNames] }, exploding),
    ).toBe(false);
  });
});
