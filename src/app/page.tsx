import Link from "next/link";
import { Scissors, Star, Heart, Shield, CalendarCheck } from "lucide-react";

const services = [
  {
    icon: "✂️",
    title: "Full Groom",
    desc: "Bath, blow-dry, breed-standard cut, ear clean, nail trim & spritz.",
  },
  {
    icon: "🛁",
    title: "Bath & Dry",
    desc: "Deep cleanse shampoo, conditioning treatment, and a thorough blow-dry.",
  },
  {
    icon: "💅",
    title: "Puppy Package",
    desc: "A gentle introduction to grooming for puppies under 6 months.",
  },
  {
    icon: "✨",
    title: "Tidy Up",
    desc: "Paws, face, and sanitary tidy to keep your pup looking fresh between grooms.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    dog: "Bella the Cockapoo",
    quote:
      "Taylor's Tails is absolutely wonderful. Bella always comes back looking and smelling amazing — and she's not even anxious anymore!",
    stars: 5,
  },
  {
    name: "James R.",
    dog: "Bruno the Labrador",
    quote:
      "Best groomer we've ever used. Professional, caring, and Bruno actually enjoys going now. Highly recommend!",
    stars: 5,
  },
  {
    name: "Emma L.",
    dog: "Daisy the Cavapoo",
    quote:
      "So glad we found Taylor's Tails. The booking system is so easy and Daisy always looks incredible.",
    stars: 5,
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F8F7F0]">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#B5C9A4]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-[#DFC78A]/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <span className="inline-block bg-[#EEE9D8] text-[#5E6E51] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            🐾 Professional Dog Grooming
          </span>

          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl font-bold text-[#2C2A25] leading-tight mb-6">
            Every Dog Deserves to
            <br />
            <span className="text-[#8B9E7A]">Look Their Best</span>
          </h1>

          <p className="max-w-xl mx-auto text-lg text-[#7A7265] leading-relaxed mb-10">
            Caring, professional grooming tailored to your dog&apos;s breed and
            personality. From puppies to seniors — every tail gets the VIP
            treatment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-[#8B9E7A] text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all shadow-lg shadow-[#8B9E7A]/30"
            >
              <CalendarCheck size={18} />
              Book an Appointment
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 border-2 border-[#8B9E7A] text-[#8B9E7A] px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#8B9E7A] hover:text-white active:scale-95 transition-all"
            >
              View Gallery
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-14 text-sm text-[#7A7265]">
            {[
              { icon: <Shield size={16} />, text: "Fully Insured" },
              { icon: <Heart size={16} />, text: "Dog-First Approach" },
              { icon: <Star size={16} />, text: "5★ Rated" },
              { icon: <Scissors size={16} />, text: "All Breeds Welcome" },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <span className="text-[#8B9E7A]">{icon}</span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#8B9E7A] text-sm font-bold uppercase tracking-widest">
              What We Offer
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-[#2C2A25] mt-2">
              Our Grooming Services
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#F8F7F0] border border-[#EEE9D8] rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <span className="text-3xl mb-4 block">{icon}</span>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2C2A25] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[#7A7265] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-[#C4A55A] text-[#2C2A25] px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#8B6F2E] hover:text-white active:scale-95 transition-all"
            >
              <CalendarCheck size={16} />
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="bg-[#F8F7F0] py-20 md:py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#8B9E7A] text-sm font-bold uppercase tracking-widest">
              Happy Customers
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-[#2C2A25] mt-2">
              What Owners Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, dog, quote, stars }) => (
              <div
                key={name}
                className="bg-white border border-[#EEE9D8] rounded-2xl p-6 shadow-sm"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-[#C4A55A] fill-[#C4A55A]"
                    />
                  ))}
                </div>
                <p className="text-[#2C2A25] text-sm leading-relaxed mb-4">
                  &ldquo;{quote}&rdquo;
                </p>
                <div>
                  <p className="font-bold text-sm text-[#2C2A25]">{name}</p>
                  <p className="text-xs text-[#7A7265]">{dog}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="bg-[#5E6E51] py-16 md:py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Book?
          </h2>
          <p className="text-[#B5C9A4] mb-8 max-w-md mx-auto">
            Slots fill up fast — secure your dog&apos;s appointment today.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-[#C4A55A] text-[#2C2A25] px-10 py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#DFC78A] active:scale-95 transition-all shadow-lg"
          >
            <CalendarCheck size={18} />
            Book an Appointment
          </Link>
        </div>
      </section>
    </>
  );
}
