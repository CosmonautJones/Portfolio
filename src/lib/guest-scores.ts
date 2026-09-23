import type { LeaderboardEntry } from "@/lib/types";

export const GUEST_SCORES_KEY = "adventure_guest_scores";
const MAX_STORED = 50;

export interface GuestScore {
  id: string;
  score: number;
  deathCause: string;
  createdAt: string;
  coinsCollected: number;
  coinBonus: number;
}

export interface GuestPlayerStats {
  gamesPlayed: number;
  bestScore: number;
  avgScore: number;
  totalDistance: number;
  totalCoins: number;
  favoriteDeath: string;
  lastPlayed: string;
  bestCoins: number;
  bestCoinBonus: number;
}

export function loadGuestScores(): GuestScore[] {
  try {
    const raw = localStorage.getItem(GUEST_SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestScore[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestScores(scores: GuestScore[]): void {
  try {
    localStorage.setItem(GUEST_SCORES_KEY, JSON.stringify(scores.slice(0, MAX_STORED)));
  } catch {
    // localStorage unavailable
  }
}

export function recordGuestScore(input: {
  score: number;
  deathCause: string;
  coinsCollected?: number;
  coinBonus?: number;
  createdAt?: string;
  id?: string;
}): GuestScore {
  const entry: GuestScore = {
    id: input.id ?? `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    score: input.score,
    deathCause: input.deathCause,
    createdAt: input.createdAt ?? new Date().toISOString(),
    coinsCollected: input.coinsCollected ?? 0,
    coinBonus: input.coinBonus ?? 0,
  };
  const next = [entry, ...loadGuestScores()].slice(0, MAX_STORED);
  saveGuestScores(next);
  return entry;
}

export function computeGuestStats(scores: GuestScore[]): GuestPlayerStats | null {
  if (scores.length === 0) return null;

  const values = scores.map((d) => d.score);
  const bestScore = Math.max(...values);
  const avgScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const totalDistance = scores.reduce(
    (sum, d) => sum + (d.score - (d.coinBonus ?? 0)),
    0,
  );
  const totalCoins = scores.reduce((sum, d) => sum + (d.coinsCollected ?? 0), 0);

  const deathCounts: Record<string, number> = {};
  for (const entry of scores) {
    const cause = entry.deathCause || "unknown";
    deathCounts[cause] = (deathCounts[cause] || 0) + 1;
  }
  const maxCount = Math.max(0, ...Object.values(deathCounts));
  const tied = Object.keys(deathCounts).filter((cause) => deathCounts[cause] === maxCount);
  const favoriteDeath =
    scores
      .filter((entry) => tied.includes(entry.deathCause || "unknown"))
      .sort((a, b) => b.score - a.score)[0]?.deathCause ?? "unknown";

  const ordered = [...scores].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    gamesPlayed: scores.length,
    bestScore,
    avgScore,
    totalDistance,
    totalCoins,
    favoriteDeath,
    lastPlayed: ordered[0].createdAt,
    bestCoins: Math.max(...scores.map((d) => d.coinsCollected ?? 0)),
    bestCoinBonus: Math.max(...scores.map((d) => d.coinBonus ?? 0)),
  };
}

export function mergeLeaderboard(
  server: LeaderboardEntry[],
  local: GuestScore[],
  limit = 10,
): LeaderboardEntry[] {
  const localEntries: LeaderboardEntry[] = local.map((entry) => ({
    id: entry.id,
    rank: 0,
    score: entry.score,
    deathCause: entry.deathCause,
    displayName: "You",
    createdAt: entry.createdAt,
    isCurrentUser: true,
  }));

  const combined = [...localEntries, ...server].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return combined.slice(0, limit).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
