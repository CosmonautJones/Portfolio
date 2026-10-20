/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { HeroSection } from "../hero-section";

describe("HeroSection", () => {
  afterEach(cleanup);

  it("makes role, production background, and location understandable on arrival", () => {
    render(<HeroSection />);
    expect(screen.getByRole("region", { name: "Hero" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 1, name: "Travis Jones" })).toBeDefined();
    expect(screen.getByText("Software Engineer | Legacy Modernization & Applied AI")).toBeDefined();
    expect(screen.getByText(/Ypsilanti, Michigan/i)).toBeDefined();
    const lede = screen.getByTestId("hero-lede");
    expect(lede.textContent).toMatch(/Eight years.*manufacturing ERP at Global Shop Solutions/);
    expect(lede.textContent).toMatch(/strongest production work is in COBOL and VB.NET/);
  });

  it("offers the exact PDF and email directly, without an intermediate page", () => {
    render(<HeroSection />);
    const resume = screen.getByRole("link", { name: "Download resume PDF" });
    expect(resume.getAttribute("href")).toBe("/resume/Travis-Jones-Resume.pdf");
    expect(resume.hasAttribute("download")).toBe(true);
    expect(screen.getByRole("link", { name: "Email me" }).getAttribute("href")).toBe("mailto:travisjohn.jones@gmail.com");
    expect(screen.getByRole("link", { name: "Selected work" }).getAttribute("href")).toBe("#selected-work");
  });
});
