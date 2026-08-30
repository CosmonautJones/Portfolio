/** @vitest-environment jsdom */
import React, { forwardRef, createElement } from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

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
      // motion style may contain MotionValue objects; strip to plain object
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

import { HeroSection } from "../hero-section";

describe("HeroSection", () => {
  beforeEach(() => {
    reduced = false;
  });
  afterEach(cleanup);

  it("renders the hero with an accessible label", () => {
    render(<HeroSection />);
    expect(screen.getByRole("region", { name: "Hero" })).toBeDefined();
  });

  it("renders CTA links", () => {
    render(<HeroSection />);
    expect(screen.getByText("See the Work")).toBeDefined();
    expect(screen.getByText("Get in Touch")).toBeDefined();
  });

  it("surfaces concrete proof paths from the hero", () => {
    render(<HeroSection />);
    expect(screen.getByText("Capture a fragment")).toBeDefined();
    expect(screen.getByText("Review an approval")).toBeDefined();
    expect(screen.getByText("Check the HUD")).toBeDefined();
  });

  it("renders a scroll cue chevron", () => {
    const { container } = render(<HeroSection />);
    // lucide ChevronDown renders an svg with class lucide-chevron-down
    expect(container.querySelector("svg.lucide-chevron-down")).not.toBeNull();
  });

  it("handles pointer move without crashing", () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector("section")!;
    fireEvent.pointerMove(section, { clientX: 100, clientY: 100 });
    fireEvent.pointerLeave(section);
    expect(section).toBeDefined();
  });

  it("renders a static scroll cue under reduced motion", () => {
    reduced = true;
    const { container } = render(<HeroSection />);
    expect(container.querySelector("svg.lucide-chevron-down")).not.toBeNull();
  });
});
