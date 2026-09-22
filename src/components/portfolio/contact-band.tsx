"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export function ContactBand() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SITE_CONFIG.email);
      setCopied(true);
    } catch (error) {
      console.error("Copying the email address failed", error);
      toast.error("Could not copy the email address.", {
        description: `Select it and copy it by hand: ${SITE_CONFIG.email}`,
      });
    }
  }

  return (
    <section aria-labelledby="contact-band" className="container mx-auto px-6 pb-24 pt-8">
      <div className="rounded-lg border border-[var(--rule-strong)] bg-card p-6 sm:p-10">
        <p className="label-mono flex items-center gap-2.5">
          <span className="signal-lamp" aria-hidden="true" />
          {SITE_CONFIG.availability}
        </p>
        <h2 id="contact-band" className="font-display mt-4 max-w-3xl text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
          Hiring for AI or software engineering? Email me.
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="break-all font-mono text-base text-foreground underline decoration-[var(--signal)] decoration-2 underline-offset-[6px] sm:text-lg"
          >
            {SITE_CONFIG.email}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            aria-label={copied ? "Email address copied" : "Copy email address"}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-[var(--rule-strong)] hover:text-foreground"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <Link
            href="/resume"
            className="inline-flex h-9 items-center text-sm font-semibold text-foreground underline decoration-[var(--rule-strong)] underline-offset-4 transition-colors hover:decoration-[var(--signal)]"
          >
            Read the resume
          </Link>
        </div>
      </div>
    </section>
  );
}
