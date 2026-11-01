import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface AccountRecord {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  products: string[];
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountStore {
  users: AccountRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_PATH = path.join(DATA_DIR, "accounts.json");

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [algo, salt, hash] = encoded.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (next.length !== expected.length) return false;
  return timingSafeEqual(next, expected);
}

async function readStore(): Promise<AccountStore> {
  try {
    const raw = await readFile(USERS_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as AccountStore).users)) {
      return { users: [] };
    }
    return parsed as AccountStore;
  } catch {
    return { users: [] };
  }
}

async function writeStore(store: AccountStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export function publicAccount(user: AccountRecord) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    products: user.products,
    disabled: user.disabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function listAccounts() {
  const store = await readStore();
  return store.users
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicAccount);
}

export async function createAccount(input: {
  email: string;
  displayName: string;
  password: string;
}): Promise<{ ok: true; user: ReturnType<typeof publicAccount> } | { ok: false; error: string }> {
  const email = normalizeEmail(input.email);
  const displayName = input.displayName.trim().slice(0, 80);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || displayName.length < 2) {
    return { ok: false, error: "invalid" };
  }
  if (input.password.length < 10) {
    return { ok: false, error: "weak" };
  }
  const store = await readStore();
  if (store.users.some((user) => user.email === email)) {
    return { ok: false, error: "exists" };
  }
  const now = new Date().toISOString();
  const user: AccountRecord = {
    id: createHash("sha256").update(`${email}:${now}:${randomBytes(8).toString("hex")}`).digest("hex").slice(0, 24),
    email,
    displayName,
    passwordHash: hashPassword(input.password),
    products: [],
    disabled: false,
    createdAt: now,
    updatedAt: now,
  };
  store.users.push(user);
  await writeStore(store);
  return { ok: true, user: publicAccount(user) };
}

export async function setAccountDisabled(id: string, disabled: boolean) {
  const store = await readStore();
  const user = store.users.find((item) => item.id === id);
  if (!user) return null;
  user.disabled = disabled;
  user.updatedAt = new Date().toISOString();
  await writeStore(store);
  return publicAccount(user);
}

export async function deleteAccount(id: string): Promise<boolean> {
  const store = await readStore();
  const next = store.users.filter((item) => item.id !== id);
  if (next.length === store.users.length) return false;
  await writeStore({ users: next });
  return true;
}

export async function accountCount(): Promise<number> {
  const store = await readStore();
  return store.users.length;
}
