import { ContactForm } from "@/components/portfolio/contact-form";
import type { Metadata } from "next";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-24 sm:py-32">
      <AnimateOnScroll>
        <h1 className="gradient-text-animated mb-8 inline-block text-4xl font-bold tracking-tight sm:text-5xl">
          Get in Touch
        </h1>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.1}>
        <ContactForm />
      </AnimateOnScroll>
    </div>
  );
}
