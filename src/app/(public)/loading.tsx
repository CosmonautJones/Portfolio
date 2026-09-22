function CardSkeleton() {
  return (
    <div className="glass-card flex flex-col overflow-hidden rounded-lg">
      {/* Image block */}
      <div className="aspect-[16/9] w-full animate-pulse bg-muted/60" />
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
      {/* Page header block */}
      <div className="flex max-w-3xl flex-col gap-5 border-b border-border py-12">
        <div className="h-3 w-28 animate-pulse rounded bg-muted/60" />
        <div className="h-14 w-3/4 animate-pulse rounded bg-muted/60" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted/40" />
      </div>

      {/* Grid of project-card skeletons */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
