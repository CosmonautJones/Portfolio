"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useVisitor } from "@/hooks/use-visitor";

/**
 * Fires a `pageview` event into the `events` table on every route change for
 * authenticated visitors. Fire-and-forget — never blocks render. Anonymous
 * users are ignored at the server action layer.
 */
export function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackEvent, isAuthenticated } = useVisitor();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    if (lastPath.current === url) return;
    lastPath.current = url;

    const referrer = typeof document !== "undefined" ? document.referrer : "";
    trackEvent("pageview", {
      path: pathname,
      url,
      referrer: referrer || null,
    });
  }, [pathname, searchParams, isAuthenticated, trackEvent]);

  return null;
}
