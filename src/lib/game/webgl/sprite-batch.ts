// ============================================================================
// GPU Sprite Batch Renderer — instanced quad rendering from a texture atlas
// ============================================================================

import { createProgram, getUniform, ortho } from "./gl-utils";
import { SPRITE_VERTEX, SPRITE_FRAGMENT } from "./shaders";
import type { AtlasRegion } from "./sprite-atlas";

// Per-instance data layout:
// a_posSize:  4 floats (x, y, w, h)
// a_uvRect:   4 floats (u0, v0, u1, v1)
// a_tint:     4 floats (r, g, b, a)
// a_flags:    1 float  (flipH)
const FLOATS_PER_INSTANCE = 13;
const MAX_BATCH_SIZE = 4096;

export class SpriteBatch {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private quadVBO: WebGLBuffer;
  private instanceVBO: WebGLBuffer;
  private instanceData: Float32Array;
  private instanceCount = 0;

  private uProjection: WebGLUniformLocation | null;
  private uAtlas: WebGLUniformLocation | null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.program = createProgram(gl, SPRITE_VERTEX, SPRITE_FRAGMENT);
    this.uProjection = getUniform(gl, this.program, "u_projection");
    this.uAtlas = getUniform(gl, this.program, "u_atlas");

    // Allocate instance data buffer
    this.instanceData = new Float32Array(MAX_BATCH_SIZE * FLOATS_PER_INSTANCE);

    // Create VAO
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Failed to create VAO");
    this.vao = vao;
    gl.bindVertexArray(vao);

    // Quad corner VBO — 4 corners for a unit quad, drawn as triangle strip
    const corners = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    const quadVBO = gl.createBuffer();
    if (!quadVBO) throw new Error("Failed to create quad VBO");
    this.quadVBO = quadVBO;
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);
    // a_corner (location 0)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Instance VBO
    const instanceVBO = gl.createBuffer();
    if (!instanceVBO) throw new Error("Failed to create instance VBO");
    this.instanceVBO = instanceVBO;
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceVBO);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.instanceData.byteLength,
      gl.DYNAMIC_DRAW,
    );

    const stride = FLOATS_PER_INSTANCE * 4; // bytes per instance

    // a_posSize (location 1) — 4 floats
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(1, 1);

    // a_uvRect (location 2) — 4 floats
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 16);
    gl.vertexAttribDivisor(2, 1);

    // a_tint (location 3) — 4 floats
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, 32);
    gl.vertexAttribDivisor(3, 1);

    // a_flags (location 4) — 1 float
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 48);
    gl.vertexAttribDivisor(4, 1);

    gl.bindVertexArray(null);
  }

  /** Start a new batch frame */
  begin(): void {
    this.instanceCount = 0;
  }

  /** Add a textured sprite to the batch */
  draw(
    region: AtlasRegion,
    x: number,
    y: number,
    width?: number,
    height?: number,
    tintR = 1,
    tintG = 1,
    tintB = 1,
    tintA = 1,
    flipH = false,
  ): void {
    if (this.instanceCount >= MAX_BATCH_SIZE) {
      this.flush();
    }

    const w = width ?? region.width;
    const h = height ?? region.height;
    const offset = this.instanceCount * FLOATS_PER_INSTANCE;

    this.instanceData[offset] = x;
    this.instanceData[offset + 1] = y;
    this.instanceData[offset + 2] = w;
    this.instanceData[offset + 3] = h;
    this.instanceData[offset + 4] = region.u0;
    this.instanceData[offset + 5] = region.v0;
    this.instanceData[offset + 6] = region.u1;
    this.instanceData[offset + 7] = region.v1;
    this.instanceData[offset + 8] = tintR;
    this.instanceData[offset + 9] = tintG;
    this.instanceData[offset + 10] = tintB;
    this.instanceData[offset + 11] = tintA;
    this.instanceData[offset + 12] = flipH ? 1 : 0;

    this.instanceCount++;
  }

  /** Draw a solid colored quad using the white pixel region */
  drawQuad(
    whiteRegion: AtlasRegion,
    x: number,
    y: number,
    width: number,
    height: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void {
    this.draw(whiteRegion, x, y, width, height, r, g, b, a);
  }

  /** Submit the batch to the GPU and render all queued sprites */
  flush(): void {
    if (this.instanceCount === 0) return;

    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    // Upload instance data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceVBO);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      this.instanceData.subarray(0, this.instanceCount * FLOATS_PER_INSTANCE),
    );

    // Draw instanced triangle strip (4 vertices × instanceCount)
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.instanceCount);

    gl.bindVertexArray(null);
    this.instanceCount = 0;
  }

  private viewWidth = 0;
  private viewHeight = 0;

  /** Set the projection matrix */
  setProjection(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;
    const gl = this.gl;
    gl.useProgram(this.program);
    const proj = ortho(0, width, height, 0); // top-left origin
    gl.uniformMatrix4fv(this.uProjection, false, proj);
  }

  /** Apply a screen-space shake offset by shifting the projection matrix */
  setShakeOffset(offsetX: number, offsetY: number): void {
    const gl = this.gl;
    gl.useProgram(this.program);
    const proj = ortho(
      -offsetX,
      this.viewWidth - offsetX,
      this.viewHeight - offsetY,
      -offsetY,
    );
    gl.uniformMatrix4fv(this.uProjection, false, proj);
  }

  /** Clear the shake offset (restore normal projection) */
  clearShakeOffset(): void {
    this.setProjection(this.viewWidth, this.viewHeight);
  }

  /** Bind the atlas texture to unit 0 (TEXTURE0 — shared with post-processor) */
  bindAtlas(texture: WebGLTexture): void {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.uAtlas, 0);
  }

  destroy(): void {
    const gl = this.gl;
    gl.deleteBuffer(this.quadVBO);
    gl.deleteBuffer(this.instanceVBO);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }
}
