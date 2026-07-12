/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { TableStakes } from "../table-stakes";

describe("TableStakes", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("starts and pauses the clock", async () => {
    vi.useFakeTimers();
    render(<TableStakes />);

    expect(screen.getByText("10:00")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText("9:58")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText("9:58")).toBeDefined();
  });

  it("updates level duration", async () => {
    render(<TableStakes />);

    fireEvent.change(screen.getByLabelText("Level 1 minutes"), {
      target: { value: "2" },
    });

    expect(screen.getByText("2:00")).toBeDefined();
  });
});
