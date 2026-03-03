import type { GameAchievement } from "@/lib/types";

export const ACHIEVEMENTS: GameAchievement[] = [
  {
    id: "first_hop",
    name: "First Steps",
    description: "Score your first point",
    emoji: "\u{1F43E}",
  },
  {
    id: "score_25",
    name: "Getting Somewhere",
    description: "Reach a score of 25",
    emoji: "\u{1F5FA}",
  },
  {
    id: "score_100",
    name: "Century Club",
    description: "Reach a score of 100",
    emoji: "\u{1F4AF}",
  },
  {
    id: "score_200",
    name: "Maximum Overdrive",
    description: "Reach a score of 200",
    emoji: "\u{1F680}",
  },
  {
    id: "log_rider",
    name: "Log Rider",
    description: "Ride a log across the river",
    emoji: "\u{1FAB5}",
  },
  {
    id: "level_3",
    name: "Halfway There",
    description: "Reach level 3",
    emoji: "\u2B50",
  },
  {
    id: "level_6",
    name: "Master Explorer",
    description: "Reach level 6",
    emoji: "\u{1F451}",
  },
  {
    id: "death_water",
    name: "Splashdown",
    description: "Fall into the water",
    emoji: "\u{1F30A}",
  },
  {
    id: "death_train",
    name: "Wrong Track",
    description: "Get hit by a train",
    emoji: "\u{1F682}",
  },
  {
    id: "death_all",
    name: "Equal Opportunity",
    description: "Die from all 5 causes",
    emoji: "\u{1F480}",
  },
  {
    id: "score_no_water",
    name: "Aquaphobe",
    description: "Score 50+ without touching water",
    emoji: "\u{1F3DC}",
  },
  {
    id: "comeback",
    name: "Never Give Up",
    description: "Beat your previous high score",
    emoji: "\u{1F525}",
  },
  {
    id: "first_coin",
    name: "Shiny!",
    description: "Collect your first coin",
    emoji: "\u{1FA99}",
  },
  {
    id: "diamond_hunter",
    name: "Diamond Hunter",
    description: "Collect a diamond coin",
    emoji: "\u{1F48E}",
  },
  {
    id: "coin_hoarder",
    name: "Coin Hoarder",
    description: "Collect 20+ coins in a single game",
    emoji: "\u{1F4B0}",
  },
];

export const ACHIEVEMENT_MAP = new Map(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

export const ALL_DEATH_CAUSES = [
  "vehicle",
  "train",
  "water",
  "idle_timeout",
  "off_screen",
] as const;

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;
