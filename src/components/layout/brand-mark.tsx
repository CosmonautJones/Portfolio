import { cn } from "@/lib/utils";

/**
 * "tj" ligature: the t and j share one crossbar, the j's hook tucks under the
 * t's tail, and the j's dot is the amber signal lamp. Keep in sync with
 * src/app/icon.svg.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-7 w-7 shrink-0 text-foreground", className)}
    >
      <g stroke="currentColor" strokeWidth="5.6" strokeLinejoin="round">
        <path data-part="t" d="M14 6.5v23c0 4.4 2.4 6.8 7 6.8h1.5" />
        <path data-part="bar" d="M6 17h28.8" />
        <path data-part="j" d="M32 17v20.5c0 5.2-3 8-8.3 8H18" />
      </g>
      <rect data-part="signal" x="29.2" y="4.2" width="5.6" height="5.6" fill="var(--signal)" />
    </svg>
  );
}
