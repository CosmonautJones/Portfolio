import type { Skin, SkinId } from "./types";

// ---------------------------------------------------------------------------
// Skin definitions
// ---------------------------------------------------------------------------
// Each skin remaps palette indices used by the lobster sprite.
// The lobster uses these palette indices:
//   1  = dark navy (outlines)
//  17 = lobster red (body mid)
//  18 = lobster light (highlight)
//  19 = lobster dark (shadow)
//  88 = emissive cyan (eyes)
//
// paletteOverrides maps original index → replacement index.

export const SKINS: Record<SkinId, Skin> = {
  default: {
    id: "default",
    name: "Lobster",
    paletteOverrides: {},
  },
  golden: {
    id: "golden",
    name: "Golden Lobster",
    paletteOverrides: {
      17: 5,   // body → gold
      18: 42,  // highlight → gold highlight
      19: 43,  // shadow → gold shadow
      88: 13,  // eyes → near-white
    },
  },
  ghost: {
    id: "ghost",
    name: "Ghost Lobster",
    paletteOverrides: {
      17: 14,  // body → steel gray
      18: 13,  // highlight → near-white
      19: 15,  // shadow → slate
      88: 12,  // eyes → cyan
    },
  },
  diamond: {
    id: "diamond",
    name: "Diamond Lobster",
    paletteOverrides: {
      17: 11,  // body → sky blue
      18: 12,  // highlight → cyan
      19: 8,   // shadow → teal
      88: 13,  // eyes → near-white
    },
  },
  rainbow: {
    id: "rainbow",
    name: "Rainbow Lobster",
    paletteOverrides: {
      // Rainbow cycles at render time — these are the "base" colors
      // that the renderer can cycle through
      17: 3,   // body → cranberry (base)
      18: 4,   // highlight → claude orange (base)
      19: 2,   // shadow → plum (base)
      88: 88,  // eyes stay emissive cyan
    },
  },
};

// ---------------------------------------------------------------------------
// Skin unlock conditions
// ---------------------------------------------------------------------------

export interface SkinUnlockCondition {
  type: "score" | "deaths" | "diamonds" | "achievements";
  threshold: number;
}

export const SKIN_UNLOCK_CONDITIONS: Record<SkinId, SkinUnlockCondition | null> = {
  default: null, // always available
  golden: { type: "score", threshold: 200 },
  ghost: { type: "deaths", threshold: 50 },
  diamond: { type: "diamonds", threshold: 100 },
  rainbow: { type: "achievements", threshold: -1 }, // all game achievements
};

// ---------------------------------------------------------------------------
// Storage helpers (localStorage)
// ---------------------------------------------------------------------------

const SELECTED_SKIN_KEY = "adventure_skin";
const UNLOCKED_SKINS_KEY = "adventure_skins_unlocked";

export function getSelectedSkin(): SkinId {
  if (typeof localStorage === "undefined") return "default";
  const stored = localStorage.getItem(SELECTED_SKIN_KEY);
  if (stored && stored in SKINS) return stored as SkinId;
  return "default";
}

export function setSelectedSkin(id: SkinId): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SELECTED_SKIN_KEY, id);
}

export function getUnlockedSkins(): SkinId[] {
  if (typeof localStorage === "undefined") return ["default"];
  const stored = localStorage.getItem(UNLOCKED_SKINS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as string[];
      return parsed.filter((s): s is SkinId => s in SKINS);
    } catch {
      return ["default"];
    }
  }
  return ["default"];
}

export function unlockSkin(id: SkinId): boolean {
  const unlocked = getUnlockedSkins();
  if (unlocked.includes(id)) return false;
  unlocked.push(id);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(UNLOCKED_SKINS_KEY, JSON.stringify(unlocked));
  }
  return true;
}

// ---------------------------------------------------------------------------
// Check unlock conditions against game stats
// ---------------------------------------------------------------------------

export interface GameStats {
  highScore: number;
  totalDeaths: number;
  totalDiamonds: number;
  allAchievements: boolean;
}

export function checkSkinUnlocks(stats: GameStats): SkinId[] {
  const newlyUnlocked: SkinId[] = [];
  const already = getUnlockedSkins();

  for (const [id, condition] of Object.entries(SKIN_UNLOCK_CONDITIONS)) {
    const skinId = id as SkinId;
    if (already.includes(skinId)) continue;
    if (condition === null) continue;

    let met = false;
    switch (condition.type) {
      case "score":
        met = stats.highScore >= condition.threshold;
        break;
      case "deaths":
        met = stats.totalDeaths >= condition.threshold;
        break;
      case "diamonds":
        met = stats.totalDiamonds >= condition.threshold;
        break;
      case "achievements":
        met = stats.allAchievements;
        break;
    }

    if (met) {
      unlockSkin(skinId);
      newlyUnlocked.push(skinId);
    }
  }

  return newlyUnlocked;
}
