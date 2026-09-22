/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

const toastError = vi.fn();
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => toastError(...args) } }));

import { ContactBand } from "../contact-band";
import { SITE_CONFIG } from "@/lib/constants";

describe("ContactBand", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    toastError.mockReset();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  });
  afterEach(cleanup);

  it("gives hiring readers a direct email link and the resume", () => {
    render(<ContactBand />);
    expect(screen.getByRole("heading", { level: 2 })).toBeDefined();
    const email = screen.getByRole("link", { name: SITE_CONFIG.email });
    expect(email.getAttribute("href")).toBe(`mailto:${SITE_CONFIG.email}`);
    expect(screen.getByRole("link", { name: /resume/i }).getAttribute("href")).toBe("/resume");
  });

  it("copies the email address and confirms it", async () => {
    writeText.mockResolvedValue(undefined);
    render(<ContactBand />);
    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SITE_CONFIG.email));
    expect(await screen.findByRole("button", { name: "Email address copied" })).toBeDefined();
  });

  it("explains a failed copy instead of failing silently", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    render(<ContactBand />);
    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }));
    await waitFor(() => expect(toastError).toHaveBeenCalled());
  });
});
