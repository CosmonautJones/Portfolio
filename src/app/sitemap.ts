import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://travisjohnjones.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/work`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const admin = createAdminClient();
    const { data: tools } = await admin
      .from("tools")
      .select("slug, updated_at")
      .eq("status", "enabled");

    const toolPages: MetadataRoute.Sitemap = (tools ?? []).map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: tool.updated_at ? new Date(tool.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...toolPages];
  } catch {
    return staticPages;
  }
}
