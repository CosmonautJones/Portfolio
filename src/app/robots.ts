import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/tools/", "/login", "/auth/"],
      },
    ],
    sitemap: "https://travisjohnjones.com/sitemap.xml",
  };
}
