import { getPublicActivity } from "@/lib/github-activity";

export async function GET() {
  const data = await getPublicActivity();
  return Response.json(data, {
    headers: { "Cache-Control": data.unavailable ? "public, max-age=60, s-maxage=300" : "public, max-age=3600, s-maxage=3600" },
  });
}
