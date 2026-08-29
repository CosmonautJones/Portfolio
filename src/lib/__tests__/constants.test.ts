import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/lib/constants";

describe("PROJECTS", () => {
  it("every provided project image uses the local jpg path format", () => {
    for (const project of PROJECTS) {
      if (project.image) {
        expect(project.image).toMatch(/^\/projects\/.+\.jpg$/);
      }
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

  it("featured projects have a primary action", () => {
    const featured = PROJECTS.filter((p) => p.featured);
    expect(featured.length).toBeGreaterThan(0);
    for (const project of featured) {
      expect(
        project.demoUrl || project.liveUrl || project.githubUrl,
        `${project.title} is featured but has no action`
      ).toBeTruthy();
    }
  });

  it("features Vellum with its live tool and source links", () => {
    const vellum = PROJECTS.find((project) => project.title === "Vellum");
    expect(vellum).toMatchObject({
      featured: true,
      liveUrl: "https://vellum.tj-jones.chatgpt.site",
      githubUrl: "https://github.com/CosmonautJones/vellum",
      role: "Developer Tool",
    });
    expect(PROJECTS.filter((project) => project.featured).slice(0, 4)).toContain(vellum);
  });
});
