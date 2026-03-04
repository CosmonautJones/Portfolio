/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePourSequence } from "../hooks";

describe("usePourSequence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with nothing poured", () => {
    const { result } = renderHook(() => usePourSequence(3));
    expect(result.current.pouredCount).toBe(0);
    expect(result.current.activePour).toBeNull();
    expect(result.current.bubbleIndex).toBeNull();
    expect(result.current.allDone).toBe(false);
  });

  it("pours first ingredient after initial delay", () => {
    const { result } = renderHook(() => usePourSequence(3));

    act(() => {
      vi.advanceTimersByTime(450); // past 400ms delay
    });

    expect(result.current.pouredCount).toBe(1);
    expect(result.current.activePour).toBe(0);
  });

  it("transitions from pour stream to bubbles", () => {
    const { result } = renderHook(() => usePourSequence(3));

    // Advance past pour start + stream duration
    act(() => {
      vi.advanceTimersByTime(400 + 850); // 400 delay + 800 stream + buffer
    });

    expect(result.current.activePour).toBeNull();
    expect(result.current.bubbleIndex).toBe(0);
  });

  it("pours all ingredients sequentially", () => {
    const { result } = renderHook(() => usePourSequence(3));

    // Advance past all 3 pours (400 + 3*1800 + extra)
    act(() => {
      vi.advanceTimersByTime(400 + 1800 * 3);
    });

    expect(result.current.pouredCount).toBe(3);
  });

  it("sets allDone after all ingredients are poured", () => {
    const { result } = renderHook(() => usePourSequence(2));

    // 400 initial + 2*1800 per ingredient + 300 finish delay + buffer
    act(() => {
      vi.advanceTimersByTime(400 + 2 * 1800 + 400);
    });

    expect(result.current.allDone).toBe(true);
  });

  it("works with single ingredient", () => {
    const { result } = renderHook(() => usePourSequence(1));

    act(() => {
      vi.advanceTimersByTime(400 + 1800 + 400);
    });

    expect(result.current.pouredCount).toBe(1);
    expect(result.current.allDone).toBe(true);
  });

  it("cleans up timers on unmount", () => {
    const { unmount } = renderHook(() => usePourSequence(3));
    const clearSpy = vi.spyOn(global, "clearTimeout");

    unmount();

    // Should have cleared multiple timers (3 per ingredient + 1 done)
    expect(clearSpy.mock.calls.length).toBeGreaterThan(0);
    clearSpy.mockRestore();
  });
});
