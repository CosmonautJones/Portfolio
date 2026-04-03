// ============================================================================
// Renderer module — public API
// ============================================================================

export { GameRenderer } from "./renderer";
export { ThreeRenderer } from "./three-renderer";
export { SpriteCache } from "./sprite-cache";
export { PassGraph } from "./pass-graph";
export type { RenderPass, RenderResources, RenderState } from "./render-pass";
export { BackgroundPass } from "./passes/background";
export { SpritesPass } from "./passes/sprites";
export { ParticlesPass } from "./passes/particles";
export { LightingPass } from "./passes/lighting";
export { WaterDistortionPass } from "./passes/water-distortion";
export { DeathWarpPass } from "./passes/death-warp";
export { PostPipeline } from "./post/post-pipeline";
export { BloomPass } from "./post/bloom";
export { CompositePass } from "./post/composite";
