import { CheckCircle2 } from "lucide-react";

export default function PaySuccessPage() {
  return (
    <div className="min-h-[60vh] bg-[#F8F7F0] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#EEE9D8] p-8 text-center shadow-sm max-w-md">
        <CheckCircle2 size={48} className="text-[#4A7C59] mx-auto mb-4" />
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2C2A25] mb-2">
          Deposit Paid!
        </h1>
        <p className="text-sm text-[#7A7265]">
          Thank you — your deposit has been received and your appointment is
          all set. You&apos;ll get a receipt by email shortly.
        </p>
      </div>
    </div>
  );
}
