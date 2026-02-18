export interface Tool {
  id: string;
  slug: string;
  name: string;
  type: "internal" | "external";
  status: "enabled" | "disabled";
  url: string | null;
  description: string | null;
  tags: string[];
  icon: string | null;
  build_hook_url: string | null;
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
