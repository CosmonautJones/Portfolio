// ============================================================================
// Post-Processing Pipeline — bloom, vignette, chromatic aberration, scanlines
// ============================================================================

import { createProgram, createFramebuffer, getUniform } from "./gl-utils";
import {
  FULLSCREEN_VERTEX,
  BACKGROUND_FRAGMENT,
  BLOOM_EXTRACT_FRAGMENT,
  BLUR_FRAGMENT,
  COMPOSITE_FRAGMENT,
} from "./shaders";

/** Fullscreen quad VAO shared across all post-processing passes */
function createFullscreenQuad(gl: WebGL2RenderingContext): {
  vao: WebGLVertexArrayObject;
  vbo: WebGLBuffer;
} {
  const vao = gl.createVertexArray();
  if (!vao) throw new Error("Failed to create fullscreen VAO");
  gl.bindVertexArray(vao);

  // Two triangles covering NDC space (-1 to 1)
  const vbo = gl.createBuffer();
  if (!vbo) throw new Error("Failed to create fullscreen VBO");
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  return { vao, vbo };
}

export class PostProcessor {
  private gl: WebGL2RenderingContext;
  private width: number;
  private height: number;

  // Fullscreen quad
  private fsQuad: { vao: WebGLVertexArrayObject; vbo: WebGLBuffer };

  // Background program
  private bgProgram: WebGLProgram;
  private bgUTime: WebGLUniformLocation;
  private bgUResolution: WebGLUniformLocation;

  // Bloom extract
  private extractProgram: WebGLProgram;
  private extractUScene: WebGLUniformLocation;
  private extractUThreshold: WebGLUniformLocation;

  // Gaussian blur
  private blurProgram: WebGLProgram;
  private blurUTexture: WebGLUniformLocation;
  private blurUDirection: WebGLUniformLocation;

  // Final composite
  private compositeProgram: WebGLProgram;
  private compUScene: WebGLUniformLocation;
  private compUBloom: WebGLUniformLocation;
  private compUBloomIntensity: WebGLUniformLocation;
  private compUTime: WebGLUniformLocation;
  private compUResolution: WebGLUniformLocation;

  // Framebuffers
  private sceneFBO: { fbo: WebGLFramebuffer; texture: WebGLTexture };
  private bloomFBO1: { fbo: WebGLFramebuffer; texture: WebGLTexture };
  private bloomFBO2: { fbo: WebGLFramebuffer; texture: WebGLTexture };

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.gl = gl;
    this.width = width;
    this.height = height;

    this.fsQuad = createFullscreenQuad(gl);

    // Create programs
    this.bgProgram = createProgram(gl, FULLSCREEN_VERTEX, BACKGROUND_FRAGMENT);
    this.bgUTime = getUniform(gl, this.bgProgram, "u_time");
    this.bgUResolution = getUniform(gl, this.bgProgram, "u_resolution");

    this.extractProgram = createProgram(
      gl,
      FULLSCREEN_VERTEX,
      BLOOM_EXTRACT_FRAGMENT,
    );
    this.extractUScene = getUniform(gl, this.extractProgram, "u_scene");
    this.extractUThreshold = getUniform(
      gl,
      this.extractProgram,
      "u_threshold",
    );

    this.blurProgram = createProgram(gl, FULLSCREEN_VERTEX, BLUR_FRAGMENT);
    this.blurUTexture = getUniform(gl, this.blurProgram, "u_texture");
    this.blurUDirection = getUniform(gl, this.blurProgram, "u_direction");

    this.compositeProgram = createProgram(
      gl,
      FULLSCREEN_VERTEX,
      COMPOSITE_FRAGMENT,
    );
    this.compUScene = getUniform(gl, this.compositeProgram, "u_scene");
    this.compUBloom = getUniform(gl, this.compositeProgram, "u_bloom");
    this.compUBloomIntensity = getUniform(
      gl,
      this.compositeProgram,
      "u_bloomIntensity",
    );
    this.compUTime = getUniform(gl, this.compositeProgram, "u_time");
    this.compUResolution = getUniform(
      gl,
      this.compositeProgram,
      "u_resolution",
    );

    // Create framebuffers
    this.sceneFBO = createFramebuffer(gl, width, height, gl.NEAREST);

    // Bloom at half resolution for performance
    const bw = Math.floor(width / 2);
    const bh = Math.floor(height / 2);
    this.bloomFBO1 = createFramebuffer(gl, bw, bh, gl.LINEAR);
    this.bloomFBO2 = createFramebuffer(gl, bw, bh, gl.LINEAR);
  }

  /** Begin rendering the game scene into the offscreen framebuffer */
  beginScene(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /** End scene rendering (unbinds framebuffer) */
  endScene(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** Render the procedural background directly (call before sprite batches) */
  renderBackground(time: number): void {
    const gl = this.gl;
    gl.useProgram(this.bgProgram);
    gl.uniform1f(this.bgUTime, time);
    gl.uniform2f(this.bgUResolution, this.width, this.height);
    gl.bindVertexArray(this.fsQuad.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  /** Apply post-processing and render to screen (call after endScene) */
  composite(time: number, bloomIntensity = 0.35): void {
    const gl = this.gl;
    const bw = Math.floor(this.width / 2);
    const bh = Math.floor(this.height / 2);

    // --- Bloom extract ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFBO1.fbo);
    gl.viewport(0, 0, bw, bh);
    gl.useProgram(this.extractProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.texture);
    gl.uniform1i(this.extractUScene, 0);
    gl.uniform1f(this.extractUThreshold, 0.6);
    gl.bindVertexArray(this.fsQuad.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // --- Gaussian blur (two-pass ping-pong) ---
    const blurPasses = 2;
    for (let pass = 0; pass < blurPasses; pass++) {
      // Horizontal blur: FBO1 → FBO2
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFBO2.fbo);
      gl.useProgram(this.blurProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.bloomFBO1.texture);
      gl.uniform1i(this.blurUTexture, 0);
      gl.uniform2f(this.blurUDirection, 1.0 / bw, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Vertical blur: FBO2 → FBO1
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFBO1.fbo);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.bloomFBO2.texture);
      gl.uniform2f(this.blurUDirection, 0, 1.0 / bh);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // --- Final composite to screen ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.compositeProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.texture);
    gl.uniform1i(this.compUScene, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomFBO1.texture);
    gl.uniform1i(this.compUBloom, 1);

    gl.uniform1f(this.compUBloomIntensity, bloomIntensity);
    gl.uniform1f(this.compUTime, time);
    gl.uniform2f(this.compUResolution, this.width, this.height);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  /** Get the scene framebuffer (for rendering into) */
  getSceneFBO(): WebGLFramebuffer {
    return this.sceneFBO.fbo;
  }

  destroy(): void {
    const gl = this.gl;
    gl.deleteFramebuffer(this.sceneFBO.fbo);
    gl.deleteTexture(this.sceneFBO.texture);
    gl.deleteFramebuffer(this.bloomFBO1.fbo);
    gl.deleteTexture(this.bloomFBO1.texture);
    gl.deleteFramebuffer(this.bloomFBO2.fbo);
    gl.deleteTexture(this.bloomFBO2.texture);
    gl.deleteBuffer(this.fsQuad.vbo);
    gl.deleteVertexArray(this.fsQuad.vao);
    gl.deleteProgram(this.bgProgram);
    gl.deleteProgram(this.extractProgram);
    gl.deleteProgram(this.blurProgram);
    gl.deleteProgram(this.compositeProgram);
  }
}
