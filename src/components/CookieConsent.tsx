"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { getConsent, setConsent, CONSENT_EVENT } from "@/lib/cookieConsent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    function checkConsent() {
      setVisible(getConsent() === null);
    }
    checkConsent();

    // Let the Footer's "Cookie Preferences" link reopen this banner
    function handleReopen() {
      setShowPrefs(true);
      setVisible(true);
    }
    window.addEventListener("tt-open-cookie-prefs", handleReopen);
    window.addEventListener(CONSENT_EVENT, checkConsent);
    return () => {
      window.removeEventListener("tt-open-cookie-prefs", handleReopen);
      window.removeEventListener(CONSENT_EVENT, checkConsent);
    };
  }, []);

  function acceptAll() {
    setConsent(true);
    setVisible(false);
    setShowPrefs(false);
  }

  function rejectNonEssential() {
    setConsent(false);
    setVisible(false);
    setShowPrefs(false);
  }

  function savePreferences() {
    setConsent(analytics);
    setVisible(false);
    setShowPrefs(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white border border-[#EEE9D8] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#B5C9A4]/20 flex items-center justify-center shrink-0">
              <Cookie size={18} className="text-[#8B9E7A]" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] font-bold text-[#2C2A25] text-lg">
                We use cookies
              </h2>
              <p className="text-sm text-[#7A7265] mt-1 leading-relaxed">
                We use essential storage to keep the site working and, only
                with your permission, analytics to help us understand how the
                site is used.{" "}
                <Link
                  href="/cookie-policy"
                  className="text-[#8B9E7A] font-bold hover:text-[#5E6E51] underline underline-offset-2"
                >
                  Read our cookie policy
                </Link>
                .
              </p>
            </div>
          </div>

          {showPrefs && (
            <div className="mb-4 space-y-3 border-t border-[#EEE9D8] pt-4">
              <div className="flex items-center justify-between bg-[#F8F7F0] rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#2C2A25]">Necessary</p>
                  <p className="text-xs text-[#7A7265]">
                    Required for login and core site features. Always on.
                  </p>
                </div>
                <div className="w-11 h-6 rounded-full bg-[#8B9E7A] flex items-center px-0.5 shrink-0 cursor-not-allowed">
                  <div className="w-5 h-5 rounded-full bg-white ml-auto" />
                </div>
              </div>
              <div className="flex items-center justify-between bg-[#F8F7F0] rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#2C2A25]">Analytics</p>
                  <p className="text-xs text-[#7A7265]">
                    Helps us understand how visitors use the site.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalytics((a) => !a)}
                  aria-pressed={analytics}
                  aria-label="Toggle analytics cookies"
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 shrink-0 transition-colors ${
                    analytics ? "bg-[#8B9E7A]" : "bg-[#EEE9D8]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      analytics ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {showPrefs ? (
              <button
                onClick={savePreferences}
                className="flex-1 min-w-[140px] bg-[#8B9E7A] text-white py-2.5 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all"
              >
                Save Preferences
              </button>
            ) : (
              <>
                <button
                  onClick={acceptAll}
                  className="flex-1 min-w-[140px] bg-[#8B9E7A] text-white py-2.5 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all"
                >
                  Accept All
                </button>
                <button
                  onClick={rejectNonEssential}
                  className="flex-1 min-w-[140px] border-2 border-[#EEE9D8] text-[#7A7265] py-2.5 rounded-full font-bold text-sm uppercase tracking-wide hover:border-[#8B9E7A] hover:text-[#8B9E7A] transition-all"
                >
                  Reject Non-Essential
                </button>
                <button
                  onClick={() => setShowPrefs(true)}
                  className="w-full text-xs font-bold text-[#7A7265] hover:text-[#2C2A25] transition-colors py-1"
                >
                  Manage Preferences
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CookiePrefsButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("tt-open-cookie-prefs"))}
      className="hover:text-[#B5C9A4] transition-colors"
    >
      Cookie Preferences
    </button>
  );
}
