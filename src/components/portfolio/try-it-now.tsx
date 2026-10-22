import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, TRY_IT_NOW } from "@/lib/constants";

const ctaClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--rule-strong)] px-5 text-sm font-semibold text-foreground transition-colors hover:border-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]";

/** Reuse the project card's image. It's decorative here: the tile heading already names the project. */
function imageFor(slug: string) {
  return PROJECTS.find((p) => p.slug === slug)?.image ?? null;
}

export function TryItNow() {
  return (
    <section aria-labelledby="try-it-now-title" className="container mx-auto px-6 py-16 sm:py-20">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <p className="label-mono">Try it now</p>
        <h2 id="try-it-now-title" className="font-display mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Open something and use it
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Three things that run in your browser. No account needed.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TRY_IT_NOW.map((tile) => {
          const image = imageFor(tile.slug);
          const titleId = `try-${tile.slug}`;
          return (
            <li key={tile.slug} className="min-w-0">
              <article
                aria-labelledby={titleId}
                className="glass-card flex h-full flex-col overflow-hidden rounded-lg"
              >
                {image && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-muted">
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                  <p className="label-mono">{tile.badge}</p>
                  <h3 id={titleId} className="font-display text-xl font-bold tracking-tight text-foreground">
                    {tile.project}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{tile.line}</p>
                  <div className="mt-auto pt-2">
                    {tile.external ? (
                      <a
                        href={tile.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${tile.cta} (opens in a new tab)`}
                        className={ctaClass}
                      >
                        {tile.cta}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link href={tile.href} className={ctaClass}>
                        {tile.cta}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
