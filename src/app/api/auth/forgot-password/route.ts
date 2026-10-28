import { NextRequest, NextResponse } from "next/server";
import { normalizeEmail, writeAuditLog } from "@/lib/account-admission";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(String(body.email || ""));
  if (!email) {
    return NextResponse.json({ error: "Please enter your email address." }, { status: 400 });
  }

  await writeAuditLog({
    action: "PASSWORD_RESET_REQUESTED",
    actorEmail: email,
    targetType: "User",
    details: { requestedEmail: email },
    ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
  });

  return NextResponse.json({
    sent: true,
    message:
      "If an account exists for that email, password recovery instructions have been recorded.",
  });
}
