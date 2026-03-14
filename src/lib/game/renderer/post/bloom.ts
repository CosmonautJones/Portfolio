// ============================================================================
// BloomPass — bloom extract + dual-filter blur (optimized)
// ============================================================================

import type { RenderPass, RenderResources, RenderState } from "../render-pass";
import { getProgram, compileProgram, FULLSCREEN_VERTEX } from "../shaders/loader";
import { getUniform } from "../webgl/gl-utils";
import bloomDownFrag from "../shaders/bloom-down.frag.glsl";
import bloomUpFrag from "../shaders/bloom-up.frag.glsl";

export class BloomPass implements RenderPass {
  readonly name = "bloom";
  enabled = true;

  private extractProgram: WebGLProgram | null = null;
  private extractUScene: WebGLUniformLocation | null = null;
  private extractUThreshold: WebGLUniformLocation | null = null;

  private downProgram: WebGLProgram | null = null;
  private downUTexture: WebGLUniformLocation | null = null;
  private downUTexelSize: WebGLUniformLocation | null = null;

  private upProgram: WebGLProgram | null = null;
  private upUTexture: WebGLUniformLocation | null = null;
  private upUTexelSize: WebGLUniformLocation | null = null;

  setup(gl: WebGL2RenderingContext, _resources: RenderResources): void {
    this.extractProgram = getProgram(gl, "bloomExtract");
    this.extractUScene = getUniform(gl, this.extractProgram, "u_scene");
    this.extractUThreshold = getUniform(gl, this.extractProgram, "u_threshold");

    // Dual-filter downsample
    this.downProgram = compileProgram(gl, FULLSCREEN_VERTEX, bloomDownFrag);
    this.downUTexture = getUniform(gl, this.downProgram, "u_texture");
    this.downUTexelSize = getUniform(gl, this.downProgram, "u_texelSize");

    // Dual-filter upsample
    this.upProgram = compileProgram(gl, FULLSCREEN_VERTEX, bloomUpFrag);
    this.upUTexture = getUniform(gl, this.upProgram, "u_texture");
    this.upUTexelSize = getUniform(gl, this.upProgram, "u_texelSize");
  }

  execute(gl: WebGL2RenderingContext, _state: RenderState, resources: RenderResources): void {
    if (!this.extractProgram || !this.downProgram || !this.upProgram) return;

    const bw = Math.floor(resources.width / 2);
    const bh = Math.floor(resources.height / 2);

    // --- Bloom extract (scene → bloomFBO1 at half-res) ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.bloomFBO1.fbo);
    gl.viewport(0, 0, bw, bh);
    gl.useProgram(this.extractProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, resources.sceneFBO.texture);
    gl.uniform1i(this.extractUScene, 0);
    gl.uniform1f(this.extractUThreshold, 0.6);
    gl.bindVertexArray(resources.fsQuad.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // --- Dual-filter: downsample (bloomFBO1 → bloomFBO2) ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.bloomFBO2.fbo);
    gl.viewport(0, 0, bw, bh);
    gl.useProgram(this.downProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, resources.bloomFBO1.texture);
    gl.uniform1i(this.downUTexture, 0);
    gl.uniform2f(this.downUTexelSize, 1.0 / bw, 1.0 / bh);
    gl.bindVertexArray(resources.fsQuad.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // --- Dual-filter: upsample (bloomFBO2 → bloomFBO1) ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.bloomFBO1.fbo);
    gl.viewport(0, 0, bw, bh);
    gl.useProgram(this.upProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, resources.bloomFBO2.texture);
    gl.uniform1i(this.upUTexture, 0);
    gl.uniform2f(this.upUTexelSize, 1.0 / bw, 1.0 / bh);
    gl.bindVertexArray(resources.fsQuad.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindVertexArray(null);
  }

  destroy(gl: WebGL2RenderingContext): void {
    if (this.downProgram) gl.deleteProgram(this.downProgram);
    if (this.upProgram) gl.deleteProgram(this.upProgram);
    this.extractProgram = null;
    this.downProgram = null;
    this.upProgram = null;
  }
}
