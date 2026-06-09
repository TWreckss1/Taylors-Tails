import Link from "next/link";
import { Mail, Phone } from "lucide-react";

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
                  href="mailto:hello@taylorstails.com"
                  className="flex items-center gap-2 hover:text-[#B5C9A4] transition-colors"
                >
                  <Mail size={14} />
                  hello@taylorstails.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+441234567890"
                  className="flex items-center gap-2 hover:text-[#B5C9A4] transition-colors"
                >
                  <Phone size={14} />
                  01234 567 890
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a
                href="#"
                className="text-xs font-bold text-[#7A7265] hover:text-[#B5C9A4] transition-colors uppercase tracking-wide"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-xs font-bold text-[#7A7265] hover:text-[#B5C9A4] transition-colors uppercase tracking-wide"
                aria-label="Facebook"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#3C3A35] text-xs text-[#5A5650] text-center">
          © {new Date().getFullYear()} Taylor&apos;s Tails Dog Grooming. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
