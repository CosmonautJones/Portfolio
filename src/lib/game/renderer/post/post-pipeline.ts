// ============================================================================
// PostPipeline — orchestrates the post-processing chain
// ============================================================================

import type { RenderResources, RenderState } from "../render-pass";
import { BloomPass } from "./bloom";
import { CompositePass } from "./composite";

export class PostPipeline {
  private bloomPass: BloomPass;
  private compositePass: CompositePass;

  constructor() {
    this.bloomPass = new BloomPass();
    this.compositePass = new CompositePass();
  }

  setup(gl: WebGL2RenderingContext, resources: RenderResources): void {
    this.bloomPass.setup(gl, resources);
    this.compositePass.setup(gl, resources);
  }

  /** Begin scene rendering into offscreen FBO */
  beginScene(gl: WebGL2RenderingContext, resources: RenderResources): void {
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.sceneFBO.fbo);
    gl.viewport(0, 0, resources.width, resources.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /** End scene rendering */
  endScene(gl: WebGL2RenderingContext): void {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** Apply post-processing: bloom extract → blur → composite to screen */
  composite(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void {
    if (this.bloomPass.enabled) {
      this.bloomPass.execute(gl, state, resources);
    }
    if (this.compositePass.enabled) {
      this.compositePass.execute(gl, state, resources);
    }
  }

  getBloomPass(): BloomPass {
    return this.bloomPass;
  }

  getCompositePass(): CompositePass {
    return this.compositePass;
  }

  destroy(gl: WebGL2RenderingContext): void {
    this.bloomPass.destroy(gl);
    this.compositePass.destroy(gl);
  }
}
