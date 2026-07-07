import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Taylor's Tails Dog Grooming Salon — General Client Agreement and terms and conditions.",
};

// Index 4 (point 5) gets extra links to the specific-case disclaimer pages —
// rendered separately below rather than baked into the string.
const TERMS = [
  "I confirm that my dog is fit, healthy, and up-to-date with vaccinations and flea/worm treatment.",
  "I understand that grooming involves the use of tools and equipment, and while all care is taken, minor injuries can occasionally occur.",
  "I agree to inform Taylor's Tails of any health or behavioural issues relevant to grooming.",
  "I accept that appointment cancellations must be made at least 24 hours in advance to avoid a cancellation fee.",
  "I understand that matted dogs, senior dogs, reactive dogs, or puppies may require special handling, which could incur extra fees or changes to the grooming outcome.",
  "I agree to pay in full at the time of collection.",
];

const SPECIAL_CASE_LINKS = [
  { href: "/terms/reactive", label: "Reactive or Anxious" },
  { href: "/terms/matted", label: "Matted" },
  { href: "/terms/senior", label: "Senior" },
  { href: "/terms/puppy", label: "Puppy" },
];

export default function TermsPage() {
  return (
    <div className="min-h-[70vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#EEE9D8] p-8 shadow-sm">
        <span className="text-[#8B9E7A] text-sm font-bold uppercase tracking-widest">
          General Client Agreement
        </span>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25] mt-2 mb-6">
          Terms &amp; Conditions
        </h1>

        <p className="text-sm text-[#7A7265] leading-relaxed mb-4">
          Welcome to Taylor&apos;s Tails Dog Grooming Salon. Our goal is to
          provide a safe, comfortable, and professional grooming experience
          for your pet.
        </p>
        <p className="text-sm text-[#7A7265] leading-relaxed mb-6">
          By booking an appointment or completing our booking form, you
          acknowledge and agree to the following:
        </p>

        <ol className="space-y-4 mb-2">
          {TERMS.map((term, i) => (
            <li key={i} className="flex gap-3 text-sm text-[#2C2A25] leading-relaxed">
              <span className="font-bold text-[#8B9E7A] shrink-0">{i + 1}.</span>
              <span>
                {term}
                {i === 4 && (
                  <span className="block mt-2 text-xs text-[#7A7265]">
                    Read the full disclaimer for your situation:{" "}
                    {SPECIAL_CASE_LINKS.map(({ href, label }, idx) => (
                      <span key={href}>
                        <Link
                          href={href}
                          target="_blank"
                          className="text-[#8B9E7A] font-bold hover:text-[#5E6E51] underline underline-offset-2"
                        >
                          {label}
                        </Link>
                        {idx < SPECIAL_CASE_LINKS.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
