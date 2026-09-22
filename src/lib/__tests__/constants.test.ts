import { describe, expect, it } from "vitest";
import { NAV_LINKS, PROJECTS, PROOF_POINTS, SITE_CONFIG } from "@/lib/constants";

describe("SITE_CONFIG", () => {
  it("presents Travis as an AI engineer", () => {
    expect(SITE_CONFIG.title).toBe("AI Engineer");
  });

  it("keeps copy free of em dashes", () => {
    for (const value of Object.values(SITE_CONFIG)) {
      expect(value).not.toContain("—");
    }
  });
});

describe("PROOF_POINTS", () => {
  it("ties each hero claim to an internal page that backs it up", () => {
    expect(PROOF_POINTS.length).toBe(3);
    for (const proof of PROOF_POINTS) {
      expect(proof.claim.length).toBeGreaterThan(0);
      expect(proof.label.length).toBeGreaterThan(0);
      expect(proof.detail.length).toBeGreaterThan(0);
      expect(proof.linkLabel.length).toBeGreaterThan(0);
      expect(proof.href.startsWith("/")).toBe(true);
    }
  });
});

describe("NAV_LINKS", () => {
  it("labels the project catalog clearly without changing its route", () => {
    expect(NAV_LINKS).toContainEqual({ href: "/work", label: "Projects" });
  });
});

describe("PROJECTS", () => {
  it("every provided project image uses a local jpg or png path", () => {
    for (const project of PROJECTS) {
      if (project.image) {
        expect(project.image).toMatch(/^\/projects\/.+\.(jpg|png)$/);
      }
    }
  });

  it("offers a direct play link for the experimental Alcubemy sandbox", () => {
    const matches = PROJECTS.filter((project) => project.title === "Alcubemy");
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      liveUrl: "https://alcubemy.travisjohnjones.com/",
      githubUrl: "https://github.com/CosmonautJones/falling-sand",
      role: "Experimental sandbox",
      actionLabel: "Play Alcubemy",
    });
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
});
