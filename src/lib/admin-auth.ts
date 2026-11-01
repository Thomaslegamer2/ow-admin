import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ow_admin_session";
const TTL_MS = 8 * 60 * 60 * 1000;

function password(): string {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

function sessionSecret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
  if (explicit.length >= 32) return explicit;
  const pwd = password();
  if (pwd.length >= 12) {
    return createHmac("sha256", "ow-admin").update(pwd).digest("hex");
  }
  return "";
}

export function adminConfigured(): boolean {
  return password().length >= 12 && sessionSecret().length >= 32;
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = password();
  if (expected.length < 12 || candidate.length < 12) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createAdminSession(now = Date.now()): string {
  const payload = `a.${now}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(token: string | undefined, now = Date.now()): boolean {
  if (!token || !adminConfigured()) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "a") return false;
  const stamp = Number(parts[1]);
  const provided = parts[2] ?? "";
  if (!Number.isFinite(stamp) || now - stamp > TTL_MS || stamp > now + 60_000) return false;
  const payload = `a.${stamp}`;
  const expected = sign(payload);
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSession(jar.get(ADMIN_COOKIE)?.value);
}

export function siteIngestAllowed(site: string, secret: string): boolean {
  const key = `SITE_SECRET_${site.toUpperCase()}`;
  const expected = process.env[key]?.trim() ?? "";
  if (expected.length < 16 || secret.length < 16) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
