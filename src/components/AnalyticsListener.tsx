"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hasConsent, CONSENT_EVENT } from "@/lib/cookieConsent";
import { initAnalytics, trackPageView } from "@/lib/analytics";

export default function AnalyticsListener() {
  const pathname = usePathname();

  // Initialise (or tear down on opt-out) whenever consent changes
  useEffect(() => {
    function sync() {
      if (hasConsent("analytics")) {
        initAnalytics().then((a) => {
          if (a) trackPageView(pathname);
        });
      }
    }
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log a page_view on every client-side route change, only if consented
  useEffect(() => {
    if (!hasConsent("analytics")) return;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
