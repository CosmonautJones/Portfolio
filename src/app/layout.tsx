import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { VisitorProvider } from "@/lib/visitor-context";
import { TerminalProvider } from "@/components/terminal/terminal-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import "./globals.css";

// Body / UI: IBM Plex Sans, a nod to the enterprise systems Travis grew up on.
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans", display: "swap" });
// Display: Archivo with its width axis, set expanded like an equipment nameplate.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
// Mono: labels, evidence tables, the terminal, and the game HUD.
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

const SITE_DESCRIPTION =
  "Travis Jones is an AI engineer in Ann Arbor / Ypsilanti, Michigan. Eight years on manufacturing ERP software, now building MCP tools and supervised coding agents.";

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


export const metadata: Metadata = {
  metadataBase: new URL("https://travisjohnjones.com"),
  title: {
    default: "Travis Jones | AI Engineer",
    template: "%s | Travis Jones",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Travis Jones | AI Engineer",
    description: SITE_DESCRIPTION,
    url: "https://travisjohnjones.com",
    siteName: "Travis Jones",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travis Jones | AI Engineer",
    description: SITE_DESCRIPTION,
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
        {/* Without JavaScript, scroll reveals never run; show their content instead. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
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
              </MotionProvider>
            </TerminalProvider>
          </VisitorProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
