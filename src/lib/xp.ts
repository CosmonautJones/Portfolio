// XP award table — amounts and deduplication rules for each action
export const XP_AWARDS = {
  first_visit:       { xp: 10,  rule: "once_ever" },
  view_project:      { xp: 5,   rule: "per_session" },
  play_game:         { xp: 10,  rule: "per_session" },
  score_50:          { xp: 25,  rule: "once_ever" },
  score_100:         { xp: 50,  rule: "once_ever" },
  score_200:         { xp: 100, rule: "once_ever" },
  use_demo:          { xp: 15,  rule: "per_session" },
  export_pixel_art:  { xp: 10,  rule: "per_day" },
  find_easter_egg:   { xp: 50,  rule: "once_ever" },
  streak_3:          { xp: 30,  rule: "once_ever" },
  streak_7:          { xp: 75,  rule: "once_ever" },
  toggle_theme:      { xp: 5,   rule: "once_ever" },
  open_terminal:     { xp: 10,  rule: "once_ever" },
  open_hidden_terminal: { xp: 25, rule: "once_ever" },
} as const;

export type XPAction = keyof typeof XP_AWARDS;

// Level thresholds — XP required to reach each level
export const LEVELS: { level: number; xp: number; title: string }[] = [
  { level: 1,  xp: 0,    title: "Visitor" },
  { level: 2,  xp: 50,   title: "Explorer" },
  { level: 3,  xp: 150,  title: "Adventurer" },
  { level: 4,  xp: 350,  title: "Discoverer" },
  { level: 5,  xp: 600,  title: "Code Archaeologist" },
  { level: 6,  xp: 1000, title: "Keeper of Secrets" },
  { level: 7,  xp: 1500, title: "Pixel Veteran" },
  { level: 8,  xp: 2500, title: "Gunter" },
  { level: 9,  xp: 4000, title: "CosmonautJones" },
  { level: 10, xp: 6000, title: "High Five" },
];

/** Get the level info for a given XP total */
export function getLevelForXP(xp: number) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp) current = lvl;
    else break;
  }
  return current;
}

/** Get XP needed to reach the next level, or null if at max */
export function getNextLevelXP(xp: number): number | null {
  const current = getLevelForXP(xp);
  const next = LEVELS.find((l) => l.level === current.level + 1);
  return next ? next.xp : null;
}

/** Calculate progress percentage toward the next level (0-100) */
export function getLevelProgress(xp: number): number {
  const current = getLevelForXP(xp);
  const nextXP = getNextLevelXP(xp);
  if (nextXP === null) return 100;
  const range = nextXP - current.xp;
  const progress = xp - current.xp;
  return Math.round((progress / range) * 100);
}
