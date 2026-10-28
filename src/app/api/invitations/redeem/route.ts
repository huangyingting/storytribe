import { NextRequest, NextResponse } from "next/server";
import { InvitationError, redeemInvitation } from "@/lib/account-admission";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await redeemInvitation({
      token: String(body.token || ""),
      email: String(body.email || ""),
      name: String(body.name || ""),
      password: String(body.password || ""),
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "browser",
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          username: user.username,
        },
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
      { error: "Failed to redeem invitation." },
      { status: 500 }
    );
  }
}
