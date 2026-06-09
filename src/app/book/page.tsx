"use client";
import { useState } from "react";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { createBooking, getBookedSlots } from "@/lib/firestore";

const SERVICES = [
  "Full Groom",
  "Bath & Dry",
  "Puppy Package",
  "Tidy Up",
];

const ALL_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
];

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export default function BookPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    dogName: "",
    dogBreed: "",
    service: "",
    notes: "",
  });

  async function handleDateSelect(date: string) {
    setSelectedDate(date);
    setLoading(true);
    try {
      const slots = await getBookedSlots(date);
      setBookedSlots(slots);
    } catch {
      setBookedSlots([]);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createBooking({
        ...form,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
      });
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const availableSlots = ALL_SLOTS.filter((s) => !bookedSlots.includes(s));

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
            <input
              type="date"
              min={todayString()}
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              className="w-full border border-[#EEE9D8] rounded-xl px-4 py-3 text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A] mb-6"
            />

            {selectedDate && (
              <>
                <label className="block text-sm font-bold text-[#2C2A25] mb-3">
                  Available Times
                </label>
                {loading ? (
                  <p className="text-[#7A7265] text-sm">Checking availability…</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-[#C0392B] text-sm">
                    No slots available on this date. Please choose another day.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 mb-6">
                    {ALL_SLOTS.map((slot) => {
                      const booked = bookedSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          disabled={booked}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                            booked
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
                )}
              </>
            )}

            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(2)}
              className="w-full bg-[#8B9E7A] text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
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
                disabled={loading}
                className="flex-1 bg-[#8B9E7A] text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CalendarCheck size={16} />
                {loading ? "Booking…" : "Confirm Booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
