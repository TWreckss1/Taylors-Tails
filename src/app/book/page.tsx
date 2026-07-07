"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  createBooking,
  getBookedSlots,
  getAvailability,
  generateTimeSlots,
  DEFAULT_AVAILABILITY,
  type Availability,
} from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { sendBookingNotification } from "@/lib/email";

const SERVICES = [
  "Small Dog Full Groom from £45",
  "Medium Dog Full Groom from £55",
  "Large Dog Full Groom from £65",
  "X-Large Dog Full Groom from £75",
  "Nail Trim Only (Walk-ins Welcome) from £10",
];

const SAME_DAY_PHONE = "07966214750";

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function BookPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [allSlots, setAllSlots] = useState<string[]>(
    generateTimeSlots(DEFAULT_AVAILABILITY.startTime, DEFAULT_AVAILABILITY.endTime, DEFAULT_AVAILABILITY.slotDuration)
  );
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [slotsChecking, setSlotsChecking] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSameDayPopup, setShowSameDayPopup] = useState(false);
  const [form, setForm] = useState({
    ownerName: "", ownerEmail: "", ownerPhone: "",
    dogName: "", dogBreed: "", service: "", notes: "",
  });

  // Load availability in the background — page is usable immediately with defaults
  useEffect(() => {
    getAvailability()
      .then((a) => {
        setAvailability(a);
        setAllSlots(generateTimeSlots(a.startTime, a.endTime, a.slotDuration));
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  function isDateAvailable(dateStr: string): boolean {
    if (availability.blockedDates.includes(dateStr)) return false;
    const day = new Date(dateStr + "T12:00:00").getDay();
    return availability.workingDays.includes(day);
  }

  // Greys out non-working days and blocked dates directly in the calendar —
  // re-evaluated on every render, so it updates live whenever `availability`
  // changes (e.g. the owner toggles off Saturday in the admin panel).
  function isDateDisabled(date: Date): boolean {
    if (date < startOfToday()) return true;
    if (!availability.workingDays.includes(date.getDay())) return true;
    return availability.blockedDates.includes(toDateStr(date));
  }

  function toMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  /** Blocked if the exact slot is at capacity, or falls within the buffer
   * window either side of an existing (non-cancelled) booking. */
  function isSlotBlocked(slot: string): boolean {
    const countAtSlot = bookedTimes.filter((t) => t === slot).length;
    if (countAtSlot >= availability.maxPerSlot) return true;

    const bufferMins = availability.bufferHours * 60;
    if (bufferMins <= 0) return false;
    const slotMins = toMinutes(slot);
    return bookedTimes.some((t) => Math.abs(toMinutes(t) - slotMins) < bufferMins);
  }

  function isToday(dateStr: string): boolean {
    return dateStr === toDateStr(new Date());
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setBookedTimes([]); // clear immediately — show all slots open
    if (!date) return;

    if (isToday(date)) {
      setShowSameDayPopup(true);
      return; // no online same-day booking — skip fetching slots
    }

    // Fetch booked slots in the background — slots are visible straight away
    setSlotsChecking(true);
    getBookedSlots(date)
      .then(setBookedTimes)
      .catch(() => { /* treat as all available */ })
      .finally(() => setSlotsChecking(false));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    if (!db) {
      setSubmitError("Booking failed: Firebase is not configured on this deployment. Contact the site owner.");
      setSubmitting(false);
      return;
    }
    try {
      await createBooking({
        ...form,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
      });
      sendBookingNotification("new", {
        ...form,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
      });
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Booking failed:", msg, err);
      setSubmitError(`Booking failed: ${msg}`);
    }
    setSubmitting(false);
  }


  return (
    <div className="min-h-[80vh] bg-[#F8F7F0] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#8B9E7A] text-sm font-bold uppercase tracking-widest">
            Book Online
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-[#2C2A25] mt-2">
            Reserve Your Slot
          </h1>
          <p className="text-[#7A7265] mt-3">
            Choose a date, pick a time, and fill in your details. We&apos;ll confirm within 24 hours.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s
                    ? "bg-[#8B9E7A] text-white"
                    : "bg-[#EEE9D8] text-[#7A7265]"
                }`}
              >
                {s}
              </div>
              {s < 2 && <div className="w-16 h-0.5 bg-[#EEE9D8]" />}
            </div>
          ))}
        </div>

        {/* ── Step 3: Confirmation ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-[#EEE9D8] p-8 text-center shadow-sm">
            <CheckCircle2 size={56} className="text-[#4A7C59] mx-auto mb-4" />
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2C2A25] mb-2">
              Booking Received!
            </h2>
            <p className="text-[#7A7265] mb-1">
              <strong>{form.dogName}</strong> is booked in for a{" "}
              <strong>{form.service}</strong>
            </p>
            <p className="text-[#7A7265] mb-6">
              {selectedDate} at {selectedTime}
            </p>
            <p className="text-sm text-[#7A7265] bg-[#F8F7F0] rounded-xl p-4">
              We&apos;ll send a confirmation to <strong>{form.ownerEmail}</strong> within 24 hours.
            </p>
          </div>
        )}

        {/* ── Step 1: Date & Time ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-[#EEE9D8] p-6 md:p-8 shadow-sm">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2C2A25] mb-6">
              Step 1 — Choose a Date & Time
            </h2>

            <label className="block text-sm font-bold text-[#2C2A25] mb-2">
              Select a Date
            </label>
            <div className="flex justify-center border border-[#EEE9D8] rounded-xl bg-[#F8F7F0] p-2 mb-4">
              <DayPicker
                className="tt-datepicker"
                mode="single"
                selected={selectedDate ? new Date(selectedDate + "T12:00:00") : undefined}
                onSelect={(date) => handleDateSelect(date ? toDateStr(date) : "")}
                disabled={isDateDisabled}
                startMonth={startOfToday()}
              />
            </div>

            {selectedDate && isDateAvailable(selectedDate) && isToday(selectedDate) && (
              <p className="text-sm text-[#2C2A25] bg-[#DFC78A]/20 border border-[#DFC78A] rounded-xl px-4 py-3 mb-6">
                For last-minute, same-day bookings please call us directly on{" "}
                <a href={`tel:${SAME_DAY_PHONE}`} className="font-bold text-[#8B6F2E] hover:underline">
                  {SAME_DAY_PHONE}
                </a>
                . Online booking is available from tomorrow onwards.
              </p>
            )}

            {selectedDate && isDateAvailable(selectedDate) && !isToday(selectedDate) && (
              <>
                <div className="flex items-center justify-between mb-3 mt-3">
                  <label className="block text-sm font-bold text-[#2C2A25]">
                    Available Times
                  </label>
                  {slotsChecking && (
                    <span className="text-xs text-[#7A7265] flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded-full border-2 border-[#8B9E7A] border-t-transparent animate-spin" />
                      Updating…
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 mb-6">
                  {allSlots.map((slot) => {
                    const full = isSlotBlocked(slot);
                    return (
                      <button
                        key={slot}
                        disabled={full}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                          full
                            ? "bg-[#EEE9D8] text-[#B0A898] cursor-not-allowed line-through"
                            : selectedTime === slot
                            ? "bg-[#8B9E7A] text-white shadow"
                            : "bg-[#F8F7F0] border border-[#EEE9D8] text-[#2C2A25] hover:border-[#8B9E7A]"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button
              disabled={!selectedDate || !selectedTime || !isDateAvailable(selectedDate) || isToday(selectedDate)}
              onClick={() => setStep(2)}
              className="w-full bg-[#8B9E7A] text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Same-day booking popup */}
        {showSameDayPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowSameDayPopup(false)}
            />
            <div className="relative bg-white rounded-2xl border border-[#EEE9D8] shadow-xl w-full max-w-sm p-6 text-center">
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2C2A25] mb-3">
                Last-Minute Booking?
              </h3>
              <p className="text-sm text-[#7A7265] leading-relaxed mb-6">
                For last-minute bookings please reach out via{" "}
                <a href={`tel:${SAME_DAY_PHONE}`} className="font-bold text-[#8B9E7A] hover:underline">
                  Tel: {SAME_DAY_PHONE}
                </a>
                . Online booking is available from tomorrow onwards.
              </p>
              <div className="flex gap-3">
                <a
                  href={`tel:${SAME_DAY_PHONE}`}
                  className="flex-1 bg-[#8B9E7A] text-white py-2.5 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#5E6E51] transition-colors"
                >
                  Call Now
                </a>
                <button
                  onClick={() => setShowSameDayPopup(false)}
                  className="flex-1 border-2 border-[#EEE9D8] text-[#7A7265] py-2.5 rounded-full text-sm font-bold uppercase tracking-wide hover:border-[#8B9E7A] hover:text-[#8B9E7A] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Details ── */}
        {step === 2 && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-[#EEE9D8] p-6 md:p-8 shadow-sm"
          >
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2C2A25] mb-2">
              Step 2 — Your Details
            </h2>
            <p className="text-sm text-[#7A7265] mb-6">
              Booking for {selectedDate} at {selectedTime}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {(
                [
                  { name: "ownerName", label: "Your Name", type: "text" },
                  { name: "ownerEmail", label: "Email Address", type: "email" },
                  { name: "ownerPhone", label: "Phone Number", type: "tel" },
                  { name: "dogName", label: "Dog's Name", type: "text" },
                  { name: "dogBreed", label: "Breed", type: "text" },
                ] as const
              ).map(({ name, label, type }) => (
                <div key={name}>
                  <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
                    {label}
                  </label>
                  <input
                    required
                    type={type}
                    value={form[name]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [name]: e.target.value }))
                    }
                    className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
                  Service
                </label>
                <select
                  required
                  value={form.service}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, service: e.target.value }))
                  }
                  className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
                >
                  <option value="">Select a service…</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#7A7265] mt-1.5">
                  Please see our{" "}
                  <Link href="/offerings" className="text-[#8B9E7A] font-bold hover:text-[#5E6E51] underline underline-offset-2">
                    Offerings
                  </Link>{" "}
                  page for a full breakdown of what&apos;s included.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
                Additional Notes (optional)
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="e.g. nervous dog, specific areas to avoid…"
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A] resize-none"
              />
            </div>

            <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded accent-[#8B9E7A]"
              />
              <span className="text-sm text-[#2C2A25]">
                By completing this form I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-[#8B9E7A] font-bold hover:text-[#5E6E51] underline underline-offset-2"
                >
                  Terms and Conditions
                </Link>{" "}
                laid out by Taylor&apos;s Tails.
              </span>
            </label>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-2">
                {submitError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-[#EEE9D8] text-[#7A7265] py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:border-[#8B9E7A] hover:text-[#8B9E7A] transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting || !agreedToTerms}
                className="flex-1 bg-[#8B9E7A] text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CalendarCheck size={16} />
                {submitting ? "Booking…" : "Confirm Booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
