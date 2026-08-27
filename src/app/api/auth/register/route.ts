import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { sessionCookie, signSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formu eksiksiz doldurun." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Bu e-posta kayıtlı." }, { status: 409 });

  const venue = await prisma.venue.create({
    data: {
      id: `venue_${crypto.randomUUID()}`,
      name: parsed.data.venueName,
      venueType: parsed.data.venueType,
      city: parsed.data.city,
      planId: "plan_cafe",
      locationCount: 1,
      status: "trial",
    },
  });
  const user = await prisma.user.create({
    data: {
      id: `user_${crypto.randomUUID()}`,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      name: parsed.data.name,
      role: "VENUE",
      venueId: venue.id,
    },
  });
  const token = signSession({ userId: user.id, role: "VENUE" });
  const res = NextResponse.json({ ok: true, redirect: "/home" });
  res.headers.set("Set-Cookie", sessionCookie(token));
  return res;
}
