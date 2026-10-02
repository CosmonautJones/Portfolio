/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Experience } from "./experience";
import { connections, driftingPosition, modes, position, projects } from "./graph";

vi.mock("./atmosphere", () => ({ Atmosphere: () => null }));
let reduced = false;
let frames = new Map<number, FrameRequestCallback>();
beforeEach(() => {
  reduced = false;
  frames = new Map();
  let id = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++id, callback); return id; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: reduced && query.includes("reduced-motion"), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function tick(now: number) {
  act(() => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback(now)); });
}

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

  it("moves nodes while keeping edges attached and freezes motion on pause", () => {
    const { container } = render(<Experience />);
    tick(1000); tick(1050); tick(1100);
    const nodes = container.querySelectorAll<HTMLElement>(".cosmic-node");
    const connection = container.querySelector<SVGGElement>(".cosmic-connection")!;
    const line = connection.querySelector("line")!;
    expect(Number(line.getAttribute("x1"))).toBeCloseTo(parseFloat(nodes[Number(connection.dataset.from)].style.left));
    expect(Number(line.getAttribute("y2"))).toBeCloseTo(parseFloat(nodes[Number(connection.dataset.to)].style.top));
    const previous = nodes[0].style.left;
    tick(1150);
    expect(nodes[0].style.left).not.toBe(previous);
    fireEvent.click(screen.getByRole("button", { name: "Pause motion" }));
    tick(1200);
    const frozen = nodes[0].style.left;
    expect(frames.size).toBe(0);
    tick(1250);
    expect(nodes[0].style.left).toBe(frozen);
    fireEvent.click(screen.getByRole("button", { name: "Resume motion" }));
    tick(1300); tick(1350);
    expect(frames.size).toBe(1);
    expect(nodes[0].style.left).not.toBe(frozen);
    cleanup(); expect(frames.size).toBe(0);
  });

  it("renders static positions and schedules no animation under reduced motion", () => {
    reduced = true;
    const { container } = render(<Experience />);
    tick(1000);
    expect(frames.size).toBe(0);
    expect(parseFloat(container.querySelector<HTMLElement>(".cosmic-node")!.style.left)).toBe(position(0, "COSMOS").x);
  });

  it("keeps drift bounded over time in both graph modes", () => {
    for (const mode of ["JAC", "COSMOS"] as const) {
      projects.forEach((_, index) => {
        for (const seconds of [0, 5, 30, 300]) {
          const point = driftingPosition(index, mode, seconds);
          expect(point.x).toBeGreaterThan(0); expect(point.x).toBeLessThan(100);
          expect(point.y).toBeGreaterThan(0); expect(point.y).toBeLessThan(100);
        }
        expect(driftingPosition(index, mode, 0)).not.toEqual(driftingPosition(index, mode, 30));
      });
    }
  });
});
