/** @vitest-environment jsdom */
import React, { forwardRef, createElement } from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

// The server renders with useReducedMotion() === null. If the client renders
// different markup when it returns true, React keeps the server's inline
// `opacity: 0` and the content stays invisible. These tests pin the invariant:
// the reduced-motion preference must never change the rendered markup.

let reduced: boolean | null = null;

vi.mock("motion/react", () => {
  const MOTION_PROPS = new Set(["initial", "animate", "exit", "transition", "variants"]);
  function createMotionComponent(tag: string) {
    return forwardRef(function MotionComponent(
      props: Record<string, unknown>,
      ref: React.Ref<HTMLElement>
    ) {
      const filtered: Record<string, unknown> = { "data-motion": tag };
      for (const [k, v] of Object.entries(props)) {
        if (!MOTION_PROPS.has(k)) filtered[k] = v;
      }
      return createElement(tag, { ...filtered, ref });
    });
  }
  return {
    m: new Proxy({}, { get: (_t, prop: string) => createMotionComponent(prop) }),
    useInView: () => false,
    useReducedMotion: () => reduced,
  };
});

import { AnimateOnScroll } from "../animate-on-scroll";
import { StaggerChildren, StaggerItem } from "../stagger-children";

function markupWith(pref: boolean | null, ui: React.ReactElement) {
  reduced = pref;
  const { container, unmount } = render(ui);
  const html = container.innerHTML;
  unmount();
  return html;
}

describe("motion wrappers are hydration-safe", () => {
  beforeEach(() => {
    reduced = null;
  });
  afterEach(cleanup);

  it("AnimateOnScroll renders identical markup on the server and for reduced-motion clients", () => {
    const ui = (
      <AnimateOnScroll className="mt-4">
        <p>About me</p>
      </AnimateOnScroll>
    );
    const server = markupWith(null, ui);
    expect(markupWith(true, ui)).toBe(server);
    expect(markupWith(false, ui)).toBe(server);
  });

  it("StaggerChildren renders identical markup on the server and for reduced-motion clients", () => {
    const ui = (
      <StaggerChildren className="grid">
        <StaggerItem>
          <p>Card</p>
        </StaggerItem>
      </StaggerChildren>
    );
    const server = markupWith(null, ui);
    expect(markupWith(true, ui)).toBe(server);
    expect(markupWith(false, ui)).toBe(server);
  });

  it("still renders children", () => {
    reduced = true;
    const { getByText } = render(
      <AnimateOnScroll>
        <p>Visible content</p>
      </AnimateOnScroll>
    );
    expect(getByText("Visible content")).toBeDefined();
  });
});
