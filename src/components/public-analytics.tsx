"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAutomatedAnalyticsUserAgent, normalizeAnalyticsPath } from "@/lib/analytics-core";

const RECENT_VIEW_KEY = "eloviz:last-page-view";
const DUPLICATE_WINDOW_MS = 10_000;

function respectsAnalyticsOptOut() {
  const privacyNavigator = navigator as Navigator & { globalPrivacyControl?: boolean };
  return privacyNavigator.globalPrivacyControl === true
    || navigator.doNotTrack === "1"
    || navigator.webdriver
    || isAutomatedAnalyticsUserAgent(navigator.userAgent);
}

export function PublicAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const path = normalizeAnalyticsPath(pathname);
    if (!path || respectsAnalyticsOptOut()) return;

    const now = Date.now();
    try {
      const recent = JSON.parse(sessionStorage.getItem(RECENT_VIEW_KEY) ?? "null") as {
        path?: string;
        trackedAt?: number;
      } | null;
      if (recent?.path === path && typeof recent.trackedAt === "number" && now - recent.trackedAt < DUPLICATE_WINDOW_MS) return;
      sessionStorage.setItem(RECENT_VIEW_KEY, JSON.stringify({ path, trackedAt: now }));
    } catch {
      // Storage can be unavailable in strict privacy modes; tracking remains best-effort.
    }

    void fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({ path }),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
