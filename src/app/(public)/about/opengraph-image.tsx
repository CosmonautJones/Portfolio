import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "About Travis Jones";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#a1a1aa",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          About
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            Travis Jones
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#a1a1aa",
              maxWidth: 900,
            }}
          >
            Full-stack developer. Game engine tinkerer. Easter egg hider.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#71717a",
          }}
        >
          <span>travisjohnjones.com</span>
          <span>TypeScript · Next.js · Supabase</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
