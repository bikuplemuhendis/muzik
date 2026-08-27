import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { verifyPassword } from "@/lib/auth";
import { sessionCookie, signSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-posta ve şifre gerekli." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Bilgiler eşleşmedi." }, { status: 401 });
  }
  const token = signSession({ userId: user.id, role: user.role as "ADMIN" | "VENUE" });
  const next = new URL(request.url).searchParams.get("next");
  const dest = next || (user.role === "ADMIN" ? "/admin" : "/home");
  const res = NextResponse.json({ ok: true, role: user.role, redirect: dest });
  res.headers.set("Set-Cookie", sessionCookie(token));
  return res;
}
