import Link from "next/link";
import { ArrowDownRight, Download, Mail } from "lucide-react";
import { SkywatchGlint } from "@/components/portfolio/skywatch-glint";
import { SITE_CONFIG } from "@/lib/constants";

function rise(delayMs: number) {
  return { animationDelay: `${delayMs}ms` };
}

export function HeroSection() {
  return (
    <section aria-label="Hero" className="hero relative overflow-hidden">
      <SkywatchGlint />
      <div className="container relative z-[2] mx-auto px-6 pb-12 pt-12 sm:pb-16 sm:pt-20">
        <p className="hero-rise label-mono flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3" style={rise(0)}>
          <span className="text-foreground">{SITE_CONFIG.title}</span>
          <span aria-hidden="true" className="hidden text-[var(--rule-strong)] sm:inline">/</span>
          <span>{SITE_CONFIG.location}</span>
        </p>
        <h1 className="hero-rise hero-name font-display mt-6 text-foreground" style={rise(80)}>Travis Jones</h1>
        <p data-testid="hero-lede" className="hero-rise mt-7 max-w-3xl text-pretty text-[clamp(1.15rem,2vw,1.5rem)] leading-[1.55] text-foreground/90" style={rise(180)}>
          Eight years building and supporting manufacturing ERP at Global Shop Solutions.
          My strongest production work is in COBOL and VB.NET, with a focus on preserving
          business rules through legacy modernization and practical AI tooling.
        </p>
        <div className="hero-rise mt-8 flex flex-wrap items-center gap-3" style={rise(280)}>
          <a href="/resume/Travis-Jones-Resume.pdf" download className="inline-flex h-12 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85">
            <Download className="h-4 w-4" aria-hidden="true" />Download resume PDF
          </a>
          <a href={`mailto:${SITE_CONFIG.email}`} className="inline-flex h-12 items-center gap-2 rounded-md border border-[var(--rule-strong)] px-5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
            <Mail className="h-4 w-4" aria-hidden="true" />Email me
          </a>
          <Link href="#selected-work" className="inline-flex h-12 items-center gap-2 px-3 text-sm font-semibold text-foreground underline decoration-[var(--rule-strong)] underline-offset-4 hover:decoration-[var(--signal)]">
            Selected work<ArrowDownRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <p className="hero-rise label-mono mt-6 flex items-center gap-2.5" style={rise(340)}>
          <span className="signal-lamp shrink-0" aria-hidden="true" />{SITE_CONFIG.availability}
        </p>
      </div>
    </section>
  );
}
