/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PROJECTS } from "@/lib/constants";
import QuantumForgePage from "../page";

describe("Quantum Forge case study", () => {
  it("leads with the playable build and shows every chapter capture", () => {
    render(<QuantumForgePage />);
    const play = screen.getByRole("link", { name: "Play Quantum Forge" });
    expect(play.getAttribute("href")).toBe("/quantum-forge/index.html");
    expect(screen.queryByRole("link", { name: "Install notes" })).toBeNull();
    expect(screen.getAllByRole("img")).toHaveLength(6);
    expect(screen.getByText(/7.65 MeV Hoyle state/)).toBeDefined();
  });

  it("matches the project card and ships a self-contained game", () => {
    const project = PROJECTS.find((item) => item.title === "Quantum Forge");
    expect(project?.liveUrl).toBe("/quantum-forge/index.html");
    const html = readFileSync(path.join(process.cwd(), "public", "quantum-forge", "index.html"), "utf8");
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<title>Quantum Forge</title>");
    // Only Google Fonts may load from outside; the site CSP allows nothing else.
    const external = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => new URL(m[1]).host);
    expect(external.every((host) => ["fonts.googleapis.com", "fonts.gstatic.com", "github.com", "travisjohnjones.com"].includes(host))).toBe(true);
    expect(html).not.toMatch(/<script[^>]+src=/);
  });
});
