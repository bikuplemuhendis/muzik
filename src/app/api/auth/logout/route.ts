import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

function logoutResponse() {
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"), 303);
  res.headers.set("Set-Cookie", clearSessionCookie());
  return res;
}

export async function GET() {
  return logoutResponse();
}

export async function POST() {
  return logoutResponse();
}
