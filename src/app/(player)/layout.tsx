import { redirect } from "next/navigation";
import { AppShell } from "@/components/player/AppShell";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const [playlists, stations] = await Promise.all([
    prisma.playlist.findMany({
      where: { isPublic: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.radioStation.findMany({
      where: { isPublished: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);
  return (
    <AppShell playlists={playlists} stations={stations} isAdmin={user.role === "ADMIN"} userName={user.name}>
      {children}
    </AppShell>
  );
}
