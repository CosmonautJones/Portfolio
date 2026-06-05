import type {
  Challenge,
  ChallengeType,
  ChallengeParams,
  ChallengeProgress,
  ChallengePeriod,
  DeathCause,
} from "./types";

// --- Deterministic Seeding ---

/** Simple hash function for deterministic challenge generation */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

/** Seeded pseudo-random number generator (Mulberry32) */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Get UTC date string for today (YYYY-MM-DD) */
export function getUTCDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/** Get the Monday of the current week in UTC */
export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  return d.toISOString().split("T")[0];
}

// --- Challenge Templates ---

interface ChallengeTemplate {
  type: ChallengeType;
  difficulty: "easy" | "medium" | "hard";
  makeParams: (rng: () => number) => ChallengeParams;
  makeDescription: (params: ChallengeParams) => string;
}

const DAILY_TEMPLATES: ChallengeTemplate[] = [
  // Score targets (easy-medium)
  {
    type: "score_target",
    difficulty: "easy",
    makeParams: (rng) => ({ targetScore: 25 + Math.floor(rng() * 25) }),
    makeDescription: (p) => `Reach a score of ${p.targetScore}`,
  },
  {
    type: "score_target",
    difficulty: "medium",
    makeParams: (rng) => ({ targetScore: 50 + Math.floor(rng() * 50) }),
    makeDescription: (p) => `Reach a score of ${p.targetScore}`,
  },
  // Collection
  {
    type: "collection",
    difficulty: "easy",
    makeParams: (rng) => ({ targetCoins: 5 + Math.floor(rng() * 10) }),
    makeDescription: (p) => `Collect ${p.targetCoins} coins in one run`,
  },
  {
    type: "collection",
    difficulty: "medium",
    makeParams: () => ({ targetCoins: 3, coinType: "diamond" }),
    makeDescription: (p) => `Collect ${p.targetCoins} diamonds in one run`,
  },
  // Survival
  {
    type: "survival",
    difficulty: "easy",
    makeParams: (rng) => ({ targetSeconds: 30 + Math.floor(rng() * 30) }),
    makeDescription: (p) => `Survive for ${p.targetSeconds} seconds`,
  },
  {
    type: "survival",
    difficulty: "medium",
    makeParams: () => ({ targetLevel: 3 }),
    makeDescription: (p) => `Reach level ${p.targetLevel}`,
  },
  // Restriction
  {
    type: "restriction",
    difficulty: "medium",
    makeParams: (rng) => ({
      restriction: "no_water_death" as const,
      restrictedScore: 30 + Math.floor(rng() * 20),
    }),
    makeDescription: (p) =>
      `Score ${p.restrictedScore} without drowning`,
  },
];

const WEEKLY_TEMPLATES: ChallengeTemplate[] = [
  {
    type: "score_target",
    difficulty: "hard",
    makeParams: (rng) => ({ targetScore: 100 + Math.floor(rng() * 100) }),
    makeDescription: (p) => `Reach a score of ${p.targetScore}`,
  },
  {
    type: "collection",
    difficulty: "hard",
    makeParams: (rng) => ({ targetCoins: 20 + Math.floor(rng() * 15) }),
    makeDescription: (p) => `Collect ${p.targetCoins} coins in one run`,
  },
  {
    type: "survival",
    difficulty: "hard",
    makeParams: () => ({ targetLevel: 5 }),
    makeDescription: () => "Reach level 5 in a single run",
  },
  {
    type: "restriction",
    difficulty: "hard",
    makeParams: (rng) => ({
      restriction: "no_coins" as const,
      restrictedScore: 60 + Math.floor(rng() * 40),
    }),
    makeDescription: (p) =>
      `Score ${p.restrictedScore} without collecting any coins`,
  },
];

// --- Challenge Generation ---

function generateChallenge(
  template: ChallengeTemplate,
  rng: () => number,
  period: ChallengePeriod,
  index: number,
  dateStr: string,
): Challenge {
  const params = template.makeParams(rng);
  const description = template.makeDescription(params);

  const xpReward = period === "daily" ? 15 : 50;

  return {
    id: `${period}_${dateStr}_${index}`,
    type: template.type,
    params,
    description,
    xpReward,
    period,
  };
}

