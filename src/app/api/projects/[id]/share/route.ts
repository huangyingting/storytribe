import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { normalizeEmail, writeAuditLog } from "@/lib/account-admission";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { guests: true },
  });

  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (body.guestEmail) {
    const guestEmail = normalizeEmail(String(body.guestEmail));
    const permission = ["VIEW", "COMMENT", "EDIT"].includes(body.permission)
      ? body.permission
      : "COMMENT";

    const guestUser = await prisma.user.findUnique({
      where: { email: guestEmail },
    });

    const guest = await prisma.projectGuest.upsert({
      where: {
        projectId_email: {
          projectId: id,
          email: guestEmail,
        },
      },
      create: {
        projectId: id,
        email: guestEmail,
        userId: guestUser?.id || null,
        permission,
      },
      update: {
        permission,
        userId: guestUser?.id || null,
      },
    });

    if (guestUser) {
      await prisma.notification.create({
        data: {
          userId: guestUser.id,
          type: "SHARE",
          title: "Project shared with you",
          message: `${user.name || user.email} invited you to collaborate on "${project.title}".`,
          linkUrl: `/app/editor/${project.id}`,
        },
      });
    }

    await writeAuditLog({
      action: "PROJECT_SHARED",
      actorId: user.id,
      actorEmail: user.email,
      targetType: "Project",
      targetId: project.id,
      details: { guestEmail, permission },
    });

    const allGuests = await prisma.projectGuest.findMany({
      where: { projectId: id },
    });

    return NextResponse.json({ guest, guests: allGuests });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : undefined,
      shareAccess:
        body.shareAccess !== undefined
          ? String(body.shareAccess)
          : body.isPublic === true
          ? "view"
          : undefined,
      isPublishedToCommunity:
        body.isPublishedToCommunity !== undefined
          ? Boolean(body.isPublishedToCommunity)
          : body.isPublic !== undefined
          ? Boolean(body.isPublic)
          : undefined,
    },
    include: { guests: true },
  });

  return NextResponse.json({
    project: updated,
    shareToken: updated.shareToken,
    isPublic: updated.isPublic,
    shareAccess: updated.shareAccess,
    isPublishedToCommunity: updated.isPublishedToCommunity,
    guests: updated.guests,
  });
}
