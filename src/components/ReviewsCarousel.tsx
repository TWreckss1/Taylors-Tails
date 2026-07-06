"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getApprovedReviews, type Review } from "@/lib/firestore";

// Shown until real approved reviews exist in Firestore
const FALLBACK: Review[] = [
  {
    id: "fallback-1",
    name: "Sarah M.",
    dogName: "Bella the Cockapoo",
    quote:
      "Taylor's Tails is absolutely wonderful. Bella always comes back looking and smelling amazing — and she's not even anxious anymore!",
    rating: 5,
    status: "approved",
  },
  {
    id: "fallback-2",
    name: "James R.",
    dogName: "Bruno the Labrador",
    quote:
      "Best groomer we've ever used. Professional, caring, and Bruno actually enjoys going now. Highly recommend!",
    rating: 5,
    status: "approved",
  },
  {
    id: "fallback-3",
    name: "Emma L.",
    dogName: "Daisy the Cavapoo",
    quote:
      "So glad we found Taylor's Tails. The booking system is so easy and Daisy always looks incredible.",
    rating: 5,
    status: "approved",
  },
];

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white border border-[#EEE9D8] rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} size={16} className="text-[#C4A55A] fill-[#C4A55A]" />
        ))}
      </div>
      <p className="text-[#2C2A25] text-sm leading-relaxed mb-4 flex-1">
        &ldquo;{review.quote}&rdquo;
      </p>
      <div>
        <p className="font-bold text-sm text-[#2C2A25]">{review.name}</p>
        <p className="text-xs text-[#7A7265]">{review.dogName}</p>
      </div>
    </div>
  );
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getApprovedReviews()
      .then((r) => {
        if (r.length > 0) setReviews(r);
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  const perPage = 3;
  const pages = Math.ceil(reviews.length / perPage);
  const visible = reviews.slice(page * perPage, page * perPage + perPage);

  function go(dir: -1 | 1) {
    setPage((p) => (p + dir + pages) % pages);
  }

  return (
    <div>
      <div
        ref={scrollRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {visible.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        {pages > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous reviews"
              className="w-10 h-10 rounded-full bg-white border border-[#EEE9D8] flex items-center justify-center text-[#7A7265] hover:border-[#8B9E7A] hover:text-[#8B9E7A] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  aria-label={`Page ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === page ? "bg-[#8B9E7A]" : "bg-[#EEE9D8]"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => go(1)}
              aria-label="Next reviews"
              className="w-10 h-10 rounded-full bg-white border border-[#EEE9D8] flex items-center justify-center text-[#7A7265] hover:border-[#8B9E7A] hover:text-[#8B9E7A] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      <p className="text-center mt-6">
        <Link
          href="/review"
          className="text-sm font-bold text-[#8B9E7A] hover:text-[#5E6E51] transition-colors"
        >
          Been to see us? Leave a review →
        </Link>
      </p>
    </div>
  );
}
