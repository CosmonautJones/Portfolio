/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";

// Mocked Supabase browser client — each test wires up the behaviour it needs.
const signInWithOAuth = vi.fn();
const createClient = vi.fn(() => ({ auth: { signInWithOAuth } }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => createClient(),
}));

import { LoginForm } from "../login-form";

function clickSignIn() {
  fireEvent.click(screen.getByRole("button", { name: /continue with github/i }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    signInWithOAuth.mockReset();
    createClient.mockReset();
    createClient.mockReturnValue({ auth: { signInWithOAuth } });
  });
  afterEach(cleanup);

  it("shows a surfaced error from a urlError prop", () => {
    render(<LoginForm urlError="Boom" />);
    expect(screen.getByText("Boom")).toBeDefined();
  });

  it("calls signInWithOAuth with a redirectTo pointing at /auth/confirm", async () => {
    signInWithOAuth.mockResolvedValue({ error: null });
    render(<LoginForm redirectTo="/tools" />);
    clickSignIn();

    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));
    const arg = signInWithOAuth.mock.calls[0][0];
    expect(arg.provider).toBe("github");
    expect(arg.options.redirectTo).toContain("/auth/confirm?redirectTo=");
    expect(arg.options.redirectTo).toContain(encodeURIComponent("/tools"));
  });

  it("surfaces a returned OAuth error and re-enables the button", async () => {
    signInWithOAuth.mockResolvedValue({ error: { message: "provider disabled" } });
    render(<LoginForm />);
    clickSignIn();

    await waitFor(() => expect(screen.getByText("provider disabled")).toBeDefined());
    expect(
      (screen.getByRole("button", { name: /continue with github/i }) as HTMLButtonElement)
        .disabled
    ).toBe(false);
  });

  it("shows a friendly message and resets the button when config is missing", async () => {
    // createClient throws synchronously when env vars are absent — this is the
    // original bug where the spinner stuck forever with no error shown.
    createClient.mockImplementation(() => {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables"
      );
    });
    render(<LoginForm />);
    clickSignIn();

    await waitFor(() =>
      expect(screen.getByText(/Login isn't configured yet/i)).toBeDefined()
    );
    expect(
      (screen.getByRole("button", { name: /continue with github/i }) as HTMLButtonElement)
        .disabled
    ).toBe(false);
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });
});
