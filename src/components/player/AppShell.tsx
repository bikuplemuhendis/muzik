"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Building2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { PlayerBar } from "./PlayerBar";
import { NowPlaying } from "./NowPlaying";
import { PlayerProvider } from "./PlayerProvider";

export function AppShell({
  children,
  playlists,
  isAdmin,
  userName,
}: {
  children: React.ReactNode;
  playlists: { id: string; title: string }[];
  isAdmin: boolean;
  userName: string;
}) {
  const pathname = usePathname();
  const mobile = [
    { href: "/home", icon: Home, label: "Ana sayfa" },
    { href: "/search", icon: Search, label: "Ara" },
    { href: "/library", icon: Library, label: "Kitaplık" },
    { href: "/venue", icon: Building2, label: "İşletme" },
  ];
  return (
    <PlayerProvider>
      <div className="flex h-dvh flex-col bg-black">
        <div className="flex min-h-0 flex-1">
          <Sidebar playlists={playlists} isAdmin={isAdmin} />
          <main className="relative m-2 ml-0 min-w-0 flex-1 overflow-y-auto rounded-xl bg-[#121212] pb-8">
            <header className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-6 py-4">
              <div className="text-sm text-[#b3b3b3]">İşletme çaları</div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#282828] px-3 py-1 text-sm">{userName}</span>
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="text-sm text-[#b3b3b3] hover:text-white">
                    Çıkış
                  </button>
                </form>
              </div>
            </header>
            <div className="px-6">{children}</div>
          </main>
        </div>
        <PlayerBar />
        <nav className="flex border-t border-white/10 bg-black md:hidden">
          {mobile.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center py-2 text-[11px] ${active ? "text-white" : "text-[#b3b3b3]"}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <NowPlaying />
      </div>
    </PlayerProvider>
  );
}
