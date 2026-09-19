/** @vitest-environment jsdom */
import { useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { COCKTAILS } from "../data";
import { RecipeView } from "../components/recipe-view";

vi.mock("../pixi/bar-stage", () => ({
  BarStage: ({
    onSnapshot,
    cocktail,
  }: {
    onSnapshot: (snapshot: {
      pouredCount: number;
      activePour: null;
      allDone: boolean;
    }) => void;
    cocktail: { ingredients: unknown[] };
  }) => {
    useEffect(() => {
      onSnapshot({
        pouredCount: cocktail.ingredients.length,
        activePour: null,
        allDone: true,
      });
    }, [cocktail, onSnapshot]);

    return <div data-testid="bar-stage" />;
  },
}));

describe("RecipeView", () => {
  it("completes the pour once when BarStage finishes", async () => {
    const onPourComplete = vi.fn();

    render(
      <RecipeView
        cocktail={COCKTAILS[0]}
        onReset={vi.fn()}
        onPourComplete={onPourComplete}
      />,
    );

    expect(screen.getByTestId("bar-stage")).toBeInTheDocument();
    await waitFor(() => {
      expect(onPourComplete).toHaveBeenCalledTimes(1);
    });
  });
});
