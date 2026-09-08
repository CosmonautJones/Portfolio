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
    // Pack A hire-me: anonymized vendor label (not GSS / em dash).
    expect(screen.getByText(/^enterprise software vendor$/i)).toBeDefined();
    expect(screen.getByText(/^sep 2018 - aug 2026$/i).tagName).toBe("TIME");
    expect(screen.getByRole("heading", { name: /software engineering program/i })).toBeDefined();
    expect(screen.getByText(/^lambda academy of computer science$/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /technical supervisor/i })).toBeDefined();
    expect(screen.getByText(/^buzzles concessions$/i })).toBeDefined();
    expect(screen.queryByText(/junior developer|first line of code|mern/i)).toBeNull();
    expect(screen.queryByText(/global shop solutions/i)).toBeNull();
  });

  it("makes the eight-year enterprise chapter concrete and scannable", () => {
    render(<ExperienceTimeline />);

    expect(screen.getByText(/^8 years$/i)).toBeDefined();
    expect(screen.getByText(/^enterprise software$/i)).toBeDefined();
    expect(screen.getByText(/^full-stack product$/i)).toBeDefined();

    const timeline = screen.getByRole("list", { name: /career experience/i });
    expect(timeline.querySelectorAll(":scope > li")).toHaveLength(3);
    expect(timeline.querySelectorAll("time")).toHaveLength(3);

    const enterpriseEntry = screen.getByRole("heading", { name: /^software engineer$/i }).closest("li");
    expect(enterpriseEntry).not.toBeNull();
    const entry = within(enterpriseEntry!);
    expect(entry.getByText(/full-stack product and systems work/i)).toBeDefined();
    expect(entry.getByText(/legacy components into reusable, typed libraries/i)).toBeDefined();
    expect(entry.getByText(/production troubleshooting.*regression/i)).toBeDefined();
    expect(entry.getByText(/constrained ai coding workflows.*verification and human review/i)).toBeDefined();
    expect(entry.queryByText(/manufacturing and erp|cobol|model context protocol/i)).toBeNull();
  });
});
