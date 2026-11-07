/** @vitest-environment jsdom */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PROJECTS } from "@/lib/constants";
import StarwakePage from "../page";

const GAME_DIR = path.join(process.cwd(), "public", "starwake");

describe("Starwake case study", () => {
  it("leads with the playable build and shows every capture", () => {
    render(<StarwakePage />);
    const play = screen.getByRole("link", { name: "Play Starwake" });
    expect(play.getAttribute("href")).toBe("/starwake/index.html");
    const code = screen.getByRole("link", { name: "Read code" });
    expect(code.getAttribute("href")).toBe("https://github.com/CosmonautJones/starwake");
    expect(screen.getAllByRole("img")).toHaveLength(6);
    expect(screen.getByText(/Rift Forks: rock spines/)).toBeDefined();
    expect(screen.getByText(/Supersonic in Corona Run/)).toBeDefined();
    expect(screen.getByText(/same browser/)).toBeDefined();
  });

  it("matches the project card and ships a complete, CSP-safe build", () => {
    const project = PROJECTS.find((item) => item.title === "Starwake");
    expect(project?.liveUrl).toBe("/starwake/index.html");

    const html = readFileSync(path.join(GAME_DIR, "index.html"), "utf8");
    expect(html).toContain("<title>Starwake</title>");
    // Only Google Fonts may load from outside; the site CSP allows nothing else.
    const external = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => new URL(m[1]).host);
    expect(external.every((host) => ["fonts.googleapis.com", "fonts.gstatic.com"].includes(host))).toBe(true);

    // The import map and entry module must resolve inside the shipped folder.
    expect(html).toContain('"three": "./vendor/three/three.module.js"');
    for (const file of [
      "js/main.js",
      "css/style.css",
      "css/career.css",
      "js/config.js",
      "js/flight/daily.js",
      "vendor/three/three.module.js",
      "vendor/three/three.core.js",
      "vendor/three/addons/postprocessing/UnrealBloomPass.js",
      "vendor/three/LICENSE",
    ]) {
      expect(existsSync(path.join(GAME_DIR, file)), `${file} should ship`).toBe(true);
    }
    // The relay server and dev tools stay in the repo, not on the site.
    expect(existsSync(path.join(GAME_DIR, "server"))).toBe(false);
    expect(existsSync(path.join(GAME_DIR, "tools"))).toBe(false);
  });
});
