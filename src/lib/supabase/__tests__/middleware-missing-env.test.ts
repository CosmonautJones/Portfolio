import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const createServerClient = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => createServerClient(...args),
}));

import { updateSession } from "../middleware";

const req = (path: string) => new NextRequest(new URL(path, "https://preview.example"));

describe("updateSession without Supabase env", () => {
  beforeEach(() => {
    createServerClient.mockReset();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("lets /login render instead of throwing", async () => {
    const res = await updateSession(req("/login"));
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it.each(["/tools", "/admin", "/admin/tools"])("still redirects %s to /login", async (path) => {
    const res = await updateSession(req(path));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("redirectTo")).toBe(path);
    expect(createServerClient).not.toHaveBeenCalled();
  });
});
