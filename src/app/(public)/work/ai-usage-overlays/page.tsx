import type { Metadata } from "next";
import { CaseStudy } from "@/components/portfolio/case-study";

export const metadata: Metadata = {
  title: "AI Usage Overlays",
  description:
    "Always-on-top Windows tray HUD for Claude Code, Codex, Cursor, and Grok.",
};

// Portfolio Copy LOCKED 2026-09-08 — LOCKED.md
const SECTIONS = [
  {
    heading: "Problem",
    body:
      "Operators running several AI coding tools have to check separate CLIs, dashboards, and tray apps to see quota, usage, and plan headroom. Signals do not share a shape, and one broken login should not take the whole picture down.",
  },
  {
    heading: "Constraints",
    body:
      "• Windows 10/11 only (PowerShell + WPF)\n• No password store — the overlay launches each real CLI so that tool writes its own auth.json\n• Providers are optional; a missing login or CLI blanks that tile only\n• No admin elevation\n• Grok Bot chat / Cursor-Grok stay under Cursor (not a fifth tile)",
  },
  {
    heading: "Architecture",
    body:
      "Independent provider adapters behind one tray HUD. Each adapter reads local credentials and usage signals the operator already has, normalizes them into a shared snapshot (ai-usage.snapshot.v1), and degrades alone when data is unavailable. Themes, opacity, section toggles, history sparks, and start-at-login are local preferences.",
  },
  {
    heading: "Proof",
    body:
      "• Clean always-on-top HUD with per-provider tiles\n• Independent degrade when a provider is signed out or not installed\n• One-liner install under %LOCALAPPDATA%\\AIUsageOverlay\n• TravOS portfolio piece (footer brand defaults to TravOS; custom PNG via tray)",
  },
];

const GALLERY = [
  {
    src: "/projects/overlays-full-hud.jpg",
    caption: "Always-on-top tray view",
    alt: "AI Usage Overlays HUD on black",
  },
  {
    src: "/projects/overlays-provider-tiles.jpg",
    caption: "Claude, Codex, Cursor, Grok",
    alt: "AI Usage Overlays provider tiles",
  },
  {
    src: "/projects/overlays-travos-footer.jpg",
    caption: "Brand + install path",
    alt: "AI Usage Overlays TravOS footer",
  },
];

export default function AiUsageOverlaysCasePage() {
  return (
    <CaseStudy
      title="AI Usage Overlays"
      lede="Always-on-top Windows tray HUD for Claude Code, Codex, Cursor, and Grok."
      sections={SECTIONS}
      gallery={GALLERY}
      githubUrl="https://github.com/CosmonautJones/ai-usage-overlays"
      installHint={`irm https://raw.githubusercontent.com/CosmonautJones/ai-usage-overlays/master/install.ps1 | iex

# Or GitHub Release v0.4.0 EXE:
# https://github.com/CosmonautJones/ai-usage-overlays/releases/download/v0.4.0/AIUsageOverlaySetup.exe`}
      tags={["PowerShell", "Windows", "WPF"]}
    />
  );
}
