import { ImageResponse } from "next/og";
import { getAchievement } from "@/lib/achievements";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const achievement = getAchievement(id);

  const title = achievement?.name ?? "Achievement Unlocked";
  const description =
    achievement?.description ?? "Found something on travisjohnjones.com.";
  const xp = achievement?.xpReward ?? 0;

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
            color: "#fbbf24",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Achievement Unlocked
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 140,
              height: 140,
              borderRadius: 999,
              background: "rgba(251, 191, 36, 0.15)",
              border: "3px solid rgba(251, 191, 36, 0.5)",
              fontSize: 72,
            }}
          >
            🏆
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                fontSize: 64,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "#a1a1aa",
                maxWidth: 900,
              }}
            >
              {description}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#71717a",
          }}
        >
          <span>travisjohnjones.com</span>
          {xp > 0 && (
            <span
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: 999,
                background: "rgba(251, 191, 36, 0.15)",
                color: "#fbbf24",
                fontWeight: 600,
              }}
            >
              +{xp} XP
            </span>
          )}
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
