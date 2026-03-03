# Guide: Adding a New Tool

Tools are the core feature of the authenticated hub at `/tools`. This guide covers how to add each type of tool.

## Tool Types

| Type | How it renders | When to use |
|---|---|---|
| `internal` | React component (lazy loaded) | Custom interactive tools built into the app |
| `external` | iframe pointing to external URL | Third-party tools or separate deployments |
| `embedded` | iframe loading from `/api/embed/[slug]` | Self-contained HTML/CSS/JS from a GitHub repo |

---

## Adding an Internal Tool

Internal tools are React components registered in the tools registry.

### Step 1: Create the component

Create the component at `src/components/tools/<name>.tsx`. The component receives no props — it is self-contained.

```typescript
// src/components/tools/my-tool.tsx
"use client";

export default function MyTool() {
  return (
    <div>
      {/* Your tool UI */}
    </div>
  );
}
```

### Step 2: Register it in the tools registry

Add a lazy import entry to `src/lib/tools-registry.ts`:

```typescript
const toolComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "json-formatter": React.lazy(() => import("@/components/tools/json-formatter")),
  "notes": React.lazy(() => import("@/components/tools/notes/notes-app")),
  // Add your tool:
  "my-tool": React.lazy(() => import("@/components/tools/my-tool")),
};
```

The key must match the `slug` you use in the database.

### Step 3: Add a database record

Use the admin panel at `/admin/tools` to create a tool record:
- **Slug**: `my-tool` (must match the registry key)
- **Type**: `internal`
- **Status**: `enabled`
- **Name**, **Description**, **Tags**, **Icon**: as appropriate

Or add a migration in `supabase/migrations/`.

---

## Adding an External Tool

External tools point to an external URL and are rendered in an iframe.

### Via Admin Panel

1. Go to `/admin/tools`
2. Click "Add Tool"
3. Set **Type** to `external`
4. Enter the **URL** field (required for external tools)
5. Fill in name, description, tags, icon

No code changes needed.

---

## Adding an Embedded Tool (from GitHub)

Embedded tools are self-contained HTML/CSS/JS documents assembled from a GitHub repository.

### Via Admin Panel (Recommended)

1. Go to `/admin/tools`
2. Click "Add Tool"
3. Click "Import from GitHub" and enter the repo URL
4. The form auto-fills name, description, and slug from repo metadata
5. Click "Fetch HTML" to assemble the tool from the repo's `index.html`
6. Review and save

### How GitHub Import Works

`importFromGitHub(repoUrl)` in `src/actions/tools.ts`:
1. Parses owner/repo from URL
2. Calls `GET /repos/{owner}/{repo}` for metadata
3. Returns pre-filled form data

`fetchRepoHtml(repoUrl)`:
1. Gets default branch
2. Fetches full file tree
3. Finds `index.html` (root, then `src/`, then any path)
4. Replaces `<link rel="stylesheet">` with inline `<style>`
5. Replaces `<script src>` with inline `<script>`
6. Returns assembled HTML string stored in `html_content`

Set `GITHUB_TOKEN` environment variable to avoid API rate limits (5000 vs 60 req/hr).

---

## Tool Validation

Tools are validated with `toolSchema` from `src/lib/validations.ts`:
- `slug`: 1-100 chars, lowercase alphanumeric + hyphens only
- `type`: must be `internal`, `external`, or `embedded`
- `url`: must be a valid URL if type is `external`
- `build_hook_url`: must be a valid URL if set

---

## Related Documents

- [../tool-system.md](../tool-system.md) — Tool system architecture
- [../server-actions.md](../server-actions.md) — Tool server action signatures
- [../database.md](../database.md) — `tools` table schema
- [../components.md](../components.md) — Tool component inventory
