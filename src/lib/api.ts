import { NextResponse } from "next/server";
import { requireUser, type Role } from "./auth";

export async function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireApiUser(role?: Role) {
  const user = await requireUser(role);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Yetkisiz" }, { status: 401 }) };
  }
  return { user, response: null };
}
