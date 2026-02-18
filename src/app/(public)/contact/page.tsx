import { ContactSection } from "@/components/portfolio/contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold">Contact Me</h1>
      <ContactSection />
    </div>
  );
}
