import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId") || undefined;
  const workspaceId = req.nextUrl.searchParams.get("workspaceId") || undefined;
  const category = req.nextUrl.searchParams.get("category") || undefined;

  const elements = await prisma.projectElement.findMany({
    where: {
      ownerId: user.id,
      ...(projectId ? { OR: [{ projectId }, { projectId: null }] } : {}),
      ...(workspaceId ? { workspaceId } : {}),
      ...(category && category !== "ALL" ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ elements });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Element id required" }, { status: 400 });
  }
  await prisma.projectElement.deleteMany({
    where: { id, ownerId: user.id },
  });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Element name is required" }, { status: 400 });
  }

  const rawHandle =
    String(body.handle || name)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "element";

  const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
  const category = ["CHARACTER", "PROP", "BACKGROUND"].includes(body.category)
    ? body.category
    : "CHARACTER";

  const element = await prisma.projectElement.create({
    data: {
      ownerId: user.id,
      projectId: body.projectId ? String(body.projectId) : null,
      workspaceId: body.workspaceId ? String(body.workspaceId) : null,
      name,
      handle,
      category,
      description: String(body.description || ""),
      svgData:
        typeof body.svgData === "string"
          ? body.svgData
          : JSON.stringify(body.svgData || {}),
    },
  });

  return NextResponse.json({ element }, { status: 201 });
}
