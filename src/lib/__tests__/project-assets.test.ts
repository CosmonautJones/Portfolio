import { existsSync } from "node:fs";
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
      role: "Full-Stack Product",
    });
    // Private-source honesty: no public githubUrl for LoopedIn.
    expect(loopedIn?.githubUrl).toBeUndefined();
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
      featured: true,
      role: "Simulation",
    });
    expect(existsSync(path.join(process.cwd(), "public", "pad-7", "PAD-7.html"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public", "pad-7", "desk.js"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public", "pad-7", "physics.js"))).toBe(true);

    const imagePaths = PROJECTS.map((project) => project.image);
    expect(imagePaths).toHaveLength(16);

    const presentPaths = imagePaths.filter((imagePath) => imagePath !== "");
    expect(new Set(presentPaths).size).toBe(presentPaths.length);

    for (const imagePath of presentPaths) {
      expect(imagePath).toMatch(/^\/projects\/.+\.(jpg|png)$/);

      const assetPath = path.join(process.cwd(), "public", imagePath);
      expect(existsSync(assetPath), `${imagePath} should exist`).toBe(true);

      const metadata = await sharp(assetPath).metadata();
      // Alcubemy uses its original share card; keep the actual renderer artwork intact.
      const [width, height] = imagePath === "/projects/alcubemy.png" ? [1200, 630] : [1600, 900];
      expect(metadata.width, `${imagePath} width`).toBe(width);
      expect(metadata.height, `${imagePath} height`).toBe(height);
    }
  });

  it("leads every featured project with a real product image instead of a placeholder", () => {
    const featured = PROJECTS.filter((project) => project.featured);
    expect(featured.length).toBeGreaterThan(0);
    for (const project of featured) {
      expect(project.image, `${project.title} needs a product image`).not.toBe("");
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
