import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, TRY_IT_NOW } from "@/lib/constants";

const ctaClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--rule-strong)] px-5 text-sm font-semibold text-foreground transition-colors hover:border-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]";

/** Reuse the project card's media: its image, with the card caption (or title) as alt text. */
function mediaFor(title: string) {
  const project = PROJECTS.find((p) => p.title === title);
  if (!project?.image) return null;
  return { src: project.image, alt: project.preview?.caption ?? project.title };
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
          const media = mediaFor(tile.project);
          const titleId = `try-${tile.project.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          return (
            <li key={tile.project} className="min-w-0">
              <article
                aria-labelledby={titleId}
                className="glass-card flex h-full flex-col overflow-hidden rounded-lg"
              >
                {media && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-muted">
                    <Image
                      src={media.src}
                      alt={media.alt}
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
