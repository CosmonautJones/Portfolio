/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReleaseSignal } from "../release-signal";

const writeText = vi.fn().mockResolvedValue(undefined);

Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: { writeText },
});

describe("ReleaseSignal", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("moves to ready when required gates are checked", async () => {
    const user = userEvent.setup();
    render(<ReleaseSignal />);

    expect(screen.getByText("Needs work")).toBeDefined();
    await user.click(screen.getByLabelText(/Scope is clear/i));
    await user.click(screen.getByLabelText(/Happy path is verified/i));
    await user.click(screen.getByLabelText(/Known rough edges are named/i));

    expect(screen.getByText("Ready")).toBeDefined();
  });

  it("copies the summary", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<ReleaseSignal />);

    fireEvent.click(screen.getByRole("button", { name: /copy summary/i }));

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("Feature branch")
    );
  });
});
