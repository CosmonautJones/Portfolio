/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

vi.mock("motion/react", () => ({ useReducedMotion: () => true }));

import { SkywatchGlint } from "../skywatch-glint";

describe("SkywatchGlint", () => {
  afterEach(cleanup);

  it("renders the same button for reduced-motion visitors so hydration matches the server", () => {
    render(<SkywatchGlint />);
    expect(screen.getByRole("button", { name: "Skywatch note" })).toBeDefined();
  });

  it("reveals the log line when clicked", () => {
    render(<SkywatchGlint />);
    fireEvent.click(screen.getByRole("button", { name: "Skywatch note" }));
    expect(screen.getByText(/Skywatch log/)).toBeDefined();
  });
});
