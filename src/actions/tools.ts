"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { toolSchema } from "@/lib/validations";

interface GitHubRepoData {
  name: string;
  slug: string;
  description: string;
  url: string;
  tags: string;
  homepage: string | null;
}

export async function importFromGitHub(
  repoUrl: string
): Promise<{ data?: GitHubRepoData; error?: string }> {
  try {
    await requireAdmin();

    const match = repoUrl.match(
      /github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/
    );
    if (!match) {
      return { error: "Invalid GitHub URL. Expected: github.com/owner/repo" };
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Portfolio-Admin",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}`,
      { headers }
    );

    if (!res.ok) {
      if (res.status === 404) return { error: "Repository not found" };
      if (res.status === 403) return { error: "GitHub API rate limit reached" };
      return { error: `GitHub API error: ${res.status}` };
    }

    const data = await res.json();

    const topics: string[] = data.topics ?? [];
    if (data.language && !topics.includes(data.language.toLowerCase())) {
      topics.unshift(data.language.toLowerCase());
    }

    const slug = cleanRepo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    return {
      data: {
        name: cleanRepo
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
        slug,
        description: data.description ?? "",
        url: data.homepage || data.html_url,
        tags: topics.join(", "),
        homepage: data.homepage || null,
      },
    };
  } catch {
    return { error: "Failed to fetch repository data" };
  }
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function createTool(formData: FormData) {
  try {
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
    if (!parsed.success) {
      return { error: parsed.error.issues.map((e) => e.message).join(", ") };
    }

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
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateTool(toolId: string, formData: FormData) {
  try {
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
    if (!parsed.success) {
      return { error: parsed.error.issues.map((e) => e.message).join(", ") };
    }

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
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function toggleToolStatus(toolId: string, currentStatus: string) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";

    const { error } = await admin.from("tools").update({ status: newStatus }).eq("id", toolId);
    if (error) return { error: error.message };

    revalidatePath("/admin/tools");
    revalidatePath("/tools");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function deleteTool(toolId: string) {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin.from("tools").delete().eq("id", toolId);
    if (error) return { error: error.message };

    revalidatePath("/admin/tools");
    revalidatePath("/tools");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}
