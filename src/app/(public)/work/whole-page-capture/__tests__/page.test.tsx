/** @vitest-environment jsdom */
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import WholePageCapturePage from "../page";

describe("Whole Page Capture public install page", () => {
  afterEach(cleanup);

  it("offers the published installable ZIP and source without authentication", () => {
    render(<WholePageCapturePage />);
    expect(screen.getByRole("link", { name: "Download extension" }).getAttribute("href"))
      .toBe("/downloads/whole-page-capture-v1.0.0.zip");
    expect(screen.getByRole("link", { name: "Also available on GitHub" }).getAttribute("href"))
      .toBe("https://github.com/CosmonautJones/whole-page-capture/releases/download/v1.0.0/whole-page-capture.zip");
    expect(screen.getByRole("link", { name: "View source" }).getAttribute("href"))
      .toBe("https://github.com/CosmonautJones/whole-page-capture");
    expect(screen.queryByRole("button", { name: /capture/i })).toBeNull();
  });

  it("explains local installation and the capture boundary", () => {
    render(<WholePageCapturePage />);
    expect(screen.getByText("chrome://extensions")).toBeDefined();
    expect(screen.getByText("edge://extensions")).toBeDefined();
    expect(screen.getByText("Load unpacked")).toBeDefined();
    expect(screen.getByText(/cannot capture another browser tab itself/)).toBeDefined();
    expect(screen.getByText(/32,000 CSS pixels/)).toBeDefined();
    for (const permission of ["contextMenus", "activeTab", "scripting", "storage"]) {
      expect(screen.getByText(permission)).toBeDefined();
    }
  });
});
