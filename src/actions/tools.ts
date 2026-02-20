"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { toolSchema } from "@/lib/validations";
import { isAdminEmail } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }
  return user;
}

function githubHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Portfolio-Admin",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

function parseGitHubUrl(url: string) {
  const match = url.match(
    /github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

// ---------------------------------------------------------------------------
// Import metadata from GitHub
// ---------------------------------------------------------------------------

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

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return { error: "Invalid GitHub URL. Expected: github.com/owner/repo" };
    }
    const { owner, repo } = parsed;
    const headers = githubHeaders();

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
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

    const slug = repo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    return {
      data: {
        name: repo
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

// ---------------------------------------------------------------------------
// Fetch repo source and assemble into single HTML document
// ---------------------------------------------------------------------------

async function fetchFileContent(rawUrl: string): Promise<string> {
  const res = await fetch(rawUrl);
  if (!res.ok) return "";
  return res.text();
}

export async function fetchRepoHtml(
  repoUrl: string
): Promise<{ html?: string; error?: string }> {
  try {
    await requireAdmin();

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return { error: "Invalid GitHub URL" };
    }
    const { owner, repo } = parsed;
    const headers = githubHeaders();

    // Get default branch
    const repoRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    if (!repoRes.ok) return { error: "Could not fetch repository" };
    const repoData = await repoRes.json();
    const branch = repoData.default_branch ?? "main";

    // Get file tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers }
    );
    if (!treeRes.ok) return { error: "Could not fetch repository tree" };
    const treeData = await treeRes.json();

    const files: { path: string; url: string }[] = (treeData.tree ?? [])
      .filter((f: { type: string }) => f.type === "blob")
      .map((f: { path: string }) => ({
        path: f.path,
        url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${f.path}`,
      }));

    // Find index.html (root or in src/)
    const indexFile =
      files.find((f) => f.path === "index.html") ??
      files.find((f) => f.path === "src/index.html") ??
      files.find((f) => f.path.endsWith("/index.html"));

    if (!indexFile) {
      return { error: "No index.html found in repository" };
    }

    let html = await fetchFileContent(indexFile.url);
    if (!html.trim()) {
      return { error: "index.html is empty" };
    }

    // Inline CSS files referenced in the HTML
    const cssFiles = files.filter((f) => f.path.endsWith(".css"));
    for (const css of cssFiles) {
      const filename = css.path.split("/").pop()!;
      // Replace <link> tags referencing this CSS file with inline <style>
      const linkPattern = new RegExp(
        `<link[^>]*href=["'][^"']*${filename.replace(".", "\\.")}["'][^>]*/?>`,
        "gi"
      );
      if (linkPattern.test(html)) {
        const content = await fetchFileContent(css.url);
        html = html.replace(linkPattern, `<style>\n${content}\n</style>`);
      }
    }

    // Inline JS files referenced in the HTML
    const jsFiles = files.filter(
      (f) => f.path.endsWith(".js") && !f.path.includes("node_modules")
    );
    for (const js of jsFiles) {
      const filename = js.path.split("/").pop()!;
      const scriptPattern = new RegExp(
        `<script[^>]*src=["'][^"']*${filename.replace(".", "\\.")}["'][^>]*>\\s*</script>`,
        "gi"
      );
      if (scriptPattern.test(html)) {
        const content = await fetchFileContent(js.url);
        html = html.replace(
          scriptPattern,
          `<script>\n${content}\n</script>`
        );
      }
    }

    return { html };
  } catch {
    return { error: "Failed to fetch repository source" };
  }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

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

    const htmlContent = formData.get("html_content") as string | null;

    const { error } = await admin.from("tools").insert({
      slug: parsed.data.slug,
      name: parsed.data.name,
      type: parsed.data.type,
      url: parsed.data.url || null,
      description: parsed.data.description || null,
      tags,
      icon: parsed.data.icon || null,
      build_hook_url: parsed.data.build_hook_url || null,
      html_content: parsed.data.type === "embedded" ? htmlContent : null,
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

    const htmlContent = formData.get("html_content") as string | null;

    const { error } = await admin.from("tools").update({
      slug: parsed.data.slug,
      name: parsed.data.name,
      type: parsed.data.type,
      url: parsed.data.url || null,
      description: parsed.data.description || null,
      tags,
      icon: parsed.data.icon || null,
      build_hook_url: parsed.data.build_hook_url || null,
      html_content: parsed.data.type === "embedded" ? htmlContent : null,
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
