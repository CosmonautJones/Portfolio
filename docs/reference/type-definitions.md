# Type Definitions Reference

Core TypeScript types are defined across several files. This document provides a consolidated reference.

## Application Types (`src/lib/types.ts`)

### `Tool`

```typescript
interface Tool {
  id: string;
  slug: string;                              // URL-safe, unique
  name: string;
  type: "internal" | "external" | "embedded";
  status: "enabled" | "disabled";
  url: string | null;                        // Required for external type
  description: string | null;
  tags: string[];
  icon: string | null;                       // Lucide icon name
  build_hook_url: string | null;
  html_content: string | null;              // Only for embedded type
  created_at: string;
}
```

### `Project` (portfolio static data)

```typescript
interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  role: string;
  featured?: boolean;
}
```

Defined in `src/lib/types.ts`; populated from `PROJECTS` constant in `src/lib/constants.ts`. Used by portfolio pages and terminal `projects` command.

### `Note`

```typescript
interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

### `TrackerProject`

```typescript
interface TrackerProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}
```

### `TrackerTask`

```typescript
interface TrackerTask {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  updated_at: string;
}
```

### `Profile`

```typescript
interface Profile {
  id: string;            // UUID, FK to auth.users
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  title: string;
  achievements: string[];   // JSONB array of achievement IDs
  discoveries: string[];    // JSONB array of easter egg IDs
  streak_days: number;
  last_visit: string | null; // DATE string YYYY-MM-DD
  created_at: string;
  updated_at: string;
}
```

### `Achievement`

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;           // Lucide icon name
  xpReward: number;
  secret: boolean;        // If true, hidden until unlocked
  condition: AchievementCondition;
}
```

### `AchievementCondition`

```typescript
type AchievementCondition =
  | { type: "event"; eventType: string }
  | { type: "event_count"; eventType: string; count: number }
  | { type: "score"; gameType: string; threshold: number }
  | { type: "streak"; days: number }
  | { type: "manual" }
```

### `GameAchievement` (in-game)

```typescript
interface GameAchievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
}
```

### `GameEvent`

```typescript
interface GameEvent {
  id: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}
```

### `LeaderboardEntry`

```typescript
interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  deathCause: string;      // camelCase — transformed from DB snake_case
  displayName: string | null;
  createdAt: string;
  isCurrentUser: boolean;
}
```

## Game Engine Types (`src/lib/game/types.ts`)

### Primitive Types

```typescript
type Direction = "up" | "down" | "left" | "right";
type LaneType = "grass" | "road" | "water" | "railroad";
type ObstacleType = "car" | "truck" | "train" | "log";
type CoinType = "gold" | "silver" | "diamond";
type GamePhase = "menu" | "playing" | "paused" | "game_over";
type DeathCause = "vehicle" | "train" | "water" | "idle_timeout" | "off_screen";
type PlayerAnimation = "idle" | "hop" | "death";
type InputAction = "move_up" | "move_down" | "move_left" | "move_right" | "pause";
type ParticleShape = "square" | "circle" | "line";
```

### `GameState`

```typescript
interface GameState {
  phase: GamePhase;
  player: Player;
  lanes: Lane[];
  camera: Camera;
  particles: Particle[];
  actionQueue: InputAction[];
  score: number;
  highScore: number;
  level: number;
  generatedUpTo: number;
  deathCause: DeathCause | null;
  nextEntityId: number;
  timeAccumulator: number;
  animationTime: number;
  coins: Coin[];
  coinsCollected: number;
  coinBonusScore: number;
}
```

### `GameConfig`

```typescript
interface GameConfig {
  cellSize: number;
  gridColumns: number;
  hopDuration: number;
  idleTimeout: number;
  backDeathDistance: number;
  generateAhead: number;
  cameraSmoothing: number;
  fixedTimestep: number;
}
```

### `GameCallbacks`

```typescript
interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onPhaseChange: (phase: GamePhase) => void;
  onDeath: (cause: DeathCause, finalScore: number) => void;
  onHop: () => void;
  onLevelUp: (level: number) => void;
  onCoinCollect: (coin: Coin, bonusPoints: number) => void;
}
```

### `Player`

```typescript
interface Player {
  gridPos: GridPosition;
  worldPos: WorldPosition;
  facing: Direction;
  animation: PlayerAnimation;
  hopProgress: number;
  hopTarget: GridPosition | null;
  alive: boolean;
  idleTimer: number;
  ridingLogId: number | null;
}
```

### `Lane`

```typescript
interface Lane {
  y: number;
  type: LaneType;
  variant: number;
  obstacles: Obstacle[];
  flowDirection: -1 | 1;
  speedMultiplier: number;
}
```

### `Obstacle`

```typescript
interface Obstacle {
  id: number;
  type: ObstacleType;
  laneY: number;
  worldX: number;
  widthCells: number;
  speed: number;     // px/sec, negative = moving left
}
```

### `Coin`

```typescript
interface Coin {
  id: number;
  type: CoinType;
  gridX: number;
  laneY: number;
  worldX: number;
  collected: boolean;
  logId: number | null;  // non-null if riding a log
}
```

### `Particle`

```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  rotation?: number;
  rotationSpeed?: number;
  shape?: ParticleShape;
  trail?: boolean;
  prevX?: number;
  prevY?: number;
}
```

## Effect Types (`src/lib/game/effects.ts`)

```typescript
interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
}
```

## Terminal Types (`src/lib/terminal/types.ts`)

```typescript
interface Command {
  name: string;
  description: string;
  execute: (args: string[], context: CommandContext) => CommandResult;
}

interface CommandContext {
  theme: "main" | "retro";
  level?: number;
  title?: string;
  onDiscover?: (eggId: string) => void;
}

interface CommandResult {
  output: Array<{ type: "text" | "system" | "error" | "ascii"; content: string }>;
  clear?: boolean;
}
```

## Easter Egg Types (`src/lib/easter-eggs/registry.ts`)

```typescript
interface EasterEgg {
  id: string;
  name: string;
  hint: string;            // teaser hint shown in vault discoveries
  location: string;        // where on the site to find it
  icon: string;            // Lucide icon name
  achievementId?: string;  // achievement to unlock on discovery
}
```

## XP Types (`src/lib/xp.ts`)

```typescript
type XPAction =
  | "first_visit"
  | "view_project"
  | "play_game"
  | "score_50"
  | "score_100"
  | "score_200"
  | "use_demo"
  | "export_pixel_art"
  | "find_easter_egg"
  | "streak_3"
  | "streak_7"
  | "toggle_theme"
  | "open_terminal"
  | "open_hidden_terminal";
```

## Related Documents

- [../database.md](../database.md) — Database schema matching these types
- [../game-engine.md](../game-engine.md) — Game engine using game types
- [../progression-system.md](../progression-system.md) — Profile and achievement types in use
- [../tool-system.md](../tool-system.md) — Tool type in use
