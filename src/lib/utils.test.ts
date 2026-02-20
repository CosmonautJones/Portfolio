import { describe, it, expect, vi, beforeEach } from "vitest";
import { cn, isAdminEmail } from "./utils";

describe("cn utility", () => {
  it("merges multiple class strings", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
      "base active"
    );
  });

  it("resolves Tailwind conflicts by keeping the last class", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("resolves conflicting Tailwind text colors", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("handles undefined and null values gracefully", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });
});

describe("isAdminEmail", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true for exact match", () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    expect(isAdminEmail("admin@example.com")).toBe(true);
  });

  it("returns true for case-insensitive match", () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    expect(isAdminEmail("Admin@Example.COM")).toBe(true);
  });

  it("returns true when env is uppercase and input is lowercase", () => {
    vi.stubEnv("ADMIN_EMAIL", "ADMIN@EXAMPLE.COM");
    expect(isAdminEmail("admin@example.com")).toBe(true);
  });

  it("returns false for non-matching email", () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    expect(isAdminEmail("other@example.com")).toBe(false);
  });

  it("returns false when email is undefined", () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it("returns false when ADMIN_EMAIL is not set", () => {
    delete process.env.ADMIN_EMAIL;
    expect(isAdminEmail("admin@example.com")).toBe(false);
  });

  it("returns false when both are undefined/missing", () => {
    delete process.env.ADMIN_EMAIL;
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
