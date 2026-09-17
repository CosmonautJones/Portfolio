/** @vitest-environment jsdom */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
vi.mock("@/components/ui/animate-on-scroll", () => ({
  AnimateOnScroll: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/ui/stagger-children", () => ({
  StaggerChildren: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/portfolio/project-card", () => ({
  ProjectCard: ({ project }: { project: { title: string } }) => <h2>{project.title}</h2>,
}));
import WorkPage from "../page";
describe("project discovery", () => {
  it("puts Alcubemy first in Playground and lists it only once", () => {
    render(<WorkPage />);
    const playground = screen.getByRole("region", { name: "Playground" });
    expect(within(playground).getAllByRole("heading")[0].textContent).toBe("Alcubemy");
    expect(screen.getAllByRole("heading", { name: "Alcubemy" })).toHaveLength(1);
  });
});
