// ============================================================================
// CompositePass — final scene + bloom composite with vignette and scanlines
// ============================================================================

import type { RenderPass, RenderResources, RenderState } from "../render-pass";
import { getProgram } from "../shaders/loader";
import { getUniform } from "../webgl/gl-utils";
import { BLOOM_INTENSITY } from "../../constants";

export class CompositePass implements RenderPass {
  readonly name = "composite";
  enabled = true;

  private program: WebGLProgram | null = null;
  private uScene: WebGLUniformLocation | null = null;
  private uBloom: WebGLUniformLocation | null = null;
  private uBloomIntensity: WebGLUniformLocation | null = null;
  private uTime: WebGLUniformLocation | null = null;
  private uResolution: WebGLUniformLocation | null = null;

  setup(gl: WebGL2RenderingContext, _resources: RenderResources): void {
    this.program = getProgram(gl, "composite");
    this.uScene = getUniform(gl, this.program, "u_scene");
    this.uBloom = getUniform(gl, this.program, "u_bloom");
    this.uBloomIntensity = getUniform(gl, this.program, "u_bloomIntensity");
    this.uTime = getUniform(gl, this.program, "u_time");
    this.uResolution = getUniform(gl, this.program, "u_resolution");
  }

  execute(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void {
    if (!this.program) return;

    // Render to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, resources.width, resources.height);
    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, resources.sceneFBO.texture);
    gl.uniform1i(this.uScene, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, resources.bloomFBO1.texture);
    gl.uniform1i(this.uBloom, 1);

    gl.uniform1f(this.uBloomIntensity, BLOOM_INTENSITY);
    gl.uniform1f(this.uTime, state.animationTime);
    gl.uniform2f(this.uResolution, resources.width, resources.height);

    gl.bindVertexArray(resources.fsQuad.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  destroy(_gl: WebGL2RenderingContext): void {
    this.program = null;
  }
}
