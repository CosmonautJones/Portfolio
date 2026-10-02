/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Experience } from "./experience";
import { connections, modes, position, projects } from "./graph";

vi.mock("./atmosphere", () => ({ Atmosphere: () => null }));
afterEach(cleanup);

describe("cosmic experience", () => {
  it("connects projects only through actual shared tags and keeps positions within the field", () => {
    projects.forEach((project, index) => {
      connections(index).forEach((edge) => {
        expect(edge.index).not.toBe(index);
        expect(edge.shared.length).toBeGreaterThan(0);
        edge.shared.forEach((tag) => expect(project.tags).toContain(tag));
        expect(connections(edge.index).some((back) => back.index === index)).toBe(true);
      });
      modes.forEach((mode) => {
        const point = position(index, mode);
        expect(point.x).toBeGreaterThan(0); expect(point.x).toBeLessThan(100);
        expect(point.y).toBeGreaterThan(0); expect(point.y).toBeLessThan(100);
      });
    });
  });

  it("preserves selected project across modes and exposes deconstruction and proof", () => {
    render(<Experience />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`02 / .*${projects[1].title}`) }));
    const panel = screen.getByRole("complementary");
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent(projects[1].title);
    fireEvent.click(screen.getByRole("button", { name: "COSMOS", exact: true }));
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent(projects[1].title);
    fireEvent.click(screen.getByRole("button", { name: "Proof", exact: true }));
    expect(within(panel).getByText(projects[1].proof || projects[1].description)).toBeInTheDocument();
    expect(within(panel).getAllByRole("link")[0]).toHaveAttribute("href", projects[1].demoUrl || projects[1].liveUrl || projects[1].githubUrl);
  });

  it("runs terminal commands, rejects invalid selection, and switches modes", () => {
    render(<Experience />);
    fireEvent.click(screen.getByRole("button", { name: "TERMINAL", exact: true }));
    const submit = (value: string) => {
      fireEvent.change(screen.getByLabelText("guest@cosmos:~$"), { target: { value } });
      fireEvent.click(screen.getByRole("button", { name: "Run", exact: true }));
    };
    submit("open 999"); expect(screen.getByRole("log")).toHaveTextContent("Use open <number>");
    submit("open 2"); expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(projects[1].title);
    submit("projects"); expect(screen.getByRole("log")).toHaveTextContent(projects[0].title);
    submit("clear"); expect(screen.getByRole("log")).toBeEmptyDOMElement();
    submit("mode jac"); expect(screen.getByRole("button", { name: "JAC", exact: true })).toHaveAttribute("aria-pressed", "true");
  });
});
