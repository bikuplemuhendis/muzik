import { NextResponse } from "next/server";
import { saveUpload } from "@/lib/media";
import { requireApiUser } from "@/lib/api";

export async function POST(request: Request) {
  const { user, response } = await requireApiUser("ADMIN");
  if (!user) return response;
  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") || "");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya yok." }, { status: 400 });
  }
  try {
    const saved = await saveUpload(file, kind === "audio" || kind === "image" || kind === "video" ? kind : undefined);
    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Yükleme hatası" }, { status: 400 });
  }
}
