import "pixi.js/unsafe-eval";
import { ParticleBuffer } from "pixi.js";

type ParticleUpdate = ReturnType<ParticleBuffer["generateParticleUpdate"]>;
type ParticleProperties = Parameters<
  ParticleBuffer["generateParticleUpdate"]
>[0];

let installed = false;

/**
 * Pixi's CSP-safe particle polyfill calls `properties.filter`, but
 * ParticleBuffer passes a Record. Convert to an array so splash/foam/motes
 * can render without `'unsafe-eval'` in site CSP.
 */
export function installMixerPixiCsp(): void {
  if (installed) return;
  installed = true;

  const original = ParticleBuffer.prototype.generateParticleUpdate;
  ParticleBuffer.prototype.generateParticleUpdate =
    function generateParticleUpdate(
      this: ParticleBuffer,
      properties: ParticleProperties,
    ): ParticleUpdate {
      const list = Array.isArray(properties)
        ? properties
        : Object.values(properties);
      return original.call(this, list as ParticleProperties);
    };
}

installMixerPixiCsp();
