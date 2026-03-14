// ============================================================================
// PassGraph — ordered execution of composable render passes
// ============================================================================

import type { RenderPass, RenderResources, RenderState } from "./render-pass";

export class PassGraph {
  private passes: RenderPass[] = [];

  /** Add a pass at the end, or after a named pass */
  addPass(pass: RenderPass, after?: string): void {
    if (after) {
      const idx = this.passes.findIndex((p) => p.name === after);
      if (idx >= 0) {
        this.passes.splice(idx + 1, 0, pass);
        return;
      }
    }
    this.passes.push(pass);
  }

  /** Remove a pass by name */
  removePass(name: string): void {
    const idx = this.passes.findIndex((p) => p.name === name);
    if (idx >= 0) this.passes.splice(idx, 1);
  }

  /** Get a pass by name */
  getPass<T extends RenderPass>(name: string): T | undefined {
    return this.passes.find((p) => p.name === name) as T | undefined;
  }

  /** Initialize all passes */
  setup(gl: WebGL2RenderingContext, resources: RenderResources): void {
    for (const pass of this.passes) {
      pass.setup(gl, resources);
    }
  }

  /** Execute all enabled passes in order */
  execute(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void {
    for (const pass of this.passes) {
      if (pass.enabled) {
        pass.execute(gl, state, resources);
      }
    }
  }

  /** Destroy all passes */
  destroy(gl: WebGL2RenderingContext): void {
    for (const pass of this.passes) {
      pass.destroy(gl);
    }
    this.passes.length = 0;
  }
}
