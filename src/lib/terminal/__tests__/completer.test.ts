import { describe, it, expect } from "vitest";
import { complete } from "../completer";

const COMMANDS = ["help", "about", "skills", "projects", "clear", "cowsay"];

describe("complete", () => {
  it("returns null for empty input", () => {
    expect(complete("", COMMANDS)).toEqual({
      completed: null,
      suggestions: [],
    });
  });

  it("completes unique prefix", () => {
    expect(complete("he", COMMANDS)).toEqual({
      completed: "help",
      suggestions: [],
    });
  });

  it("returns suggestions for ambiguous prefix", () => {
    const result = complete("c", COMMANDS);
    expect(result.completed).toBeNull();
    expect(result.suggestions).toContain("clear");
    expect(result.suggestions).toContain("cowsay");
  });

  it("returns nothing for no match", () => {
    expect(complete("xyz", COMMANDS)).toEqual({
      completed: null,
      suggestions: [],
    });
  });

  it("case-insensitive matching", () => {
    expect(complete("HE", COMMANDS)).toEqual({
      completed: "help",
      suggestions: [],
    });
  });
});
