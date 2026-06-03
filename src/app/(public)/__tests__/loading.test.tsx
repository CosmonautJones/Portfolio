/** @vitest-environment jsdom */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Loading from "../loading";

describe("Public Loading skeleton", () => {
  afterEach(cleanup);

  it("renders an accessible busy region", () => {
    render(<Loading />);
    const region = screen.getByLabelText("Loading content");
    expect(region).toBeDefined();
    expect(region.getAttribute("aria-busy")).toBe("true");
  });

  it("renders a grid of six card skeletons", () => {
    const { container } = render(<Loading />);
    const cards = container.querySelectorAll(".glass-card");
    expect(cards.length).toBe(6);
  });

  it("uses pulse animation for skeleton blocks", () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
