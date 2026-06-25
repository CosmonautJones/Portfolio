import { ImageResponse } from "next/og";
import { PROJECTS } from "@/lib/constants";

export const runtime = "edge";
export const alt = "Project by Travis Jones";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.demoUrl === `/work/${slug}`);
  const title = project?.title ?? "Project";
  const description =
    project?.description ??
    "Interactive demos and projects built by Travis Jones.";
  const tags = project?.tags ?? [];

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
          {project?.role ?? "Project"} · Travis Jones
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
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
              fontSize: 26,
              color: "#a1a1aa",
              maxWidth: 1000,
              lineHeight: 1.4,
            }}
          >
            {description.length > 160
              ? description.slice(0, 157) + "..."
              : description}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {tags.slice(0, 5).map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid #3f3f46",
                fontSize: 18,
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
