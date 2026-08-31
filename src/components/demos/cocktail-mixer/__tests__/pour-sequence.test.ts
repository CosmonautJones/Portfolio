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
      vi.advanceTimersByTime(300); // past 250ms delay
    });

    expect(result.current.pouredCount).toBe(1);
    expect(result.current.activePour).toBe(0);
  });

  it("transitions from pour stream to bubbles", () => {
    const { result } = renderHook(() => usePourSequence(3));

    // Advance past pour start + stream duration
    act(() => {
      vi.advanceTimersByTime(250 + 500); // 250 delay + 450 stream + buffer
    });

    expect(result.current.activePour).toBeNull();
    expect(result.current.bubbleIndex).toBe(0);
  });

  it("pours all ingredients sequentially", () => {
    const { result } = renderHook(() => usePourSequence(3));

    // Advance past all 3 compact pours.
    act(() => {
      vi.advanceTimersByTime(250 + 850 * 3);
    });

    expect(result.current.pouredCount).toBe(3);
  });

  it("sets allDone after all ingredients are poured", () => {
    const { result } = renderHook(() => usePourSequence(2));

    // Compact timing keeps the proof moving without skipping the sequence.
    act(() => {
      vi.advanceTimersByTime(250 + 2 * 850 + 300);
    });

    expect(result.current.allDone).toBe(true);
  });

  it("works with single ingredient", () => {
    const { result } = renderHook(() => usePourSequence(1));

    act(() => {
      vi.advanceTimersByTime(250 + 850 + 300);
    });

    expect(result.current.pouredCount).toBe(1);
    expect(result.current.allDone).toBe(true);
  });

  it("finishes a three-ingredient recipe in under 3.5 seconds", () => {
    const { result } = renderHook(() => usePourSequence(3));

    act(() => {
      vi.advanceTimersByTime(3400);
    });

    expect(result.current.pouredCount).toBe(3);
    expect(result.current.allDone).toBe(true);
  });

  it("shows the completed recipe immediately for reduced motion", () => {
    const { result } = renderHook(() => usePourSequence(3, true));

    expect(result.current.pouredCount).toBe(3);
    expect(result.current.activePour).toBeNull();
    expect(result.current.bubbleIndex).toBeNull();
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
