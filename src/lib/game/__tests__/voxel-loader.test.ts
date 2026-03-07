import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadVoxelSprites } from "../sprites/voxel-loader";

describe("loadVoxelSprites", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads sprites from manifest and RGBA files", async () => {
    const manifest = {
      sprites: [
        { key: "v2_player_forward", width: 64, height: 64, rgbaFile: "v2_player_forward.rgba" },
        { key: "v2_car_right", width: 128, height: 64, rgbaFile: "v2_car_right.rgba" },
      ],
      version: 2,
    };

    const playerRgba = new ArrayBuffer(64 * 64 * 4);
    const carRgba = new ArrayBuffer(128 * 64 * 4);

    const fetchMock = vi.fn((url: string) => {
      if (url.includes("manifest.json")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(manifest),
        } as Response);
      }
      if (url.includes("v2_player_forward.rgba")) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(playerRgba),
        } as Response);
      }
      if (url.includes("v2_car_right.rgba")) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(carRgba),
        } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    });

    vi.stubGlobal("fetch", fetchMock);

    const sprites = await loadVoxelSprites();

    expect(sprites.size).toBe(2);
    expect(sprites.has("v2_player_forward")).toBe(true);
    expect(sprites.has("v2_car_right")).toBe(true);

    const player = sprites.get("v2_player_forward")!;
    expect(player.width).toBe(64);
    expect(player.height).toBe(64);
    expect(player.rgba).toBeInstanceOf(Uint8Array);
    expect(player.rgba.length).toBe(64 * 64 * 4);
  });

  it("throws on manifest fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 } as Response),
    ));

    await expect(loadVoxelSprites()).rejects.toThrow("Failed to load voxel sprite manifest");
  });

  it("skips sprites with wrong buffer size", async () => {
    const manifest = {
      sprites: [
        { key: "v2_bad", width: 64, height: 64, rgbaFile: "v2_bad.rgba" },
      ],
      version: 2,
    };

    const wrongSizeBuffer = new ArrayBuffer(100); // Wrong size

    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.includes("manifest.json")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(manifest),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(wrongSizeBuffer),
      } as Response);
    }));

    const sprites = await loadVoxelSprites();
    expect(sprites.size).toBe(0);
  });

  it("skips individual sprites that fail to fetch", async () => {
    const manifest = {
      sprites: [
        { key: "v2_ok", width: 4, height: 4, rgbaFile: "v2_ok.rgba" },
        { key: "v2_fail", width: 4, height: 4, rgbaFile: "v2_fail.rgba" },
      ],
      version: 2,
    };

    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.includes("manifest.json")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(manifest),
        } as Response);
      }
      if (url.includes("v2_ok.rgba")) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(4 * 4 * 4)),
        } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    }));

    const sprites = await loadVoxelSprites();
    expect(sprites.size).toBe(1);
    expect(sprites.has("v2_ok")).toBe(true);
  });
});
