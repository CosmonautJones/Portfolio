/** @vitest-environment node */
import { describe, expect, it, vi } from "vitest";
import { loadMixerAssets, MIXER_ASSET_URLS } from "../pixi/assets";

type MixerAssets = Parameters<typeof loadMixerAssets>[0];

describe("loadMixerAssets", () => {
  it("disables Pixi texture workers before loading plates", async () => {
    const setPreferences = vi.fn();
    const load = vi.fn().mockResolvedValue({});

    await loadMixerAssets({
      setPreferences,
      load,
    } as unknown as MixerAssets);

    expect(setPreferences).toHaveBeenCalledWith({ preferWorkers: false });
    expect(load).toHaveBeenCalledTimes(1);
    expect(setPreferences.mock.invocationCallOrder[0]).toBeLessThan(
      load.mock.invocationCallOrder[0],
    );
    const loaded = load.mock.calls[0]?.[0] as { alias: string }[];
    expect(loaded.map((asset) => asset.alias)).toEqual(
      Object.keys(MIXER_ASSET_URLS),
    );
  });
});
