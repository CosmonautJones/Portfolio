import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { Mail, Github, Linkedin, Twitter } from "lucide-react";

export function ContactSection() {
  return (
    <div className="space-y-8">
      <p className="text-lg leading-relaxed text-muted-foreground">
        Got any questions? Want to collaborate? Feel free to reach out!
      </p>
      <Button size="lg" asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:brightness-110 dark:from-violet-500 dark:to-indigo-500">
        <a href={`mailto:${SITE_CONFIG.email}`}>
          <Mail className="mr-2 h-4 w-4" /> Email Me
        </a>
      </Button>
      <div className="flex gap-4 pt-4">
        <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-violet-600 dark:hover:text-violet-400">
          <Github className="h-6 w-6" />
        </a>
        <a href={SITE_CONFIG.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-violet-600 dark:hover:text-violet-400">
          <Linkedin className="h-6 w-6" />
        </a>
        <a href={SITE_CONFIG.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-violet-600 dark:hover:text-violet-400">
          <Twitter className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}
