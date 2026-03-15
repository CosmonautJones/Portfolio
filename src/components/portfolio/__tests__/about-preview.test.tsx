/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/components/ui/animate-on-scroll", () => ({
  AnimateOnScroll: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { AboutPreview } from "../about-preview";

describe("AboutPreview", () => {
  afterEach(cleanup);

  it("renders the blockquote", () => {
    render(<AboutPreview />);
    expect(screen.getByText(/builds game engines for fun/)).toBeDefined();
  });

  it("renders a link to the about page", () => {
    render(<AboutPreview />);
    const link = screen.getByRole("link", { name: /more about me/i });
    expect(link.getAttribute("href")).toBe("/about");
  });
});
