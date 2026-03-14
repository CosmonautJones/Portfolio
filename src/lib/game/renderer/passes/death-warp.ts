// ============================================================================
// DeathWarpPass — radial warp + chromatic aberration + desaturation on death
// ============================================================================

import type { RenderPass, RenderResources, RenderState } from "../render-pass";
import { createFramebuffer, getUniform } from "../webgl/gl-utils";
import { compileProgram, FULLSCREEN_VERTEX } from "../shaders/loader";
import deathWarpFrag from "../shaders/death-warp.frag.glsl";

export class DeathWarpPass implements RenderPass {
  readonly name = "deathWarp";
  enabled = false; // Only active during death animation

  private program: WebGLProgram | null = null;
  private tempFBO: { fbo: WebGLFramebuffer; texture: WebGLTexture } | null = null;
  private uScene: WebGLUniformLocation | null = null;
  private uProgress: WebGLUniformLocation | null = null;
  private uDeathCenter: WebGLUniformLocation | null = null;
  private uResolution: WebGLUniformLocation | null = null;

  setup(gl: WebGL2RenderingContext, resources: RenderResources): void {
    this.program = compileProgram(gl, FULLSCREEN_VERTEX, deathWarpFrag);
    this.uScene = getUniform(gl, this.program, "u_scene");
    this.uProgress = getUniform(gl, this.program, "u_progress");
    this.uDeathCenter = getUniform(gl, this.program, "u_deathCenter");
    this.uResolution = getUniform(gl, this.program, "u_resolution");

    this.tempFBO = createFramebuffer(gl, resources.width, resources.height, gl.NEAREST);
  }

  execute(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void {
    if (!this.program || !this.tempFBO) return;
    if (state.deathProgress <= 0) return;

    // Calculate death center in UV space
    let deathU = 0.5;
    let deathV = 0.5;
    if (state.deathPosition) {
      deathU = state.deathPosition.x / resources.width;
      // Flip Y for OpenGL coordinate system
      deathV = 1.0 - (state.deathPosition.y - state.camera.y) / resources.height;
    }

    // Copy scene to temp FBO
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, resources.sceneFBO.fbo);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.tempFBO.fbo);
    gl.blitFramebuffer(
      0, 0, resources.width, resources.height,
      0, 0, resources.width, resources.height,
      gl.COLOR_BUFFER_BIT, gl.NEAREST,
    );

    // Render warped scene back into scene FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.sceneFBO.fbo);
    gl.viewport(0, 0, resources.width, resources.height);
    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tempFBO.texture);
    gl.uniform1i(this.uScene, 0);
    gl.uniform1f(this.uProgress, state.deathProgress);
    gl.uniform2f(this.uDeathCenter, deathU, deathV);
    gl.uniform2f(this.uResolution, resources.width, resources.height);

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
