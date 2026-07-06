/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";
import { validateContact } from "@/lib/contact";
import { ContactForm } from "../contact-form";

describe("ContactForm", () => {
  function submitButton() {
    return screen.getByRole("button", { name: /send the note/i });
  }

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders name, email, and message fields", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Message")).toBeDefined();
  });

  it("renders the send button", () => {
    const { container } = render(<ContactForm />);
    expect(submitButton()).toBeDefined();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
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
    fireEvent.submit(submitButton().closest("form")!);

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
    fireEvent.submit(submitButton().closest("form")!);

    expect(screen.getByLabelText("Email")).toHaveFocus();
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Email is required");
  });

  it("sends through the contact API when the form is valid", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Hello there, this is a long enough message." },
    });
    fireEvent.submit(submitButton().closest("form")!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/contact",
        expect.objectContaining({ method: "POST" })
      );
    });
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it("keeps failures in-page if the contact API is unavailable", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 503 }));
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Hello there, this is a long enough message." },
    });
    fireEvent.submit(submitButton().closest("form")!);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(
      "Message could not be sent.",
      expect.objectContaining({
        description: "The site email service is unavailable. Please copy the email address below.",
      })
    ));
    expect(open).not.toHaveBeenCalled();
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
