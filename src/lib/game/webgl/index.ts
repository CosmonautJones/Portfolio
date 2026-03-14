// Backward-compat re-exports — modules now live under renderer/webgl/
export { SpriteAtlas, WHITE_REGION_KEY } from "../renderer/webgl/sprite-atlas";
export type { AtlasRegion } from "../renderer/webgl/sprite-atlas";
export { SpriteBatch } from "../renderer/webgl/sprite-batch";
export { GPUParticleRenderer } from "../renderer/webgl/gpu-particles";
export { PostProcessor } from "./post-process";
export { createProgram, createTexture, createFramebuffer, ortho, getUniform } from "../renderer/webgl/gl-utils";
