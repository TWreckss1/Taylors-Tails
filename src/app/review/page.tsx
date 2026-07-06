"use client";
import { useState } from "react";
import { Star, CheckCircle2, Send } from "lucide-react";
import { createReview } from "@/lib/firestore";

export default function ReviewPage() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [form, setForm] = useState({ name: "", dogName: "", quote: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createReview({ ...form, rating });
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Couldn't submit your review — please try again in a moment.");
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="min-h-[70vh] bg-[#F8F7F0] py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#EEE9D8] p-8 text-center shadow-sm max-w-md">
          <CheckCircle2 size={56} className="text-[#4A7C59] mx-auto mb-4" />
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2C2A25] mb-2">
            Thank You!
          </h1>
          <p className="text-[#7A7265]">
            Your review has been submitted and will appear on our site once
            it&apos;s been approved. We really appreciate you taking the time. 🐾
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[#8B9E7A] text-sm font-bold uppercase tracking-widest">
            Leave a Review
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-[#2C2A25] mt-2">
            How Did We Do?
          </h1>
          <p className="text-[#7A7265] mt-3">
            We&apos;d love to hear about your experience at Taylor&apos;s Tails.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#EEE9D8] p-6 md:p-8 shadow-sm"
        >
          {/* Star rating */}
          <label className="block text-sm font-bold text-[#2C2A25] mb-3">
            Your Rating
          </label>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <Star
                  size={32}
                  className={
                    n <= (hovered || rating)
                      ? "text-[#C4A55A] fill-[#C4A55A]"
                      : "text-[#EEE9D8]"
                  }
                />
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
                Your Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sarah M."
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
                Dog&apos;s Name &amp; Breed
              </label>
              <input
                required
                value={form.dogName}
                onChange={(e) => setForm((f) => ({ ...f, dogName: e.target.value }))}
                placeholder="e.g. Bella the Cockapoo"
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
              Your Review
            </label>
            <textarea
              required
              rows={4}
              maxLength={400}
              value={form.quote}
              onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
              placeholder="Tell us about your experience…"
              className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A] resize-none"
            />
            <p className="text-xs text-[#7A7265] mt-1 text-right">
              {form.quote.length}/400
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#8B9E7A] text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60"
          >
            <Send size={15} />
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
