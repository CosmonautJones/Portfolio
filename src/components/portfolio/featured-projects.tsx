import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SELECTED_PROJECT_STORIES } from "@/lib/selected-project-stories";

const storyLinkClass =
  "inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline decoration-[var(--rule-strong)] underline-offset-4 transition-colors hover:decoration-[var(--signal)]";

export function FeaturedProjects({ showArchiveLink = true }: { showArchiveLink?: boolean }) {
  return (
    <section
      id="selected-work"
      aria-labelledby="selected-work-title"
      className="container mx-auto scroll-mt-24 px-6 py-16 sm:py-24"
    >
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6 sm:mb-10">
        <div className="max-w-2xl">
          <p className="label-mono">Selected work</p>
          <h2 id="selected-work-title" className="font-display mt-3 scroll-mt-24 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three project stories.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            My contribution, what you can verify, and the scope of each project.
          </p>
        </div>
        {showArchiveLink && (
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation lands on the destination section after the streamed page arrives.
          <a href="/work#collection" className={storyLinkClass}>
            Browse tools and experiments
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </header>

      <ol aria-label="Selected project stories" className="border-b border-[var(--rule-strong)]">
        {SELECTED_PROJECT_STORIES.map((story, index) => (
          <li key={story.id} className="border-t border-[var(--rule-strong)] py-8 sm:py-10">
            <article
              aria-labelledby={`story-${story.id}`}
              className="grid gap-6 md:grid-cols-[minmax(12rem,18rem)_1fr] md:gap-10"
            >
              <div className="flex items-start gap-4">
                <span className="balloon !ml-0 !h-8 !w-8 shrink-0 !align-baseline !text-xs" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <p className="label-mono">{story.kind}</p>
                  <h3 id={`story-${story.id}`} className="font-display mt-2 scroll-mt-24 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {story.title}
                  </h3>
                </div>
              </div>

              <div>
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {[
                    ["Problem", story.problem],
                    ["My role", story.role],
                    ["Evidence", story.evidence],
                    ["Scope", story.scope],
                  ].map(([label, detail]) => (
                    <div key={label}>
                      <dt className="label-mono !text-foreground">{label}</dt>
                      <dd className="mt-2 text-sm leading-7 text-muted-foreground">{detail}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1">
                  <Link href={story.href} className={storyLinkClass}>
                    {story.linkLabel}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  {story.awardUrl && (
                    <a
                      href={story.awardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      Verify the team award
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
