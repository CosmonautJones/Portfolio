export interface AnimationConfig {
  fps: number;
  frameCount: number;
  loop: boolean;
}

export const ANIMATION_CONFIGS: Record<string, AnimationConfig> = {
  car: { fps: 2, frameCount: 2, loop: true },
  car_blue: { fps: 2, frameCount: 2, loop: true },
  car_yellow: { fps: 2, frameCount: 2, loop: true },
  truck: { fps: 2, frameCount: 2, loop: true },
  train: { fps: 4, frameCount: 2, loop: true },
};

export function getAnimationFrame(type: string, time: number): number {
  const config = ANIMATION_CONFIGS[type];
  if (!config || config.frameCount <= 1) return 0;
  const frameDuration = 1 / config.fps;
  return Math.floor(time / frameDuration) % config.frameCount;
}
