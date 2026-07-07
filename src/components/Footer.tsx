import Link from "next/link";
import { Mail } from "lucide-react";
import { CookiePrefsButton } from "@/components/CookieConsent";

export default function Footer() {
  return (
    <footer className="bg-[#2C2A25] text-[#EEE9D8]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#B5C9A4] mb-3">
              Taylor&apos;s Tails 🐾
            </h3>
            <p className="text-sm text-[#7A7265] leading-relaxed">
              Professional dog grooming with love, care, and attention to every tail.
            </p>
            <Link
              href="/admin"
              className="inline-block mt-3 text-xs font-bold text-[#5A5650] hover:text-[#B5C9A4] transition-colors uppercase tracking-wide"
            >
              Admin
            </Link>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide text-[#B5C9A4] mb-4">
              Navigate
            </h4>
            <ul className="space-y-2 text-sm text-[#7A7265]">
              {[
                { href: "/", label: "Home" },
                { href: "/gallery", label: "Gallery" },
                { href: "/blog", label: "Blog" },
                { href: "/book", label: "Book Now" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-[#B5C9A4] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide text-[#B5C9A4] mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm text-[#7A7265]">
              <li>
                <a
                  href="mailto:enquiries@taylors-tails.com"
                  className="flex items-center gap-2 hover:text-[#B5C9A4] transition-colors"
                >
                  <Mail size={14} />
                  enquiries@taylors-tails.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#3C3A35] text-xs text-[#5A5650] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <span>© {new Date().getFullYear()} Taylor&apos;s Tails Dog Grooming. All rights reserved.</span>
          <span className="hidden sm:inline">·</span>
          <Link href="/cookie-policy" className="hover:text-[#B5C9A4] transition-colors">
            Cookie Policy
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/terms" className="hover:text-[#B5C9A4] transition-colors">
            Terms &amp; Conditions
          </Link>
          <span className="hidden sm:inline">·</span>
          <CookiePrefsButton />
        </div>
      </div>
    </footer>
  );
}
