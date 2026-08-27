import Link from "next/link";
import { Shield } from "lucide-react";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/admin", label: "Özet" },
  { href: "/admin/tracks", label: "Parçalar" },
  { href: "/admin/tracks/new", label: "Parça ekle" },
  { href: "/admin/playlists", label: "Listeler" },
  { href: "/admin/stations", label: "Radyolar" },
  { href: "/admin/feeds", label: "Video" },
  { href: "/admin/zones", label: "Bölgeler" },
  { href: "/admin/analytics", label: "Analitik" },
  { href: "/admin/venues", label: "İşletmeler" },
  { href: "/admin/taxonomy", label: "Kütüphane" },
  { href: "/admin/licenses", label: "Lisanslar" },
];

export function AdminShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <div className="min-h-dvh bg-[#0b0b0b] text-white">
      <div className="flex">
        <aside className="hidden min-h-dvh w-64 shrink-0 border-r border-white/10 bg-black p-5 md:block">
          <Link href="/admin" className="mb-8 flex items-center gap-2">
            <Logo />
          </Link>
          <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-[#c8a45a]">
            <Shield className="h-3.5 w-3.5" /> Katalog yönetimi
          </p>
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm text-[#b3b3b3] hover:bg-[#181818] hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/home" className="mt-8 block text-sm text-[#c8a45a] hover:underline">
            ← İşletme çalara geç
          </Link>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h1 className="text-lg font-semibold">Admin</h1>
            <div className="flex items-center gap-3 text-sm text-[#b3b3b3]">
              <span>{userName}</span>
              <form action="/api/auth/logout" method="post">
                <button type="submit">Çıkış</button>
              </form>
            </div>
          </header>
          <div className="px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
