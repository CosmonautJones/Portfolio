import type { Project } from "@/lib/types";

export const SITE_CONFIG = {
  name: "Travis Jones",
  title: "Software Developer",
  tagline: "I like learning how things work, building useful software, and collaborating with good people.",
  email: "travisjohn.jones@gmail.com",
  github: "https://github.com/CosmonautJones",
  linkedin: "https://www.linkedin.com/in/travis-john-jones/",
  twitter: "https://twitter.com/TravisJohnJones",
  instagram: "https://www.instagram.com/tj_jones/",
};

export const PROOF_POINTS = [
  { label: "Capture a fragment", href: "https://cosmonautjones.github.io/lumen-garden/", detail: "Offline idea greenhouse" },
  { label: "Review an approval", href: "https://github.com/CosmonautJones/mission-control", detail: "Local agent control plane" },
  { label: "Check the HUD", href: "https://github.com/CosmonautJones/ai-usage-overlays", detail: "Windows usage overlay" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const PROJECTS: Project[] = [
  {
    title: "Lumen Garden",
    description:
      "Offline-first idea greenhouse: capture fragments, connect them into projects, and take one focused next action. Local-only React/TypeScript (no accounts or telemetry), with tests, keyboard access, and a live demo.",
    image: "",
    tags: ["React", "TypeScript", "Vite", "Vitest"],
    liveUrl: "https://cosmonautjones.github.io/lumen-garden/",
    githubUrl: "https://github.com/CosmonautJones/lumen-garden",
    role: "Interactive Demo",
    featured: true,
    proof: "Local-only React workspace (Inbox, Constellation, Focus, Review), keyboard access, no accounts or telemetry.",
    actionLabel: "Open demo",
  },
  {
    title: "Mission Control",
    description:
      "A local control plane for supervised coding agents. Goals are divided among bounded workers in separate worktrees, verifier loops can reject and retry work, and approval decisions remain visible to the operator.",
    image: "",
    tags: ["TypeScript", "Node.js", "React", "Python"],
    githubUrl: "https://github.com/CosmonautJones/mission-control",
    role: "Open Source",
    featured: true,
    proof: "Bounded worktree teams, verifier loops, approval gates, and auditable run evidence. Local-first, no cloud account.",
    actionLabel: "Read code",
  },
  {
    title: "AI Usage Overlays",
    description:
      "A Windows HUD that normalizes local Claude, Codex, and Cursor usage signals into one compact view. Provider integrations are optional and degrade independently when data is unavailable.",
    image: "",
    tags: ["PowerShell", "Windows", "WPF"],
    githubUrl: "https://github.com/CosmonautJones/ai-usage-overlays",
    role: "Open Source",
    featured: true,
    proof: "Always-on-top Windows tray HUD; providers optional and independent; no separate credentials stored.",
    actionLabel: "Read code",
  },
  {
    title: "The Conductor",
    description:
      "A pure-orchestrator skill for ADR-driven implementation: it dispatches specialized subagents, persists run state, and escalates only on a small set of human-gated triggers.",
    image: "",
    tags: ["TypeScript", "Vitest", "Claude Code"],
    githubUrl: "https://github.com/CosmonautJones/the-conductor",
    role: "Open Source",
    featured: true,
    proof: "Orchestrator does not write code; persists run state; human-gated escalations only.",
    actionLabel: "Read code",
  },
  {
    title: "Pixel Art Editor",
    description:
      "A small, fast drawing surface built straight on the Canvas API: flood fill, palette state, PNG export, and no extra ceremony.",
    image: "/projects/pixel-art-editor.jpg",
    tags: ["Canvas API", "React", "TypeScript"],
    demoUrl: "/work/pixel-art-editor",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Interactive Demo",
    featured: false,
    proof: "Canvas state, flood fill, palette control, and export all running in-browser.",
    actionLabel: "Open editor",
  },
  {
    title: "Release Signal",
    description:
      "A small local checklist for deciding whether a piece of work is ready to hand over, or just close.",
    image: "",
    tags: ["React", "TypeScript", "Product Quality"],
    demoUrl: "/work/release-signal",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Interactive Tool",
    featured: false,
    proof: "Deterministic readiness logic, concrete gates, release notes, and a copyable handoff summary.",
    actionLabel: "Check release",
  },
  {
    title: "Table Stakes",
    description:
      "A practical blind clock for a home poker night: simple controls, editable levels, and a timer that keeps the table moving.",
    image: "",
    tags: ["React", "Timer Logic", "Poker"],
    demoUrl: "/work/table-stakes",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Interactive Tool",
    featured: false,
    proof: "Local clock state, blind-level transitions, editable durations, and keyboard-friendly controls.",
    actionLabel: "Start clock",
  },
  {
    title: "Cocktail Mixer",
    description:
      "A quiet animation study wearing a bartender's jacket. Layered SVG pours, timing details, and one hidden drink for people who keep looking.",
    image: "/projects/cocktail-mixer.jpg",
    tags: ["Animation", "SVG", "React"],
    demoUrl: "/work/cocktail-mixer",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Interactive Demo",
    featured: false,
    proof: "Layered SVG motion, sequenced ingredients, and a hidden unlock path.",
    actionLabel: "Pour one",
  },
  {
    title: "ClaudeBot's Adventure",
    description:
      "A TypeScript arcade engine with a fixed-timestep loop, procedural lanes, WebGL rendering, bloom, scoring, and procedural audio.",
    image: "/projects/claudebot-adventure.jpg",
    tags: ["Game Engine", "WebGL", "TypeScript", "Web Audio"],
    demoUrl: "/adventure",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Game",
    proof: "Fixed-step simulation, WebGL rendering, procedural audio, and scoring.",
    actionLabel: "Start run",
  },
  {
    title: "Plan'd",
    description:
      "A group-trip planner for the parts that usually get lost in chat: itineraries, expenses, ideas, and the decisions in between.",
    image: "/projects/pland.jpg",
    tags: ["Next.js", "Supabase", "TypeScript", "Real-time"],
    demoUrl: "/pland",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Full-Stack App",
    proof: "Supabase auth, RLS, shared trip state, expenses, ideas, and chat.",
    actionLabel: "Open Plan'd",
  },
  {
    title: "Members Only Poker Club",
    description:
      "A private poker club platform with a public site, member portal, cashier tools, and admin workflows.",
    image: "",
    tags: ["Next.js", "Supabase", "Stripe", "PostgreSQL"],
    liveUrl: "https://members-only-poker-club.vercel.app",
    githubUrl: "https://github.com/CosmonautJones/members-only-poker-club",
    role: "Full-Stack App",
    proof: "Public pages, authenticated member areas, operational tooling, Supabase data, and Stripe payments.",
    actionLabel: "View site",
  },
  {
    title: "Harness Core",
    description:
      "An open-source framework for checking, scoring, and improving AI-generated work through repeatable quality loops.",
    image: "",
    tags: ["TypeScript", "CLI", "MCP", "Quality Gates"],
    githubUrl: "https://github.com/CosmonautJones/harness-core",
    role: "Open Source",
    proof: "Config-driven validation, scoring, iteration loops, plugins, CLI workflows, and MCP integration.",
    actionLabel: "Read code",
  },
];

export const SKILLS = [
  "React", "Next.js", "TypeScript", "Node.js", "Python",
  "PostgreSQL", "MongoDB", "Tailwind CSS", "Supabase", "AWS",
];

export const SKILL_CATEGORIES = [
  {
    label: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML Canvas"],
  },
  {
    label: "Backend",
    skills: ["Node.js", "Python", "PostgreSQL", "MongoDB", "Supabase"],
  },
  {
    label: "Infrastructure",
    skills: ["AWS", "Netlify", "Docker", "CI/CD", "Git"],
  },
];

export const EXPERIENCE = [
  {
    year: "2024",
    title: "Senior Software Developer",
    description:
      "Working across full-stack products, developer tools, and AI integrations. I like the mix of product thinking, clear systems, and small details that make software easier to trust.",
  },
  {
    year: "2022",
    title: "Software Developer",
    description:
      "Shipped production features across React and Node.js apps, from schema changes to deployed UI. Got fast at turning rough product intent into working software.",
  },
  {
    year: "2019",
    title: "Junior Developer",
    description:
      "First production apps in the wild. Built MERN projects, caught the open-source bug, and learned that readable code is its own survival tool.",
  },
  {
    year: "2018",
    title: "Wrote My First Line of Code",
    description:
      "Self-taught through online courses, side projects, and enough late-night debugging to make curiosity permanent.",
  },
];
