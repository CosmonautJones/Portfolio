# The Halliday Protocol

> *"Three hidden keys open three secret gates..."*
>
> A seven-wave transformation of a portfolio site into an interactive experience
> packed with easter eggs, games, progression, and discovery.

---

## Progress Overview

| Wave | Name | Status |
|------|------|--------|
| 1 | THE BONES | COMPLETE |
| 2 | THE MAGIC | Not Started |
| 3 | THE ARCADE | Not Started |
| 4 | THE POLISH | Not Started |
| 5 | THE WORLD | Not Started |
| 6 | THE DEPTH | Not Started |
| 7 | THE FUTURE | Not Started |

**Completed: 1 / 7 waves**

---

## Wave 1: THE BONES

Progression system foundation — XP, achievements, visitor profiles, and streak tracking.

- [x] Create profiles migration (`009_create_profiles.sql`)
- [x] Create events migration (`010_create_events.sql`)
- [x] Add game type migration (`011_add_game_type.sql`)
- [x] Add progression types to `src/lib/types.ts`
- [x] Build XP system with level thresholds and RPO-inspired titles (`src/lib/xp.ts`)
- [x] Build achievement registry with 13 achievements including 5 secret (`src/lib/achievements.ts`)
- [x] Create VisitorProvider context with optimistic UI updates (`src/lib/visitor-context.tsx`)
- [x] Create profile server actions — award XP, unlock achievements, streak logic (`src/actions/profiles.ts`)
- [x] Update game scores actions for multi-game support (`src/actions/game-scores.ts`)
- [x] Build XP bar component (`src/components/progression/xp-bar.tsx`)
- [x] Build achievement panel component (`src/components/progression/achievement-panel.tsx`)
- [x] Build achievement toast component (`src/components/progression/achievement-toast.tsx`)
- [x] Build level-up overlay component (`src/components/progression/level-up-overlay.tsx`)
- [x] Create `useVisitor` hook (`src/hooks/use-visitor.ts`)
- [x] Integrate VisitorProvider in root layout (`src/app/layout.tsx`)
- [x] Add XP bar and achievement panel to navbar (`src/components/layout/navbar.tsx`)
- [x] Award XP on theme toggle
- [x] Track daily visit streaks with auto-profile creation
- [x] Auto-create visitor profile on first interaction
- [x] RLS policies for profiles and events tables

## Wave 2: THE MAGIC

Terminal mode and easter eggs — the secret layer beneath the surface.

### Terminal Shell (Phase 4.1)
- [ ] Terminal shell component with command parser
- [ ] Command history (up/down arrow navigation)
- [ ] Tab completion for commands
- [ ] Typewriter effect for output rendering
- [ ] `help` command — list available commands
- [ ] `about` command — bio summary
- [ ] `skills` command — tech stack display
- [ ] `projects` command — project listing
- [ ] `neofetch` command — system info style display
- [ ] `matrix` command — Matrix rain animation
- [ ] `cowsay` command — ASCII cow with message
- [ ] `fortune` command — random dev quotes
- [ ] `clear` command — clear terminal history
- [ ] `sudo` command — humorous deny message
- [ ] Terminal toggle button in navbar
- [ ] Terminal open/close XP award

### Easter Eggs (Phase 2)
- [ ] Konami Code hook (up up down down left right left right B A)
- [ ] CRT screen flicker effect on Konami trigger
- [ ] Pixel sprite walk animation on Konami trigger
- [ ] Konami Code achievement unlock
- [ ] Hidden terminal triggered by clicking hero tagline
- [ ] Hidden terminal green-on-black retro styling
- [ ] Hidden terminal commands (whois, ls, cat readme)
- [ ] `red_pill` achievement for finding hidden terminal
- [ ] Vault page with CSS 3D rotating cube
- [ ] Personal letter inside the vault
- [ ] Hall of Discoveries tracker in vault
- [ ] Simon Says mini-game in vault
- [ ] `halliday_egg` achievement for completing the vault
- [ ] Cosmonaut secret cocktail in cocktail mixer demo
- [ ] Vaporwave palette easter egg
- [ ] Score-42 Hitchhiker's Guide reference in adventure game

## Wave 3: THE ARCADE

Arcade hub and Snake game — expanding the game collection.

### Arcade Hub (Phase 3.1)
- [ ] Arcade hub page with pixel-art cabinet selection UI
- [ ] Cabinet art for ClaudeBot's Adventure
- [ ] Cabinet art for Snake
- [ ] Combined cross-game leaderboard view
- [ ] Arcade hub XP award on first visit

