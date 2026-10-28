import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, username: true } },
        },
      },
      _count: {
        select: { projects: true, elements: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ workspaces });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
  }

  const baseSlug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "studio";
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      description: body.description ? String(body.description) : "",
      avatarColor: String(body.avatarColor || "#2563EB"),
      ownerId: user.id,
      defaultWidth: Number(body.defaultWidth || 1920),
      defaultHeight: Number(body.defaultHeight || 1080),
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json({ workspace }, { status: 201 });
}
