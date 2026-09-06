/** @vitest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { COCKTAILS } from "../data";
import { BarStage } from "../pixi/bar-stage";

describe("BarStage", () => {
  it("exposes bar-stage test id and cocktail name", async () => {
    const onSnapshot = vi.fn();
    render(
      <BarStage
        cocktail={COCKTAILS[0]}
        reducedMotion
        onSnapshot={onSnapshot}
      />,
    );

    const root = await screen.findByTestId("bar-stage");
    expect(root).toHaveAttribute("aria-label", "Margarita");
    expect(root).toHaveAttribute("role", "img");
    await waitFor(() => {
      expect(onSnapshot).toHaveBeenCalledWith({
        pouredCount: 3,
        activePour: null,
        allDone: true,
      });
    });
  });
});
