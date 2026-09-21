/** @vitest-environment jsdom */
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import ResumePage from "../page";
afterEach(cleanup);
it("provides a readable public resume with a direct PDF download", () => {
  render(<ResumePage />);
  expect(screen.getByRole("heading", { name: "Resume", level: 1 })).toBeDefined();
  expect(screen.getByRole("link", { name: "Download resume PDF" }).getAttribute("href")).toBe("/resume/Travis-Jones-Resume.pdf");
  expect(screen.getByRole("heading", { name: /Global Shop Solutions.*Software Engineer/ })).toBeDefined();
  expect(screen.getByText(/read-only and added filters/)).toBeDefined();
});
