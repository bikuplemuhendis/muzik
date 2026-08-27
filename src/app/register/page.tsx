"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    venueName: "",
    venueType: "cafe",
    city: "İstanbul",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Kayıt başarısız");
      setBusy(false);
      return;
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-[#121212] p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">İşletme hesabı</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input className="w-full px-3 py-2" placeholder="Adınız" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="w-full px-3 py-2" type="email" placeholder="E-posta" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full px-3 py-2" type="password" placeholder="Şifre (min 8)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input className="w-full px-3 py-2" placeholder="İşletme adı" value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} required />
          <select className="w-full px-3 py-2" value={form.venueType} onChange={(e) => setForm({ ...form, venueType: e.target.value })}>
            <option value="cafe">Kafe</option>
            <option value="restaurant">Restoran</option>
            <option value="hotel">Otel</option>
            <option value="spa">Spa</option>
            <option value="retail">Mağaza</option>
            <option value="office">Ofis</option>
            <option value="lounge">Lounge / bar</option>
            <option value="gym">Spor salonu</option>
          </select>
          <input className="w-full px-3 py-2" placeholder="Şehir" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button disabled={busy} className="w-full rounded-full bg-[#1ed760] py-2 font-semibold text-black">
            Kafe planı ile başla
          </button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/login" className="underline">
            Girişe dön
          </Link>
        </p>
      </div>
    </div>
  );
}
