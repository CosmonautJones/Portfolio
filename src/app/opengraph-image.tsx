import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Travis Jones - Software Developer";
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
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 16,
            display: "flex",
          }}
        >
          Travis Jones
        </div>
        <div style={{ fontSize: 28, color: "#a1a1aa", display: "flex" }}>
          Software Developer
        </div>
      </div>
    ),
    { ...size }
  );
}
