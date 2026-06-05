/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MenuOverlay } from "../MenuOverlay";
import type { SkinId } from "@/lib/game/types";

afterEach(cleanup);

function setup(overrides: Partial<Parameters<typeof MenuOverlay>[0]> = {}) {
  const onSelectSkin = vi.fn();
  const props = {
    canvasWidth: 416,
    muted: false,
    spriteStyle: "pixel" as const,
    voxelReady: false,
    unlockedSkins: ["default"] as SkinId[],
    selectedSkin: "default" as SkinId,
    onSelectSkin,
    onToggleMute: vi.fn(),
    onToggleSpriteStyle: vi.fn(),
    ...overrides,
  };
  render(<MenuOverlay {...props} />);
  return { props, onSelectSkin };
}

describe("MenuOverlay skin picker", () => {
  it("renders a radio for every skin", () => {
    setup();
    const radios = screen.getAllByRole("radio");
    // default, golden, ghost, diamond, rainbow
    expect(radios.length).toBe(5);
  });

  it("marks the selected skin as checked", () => {
    setup({ selectedSkin: "default" });
    const checked = screen
      .getAllByRole("radio")
      .filter((r) => r.getAttribute("aria-checked") === "true");
    expect(checked.length).toBe(1);
    expect(checked[0].getAttribute("aria-label")).toContain("selected");
  });

  it("disables locked skins and shows the unlock hint in the label", () => {
    setup({ unlockedSkins: ["default"] });
    const golden = screen.getByRole("radio", { name: /Golden Lobster/i });
    expect(golden).toBeDisabled();
    expect(golden.getAttribute("aria-label")?.toLowerCase()).toContain("locked");
    expect(golden.getAttribute("aria-label")).toMatch(/200 distance/);
  });

  it("invokes onSelectSkin when an unlocked skin is clicked", () => {
    const { onSelectSkin } = setup({
      unlockedSkins: ["default", "golden"],
      selectedSkin: "default",
    });
    const golden = screen.getByRole("radio", { name: /Golden Lobster/i });
    expect(golden).not.toBeDisabled();
    fireEvent.click(golden);
    expect(onSelectSkin).toHaveBeenCalledWith("golden");
  });

  it("does not invoke onSelectSkin when a locked skin is clicked", () => {
    const { onSelectSkin } = setup({ unlockedSkins: ["default"] });
    const ghost = screen.getByRole("radio", { name: /Ghost Lobster/i });
    fireEvent.click(ghost);
    expect(onSelectSkin).not.toHaveBeenCalled();
  });

  it("skin radios meet the 44px minimum tap target", () => {
    setup({ unlockedSkins: ["default", "golden", "ghost", "diamond", "rainbow"] });
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio.className).toMatch(/min-w-11/);
      expect(radio.className).toMatch(/min-h-11/);
    }
  });
});
