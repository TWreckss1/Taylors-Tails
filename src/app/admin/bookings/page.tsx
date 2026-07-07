"use client";
import { useEffect, useState } from "react";
import {
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getDepositSettings,
  syncAllBookingSlots,
  type Booking,
  type DepositSettings,
} from "@/lib/firestore";
import { CheckCircle2, XCircle, Trash2, Banknote, RefreshCw, PlusCircle, X } from "lucide-react";
import { sendBookingNotification } from "@/lib/email";
import { SITE } from "@/lib/site";

const EMPTY_NEW_BOOKING = {
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  dogName: "",
  dogBreed: "",
  service: "",
  date: "",
  time: "",
  notes: "",
};

/** A confirmed appointment whose date & time have already passed. */
function isArchived(b: Booking): boolean {
  if (b.status !== "confirmed") return false;
  return new Date(`${b.date}T${b.time}`).getTime() < Date.now();
}

type Filter = "all" | "pending" | "confirmed" | "cancelled" | "archive";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [depositSettings, setDepositSettings] = useState<DepositSettings>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [syncing, setSyncing] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({ ...EMPTY_NEW_BOOKING });
  const [confirmImmediately, setConfirmImmediately] = useState(true);
  const [sendEmailToCustomer, setSendEmailToCustomer] = useState(true);
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [data, deposits] = await Promise.all([getBookings(), getDepositSettings()]);
      setBookings(data);
      setDepositSettings(deposits);
    } catch { /* not configured */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleStatus(id: string, status: Booking["status"]) {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    const depositAmount =
      status === "confirmed" ? depositSettings[booking.service] : undefined;

    await updateBookingStatus(id, status, booking.date, booking.time, depositAmount);

    if (status === "confirmed" || status === "cancelled") {
      sendBookingNotification(status, { ...booking, status, depositAmount });
    }
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this booking?")) return;
    await deleteBooking(id);
    await load();
  }

  function closeAddModal() {
    setAddModalOpen(false);
    setNewBooking({ ...EMPTY_NEW_BOOKING });
    setConfirmImmediately(true);
    setSendEmailToCustomer(true);
  }

  async function handleAddBooking(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const ref = await createBooking({ ...newBooking, status: "pending" });
      const canEmail = sendEmailToCustomer && newBooking.ownerEmail.trim() !== "";

      if (confirmImmediately) {
        const depositAmount = depositSettings[newBooking.service];
        await updateBookingStatus(ref.id, "confirmed", newBooking.date, newBooking.time, depositAmount);
        if (canEmail) {
          sendBookingNotification("confirmed", { ...newBooking, id: ref.id, status: "confirmed", depositAmount });
        }
      } else if (canEmail) {
        sendBookingNotification("new", { ...newBooking, id: ref.id, status: "pending" });
      }

      closeAddModal();
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Manual booking failed:", msg, err);
      alert(`Couldn't add booking: ${msg}`);
    }
    setAdding(false);
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const count = await syncAllBookingSlots();
      alert(`Synced availability data for ${count} booking${count === 1 ? "" : "s"}.`);
    } catch {
      alert("Sync failed — check Firebase is configured.");
    }
    setSyncing(false);
  }

  function countFor(f: Filter): number {
    if (f === "all") return bookings.length;
    if (f === "archive") return bookings.filter(isArchived).length;
    if (f === "confirmed") return bookings.filter((b) => b.status === "confirmed" && !isArchived(b)).length;
    return bookings.filter((b) => b.status === f).length;
  }

  const filtered = bookings.filter((b) => {
    if (filter === "all") return true;
    if (filter === "archive") return isArchived(b);
    if (filter === "confirmed") return b.status === "confirmed" && !isArchived(b);
    return b.status === filter;
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25]">
          Bookings
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#8B9E7A] px-3 py-1.5 rounded-full hover:bg-[#5E6E51] transition-colors"
          >
            <PlusCircle size={13} />
            New Booking
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            title="Fixes older bookings that don't correctly block nearby slots on the booking page"
            className="flex items-center gap-1.5 text-xs font-bold text-[#7A7265] border border-[#EEE9D8] px-3 py-1.5 rounded-full hover:border-[#8B9E7A] hover:text-[#8B9E7A] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Repair Availability Data"}
          </button>
        </div>
      </div>

      {/* Manual booking modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeAddModal} />
          <form
            onSubmit={handleAddBooking}
            className="relative bg-white rounded-2xl border border-[#EEE9D8] shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 pt-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2C2A25]">
                Add Booking Manually
              </h2>
              <button type="button" onClick={closeAddModal}
                className="p-1.5 rounded-lg text-[#7A7265] hover:bg-[#EEE9D8] transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="px-6 text-xs text-[#7A7265] mt-1">
              For phone or walk-in bookings, so there&apos;s a record on file.
            </p>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Owner Name *</label>
                  <input required value={newBooking.ownerName}
                    onChange={(e) => setNewBooking((f) => ({ ...f, ownerName: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Phone Number *</label>
                  <input required type="tel" value={newBooking.ownerPhone}
                    onChange={(e) => setNewBooking((f) => ({ ...f, ownerPhone: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Email Address (optional)</label>
                  <input type="email" value={newBooking.ownerEmail}
                    onChange={(e) => setNewBooking((f) => ({ ...f, ownerEmail: e.target.value }))}
                    placeholder="Leave blank if not provided"
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Dog&apos;s Name *</label>
                  <input required value={newBooking.dogName}
                    onChange={(e) => setNewBooking((f) => ({ ...f, dogName: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Breed *</label>
                  <input required value={newBooking.dogBreed}
                    onChange={(e) => setNewBooking((f) => ({ ...f, dogBreed: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Service *</label>
                  <select required value={newBooking.service}
                    onChange={(e) => setNewBooking((f) => ({ ...f, service: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]">
                    <option value="">Select a service…</option>
                    {SITE.services.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Date *</label>
                  <input required type="date" value={newBooking.date}
                    onChange={(e) => setNewBooking((f) => ({ ...f, date: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Time *</label>
                  <input required type="time" value={newBooking.time}
                    onChange={(e) => setNewBooking((f) => ({ ...f, time: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">Notes (optional)</label>
                  <textarea rows={2} value={newBooking.notes}
                    onChange={(e) => setNewBooking((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A] resize-none" />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="flex items-center gap-2 text-sm text-[#2C2A25] cursor-pointer">
                  <input type="checkbox" checked={confirmImmediately}
                    onChange={(e) => setConfirmImmediately(e.target.checked)}
                    className="rounded accent-[#8B9E7A]" />
                  Confirm immediately (skip pending)
                </label>
                <label className={`flex items-center gap-2 text-sm cursor-pointer ${newBooking.ownerEmail.trim() === "" ? "text-[#B0A898]" : "text-[#2C2A25]"}`}>
                  <input type="checkbox" checked={sendEmailToCustomer}
                    disabled={newBooking.ownerEmail.trim() === ""}
                    onChange={(e) => setSendEmailToCustomer(e.target.checked)}
                    className="rounded accent-[#8B9E7A]" />
                  Send confirmation email to customer
                  {newBooking.ownerEmail.trim() === "" && " (needs an email address)"}
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeAddModal}
                  className="px-5 py-2 rounded-full text-sm font-bold border border-[#EEE9D8] text-[#7A7265] hover:border-[#8B9E7A] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={adding}
                  className="px-6 py-2 rounded-full text-sm font-bold bg-[#8B9E7A] text-white hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60">
                  {adding ? "Saving…" : "Add Booking"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "confirmed", "cancelled", "archive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-colors ${
              filter === f
                ? "bg-[#8B9E7A] text-white"
                : "bg-white border border-[#EEE9D8] text-[#7A7265] hover:border-[#8B9E7A]"
            }`}
          >
            {f} ({countFor(f)})
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
          {filtered.map((b) => {
            const archived = isArchived(b);
            return (
            <div
              key={b.id}
              className={`bg-white rounded-2xl border border-[#EEE9D8] p-5 shadow-sm ${archived ? "opacity-75" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-bold text-[#2C2A25]">
                      {b.dogName}{" "}
                      <span className="text-[#7A7265] font-normal">
                        — {b.dogBreed}
                      </span>
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        archived
                          ? "bg-[#EEE9D8] text-[#7A7265]"
                          : b.status === "confirmed"
                          ? "bg-[#B5C9A4]/30 text-[#4A7C59]"
                          : b.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-[#DFC78A]/30 text-[#8B6F2E]"
                      }`}
                    >
                      {archived ? "completed" : b.status}
                    </span>
                    {b.status === "confirmed" && b.depositAmount ? (
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                          b.depositPaid
                            ? "bg-[#B5C9A4]/30 text-[#4A7C59]"
                            : "bg-[#DFC78A]/30 text-[#8B6F2E]"
                        }`}
                      >
                        <Banknote size={11} />
                        {b.depositPaid
                          ? `Deposit Paid £${b.depositAmount.toFixed(2)}`
                          : `Awaiting Deposit £${b.depositAmount.toFixed(2)}`}
                      </span>
                    ) : null}
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
                  {!archived && b.status !== "confirmed" && (
                    <button
                      onClick={() => handleStatus(b.id!, "confirmed")}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#4A7C59] border border-[#B5C9A4] px-3 py-1.5 rounded-full hover:bg-[#B5C9A4]/20 transition-colors"
                    >
                      <CheckCircle2 size={13} />
                      Confirm
                    </button>
                  )}
                  {!archived && b.status !== "cancelled" && (
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
            );
          })}
        </div>
      )}
    </div>
  );
}
