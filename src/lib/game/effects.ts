export interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
  /** Optional directional bias: positive = shake right, negative = shake left */
  biasX: number;
  /** Optional directional bias: positive = shake down, negative = shake up */
  biasY: number;
}

export function createScreenShake(): ScreenShake {
  return {
    intensity: 0,
    duration: 0,
    elapsed: 0,
    offsetX: 0,
    offsetY: 0,
    active: false,
    biasX: 0,
    biasY: 0,
  };
}

export function triggerScreenShake(
  shake: ScreenShake,
  intensity: number,
  duration: number,
  biasX = 0,
  biasY = 0,
): void {
  // Accumulate if already shaking (take the stronger)
  if (shake.active && shake.intensity >= intensity) return;
  shake.intensity = intensity;
  shake.duration = duration;
  shake.elapsed = 0;
  shake.active = true;
  shake.biasX = biasX;
  shake.biasY = biasY;
}

/** Trigger a small, brief micro-shake (landing, coin collect, etc.) */
export function triggerMicroShake(shake: ScreenShake, biasX = 0, biasY = 0): void {
  // Only override if current shake is weaker
  if (shake.active && shake.intensity > 1.5) return;
  shake.intensity = 1.5;
  shake.duration = 0.1;
  shake.elapsed = 0;
  shake.active = true;
  shake.biasX = biasX;
  shake.biasY = biasY;
}

export function updateScreenShake(
  shake: ScreenShake,
  dt: number,
): { offsetX: number; offsetY: number } {
  if (!shake.active) {
    return { offsetX: 0, offsetY: 0 };
  }

  shake.elapsed += dt;

  if (shake.elapsed >= shake.duration) {
    shake.active = false;
    shake.offsetX = 0;
    shake.offsetY = 0;
    return { offsetX: 0, offsetY: 0 };
  }

  // Exponential decay
  const progress = shake.elapsed / shake.duration;
  const decay = Math.exp(-progress * 4) * (1 - progress);
  const currentIntensity = shake.intensity * decay;

  // Random component + directional bias
  const randX = (Math.random() * 2 - 1) * currentIntensity;
  const randY = (Math.random() * 2 - 1) * currentIntensity;
  shake.offsetX = randX + shake.biasX * currentIntensity * 0.5;
  shake.offsetY = randY + shake.biasY * currentIntensity * 0.5;

  return { offsetX: shake.offsetX, offsetY: shake.offsetY };
}

/** Get shake intensity, duration, and directional bias based on death cause */
export function getShakeParams(deathCause: string): {
  intensity: number;
  duration: number;
  biasX: number;
  biasY: number;
} {
  switch (deathCause) {
    case "train":
      return { intensity: 6, duration: 0.5, biasX: 1, biasY: 0 };
    case "vehicle":
      return { intensity: 4, duration: 0.35, biasX: 0.5, biasY: -0.3 };
    case "water":
      return { intensity: 2, duration: 0.4, biasX: 0, biasY: 1 };
    default:
      return { intensity: 3, duration: 0.3, biasX: 0, biasY: 0 };
  }
}

// ---------------------------------------------------------------------------
// Combo tracking
// ---------------------------------------------------------------------------

export interface ComboState {
  count: number;
  lastHopTime: number;
  /** Time window (seconds) within which consecutive hops increment combo */
  windowSec: number;
}

export function createComboState(): ComboState {
  return {
    count: 0,
    lastHopTime: -999,
    windowSec: 0.8,
  };
}

/**
 * Record a new forward hop and return the current combo multiplier.
 * Combo resets to 1 if the gap since last hop exceeds windowSec.
 */
export function updateCombo(combo: ComboState, now: number): number {
  const gap = now - combo.lastHopTime;
  if (gap > combo.windowSec) {
    combo.count = 1;
  } else {
    combo.count = Math.min(combo.count + 1, 8);
  }
  combo.lastHopTime = now;
  return combo.count;
}

/** Reset combo (on death, idle, backward hop) */
export function resetCombo(combo: ComboState): void {
  combo.count = 0;
}
