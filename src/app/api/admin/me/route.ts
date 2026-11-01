import { NextResponse } from "next/server";
import { adminConfigured, isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  return NextResponse.json({
    configured: adminConfigured(),
    authenticated: await isAdminAuthenticated(),
  });
}
