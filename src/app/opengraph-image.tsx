import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/constants";
import { loadGoogleFont } from "@/lib/og-font";

export const runtime = "edge";
export const alt = "Travis Jones, AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#e4ece8";
const MUTED = "#9aaba5";
const GROUND = "#0e1514";
const SIGNAL = "#f0b04a";
const RULE = "rgba(228,236,232,0.22)";

export default async function Image() {
  const name = SITE_CONFIG.name;
  const kicker = `${SITE_CONFIG.title}  ·  ${SITE_CONFIG.location}`;
  // Non-breaking hyphen keeps "read-only" together when the line wraps.
  const lede = SITE_CONFIG.tagline.replace("read-only", "read‑only");

  const [display, mono, sans] = await Promise.all([
    loadGoogleFont("Archivo:wdth,wght@118,800", name),
    loadGoogleFont("IBM+Plex+Mono:wght@500", kicker.toUpperCase()),
    loadGoogleFont("IBM+Plex+Sans:wght@400", lede),
  ]);
  const fonts = [
    display && { name: "Archivo", data: display, weight: 800 as const, style: "normal" as const },
    mono && { name: "Plex Mono", data: mono, weight: 500 as const, style: "normal" as const },
    sans && { name: "Plex Sans", data: sans, weight: 400 as const, style: "normal" as const },
  ].filter((font): font is NonNullable<typeof font> => Boolean(font));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: GROUND,
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
            <path d="M14 6.5v23c0 4.4 2.4 6.8 7 6.8h1.5" stroke={INK} strokeWidth="5.6" strokeLinejoin="round" />
            <path d="M6 17h28.8" stroke={INK} strokeWidth="5.6" strokeLinejoin="round" />
            <path d="M32 17v20.5c0 5.2-3 8-8.3 8H18" stroke={INK} strokeWidth="5.6" strokeLinejoin="round" />
            <rect x="29.2" y="4.2" width="5.6" height="5.6" fill={SIGNAL} />
          </svg>
          <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 20, letterSpacing: 2.5, color: MUTED }}>
            {kicker.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 132, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
            {name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              paddingTop: 28,
              borderTop: `2px solid ${RULE}`,
              fontFamily: "Plex Sans",
              fontSize: 30,
              lineHeight: 1.45,
              color: INK,
              maxWidth: 1056,
            }}
          >
            {lede}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
