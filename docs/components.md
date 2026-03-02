# Component Inventory

## Overview

All components live under `src/components/`. They are organized by feature domain. shadcn/ui primitives are in `src/components/ui/`.

## Admin (`src/components/admin/`)

| Component | Description |
|---|---|
| `deploy-button.tsx` | Triggers Netlify build webhook via `triggerDeploy` action |
| `tool-form-dialog.tsx` | Create/edit tool dialog with GitHub import, all three tool types |
| `tools-table.tsx` | Data table displaying all tools with edit/delete/toggle controls |

## Adventure (`src/components/adventure/`)

| Component | Description |
|---|---|
| `AdventureShell.tsx` | Main layout wrapper for the adventure page |
| `GameCanvas.tsx` | HTML5 Canvas element + game loop integration |
| `CRTOverlay.tsx` | CRT scanline visual overlay |
| `ControlsPanel.tsx` | On-screen keyboard/touch controls reference |
| `CurrentRunPanel.tsx` | Live score, level, death cause during run |
| `GameInfoPanel.tsx` | Game description and info sidebar |
| `LeaderboardPanel.tsx` | Top global scores from `game_scores` table |
| `RecentScoresPanel.tsx` | Current user's recent runs |
| `RetroPanel.tsx` | Retro-styled information panel |
| `StatsPanel.tsx` | Player statistics display |
| `welcome-banner.tsx` | First-visit welcome message |

## Auth (`src/components/auth/`)

| Component | Description |
|---|---|
| `login-form.tsx` | GitHub OAuth sign-in button and flow |
| `user-menu.tsx` | Avatar dropdown with profile info and sign-out |

## Demos (`src/components/demos/`)

| Component | Description |
|---|---|
| `cocktail-mixer.tsx` | Animated cocktail recipe demo |
| `demo-loader.tsx` | Dynamic loader for work page demos by slug |
| `pixel-art-editor.tsx` | 32×32 canvas pixel art editor with palette |

## Easter Eggs (`src/components/easter-eggs/`)

| Component | Description |
|---|---|
| `crt-overlay.tsx` | CRT scanline CSS overlay for retro terminal |
| `hidden-terminal.tsx` | Hidden trigger element on home page |
| `konami-effects.tsx` | Global Konami code listener, mounted in root layout |
| `pixel-sprite.tsx` | Renders a pixel art sprite from 2D array data |

## Layout (`src/components/layout/`)

| Component | Description |
|---|---|
| `color-scheme-picker.tsx` | Color scheme selector (ocean/ember/emerald) |
| `footer.tsx` | Site footer with links |
| `mobile-nav.tsx` | Mobile hamburger navigation menu |
| `navbar.tsx` | Top navigation bar with links, theme toggle, terminal toggle, user menu |

## Portfolio (`src/components/portfolio/`)

| Component | Description |
|---|---|
| `about-preview.tsx` | Brief about section on home page |
| `approach-section.tsx` | Development approach/philosophy section |
| `contact-form.tsx` | Contact form |
| `experience-timeline.tsx` | Career timeline |
| `featured-projects.tsx` | Featured projects grid on home page |
| `hero-section.tsx` | Hero/intro section on home page |
| `project-card.tsx` | Card for displaying a portfolio project |
| `skills-grid.tsx` | Skills display by category |
| `what-i-do.tsx` | Services/specialties section |

## Progression (`src/components/progression/`)

| Component | Description |
|---|---|
| `xp-bar.tsx` | XP progress bar with current level and next threshold |
| `achievement-panel.tsx` | Panel listing earned achievements |
| `achievement-toast.tsx` | Toast notification shown when achievement unlocked |
| `level-up-overlay.tsx` | Full-screen overlay animation on level-up (mounted in root layout) |

## Terminal (`src/components/terminal/`)

