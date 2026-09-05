import type { Cocktail, MixMethod } from "./types";
import { gsap } from "./gsap-setup";
import { GLASS_CONFIGS, WAVE_PATH } from "./data";

export interface PourSnapshot {
  pouredCount: number;
  activePour: number | null;
  allDone: boolean;
}

export const POUR_INTRO = 0.2;
export const POUR_SLOT = 0.85;
export const POUR_FINISH = 0.45;

const STREAM_DURATION = 0.4;
const FILL_DURATION = 0.45;
const SPLASH_DURATION = 0.4;
const BUBBLE_DURATION = 0.45;

const FLAT_WAVE =
  "M 0,3 L 240,3 L 240,12 L 0,12 Z";

export function pourDuration(ingredientCount: number): number {
  return POUR_INTRO + ingredientCount * POUR_SLOT + POUR_FINISH;
}

function pourEl(root: Element, name: string): Element | null {
  return root.querySelector(`[data-pour="${name}"]`);
}

function pourAll(root: Element, name: string): Element[] {
  return Array.from(root.querySelectorAll(`[data-pour="${name}"]`));
}

function setIf(
  target: gsap.TweenTarget | null | undefined,
  vars: gsap.TweenVars
): void {
  if (target == null) return;
  if (Array.isArray(target) && target.length === 0) return;
  gsap.set(target, vars);
}

function applyFinishedState(root: Element, cocktail: Cocktail): void {
  const config = GLASS_CONFIGS[cocktail.glass];
  const totalHeight = config.liquidBottom - config.liquidTop;
  const layerHeight = totalHeight / cocktail.ingredients.length;

  cocktail.ingredients.forEach((_, i) => {
    const layer = pourEl(root, `liquid-${i}`);
    if (!layer) return;
    const layerBottom = config.liquidBottom - i * layerHeight;
    const layerTop = layerBottom - layerHeight;
    gsap.set(layer, { attr: { y: layerTop, height: layerHeight } });
  });

  setIf(pourAll(root, "bottle"), { opacity: 0 });
  setIf(pourEl(root, "stream"), { opacity: 0, drawSVG: 0 });
  setIf(pourAll(root, "splash"), { opacity: 0 });
  setIf(pourAll(root, "bubble"), { opacity: 0 });
  setIf(pourAll(root, "ice"), { opacity: 1 });
  setIf(pourEl(root, "garnish"), { opacity: 1, scale: 1 });
  setIf(pourEl(root, "wave"), { opacity: 0.4, morphSVG: WAVE_PATH });
  setIf(pourEl(root, "glass"), { rotation: 0 });
}

function applyMethodTween(
  tl: gsap.core.Timeline,
  glassEl: Element | null,
  method: MixMethod,
  at: number
): void {
  if (!glassEl) return;

  switch (method) {
    case "shaken":
      tl.to(
        glassEl,
        { duration: 0.28, rotation: 3.5, ease: "barShake", svgOrigin: "100 180" },
        at
      );
      tl.to(
        glassEl,
        { duration: 0.08, rotation: 0, ease: "power2.out", svgOrigin: "100 180" },
        at + 0.28
      );
      break;
    case "stirred":
      tl.to(
        glassEl,
        { duration: 0.35, rotation: -5, ease: "sine.inOut", svgOrigin: "100 180" },
        at
      );
      tl.to(
        glassEl,
        { duration: 0.2, rotation: 0, ease: "sine.inOut", svgOrigin: "100 180" },
        at + 0.35
      );
      break;
    case "built":
      break;
    default: {
      const _exhaustive: never = method;
      void _exhaustive;
    }
  }
}

