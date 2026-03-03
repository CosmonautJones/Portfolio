# Guide: Adding Easter Eggs and Terminal Commands

## Adding a Terminal Command

Terminal commands are defined in `src/lib/terminal/commands.ts`.

### Main Terminal Commands

Commands are registered in the `COMMANDS` object. Each command implements:

```typescript
interface Command {
  name: string;
  description: string;
  execute: (args: string[], context: CommandContext) => CommandResult;
}
```

**`CommandContext`** provides:
```typescript
{
  theme: "main" | "retro";
  level?: number;      // visitor's current XP level
  title?: string;      // visitor's level title
  onDiscover?: (eggId: string) => void;  // trigger easter egg discovery
}
```

**`CommandResult`** returns output lines:
```typescript
{
  output: Array<{ type: "text" | "system" | "error" | "ascii"; content: string }>;
  clear?: boolean;  // if true, clears terminal history first
}
```

### Adding a New Command

1. Open `src/lib/terminal/commands.ts`
2. Add your command to the `COMMANDS` array (main terminal) or `RETRO_COMMANDS` array (retro terminal)
3. Implement the `execute` function

Example — a simple echo command:

```typescript
{
  name: "echo",
  description: "Repeat your message",
  execute: (args) => ({
    output: [{ type: "text", content: args.join(" ") }],
  }),
},
```

Example — a hidden command that triggers easter egg discovery:

```typescript
{
  name: "secret",
  description: "",  // empty = hidden from help
  execute: (_args, context) => {
    context.onDiscover?.("my_egg_id");
    return {
      output: [{ type: "system", content: "You found something..." }],
    };
  },
},
```

### Tab Completion

`src/lib/terminal/completer.ts` — Tab completes command names. Commands with empty `description` are excluded from visible help but still tab-completable if you add them to the completer's command list.

---

## Adding an Easter Egg

Easter eggs are registered in `src/lib/easter-eggs/registry.ts`.

### Registry Entry

```typescript
interface EasterEgg {
  id: string;
  name: string;
  description: string;
  achievementId?: string;  // achievement to unlock on discovery
  xpAction?: XPAction;     // XP action to award
}
```

### Step 1: Register the egg

Add an entry to the `EASTER_EGGS` array in `src/lib/easter-eggs/registry.ts`:

```typescript
{
  id: "my_egg",
  name: "My Easter Egg",
  description: "Found the secret thing",
  achievementId: "my_achievement",  // optional
  xpAction: "find_easter_egg",      // optional
}
```

### Step 2: Define an achievement (optional)

Add an achievement definition in `src/lib/achievements.ts`:

```typescript
{
  id: "my_achievement",
  name: "Secret Finder",
  description: "You found the hidden thing",
  icon: "Star",
  xpReward: 50,
  secret: true,  // hides from achievement panel until unlocked
  condition: { type: "manual" },
}
```

### Step 3: Trigger discovery in code

Use the `use-easter-egg` hook in any React component:

```typescript
import { useEasterEgg } from "@/hooks/use-easter-egg";

function MyComponent() {
  const { discover } = useEasterEgg();

  const handleSecretAction = () => {
    discover("my_egg");  // awards XP + unlocks achievement from registry
  };
}
```

Or call `context.onDiscover("my_egg")` from a terminal command execute function.

### Step 4: Implement the trigger

Common trigger patterns:

- **Key sequence**: Use `use-key-sequence` hook to detect arbitrary key combos
- **Terminal command**: Add a hidden command that calls `onDiscover` via context
- **UI interaction**: Hidden element, long press, specific click pattern
- **URL navigation**: Check current path or hash on mount

---

## Vault Puzzles

The vault at `/vault` contains puzzle challenges. Components are in `src/components/vault/`. To add a new puzzle:

1. Create a component in `src/components/vault/`
2. Add it to `src/app/(public)/vault/page.tsx`
3. On completion, call `unlockAchievement("halliday_egg")` via the visitor context

---

## Related Documents

- [../terminal-easter-eggs.md](../terminal-easter-eggs.md) — Terminal and easter egg overview
- [../progression-system.md](../progression-system.md) — XP actions and achievements
- [../components.md](../components.md) — Easter egg component inventory
