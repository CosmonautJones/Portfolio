// ============================================================================
// GPU Particle System — instanced rendering for high-performance particles
// ============================================================================

import { createProgram, getUniform, ortho } from "./gl-utils";
import { PARTICLE_VERTEX, PARTICLE_FRAGMENT } from "./shaders";
import type { Particle } from "../types";

// Per-instance data layout:
// a_position:   2 floats (x, y)
// a_sizeLife:    2 floats (size, life/maxLife)
// a_color:       4 floats (r, g, b, a)
// a_shape:       1 float  (0=square, 1=circle, 2=line)
// a_rotation:    1 float  (radians)
const FLOATS_PER_PARTICLE = 10;
const MAX_PARTICLES = 2048;

/** Parse a hex color string to RGB floats */
function hexToFloats(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  ];
}

export class GPUParticleRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private quadVBO: WebGLBuffer;
  private instanceVBO: WebGLBuffer;
  private instanceData: Float32Array;

  private uProjection: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.program = createProgram(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);
    this.uProjection = getUniform(gl, this.program, "u_projection");

    this.instanceData = new Float32Array(MAX_PARTICLES * FLOATS_PER_PARTICLE);

    // Create VAO
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Failed to create particle VAO");
    this.vao = vao;
    gl.bindVertexArray(vao);

    // Quad corner VBO
    const corners = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    const quadVBO = gl.createBuffer();
    if (!quadVBO) throw new Error("Failed to create particle quad VBO");
    this.quadVBO = quadVBO;
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);
    // a_corner (location 0)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Instance VBO
    const instanceVBO = gl.createBuffer();
    if (!instanceVBO) throw new Error("Failed to create particle instance VBO");
    this.instanceVBO = instanceVBO;
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceVBO);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.instanceData.byteLength,
      gl.DYNAMIC_DRAW,
    );

    const stride = FLOATS_PER_PARTICLE * 4;

    // a_position (location 1) — 2 floats
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(1, 1);

    // a_sizeLife (location 2) — 2 floats
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 8);
    gl.vertexAttribDivisor(2, 1);

    // a_color (location 3) — 4 floats
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, 16);
    gl.vertexAttribDivisor(3, 1);

    // a_shape (location 4) — 1 float
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 32);
    gl.vertexAttribDivisor(4, 1);

    // a_rotation (location 5) — 1 float
    gl.enableVertexAttribArray(5);
    gl.vertexAttribPointer(5, 1, gl.FLOAT, false, stride, 36);
    gl.vertexAttribDivisor(5, 1);

    gl.bindVertexArray(null);
  }

  /** Set the projection matrix */
  setProjection(width: number, height: number): void {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uProjection, false, ortho(0, width, height, 0));
  }

  /** Render all active particles. cameraY offsets particle Y for scrolling. */
  render(particles: readonly Particle[], cameraY: number): void {
    if (particles.length === 0) return;

    const gl = this.gl;
    const count = Math.min(particles.length, MAX_PARTICLES);

    // Fill instance data from particle state
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const offset = i * FLOATS_PER_PARTICLE;
      const lifeRatio = Math.max(0, p.life / p.maxLife);
      const [r, g, b] = hexToFloats(p.color);
      const shapeVal =
        p.shape === "circle" ? 1 : p.shape === "line" ? 2 : 0;

      this.instanceData[offset] = Math.round(p.x);
      this.instanceData[offset + 1] = Math.round(p.y - cameraY);
      this.instanceData[offset + 2] = p.size;
      this.instanceData[offset + 3] = lifeRatio;
      this.instanceData[offset + 4] = r;
      this.instanceData[offset + 5] = g;
      this.instanceData[offset + 6] = b;
      this.instanceData[offset + 7] = 1.0; // alpha (life-based fade in shader)
      this.instanceData[offset + 8] = shapeVal;
      this.instanceData[offset + 9] = p.rotation ?? 0;
    }

    // Also render trails as additional instances
    let trailCount = 0;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      if (!p.trail || p.prevX === undefined || p.prevY === undefined) continue;
      const ti = count + trailCount;
      if (ti >= MAX_PARTICLES) break;
      const offset = ti * FLOATS_PER_PARTICLE;
      const lifeRatio = Math.max(0, p.life / p.maxLife) * 0.3;
      const [r, g, b] = hexToFloats(p.color);

      this.instanceData[offset] = Math.round(p.prevX);
      this.instanceData[offset + 1] = Math.round(p.prevY - cameraY);
      this.instanceData[offset + 2] = p.size;
      this.instanceData[offset + 3] = lifeRatio;
      this.instanceData[offset + 4] = r;
      this.instanceData[offset + 5] = g;
      this.instanceData[offset + 6] = b;
      this.instanceData[offset + 7] = 1.0;
      this.instanceData[offset + 8] = 0; // square
      this.instanceData[offset + 9] = 0;
      trailCount++;
    }

    const totalInstances = count + trailCount;

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    // Upload
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceVBO);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      this.instanceData.subarray(0, totalInstances * FLOATS_PER_PARTICLE),
    );

    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, totalInstances);
    gl.bindVertexArray(null);
  }

  destroy(): void {
    const gl = this.gl;
    gl.deleteBuffer(this.quadVBO);
    gl.deleteBuffer(this.instanceVBO);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }
}
