// ============================================================================
// RenderPass Interface — composable render pass abstraction
// ============================================================================

import type { GameState, Particle } from "../types";
import type { SpriteBatch } from "./webgl/sprite-batch";
import type { GPUParticleRenderer } from "./webgl/gpu-particles";
import type { SpriteAtlas, AtlasRegion } from "./webgl/sprite-atlas";

/** Shared GPU resources available to all render passes */
export interface RenderResources {
  gl: WebGL2RenderingContext;
  batch: SpriteBatch;
  particleRenderer: GPUParticleRenderer;
  atlas: SpriteAtlas;
  whiteRegion: AtlasRegion;
  width: number;
  height: number;
  /** Fullscreen quad VAO for post-processing passes */
  fsQuad: { vao: WebGLVertexArrayObject; vbo: WebGLBuffer };
  /** Framebuffers for post-processing */
  sceneFBO: { fbo: WebGLFramebuffer; texture: WebGLTexture };
  bloomFBO1: { fbo: WebGLFramebuffer; texture: WebGLTexture };
  bloomFBO2: { fbo: WebGLFramebuffer; texture: WebGLTexture };
}

/** Subset of GameState needed for rendering */
export interface RenderState {
  phase: GameState["phase"];
  player: GameState["player"];
  lanes: GameState["lanes"];
  camera: GameState["camera"];
  particles: readonly Particle[];
  coins: GameState["coins"];
  animationTime: number;
  score: number;
  level: number;
  deathCause: GameState["deathCause"];
  /** 0→1 progress through death animation (0 = alive, >0 = dying) */
  deathProgress: number;
  /** World position where death occurred */
  deathPosition: { x: number; y: number } | null;
}

/** A composable render pass in the pipeline */
export interface RenderPass {
  readonly name: string;
  enabled: boolean;
  /** One-time GPU resource allocation */
  setup(gl: WebGL2RenderingContext, resources: RenderResources): void;
  /** Execute this pass for the current frame */
  execute(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void;
  /** Clean up GPU resources */
  destroy(gl: WebGL2RenderingContext): void;
}
