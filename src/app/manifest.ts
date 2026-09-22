import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Travis Jones, AI Engineer",
    short_name: "Travis Jones",
    description: "Portfolio of Travis Jones, AI engineer in Ann Arbor / Ypsilanti, Michigan.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e1514",
    theme_color: "#0e1514",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
