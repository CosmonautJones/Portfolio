/** @vitest-environment jsdom */
import React, { forwardRef, createElement } from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

let reduced = false;

vi.mock("motion/react", () => {
  function createMotionComponent(tag: string) {
    return forwardRef(function MotionComponent(
      props: Record<string, unknown>,
      ref: React.Ref<HTMLElement>
    ) {
      // strip MotionValue-laden style; keep className/aria-*
      const rest: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (k !== "style") rest[k] = v;
      }
      return createElement(tag, { ...rest, ref });
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
    useScroll: () => ({ scrollYProgress: mv(0) }),
    useSpring: (v: unknown) => v,
  };
});

import { ScrollProgress } from "../scroll-progress";

describe("ScrollProgress", () => {
  beforeEach(() => {
    reduced = false;
  });
  afterEach(cleanup);

  it("renders a fixed progress bar with the accent gradient class", () => {
    const { container } = render(<ScrollProgress />);
    const bar = container.querySelector(".scroll-progress-fill");
    expect(bar).not.toBeNull();
    expect(bar?.className).toContain("fixed");
  });

  it("is decorative (aria-hidden)", () => {
    const { container } = render(<ScrollProgress />);
    const bar = container.querySelector(".scroll-progress-fill");
    expect(bar?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders under reduced motion", () => {
    reduced = true;
    const { container } = render(<ScrollProgress />);
    expect(container.querySelector(".scroll-progress-fill")).not.toBeNull();
  });
});
