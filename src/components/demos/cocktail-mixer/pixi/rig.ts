import {
  Assets,
  Container,
  Point,
  Sprite,
} from "pixi.js";
import type { PointData, Texture } from "pixi.js";
import { garnishPlates } from "../garnish-map";
import {
  CONDENSATION_LAYOUT,
  GLASS_BOUNDS,
  GLASS_RECT,
  ICE_LAYOUT,
  STAGE,
} from "../glass-bounds";
import type { IceCube } from "../glass-bounds";
import type { Cocktail, GlassType } from "../types";
import { createLiquidPlane } from "./liquid";
import {
  createMixerParticles,
  shouldEmitFoam,
  shouldShowSalt,
} from "./particles";
import { createPourStream } from "./stream";

const GARNISH_SIZES: Record<string, { width: number; height: number }> = {
  "garnish-lime-wheel.png": { width: 64, height: 64 },
  "garnish-cherry.png": { width: 56, height: 64 },
  "garnish-orange-slice.png": { width: 64, height: 64 },
  "garnish-grapefruit-wedge.png": { width: 72, height: 64 },
  "garnish-cherry-orange.png": { width: 88, height: 72 },
  "garnish-rocket.png": { width: 48, height: 88 },
};
export type MixerUniforms = {
  fillHeight: number;
  fillColor: string;
  flashColor: string;
  flashAmount: number;
  meniscusAmp: number;
  swirl: number;
  vortex: number;
  streamOn: number;
  streamColor: string;
  bottleAngle: number;
  bottleAlpha: number;
  iceAlpha: number;
  garnishAlpha: number;
  frostAlpha: number;
  displacementOn: boolean;
};

export type MixerRig = {
  uniforms: MixerUniforms;
  applyFinished: (cocktail: Cocktail) => void;
  setFillHeight: (height: number) => void;
  setStream: (on: boolean, color: string) => void;
  emitSplash: (x: number, y: number, color: string) => void;
  pinFoamTo: (surfaceY: number) => void;
  emitMotes: () => void;
  killEphemeral: () => void;
  neckWorld: () => PointData;
  tick: (deltaMs: number) => void;
  destroy: () => void;
};

export type CreateRigOptions = {
  reducedMotion: boolean;
};

function texture(alias: string): Texture {
  return Assets.get<Texture>(alias);
}

function plate(
  alias: string,
  width: number,
  height: number,
  x = 0,
  y = 0,
): Sprite {
  const sprite = new Sprite({ texture: texture(alias) });
  sprite.setSize(width, height);
  sprite.position.set(x, y);
  return sprite;
}

function layoutForIce(glass: GlassType): readonly IceCube[] {
  switch (glass) {
    case "rocks":
      return ICE_LAYOUT.rocks;
    case "highball":
      return ICE_LAYOUT.highball;
    case "coupe":
    case "margarita":
      return [];
    default: {
      const exhaustive: never = glass;
      return exhaustive;
    }
  }
}

function makeIce(
  glass: GlassType,
  bowlCenterX: number,
  bowlMidY: number,
): Container {
  const ice = new Container();

  for (const cube of layoutForIce(glass)) {
    const sprite = new Sprite({ texture: texture("ice-cube.png") });
    const size = 48 * cube.scale;
    sprite.anchor.set(0.5);
    sprite.setSize(size, size);
    sprite.position.set(bowlCenterX + cube.dx, bowlMidY + cube.dy);
    sprite.angle = cube.angle;
    ice.addChild(sprite);
  }

  return ice;
}

function makeCondensation(
  glass: GlassType,
  bowlCenterX: number,
  liquidTop: number,
): Container {
  const condensation = new Container();

  for (const drop of CONDENSATION_LAYOUT[glass]) {
    const sprite = new Sprite({ texture: texture("condensation-dot.png") });
    sprite.anchor.set(0.5);
    sprite.setSize(6, 9);
    sprite.position.set(bowlCenterX + drop.dx, liquidTop + drop.dy);
    condensation.addChild(sprite);
  }

  return condensation;
}

