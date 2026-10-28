import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { InvitationError, rotateInvitation } from "@/lib/account-admission";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { invitation, rawToken } = await rotateInvitation({
      id,
      expiresInHours: Number(body.expiresInHours || 72),
      actorId: user.id,
      actorEmail: user.email,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "browser",
    });

    const inviteUrl = `${req.nextUrl.origin}/invite/${rawToken}`;

    return NextResponse.json({
      invitation,
      rawToken,
      inviteUrl,
    });
  } catch (err) {
    if (err instanceof InvitationError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: "Failed to rotate invitation." },
      { status: 500 }
    );
  }
}
