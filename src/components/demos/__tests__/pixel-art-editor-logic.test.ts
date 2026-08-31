import { describe, expect, it } from "vitest";
import {
  cloneGrid,
  createEmptyGrid,
  createLobsterStarter,
  floodFill,
  identifyStarter,
} from "../pixel-art-editor-logic";

describe("pixel art editor logic", () => {
  it("creates an empty square grid", () => {
    expect(createEmptyGrid(2)).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  it("flood fills a connected region without mutating the source", () => {
    const source = [
      [1, 1, 0],
      [1, 0, 0],
      [2, 2, 0],
    ];

    const result = floodFill(source, 0, 0, 5);

    expect(result).toEqual([
      [5, 5, 0],
      [5, 0, 0],
      [2, 2, 0],
    ]);
    expect(source).toEqual([
      [1, 1, 0],
      [1, 0, 0],
      [2, 2, 0],
    ]);
  });

  it("clones grids deeply", () => {
    const source = [[1, 2]];
    const clone = cloneGrid(source);

    clone[0][0] = 9;

    expect(source).toEqual([[1, 2]]);
  });

  it("returns a fresh 32 by 32 ClaudeBot lobster starter", () => {
    const first = createLobsterStarter();
    const second = createLobsterStarter();

    expect(first).toHaveLength(32);
    expect(first.every((row) => row.length === 32)).toBe(true);
    expect(first.flat().some((cell) => cell !== 0)).toBe(true);

    first[0][0] = 99;
    expect(second[0][0]).toBe(0);
  });

  it("identifies starter grids so history keeps the starter controls honest", () => {
    expect(identifyStarter(createLobsterStarter())).toBe("lobster");
    expect(identifyStarter(createEmptyGrid(16))).toBe("blank");

    const custom = createEmptyGrid(8);
    custom[0][0] = 1;
    expect(identifyStarter(custom)).toBeNull();
  });
});
