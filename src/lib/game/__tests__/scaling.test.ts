import { describe, it, expect } from "vitest";

const VIEWPORT_WIDTH = 416; // 13 * 32
const VIEWPORT_HEIGHT = 640; // 20 * 32

/**
 * Replicates the fractional scaling formula from GameCanvas.
 * rawScale = min(containerW / 416, containerH / 640)
 * scale = clamp(rawScale, 1, 6)
 */
function computeScale(containerWidth: number, containerHeight: number): number {
  const rawScale = Math.min(
    containerWidth / VIEWPORT_WIDTH,
    containerHeight / VIEWPORT_HEIGHT,
  );
  return Math.max(1, Math.min(rawScale, 6));
}

describe("Fractional canvas scaling", () => {
  it("handles 1920x1080 desktop (with 280px sidebars)", () => {
    // Game area = 1920 - 280*2 = 1360
    const scale = computeScale(1360, 1080);
    const w = Math.round(VIEWPORT_WIDTH * scale);
    const h = Math.round(VIEWPORT_HEIGHT * scale);

    // min(1360/416, 1080/640) = min(3.269, 1.6875) = 1.6875
    expect(scale).toBeGreaterThan(1.5);
    expect(scale).toBeLessThanOrEqual(6);
    expect(w).toBeLessThanOrEqual(1360);
    expect(h).toBeLessThanOrEqual(1080);
  });

  it("handles 1440x900 desktop (with sidebars)", () => {
    const scale = computeScale(880, 900);
    const w = Math.round(VIEWPORT_WIDTH * scale);
    const h = Math.round(VIEWPORT_HEIGHT * scale);

    // min(880/416, 900/640) = min(2.115, 1.406) = 1.406
    expect(scale).toBeGreaterThan(1);
    expect(w).toBeLessThanOrEqual(880);
    expect(h).toBeLessThanOrEqual(900);
  });

  it("handles mobile 375x667", () => {
    const scale = computeScale(375, 667);

    // min(375/416, 667/640) = 0.901 → clamped to 1
    // At 2x viewport the canvas exceeds 375px at min scale; CSS handles overflow
    expect(scale).toBe(1);
  });

  it("handles tablet 768x1024", () => {
    const scale = computeScale(768, 1024);
    const w = Math.round(VIEWPORT_WIDTH * scale);
    const h = Math.round(VIEWPORT_HEIGHT * scale);

    // min(768/416, 1024/640) = min(1.846, 1.6) = 1.6
    expect(scale).toBeGreaterThan(1.5);
    expect(w).toBeLessThanOrEqual(768);
    expect(h).toBeLessThanOrEqual(1024);
  });

  it("caps at 6x even on very large screens", () => {
    // Need W >= 2496 and H >= 3840 to exceed 6x
    const scale = computeScale(5000, 5000);
    expect(scale).toBe(6);
  });

  it("floors at 1x for very small containers", () => {
    const scale = computeScale(100, 100);
    expect(scale).toBe(1);
  });

  it("wider container with same height is height-capped", () => {
    // At 1080px height, scale = min(w/416, 1080/640) = min(w/416, 1.6875)
    // Both 1360 and 1920 are wide enough that height is the bottleneck
    const withSidebars = computeScale(1360, 1080);
    const fullWidth = computeScale(1920, 1080);
    expect(fullWidth).toBe(withSidebars); // both height-capped at 1.6875
  });

  it("taller container produces higher scale when width is sufficient", () => {
    const shorter = computeScale(1920, 800);
    const taller = computeScale(1920, 1200);
    expect(taller).toBeGreaterThan(shorter);
  });
});
