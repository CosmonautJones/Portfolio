import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const exchangeCodeForSession = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { exchangeCodeForSession } }),
}));

import { GET } from "../route";

const BASE = "https://example.com/auth/confirm";

function req(query: string) {
  return new NextRequest(`${BASE}${query}`);
}

function location(res: Response) {
  return new URL(res.headers.get("location")!);
}

describe("GET /auth/confirm", () => {
  beforeEach(() => exchangeCodeForSession.mockReset());

  it("redirects to the validated redirectTo on a successful exchange", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await GET(req("?code=abc&redirectTo=%2Ftools"));
    expect(location(res).pathname).toBe("/tools");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
  });

  it("falls back to /tools when redirectTo is an open-redirect attempt", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await GET(req("?code=abc&redirectTo=https://evil.com"));
    const loc = location(res);
    expect(loc.host).toBe("example.com");
    expect(loc.pathname).toBe("/tools");
  });

  it("surfaces a provider error without attempting an exchange", async () => {
    const res = await GET(
      req("?error=access_denied&error_description=User+denied")
    );
    const loc = location(res);
    expect(loc.pathname).toBe("/login");
    expect(loc.searchParams.get("error")).toBe("User denied");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("reports a missing authorization code", async () => {
    const res = await GET(req(""));
    const loc = location(res);
    expect(loc.pathname).toBe("/login");
    expect(loc.searchParams.get("error")).toBe("Missing authorization code");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("surfaces the exchange error message on failure", async () => {
    exchangeCodeForSession.mockResolvedValue({
      error: { message: "invalid request: code verifier missing" },
    });
    const res = await GET(req("?code=abc"));
    const loc = location(res);
    expect(loc.pathname).toBe("/login");
    expect(loc.searchParams.get("error")).toBe(
      "invalid request: code verifier missing"
    );
  });
});
