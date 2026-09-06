export const MIXER_ASSET_URLS: Record<string, string> = {
  "bar-top.png": new URL("../assets/bar-top.png", import.meta.url).href,
  "bottle.png": new URL("../assets/bottle.png", import.meta.url).href,
  "condensation-dot.png": new URL(
    "../assets/condensation-dot.png",
    import.meta.url,
  ).href,
  "displace-noise.png": new URL(
    "../assets/displace-noise.png",
    import.meta.url,
  ).href,
  "foam-dot.png": new URL("../assets/foam-dot.png", import.meta.url).href,
  "frost.png": new URL("../assets/frost.png", import.meta.url).href,
  "garnish-cherry-orange.png": new URL(
    "../assets/garnish-cherry-orange.png",
    import.meta.url,
  ).href,
  "garnish-cherry.png": new URL(
    "../assets/garnish-cherry.png",
    import.meta.url,
  ).href,
  "garnish-grapefruit-wedge.png": new URL(
    "../assets/garnish-grapefruit-wedge.png",
    import.meta.url,
  ).href,
  "garnish-lime-wheel.png": new URL(
    "../assets/garnish-lime-wheel.png",
    import.meta.url,
  ).href,
  "garnish-orange-slice.png": new URL(
    "../assets/garnish-orange-slice.png",
    import.meta.url,
  ).href,
  "garnish-rocket.png": new URL(
    "../assets/garnish-rocket.png",
    import.meta.url,
  ).href,
  "glass-coupe-back.png": new URL(
    "../assets/glass-coupe-back.png",
    import.meta.url,
  ).href,
  "glass-coupe-front.png": new URL(
    "../assets/glass-coupe-front.png",
    import.meta.url,
  ).href,
  "glass-coupe-mask.png": new URL(
    "../assets/glass-coupe-mask.png",
    import.meta.url,
  ).href,
  "glass-highball-back.png": new URL(
    "../assets/glass-highball-back.png",
    import.meta.url,
  ).href,
  "glass-highball-front.png": new URL(
    "../assets/glass-highball-front.png",
    import.meta.url,
  ).href,
  "glass-highball-mask.png": new URL(
    "../assets/glass-highball-mask.png",
    import.meta.url,
  ).href,
  "glass-margarita-back.png": new URL(
    "../assets/glass-margarita-back.png",
    import.meta.url,
  ).href,
  "glass-margarita-front.png": new URL(
    "../assets/glass-margarita-front.png",
    import.meta.url,
  ).href,
  "glass-margarita-mask.png": new URL(
    "../assets/glass-margarita-mask.png",
    import.meta.url,
  ).href,
  "glass-rocks-back.png": new URL(
    "../assets/glass-rocks-back.png",
    import.meta.url,
  ).href,
  "glass-rocks-front.png": new URL(
    "../assets/glass-rocks-front.png",
    import.meta.url,
  ).href,
  "glass-rocks-mask.png": new URL(
    "../assets/glass-rocks-mask.png",
    import.meta.url,
  ).href,
  "ice-cube.png": new URL("../assets/ice-cube.png", import.meta.url).href,
  "rim-highlight.png": new URL(
    "../assets/rim-highlight.png",
    import.meta.url,
  ).href,
  "rim-salt-highball.png": new URL(
    "../assets/rim-salt-highball.png",
    import.meta.url,
  ).href,
  "rim-salt-margarita.png": new URL(
    "../assets/rim-salt-margarita.png",
    import.meta.url,
  ).href,
  "splash-dot.png": new URL("../assets/splash-dot.png", import.meta.url).href,
  "star-mote.png": new URL("../assets/star-mote.png", import.meta.url).href,
  "stream.png": new URL("../assets/stream.png", import.meta.url).href,
};

export async function loadMixerAssets(
  Assets: typeof import("pixi.js").Assets,
): Promise<void> {
  // Site CSP has no worker-src / blob: — Pixi's default ImageBitmap workers
  // would fail the mount and leave the CSS still on screen.
  Assets.setPreferences({ preferWorkers: false });

  const assets = Object.entries(MIXER_ASSET_URLS).map(([alias, src]) => ({
    alias,
    src,
  }));

  await Assets.load(assets);
}
