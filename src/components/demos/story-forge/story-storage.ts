import {
  DEFAULT_PREFS,
  DIFFICULTIES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MODES,
  STORAGE_KEY,
  TIMER_PRESETS,
  type Difficulty,
  type FavoriteRoll,
  type Mode,
  type StoryPrefs,
  type TimerPreset,
} from "./story-types";
import { clampPlayerCount, normalizeSeed } from "./story-engine";

function isMode(value: unknown): value is Mode {
  return typeof value === "string" && (MODES as readonly string[]).includes(value);
}

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && (DIFFICULTIES as readonly string[]).includes(value);
}

function isTimer(value: unknown): value is TimerPreset {
  return typeof value === "number" && (TIMER_PRESETS as readonly number[]).includes(value);
}

function sanitizeFavorite(raw: unknown): FavoriteRoll | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<FavoriteRoll>;
  if (typeof value.seed !== "string" || typeof value.title !== "string") return null;
  if (!isMode(value.mode) || !isDifficulty(value.difficulty)) return null;
  if (!value.prompts || typeof value.prompts !== "object") return null;
  const prompts = value.prompts as FavoriteRoll["prompts"];
  if (
    typeof prompts.character !== "string" ||
    typeof prompts.place !== "string" ||
    typeof prompts.object !== "string" ||
    typeof prompts.problem !== "string" ||
    typeof prompts.twist !== "string"
  ) {
    return null;
  }
  return {
    seed: normalizeSeed(value.seed),
    mode: value.mode,
    difficulty: value.difficulty,
    title: value.title.slice(0, 80),
    prompts,
    savedAt: typeof value.savedAt === "number" ? value.savedAt : Date.now(),
  };
}

export function parsePrefs(raw: unknown): StoryPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PREFS, playerNames: [...DEFAULT_PREFS.playerNames] };
  const value = raw as Partial<StoryPrefs>;
  const playerNames = Array.isArray(value.playerNames)
    ? [...value.playerNames, "", "", "", "", ""].slice(0, MAX_PLAYERS).map((name) =>
        typeof name === "string" ? name.slice(0, 24) : "",
      )
    : [...DEFAULT_PREFS.playerNames];
  const favorites = Array.isArray(value.favorites)
    ? value.favorites
        .map(sanitizeFavorite)
        .filter((item): item is FavoriteRoll => item !== null)
        .slice(0, 24)
    : [];
  const playerCount = typeof value.playerCount === "number"
    ? clampPlayerCount(value.playerCount)
    : MIN_PLAYERS;
  return {
    version: 1,
    favorites,
    preferredMode: isMode(value.preferredMode) ? value.preferredMode : DEFAULT_PREFS.preferredMode,
    preferredDifficulty: isDifficulty(value.preferredDifficulty)
      ? value.preferredDifficulty
      : DEFAULT_PREFS.preferredDifficulty,
    preferredTimer: isTimer(value.preferredTimer) ? value.preferredTimer : DEFAULT_PREFS.preferredTimer,
    playerNames,
    playerCount,
    storiesCompleted:
      typeof value.storiesCompleted === "number" && Number.isFinite(value.storiesCompleted)
        ? Math.max(0, Math.floor(value.storiesCompleted))
        : 0,
    muted: typeof value.muted === "boolean" ? value.muted : true,
  };
}

export function loadPrefs(storage: Pick<Storage, "getItem"> | null): StoryPrefs {
  const fallback = { ...DEFAULT_PREFS, playerNames: [...DEFAULT_PREFS.playerNames] };
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return parsePrefs(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

export function savePrefs(
  prefs: StoryPrefs,
  storage: Pick<Storage, "setItem"> | null,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, version: 1 }));
    return true;
  } catch {
    return false;
  }
}

export function resetStoryForgeStorage(storage: Pick<Storage, "removeItem" | "getItem" | "key" | "length"> | null): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
    const stale: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && key.startsWith("cosmonaut-story-forge")) stale.push(key);
    }
    for (const key of stale) storage.removeItem(key);
  } catch {
    // Storage can be blocked; fail closed.
  }
}

export function upsertFavorite(prefs: StoryPrefs, favorite: FavoriteRoll): StoryPrefs {
  const without = prefs.favorites.filter(
    (item) => !(item.seed === favorite.seed && item.mode === favorite.mode && item.difficulty === favorite.difficulty),
  );
  return {
    ...prefs,
    favorites: [favorite, ...without].slice(0, 24),
  };
}

export function removeFavorite(prefs: StoryPrefs, seed: string, mode: Mode, difficulty: Difficulty): StoryPrefs {
  return {
    ...prefs,
    favorites: prefs.favorites.filter(
      (item) => !(item.seed === seed && item.mode === mode && item.difficulty === difficulty),
    ),
  };
}

export function isFavorited(
  prefs: StoryPrefs,
  seed: string,
  mode: Mode,
  difficulty: Difficulty,
): boolean {
  return prefs.favorites.some(
    (item) => item.seed === seed && item.mode === mode && item.difficulty === difficulty,
  );
}