| Component | Description |
|---|---|
| `terminal-provider.tsx` | Context provider for terminal open/close state and mode |
| `terminal-sheet.tsx` | Sheet wrapper that hosts the terminal UI |
| `terminal-shell.tsx` | Main terminal shell layout (prompt, output, input) |
| `terminal-input.tsx` | Command input with history and tab-completion |
| `terminal-output.tsx` | Renders command output (text/system/error/ascii types) |
| `terminal-toggle.tsx` | Button in navbar to open the terminal |

## Tools (`src/components/tools/`)

| Component | Description |
|---|---|
| `embedded-tool-frame.tsx` | `<iframe>` pointing to `/api/embed/[slug]` |
| `external-tool-frame.tsx` | `<iframe>` pointing to external URL |
| `json-formatter.tsx` | JSON parse, format, validate tool |
| `markdown-previewer.tsx` | Split-pane markdown editor with live preview |
| `tool-card.tsx` | Card in tools browser grid |
| `tool-renderer.tsx` | Dispatch component — selects embedded/external/internal rendering |
| `tools-filter.tsx` | Search and tag filter UI for tools browser |
| `notes/note-card.tsx` | Note card display |
| `notes/note-editor.tsx` | Create/edit note form |
| `notes/notes-app.tsx` | Notes tool main container |
| `project-tracker/project-card.tsx` | Project card |
| `project-tracker/project-form.tsx` | Create/edit project form |
| `project-tracker/project-tracker-app.tsx` | Project tracker main container |
| `project-tracker/task-form.tsx` | Create/edit task form |
| `project-tracker/task-list.tsx` | Task list within project |

## UI (`src/components/ui/`)

shadcn/ui primitives (new-york style) plus custom animation wrappers.

### shadcn/ui Primitives

| Component | Description |
|---|---|
| `alert-dialog.tsx` | Confirmation dialogs |
| `avatar.tsx` | User avatar with fallback |
| `badge.tsx` | Tag/label badge |
| `breadcrumb.tsx` | Breadcrumb navigation |
| `button.tsx` | Button with variants |
| `card.tsx` | Card container |
| `dialog.tsx` | Modal dialog |
| `dropdown-menu.tsx` | Dropdown menu |
| `form.tsx` | Form field wrapper with error display |
| `input.tsx` | Text input |
| `label.tsx` | Form label |
| `select.tsx` | Select dropdown |
| `separator.tsx` | Visual divider |
| `sheet.tsx` | Slide-out panel |
| `sonner.tsx` | Sonner toast provider |
| `switch.tsx` | Toggle switch |
| `table.tsx` | Data table |
| `tabs.tsx` | Tab navigation |
| `textarea.tsx` | Multi-line text input |

### Animation Wrappers

**`animate-on-scroll.tsx`**

Wraps children with `useInView`-triggered entrance animations. Uses `motion/react`.

Props:
- `variant`: `"fade-up" | "fade-in" | "scale-in" | "slide-in-left" | "slide-in-right"`
- `delay`: number (seconds)
- `duration`: number (seconds)
- `className`: string

Respects `prefers-reduced-motion` via `useReducedMotion()`.

**`stagger-children.tsx`**

Container/child pair for staggered entrance animations. Children receive sequential delays.

## Vault (`src/components/vault/`)

| Component | Description |
|---|---|
| `simon-says.tsx` | Simon Says color-sequence puzzle |
| `vault-cube.tsx` | 3D rotating CSS cube decoration |
| `vault-discoveries.tsx` | List of discovered easter eggs |
| `vault-letter.tsx` | Personal message to vault discoverers |

## Animation Easing

Consistent easing constant used throughout: `[0.16, 1, 0.3, 1]` (custom cubic bezier — fast-out, slow-in feel).

## Related Files

- `src/components/` — All components
- `src/app/globals.css` — Global styles, CSS custom properties
- `src/lib/utils.ts` — `cn()` utility for class merging (clsx + tailwind-merge)
