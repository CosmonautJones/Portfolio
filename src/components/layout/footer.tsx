import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";

const socials = [
  { href: SITE_CONFIG.github, label: "GitHub" },
  { href: SITE_CONFIG.linkedin, label: "LinkedIn" },
  { href: SITE_CONFIG.twitter, label: "X" },
];

function Cell({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-[var(--rule-strong)] p-4 sm:p-5 ${className}`}>
      <p className="label-mono">{label}</p>
      <div className="mt-2 text-sm text-foreground">{children}</div>
    </div>
  );
}

/** Laid out like the title block in the corner of an engineering drawing. */
export function Footer() {
  return (
    <footer className="mt-8 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid border border-[var(--rule-strong)] sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.1fr_1.2fr]">
          <div className="flex items-center gap-3 border-b border-[var(--rule-strong)] p-4 sm:p-5 lg:border-b-0 lg:border-r">
            <BrandMark className="h-9 w-9" />
            <div>
              <p className="font-display text-base font-bold tracking-tight">{SITE_CONFIG.name}</p>
              <p className="text-sm text-muted-foreground">{SITE_CONFIG.title}</p>
            </div>
          </div>
          <Cell label="Location" className="border-b sm:border-l lg:border-b-0 lg:border-l-0 lg:border-r">
            {SITE_CONFIG.location}
          </Cell>
          <Cell label="Status" className="border-b sm:border-b-0 lg:border-r">
            <span className="inline-flex items-center gap-2.5">
              <span className="signal-lamp" aria-hidden="true" />
              <span>{SITE_CONFIG.availability}</span>
            </span>
          </Cell>
          <Cell label="Contact" className="sm:border-l lg:border-l-0">
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="break-all underline decoration-[var(--rule-strong)] underline-offset-4 transition-colors hover:decoration-[var(--signal)]"
            >
              {SITE_CONFIG.email}
            </a>
          </Cell>
        </div>

        <div className="flex flex-col gap-4 border-x border-b border-[var(--rule-strong)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {socials.map(({ href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            ))}
            <li className="label-mono">&copy; {new Date().getFullYear()}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
