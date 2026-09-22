/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { BrandMark } from "../brand-mark";

describe("BrandMark", () => {
  afterEach(cleanup);

  it("is decorative so the adjacent name labels the link", () => {
    const { container } = render(<BrandMark />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("draws the tj ligature with a separate signal lamp", () => {
    const { container } = render(<BrandMark />);
    expect(container.querySelectorAll("path").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector("[data-part='signal']")).not.toBeNull();
  });

  it("accepts a size override", () => {
    const { container } = render(<BrandMark className="h-10 w-10" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("h-10 w-10");
  });
});
