import { DECKS, filterChallenges, filterPrompts, TURN_PROMPTS } from "./story-decks";
import {
  CATEGORIES,
  DEFAULT_PREFS,
  EASTER_SEED,
  MAX_PLAYERS,
  MAX_REROLLS,
  MIN_PLAYERS,
  SEED_ALPHABET,
  SEED_PREFIX,
  type Category,
  type ChallengeCard,
  type Difficulty,
  type GameAction,
  type GameState,
  type Mode,
  type PromptCard,
  type StoryRoll,
} from "./story-types";

export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mapSeedChar(ch: string): string {
  const upper = ch.toUpperCase();
  if (SEED_ALPHABET.includes(upper)) return upper;
  if (upper === "0" || upper === "O") return "2";
  if (upper === "1" || upper === "I") return "3";
  if (upper >= "A" && upper <= "Z") return upper;
  const digit = Number(upper);
  if (Number.isFinite(digit)) return SEED_ALPHABET[digit % SEED_ALPHABET.length];
  return "7";
}

export function normalizeSeed(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = cleaned.startsWith(SEED_PREFIX) ? cleaned.slice(SEED_PREFIX.length) : cleaned;
  if (body === "42") return EASTER_SEED;
  const padded = `${body}7F3K`.slice(0, 4);
  const mapped = padded.split("").map(mapSeedChar).join("");
  return `${SEED_PREFIX}-${mapped}`;
}

export function generateSeed(random: () => number = Math.random): string {
  let body = "";
  for (let i = 0; i < 4; i += 1) {
    body += SEED_ALPHABET[Math.floor(random() * SEED_ALPHABET.length)];
  }
  return `${SEED_PREFIX}-${body}`;
}

export function createRng(seed: string, extra = ""): () => number {
  return mulberry32(hashString(`${normalizeSeed(seed)}:${extra}`));
}

function pickFrom<T>(rng: () => number, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty deck.");
  }
  return items[Math.floor(rng() * items.length)] as T;
}

export function pickPrompt(
  rng: () => number,
  pool: readonly PromptCard[],
  avoidId?: string,
): PromptCard {
  const available = avoidId ? pool.filter((card) => card.id !== avoidId) : [...pool];
  const source = available.length > 0 ? available : pool;
  const legendaries = source.filter((card) => card.legendary);
  if (legendaries.length > 0 && rng() < 0.08) {
    return pickFrom(rng, legendaries);
  }
  const regular = source.filter((card) => !card.legendary);
  return pickFrom(rng, regular.length > 0 ? regular : source);
}

function articleAware(left: string, right: string): string {
  const character = left.replace(/^the\s+/i, "");
  const object = right.replace(/^the\s+/i, "");
  return `The ${character} and the ${object}`;
}

export function generateTitle(seed: string, prompts: StoryRoll["prompts"]): string {
  const normalized = normalizeSeed(seed);
  if (normalized === EASTER_SEED) {
    return "Don't Panic and the Extra Towel";
  }
  const rng = mulberry32(hashString(`title:${normalized}`));
  const character = prompts.character.text;
  const object = prompts.object.text;
  const place = prompts.place.text.replace(/^the\s+/i, "");
  const n = rng();
  if (n < 0.34) return articleAware(character, object);
  if (n < 0.67) return `${character} at the ${place}`;
  return `The ${object} of ${place}`;
}

const EASTER_PROMPTS: Record<Category, string> = {
  character: "Hitchhiking robot with a towel",
  place: "The restaurant at the end of the neighborhood",
  object: "A towel with opinions",
  problem: "The story itself is getting impatient",
  twist: "Don't panic — bring a towel",
};

function easterRoll(mode: Mode, difficulty: Difficulty): StoryRoll {
  const prompts = {} as StoryRoll["prompts"];
  for (const category of CATEGORIES) {
    const pool = filterPrompts(DECKS[category], mode, difficulty);
    const match = pool.find((card) => card.text === EASTER_PROMPTS[category]);
    prompts[category] = match ?? pool[0];
  }
  return {
    seed: EASTER_SEED,
    mode,
    difficulty,
    prompts,
    title: "Don't Panic and the Extra Towel",
  };
}

export function rollStory(seed: string, mode: Mode, difficulty: Difficulty): StoryRoll {
  const normalized = normalizeSeed(seed);
  if (normalized === EASTER_SEED) {
    return easterRoll(mode, difficulty);
  }
  const rng = createRng(normalized, `${mode}:${difficulty}`);
  const prompts = {} as StoryRoll["prompts"];
  for (const category of CATEGORIES) {
    const pool = filterPrompts(DECKS[category], mode, difficulty);
    prompts[category] = pickPrompt(rng, pool);
  }
  return {
    seed: normalized,
    mode,
    difficulty,
    prompts,
    title: generateTitle(normalized, prompts),
  };
}

