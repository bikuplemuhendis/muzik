import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { SESSION_COOKIE, verifySession, type Role } from "./session";

export type { Role };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { venue: { include: { plan: true } } },
  });
  if (!user) return null;
  return user;
}

export async function requireUser(role?: Role) {
  const user = await getSessionUser();
  if (!user) return null;
  if (role && user.role !== role) return null;
  return user;
}
