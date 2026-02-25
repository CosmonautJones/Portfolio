"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SITE_CONFIG } from "@/lib/constants";
import { Mail, Github, Linkedin, Twitter, ArrowUpRight, Send, Copy, Check } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(data: ContactFormValues) {
    const subject = encodeURIComponent(`Contact from ${data.name}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
    );
    const mailtoUrl = `mailto:${SITE_CONFIG.email}?subject=${subject}&body=${body}`;

    window.open(mailtoUrl, "_blank");

    toast.success("Opening your email client!", {
      description: "Your message details have been pre-filled.",
    });

    reset();
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SITE_CONFIG.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy email address.");
    }
  }

  return (
    <div className="space-y-10">
      <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
        Got any questions? Want to collaborate? Feel free to reach out.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            className="focus-glow"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="focus-glow"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Your message..."
            className="min-h-[120px] focus-glow"
            {...register("message")}
            aria-invalid={!!errors.message}
          />
          {errors.message && (
            <p className="text-sm text-destructive">{errors.message.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="btn-glow h-12 rounded-full bg-foreground px-8 text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Message
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Opens your email client with the message pre-filled
          </p>
        </div>
      </form>

      <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Or email me directly at{" "}
          <span className="font-medium text-foreground">{SITE_CONFIG.email}</span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyEmail}
          className="ml-auto h-8 shrink-0 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="border-t border-border/50 pt-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Or reach out directly:
        </p>
        <Button
          size="lg"
          asChild
          variant="outline"
          className="h-12 rounded-full border-border/50 px-8 transition-all duration-300 hover:border-border hover:bg-secondary/80"
        >
          <a href={`mailto:${SITE_CONFIG.email}`}>
            <Mail className="mr-2 h-4 w-4" />
            {SITE_CONFIG.email}
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>

        <div className="mt-6 flex gap-3">
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
    </div>
  );
}
