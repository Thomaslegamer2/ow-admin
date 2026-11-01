import { NextResponse } from "next/server";
import {
  createAccount,
  deleteAccount,
  listAccounts,
  setAccountDisabled,
} from "@/lib/accounts";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ users: await listAccounts() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const action = typeof record.action === "string" ? record.action : "create";

  if (action === "create") {
    const result = await createAccount({
      email: typeof record.email === "string" ? record.email : "",
      displayName: typeof record.displayName === "string" ? record.displayName : "",
      password: typeof record.password === "string" ? record.password : "",
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ user: result.user });
  }

  if (action === "disable" || action === "enable") {
    if (typeof record.id !== "string") {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const user = await setAccountDisabled(record.id, action === "disable");
    if (!user) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  }

  if (action === "delete") {
    if (typeof record.id !== "string") {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const ok = await deleteAccount(record.id);
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