/** Get today's 3 daily challenges. Deterministic based on date. */
export function getDailyChallenges(date: Date = new Date()): Challenge[] {
  const dateStr = getUTCDateString(date);
  const seed = hashString(`daily_${dateStr}`);
  const rng = seededRandom(seed);

  const challenges: Challenge[] = [];
  const usedTypes = new Set<ChallengeType>();

  for (let i = 0; i < 3; i++) {
    // Pick a template that hasn't been used yet (by type)
    const available = DAILY_TEMPLATES.filter(
      (t) => !usedTypes.has(t.type),
    );
    const pool = available.length > 0 ? available : DAILY_TEMPLATES;
    const templateIndex = Math.floor(rng() * pool.length);
    const template = pool[templateIndex];

    const challenge = generateChallenge(template, rng, "daily", i, dateStr);
    challenges.push(challenge);
    usedTypes.add(template.type);
  }

  return challenges;
}

/** Get this week's challenge. Deterministic based on week start date. */
export function getWeeklyChallenges(date: Date = new Date()): Challenge[] {
  const weekStart = getWeekStartDate(date);
  const seed = hashString(`weekly_${weekStart}`);
  const rng = seededRandom(seed);

  const templateIndex = Math.floor(rng() * WEEKLY_TEMPLATES.length);
  const template = WEEKLY_TEMPLATES[templateIndex];

  return [generateChallenge(template, rng, "weekly", 0, weekStart)];
}

// --- Challenge Progress Tracking ---

export class ChallengeTracker {
  private progresses: Map<string, ChallengeProgress> = new Map();
  private challenges: Challenge[];
  private startTime: number;
  private waterDeaths = 0;
  private coinsCollectedThisRun = 0;

  constructor(challenges: Challenge[]) {
    this.challenges = challenges;
    this.startTime = Date.now();

    for (const challenge of challenges) {
      this.progresses.set(challenge.id, {
        challengeId: challenge.id,
        current: 0,
        target: this.getTarget(challenge),
        completed: false,
      });
    }
  }

  private getTarget(challenge: Challenge): number {
    switch (challenge.type) {
      case "score_target":
        return challenge.params.targetScore ?? 0;
      case "collection":
        return challenge.params.targetCoins ?? 0;
      case "survival":
        return challenge.params.targetSeconds ?? challenge.params.targetLevel ?? 0;
      case "restriction":
        return challenge.params.restrictedScore ?? 0;
      default:
        return 0;
    }
  }

  /** Update challenge progress when score changes */
  onScoreChange(score: number): string[] {
    const newlyCompleted: string[] = [];

    for (const challenge of this.challenges) {
      const progress = this.progresses.get(challenge.id);
      if (!progress || progress.completed) continue;

      if (challenge.type === "score_target") {
        progress.current = score;
        if (score >= (challenge.params.targetScore ?? 0)) {
          progress.completed = true;
          newlyCompleted.push(challenge.id);
        }
      }

      if (challenge.type === "restriction") {
        if (!progress.violated) {
          progress.current = score;
          if (score >= (challenge.params.restrictedScore ?? 0)) {
            progress.completed = true;
            newlyCompleted.push(challenge.id);
          }
        }
      }
    }

    return newlyCompleted;
  }

  /** Update when a coin is collected */
  onCoinCollect(coinType: string): string[] {
    this.coinsCollectedThisRun++;
    const newlyCompleted: string[] = [];

    for (const challenge of this.challenges) {
      const progress = this.progresses.get(challenge.id);
      if (!progress || progress.completed) continue;

      if (challenge.type === "collection") {
        // Check if specific coin type is required
        if (challenge.params.coinType && challenge.params.coinType !== coinType) {
          continue;
        }
        progress.current++;
        if (progress.current >= (challenge.params.targetCoins ?? 0)) {
          progress.completed = true;
          newlyCompleted.push(challenge.id);
        }
      }

      // Check restriction violation: "no_coins"
      if (
        challenge.type === "restriction" &&
        challenge.params.restriction === "no_coins"
      ) {
        progress.violated = true;
        progress.current = 0;
      }
    }

    return newlyCompleted;
  }

  /** Update when player levels up */
  onLevelUp(level: number): string[] {
    const newlyCompleted: string[] = [];

    for (const challenge of this.challenges) {
      const progress = this.progresses.get(challenge.id);
      if (!progress || progress.completed) continue;

      if (
        challenge.type === "survival" &&
        challenge.params.targetLevel !== undefined
      ) {
        progress.current = level;
        if (level >= challenge.params.targetLevel) {
          progress.completed = true;
          newlyCompleted.push(challenge.id);
        }
      }
    }

    return newlyCompleted;
  }

