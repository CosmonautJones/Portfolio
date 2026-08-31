/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

  it("moves through hold, ready with notes, and ready verdicts", () => {
    render(<ReleaseSignal />);

    expect(screen.getByTestId("release-verdict")).toHaveTextContent("Hold");

    fireEvent.click(screen.getByLabelText(/Primary interaction is verified/i));
    fireEvent.click(screen.getByLabelText(/Responsive layout is checked/i));
    fireEvent.click(screen.getByLabelText(/Accessibility pass is complete/i));
    expect(screen.getByTestId("release-verdict")).toHaveTextContent(
      "Ready with notes"
    );

    fireEvent.click(screen.getByLabelText(/Visual regression is reviewed/i));
    fireEvent.click(screen.getByLabelText(/Rollback path is named/i));
    fireEvent.change(screen.getByLabelText("Release note"), {
      target: { value: "Verified at the release head." },
    });
    expect(screen.getByTestId("release-verdict")).toHaveTextContent("Ready");
  });

  it("switches to scenario-specific evidence", () => {
    render(<ReleaseSignal />);

    fireEvent.click(screen.getByRole("button", { name: "Data migration" }));

    expect(screen.getByLabelText("Backup is confirmed")).toBeInTheDocument();
    expect(screen.getByLabelText("Rollback is rehearsed")).toBeInTheDocument();
  });

  it("copies the evidence packet", () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<ReleaseSignal />);

    fireEvent.click(screen.getByRole("button", { name: /copy evidence/i }));

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("Evidence packet: Portfolio project proof upgrades")
    );
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Scenario: UI change"));
  });
});
