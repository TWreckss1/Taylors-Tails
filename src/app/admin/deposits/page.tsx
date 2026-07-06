"use client";
import { useEffect, useState } from "react";
import { getDepositSettings, saveDepositSettings, type DepositSettings } from "@/lib/firestore";
import { SITE } from "@/lib/site";
import { Save } from "lucide-react";

export default function AdminDeposits() {
  const [amounts, setAmounts] = useState<DepositSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setAmounts(await getDepositSettings());
      } catch { /* not configured yet */ }
      setLoading(false);
    })();
  }, []);

  function setAmount(service: string, value: string) {
    const num = Number(value);
    setAmounts((a) => ({ ...a, [service]: Number.isFinite(num) ? num : 0 }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveDepositSettings(amounts);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Save failed — check Firebase is configured.");
    }
    setSaving(false);
  }

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
          Deposits
        </h1>
        {saved && (
          <span className="text-sm font-bold text-[#4A7C59] bg-[#B5C9A4]/30 px-4 py-2 rounded-full">
            ✓ Saved!
          </span>
        )}
      </div>

      <p className="text-sm text-[#7A7265] mb-6 max-w-xl">
        Set how much deposit to request for each service. A deposit is only
        requested once you confirm a booking — the customer gets a &ldquo;Pay
        Deposit&rdquo; button in their confirmation email. Set an amount to
        £0 to skip the deposit for that service.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-2xl border border-[#EEE9D8] p-6 shadow-sm">
          <div className="space-y-4">
            {SITE.services.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between gap-4 border-b border-[#EEE9D8] last:border-0 pb-4 last:pb-0"
              >
                <div>
                  <p className="font-bold text-sm text-[#2C2A25]">{s.name}</p>
                  <p className="text-xs text-[#7A7265]">{s.description}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm font-bold text-[#7A7265]">£</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={amounts[s.name] ?? 0}
                    onChange={(e) => setAmount(s.name, e.target.value)}
                    className="w-24 border border-[#EEE9D8] rounded-xl px-3 py-2 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8B9E7A] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save Deposit Amounts"}
        </button>
      </form>
    </div>
  );
}
