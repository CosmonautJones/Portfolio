import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { Mail, Github, Linkedin, Twitter, ArrowUpRight } from "lucide-react";

export function ContactSection() {
  return (
    <div className="space-y-10">
      <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
        Got any questions? Want to collaborate? Feel free to reach out.
      </p>

      <Button
        size="lg"
        asChild
        className="h-12 rounded-full bg-foreground px-8 text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
      >
        <a href={`mailto:${SITE_CONFIG.email}`}>
          <Mail className="mr-2 h-4 w-4" />
          Email Me
          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
        </a>
      </Button>

      <div className="flex gap-3 pt-2">
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-all duration-300 hover:border-border hover:bg-secondary/80 hover:text-foreground"
            aria-label={label}
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        ))}
      </div>
    </div>
  );
}
