/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PixelArtEditor } from "../pixel-art-editor";

vi.mock("@/hooks/use-visitor", () => ({
  useVisitor: () => ({
    awardXP: vi.fn(),
    trackEvent: vi.fn(),
    unlockAchievement: vi.fn(),
  }),
}));

describe("PixelArtEditor", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      stroke: vi.fn(),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("opens as a personalized sprite workshop", () => {
    render(<PixelArtEditor />);

    expect(screen.getByRole("heading", { name: "Pixel Workshop" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ClaudeBot lobster" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Blank canvas" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pixel canvas, 32 by 32" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "More colors" })).toBeInTheDocument();
  });

  it("makes starter changes undoable and keeps the full palette optional", async () => {
    const user = userEvent.setup();
    render(<PixelArtEditor />);

    await user.click(screen.getByRole("button", { name: "Blank canvas" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Redo" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "ClaudeBot lobster" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await user.click(screen.getByRole("button", { name: "More colors" }));
    expect(screen.getByRole("button", { name: "Fewer colors" })).toBeInTheDocument();
  });
});
