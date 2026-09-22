/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { Footer } from "../footer";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";

describe("Footer", () => {
  afterEach(cleanup);

  it("lists every page", () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    for (const link of NAV_LINKS) {
      expect(within(nav).getByRole("link", { name: link.label }).getAttribute("href")).toBe(link.href);
    }
  });

  it("labels social links and opens them safely", () => {
    render(<Footer />);
    for (const name of ["GitHub", "LinkedIn"]) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
  });

  it("shows role, location, and availability", () => {
    render(<Footer />);
    expect(screen.getByText(SITE_CONFIG.title)).toBeDefined();
    expect(screen.getByText(SITE_CONFIG.location)).toBeDefined();
    expect(screen.getByText(/open to roles/i)).toBeDefined();
    expect(screen.getByRole("link", { name: SITE_CONFIG.email }).getAttribute("href")).toBe(`mailto:${SITE_CONFIG.email}`);
  });
});
