"use client";
import { useEffect, useState, use } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function PayRedirectPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to start payment");
        window.location.href = data.url;
      })
      .catch((err: Error) => setError(err.message));
  }, [bookingId]);

  return (
    <div className="min-h-[60vh] bg-[#F8F7F0] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#EEE9D8] p-8 text-center shadow-sm max-w-md">
        {error ? (
          <>
            <AlertCircle size={40} className="text-[#C0392B] mx-auto mb-4" />
            <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2C2A25] mb-2">
              Couldn&apos;t start payment
            </h1>
            <p className="text-sm text-[#7A7265]">{error}</p>
          </>
        ) : (
          <>
            <Loader2 size={40} className="text-[#8B9E7A] mx-auto mb-4 animate-spin" />
            <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2C2A25] mb-2">
              Taking you to secure payment…
            </h1>
            <p className="text-sm text-[#7A7265]">
              Please wait a moment.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
