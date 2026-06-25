import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Hanken_Grotesk, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { VisitorProvider } from "@/lib/visitor-context";
import { TerminalProvider } from "@/components/terminal/terminal-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { PageviewTracker } from "@/components/analytics/pageview-tracker";
import "./globals.css";

// Body / UI — a clean, friendly grotesque with more character than Inter.
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
// Display / headings — distinctive editorial grotesque for big type moments.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
// Mono — real developer monospace for the game HUD, terminal, and code.
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const TerminalSheet = dynamic(
  () => import("@/components/terminal/terminal-sheet").then((m) => ({ default: m.TerminalSheet })),
);
const KonamiEffects = dynamic(
  () => import("@/components/easter-eggs/konami-effects").then((m) => ({ default: m.KonamiEffects })),
);
const RedPillTrigger = dynamic(
  () => import("@/components/easter-eggs/red-pill-trigger").then((m) => ({ default: m.RedPillTrigger })),
);
const LevelUpOverlay = dynamic(
  () => import("@/components/progression/level-up-overlay").then((m) => ({ default: m.LevelUpOverlay })),
);
const ShortcutsOverlay = dynamic(
  () => import("@/components/ui/shortcuts-overlay").then((m) => ({ default: m.ShortcutsOverlay })),
);


export const metadata: Metadata = {
  metadataBase: new URL("https://travisjohnjones.com"),
  title: {
    default: "Travis Jones | Software Developer",
    template: "%s | Travis Jones",
  },
  description: "Portfolio and developer tools hub for Travis Jones.",
  openGraph: {
    title: "Travis Jones | Software Developer",
    description: "Portfolio and developer tools hub for Travis Jones.",
    url: "https://travisjohnjones.com",
    siteName: "Travis Jones",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travis Jones | Software Developer",
    description: "Portfolio and developer tools hub for Travis Jones.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('color-scheme');if(s&&['ocean','ember','emerald'].includes(s)){document.documentElement.classList.add('theme-'+s)}})()`,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <VisitorProvider>
            <TerminalProvider>
              <MotionProvider>
                {children}
                <TerminalSheet />
                <KonamiEffects />
                <RedPillTrigger />
                <LevelUpOverlay />
                <ShortcutsOverlay />
                <Suspense fallback={null}>
                  <PageviewTracker />
                </Suspense>
              </MotionProvider>
            </TerminalProvider>
          </VisitorProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