export function rerollCategory(roll: StoryRoll, category: Category): StoryRoll {
  const rng = createRng(roll.seed, `reroll:${category}:${roll.mode}:${roll.difficulty}`);
  const pool = filterPrompts(DECKS[category], roll.mode, roll.difficulty);
  const next = pickPrompt(rng, pool, roll.prompts[category].id);
  const prompts = { ...roll.prompts, [category]: next };
  return {
    ...roll,
    prompts,
    title: generateTitle(roll.seed, prompts),
  };
}

export function pickChallenge(
  seed: string,
  mode: Mode,
  difficulty: Difficulty,
  turnIndex: number,
): ChallengeCard | null {
  const rng = createRng(seed, `challenge:${turnIndex}:${mode}:${difficulty}`);
  if (rng() > 0.72) return null;
  const pool = filterChallenges(mode, difficulty);
  if (pool.length === 0) return null;
  return pickFrom(rng, pool);
}

export function turnPromptFor(totalTurns: number): string {
  return TURN_PROMPTS[totalTurns % TURN_PROMPTS.length];
}

export function playerLabel(names: string[], index: number): string {
  const raw = names[index]?.trim();
  return raw && raw.length > 0 ? raw : `Player ${index + 1}`;
}

export function activePlayerNames(names: string[], count: number): string[] {
  return Array.from({ length: count }, (_, index) => playerLabel(names, index));
}

export function everyoneHasGone(turnsTaken: number[], playerCount: number): boolean {
  return turnsTaken.slice(0, playerCount).every((turns) => turns >= 1);
}

export function clampPlayerCount(count: number): number {
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.round(count)));
}

export function createInitialState(): GameState {
  return {
    phase: "landing",
    mode: DEFAULT_PREFS.preferredMode,
    difficulty: DEFAULT_PREFS.preferredDifficulty,
    timerPreset: DEFAULT_PREFS.preferredTimer,
    muted: DEFAULT_PREFS.muted,
    playerCount: DEFAULT_PREFS.playerCount,
    playerNames: [...DEFAULT_PREFS.playerNames],
    currentPlayerIndex: 0,
    turnsTaken: [0, 0, 0, 0, 0],
    totalTurns: 0,
    roll: null,
    tableStatus: "idle",
    rerollsRemaining: MAX_REROLLS,
    rerolledCategory: null,
    challenge: null,
    timerRemaining: null,
    timerExpired: false,
    storiesCompleted: 0,
    lastFinished: null,
    seedDraft: "",
  };
}

function resetTable(state: GameState): Pick<
  GameState,
  | "currentPlayerIndex"
  | "turnsTaken"
  | "totalTurns"
  | "tableStatus"
  | "rerollsRemaining"
  | "rerolledCategory"
  | "challenge"
  | "timerRemaining"
  | "timerExpired"
> {
  return {
    currentPlayerIndex: 0,
    turnsTaken: [0, 0, 0, 0, 0],
    totalTurns: 0,
    tableStatus: "idle",
    rerollsRemaining: MAX_REROLLS,
    rerolledCategory: null,
    challenge: null,
    timerRemaining: state.timerPreset > 0 ? state.timerPreset : null,
    timerExpired: false,
  };
}

function applyRoll(state: GameState, seed: string): GameState {
  const roll = rollStory(seed, state.mode, state.difficulty);
  return {
    ...state,
    ...resetTable(state),
    phase: "table",
    roll,
    tableStatus: "ready",
    seedDraft: roll.seed,
  };
}

