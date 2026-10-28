import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { normalizeEmail } from "@/lib/account-admission";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace || workspace.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const email = normalizeEmail(String(body.email || ""));
  const role = ["ADMIN", "MEMBER", "VIEWER"].includes(body.role)
    ? body.role
    : "MEMBER";

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    return NextResponse.json(
      { error: "No registered StoryTribe user found with that email. Invite them via /admin/invitations first." },
      { status: 404 }
    );
  }

  const member = await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: id,
        userId: targetUser.id,
      },
    },
    create: {
      workspaceId: id,
      userId: targetUser.id,
      role,
    },
    update: {
      role,
    },
    include: {
      user: { select: { id: true, name: true, email: true, username: true } },
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}
