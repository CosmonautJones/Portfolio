/**
 * Static map of icon names used by achievements and tools.
 * Replaces `import * as Icons from "lucide-react"` to avoid pulling
 * the entire lucide barrel (~200KB) into client bundles.
 */
import {
  Ban,
  CircleDot,
  Coins,
  Crown,
  Egg,
  Flame,
  Footprints,
  Gamepad2,
  Gem,
  GraduationCap,
  Grid3x3,
  Joystick,
  Map,
  MapPin,
  Medal,
  Moon,
  Rocket,
  Skull,
  Star,
  Terminal,
  TrainFront,
  TreePine,
  Trophy,
  Waves,
  Wine,
  Wrench,
  Zap,
  // Common tool icons
  Code,
  FileText,
  Palette,
  StickyNote,
  ListTodo,
  Globe,
  Link,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Ban,
  CircleDot,
  Coins,
  Crown,
  Egg,
  Flame,
  Footprints,
  Gamepad2,
  Gem,
  GraduationCap,
  Grid3x3,
  Joystick,
  Map,
  MapPin,
  Medal,
  Moon,
  Rocket,
  Skull,
  Star,
  Terminal,
  TrainFront,
  TreePine,
  Trophy,
  Waves,
  Wine,
  Wrench,
  Zap,
  Code,
  FileText,
  Palette,
  StickyNote,
  ListTodo,
  Globe,
  Link,
};

/**
 * Look up a Lucide icon by its PascalCase name.
 * Returns `Wrench` as the fallback for unknown names.
 */
export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Wrench;
}
