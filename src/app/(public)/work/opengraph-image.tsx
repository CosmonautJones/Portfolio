import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Projects by Travis Jones";
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
          Work
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            Projects
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#a1a1aa",
              maxWidth: 900,
            }}
          >
            Each one started with &ldquo;I wonder if I could...&rdquo;
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["Pixel Art", "Cocktail Mixer", "Adventure", "Plan'd"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid #3f3f46",
                fontSize: 20,
                color: "#d4d4d8",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
