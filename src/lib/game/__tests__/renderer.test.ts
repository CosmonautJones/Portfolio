import { describe, it, expect } from "vitest";
import { hexToRgb } from "../renderer";

describe("hexToRgb", () => {
  it("converts hex to RGB tuple", () => {
    expect(hexToRgb("#ff0000")).toEqual([255, 0, 0]);
    expect(hexToRgb("#00ff00")).toEqual([0, 255, 0]);
    expect(hexToRgb("#1a1c2c")).toEqual([26, 28, 44]);
  });

  it("converts black", () => {
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
  });

  it("converts white", () => {
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
  });
});
