import { ContactForm } from "@/components/portfolio/contact-form";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Travis Jones about AI engineering and software engineering roles in Michigan or remote.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <div className="mb-10">
        <PageHeader eyebrow="Contact" title="Tell me what you’re building." />
      </div>
      <ContactForm />
    </div>
  );
}