function makeGarnish(
  cocktail: Cocktail,
  aliases: readonly string[],
  x: number,
  y: number,
): Container {
  const garnish = new Container();

  for (const alias of aliases) {
    if (alias.startsWith("rim-salt-")) continue;
    const size = GARNISH_SIZES[alias];
    if (!size) continue;

    const sprite = new Sprite({ texture: texture(alias) });
    sprite.anchor.set(0.5);
    sprite.setSize(size.width, size.height);
    sprite.position.set(x, y);
    garnish.addChild(sprite);
  }

  garnish.label = `${cocktail.name} garnish`;
  return garnish;
}

export function createRig(
  stage: Container,
  cocktail: Cocktail,
  options: CreateRigOptions,
): MixerRig {
  const bounds = GLASS_BOUNDS[cocktail.glass];
  const glassX = GLASS_RECT.x;
  const glassY = GLASS_RECT.y;
  const bowlCenterX = glassX + bounds.bowlCenterX;
  const liquidTop = glassY + bounds.liquidTop;
  const liquidBottom = glassY + bounds.liquidBottom;
  const rimY = glassY + bounds.rimY;
  const bowlMidY = (liquidTop + liquidBottom) / 2;
  const aliases = garnishPlates(cocktail.garnishType, cocktail.glass);
  const saltAlias = aliases.find((alias) => alias.startsWith("rim-salt-"));
  const hasFoam = cocktail.ingredients.some((_, ingredientIndex) =>
    shouldEmitFoam(cocktail, ingredientIndex),
  );
  const allowDisplacement =
    !options.reducedMotion && (window.devicePixelRatio || 1) >= 1.5;

  const root = new Container();
  root.label = `${cocktail.name} mixer rig`;

  const barSurface = plate("bar-top.png", STAGE.width, STAGE.height);
  const backGlass = plate(
    `glass-${cocktail.glass}-back.png`,
    GLASS_RECT.width,
    GLASS_RECT.height,
    glassX,
    glassY,
  );

  const interior = new Container();
  const mask = plate(
    `glass-${cocktail.glass}-mask.png`,
    GLASS_RECT.width,
    GLASS_RECT.height,
    glassX,
    glassY,
  );
  interior.mask = mask;

  const liquid = createLiquidPlane(
    cocktail.color,
    texture("displace-noise.png"),
    allowDisplacement,
  );
  liquid.mesh.position.set(
    bowlCenterX - bounds.bowlWidth / 2,
    liquidBottom,
  );
  liquid.mesh.visible = false;
  liquid.displacementMap.position.set(
    bowlCenterX - bounds.bowlWidth / 2,
    liquidTop,
  );

  const ice = makeIce(cocktail.glass, bowlCenterX, bowlMidY);
  ice.alpha = 0;

  const stream = createPourStream(texture("stream.png"), bowlCenterX);
  const frost = plate(
    "frost.png",
    GLASS_RECT.width,
    GLASS_RECT.height,
    glassX,
    glassY,
  );
  frost.alpha = 0;
  const particles = createMixerParticles({
    cocktail,
    contactX: bowlCenterX,
    moteY: rimY + 36,
    frost,
    textures: {
      splash: texture("splash-dot.png"),
      foam: texture("foam-dot.png"),
      mote: texture("star-mote.png"),
    },
  });
  interior.addChild(
    liquid.mesh,
    liquid.displacementMap,
    ice,
    stream.inner,
    particles.foam,
  );

  const condensation = makeCondensation(
    cocktail.glass,
    bowlCenterX,
    liquidTop,
  );
  const frontGlass = plate(
    `glass-${cocktail.glass}-front.png`,
    GLASS_RECT.width,
    GLASS_RECT.height,
    glassX,
    glassY,
  );
  const rimHighlight = plate(
    "rim-highlight.png",
    48,
    120,
    glassX + 12,
    rimY + 4,
  );
  const salt = saltAlias
    ? plate(
        saltAlias,
        GLASS_RECT.width,
        GLASS_RECT.height,
        glassX,
        glassY,
      )
    : null;
  if (salt) {
    salt.visible = shouldShowSalt(cocktail.garnishType);
  }

  const garnish = makeGarnish(
    cocktail,
    aliases,
    glassX + bounds.garnishX,
    glassY + bounds.garnishY,
  );
  garnish.alpha = 0;

  const bottle = plate("bottle.png", 48, 96);
  bottle.pivot.set(bounds.bottle.neckX, bounds.bottle.neckY);
  bottle.position.set(
    glassX + bounds.bottle.x + bounds.bottle.neckX,
    glassY + bounds.bottle.y + bounds.bottle.neckY,
  );
  bottle.alpha = 0;

  root.addChild(barSurface, backGlass, mask, interior, condensation, frontGlass);
  root.addChild(particles.splash, rimHighlight);
  if (salt) root.addChild(salt);
  root.addChild(stream.air, frost, particles.motes, garnish, bottle);
  stage.addChild(root);

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
    displacementOn: allowDisplacement,
  };
  const neckPoint = new Point();
  let slowFrames = 0;

  const rig: MixerRig = {
    uniforms,
    applyFinished(finishedCocktail) {
      uniforms.fillHeight = 1;
      uniforms.fillColor = finishedCocktail.color;
      uniforms.flashColor = finishedCocktail.color;
      uniforms.flashAmount = 0;
      uniforms.meniscusAmp = 2;
      uniforms.swirl = 0;
      uniforms.vortex = 0;
      uniforms.streamOn = 0;
      uniforms.streamColor = finishedCocktail.color;
      uniforms.bottleAngle = 0;
      uniforms.bottleAlpha = 0;
      uniforms.iceAlpha = bounds.hasIce ? 1 : 0;
      uniforms.garnishAlpha = 1;
      uniforms.frostAlpha = 0;
      uniforms.displacementOn = false;
      particles.killEphemeral();
      particles.setFoamVisible(hasFoam);
      rig.tick(0);
    },
    setFillHeight(height) {
      uniforms.fillHeight = Math.max(0, Math.min(1, height));
    },
    setStream(on, color) {
      uniforms.streamOn = on ? 1 : 0;
      uniforms.streamColor = color;
    },
    emitSplash(x, y, color) {
      particles.emitSplash(x, y, color);
    },
    pinFoamTo(surfaceY) {
      particles.pinFoamTo(surfaceY);
    },
    emitMotes() {
      particles.emitMotes();
    },
    killEphemeral() {
      uniforms.frostAlpha = 0;
      particles.killEphemeral();
    },
    neckWorld() {
      return bottle.getGlobalPosition(neckPoint);
    },
    tick(deltaMs) {
      const fillHeight = Math.max(0, Math.min(1, uniforms.fillHeight));
      const surfaceY =
        liquidBottom - (liquidBottom - liquidTop) * fillHeight;
      const liquidHeight = Math.max(0, liquidBottom - surfaceY);

      liquid.mesh.visible = fillHeight > 0;
      liquid.mesh.position.set(
        bowlCenterX - bounds.bowlWidth / 2,
        surfaceY,
      );
      liquid.update({
        width: bounds.bowlWidth,
        height: liquidHeight,
        amp: uniforms.meniscusAmp,
        swirl: uniforms.swirl,
        vortex: uniforms.vortex,
        fillColor: uniforms.fillColor,
        flashColor: uniforms.flashColor,
        flashAmount: uniforms.flashAmount,
        displacementOn: uniforms.displacementOn,
        deltaMs,
      });

      stream.setColor(uniforms.streamColor);
      stream.rebuild(rig.neckWorld(), rimY, surfaceY, uniforms.streamOn);
      bottle.rotation = uniforms.bottleAngle * (Math.PI / 180);
      bottle.alpha = uniforms.bottleAlpha;
      bottle.tint = uniforms.streamColor;
      ice.alpha = bounds.hasIce ? uniforms.iceAlpha : 0;
      garnish.alpha = uniforms.garnishAlpha;
      frost.alpha = uniforms.frostAlpha;
      particles.pinFoamTo(surfaceY);
      particles.tick(deltaMs);

      if (uniforms.displacementOn && deltaMs > 20) {
        slowFrames += 1;
        if (slowFrames >= 30) {
          uniforms.displacementOn = false;
          rimHighlight.alpha = 0;
        }
      } else {
        slowFrames = 0;
      }
    },
    destroy() {
      root.removeFromParent();
      root.destroy({
        children: true,
        texture: false,
        textureSource: false,
      });
      liquid.destroy();
    },
  };

  rig.tick(0);
  return rig;
}
