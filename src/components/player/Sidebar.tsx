"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Building2, Shield, ScrollText, FileBadge, Radio, Tv } from "lucide-react";
import { Logo } from "@/components/Logo";

const items = [
  { href: "/home", label: "Ana sayfa", icon: Home },
  { href: "/search", label: "Ara", icon: Search },
  { href: "/radio", label: "Radyo", icon: Radio },
  { href: "/feeds", label: "Video", icon: Tv },
  { href: "/library", label: "Kitaplığın", icon: Library },
  { href: "/browse", label: "Katalog", icon: ScrollText },
  { href: "/venue", label: "İşletmem", icon: Building2 },
  { href: "/certificate", label: "İcra belgesi", icon: FileBadge },
];

export function Sidebar({
  playlists,
  stations,
  isAdmin,
}: {
  playlists: { id: string; title: string }[];
  stations: { id: string; name: string }[];
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-[280px] shrink-0 flex-col gap-2 p-2">
      <div className="rounded-xl bg-[#121212] p-4">
        <Link href="/home" className="flex items-center gap-2">
          <Logo />
        </Link>
        <p className="mt-2 text-xs text-[#b3b3b3]">Telifsiz ticari ambiyans</p>
      </div>
      <nav className="rounded-xl bg-[#121212] p-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                active ? "bg-[#282828] text-white" : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        {isAdmin ? (
          <Link
            href="/admin"
            className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#c8a45a] hover:bg-[#282828]"
          >
            <Shield className="h-5 w-5" />
            Admin paneli
          </Link>
        ) : null}
      </nav>
      <div className="flex-1 overflow-y-auto rounded-xl bg-[#121212] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6a6a6a]">Radyolar</p>
        <div className="mb-4 flex flex-col gap-1">
          {stations.map((st) => (
            <Link
              key={st.id}
              href={`/radio/${st.id}`}
              className={`truncate rounded-md px-2 py-1.5 text-sm ${
                pathname === `/radio/${st.id}` ? "text-white" : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              {st.name}
            </Link>
          ))}
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6a6a6a]">Listeler</p>
        <div className="flex flex-col gap-1">
          {playlists.map((pl) => (
            <Link
              key={pl.id}
              href={`/playlist/${pl.id}`}
              className={`truncate rounded-md px-2 py-1.5 text-sm ${
                pathname === `/playlist/${pl.id}` ? "text-white" : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              {pl.title}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
