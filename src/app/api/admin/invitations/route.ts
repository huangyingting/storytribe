import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  InvitationError,
  createInvitation,
  listInvitations,
} from "@/lib/account-admission";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get("status") || "ALL";
  const invitations = await listInvitations(status);
  return NextResponse.json({ invitations });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { invitation, rawToken } = await createInvitation({
      email: String(body.email || ""),
      role: body.role === "ADMIN" ? "ADMIN" : "USER",
      expiresInHours: Number(body.expiresInHours || 72),
      notes: body.notes ? String(body.notes) : undefined,
      invitedById: user.id,
      invitedByEmail: user.email,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "browser",
    });

    const origin = req.nextUrl.origin;
    const inviteUrl = `${origin}/invite/${rawToken}`;

    return NextResponse.json(
      {
        invitation,
        rawToken,
        inviteUrl,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof InvitationError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: "Failed to create invitation." },
      { status: 500 }
    );
  }
}