export function reduceGame(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        mode: action.prefs.preferredMode,
        difficulty: action.prefs.preferredDifficulty,
        timerPreset: action.prefs.preferredTimer,
        muted: action.prefs.muted,
        playerCount: clampPlayerCount(action.prefs.playerCount),
        playerNames: [
          ...action.prefs.playerNames,
          "",
          "",
          "",
          "",
          "",
        ].slice(0, MAX_PLAYERS),
        storiesCompleted: action.prefs.storiesCompleted,
      };
    case "open-howto":
      return { ...state, phase: "howto" };
    case "open-setup":
      return { ...state, phase: "setup" };
    case "open-vault":
      return { ...state, phase: "vault" };
    case "back-to-landing":
      return { ...state, phase: "landing" };
    case "set-mode":
      return { ...state, mode: action.mode };
    case "set-difficulty":
      return { ...state, difficulty: action.difficulty };
    case "set-timer":
      return {
        ...state,
        timerPreset: action.seconds,
        timerRemaining: action.seconds > 0 ? action.seconds : null,
        timerExpired: false,
      };
    case "set-player-count":
      return { ...state, playerCount: clampPlayerCount(action.count) };
    case "set-player-name": {
      if (action.index < 0 || action.index >= MAX_PLAYERS) return state;
      const playerNames = [...state.playerNames];
      playerNames[action.index] = action.name.slice(0, 24);
      return { ...state, playerNames };
    }
    case "set-seed-draft":
      return { ...state, seedDraft: action.seed.toUpperCase() };
    case "begin-table":
      return { ...state, phase: "table", ...resetTable(state), roll: null };
    case "roll":
      return applyRoll(state, action.seed);
    case "start-turn": {
      if (!state.roll || state.tableStatus === "idle") return state;
      return {
        ...state,
        tableStatus: "turn",
        challenge: pickChallenge(
          state.roll.seed,
          state.mode,
          state.difficulty,
          state.totalTurns,
        ),
        timerRemaining: state.timerPreset > 0 ? state.timerPreset : null,
        timerExpired: false,
      };
    }
    case "next-player": {
      if (!state.roll || state.tableStatus !== "turn") return state;
      const turnsTaken = [...state.turnsTaken];
      turnsTaken[state.currentPlayerIndex] += 1;
      const nextIndex = (state.currentPlayerIndex + 1) % state.playerCount;
      const totalTurns = state.totalTurns + 1;
      return {
        ...state,
        turnsTaken,
        totalTurns,
        currentPlayerIndex: nextIndex,
        tableStatus: "ready",
        challenge: null,
        timerRemaining: state.timerPreset > 0 ? state.timerPreset : null,
        timerExpired: false,
      };
    }
    case "reroll": {
      if (!state.roll || state.rerollsRemaining <= 0) return state;
      if (state.tableStatus === "idle") return state;
      const roll = rerollCategory(state.roll, action.category);
      return {
        ...state,
        roll,
        rerollsRemaining: state.rerollsRemaining - 1,
        rerolledCategory: action.category,
      };
    }
    case "new-story":
      return {
        ...state,
        phase: "table",
        roll: null,
        lastFinished: null,
        seedDraft: "",
        ...resetTable(state),
      };
    case "finish": {
      if (!state.roll || !everyoneHasGone(state.turnsTaken, state.playerCount)) {
        return state;
      }
      return {
        ...state,
        phase: "celebration",
        tableStatus: "ready",
        challenge: null,
        storiesCompleted: state.storiesCompleted + 1,
        lastFinished: {
          seed: state.roll.seed,
          title: state.roll.title,
          mode: state.mode,
          difficulty: state.difficulty,
          prompts: {
            character: state.roll.prompts.character.text,
            place: state.roll.prompts.place.text,
            object: state.roll.prompts.object.text,
            problem: state.roll.prompts.problem.text,
            twist: state.roll.prompts.twist.text,
          },
          playerOrder: activePlayerNames(state.playerNames, state.playerCount),
          totalTurns: state.totalTurns,
        },
      };
    }
    case "play-again":
      return {
        ...state,
        phase: "setup",
        roll: null,
        lastFinished: null,
        seedDraft: "",
        ...resetTable(state),
      };
    case "replay-seed":
      return applyRoll(
        {
          ...state,
          mode: action.mode,
          difficulty: action.difficulty,
        },
        action.seed,
      );
    case "tick": {
      if (state.timerRemaining === null || state.tableStatus !== "turn") return state;
      if (state.timerRemaining <= 0) {
        return { ...state, timerRemaining: 0, timerExpired: true };
      }
      const next = state.timerRemaining - 1;
      return {
        ...state,
        timerRemaining: next,
        timerExpired: next <= 0,
      };
    }
    case "toggle-mute":
      return { ...state, muted: !state.muted };
    case "mark-favorited":
      return state;
    default:
      return state;
  }
}

export function isLegendaryRoll(roll: StoryRoll): boolean {
  return CATEGORIES.filter((category) => roll.prompts[category].legendary).length >= 2;
}

export function deckHealth(mode: Mode, difficulty: Difficulty): Record<Category, number> {
  const counts = {} as Record<Category, number>;
  for (const category of CATEGORIES) {
    counts[category] = filterPrompts(DECKS[category], mode, difficulty).length;
  }
  return counts;
}
