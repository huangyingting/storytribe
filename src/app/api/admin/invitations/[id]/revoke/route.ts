import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { InvitationError, revokeInvitation } from "@/lib/account-admission";

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
    const updated = await revokeInvitation({
      id,
      actorId: user.id,
      actorEmail: user.email,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "browser",
    });

    return NextResponse.json({ invitation: updated });
  } catch (err) {
    if (err instanceof InvitationError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: "Failed to revoke invitation." },
      { status: 500 }
    );
  }
}
