export type ReleaseGate = {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
};

export type ReleaseScenarioId =
  | "ui-change"
  | "data-migration"
  | "agent-workflow";

export type ReleaseScenario = {
  id: ReleaseScenarioId;
  label: string;
  description: string;
  gates: ReadonlyArray<Omit<ReleaseGate, "checked">>;
};

export type ReleaseVerdict = "hold" | "ready-with-notes" | "ready";

export type ReleaseSignalResult = {
  verdict: ReleaseVerdict;
  ready: boolean;
  completed: number;
  total: number;
  missingRequired: string[];
  missingSupporting: string[];
};

export const RELEASE_SCENARIOS: readonly ReleaseScenario[] = [
  {
    id: "ui-change",
    label: "UI change",
    description: "Prove the main interaction works for people, screens, and assistive tech.",
    gates: [
      { id: "interaction", label: "Primary interaction is verified", required: true },
      { id: "responsive", label: "Responsive layout is checked", required: true },
      { id: "accessibility", label: "Accessibility pass is complete", required: true },
      { id: "visual", label: "Visual regression is reviewed", required: false },
      { id: "rollback", label: "Rollback path is named", required: false },
    ],
  },
  {
    id: "data-migration",
    label: "Data migration",
    description: "Protect the data first, then prove the move and recovery path.",
    gates: [
      { id: "backup", label: "Backup is confirmed", required: true },
      { id: "dry-run", label: "Dry run is clean", required: true },
      { id: "rollback", label: "Rollback is rehearsed", required: true },
      { id: "observation", label: "Post-release observation is assigned", required: false },
      { id: "owner", label: "Decision owner is named", required: false },
    ],
  },
  {
    id: "agent-workflow",
    label: "Agent workflow",
    description: "Bound the work, expose the decisions, and make verification independent.",
    gates: [
      { id: "bounds", label: "Scope and budget are bounded", required: true },
      { id: "approvals", label: "Human approval points are explicit", required: true },
      { id: "verifier", label: "Verifier can reject and retry", required: true },
      { id: "resume", label: "Resume path is tested", required: false },
      { id: "logs", label: "Logs explain the final state", required: false },
    ],
  },
];

export function createScenarioGates(scenarioId: ReleaseScenarioId): ReleaseGate[] {
  const scenario = RELEASE_SCENARIOS.find((item) => item.id === scenarioId);
  if (!scenario) return [];
  return scenario.gates.map((gate) => ({ ...gate, checked: false }));
}

export function getReleaseSignalStatus(
  gates: ReleaseGate[],
  releaseNote = ""
): ReleaseSignalResult {
  const completed = gates.filter((gate) => gate.checked).length;
  const missingRequired = gates
    .filter((gate) => gate.required && !gate.checked)
    .map((gate) => gate.label);
  const missingSupporting = gates
    .filter((gate) => !gate.required && !gate.checked)
    .map((gate) => gate.label);

  const verdict: ReleaseVerdict =
    missingRequired.length > 0
      ? "hold"
      : missingSupporting.length > 0 || releaseNote.trim().length === 0
        ? "ready-with-notes"
        : "ready";

  return {
    verdict,
    ready: verdict === "ready",
    completed,
    total: gates.length,
    missingRequired,
    missingSupporting,
  };
}

const verdictLabels: Record<ReleaseVerdict, string> = {
  hold: "Hold",
  "ready-with-notes": "Ready with notes",
  ready: "Ready",
};

export function buildEvidencePacket({
  changeName,
  scenarioLabel,
  gates,
  releaseNote,
}: {
  changeName: string;
  scenarioLabel: string;
  gates: ReleaseGate[];
  releaseNote: string;
}): string {
  const result = getReleaseSignalStatus(gates, releaseNote);
  return [
    `Evidence packet: ${changeName.trim() || "Untitled change"}`,
    `Scenario: ${scenarioLabel}`,
    `Verdict: ${verdictLabels[result.verdict]}`,
    `Checks: ${result.completed}/${result.total}`,
    "",
    ...gates.map(
      (gate) => `[${gate.checked ? "x" : " "}] ${gate.label}${gate.required ? " (required)" : ""}`
    ),
    "",
    `Release note: ${releaseNote.trim() || "Not recorded"}`,
  ].join("\n");
}
