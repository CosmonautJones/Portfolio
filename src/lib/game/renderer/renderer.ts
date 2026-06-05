// ============================================================================
// WebGL2 Game Renderer — thin orchestrator delegating to render passes
// ============================================================================

import type { Particle } from "../types";
import type { RenderResources, RenderState } from "./render-pass";
import { PassGraph } from "./pass-graph";
import { BackgroundPass } from "./passes/background";
import { SpritesPass } from "./passes/sprites";
import { ParticlesPass } from "./passes/particles";
import { LightingPass } from "./passes/lighting";
import { WaterDistortionPass } from "./passes/water-distortion";
import { DeathWarpPass } from "./passes/death-warp";
import { PostPipeline } from "./post/post-pipeline";
import { WHITE_REGION_KEY } from "./webgl/sprite-atlas";
import { SpriteBatch } from "./webgl/sprite-batch";
import { GPUParticleRenderer } from "./webgl/gpu-particles";
import { createFramebuffer } from "./webgl/gl-utils";
import type { SpriteStyle } from "../sprites/sprite-style";
import type { SkinId } from "../types";
import type { RenderScene } from "../scene/types";
import { SpriteCache } from "./sprite-cache";

export { SpriteCache };

/** Create the fullscreen quad VAO shared across post-processing passes */
function createFullscreenQuad(gl: WebGL2RenderingContext): {
  vao: WebGLVertexArrayObject;
  vbo: WebGLBuffer;
} {
  const vao = gl.createVertexArray();
  if (!vao) throw new Error("Failed to create fullscreen VAO");
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  if (!vbo) throw new Error("Failed to create fullscreen VBO");
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  return { vao, vbo };
}

export class GameRenderer {
  private gl: WebGL2RenderingContext;
  private sprites: SpriteCache;
  private resources: RenderResources;
  private passGraph: PassGraph;
  private postPipeline: PostPipeline;
  private spritesPass: SpritesPass;
  private currentSpriteStyle: SpriteStyle = "pixel";

  constructor(canvas: HTMLCanvasElement, sprites: SpriteCache) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("WebGL2 not supported");

    this.gl = gl;
    this.sprites = sprites;

    // Build the sprite atlas on the GPU
    sprites.buildAtlas(gl);
    const atlas = sprites.getAtlas();

    const white = atlas.getRegion(WHITE_REGION_KEY);
    if (!white) throw new Error("White region not found in atlas");

    // Initialize rendering subsystems
    const batch = new SpriteBatch(gl);
    const particleRenderer = new GPUParticleRenderer(gl);
    const fsQuad = createFullscreenQuad(gl);

    // Create framebuffers
    const sceneFBO = createFramebuffer(gl, canvas.width, canvas.height, gl.NEAREST);
    const bw = Math.floor(canvas.width / 2);
    const bh = Math.floor(canvas.height / 2);
    const bloomFBO1 = createFramebuffer(gl, bw, bh, gl.LINEAR);
    const bloomFBO2 = createFramebuffer(gl, bw, bh, gl.LINEAR);

    // Set up projection matrices
    batch.setProjection(canvas.width, canvas.height);
    particleRenderer.setProjection(canvas.width, canvas.height);

    // Bind atlas texture
    const atlasTex = atlas.getTexture();
    if (atlasTex) batch.bindAtlas(atlasTex);

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Build shared resources
    this.resources = {
      gl,
      batch,
      particleRenderer,
      atlas,
      whiteRegion: white,
      width: canvas.width,
      height: canvas.height,
      fsQuad,
      sceneFBO,
      bloomFBO1,
      bloomFBO2,
    };

