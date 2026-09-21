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

import { WhatIDo } from "../what-i-do";

describe("WhatIDo", () => {
  afterEach(cleanup);

  it("renders all three cards with titles", () => {
    render(<WhatIDo />);
    expect(screen.getByText("Modernizing established systems")).toBeDefined();
    expect(screen.getByText("Making knowledge accessible")).toBeDefined();
    expect(screen.getByText("Helping people use AI")).toBeDefined();
  });

  it("has an accessible section label", () => {
    render(<WhatIDo />);
    expect(screen.getByRole("region", { name: "What I bring to a team" })).toBeDefined();
  });
});
