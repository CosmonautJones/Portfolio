# Tool System

## Overview

The tool system is the core feature of the authenticated hub. Tools are stored in the `tools` database table and can be one of three types. Admins manage tools via the admin panel at `/admin/tools`.

## Tool Types

Defined in `src/lib/types.ts`:

### `internal`

React components registered in `src/lib/tools-registry.ts` via `React.lazy()`. Rendered directly inside the `/tools/[slug]` page.

**Currently registered internal tools:**

| Slug | Component |
|---|---|
| `json-formatter` | `src/components/tools/json-formatter.tsx` |
| `notes` | `src/components/tools/notes/notes-app.tsx` |
| `markdown-previewer` | `src/components/tools/markdown-previewer.tsx` |
| `project-tracker` | `src/components/tools/project-tracker/project-tracker-app.tsx` |

**To add a new internal tool:**
1. Create the component at `src/components/tools/<name>.tsx`
2. Add a lazy import entry to `src/lib/tools-registry.ts`
3. Add a tool record to the database (admin panel or migration)

### `external`

Links to an external URL. Rendered as an iframe (`ExternalToolFrame`) pointing to the `url` field. Requires `url` to be non-null.

### `embedded`

Self-contained HTML/CSS/JS document stored in the `html_content` database column. Served via `/api/embed/[slug]` as raw HTML and rendered in an iframe (`EmbeddedToolFrame`).

Embedded tools are assembled from GitHub repositories using `fetchRepoHtml()` — CSS and JS files are inlined into the HTML document.

## Tool Data Model

```typescript
interface Tool {
  id: string;
  slug: string;           // URL-safe identifier, unique
  name: string;
  type: "internal" | "external" | "embedded";
  status: "enabled" | "disabled";
  url: string | null;     // Required for external tools
  description: string | null;
  tags: string[];
  icon: string | null;    // Lucide icon name
  build_hook_url: string | null;
  html_content: string | null;  // Only for embedded type
  created_at: string;
}
```

## Tool Renderer

`src/components/tools/tool-renderer.tsx` — Client component that selects the correct rendering strategy:

```
ToolRenderer
  ├── status === "disabled" → disabled message
  ├── type === "embedded" → EmbeddedToolFrame (iframe to /api/embed/[slug])
  ├── type === "external" → ExternalToolFrame (iframe to tool.url)
  └── type === "internal" → lazy-loaded React component from registry
```

## Admin Panel

Route: `/admin/tools` (`src/app/(protected)/admin/tools/page.tsx`)

Components:
- `src/components/admin/tools-table.tsx` — Data table with all tools
- `src/components/admin/tool-form-dialog.tsx` — Create/edit dialog
- `src/components/admin/deploy-button.tsx` — Netlify build webhook trigger

All mutations use server actions in `src/actions/tools.ts`.

## Server Actions (`src/actions/tools.ts`)

All actions call `requireAdmin()` first.

| Action | Description |
|---|---|
| `importFromGitHub(repoUrl)` | Fetches repo metadata (name, description, topics, homepage) from GitHub API |
| `fetchRepoHtml(repoUrl)` | Fetches repo tree, finds `index.html`, inlines all `.css` and `.js` files |
| `createTool(formData)` | Creates a new tool record |
| `updateTool(toolId, formData)` | Updates existing tool |
| `toggleToolStatus(toolId, currentStatus)` | Enables/disables a tool |
| `deleteTool(toolId)` | Deletes a tool |

### GitHub Import Flow

1. Parse owner/repo from GitHub URL
2. `GET /repos/{owner}/{repo}` — fetch name, description, topics, homepage
3. Build slug from repo name (lowercase, hyphens)
4. Return pre-filled form data for admin review

### `fetchRepoHtml` Assembly

1. Get default branch name
2. Fetch full file tree (`/git/trees/{branch}?recursive=1`)
3. Find `index.html` (root, then `src/`, then any path)
4. Replace `<link>` CSS references with inline `<style>` blocks
5. Replace `<script src>` references with inline `<script>` blocks
6. Return the assembled HTML string for storage in `html_content`

### GitHub API Rate Limits

Set `GITHUB_TOKEN` environment variable to increase rate limits (5000 req/hr vs 60 req/hr unauthenticated).

## Internal Tool Components

### Notes App (`src/components/tools/notes/`)

Full CRUD notes with Supabase backend, per-user via RLS. Components:
- `notes-app.tsx` — Main container
- `note-editor.tsx` — Create/edit with title + content
- `note-card.tsx` — Display card

Uses `src/actions/notes.ts` server actions.

### Project Tracker (`src/components/tools/project-tracker/`)

Project and task management. Components:
- `project-tracker-app.tsx` — Main container
- `project-card.tsx` — Project display
- `project-form.tsx` — Create/edit project
- `task-list.tsx` — Tasks within a project
- `task-form.tsx` — Create/edit task

Uses `src/actions/projects.ts` server actions.

### JSON Formatter (`src/components/tools/json-formatter.tsx`)

Client-side JSON parse, format, and validate.

### Markdown Previewer (`src/components/tools/markdown-previewer.tsx`)

Split-pane markdown editor with live preview. Uses `react-markdown` with `remark-gfm`.

## Validation

`src/lib/validations.ts` — `toolSchema` (Zod):
- `slug`: 1-100 chars, lowercase alphanumeric + hyphens
- `type`: enum of three tool types
- `url`: valid URL or empty (required for external type)
- `build_hook_url`: valid URL or empty

## Related Files

- `src/lib/types.ts` — `Tool` interface
- `src/lib/tools-registry.ts` — Internal tool registry
- `src/lib/validations.ts` — `toolSchema`
- `src/actions/tools.ts` — All tool server actions
- `src/components/tools/tool-renderer.tsx` — Rendering dispatch
- `src/app/api/embed/[slug]/route.ts` — Embedded tool endpoint
- `src/app/(protected)/tools/[slug]/page.tsx` — Tool detail page
- `src/app/(protected)/admin/tools/page.tsx` — Admin management page
