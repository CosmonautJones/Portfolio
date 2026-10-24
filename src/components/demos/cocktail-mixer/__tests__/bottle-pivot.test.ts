/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { bottlePivot } from "../pixi/bottle-pivot";

describe("bottlePivot", () => {
  it("converts the CSS neck point to texture-space pixels", () => {
    expect(bottlePivot(96, 192, 48, 96, 24, 8)).toEqual({
      x: 48,
      y: 16,
    });
  });
});
