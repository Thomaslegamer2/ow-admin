import { NextResponse } from "next/server";
import { readHub } from "@/lib/hub";

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  const hub = await readHub();
  return NextResponse.json({
    theme: hub.theme,
    updatedAt: hub.updatedAt,
    discordUrl: hub.discordUrl,
  });
}
