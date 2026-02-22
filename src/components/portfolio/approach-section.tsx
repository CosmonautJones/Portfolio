import { Users, RefreshCw, Blocks } from "lucide-react";

const principles = [
  {
    icon: Users,
    title: "User-First",
    description:
      "Every decision starts with the user. I prioritize clarity, speed, and intuitive interfaces.",
  },
  {
    icon: RefreshCw,
    title: "Iterative",
    description:
      "Ship early, learn fast. I work in tight feedback loops to find the best solution.",
  },
  {
    icon: Blocks,
    title: "Maintainable",
    description:
      "Code is read more than it's written. I write clean, well-structured code.",
  },
];

export function ApproachSection() {
  return (
    <section aria-label="How I Work">
      <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        How I Work
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {principles.map((item, i) => (
          <div
            key={item.title}
            className="animate-fade-up rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            <item.icon className="mb-4 h-8 w-8 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
