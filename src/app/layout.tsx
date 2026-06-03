import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { VisitorProvider } from "@/lib/visitor-context";
import { TerminalProvider } from "@/components/terminal/terminal-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const TerminalSheet = dynamic(
  () => import("@/components/terminal/terminal-sheet").then((m) => ({ default: m.TerminalSheet })),
);
const KonamiEffects = dynamic(
  () => import("@/components/easter-eggs/konami-effects").then((m) => ({ default: m.KonamiEffects })),
);
const LevelUpOverlay = dynamic(
  () => import("@/components/progression/level-up-overlay").then((m) => ({ default: m.LevelUpOverlay })),
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
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
              {children}
              <TerminalSheet />
              <KonamiEffects />
              <LevelUpOverlay />
            </TerminalProvider>
          </VisitorProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
