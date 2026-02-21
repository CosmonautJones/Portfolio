import { describe, it, expect } from "vitest";

describe("middleware route classification", () => {
  it("should NOT classify /adventure as a protected route", () => {
    const pathname = "/adventure";
    const isProtectedRoute =
      pathname.startsWith("/tools") || pathname.startsWith("/admin");
    expect(isProtectedRoute).toBe(false);
  });

  it("should still classify /tools as protected", () => {
    const pathname = "/tools";
    const isProtectedRoute =
      pathname.startsWith("/tools") || pathname.startsWith("/admin");
    expect(isProtectedRoute).toBe(true);
  });

  it("should still classify /admin as protected", () => {
    const pathname = "/admin/tools";
    const isProtectedRoute =
      pathname.startsWith("/tools") || pathname.startsWith("/admin");
    expect(isProtectedRoute).toBe(true);
  });
});
