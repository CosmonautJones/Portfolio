/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PageHeader } from "../page-header";

describe("PageHeader", () => {
  afterEach(cleanup);

  it("renders an eyebrow, a single h1, and a lede", () => {
    render(<PageHeader eyebrow="Projects" title="Things I built" lede="Each one runs today." />);
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Things I built" })).toBeDefined();
    expect(screen.getByText("Each one runs today.")).toBeDefined();
  });

  it("renders extra content such as actions below the lede", () => {
    render(
      <PageHeader eyebrow="Resume" title="Resume">
        <a href="/resume.pdf">Download</a>
      </PageHeader>
    );
    expect(screen.getByRole("link", { name: "Download" })).toBeDefined();
  });

  it("does not use the old gradient heading treatment", () => {
    const { container } = render(<PageHeader eyebrow="About" title="About" />);
    expect(container.querySelector(".gradient-text, .gradient-text-animated")).toBeNull();
  });
});
