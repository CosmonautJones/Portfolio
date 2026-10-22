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

  it("reuses project images as decorative media", () => {
    const { container } = render(<TryItNow />);
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs.map((img) => img.getAttribute("src"))).toEqual([
      "/projects/article-to-markdown.jpg",
      "/projects/tablesense.jpg",
      "/projects/alcubemy.png",
    ]);
    for (const img of imgs) expect(img.getAttribute("alt")).toBe("");
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("keeps numbers and money language off the strip", () => {
    render(<TryItNow />);
    const text = screen.getByRole("region", { name: "Open something and use it" }).textContent ?? "";
    expect(text).not.toMatch(/\d/);
    expect(text).not.toMatch(/real money|stakes|finished/i);
  });
});
