/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { ContactForm } from "../contact-form";

describe("ContactForm", () => {
  afterEach(cleanup);

  it("renders name, email, and message fields", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Message")).toBeDefined();
  });

  it("renders the send button", () => {
    render(<ContactForm />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeDefined();
  });

  it("renders social links", () => {
    render(<ContactForm />);
    expect(screen.getByRole("link", { name: "GitHub" })).toBeDefined();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Twitter" })).toBeDefined();
  });
});
