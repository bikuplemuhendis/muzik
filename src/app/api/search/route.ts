import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q") || "";
  const result = await searchCatalog(q);
  return NextResponse.json(result);
}
