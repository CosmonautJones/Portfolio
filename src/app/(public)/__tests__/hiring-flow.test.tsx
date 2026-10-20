/** @vitest-environment jsdom */
import React from "react";
import { expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
vi.mock("@/components/ui/animate-on-scroll", () => ({
  AnimateOnScroll: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
import HomePage from "../page";

it("puts real experience before three inspectable stories, then contact and optional exploration", () => {
  const { container } = render(<HomePage />);
  const sections = Array.from(container.querySelectorAll("section"));
  const experience = container.querySelector("#experience")!;
  const selected = container.querySelector("#selected-work")!;
  expect(sections.indexOf(experience)).toBeLessThan(sections.indexOf(selected));
  expect(experience.textContent).toContain("Sep 2018 - Sep 2026");
  expect(within(selected as HTMLElement).getAllByRole("heading", { level: 3 }).map(h => h.textContent)).toEqual(["M-Local", "MCP-to-COBOL bridge", "TravOS"]);
  expect(selected.querySelector("details")).toBeNull();
  for (const article of selected.querySelectorAll("article")) {
    for (const label of ["Problem", "My role", "Evidence", "Scope"]) {
      expect(within(article).getByText(label)).toBeDefined();
    }
  }
  expect(screen.queryByRole("heading", { name: "A year of building." })).toBeNull();
  expect(screen.getByRole("link", { name: "Activity atlas" }).getAttribute("href")).toBe("/work#activity");
  const contactSection = screen.getByRole("heading", { name: /Hiring for software engineering/ }).closest("section")!;
  const moreSection = screen.getByRole("heading", { name: "More to explore" }).closest("section")!;
  expect(sections.indexOf(contactSection)).toBeLessThan(sections.indexOf(moreSection));
});
