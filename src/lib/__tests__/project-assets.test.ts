import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { PROJECTS } from "@/lib/constants";

describe("portfolio artwork", () => {
  it("features LoopedIn instead of the dead Plan'd demo", () => {
    const loopedIn = PROJECTS.find((project) => project.title === "LoopedIn");

    expect(loopedIn).toMatchObject({
      image: "/projects/loopedin.jpg",
      liveUrl: "https://loopedin-family.netlify.app",
      githubUrl: "https://github.com/CosmonautJones/family-loop",
      role: "Full-Stack Product",
    });
    expect(loopedIn?.proof).toContain("Hosted beta");
    expect(loopedIn?.proof).toContain("no guest demo");
    expect(PROJECTS.some((project) => project.title === "Plan'd")).toBe(false);
  });

  it("names the upgraded demos after their actual experiences", () => {
    expect(PROJECTS.map((project) => project.title)).toEqual(
      expect.arrayContaining([
        "Pixel Workshop",
        "Release Signal",
        "The Cosmonaut’s Bar",
      ])
    );
  });

  it("validates supplied artwork and permits intentional text covers", async () => {
    const missionControl = PROJECTS.find((project) => project.title === "Mission Control");
    expect(missionControl?.image).toBe("/projects/mission-control.jpg");

    const pad7 = PROJECTS.find((project) => project.title === "PAD-7 Firing Room");
    expect(pad7).toMatchObject({
      image: "/projects/pad-7.jpg",
      liveUrl: "/pad-7/PAD-7.html",
      githubUrl: "https://github.com/CosmonautJones/pad-7-firing-room",
      featured: false,
      role: "Simulation",
    });
    expect(existsSync(path.join(process.cwd(), "public", "pad-7", "PAD-7.html"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public", "pad-7", "desk.js"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public", "pad-7", "physics.js"))).toBe(true);

    const quantumForge = PROJECTS.find((project) => project.title === "Quantum Forge");
    expect(quantumForge).toMatchObject({
      image: "/projects/quantum-forge.jpg",
      liveUrl: "/quantum-forge/index.html",
      caseStudyUrl: "/work/quantum-forge",
      playground: true,
      featured: false,
      actionLabel: "Play Quantum Forge",
    });
    expect(existsSync(path.join(process.cwd(), "public", "quantum-forge", "index.html"))).toBe(true);
    for (const shot of ["foam", "confinement", "first-light", "star", "web"]) {
      expect(existsSync(path.join(process.cwd(), "public", "projects", `quantum-forge-${shot}.jpg`))).toBe(true);
    }

    // Every build the site hosts shows its version, and the card's version matches the copy actually shipped.
    for (const project of PROJECTS.filter((item) => item.liveUrl?.startsWith("/"))) {
      expect(project.version, `${project.title} needs a version`).toMatch(/^\d+\.\d+\.\d+$/);
      const entry = path.join(process.cwd(), "public", project.liveUrl!);
      const dir = path.dirname(entry);
      const versionFile = path.join(dir, "js", "version.js");
      const shipped = readFileSync(entry, "utf8") + (existsSync(versionFile) ? readFileSync(versionFile, "utf8") : "");
      expect(shipped.includes(`v${project.version}`) || shipped.includes(`REV ${project.version}`) || shipped.includes(`VERSION = '${project.version}'`),
        `${project.liveUrl} should show version ${project.version}`).toBe(true);
    }

    const starwake = PROJECTS.find((project) => project.title === "Starwake");
    expect(starwake).toMatchObject({
      image: "/projects/starwake.jpg",
      liveUrl: "/starwake/index.html",
      githubUrl: "https://github.com/CosmonautJones/starwake",
      caseStudyUrl: "/work/starwake",
      playground: true,
      featured: false,
      actionLabel: "Play Starwake",
    });
    expect(existsSync(path.join(process.cwd(), "public", "starwake", "index.html"))).toBe(true);
    for (const shot of ["title", "forks", "medals", "battle", "hangar"]) {
      expect(existsSync(path.join(process.cwd(), "public", "projects", `starwake-${shot}.jpg`))).toBe(true);
    }

    const imagePaths = PROJECTS.map((project) => project.image);
    expect(imagePaths).toHaveLength(21);

    const presentPaths = imagePaths.filter((imagePath) => imagePath !== "");
    expect(new Set(presentPaths).size).toBe(presentPaths.length);

    for (const imagePath of presentPaths) {
      expect(imagePath).toMatch(/^\/projects\/.+\.(jpg|png)$/);

      const assetPath = path.join(process.cwd(), "public", imagePath);
      expect(existsSync(assetPath), `${imagePath} should exist`).toBe(true);

      const metadata = await sharp(assetPath).metadata();
      // Keep genuine application captures at their original dimensions.
      if (["/projects/m-local.png", "/projects/tablesense.jpg"].includes(imagePath)) {
        expect(metadata.width).toBeGreaterThan(0);
        expect(metadata.height).toBeGreaterThan(0);
        continue;
      }
      const [width, height] = [1600, 900];
      expect(metadata.width, `${imagePath} width`).toBe(width);
      expect(metadata.height, `${imagePath} height`).toBe(height);
    }
  });

  it("uses text covers for employer work and the local prototype instead of invented screenshots", () => {
    const featured = PROJECTS.filter((project) => project.featured);
    expect(featured.length).toBeGreaterThan(0);
    for (const project of featured) {
      if (["MCP-to-COBOL bridge", "TravOS"].includes(project.title)) {
        expect(project.image).toBe("");
        expect(project.caseStudyUrl).toBeTruthy();
      } else {
        expect(project.image, `${project.title} needs its real product image`).not.toBe("");
      }
    }
  });

  it("publishes the personal Travis Jones icon set", () => {
    expect(existsSync(path.join(process.cwd(), "src", "app", "icon.svg"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "src", "app", "apple-icon.png"))).toBe(true);

    expect(manifest().icons).toEqual([
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ]);
  });
});
