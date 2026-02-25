"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

const STORAGE_KEY = "adventure-welcomed";

export function WelcomeBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage may be unavailable in some contexts
    }
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setVisible(true);
        // Allow a frame for the fade-in transition to trigger
        requestAnimationFrame(() => setMounted(true));
      }
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => dismiss(), 6000);
    return () => clearTimeout(timer);
  }, [visible, dismiss]);

  if (!visible && !mounted) return null;

  return (
    <div
      className={`absolute top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/70 px-4 py-2 backdrop-blur-md transition-opacity duration-500 ${
        visible && mounted ? "opacity-100" : "opacity-0"
      }`}
      onTransitionEnd={() => {
        if (!visible) setMounted(false);
      }}
      role="status"
    >
      <p className="whitespace-nowrap text-xs text-white/80">
        Welcome! You are now earning XP and achievements as you play.
      </p>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-white/40 transition-colors hover:text-white/80"
        aria-label="Dismiss welcome message"
      >
        <X size={14} />
      </button>
    </div>
  );
}
