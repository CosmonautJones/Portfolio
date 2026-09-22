import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}

/** Shared top of every inner page: mono eyebrow, expanded display title, plain lede. */
export function PageHeader({ eyebrow, title, lede, children }: PageHeaderProps) {
  return (
    <header className="animate-fade-up border-b border-[var(--rule-strong)] pb-10 sm:pb-12">
      <p className="label-mono">{eyebrow}</p>
      <h1 className="font-display mt-4 text-[clamp(2.4rem,6vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-foreground">
        {title}
      </h1>
      {lede ? (
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">{lede}</p>
      ) : null}
      {children}
    </header>
  );
}
