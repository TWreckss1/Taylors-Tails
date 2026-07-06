import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Taylor's Tails uses cookies and similar storage on this website.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-[70vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#EEE9D8] p-8 shadow-sm">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25] mb-6">
          Cookie Policy
        </h1>

        <div className="space-y-6 text-sm text-[#7A7265] leading-relaxed">
          <p>
            This page explains what cookies and similar storage technologies
            Taylor&apos;s Tails uses on this website, and the choices you have
            over them.
          </p>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">Necessary</h2>
            <p>
              These keep the site working and cannot be switched off. On this
              site that means the secure sign-in session used by our admin
              panel — this only affects the business owner logging in to
              manage bookings, never regular visitors.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">Analytics</h2>
            <p>
              With your permission, we may use analytics to understand how
              visitors use the site (for example, which pages are most
              popular) so we can improve it. These are only ever set if you
              choose &ldquo;Accept All&rdquo; or enable them in your cookie
              preferences — nothing is set until you decide.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[#2C2A25] text-base mb-2">
              Your choices
            </h2>
            <p>
              You can change your preferences at any time using the &ldquo;Cookie
              Preferences&rdquo; link in the footer of this website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
