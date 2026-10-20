import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "TableSense | Poker practice app",
  description:
    "TableSense is Travis Jones's Flutter/Dart poker practice app. Open the hosted Quick Deal table, inspect the actual source, and see the verified prototype scope.",
};

export default function TableSensePage() {
  return (
    <article className="container mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <Link href="/work" className="mb-10 inline-flex min-h-9 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>
      <header>
        <p className="label-mono">Working prototype · simulated practice chips</p>
        <h1 className="font-display mt-4 text-[clamp(2.2rem,5.5vw,3.75rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">TableSense</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          A poker practice app built in Flutter and Dart. Open a six-seat Quick Deal hand, work through decisions, and inspect the table, action history, and equity feedback.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild className="h-11 px-5">
            <a href="https://cosmonautjones.github.io/poker-pokr/" target="_blank" rel="noopener noreferrer">
              Play TableSense <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" className="h-11 px-5">
            <a href="https://github.com/CosmonautJones/poker-pokr" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" /> Read the actual source
            </a>
          </Button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">In the app, choose Quick Deal to open the practice table. No account is needed for this path.</p>
      </header>

      <figure className="my-10 overflow-hidden rounded-lg border border-border bg-card">
        <Image src="/projects/tablesense.jpg" alt="The hosted TableSense six-seat practice table with simulated chip stacks, fold history, and action controls" width={1420} height={1146} priority className="h-auto w-full" sizes="(max-width: 896px) 100vw, 848px" />
        <figcaption className="border-t border-border px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
          Actual GitHub Pages app capture, October 20, 2026. Six practice seats, simulated chips, and a recorded fold. This is the app, not illustrative poker artwork.
        </figcaption>
      </figure>

      <div className="space-y-8">
        <section>
          <h2 className="label-mono">Verified in the browser</h2>
          <p className="mt-3 leading-7 text-foreground/90">The hosted app loads, Quick Deal opens a six-player hand, and Fold records the action and advances the active seat. Five folds reached an uncontested &ldquo;Hand Complete&rdquo; result naming the remaining player. The table also displays chip stacks, pot odds, and equity feedback.</p>
        </section>
        <section>
          <h2 className="label-mono">What the source contains</h2>
          <p className="mt-3 leading-7 text-foreground/90">The public poker-pokr repository contains configurable Hold&apos;em and Omaha hands, lessons, replay history, and local session bookkeeping and reports. These are implementation paths to inspect; this page does not claim every mode has passed a full gameplay test.</p>
        </section>
        <section>
          <h2 className="label-mono">Scope and status</h2>
          <p className="mt-3 leading-7 text-foreground/90">TableSense is a working practice prototype. The checked Quick Deal path uses simulated chips. Showdown, chip settlement, other game variants, mobile usability, and long-session behavior need broader verification before calling the whole app complete.</p>
        </section>
        <aside className="border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
          This address previously opened a separate blind-level timer. That utility is preserved as the <Link href="/work/blind-clock" className="font-medium text-foreground underline underline-offset-4">Poker-night blind clock</Link>. It is not the poker game.
        </aside>
      </div>
    </article>
  );
}
