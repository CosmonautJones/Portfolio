// ============================================================================
// Shader Loader — compiles and caches WebGLProgram instances from .glsl files
// ============================================================================

import { createProgram } from "../webgl/gl-utils";

// Import raw GLSL shader sources
import spriteVert from "./sprite.vert.glsl";
import spriteFrag from "./sprite.frag.glsl";
import quadVert from "./quad.vert.glsl";
import quadFrag from "./quad.frag.glsl";
import particleVert from "./particle.vert.glsl";
import particleFrag from "./particle.frag.glsl";
import fullscreenVert from "./fullscreen.vert.glsl";
import backgroundFrag from "./background.frag.glsl";
import bloomExtractFrag from "./bloom-extract.frag.glsl";
import blurFrag from "./blur.frag.glsl";
import compositeFrag from "./composite.frag.glsl";

// Re-export raw shader sources for consumers that need them directly
export const SPRITE_VERTEX = spriteVert;
export const SPRITE_FRAGMENT = spriteFrag;
export const QUAD_VERTEX = quadVert;
export const QUAD_FRAGMENT = quadFrag;
export const PARTICLE_VERTEX = particleVert;
export const PARTICLE_FRAGMENT = particleFrag;
export const FULLSCREEN_VERTEX = fullscreenVert;
export const BACKGROUND_FRAGMENT = backgroundFrag;
export const BLOOM_EXTRACT_FRAGMENT = bloomExtractFrag;
export const BLUR_FRAGMENT = blurFrag;
export const COMPOSITE_FRAGMENT = compositeFrag;

// Program cache keyed by shader pair name
const programCache = new Map<string, WebGLProgram>();

export type ShaderProgramName =
  | "sprite"
  | "quad"
  | "particle"
  | "background"
  | "bloomExtract"
  | "blur"
  | "composite";

const SHADER_PAIRS: Record<ShaderProgramName, { vert: string; frag: string }> = {
  sprite: { vert: spriteVert, frag: spriteFrag },
  quad: { vert: quadVert, frag: quadFrag },
  particle: { vert: particleVert, frag: particleFrag },
  background: { vert: fullscreenVert, frag: backgroundFrag },
  bloomExtract: { vert: fullscreenVert, frag: bloomExtractFrag },
  blur: { vert: fullscreenVert, frag: blurFrag },
  composite: { vert: fullscreenVert, frag: compositeFrag },
};

/** Compile and cache a named shader program */
export function getProgram(
  gl: WebGL2RenderingContext,
  name: ShaderProgramName,
): WebGLProgram {
  const cached = programCache.get(name);
  if (cached) return cached;

  const pair = SHADER_PAIRS[name];
  const program = createProgram(gl, pair.vert, pair.frag);
  programCache.set(name, program);
  return program;
}

/** Compile a program from custom shader sources (not cached) */
export function compileProgram(
  gl: WebGL2RenderingContext,
  vertSource: string,
  fragSource: string,
): WebGLProgram {
  return createProgram(gl, vertSource, fragSource);
}

/** Clear the program cache (call when GL context is lost/destroyed) */
export function clearProgramCache(): void {
  programCache.clear();
}
