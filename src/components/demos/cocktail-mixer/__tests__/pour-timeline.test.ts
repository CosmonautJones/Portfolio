/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { COCKTAILS, THE_COSMONAUT } from "../data";
import {
  buildPourTimeline,
  pourDuration,
  type PourSnapshot,
} from "../pour-timeline";

function svgEl(tag: string): SVGElement {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

function mountRoot(ingredientCount: number): SVGSVGElement {
  const root = svgEl("svg") as SVGSVGElement;
  const glass = svgEl("g");
  glass.setAttribute("data-pour", "glass");
  root.append(glass);

  for (let i = 0; i < ingredientCount; i++) {
    const liquid = svgEl("rect");
    liquid.setAttribute("data-pour", `liquid-${i}`);
    liquid.setAttribute("x", "0");
    liquid.setAttribute("width", "200");
    liquid.setAttribute("y", "250");
    liquid.setAttribute("height", "0");
    glass.append(liquid);
  }

  const wave = svgEl("path");
  wave.setAttribute("data-pour", "wave");
  wave.setAttribute("d", "M 0,3 L 240,3 L 240,12 L 0,12 Z");
  glass.append(wave);

  const ice = svgEl("g");
  ice.setAttribute("data-pour", "ice");
  glass.append(ice);

  const garnish = svgEl("g");
  garnish.setAttribute("data-pour", "garnish");
  glass.append(garnish);

  const bottle = svgEl("g");
  bottle.setAttribute("data-pour", "bottle");
  const bottleBody = svgEl("rect");
  bottleBody.setAttribute("data-pour", "bottle-body");
  bottle.append(bottleBody);
  root.append(bottle);

  const stream = svgEl("path");
  stream.setAttribute("data-pour", "stream");
  stream.setAttribute(
    "d",
    "M 100,75 Q 102,120 100,180"
  );
  stream.setAttribute("stroke", "#fff");
  stream.setAttribute("stroke-width", "3");
  stream.setAttribute("fill", "none");
  root.append(stream);

  for (let i = 0; i < 3; i++) {
    const splash = svgEl("circle");
    splash.setAttribute("data-pour", "splash");
    splash.setAttribute("cx", "100");
    splash.setAttribute("cy", "140");
    splash.setAttribute("r", "2");
    root.append(splash);
  }

  for (let i = 0; i < 4; i++) {
    const bubble = svgEl("circle");
    bubble.setAttribute("data-pour", "bubble");
    bubble.setAttribute("cx", "100");
    bubble.setAttribute("cy", "200");
    bubble.setAttribute("r", "2");
    root.append(bubble);
  }

  document.body.append(root);
  return root;
}

function collectSnapshots(
  cocktail: (typeof COCKTAILS)[number],
  reducedMotion = false
): { snapshots: PourSnapshot[]; duration: number } {
  const root = mountRoot(cocktail.ingredients.length);
  const snapshots: PourSnapshot[] = [];
  const timeline = buildPourTimeline({
    root,
    cocktail,
    reducedMotion,
    onSnapshot: (snapshot) => snapshots.push({ ...snapshot }),
  });
  const duration = timeline.duration();
  if (!reducedMotion) {
    timeline.progress(1);
  }
  timeline.kill();
  root.remove();
  return { snapshots, duration };
}

describe("buildPourTimeline", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("starts from an empty glass", () => {
    const margarita = COCKTAILS[0];
    const root = mountRoot(margarita.ingredients.length);
    const snapshots: PourSnapshot[] = [];
    const timeline = buildPourTimeline({
      root,
      cocktail: margarita,
      reducedMotion: false,
      onSnapshot: (snapshot) => snapshots.push({ ...snapshot }),
    });
    expect(snapshots[0]).toEqual({
      pouredCount: 0,
      activePour: null,
      allDone: false,
    });
    timeline.kill();
    root.remove();
  });

  it("finishes a three-ingredient recipe in under 3.5 seconds", () => {
    const margarita = COCKTAILS[0];
    expect(margarita.ingredients).toHaveLength(3);
    const { snapshots, duration } = collectSnapshots(margarita);
    expect(duration).toBeLessThan(3.5);
    expect(pourDuration(3)).toBeLessThan(3.5);
    expect(snapshots.at(-1)).toEqual({
      pouredCount: 3,
      activePour: null,
      allDone: true,
    });
  });

  it("emits a snapshot when the first pour starts", () => {
    const margarita = COCKTAILS[0];
    const { snapshots } = collectSnapshots(margarita);
    expect(
      snapshots.some((s) => s.pouredCount === 1 && s.activePour === 0)
    ).toBe(true);
  });

  it("shows the completed recipe immediately for reduced motion", () => {
    const margarita = COCKTAILS[0];
    const { snapshots, duration } = collectSnapshots(margarita, true);
    expect(duration).toBe(0);
    expect(snapshots).toEqual([
      { pouredCount: 3, activePour: null, allDone: true },
    ]);
  });

  it("keeps built drinks still and shakes shaken drinks", () => {
    const paloma = COCKTAILS.find((c) => c.method === "built");
    const margarita = COCKTAILS.find((c) => c.method === "shaken");
    expect(paloma).toBeTruthy();
    expect(margarita).toBeTruthy();

    const builtRoot = mountRoot(paloma!.ingredients.length);
    const shakenRoot = mountRoot(margarita!.ingredients.length);
    const built = buildPourTimeline({
      root: builtRoot,
      cocktail: paloma!,
      reducedMotion: false,
      onSnapshot: vi.fn(),
    });
    const shaken = buildPourTimeline({
      root: shakenRoot,
      cocktail: margarita!,
      reducedMotion: false,
      onSnapshot: vi.fn(),
    });

    expect(shaken.getTweensOf('[data-pour="glass"]').length).toBeGreaterThan(
      built.getTweensOf('[data-pour="glass"]').length
    );

    built.kill();
    shaken.kill();
    builtRoot.remove();
    shakenRoot.remove();
  });

  it("kills without throwing", () => {
    const root = mountRoot(THE_COSMONAUT.ingredients.length);
    const timeline = buildPourTimeline({
      root,
      cocktail: THE_COSMONAUT,
      reducedMotion: false,
      onSnapshot: vi.fn(),
    });
    expect(() => timeline.kill()).not.toThrow();
    root.remove();
  });
});
