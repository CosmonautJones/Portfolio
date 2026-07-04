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

    const name = screen.getByLabelText("Name");
    const email = screen.getByLabelText("Email");
    const message = screen.getByLabelText("Message");

    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
    expect(screen.getByText("Message must be at least 10 characters")).toBeDefined();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(message).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Name is required");
    expect(email).toHaveAccessibleDescription("Email is required");
    expect(message).toHaveAccessibleDescription("Message must be at least 10 characters");
    expect(name).toHaveFocus();
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it("moves focus to the first invalid field in form order", () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    expect(screen.getByLabelText("Email")).toHaveFocus();
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Email is required");
  });

  it("opens a prefilled mailto link when the form is valid", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Hello there, this is a long enough message." },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    expect(open).toHaveBeenCalledTimes(1);
    expect(String(open.mock.calls[0][0])).toMatch(/^mailto:/);
    open.mockRestore();
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
