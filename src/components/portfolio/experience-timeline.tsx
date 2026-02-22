import { EXPERIENCE } from "@/lib/constants";

export function ExperienceTimeline() {
  return (
    <div className="relative border-l-2 border-border/50 pl-8">
      {EXPERIENCE.map((item, i) => (
        <div
          key={item.year}
          className="animate-fade-up relative pb-10 last:pb-0"
          style={{ animationDelay: `${200 + i * 100}ms` }}
        >
          {/* Dot marker */}
          <div className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full border-2 border-border bg-background" />
          {/* Year badge */}
          <span className="mb-2 inline-flex rounded-full bg-secondary/80 px-3 py-0.5 text-xs font-medium text-muted-foreground">
            {item.year}
          </span>
          <h3 className="mt-2 text-base font-semibold tracking-tight">
            {item.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
