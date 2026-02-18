import { SITE_CONFIG } from "@/lib/constants";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="container mx-auto flex flex-col items-center gap-4 px-6 md:flex-row md:justify-between">
        <p className="text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} {SITE_CONFIG.name}
        </p>
        <div className="flex gap-4">
          {[
            { href: SITE_CONFIG.github, icon: Github, label: "GitHub" },
            { href: SITE_CONFIG.linkedin, icon: Linkedin, label: "LinkedIn" },
            { href: SITE_CONFIG.twitter, icon: Twitter, label: "Twitter" },
          ].map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
