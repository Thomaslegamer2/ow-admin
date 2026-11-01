import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { hubSnapshot, isSiteId, readHub, writeGlobalTheme, writeSite } from "@/lib/hub";
import { isSiteTheme } from "@/lib/themes";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(hubSnapshot(await readHub()));
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

  if (typeof record.site === "string") {
    if (!isSiteId(record.site)) {
      return NextResponse.json({ error: "unknown-site" }, { status: 400 });
    }
    if (record.theme === null) {
      const config = await writeSite(record.site, { theme: null });
      return NextResponse.json(hubSnapshot(config));
    }
    if (!isSiteTheme(record.theme)) {
      return NextResponse.json({ error: "theme-invalid" }, { status: 400 });
    }
    const config = await writeSite(record.site, { theme: record.theme });
    return NextResponse.json(hubSnapshot(config));
  }

  if (!isSiteTheme(record.theme)) {
    return NextResponse.json({ error: "theme-invalid" }, { status: 400 });
  }

  const config = await writeGlobalTheme(record.theme);
  return NextResponse.json(hubSnapshot(config));
}
