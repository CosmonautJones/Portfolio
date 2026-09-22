import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SkywatchGlint } from "@/components/portfolio/skywatch-glint";
import { PROOF_POINTS, SITE_CONFIG } from "@/lib/constants";

function Claim({ n }: { n: 1 | 2 | 3 }) {
  const proof = PROOF_POINTS[n - 1];
  return (
    <span className="whitespace-nowrap">
      <span className="claim" data-claim={n}>
        {proof.claim}
      </span>
      <a href={`#evidence-${n}`} className="balloon" data-claim={n} aria-label={`Evidence ${n}: ${proof.label}`}>
        {n}
      </a>
    </span>
  );
}

function rise(delayMs: number) {
  return { animationDelay: `${delayMs}ms` };
}

export function HeroSection() {
  return (
    <section aria-label="Hero" className="hero relative overflow-hidden">
      <SkywatchGlint />

      <div className="container relative z-[2] mx-auto px-6 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pt-24">
        <p className="hero-rise label-mono flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3" style={rise(0)}>
          <span className="text-foreground">{SITE_CONFIG.title}</span>
          <span aria-hidden="true" className="hidden text-[var(--rule-strong)] sm:inline">/</span>
          <span>{SITE_CONFIG.location}</span>
        </p>

        <h1 className="hero-rise hero-name font-display mt-6 text-foreground" style={rise(80)}>
          Travis Jones
        </h1>

        <p
          data-testid="hero-lede"
          className="hero-rise mt-8 max-w-[44rem] text-pretty text-[clamp(1.2rem,2.1vw,1.6rem)] leading-[1.5] text-foreground/90"
          style={rise(180)}
        >
          I connect AI to the <Claim n={1} /> companies already run on, with <Claim n={2} /> where it counts
          and <Claim n={3} /> on what ships.
        </p>

        <div className="hero-rise mt-9 flex flex-wrap items-center gap-3" style={rise(280)}>
          <Link
            href="/work"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-85"
          >
            See the work
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/resume"
            className="inline-flex h-12 items-center rounded-md border border-[var(--rule-strong)] px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            View resume
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center px-3 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Get in touch
          </Link>
          <p className="label-mono flex basis-full items-center gap-2.5 pt-3 sm:ml-3 sm:basis-auto sm:border-l sm:border-[var(--rule-strong)] sm:pl-6 sm:pt-0">
            <span className="signal-lamp" aria-hidden="true" />
            {SITE_CONFIG.availability}
          </p>
        </div>

        <div className="hero-rise mt-16 sm:mt-20" style={rise(380)}>
          <div
            aria-hidden="true"
            className="label-mono hidden grid-cols-[3rem_minmax(14rem,18rem)_1fr_auto] gap-6 border-b border-[var(--rule-strong)] pb-3 md:grid"
          >
            <span>Item</span>
            <span>Claim</span>
            <span>Where it comes from</span>
            <span />
          </div>
          <ol aria-label="Evidence" className="divide-y divide-border border-b border-border">
            {PROOF_POINTS.map((proof, index) => {
              const n = index + 1;
              return (
                <li
                  key={proof.href}
                  id={`evidence-${n}`}
                  data-claim={n}
                  className="evidence-row grid grid-cols-[2.25rem_1fr] gap-x-4 gap-y-1 py-5 md:grid-cols-[3rem_minmax(14rem,18rem)_1fr_auto] md:items-baseline md:gap-6"
                >
                  <span className="balloon !ml-0 !align-baseline" aria-hidden="true">
                    {n}
                  </span>
                  <p className="font-display text-[0.95rem] font-semibold tracking-tight text-foreground">
                    {proof.label}
                  </p>
                  <p className="col-start-2 text-sm leading-relaxed text-muted-foreground md:col-start-auto">
                    {proof.detail}
                  </p>
                  <Link
                    href={proof.href}
                    className="col-start-2 mt-2 inline-flex items-center gap-1 justify-self-start text-sm font-medium text-foreground underline decoration-[var(--rule-strong)] underline-offset-4 transition-colors hover:decoration-[var(--signal)] md:col-start-auto md:mt-0 md:whitespace-nowrap"
                  >
                    {proof.linkLabel}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
