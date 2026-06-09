"use client";
import { useEffect, useState } from "react";
import {
  getAvailability,
  saveAvailability,
  generateTimeSlots,
  DEFAULT_AVAILABILITY,
  type Availability,
} from "@/lib/firestore";
import { Save, PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "4 hours", value: 240 },
];

export default function AvailabilityPage() {
  const [form, setForm] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setForm(await getAvailability());
      } catch { /* not configured yet */ }
      setLoading(false);
    })();
  }, []);

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day].sort((a, b) => a - b),
    }));
  }

  function addBlockedDate() {
    if (!newDate || form.blockedDates.includes(newDate)) return;
    setForm((f) => ({
      ...f,
      blockedDates: [...f.blockedDates, newDate].sort(),
    }));
    setNewDate("");
  }

  function removeBlockedDate(date: string) {
    setForm((f) => ({
      ...f,
      blockedDates: f.blockedDates.filter((d) => d !== date),
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAvailability(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Save failed — check Firebase is configured.");
    }
    setSaving(false);
  }

  const previewSlots = generateTimeSlots(form.startTime, form.endTime, form.slotDuration);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-[#8B9E7A] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25]">
          Availability
        </h1>
        {saved && (
          <span className="text-sm font-bold text-[#4A7C59] bg-[#B5C9A4]/30 px-4 py-2 rounded-full">
            ✓ Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Working days */}
        <div className="bg-white rounded-2xl border border-[#EEE9D8] p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2C2A25] mb-4">
            Working Days
          </h2>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day, i) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  "w-14 h-14 rounded-xl text-sm font-bold transition-all",
                  form.workingDays.includes(i)
                    ? "bg-[#8B9E7A] text-white shadow"
                    : "bg-[#F8F7F0] border border-[#EEE9D8] text-[#7A7265]"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Hours & slot settings */}
        <div className="bg-white rounded-2xl border border-[#EEE9D8] p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2C2A25] mb-4">
            Hours &amp; Slot Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
                Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
                End Time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
                Slot Duration
              </label>
              <select
                value={form.slotDuration}
                onChange={(e) => setForm((f) => ({ ...f, slotDuration: Number(e.target.value) }))}
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
                Max Bookings / Slot
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.maxPerSlot}
                onChange={(e) => setForm((f) => ({ ...f, maxPerSlot: Number(e.target.value) }))}
                className="w-full border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
              />
            </div>
          </div>

          {/* Slot preview */}
          {previewSlots.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold text-[#7A7265] uppercase tracking-wide mb-2">
                Preview — {previewSlots.length} slots per day
              </p>
              <div className="flex flex-wrap gap-2">
                {previewSlots.map((slot) => (
                  <span
                    key={slot}
                    className="bg-[#F8F7F0] border border-[#EEE9D8] text-[#2C2A25] text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Blocked dates */}
        <div className="bg-white rounded-2xl border border-[#EEE9D8] p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2C2A25] mb-4">
            Blocked Dates
            <span className="text-sm font-normal text-[#7A7265] ml-2">(holidays, days off)</span>
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={newDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 border border-[#EEE9D8] rounded-xl px-4 py-2.5 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
            />
            <button
              type="button"
              onClick={addBlockedDate}
              disabled={!newDate}
              className="flex items-center gap-2 bg-[#8B9E7A] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#5E6E51] transition-colors disabled:opacity-40"
            >
              <PlusCircle size={15} />
              Block
            </button>
          </div>

          {form.blockedDates.length === 0 ? (
            <p className="text-sm text-[#7A7265]">No dates blocked yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {form.blockedDates.map((date) => (
                <span
                  key={date}
                  className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-3 py-1.5 rounded-lg"
                >
                  {date}
                  <button
                    type="button"
                    onClick={() => removeBlockedDate(date)}
                    className="hover:text-red-900 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8B9E7A] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save Availability"}
        </button>

      </form>
    </div>
  );
}
