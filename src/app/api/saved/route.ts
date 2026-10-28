import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const savedItems = await prisma.savedItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ savedItems });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const targetType = String(body.targetType || "PROJECT");
  const targetId = String(body.targetId || "");
  const title = String(body.title || "Saved Item");

  if (!targetId) {
    return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
  }

  const existing = await prisma.savedItem.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: user.id,
        targetType,
        targetId,
      },
    },
  });

  if (existing) {
    await prisma.savedItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  const item = await prisma.savedItem.create({
    data: {
      userId: user.id,
      targetType,
      targetId,
      title,
      metaJson: JSON.stringify(body.meta || {}),
    },
  });

  return NextResponse.json({ saved: true, item }, { status: 201 });
}
