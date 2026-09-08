import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CaseStudyGalleryItem = {
  src: string;
  caption: string;
  alt: string;
};

export type CaseStudySection = {
  heading: string;
  body: string;
};

type CaseStudyProps = {
  title: string;
  lede: string;
  sections: CaseStudySection[];
  gallery?: CaseStudyGalleryItem[];
  githubUrl?: string;
  downloadUrl?: string;
  downloadLabel?: string;
  installHint?: string;
  tags?: string[];
};

export function CaseStudy({
  title,
  lede,
  sections,
  gallery,
  githubUrl,
  downloadUrl,
  downloadLabel = "Download installer",
  installHint,
  tags,
}: CaseStudyProps) {
  return (
    <article className="container mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <Link
        href="/work"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Work
      </Link>

      <header className="mb-12">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{lede}</p>
        {tags && tags.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          {githubUrl ? (
            <Button asChild className="rounded-full">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                Read code
              </a>
            </Button>
          ) : null}
          {downloadUrl ? (
            <Button asChild variant="outline" className="rounded-full">
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {downloadLabel}
              </a>
            </Button>
          ) : githubUrl ? (
            <Button asChild variant="outline" className="rounded-full">
              <a href={`${githubUrl}#install`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Install notes
              </a>
            </Button>
          ) : null}
        </div>
      </header>

      {gallery && gallery.length > 0 ? (
        <figure className="mb-14 space-y-6">
          {gallery.map((shot) => (
            <figure key={shot.src} className="overflow-hidden rounded-xl border border-border/50 bg-black">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
              <figcaption className="border-t border-border/40 px-4 py-3 text-sm text-muted-foreground">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </figure>
      ) : null}

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {section.heading}
            </h2>
            <p className="mt-3 text-base leading-7 text-foreground/90 whitespace-pre-line">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      {installHint ? (
        <aside className="mt-14 rounded-xl border border-border/50 bg-secondary/30 px-5 py-4">
          <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Install
          </h2>
          <pre className="mt-3 overflow-x-auto font-mono text-sm text-foreground">
            <code>{installHint}</code>
          </pre>
        </aside>
      ) : null}
    </article>
  );
}
