/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useThreeRenderer } from "../use-three-renderer";

// Mock ThreeRenderer — jsdom doesn't support WebGL
const mockDestroy = vi.fn();
const mockResize = vi.fn();
const mockRender = vi.fn();

vi.mock("@/lib/game/renderer/three-renderer", () => ({
  ThreeRenderer: vi.fn().mockImplementation(() => ({
    destroy: mockDestroy,
    resize: mockResize,
    render: mockRender,
  })),
}));

describe("useThreeRenderer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not create ThreeRenderer when inactive", () => {
    const { result } = renderHook(() => useThreeRenderer(false, 416, 640));
    expect(result.current.threeRendererRef.current).toBeNull();
  });

  it("should set threeRendererRef to null when deactivated", () => {
    const { result, rerender } = renderHook(
      ({ active }) => useThreeRenderer(active, 416, 640),
      { initialProps: { active: true } },
    );

    rerender({ active: false });
    expect(result.current.threeRendererRef.current).toBeNull();
  });

  it("should return stable refs across rerenders", () => {
    const { result, rerender } = renderHook(
      ({ active }) => useThreeRenderer(active, 416, 640),
      { initialProps: { active: false } },
    );

    const firstThreeRef = result.current.threeRendererRef;
    const firstCanvasRef = result.current.threeCanvasRef;

    rerender({ active: true });

    expect(result.current.threeRendererRef).toBe(firstThreeRef);
    expect(result.current.threeCanvasRef).toBe(firstCanvasRef);
  });

  it("should provide a canvas ref for the Three.js canvas", () => {
    const { result } = renderHook(() => useThreeRenderer(false, 416, 640));
    expect(result.current.threeCanvasRef).toBeDefined();
    expect(result.current.threeCanvasRef.current).toBeNull();
  });
});
