/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PROJECT_VIEWS_KEY, rememberProjectView } from "../project-views";

describe("rememberProjectView", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("unlocks road scholar on the third distinct project", () => {
    expect(rememberProjectView("alpha")).toBe(false);
    expect(rememberProjectView("beta")).toBe(false);
    expect(rememberProjectView("gamma")).toBe(true);
  });

  it("does not count the same project twice", () => {
    expect(rememberProjectView("alpha")).toBe(false);
    expect(rememberProjectView("alpha")).toBe(false);
    expect(rememberProjectView("beta")).toBe(false);
    expect(JSON.parse(localStorage.getItem(PROJECT_VIEWS_KEY) ?? "[]")).toEqual([
      "alpha",
      "beta",
    ]);
  });
});
