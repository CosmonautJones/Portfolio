export interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
}

export function createScreenShake(): ScreenShake {
  return {
    intensity: 0,
    duration: 0,
    elapsed: 0,
    offsetX: 0,
    offsetY: 0,
    active: false,
  };
}

export function triggerScreenShake(
  shake: ScreenShake,
  intensity: number,
  duration: number,
): void {
  shake.intensity = intensity;
  shake.duration = duration;
  shake.elapsed = 0;
  shake.active = true;
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

  shake.offsetX = (Math.random() * 2 - 1) * currentIntensity;
  shake.offsetY = (Math.random() * 2 - 1) * currentIntensity;

  return { offsetX: shake.offsetX, offsetY: shake.offsetY };
}

/** Get shake intensity and duration based on death cause */
export function getShakeParams(deathCause: string): {
  intensity: number;
  duration: number;
} {
  switch (deathCause) {
    case "train":
      return { intensity: 6, duration: 0.5 };
    case "vehicle":
      return { intensity: 4, duration: 0.35 };
    case "water":
      return { intensity: 2, duration: 0.4 };
    default:
      return { intensity: 3, duration: 0.3 };
  }
}
