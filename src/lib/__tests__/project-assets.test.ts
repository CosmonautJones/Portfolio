import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { PROJECTS } from "@/lib/constants";

describe("portfolio artwork", () => {
  it("gives every project a unique local 16:9 image", async () => {
    const imagePaths = PROJECTS.map((project) => project.image);

    expect(imagePaths).toHaveLength(12);
    expect(new Set(imagePaths).size).toBe(imagePaths.length);

    for (const imagePath of imagePaths) {
      expect(imagePath).toMatch(/^\/projects\/.+\.jpg$/);

      const assetPath = path.join(process.cwd(), "public", imagePath);
      expect(existsSync(assetPath), `${imagePath} should exist`).toBe(true);

      const metadata = await sharp(assetPath).metadata();
      expect(metadata.width, `${imagePath} width`).toBe(1600);
      expect(metadata.height, `${imagePath} height`).toBe(900);
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
