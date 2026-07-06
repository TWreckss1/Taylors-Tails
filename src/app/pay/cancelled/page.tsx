"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";

function CancelledContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="bg-white rounded-2xl border border-[#EEE9D8] p-8 text-center shadow-sm max-w-md">
      <XCircle size={48} className="text-[#C0392B] mx-auto mb-4" />
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2C2A25] mb-2">
        Payment Cancelled
      </h1>
      <p className="text-sm text-[#7A7265] mb-6">
        No worries — your booking is still confirmed. You can pay your
        deposit whenever you&apos;re ready.
      </p>
      {bookingId && (
        <Link
          href={`/pay/${bookingId}`}
          className="inline-block bg-[#8B9E7A] text-white px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] transition-colors"
        >
          Try Again
        </Link>
      )}
    </div>
  );
}

export default function PayCancelledPage() {
  return (
    <div className="min-h-[60vh] bg-[#F8F7F0] flex items-center justify-center px-4">
      <Suspense fallback={null}>
        <CancelledContent />
      </Suspense>
    </div>
  );
}