    // Set up pass graph:
    // 1. Background — procedural sky
    // 2. Sprites — lanes, decorations, obstacles, coins, player, ambient
    // 3. Lighting — dynamic lane light map
    // 4. Water distortion — UV-offset water shader
    // 5. Particles — GPU instanced particles
    // 6. Death warp — radial warp + chromatic aberration (conditional)
    this.passGraph = new PassGraph();
    const bgPass = new BackgroundPass();
    this.spritesPass = new SpritesPass();
    const lightingPass = new LightingPass();
    const waterPass = new WaterDistortionPass();
    const particlesPass = new ParticlesPass();
    const deathWarpPass = new DeathWarpPass();

    this.passGraph.addPass(bgPass);
    this.passGraph.addPass(this.spritesPass);
    this.passGraph.addPass(lightingPass);
    this.passGraph.addPass(waterPass);
    this.passGraph.addPass(particlesPass);
    this.passGraph.addPass(deathWarpPass);

    // Initialize passes
    this.passGraph.setup(gl, this.resources);

    // Set up post-processing pipeline
    this.postPipeline = new PostPipeline();
    this.postPipeline.setup(gl, this.resources);
  }

  /** Set the active sprite style (pixel or voxel).
   *  Voxel mode applies an isometric camera tilt to match the 3D sprites. */
  setSpriteStyle(style: SpriteStyle): void {
    this.currentSpriteStyle = style;
    this.spritesPass.setSpriteStyle(style);

    // Re-apply projection with isometric flag matching the sprite style
    const iso = style === "voxel";
    this.resources.batch.setProjection(
      this.resources.width,
      this.resources.height,
      iso,
    );
    this.resources.particleRenderer.setProjection(
      this.resources.width,
      this.resources.height,
      iso,
    );
  }

  /** Unified entry point — consumes a RenderScene (GameRenderer interface). */
  render(scene: RenderScene, _alpha: number): void {
    this.beginFrame();
    this.renderBackground(scene.animationTime);

    const { x, y } = scene.shake;
    const shaking = x !== 0 || y !== 0;
    if (shaking) this.setShakeOffset(Math.round(x), Math.round(y));

    this.renderLanes(scene);
    this.renderAmbientEffects(scene);
    this.renderCoins(scene);
    this.renderPlayer(scene);
    this.renderParticles(scene.particles, scene.camera.y);

    if (shaking) this.clearShakeOffset();
    this.endFrame(scene.animationTime);
  }

  /** GameRenderer interface alias. */
  setStyle(style: SpriteStyle): void {
    this.setSpriteStyle(style);
  }

  /** Set the active player skin — forwarded to the sprites pass. */
  setSkin(skin: SkinId): void {
    this.spritesPass.setSkin(skin);
  }

  /**
   * GameRenderer interface conformance. The WebGL2 canvas is fixed at
   * 416×640 (the play-field grid) and scaled to fit by CSS, so there is no
   * GL viewport resize to perform here. Kept as a no-op to satisfy the
   * shared interface.
   */
  resize(_width: number, _height: number): void {}

  clear(): void {
    // Handled by post-pipeline beginScene
  }

  /** Begin a new frame — sets up the offscreen framebuffer */
  beginFrame(): void {
    this.postPipeline.beginScene(this.gl, this.resources);
  }

  /** End the frame — applies post-processing and presents to screen */
  endFrame(animationTime: number): void {
    this.postPipeline.endScene(this.gl);

    // Build a minimal render state for post-processing
    const postState: RenderState = {
      phase: "playing",
      player: null as never,
      lanes: [],
      camera: { y: 0, prevY: 0, targetY: 0, viewportWidth: this.resources.width, viewportHeight: this.resources.height },
      particles: [],
      coins: [],
      powerUps: [],
      weather: { type: "clear", intensity: 0, windDirection: 1 },
      animationTime,
      score: 0,
      level: 0,
      deathCause: null,
      deathProgress: 0,
      deathPosition: null,
      shake: { x: 0, y: 0 },
      ghost: null,
    };
    this.postPipeline.composite(this.gl, postState, this.resources);
  }

  renderBackground(animationTime: number): void {
    // Internal render-pipeline step invoked by render(): executes the
    // background pass directly via the pass graph.
    const bgPass = this.passGraph.getPass<BackgroundPass>("background");
    if (bgPass) {
      const state: RenderState = {
        phase: "playing",
        player: null as never,
        lanes: [],
        camera: { y: 0, prevY: 0, targetY: 0, viewportWidth: this.resources.width, viewportHeight: this.resources.height },
        particles: [],
        coins: [],
        powerUps: [],
        weather: { type: "clear", intensity: 0, windDirection: 1 },
        animationTime,
        score: 0,
        level: 0,
        deathCause: null,
        deathProgress: 0,
        deathPosition: null,
        shake: { x: 0, y: 0 },
        ghost: null,
      };
      bgPass.execute(this.gl, state, this.resources);
    }
  }

  renderStarField(): void {
    // Stars are rendered by the procedural background shader
  }

  /** Apply screen shake offset to all rendering subsystems */
  setShakeOffset(offsetX: number, offsetY: number): void {
    this.resources.batch.setShakeOffset(offsetX, offsetY);
    this.resources.particleRenderer.setShakeOffset(offsetX, offsetY);
  }

  /** Clear shake offset — restore normal projection */
  clearShakeOffset(): void {
    this.resources.batch.clearShakeOffset();
    this.resources.particleRenderer.clearShakeOffset();
  }

  /** Clear per-session render state (call on game reset) */
  resetState(): void {
    this.spritesPass.resetState();
  }

  renderLanes(scene: RenderScene): void {
    // Toggle the death-warp pass based on the scene's death progress.
    const deathWarp = this.passGraph.getPass<
      import("./passes/death-warp").DeathWarpPass
    >("deathWarp");
    if (deathWarp) {
      deathWarp.enabled =
        scene.phase === "game_over" &&
        scene.deathCause !== null &&
        scene.deathProgress > 0;
    }

    // Delegate to sprites pass lane rendering
    this.spritesPass.execute(this.gl, scene, this.resources);
  }

  renderCoins(_scene: RenderScene): void {
    // Coins are rendered as part of SpritesPass.execute(). This no-op is an
    // internal render-pipeline step invoked by render() to preserve the
    // pass call sequence.
  }

  renderPlayer(_scene: RenderScene): void {
    // Player is rendered as part of SpritesPass.execute(). This no-op is an
    // internal render-pipeline step invoked by render() to preserve the
    // pass call sequence.
  }

  renderParticles(particles: readonly Particle[], cameraY: number): void {
    if (particles.length === 0) return;
    const gl = this.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.resources.particleRenderer.render(particles, cameraY);
  }

  renderVignette(): void {
    // Handled by post-processing composite shader
  }

  renderAmbientEffects(_scene: RenderScene): void {
    // Ambient effects are rendered as part of SpritesPass.execute(). This
    // no-op is an internal render-pipeline step invoked by render() to
    // preserve the pass call sequence.
  }

  /** Get the pass graph for adding custom passes */
  getPassGraph(): PassGraph {
    return this.passGraph;
  }

  /** Get render resources for external pass setup */
  getResources(): RenderResources {
    return this.resources;
  }

  destroy(): void {
    const gl = this.gl;
    this.passGraph.destroy(gl);
    this.postPipeline.destroy(gl);
    this.resources.batch.destroy();
    this.resources.particleRenderer.destroy();
    gl.deleteFramebuffer(this.resources.sceneFBO.fbo);
    gl.deleteTexture(this.resources.sceneFBO.texture);
    gl.deleteFramebuffer(this.resources.bloomFBO1.fbo);
    gl.deleteTexture(this.resources.bloomFBO1.texture);
    gl.deleteFramebuffer(this.resources.bloomFBO2.fbo);
    gl.deleteTexture(this.resources.bloomFBO2.texture);
    gl.deleteBuffer(this.resources.fsQuad.vbo);
    gl.deleteVertexArray(this.resources.fsQuad.vao);
    this.sprites.destroy(gl);
  }
}
