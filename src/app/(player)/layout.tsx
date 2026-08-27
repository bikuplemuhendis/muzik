import { redirect } from "next/navigation";
import { AppShell } from "@/components/player/AppShell";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const playlists = await prisma.playlist.findMany({
    where: { isPublic: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  return (
    <AppShell playlists={playlists} isAdmin={user.role === "ADMIN"} userName={user.name}>
      {children}
    </AppShell>
  );
}
