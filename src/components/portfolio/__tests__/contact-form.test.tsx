/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { ContactForm, validateContact } from "../contact-form";

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

  it("shows validation errors on empty submit and does not open the mail client", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
    expect(screen.getByText("Message must be at least 10 characters")).toBeDefined();
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it("opens a prefilled mailto link when the form is valid", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    // Control the clock so the submit clears the anti-bot timing guard.
    const now = vi.spyOn(Date, "now").mockReturnValue(0);
    render(<ContactForm />); // mountedAt captured as 0

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Hello there, this is a long enough message." },
    });
    now.mockReturnValue(5000); // well past MIN_FILL_MS
    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    expect(open).toHaveBeenCalledTimes(1);
    expect(String(open.mock.calls[0][0])).toMatch(/^mailto:/);
    open.mockRestore();
    now.mockRestore();
  });

  it("blocks an instant submit as likely-bot and does not open the mail client", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const now = vi.spyOn(Date, "now").mockReturnValue(0);
    render(<ContactForm />); // mountedAt = 0

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Hello there, this is a long enough message." },
    });
    now.mockReturnValue(200); // faster than MIN_FILL_MS (1500ms)
    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
    now.mockRestore();
  });

  it("includes a hidden honeypot field for spam protection", () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector<HTMLInputElement>("#website");
    expect(honeypot).not.toBeNull();
    expect(honeypot!.tabIndex).toBe(-1);
    // Parent wrapper is visually hidden from users + assistive tech
    const wrapper = honeypot!.closest("[aria-hidden='true']");
    expect(wrapper).not.toBeNull();
  });
});

describe("validateContact", () => {
  it("passes a fully valid payload", () => {
    expect(
      validateContact({ name: "Ada", email: "ada@x.com", message: "1234567890" })
    ).toEqual({});
  });

  it("flags missing name, missing/invalid email, and short message", () => {
    expect(validateContact({ name: " ", email: "", message: "short" })).toEqual({
      name: "Name is required",
      email: "Email is required",
      message: "Message must be at least 10 characters",
    });
    expect(validateContact({ name: "A", email: "nope", message: "1234567890" }).email).toBe(
      "Please enter a valid email"
    );
  });
});
