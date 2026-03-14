// ============================================================================
// ParticlesPass — GPU instanced particle rendering
// ============================================================================

import type { RenderPass, RenderResources, RenderState } from "../render-pass";

export class ParticlesPass implements RenderPass {
  readonly name = "particles";
  enabled = true;

  setup(_gl: WebGL2RenderingContext, _resources: RenderResources): void {
    // Uses shared GPUParticleRenderer from resources
  }

  execute(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void {
    if (state.particles.length === 0) return;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    resources.particleRenderer.render(state.particles, state.camera.y);
  }

  destroy(_gl: WebGL2RenderingContext): void {
    // Cleanup handled by renderer's resource management
  }
}
