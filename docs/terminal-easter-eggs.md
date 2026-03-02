# Terminal & Easter Eggs

## Terminal

The terminal is a slide-out sheet accessible via a toggle button in the navbar. It has two modes: `main` (standard) and `retro` (hidden CRT aesthetic version).

### Architecture

```
TerminalProvider (src/components/terminal/terminal-provider.tsx)
  └── Manages open/close state, mode, history

TerminalSheet (src/components/terminal/terminal-sheet.tsx)
  ├── TerminalShell (main or retro variant)
  │     ├── TerminalOutput (src/components/terminal/terminal-output.tsx)
  │     └── TerminalInput (src/components/terminal/terminal-input.tsx)
  └── CRT overlay when mode === "retro"

TerminalToggle (src/components/terminal/terminal-toggle.tsx)
  └── Button in Navbar to open main terminal
```

### Command System (`src/lib/terminal/`)

| File | Purpose |
|---|---|
| `commands.ts` | All command implementations and registries |
| `parser.ts` | Parse raw input into `{ name, args }` |
| `completer.ts` | Tab-completion for command names |
| `history.ts` | Command history (up/down arrow navigation) |
| `types.ts` | `Command`, `CommandContext`, `CommandResult` types |

### Main Terminal Commands

| Command | Description |
|---|---|
| `help` | List all available commands |
| `about` | Bio, experience timeline, social links |
| `skills` | Skill categories (Frontend, Backend, Infrastructure) |
| `projects` | List portfolio projects |
| `neofetch` | System info with ASCII art (shows current XP level) |
| `matrix` | Matrix rain ASCII animation |
| `cowsay [msg]` | ASCII cow with custom message |
| `fortune` | Random developer quote |
| `clear` | Clear terminal output |
| `sudo [cmd]` | Random humorous rejection message |
| `vaporwave` | **Hidden command** — activates vaporwave color mode for 30s |

### Retro Terminal Commands (Hidden Terminal Mode)

| Command | Description |
|---|---|
| `help` | List commands |
| `whois` | ASCII identity card |
| `ls` | Fake directory listing |
| `cat [file]` | Read `readme.txt` (hints at the vault) or `.hidden` |
| `fortune` | Random developer quote |
| `clear` | Clear output |

### Command Context

```typescript
interface CommandContext {
  theme: "main" | "retro";
  level?: number;
  title?: string;
  onDiscover?: (eggId: string) => void;
}
```

The `vaporwave` command triggers `onDiscover("vaporwave")` via the context callback.

### `CommandResult`

```typescript
interface CommandResult {
  output: Array<{ type: "text" | "system" | "error" | "ascii"; content: string }>;
  clear?: boolean;  // If true, clears existing output
}
```

---

## Easter Eggs

Defined in `src/lib/easter-eggs/registry.ts`. 6 easter eggs total.

| ID | Name | Location | Achievement |
|---|---|---|---|
| `konami_code` | Konami Code | Anywhere on site | `konami` |
| `hidden_terminal` | The Red Pill | Home page | `red_pill` |
| `vault_complete` | Halliday's Egg | The Vault | `halliday_egg` |
| `cosmonaut_cocktail` | The Cosmonaut | Cocktail Mixer | — |
| `hitchhiker_42` | The Answer | ClaudeBot's Adventure | — |
| `vaporwave` | A E S T H E T I C | Terminal | — |

### Konami Code

`src/lib/easter-eggs/konami.ts` — Detects the sequence: ↑↑↓↓←→←→BA

`src/components/easter-eggs/konami-effects.tsx` — Global keyboard listener mounted in root layout. Triggers `unlockAchievement("konami")` via `VisitorContext` when sequence detected.

`src/hooks/use-konami.ts` — Hook for detecting Konami code sequence.

### Hidden Terminal

`src/components/easter-eggs/hidden-terminal.tsx` — A hidden element on the home page. When discovered/activated, it opens the terminal in `retro` mode.

`src/components/easter-eggs/crt-overlay.tsx` — CRT scanline aesthetic CSS overlay.

`src/components/easter-eggs/pixel-sprite.tsx` — Pixel art sprite component used in easter egg UI.

Discovering the hidden terminal triggers `unlockAchievement("red_pill")` and `awardXP("open_hidden_terminal")`.

### The Vault

Route: `/vault` (no navigation link — must know the URL)
Location: `src/app/(public)/vault/page.tsx`

Components in `src/components/vault/`:
- `vault-cube.tsx` — 3D rotating cube decoration
- `simon-says.tsx` — Simon Says puzzle game
- `vault-discoveries.tsx` — Displays discovered easter eggs
- `vault-letter.tsx` — Letter/message to the visitor

Completing the vault triggers `unlockAchievement("halliday_egg")`.

### `vaporwave` Command

Running `vaporwave` in the main terminal adds class `vaporwave` to `document.documentElement` for 30 seconds, shifting the color palette. Triggers `addDiscovery("vaporwave")`.

### `use-easter-egg` Hook

`src/hooks/use-easter-egg.ts` — Hook for triggering easter egg discovery, handling XP award and achievement unlock in one call.

### `use-key-sequence` Hook

`src/hooks/use-key-sequence.ts` — Generic hook for detecting arbitrary key sequences. Used by the Konami code detector.

---

## Color Schemes

`src/components/layout/color-scheme-picker.tsx` — Lets users select from color scheme variants: `ocean`, `ember`, `emerald`. Stored in `localStorage` key `color-scheme` and applied as CSS class `theme-{name}`.

`src/hooks/use-color-scheme.ts` — Hook for reading/writing the color scheme preference.

---

## Static Data Powers Terminal

`src/lib/constants.ts` exports `SITE_CONFIG`, `NAV_LINKS`, `PROJECTS`, `SKILLS`, `SKILL_CATEGORIES`, and `EXPERIENCE`. The terminal commands `about`, `skills`, `projects`, and `neofetch` all pull from this shared data source.

## Related Files

- `src/lib/terminal/` — Command system
- `src/components/terminal/` — UI components
- `src/lib/easter-eggs/` — Easter egg definitions and Konami logic
- `src/components/easter-eggs/` — Easter egg trigger UI
- `src/hooks/use-easter-egg.ts` — Easter egg hook
- `src/hooks/use-key-sequence.ts` — Key sequence detection
- `src/hooks/use-konami.ts` — Konami code hook
- `src/app/(public)/vault/page.tsx` — Vault route
- `src/components/vault/` — Vault UI
- `src/lib/constants.ts` — Static site data
