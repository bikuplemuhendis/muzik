"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("venue@aura.local");
  const [password, setPassword] = useState("AuraVenue123!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const next = params.get("next");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Giriş başarısız");
      setBusy(false);
      return;
    }
    router.push(next || json.redirect || "/home");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#121212] p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">Giriş yap</h1>
        <p className="mt-1 text-sm text-[#b3b3b3]">İşletme çaları veya admin katalog.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input className="w-full px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button disabled={busy} className="w-full rounded-full bg-[#1ed760] py-2 font-semibold text-black">
            Devam et
          </button>
        </form>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-full border border-white/15 px-3 py-2 text-xs"
            onClick={() => {
              setEmail("venue@aura.local");
              setPassword("AuraVenue123!");
            }}
          >
            İşletme doldur
          </button>
          <button
            type="button"
            className="flex-1 rounded-full border border-white/15 px-3 py-2 text-xs"
            onClick={() => {
              setEmail("admin@aura.local");
              setPassword("AuraAdmin123!");
            }}
          >
            Admin doldur
          </button>
        </div>
        <div className="mt-4 space-y-1 text-xs text-[#6a6a6a]">
          <p>Demo işletme: venue@aura.local / AuraVenue123!</p>
          <p>Demo admin: admin@aura.local / AuraAdmin123!</p>
        </div>
        <p className="mt-4 text-sm text-[#b3b3b3]">
          Hesabınız yok mu?{" "}
          <Link href="/register" className="text-white underline">
            Kayıt
          </Link>
        </p>
      </div>
    </div>
  );
}
