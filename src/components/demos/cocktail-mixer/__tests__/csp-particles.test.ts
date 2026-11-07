/** @vitest-environment node */
import { ParticleBuffer } from "pixi.js";
import { describe, expect, it } from "vitest";
import { installMixerPixiCsp } from "../pixi/csp";

describe("mixer Pixi CSP install", () => {
  it("lets the particle polyfill accept a property Record", () => {
    installMixerPixiCsp();

    expect(() =>
      ParticleBuffer.prototype.generateParticleUpdate.call(
        {
          _generateParticleUpdateCache: {},
        } as ParticleBuffer,
        {
          position: {
            attributeName: "aPosition",
            format: "float32x2",
            code: "",
            dynamic: true,
          },
        },
      ),
    ).not.toThrow();
  });
});
