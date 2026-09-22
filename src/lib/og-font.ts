/**
 * Fetches a Google Font subset (TrueType) for next/og image rendering.
 * Returns null instead of throwing so a network hiccup at build time falls
 * back to the default font rather than failing the build.
 */
export async function loadGoogleFont(family: string, text: string): Promise<ArrayBuffer | null> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  try {
    const css = await (await fetch(cssUrl)).text();
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!match) {
      console.error(`[og-font] No TrueType source for "${family}" in Google Fonts response`);
      return null;
    }
    const fontResponse = await fetch(match[1]);
    if (!fontResponse.ok) {
      console.error(`[og-font] Font file for "${family}" returned ${fontResponse.status}`);
      return null;
    }
    return await fontResponse.arrayBuffer();
  } catch (error) {
    console.error(`[og-font] Could not load "${family}"; using the default font`, error);
    return null;
  }
}
