import { SITE_CONFIG } from "@/lib/constants";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE_CONFIG.name}
        </p>
        <div className="flex gap-4">
          <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
            <Github className="h-5 w-5" />
          </a>
          <a href={SITE_CONFIG.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
            <Linkedin className="h-5 w-5" />
          </a>
          <a href={SITE_CONFIG.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
            <Twitter className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
