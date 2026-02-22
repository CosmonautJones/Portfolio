import type { Achievement } from "@/lib/types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Visit the site for the first time",
    icon: "Footprints",
    secret: false,
    xpReward: 10,
    condition: { type: "event", eventType: "first_visit" },
  },
  {
    id: "road_scholar",
    name: "Road Scholar",
    description: "View all project pages",
    icon: "GraduationCap",
    secret: false,
    xpReward: 25,
    condition: { type: "event_count", eventType: "view_project", count: 3 },
  },
  {
    id: "mixologist",
    name: "Mixologist",
    description: "Make all 6 cocktails",
    icon: "Wine",
    secret: false,
    xpReward: 30,
    condition: { type: "event_count", eventType: "make_cocktail", count: 6 },
  },
  {
    id: "pixel_perfect",
    name: "Pixel Perfect",
    description: "Fill an entire 32x32 canvas",
    icon: "Grid3x3",
    secret: false,
    xpReward: 30,
    condition: { type: "event", eventType: "fill_canvas" },
  },
  {
    id: "hop_skip",
    name: "Hop Skip",
    description: "Score 50+ in ClaudeBot's Adventure",
    icon: "Gamepad2",
    secret: false,
    xpReward: 25,
    condition: { type: "score", gameType: "adventure", threshold: 50 },
  },
  {
    id: "road_warrior",
    name: "Road Warrior",
    description: "Score 200+ in ClaudeBot's Adventure",
    icon: "Trophy",
    secret: false,
    xpReward: 75,
    condition: { type: "score", gameType: "adventure", threshold: 200 },
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Switch to dark mode",
    icon: "Moon",
    secret: false,
    xpReward: 5,
    condition: { type: "event", eventType: "toggle_theme" },
  },
  {
    id: "konami",
    name: "Up Up Down Down",
    description: "Enter the Konami Code",
    icon: "Joystick",
    secret: true,
    xpReward: 50,
    condition: { type: "manual" },
  },
  {
    id: "red_pill",
    name: "Red Pill",
    description: "Find the hidden terminal",
    icon: "Terminal",
    secret: true,
    xpReward: 50,
    condition: { type: "manual" },
  },
  {
    id: "halliday_egg",
    name: "The Egg",
    description: "Discover the vault",
    icon: "Egg",
    secret: true,
    xpReward: 100,
    condition: { type: "manual" },
  },
  {
    id: "cartographer",
    name: "Cartographer",
    description: "Find all easter eggs",
    icon: "Map",
    secret: true,
    xpReward: 150,
    condition: { type: "event_count", eventType: "find_easter_egg", count: 5 },
  },
  {
    id: "streak_3",
    name: "Three-Peat",
    description: "Visit 3 days in a row",
    icon: "Flame",
    secret: false,
    xpReward: 30,
    condition: { type: "streak", days: 3 },
  },
  {
    id: "streak_7",
    name: "Committed",
    description: "Visit 7 days in a row",
    icon: "Zap",
    secret: false,
    xpReward: 75,
    condition: { type: "streak", days: 7 },
  },
];

/** Look up an achievement definition by ID */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** Get all non-secret achievements */
export function getPublicAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !a.secret);
}

/** Get count of total achievements */
export function getTotalAchievementCount(): number {
  return ACHIEVEMENTS.length;
}
