import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { PageHeader } from "@/components/layout/page-header";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-12 inline-flex items-center gap-2.5 self-start text-foreground" aria-label="Travis Jones, home">
        <BrandMark />
        <span className="font-display text-[0.95rem] font-bold tracking-tight" aria-hidden="true">Travis Jones</span>
      </Link>
      <PageHeader
        eyebrow="Error 404"
        title="Page not found"
        lede="The link may be out of date, or the page moved. These pages are all still here."
      />
      <nav aria-label="Pages" className="mt-8">
        <ul className="flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex h-11 items-center rounded-md border border-[var(--rule-strong)] px-5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
