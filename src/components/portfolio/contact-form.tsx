"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SITE_CONFIG } from "@/lib/constants";
import { validateContact, type ContactFormErrors, type ContactFormValues } from "@/lib/contact";
import { Github, Linkedin, Twitter, Send, Copy, Check } from "lucide-react";

const EMPTY_VALUES: ContactFormValues = { name: "", email: "", message: "" };

function errorId(field: keyof ContactFormValues) {
  return `contact-${field}-error`;
}

function firstInvalidField(errors: ContactFormErrors): keyof ContactFormValues | undefined {
  return (["name", "email", "message"] as const).find((field) => errors[field]);
}

function errorSummary(errors: ContactFormErrors) {
  return (["name", "email", "message"] as const)
    .map((field) => errors[field])
    .filter(Boolean)
    .join(" ");
}

export function ContactForm() {
  const [copied, setCopied] = useState(false);
  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const fieldRefs = {
    name: nameRef,
    email: emailRef,
    message: messageRef,
  } as const;

  function updateField(field: keyof ContactFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors = validateContact(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstField = firstInvalidField(nextErrors);
      if (firstField) {
        fieldRefs[firstField].current?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        toast.error("Message could not be sent.", {
          description: "The site email service is unavailable. Please copy the email address below.",
        });
        return;
      }

      toast.success("Message sent", {
        description: "Thanks for reaching out. I will get back to you soon.",
      });

      setValues(EMPTY_VALUES);
      setErrors({});
    } catch {
      toast.error("Message could not be sent.", {
        description: "The site email service is unreachable. Please copy the email address below.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        I’m based in the Ann Arbor / Ypsilanti area and open to AI and software engineering roles, local or remote. If your team works on practical AI, developer tools, .NET, or full-stack products, I’d like to hear about the role.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {Object.keys(errors).length > 0 && (
          <p className="sr-only" role="alert" aria-live="assertive">
            {errorSummary(errors)}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            ref={nameRef}
            placeholder="Your name"
            className="focus-glow"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? errorId("name") : undefined}
          />
          {errors.name && (
            <p id={errorId("name")} className="text-sm text-destructive" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            ref={emailRef}
            type="email"
            placeholder="you@example.com"
            className="focus-glow"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? errorId("email") : undefined}
          />
          {errors.email && (
            <p id={errorId("email")} className="text-sm text-destructive" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            ref={messageRef}
            placeholder="Your message..."
            className="min-h-[120px] focus-glow"
            value={values.message}
            onChange={(e) => updateField("message", e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? errorId("message") : undefined}
          />
          {errors.message && (
            <p id={errorId("message")} className="text-sm text-destructive" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-12 rounded-md bg-foreground px-6 text-background transition-opacity hover:bg-foreground hover:opacity-85"
          >
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            {isSubmitting ? "Sending…" : "Send message"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Thanks for taking a look at my work.
          </p>
          <p className="text-xs">
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Email {SITE_CONFIG.email}
            </a>
          </p>
        </div>
      </form>

      <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Prefer your own email app? Copy the address.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyEmail}
          aria-label={copied ? "Email address copied" : "Copy email address"}
          className="ml-auto h-8 shrink-0 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="border-t border-border pt-8">
        <p className="label-mono mb-4">Elsewhere</p>

        <div className="flex gap-3">
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
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-[var(--rule-strong)] hover:text-foreground"
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
