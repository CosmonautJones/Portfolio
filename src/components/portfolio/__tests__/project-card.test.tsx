/** @vitest-environment jsdom */
import React, { forwardRef, createElement } from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { Project } from "@/lib/types";

const MOTION_PROPS = new Set([
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "whileHover",
  "whileTap",
  "whileInView",
]);

let reduced = false;

vi.mock("motion/react", () => {
  function createMotionComponent(tag: string) {
    return forwardRef(function MotionComponent(
      props: Record<string, unknown>,
      ref: React.Ref<HTMLElement>
    ) {
      const filtered: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (!MOTION_PROPS.has(k)) filtered[k] = v;
      }
      if (filtered.style && typeof filtered.style === "object") {
        filtered.style = {};
      }
      return createElement(tag, { ...filtered, ref });
    });
  }
  const m = new Proxy(
    {},
    { get: (_t, prop: string) => createMotionComponent(prop) }
  );
  const mv = (v: number) => ({ get: () => v, set: vi.fn() });
  return {
    m,
    useReducedMotion: () => reduced,
    useMotionValue: (v: number) => mv(v),
    useSpring: (v: unknown) => v,
    useTransform: () => mv(0),
  };
});

// next/image renders fine in jsdom but emit a plain img to keep it simple
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) =>
    createElement("img", { alt: props.alt as string, className: props.className as string }),
}));

import { ProjectCard } from "../project-card";

const baseProject: Project = {
  title: "Test Project",
  description: "A test project description.",
  role: "Builder",
  tags: ["React", "TypeScript"],
  image: "/test.png",
  featured: false,
  proof: "A working proof point.",
  actionLabel: "Try it",
};

describe("ProjectCard", () => {
  beforeEach(() => {
    reduced = false;
  });
  afterEach(cleanup);

  it("renders title, description, role and tags", () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText("Test Project")).toBeDefined();
    expect(screen.getByText("A test project description.")).toBeDefined();
    expect(screen.getByText("Builder")).toBeDefined();
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("A working proof point.")).toBeDefined();
  });

  it("applies hover zoom class to the image", () => {
    const { container } = render(<ProjectCard project={baseProject} />);
    const img = container.querySelector("img");
    expect(img?.className).toContain("group-hover:scale-105");
  });

  it("handles pointer interactions without crashing", () => {
    const { container } = render(<ProjectCard project={baseProject} />);
    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.pointerMove(wrapper, { clientX: 10, clientY: 10 });
    fireEvent.pointerLeave(wrapper);
    expect(wrapper).toBeDefined();
  });

  it("renders without image using the gradient fallback", () => {
    const noImage: Project = { ...baseProject, image: "" };
    const { container } = render(<ProjectCard project={noImage} />);
    expect(container.querySelector(".project-gradient-1, .project-gradient-2")).not.toBeNull();
  });

  it("still renders under reduced motion", () => {
    reduced = true;
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText("Test Project")).toBeDefined();
  });
});
