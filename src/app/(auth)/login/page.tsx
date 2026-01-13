"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Gate from "@/components/Gate";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const SECRET = "in vino veritas";

  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"gate" | "login">("gate");

  const [passphrase, setPassphrase] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function fail(msg: string) {
    setError(msg);
  }

  function handleGate() {
    setError(null);

    if (passphrase.trim().toLowerCase() !== SECRET) {
      return fail("The gate remains sealed.");
    }

    setOpen(true);
    // Let the doors open before showing the parchment form
    setTimeout(() => setStage("login"), 900);
  }

  async function handleLogin() {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return fail("Denied. Your oath is not recognized.");

    router.push("/");
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-10 px-6 py-10">
      <Gate open={open} />

      {stage === "gate" ? (
        <div className="w-full max-w-sm">
          <p className="text-center text-sm text-[#e6d8ac]/80 mb-3">
            Speak the passphrase.
          </p>

          <input
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGate()}
            placeholder="..."
            className="w-full rounded-xl bg-black/60 border border-[#a88b4a]/30 px-4 py-3 text-[#f3e7c5] placeholder:text-[#d7c79a]/30 outline-none focus:border-[#ffd28a]/60 focus:ring-2 focus:ring-[#ffd28a]/10"
          />

          <button
            onClick={handleGate}
            className="mt-4 w-full rounded-xl px-4 py-3 font-semibold tracking-wide bg-gradient-to-b from-[#d6b05a] via-[#b9892f] to-[#7a551a] text-black hover:brightness-110 active:brightness-95 transition"
          >
            Unseal the Gate
          </button>
        </div>
      ) : (
        // Parchment / board login
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-[#a88b4a]/30 bg-[linear-gradient(180deg,rgba(40,30,18,0.9),rgba(10,8,6,0.95))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.85)]">
            <p className="text-center text-sm text-[#e6d8ac]/80">
              Inscribe your name in the ledger.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block text-xs tracking-widest text-[#d7c79a]/70 uppercase">
                Sigil (Email)
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-black/55 border border-[#a88b4a]/30 px-4 py-3 text-[#f3e7c5] placeholder:text-[#d7c79a]/30 outline-none focus:border-[#ffd28a]/60 focus:ring-2 focus:ring-[#ffd28a]/10"
                placeholder="sigil@bacchanterne.org"
              />

              <label className="block text-xs tracking-widest text-[#d7c79a]/70 uppercase">
                Oath (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-black/55 border border-[#a88b4a]/30 px-4 py-3 text-[#f3e7c5] placeholder:text-[#d7c79a]/30 outline-none focus:border-[#ffd28a]/60 focus:ring-2 focus:ring-[#ffd28a]/10"
                placeholder="••••••••••"
              />

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-xl px-4 py-3 font-semibold tracking-wide bg-gradient-to-b from-[#d6b05a] via-[#b9892f] to-[#7a551a] text-black hover:brightness-110 active:brightness-95 transition disabled:opacity-60"
              >
                {loading ? "The ledger listens..." : "Enter Bacchanterne"}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              setStage("gate");
              setPassphrase("");
              setError(null);
            }}
            className="mt-4 w-full text-xs text-[#d7c79a]/60 hover:text-[#ffd28a]/70 transition"
          >
            Retreat to the gate
          </button>
        </div>
      )}

      {error ? (
        <div className="w-full max-w-sm rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 text-center">
          {error}
        </div>
      ) : null}
    </div>
  );
}
