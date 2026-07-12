export type BlindLevel = {
  id: string;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationSeconds: number;
};

export type BlindClockState = {
  currentLevel: BlindLevel;
  nextLevel: BlindLevel | null;
  currentIndex: number;
  secondsIntoLevel: number;
  secondsRemaining: number;
  isComplete: boolean;
};

export function getBlindClockState(
  levels: BlindLevel[],
  elapsedSeconds: number
): BlindClockState {
  if (levels.length === 0) {
    throw new Error("At least one blind level is required.");
  }

  const safeElapsed = Math.max(0, elapsedSeconds);
  let levelStart = 0;

  for (let index = 0; index < levels.length; index++) {
    const level = levels[index];
    const levelEnd = levelStart + level.durationSeconds;
    const isLast = index === levels.length - 1;

    if (safeElapsed < levelEnd || isLast) {
      const cappedElapsed = Math.min(safeElapsed, levelEnd);
      const secondsIntoLevel = Math.max(0, cappedElapsed - levelStart);
      return {
        currentLevel: level,
        nextLevel: levels[index + 1] ?? null,
        currentIndex: index,
        secondsIntoLevel,
        secondsRemaining: Math.max(0, level.durationSeconds - secondsIntoLevel),
        isComplete: isLast && safeElapsed >= levelEnd,
      };
    }

    levelStart = levelEnd;
  }

  const lastIndex = levels.length - 1;
  return {
    currentLevel: levels[lastIndex],
    nextLevel: null,
    currentIndex: lastIndex,
    secondsIntoLevel: levels[lastIndex].durationSeconds,
    secondsRemaining: 0,
    isComplete: true,
  };
}

export function formatClock(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}
