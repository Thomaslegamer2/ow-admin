import { NextResponse } from "next/server";
import { isSiteId, readHub, resolveSite, SITE_IDS } from "@/lib/hub";

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isSiteId(id)) {
    return NextResponse.json({ error: "unknown-site", sites: SITE_IDS }, { status: 404 });
  }
  return NextResponse.json(resolveSite(await readHub(), id));
}
