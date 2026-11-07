export const POUR_INTRO = 0.2;
export const POUR_SLOT = 0.85;
export const POUR_FINISH = 0.65;
export const SECRET_EXTRA = 0.4;

export interface PourSnapshot {
  pouredCount: number;
  activePour: number | null;
  allDone: boolean;
}

export type PourCueKind =
  | "snapshot"
  | "bottleTip"
  | "streamOn"
  | "fill"
  | "meniscus"
  | "splash"
  | "streamOff"
  | "bottleHide"
  | "ice"
  | "garnish"
  | "method"
  | "secret"
  | "done";

export interface PourCue {
  at: number;
  kind: PourCueKind;
  ingredientIndex?: number;
  snapshot?: PourSnapshot;
}

export function pourDuration(
  ingredientCount: number,
  isSecret = false
): number {
  return (
    POUR_INTRO +
    ingredientCount * POUR_SLOT +
    POUR_FINISH +
    (isSecret ? SECRET_EXTRA : 0)
  );
}

export function buildPourCues({
  ingredientCount,
  hasIce,
  isSecret,
  reducedMotion,
}: {
  ingredientCount: number;
  hasIce: boolean;
  isSecret: boolean;
  reducedMotion: boolean;
}): PourCue[] {
  const n = ingredientCount;
  const doneSnap: PourSnapshot = {
    pouredCount: n,
    activePour: null,
    allDone: true,
  };
  if (reducedMotion) {
    return [{ at: 0, kind: "snapshot", snapshot: doneSnap }];
  }

  const cues: PourCue[] = [
    {
      at: 0,
      kind: "snapshot",
      snapshot: { pouredCount: 0, activePour: null, allDone: false },
    },
  ];

  for (let i = 0; i < n; i++) {
    const at = POUR_INTRO + i * POUR_SLOT;
    cues.push(
      {
        at,
        kind: "snapshot",
        ingredientIndex: i,
        snapshot: { pouredCount: i + 1, activePour: i, allDone: false },
      },
      { at, kind: "bottleTip", ingredientIndex: i },
      { at: at + 0.18, kind: "streamOn", ingredientIndex: i },
      { at: at + 0.2, kind: "fill", ingredientIndex: i },
      { at: at + 0.25, kind: "meniscus", ingredientIndex: i },
      { at: at + 0.38, kind: "splash", ingredientIndex: i },
      { at: at + 0.58, kind: "streamOff", ingredientIndex: i },
      {
        at: at + 0.62,
        kind: "bottleHide",
        ingredientIndex: i,
        snapshot: { pouredCount: i + 1, activePour: null, allDone: false },
      }
    );
  }

  const finishAt = POUR_INTRO + n * POUR_SLOT;
  if (hasIce) cues.push({ at: finishAt, kind: "ice" });
  cues.push({ at: finishAt + 0.12, kind: "garnish" });
  cues.push({ at: finishAt + 0.2, kind: "method" });
  if (isSecret) {
    cues.push({ at: finishAt + POUR_FINISH, kind: "secret" });
    const doneAt = finishAt + POUR_FINISH + SECRET_EXTRA;
    cues.push({ at: doneAt, kind: "snapshot", snapshot: doneSnap });
    cues.push({ at: doneAt, kind: "done", snapshot: doneSnap });
  } else {
    const doneAt = finishAt + POUR_FINISH;
    cues.push({ at: doneAt, kind: "snapshot", snapshot: doneSnap });
    cues.push({ at: doneAt, kind: "done", snapshot: doneSnap });
  }
  return cues;
}
