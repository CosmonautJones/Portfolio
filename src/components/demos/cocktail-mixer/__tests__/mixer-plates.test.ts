/** @vitest-environment node */
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  generateMixerPlates,
  PLATE_SPECS,
} from "../../../../../scripts/generate-mixer-plates";

const REQUIRED_FILES = [
  "bar-top.png",
  "glass-rocks-back.png",
  "glass-rocks-front.png",
  "glass-rocks-mask.png",
  "glass-highball-back.png",
  "glass-highball-front.png",
  "glass-highball-mask.png",
  "glass-coupe-back.png",
  "glass-coupe-front.png",
  "glass-coupe-mask.png",
  "glass-margarita-back.png",
  "glass-margarita-front.png",
  "glass-margarita-mask.png",
  "ice-cube.png",
  "bottle.png",
  "stream.png",
  "displace-noise.png",
  "frost.png",
  "condensation-dot.png",
  "rim-highlight.png",
  "garnish-lime-wheel.png",
  "garnish-cherry.png",
  "garnish-orange-slice.png",
  "garnish-grapefruit-wedge.png",
  "garnish-cherry-orange.png",
  "garnish-rocket.png",
  "rim-salt-margarita.png",
  "rim-salt-highball.png",
  "splash-dot.png",
  "foam-dot.png",
  "star-mote.png",
] as const;

const INTERIOR_POINTS = {
  rocks: { x: 200, y: 350 },
  highball: { x: 200, y: 300 },
  coupe: { x: 200, y: 250 },
  margarita: { x: 200, y: 230 },
} as const;

let outputDirectory: string;

async function alphaAt(filename: string, x: number, y: number) {
  const { data } = await sharp(join(outputDirectory, filename))
    .ensureAlpha()
    .extract({ left: x, top: y, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return data[3];
}

beforeAll(async () => {
  outputDirectory = await mkdtemp(join(tmpdir(), "mixer-plates-"));
  await generateMixerPlates(outputDirectory);
}, 30_000);

afterAll(async () => {
  await rm(outputDirectory, { recursive: true, force: true });
});

describe("mixer plate generator", () => {
  it("declares and writes every required plate", async () => {
    expect(PLATE_SPECS.map(({ filename }) => filename).sort()).toEqual(
      [...REQUIRED_FILES].sort(),
    );
    expect((await readdir(outputDirectory)).sort()).toEqual(
      [...REQUIRED_FILES].sort(),
    );
  });

  it("writes the required fixed dimensions", async () => {
    for (const type of Object.keys(INTERIOR_POINTS)) {
      for (const layer of ["back", "front", "mask"]) {
        const metadata = await sharp(
          join(outputDirectory, `glass-${type}-${layer}.png`),
        ).metadata();
        expect([metadata.width, metadata.height]).toEqual([400, 600]);
      }
    }

    const bar = await sharp(join(outputDirectory, "bar-top.png")).metadata();
    const bottle = await sharp(join(outputDirectory, "bottle.png")).metadata();
    const stream = await sharp(join(outputDirectory, "stream.png")).metadata();

    expect([bar.width, bar.height]).toEqual([560, 840]);
    expect([bottle.width, bottle.height]).toEqual([96, 192]);
    expect([stream.width, stream.height]).toEqual([128, 8]);
  });

  it("keeps glass interiors transparent on painted layers and opaque on masks", async () => {
    for (const [type, point] of Object.entries(INTERIOR_POINTS)) {
      expect(await alphaAt(`glass-${type}-mask.png`, point.x, point.y)).toBe(255);
      expect(await alphaAt(`glass-${type}-back.png`, point.x, point.y)).toBe(0);
      expect(await alphaAt(`glass-${type}-front.png`, point.x, point.y)).toBe(0);
      expect(await alphaAt(`glass-${type}-mask.png`, 0, 0)).toBe(0);
    }
  });

  it("makes the bottle neutral enough to tint", async () => {
    const { data, info } = await sharp(join(outputDirectory, "bottle.png"))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const opaquePixels: number[][] = [];

    for (let offset = 0; offset < data.length; offset += info.channels) {
      if (data[offset + 3] > 127) {
        opaquePixels.push([data[offset], data[offset + 1], data[offset + 2]]);
      }
    }

    const average = opaquePixels
      .flatMap((pixel) => pixel)
      .reduce((sum, channel) => sum + channel, 0) / (opaquePixels.length * 3);
    expect(average).toBeGreaterThan(200);
  });
});
