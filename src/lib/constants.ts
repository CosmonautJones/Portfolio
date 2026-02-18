import type { Project } from "@/lib/types";

export const SITE_CONFIG = {
  name: "Travis Jones",
  title: "Software Developer",
  tagline: "I love building cool stuff",
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
    title: "DevConnect",
    description: "A full MERN Stack app built as a social space for developers to connect and collaborate.",
    image: "/images/projects/devconnect.png",
    tags: ["React", "Node.js", "MongoDB", "Express"],
    liveUrl: "https://developer-connector.herokuapp.com/",
    githubUrl: "https://github.com/CosmonautJones/DevSpace",
    role: "Fullstack",
  },
  {
    title: "HeyTeam",
    description: "A full MERN Stack app built to help implement team standups within a Slack workspace.",
    image: "/images/projects/heyteam.png",
    tags: ["React", "Slack API", "Node.js"],
    liveUrl: "https://heyteam.netlify.com/",
    githubUrl: "https://github.com/Lambda-School-Labs/hey-team",
    role: "Backend",
  },
  {
    title: "Socializin",
    description: "A project for helping friends and family connect through their busy schedules.",
    image: "/images/projects/socializin.png",
    tags: ["React", "Node.js"],
    liveUrl: "https://socializin.netlify.com/",
    githubUrl: "https://github.com/LambdaZombies/socializin/",
    role: "Fullstack",
  },
];

export const SKILLS = [
  "React", "Next.js", "TypeScript", "Node.js", "Python",
  "PostgreSQL", "MongoDB", "Tailwind CSS", "Supabase", "AWS",
];
