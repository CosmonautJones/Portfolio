import { describe, it, expect, vi } from "vitest";
import {
  executeCommand,
  getCommand,
  getCommandsForTheme,
  getCommandNames,
} from "../commands";
import type { CommandContext } from "../types";

function makeCtx(theme: "main" | "retro" = "main"): CommandContext {
  return { theme, level: 3, title: "Adventurer" };
}

describe("executeCommand", () => {
  it("returns error for unknown command", () => {
    const result = executeCommand("nonexistent", [], makeCtx());
    expect(result.output[0].type).toBe("error");
    expect(result.output[0].content).toContain("Command not found");
  });

  describe("main theme commands", () => {
    it("help — lists commands without hidden ones", () => {
      const result = executeCommand("help", [], makeCtx());
      expect(result.output.length).toBeGreaterThan(0);
      const text = result.output.map((o) => o.content).join("\n");
      expect(text).toContain("help");
      expect(text).not.toContain("vaporwave");
    });

    it("about — includes site config info", () => {
      const result = executeCommand("about", [], makeCtx());
      expect(result.output[0].content).toContain("Travis");
    });

    it("skills — shows skill categories", () => {
      const result = executeCommand("skills", [], makeCtx());
      expect(result.output[0].content.length).toBeGreaterThan(0);
    });

    it("projects — lists projects", () => {
      const result = executeCommand("projects", [], makeCtx());
      expect(result.output.length).toBeGreaterThan(0);
    });

    it("fortune — returns a quote", () => {
      const result = executeCommand("fortune", [], makeCtx());
      expect(result.output[0].content.length).toBeGreaterThan(0);
    });

    it("sudo — returns humorous denial", () => {
      const result = executeCommand("sudo", ["rm", "-rf"], makeCtx());
      expect(result.output[0].type).toBe("error");
    });

    it("clear — sets clear flag", () => {
      const result = executeCommand("clear", [], makeCtx());
      expect(result.clear).toBe(true);
      expect(result.output).toEqual([]);
    });

    it("cowsay — wraps message in cow", () => {
      const result = executeCommand("cowsay", ["hello"], makeCtx());
      expect(result.output[0].content).toContain("hello");
      expect(result.output[0].content).toContain("\\");
    });

    it("cowsay — uses default message with no args", () => {
      const result = executeCommand("cowsay", [], makeCtx());
      expect(result.output[0].content).toContain("Moo");
    });

    it("neofetch — shows system info", () => {
      const result = executeCommand("neofetch", [], makeCtx());
      expect(result.output[0].content).toContain("TravisOS");
    });

    it("matrix — generates output", () => {
      const result = executeCommand("matrix", [], makeCtx());
      expect(result.output.length).toBe(3);
      expect(result.output[0].content).toContain("Matrix");
    });

    it("vaporwave — triggers discovery callback", () => {
      const ctx = makeCtx();
      ctx.onDiscover = vi.fn();
      executeCommand("vaporwave", [], ctx);
      expect(ctx.onDiscover).toHaveBeenCalledWith("vaporwave");
    });
  });

  describe("retro theme commands", () => {
    it("help — lists retro commands", () => {
      const result = executeCommand("help", [], makeCtx("retro"));
      const text = result.output.map((o) => o.content).join("\n");
      expect(text).toContain("whois");
    });

    it("whois — shows identity card", () => {
      const result = executeCommand("whois", [], makeCtx("retro"));
      expect(result.output[0].content).toContain("IDENTITY CARD");
    });

    it("ls — lists files", () => {
      const result = executeCommand("ls", [], makeCtx("retro"));
      expect(result.output[0].content).toContain("readme.txt");
    });

    it("cat readme.txt — shows readme content", () => {
      const result = executeCommand("cat", ["readme.txt"], makeCtx("retro"));
      expect(result.output[0].content).toContain("vault");
    });

    it("cat unknown — returns error", () => {
      const result = executeCommand("cat", ["unknown"], makeCtx("retro"));
      expect(result.output[0].type).toBe("error");
    });

    it("cat .hidden — returns hint", () => {
      const result = executeCommand("cat", [".hidden"], makeCtx("retro"));
      expect(result.output[0].content).toContain("empty");
    });

    it("main commands are not available in retro", () => {
      const result = executeCommand("neofetch", [], makeCtx("retro"));
      expect(result.output[0].type).toBe("error");
    });
  });
});

describe("getCommand", () => {
  it("returns command for valid name", () => {
    expect(getCommand("help", "main")).toBeDefined();
    expect(getCommand("help", "retro")).toBeDefined();
  });

  it("returns undefined for invalid name", () => {
    expect(getCommand("fake", "main")).toBeUndefined();
  });
});

describe("getCommandsForTheme", () => {
  it("returns different lists for main and retro", () => {
    const main = getCommandsForTheme("main");
    const retro = getCommandsForTheme("retro");
    expect(main.length).toBeGreaterThan(retro.length);
  });
});

describe("getCommandNames", () => {
  it("excludes hidden commands", () => {
    const names = getCommandNames("main");
    expect(names).not.toContain("vaporwave");
    expect(names).toContain("help");
  });
});
