import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { Mail, Github, Linkedin, Twitter } from "lucide-react";

export function ContactSection() {
  return (
    <div className="space-y-8">
      <p className="text-lg text-muted-foreground">
        Got any questions? Want to collaborate? Feel free to reach out!
      </p>
      <Button size="lg" asChild>
        <a href={`mailto:${SITE_CONFIG.email}`}>
          <Mail className="mr-2 h-4 w-4" /> Email Me
        </a>
      </Button>
      <div className="flex gap-4 pt-4">
        <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
          <Github className="h-6 w-6" />
        </a>
        <a href={SITE_CONFIG.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
          <Linkedin className="h-6 w-6" />
        </a>
        <a href={SITE_CONFIG.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
          <Twitter className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}
