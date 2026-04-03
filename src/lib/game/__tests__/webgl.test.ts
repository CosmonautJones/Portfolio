import { describe, it, expect } from "vitest";
import { PALETTE } from "../sprites/palette";

// Test the sprite atlas builder (CPU-side logic, no GL context needed)
describe("SpriteAtlas CPU-side", () => {
  it("palette has expected length", () => {
    expect(PALETTE.length).toBe(96);
  });

  it("palette index 0 is transparent", () => {
    expect(PALETTE[0]).toBe("transparent");
  });

  it("palette index 1 is dark navy", () => {
    expect(PALETTE[1]).toBe("#1a1c2c");
  });

  it("palette colors are valid hex or transparent", () => {
    for (const color of PALETTE) {
      if (color === "transparent") continue;
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("WebGL shader sources", () => {
  it("all shader sources are non-empty strings", async () => {
    const {
      SPRITE_VERTEX,
      SPRITE_FRAGMENT,
      QUAD_VERTEX,
      QUAD_FRAGMENT,
      PARTICLE_VERTEX,
      PARTICLE_FRAGMENT,
      BACKGROUND_VERTEX,
      BACKGROUND_FRAGMENT,
      BLOOM_EXTRACT_FRAGMENT,
      BLUR_FRAGMENT,
      COMPOSITE_FRAGMENT,
      FULLSCREEN_VERTEX,
    } = await import("../webgl/shaders");

    const shaders = [
      SPRITE_VERTEX,
      SPRITE_FRAGMENT,
      QUAD_VERTEX,
      QUAD_FRAGMENT,
      PARTICLE_VERTEX,
      PARTICLE_FRAGMENT,
      BACKGROUND_VERTEX,
      BACKGROUND_FRAGMENT,
      BLOOM_EXTRACT_FRAGMENT,
      BLUR_FRAGMENT,
      COMPOSITE_FRAGMENT,
      FULLSCREEN_VERTEX,
    ];

    for (const src of shaders) {
      expect(typeof src).toBe("string");
      expect(src.length).toBeGreaterThan(10);
    }
  });

  it("sprite vertex shader uses #version 300 es", async () => {
    const { SPRITE_VERTEX } = await import("../webgl/shaders");
    expect(SPRITE_VERTEX).toContain("#version 300 es");
  });

  it("sprite fragment shader outputs fragColor", async () => {
    const { SPRITE_FRAGMENT } = await import("../webgl/shaders");
    expect(SPRITE_FRAGMENT).toContain("out vec4 fragColor");
  });

  it("particle shader supports circle and line shapes", async () => {
    const { PARTICLE_FRAGMENT } = await import("../webgl/shaders");
    expect(PARTICLE_FRAGMENT).toContain("v_shape");
    expect(PARTICLE_FRAGMENT).toContain("smoothstep");
  });

  it("composite shader applies bloom and vignette", async () => {
    const { COMPOSITE_FRAGMENT } = await import("../webgl/shaders");
    expect(COMPOSITE_FRAGMENT).toContain("u_bloom");
    expect(COMPOSITE_FRAGMENT).toContain("u_bloomIntensity");
    // Vignette
    expect(COMPOSITE_FRAGMENT).toContain("vigDist");
  });

  it("background shader has aurora effect", async () => {
    const { BACKGROUND_FRAGMENT } = await import("../webgl/shaders");
    expect(BACKGROUND_FRAGMENT).toContain("aurora");
  });
});

describe("GL utilities", () => {
  it("ortho produces 16-element float array", async () => {
    const { ortho } = await import("../webgl/gl-utils");
    const mat = ortho(0, 416, 640, 0);
    expect(mat).toBeInstanceOf(Float32Array);
    expect(mat.length).toBe(16);
  });

  it("ortho matrix has correct diagonal values for 416x640", async () => {
    const { ortho } = await import("../webgl/gl-utils");
    const mat = ortho(0, 416, 640, 0);
    // mat[0] = 2 / (right - left) = 2 / 416
    expect(mat[0]).toBeCloseTo(2 / 416, 5);
    // mat[5] = 2 / (top - bottom) = 2 / (0 - 640) = -2/640
    expect(mat[5]).toBeCloseTo(2 / (0 - 640), 5);
    // mat[15] = 1
    expect(mat[15]).toBe(1);
  });

  it("createIsometricSkew produces identity-like matrix with shear in column-major slot", async () => {
    const { createIsometricSkew } = await import("../webgl/gl-utils");
    const mat = createIsometricSkew(0.4);
    expect(mat).toBeInstanceOf(Float32Array);
    expect(mat.length).toBe(16);
    // Diagonal should be 1
    expect(mat[0]).toBe(1);
    expect(mat[5]).toBe(1);
    expect(mat[10]).toBe(1);
    expect(mat[15]).toBe(1);
    // Shear at column 1, row 0 (index 4) — x += shear * y
    expect(mat[4]).toBeCloseTo(0.4, 5);
    // All other off-diagonal elements should be 0
    for (let i = 0; i < 16; i++) {
      if ([0, 4, 5, 10, 15].includes(i)) continue;
      expect(mat[i]).toBe(0);
    }
  });

  it("createIsometricSkew with zero shear produces identity", async () => {
    const { createIsometricSkew } = await import("../webgl/gl-utils");
    const mat = createIsometricSkew(0);
    expect(mat[0]).toBe(1);
    expect(mat[4]).toBe(0);
    expect(mat[5]).toBe(1);
    expect(mat[15]).toBe(1);
  });

  it("multiplyMatrix4 with two identities produces identity", async () => {
    const { multiplyMatrix4 } = await import("../webgl/gl-utils");
    const id = new Float32Array(16);
    id[0] = 1; id[5] = 1; id[10] = 1; id[15] = 1;
    const result = multiplyMatrix4(id, id);
    for (let i = 0; i < 16; i++) {
      expect(result[i]).toBeCloseTo(id[i], 5);
    }
  });

  it("multiplyMatrix4: identity × A = A", async () => {
    const { multiplyMatrix4, ortho } = await import("../webgl/gl-utils");
    const id = new Float32Array(16);
    id[0] = 1; id[5] = 1; id[10] = 1; id[15] = 1;
    const a = ortho(0, 400, 600, 0);
    const result = multiplyMatrix4(id, a);
    for (let i = 0; i < 16; i++) {
      expect(result[i]).toBeCloseTo(a[i], 5);
    }
  });

  it("multiplyMatrix4: A × identity = A", async () => {
    const { multiplyMatrix4, ortho } = await import("../webgl/gl-utils");
    const id = new Float32Array(16);
    id[0] = 1; id[5] = 1; id[10] = 1; id[15] = 1;
    const a = ortho(0, 400, 600, 0);
    const result = multiplyMatrix4(a, id);
    for (let i = 0; i < 16; i++) {
      expect(result[i]).toBeCloseTo(a[i], 5);
    }
  });

  it("multiplyMatrix4: ortho × skew modifies the expected elements", async () => {
    const { multiplyMatrix4, ortho, createIsometricSkew } = await import("../webgl/gl-utils");
    const proj = ortho(0, 416, 640, 0);
    const skew = createIsometricSkew(0.38);
    const result = multiplyMatrix4(proj, skew);

    // The result should still be a valid 4×4 matrix
    expect(result.length).toBe(16);

    // Diagonal should be preserved for x and z
    expect(result[0]).toBeCloseTo(proj[0], 5); // x scale unchanged
    expect(result[10]).toBe(-1); // z unchanged

    // The skew should modify column 1 (indices 4..7)
    // result col1 = proj * skew_col1
    // skew_col1 = [0.38, 1, 0, 0]
    // proj * skew_col1 = proj_col0 * 0.38 + proj_col1 * 1
    // result[4] = proj[0] * 0.38 + proj[4] * 1 = (2/416)*0.38 + 0
    expect(result[4]).toBeCloseTo(proj[0] * 0.38, 5);
    // result[5] = proj[1]*0.38 + proj[5]*1 = 0 + proj[5]
    expect(result[5]).toBeCloseTo(proj[5], 5);
  });
});

describe("Renderer exports", () => {
  it("hexToRgb is still exported for backward compatibility", async () => {
    const { hexToRgb } = await import("../renderer");
    expect(hexToRgb("#ff0000")).toEqual([255, 0, 0]);
    expect(hexToRgb("#1a1c2c")).toEqual([26, 28, 44]);
  });

  it("SpriteCache class is exported", async () => {
    const { SpriteCache } = await import("../renderer");
    expect(typeof SpriteCache).toBe("function");
  });

  it("GameRenderer class is exported", async () => {
    const { GameRenderer } = await import("../renderer");
    expect(typeof GameRenderer).toBe("function");
  });
});

describe("Atlas region types", () => {
  it("WHITE_REGION_KEY is a string constant", async () => {
    const { WHITE_REGION_KEY } = await import("../webgl/sprite-atlas");
    expect(typeof WHITE_REGION_KEY).toBe("string");
    expect(WHITE_REGION_KEY).toBe("__white__");
  });
});
