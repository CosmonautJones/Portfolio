/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/components/ui/animate-on-scroll", () => ({
  AnimateOnScroll: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/stagger-children", () => ({
  StaggerChildren: ({ children, ...props }: React.ComponentProps<"div">) => <div {...props}>{children}</div>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { ApproachSection } from "../approach-section";

describe("ApproachSection", () => {
  afterEach(cleanup);

  it("renders all three principles", () => {
    render(<ApproachSection />);
    expect(screen.getByText("Obsessively User-First")).toBeDefined();
    expect(screen.getByText("Ship It, Then Perfect It")).toBeDefined();
    expect(screen.getByText("Built to Last")).toBeDefined();
  });

  it("has an accessible section label", () => {
    render(<ApproachSection />);
    expect(screen.getByRole("region", { name: "How I Work" })).toBeDefined();
  });
});
