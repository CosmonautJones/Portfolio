import {
  Particle,
  ParticleContainer,
  Rectangle,
} from "pixi.js";
import type { Sprite, Texture } from "pixi.js";
import { isFoamIngredient } from "../garnish-map";
import { STAGE } from "../glass-bounds";
import type { Cocktail } from "../types";

const MAX_SPLASHES = 40;
const MAX_FOAM = 20;
const MAX_MOTES = 12;
const SPLASH_BURST = 8;
const FOAM_OFFSETS = [-30, -24, -18, -12, -6, 0, 7, 14, 20, 26, 31] as const;
const SPLASH_GRAVITY = 0.0008;

type MovingParticle = {
  particle: Particle;
  velocityX: number;
  velocityY: number;
  ageMs: number;
  lifeMs: number;
};

export type ParticleTextures = {
  splash: Texture;
  foam: Texture;
  mote: Texture;
};

export type ParticleSystemOptions = {
  cocktail: Cocktail;
  contactX: number;
  moteY: number;
  frost: Sprite;
  textures: ParticleTextures;
};

export type MixerParticles = {
  splash: ParticleContainer;
  foam: ParticleContainer;
  motes: ParticleContainer;
  emitSplash: (x: number, y: number, color: string) => void;
  pinFoamTo: (surfaceY: number) => void;
  emitMotes: () => void;
  setFoamVisible: (visible: boolean) => void;
  killEphemeral: () => void;
  tick: (deltaMs: number) => void;
};

export function shouldShowSalt(garnishType: string): boolean {
  return garnishType.startsWith("salt_");
}

export function shouldEmitFoam(
  cocktail: Cocktail,
  ingredientIndex: number,
): boolean {
  return isFoamIngredient(
    cocktail.ingredients[ingredientIndex]?.name ?? "",
  );
}

function createContainer(texture: Texture): ParticleContainer {
  const container = new ParticleContainer({
    texture,
    dynamicProperties: {
      position: true,
      rotation: true,
      color: true,
    },
  });
  container.boundsArea = new Rectangle(0, 0, STAGE.width, STAGE.height);
  return container;
}

function removeMovingParticle(
  container: ParticleContainer,
  particles: MovingParticle[],
  index: number,
): void {
  container.removeParticle(particles[index].particle);
  particles.splice(index, 1);
}

function clearMovingParticles(
  container: ParticleContainer,
  particles: MovingParticle[],
): void {
  if (particles.length > 0) {
    container.removeParticle(...particles.map(({ particle }) => particle));
    particles.length = 0;
  }
}

function trimMovingParticles(
  container: ParticleContainer,
  particles: MovingParticle[],
  maximum: number,
): void {
  while (particles.length > maximum) {
    removeMovingParticle(container, particles, 0);
  }
}

export function createMixerParticles(
  options: ParticleSystemOptions,
): MixerParticles {
  const splash = createContainer(options.textures.splash);
  const foam = createContainer(options.textures.foam);
  const motes = createContainer(options.textures.mote);
  const splashes: MovingParticle[] = [];
  const stars: MovingParticle[] = [];
  const foamParticles: Particle[] = [];

  foam.alpha = 0;

  function ensureFoam(): void {
    if (foamParticles.length > 0) return;

    for (const offset of FOAM_OFFSETS.slice(0, MAX_FOAM)) {
      const particle = new Particle({
        texture: options.textures.foam,
        x: options.contactX + offset,
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: 0.5,
        scaleY: 0.5,
      });
      foam.addParticle(particle);
      foamParticles.push(particle);
    }
  }

  function setFoamVisible(visible: boolean): void {
    if (visible) ensureFoam();
    foam.alpha = visible ? 1 : 0;
  }

  function emitSplash(x: number, y: number, color: string): void {
    for (let index = 0; index < SPLASH_BURST; index += 1) {
      const scale = 0.22 + Math.random() * 0.2;
      const particle = new Particle({
        texture: options.textures.splash,
        x,
        y,
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: scale,
        scaleY: scale,
        tint: color,
      });
      splash.addParticle(particle);
      splashes.push({
        particle,
        velocityX: (Math.random() - 0.5) * 0.14,
        velocityY: -0.08 - Math.random() * 0.1,
        ageMs: 0,
        lifeMs: 260 + Math.random() * 100,
      });
    }
    trimMovingParticles(splash, splashes, MAX_SPLASHES);

    const isFoamPour = options.cocktail.ingredients.some(
      (ingredient, ingredientIndex) =>
        ingredient.color === color &&
        shouldEmitFoam(options.cocktail, ingredientIndex),
    );
    if (isFoamPour) setFoamVisible(true);
  }

  function pinFoamTo(surfaceY: number): void {
    for (let index = 0; index < foamParticles.length; index += 1) {
      foamParticles[index].y = surfaceY - 3 + Math.abs(index % 3);
    }
  }

  function emitMotes(): void {
    clearMovingParticles(motes, stars);

    for (let index = 0; index < MAX_MOTES; index += 1) {
      const angle = (index / MAX_MOTES) * Math.PI * 2;
      const radius = 22 + (index % 4) * 8;
      const scale = 0.2 + (index % 3) * 0.06;
      const particle = new Particle({
        texture: options.textures.mote,
        x: options.contactX + Math.cos(angle) * radius,
        y: options.moteY + Math.sin(angle) * radius * 0.55,
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: scale,
        scaleY: scale,
        rotation: angle,
      });
      motes.addParticle(particle);
      stars.push({
        particle,
        velocityX: Math.cos(angle) * 0.025,
        velocityY: -0.025 - Math.abs(Math.sin(angle)) * 0.02,
        ageMs: 0,
        lifeMs: 380,
      });
    }
  }

  function killEphemeral(): void {
    clearMovingParticles(splash, splashes);
    clearMovingParticles(motes, stars);
    options.frost.alpha = 0;
  }

  function tickMoving(
    container: ParticleContainer,
    particles: MovingParticle[],
    deltaMs: number,
    gravity: number,
  ): void {
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const moving = particles[index];
      moving.ageMs += deltaMs;
      if (moving.ageMs >= moving.lifeMs) {
        removeMovingParticle(container, particles, index);
        continue;
      }

      moving.velocityY += gravity * deltaMs;
      moving.particle.x += moving.velocityX * deltaMs;
      moving.particle.y += moving.velocityY * deltaMs;
      moving.particle.rotation += deltaMs * 0.002;
      moving.particle.alpha = 1 - moving.ageMs / moving.lifeMs;
    }
  }

  return {
    splash,
    foam,
    motes,
    emitSplash,
    pinFoamTo,
    emitMotes,
    setFoamVisible,
    killEphemeral,
    tick(deltaMs) {
      tickMoving(splash, splashes, deltaMs, SPLASH_GRAVITY);
      tickMoving(motes, stars, deltaMs, 0);
    },
  };
}
