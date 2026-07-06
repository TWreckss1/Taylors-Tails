import { getApps } from "firebase/app";
import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";

let analytics: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

/** Lazily initialises Firebase Analytics — only ever called after the visitor has consented. */
export function initAnalytics(): Promise<Analytics | null> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof window === "undefined") return null;
    if (getApps().length === 0) return null; // Firebase not configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return null;

    const supported = await isSupported().catch(() => false);
    if (!supported) return null;

    analytics = getAnalytics(getApps()[0]);
    return analytics;
  })();

  return initPromise;
}

export function trackPageView(path: string): void {
  if (!analytics) return;
  logEvent(analytics, "page_view", { page_path: path });
}
