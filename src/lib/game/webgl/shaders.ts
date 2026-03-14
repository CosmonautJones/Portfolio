// ============================================================================
// Backward-compat re-exports — shaders now live in renderer/shaders/*.glsl
// ============================================================================

export {
  SPRITE_VERTEX,
  SPRITE_FRAGMENT,
  QUAD_VERTEX,
  QUAD_FRAGMENT,
  PARTICLE_VERTEX,
  PARTICLE_FRAGMENT,
  FULLSCREEN_VERTEX,
  BACKGROUND_FRAGMENT,
  BLOOM_EXTRACT_FRAGMENT,
  BLUR_FRAGMENT,
  COMPOSITE_FRAGMENT,
} from "../renderer/shaders/loader";

// Backward compat: BACKGROUND_VERTEX was an alias for FULLSCREEN_VERTEX
import { FULLSCREEN_VERTEX as _FS } from "../renderer/shaders/loader";
export const BACKGROUND_VERTEX = _FS;
