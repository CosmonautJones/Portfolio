// ============================================================================
// LightingPass — dynamic lane lighting with light map FBO
// ============================================================================

import type { RenderPass, RenderResources, RenderState } from "../render-pass";
import { createFramebuffer, getUniform } from "../webgl/gl-utils";
import { compileProgram, FULLSCREEN_VERTEX } from "../shaders/loader";
import lightingFrag from "../shaders/lighting.frag.glsl";
import { DEFAULT_CONFIG } from "../../constants";

export class LightingPass implements RenderPass {
  readonly name = "lighting";
  enabled = true;

  private lightMapFBO: { fbo: WebGLFramebuffer; texture: WebGLTexture } | null = null;
  private compositeProgram: WebGLProgram | null = null;
  private compUScene: WebGLUniformLocation | null = null;
  private compULightMap: WebGLUniformLocation | null = null;

  setup(gl: WebGL2RenderingContext, resources: RenderResources): void {
    // Create half-res light map FBO
    const halfW = Math.floor(resources.width / 2);
    const halfH = Math.floor(resources.height / 2);
    this.lightMapFBO = createFramebuffer(gl, halfW, halfH, gl.LINEAR);

    // Create composite program (scene * lightMap)
    this.compositeProgram = compileProgram(gl, FULLSCREEN_VERTEX, lightingFrag);
    this.compUScene = getUniform(gl, this.compositeProgram, "u_scene");
    this.compULightMap = getUniform(gl, this.compositeProgram, "u_lightMap");
  }

  execute(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void {
    if (!this.lightMapFBO || !this.compositeProgram) return;

    const halfW = Math.floor(resources.width / 2);
    const halfH = Math.floor(resources.height / 2);
    const cellSize = DEFAULT_CONFIG.cellSize;

    // --- Render light map ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightMapFBO.fbo);
    gl.viewport(0, 0, halfW, halfH);

    // Clear to ambient darkness
    gl.clearColor(0.3, 0.3, 0.4, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable additive blending for light quads
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    // Use the sprite batch to draw light quads into the light map
    const { batch, atlas, whiteRegion } = resources;
    batch.setProjection(halfW, halfH);
    batch.begin();

    // Scale factor for half-res
    const sx = halfW / resources.width;
    const sy = halfH / resources.height;

    for (const lane of state.lanes) {
      const screenY = (lane.y * cellSize - state.camera.y) * sy;
      if (screenY < -cellSize || screenY > halfH + cellSize) continue;

      if (lane.type === "road") {
        // Vehicle headlights — warm white cone
        for (const obs of lane.obstacles) {
          if (obs.type === "log") continue;
          const obsX = obs.worldX * sx;
          const lightW = 48 * sx;
          const lightH = 24 * sy;
          // Forward-facing headlight
          const dir = obs.speed > 0 ? 1 : -1;
          const lx = obsX + (dir > 0 ? obs.widthCells * cellSize * sx : -lightW);
          batch.drawQuad(whiteRegion, lx, screenY - lightH / 2, lightW, lightH, 1.0, 0.92, 0.7, 0.25);
        }
      } else if (lane.type === "water") {
        // Soft blue ambient glow
        const laneWidth = DEFAULT_CONFIG.gridColumns * cellSize * sx;
        batch.drawQuad(whiteRegion, 0, screenY, laneWidth, cellSize * sy, 0.3, 0.5, 0.8, 0.15);
      }
    }

    // Player warm point light
    if (state.player && state.player.alive) {
      const px = state.player.worldPos.x * sx;
      const py = (state.player.worldPos.y - state.camera.y) * sy;
      const lightSize = 56 * sx;
      batch.drawQuad(whiteRegion, px - lightSize / 2, py - lightSize / 2, lightSize, lightSize, 1.0, 0.6, 0.3, 0.3);
    }

    // Re-bind atlas after we're done with quads
    const atlasTex = atlas.getTexture();
    if (atlasTex) batch.bindAtlas(atlasTex);
    batch.flush();

    // Restore projection and blend mode
    batch.setProjection(resources.width, resources.height);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // --- Apply light map to scene ---
    // We don't composite here — the light map is applied in the composite pass
    // Store the light map texture for later use
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.sceneFBO.fbo);
    gl.viewport(0, 0, resources.width, resources.height);
  }

  /** Get the light map texture for compositing */
  getLightMapTexture(): WebGLTexture | null {
    return this.lightMapFBO?.texture ?? null;
  }

  destroy(gl: WebGL2RenderingContext): void {
    if (this.lightMapFBO) {
      gl.deleteFramebuffer(this.lightMapFBO.fbo);
      gl.deleteTexture(this.lightMapFBO.texture);
      this.lightMapFBO = null;
    }
    if (this.compositeProgram) {
      gl.deleteProgram(this.compositeProgram);
      this.compositeProgram = null;
    }
  }
}
