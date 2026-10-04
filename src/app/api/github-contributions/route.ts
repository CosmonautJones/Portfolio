import { getContributions } from "@/lib/github-contributions";

export async function GET() {
  const data = await getContributions();
  return Response.json(data, {
    headers: {
      "Cache-Control": data.stale
        ? "public, max-age=60, s-maxage=300"
        : "public, max-age=3600, s-maxage=3600",
    },
  });
}
