import { NextResponse } from "next/server";
import { isSiteId } from "@/lib/hub";
import { siteIngestAllowed } from "@/lib/admin-auth";
import { ingestEvent } from "@/lib/stats";

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: Request) {
  const siteHeader = request.headers.get("x-ow-site")?.trim() ?? "";
  const secret = request.headers.get("x-ow-secret")?.trim() ?? "";

  if (!isSiteId(siteHeader) || !siteIngestAllowed(siteHeader, secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const type =
    body && typeof body === "object" && typeof (body as { type?: unknown }).type === "string"
      ? (body as { type: string }).type
      : "";

  if (!type) {
    return NextResponse.json({ error: "type_required" }, { status: 400 });
  }

  const meta =
    body && typeof body === "object" && (body as { meta?: unknown }).meta && typeof (body as { meta: unknown }).meta === "object"
      ? ((body as { meta: Record<string, string | number | boolean | null> }).meta)
      : undefined;

  const event = await ingestEvent({ site: siteHeader, type, meta });
  return NextResponse.json({ ok: true, event });
}
