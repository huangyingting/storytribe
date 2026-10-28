import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listAuditLogs } from "@/lib/account-admission";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const action = req.nextUrl.searchParams.get("action") || undefined;
  const limit = Number(req.nextUrl.searchParams.get("limit") || 150);
  const logs = await listAuditLogs({
    action: action === "ALL" ? undefined : action,
    limit,
  });

  return NextResponse.json({ logs });
}
