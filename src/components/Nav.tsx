"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/book", label: "Book Now" },
];

export default function Nav() {
  const pathname = usePathname();
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Close the menu on navigation (only JS usage)
  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.checked = false;
  }, [pathname]);

  return (
    <>
      {/*
        The checkbox is a sibling of the mobile menu div.
        CSS selector: input:checked ~ div  →  shows the menu.
        Zero JavaScript required for open/close.
      */}
      <input
        ref={checkboxRef}
        type="checkbox"
        id="nav-toggle"
        className="sr-only peer"
        aria-hidden="true"
      />

      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 py-2">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Taylor's Tails Dog Grooming"
                width={52}
                height={52}
                className="rounded-full object-cover"
                priority
              />
              <span className="text-xl md:text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#5E6E51]">
                Taylor&apos;s Tails
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {links.map(({ href, label }) =>
                label === "Book Now" ? (
                  <Link key={href} href={href}
                    className="bg-[#8B9E7A] text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#5E6E51] transition-colors">
                    {label}
                  </Link>
                ) : (
                  <Link key={href} href={href}
                    className={cn("text-sm font-bold uppercase tracking-wide transition-colors",
                      pathname === href ? "text-[#8B9E7A]" : "text-[#7A7265] hover:text-[#2C2A25]")}>
                    {label}
                  </Link>
                )
              )}
            </nav>

            {/* Mobile hamburger — a <label> that toggles the checkbox above */}
            <label
              htmlFor="nav-toggle"
              className="md:hidden flex items-center justify-center w-12 h-12 cursor-pointer text-[#2C2A25]"
              aria-label="Toggle menu"
            >
              <Menu size={26} />
            </label>

          </div>
        </div>
      </header>

      {/* Mobile menu — pure CSS, shown when checkbox is checked */}
      <div
        className="hidden peer-checked:block md:hidden fixed inset-x-0 z-[999] bg-white border-b border-[#EEE9D8] shadow-xl"
        style={{ top: 64 }}
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "block py-4 px-6 text-base font-bold uppercase tracking-wide border-b border-[#F0EDE4]",
              pathname === href ? "text-[#8B9E7A] bg-[#F8F7F0]" : "text-[#2C2A25]"
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
