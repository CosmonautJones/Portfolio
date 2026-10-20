/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { HeroSection } from "../hero-section";
import { PROOF_POINTS } from "@/lib/constants";

describe("HeroSection", () => {
  afterEach(cleanup);

  it("renders the hero with an accessible label", () => {
    render(<HeroSection />);
    expect(screen.getByRole("region", { name: "Hero" })).toBeDefined();
  });

  it("leads with the name and role instead of a greeting", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1, name: "Travis Jones" })).toBeDefined();
    expect(screen.getByText("Software Engineer | Legacy Modernization & Applied AI")).toBeDefined();
    expect(screen.queryByText(/Hi, I.m Travis/i)).toBeNull();
  });

  it("establishes current location without the old Texas address", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Ypsilanti, Michigan/i)).toBeDefined();
    expect(screen.queryByText(/Spring, TX/i)).toBeNull();
  });

  it("states what Travis builds in plain terms", () => {
    render(<HeroSection />);
    const lede = screen.getByTestId("hero-lede");
    expect(lede.textContent).toMatch(/I modernize manufacturing ERP/i);
    expect(lede.textContent).toMatch(/read-only COBOL knowledge access/i);
    expect(lede.textContent).toMatch(/UI and QR redemption/i);
    expect(lede.textContent).toMatch(/to M-Local/i);
  });

  it("renders CTA links", () => {
    render(<HeroSection />);
    expect(screen.getByRole("link", { name: /see the work/i }).getAttribute("href")).toBe("/work");
    expect(screen.getByRole("link", { name: "View resume" }).getAttribute("href")).toBe("/resume");
    expect(screen.getByRole("link", { name: /get in touch/i }).getAttribute("href")).toBe("/contact");
  });

  it("backs every claim in the lede with a numbered evidence row", () => {
    render(<HeroSection />);
    const list = screen.getByRole("list", { name: "Evidence" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(PROOF_POINTS.length);

    PROOF_POINTS.forEach((proof, index) => {
      const n = index + 1;
      const balloon = screen.getByRole("link", { name: `Evidence ${n}: ${proof.label}` });
      expect(balloon.getAttribute("href")).toBe(`#evidence-${n}`);
      expect(rows[index].id).toBe(`evidence-${n}`);
      expect(within(rows[index]).getByRole("link").getAttribute("href")).toBe(proof.href);
    });
  });

  it("links the evidence to experience and the verified project stories", () => {
    render(<HeroSection />);
    const hrefs = PROOF_POINTS.map((proof) => proof.href);
    expect(hrefs).toEqual(["/about#experience", "/work/mcp-cobol-bridge", "/work/m-local"]);
  });
});
