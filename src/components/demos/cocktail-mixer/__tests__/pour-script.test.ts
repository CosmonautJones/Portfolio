/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import {
  POUR_FINISH,
  POUR_INTRO,
  POUR_SLOT,
  SECRET_EXTRA,
  buildPourCues,
  pourDuration,
} from "../pour-script";

describe("pour-script", () => {
  it("matches the duration formula", () => {
    expect(pourDuration(3, false)).toBeCloseTo(
      POUR_INTRO + 3 * POUR_SLOT + POUR_FINISH
    );
    expect(pourDuration(3, false)).toBeCloseTo(3.4);
    expect(pourDuration(4, true)).toBeCloseTo(
      POUR_INTRO + 4 * POUR_SLOT + POUR_FINISH + SECRET_EXTRA
    );
    expect(pourDuration(4, true)).toBeCloseTo(4.65);
  });

  it("increments pouredCount at each slot start", () => {
    const cues = buildPourCues({
      ingredientCount: 3,
      hasIce: false,
      isSecret: false,
      reducedMotion: false,
    });
    const snaps = cues.filter((c) => c.kind === "snapshot").map((c) => c.snapshot);
    expect(snaps[0]).toEqual({
      pouredCount: 0,
      activePour: null,
      allDone: false,
    });
    expect(snaps.some((s) => s?.pouredCount === 1 && s.activePour === 0)).toBe(
      true
    );
    expect(snaps.at(-1)).toEqual({
      pouredCount: 3,
      activePour: null,
      allDone: true,
    });
  });

  it("emits allDone immediately for reduced motion", () => {
    const cues = buildPourCues({
      ingredientCount: 3,
      hasIce: true,
      isSecret: true,
      reducedMotion: true,
    });
    expect(cues).toEqual([
      {
        at: 0,
        kind: "snapshot",
        snapshot: { pouredCount: 3, activePour: null, allDone: true },
      },
    ]);
  });

  it("skips ice cues when hasIce is false", () => {
    const noIce = buildPourCues({
      ingredientCount: 2,
      hasIce: false,
      isSecret: false,
      reducedMotion: false,
    });
    const iced = buildPourCues({
      ingredientCount: 2,
      hasIce: true,
      isSecret: false,
      reducedMotion: false,
    });
    expect(noIce.some((c) => c.kind === "ice")).toBe(false);
    expect(iced.some((c) => c.kind === "ice")).toBe(true);
  });

  it("places Cosmonaut allDone after SECRET_EXTRA", () => {
    const cues = buildPourCues({
      ingredientCount: 4,
      hasIce: false,
      isSecret: true,
      reducedMotion: false,
    });
    const secret = cues.find((c) => c.kind === "secret");
    const done = cues.find((c) => c.kind === "done");
    expect(secret).toBeTruthy();
    expect(done?.at).toBeCloseTo(pourDuration(4, true));
    expect(done?.at).toBeGreaterThan(secret!.at);
    expect(done?.snapshot?.allDone).toBe(true);
  });
});
