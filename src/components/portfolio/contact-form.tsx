"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SITE_CONFIG } from "@/lib/constants";
import { Mail, Github, Linkedin, Twitter, ArrowUpRight, Send, Copy, Check } from "lucide-react";

type ContactFormValues = { name: string; email: string; message: string };
type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the three contact fields. A tiny hand-rolled validator keeps the
 * heavy form stack (react-hook-form + zod + resolver, ~45 kB) out of this
 * route's bundle — overkill for a 3-field mailto form.
 */
export function validateContact(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(values.email)) errors.email = "Please enter a valid email";
  if (values.message.trim().length < 10) errors.message = "Message must be at least 10 characters";
  return errors;
}

const EMPTY_VALUES: ContactFormValues = { name: "", email: "", message: "" };

// Minimum time a human should take to fill the form (ms). Bots submit instantly.
const MIN_FILL_MS = 1500;

export function ContactForm() {
  const [copied, setCopied] = useState(false);
  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Honeypot field — read directly off the DOM so it stays out of React state.
  const honeypotRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef<number>(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  function updateField(field: keyof ContactFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Field validation first so genuine users always see what to fix.
    const nextErrors = validateContact(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // Honeypot: real users leave it empty; bots typically autofill anything
    // labeled "website". Silently bail with a generic error.
    if (honeypotRef.current?.value) {
      toast.error("Message couldn't be sent.");
      return;
    }

    // Timing check — a submit faster than MIN_FILL_MS is almost certainly a bot.
    if (Date.now() - mountedAt.current < MIN_FILL_MS) {
      toast.error("That was quick! Give it another second and try again.");
      return;
    }

    setIsSubmitting(true);
    const subject = encodeURIComponent(`Contact from ${values.name}`);
    const body = encodeURIComponent(
      `Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`
    );
    const mailtoUrl = `mailto:${SITE_CONFIG.email}?subject=${subject}&body=${body}`;

    window.open(mailtoUrl, "_blank");

    toast.success("Opening your email client!", {
      description: "Your message details have been pre-filled.",
    });

    setValues(EMPTY_VALUES);
    setErrors({});
    setIsSubmitting(false);
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

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Honeypot: hidden from users + assistive tech, catches naive spam bots */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          <label htmlFor="website">Website (leave blank)</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            ref={honeypotRef}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            className="focus-glow"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive" role="alert">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="focus-glow"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive" role="alert">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Your message..."
            className="min-h-[120px] focus-glow"
            value={values.message}
            onChange={(e) => updateField("message", e.target.value)}
            aria-invalid={!!errors.message}
          />
          {errors.message && (
            <p className="text-sm text-destructive" role="alert">{errors.message}</p>
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
