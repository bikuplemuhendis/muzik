import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { playlistSchema } from "@/lib/validators";
import { requireApiUser } from "@/lib/api";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const { id } = await ctx.params;
  const parsed = playlistSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  const data = parsed.data;
  await prisma.playlistTrack.deleteMany({ where: { playlistId: id } });
  const playlist = await prisma.playlist.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      coverUrl: data.coverUrl,
      venueFit: data.venueFit,
      isPublic: data.isPublic,
      tracks: {
        create: data.trackIds.map((trackId, position) => ({ trackId, position })),
      },
    },
  });
  return NextResponse.json(playlist);
}
