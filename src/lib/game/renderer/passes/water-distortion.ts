// ============================================================================
// WaterDistortionPass — UV-offset water shader with specular ripples
// ============================================================================

import type { RenderPass, RenderResources, RenderState } from "../render-pass";
import { createFramebuffer, getUniform } from "../webgl/gl-utils";
import { compileProgram, FULLSCREEN_VERTEX } from "../shaders/loader";
import waterFrag from "../shaders/water.frag.glsl";
import { DEFAULT_CONFIG } from "../../constants";

export class WaterDistortionPass implements RenderPass {
  readonly name = "waterDistortion";
  enabled = true;

  private program: WebGLProgram | null = null;
  private tempFBO: { fbo: WebGLFramebuffer; texture: WebGLTexture } | null = null;
  private uScene: WebGLUniformLocation | null = null;
  private uTime: WebGLUniformLocation | null = null;
  private uResolution: WebGLUniformLocation | null = null;
  private uWaterLanes: WebGLUniformLocation | null = null;
  private uWaterLaneCount: WebGLUniformLocation | null = null;

  setup(gl: WebGL2RenderingContext, resources: RenderResources): void {
    this.program = compileProgram(gl, FULLSCREEN_VERTEX, waterFrag);
    this.uScene = getUniform(gl, this.program, "u_scene");
    this.uTime = getUniform(gl, this.program, "u_time");
    this.uResolution = getUniform(gl, this.program, "u_resolution");
    this.uWaterLanes = getUniform(gl, this.program, "u_waterLanes");
    this.uWaterLaneCount = getUniform(gl, this.program, "u_waterLaneCount");

    // Temp FBO for ping-pong (read scene, write distorted)
    this.tempFBO = createFramebuffer(gl, resources.width, resources.height, gl.NEAREST);
  }

  execute(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void {
    if (!this.program || !this.tempFBO) return;

    // Collect water lane screen Y ranges
    const cellSize = DEFAULT_CONFIG.cellSize;
    const waterRanges: number[] = [];
    let count = 0;

    for (const lane of state.lanes) {
      if (lane.type !== "water") continue;
      const screenY = lane.y * cellSize - state.camera.y;
      if (screenY < -cellSize || screenY > state.camera.viewportHeight + cellSize) continue;
      if (count >= 8) break; // max 8 water lanes

      // Convert to pixel coordinates (OpenGL Y is flipped)
      const yMin = resources.height - (screenY + cellSize);
      const yMax = resources.height - screenY;
      waterRanges.push(yMin, yMax);
      count++;
    }

    if (count === 0) return; // No visible water lanes

    // Pad to 16 floats
    while (waterRanges.length < 16) waterRanges.push(0);

    // Copy scene to temp FBO
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, resources.sceneFBO.fbo);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.tempFBO.fbo);
    gl.blitFramebuffer(
      0, 0, resources.width, resources.height,
      0, 0, resources.width, resources.height,
      gl.COLOR_BUFFER_BIT, gl.NEAREST,
    );

    // Render distorted water back into scene FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.sceneFBO.fbo);
    gl.viewport(0, 0, resources.width, resources.height);
    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tempFBO.texture);
    gl.uniform1i(this.uScene, 0);
    gl.uniform1f(this.uTime, state.animationTime);
    gl.uniform2f(this.uResolution, resources.width, resources.height);
    gl.uniform1fv(this.uWaterLanes, waterRanges);
    gl.uniform1i(this.uWaterLaneCount, count);

    gl.bindVertexArray(resources.fsQuad.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  destroy(gl: WebGL2RenderingContext): void {
    if (this.tempFBO) {
      gl.deleteFramebuffer(this.tempFBO.fbo);
      gl.deleteTexture(this.tempFBO.texture);
      this.tempFBO = null;
    }
    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }
  }
}
