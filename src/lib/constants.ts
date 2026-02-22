import type { Project } from "@/lib/types";

export const SITE_CONFIG = {
  name: "Travis Jones",
  title: "Software Developer",
  tagline: "Building software that makes an impact.",
  email: "travisjohn.jones@gmail.com",
  github: "https://github.com/CosmonautJones",
  linkedin: "https://www.linkedin.com/in/travis-john-jones/",
  twitter: "https://twitter.com/TravisJohnJones",
  instagram: "https://www.instagram.com/tj_jones/",
};

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
      "A browser-based pixel art canvas with a 32-color palette, drawing tools, flood fill, and PNG export. Draw, erase, and create retro-style artwork right in the browser.",
    image: "",
    tags: ["Canvas API", "React", "TypeScript"],
    demoUrl: "/work/pixel-art-editor",
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Interactive Demo",
    featured: true,
  },
  {
    title: "Cocktail Mixer",
    description:
      "Pick a cocktail and watch an animated step-by-step recipe unfold. Each ingredient pours in with smooth animations, building the drink visually layer by layer.",
    image: "",
    tags: ["Animation", "React", "CSS"],
    demoUrl: "/work/cocktail-mixer",
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Interactive Demo",
    featured: true,
  },
  {
    title: "ClaudeBot's Adventure",
    description:
      "A retro arcade game built with HTML5 Canvas. Help ClaudeBot cross rivers, dodge traffic, and chase a high score on the global leaderboard.",
    image: "",
    tags: ["Game Engine", "Canvas API", "TypeScript", "Web Audio"],
    demoUrl: "/adventure",
    githubUrl: "https://github.com/CosmonautJones/portfolio-tool-hub",
    role: "Game",
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
      "Building full-stack applications with modern web technologies. Focused on developer tooling, AI integrations, and shipping products that users love.",
  },
  {
    year: "2022",
    title: "Software Developer",
    description:
      "Delivered production features across React and Node.js applications. Collaborated closely with product and design to iterate quickly.",
  },
  {
    year: "2019",
    title: "Junior Developer",
    description:
      "Shipped first production apps. Built MERN stack projects, contributed to open-source, and developed a passion for clean, maintainable code.",
  },
  {
    year: "2018",
    title: "Started Coding",
    description:
      "Wrote my first lines of code and never looked back. Self-taught fundamentals through online courses, personal projects, and relentless curiosity.",
  },
];
