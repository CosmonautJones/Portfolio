import { ContactSection } from "@/components/portfolio/contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-24 sm:py-32">
      <h1 className="animate-fade-up gradient-text mb-8 inline-block text-4xl font-bold tracking-tight sm:text-5xl">
        Get in Touch
      </h1>
      <div className="animate-fade-up delay-100">
        <ContactSection />
      </div>
    </div>
  );
}
