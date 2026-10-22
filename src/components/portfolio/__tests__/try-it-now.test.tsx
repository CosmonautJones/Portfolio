/** @vitest-environment jsdom */
import React, { createElement } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) =>
    createElement("img", { alt: props.alt as string, src: props.src as string }),
}));

import { TryItNow } from "../try-it-now";

describe("TryItNow", () => {
  afterEach(cleanup);

  it("labels the section with its h2 heading and locked copy", () => {
    render(<TryItNow />);
    const heading = screen.getByRole("heading", { level: 2, name: "Open something and use it" });
    const section = screen.getByRole("region", { name: "Open something and use it" });
    expect(section.getAttribute("aria-labelledby")).toBe(heading.id);
    expect(screen.getByText("Try it now")).toBeDefined();
    expect(screen.getByText("Three things that run in your browser. No account needed.")).toBeDefined();
  });

  it("renders the three tiles in order with their CTAs and links", () => {
    render(<TryItNow />);
    const tiles = screen.getAllByRole("article");
    expect(tiles.map((t) => within(t).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Article to Markdown",
      "TableSense",
      "Alcubemy",
    ]);

    const tool = within(tiles[0]).getByRole("link", { name: "Use the tool" });
    expect(tool.getAttribute("href")).toBe("/work/article-to-markdown");
    expect(tool.getAttribute("target")).toBeNull();
    expect(within(tiles[0]).getByText("Browser tool")).toBeDefined();

    const poker = within(tiles[1]).getByRole("link", { name: "Play TableSense (opens in a new tab)" });
    expect(poker.getAttribute("href")).toBe("https://cosmonautjones.github.io/poker-pokr/");
    expect(poker.getAttribute("target")).toBe("_blank");
    expect(poker.getAttribute("rel")).toBe("noopener noreferrer");
    expect(poker.textContent).toBe("Play TableSense");
    expect(within(tiles[1]).getByText("Working prototype")).toBeDefined();

    const sand = within(tiles[2]).getByRole("link", { name: "Play Alcubemy (opens in a new tab)" });
    expect(sand.getAttribute("href")).toBe("https://alcubemy.travisjohnjones.com/");
    expect(sand.getAttribute("target")).toBe("_blank");
    expect(sand.getAttribute("rel")).toBe("noopener noreferrer");
    expect(within(tiles[2]).getByText("Experimental")).toBeDefined();
  });

  it("reuses project media with card alt text", () => {
    render(<TryItNow />);
    expect(screen.getByAltText("Water meets lava. Captured in Alcubemy.").getAttribute("src")).toBe("/projects/alcubemy.png");
    expect(screen.getByAltText("TableSense").getAttribute("src")).toBe("/projects/tablesense.jpg");
    expect(screen.getByAltText("Article to Markdown").getAttribute("src")).toBe("/projects/article-to-markdown.jpg");
  });

  it("keeps numbers off the strip", () => {
    const { container } = render(<TryItNow />);
    expect(container.textContent).not.toMatch(/\d/);
    expect(container.textContent).not.toMatch(/real money|stakes|finished/i);
  });
});