export function buildPourTimeline({
  root,
  cocktail,
  reducedMotion,
  onSnapshot,
}: {
  root: Element;
  cocktail: Cocktail;
  reducedMotion: boolean;
  onSnapshot: (snapshot: PourSnapshot) => void;
}): gsap.core.Timeline {
  const count = cocktail.ingredients.length;
  const doneSnapshot: PourSnapshot = {
    pouredCount: count,
    activePour: null,
    allDone: true,
  };

  if (reducedMotion) {
    applyFinishedState(root, cocktail);
    onSnapshot(doneSnapshot);
    return gsap.timeline();
  }

  const config = GLASS_CONFIGS[cocktail.glass];
  const totalHeight = config.liquidBottom - config.liquidTop;
  const layerHeight = totalHeight / count;
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  const bottle = pourEl(root, "bottle");
  const bottleBody = pourEl(root, "bottle-body");
  const stream = pourEl(root, "stream");
  const wave = pourEl(root, "wave");
  const glass = pourEl(root, "glass");
  const garnish = pourEl(root, "garnish");
  const ice = pourAll(root, "ice");
  const splashes = pourAll(root, "splash");
  const bubbles = pourAll(root, "bubble");

  setIf(bottle, { opacity: 0, rotation: 0, svgOrigin: "100 40" });
  setIf(stream, { drawSVG: 0, opacity: 0 });
  setIf(splashes, { opacity: 0, x: 0, y: 0 });
  setIf(bubbles, { opacity: 0, y: 0, scale: 0.5 });
  setIf(ice, { opacity: 0, y: -12 });
  setIf(garnish, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
  setIf(wave, { opacity: 0, morphSVG: FLAT_WAVE });
  setIf(glass, { rotation: 0, svgOrigin: "100 180" });

  cocktail.ingredients.forEach((_, i) => {
    const layer = pourEl(root, `liquid-${i}`);
    const layerBottom = config.liquidBottom - i * layerHeight;
    setIf(layer, { attr: { y: layerBottom, height: 0 } });
  });

  onSnapshot({ pouredCount: 0, activePour: null, allDone: false });

  cocktail.ingredients.forEach((ing, i) => {
    const at = POUR_INTRO + i * POUR_SLOT;
    const layer = pourEl(root, `liquid-${i}`);
    const layerBottom = config.liquidBottom - i * layerHeight;
    const layerTop = layerBottom - layerHeight;
    const surfaceY = config.liquidBottom - ((i + 1) / count) * totalHeight;
    const streamD = `M 100,${config.liquidTop - 25} Q 102,${(config.liquidTop - 25 + surfaceY) / 2} 100,${surfaceY}`;

    tl.addLabel(`pour-${i}`, at);
    tl.call(
      () => {
        onSnapshot({ pouredCount: i + 1, activePour: i, allDone: false });
      },
      undefined,
      at
    );

    if (bottleBody) {
      tl.set(bottleBody, { attr: { fill: ing.color, stroke: ing.color } }, at);
    }
    if (stream) {
      tl.set(stream, { attr: { d: streamD, stroke: ing.color } }, at);
    }

    if (bottle) {
      tl.to(bottle, { duration: 0.18, opacity: 1 }, at);
      tl.fromTo(
        bottle,
        { rotation: 0 },
        {
          duration: 0.28,
          rotation: -118,
          ease: "power3.inOut",
          svgOrigin: "100 40",
        },
        at
      );
    }
    if (stream) {
      tl.fromTo(
        stream,
        { drawSVG: 0, opacity: 0 },
        {
          duration: STREAM_DURATION,
          drawSVG: "100%",
          opacity: 0.85,
          ease: "power2.out",
        },
        at + 0.18
      );
    }
    if (layer) {
      tl.to(
        layer,
        {
          duration: FILL_DURATION,
          attr: { y: layerTop, height: layerHeight },
          ease: "power2.out",
        },
        at + 0.2
      );
    }
    if (wave) {
      tl.set(wave, { y: surfaceY - 3, opacity: 0.4 }, at + 0.25);
      tl.fromTo(
        wave,
        { morphSVG: FLAT_WAVE },
        { duration: 0.3, morphSVG: WAVE_PATH, ease: "sine.out" },
        at + 0.25
      );
    }

    splashes.forEach((dot, di) => {
      tl.fromTo(
        dot,
        { opacity: 0, x: 0, y: 0 },
        {
          duration: SPLASH_DURATION,
          opacity: 0,
          physics2D: {
            velocity: 70 + di * 18,
            angle: -70 - di * 18,
            gravity: 520,
          },
          ease: "none",
        },
        at + 0.38
      );
      tl.set(dot, { attr: { fill: ing.color } }, at + 0.38);
    });

    bubbles.forEach((bubble, bi) => {
      tl.fromTo(
        bubble,
        { opacity: 0.7, y: 0, scale: 0.4 },
        {
          duration: BUBBLE_DURATION,
          y: -28,
          scale: 1.1,
          opacity: 0,
          ease: "power1.out",
        },
        at + 0.48 + bi * 0.05
      );
    });

    if (stream) {
      tl.to(stream, { duration: 0.12, opacity: 0, drawSVG: 0 }, at + 0.58);
    }
    if (bottle) {
      tl.to(
        bottle,
        { duration: 0.16, opacity: 0, rotation: 0, svgOrigin: "100 40" },
        at + 0.62
      );
    }
    tl.addLabel(`bubbles-${i}`, at + 0.5);
    tl.call(
      () => {
        onSnapshot({ pouredCount: i + 1, activePour: null, allDone: false });
      },
      undefined,
      at + 0.62
    );
  });

  const finishAt = POUR_INTRO + count * POUR_SLOT;
  tl.addLabel("ice", finishAt);
  ice.forEach((cube, i) => {
    tl.to(
      cube,
      { duration: 0.28, opacity: 1, y: 0, ease: "back.out(1.6)" },
      finishAt + i * 0.06
    );
  });
  tl.addLabel("garnish", finishAt + 0.12);
  if (garnish) {
    tl.to(
      garnish,
      { duration: 0.28, opacity: 1, scale: 1, ease: "back.out(1.8)" },
      finishAt + 0.12
    );
  }
  tl.addLabel("method", finishAt + 0.2);
  applyMethodTween(tl, glass, cocktail.method, finishAt + 0.2);
  if (cocktail.isSecret) {
    tl.to(
      glass,
      { duration: 0.35, rotation: 2.5, ease: "barShake", svgOrigin: "100 180" },
      finishAt + 0.35
    );
    tl.to(
      glass,
      { duration: 0.12, rotation: 0, svgOrigin: "100 180" },
      finishAt + 0.7
    );
  }
  tl.addLabel("done", finishAt + POUR_FINISH);
  tl.call(() => onSnapshot(doneSnapshot), undefined, finishAt + POUR_FINISH);

  return tl;
}
