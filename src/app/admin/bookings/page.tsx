"use client";
import { useEffect, useState } from "react";
import {
  getBookings,
  updateBookingStatus,
  deleteBooking,
  type Booking,
} from "@/lib/firestore";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  async function load() {
    setLoading(true);
    try {
      const data = await getBookings();
      setBookings(data);
    } catch { /* not configured */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleStatus(id: string, status: Booking["status"]) {
    await updateBookingStatus(id, status);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this booking?")) return;
    await deleteBooking(id);
    await load();
  }

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25] mb-6">
        Bookings
      </h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-colors ${
              filter === f
                ? "bg-[#8B9E7A] text-white"
                : "bg-white border border-[#EEE9D8] text-[#7A7265] hover:border-[#8B9E7A]"
            }`}
          >
            {f} {f === "all" ? `(${bookings.length})` : `(${bookings.filter((b) => b.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-[#8B9E7A] border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EEE9D8] p-8 text-center shadow-sm">
          <p className="text-[#7A7265]">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-[#EEE9D8] p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-[#2C2A25]">
                      {b.dogName}{" "}
                      <span className="text-[#7A7265] font-normal">
                        — {b.dogBreed}
                      </span>
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        b.status === "confirmed"
                          ? "bg-[#B5C9A4]/30 text-[#4A7C59]"
                          : b.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-[#DFC78A]/30 text-[#8B6F2E]"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#7A7265]">
                    {b.ownerName} · {b.ownerEmail} · {b.ownerPhone}
                  </p>
                  <p className="text-sm text-[#7A7265] mt-1">
                    <strong className="text-[#2C2A25]">{b.service}</strong> on{" "}
                    <strong className="text-[#2C2A25]">
                      {b.date} at {b.time}
                    </strong>
                  </p>
                  {b.notes && (
                    <p className="text-xs text-[#7A7265] mt-1 italic">
                      Note: {b.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {b.status !== "confirmed" && (
                    <button
                      onClick={() => handleStatus(b.id!, "confirmed")}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#4A7C59] border border-[#B5C9A4] px-3 py-1.5 rounded-full hover:bg-[#B5C9A4]/20 transition-colors"
                    >
                      <CheckCircle2 size={13} />
                      Confirm
                    </button>
                  )}
                  {b.status !== "cancelled" && (
                    <button
                      onClick={() => handleStatus(b.id!, "cancelled")}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#C0392B] border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <XCircle size={13} />
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(b.id!)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#7A7265] border border-[#EEE9D8] px-3 py-1.5 rounded-full hover:bg-[#EEE9D8] transition-colors"
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
