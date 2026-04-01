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
  /** Which system this achievement belongs to. Defaults to "site" for legacy achievements. */
  context?: "site" | "game" | "both";
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

export interface GameAchievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  deathCause: string;
  displayName: string | null;
  createdAt: string;
  isCurrentUser: boolean;
}

// --- Plan'd: Group Trip Planning ---

export interface PlandTrip {
  id: string;
  user_id: string;
  name: string;
  destination: string | null;
  description: string | null;
  cover_image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "planning" | "active" | "completed";
  created_at: string;
  updated_at: string;
}

export interface PlandMember {
  id: string;
  trip_id: string;
  user_id: string;
  name: string;
  email: string | null;
  avatar_color: string | null;
  created_at: string;
}

export interface PlandItineraryItem {
  id: string;
  trip_id: string;
  user_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  link: string | null;
  category: "activity" | "transport" | "food" | "accommodation" | "other";
  sort_order: number;
  created_at: string;
}

export interface PlandIdea {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  description: string | null;
  link: string | null;
  location: string | null;
  estimated_cost: number | null;
  votes: number;
  status: "suggested" | "approved" | "rejected";
  created_at: string;
}

export interface PlandAccommodation {
  id: string;
  trip_id: string;
  user_id: string;
  name: string;
  address: string | null;
  check_in: string | null;
  check_out: string | null;
  cost: number | null;
  booking_link: string | null;
  notes: string | null;
  created_at: string;
}

export interface PlandExpense {
  id: string;
  trip_id: string;
  user_id: string;
  paid_by_member_id: string | null;
  title: string;
  amount: number;
  category: "accommodation" | "food" | "activity" | "transport" | "other";
  date: string | null;
  notes: string | null;
  created_at: string;
}

export interface PlandExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
  settled: boolean;
}

export interface PlandMessage {
  id: string;
  trip_id: string;
  user_id: string;
  content: string;
  context_type: "general" | "itinerary" | "idea" | "expense" | null;
  context_id: string | null;
  created_at: string;
}

export interface PlandGalleryItem {
  id: string;
  trip_id: string;
  user_id: string;
  url: string;
  caption: string | null;
  date: string | null;
  created_at: string;
}
