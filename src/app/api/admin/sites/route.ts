import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { hubSnapshot, isSiteId, readHub, writeDiscord, writeSite } from "@/lib/hub";

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

  if (typeof record.discordUrl === "string" && record.discordUrl.startsWith("http")) {
    const config = await writeDiscord(record.discordUrl.trim());
    return NextResponse.json(hubSnapshot(config));
  }

  if (!isSiteId(record.site)) {
    return NextResponse.json({ error: "unknown-site" }, { status: 400 });
  }

  const partial: {
    adsEnabled?: boolean;
    analyticsEnabled?: boolean;
    urlImportEnabled?: boolean;
    discordEnabled?: boolean;
    publicUrl?: string;
  } = {};

  if (typeof record.adsEnabled === "boolean") partial.adsEnabled = record.adsEnabled;
  if (typeof record.analyticsEnabled === "boolean") partial.analyticsEnabled = record.analyticsEnabled;
  if (typeof record.urlImportEnabled === "boolean") partial.urlImportEnabled = record.urlImportEnabled;
  if (typeof record.discordEnabled === "boolean") partial.discordEnabled = record.discordEnabled;
  if (typeof record.publicUrl === "string") partial.publicUrl = record.publicUrl.trim();

  const config = await writeSite(record.site, partial);
  return NextResponse.json(hubSnapshot(config));
}
