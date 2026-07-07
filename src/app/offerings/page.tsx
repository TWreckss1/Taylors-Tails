import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Offerings",
  description:
    "See exactly what's included in our grooming services at Taylor's Tails, from full grooms to upcoming partial groom and cleanse options.",
};

const FULL_GROOM_INCLUDES = [
  "Bath",
  "Blow Dry",
  "Nail Clip",
  "Paw Pad Trim",
  "Sanitary Trim",
  "Ear Clean",
  "Full Body/Face Styling",
  "Perfume/Cologne",
];

export default function OfferingsPage() {
  return (
    <div className="min-h-[80vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#8B9E7A] text-sm font-bold uppercase tracking-widest">
            Our Services
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-[#2C2A25] mt-2">
            Offerings
          </h1>
          <p className="text-[#7A7265] mt-4 max-w-lg mx-auto">
            A clear breakdown of what&apos;s included in every service, priced
            by dog size at booking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Full Groom — active */}
          <div className="bg-white rounded-2xl border border-[#EEE9D8] p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2C2A25] mb-4">
              Full Groom
            </h2>
            <ul className="space-y-2.5">
              {FULL_GROOM_INCLUDES.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[#2C2A25]">
                  <Check size={16} className="text-[#8B9E7A] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/book"
              className="block text-center mt-6 bg-[#8B9E7A] text-white py-2.5 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#5E6E51] transition-colors"
            >
              Book Now
            </Link>
          </div>

          {/* Partial Groom — coming soon */}
          <div className="bg-white/60 rounded-2xl border border-[#EEE9D8] p-6 shadow-sm opacity-60">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#7A7265] mb-4 line-through decoration-2">
              Partial Groom
            </h2>
            <span className="inline-block bg-[#EEE9D8] text-[#7A7265] text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>

          {/* Cleanse — coming soon */}
          <div className="bg-white/60 rounded-2xl border border-[#EEE9D8] p-6 shadow-sm opacity-60">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#7A7265] mb-4 line-through decoration-2">
              Cleanse
            </h2>
            <span className="inline-block bg-[#EEE9D8] text-[#7A7265] text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
