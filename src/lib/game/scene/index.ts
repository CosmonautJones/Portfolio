// src/lib/game/scene/index.ts
export type { RenderScene } from "./types";
export { buildScene, type BuildSceneOptions } from "./build-scene";
export {
  projectTopDown,
  projectIsometric,
  type ScreenPoint,
} from "./camera-projection";
