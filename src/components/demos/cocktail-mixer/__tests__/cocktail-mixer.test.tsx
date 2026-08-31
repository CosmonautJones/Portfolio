/** @vitest-environment jsdom */
import React, { forwardRef, createElement, Fragment } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CocktailMixer } from "../index";

// Mock visitor context
const mockAwardXP = vi.fn();
const mockTrackEvent = vi.fn();
const mockUnlockAchievement = vi.fn();

vi.mock("@/hooks/use-visitor", () => ({
  useVisitor: () => ({
    profile: null,
    awardXP: mockAwardXP,
    trackEvent: mockTrackEvent,
    unlockAchievement: mockUnlockAchievement,
    refreshProfile: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-easter-egg", () => ({
  useEasterEgg: () => ({
    discover: vi.fn(),
    isDiscovered: () => false,
  }),
}));

// Motion props to strip from rendered elements
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

// Mock motion/react to render children immediately without animation
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
      return createElement(tag, { ...filtered, ref });
    });
  }

  const motionProxy = new Proxy(
    {},
    {
      get(_target: Record<string, unknown>, prop: string) {
        return createMotionComponent(prop);
      },
    }
  );

  return {
    motion: motionProxy,
    useReducedMotion: () => false,
    AnimatePresence: ({
      children,
    }: {
      children: React.ReactNode;
    }) => createElement(Fragment, null, children),
  };
});

describe("CocktailMixer component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 6 cocktail cards on initial load", () => {
    render(<CocktailMixer />);

    expect(screen.getByText("Margarita")).toBeInTheDocument();
    expect(screen.getByText("Paloma")).toBeInTheDocument();
    expect(screen.getByText("Tequila Sunrise")).toBeInTheDocument();
    expect(screen.getByText("Whiskey Sour")).toBeInTheDocument();
    expect(screen.getByText("Old Fashioned")).toBeInTheDocument();
    expect(screen.getByText("Salty Dog")).toBeInTheDocument();
  });

  it("does not show The Cosmonaut initially", () => {
    render(<CocktailMixer />);
    expect(screen.queryByText("The Cosmonaut")).not.toBeInTheDocument();
  });

  it("navigates to recipe view on cocktail click", () => {
    render(<CocktailMixer />);

    const margaritaBtn = screen.getByRole("button", { name: /Margarita/i });
    fireEvent.click(margaritaBtn);

    expect(screen.getByText("Back to drinks")).toBeInTheDocument();
    expect(screen.getByText("Ingredients")).toBeInTheDocument();
  });

  it("navigates back to selection grid", () => {
    render(<CocktailMixer />);

    const margaritaBtn = screen.getByRole("button", { name: /Margarita/i });
    fireEvent.click(margaritaBtn);

    fireEvent.click(screen.getByText("Back to drinks"));

    expect(
      screen.getByRole("heading", { name: "The Cosmonaut’s Bar" })
    ).toBeInTheDocument();
  });

  it("frames the mixer as a personal bar and explains the unlock", () => {
    render(<CocktailMixer />);

    expect(
      screen.getByRole("heading", { name: "The Cosmonaut’s Bar" })
    ).toBeInTheDocument();
    expect(screen.getByText("0 of 6 mixed")).toBeInTheDocument();
    expect(
      screen.getByText(/Mix all six house drinks to unlock Travis's secret recipe/i)
    ).toBeInTheDocument();
  });

  it("shows saved progress toward the secret recipe", () => {
    localStorage.setItem(
      "cocktails_made",
      JSON.stringify(["Margarita", "Paloma", "Tequila Sunrise"])
    );

    render(<CocktailMixer />);

    expect(screen.getByText("3 of 6 mixed")).toBeInTheDocument();
  });

  it("shows method badge in recipe view", () => {
    render(<CocktailMixer />);

    const margaritaBtn = screen.getByRole("button", { name: /Margarita/i });
    fireEvent.click(margaritaBtn);

    expect(screen.getByText("shaken")).toBeInTheDocument();
  });
});
