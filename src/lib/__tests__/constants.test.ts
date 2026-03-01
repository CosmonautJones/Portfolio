import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/lib/constants";

describe("PROJECTS", () => {
  it("every project has a non-empty image path", () => {
    for (const project of PROJECTS) {
      expect(project.image, `${project.title} is missing an image`).toBeTruthy();
      expect(project.image).toMatch(/^\/projects\/.+\.jpg$/);
    }
  });

  it("every project has required fields", () => {
    for (const project of PROJECTS) {
      expect(project.title).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(project.tags.length).toBeGreaterThan(0);
      expect(project.role).toBeTruthy();
    }
  });

  it("featured projects have a demoUrl", () => {
    const featured = PROJECTS.filter((p) => p.featured);
    expect(featured.length).toBeGreaterThan(0);
    for (const project of featured) {
      expect(project.demoUrl, `${project.title} is featured but has no demoUrl`).toBeTruthy();
    }
  });
});
