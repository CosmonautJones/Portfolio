"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const toolSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric with hyphens only"),
  name: z.string().min(1).max(200),
  type: z.enum(["internal", "external"]),
  url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  tags: z.string().optional(),
  icon: z.string().optional(),
  build_hook_url: z.string().url().optional().or(z.literal("")),
}).refine(
  (data) => data.type !== "external" || (data.url && data.url.length > 0),
  { message: "URL is required for external tools", path: ["url"] }
);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function createTool(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const parsed = toolSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    type: formData.get("type"),
    url: formData.get("url") || "",
    description: formData.get("description"),
    tags: formData.get("tags"),
    icon: formData.get("icon"),
    build_hook_url: formData.get("build_hook_url") || "",
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await admin.from("tools").insert({
    slug: parsed.data.slug,
    name: parsed.data.name,
    type: parsed.data.type,
    url: parsed.data.url || null,
    description: parsed.data.description || null,
    tags,
    icon: parsed.data.icon || null,
    build_hook_url: parsed.data.build_hook_url || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "A tool with this slug already exists" };
    return { error: error.message };
  }

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return { success: true };
}

export async function updateTool(toolId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const parsed = toolSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    type: formData.get("type"),
    url: formData.get("url") || "",
    description: formData.get("description"),
    tags: formData.get("tags"),
    icon: formData.get("icon"),
    build_hook_url: formData.get("build_hook_url") || "",
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await admin.from("tools").update({
    slug: parsed.data.slug,
    name: parsed.data.name,
    type: parsed.data.type,
    url: parsed.data.url || null,
    description: parsed.data.description || null,
    tags,
    icon: parsed.data.icon || null,
    build_hook_url: parsed.data.build_hook_url || null,
  }).eq("id", toolId);

  if (error) return { error: error.message };

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return { success: true };
}

export async function toggleToolStatus(toolId: string, currentStatus: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";

  const { error } = await admin.from("tools").update({ status: newStatus }).eq("id", toolId);
  if (error) return { error: error.message };

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return { success: true };
}

export async function deleteTool(toolId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin.from("tools").delete().eq("id", toolId);
  if (error) return { error: error.message };

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return { success: true };
}
