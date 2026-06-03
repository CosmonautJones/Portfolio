function CardSkeleton({ featured = false }: { featured?: boolean }) {
  const heightClass = featured ? "h-56" : "h-48";
  return (
    <div className="glass-card flex flex-col overflow-hidden rounded-xl">
      {/* Image block */}
      <div className={`${heightClass} w-full animate-pulse bg-muted/60`} />
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-6">
        <div className="h-5 w-2/5 animate-pulse rounded bg-muted/60" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted/40" />
      </div>
      {/* Text lines */}
      <div className="flex flex-col gap-2.5 px-6 pb-6">
        <div className="h-3 w-full animate-pulse rounded bg-muted/40" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-muted/40" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted/40" />
        {/* Tag row */}
        <div className="mt-3 flex gap-1.5">
          <div className="h-5 w-14 animate-pulse rounded-full bg-muted/30" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted/30" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-muted/30" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="container mx-auto px-6 py-16" aria-busy="true" aria-label="Loading content">
      {/* Hero-ish block */}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 py-12 text-center">
        <div className="h-7 w-40 animate-pulse rounded-full bg-muted/40" />
        <div className="h-14 w-3/4 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted/40" />
        <div className="mt-4 flex gap-3">
          <div className="h-11 w-36 animate-pulse rounded-full bg-muted/50" />
          <div className="h-11 w-36 animate-pulse rounded-full bg-muted/40" />
        </div>
      </div>

      {/* Grid of project-card skeletons */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} featured={i < 2} />
        ))}
      </div>
    </div>
  );
}
