import { describe, it, expect } from "vitest";
import { parseInput } from "../parser";

describe("parseInput", () => {
  it("returns empty for blank input", () => {
    expect(parseInput("")).toEqual({ command: "", args: [] });
    expect(parseInput("   ")).toEqual({ command: "", args: [] });
  });

  it("parses single command", () => {
    expect(parseInput("help")).toEqual({ command: "help", args: [] });
  });

  it("lowercases command", () => {
    expect(parseInput("HELP")).toEqual({ command: "help", args: [] });
  });

  it("parses command with args", () => {
    expect(parseInput("cowsay hello world")).toEqual({
      command: "cowsay",
      args: ["hello", "world"],
    });
  });

  it("handles quoted strings", () => {
    expect(parseInput('cowsay "hello world"')).toEqual({
      command: "cowsay",
      args: ["hello world"],
    });
  });

  it("handles single-quoted strings", () => {
    expect(parseInput("cowsay 'hello world'")).toEqual({
      command: "cowsay",
      args: ["hello world"],
    });
  });

  it("handles multiple spaces", () => {
    expect(parseInput("sudo   rm   -rf")).toEqual({
      command: "sudo",
      args: ["rm", "-rf"],
    });
  });

  it("trims whitespace", () => {
    expect(parseInput("  help  ")).toEqual({ command: "help", args: [] });
  });
});
