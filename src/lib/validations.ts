import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string(),
});

export const toolSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric with hyphens"),
  name: z.string().min(1).max(200),
  type: z.enum(["internal", "external", "embedded"]),
  url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  tags: z.string().optional(),
  icon: z.string().optional(),
  build_hook_url: z.string().url().optional().or(z.literal("")),
}).refine(
  (data) => data.type !== "external" || (data.url && data.url.length > 0),
  { message: "URL is required for external tools", path: ["url"] }
);
