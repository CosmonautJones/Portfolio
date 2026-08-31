/** @vitest-environment jsdom */
import React from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

vi.mock("@/components/ui/stagger-children", () => ({
  StaggerChildren: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { ExperienceTimeline } from "../experience-timeline";

describe("ExperienceTimeline", () => {
  afterEach(cleanup);

  it("anchors the career story in resume-verified roles and dates", () => {
    render(<ExperienceTimeline />);

    expect(screen.getByRole("heading", { name: /^software engineer$/i })).toBeDefined();
    expect(screen.getByText(/^global shop solutions$/i)).toBeDefined();
    expect(screen.getByText(/^sep 2018 - aug 2026$/i).tagName).toBe("TIME");
    expect(screen.getByRole("heading", { name: /software engineering program/i })).toBeDefined();
    expect(screen.getByText(/^lambda academy of computer science$/i)).toBeDefined();
    expect(screen.getByRole("heading", { name: /technical supervisor/i })).toBeDefined();
    expect(screen.getByText(/^buzzles concessions$/i)).toBeDefined();
    expect(screen.queryByText(/junior developer|first line of code|mern/i)).toBeNull();
  });

  it("makes the eight-year enterprise chapter concrete and scannable", () => {
    render(<ExperienceTimeline />);

    expect(screen.getByText(/^8 years$/i)).toBeDefined();

    const timeline = screen.getByRole("list", { name: /career experience/i });
    expect(timeline.querySelectorAll(":scope > li")).toHaveLength(3);
    expect(timeline.querySelectorAll("time")).toHaveLength(3);

    const globalShopEntry = screen.getByRole("heading", { name: /^software engineer$/i }).closest("li");
    expect(globalShopEntry).not.toBeNull();
    const entry = within(globalShopEntry!);
    expect(entry.getByText(/manufacturing and erp workflows/i)).toBeDefined();
    expect(entry.getByText(/cobol and vb\.net.*c#\/.net/i)).toBeDefined();
    expect(entry.getByText(/production troubleshooting.*regression/i)).toBeDefined();
    expect(entry.getByText(/model context protocol.*knowledge-search/i)).toBeDefined();
  });
});
