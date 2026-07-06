import type { Project } from "@/lib/types";

export const SITE_CONFIG = {
  name: "Travis Jones",
  title: "Software Developer",
  tagline: "I build things you actually want to click on.",
  email: "travisjohn.jones@gmail.com",
  github: "https://github.com/CosmonautJones",
  linkedin: "https://www.linkedin.com/in/travis-john-jones/",
  twitter: "https://twitter.com/TravisJohnJones",
  instagram: "https://www.instagram.com/tj_jones/",
};

export const PROOF_POINTS = [
  { label: "Play the game engine", href: "/adventure", detail: "WebGL arcade proof" },
  { label: "Try a browser tool", href: "/work/pixel-art-editor", detail: "Canvas editor demo" },
  { label: "Inspect a full-stack app", href: "/pland", detail: "Supabase trip planner" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const PROJECTS: Project[] = [
  {
    title: "Pixel Art Editor",
    description:
      "I wanted to see how far the Canvas API could go in the browser. This is a full drawing tool with flood fill, a 32-color palette, and PNG export — no dependencies, just pixels and math.",
    image: "/projects/pixel-art-editor.jpg",
    tags: ["Canvas API", "React", "TypeScript"],
    demoUrl: "/work/pixel-art-editor",
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Interactive Demo",
    featured: true,
    proof: "A real canvas drawing surface with flood fill, palette state, and PNG export.",
    actionLabel: "Try editor",
  },
  {
    title: "Cocktail Mixer",
    description:
      "An animation playground disguised as a bartending app. Pick a drink, watch each ingredient pour in with layered SVG animations, and unlock a secret 7th cocktail if you try them all.",
    image: "/projects/cocktail-mixer.jpg",
    tags: ["Animation", "SVG", "React"],
    demoUrl: "/work/cocktail-mixer",
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Interactive Demo",
    featured: true,
    proof: "A polished animation sequence with layered SVG pours and a hidden unlock.",
    actionLabel: "Mix a drink",
  },
  {
    title: "ClaudeBot's Adventure",
    description:
      "A from-scratch game engine: fixed-timestep loop, procedural level generation, WebGL rendering with bloom, and procedural audio — zero audio files. Built to prove that TypeScript can ship a real arcade game.",
    image: "/projects/claudebot-adventure.jpg",
    tags: ["Game Engine", "WebGL", "TypeScript", "Web Audio"],
    demoUrl: "/adventure",
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Game",
    proof: "A shipped TypeScript game engine with fixed timestep, WebGL, audio, and scoring.",
    actionLabel: "Play game",
  },
  {
    title: "Plan'd",
    description:
      "Group trips fall apart in group chats. This is the fix: shared itineraries, expense splitting that tracks who owes what, an ideas board, and real-time chat — all backed by Supabase with row-level security.",
    image: "/projects/pland.jpg",
    tags: ["Next.js", "Supabase", "TypeScript", "Real-time"],
    demoUrl: "/pland",
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Full-Stack App",
    proof: "A working group-trip planner with itineraries, expenses, ideas, chat, and RLS.",
    actionLabel: "Open app",
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
      "Leading architecture for full-stack products. Built developer tools and AI integrations that shipped to production. This portfolio — game engine, progression system, admin panel — is the after-hours work.",
  },
  {
    year: "2022",
    title: "Software Developer",
    description:
      "Shipped production features across React and Node.js apps. Owned end-to-end delivery from database migrations to deployed UI. Got fast at turning product ideas into working software.",
  },
  {
    year: "2019",
    title: "Junior Developer",
    description:
      "First production apps in the wild. Built MERN stack projects, caught the open-source bug, and learned that the best code is the code someone else can read at 2 AM.",
  },
  {
    year: "2018",
    title: "Wrote My First Line of Code",
    description:
      "Self-taught through online courses, side projects, and an unhealthy amount of Stack Overflow. Turned curiosity into a career.",
  },
];
