export interface Tool {
  id: string;
  slug: string;
  name: string;
  type: "internal" | "external" | "embedded";
  status: "enabled" | "disabled";
  url: string | null;
  description: string | null;
  tags: string[];
  icon: string | null;
  build_hook_url: string | null;
  html_content: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
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

export interface TrackerProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface TrackerTask {
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

// --- Progression System ---

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  title: string;
  achievements: string[];
  discoveries: string[];
  streak_days: number;
  last_visit: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  secret: boolean;
  xpReward: number;
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: "event"; eventType: string }
  | { type: "event_count"; eventType: string; count: number }
  | { type: "score"; gameType: string; threshold: number }
  | { type: "streak"; days: number }
  | { type: "manual" };

export interface GameEvent {
  id: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}
