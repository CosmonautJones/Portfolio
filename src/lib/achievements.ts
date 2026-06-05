import type { Achievement } from "@/lib/types";

// ---------------------------------------------------------------------------
// Site Achievements (exploration, interaction, secrets)
// ---------------------------------------------------------------------------

export const SITE_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Visit the site for the first time",
    icon: "Footprints",
    secret: false,
    xpReward: 10,
    condition: { type: "event", eventType: "first_visit" },
    context: "site",
  },
  {
    id: "road_scholar",
    name: "Road Scholar",
    description: "View all project pages",
    icon: "GraduationCap",
    secret: false,
    xpReward: 25,
    condition: { type: "event_count", eventType: "view_project", count: 3 },
    context: "site",
  },
  {
    id: "mixologist",
    name: "Mixologist",
    description: "Make all 6 cocktails",
    icon: "Wine",
    secret: false,
    xpReward: 30,
    condition: { type: "event_count", eventType: "make_cocktail", count: 6 },
    context: "site",
  },
  {
    id: "pixel_perfect",
    name: "Pixel Perfect",
    description: "Fill an entire 32x32 canvas",
    icon: "Grid3x3",
    secret: false,
    xpReward: 30,
    condition: { type: "event", eventType: "fill_canvas" },
    context: "site",
  },
  {
    id: "hop_skip",
    name: "Hop Skip",
    description: "Score 50+ in ClaudeBot's Adventure",
    icon: "Gamepad2",
    secret: false,
    xpReward: 25,
    condition: { type: "score", gameType: "adventure", threshold: 50 },
    context: "both",
  },
  {
    id: "road_warrior",
    name: "Road Warrior",
    description: "Score 200+ in ClaudeBot's Adventure",
    icon: "Trophy",
    secret: false,
    xpReward: 75,
    condition: { type: "score", gameType: "adventure", threshold: 200 },
    context: "both",
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Switch to dark mode",
    icon: "Moon",
    secret: false,
    xpReward: 5,
    condition: { type: "event", eventType: "toggle_theme" },
    context: "site",
  },
  {
    id: "konami",
    name: "Up Up Down Down",
    description: "Enter the Konami Code",
    icon: "Joystick",
    secret: true,
    xpReward: 50,
    condition: { type: "manual" },
    context: "site",
  },
  {
    id: "red_pill",
    name: "Red Pill",
    description: "Find the hidden terminal",
    icon: "Terminal",
    secret: true,
    xpReward: 50,
    condition: { type: "manual" },
    context: "site",
  },
  {
    id: "halliday_egg",
    name: "The Egg",
    description: "Discover the vault",
    icon: "Egg",
    secret: true,
    xpReward: 100,
    condition: { type: "manual" },
    context: "site",
  },
  {
    id: "cartographer",
    name: "Cartographer",
    description: "Find all easter eggs",
    icon: "Map",
    secret: true,
    xpReward: 150,
    condition: { type: "event_count", eventType: "find_easter_egg", count: 6 },
    context: "site",
  },
  {
    id: "streak_3",
    name: "Three-Peat",
    description: "Visit 3 days in a row",
    icon: "Flame",
    secret: false,
    xpReward: 30,
    condition: { type: "streak", days: 3 },
    context: "site",
  },
  {
    id: "streak_7",
    name: "Committed",
    description: "Visit 7 days in a row",
    icon: "Zap",
    secret: false,
    xpReward: 75,
    condition: { type: "streak", days: 7 },
    context: "site",
  },
];

// ---------------------------------------------------------------------------
// Game Achievements (ClaudeBot's Adventure)
// ---------------------------------------------------------------------------

export const GAME_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_hop",
    name: "First Steps",
    description: "Score your first point",
    icon: "Footprints",
    secret: false,
    xpReward: 5,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "score_25",
    name: "Getting Somewhere",
    description: "Reach a score of 25",
    icon: "MapPin",
    secret: false,
    xpReward: 10,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "score_100",
    name: "Century Club",
    description: "Reach a score of 100",
    icon: "Medal",
    secret: false,
    xpReward: 30,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "score_200",
    name: "Maximum Overdrive",
    description: "Reach a score of 200",
    icon: "Rocket",
    secret: false,
    xpReward: 50,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "log_rider",
    name: "Log Rider",
    description: "Ride a log across the river",
    icon: "TreePine",
    secret: false,
    xpReward: 10,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "level_3",
    name: "Halfway There",
    description: "Reach level 3",
    icon: "Star",
    secret: false,
    xpReward: 15,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "level_6",
    name: "Master Explorer",
    description: "Reach level 6",
    icon: "Crown",
    secret: false,
    xpReward: 40,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "death_water",
    name: "Splashdown",
    description: "Fall into the water",
    icon: "Waves",
    secret: false,
    xpReward: 5,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "death_train",
    name: "Wrong Track",
    description: "Get hit by a train",
    icon: "TrainFront",
    secret: false,
    xpReward: 5,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "death_all",
    name: "Equal Opportunity",
    description: "Die from all 5 causes",
    icon: "Skull",
    secret: false,
    xpReward: 25,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "score_no_water",
    name: "Aquaphobe",
    description: "Score 50+ without touching water",
    icon: "Ban",
    secret: false,
    xpReward: 20,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "comeback",
    name: "Never Give Up",
    description: "Beat your previous high score",
    icon: "Flame",
    secret: false,
    xpReward: 15,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "first_coin",
    name: "Shiny!",
    description: "Collect your first coin",
    icon: "CircleDot",
    secret: false,
    xpReward: 5,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "diamond_hunter",
    name: "Diamond Hunter",
    description: "Collect a diamond coin",
    icon: "Gem",
    secret: false,
    xpReward: 15,
    condition: { type: "manual" },
    context: "game",
  },
  {
    id: "coin_hoarder",
    name: "Coin Hoarder",
    description: "Collect 20+ coins in a single game",
    icon: "Coins",
    secret: false,
    xpReward: 25,
    condition: { type: "manual" },
    context: "game",
  },
];

// ---------------------------------------------------------------------------
// Combined registry
// ---------------------------------------------------------------------------

/** All achievements from both site and game systems */
export const ACHIEVEMENTS: Achievement[] = [
  ...SITE_ACHIEVEMENTS,
  ...GAME_ACHIEVEMENTS,
];

/** Fast lookup map by achievement ID */
const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

/** Look up an achievement definition by ID */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENT_MAP.get(id);
}

/** Get all non-secret achievements */
export function getPublicAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !a.secret);
}

/** Get count of total achievements */
export function getTotalAchievementCount(): number {
  return ACHIEVEMENTS.length;
}

/** Get achievements filtered by context */
export function getAchievementsByContext(context: "site" | "game" | "both"): Achievement[] {
  return ACHIEVEMENTS.filter((a) => {
    const ctx = a.context ?? "site";
    return ctx === context || ctx === "both";
  });
}

/** Get site achievements (includes "both") */
export function getSiteAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => {
    const ctx = a.context ?? "site";
    return ctx === "site" || ctx === "both";
  });
}

/** Get game achievements (includes "both") */
export function getGameAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => {
    const ctx = a.context ?? "site";
    return ctx === "game" || ctx === "both";
  });
}