### Snake Game (Phase 3.2)
- [ ] Snake game engine (grid, direction, collision, food spawning)
- [ ] Canvas renderer with pixel-art snake sprites
- [ ] Food sprite variants
- [ ] Snake game canvas component with touch controls
- [ ] Snake page route under arcade
- [ ] Snake scoring integrated with game_scores table
- [ ] Snake XP awards (first game, high score milestones)

## Wave 4: THE POLISH

Scroll animations, particles, and showcase frames — visual refinement.

### Scroll Animations (Phase 4.2)
- [ ] Scroll-driven parallax on hero section
- [ ] Glow orb parallax effect
- [ ] Card entrance animations on scroll
- [ ] Scroll progress indicator in navbar

### Hover & Interaction Effects (Phase 4.3)
- [ ] 3D tilt on hover with CSS perspective transforms
- [ ] Magnetic hover effect on buttons
- [ ] Smooth focus states for keyboard navigation

### Cursor Particles (Phase 4.4)
- [ ] Canvas-based cursor particle trail
- [ ] `prefers-reduced-motion` gating
- [ ] Particle color matches current theme

### Project Showcase (Phase 4.4)
- [ ] Showcase frame component with description panel
- [ ] Tech stack badges on project cards
- [ ] "How it works" expandable section
- [ ] View count tracking per project

## Wave 5: THE WORLD

Real-time features and a code playground — making the site feel alive.

### Live Presence (Phase 6.1)
- [ ] Supabase Realtime channel for presence
- [ ] "X visitors exploring now" indicator
- [ ] Presence indicator in navbar or footer

### Live Leaderboard (Phase 6.2)
- [ ] Realtime subscription on game_scores inserts
- [ ] Auto-updating leaderboard without page refresh
- [ ] Score submission animation

### Code Playground (Phase 5.1)
- [ ] Tabbed editor (HTML / CSS / JS)
- [ ] Live iframe preview panel
- [ ] Starter templates library
- [ ] Share playground via URL
- [ ] Playground XP award

## Wave 6: THE DEPTH

More games, collaborative canvas, sprite editor, and seasonal events.

### Breakout Game (Phase 3.3)
- [ ] Breakout engine (ball physics, paddle, collision)
- [ ] Brick grid with hit points and colors
- [ ] Power-up drops (multi-ball, wide paddle, laser)
- [ ] Multiple levels with increasing difficulty
- [ ] Breakout scoring + XP integration

### Collaborative Pixel Canvas (Phase 6.3)
- [ ] 64x64 pixel grid canvas component
- [ ] Color palette picker
- [ ] Rate limiting (pixels per minute)
- [ ] Supabase Realtime broadcast for pixel updates
- [ ] Canvas snapshot saving

### Sprite Editor (Phase 5.2)
- [ ] Multi-frame sprite drawing canvas
- [ ] Onion skinning for animation frames
- [ ] Sprite sheet export (PNG)
- [ ] Frame playback preview

### Seasonal Events (Phase 8)
- [ ] Halloween theme variant (October)
- [ ] Winter theme variant (December)
- [ ] Anniversary event with special achievement
- [ ] Seasonal event detection and auto-activation

### Three Keys Meta-Progression (Phase 8)
- [ ] Copper Key — awarded for completing a specific challenge
- [ ] Jade Key — awarded for a different challenge
- [ ] Crystal Key — awarded for the final challenge
- [ ] Key display in visitor profile
- [ ] All-three-keys ultimate achievement

## Wave 7: THE FUTURE

AI-powered features, shader playground, and competitive systems.

### AI Features (Phase 7.1-7.3)
- [ ] Claude-powered Q&A chat widget on About page
- [ ] AI code review tool for playground submissions
- [ ] Smarter game lane/level generation using AI

### Shader Playground (Phase 5.3)
- [ ] WebGL2 shader editor component
- [ ] Uniform sliders for real-time parameter tweaking
- [ ] Shader preset gallery
- [ ] Shader playground XP award

### Tournament System (Phase 3.4)
- [ ] Tournament creation and scheduling
- [ ] Bracket display component
- [ ] Tournament leaderboard
- [ ] Tournament winner achievements

---

## Changelog

### Wave 1: THE BONES — 2026-02-21

**Commit:** `98b73f0`

Shipped the progression system foundation. 16 files added/modified, ~1,096 lines of new code.

**Delivered:**
- Database migrations: `009_create_profiles.sql`, `010_create_events.sql`, `011_add_game_type.sql`
- XP system with 10 levels and RPO-inspired titles
- Achievement registry (13 achievements, 5 secret)
- VisitorProvider context with optimistic updates
- Server actions for profiles, XP awards, achievement unlocks, streaks
- UI components: XP bar, achievement panel, achievement toast, level-up overlay
- Navbar integration with XP bar and achievement panel
- Theme toggle XP award, daily streak tracking, auto-profile creation
- RLS policies for profiles and events tables
