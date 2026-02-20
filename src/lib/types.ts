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
  githubUrl?: string;
  role: string;
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
