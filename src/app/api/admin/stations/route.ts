import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";
import { stationSchema } from "@/lib/validators";

export async function GET() {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const stations = await prisma.radioStation.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(stations);
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const parsed = stationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  const { termSlugs, ...rest } = parsed.data;
  const station = await prisma.radioStation.create({
    data: {
      id: `st_${crypto.randomUUID()}`,
      ...rest,
      termSlugsJson: JSON.stringify(termSlugs),
    },
  });
  return NextResponse.json(station);
}
