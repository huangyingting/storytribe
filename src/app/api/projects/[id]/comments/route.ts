import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const comments = await prisma.comment.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  const body = await req.json();

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!user && !(project.isPublic && project.shareAccess === "comment")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = String(body.content || "").trim();
  if (!content) {
    return NextResponse.json({ error: "Comment content required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      projectId: id,
      stageId: body.stageId ? String(body.stageId) : null,
      authorId: user?.id || null,
      authorName: user?.name || String(body.authorName || "Reviewer"),
      content,
      x:
        typeof body.x === "number"
          ? body.x
          : typeof body.pinX === "number"
          ? body.pinX
          : null,
      y:
        typeof body.y === "number"
          ? body.y
          : typeof body.pinY === "number"
          ? body.pinY
          : null,
      parentId: body.parentId ? String(body.parentId) : null,
    },
  });

  if (project.ownerId && project.ownerId !== user?.id) {
    await prisma.notification.create({
      data: {
        userId: project.ownerId,
        type: "COMMENT",
        title: `New comment on "${project.title}"`,
        message: `${comment.authorName}: "${content.slice(0, 80)}"`,
        linkUrl: `/app/editor/${project.id}`,
      },
    });
  }

  return NextResponse.json({ comment }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await context.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const commentId = String(body.commentId || "");
  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      resolved: Boolean(body.resolved),
    },
  });

  return NextResponse.json({ comment: updated });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await context.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commentId = req.nextUrl.searchParams.get("commentId") || "";
  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ deleted: true });
}
