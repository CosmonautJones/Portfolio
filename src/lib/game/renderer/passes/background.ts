// ============================================================================
// BackgroundPass — procedural sky gradient with aurora and stars
// ============================================================================

import type { RenderPass, RenderResources, RenderState } from "../render-pass";
import { getProgram } from "../shaders/loader";
import { getUniform } from "../webgl/gl-utils";

export class BackgroundPass implements RenderPass {
  readonly name = "background";
  enabled = true;

  private program: WebGLProgram | null = null;
  private uTime: WebGLUniformLocation | null = null;
  private uResolution: WebGLUniformLocation | null = null;

  setup(gl: WebGL2RenderingContext, _resources: RenderResources): void {
    this.program = getProgram(gl, "background");
    this.uTime = getUniform(gl, this.program, "u_time");
    this.uResolution = getUniform(gl, this.program, "u_resolution");
  }

  execute(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void {
    if (!this.program) return;
    gl.useProgram(this.program);
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
