import { NextResponse } from "next/server";
import { hubSnapshot, readHub } from "@/lib/hub";

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return NextResponse.json(hubSnapshot(await readHub()));
}
