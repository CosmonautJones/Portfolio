// ============================================================================
// Renderer module — public API
// ============================================================================
//
// Only the symbols consumed through this barrel are re-exported here. Render
// passes, the pass graph, the post pipeline, and the ThreeRenderer are wired up
// internally and imported by their concrete file paths, so they are not part of
// the public surface.

export { GameRenderer } from "./renderer";
export { SpriteCache } from "./sprite-cache";
