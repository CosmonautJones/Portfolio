import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { VisitorProvider } from "@/lib/visitor-context";
import { LevelUpOverlay } from "@/components/progression/level-up-overlay";
import { TerminalProvider } from "@/components/terminal/terminal-provider";
import { TerminalSheet } from "@/components/terminal/terminal-sheet";
import { KonamiEffects } from "@/components/easter-eggs/konami-effects";
import "./globals.css";


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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('color-scheme');if(s&&['ocean','ember','emerald'].includes(s)){document.documentElement.classList.add('theme-'+s)}})()`,
          }}
        />
      </head>
      <body className="font-sans" style={{ ["--font-inter" as string]: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" } as React.CSSProperties}>
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
