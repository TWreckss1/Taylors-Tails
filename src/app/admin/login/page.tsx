"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      router.replace("/admin");
    } catch {
      setError("Invalid email or password.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F0] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C2A25]">
            Admin Login
          </h1>
          <p className="text-[#7A7265] text-sm mt-2">Taylor&apos;s Tails</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#EEE9D8] p-8 shadow-sm"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#EEE9D8] rounded-xl px-4 py-3 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-[#2C2A25] mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#EEE9D8] rounded-xl px-4 py-3 text-sm text-[#2C2A25] bg-[#F8F7F0] focus:outline-none focus:ring-2 focus:ring-[#8B9E7A]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B9E7A] text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-[#5E6E51] active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
