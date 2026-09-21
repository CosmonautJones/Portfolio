import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowDownToLine, Github, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOURCE = "https://github.com/CosmonautJones/whole-page-capture";
const DOWNLOAD = "/downloads/whole-page-capture-v1.0.0.zip";

export const metadata: Metadata = {
  title: "Whole Page Capture",
  description:
    "Save a complete webpage as one PNG. A local Chrome and Edge extension with a right-click workflow and no permanent website access.",
};

const PERMISSIONS = [
  ["contextMenus", "Adds the Capture full webpage command to your right-click menu."],
  ["activeTab", "Gives temporary access to the tab where you choose that command."],
  ["scripting", "Runs the capture code in that tab to scroll and assemble the page."],
  ["storage", "Remembers the latest capture status until the browser closes."],
];

export default function WholePageCapturePage() {
  return (
    <article className="container mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <Link href="/work" className="mb-12 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Work
      </Link>

      <header className="max-w-2xl">
        <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
          <ScanLine className="size-6 text-primary" aria-hidden="true" />
          <span>Chrome &amp; Edge extension · v1.0.0</span>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Whole Page Capture</h1>
        <p className="mt-5 text-2xl font-medium tracking-tight">One right-click. The whole page.</p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Save a long webpage as one PNG for a bug report, design review, or reference.
          It scrolls, joins the sections, and puts you back where you started.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="min-h-11 rounded-full">
            <a href={DOWNLOAD} download>
              <ArrowDownToLine className="size-4" aria-hidden="true" /> Download extension
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-h-11 rounded-full">
            <a href={SOURCE} target="_blank" rel="noopener noreferrer">
              <Github className="size-4" aria-hidden="true" /> View source
            </a>
          </Button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Free · No account · Runs locally in your desktop browser
        </p>
        <a href={`${SOURCE}/releases/download/v1.0.0/whole-page-capture.zip`} className="mt-2 inline-block py-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Also available on GitHub</a>
      </header>

      <section aria-labelledby="install-title" className="mt-14 rounded-2xl border border-border/60 bg-secondary/20 p-6 sm:p-8">
        <h2 id="install-title" className="font-display text-2xl font-semibold tracking-tight">Install once. Capture from any ordinary webpage.</h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          This is an extension you install on your computer. This page provides the download
          and instructions; it cannot capture another browser tab itself.
        </p>
        <ol className="mt-7 space-y-6">
          <li className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-sm" aria-hidden="true">1</span>
            <div><h3 className="font-medium">Download and extract</h3><p className="mt-1 leading-7 text-muted-foreground">Download the ZIP above and extract it to a folder you will keep on your computer.</p></div>
          </li>
          <li className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-sm" aria-hidden="true">2</span>
            <div><h3 className="font-medium">Open your extensions page</h3><p className="mt-1 leading-7 text-muted-foreground">Type <code className="break-all text-foreground">chrome://extensions</code> in Chrome, or <code className="break-all text-foreground">edge://extensions</code> in Edge. Turn on <strong className="font-medium text-foreground">Developer mode</strong>.</p></div>
          </li>
          <li className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-sm" aria-hidden="true">3</span>
            <div><h3 className="font-medium">Load the extension</h3><p className="mt-1 leading-7 text-muted-foreground">Choose <strong className="font-medium text-foreground">Load unpacked</strong> and select the extracted folder containing <code>manifest.json</code>.</p></div>
          </li>
          <li className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-sm" aria-hidden="true">4</span>
            <div><h3 className="font-medium">Make your first capture</h3><p className="mt-1 leading-7 text-muted-foreground">Visit an ordinary webpage, right-click, and choose <strong className="font-medium text-foreground">Capture full webpage</strong>. Keep the tab active until your PNG download starts. Press <kbd className="rounded border border-border px-1.5 py-0.5 text-xs text-foreground">Esc</kbd> to cancel.</p></div>
          </li>
        </ol>
      </section>

      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <section aria-labelledby="engineering-title">
          <h2 id="engineering-title" className="font-display text-xl font-semibold">The work behind one click</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            A long screenshot needs more than scrolling. The extension prepares lazy-loaded
            content, handles fixed and sticky elements, pauses CSS animation, and aligns
            captures across display scaling and the final partial viewport. It restores
            temporary page changes when it finishes.
          </p>
          <p className="mt-4 leading-7 text-muted-foreground">
            The source includes deterministic tests and packaging checks. Each release
            includes a SHA-256 checksum so the downloaded archive can be verified.
          </p>
          <a href={`${SOURCE}/releases/tag/v1.0.0`} className="mt-4 inline-block min-h-11 py-2 text-sm underline underline-offset-4 hover:text-primary">Release notes and checksum</a>
          <p className="text-sm text-muted-foreground"><a href="/downloads/whole-page-capture-v1.0.0.zip.sha256" className="inline-block py-2 underline underline-offset-4 hover:text-foreground">Checksum for this download</a></p>
        </section>
        <section aria-labelledby="limits-title">
          <h2 id="limits-title" className="font-display text-xl font-semibold">What it can capture</h2>
          <p className="mt-4 leading-7 text-muted-foreground">Ordinary HTTP and HTTPS pages that fit the browser width and settle at 32,000 CSS pixels tall or less.</p>
          <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-muted-foreground">
            <li>Sideways-scrolling pages and endlessly growing feeds are rejected.</li>
            <li>Browser settings, extension stores, local files, and protected pages are unavailable.</li>
            <li>Nested scrolling panels are captured as visible; their hidden contents are not expanded.</li>
            <li>Live JavaScript content can change between captured sections.</li>
          </ul>
        </section>
      </div>

      <section aria-labelledby="privacy-title" className="mt-14 border-t border-border/60 pt-10">
        <h2 id="privacy-title" className="font-display text-2xl font-semibold tracking-tight">Your page stays on your computer.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          No uploads, analytics, accounts, or remote code. The extension does not retain
          your page content, URL, title, or screenshot; the PNG is saved through your
          browser. It requests four permissions and no permanent website access.
        </p>
        <details className="mt-6 rounded-xl border border-border/60 px-5">
          <summary className="cursor-pointer py-4 font-medium">See exactly what each permission does</summary>
          <dl className="space-y-4 pb-5">
            {PERMISSIONS.map(([name, explanation]) => (
              <div key={name} className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
                <dt className="font-mono text-sm">{name}</dt>
                <dd className="text-sm leading-6 text-muted-foreground">{explanation}</dd>
              </div>
            ))}
          </dl>
          <a href={`${SOURCE}/blob/v1.0.0/manifest.json`} className="mb-5 inline-block text-sm underline underline-offset-4 hover:text-primary">Read the release manifest</a>
        </details>
      </section>
    </article>
  );
}
