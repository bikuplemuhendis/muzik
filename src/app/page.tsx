import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PLANS } from "@/data/catalog";
import { annualDiscountPercent, formatTry } from "@/lib/pricing";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-black text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#plans" className="text-[#b3b3b3] hover:text-white">
            Planlar
          </Link>
          <Link href="/login" className="rounded-full bg-white px-4 py-2 font-semibold text-black">
            Giriş
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#c8a45a]">
            Telifsiz ticari icra
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Mekânınızın sesi, <span className="text-[#c8a45a]">telif riski olmadan.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[#b3b3b3]">
            Aura, kafe, restoran, otel, spa ve mağazalar için yazılmış orijinal ambiyans kataloğudur. Spotify
            benzeri çalar, gün dilimine göre listeler ve denetimde gösterebileceğiniz ticari icra belgesi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-full bg-[#1ed760] px-6 py-3 font-semibold text-black">
              Deneme hesabı aç
            </Link>
            <Link href="/login" className="rounded-full border border-white/20 px-6 py-3 font-semibold">
              Demo giriş
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#6a6a6a]">
            Toplama kuruluşu tarifeleri yerine işletmeye özel, şeffaf abonelik. Katalog yalnızca Aura’ya aittir.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#2a2116] to-[#121212] p-6 shadow-2xl">
          <div className="mb-4 text-sm text-[#b3b3b3]">Şu an çalıyor · Demo Kafe Kadıköy</div>
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-md bg-[#c8a45a]" />
            <div>
              <p className="text-xl font-semibold">Morning Steam</p>
              <p className="text-[#b3b3b3]">Aura Atelier · Ceramic Hours</p>
              <p className="mt-2 text-xs text-[#c8a45a]">Kafe · Sakin · Telifsiz · Sohbete uygun</p>
            </div>
          </div>
          <div className="mt-6 h-1 rounded-full bg-white/10">
            <div className="h-1 w-1/3 rounded-full bg-[#1ed760]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold">Neden işletmeler için ayrı bir platform?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Tüketici uygulaması değil",
              d: "Spotify/YouTube Music kişisel dinleme lisansıdır. Mekânda çalmak ayrı bir icra hakkıdır. Aura bu hakkı aboneliğe dahil eder.",
            },
            {
              t: "Sözsüz, mekâna göre",
              d: "Vokal ve drop yok. Kafe sabahı, restoran servisi, lobi ve spa için enerji ve gün dilimi taksonomisi.",
            },
            {
              t: "Katalog sadece admin’de",
              d: "İşletme çalmaz; seçer ve programlar. Yeni eser, kapak, video ve lisans kaydı admin panelinden girilir.",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-xl bg-[#181818] p-5">
              <h3 className="mb-2 font-semibold">{c.t}</h3>
              <p className="text-sm text-[#b3b3b3]">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-2 text-2xl font-bold">İşletme planları</h2>
        <p className="mb-8 text-[#b3b3b3]">Fiyatlar TRY / ay. Yıllık ödemede yaklaşık %{annualDiscountPercent(PLANS[0])} indirim.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 ${p.highlighted ? "border-[#c8a45a] bg-[#16120a]" : "border-white/10 bg-[#121212]"}`}
            >
              <p className="text-sm text-[#c8a45a]">{p.name}</p>
              <p className="mt-1 text-3xl font-bold">{formatTry(p.monthlyPriceTry)}</p>
              <p className="text-sm text-[#b3b3b3]">/ ay · yıllık {formatTry(p.annualPriceTry)}</p>
              <p className="mt-3 text-sm">{p.tagline}</p>
              <ul className="mt-4 space-y-2 text-sm text-[#b3b3b3]">
                {p.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-12 text-sm text-[#6a6a6a]">
        Aura kataloğu orijinal eserlerden oluşur. Bu site bir ürün taslağı ve çalışan prototiptir; lisans metinleri hukuki tavsiye değildir.
      </footer>
    </div>
  );
}
