import {
  DisplacementFilter,
  MeshPlane,
  Sprite,
  Texture,
} from "pixi.js";
import type { MeshGeometry } from "pixi.js";

const VERTICES_X = 12;
const VERTICES_Y = 8;
const TEXTURE_WIDTH = 64;
const TEXTURE_HEIGHT = 32;
const MAX_SWIRL_OFFSET = 3;
const MAX_VORTEX_OFFSET = 8;

export type LiquidUpdate = {
  width: number;
  height: number;
  amp: number;
  swirl: number;
  vortex: number;
  fillColor: string;
  flashColor: string;
  flashAmount: number;
  displacementOn: boolean;
  deltaMs: number;
};

export type LiquidPlane = {
  mesh: MeshPlane;
  displacementMap: Sprite;
  update: (state: LiquidUpdate) => void;
  destroy: () => void;
};

export function writeMeniscusVertices(
  positions: Float32Array,
  cols: number,
  rows: number,
  width: number,
  height: number,
  amp: number,
  swirl: number,
  vortex: number,
  bowlCenterX: number,
): void {
  const columnDivisor = Math.max(1, cols - 1);
  const rowDivisor = Math.max(1, rows - 1);
  const swirlMagnitude = Math.min(
    MAX_SWIRL_OFFSET,
    Math.abs(swirl) * (MAX_SWIRL_OFFSET / 0.4),
  );

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = (row * cols + col) * 2;
      const gridX = (col / columnDivisor) * width;
      const gridY = (row / rowDivisor) * height;

      if (row !== 0) {
        positions[index] = gridX;
        positions[index + 1] = gridY;
        continue;
      }

      const phase = (col / columnDivisor) * Math.PI * 2;
      const centerDistance =
        bowlCenterX === 0 ? 0 : (gridX - bowlCenterX) / bowlCenterX;
      const vortexOffset =
        centerDistance * MAX_VORTEX_OFFSET * Math.max(-1, Math.min(1, vortex));
      const swirlOffset =
        Math.sin((col + 1) * 12.9898) *
        swirlMagnitude *
        Math.sign(swirl || 1);

      positions[index] = gridX + vortexOffset + swirlOffset;
      positions[index + 1] = Math.sin(phase) * amp;
    }
  }
}

function parseHex(color: string): [number, number, number] | null {
  const match = /^#([\da-f]{6})$/i.exec(color);
  if (!match) return null;

  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixColors(base: string, flash: string, amount: number): string {
  const baseRgb = parseHex(base);
  const flashRgb = parseHex(flash);
  if (!baseRgb || !flashRgb) return base;

  const mix = Math.max(0, Math.min(1, amount));
  const channels = baseRgb.map((channel, index) =>
    Math.round(channel + (flashRgb[index] - channel) * mix),
  );
  return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
}

function paintGradient(
  context: CanvasRenderingContext2D,
  color: string,
): void {
  context.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  context.fillStyle = color;
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  const light = context.createLinearGradient(0, 0, 0, TEXTURE_HEIGHT);
  light.addColorStop(0, "rgba(255, 255, 255, 0.28)");
  light.addColorStop(0.18, "rgba(255, 255, 255, 0.08)");
  light.addColorStop(0.65, "rgba(25, 17, 20, 0.04)");
  light.addColorStop(1, "rgba(18, 9, 14, 0.22)");
  context.fillStyle = light;
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
}

export function createLiquidPlane(
  fillColor: string,
  displacementTexture: Texture,
  allowDisplacement: boolean,
): LiquidPlane {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create the mixer liquid texture");
  }

  paintGradient(context, fillColor);
  const texture = Texture.from(canvas, true);
  const mesh = new MeshPlane({
    texture,
    verticesX: VERTICES_X,
    verticesY: VERTICES_Y,
  });
  mesh.autoResize = false;

  displacementTexture.source.addressMode = "repeat";
  const displacementMap = new Sprite({ texture: displacementTexture });
  const displacementFilter = new DisplacementFilter({
    sprite: displacementMap,
    scale: { x: 4, y: 4 },
  });
  let paintedColor = fillColor;

  return {
    mesh,
    displacementMap,
    update(state) {
      const geometry = mesh.geometry as MeshGeometry;
      writeMeniscusVertices(
        geometry.positions,
        VERTICES_X,
        VERTICES_Y,
        state.width,
        state.height,
        state.amp,
        state.swirl,
        state.vortex,
        state.width / 2,
      );
      geometry.getBuffer("aPosition").update();

      const nextColor = mixColors(
        state.fillColor,
        state.flashColor,
        state.flashAmount,
      );
      if (nextColor !== paintedColor) {
        paintGradient(context, nextColor);
        texture.source.update();
        paintedColor = nextColor;
      }

      const displacementActive =
        allowDisplacement && state.displacementOn && state.height > 0;
      mesh.filters = displacementActive ? [displacementFilter] : [];
      if (displacementActive) {
        displacementMap.x += state.deltaMs * 0.012;
        displacementMap.y += state.deltaMs * 0.004;
      }
    },
    destroy() {
      displacementFilter.destroy();
      texture.destroy(true);
    },
  };
}
