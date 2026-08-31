import { describe, expect, it } from "vitest";
import {
  RELEASE_SCENARIOS,
  buildEvidencePacket,
  createScenarioGates,
  getReleaseSignalStatus,
  type ReleaseGate,
} from "../release-signal-logic";

const baseGates: ReleaseGate[] = [
  { id: "scope", label: "Scope is clear", required: true, checked: false },
  { id: "tests", label: "Tests cover the main path", required: true, checked: false },
  { id: "notes", label: "Release notes are readable", required: false, checked: false },
];

describe("getReleaseSignalStatus", () => {
  it("holds while required evidence is missing", () => {
    const result = getReleaseSignalStatus(baseGates, "");

    expect(result.verdict).toBe("hold");
    expect(result.completed).toBe(0);
    expect(result.total).toBe(3);
    expect(result.missingRequired).toEqual([
      "Scope is clear",
      "Tests cover the main path",
    ]);
  });

  it("uses ready with notes when required evidence exists but supporting evidence is open", () => {
    const result = getReleaseSignalStatus(
      baseGates.map((gate) =>
        gate.required ? { ...gate, checked: true } : gate
      ),
      "Main path is covered. Follow-up is recorded."
    );

    expect(result.verdict).toBe("ready-with-notes");
    expect(result.missingRequired).toEqual([]);
    expect(result.missingSupporting).toEqual(["Release notes are readable"]);
  });

  it("is ready only when every gate and the release note are complete", () => {
    const result = getReleaseSignalStatus(
      baseGates.map((gate) => ({ ...gate, checked: true })),
      "Verified and ready to ship."
    );

    expect(result.verdict).toBe("ready");
    expect(result.completed).toBe(3);
  });
});

describe("release scenarios", () => {
  it("provides concrete gates for UI, migration, and agent work", () => {
    expect(RELEASE_SCENARIOS.map((scenario) => scenario.id)).toEqual([
      "ui-change",
      "data-migration",
      "agent-workflow",
    ]);

    expect(createScenarioGates("data-migration").map((gate) => gate.label)).toContain(
      "Rollback is rehearsed"
    );
  });

  it("builds a portable evidence packet", () => {
    const gates = baseGates.map((gate) => ({ ...gate, checked: true }));
    const packet = buildEvidencePacket({
      changeName: "Portfolio project proof upgrades",
      scenarioLabel: "UI change",
      gates,
      releaseNote: "Verified locally.",
    });

    expect(packet).toContain("Evidence packet: Portfolio project proof upgrades");
    expect(packet).toContain("Scenario: UI change");
    expect(packet).toContain("Verdict: Ready");
    expect(packet).toContain("[x] Scope is clear");
  });
});
