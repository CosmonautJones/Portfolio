import type { Project } from "@/lib/types";

export const SITE_CONFIG = {
  name: "Travis Jones",
  title: "Software Developer",
  tagline: "Software with a pulse. Systems with a spine.",
  email: "travisjohn.jones@gmail.com",
  github: "https://github.com/CosmonautJones",
  linkedin: "https://www.linkedin.com/in/travis-john-jones/",
  twitter: "https://twitter.com/TravisJohnJones",
  instagram: "https://www.instagram.com/tj_jones/",
};

export const PROOF_POINTS = [
  { label: "Run the engine", href: "/adventure", detail: "WebGL arcade system" },
  { label: "Open the editor", href: "/work/pixel-art-editor", detail: "Canvas drawing surface" },
  { label: "See the stack", href: "/pland", detail: "Supabase-backed planner" },
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
      "A small, fast drawing surface built straight on the Canvas API: flood fill, palette state, PNG export, and no extra ceremony.",
    image: "/projects/pixel-art-editor.jpg",
    tags: ["Canvas API", "React", "TypeScript"],
    demoUrl: "/work/pixel-art-editor",
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Interactive Demo",
    featured: true,
    proof: "Canvas state, flood fill, palette control, and export all running in-browser.",
    actionLabel: "Open editor",
  },
  {
    title: "Cocktail Mixer",
    description:
      "A quiet animation study wearing a bartender's jacket. Layered SVG pours, timing details, and one hidden drink for people who keep looking.",
    image: "/projects/cocktail-mixer.jpg",
    tags: ["Animation", "SVG", "React"],
    demoUrl: "/work/cocktail-mixer",
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Interactive Demo",
    featured: true,
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
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
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
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Full-Stack App",
    proof: "Supabase auth, RLS, shared trip state, expenses, ideas, and chat.",
    actionLabel: "Open Plan'd",
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
      "Leading architecture for full-stack products, developer tools, and AI integrations that make it to production. The game engine, progression layer, and admin panel here are the after-hours receipts.",
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
