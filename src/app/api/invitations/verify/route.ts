import { NextRequest, NextResponse } from "next/server";
import { verifyInvitationToken } from "@/lib/account-admission";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const result = await verifyInvitationToken(token);
  return NextResponse.json(result);
}
