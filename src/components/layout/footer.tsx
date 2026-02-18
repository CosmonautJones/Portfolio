import { SITE_CONFIG } from "@/lib/constants";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t py-8">
      {/* Gradient accent line */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE_CONFIG.name}
        </p>
        <div className="flex gap-4">
          <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-violet-600 dark:hover:text-violet-400">
            <Github className="h-5 w-5" />
          </a>
          <a href={SITE_CONFIG.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-violet-600 dark:hover:text-violet-400">
            <Linkedin className="h-5 w-5" />
          </a>
          <a href={SITE_CONFIG.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-violet-600 dark:hover:text-violet-400">
            <Twitter className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