  /** Update survival time tracking (call periodically) */
  onTick(): string[] {
    const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const newlyCompleted: string[] = [];

    for (const challenge of this.challenges) {
      const progress = this.progresses.get(challenge.id);
      if (!progress || progress.completed) continue;

      if (
        challenge.type === "survival" &&
        challenge.params.targetSeconds !== undefined
      ) {
        progress.current = elapsedSeconds;
        if (elapsedSeconds >= challenge.params.targetSeconds) {
          progress.completed = true;
          newlyCompleted.push(challenge.id);
        }
      }
    }

    return newlyCompleted;
  }

  /** Update on death — check restriction violations */
  onDeath(cause: DeathCause): void {
    if (cause === "water") {
      this.waterDeaths++;
    }

    for (const challenge of this.challenges) {
      const progress = this.progresses.get(challenge.id);
      if (!progress || progress.completed) continue;

      if (
        challenge.type === "restriction" &&
        challenge.params.restriction === "no_water_death" &&
        cause === "water"
      ) {
        progress.violated = true;
        progress.current = 0;
      }
    }
  }

  /** Reset for a new run (keeps challenge definitions, resets progress) */
  resetForNewRun(): void {
    this.startTime = Date.now();
    this.waterDeaths = 0;
    this.coinsCollectedThisRun = 0;

    for (const challenge of this.challenges) {
      const existing = this.progresses.get(challenge.id);
      if (existing && !existing.completed) {
        existing.current = 0;
        existing.violated = false;
      }
    }
  }

  /** Get all current progress */
  getAllProgress(): ChallengeProgress[] {
    return Array.from(this.progresses.values());
  }

  /** Get the active challenge definitions this tracker is tracking */
  getChallenges(): Challenge[] {
    return this.challenges;
  }

  /** Get completed challenge IDs from this session */
  getCompletedIds(): string[] {
    return Array.from(this.progresses.values())
      .filter((p) => p.completed)
      .map((p) => p.challengeId);
  }
}

// --- localStorage for Challenge Completions ---

const COMPLETIONS_KEY = "adventure_challenge_completions";

export interface StoredCompletion {
  challengeId: string;
  completedAt: string;
  runScore: number;
}

export function loadCompletions(): StoredCompletion[] {
  try {
    const json = localStorage.getItem(COMPLETIONS_KEY);
    if (!json) return [];
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredCompletion[];
  } catch {
    return [];
  }
}

export function saveCompletion(completion: StoredCompletion): void {
  try {
    const existing = loadCompletions();
    // Don't duplicate
    if (existing.some((c) => c.challengeId === completion.challengeId)) return;
    existing.push(completion);
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(existing));
  } catch {
    // localStorage unavailable
  }
}

/** Check if a challenge has already been completed */
export function isChallengeCompleted(challengeId: string): boolean {
  return loadCompletions().some((c) => c.challengeId === challengeId);
}

// --- Reward Collection (death-time) ---

export interface ChallengeReward {
  /** The completed challenge */
  challenge: Challenge;
  /** XP to award for this completion */
  xpReward: number;
  /** Daily or weekly — selects the XP award key */
  period: ChallengePeriod;
}

/**
 * Given the active challenges and this run's progress, return the rewards that
 * should be granted on death. A challenge qualifies iff its progress is marked
 * `completed`, was NOT `violated`, and has not already been persisted as
 * completed (localStorage dedup, keyed by challenge id which embeds the
 * UTC date / week-start → naturally once-per-day / once-per-week).
 *
 * As a side effect, each qualifying completion is persisted via
 * `saveCompletion` so it cannot be re-awarded on a later run the same
 * day/week. Persistence is idempotent (saveCompletion ignores duplicates).
 */
export function collectChallengeRewards(
  challenges: Challenge[],
  progress: ChallengeProgress[],
  runScore: number,
  now: Date = new Date(),
): ChallengeReward[] {
  const byId = new Map(challenges.map((c) => [c.id, c]));
  const completedAt = now.toISOString();
  const rewards: ChallengeReward[] = [];

  for (const p of progress) {
    if (!p.completed || p.violated) continue;
    const challenge = byId.get(p.challengeId);
    if (!challenge) continue;
    // Already rewarded today/this week — skip (cross-session dedup).
    if (isChallengeCompleted(challenge.id)) continue;

    saveCompletion({
      challengeId: challenge.id,
      completedAt,
      runScore,
    });

    rewards.push({
      challenge,
      xpReward: challenge.xpReward,
      period: challenge.period,
    });
  }

  return rewards;
}
