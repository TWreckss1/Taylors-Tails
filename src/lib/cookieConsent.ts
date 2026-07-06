export type ConsentChoice = "accepted" | "rejected";

export interface ConsentState {
  necessary: true; // always on — required for the site to function (admin login session)
  analytics: boolean;
}

const STORAGE_KEY = "tt-cookie-consent";
export const CONSENT_EVENT = "tt-cookie-consent-change";

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean): void {
  const state: ConsentState = { necessary: true, analytics };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

export function clearConsent(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

export function hasConsent(category: keyof ConsentState): boolean {
  const state = getConsent();
  if (!state) return false;
  return Boolean(state[category]);
}
