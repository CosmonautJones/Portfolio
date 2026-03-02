import { describe, it, expect } from "vitest";

const VIEWPORT_WIDTH = 208;
const VIEWPORT_HEIGHT = 320;

/**
 * Replicates the fractional scaling formula from GameCanvas.
 * rawScale = min(containerW / 208, containerH / 320)
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

    expect(scale).toBeGreaterThan(3);
    expect(scale).toBeLessThanOrEqual(6);
    expect(w).toBeLessThanOrEqual(1360);
    expect(h).toBeLessThanOrEqual(1080);
  });

  it("handles 1440x900 desktop (with sidebars)", () => {
    const scale = computeScale(880, 900);
    const w = Math.round(VIEWPORT_WIDTH * scale);
    const h = Math.round(VIEWPORT_HEIGHT * scale);

    expect(scale).toBeGreaterThan(2);
    expect(w).toBeLessThanOrEqual(880);
    expect(h).toBeLessThanOrEqual(900);
  });

  it("handles mobile 375x667", () => {
    const scale = computeScale(375, 667);
    const w = Math.round(VIEWPORT_WIDTH * scale);
    const h = Math.round(VIEWPORT_HEIGHT * scale);

    expect(scale).toBeGreaterThanOrEqual(1);
    expect(w).toBeLessThanOrEqual(375);
    expect(h).toBeLessThanOrEqual(667);
  });

  it("handles tablet 768x1024", () => {
    const scale = computeScale(768, 1024);
    const w = Math.round(VIEWPORT_WIDTH * scale);
    const h = Math.round(VIEWPORT_HEIGHT * scale);

    expect(scale).toBeGreaterThan(3);
    expect(w).toBeLessThanOrEqual(768);
    expect(h).toBeLessThanOrEqual(1024);
  });

  it("caps at 6x even on very large screens", () => {
    const scale = computeScale(3840, 2160);
    expect(scale).toBe(6);
  });

  it("floors at 1x for very small containers", () => {
    const scale = computeScale(100, 100);
    expect(scale).toBe(1);
  });

  it("wider container with same height is height-capped", () => {
    // At 1080px height, scale = min(w/208, 1080/320) = min(w/208, 3.375)
    // Both 1360 and 1920 are wide enough that height is the bottleneck
    const withSidebars = computeScale(1360, 1080);
    const fullWidth = computeScale(1920, 1080);
    expect(fullWidth).toBe(withSidebars); // both height-capped at 3.375
  });

  it("taller container produces higher scale when width is sufficient", () => {
    const shorter = computeScale(1920, 800);
    const taller = computeScale(1920, 1200);
    expect(taller).toBeGreaterThan(shorter);
  });
});
