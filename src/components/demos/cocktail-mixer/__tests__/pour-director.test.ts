/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { COCKTAILS } from "../data";
import { GLASS_BOUNDS } from "../glass-bounds";
import { gsap } from "../gsap-setup";
import { buildPourCues } from "../pour-script";
import type { Cocktail } from "../types";
import { buildDirectorTimeline } from "../pixi/pour-director";
import type { MixerRig, MixerUniforms } from "../pixi/rig";

const timelines: gsap.core.Timeline[] = [];

function createFakeRig(cocktail: Cocktail): MixerRig {
  const uniforms: MixerUniforms = {
    fillHeight: 0,
    fillColor: cocktail.color,
    flashColor: cocktail.color,
    flashAmount: 0,
    meniscusAmp: 2,
    swirl: 0,
    vortex: 0,
    streamOn: 0,
    streamColor: cocktail.color,
    bottleAngle: 0,
    bottleAlpha: 0,
    iceAlpha: 0,
    garnishAlpha: 0,
    frostAlpha: 0,
    displacementOn: false,
  };

  return {
    uniforms,
    applyFinished: vi.fn(),
    setFillHeight: vi.fn(),
    setStream: vi.fn(),
    emitSplash: vi.fn(),
    pinFoamTo: vi.fn(),
    emitMotes: vi.fn(),
    killEphemeral: vi.fn(),
    neckWorld: vi.fn(() => ({ x: 0, y: 0 })),
    tick: vi.fn(),
    destroy: vi.fn(),
  };
}

function methodCueAt(cocktail: Cocktail): number {
  const cue = buildPourCues({
    ingredientCount: cocktail.ingredients.length,
    hasIce: GLASS_BOUNDS[cocktail.glass].hasIce,
    isSecret: Boolean(cocktail.isSecret),
    reducedMotion: false,
  }).find(({ kind }) => kind === "method");

  if (!cue) {
    throw new Error(`Missing method cue for ${cocktail.name}`);
  }

  return cue.at;
}

function buildTimeline(cocktail: Cocktail, rig: MixerRig) {
  const timeline = gsap.timeline({ paused: true });
  timelines.push(timeline);
  buildDirectorTimeline(timeline, rig, cocktail, vi.fn());
  return timeline;
}

afterEach(() => {
  for (const timeline of timelines.splice(0)) {
    timeline.kill();
  }
});

describe("buildDirectorTimeline", () => {
  it.each([
    ["shaken", COCKTAILS.find(({ method }) => method === "shaken")!],
    ["stirred", COCKTAILS.find(({ method }) => method === "stirred")!],
  ])("keeps %s motion dormant until the method cue", (_method, cocktail) => {
    const rig = createFakeRig(cocktail);
    const timeline = buildTimeline(cocktail, rig);
    const methodAt = methodCueAt(cocktail);

    timeline.seek(methodAt - 0.001, false);

    expect(rig.uniforms.swirl).toBe(0);
    expect(rig.uniforms.vortex).toBe(0);

    timeline.seek(methodAt, false);

    if (cocktail.method === "shaken") {
      expect(rig.uniforms.swirl).toBeCloseTo(0.4);
      expect(rig.uniforms.vortex).toBe(0);
    } else {
      expect(rig.uniforms.swirl).toBe(0);
      expect(rig.uniforms.vortex).toBeCloseTo(1);
    }
  });

  it("leaves built drinks without swirl or vortex at the method cue", () => {
    const cocktail = COCKTAILS.find(({ method }) => method === "built")!;
    const rig = createFakeRig(cocktail);
    const timeline = buildTimeline(cocktail, rig);

    timeline.seek(methodCueAt(cocktail), false);

    expect(rig.uniforms.swirl).toBe(0);
    expect(rig.uniforms.vortex).toBe(0);
  });
});
