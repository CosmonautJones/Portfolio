// ============================================================================
// RenderPass Interface — composable render pass abstraction
// ============================================================================

import type { SpriteBatch } from "./webgl/sprite-batch";
import type { GPUParticleRenderer } from "./webgl/gpu-particles";
import type { SpriteAtlas, AtlasRegion } from "./webgl/sprite-atlas";
import type { RenderScene } from "../scene/types";

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

/** @deprecated Use RenderScene from ../scene/types. Kept for the pass-graph API. */
export type RenderState = RenderScene;

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
