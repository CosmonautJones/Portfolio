export const CATEGORIES = [
  "character",
  "place",
  "object",
  "problem",
  "twist",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MODES = ["family", "silly", "fantasy", "cozy-spooky"] as const;
export type Mode = (typeof MODES)[number];

export const DIFFICULTIES = ["everyone", "kid-friendly"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const TIMER_PRESETS = [0, 60, 90] as const;
export type TimerPreset = (typeof TIMER_PRESETS)[number];

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;
export const MAX_REROLLS = 1;

export const SEED_PREFIX = "COSMO";
export const SEED_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const EASTER_SEED = "COSMO-42";

export const CATEGORY_LABELS: Record<Category, string> = {
  character: "Character",
  place: "Place",
  object: "Object",
  problem: "Problem",
  twist: "Wild Twist",
};

export const MODE_LABELS: Record<Mode, string> = {
  family: "Family",
  silly: "Silly",
  fantasy: "Fantasy",
  "cozy-spooky": "Cozy Spooky",
};

export const MODE_BLURBS: Record<Mode, string> = {
  family: "Warm, weird, and ready for the whole couch.",
  silly: "Ridiculous on purpose. Serious faces not allowed.",
  fantasy: "Dragons, quests, and slightly heroic snacks.",
  "cozy-spooky": "Friendly ghosts, sneezing castles, talking shadows.",
};

export interface PromptCard {
  id: string;
  text: string;
  modes: readonly Mode[];
  kidFriendly: boolean;
  legendary?: boolean;
}

export interface StoryRoll {
  seed: string;
  mode: Mode;
  difficulty: Difficulty;
  prompts: Record<Category, PromptCard>;
  title: string;
}

export interface ChallengeCard {
  id: string;
  text: string;
  modes: readonly Mode[];
  kidFriendly: boolean;
}

export interface FavoriteRoll {
  seed: string;
  mode: Mode;
  difficulty: Difficulty;
  title: string;
  prompts: Record<Category, string>;
  savedAt: number;
}

export interface StoryPrefs {
  version: 1;
  favorites: FavoriteRoll[];
  preferredMode: Mode;
  preferredDifficulty: Difficulty;
  preferredTimer: TimerPreset;
  playerNames: string[];
  playerCount: number;
  storiesCompleted: number;
  muted: boolean;
}

export type GamePhase =
  | "landing"
  | "howto"
  | "setup"
  | "table"
  | "celebration"
  | "vault";

export type TableStatus = "idle" | "ready" | "turn";

export interface GameState {
  phase: GamePhase;
  mode: Mode;
  difficulty: Difficulty;
  timerPreset: TimerPreset;
  muted: boolean;
  playerCount: number;
  playerNames: string[];
  currentPlayerIndex: number;
  turnsTaken: number[];
  totalTurns: number;
  roll: StoryRoll | null;
  tableStatus: TableStatus;
  rerollsRemaining: number;
  rerolledCategory: Category | null;
  challenge: ChallengeCard | null;
  timerRemaining: number | null;
  timerExpired: boolean;
  storiesCompleted: number;
  lastFinished: FinishedStory | null;
  seedDraft: string;
}

export interface FinishedStory {
  seed: string;
  title: string;
  mode: Mode;
  difficulty: Difficulty;
  prompts: Record<Category, string>;
  playerOrder: string[];
  totalTurns: number;
}

export type GameAction =
  | { type: "hydrate"; prefs: StoryPrefs }
  | { type: "open-howto" }
  | { type: "open-setup" }
  | { type: "open-vault" }
  | { type: "back-to-landing" }
  | { type: "set-mode"; mode: Mode }
  | { type: "set-difficulty"; difficulty: Difficulty }
  | { type: "set-timer"; seconds: TimerPreset }
  | { type: "set-player-count"; count: number }
  | { type: "set-player-name"; index: number; name: string }
  | { type: "set-seed-draft"; seed: string }
  | { type: "begin-table" }
  | { type: "roll"; seed: string }
  | { type: "start-turn" }
  | { type: "next-player" }
  | { type: "reroll"; category: Category }
  | { type: "new-story" }
  | { type: "finish" }
  | { type: "play-again" }
  | { type: "replay-seed"; seed: string; mode: Mode; difficulty: Difficulty }
  | { type: "tick" }
  | { type: "toggle-mute" }
  | { type: "mark-favorited" };

export const STORAGE_KEY = "cosmonaut-story-forge:v1";

export const DEFAULT_PREFS: StoryPrefs = {
  version: 1,
  favorites: [],
  preferredMode: "family",
  preferredDifficulty: "everyone",
  preferredTimer: 0,
  playerNames: ["", "", "", "", ""],
  playerCount: 2,
  storiesCompleted: 0,
  muted: true,
};
