import Link from "next/link";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { Github, Linkedin, Twitter } from "lucide-react";

const socials = [
  { href: SITE_CONFIG.github, icon: Github, label: "GitHub" },
  { href: SITE_CONFIG.linkedin, icon: Linkedin, label: "LinkedIn" },
  { href: SITE_CONFIG.twitter, icon: Twitter, label: "Twitter" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 sm:py-16">
      <div className="container mx-auto px-6">
        {/* 3-column grid */}
        <div className="grid gap-10 sm:grid-cols-3">
          {/* Col 1: Branding */}
          <div>
            <p className="text-sm font-bold">{SITE_CONFIG.name}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {SITE_CONFIG.tagline}
            </p>
          </div>

          {/* Col 2: Pages */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
              Pages
            </p>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Connect */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
              Connect
            </p>
            <div className="flex gap-3">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 text-muted-foreground/60 transition-all duration-300 hover:border-border hover:bg-secondary/80 hover:text-foreground"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/30 pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}
          </p>
          <p className="text-xs text-muted-foreground/40">
            Built with Next.js &amp; Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
