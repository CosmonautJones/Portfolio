import { describe, expect, it } from "vitest";
import { getReleaseSignalStatus, type ReleaseGate } from "../release-signal-logic";

const baseGates: ReleaseGate[] = [
  { id: "scope", label: "Scope is clear", required: true, checked: false },
  { id: "tests", label: "Tests cover the main path", required: true, checked: false },
  { id: "notes", label: "Release notes are readable", required: false, checked: false },
];

describe("getReleaseSignalStatus", () => {
  it("reports missing required gates when nothing is checked", () => {
    const result = getReleaseSignalStatus(baseGates);

    expect(result.ready).toBe(false);
    expect(result.completed).toBe(0);
    expect(result.total).toBe(3);
    expect(result.missingRequired).toEqual([
      "Scope is clear",
      "Tests cover the main path",
    ]);
  });

  it("allows optional gates to stay unchecked", () => {
    const result = getReleaseSignalStatus(
      baseGates.map((gate) =>
        gate.required ? { ...gate, checked: true } : gate
      )
    );

    expect(result.ready).toBe(true);
    expect(result.completed).toBe(2);
    expect(result.missingRequired).toEqual([]);
  });

  it("counts all completed gates", () => {
    const result = getReleaseSignalStatus(
      baseGates.map((gate) => ({ ...gate, checked: true }))
    );

    expect(result.ready).toBe(true);
    expect(result.completed).toBe(3);
    expect(result.total).toBe(3);
  });
});
