import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAssist } from "@/lib/ai";
import { assistSchema } from "@/lib/validators";
import { requireApiUser } from "@/lib/api";

export async function POST(request: Request) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const body = await request.json().catch(() => null);
  const parsed = assistSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const result = await runAssist(parsed.data);
  await prisma.aiAssistLog.create({
    data: {
      trackId: parsed.data.trackId,
      userId: user.id,
      mode: result.mode,
      input: JSON.stringify(parsed.data),
      output: JSON.stringify(result),
    },
  });
  return NextResponse.json(result);
}
