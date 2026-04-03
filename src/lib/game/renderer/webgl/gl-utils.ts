// ============================================================================
// WebGL2 Utility Functions — Shader compilation, program linking, textures
// ============================================================================

export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info}`);
  }
  // Shaders can be detached after linking
  gl.detachShader(program, vs);
  gl.detachShader(program, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

export function createTexture(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  data: Uint8Array | null,
  options?: {
    filter?: number;
    wrap?: number;
    internalFormat?: number;
    format?: number;
  },
): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error("Failed to create texture");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    options?.internalFormat ?? gl.RGBA,
    width,
    height,
    0,
    options?.format ?? gl.RGBA,
    gl.UNSIGNED_BYTE,
    data,
  );
  const filter = options?.filter ?? gl.NEAREST;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  const wrap = options?.wrap ?? gl.CLAMP_TO_EDGE;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  return tex;
}

export function createFramebuffer(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  filter?: number,
): { fbo: WebGLFramebuffer; texture: WebGLTexture } {
  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("Failed to create framebuffer");
  const texture = createTexture(gl, width, height, null, {
    filter: filter ?? gl.LINEAR,
  });
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );

  // Validate framebuffer completeness
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fbo);
    gl.deleteTexture(texture);
    throw new Error(
      `Framebuffer not complete: 0x${status.toString(16)} (${width}x${height})`,
    );
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fbo, texture };
}

/** Create an orthographic projection matrix (column-major for WebGL) */
export function ortho(
  left: number,
  right: number,
  bottom: number,
  top: number,
): Float32Array {
  // Float32Array is zero-initialized, so off-diagonal elements are already 0
  const out = new Float32Array(16);
  out[0] = 2 / (right - left);
  out[5] = 2 / (top - bottom);
  out[10] = -1;
  out[12] = -(right + left) / (right - left);
  out[13] = -(top + bottom) / (top - bottom);
  out[15] = 1;
  return out;
}

/** Create a 4×4 shear matrix for isometric skew (column-major).
 *  Maps x' = x + shearAmount * y, keeping y unchanged.
 *  shearAmount ~0.35–0.5 gives a ~19–27° isometric tilt. */
export function createIsometricSkew(shearAmount: number): Float32Array {
  // Column-major: index = col*4 + row
  // We want row 0 (x) to pick up a contribution from column 1 (y).
  // That's index 1*4 + 0 = 4.
  const out = new Float32Array(16);
  out[0] = 1;             // col 0, row 0
  out[5] = 1;             // col 1, row 1
  out[10] = 1;            // col 2, row 2
  out[15] = 1;            // col 3, row 3
  out[4] = shearAmount;   // col 1, row 0  → x += shear * y
  return out;
}

/** Multiply two 4×4 column-major matrices: out = A × B */
export function multiplyMatrix4(
  a: Float32Array,
  b: Float32Array,
): Float32Array {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

/**
 * Get uniform location. Returns null if uniform is optimized out by the GLSL
 * compiler — this is normal and WebGL2 silently ignores null locations passed
 * to gl.uniform*() calls.
 */
export function getUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
): WebGLUniformLocation | null {
  return gl.getUniformLocation(program, name);
}
