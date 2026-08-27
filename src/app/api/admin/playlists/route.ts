import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { playlistSchema } from "@/lib/validators";
import { requireApiUser } from "@/lib/api";

export async function POST(request: Request) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const parsed = playlistSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  const data = parsed.data;
  const playlist = await prisma.playlist.create({
    data: {
      id: `pl_${crypto.randomUUID()}`,
      title: data.title,
      description: data.description,
      coverUrl: data.coverUrl,
      venueFit: data.venueFit,
      isPublic: data.isPublic,
      kind: "CURATED",
      createdById: user.id,
      tracks: {
        create: data.trackIds.map((trackId, position) => ({ trackId, position })),
      },
    },
  });
  return NextResponse.json(playlist);
}
