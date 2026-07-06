"use client";
import { useEffect, useState } from "react";
import {
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  type Review,
} from "@/lib/firestore";
import { Star, CheckCircle2, EyeOff, Trash2 } from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  async function load() {
    setLoading(true);
    try { setReviews(await getAllReviews()); } catch { /* not configured */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleStatus(id: string, status: Review["status"]) {
    await updateReviewStatus(id, status);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    await deleteReview(id);
    await load();
  }

  const filtered =
    filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25] mb-6">
        Reviews
      </h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-colors ${
              filter === f
                ? "bg-[#8B9E7A] text-white"
                : "bg-white border border-[#EEE9D8] text-[#7A7265] hover:border-[#8B9E7A]"
            }`}
          >
            {f}{" "}
            {f === "all"
              ? `(${reviews.length})`
              : `(${reviews.filter((r) => r.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-[#8B9E7A] border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EEE9D8] p-8 text-center shadow-sm">
          <p className="text-[#7A7265]">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-[#EEE9D8] p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={14} className="text-[#C4A55A] fill-[#C4A55A]" />
                      ))}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        r.status === "approved"
                          ? "bg-[#B5C9A4]/30 text-[#4A7C59]"
                          : "bg-[#DFC78A]/30 text-[#8B6F2E]"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#2C2A25] italic mb-1">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <p className="text-xs text-[#7A7265]">
                    {r.name} · {r.dogName}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  {r.status !== "approved" && (
                    <button
                      onClick={() => handleStatus(r.id!, "approved")}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#4A7C59] border border-[#B5C9A4] px-3 py-1.5 rounded-full hover:bg-[#B5C9A4]/20 transition-colors"
                    >
                      <CheckCircle2 size={13} />
                      Approve
                    </button>
                  )}
                  {r.status === "approved" && (
                    <button
                      onClick={() => handleStatus(r.id!, "pending")}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#8B6F2E] border border-[#DFC78A] px-3 py-1.5 rounded-full hover:bg-[#DFC78A]/20 transition-colors"
                    >
                      <EyeOff size={13} />
                      Hide
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id!)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#C0392B] border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
