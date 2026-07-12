export type ReleaseGate = {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
};

export type ReleaseSignalResult = {
  ready: boolean;
  completed: number;
  total: number;
  missingRequired: string[];
};

export function getReleaseSignalStatus(gates: ReleaseGate[]): ReleaseSignalResult {
  const required = gates.filter((gate) => gate.required);
  const completed = gates.filter((gate) => gate.checked).length;
  const missingRequired = required
    .filter((gate) => !gate.checked)
    .map((gate) => gate.label);

  return {
    ready: missingRequired.length === 0,
    completed,
    total: gates.length,
    missingRequired,
  };
}
