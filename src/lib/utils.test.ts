import { describe, it, expect } from "vitest";
import { cn } from "./utils";

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
