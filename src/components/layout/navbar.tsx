"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { XPBar } from "@/components/progression/xp-bar";
import { AchievementPanel } from "@/components/progression/achievement-panel";
import { useVisitor } from "@/hooks/use-visitor";
import { Moon, Sun } from "lucide-react";

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin = false }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { awardXP } = useVisitor();
  const themeTracked = useRef(false);

  function handleToggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
    if (!themeTracked.current) {
      themeTracked.current = true;
      awardXP("toggle_theme");
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-2xl backdrop-saturate-[1.8]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
      >
        Skip to content
      </a>
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          {SITE_CONFIG.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <XPBar />
          <AchievementPanel />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"
            onClick={handleToggleTheme}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <UserMenu isAdmin={isAdmin} />
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
