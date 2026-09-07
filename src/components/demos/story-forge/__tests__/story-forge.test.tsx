/** @vitest-environment jsdom */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("../story-forge.css", () => ({}));

import { StoryForge } from "../story-forge";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({
      matches: true,
      media: "",
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }),
  });
});

describe("StoryForge", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("renders the landing screen and opens setup", () => {
    render(<StoryForge />);
    expect(screen.getByRole("heading", { name: /cosmonaut story forge/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /start a story/i }));
    expect(screen.getByRole("heading", { name: /who is telling/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /roll the dice/i }));
    expect(screen.getByRole("button", { name: /start turn/i })).toBeTruthy();
  });
});
